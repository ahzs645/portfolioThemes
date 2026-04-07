import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  buildBootMarkdown,
  formatEntryDate,
  getProjectHighlights,
  getProjectTechnologies,
  slugify,
  valueOr,
} from './contentUtils';

function addMarkdownFile(folder, name, lines) {
  folder.children.push({
    name,
    data: lines.filter((line) => line !== null && line !== undefined).join('\n'),
  });
}

function formatBulletLines(items = []) {
  return items.filter(Boolean).map((item) => `- ${item}`);
}

/* ─── virtual filesystem builder ─── */

function buildFileSystem(cv, bootMarkdown) {
  if (!cv) return { name: '/', children: [] };

  const home = { name: 'home', children: [] };
  const user = { name: 'user', children: [] };
  home.children.push(user);

  user.children.push({
    name: 'title',
    children: [{ name: 'title.md', data: bootMarkdown }],
  });

  const aboutLines = [];
  if (cv.name) aboutLines.push(`# ${cv.name}`);
  if (cv.currentJobTitle) aboutLines.push(`## ${cv.currentJobTitle}`);
  if (cv.location) aboutLines.push(`Location: ${cv.location}`);
  if (cv.about) aboutLines.push('', cv.about);
  addMarkdownFile(user, 'about.md', aboutLines);

  const contactLines = ['# Contact'];
  if (cv.email) contactLines.push(`Email: ${cv.email}`);
  if (cv.phone) contactLines.push(`Phone: ${cv.phone}`);
  if (cv.website) contactLines.push(`Web: ${cv.website}`);
  const socialLinks = cv.socialLinks || {};
  if (socialLinks.github) contactLines.push(`GitHub: ${socialLinks.github}`);
  if (socialLinks.linkedin) contactLines.push(`LinkedIn: ${socialLinks.linkedin}`);
  if (socialLinks.twitter) contactLines.push(`Twitter: ${socialLinks.twitter}`);
  addMarkdownFile(user, 'contact.md', contactLines);

  if (cv.skills?.length) {
    const skillLines = ['# Skills', ''];
    cv.skills.forEach((skill) => {
      if (typeof skill === 'string') {
        skillLines.push(`- ${skill}`);
        return;
      }

      if (skill?.category) skillLines.push(`## ${skill.category}`);
      (skill?.items || []).forEach((item) => skillLines.push(`- ${item}`));
      skillLines.push('');
    });

    addMarkdownFile(user, 'skills.md', skillLines);
  }

  if (cv.languages?.length) {
    const languageLines = ['# Languages', ''];
    cv.languages.forEach((language) => {
      if (typeof language === 'string') {
        languageLines.push(`- ${language}`);
        return;
      }

      const label = valueOr(language.language, language.name, language.label);
      const detail = valueOr(language.fluency, language.level, language.details);

      if (label && detail) languageLines.push(`- ${label} (${detail})`);
      else if (label) languageLines.push(`- ${label}`);
    });

    addMarkdownFile(user, 'languages.md', languageLines);
  }

  if (cv.certificationsSkills?.length) {
    const lines = ['# Credentials', ''];

    cv.certificationsSkills.forEach((entry) => {
      const label = valueOr(entry?.label, 'Details');
      const details = valueOr(entry?.details, entry?.summary, entry?.description);

      lines.push(`## ${label}`);
      if (details) lines.push('', details);
      lines.push('');
    });

    addMarkdownFile(user, 'certifications-skills.md', lines);
  }

  if (cv.experience?.length) {
    const folder = { name: 'experience', children: [] };

    cv.experience.forEach((entry, index) => {
      const title = valueOr(entry.position, entry.title, 'Role');
      const org = valueOr(entry.company, entry.organization);
      const lines = [`# ${title}`];
      const date = formatEntryDate(entry);

      if (org) lines.push(`## ${org}`);
      if (date) lines.push(date);
      if (entry.summary) lines.push('', entry.summary);
      if (entry.highlights?.length) lines.push('', ...formatBulletLines(entry.highlights));

      addMarkdownFile(folder, `${slugify(org || title, String(index))}.md`, lines);
    });

    user.children.push(folder);
  }

  if (cv.volunteer?.length) {
    const folder = { name: 'volunteer', children: [] };

    cv.volunteer.forEach((entry, index) => {
      const title = valueOr(entry.position, entry.title, 'Volunteer');
      const org = valueOr(entry.company, entry.organization);
      const lines = [`# ${title}`];
      const date = formatEntryDate(entry);

      if (org) lines.push(`## ${org}`);
      if (date) lines.push(date);
      if (entry.summary) lines.push('', entry.summary);
      if (entry.highlights?.length) lines.push('', ...formatBulletLines(entry.highlights));

      addMarkdownFile(folder, `${slugify(org || title, String(index))}.md`, lines);
    });

    user.children.push(folder);
  }

  if (cv.projects?.length) {
    const folder = { name: 'projects', children: [] };

    cv.projects.forEach((project, index) => {
      const name = valueOr(project.name, project.title, 'Project');
      const summary = valueOr(project.summary, project.description);
      const technologies = getProjectTechnologies(project);
      const highlights = getProjectHighlights(project);
      const date = formatEntryDate(project);
      const lines = [`# ${name}`];

      if (date) lines.push(date);
      if (summary) lines.push('', summary);
      if (technologies.length) lines.push('', `Tech: ${technologies.join(', ')}`);
      if (project.url) lines.push('', `URL: ${project.url}`);
      if (highlights.length) lines.push('', ...formatBulletLines(highlights));

      addMarkdownFile(folder, `${slugify(name, `project-${index}`)}.md`, lines);
    });

    user.children.push(folder);
  }

  if (cv.education?.length) {
    const folder = { name: 'education', children: [] };

    cv.education.forEach((entry, index) => {
      const degree = valueOr(entry.degree, entry.studyType, 'Degree');
      const institution = valueOr(entry.institution);
      const lines = [`# ${degree}`];
      const date = formatEntryDate(entry);

      if (institution) lines.push(`## ${institution}`);
      if (date) lines.push(date);
      if (entry.area) lines.push(`Field: ${entry.area}`);
      if (entry.location) lines.push(`Location: ${entry.location}`);
      if (entry.description) lines.push('', entry.description);
      if (entry.highlights?.length) lines.push('', ...formatBulletLines(entry.highlights));

      addMarkdownFile(folder, `${slugify(institution || degree, `education-${index}`)}.md`, lines);
    });

    user.children.push(folder);
  }

  if (cv.awards?.length) {
    const folder = { name: 'awards', children: [] };

    cv.awards.forEach((entry, index) => {
      const name = valueOr(entry.name, entry.title, 'Award');
      const lines = [`# ${name}`];
      const date = formatEntryDate(entry);

      if (entry.summary) lines.push(`## ${entry.summary}`);
      if (date) lines.push(date);
      if (entry.location) lines.push(`Location: ${entry.location}`);
      if (entry.description) lines.push('', entry.description);
      if (entry.highlights?.length) lines.push('', ...formatBulletLines(entry.highlights));

      addMarkdownFile(folder, `${slugify(name, `award-${index}`)}.md`, lines);
    });

    user.children.push(folder);
  }

  if (cv.publications?.length) {
    const folder = { name: 'publications', children: [] };

    cv.publications.forEach((entry, index) => {
      const title = valueOr(entry.title, entry.name, 'Publication');
      const lines = [`# ${title}`];
      const date = formatEntryDate(entry);

      if (entry.journal) lines.push(`## ${entry.journal}`);
      if (date) lines.push(date);
      if (entry.authors?.length) lines.push('', `Authors: ${entry.authors.join(', ')}`);
      if (entry.doi) lines.push(`DOI: ${entry.doi}`);
      if (entry.summary) lines.push('', entry.summary);
      if (entry.highlights?.length) lines.push('', ...formatBulletLines(entry.highlights));

      addMarkdownFile(folder, `${slugify(title, `publication-${index}`)}.md`, lines);
    });

    user.children.push(folder);
  }

  if (cv.presentations?.length) {
    const folder = { name: 'presentations', children: [] };

    cv.presentations.forEach((entry, index) => {
      const name = valueOr(entry.name, entry.title, 'Presentation');
      const lines = [`# ${name}`];
      const date = formatEntryDate(entry);

      if (entry.summary) lines.push(`## ${entry.summary}`);
      if (date) lines.push(date);
      if (entry.location) lines.push(`Location: ${entry.location}`);
      if (entry.description) lines.push('', entry.description);
      if (entry.highlights?.length) lines.push('', ...formatBulletLines(entry.highlights));

      addMarkdownFile(folder, `${slugify(name, `presentation-${index}`)}.md`, lines);
    });

    user.children.push(folder);
  }

  if (cv.professionalDevelopment?.length) {
    const folder = { name: 'professional-development', children: [] };

    cv.professionalDevelopment.forEach((entry, index) => {
      const name = valueOr(entry.name, entry.title, 'Professional Development');
      const lines = [`# ${name}`];
      const date = formatEntryDate(entry);

      if (entry.summary) lines.push(`## ${entry.summary}`);
      if (date) lines.push(date);
      if (entry.location) lines.push(`Location: ${entry.location}`);
      if (entry.description) lines.push('', entry.description);
      if (entry.highlights?.length) lines.push('', ...formatBulletLines(entry.highlights));

      addMarkdownFile(folder, `${slugify(name, `professional-development-${index}`)}.md`, lines);
    });

    user.children.push(folder);
  }

  if (cv.certifications?.length) {
    const folder = { name: 'certifications', children: [] };

    cv.certifications.forEach((entry, index) => {
      const name = valueOr(entry.name, entry.title, 'Certification');
      const lines = [`# ${name}`];
      const date = formatEntryDate(entry);

      if (entry.issuer) lines.push(`## ${entry.issuer}`);
      if (date) lines.push(date);
      if (entry.summary) lines.push('', entry.summary);
      if (entry.description) lines.push('', entry.description);
      if (entry.highlights?.length) lines.push('', ...formatBulletLines(entry.highlights));

      addMarkdownFile(folder, `${slugify(name, `certification-${index}`)}.md`, lines);
    });

    user.children.push(folder);
  }

  return { name: '/', children: [{ name: 'bin', children: [] }, { name: 'dev', children: [] }, home] };
}

function resolvePath(root, pathArr) {
  let current = root;
  const trail = [root];

  for (const seg of pathArr) {
    if (!current.children) return null;
    const next = current.children.find((child) => child.name === seg);
    if (!next) return null;
    trail.push(next);
    current = next;
  }

  return { node: current, trail };
}

function resolveRelative(root, cwd, relPath) {
  const segments = relPath.split('/').filter(Boolean);
  let currentPath = [...cwd];

  for (const seg of segments) {
    if (seg === '..') {
      if (currentPath.length > 0) currentPath.pop();
    } else if (seg === '~') {
      currentPath = ['home', 'user'];
    } else if (seg !== '.') {
      currentPath.push(seg);
    }
  }

  return resolvePath(root, currentPath);
}

function pathToString(segments) {
  if (segments.length === 0) return '/';
  return '/' + segments.join('/');
}

/* ─── terminal hook ─── */

export function useTerminal(cv) {
  const bootMarkdown = useMemo(() => (cv ? buildBootMarkdown(cv) : ''), [cv]);
  const fs = useMemo(() => buildFileSystem(cv, bootMarkdown), [cv, bootMarkdown]);

  const [lines, setLines] = useState([]);
  const [cwd, setCwd] = useState(['home', 'user']);
  const [booted, setBooted] = useState(false);

  const userName = cv?.name?.split(' ')[0]?.toLowerCase() || 'user';

  const getPrompt = useCallback(
    (path) => {
      const display = pathToString(path).replace(/^\/home\/user/, '~');
      return `${userName}:${display}$ `;
    },
    [userName],
  );

  useEffect(() => {
    if (!cv) return;

    setLines([{ type: 'md', text: bootMarkdown }, { type: 'text', text: '' }]);
    setBooted(true);
  }, [cv, bootMarkdown]);

  const appendLines = useCallback((newLines) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const execute = useCallback(
    (input) => {
      const trimmed = input.trim();
      const promptLine = { type: 'prompt', text: getPrompt(cwd) + trimmed };
      const output = [promptLine];

      if (!trimmed) {
        appendLines(output);
        return;
      }

      const parts = trimmed.replace(/\s+/g, ' ').split(' ');
      const cmd = parts[0];
      const args = parts.slice(1).filter((arg) => !arg.startsWith('-'));
      const opts = parts.slice(1).filter((arg) => arg.startsWith('-'));

      switch (cmd) {
        case 'help': {
          output.push({ type: 'h1', text: 'Help' });
          output.push({ type: 'text', text: 'RETRO-SHELL is like BASH, except more limited.' });
          output.push({ type: 'text', text: '' });
          output.push({ type: 'text', text: '  ls                List directory contents' });
          output.push({ type: 'text', text: '  cd <dir>          Change directory' });
          output.push({ type: 'text', text: '  show <file>       Render .md files' });
          output.push({ type: 'text', text: '  show -all         View full portfolio' });
          output.push({ type: 'text', text: '  pwd               Print working directory' });
          output.push({ type: 'text', text: '  echo <text>       Display text' });
          output.push({ type: 'text', text: '  clear             Clear screen' });
          output.push({ type: 'text', text: '  hello             Friendly greeting' });
          output.push({ type: 'text', text: '' });
          output.push({ type: 'text', text: 'Tip: try typing "show title/title.md" or "show -all"' });
          break;
        }
        case 'ls': {
          const target = args[0] ? resolveRelative(fs, cwd, args[0]) : resolvePath(fs, cwd);

          if (!target || !target.node.children) {
            output.push({ type: 'error', text: 'ls: not a directory' });
          } else {
            target.node.children.forEach((child) => {
              output.push({ type: 'text', text: child.children ? `${child.name}/` : child.name });
            });
          }
          break;
        }
        case 'cd': {
          if (!args[0] || args[0] === '~') {
            setCwd(['home', 'user']);
          } else if (args[0] === '..') {
            setCwd((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
          } else if (args[0] === '/') {
            setCwd([]);
          } else {
            const newPath = resolveRelative(fs, cwd, args[0]);

            if (!newPath) {
              output.push({ type: 'error', text: `cd: ${args[0]}: No such file or directory` });
            } else if (!newPath.node.children) {
              output.push({ type: 'error', text: `cd: ${args[0]}: Not a directory` });
            } else {
              setCwd(newPath.trail.slice(1).map((node) => node.name));
            }
          }
          break;
        }
        case 'pwd': {
          output.push({ type: 'text', text: pathToString(cwd) });
          break;
        }
        case 'show': {
          if (opts.includes('-all') || opts.includes('-a')) {
            const home = resolvePath(fs, ['home', 'user']);

            if (home?.node?.children) {
              const showAll = (node) => {
                if (node.data !== undefined) {
                  output.push({ type: 'md', text: node.data });
                  output.push({ type: 'text', text: '' });
                }

                if (node.children) node.children.forEach((child) => showAll(child));
              };

              showAll(home.node);
            }
          } else if (!args[0]) {
            output.push({ type: 'error', text: 'show: missing filename' });
          } else {
            const target = resolveRelative(fs, cwd, args[0]);

            if (!target) {
              output.push({ type: 'error', text: `show: ${args[0]}: No such file or directory` });
            } else if (target.node.data === undefined) {
              output.push({ type: 'error', text: `show: ${args[0]}: Is a directory` });
            } else {
              output.push({ type: 'md', text: target.node.data });
            }
          }
          break;
        }
        case 'echo': {
          output.push({ type: 'text', text: args.join(' ') });
          break;
        }
        case 'hello': {
          output.push({ type: 'text', text: 'Hello, world!' });
          break;
        }
        case 'clear': {
          setLines([]);
          return;
        }
        default: {
          output.push({ type: 'error', text: `${cmd}: command not found` });
        }
      }

      appendLines(output);
    },
    [appendLines, cwd, fs, getPrompt],
  );

  return { lines, cwd, execute, getPrompt, booted };
}
