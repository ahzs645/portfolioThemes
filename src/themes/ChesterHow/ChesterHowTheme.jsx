import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatMonthYear } from '../../utils/cvHelpers';

/* ── constants ───────────────────────────────────────────────── */

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'writing', label: 'Reading' },
  { id: 'hobbies', label: 'Extras' },
];

const TAG_COLORS = [
  { bg: 'rgba(251, 146, 60, 0.4)', text: 'rgb(124 45 18)' },   // orange
  { bg: 'rgba(251, 191, 36, 0.4)', text: 'rgb(120 53 15)' },   // amber
  { bg: 'rgba(163, 230, 53, 0.4)', text: 'rgb(54 83 20)' },    // lime
  { bg: 'rgba(74, 222, 128, 0.4)', text: 'rgb(20 83 45)' },    // green
  { bg: 'rgba(56, 189, 248, 0.4)', text: 'rgb(12 74 110)' },   // sky
  { bg: 'rgba(129, 140, 248, 0.4)', text: 'rgb(49 46 129)' },  // indigo
  { bg: 'rgba(192, 132, 252, 0.4)', text: 'rgb(88 28 135)' },  // purple
  { bg: 'rgba(251, 113, 133, 0.4)', text: 'rgb(136 19 55)' },  // rose
];

const FRAUNCES_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,200;9..144,300;9..144,400;9..144,500&family=Inter:wght@300;400;500;600&display=swap';

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden>
    <path
      fillRule="evenodd"
      d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
      clipRule="evenodd"
    />
  </svg>
);

/* ── helpers ─────────────────────────────────────────────────── */

function pickTagColor(key) {
  let h = 0;
  const str = String(key || '');
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return TAG_COLORS[h % TAG_COLORS.length];
}

function toDateString(v) {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function fmtDate(v) {
  const s = toDateString(v);
  return s ? formatMonthYear(s) : '';
}

function formatRange(start, end, isCurrent) {
  const s = fmtDate(start);
  const e = isCurrent ? 'Present' : fmtDate(end);
  if (s && e) return `${s} — ${e}`;
  return s || e || '';
}

/* ── animations ──────────────────────────────────────────────── */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── font loader (appended to <head> to avoid CSSOM @import warning) ─ */

function useChesterFonts() {
  useEffect(() => {
    const id = 'chester-how-fonts';
    if (document.getElementById(id)) return undefined;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = FRAUNCES_URL;
    document.head.appendChild(link);
    return undefined;
  }, []);
}

/* ── styled shell ────────────────────────────────────────────── */

const Main = styled.main`
  --ch-text-900: rgb(23 23 23);
  --ch-text-700: rgb(64 64 64);
  --ch-text-500: rgb(115 115 115);
  --ch-text-400: rgb(163 163 163);
  --ch-bg: #ffffff;
  --ch-bg-50: rgb(250 250 250);
  --ch-bg-100: rgb(245 245 245);
  --ch-bg-200: rgb(229 229 229);
  --ch-border: rgb(229 229 229);
  --ch-serif: 'Fraunces', ui-serif, Georgia, 'Times New Roman', serif;
  --ch-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  min-height: 100vh;
  width: 100%;
  background: var(--ch-bg);
  color: var(--ch-text-900);
  font-family: var(--ch-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0 2rem;

  *, *::before, *::after { box-sizing: border-box; }
`;

const Container = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 640px;

  @media (min-width: 768px) { max-width: 768px; }
  @media (min-width: 1024px) { max-width: 1024px; }
  @media (min-width: 1280px) { max-width: 1536px; }
`;

/* ── nav ─────────────────────────────────────────────────────── */

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.25rem;
  pointer-events: none;

  @media (min-width: 768px) { justify-content: space-between; }
`;

const NavPill = styled.div`
  position: relative;
  display: flex;
  pointer-events: auto;
  background: hsla(0, 0%, 100%, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--ch-border);
  border-radius: 0.5rem;
  padding: 0.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  animation: ${fadeUp} 0.6s ease-out both;
`;

const NavSlider = styled.div`
  position: absolute;
  left: ${(p) => p.$left}px;
  width: ${(p) => p.$width}px;
  top: 0.25rem;
  height: 1.75rem;
  background: var(--ch-bg-200);
  border-radius: 0.25rem;
  z-index: 0;
  transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

const NavLink = styled.button`
  position: relative;
  z-index: 1;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: ${(p) => (p.$active ? 'var(--ch-text-900)' : 'var(--ch-text-400)')};
  font-family: inherit;
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover, &:focus { color: var(--ch-text-900); }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgb(191 219 254);
  }
`;

const NavSide = styled.div`
  display: none;
  pointer-events: auto;
  animation: ${fadeUp} 0.6s 0.1s ease-out both;

  @media (min-width: 768px) { display: flex; }

  a {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    letter-spacing: -0.025em;
    color: var(--ch-text-400);
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-color: transparent;
    text-underline-offset: 4px;
    transition: color 0.15s, text-decoration-color 0.15s;

    &:hover {
      color: var(--ch-text-900);
      text-decoration-color: currentColor;
    }
  }
`;

/* ── hero ────────────────────────────────────────────────────── */

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0.5rem 2rem;

  @media (min-width: 768px) { gap: 2rem; }
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-family: var(--ch-serif);
  font-size: 3.75rem;
  line-height: 1;
  font-weight: 200;
  letter-spacing: -0.03em;
  color: var(--ch-text-900);
  font-variation-settings: "opsz" 72, "SOFT" 50;

  @media (min-width: 768px) { font-size: 6rem; }

  span.dot { color: var(--ch-text-400); }
`;

const HeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: var(--ch-text-400);

  a {
    color: inherit;
    text-decoration-line: underline;
    text-decoration-color: currentColor;
    text-decoration-style: dotted;
    text-underline-offset: 4px;
    transition: color 0.15s;
    &:hover { color: var(--ch-text-900); }
  }
`;

const HeroAbout = styled.p`
  max-width: 65ch;
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.625;
  color: var(--ch-text-700);
  font-weight: 300;
  font-size: 1.05rem;
`;

/* ── section heading ─────────────────────────────────────────── */

const SectionHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2.5rem 0.5rem 1rem;

  h2 {
    margin: 0;
    font-family: var(--ch-serif);
    font-size: 2.25rem;
    line-height: 1;
    font-weight: 200;
    letter-spacing: -0.03em;
    color: var(--ch-text-900);
    font-variation-settings: "opsz" 72, "SOFT" 50;

    @media (min-width: 768px) { font-size: 3rem; }
    @media (min-width: 1024px) { font-size: 3.75rem; }

    span.dot { color: var(--ch-text-400); }
  }

  p {
    margin: 0;
    max-width: 65ch;
    letter-spacing: -0.025em;
    color: var(--ch-text-400);
    font-weight: 300;
  }
`;

/* ── grid ────────────────────────────────────────────────────── */

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-flow: row dense;
  }
  @media (min-width: 1024px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (min-width: 1280px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
`;

const CardSlot = styled.div`
  padding: 0 0.25rem 0.5rem;
  aspect-ratio: ${(p) => (p.$large ? '2 / 1' : '1 / 1')};

  @media (min-width: 640px) {
    grid-column: ${(p) => (p.$large ? 'span 2 / span 2' : 'auto')};
  }
`;

const Card = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
  background: var(--ch-bg-50);
  transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeUp} 0.5s ease-out both;
  animation-delay: ${(p) => p.$delay || '0s'};

  &:hover, &:focus-within { background: var(--ch-bg-100); }
`;

const CardTopBar = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.5rem 0 1rem;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: var(--ch-text-400);

  span {
    padding: 0.375rem 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 0.5rem;
  }
`;

const ArrowButton = styled.a`
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
  border-radius: 9999px;
  color: var(--ch-text-400);
  transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;

  ${Card}:hover &, ${Card}:focus-within & {
    background: #fff;
    color: var(--ch-text-900);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 0 0 rgba(0, 0, 0, 0.1);
  }
`;

const CardBody = styled.div`
  position: absolute;
  inset: 0;
  padding: 2.25rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-family: var(--ch-serif);
  font-size: ${(p) => (p.$large ? '2rem' : '1.5rem')};
  line-height: 1.1;
  font-weight: 300;
  letter-spacing: -0.03em;
  color: var(--ch-text-900);
  font-variation-settings: "opsz" 72, "SOFT" 50;
`;

const CardSubheading = styled.div`
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: var(--ch-text-500);
  font-weight: 400;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--ch-text-700);
  font-weight: 300;
  display: -webkit-box;
  -webkit-line-clamp: ${(p) => (p.$large ? 4 : 3)};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  letter-spacing: -0.01em;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
`;

/* ── skills ──────────────────────────────────────────────────── */

const SkillsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 0.5rem 2rem;
`;

const SkillChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  letter-spacing: -0.01em;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
`;

/* ── footer ──────────────────────────────────────────────────── */

const Footer = styled.footer`
  display: flex;
  justify-content: center;
  padding: 9rem 0 5rem;

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    letter-spacing: -0.025em;
    color: var(--ch-text-400);
  }

  .leaf {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #a3e635, #4d7c0f);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  }
`;

/* ── main component ──────────────────────────────────────────── */

export function ChesterHowTheme() {
  useChesterFonts();
  const cv = useCV();
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const navRefs = React.useRef({});
  const [slider, setSlider] = useState({ left: 4, width: 0 });

  React.useLayoutEffect(() => {
    const el = navRefs.current[activeSection];
    if (el) {
      setSlider({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeSection]);

  const projectCards = useMemo(() => {
    if (!cv) return [];
    return (cv.projects || []).map((p, i) => ({
      key: `proj-${i}`,
      kind: 'project',
      large: i === 0 || i % 5 === 0,
      category: 'Projects',
      name: p.name,
      description: p.description || (p.highlights && p.highlights[0]) || '',
      url: p.url,
      date: fmtDate(p.endDate || p.startDate),
    }));
  }, [cv]);

  const experienceCards = useMemo(() => {
    if (!cv) return [];
    return (cv.experience || []).map((e, i) => ({
      key: `exp-${i}`,
      kind: 'experience',
      large: i === 0,
      category: 'Experience',
      name: e.title,
      subheading: e.company,
      description: (e.highlights && e.highlights[0]) || '',
      tags: [
        e.location && { label: e.location, color: pickTagColor(e.location) },
        {
          label: formatRange(e.startDate, e.endDate, e.isCurrent),
          color: pickTagColor(e.company || 'exp'),
        },
      ].filter((t) => t && t.label),
      url: e.url,
    }));
  }, [cv]);

  const educationCards = useMemo(() => {
    if (!cv) return [];
    return (cv.education || []).map((ed, i) => ({
      key: `edu-${i}`,
      kind: 'education',
      large: false,
      category: 'Education',
      name: ed.school,
      subheading: ed.degree,
      description: (ed.highlights && ed.highlights[0]) || '',
      tags: [
        {
          label: formatRange(ed.startDate, ed.endDate),
          color: pickTagColor(ed.school || 'edu'),
        },
      ].filter((t) => t.label),
    }));
  }, [cv]);

  const extraCards = useMemo(() => {
    if (!cv) return [];
    const list = [];
    (cv.awards || []).forEach((a, i) =>
      list.push({
        key: `award-${i}`,
        kind: 'award',
        large: false,
        category: 'Awards',
        name: a.title,
        subheading: a.issuer,
        description: a.description || '',
        tags: a.date
          ? [{ label: fmtDate(a.date) || toDateString(a.date), color: pickTagColor('award') }]
          : [],
      })
    );
    (cv.certifications || []).forEach((c, i) =>
      list.push({
        key: `cert-${i}`,
        kind: 'cert',
        large: false,
        category: 'Certifications',
        name: c.name || c.title,
        subheading: c.issuer,
        description: c.description || '',
        tags: c.date
          ? [{ label: fmtDate(c.date) || toDateString(c.date), color: pickTagColor('cert') }]
          : [],
      })
    );
    (cv.publications || []).forEach((pub, i) =>
      list.push({
        key: `pub-${i}`,
        kind: 'pub',
        large: false,
        category: 'Publications',
        name: pub.title,
        subheading: pub.publisher || pub.venue,
        description: pub.description || '',
        url: pub.url,
        tags: pub.date
          ? [{ label: fmtDate(pub.date) || toDateString(pub.date), color: pickTagColor('pub') }]
          : [],
      })
    );
    (cv.languages || []).forEach((lang, i) =>
      list.push({
        key: `lang-${i}`,
        kind: 'lang',
        large: false,
        category: 'Languages',
        name: typeof lang === 'string' ? lang : lang.name,
        tags: [{ label: 'Language', color: pickTagColor(`lang-${i}`) }],
      })
    );
    return list;
  }, [cv]);

  const readingCards = useMemo(() => {
    if (!cv) return [];
    const list = [];
    (cv.publications || []).forEach((p, i) =>
      list.push({
        key: `rp-${i}`,
        kind: 'pub',
        large: i === 0,
        category: 'Publications',
        name: p.title,
        subheading: p.publisher || p.venue,
        description: p.description || '',
        url: p.url,
      })
    );
    (cv.presentations || []).forEach((p, i) =>
      list.push({
        key: `pres-${i}`,
        kind: 'pres',
        large: false,
        category: 'Presentations',
        name: p.title,
        subheading: p.venue,
        description: p.description || '',
      })
    );
    return list;
  }, [cv]);

  const currentCards = useMemo(() => {
    switch (activeSection) {
      case 'projects':
        return projectCards;
      case 'experience':
        return experienceCards.concat(educationCards);
      case 'writing':
        return readingCards;
      case 'hobbies':
        return extraCards;
      case 'about':
      default:
        return []
          .concat(projectCards.slice(0, 4))
          .concat(experienceCards.slice(0, 3));
    }
  }, [activeSection, projectCards, experienceCards, educationCards, readingCards, extraCards]);

  if (!cv) return null;

  const name = cv.name || 'Your Name';
  const firstName = name.split(' ')[0] || name;
  const about = cv.about;
  const social = cv.socialLinks || {};
  const skills = cv.skills || [];
  const activeLabel = SECTIONS.find((s) => s.id === activeSection)?.label.toLowerCase() || 'work';

  const sectionSubtitle = {
    about: `A quiet corner of the internet for ${name}. A digital garden, grown over time.`,
    projects: "Things I've built — most, if not all, for the joy of it.",
    experience: 'Places I have worked, studied, and learned.',
    writing: 'Publications, talks, and things I have written down.',
    hobbies: 'Awards, certifications, languages — the rest of the garden.',
  }[activeSection];

  return (
    <>
      <Main>
        <Container>
          <Nav aria-label="Primary">
            <NavPill>
              <NavSlider $left={slider.left} $width={slider.width} />
              {SECTIONS.map((s) => (
                <NavLink
                  key={s.id}
                  ref={(el) => {
                    navRefs.current[s.id] = el;
                  }}
                  $active={activeSection === s.id}
                  onClick={() => setActiveSection(s.id)}
                  type="button"
                >
                  {s.id === 'about' ? firstName : s.label}
                </NavLink>
              ))}
            </NavPill>
            <NavSide>
              {social.github && (
                <a href={social.github} target="_blank" rel="noreferrer">GitHub</a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              )}
              {cv.email && <a href={`mailto:${cv.email}`}>Email</a>}
            </NavSide>
          </Nav>

          {activeSection === 'about' ? (
            <Hero>
              <HeroTitle>
                {firstName.toLowerCase()}
                <span className="dot">.</span>
              </HeroTitle>
              <HeroAbout>
                {about ||
                  `Welcome to my little corner of the internet, a digital garden that grows over time.`}
              </HeroAbout>
              <HeroMeta>
                {cv.currentTitle && <span>{cv.currentTitle}</span>}
                {cv.location && <span>{cv.location}</span>}
                {cv.website && (
                  <a href={cv.website} target="_blank" rel="noreferrer">
                    {cv.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </HeroMeta>
            </Hero>
          ) : (
            <SectionHeading>
              <h2>
                {activeLabel}
                <span className="dot">.</span>
              </h2>
              {sectionSubtitle && <p>{sectionSubtitle}</p>}
            </SectionHeading>
          )}

          {activeSection === 'about' && skills.length > 0 && (
            <SkillsWrap>
              {skills.slice(0, 30).map((skill, i) => {
                const c = pickTagColor(skill);
                return (
                  <SkillChip key={`${skill}-${i}`} $bg={c.bg} $color={c.text}>
                    {skill}
                  </SkillChip>
                );
              })}
            </SkillsWrap>
          )}

          <Grid>
            {currentCards.map((card, i) => (
              <CardSlot key={card.key} $large={card.large}>
                <Card $delay={`${Math.min(i * 0.04, 0.6)}s`}>
                  <CardTopBar>
                    <span>
                      {card.category}
                      {card.name ? ` · ${card.name}` : ''}
                    </span>
                    {card.url ? (
                      <ArrowButton href={card.url} target="_blank" rel="noreferrer" aria-label={`Open ${card.name}`}>
                        <ArrowIcon />
                      </ArrowButton>
                    ) : (
                      <ArrowButton as="span" aria-hidden>
                        <ArrowIcon />
                      </ArrowButton>
                    )}
                  </CardTopBar>
                  <CardBody>
                    {card.subheading && <CardSubheading>{card.subheading}</CardSubheading>}
                    {card.name && <CardTitle $large={card.large}>{card.name}</CardTitle>}
                    {card.description && (
                      <CardDescription $large={card.large}>{card.description}</CardDescription>
                    )}
                    {card.tags && card.tags.length > 0 && (
                      <TagRow>
                        {card.tags.map((t, ti) => (
                          <Tag key={ti} $bg={t.color.bg} $color={t.color.text}>
                            {t.label}
                          </Tag>
                        ))}
                      </TagRow>
                    )}
                  </CardBody>
                </Card>
              </CardSlot>
            ))}
          </Grid>

          <Footer>
            <div>
              <div className="leaf" aria-hidden />
              <span>Planted by {firstName}</span>
            </div>
          </Footer>
        </Container>
      </Main>
    </>
  );
}
