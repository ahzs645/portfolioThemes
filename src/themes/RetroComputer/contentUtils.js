import { formatDateRange, formatMonthYear } from '../../utils/cvHelpers';

const TECHNOLOGY_LINE_RE = /^Technologies\s*-\s*(.+)$/i;

export function valueOr(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }

  return null;
}

export function slugify(value, fallback = 'item') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || fallback;
}

export function formatEntryDate(entry) {
  const start = valueOr(entry?.startDate, entry?.start_date);
  const end = valueOr(entry?.endDate, entry?.end_date);

  if (start || end) return formatDateRange(start, end);

  const date = valueOr(entry?.date);
  if (date) return formatMonthYear(String(date));

  return '';
}

export function getProjectTechnologies(project) {
  const explicit = Array.isArray(project?.technologies) ? project.technologies : [];
  const derived = [];

  (project?.highlights || []).forEach((highlight) => {
    const match = String(highlight || '').match(TECHNOLOGY_LINE_RE);
    if (!match) return;

    match[1]
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => derived.push(item));
  });

  return [...new Set([...explicit, ...derived].map((item) => String(item).trim()).filter(Boolean))];
}

export function getProjectHighlights(project) {
  return (project?.highlights || []).filter(
    (highlight) => !TECHNOLOGY_LINE_RE.test(String(highlight || '')),
  );
}

function escapeMarkdownText(value) {
  return String(value || '').replace(/([*_`[\]\\])/g, '\\$1');
}

function escapeSvgText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function getInitials(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'CV';

  return words
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export function getBootImageAspect(cv) {
  const rawAspect = Number.parseFloat(String(valueOr(cv?.avatarAspect) ?? ''));
  if (Number.isFinite(rawAspect) && rawAspect > 0) return rawAspect;

  if (cv?.avatar) return 1;

  return 2;
}

export function getBootImageWidth(aspect) {
  if (aspect >= 1.5) return 1.33;
  if (aspect >= 1.1) return 1.05;
  return 0.72;
}

export function createGeneratedBootImageUrl(cv) {
  const name = valueOr(cv?.name, 'Visitor');
  const title = valueOr(cv?.currentJobTitle, 'Portfolio System');
  const location = valueOr(cv?.location, 'Open profile');
  const initials = getInitials(name);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 512">
      <defs>
        <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#180b03" />
          <stop offset="100%" stop-color="#050301" />
        </linearGradient>
        <pattern id="scan" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="2" fill="#f99021" fill-opacity="0.06" />
        </pattern>
      </defs>
      <rect width="1024" height="512" fill="url(#glow)" />
      <rect x="54" y="46" width="916" height="420" rx="28" fill="none" stroke="#f99021" stroke-opacity="0.16" stroke-width="4" />
      <g stroke="#f99021" stroke-opacity="0.08" stroke-width="2">
        <line x1="120" y1="118" x2="904" y2="118" />
        <line x1="120" y1="170" x2="904" y2="170" />
        <line x1="120" y1="222" x2="904" y2="222" />
        <line x1="120" y1="274" x2="904" y2="274" />
        <line x1="120" y1="326" x2="904" y2="326" />
        <line x1="120" y1="378" x2="904" y2="378" />
      </g>
      <circle cx="774" cy="230" r="170" fill="#f99021" fill-opacity="0.10" />
      <text x="774" y="286" fill="#f99021" fill-opacity="0.22" font-family="monospace" font-size="176" font-weight="700" text-anchor="middle">${escapeSvgText(
        initials,
      )}</text>
      <text x="126" y="390" fill="#f99021" fill-opacity="0.60" font-family="monospace" font-size="34" letter-spacing="5">${escapeSvgText(
        title.toUpperCase(),
      )}</text>
      <text x="126" y="432" fill="#f99021" fill-opacity="0.38" font-family="monospace" font-size="24" letter-spacing="3">${escapeSvgText(
        location.toUpperCase(),
      )}</text>
      <rect width="1024" height="512" fill="url(#scan)" />
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

export function getBootImageUrl(cv) {
  return valueOr(cv?.avatar) || createGeneratedBootImageUrl(cv);
}

export function buildBootMarkdown(cv) {
  const name = valueOr(cv?.name, 'Visitor');
  const firstName = name.split(/\s+/)[0] || name;
  const roles = [];

  if (cv?.currentJobTitle) roles.push(cv.currentJobTitle);
  if (cv?.location) roles.push(cv.location);
  if (roles.length === 0) roles.push('Portfolio System');

  return [
    '##   Hi there, ',
    '',
    `#  *I'm ${escapeMarkdownText(firstName)}*`,
    '',
    ...roles.slice(0, 2).map((role) => `##   • ${escapeMarkdownText(role)}`),
    '',
    '',
    '',
    '',
    '### Welcome to RETRO-SHELL 1.0 LTS',
    '### →→ Scroll or type "help" to get started',
  ].join('\n');
}
