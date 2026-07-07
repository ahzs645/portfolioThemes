import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import {
  formatDate,
  formatRange,
  getInitials,
  isPresent,
  pickSocialUrl,
  uniqueByNormalizedValue,
} from '../../utils/cvHelpers';
import { withBase } from '../../utils/assetPath';
import robotoFont from './assets/fonts/roboto-regular-webfont.woff2';

/**
 * TylerLorenzenTheme — a CV-driven remake of tylerlorenzen.tech, which is a
 * full Spotify desktop-app clone. Three fixed zones: a black LEFT SIDEBAR, a
 * scrollable MAIN (sticky top bar, gradient artist hero, RESUME/PORTFOLIO
 * tabs, an "About", a Spotify track-list "Table of Contents", detailed
 * section blocks, and a right-hand "Tools Used" discography), plus a pinned
 * BOTTOM PLAYER BAR. Spotify-dark palette, Spotify green (#1db954) accent.
 * All content comes from CV.yaml (Ahmad Jalil) via useCV().
 */

/* ---------- palette ---------- */

const darkTheme = {
  bg: '#181818',
  bgTop: '#282828',
  sidebar: '#282828',
  sidebarPanel: '#282828',
  elevated: '#181818',
  card: '#282828',
  cardHover: '#323232',
  tile: '#383838',
  tile2: '#4a4a4a',
  text: '#ffffff',
  muted: '#aaaaaa',
  faint: '#7f7f7f',
  border: '#181818',
  borderStrong: 'rgba(200, 200, 200, 0.34)',
  rowHover: '#282828',
  accent: '#1ed760',
  accentHover: '#21e968',
  accentText: '#000000',
  onAccentGlow: 'rgba(30, 215, 96, 0.28)',
  coral: '#fc615c',
  heroA: 'rgba(40, 40, 40, 0.92)',
  heroB: 'rgba(24, 24, 24, 0.68)',
};

const lightTheme = darkTheme;

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'TylerSpotifyRoboto';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('${robotoFont}') format('woff2');
  }

  body { background-color: ${(p) => p.theme.bg}; }
`;

const EMPTY_CV = {};
const EMPTY_ARRAY = [];

/* ---------- deterministic fake metrics ---------- */

// FNV-1a — stable across renders so play counts never flicker.
function hashString(str = '') {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fakeCount(seed, min, max) {
  const span = Math.max(1, max - min);
  return min + (hashString(seed) % span);
}

function formatInt(n) {
  return Number(n).toLocaleString('en-US');
}

function formatCompact(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

/* ---------- tool glyphs ---------- */

const TOOL_GLYPHS = [
  { match: /power\s*bi/i, glyph: '📊' },
  { match: /\bgis\b/i, glyph: '🗺️' },
  { match: /r\s*studio/i, glyph: '📈' },
  { match: /adobe/i, glyph: '🎨' },
  { match: /spss/i, glyph: '🧮' },
  { match: /excel/i, glyph: '📗' },
  { match: /prism/i, glyph: '🔬' },
  { match: /python/i, glyph: '🐍' },
  { match: /\bcad\b/i, glyph: '📐' },
  { match: /research/i, glyph: '🔎' },
  { match: /grant/i, glyph: '📝' },
  { match: /logistic/i, glyph: '📦' },
  { match: /brand/i, glyph: '🧭' },
  { match: /arabic|language|fluent/i, glyph: '🗣️' },
  { match: /decision/i, glyph: '⚡' },
  { match: /process|reengineer/i, glyph: '⚙️' },
  { match: /analyt/i, glyph: '💡' },
];

function glyphFor(label = '') {
  const found = TOOL_GLYPHS.find((t) => t.match.test(label));
  return found ? found.glyph : null;
}

function resolveAvatar(avatar) {
  if (!avatar) return null;
  return /^https?:\/\//i.test(avatar) ? avatar : withBase(avatar);
}

// cv.about is empty for this CV — synthesize a short, source-agnostic bio.
function synthesizeBio(cv) {
  const name = (cv.name || '').split(/\s+/)[0] || cv.name || 'They';
  const place = cv.location || null;
  const topEdu = (cv.education || [])[0] || null;
  const degree = topEdu?.degree || null;
  const focusHi = (topEdu?.highlights || []).find((h) => /focus/i.test(h)) || '';
  const field = focusHi.replace(/^.*focus\s*(on)?\s*/i, '').replace(/\.$/, '').trim()
    || 'environmental health';
  const roleLead = degree ? `a ${degree} researcher in ${field}` : `a researcher in ${field}`;
  return `${name} is ${roleLead}${place ? `, based in ${place}` : ''}. `
    + `The work moves between the lab, the field, and the data — turning environmental `
    + `samples into clear signals that inform public and environmental health. `
    + `This profile plays like a record: press ▶ and let the résumé run.`;
}

/* ---------- icons ---------- */

const PlayGlyph = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.79-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
  </svg>
);
const PauseGlyph = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);
const PrevGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 6a1 1 0 0 1 2 0v5l8.4-5.6A1 1 0 0 1 19 6.2v11.6a1 1 0 0 1-1.6.8L9 13v5a1 1 0 0 1-2 0z" />
  </svg>
);
const NextGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 6a1 1 0 0 0-2 0v5L6.6 5.4A1 1 0 0 0 5 6.2v11.6a1 1 0 0 0 1.6.8L15 13v5a1 1 0 0 0 2 0z" />
  </svg>
);
const ShuffleGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" />
  </svg>
);
const RepeatGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);
const VolumeGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 6a9 9 0 0 1 0 12" />
  </svg>
);
const QueueGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h13M3 12h13M3 18h8" /><path d="M17 14v6l5-3z" fill="currentColor" />
  </svg>
);
const SearchGlyph = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const MailGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
  </svg>
);
const UserGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);
const ChevLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
);
const ChevRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
);
const MenuGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const SunGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const MoonGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
const CheckGlyph = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);
const PlusGlyph = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
);
const DotsGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" />
  </svg>
);
const NoteGlyph = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18V5l10-2v11" /><circle cx="6" cy="18" r="3" fill="currentColor" stroke="none" /><circle cx="16" cy="15" r="3" fill="currentColor" stroke="none" />
  </svg>
);
const GridGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.6" />
  </svg>
);
const PulseGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>
);
const RadioGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="2" /><path d="M4.9 19.1a10 10 0 0 1 0-14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M19.1 4.9a10 10 0 0 1 0 14.2" />
  </svg>
);
const DocGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
  </svg>
);
const VerifiedGlyph = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 1.5 14.6 4l3.6-.2.9 3.5 3 2-1.5 3.3 1.5 3.3-3 2-.9 3.5-3.6-.2L12 22.5 9.4 20l-3.6.2-.9-3.5-3-2L3.4 11 1.9 7.7l3-2 .9-3.5L9.4 4z" />
    <path d="M8 12.2 10.8 15 16 9.4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SOCIAL_ICONS = {
  linkedin: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.4 8.65 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.32-2.02-3.32-2.02 0-2.33 1.58-2.33 3.21V21H9z" /></svg>
  ),
  github: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.95.68 1.92v2.85c0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" /></svg>
  ),
  facebook: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.9 3.78-3.9 1.1 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" /></svg>
  ),
  instagram: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
  ),
  twitter: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.3 8.34L23 22h-6.4l-5-6.55L5.8 22H2.7l7.8-8.92L2 2h6.6l4.52 5.98zm-1.1 18h1.7L7.3 3.9H5.5z" /></svg>
  ),
};

const SOCIAL_LABELS = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
};

function Equalizer({ playing }) {
  return (
    <EqWrap aria-hidden="true">
      <span data-b="1" data-play={playing ? 'on' : 'off'} />
      <span data-b="2" data-play={playing ? 'on' : 'off'} />
      <span data-b="3" data-play={playing ? 'on' : 'off'} />
      <span data-b="4" data-play={playing ? 'on' : 'off'} />
    </EqWrap>
  );
}

export function TylerLorenzenTheme({ darkMode = true, onDarkModeChange }) {
  const rawCv = useCV();
  const cv = rawCv ?? EMPTY_CV;
  const theme = darkMode ? darkTheme : lightTheme;
  const isDark = darkMode;

  const name = cv.name || 'Your Name';
  const initials = getInitials(name, 2, '♪');
  const avatarSrc = resolveAvatar(cv.avatar);
  const hasAvatar = Boolean(avatarSrc);
  const bio = useMemo(() => synthesizeBio(cv), [cv]);
  const email = cv.email || null;

  const experience = cv.experience ?? EMPTY_ARRAY;
  const education = cv.education ?? EMPTY_ARRAY;
  const awards = cv.awards ?? EMPTY_ARRAY;
  const projects = cv.projects ?? EMPTY_ARRAY;
  const publications = cv.publications ?? EMPTY_ARRAY;
  const profDev = cv.professionalDevelopment ?? EMPTY_ARRAY;

  const currentExp = useMemo(
    () => experience.find((e) => e.isCurrent) || experience[0] || null,
    [experience],
  );
  const role = currentExp?.title || cv.currentJobTitle || 'Researcher';
  const roleLine = currentExp ? `${currentExp.title} · ${currentExp.company}` : role;

  const socials = cv.social ?? EMPTY_ARRAY;
  const socialLinks = useMemo(() => {
    const order = ['linkedin', 'twitter', 'github', 'facebook', 'instagram'];
    return order
      .map((net) => ({ net, url: pickSocialUrl(socials, net === 'twitter' ? ['twitter', 'x'] : [net]) }))
      .filter((s) => s.url);
  }, [socials]);

  const connectLinks = useMemo(() => {
    const out = socialLinks.map((s) => ({
      key: s.net,
      label: SOCIAL_LABELS[s.net] || s.net,
      url: s.url,
      icon: SOCIAL_ICONS[s.net] || <span>{s.net[0]}</span>,
      external: true,
    }));
    if (cv.website) out.push({ key: 'resume', label: 'Resume', url: cv.website, icon: <DocGlyph />, external: true });
    if (email) out.push({ key: 'email', label: 'Email', url: `mailto:${email}`, icon: <MailGlyph />, external: false });
    return out;
  }, [socialLinks, cv.website, email]);

  const skillList = useMemo(() => {
    const entry = (cv.certificationsSkills || []).find((e) => /skill/i.test(e.label || ''));
    if (!entry?.details) return [];
    return entry.details.split(';').map((s) => s.trim()).filter(Boolean);
  }, [cv]);

  const certList = useMemo(() => {
    const entry = (cv.certificationsSkills || []).find((e) => /cert/i.test(e.label || ''));
    if (!entry?.details) return [];
    return entry.details.split(';').map((s) => s.trim()).filter(Boolean);
  }, [cv]);

  const tools = useMemo(
    () => skillList.map((label) => ({ label, glyph: glyphFor(label) })),
    [skillList],
  );

  const monthlyListeners = useMemo(() => {
    const items = experience.length + projects.length + awards.length
      + publications.length + education.length + skillList.length;
    return 640000 + (hashString(name) % 3200000) + items * 41111;
  }, [experience, projects, awards, publications, education, skillList, name]);

  const collaborators = useMemo(() => {
    const authors = (publications[0]?.authors || []).filter((a) => a && a !== name);
    const source = authors.length ? authors : experience.map((e) => e.company);
    return uniqueByNormalizedValue(source)
      .slice(0, 5)
      .map((n) => ({ name: n, initials: getInitials(n, 2, '♪') }));
  }, [publications, experience, name]);

  /* ---------- transport state ---------- */

  const defaultTrack = useMemo(() => {
    const idx = experience.findIndex((e) => e.isCurrent || isPresent(e.endDate));
    return idx >= 0 ? idx : 0;
  }, [experience]);

  const [trackIdx, setTrackIdx] = useState(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openIdx, setOpenIdx] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('resume');
  const [addedKeys, setAddedKeys] = useState(null);

  useEffect(() => { setTrackIdx(defaultTrack); }, [defaultTrack]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Fake transport: nudge the progress bar while "playing"; skipped when the
  // visitor prefers reduced motion.
  useEffect(() => {
    if (!isPlaying || reduceMotion) return undefined;
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.5));
    }, 120);
    return () => clearInterval(id);
  }, [isPlaying, reduceMotion]);

  const trackCount = experience.length;
  const current = experience[trackIdx] || null;
  const nowTitle = current?.title || role || name;
  const nowSubtitle = current?.company || cv.location || name;

  const selectTrack = useCallback((i) => {
    setTrackIdx(i);
    setProgress(0);
    setIsPlaying(true);
  }, []);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);
  const gotoDelta = useCallback((delta) => {
    if (!trackCount) return;
    setTrackIdx((i) => (i + delta + trackCount) % trackCount);
    setProgress(0);
    setIsPlaying(true);
  }, [trackCount]);
  const onRowClick = useCallback((i) => {
    setOpenIdx((prev) => (prev === i ? null : i));
    if (openIdx !== i) selectTrack(i);
  }, [openIdx, selectTrack]);

  /* ---------- scroll targets ---------- */

  const workRef = useRef(null);
  const eduRef = useRef(null);
  const awardsRef = useRef(null);
  const certsRef = useRef(null);
  const projectsRef = useRef(null);
  const pubsRef = useRef(null);
  const aboutRef = useRef(null);

  const scrollToRef = useCallback((ref) => {
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSidebarOpen(false);
  }, []);

  const tocRows = useMemo(() => {
    const rows = [
      { key: 'work', label: 'Work Experience', count: experience.length, ref: workRef },
      { key: 'education', label: 'Education', count: education.length, ref: eduRef },
      { key: 'awards', label: 'Awards', count: awards.length, ref: awardsRef },
      { key: 'certs', label: 'Certifications & Courses', count: certList.length + profDev.length, ref: certsRef },
      { key: 'projects', label: 'Projects', count: projects.length, ref: projectsRef },
      { key: 'pubs', label: 'Publications', count: publications.length, ref: pubsRef },
    ].filter((r) => r.count > 0);
    rows.push({ key: 'soon', label: 'More Coming Soon!', soon: true });
    return rows.map((r, i) => ({
      ...r,
      index: i + 1,
      plays: r.soon ? null : fakeCount(`toc:${r.label}`, 10000000, 150000000),
    }));
  }, [experience, education, awards, certList, profDev, projects, publications]);

  const added = addedKeys ?? new Set(tocRows.filter((r) => !r.soon).map((r) => r.key));
  const toggleAdded = useCallback((key) => {
    setAddedKeys((prev) => {
      const base = prev ?? new Set(tocRows.filter((r) => !r.soon).map((r) => r.key));
      const next = new Set(base);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, [tocRows]);

  const openPortfolio = useCallback(() => {
    setActiveTab('portfolio');
    scrollToRef(projectsRef);
  }, [scrollToRef]);
  const openResume = useCallback(() => {
    setActiveTab('resume');
    scrollToRef(aboutRef);
  }, [scrollToRef]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Shell>
          <Backdrop $open={sidebarOpen} onClick={() => setSidebarOpen(false)} aria-hidden={!sidebarOpen} />

          <Sidebar $open={sidebarOpen}>
            <SideScroll>
              <SideLogo>
                <SideLogoMark aria-hidden="true"><NoteGlyph size={18} /></SideLogoMark>
                <span>Portfolio</span>
              </SideLogo>

              <SideGroup>
                <SideGroupTitle>Main</SideGroupTitle>
                <SideItem type="button" onClick={() => scrollToRef(projectsRef)}>
                  <GridGlyph /><span>Portfolio</span>
                </SideItem>
                <SideItem type="button" onClick={() => scrollToRef(workRef)}>
                  <PulseGlyph /><span>Activity</span>
                </SideItem>
                <SideItem type="button" onClick={() => scrollToRef(eduRef)}>
                  <RadioGlyph /><span>Radio</span>
                </SideItem>
              </SideGroup>

              {connectLinks.length > 0 && (
                <SideGroup>
                  <SideGroupTitle>Connect</SideGroupTitle>
                  {connectLinks.map((c) => (
                    <SideLink
                      key={c.key}
                      href={c.url}
                      {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <SideLinkIcon>{c.icon}</SideLinkIcon>
                      <span>{c.label}</span>
                    </SideLink>
                  ))}
                </SideGroup>
              )}

              {skillList.length > 0 && (
                <SideGroup>
                  <SideGroupTitle>Skills</SideGroupTitle>
                  <SkillList>
                    {skillList.map((s, i) => (
                      <SkillTrack key={s}>
                        <SkillNo>{i + 1}</SkillNo>
                        <SkillNote aria-hidden="true"><NoteGlyph size={12} /></SkillNote>
                        <span className="label">{s}</span>
                      </SkillTrack>
                    ))}
                  </SkillList>
                </SideGroup>
              )}
            </SideScroll>

            <NewPlaylistBtn type="button" title="Decorative — like Spotify's new playlist">
              <PlusGlyph size={16} /> New Playlist
            </NewPlaylistBtn>
          </Sidebar>

          <MainCol>
            <TopBar>
              <TopLeft>
                <Hamburger type="button" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle menu">
                  <MenuGlyph />
                </Hamburger>
                <RoundNav type="button" aria-label="Back"><ChevLeft /></RoundNav>
                <RoundNav type="button" aria-label="Forward" className="fwd"><ChevRight /></RoundNav>
                <SearchPill>
                  <SearchGlyph size={17} />
                  <input type="text" placeholder="What do you want to listen to?" aria-label="Search" />
                </SearchPill>
              </TopLeft>
              <TopRight>
                <ToggleBtn
                  type="button"
                  onClick={() => onDarkModeChange?.(!isDark)}
                  aria-label="Toggle color mode"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <SunGlyph /> : <MoonGlyph />}
                </ToggleBtn>
                <IconBtn type="button" aria-label="Account" className="hide-sm"><UserGlyph /></IconBtn>
                {email && (
                  <IconBtn as="a" href={`mailto:${email}`} aria-label="Email" className="hide-sm"><MailGlyph /></IconBtn>
                )}
                <AccountChip>
                  <AvatarCircle>
                    {avatarSrc ? <img src={avatarSrc} alt={name} /> : <span>{initials}</span>}
                  </AvatarCircle>
                  <span className="who">{name}</span>
                </AccountChip>
              </TopRight>
            </TopBar>

            <MainScroll>
              {/* ---------- hero ---------- */}
              <HeroWrap>
                <Hero>
                  <HeroLeft>
                    <VerifiedRow>
                      <VerifiedBadge aria-hidden="true"><VerifiedGlyph size={20} /></VerifiedBadge>
                      Verified Profile
                    </VerifiedRow>
                    <Eyebrow>Resume</Eyebrow>
                    <HeroTitle>{name}</HeroTitle>
                    <HeroRole>{roleLine}</HeroRole>
                    {cv.location && <HeroPlace>◍ {cv.location}</HeroPlace>}
                  </HeroLeft>
                  <HeroRight>
                    <BigStatNum>{formatInt(monthlyListeners)}</BigStatNum>
                    <BigStatLabel>Monthly Listeners</BigStatLabel>
                    {hasAvatar && collaborators.length > 0 && (
                      <Collaborators>
                        <CollabStack>
                          {collaborators.map((c) => (
                            <CollabCircle key={c.name} title={c.name}>{c.initials}</CollabCircle>
                          ))}
                        </CollabStack>
                        <CollabLabel>with collaborators</CollabLabel>
                      </Collaborators>
                    )}
                  </HeroRight>
                </Hero>

                <HeroActions>
                  <PlayCircleBig type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? <PauseGlyph size={26} /> : <PlayGlyph size={26} />}
                  </PlayCircleBig>
                  <FollowPill
                    as={email ? 'a' : 'button'}
                    {...(email ? { href: `mailto:${email}` } : { type: 'button' })}
                  >
                    Follow
                  </FollowPill>
                  <MenuDots type="button" aria-label="More options"><DotsGlyph /></MenuDots>
                </HeroActions>
              </HeroWrap>

              {/* ---------- tabs ---------- */}
              <Tabs role="tablist">
                <Tab type="button" $active={activeTab === 'resume'} onClick={openResume}>Resume</Tab>
                <Tab type="button" $active={activeTab === 'portfolio'} onClick={openPortfolio}>Portfolio</Tab>
              </Tabs>

              <ContentGrid>
                <ContentMain>
                  {/* ---------- about ---------- */}
                  <AboutSection ref={aboutRef}>
                    {hasAvatar && (
                      <AboutThumb>
                        <img src={avatarSrc} alt={name} />
                      </AboutThumb>
                    )}
                    <AboutBody>
                      <SectionTitle as="h2">About {name}</SectionTitle>
                      <p>{bio}</p>
                    </AboutBody>
                  </AboutSection>

                  {/* ---------- table of contents ---------- */}
                  <TocSection>
                    <SectionTitle as="h2">Table of Contents</SectionTitle>
                    <TocTable role="table">
                      <TocHead>
                        <span>#</span>
                        <span aria-hidden="true" />
                        <span>Section</span>
                        <span className="learn" aria-hidden="true" />
                        <span className="plays">Plays</span>
                      </TocHead>
                      {tocRows.map((r) => (
                        <TocRow
                          key={r.key}
                          $soon={!!r.soon}
                          onClick={r.soon ? undefined : () => scrollToRef(r.ref)}
                          role="row"
                        >
                          <TocIndex>{r.index}</TocIndex>
                          {r.soon ? (
                            <TocDot aria-hidden="true">·</TocDot>
                          ) : (
                            <TocCheck
                              type="button"
                              $on={added.has(r.key)}
                              onClick={(e) => { e.stopPropagation(); toggleAdded(r.key); }}
                              aria-label={added.has(r.key) ? `Remove ${r.label}` : `Add ${r.label}`}
                              title={added.has(r.key) ? 'In your library' : 'Add to library'}
                            >
                              {added.has(r.key) ? <CheckGlyph /> : <PlusGlyph />}
                            </TocCheck>
                          )}
                          <TocName>
                            <span className="title">{r.label}</span>
                            {!r.soon && <span className="sub">{r.count} {r.count === 1 ? 'entry' : 'entries'}</span>}
                            {r.soon && <span className="sub">new tracks in production</span>}
                          </TocName>
                          {r.soon ? (
                            <TocSoonTag>Coming Soon</TocSoonTag>
                          ) : (
                            <LearnMore
                              type="button"
                              onClick={(e) => { e.stopPropagation(); scrollToRef(r.ref); }}
                            >
                              Learn More
                            </LearnMore>
                          )}
                          <TocPlays className="plays">
                            {r.soon ? '—' : formatInt(r.plays)}
                          </TocPlays>
                        </TocRow>
                      ))}
                    </TocTable>
                  </TocSection>

                  {/* ---------- work experience (playlist) ---------- */}
                  {experience.length > 0 && (
                    <DetailBlock ref={workRef}>
                      <DetailHead>
                        <SectionTitle as="h2">Work Experience</SectionTitle>
                        <DetailMeta>{experience.length} tracks</DetailMeta>
                      </DetailHead>
                      <Playlist>
                        <PlaylistHeadRow>
                          <span>#</span>
                          <span>Title</span>
                          <span className="date">Dates</span>
                          <span className="ctl" aria-hidden="true" />
                        </PlaylistHeadRow>
                        {experience.map((exp, i) => {
                          const active = i === trackIdx;
                          const open = openIdx === i;
                          return (
                            <TrackWrap key={`${exp.company}-${exp.title}-${i}`} $active={active}>
                              <TrackRow type="button" onClick={() => onRowClick(i)} $active={active} aria-expanded={open}>
                                <TrackIndex>
                                  {active && isPlaying
                                    ? <Equalizer playing />
                                    : <span className="num">{i + 1}</span>}
                                  <span className="hoverplay"><PlayGlyph size={13} /></span>
                                </TrackIndex>
                                <TrackMain>
                                  <span className="title">{exp.title}</span>
                                  <span className="company">{exp.company}</span>
                                </TrackMain>
                                <TrackDate>
                                  {formatRange(exp.startDate, exp.endDate, { month: 'short', year: 'full', presentLabel: 'Present' })}
                                </TrackDate>
                                <TrackChevron $open={open} aria-hidden="true">▾</TrackChevron>
                              </TrackRow>
                              {open && (exp.highlights || []).length > 0 && (
                                <TrackDetail>
                                  <ul>
                                    {exp.highlights.map((h, hi) => <li key={hi}>{h}</li>)}
                                  </ul>
                                </TrackDetail>
                              )}
                            </TrackWrap>
                          );
                        })}
                      </Playlist>
                    </DetailBlock>
                  )}

                  {/* ---------- education ---------- */}
                  {education.length > 0 && (
                    <DetailBlock ref={eduRef}>
                      <DetailHead>
                        <SectionTitle as="h2">Education</SectionTitle>
                        <DetailMeta>Radio</DetailMeta>
                      </DetailHead>
                      <CardGrid>
                        {education.map((edu, i) => (
                          <InfoCard key={`edu-${i}`}>
                            <CardKicker>
                              {formatRange(edu.start_date, edu.end_date, { month: 'none', year: 'full', presentLabel: 'Present' })}
                            </CardKicker>
                            <CardTitle>{edu.degree}{edu.area ? ` · ${edu.area}` : ''}</CardTitle>
                            <CardSub>{edu.institution}</CardSub>
                            {(edu.highlights || []).length > 0 && <CardNote>{edu.highlights[0]}</CardNote>}
                          </InfoCard>
                        ))}
                      </CardGrid>
                    </DetailBlock>
                  )}

                  {/* ---------- awards ---------- */}
                  {awards.length > 0 && (
                    <DetailBlock ref={awardsRef}>
                      <DetailHead>
                        <SectionTitle as="h2">Awards</SectionTitle>
                        <DetailMeta>{awards.length} honours</DetailMeta>
                      </DetailHead>
                      <CardGrid>
                        {awards.map((a, i) => (
                          <InfoCard key={`award-${i}`}>
                            <CardKicker>
                              <AwardDot aria-hidden="true">★</AwardDot>
                              {formatDate(a.date, { month: 'short', year: 'full' })}
                            </CardKicker>
                            <CardTitle>{a.name}</CardTitle>
                            {a.summary && <CardSub>{a.summary}</CardSub>}
                          </InfoCard>
                        ))}
                      </CardGrid>
                    </DetailBlock>
                  )}

                  {/* ---------- certifications & courses ---------- */}
                  {(certList.length > 0 || profDev.length > 0) && (
                    <DetailBlock ref={certsRef}>
                      <DetailHead>
                        <SectionTitle as="h2">Certifications &amp; Courses</SectionTitle>
                        <DetailMeta>{certList.length + profDev.length} items</DetailMeta>
                      </DetailHead>
                      {certList.length > 0 && (
                        <CertRow>
                          {certList.map((c) => (
                            <CertChip key={c}><CheckGlyph size={11} /> {c}</CertChip>
                          ))}
                        </CertRow>
                      )}
                      {profDev.length > 0 && (
                        <CardGrid style={{ marginTop: certList.length ? '0.9rem' : 0 }}>
                          {profDev.map((p, i) => (
                            <InfoCard key={`pd-${i}`}>
                              <CardKicker>{formatDate(p.date, { month: 'short', year: 'full' })}</CardKicker>
                              <CardTitle>{p.name}</CardTitle>
                              {p.summary && <CardSub>{p.summary}</CardSub>}
                              {p.location && <CardNote>{p.location}</CardNote>}
                            </InfoCard>
                          ))}
                        </CardGrid>
                      )}
                    </DetailBlock>
                  )}

                  {/* ---------- projects ---------- */}
                  {projects.length > 0 && (
                    <DetailBlock ref={projectsRef}>
                      <DetailHead>
                        <SectionTitle as="h2">Projects</SectionTitle>
                        <DetailMeta>Portfolio</DetailMeta>
                      </DetailHead>
                      <CardGrid>
                        {projects.map((p, i) => {
                          const tech = (p.highlights || []).find((h) => /^technolog/i.test(h));
                          const techList = tech
                            ? tech.replace(/^technolog(y|ies)\s*[-–:]\s*/i, '').split(',').map((t) => t.trim()).filter(Boolean)
                            : [];
                          const linkProps = p.url
                            ? { as: 'a', href: p.url, target: '_blank', rel: 'noopener noreferrer' }
                            : {};
                          return (
                            <ProjectCard key={`proj-${i}`} {...linkProps}>
                              <ProjectCover aria-hidden="true">
                                <span><NoteGlyph size={30} /></span>
                                {p.url && <ProjectPlay><PlayGlyph size={18} /></ProjectPlay>}
                              </ProjectCover>
                              <ProjectBody>
                                <CardKicker>{p.date || 'Project'}</CardKicker>
                                <CardTitle className="proj">{p.name}</CardTitle>
                                {p.summary && <CardSub>{p.summary}</CardSub>}
                                {techList.length > 0 && (
                                  <TechRow>
                                    {techList.map((t) => <TechChip key={t}>{t}</TechChip>)}
                                  </TechRow>
                                )}
                              </ProjectBody>
                            </ProjectCard>
                          );
                        })}
                      </CardGrid>
                    </DetailBlock>
                  )}

                  {/* ---------- publications ---------- */}
                  {publications.length > 0 && (
                    <DetailBlock ref={pubsRef}>
                      <DetailHead>
                        <SectionTitle as="h2">Publications</SectionTitle>
                        <DetailMeta>{publications.length} released</DetailMeta>
                      </DetailHead>
                      <PubList>
                        {publications.map((pub, i) => {
                          const href = pub.doi ? `https://doi.org/${pub.doi}` : pub.url;
                          const authors = Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors;
                          return (
                            <PubItem key={`pub-${i}`}>
                              <PubIndex>{i + 1}</PubIndex>
                              <PubBody>
                                <PubTitle
                                  {...(href ? { as: 'a', href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                                >
                                  {pub.title || pub.name}
                                </PubTitle>
                                <PubMeta>
                                  {[authors, pub.journal, formatDate(pub.date, { month: 'none', year: 'full' })]
                                    .filter(Boolean).join('  ·  ')}
                                </PubMeta>
                              </PubBody>
                            </PubItem>
                          );
                        })}
                      </PubList>
                    </DetailBlock>
                  )}
                </ContentMain>

                {/* ---------- tools used (discography) ---------- */}
                {tools.length > 0 && (
                  <ContentAside>
                    <SectionTitle as="h2">Tools Used</SectionTitle>
                    <AsideSub>{tools.length} in the rig</AsideSub>
                    <Discography>
                      {tools.map((t) => (
                        <DiscoRow key={t.label} title={t.label}>
                          <DiscoTile $glyph={!!t.glyph}>
                            {t.glyph || <NoteGlyph size={18} />}
                          </DiscoTile>
                          <DiscoMeta>
                            <span className="name">{t.label}</span>
                            <span className="sub">{t.glyph ? 'Software' : 'Skill'} · {formatCompact(fakeCount(`tool:${t.label}`, 40000, 4200000))} plays</span>
                          </DiscoMeta>
                          <DiscoPlay aria-hidden="true"><PlayGlyph size={14} /></DiscoPlay>
                        </DiscoRow>
                      ))}
                    </Discography>
                  </ContentAside>
                )}
              </ContentGrid>

              <FootNote>
                <span>{name}</span>
                <span>·</span>
                <span>Now spinning: <em>The {name.split(/\s+/)[0]} Experience — Résumé (Deluxe)</em></span>
                <span>·</span>
                <span>&copy; {new Date().getFullYear()}</span>
              </FootNote>
            </MainScroll>
          </MainCol>
        </Shell>

        {/* ---------- now-playing player bar ---------- */}
        <Player>
          <PlayerInner>
            <NowPlaying>
              {hasAvatar && (
                <NowArt data-play={isPlaying ? 'on' : 'off'}>
                  <img src={avatarSrc} alt="" />
                  {isPlaying && <NowArtEq aria-hidden="true"><Equalizer playing /></NowArtEq>}
                </NowArt>
              )}
              <NowMeta>
                <span className="t">{nowTitle}</span>
                <span className="s">{isPlaying ? 'Now playing' : 'Paused'} · {nowSubtitle}</span>
              </NowMeta>
            </NowPlaying>

            <PlayerCenter>
              <Transport>
                <TIcon type="button" aria-label="Shuffle" className="ghost"><ShuffleGlyph /></TIcon>
                <TIcon type="button" aria-label="Previous" onClick={() => gotoDelta(-1)}><PrevGlyph /></TIcon>
                <PlayCircle type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? <PauseGlyph size={18} /> : <PlayGlyph size={18} />}
                </PlayCircle>
                <TIcon type="button" aria-label="Next" onClick={() => gotoDelta(1)}><NextGlyph /></TIcon>
                <TIcon type="button" aria-label="Repeat" className="ghost"><RepeatGlyph /></TIcon>
              </Transport>
              <ProgressWrap>
                <span className="time">{isPlaying || progress > 0 ? '♪' : '0:00'}</span>
                <ProgressTrack>
                  <ProgressFill style={{ width: `${progress}%` }} />
                </ProgressTrack>
                <span className="time">{current?.isCurrent || isPresent(current?.endDate) ? '∞' : '—'}</span>
              </ProgressWrap>
            </PlayerCenter>

            <PlayerRight>
              <TIcon type="button" aria-label="Queue"><QueueGlyph /></TIcon>
              <TIcon type="button" aria-label="Volume"><VolumeGlyph /></TIcon>
              <VolumeBar aria-hidden="true"><span /></VolumeBar>
            </PlayerRight>
          </PlayerInner>
        </Player>
      </Page>
    </ThemeProvider>
  );
}

/* ---------- animations ---------- */

const eq = keyframes`
  0% { height: 25%; }
  50% { height: 100%; }
  100% { height: 35%; }
`;

/* ---------- shell / layout ---------- */

const Page = styled.div`
  --player-h: 72px;
  --sidebar-w: clamp(220px, 15vw, 280px);
  height: calc(100dvh - var(--app-top-offset, 0px));
  min-height: calc(100dvh - var(--app-top-offset, 0px));
  width: 100%;
  background: ${(p) => p.theme.bg};
  color: ${(p) => p.theme.text};
  font-family: 'TylerSpotifyRoboto', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  *, *::before, *::after { box-sizing: border-box; }

  @media (max-width: 1400px) { --sidebar-w: clamp(220px, 20vw, 300px); }
  @media (max-width: 640px) { --player-h: 64px; }
`;

const Shell = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  height: calc(100dvh - var(--app-top-offset, 0px) - var(--player-h));
  display: flex;
  align-items: flex-start;
  width: 100%;
  overflow: hidden;
`;

const Backdrop = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: ${(p) => (p.$open ? 'block' : 'none')};
    position: fixed;
    inset: 0 0 var(--player-h) 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 55;
  }
`;

const Sidebar = styled.aside`
  position: relative;
  top: 0;
  align-self: flex-start;
  flex: 0 0 var(--sidebar-w);
  width: var(--sidebar-w);
  height: calc(100dvh - var(--app-top-offset, 0px) - var(--player-h));
  background: ${(p) => p.theme.sidebar};
  border-right: 1px solid ${(p) => p.theme.border};
  display: flex;
  flex-direction: column;
  z-index: 20;

  @media (max-width: 900px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    flex-basis: 0;
    height: calc(100dvh - var(--app-top-offset, 0px) - var(--player-h));
    transform: translateX(${(p) => (p.$open ? '0' : '-110%')});
    transition: transform 0.24s ease;
    box-shadow: ${(p) => (p.$open ? '8px 0 40px rgba(0,0,0,0.5)' : 'none')};
    z-index: 60;
  }
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

const SideScroll = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 15px 0 5px;
  scrollbar-width: thin;
  scrollbar-color: ${(p) => p.theme.tile2} transparent;

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: ${(p) => p.theme.tile2}; border-radius: 8px; }
`;

const SideLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 15px 18px;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0;
`;

const SideLogoMark = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${(p) => p.theme.accent};
  color: ${(p) => p.theme.accentText};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SideGroup = styled.div`
  margin-bottom: 15px;
`;

const SideGroupTitle = styled.div`
  padding: 0 15px;
  margin-bottom: 8px;
  color: ${(p) => p.theme.faint};
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const sideRow = `
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  border: none;
  background: transparent;
  border-radius: 0;
  border-right: 3px solid transparent;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
`;

const SideItem = styled.button`
  ${sideRow}
  color: ${(p) => p.theme.muted};
  transition: color 0.15s ease, background 0.15s ease;
  svg { flex: 0 0 auto; }
  &:hover { color: ${(p) => p.theme.text}; background: transparent; border-right-color: ${(p) => p.theme.accent}; }
`;

const SideLink = styled.a`
  ${sideRow}
  color: ${(p) => p.theme.muted};
  transition: color 0.15s ease, background 0.15s ease;
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &:hover { color: ${(p) => p.theme.text}; background: transparent; border-right-color: ${(p) => p.theme.accent}; }
`;

const SideLinkIcon = styled.span`
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SkillList = styled.div`
  display: flex;
  flex-direction: column;
`;

const SkillTrack = styled.div`
  display: grid;
  grid-template-columns: 20px 20px 1fr;
  align-items: center;
  gap: 10px;
  padding: 7px 15px;
  border-radius: 0;
  border-right: 3px solid transparent;
  color: ${(p) => p.theme.muted};
  transition: color 0.15s ease, background 0.15s ease;

  .label {
    font-size: 14px;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &:hover { color: ${(p) => p.theme.text}; background: transparent; border-right-color: ${(p) => p.theme.accent}; }
`;

const SkillNo = styled.span`
  color: ${(p) => p.theme.faint};
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
`;

const SkillNote = styled.span`
  color: ${(p) => p.theme.accent};
  display: inline-flex;
`;

const NewPlaylistBtn = styled.button`
  flex: 0 0 auto;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 15px;
  border: none;
  border-top: 1px solid ${(p) => p.theme.border};
  border-bottom: 1px solid ${(p) => p.theme.border};
  border-radius: 0;
  background: ${(p) => p.theme.sidebar};
  color: ${(p) => p.theme.muted};
  font-weight: 400;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
  &:hover { color: ${(p) => p.theme.text}; background: ${(p) => p.theme.cardHover}; }
`;

const MainCol = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: calc(100dvh - var(--app-top-offset, 0px) - var(--player-h));
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

/* ---------- top bar ---------- */

const TopBar = styled.div`
  position: relative;
  flex: 0 0 auto;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 5px 15px;
  background: ${(p) => p.theme.bgTop};
  border-bottom: 1px solid ${(p) => p.theme.border};
  min-height: 48px;

  @media (max-width: 520px) { padding: 0.6rem 0.85rem; gap: 0.5rem; }
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1 1 auto;
`;

const Hamburger = styled.button`
  display: none;
  @media (max-width: 900px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: ${(p) => p.theme.text};
    border-radius: 50%;
    cursor: pointer;
    &:hover { background: ${(p) => p.theme.rowHover}; }
  }
`;

const RoundNav = styled.button`
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: transparent;
  color: ${(p) => p.theme.muted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  transition: opacity 0.15s ease, transform 0.15s ease;
  &:hover { opacity: 1; color: ${(p) => p.theme.text}; transform: none; }
  &.fwd { @media (max-width: 420px) { display: none; } }
`;

const SearchPill = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  max-width: 240px;
  flex: 1 1 200px;
  margin-left: 1%;
  padding: 4px 10px;
  border-radius: 15px;
  background: ${(p) => p.theme.text};
  border: 1px solid transparent;
  color: ${(p) => p.theme.bg};
  transition: border-color 0.15s ease;

  &:focus-within { border-color: ${(p) => p.theme.text}; }

  input {
    flex: 1 1 auto;
    min-width: 0;
    border: none;
    background: transparent;
    color: ${(p) => p.theme.bg};
    font-size: 14px;
    outline: none;
    &::placeholder { color: #666; }
  }
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: 0 0 min(300px, 38vw);
`;

const IconBtn = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: transparent;
  color: ${(p) => p.theme.muted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: background 0.15s ease, transform 0.15s ease;
  &:hover { color: ${(p) => p.theme.text}; background: transparent; transform: none; }
  &.hide-sm { @media (max-width: 560px) { display: none; } }
`;

const ToggleBtn = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: transparent;
  color: ${(p) => p.theme.muted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, transform 0.15s ease;
  &:hover { color: ${(p) => p.theme.text}; background: transparent; transform: none; }
`;

const AccountChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border-radius: 0;
  background: transparent;

  .who {
    font-size: 0.85rem;
    font-weight: 700;
    max-width: 130px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    @media (max-width: 720px) { display: none; }
  }
  @media (max-width: 560px) { background: transparent; padding: 0; }
`;

const AvatarCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  flex: 0 0 auto;
  background: ${(p) => p.theme.tile2};
  color: ${(p) => p.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.78rem;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

/* ---------- main scroll ---------- */

const MainScroll = styled.main`
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 15px calc(var(--player-h) + 30px);
  width: 100%;
  max-width: none;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: ${(p) => p.theme.tile2} transparent;

  &::-webkit-scrollbar { width: 12px; }
  &::-webkit-scrollbar-thumb { background: ${(p) => p.theme.tile2}; border-radius: 8px; }
`;

/* ---------- hero ---------- */

const HeroWrap = styled.section`
  margin: 0 -15px;
  padding: 0 15px;
  background:
    linear-gradient(180deg, ${(p) => p.theme.heroA} 0%, ${(p) => p.theme.heroB} 100%),
    radial-gradient(circle at 18% 8%, rgba(255, 255, 255, 0.08), transparent 34%);
  border-bottom: 1px solid ${(p) => p.theme.card};
`;

const Hero = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 260px;
  padding: 60px 0 15px;

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.1rem;
    min-height: 0;
    padding-top: 1.5rem;
  }
`;

const HeroLeft = styled.div`
  min-width: 0;
`;

const VerifiedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  font-weight: 400;
  color: ${(p) => p.theme.text};
  margin-bottom: 0.75rem;
`;

const VerifiedBadge = styled.span`
  color: ${(p) => p.theme.coral};
  display: inline-flex;
`;

const Eyebrow = styled.div`
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 18px;
  font-weight: 600;
  color: ${(p) => p.theme.text};
  opacity: 0.9;
  margin-bottom: 0.4rem;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1.05;
  font-weight: 400;
  letter-spacing: 0;
`;

const HeroRole = styled.div`
  margin-top: 10px;
  font-size: 16px;
  font-weight: 400;
  color: ${(p) => p.theme.muted};
`;

const HeroPlace = styled.div`
  margin-top: 6px;
  font-size: 14px;
  font-weight: 400;
  color: ${(p) => p.theme.muted};
`;

const HeroRight = styled.div`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;

  @media (max-width: 760px) { align-items: flex-start; text-align: left; }
`;

const BigStatNum = styled.div`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 1px;
  font-variant-numeric: tabular-nums;
`;

const BigStatLabel = styled.div`
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${(p) => p.theme.muted};
  margin-top: 0.15rem;
`;

const Collaborators = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.1rem;
`;

const CollabStack = styled.div`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
`;

const CollabCircle = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  margin-left: -10px;
  background: ${(p) => p.theme.tile2};
  color: ${(p) => p.theme.text};
  border: 2px solid ${(p) => p.theme.bg};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 800;
  &:last-child { margin-left: 0; }
`;

const CollabLabel = styled.span`
  font-size: 0.78rem;
  color: ${(p) => p.theme.muted};
  font-weight: 600;
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
`;

const PlayCircleBig = styled.button`
  width: 54px;
  height: 54px;
  flex: 0 0 auto;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: ${(p) => p.theme.accent};
  color: ${(p) => p.theme.accentText};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transition: transform 0.15s ease, background 0.15s ease;
  &:hover { transform: scale(1.06); background: ${(p) => p.theme.accentHover}; }
`;

const FollowPill = styled.button`
  border: 1px solid ${(p) => p.theme.borderStrong};
  background: transparent;
  color: ${(p) => p.theme.text};
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 8px 18px;
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
  &:hover { border-color: ${(p) => p.theme.text}; transform: scale(1.04); }
`;

const MenuDots = styled.button`
  border: none;
  background: transparent;
  color: ${(p) => p.theme.faint};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  transition: color 0.15s ease;
  &:hover { color: ${(p) => p.theme.text}; }
`;

/* ---------- tabs ---------- */

const Tabs = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 18px;
  border-bottom: none;
  margin: 0 -15px 15px;
  padding: 0 15px;
  background: rgba(24, 24, 24, 0.6);
`;

const Tab = styled.button`
  position: relative;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 15px 0 12px;
  font-size: 16px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${(p) => (p.$active ? p.theme.text : p.theme.muted)};
  transition: color 0.15s ease;
  &:hover { color: ${(p) => p.theme.text}; }
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    border-radius: 3px;
    background: ${(p) => (p.$active ? p.theme.accent : 'transparent')};
  }
`;

/* ---------- content grid ---------- */

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;

  @media (min-width: 1080px) {
    grid-template-columns: minmax(0, 70%) minmax(260px, 30%);
    align-items: start;
  }
`;

const ContentMain = styled.div`
  min-width: 0;
`;

const ContentAside = styled.aside`
  min-width: 0;
  @media (min-width: 1080px) {
    position: sticky;
    top: 15px;
  }
`;

const AsideSub = styled.div`
  color: ${(p) => p.theme.faint};
  font-size: 0.8rem;
  font-weight: 700;
  margin: -0.6rem 0 0.9rem;
`;

/* ---------- section headings ---------- */

const SectionTitle = styled.h2`
  margin: 0 0 15px;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0;
`;

/* ---------- about ---------- */

const AboutSection = styled.section`
  display: flex;
  gap: 15px;
  align-items: flex-start;
  margin-bottom: 30px;
  scroll-margin-top: 15px;

  @media (max-width: 520px) { flex-direction: column; gap: 0.9rem; }
`;

const AboutThumb = styled.div`
  width: 75px;
  height: 75px;
  flex: 0 0 auto;
  border-radius: 0;
  overflow: hidden;
  background: ${(p) => p.theme.card};
  color: ${(p) => p.theme.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  font-weight: 900;
  box-shadow: none;
  img { width: 100%; height: 100%; object-fit: cover; }
  @media (max-width: 520px) { width: 96px; height: 96px; font-size: 2rem; }
`;

const AboutBody = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  background: ${(p) => p.theme.card};
  padding: 12px 15px;
  h2 { margin-bottom: 0.5rem; }
  p {
    margin: 0;
    color: ${(p) => p.theme.muted};
    font-size: 1rem;
    line-height: 1.65;
    max-width: 62ch;
  }
`;

/* ---------- table of contents ---------- */

const TocSection = styled.section`
  margin-bottom: 30px;
`;

const TocTable = styled.div`
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
`;

const tocCols = `
  display: grid;
  grid-template-columns: 30px 34px minmax(0, 1fr) auto 132px;
  gap: 0.85rem;
  align-items: center;
`;

const TocHead = styled.div`
  ${tocCols}
  padding: 0 10px 8px;
  border-bottom: 1px solid ${(p) => p.theme.card};
  color: ${(p) => p.theme.faint};
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  .plays { text-align: right; }

  @media (max-width: 560px) {
    grid-template-columns: 26px 30px minmax(0, 1fr) auto;
    .plays { display: none; }
  }
`;

const TocRow = styled.div`
  ${tocCols}
  min-height: 42px;
  padding: 6px 10px;
  margin-top: 0;
  border-radius: 0;
  cursor: ${(p) => (p.$soon ? 'default' : 'pointer')};
  opacity: ${(p) => (p.$soon ? 0.62 : 1)};
  transition: background 0.14s ease;
  &:hover { background: ${(p) => (p.$soon ? 'transparent' : p.theme.rowHover)}; }

  @media (max-width: 560px) {
    grid-template-columns: 26px 30px minmax(0, 1fr) auto;
    gap: 0.55rem;
    .plays { display: none; }
  }
`;

const TocIndex = styled.span`
  color: ${(p) => p.theme.faint};
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  text-align: center;
`;

const TocCheck = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid ${(p) => (p.$on ? p.theme.accent : p.theme.faint)};
  background: ${(p) => (p.$on ? p.theme.accent : 'transparent')};
  color: ${(p) => (p.$on ? p.theme.accentText : p.theme.faint)};
  transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease;
  &:hover { transform: scale(1.12); border-color: ${(p) => p.theme.accent}; color: ${(p) => (p.$on ? p.theme.accentText : p.theme.accent)}; }
`;

const TocDot = styled.span`
  text-align: center;
  color: ${(p) => p.theme.faint};
`;

const TocName = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  .title {
    font-weight: 700;
    font-size: 0.98rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    font-size: 0.78rem;
    color: ${(p) => p.theme.muted};
  }
`;

const LearnMore = styled.button`
  border: 1px solid ${(p) => p.theme.borderStrong};
  background: transparent;
  color: ${(p) => p.theme.text};
  font-weight: 700;
  font-size: 0.76rem;
  padding: 0.38rem 0.9rem;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
  &:hover { border-color: ${(p) => p.theme.accent}; color: ${(p) => p.theme.accent}; transform: scale(1.03); }

  @media (max-width: 560px) { padding: 0.34rem 0.7rem; font-size: 0.72rem; }
`;

const TocSoonTag = styled.span`
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${(p) => p.theme.faint};
  white-space: nowrap;
`;

const TocPlays = styled.span`
  text-align: right;
  color: ${(p) => p.theme.muted};
  font-size: 0.86rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

/* ---------- detail blocks ---------- */

const DetailBlock = styled.section`
  margin-bottom: 30px;
  scroll-margin-top: 15px;
`;

const DetailHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  h2 { margin-bottom: 0; }
  margin-bottom: 1rem;
`;

const DetailMeta = styled.span`
  color: ${(p) => p.theme.faint};
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
`;

/* ---------- playlist ---------- */

const Playlist = styled.div`
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
`;

const PlaylistHeadRow = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr auto 26px;
  gap: 0.75rem;
  align-items: center;
  padding: 0 10px 8px;
  border-bottom: 1px solid ${(p) => p.theme.card};
  color: ${(p) => p.theme.faint};
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  .date { text-align: right; }
  @media (max-width: 520px) {
    grid-template-columns: 30px 1fr 26px;
    .date { display: none; }
  }
`;

const TrackWrap = styled.div`
  border-radius: 0;
  background: ${(p) => (p.$active ? p.theme.cardHover : 'transparent')};
  margin-top: 0;
`;

const TrackRow = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 40px 1fr auto 26px;
  gap: 0.75rem;
  align-items: center;
  min-height: 42px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  color: ${(p) => p.theme.text};
  border-radius: 0;
  transition: background 0.14s ease;
  &:hover { background: ${(p) => p.theme.rowHover}; }
  &:hover .num { display: none; }
  &:hover .hoverplay { display: inline-flex; }
  @media (max-width: 520px) {
    grid-template-columns: 30px 1fr 26px;
    gap: 0.5rem;
  }
`;

const TrackIndex = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.theme.faint};
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
  .hoverplay { display: none; color: ${(p) => p.theme.text}; }
`;

const TrackMain = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  .title {
    font-weight: 700;
    font-size: 0.96rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .company {
    font-size: 0.82rem;
    color: ${(p) => p.theme.muted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const TrackDate = styled.div`
  text-align: right;
  color: ${(p) => p.theme.muted};
  font-size: 0.84rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  @media (max-width: 520px) { display: none; }
`;

const TrackChevron = styled.span`
  color: ${(p) => p.theme.faint};
  text-align: center;
  transition: transform 0.18s ease;
  transform: rotate(${(p) => (p.$open ? '180deg' : '0deg')});
`;

const TrackDetail = styled.div`
  padding: 0 10px 12px 58px;
  background: ${(p) => p.theme.card};
  ul {
    margin: 0.2rem 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  li {
    position: relative;
    padding-left: 1.1rem;
    color: ${(p) => p.theme.muted};
    font-size: 0.9rem;
    line-height: 1.5;
  }
  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(p) => p.theme.accent};
  }
  @media (max-width: 520px) { padding-left: 2.4rem; }
`;

/* ---------- equalizer ---------- */

const EqWrap = styled.span`
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 15px;
  span {
    width: 3px;
    height: 40%;
    background: ${(p) => p.theme.accent};
    border-radius: 2px;
  }
  span[data-play='on'] { animation: ${eq} 0.9s ease-in-out infinite; }
  span[data-b='2'] { animation-delay: 0.2s; }
  span[data-b='3'] { animation-delay: 0.45s; }
  span[data-b='4'] { animation-delay: 0.65s; }
  @media (prefers-reduced-motion: reduce) {
    span { animation: none !important; height: 65%; }
  }
`;

/* ---------- cards ---------- */

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const InfoCard = styled.div`
  background: ${(p) => p.theme.card};
  border: none;
  border-radius: 0;
  padding: 15px;
  transition: background 0.16s ease;
  &:hover { background: ${(p) => p.theme.cardHover}; }
`;

const CardKicker = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${(p) => p.theme.faint};
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
`;

const AwardDot = styled.span`
  color: ${(p) => p.theme.accent};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  &.proj { font-size: 1.06rem; }
`;

const CardSub = styled.div`
  margin-top: 0.4rem;
  color: ${(p) => p.theme.muted};
  font-size: 0.88rem;
  line-height: 1.5;
`;

const CardNote = styled.div`
  margin-top: 0.55rem;
  color: ${(p) => p.theme.accent};
  font-size: 0.8rem;
  font-weight: 700;
`;

const CertRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const CertChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid ${(p) => p.theme.borderStrong};
  color: ${(p) => p.theme.text};
  padding: 0.42rem 0.9rem;
  border-radius: 2px;
  font-size: 0.83rem;
  font-weight: 600;
  svg { color: ${(p) => p.theme.accent}; }
`;

/* ---------- projects ---------- */

const ProjectCard = styled.div`
  display: flex;
  flex-direction: row;
  background: ${(p) => p.theme.card};
  border: none;
  border-radius: 0;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: background 0.16s ease;
  &:hover { background: ${(p) => p.theme.cardHover}; }
`;

const ProjectCover = styled.div`
  position: relative;
  width: 76px;
  min-height: 76px;
  flex: 0 0 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.theme.tile};
  > span {
    display: inline-flex;
    color: ${(p) => p.theme.faint};
  }
`;

const ProjectPlay = styled.span`
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${(p) => p.theme.accent};
  color: ${(p) => p.theme.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px ${(p) => p.theme.onAccentGlow};
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.18s ease, transform 0.18s ease;
  ${ProjectCard}:hover & { opacity: 1; transform: translateY(0); }
`;

const ProjectBody = styled.div`
  min-width: 0;
  padding: 12px 15px;
`;

const TechRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
`;

const TechChip = styled.span`
  background: ${(p) => p.theme.tile};
  color: ${(p) => p.theme.muted};
  padding: 0.26rem 0.6rem;
  border-radius: 2px;
  font-size: 0.72rem;
  font-weight: 600;
`;

/* ---------- publications ---------- */

const PubList = styled.div`
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
`;

const PubItem = styled.div`
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 0.75rem;
  align-items: start;
  min-height: 42px;
  padding: 9px 10px;
  border-radius: 0;
  margin-top: 0;
  transition: background 0.14s ease;
  &:hover { background: ${(p) => p.theme.rowHover}; }
`;

const PubIndex = styled.span`
  color: ${(p) => p.theme.faint};
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  text-align: center;
  padding-top: 0.15rem;
`;

const PubBody = styled.div`
  min-width: 0;
`;

const PubTitle = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.35;
  color: ${(p) => p.theme.text};
  text-decoration: none;
  &:is(a):hover { color: ${(p) => p.theme.accent}; text-decoration: underline; }
`;

const PubMeta = styled.div`
  margin-top: 0.3rem;
  color: ${(p) => p.theme.muted};
  font-size: 0.82rem;
  line-height: 1.45;
`;

/* ---------- discography (tools) ---------- */

const Discography = styled.div`
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
`;

const DiscoPlay = styled.span`
  color: ${(p) => p.theme.accent};
  opacity: 0;
  transition: opacity 0.15s ease;
  display: inline-flex;
`;

const DiscoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 5px;
  border-radius: 0;
  transition: background 0.14s ease;
  &:hover { background: ${(p) => p.theme.rowHover}; }
  &:hover ${DiscoPlay} { opacity: 1; }
`;

const DiscoTile = styled.div`
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(p) => (p.$glyph ? '1.3rem' : '0.85rem')};
  font-weight: 800;
  background: ${(p) => p.theme.card};
  color: ${(p) => (p.$glyph ? p.theme.text : p.theme.muted)};
`;

const DiscoMeta = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  .name {
    font-size: 0.9rem;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    font-size: 0.76rem;
    color: ${(p) => p.theme.muted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

/* ---------- footnote ---------- */

const FootNote = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid ${(p) => p.theme.card};
  color: ${(p) => p.theme.faint};
  font-size: 0.82rem;
  em { color: ${(p) => p.theme.muted}; font-style: italic; }
`;

/* ---------- player bar ---------- */

const Player = styled.footer`
  position: relative;
  flex: 0 0 var(--player-h);
  z-index: 40;
  background: ${(p) => p.theme.sidebar};
  border-top: 1px solid ${(p) => p.theme.border};
  box-shadow: none;
`;

const PlayerInner = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 25%) minmax(260px, 50%) minmax(160px, 25%);
  align-items: center;
  gap: 1rem;
  padding: 5px 15px;
  min-height: var(--player-h);
  @media (max-width: 640px) {
    grid-template-columns: 1fr auto;
    padding: 0.5rem 0.9rem;
    gap: 0.75rem;
  }
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
`;

const NowArt = styled.div`
  position: relative;
  width: 50px;
  height: 50px;
  flex: 0 0 auto;
  border-radius: 0;
  overflow: hidden;
  background: ${(p) => p.theme.accent};
  color: ${(p) => p.theme.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.82rem;
  img { width: 100%; height: 100%; object-fit: cover; }
  &[data-play='on'] { box-shadow: none; }
  @media (max-width: 640px) { width: 40px; height: 40px; }
`;

const NowArtEq = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
  background: rgba(0, 0, 0, 0.35);
`;

const NowMeta = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  .t {
    font-weight: 700;
    font-size: 0.88rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .s {
    color: ${(p) => p.theme.muted};
    font-size: 0.76rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const PlayerCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  max-width: 440px;
  @media (max-width: 640px) {
    grid-row: 1;
    grid-column: 2;
    max-width: none;
  }
`;

const Transport = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const TIcon = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  color: ${(p) => p.theme.muted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, background 0.15s ease;
  &:hover { color: ${(p) => p.theme.text}; background: ${(p) => p.theme.rowHover}; }
  &.ghost { @media (max-width: 640px) { display: none; } }
`;

const PlayCircle = styled.button`
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: ${(p) => p.theme.text};
  color: ${(p) => p.theme.bg};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
  &:hover { transform: scale(1.08); }
`;

const ProgressWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  .time {
    color: ${(p) => p.theme.faint};
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    width: 1.4rem;
    text-align: center;
    flex: 0 0 auto;
  }
  @media (max-width: 640px) { display: none; }
`;

const ProgressTrack = styled.div`
  flex: 1 1 auto;
  height: 4px;
  border-radius: 3px;
  background: ${(p) => p.theme.borderStrong};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${(p) => p.theme.accent};
  border-radius: 3px;
  transition: width 0.12s linear;
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

const PlayerRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.3rem;
  @media (max-width: 640px) { display: none; }
`;

const VolumeBar = styled.div`
  width: 84px;
  height: 4px;
  border-radius: 3px;
  background: ${(p) => p.theme.borderStrong};
  overflow: hidden;
  span {
    display: block;
    width: 70%;
    height: 100%;
    background: ${(p) => p.theme.muted};
    border-radius: 3px;
  }
`;
