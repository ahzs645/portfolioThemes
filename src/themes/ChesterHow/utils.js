import { formatMonthYear } from '../../utils/cvHelpers';
import { TAG_COLOR_KEYS, TAG_PALETTE } from './styles';

export function toDateString(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function fmtDate(value) {
  const s = toDateString(value);
  return s ? formatMonthYear(s) : '';
}

export function formatRange(start, end, isCurrent) {
  const s = fmtDate(start);
  const e = isCurrent ? 'Present' : fmtDate(end);
  if (s && e) return `${s} — ${e}`;
  return s || e || '';
}

export function pickColorKey(seed) {
  const str = String(seed || '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return TAG_COLOR_KEYS[hash % TAG_COLOR_KEYS.length];
}

export function paletteFor(seed) {
  return TAG_PALETTE[pickColorKey(seed)];
}

export function loadFraunces(href) {
  if (typeof document === 'undefined') return;
  const id = 'chester-how-fonts';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export function buildCards(cv) {
  if (!cv) {
    return { projects: [], experience: [], writing: [], extras: [] };
  }

  const projects = (cv.projects || []).map((project, index) => ({
    id: `project-${index}`,
    kind: 'project',
    large: index === 0 || index % 5 === 0,
    category: 'Projects',
    label: project.name,
    url: project.url,
    properties: {
      name: project.name,
      description:
        project.description || (project.highlights && project.highlights[0]) || '',
      date: fmtDate(project.endDate || project.startDate),
    },
    details: {
      heading: project.name,
      subheading: project.description || '',
      meta: [
        formatRange(project.startDate, project.endDate),
        project.location,
      ].filter(Boolean),
      tags: (project.technologies || []).slice(0, 8).map((tech, i) => ({
        label: tech,
        color: pickColorKey(`tech-${i}-${tech}`),
      })),
      highlights: Array.isArray(project.highlights) ? project.highlights : [],
      link: project.url
        ? { url: project.url, label: 'Visit project' }
        : null,
    },
  }));

  const experience = (cv.experience || []).map((entry, index) => {
    const tags = [
      entry.location && { label: entry.location, color: pickColorKey(entry.location) },
      {
        label: formatRange(entry.startDate, entry.endDate, entry.isCurrent),
        color: pickColorKey(entry.company || 'exp'),
      },
    ].filter((tag) => tag && tag.label);
    return {
      id: `experience-${index}`,
      kind: 'experience',
      large: index === 0,
      category: 'Experience',
      label: entry.company,
      url: entry.url,
      properties: {
        heading: entry.title,
        subheading: entry.company,
        body:
          (entry.highlights && entry.highlights[0]) || entry.location || '',
        tags,
      },
      details: {
        heading: entry.title,
        subheading: entry.company,
        meta: [formatRange(entry.startDate, entry.endDate, entry.isCurrent), entry.location].filter(
          Boolean,
        ),
        tags,
        highlights: Array.isArray(entry.highlights) ? entry.highlights : [],
        link: entry.url ? { url: entry.url, label: 'View company' } : null,
      },
    };
  });

  const education = (cv.education || []).map((entry, index) => {
    const tags = [
      {
        label: formatRange(entry.startDate, entry.endDate),
        color: pickColorKey(entry.school || 'edu'),
      },
    ].filter((tag) => tag.label);
    return {
      id: `education-${index}`,
      kind: 'education',
      large: false,
      category: 'Education',
      label: entry.school,
      properties: {
        heading: entry.degree || entry.school,
        subheading: entry.school,
        body: (entry.highlights && entry.highlights[0]) || '',
        tags,
      },
      details: {
        heading: entry.degree || entry.school,
        subheading: entry.school,
        meta: [formatRange(entry.startDate, entry.endDate), entry.location, entry.gpa].filter(
          Boolean,
        ),
        tags,
        highlights: Array.isArray(entry.highlights) ? entry.highlights : [],
        link: null,
      },
    };
  });

  // Writing: publications + presentations (both are "things I've put out into the world")
  const writing = [];
  (cv.publications || []).forEach((pub, index) => {
    const authors = Array.isArray(pub.authors) ? pub.authors : [];
    const authorLine =
      authors.length > 3
        ? `${authors.slice(0, 3).join(', ')} +${authors.length - 3} more`
        : authors.join(', ');
    const pubUrl = pub.doi ? `https://doi.org/${pub.doi}` : pub.url || undefined;
    writing.push({
      id: `publication-${index}`,
      kind: 'writing',
      large: index === 0,
      category: 'Publications',
      label: pub.journal || 'Paper',
      url: pubUrl,
      properties: {
        title: pub.title || pub.name,
        publishedOn: [pub.journal, fmtDate(pub.date) || toDateString(pub.date)]
          .filter(Boolean)
          .join(' · '),
        contentPreview: authorLine || pub.description || '',
      },
      details: {
        heading: pub.title || pub.name,
        subheading: pub.journal || '',
        meta: [fmtDate(pub.date) || toDateString(pub.date), pub.doi && `DOI: ${pub.doi}`].filter(
          Boolean,
        ),
        tags: authors.map((author, i) => ({
          label: author,
          color: pickColorKey(`author-${i}-${author}`),
        })),
        highlights: pub.description ? [pub.description] : [],
        link: pubUrl ? { url: pubUrl, label: 'Read paper' } : null,
      },
    });
  });
  (cv.presentations || []).forEach((pres, index) => {
    writing.push({
      id: `presentation-${index}`,
      kind: 'writing',
      large: writing.length === 0 && index === 0,
      category: 'Presentations',
      label: 'Talk',
      properties: {
        title: pres.title || pres.name,
        publishedOn: [pres.summary, fmtDate(pres.date) || toDateString(pres.date)]
          .filter(Boolean)
          .join(' · '),
        contentPreview: pres.location || pres.description || pres.venue || '',
      },
      details: {
        heading: pres.title || pres.name,
        subheading: pres.summary || pres.venue || '',
        meta: [fmtDate(pres.date) || toDateString(pres.date), pres.location].filter(Boolean),
        tags: [
          pres.location && { label: pres.location, color: pickColorKey(`pres-loc-${index}`) },
          pres.summary && { label: pres.summary, color: pickColorKey(`pres-sum-${index}`) },
        ].filter(Boolean),
        highlights: pres.description ? [pres.description] : [],
        link: null,
      },
    });
  });

  // Extras: awards, certifications/skills, professional development, volunteer
  const extras = [];

  (cv.awards || []).forEach((award, index) => {
    const title = award.name || award.title;
    const issuer = award.summary || award.issuer || '';
    const highlights = Array.isArray(award.highlights) ? award.highlights : [];
    const body = highlights[0] || award.description || '';
    const tags = award.date
      ? [
          {
            label: fmtDate(award.date) || toDateString(award.date),
            color: pickColorKey(`award-${index}`),
          },
        ]
      : [];
    extras.push({
      id: `award-${index}`,
      kind: 'hobby-text',
      large: index === 0,
      category: 'Awards',
      label: issuer || 'Award',
      properties: {
        heading: title,
        subheading: issuer,
        body,
        tags,
      },
      details: {
        heading: title,
        subheading: issuer,
        meta: [fmtDate(award.date) || toDateString(award.date)].filter(Boolean),
        tags,
        highlights,
        link: null,
      },
    });
  });

  (cv.certificationsSkills || []).forEach((entry, index) => {
    const details = String(entry.details || '')
      .split(/;|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    const [first, ...rest] = details;
    const allTags = details.map((item, tagIndex) => ({
      label: item,
      color: pickColorKey(`certskill-${index}-${tagIndex}`),
    }));
    extras.push({
      id: `certskill-${index}`,
      kind: 'hobby-text',
      large: details.length > 6,
      category: entry.label || 'Skills',
      label: entry.label || 'Skills',
      properties: {
        heading: first || entry.label,
        subheading: entry.label || '',
        body: rest.slice(0, 4).join(' · '),
        tags: allTags.slice(0, 6),
      },
      details: {
        heading: entry.label || 'Skills',
        subheading: `${details.length} items`,
        meta: [],
        tags: allTags,
        highlights: [],
        link: null,
      },
    });
  });

  (cv.professionalDevelopment || []).forEach((entry, index) => {
    const tags = [
      entry.date && {
        label: fmtDate(entry.date) || toDateString(entry.date),
        color: pickColorKey(`prodev-${index}`),
      },
      entry.location && {
        label: entry.location,
        color: pickColorKey(`prodev-${index}-loc`),
      },
    ].filter(Boolean);
    extras.push({
      id: `prodev-${index}`,
      kind: 'hobby-text',
      large: false,
      category: 'Professional Development',
      label: entry.summary || 'Course',
      properties: {
        heading: entry.name || entry.title,
        subheading: entry.summary || '',
        body: entry.location || '',
        tags,
      },
      details: {
        heading: entry.name || entry.title,
        subheading: entry.summary || '',
        meta: [fmtDate(entry.date) || toDateString(entry.date), entry.location].filter(Boolean),
        tags,
        highlights: entry.highlights || [],
        link: null,
      },
    });
  });

  (cv.volunteer || []).forEach((entry, index) => {
    const tags = [
      entry.location && {
        label: entry.location,
        color: pickColorKey(entry.location),
      },
      {
        label: formatRange(entry.startDate, entry.endDate, entry.isCurrent),
        color: pickColorKey(entry.company || 'volunteer'),
      },
    ].filter((tag) => tag && tag.label);
    extras.push({
      id: `volunteer-${index}`,
      kind: 'hobby-text',
      large: false,
      category: 'Volunteering',
      label: entry.company,
      url: entry.url,
      properties: {
        heading: entry.title,
        subheading: entry.company,
        body: (entry.highlights && entry.highlights[0]) || '',
        tags,
      },
      details: {
        heading: entry.title,
        subheading: entry.company,
        meta: [formatRange(entry.startDate, entry.endDate, entry.isCurrent), entry.location].filter(
          Boolean,
        ),
        tags,
        highlights: Array.isArray(entry.highlights) ? entry.highlights : [],
        link: entry.url ? { url: entry.url, label: 'Visit' } : null,
      },
    });
  });

  // Flat skills/languages if provided at top level
  (cv.languages || []).forEach((lang, index) => {
    const name = typeof lang === 'string' ? lang : lang.name;
    if (!name) return;
    extras.push({
      id: `lang-${index}`,
      kind: 'hobby-text',
      large: false,
      category: 'Languages',
      label: 'Language',
      properties: {
        heading: name,
        subheading: typeof lang === 'object' ? lang.proficiency || '' : '',
        body: '',
        tags: [{ label: 'Spoken', color: pickColorKey(`lang-${index}`) }],
      },
    });
  });

  return {
    projects,
    experience: experience.concat(education),
    writing,
    extras,
  };
}
