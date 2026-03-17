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

export function getCompanyExperience(experience = []) {
  const seen = new Set();
  const result = [];

  for (const entry of experience) {
    if (!entry || isArchived(entry)) continue;
    const company = entry.company || '';
    if (!company || seen.has(company)) continue;
    seen.add(company);

    let title = entry.position;
    let startDate = entry.start_date;
    let endDate = entry.end_date;

    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      title = entry.positions[0].title || entry.position;
      startDate = entry.positions[entry.positions.length - 1].start_date || startDate;
      endDate = entry.positions[0].end_date || endDate;
    }

    result.push({
      company,
      title,
      startDate,
      endDate,
      isCurrent: isPresent(endDate),
    });
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
