import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import {
  formatDate,
  formatRange,
  isArchived,
  pickSocialUrl,
  truncateText,
} from '../../utils/cvHelpers';
import geistFont from './assets/fonts/geist.woff2';
import geistMonoFont from './assets/fonts/geist-mono.woff2';
import sentientFont from './assets/fonts/sentient.woff2';
import sentientItalicFont from './assets/fonts/sentient-italic.woff2';

/**
 * VladSavrukTheme - a CV-driven remake of vladsavruk.com.
 *
 * The source is a sparse white page with Sentient as the body face, italic
 * inline pills, a 4:3 gallery surface, an archive list, and a dark gradient
 * footer revealed by shrinking/rounding the page surface at the bottom.
 */

const SANS =
  "'Vlad Geist', 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO =
  "'Vlad Geist Mono', 'Geist Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";
const SERIF =
  "'Vlad Sentient', 'sentient', 'Iowan Old Style', Georgia, 'Times New Roman', serif";

const sourceGray = {
  950: '#252829',
  900: '#3c4142',
  800: '#535a5b',
  700: '#6b7374',
  600: '#828b8c',
  500: '#9aa4a5',
  300: '#c1caca',
  200: '#d0d7d7',
  100: '#dfe4e4',
  50: '#eef1f1',
};

const lightTheme = {
  sans: SANS,
  mono: MONO,
  serif: SERIF,
  isDark: false,
  bg: '#ffffff',
  ink: '#111110',
  name: sourceGray[900],
  body: sourceGray[600],
  muted: sourceGray[500],
  faint: sourceGray[300],
  pillText: sourceGray[800],
  pillBg: sourceGray[50],
  pillHover: sourceGray[100],
  line: 'rgba(83, 90, 91, 0.08)',
  underline: sourceGray[200],
  stageBg: sourceGray[50],
  cardBg: '#ffffff',
  cardAlt: '#f7f9f9',
  cardBorder: 'rgba(83, 90, 91, 0.1)',
  controlBg: 'rgba(255, 255, 255, 0.78)',
  controlBorder: 'rgba(83, 90, 91, 0.12)',
  cardShadow: '0 24px 48px -30px rgba(17, 17, 16, 0.3)',
  footerG1: '#070a14',
  footerG2: '#0b1533',
  footerG3: '#1a2a5e',
  footerFg: '#ffffff',
};

const darkTheme = {
  sans: SANS,
  mono: MONO,
  serif: SERIF,
  isDark: true,
  bg: '#101211',
  ink: '#f7f8f5',
  name: '#f1f4f2',
  body: '#b4bebf',
  muted: '#8d999a',
  faint: '#657172',
  pillText: '#e4eaea',
  pillBg: 'rgba(238, 241, 241, 0.08)',
  pillHover: 'rgba(238, 241, 241, 0.14)',
  line: 'rgba(238, 241, 241, 0.08)',
  underline: 'rgba(238, 241, 241, 0.18)',
  stageBg: 'rgba(238, 241, 241, 0.04)',
  cardBg: '#161918',
  cardAlt: '#1d2221',
  cardBorder: 'rgba(238, 241, 241, 0.12)',
  controlBg: 'rgba(16, 18, 17, 0.82)',
  controlBorder: 'rgba(238, 241, 241, 0.15)',
  cardShadow: '0 26px 54px -28px rgba(0, 0, 0, 0.75)',
  footerG1: '#04070f',
  footerG2: '#09132c',
  footerG3: '#172657',
  footerFg: '#ffffff',
};

const FOOTER_TIME_ZONE = 'America/Edmonton';

const FOOTER_STOPS = [
  { hour: 0, g1: '#070A14', g2: '#0B1533', g3: '#1A2A5E' },
  { hour: 7, g1: '#2B3A7A', g2: '#C08A7A', g3: '#F2D5A0' },
  { hour: 12, g1: '#7FB7FF', g2: '#BFE8FF', g3: '#FFF4D6' },
  { hour: 18, g1: '#2B1D52', g2: '#B14D7A', g3: '#F2A65A' },
  { hour: 22, g1: '#070A14', g2: '#0B1533', g3: '#1A2A5E' },
];

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Vlad Geist';
    src: url(${geistFont}) format('woff2');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Vlad Geist Mono';
    src: url(${geistMonoFont}) format('woff2');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Vlad Sentient';
    src: url(${sentientFont}) format('woff2');
    font-weight: 200 700;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Vlad Sentient';
    src: url(${sentientItalicFont}) format('woff2');
    font-weight: 200 700;
    font-style: italic;
    font-display: swap;
  }

  html {
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  body {
    background: transparent;
  }
`;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v) => clamp(v, 0, 1);

const clean = (value) => String(value || '').trim();

const compact = (parts, separator = ' · ') =>
  parts
    .map((part) => clean(part))
    .filter(Boolean)
    .join(separator);

const activeItems = (items) =>
  (Array.isArray(items) ? items : []).filter((item) => item && !isArchived(item));

function hexToRgb(hex) {
  const raw = hex.replace('#', '').trim();
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function mixHex(from, to, amount) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const t = clamp01(amount);
  const toHex = (value) => Math.round(value).toString(16).padStart(2, '0');
  return `#${toHex(a.r + (b.r - a.r) * t)}${toHex(a.g + (b.g - a.g) * t)}${toHex(a.b + (b.b - a.b) * t)}`;
}

function channelLuminance(value) {
  const n = value / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function footerHour(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: FOOTER_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const read = (type) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return read('hour') + read('minute') / 60 + read('second') / 3600;
}

function footerGradient(date = new Date()) {
  const hour = ((footerHour(date) % 24) + 24) % 24;
  let currentIndex = 0;
  for (let i = 0; i < FOOTER_STOPS.length; i += 1) {
    if (FOOTER_STOPS[i].hour <= hour) currentIndex = i;
  }

  const a = FOOTER_STOPS[currentIndex];
  const b = FOOTER_STOPS[(currentIndex + 1) % FOOTER_STOPS.length];
  const start = a.hour;
  const end = b.hour > start ? b.hour : b.hour + 24;
  const progress = clamp01(((hour < start ? hour + 24 : hour) - start) / Math.max(0.0001, end - start));
  const g1 = mixHex(a.g1, b.g1, progress);
  const g2 = mixHex(a.g2, b.g2, progress);
  const g3 = mixHex(a.g3, b.g3, progress);
  const isLight = (luminance(g1) + luminance(g2) + luminance(g3)) / 3 > 0.3;

  return {
    g1,
    g2,
    g3,
    tone: isLight ? 'light' : 'dark',
    fg: isLight ? '#111110' : '#ffffff',
    linkBg: isLight
      ? 'color-mix(in oklab, #111110 10%, transparent)'
      : 'color-mix(in oklab, #ffffff 18%, transparent)',
    linkHoverBg: isLight ? '#111110' : '#ffffff',
    linkHoverFg: isLight ? '#f2f0e5' : '#111110',
  };
}

function firstHighlight(item) {
  if (Array.isArray(item?.highlights)) return clean(item.highlights[0]);
  return clean(item?.highlights);
}

function itemUrl(item) {
  return clean(item?.url || item?.website || item?.link || item?.repository || item?.github);
}

function itemDateValue(item) {
  return (
    item?.date ||
    item?.releaseDate ||
    item?.endDate ||
    item?.end_date ||
    item?.startDate ||
    item?.start_date ||
    ''
  );
}

function itemYear(item, fallback = '') {
  return formatDate(itemDateValue(item), {
    month: 'none',
    presentLabel: 'Now',
    fallback,
  });
}

function itemRange(item) {
  const start = item?.startDate ?? item?.start_date;
  const end = item?.endDate ?? item?.end_date;
  const range = formatRange(start, end, {
    month: 'none',
    presentLabel: 'Present',
    fallback: '',
  });

  return (
    range ||
    formatDate(item?.date || item?.releaseDate, {
      month: 'short',
      presentLabel: 'Present',
      fallback: '',
    })
  );
}

function projectTitle(item) {
  return clean(item?.name || item?.title || item?.project || 'Untitled project');
}

function projectSummary(item) {
  return clean(item?.summary || item?.description || firstHighlight(item));
}

function educationTitle(item) {
  return compact([item?.degree, item?.area], ', ') || clean(item?.institution || item?.school || 'Education');
}

function publicationTitle(item) {
  return clean(item?.name || item?.title || item?.paper || 'Publication');
}

function developmentTitle(item) {
  return clean(item?.name || item?.title || item?.course || item?.certification || 'Professional development');
}

function findScrollParent(el) {
  let parent = el?.parentElement || null;
  while (parent && parent !== document.body) {
    const style = window.getComputedStyle(parent);
    const canScroll = /(auto|scroll|overlay)/.test(style.overflowY);
    if (canScroll && parent.scrollHeight > parent.clientHeight) return parent;
    parent = parent.parentElement;
  }
  return window;
}

// Icons -------------------------------------------------------------------
const Chevron = ({ dir = 'left' }) => (
  <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
    <polyline
      fill="none"
      points={dir === 'left' ? '7.75 1.75 3.5 6 7.75 10.25' : '4.25 1.75 8.5 6 4.25 10.25'}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <path
      d="M3 2.2v7.6a.4.4 0 0 0 .61.34l6-3.8a.4.4 0 0 0 0-.68l-6-3.8A.4.4 0 0 0 3 2.2Z"
      fill="currentColor"
    />
  </svg>
);

const PauseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <rect x="2.5" y="2" width="2.5" height="8" rx="0.6" fill="currentColor" />
    <rect x="7" y="2" width="2.5" height="8" rx="0.6" fill="currentColor" />
  </svg>
);

const SunMoon = ({ dark }) =>
  dark ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );

const Arrow = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true" style={{ marginLeft: '0.3em' }}>
    <path
      d="M3 9L9 3M9 3H4.5M9 3V7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function VladSavrukTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const email = cv.email || null;
  const website = cv.website || null;
  const location = cv.location || null;

  const experience = useMemo(() => activeItems(cv.experience).slice(0, 8), [cv.experience]);
  const projects = useMemo(() => activeItems(cv.projects).slice(0, 10), [cv.projects]);
  const education = useMemo(() => activeItems(cv.education).slice(0, 6), [cv.education]);
  const volunteer = useMemo(() => activeItems(cv.volunteer).slice(0, 6), [cv.volunteer]);
  const publications = useMemo(() => activeItems(cv.publications).slice(0, 6), [cv.publications]);
  const presentations = useMemo(() => activeItems(cv.presentations).slice(0, 6), [cv.presentations]);
  const awards = useMemo(() => activeItems(cv.awards).slice(0, 6), [cv.awards]);
  const professionalDevelopment = useMemo(
    () => activeItems(cv.professionalDevelopment).slice(0, 6),
    [cv.professionalDevelopment],
  );

  const role = cv.currentJobTitle || cv.label || cv.headline || 'Researcher';
  const currentOrg = experience.find((e) => e.isCurrent)?.company || experience[0]?.company || null;

  const socials = cv.social || [];
  const linkedin = pickSocialUrl(socials, ['linkedin']);
  const github = pickSocialUrl(socials, ['github']);
  const facebook = pickSocialUrl(socials, ['facebook']);
  const instagram = pickSocialUrl(socials, ['instagram']);

  const socialLinks = [
    { label: 'LinkedIn', url: linkedin },
    { label: 'GitHub', url: github },
    { label: 'Facebook', url: facebook },
    { label: 'Instagram', url: instagram },
  ].filter((s) => s.url);
  const footerLinks = [
    ...socialLinks.map((item) => ({ ...item, external: true })),
    ...(email ? [{ label: 'email', url: `mailto:${email}`, external: false }] : []),
  ];

  const introOne =
    clean(cv.about) ||
    "I'm interested in air quality, environmental health, and building tools that make messy data legible.";
  const introTwo = `I work as ${role}${currentOrg ? ` at ${currentOrg}` : ''}${
    location ? `, based in ${location}` : ''
  }, aiming for one clear direction that holds up in real use.`;

  const sectionCards = useMemo(() => {
    const cards = [];
    if (experience.length) {
      cards.push({
        id: 'section-experience',
        kind: 'Section',
        name: 'Experience',
        meta: `${experience.length} roles`,
        year: itemYear(experience[0], 'Now'),
        summary: compact([
          experience[0]?.title && experience[0]?.company
            ? `${experience[0].title} at ${experience[0].company}`
            : experience[0]?.title || experience[0]?.company,
          firstHighlight(experience[0]),
        ]),
      });
    }
    if (education.length) {
      cards.push({
        id: 'section-education',
        kind: 'Section',
        name: 'Education',
        meta: `${education.length} entries`,
        year: itemYear(education[0], 'Edu'),
        summary: compact([educationTitle(education[0]), education[0]?.institution || education[0]?.school]),
      });
    }
    if (publications.length) {
      cards.push({
        id: 'section-publications',
        kind: 'Section',
        name: 'Publications',
        meta: `${publications.length} items`,
        year: itemYear(publications[0], 'Pub'),
        summary: publicationTitle(publications[0]),
      });
    }
    if (professionalDevelopment.length) {
      cards.push({
        id: 'section-development',
        kind: 'Section',
        name: 'Professional development',
        meta: `${professionalDevelopment.length} items`,
        year: itemYear(professionalDevelopment[0], 'Dev'),
        summary: developmentTitle(professionalDevelopment[0]),
      });
    }
    if (volunteer.length) {
      cards.push({
        id: 'section-volunteer',
        kind: 'Section',
        name: 'Volunteer',
        meta: `${volunteer.length} roles`,
        year: itemYear(volunteer[0], 'Vol'),
        summary: compact([volunteer[0]?.title, volunteer[0]?.company]),
      });
    }
    return cards;
  }, [education, experience, professionalDevelopment, publications, volunteer]);

  const coverItems = useMemo(() => {
    return sectionCards.slice(0, 12);
  }, [sectionCards]);

  const archiveRows = useMemo(() => {
    const rows = [];
    const push = (section, item, index, title, detail, url = '') => {
      rows.push({
        id: `${section}-${index}-${title}`,
        year: itemYear(item, String(index + 1).padStart(2, '0')),
        section,
        title,
        detail,
        url,
      });
    };

    projects.forEach((project, index) =>
      push('Project', project, index, projectTitle(project), projectSummary(project), itemUrl(project)),
    );
    experience.forEach((item, index) =>
      push('Work', item, index, clean(item.title || 'Role'), compact([item.company, itemRange(item), firstHighlight(item)])),
    );
    education.forEach((item, index) =>
      push('Education', item, index, educationTitle(item), compact([item.institution || item.school, itemRange(item)])),
    );
    publications.forEach((item, index) =>
      push('Publication', item, index, publicationTitle(item), compact([item.journal || item.publisher, itemRange(item)]), itemUrl(item)),
    );
    presentations.forEach((item, index) =>
      push('Talk', item, index, publicationTitle(item), compact([item.event || item.publisher, itemRange(item)]), itemUrl(item)),
    );
    awards.forEach((item, index) =>
      push('Award', item, index, clean(item.title || item.name || 'Award'), compact([item.awarder || item.organization, itemRange(item)])),
    );
    professionalDevelopment.forEach((item, index) =>
      push('Development', item, index, developmentTitle(item), compact([item.institution || item.issuer, itemRange(item)]), itemUrl(item)),
    );
    volunteer.forEach((item, index) =>
      push('Volunteer', item, index, clean(item.title || 'Volunteer'), compact([item.company, itemRange(item), firstHighlight(item)])),
    );

    return rows.slice(0, 36);
  }, [awards, education, experience, professionalDevelopment, projects, publications, presentations, volunteer]);

  const count = coverItems.length;

  // Coverflow state --------------------------------------------------------
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragU, setDragU] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [stageW, setStageW] = useState(560);
  const [pageReveal, setPageReveal] = useState(0);
  const [footer, setFooter] = useState(() => footerGradient());

  const stageRef = useRef(null);
  const worksRef = useRef(null);
  const footerRef = useRef(null);
  const dirRef = useRef(1);
  const drag = useRef({ active: false, startX: 0, moved: false, pointerId: null });

  const stageH = Math.round(stageW * 0.75);
  const cardW = clamp(Math.round(stageW * 0.54), 156, 270);
  const cardH = clamp(Math.round(stageH * 0.72), 176, 300);
  const stepPx = cardW * 0.58;

  useEffect(() => {
    if (count === 0) {
      setActiveIndex(0);
      return;
    }
    setActiveIndex((idx) => clamp(idx, 0, count - 1));
  }, [count]);

  // Measure the stage so the coverflow scales cleanly at mobile widths.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;

    const measure = () => setStageW(el.clientWidth || 560);
    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [count]);

  // Source-like bottom reveal: scale and round the white page as the footer enters.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frame = 0;
    const footer = footerRef.current;
    const scroller = findScrollParent(footer);
    const scrollTarget = scroller === window ? window : scroller;

    const update = () => {
      frame = 0;
      if (!footer) return;
      const width = window.innerWidth;
      const revealDistance = width <= 480 ? 760 : width <= 768 ? 640 : 520;
      const rect = footer.getBoundingClientRect();
      const top = scroller === window
        ? rect.top
        : rect.top - scroller.getBoundingClientRect().top;
      const viewportHeight = scroller === window ? window.innerHeight : scroller.clientHeight;
      const next = clamp((viewportHeight - top + 20) / revealDistance, 0, 1);
      setPageReveal(next);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    scrollTarget.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  // Respect reduced-motion: no autoplay.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const update = () => setFooter(footerGradient());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const advance = useCallback(() => {
    setActiveIndex((idx) => {
      if (count <= 1) return idx;
      let dir = dirRef.current;
      let next = idx + dir;
      if (next >= count) {
        dir = -1;
        next = idx - 1;
      } else if (next < 0) {
        dir = 1;
        next = idx + 1;
      }
      dirRef.current = dir;
      return clamp(next, 0, count - 1);
    });
  }, [count]);

  const playing = !paused && !hovering && !isDragging && !reducedMotion && count > 1;

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(advance, 3200);
    return () => clearInterval(id);
  }, [playing, advance]);

  const go = useCallback(
    (delta) => {
      dirRef.current = delta >= 0 ? 1 : -1;
      setDragU(0);
      setActiveIndex((idx) => clamp(idx + delta, 0, count - 1));
    },
    [count],
  );

  const onPointerDown = (e) => {
    if (count <= 1) return;
    drag.current = { active: true, startX: e.clientX, moved: false, pointerId: e.pointerId };
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* older browsers */
    }
  };

  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    setDragU(dx / stepPx);
  };

  const endDrag = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    const units = dx / stepPx;
    drag.current.active = false;
    setIsDragging(false);
    setDragU(0);
    if (Math.abs(units) > 0.12) {
      const steps = Math.round(units);
      if (steps !== 0) {
        dirRef.current = steps < 0 ? 1 : -1;
        setActiveIndex((idx) => clamp(idx - steps, 0, count - 1));
      }
    }
    try {
      if (drag.current.pointerId != null) e.currentTarget.releasePointerCapture(drag.current.pointerId);
    } catch {
      /* noop */
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    }
  };

  const selectCard = (i) => {
    if (drag.current.moved) return;
    if (i !== activeIndex) {
      dirRef.current = i > activeIndex ? 1 : -1;
      setActiveIndex(i);
    }
  };

  const scrollToWorks = (e) => {
    e.preventDefault();
    worksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const active = coverItems[activeIndex] || null;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageShell
        style={{
          '--page-reveal': pageReveal,
          '--footer-g1': footer.g1,
          '--footer-g2': footer.g2,
          '--footer-g3': footer.g3,
          '--footer-fg': footer.fg,
          '--footer-link-bg': footer.linkBg,
          '--footer-link-hover-bg': footer.linkHoverBg,
          '--footer-link-hover-fg': footer.linkHoverFg,
        }}
      >
        <Surface>
          <Column>
            <TopRow>
              <Masthead aria-label="Breadcrumb">
                <span className="name">{name}</span>
                <span className="dash">—</span>
                <span className="role">{role}</span>
              </Masthead>
              {onDarkModeChange && (
                <ToggleButton
                  type="button"
                  onClick={() => onDarkModeChange(!darkMode)}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <SunMoon dark={darkMode} />
                </ToggleButton>
              )}
            </TopRow>

            <Intro>
              <p>{introOne}</p>
              <p>{introTwo}</p>
              <p>
                See my{' '}
                <PillLink as="a" href="#works" onClick={scrollToWorks}>
                  works
                </PillLink>
                . Browse the{' '}
                <PillLink href="#archive">
                  archive
                </PillLink>
                .{' '}
                {website && (
                  <>
                    Read more on my{' '}
                    <PillLink href={website} target="_blank" rel="noopener noreferrer">
                      site
                    </PillLink>
                    .{' '}
                  </>
                )}
                {email && (
                  <>
                    Or reach me through{' '}
                    <PillLink href={`mailto:${email}`}>email</PillLink>.
                  </>
                )}
              </p>
              <Dots aria-hidden="true">
                <span>•••</span>
              </Dots>
            </Intro>

            {count > 0 && (
              <Section id="works" ref={worksRef}>
                <Stage
                  ref={stageRef}
                  style={{ height: `${stageH}px`, perspective: `${Math.round(cardW * 3.6)}px` }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onPointerEnter={() => setHovering(true)}
                  onPointerLeave={() => setHovering(false)}
                  onKeyDown={onKeyDown}
                  tabIndex={0}
                  role="group"
                  aria-roledescription="carousel"
                  aria-label="Coverflow of selected CV sections"
                  $dragging={isDragging}
                >
                  <Track>
                    {coverItems.map((item, i) => {
                      const eff = i - activeIndex + dragU;
                      const c = clamp(eff, -2.4, 2.4);
                      const ac = Math.abs(c);
                      const tx = c * stepPx;
                      const tz = -Math.min(ac, 2) * (cardW * 0.42);
                      const ry = -clamp(c, -1, 1) * 42;
                      const sc = 1 - Math.min(ac, 2) * 0.12;
                      const op = ac > 2.35 ? 0 : ac <= 1 ? 1 : Math.max(0, 1 - (ac - 1) * 0.72);
                      const zIndex = 200 - Math.round(ac * 20);
                      const isCenter = Math.round(eff) === 0;
                      return (
                        <Card
                          key={item.id}
                          onClick={() => selectCard(i)}
                          $center={isCenter}
                          aria-hidden={op < 0.1}
                          aria-label={`${item.kind}: ${item.name}`}
                          style={{
                            width: `${cardW}px`,
                            height: `${cardH}px`,
                            marginLeft: `${-cardW / 2}px`,
                            transform: `translate3d(${tx}px, -50%, ${tz}px) rotateY(${ry}deg) scale(${sc})`,
                            opacity: op,
                            zIndex,
                            pointerEvents: op < 0.1 ? 'none' : 'auto',
                            transition: isDragging
                              ? 'none'
                              : 'transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.4s ease',
                          }}
                        >
                          <CardBody>
                            <span className="idx">{item.year}</span>
                            <span className="kind">{item.kind}</span>
                            <strong>{item.name}</strong>
                            {item.summary && <p>{truncateText(item.summary, 150)}</p>}
                            {item.meta && <span className="meta">{item.meta}</span>}
                          </CardBody>
                        </Card>
                      );
                    })}
                  </Track>
                </Stage>

                {active && (
                  <Caption>
                    <span className="ctitle">{active.name}</span>
                    {active.summary && <span className="csum">{truncateText(active.summary, 140)}</span>}
                    {active.url && (
                      <a href={active.url} target="_blank" rel="noopener noreferrer">
                        Open project
                        <Arrow />
                      </a>
                    )}
                  </Caption>
                )}

                <Controls>
                  <ControlGroup>
                    <IconButton
                      type="button"
                      onClick={() => go(-1)}
                      disabled={activeIndex <= 0}
                      aria-label="Previous item"
                    >
                      <Chevron dir="left" />
                    </IconButton>
                    <IconButton
                      type="button"
                      onClick={() => go(1)}
                      disabled={activeIndex >= count - 1}
                      aria-label="Next item"
                    >
                      <Chevron dir="right" />
                    </IconButton>
                  </ControlGroup>

                  <Counter aria-hidden="true">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                  </Counter>

                  <ControlGroup>
                    <StatusPill $active={playing}>{playing ? 'Playing' : 'Paused'}</StatusPill>
                    <IconButton
                      type="button"
                      onClick={() => setPaused((p) => !p)}
                      aria-label={paused ? 'Resume autoplay' : 'Pause autoplay'}
                      disabled={reducedMotion || count <= 1}
                    >
                      {playing ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                  </ControlGroup>
                </Controls>
              </Section>
            )}

            {archiveRows.length > 0 && (
              <ArchiveSection id="archive">
                <ArchiveHead>
                  <h2>Archive</h2>
                  <span>All sections</span>
                </ArchiveHead>
                <ArchiveList>
                  {archiveRows.map((row) => (
                    <ArchiveRow key={row.id}>
                      <span className="year">{row.year}</span>
                      <span className="entry">
                        {row.url ? (
                          <a href={row.url} target="_blank" rel="noopener noreferrer">
                            {row.title}
                          </a>
                        ) : (
                          <span>{row.title}</span>
                        )}
                        {row.detail && <small>{truncateText(row.detail, 120)}</small>}
                      </span>
                      <span className="type">{row.section}</span>
                    </ArchiveRow>
                  ))}
                </ArchiveList>
              </ArchiveSection>
            )}
          </Column>
        </Surface>

        <GradientFooter id="site-footer" ref={footerRef}>
          <FooterInner $tone={footer.tone}>
            {location && <p>Right now I&apos;m in {location}.</p>}
            {footerLinks.length > 0 && (
              <p>
                {socialLinks.length > 0 ? 'You can also find me on ' : 'You can also reach me through '}
                {footerLinks.map((item, index) => {
                  const separator = index === 0 ? '' : index === footerLinks.length - 1 ? ' or ' : ', ';
                  const linkProps = item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
                  return (
                    <React.Fragment key={item.label}>
                      {separator}
                      <FooterPill href={item.url} {...linkProps}>
                        {item.label}
                      </FooterPill>
                    </React.Fragment>
                  );
                })}
              </p>
            )}
            <p className="copy">© {new Date().getFullYear()}, {name}</p>
          </FooterInner>
        </GradientFooter>
      </PageShell>
    </ThemeProvider>
  );
}

// Styles ------------------------------------------------------------------
const PageShell = styled.div`
  min-height: 100%;
  width: 100%;
  color: ${(p) => p.theme.body};
  font-family: ${(p) => p.theme.serif};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(
    180deg,
    var(--footer-g1, ${(p) => p.theme.footerG1}) 20%,
    var(--footer-g2, ${(p) => p.theme.footerG2}) 55%,
    var(--footer-g3, ${(p) => p.theme.footerG3}) 100%
  );
  isolation: isolate;
  overflow-x: hidden;
  --page-scale-amount: 0.05;
  --page-radius-max: 32px;

  @media (max-width: 480px) {
    --page-scale-amount: 0.15;
    --page-radius-max: 40px;
  }
`;

const Surface = styled.main`
  position: relative;
  z-index: 2;
  width: 100%;
  background: ${(p) => p.theme.bg};
  color: ${(p) => p.theme.body};
  transform-origin: top;
  will-change: transform, border-radius;
  transform: scale(calc(1 - (var(--page-reveal, 0) * var(--page-scale-amount))));
  border-bottom-left-radius: calc(var(--page-reveal, 0) * var(--page-radius-max));
  border-bottom-right-radius: calc(var(--page-reveal, 0) * var(--page-radius-max));
  overflow: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;

  @media (prefers-reduced-motion: reduce) {
    border-radius: 0;
    transform: none;
  }
`;

const Column = styled.div`
  width: 100%;
  max-width: 42rem;
  min-height: 100vh;
  margin: 0 auto;
  padding: 3rem 2rem 8rem;
  box-sizing: border-box;

  @media (min-width: 640px) {
    padding-top: 8rem;
    padding-bottom: 12rem;
  }

  @media (max-width: 480px) {
    min-height: 120svh;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
`;

const TopRow = styled.div`
  position: relative;
  max-width: 36rem;
  margin: 0 auto;
`;

const Masthead = styled.nav`
  display: flex;
  align-items: baseline;
  gap: 0.38rem;
  min-width: 0;
  white-space: nowrap;
  font-size: 0.875rem;

  .name {
    flex: 0 0 auto;
    font-style: italic;
    font-weight: 500;
    color: ${(p) => p.theme.name};
  }

  .dash {
    flex: 0 0 auto;
    color: ${(p) => p.theme.muted};
  }

  .role {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-style: italic;
    color: ${(p) => p.theme.body};
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 0;
  top: -0.35rem;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(p) => p.theme.controlBorder};
  border-radius: 7px;
  background: ${(p) => p.theme.pillBg};
  color: ${(p) => p.theme.muted};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${(p) => p.theme.pillHover};
    color: ${(p) => p.theme.ink};
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.muted};
    outline-offset: 2px;
  }
`;

const Intro = styled.div`
  max-width: 36rem;
  margin: 0 auto;
  padding-top: 1.25rem;

  p {
    margin: 0;
    padding-top: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.68;
    color: ${(p) => p.theme.body};
  }
`;

const PillLink = styled.a`
  display: inline-block;
  cursor: pointer;
  font-style: italic;
  font-weight: 500;
  color: ${(p) => p.theme.pillText};
  background: ${(p) => p.theme.pillBg};
  padding: 0 0.25rem;
  margin: 0 0.02rem;
  border-radius: 4px;
  white-space: nowrap;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${(p) => p.theme.pillHover};
    color: ${(p) => p.theme.ink};
    transition-duration: 0s;
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.muted};
    outline-offset: 1px;
  }
`;

const Dots = styled.div`
  padding-top: 1.25rem;

  span {
    display: inline-block;
    padding: 0 0.5rem;
    border-radius: 6px;
    background: ${(p) => p.theme.pillBg};
    color: ${(p) => p.theme.muted};
    font-style: italic;
  }
`;

const Section = styled.section`
  max-width: 36rem;
  margin: 0 auto;
  padding-top: 3rem;
`;

const Stage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  background: ${(p) => p.theme.stageBg};
  border: 1px solid ${(p) => p.theme.line};
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  cursor: ${(p) => (p.$dragging ? 'grabbing' : 'grab')};
  isolation: isolate;

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.muted};
    outline-offset: 2px;
  }
`;

const Track = styled.div`
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  display: block;
`;

const Card = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  will-change: transform, opacity;
  border: 1px solid ${(p) => p.theme.cardBorder};
  border-radius: 10px;
  overflow: hidden;
  background: ${(p) => p.theme.cardBg};
  box-shadow: ${(p) => (p.$center ? p.theme.cardShadow : 'none')};
  color: inherit;
  text-align: left;
  display: flex;
  padding: 0;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.muted};
    outline-offset: 2px;
  }
`;

const CardBody = styled.span`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0.9rem;
  background:
    linear-gradient(180deg, ${(p) => p.theme.cardAlt}, ${(p) => p.theme.cardBg} 58%),
    ${(p) => p.theme.cardBg};

  .idx {
    font-family: ${(p) => p.theme.mono};
    font-size: 0.66rem;
    font-variant-numeric: tabular-nums;
    color: ${(p) => p.theme.faint};
  }

  .kind {
    align-self: flex-start;
    margin-top: 0.45rem;
    font-family: ${(p) => p.theme.mono};
    font-size: 0.62rem;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${(p) => p.theme.muted};
  }

  strong {
    margin-top: auto;
    font-size: clamp(1.02rem, 4vw, 1.24rem);
    line-height: 1.1;
    font-style: italic;
    font-weight: 500;
    color: ${(p) => p.theme.name};
  }

  p {
    display: -webkit-box;
    margin: 0.55rem 0 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    font-size: 0.75rem;
    line-height: 1.48;
    color: ${(p) => p.theme.body};
  }

  .meta {
    margin-top: 0.75rem;
    font-family: ${(p) => p.theme.mono};
    font-size: 0.66rem;
    font-variant-numeric: tabular-nums;
    color: ${(p) => p.theme.muted};
  }
`;

const Caption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
  padding: 1.15rem 0.5rem 0;
  min-height: 4.5rem;

  .ctitle {
    font-style: italic;
    font-size: 1.02rem;
    color: ${(p) => p.theme.name};
  }

  .csum {
    font-size: 0.82rem;
    line-height: 1.55;
    color: ${(p) => p.theme.body};
    max-width: 30rem;
  }

  a {
    display: inline-flex;
    align-items: center;
    font-size: 0.78rem;
    color: ${(p) => p.theme.pillText};
    text-decoration: underline;
    text-decoration-color: ${(p) => p.theme.underline};
    text-underline-offset: 3px;
    transition: text-decoration-color 0.2s ease, color 0.2s ease;

    &:hover {
      color: ${(p) => p.theme.ink};
      text-decoration-color: currentColor;
    }
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding-top: 1rem;

  @media (max-width: 380px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ControlGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

const IconButton = styled.button`
  width: 30px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(p) => p.theme.controlBorder};
  border-radius: 7px;
  background: ${(p) => p.theme.controlBg};
  color: ${(p) => p.theme.pillText};
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background 0.18s ease, color 0.18s ease, opacity 0.18s ease;

  &:hover:not(:disabled) {
    color: ${(p) => p.theme.ink};
    background: ${(p) => p.theme.pillHover};
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.muted};
    outline-offset: 2px;
  }
`;

const Counter = styled.span`
  font-family: ${(p) => p.theme.mono};
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  color: ${(p) => p.theme.muted};
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  color: ${(p) => p.theme.body};
  background: ${(p) => p.theme.pillBg};
  border: 1px solid ${(p) => p.theme.controlBorder};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 0.35rem;
    background: ${(p) => (p.$active ? '#22c55e' : p.theme.faint)};
  }
`;

const ArchiveSection = styled.section`
  max-width: 36rem;
  margin: 0 auto;
  padding-top: 3.75rem;
`;

const ArchiveHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.3rem;

  h2 {
    margin: 0;
    font-size: 0.875rem;
    font-style: italic;
    font-weight: 500;
    color: ${(p) => p.theme.name};
  }

  span {
    font-size: 0.8rem;
    color: ${(p) => p.theme.muted};
  }
`;

const ArchiveList = styled.div`
  border-top: 1px solid ${(p) => p.theme.line};
`;

const ArchiveRow = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 76px;
  gap: 1.5rem;
  align-items: baseline;
  padding: 0.72rem 0;
  border-bottom: 1px solid ${(p) => p.theme.line};
  font-size: 0.875rem;

  .year,
  .type {
    font-family: ${(p) => p.theme.mono};
    font-size: 0.7rem;
    font-variant-numeric: tabular-nums;
    color: ${(p) => p.theme.muted};
  }

  .type {
    text-align: right;
  }

  .entry {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    color: ${(p) => p.theme.name};
  }

  .entry > span,
  a {
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${(p) => p.theme.name};
    text-decoration: none;
    white-space: nowrap;
  }

  a:hover {
    color: ${(p) => p.theme.ink};
    text-decoration: underline;
    text-decoration-color: ${(p) => p.theme.underline};
    text-underline-offset: 3px;
  }

  small {
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${(p) => p.theme.body};
    font-size: 0.76rem;
    line-height: 1.45;
    white-space: nowrap;
  }

  @media (max-width: 520px) {
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 1rem;

    .type {
      display: none;
    }
  }
`;

const GradientFooter = styled.footer`
  position: relative;
  z-index: 1;
  min-height: 28rem;
  padding: 5rem 2rem 7rem;
  box-sizing: border-box;
  color: var(--footer-fg, ${(p) => p.theme.footerFg});
`;

const FooterInner = styled.div`
  width: 100%;
  max-width: 36rem;
  margin: 0 auto;
  text-align: center;
  mix-blend-mode: ${(p) => (p.$tone === 'light' ? 'color-burn' : 'color-dodge')};
  opacity: ${(p) => (p.$tone === 'light' ? 0.6 : 0.7)};

  p {
    margin: 0;
    padding-top: 0.65rem;
    font-size: 0.9rem;
    line-height: 1.75;
    color: var(--footer-fg, ${(p) => p.theme.footerFg});
  }

  .copy {
    padding-top: 2.8rem;
    font-style: italic;
    opacity: 0.68;
  }
`;

const FooterPill = styled.a`
  display: inline-block;
  padding: 0 0.3rem;
  margin: 0 0.02rem;
  border-radius: 4px;
  background: var(--footer-link-bg, rgba(255, 255, 255, 0.18));
  color: var(--footer-fg, ${(p) => p.theme.footerFg});
  font-style: italic;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--footer-link-hover-bg, ${(p) => p.theme.footerFg});
    color: var(--footer-link-hover-fg, ${(p) => p.theme.ink});
    transition-duration: 0s;
  }

  &:focus-visible {
    outline: 2px solid var(--footer-fg, ${(p) => p.theme.footerFg});
    outline-offset: 2px;
  }
`;
