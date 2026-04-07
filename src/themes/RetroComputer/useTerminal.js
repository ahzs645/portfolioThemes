import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDateRange } from '../../utils/cvHelpers';

/* ─── virtual filesystem builder ─── */

function buildFileSystem(cv) {
  if (!cv) return { name: '/', children: [] };

  const home = { name: 'home', children: [] };
  const user = { name: 'user', children: [] };
  home.children.push(user);

  // about.md
  const aboutLines = [];
  if (cv.name) aboutLines.push(`# ${cv.name}`);
  if (cv.currentJobTitle) aboutLines.push(`## ${cv.currentJobTitle}`);
  if (cv.location) aboutLines.push(`Location: ${cv.location}`);
  if (cv.about) aboutLines.push('', cv.about);
  user.children.push({ name: 'about.md', data: aboutLines.join('\n') });

  // contact.md
  const contactLines = ['# Contact'];
  if (cv.email) contactLines.push(`Email: ${cv.email}`);
  if (cv.phone) contactLines.push(`Phone: ${cv.phone}`);
  if (cv.website) contactLines.push(`Web: ${cv.website}`);
  const sl = cv.socialLinks || {};
  if (sl.github) contactLines.push(`GitHub: ${sl.github}`);
  if (sl.linkedin) contactLines.push(`LinkedIn: ${sl.linkedin}`);
  if (sl.twitter) contactLines.push(`Twitter: ${sl.twitter}`);
  user.children.push({ name: 'contact.md', data: contactLines.join('\n') });

  // skills.md
  if (cv.skills?.length) {
    const skillLines = ['# Skills', ''];
    cv.skills.forEach((s) => {
      if (typeof s === 'string') {
        skillLines.push(`- ${s}`);
      } else if (s.category) {
        skillLines.push(`## ${s.category}`);
        (s.items || []).forEach((i) => skillLines.push(`- ${i}`));
        skillLines.push('');
      }
    });
    user.children.push({ name: 'skills.md', data: skillLines.join('\n') });
  }

  // experience/
  if (cv.experience?.length) {
    const expFolder = { name: 'experience', children: [] };
    cv.experience.forEach((exp, i) => {
      const lines = [];
      const title = exp.position || exp.title || 'Role';
      const org = exp.company || exp.organization || '';
      lines.push(`# ${title}`);
      if (org) lines.push(`## ${org}`);
      const dr = formatDateRange(exp.startDate, exp.endDate);
      if (dr) lines.push(dr);
      if (exp.summary) lines.push('', exp.summary);
      if (exp.highlights?.length) {
        lines.push('');
        exp.highlights.forEach((h) => lines.push(`- ${h}`));
      }
      const slug = (org || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      expFolder.children.push({ name: `${slug || i}.md`, data: lines.join('\n') });
    });
    user.children.push(expFolder);
  }

  // projects/
  if (cv.projects?.length) {
    const projFolder = { name: 'projects', children: [] };
    cv.projects.forEach((p, i) => {
      const lines = [];
      lines.push(`# ${p.name || p.title || 'Project'}`);
      if (p.description) lines.push('', p.description);
      if (p.technologies?.length) lines.push('', `Tech: ${p.technologies.join(', ')}`);
      if (p.url) lines.push('', `URL: ${p.url}`);
      if (p.highlights?.length) {
        lines.push('');
        p.highlights.forEach((h) => lines.push(`- ${h}`));
      }
      const slug = (p.name || p.title || `project-${i}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      projFolder.children.push({ name: `${slug}.md`, data: lines.join('\n') });
    });
    user.children.push(projFolder);
  }

  // education/
  if (cv.education?.length) {
    const eduFolder = { name: 'education', children: [] };
    cv.education.forEach((e, i) => {
      const lines = [];
      lines.push(`# ${e.degree || e.studyType || 'Degree'}`);
      if (e.institution) lines.push(`## ${e.institution}`);
      const dr = formatDateRange(e.startDate, e.endDate);
      if (dr) lines.push(dr);
      if (e.area) lines.push(`Field: ${e.area}`);
      if (e.description) lines.push('', e.description);
      const slug = (e.institution || `edu-${i}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      eduFolder.children.push({ name: `${slug}.md`, data: lines.join('\n') });
    });
    user.children.push(eduFolder);
  }

  return { name: '/', children: [{ name: 'bin', children: [] }, { name: 'dev', children: [] }, home] };
}

function resolvePath(root, pathArr) {
  let current = root;
  const trail = [root];
  for (const seg of pathArr) {
    if (!current.children) return null;
    const next = current.children.find((c) => c.name === seg);
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

function renderMdLines(md, output) {
  md.split('\n').forEach((line) => {
    if (line.startsWith('# ')) output.push({ type: 'h1', text: line.slice(2) });
    else if (line.startsWith('## ')) output.push({ type: 'h2', text: line.slice(3) });
    else if (line.startsWith('### ')) output.push({ type: 'h3', text: line.slice(4) });
    else if (line.startsWith('- ')) output.push({ type: 'li', text: `• ${line.slice(2)}` });
    else output.push({ type: 'p', text: line });
  });
}

/* ─── terminal hook ─── */

export function useTerminal(cv) {
  const fs = useMemo(() => buildFileSystem(cv), [cv]);
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

  // Boot sequence
  useEffect(() => {
    if (!cv) return;

    const introLines = [];
    const name = cv.name || 'Visitor';
    const firstName = name.split(' ')[0] || name;
    const introRoles = [];

    if (cv.currentJobTitle) introRoles.push(cv.currentJobTitle);
    if (cv.location) introRoles.push(cv.location);
    if (introRoles.length === 0) introRoles.push('Portfolio System');

    introLines.push({ type: 'h2', text: 'Hi there,' });
    introLines.push({ type: 'h1', text: `I\'m ${firstName}` });
    introRoles.slice(0, 2).forEach((role) => introLines.push({ type: 'h2', text: `• ${role}` }));
    introLines.push({ type: 'text', text: '' });
    introLines.push({ type: 'h3', text: 'Welcome to RETRO-SHELL 1.0 LTS' });
    introLines.push({ type: 'h3', text: '->-> Scroll or type "help" to get started' });
    introLines.push({ type: 'text', text: '' });

    setLines(introLines);
    setBooted(true);
  }, [cv]);

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
      const args = parts.slice(1).filter((a) => !a.startsWith('-'));
      const opts = parts.slice(1).filter((a) => a.startsWith('-'));

      switch (cmd) {
        case 'help': {
          output.push({ type: 'h1', text: 'Help' });
          output.push({ type: 'text', text: 'RETRO-SHELL is like BASH, except more limited.' });
          output.push({ type: 'text', text: '' });
          output.push({ type: 'text', text: '  ls          List directory contents' });
          output.push({ type: 'text', text: '  cd <dir>    Change directory' });
          output.push({ type: 'text', text: '  show <file> Render .md files' });
          output.push({ type: 'text', text: '  show -all   View full portfolio' });
          output.push({ type: 'text', text: '  pwd         Print working directory' });
          output.push({ type: 'text', text: '  echo <text> Display text' });
          output.push({ type: 'text', text: '  clear       Clear screen' });
          output.push({ type: 'text', text: '  hello       Friendly greeting' });
          output.push({ type: 'text', text: '' });
          output.push({ type: 'text', text: 'Tip: try typing "show -all"' });
          break;
        }
        case 'ls': {
          const target = args[0] ? resolveRelative(fs, cwd, args[0]) : resolvePath(fs, cwd);
          if (!target || !target.node.children) {
            output.push({ type: 'error', text: 'ls: not a directory' });
          } else {
            target.node.children.forEach((c) => {
              output.push({ type: 'text', text: c.children ? `${c.name}/` : c.name });
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
              setCwd(newPath.trail.slice(1).map((n) => n.name));
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
                  renderMdLines(node.data, output);
                  output.push({ type: 'text', text: '' });
                }
                if (node.children) node.children.forEach((c) => showAll(c));
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
              renderMdLines(target.node.data, output);
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
    [fs, cwd, getPrompt, appendLines],
  );

  return { lines, cwd, execute, getPrompt, booted };
}
