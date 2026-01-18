import React from 'react';

/**
 * Strip markdown formatting and return plain text
 * Removes: **bold**, *italic*, `code`, [link](url) -> link text
 */
export function stripMarkdown(text) {
  if (!text || typeof text !== 'string') return text;

  return text
    // Remove **bold** -> bold
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Remove *italic* -> italic
    .replace(/\*(.+?)\*/g, '$1')
    // Remove `code` -> code
    .replace(/`(.+?)`/g, '$1')
    // Remove [link](url) -> link
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove any remaining markdown-style formatting
    .replace(/[*_`]/g, '');
}

/**
 * Strip markdown from all string values in an object (recursively)
 */
export function normalizeMarkdownInObject(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') return stripMarkdown(obj);
  if (Array.isArray(obj)) return obj.map(normalizeMarkdownInObject);
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = normalizeMarkdownInObject(value);
    }
    return result;
  }
  return obj;
}

/**
 * Parse inline markdown and return React elements
 * Supports: **bold**, *italic*, `code`, [link](url)
 */
export function parseMarkdown(text, options = {}) {
  if (!text || typeof text !== 'string') return text;

  const { linkProps = {} } = options;

  // Split by markdown patterns while preserving delimiters
  const parts = [];
  let remaining = text;
  let key = 0;

  // Combined regex for all patterns
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const fullMatch = match[1];

    if (match[2]) {
      // **bold**
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4]) {
      // `code`
      parts.push(<code key={key++}>{match[4]}</code>);
    } else if (match[5] && match[6]) {
      // [link](url)
      parts.push(
        <a
          key={key++}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          {...linkProps}
        >
          {match[5]}
        </a>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // If no markdown was found, return original string
  if (parts.length === 0) return text;
  if (parts.length === 1 && typeof parts[0] === 'string') return parts[0];

  return <>{parts}</>;
}

/**
 * Component wrapper for parseMarkdown
 * Usage: <Markdown>**bold** and *italic*</Markdown>
 */
export function Markdown({ children, as: Component = 'span', linkProps, ...rest }) {
  if (typeof children !== 'string') return <Component {...rest}>{children}</Component>;

  return <Component {...rest}>{parseMarkdown(children, { linkProps })}</Component>;
}

/**
 * Parse markdown in an array of strings (like highlights)
 * Returns array of React elements
 */
export function parseMarkdownArray(items, options = {}) {
  if (!Array.isArray(items)) return items;
  return items.map((item, index) => ({
    key: index,
    content: parseMarkdown(item, options),
    raw: item,
  }));
}
