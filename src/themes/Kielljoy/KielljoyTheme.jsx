import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, formatDate } from '../../utils/cvHelpers';

/**
 * KielljoyTheme — a CV-driven remake of kielljoy.neocities.org.
 *
 * The source is a stark, dark neocities landing page: a big lowercase handle
 * ("kielljoy|") set in a chunky, slightly glitchy PIXEL display font in bright
 * blue, trailed by a hard-blinking block cursor, above a tiny vertical nav where
 * every label is a different bright color (magenta "about", green "blog", blue
 * "etc"). The glyphs read as pixelated with a faint RGB-split / chromatic
 * aberration (a magenta shadow one way, a cyan shadow the other).
 *
 * This theme is DARK-NATIVE: the black + blue-pixel look is the default. A soft
 * light variant is offered via the toggle, but the star (and the screenshot) is
 * the black page. Below the hero we fill the page with the CV sections in a
 * readable mono face on black so the page isn't empty.
 */

// Per-item nav colors, matching the source's bright accents:
// about → magenta, blog → green, etc → blue, then more for extra CV sections.
const NAV_COLORS = ['#ff2d95', '#22e06a', '#4060ff', '#00e1ff', '#ffcf33', '#ff6a3d'];

// --- Palettes -------------------------------------------------------------

// Black + blue-pixel look — the default, dark-native palette.
const darkTheme = {
  bg: '#050505',
  name: '#3b5bff', // bright blue wordmark
  heading: '#4060ff', // section labels / accent blue
  text: '#c9c9d2', // light-grey body
  muted: '#8f8f9c',
  faint: '#5f5f6b',
  link: '#5b8cff',
  linkHover: '#9cbcff',
  cursor: '#4060ff', // blue block cursor
  rule: '#1b1b22',
  glitchA: '#ff2d95', // magenta RGB-split
  glitchB: '#00e1ff', // cyan RGB-split
};

// Optional light variant — keeps the pixel type and blue name, on paper-white.
const lightTheme = {
  bg: '#f4f4f6',
  name: '#2233dd',
  heading: '#2233dd',
  text: '#1c1c24',
  muted: '#55555f',
  faint: '#8a8a92',
  link: '#1b3fd6',
  linkHover: '#4060ff',
  cursor: '#2233dd',
  rule: '#dcdce2',
  glitchA: '#ff2d95',
  glitchB: '#00b4d8',
};

// 'Departure Mono' is the pixel/blocky display face (shipped via @font-face);
// use it for the NAME and NAV. Body text uses a clean mono for readability.
const PIXEL = "'Departure Mono', 'Geist Mono', 'JetBrains Mono', monospace";
const MONO = "'Geist Mono', 'JetBrains Mono', 'Departure Mono', monospace";

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.bg}; }
`;

// Chromatic-aberration jitter: the wordmark's magenta/cyan shadows drift a
// pixel or two on a short, stepped loop for a subtle digital-glitch feel.
const glitch = keyframes`
  0%   { text-shadow: -2px 0 var(--gA), 2px 0 var(--gB); }
  20%  { text-shadow: -3px 0 var(--gA), 2px 1px var(--gB); }
  40%  { text-shadow: -1px 1px var(--gA), 3px 0 var(--gB); }
  60%  { text-shadow: -2px -1px var(--gA), 2px 1px var(--gB); }
  80%  { text-shadow: -3px 1px var(--gA), 1px -1px var(--gB); }
  100% { text-shadow: -2px 0 var(--gA), 2px 0 var(--gB); }
`;

function articleFor(word = '') {
  return /^[aeiou]/i.test(String(word).trim()) ? 'an' : 'a';
}

function displayHost(url = '') {
  return String(url).replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

export function KielljoyTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  // Dark-native: the black pixel look is the default (darkMode=false); the
  // light variant is the alternate. darkMode is read directly, per contract.
  const theme = darkMode ? lightTheme : darkTheme;
  const isDark = !darkMode;

  // Hard-blinking cursor bar. A JS interval (not a CSS animation) so we can be
  // certain it's torn down on unmount, per the theme contract.
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  const name = cv.name || 'your name';
  const handle = name.toLowerCase();
  const firstName = name.split(/\s+/)[0] || name;

  const experience = useMemo(() => cv.experience || [], [cv.experience]);
  const projects = useMemo(() => cv.projects || [], [cv.projects]);
  const education = useMemo(() => cv.education || [], [cv.education]);
  const awards = useMemo(() => cv.awards || [], [cv.awards]);

  const email = cv.email || null;
  const website = cv.website || null;
  const location = cv.location || null;

  const role = cv.currentJobTitle || experience[0]?.title || null;
  const company =
    experience.find((e) => e.isCurrent)?.company || experience[0]?.company || null;

  // cv.about is empty for this dataset — synthesize a short, honest blurb from
  // the structured role/field/location facts rather than inventing specifics.
  const aboutParagraphs = useMemo(() => {
    const existing = String(cv.about || '').trim();
    if (existing) {
      return existing.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    }

    let intro = `hi, i'm ${firstName}.`;
    if (role) {
      intro += ` i'm ${articleFor(role)} ${role}`;
      if (company) intro += ` at ${company}`;
      if (location) intro += `, based in ${location}`;
      intro += '.';
    } else if (location) {
      intro += ` based in ${location}.`;
    }

    return [
      intro,
      "this is a small, dark corner of the internet — somewhere to keep my work, projects, and a few notes on what i'm building.",
    ];
  }, [cv.about, firstName, role, company, location]);

  const socialList = useMemo(() => {
    const raw = cv.social || [];
    return raw
      .map((s) => ({ label: String(s.network || '').trim(), url: s.url }))
      .filter((s) => s.label && s.url);
  }, [cv.social]);

  const hasElsewhere = Boolean(email || website || socialList.length);

  // Sections that actually have content — drives both the nav and the rendered
  // blocks below so they never drift out of sync.
  const navSections = useMemo(() => {
    const list = [{ id: 'about', label: 'about' }];
    if (experience.length) list.push({ id: 'experience', label: 'blog' });
    if (projects.length) list.push({ id: 'projects', label: 'projects' });
    if (education.length) list.push({ id: 'education', label: 'edu' });
    if (awards.length) list.push({ id: 'awards', label: 'awards' });
    if (hasElsewhere) list.push({ id: 'elsewhere', label: 'etc' });
    return list;
  }, [experience.length, projects.length, education.length, awards.length, hasElsewhere]);

  const sectionRefs = useRef({});
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const setRef = (id) => (el) => {
    sectionRefs.current[id] = el;
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Column>
          <HeaderRow>
            <Title $animate={isDark} aria-label={handle}>
              {handle}
              <Cursor $on={cursorOn} aria-hidden="true">|</Cursor>
            </Title>
            <Toggle
              type="button"
              onClick={() => onDarkModeChange?.(!darkMode)}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? 'light' : 'dark'}
            </Toggle>
          </HeaderRow>

          <Nav>
            {navSections.map((s, i) => (
              <NavItem key={s.id}>
                <NavLink
                  href={`#${s.id}`}
                  onClick={scrollTo(s.id)}
                  style={{ color: NAV_COLORS[i % NAV_COLORS.length] }}
                >
                  {s.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>

          <Section id="about" ref={setRef('about')}>
            <SectionLabel>about</SectionLabel>
            {aboutParagraphs.map((para, i) => (
              <Paragraph key={i}>{para}</Paragraph>
            ))}
          </Section>

          {experience.length > 0 && (
            <Section id="experience" ref={setRef('experience')}>
              <SectionLabel>blog</SectionLabel>
              {experience.map((exp, i) => (
                <Entry key={`exp-${i}`}>
                  <EntryTitle>{exp.title}</EntryTitle>
                  {exp.company && <EntryMeta>{exp.company}</EntryMeta>}
                  {(exp.startDate || exp.endDate) && (
                    <EntryDate>
                      {formatRange(exp.startDate, exp.endDate, {
                        month: 'short',
                        presentLabel: 'present',
                        ongoingWhenNoEnd: true,
                      })}
                    </EntryDate>
                  )}
                  {exp.highlights?.length > 0 && (
                    <Highlights>
                      {exp.highlights.map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </Highlights>
                  )}
                </Entry>
              ))}
            </Section>
          )}

          {projects.length > 0 && (
            <Section id="projects" ref={setRef('projects')}>
              <SectionLabel>projects</SectionLabel>
              {projects.map((proj, i) => (
                <Entry key={`proj-${i}`}>
                  <EntryTitle>
                    {proj.url ? (
                      <InlineLink href={proj.url} target="_blank" rel="noopener noreferrer">
                        {proj.name}
                      </InlineLink>
                    ) : (
                      proj.name
                    )}
                  </EntryTitle>
                  {proj.date && (
                    <EntryDate>{formatDate(proj.date, { month: 'short' })}</EntryDate>
                  )}
                  {proj.summary && <Summary>{proj.summary}</Summary>}
                </Entry>
              ))}
            </Section>
          )}

          {education.length > 0 && (
            <Section id="education" ref={setRef('education')}>
              <SectionLabel>edu</SectionLabel>
              {education.map((edu, i) => (
                <Entry key={`edu-${i}`}>
                  <EntryTitle>
                    {edu.degree || edu.studyType || edu.area || 'Studies'}
                    {edu.degree && edu.area ? ` in ${edu.area}` : ''}
                  </EntryTitle>
                  {(edu.institution || edu.school) && (
                    <EntryMeta>{edu.institution || edu.school}</EntryMeta>
                  )}
                  {(edu.start_date || edu.end_date) && (
                    <EntryDate>
                      {formatRange(edu.start_date, edu.end_date, {
                        month: 'short',
                        presentLabel: 'present',
                      })}
                    </EntryDate>
                  )}
                </Entry>
              ))}
            </Section>
          )}

          {awards.length > 0 && (
            <Section id="awards" ref={setRef('awards')}>
              <SectionLabel>awards</SectionLabel>
              {awards.map((award, i) => (
                <Entry key={`award-${i}`}>
                  <EntryTitle>{award.name || award.title}</EntryTitle>
                  {(award.awarder || award.issuer) && (
                    <EntryMeta>{award.awarder || award.issuer}</EntryMeta>
                  )}
                  {award.date && (
                    <EntryDate>{formatDate(award.date, { month: 'short' })}</EntryDate>
                  )}
                  {award.summary && <Summary>{award.summary}</Summary>}
                </Entry>
              ))}
            </Section>
          )}

          {hasElsewhere && (
            <Section id="elsewhere" ref={setRef('elsewhere')}>
              <SectionLabel>etc</SectionLabel>
              <Elsewhere>
                {[
                  email && { label: email, href: `mailto:${email}`, external: false },
                  website && { label: displayHost(website), href: website, external: true },
                  ...socialList.map((s) => ({
                    label: s.label.toLowerCase(),
                    href: s.url,
                    external: true,
                  })),
                ]
                  .filter(Boolean)
                  .map((item, i, arr) => (
                    <React.Fragment key={item.href}>
                      <InlineLink
                        href={item.href}
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.label}
                      </InlineLink>
                      {i < arr.length - 1 ? <Sep aria-hidden="true"> · </Sep> : null}
                    </React.Fragment>
                  ))}
              </Elsewhere>
            </Section>
          )}

          <Footer>a dark page on the internet — {new Date().getFullYear()}</Footer>
        </Column>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  font-family: ${MONO};
  padding: clamp(2rem, 6vh, 4.5rem) clamp(1.25rem, 5vw, 3.5rem) 5rem;
  transition: background-color 0.25s ease, color 0.25s ease;

  @media (max-width: 390px) {
    padding: 2rem 1.1rem 4rem;
  }
`;

const Column = styled.div`
  max-width: 44rem;
  width: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

// The glitchy blue pixel wordmark. A chromatic-aberration split (magenta one
// way, cyan the other) drifts a pixel or two on a short stepped loop for a
// subtle digital-glitch feel. Motion is paused for reduced-motion users, which
// leaves the static split shadow in place.
const Title = styled.h1`
  --gA: ${(props) => props.theme.glitchA};
  --gB: ${(props) => props.theme.glitchB};
  margin: 0;
  font-family: ${PIXEL};
  font-weight: 400;
  color: ${(props) => props.theme.name};
  font-size: clamp(2.4rem, 9vw, 4rem);
  line-height: 1.05;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  word-break: break-word;
  text-shadow: -2px 0 var(--gA), 2px 0 var(--gB);
  animation: ${glitch} 2.8s steps(3, jump-none) infinite;
  animation-play-state: ${(props) => (props.$animate ? 'running' : 'paused')};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 390px) {
    font-size: 2.35rem;
  }
`;

const Cursor = styled.span`
  font-family: ${PIXEL};
  font-weight: 400;
  color: ${(props) => props.theme.cursor};
  opacity: ${(props) => (props.$on ? 1 : 0)};
  text-shadow: none;
  margin-left: 0.04em;
`;

const Toggle = styled.button`
  flex: 0 0 auto;
  margin-top: 0.75rem;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: ${PIXEL};
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${(props) => props.theme.link};

  &:hover {
    color: ${(props) => props.theme.linkHover};
    text-shadow: 0 0 8px ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 3px;
  }
`;

const Nav = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
`;

const NavItem = styled.li`
  margin: 0.1rem 0;
  line-height: 1.4;
`;

// Underline-less pixel-font nav links, each a bright accent color, glowing
// slightly on hover — straight out of the source's neocities palette.
const NavLink = styled.a`
  font-family: ${PIXEL};
  font-size: clamp(1.4rem, 4vw, 1.9rem);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-decoration: none;
  transition: text-shadow 0.15s ease, filter 0.15s ease;

  &:hover,
  &:focus-visible {
    text-shadow: 0 0 10px currentColor;
    filter: brightness(1.2);
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }
`;

const Section = styled.section`
  margin-top: 3rem;
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 1rem);
`;

const SectionLabel = styled.h2`
  margin: 0 0 1rem;
  font-family: ${PIXEL};
  font-weight: 400;
  font-size: 1.35rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${(props) => props.theme.heading};
  border-bottom: 1px solid ${(props) => props.theme.rule};
  padding-bottom: 0.4rem;
  text-shadow: -1px 0 ${(props) => props.theme.glitchA}, 1px 0 ${(props) => props.theme.glitchB};
`;

const Paragraph = styled.p`
  margin: 0 0 0.9rem;
  font-family: ${MONO};
  font-size: 0.98rem;
  line-height: 1.7;
  color: ${(props) => props.theme.text};
  max-width: 40rem;
`;

const Entry = styled.div`
  margin-bottom: 1.6rem;
`;

const EntryTitle = styled.div`
  font-family: ${MONO};
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => props.theme.heading};
`;

const EntryMeta = styled.div`
  font-family: ${MONO};
  font-size: 0.92rem;
  color: ${(props) => props.theme.muted};
`;

const EntryDate = styled.div`
  font-family: ${MONO};
  font-size: 0.82rem;
  color: ${(props) => props.theme.faint};
  margin-top: 0.1rem;
`;

const Highlights = styled.ul`
  list-style: none;
  margin: 0.5rem 0 0;
  padding-left: 1.1em;

  li {
    position: relative;
    font-family: ${MONO};
    font-size: 0.92rem;
    line-height: 1.6;
    color: ${(props) => props.theme.text};
    margin: 0.2rem 0;
  }

  li::before {
    content: '>';
    position: absolute;
    left: -1.1em;
    color: ${(props) => props.theme.heading};
  }
`;

const Summary = styled.p`
  margin: 0.35rem 0 0;
  font-family: ${MONO};
  font-size: 0.94rem;
  line-height: 1.65;
  color: ${(props) => props.theme.text};
  max-width: 40rem;
`;

const InlineLink = styled.a`
  color: ${(props) => props.theme.link};
  text-decoration: none;
  border-bottom: 1px solid ${(props) => props.theme.rule};
  word-break: break-word;
  transition: color 0.15s ease, text-shadow 0.15s ease;

  &:hover {
    color: ${(props) => props.theme.linkHover};
    text-shadow: 0 0 8px ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 3px;
  }
`;

const Elsewhere = styled.div`
  font-family: ${MONO};
  font-size: 0.98rem;
  line-height: 1.9;
`;

const Sep = styled.span`
  color: ${(props) => props.theme.faint};
`;

const Footer = styled.footer`
  margin-top: 3.5rem;
  font-family: ${MONO};
  font-size: 0.8rem;
  color: ${(props) => props.theme.faint};
`;
