import { isPresent } from '../../../utils/cvHelpers';

export function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PT';
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
}

export function getFirstSentence(text = '') {
  const cleaned = String(text || '').trim();
  if (!cleaned) return '';
  const match = cleaned.match(/.*?[.!?](\s|$)/);
  return (match?.[0] || cleaned).trim();
}

export function getSkillLabel(skill) {
  if (typeof skill === 'string') return skill;
  if (typeof skill?.name === 'string') return skill.name;
  if (typeof skill?.keyword === 'string') return skill.keyword;
  if (typeof skill?.label === 'string') return skill.label;
  return '';
}

function uniqueCompanies(experience = []) {
  return Array.from(
    new Set(
      experience
        .map(item => String(item?.company || '').trim())
        .filter(Boolean)
    )
  );
}

function joinList(items = []) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function stripPrefix(text = '') {
  return String(text)
    .replace(/^technologies\s*-\s*/i, '')
    .replace(/^tools\s*-\s*/i, '')
    .trim();
}

export function trimText(text = '', maxLength = 132) {
  const clean = String(text || '').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}...`;
}

export function formatDisplayDate(dateValue) {
  if (!dateValue) return '';
  if (isPresent(dateValue)) return 'Present';

  const stringValue = String(dateValue);
  if (/^\d{4}$/.test(stringValue)) return stringValue;

  const [year, month] = stringValue.split('-');
  if (!month) return year || stringValue;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = months[Number(month) - 1];
  return monthLabel ? `${monthLabel} ${year}` : stringValue;
}

export function formatDisplayRange(startDate, endDate) {
  const start = formatDisplayDate(startDate);
  const end = formatDisplayDate(endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || '';
}

export function getDisplayUrl(url) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return String(url).replace(/^https?:\/\//, '');
  }
}

export function buildTopicLine(skills = []) {
  const labels = skills
    .map(getSkillLabel)
    .map(label => label.trim())
    .filter(Boolean)
    .slice(0, 3);
  return labels.length > 0 ? labels.join(' + ') : '';
}

export function buildHeroCopy(cv) {
  if (cv?.about) return cv.about;

  const companies = uniqueCompanies(cv?.experience || []).slice(0, 3);
  const companySentence = companies.length
    ? `Experience across ${joinList(companies)}.`
    : '';
  const roleSentence = cv?.currentJobTitle
    ? `Current focus: ${cv.currentJobTitle}.`
    : '';
  const locationSentence = cv?.location
    ? `Based in ${cv.location}.`
    : '';

  return [companySentence, roleSentence, locationSentence].filter(Boolean).join(' ');
}

export function buildProjectCards(cv) {
  if (Array.isArray(cv?.projects) && cv.projects.length > 0) {
    return cv.projects.slice(0, 4).map((project, index) => ({
      id: `project-${index}`,
      title: project.name || 'Selected Project',
      body: trimText(project.summary || stripPrefix(project.highlights?.[0] || 'Selected work from the portfolio data.')),
      meta: project.date ? String(project.date) : 'Featured',
      detail: stripPrefix(project.highlights?.[0] || 'Project'),
      href: project.url || null,
    }));
  }

  return (cv?.experience || []).slice(0, 4).map((item, index) => ({
    id: `experience-${index}`,
    title: item.company || 'Selected Work',
    body: trimText(item.highlights?.[0] || item.title || 'Experience entry'),
    meta: item.isCurrent ? 'Current' : 'Experience',
    detail: formatDisplayRange(item.startDate, item.endDate) || item.title || 'Role',
    href: null,
  }));
}

export function buildTrajectory(cv) {
  const experienceEntries = (cv?.experience || []).slice(0, 4).map((item, index) => ({
    id: `trajectory-exp-${index}`,
    eyebrow: formatDisplayRange(item.startDate, item.endDate) || 'Selected role',
    title: item.title || item.company || 'Experience',
    label: item.company || 'Company',
    summary: trimText(item.highlights?.[0] || 'Built and shipped meaningful work.', 150),
  }));

  if (experienceEntries.length >= 3) return experienceEntries;

  const educationEntries = (cv?.education || []).slice(0, 2).map((item, index) => ({
    id: `trajectory-edu-${index}`,
    eyebrow: formatDisplayRange(item.start_date, item.end_date) || 'Education',
    title: item.degree || 'Education',
    label: item.institution || item.area || 'Institution',
    summary: trimText(item.highlights?.[0] || item.area || 'Academic milestone', 150),
  }));

  return [...experienceEntries, ...educationEntries].slice(0, 4);
}

export function buildContactLinks(cv) {
  const website = cv?.website || cv?.socialLinks?.website;

  return [
    cv?.email ? { label: 'Email', href: `mailto:${cv.email}` } : null,
    website ? { label: 'Website', href: website } : null,
    cv?.socialLinks?.linkedin ? { label: 'LinkedIn', href: cv.socialLinks.linkedin } : null,
    cv?.socialLinks?.github ? { label: 'GitHub', href: cv.socialLinks.github } : null,
    cv?.socialLinks?.twitter ? { label: 'X', href: cv.socialLinks.twitter } : null,
  ].filter(Boolean);
}
