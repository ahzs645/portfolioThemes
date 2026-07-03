/**
 * Shared CV data helper utilities
 * Used by ConfigContext and themes for consistent data handling
 */

/**
 * Check if a date value represents "present" (current position)
 */
export function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

/**
 * Check if an entry is archived (has 'archived' tag)
 */
export function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

/**
 * Normalize highlights into a plain string array.
 * Supports the standard array shape plus flavor maps such as:
 * { flavors: { main: [...], swe: [...] } }
 */
export function normalizeHighlights(highlights, preferredFlavor = 'main') {
  if (!highlights) return [];
  if (Array.isArray(highlights)) return highlights.filter(Boolean);
  if (typeof highlights === 'string') return [highlights];

  if (typeof highlights === 'object') {
    const flavors = highlights.flavors && typeof highlights.flavors === 'object'
      ? highlights.flavors
      : highlights;
    const preferred = flavors?.[preferredFlavor];
    const fallback = Object.values(flavors || {}).find(Array.isArray);

    if (Array.isArray(preferred)) return preferred.filter(Boolean);
    if (Array.isArray(fallback)) return fallback.filter(Boolean);
  }

  return [];
}

/**
 * Flatten experience entries that have nested positions into flat list
 */
export function flattenExperience(experience = [], options = {}) {
  const { excludeArchived = true, limit = null, preferredFlavor = 'main' } = options;
  const items = [];

  for (const entry of experience) {
    if (!entry) continue;
    if (excludeArchived && isArchived(entry)) continue;

    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      for (const position of entry.positions) {
        items.push({
          company: entry.company,
          title: position?.title || entry.position,
          startDate: position?.start_date ?? entry.start_date,
          endDate: position?.end_date ?? entry.end_date ?? null,
          isCurrent: isPresent(position?.end_date ?? entry.end_date),
          highlights: normalizeHighlights(position?.highlights || entry.highlights, preferredFlavor),
        });
      }
    } else {
      items.push({
        company: entry.company,
        title: entry.position,
        startDate: entry.start_date,
        endDate: entry.end_date ?? null,
        isCurrent: isPresent(entry.end_date),
        highlights: normalizeHighlights(entry.highlights, preferredFlavor),
      });
    }
  }

  return limit ? items.slice(0, limit) : items;
}

/**
 * Find a social URL by network name(s)
 */
export function pickSocialUrl(socials = [], networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) =>
    lowered.includes(String(s.network || '').toLowerCase())
  );
  return found?.url || null;
}

/**
 * Extract all social links into a normalized object
 */
export function normalizeSocialLinks(socials = [], email = null) {
  return {
    github: pickSocialUrl(socials, ['github']),
    linkedin: pickSocialUrl(socials, ['linkedin']),
    twitter: pickSocialUrl(socials, ['twitter', 'x']),
    youtube: pickSocialUrl(socials, ['youtube']),
    website: pickSocialUrl(socials, ['website', 'personal']),
    email: email || null,
  };
}

export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Parse a CV date string ("2023", "2023-05", "2023-05-04", "present") into
 * parts without going through `new Date()` — Date parses "YYYY-MM" as UTC
 * midnight, which shifts to the previous month/year in negative-offset
 * timezones when formatted locally.
 *
 * Returns { present, year, month (1-12), day } or null when unparseable.
 */
export function parseDateParts(value) {
  if (value == null || value === '') return null;
  if (isPresent(value)) return { present: true, year: null, month: null, day: null };

  const match = String(value).trim().match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
  if (!match) return null;

  const month = match[2] ? parseInt(match[2], 10) : null;
  return {
    present: false,
    year: parseInt(match[1], 10),
    month: month >= 1 && month <= 12 ? month : null,
    day: match[3] ? parseInt(match[3], 10) : null,
  };
}

/**
 * Format a single CV date for display.
 *
 * Options:
 * - month: 'short' (Jan) | 'long' (January) | 'numeric' (01) | 'none'
 * - year: 'full' (2023) | '2-digit' (23)
 * - presentLabel: text for "present" values (default 'Present')
 * - fallback: returned for unparseable input (default: the raw input)
 */
export function formatDate(value, options = {}) {
  const { month = 'short', year = 'full', presentLabel = 'Present', fallback } = options;
  const parts = parseDateParts(value);
  if (!parts) return fallback !== undefined ? fallback : String(value ?? '');
  if (parts.present) return presentLabel;

  const yearText = year === '2-digit' ? String(parts.year).slice(-2) : String(parts.year);
  const monthText = parts.month == null || month === 'none'
    ? ''
    : month === 'long'
      ? MONTHS_LONG[parts.month - 1]
      : month === 'numeric'
        ? String(parts.month).padStart(2, '0')
        : MONTHS_SHORT[parts.month - 1];

  return [monthText, yearText].filter(Boolean).join(' ');
}

/**
 * Format a start/end CV date pair for display, e.g. "Jan 2021 – Present".
 *
 * Takes every formatDate option, plus:
 * - separator: between the two dates (default ' – ')
 * - ongoingWhenNoEnd: treat a missing end date as "present" (default false)
 * - collapseEqual: render "2023" instead of "2023 – 2023" (default true)
 */
export function formatRange(start, end, options = {}) {
  const {
    separator = ' – ',
    ongoingWhenNoEnd = false,
    collapseEqual = true,
    ...dateOptions
  } = options;

  const startText = formatDate(start, dateOptions);
  const endText = end == null || end === ''
    ? (ongoingWhenNoEnd ? (dateOptions.presentLabel ?? 'Present') : '')
    : formatDate(end, dateOptions);

  if (startText && endText) {
    if (collapseEqual && startText === endText) return startText;
    return `${startText}${separator}${endText}`;
  }
  return startText || endText || '';
}

/**
 * Format a date range for display (e.g., "'21–'23" or "Current")
 */
export function formatDateRange(start, end) {
  const getYear = (d) => {
    if (!d) return '';
    if (isPresent(d)) return 'Current';
    const parts = d.split('-');
    return parts[0]?.slice(-2) || d;
  };

  const startYear = getYear(start);
  const endYear = getYear(end);

  if (!startYear && !endYear) return '';
  if (endYear === 'Current') return 'Current';
  if (!endYear || startYear === endYear) return `'${startYear}`;
  return `'${startYear}–'${endYear}`;
}

/**
 * Format a date as "Mon 'YY" (e.g., "Jan '23")
 */
export function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Present';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = dateStr.split('-');
  const year = parts[0]?.slice(-2) || '';
  const month = parts[1] ? months[parseInt(parts[1], 10) - 1] : '';

  if (month && year) return `${month} '${year}`;
  if (year) return `'${year}`;
  return dateStr;
}

/**
 * Filter out archived items from an array
 */
export function filterActive(items = [], limit = null) {
  const filtered = items.filter((item) => item && !isArchived(item));
  return limit ? filtered.slice(0, limit) : filtered;
}

/**
 * Return unique items while preserving the first display value.
 */
export function uniqueByNormalizedValue(items = [], getValue = (item) => item) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const value = getValue(item);
    const key = String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

/**
 * Derive display initials from a name-like string.
 */
export function getInitials(name = '', maxLength = 2, fallback = '') {
  const initials = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, maxLength)
    .toUpperCase();

  return initials || fallback;
}

/**
 * Truncate text without splitting the final visible word when possible.
 */
export function truncateText(value = '', maxLength = 120) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, Math.max(0, maxLength - 1)).trimEnd();
  const lastSpace = clipped.lastIndexOf(' ');
  const safeClip = lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${safeClip}…`;
}

/**
 * Normalize skill entries that may be strings or objects.
 */
export function getSkillLabel(skill) {
  if (typeof skill === 'string') return skill;
  return skill?.name || skill?.keyword || skill?.label || skill?.title || skill?.skill || '';
}

/**
 * Get the current job title from experience
 */
export function getCurrentJobTitle(experience = []) {
  const flat = flattenExperience(experience);
  const current = flat.find((item) => item.isCurrent);
  return current?.title || flat[0]?.title || null;
}
