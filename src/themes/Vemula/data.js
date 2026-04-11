export const PALETTE = [
  { from: '#1A1A1A', to: '#3B3B3B', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#00BDE9', to: '#007D95', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#FFC700', to: '#E6A100', label: '#202020', accent: '#1A1A1A' },
  { from: '#FF6B35', to: '#C03A0C', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#7B61FF', to: '#3D1FB3', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#10B981', to: '#065F46', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#EC4899', to: '#9D174D', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#0EA5E9', to: '#0C4A6E', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#F4F4F4', to: '#C0C0C0', label: '#4E4E4E', accent: '#00BDE9' },
  { from: '#202020', to: '#000000', label: '#FFC700', accent: '#FFC700' },
  { from: '#A855F7', to: '#581C87', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#F472B6', to: '#831843', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#22D3EE', to: '#0E7490', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#FB923C', to: '#9A3412', label: '#FFFFFF', accent: '#FFE8B0' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtDate(d) {
  if (!d) return '';
  if (d === 'present' || d === 'Present') return 'Present';
  const [y, m] = String(d).split('-');
  if (!y) return '';
  if (!m) return y;
  const monthIdx = parseInt(m, 10) - 1;
  return Number.isFinite(monthIdx) && MONTHS[monthIdx] ? `${MONTHS[monthIdx]} ${y}` : y;
}

export function fmtRange(item) {
  const start = fmtDate(item?.startDate);
  const end = fmtDate(item?.endDate);
  if (!start && !end) return '';
  if (start && end) return `${start} — ${end}`;
  return start || end;
}

export function shuffle(array, seed) {
  const a = [...array];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getCardWidth(viewportWidth) {
  if (viewportWidth < 768) return 150;
  if (viewportWidth < 1024) return 180;
  return 300;
}

export function computeOverlap(containerWidth, cardCount, cardWidth) {
  if (cardCount < 2) return 0;
  const minPeek = 0.25 * cardWidth;
  const squeeze = (cardCount * cardWidth - containerWidth) / (cardCount - 1);
  const cap = cardWidth - minPeek;
  return Math.max(0, Math.min(squeeze, cap));
}

export function computeStackTransforms(sections) {
  const n = sections.length;
  return sections.map((section, i) => {
    const scale = Math.max(0.34, 0.94 - (n - 1 - i) * 0.06);
    const norm = n > 1 ? 1 - i / (n - 1) : 0;
    const baseRot = 2 + norm * 34;
    const seed = hashString(section.key);
    const jitter = ((seed % 100) / 100 - 0.5) * 8;
    return {
      scale: parseFloat(scale.toFixed(3)),
      rotation: parseFloat((baseRot + jitter).toFixed(2)),
      zIndex: i,
    };
  });
}

export const SECTION_DEFS = [
  {
    key: 'about',
    label: 'ABOUT',
    title: 'About',
    build: (cv) => (cv.about ? [{ body: cv.about }] : null),
  },
  {
    key: 'experience',
    label: 'WORK',
    title: 'Experience',
    build: (cv) =>
      (cv.experience || [])
        .filter((e) => e?.company || e?.title)
        .map((e) => ({
          title: e.company,
          subtitle: e.title,
          dates: fmtRange(e),
          location: e.location,
          highlights: e.highlights || [],
          url: e.url,
        })),
  },
  {
    key: 'projects',
    label: 'PROJECTS',
    title: 'Projects',
    build: (cv) =>
      (cv.projects || [])
        .filter((p) => p?.name)
        .map((p) => ({
          title: p.name,
          dates: fmtRange(p),
          body: p.description,
          highlights: p.highlights || [],
          url: p.url,
        })),
  },
  {
    key: 'education',
    label: 'EDUCATION',
    title: 'Education',
    build: (cv) =>
      (cv.education || [])
        .filter((e) => e?.school || e?.degree)
        .map((e) => ({
          title: e.school,
          subtitle: e.degree,
          dates: fmtRange(e),
          highlights: e.highlights || [],
        })),
  },
  {
    key: 'skills',
    label: 'SKILLS',
    title: 'Skills',
    build: (cv) => ((cv.skills || []).length ? [{ tags: cv.skills }] : null),
  },
  {
    key: 'languages',
    label: 'LANGUAGES',
    title: 'Languages',
    build: (cv) => ((cv.languages || []).length ? [{ tags: cv.languages }] : null),
  },
  {
    key: 'awards',
    label: 'AWARDS',
    title: 'Awards',
    build: (cv) =>
      (cv.awards || [])
        .filter((a) => a?.title)
        .map((a) => ({
          title: a.title,
          subtitle: a.issuer,
          dates: fmtDate(a.date),
          body: a.description,
        })),
  },
  {
    key: 'publications',
    label: 'WRITING',
    title: 'Publications',
    build: (cv) =>
      (cv.publications || [])
        .filter((p) => p?.title || p?.name)
        .map((p) => ({
          title: p.title || p.name,
          subtitle: p.authors || p.publisher,
          dates: fmtDate(p.date),
          url: p.url,
        })),
  },
  {
    key: 'certifications',
    label: 'CERTS',
    title: 'Certifications',
    build: (cv) =>
      (cv.certifications || [])
        .filter((c) => c?.name || c?.title)
        .map((c) => ({
          title: c.name || c.title,
          subtitle: c.issuer,
          dates: fmtDate(c.date),
          url: c.url,
        })),
  },
  {
    key: 'volunteer',
    label: 'VOLUNTEER',
    title: 'Volunteer',
    build: (cv) =>
      (cv.volunteer || [])
        .filter((v) => v?.organization || v?.position)
        .map((v) => ({
          title: v.organization,
          subtitle: v.position,
          dates: fmtRange(v),
          highlights: v.highlights || [],
        })),
  },
  {
    key: 'contact',
    label: 'CONTACT',
    title: 'Get in touch',
    build: (cv) => {
      const links = [];
      if (cv.email) links.push({ label: 'EMAIL', value: cv.email, url: `mailto:${cv.email}` });
      if (cv.phone) links.push({ label: 'PHONE', value: cv.phone, url: `tel:${cv.phone}` });
      if (cv.website) links.push({ label: 'WEBSITE', value: cv.website, url: cv.website });
      if (cv.location) links.push({ label: 'LOCATION', value: cv.location });
      return links.length ? [{ links }] : null;
    },
  },
  {
    key: 'social',
    label: 'ELSEWHERE',
    title: 'Find me elsewhere',
    build: (cv) => {
      const social = cv.socialLinks || {};
      const order = ['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube', 'website'];
      const links = order
        .filter((k) => social[k])
        .map((k) => ({ label: k.toUpperCase(), value: social[k], url: social[k] }));
      return links.length ? [{ links }] : null;
    },
  },
];

export function buildSections(cv, paletteSeed) {
  if (!cv) return [];
  const shuffled = shuffle(PALETTE, paletteSeed);
  return SECTION_DEFS
    .map((def) => {
      const items = def.build(cv);
      if (!items || items.length === 0) return null;
      return { ...def, items };
    })
    .filter(Boolean)
    .map((section, i) => ({
      ...section,
      palette: shuffled[i % shuffled.length],
    }));
}
