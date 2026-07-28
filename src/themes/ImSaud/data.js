import {
  formatDate,
  formatDateRange,
  formatRange,
  getInitials,
  getSkillLabel,
  truncateText,
  uniqueByNormalizedValue,
} from '../../utils/cvHelpers';
import { getBioText } from '../../utils/bioText';

/**
 * CV.yaml -> PS2 view models.
 *
 * The source site hardcodes five "aboutData" panels, four memory-card saves and
 * eight FAQ cards. Everything here derives the same shapes from the resume so
 * the theme has no personal copy of its own.
 */

const MB = 1024;

// FNV-1a. Save "sizes" and timestamps have to look like real memory-card
// metadata but must never flicker between renders, so they are hashed from the
// entry title rather than randomised.
function hashString(value = '') {
  let hash = 2166136261;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pseudoSize(seed) {
  const raw = hashString(seed) % (128 * MB);
  if (raw < MB) return `${Math.max(24, raw)} KB`;
  const mb = raw / MB;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

// PS2 save browsers print a full timestamp. Anchor it to the entry's own date
// so re-renders (and reloads) always show the same clock reading.
function pseudoTimestamp(seed, dateValue) {
  const hash = hashString(seed);
  const parsedYear = Number(String(dateValue || '').slice(0, 4));
  const year = Number.isFinite(parsedYear) && parsedYear > 1970 ? parsedYear : 2000 + (hash % 26);
  const month = 1 + (hash % 12);
  const day = 1 + ((hash >>> 4) % 28);
  const hour = (hash >>> 8) % 24;
  const minute = (hash >>> 12) % 60;
  const second = (hash >>> 16) % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(day)}/${pad(month)}/${year} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

// The save-detail note block: a few bullets, each short enough that four of
// them still fit the panel without scrolling.
function noteBlock(items = [], limit = 4) {
  return items
    .filter(Boolean)
    .slice(0, limit)
    .map((line) => `• ${truncateText(line, 170)}`)
    .join('\n');
}

function skillLabels(cv) {
  const fromSkills = (cv?.skills || []).map(getSkillLabel).filter(Boolean);
  const fromCertsBlock = (cv?.certificationsSkills || [])
    .filter((entry) => /skill/i.test(entry?.label || ''))
    .flatMap((entry) => String(entry?.details || '').split(/[;,]/));

  return uniqueByNormalizedValue(
    [...fromSkills, ...fromCertsBlock].map((value) => String(value).trim()).filter(Boolean),
  );
}

function certificationLabels(cv) {
  const fromCerts = (cv?.certifications || []).map((entry) => entry?.name || entry?.title).filter(Boolean);
  const fromCertsBlock = (cv?.certificationsSkills || [])
    .filter((entry) => !/skill/i.test(entry?.label || ''))
    .flatMap((entry) => String(entry?.details || '').split(/[;,]/));

  return uniqueByNormalizedValue(
    [...fromCerts, ...fromCertsBlock].map((value) => String(value).trim()).filter(Boolean),
  );
}

function joinList(items = [], limit = 4, conjunction = 'and') {
  const list = items.slice(0, limit);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(', ')} ${conjunction} ${list[list.length - 1]}`;
}

function describeRole(role) {
  if (!role) return '';
  const where = role.company ? ` at ${role.company}` : '';
  return `${role.title || 'Role'}${where}`;
}

/* ---------- About: the rotating cube panels ---------- */

export function buildAboutPanels(cv) {
  if (!cv) return [];

  const panels = [];
  const current = (cv.experience || []).filter((role) => role.isCurrent);
  const past = (cv.experience || []).filter((role) => !role.isCurrent);
  const education = cv.education || [];
  const skills = skillLabels(cv);
  const certifications = certificationLabels(cv);

  const bio = String(cv.about || '').trim();
  const introFallback = [
    `Hi, I'm ${cv.name || 'there'}.`,
    current[0] ? `I'm ${describeRole(current[0])}.` : '',
    cv.location ? `Based in ${cv.location}.` : '',
  ].filter(Boolean).join(' ');

  panels.push({
    title: 'About Me',
    text: truncateText(bio || introFallback || getBioText(cv, { type: 'profile' }), 340),
  });

  if (current.length > 0) {
    panels.push({
      title: 'Currently',
      text: truncateText(
        `${joinList(current.map(describeRole), 3)}. ${current[0]?.highlights?.[0] || ''}`.trim(),
        340,
      ),
    });
  }

  if (past.length > 0) {
    panels.push({
      title: 'Previously',
      text: truncateText(
        `${joinList(uniqueByNormalizedValue(past.map(describeRole)), 4)}.`,
        340,
      ),
    });
  }

  if (education.length > 0) {
    panels.push({
      title: 'Education',
      text: truncateText(
        education
          .slice(0, 3)
          .map((entry) => {
            const degree = [entry.degree, entry.area].filter(Boolean).join(' ');
            const range = formatRange(entry.start_date, entry.end_date, { month: 'none' });
            return `${degree || 'Studies'}, ${entry.institution || ''}${range ? ` (${range})` : ''}`.trim();
          })
          .join('. '),
        340,
      ),
    });
  }

  if (skills.length > 0 || certifications.length > 0) {
    panels.push({
      title: 'Technical Skills',
      text: truncateText(
        [
          skills.length ? joinList(skills, 10, 'and') : '',
          certifications.length ? `Certified in ${joinList(certifications, 4, 'and')}.` : '',
        ].filter(Boolean).join('. '),
        340,
      ),
    });
  }

  const recognition = [
    ...(cv.awards || []).map((entry) => entry?.name || entry?.title),
    ...(cv.publications || []).map((entry) => entry?.title),
  ].filter(Boolean);

  if (recognition.length > 0) {
    panels.push({
      title: 'Recognition',
      text: truncateText(
        `${recognition.length} entr${recognition.length === 1 ? 'y' : 'ies'} on record, including ${joinList(recognition.map((value) => truncateText(value, 70)), 2)}.`,
        340,
      ),
    });
  }

  return panels;
}

/* ---------- Browser: memory-card "save data" ---------- */

function toSave(entry) {
  return {
    id: entry.id,
    title: entry.title,
    subtitle: entry.subtitle || '',
    desc: noteBlock(entry.notes),
    date: pseudoTimestamp(entry.id, entry.dateValue),
    stamp: entry.stamp || '',
    size: pseudoSize(entry.id),
    link: entry.link || null,
    initials: getInitials(entry.title, 2, '??'),
    tint: hashString(entry.id) % 360,
  };
}

export function buildProjectSaves(cv) {
  return (cv?.projects || []).map((project, index) => toSave({
    id: `project:${project?.name || index}`,
    title: project?.name || `Save ${index + 1}`,
    subtitle: truncateText(project?.summary || project?.highlights?.[0] || '', 130),
    notes: project?.highlights || [],
    dateValue: project?.date,
    stamp: formatDate(project?.date, { month: 'none', fallback: '' }),
    link: project?.url || null,
  }));
}

export function buildExperienceSaves(cv) {
  return (cv?.experience || []).map((role, index) => toSave({
    id: `role:${role?.company || ''}:${role?.title || index}`,
    title: role?.company || role?.title || `Save ${index + 1}`,
    subtitle: [role?.title, formatRange(role?.startDate, role?.endDate, { ongoingWhenNoEnd: true })]
      .filter(Boolean)
      .join('  ·  '),
    notes: role?.highlights || [],
    dateValue: role?.startDate,
    // The stamp is printed small on the save icon, so it stays year-only.
    stamp: formatDateRange(role?.startDate, role?.endDate),
    link: null,
  }));
}

/* ---------- FAQ: floating memory cards ---------- */

export function buildFaqCards(cv) {
  if (!cv) return [];

  const cards = [];
  const current = (cv.experience || []).filter((role) => role.isCurrent);
  const education = cv.education || [];
  const skills = skillLabels(cv);
  const projects = cv.projects || [];
  const publications = cv.publications || [];
  const presentations = cv.presentations || [];
  const awards = cv.awards || [];
  const volunteer = cv.volunteer || [];

  const push = (q, a) => {
    if (a) cards.push({ q, a: truncateText(a, 260) });
  };

  push(
    `Who is ${cv.name || 'this'}?`,
    cv.about || (current[0] ? `${describeRole(current[0])}${cv.location ? `, based in ${cv.location}` : ''}.` : null),
  );
  push('Where are you based?', cv.location ? `${cv.location}.` : null);
  push(
    'What are you working on right now?',
    current.length ? `${joinList(current.map(describeRole), 2)}.` : null,
  );
  push(
    'What did you study?',
    education.length
      ? education
        .slice(0, 2)
        .map((entry) => `${[entry.degree, entry.area].filter(Boolean).join(' ')} at ${entry.institution}`)
        .join('; ')
      : null,
  );
  push('What do you work with?', skills.length ? `${joinList(skills, 8)}.` : null);
  push(
    'What have you built?',
    projects.length
      ? `${projects.length} project${projects.length === 1 ? '' : 's'} on file, including ${joinList(projects.map((p) => p?.name).filter(Boolean), 3)}.`
      : null,
  );
  push(
    'Do you publish or present?',
    publications.length || presentations.length
      ? `${publications.length} publication${publications.length === 1 ? '' : 's'} and ${presentations.length} conference presentation${presentations.length === 1 ? '' : 's'}.`
      : null,
  );
  push(
    'Any awards?',
    awards.length ? `${awards.length} on record — most recently ${awards[0]?.name || awards[0]?.title}.` : null,
  );
  push(
    'Do you volunteer?',
    volunteer.length ? `${joinList(uniqueByNormalizedValue(volunteer.map((entry) => entry.company).filter(Boolean)), 3)}.` : null,
  );
  push(
    'How do I get in touch?',
    cv.email ? `${cv.email}${cv.website ? ` — or ${cv.website}` : ''}.` : cv.website || null,
  );

  return cards.slice(0, 8);
}

/* ---------- contact: social links ---------- */

export const SOCIAL_ICONS = {
  twitter: 'M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z',
  linkedin: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
  github: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  email: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
  youtube: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z',
  website: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.95a15.6 15.6 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.9 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14A7.9 7.9 0 0 1 4 12c0-.69.1-1.36.26-2h3.38a16.5 16.5 0 0 0 0 4H4.26zm.84 2h2.95c.32 1.25.78 2.45 1.38 3.56A8 8 0 0 1 5.1 16zm2.95-8H5.1a8 8 0 0 1 4.33-3.56A15.6 15.6 0 0 0 8.05 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82A13.7 13.7 0 0 1 12 19.96zM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4zm.23 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8 8 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38c.16.64.26 1.31.26 2 0 .69-.1 1.36-.26 2h-3.38z',
};

const SOCIAL_ORDER = ['twitter', 'linkedin', 'email', 'github', 'youtube', 'website'];

export function buildSocialList(cv) {
  // `socialLinks.website` only picks up an explicit "website" social entry, so
  // fall back to the resume's own website field.
  const links = { ...(cv?.socialLinks || {}) };
  if (!links.website && cv?.website) links.website = cv.website;

  return SOCIAL_ORDER.filter((key) => links[key]).map((key) => ({
    key,
    href: key === 'email' && !String(links.email).startsWith('mailto:')
      ? `mailto:${links.email}`
      : links[key],
    path: SOCIAL_ICONS[key],
    label: key,
  }));
}

/** "352.3 MB Taken" — the capacity line a PS2 save browser prints. */
export function totalTaken(saves = []) {
  const megabytes = saves.reduce((sum, save) => {
    const value = parseFloat(save.size);
    if (!Number.isFinite(value)) return sum;
    return sum + (save.size.endsWith('KB') ? value / 1024 : value);
  }, 0);
  return `${megabytes.toFixed(1)} MB Taken`;
}

/* ---------- "Little Secrets": notes about the recreation itself ---------- */

export const SECRETS = [
  {
    heading: 'The clock is a real clock',
    body: 'The seven orbs on the main menu are not on a canned animation loop. Every frame their positions are recomputed from your device clock: seconds become angles, three 3×3 rotation matrices are multiplied together, and the ring tilts and spins from the product. Open this theme on two devices in the same timezone and the orbs stay in sync.',
  },
  {
    heading: 'Twelve crystals, twelve hours',
    body: 'The hexagonal prisms behind the About panels are the PlayStation 2 system-configuration clock. One prism per hour, the current hour lights cyan, and it fills from the bottom as the minutes run out.',
  },
  {
    heading: 'No WebGL anywhere',
    body: 'Every cube, prism and memory card is plain DOM: divs with six faces, CSS 3D transforms and preserve-3d. The soft focus is a sub-pixel blur filter standing in for a composite video signal.',
  },
  {
    heading: 'It is a console, so it takes a controller',
    body: 'Arrow keys move, Enter selects and Backspace goes back, on every screen. Plug in a gamepad and the D-pad, cross and circle work too — the on-screen prompts swap to controller glyphs when one is detected.',
  },
  {
    heading: 'Every word is loaded from a resume',
    body: 'The panels, the save files, these questions and the sizes on each card are all derived from CV.yaml. Nothing on this screen is written into the theme.',
  },
];
