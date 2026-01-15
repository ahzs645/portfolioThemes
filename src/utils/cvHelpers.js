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
 * Flatten experience entries that have nested positions into flat list
 */
export function flattenExperience(experience = [], options = {}) {
  const { excludeArchived = true, limit = null } = options;
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
          highlights: position?.highlights || entry.highlights || [],
        });
      }
    } else {
      items.push({
        company: entry.company,
        title: entry.position,
        startDate: entry.start_date,
        endDate: entry.end_date ?? null,
        isCurrent: isPresent(entry.end_date),
        highlights: entry.highlights || [],
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
 * Get the current job title from experience
 */
export function getCurrentJobTitle(experience = []) {
  const flat = flattenExperience(experience);
  const current = flat.find((item) => item.isCurrent);
  return current?.title || flat[0]?.title || null;
}
