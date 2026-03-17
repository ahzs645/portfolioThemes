import { isPresent, isArchived } from '../../../utils/cvHelpers';

export function formatYear(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Current';
  const parts = String(dateStr).split('-');
  return parts[0] || dateStr;
}

export function formatRange(startDate, endDate) {
  const start = formatYear(startDate);
  const end = formatYear(endDate);
  if (start && end) return `${start} → ${end}`;
  return start || end || '';
}

/**
 * Build a timeline-style experience list.
 * Companies with nested positions produce one "company" row
 * followed by sub-position rows.
 */
export function getTimelineExperience(experience = []) {
  const result = [];

  for (const entry of experience) {
    if (!entry || isArchived(entry)) continue;
    const company = entry.company || '';

    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      // Company header = first (most recent) position
      const first = entry.positions[0];
      result.push({
        type: 'company',
        company,
        title: first.title || entry.position,
        startDate: entry.positions[entry.positions.length - 1].start_date || entry.start_date,
        endDate: first.end_date || entry.end_date,
        isCurrent: isPresent(first.end_date || entry.end_date),
        hasChildren: entry.positions.length > 1,
      });
      // Sub-positions (skip the first, already shown)
      for (let i = 1; i < entry.positions.length; i++) {
        const pos = entry.positions[i];
        result.push({
          type: 'sub',
          company,
          title: pos.title || entry.position,
          startDate: pos.start_date,
          endDate: pos.end_date,
          isCurrent: isPresent(pos.end_date),
          isLast: i === entry.positions.length - 1,
        });
      }
    } else {
      result.push({
        type: 'company',
        company,
        title: entry.position,
        startDate: entry.start_date,
        endDate: entry.end_date,
        isCurrent: isPresent(entry.end_date),
        hasChildren: false,
      });
    }
  }

  return result;
}

export function getSocialDisplayName(network) {
  const map = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    facebook: 'Facebook',
    instagram: 'Instagram',
  };
  return map[String(network).toLowerCase()] || network;
}

export function getSocialUsername(url, network) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/+|\/+$/g, '');
    const net = String(network).toLowerCase();
    if (net === 'linkedin') return `in/${path.split('/').pop()}`;
    return `@${path.split('/').pop()}`;
  } catch {
    return url;
  }
}

export function getSkillLabel(skill) {
  if (typeof skill === 'string') return skill;
  if (typeof skill?.name === 'string') return skill.name;
  if (typeof skill?.keyword === 'string') return skill.keyword;
  if (typeof skill?.label === 'string') return skill.label;
  return '';
}

export function trimText(text = '', max = 120) {
  const clean = String(text || '').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + '…';
}
