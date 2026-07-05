import React, { useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDate, isPresent, getInitials } from '../../utils/cvHelpers';
import { withBase } from '../../utils/assetPath';

/**
 * KieranComputerTheme — a CV-driven remake of www.kieran.computer.
 *
 * The source is a very quiet single-column page: a small square portrait
 * pinned top-left, a bold serif name, a one-line "I'm a <role> based in
 * <location>." intro, a "Some things I've built:" list bulleted with ▸
 * arrows (each "<Title> (<years>)"), a closing "I enjoy ..." line, then a
 * compact links row where external links wear a small ↗. We rebuild that
 * voice from this app's CV data rather than hardcoding the original copy.
 *
 * The live site is a Tailwind/Next.js black page (bg-black / text-gray-300),
 * while the reference capture shows the unstyled Times-serif fallback — so we
 * treat light mode as the refined serif look and dark mode as the black look.
 */

const lightTheme = {
  background: '#ffffff',
  ink: '#141414',
  body: '#2c2c2c',
  muted: '#6f6f6f',
  accent: '#1e46d2',
  accentHover: '#132f9c',
  arrow: '#141414',
  placeholderBg: '#e4e4e4',
  placeholderInk: '#9a9a9a',
  placeholderBorder: '#d2d2d2',
};

const darkTheme = {
  background: '#0b0b0c',
  ink: '#f4f4f5',
  body: '#d1d3d8',
  muted: '#8a8d94',
  accent: '#a9bcff',
  accentHover: '#ffffff',
  arrow: '#f4f4f5',
  placeholderBg: '#1c1c1f',
  placeholderInk: '#5c5f66',
  placeholderBorder: '#2a2a2e',
};

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.background}; }
`;

// The live site enters with tailwind's animate-in fade/slide; we mirror that
// with a gentle staggered fade-up on load, plus a blinking caret after the
// name (the source ships a caret-blink keyframe).
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
`;

const caretBlink = keyframes`
  0%, 45% { opacity: 1; }
  55%, 100% { opacity: 0; }
`;

// The real kieran.computer is a clean sans-serif black card, not serif.
const SERIF_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// A tiny outbound arrow, matching the source's inline ↗ glyph.
function ExternalArrow() {
  return (
    <Arrow
      width="9"
      height="9"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 7L7 1M7 1H2M7 1V6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Arrow>
  );
}

function aOrAn(word = '') {
  return /^[aeiou]/i.test(String(word).trim()) ? 'an' : 'a';
}

function eduIsOngoing(entry) {
  const end = entry?.end_date;
  if (!end) return true;
  if (isPresent(end)) return true;
  const year = parseInt(String(end).slice(0, 4), 10);
  return Number.isFinite(year) ? year >= new Date().getFullYear() : false;
}

// "Focus on air quality and environmental health" -> that trailing phrase.
function deriveFocus(cv) {
  for (const entry of cv.education || []) {
    for (const highlight of entry.highlights || []) {
      const match = String(highlight).match(/focus(?:ing)?\s+on\s+(.+)/i);
      if (match) return match[1].replace(/[.;]+$/, '').trim().toLowerCase();
    }
  }
  return '';
}

// A short, recognizable set of technical tools pulled from the skills line.
function deriveTools(cv) {
  const entry = (cv.certificationsSkills || []).find((s) =>
    /skill/i.test(String(s?.label || '')),
  );
  if (!entry?.details) return [];
  const parts = String(entry.details)
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const preferred = ['power bi', 'gis', 'r studio', 'spss', 'python', 'adobe'];
  return parts
    .filter((p) => preferred.some((pref) => p.toLowerCase().includes(pref)))
    .slice(0, 3);
}

export function KieranComputerTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const location = cv.location || null;
  const email = cv.email || null;
  const website = cv.website || null;
  const avatar = cv.avatar || null;
  const initials = getInitials(name, 2, '•');

  // One-line intro (cv.about is intentionally empty): role + field + location.
  const intro = useMemo(() => {
    const phd = (cv.education || []).find(
      (e) => /ph\.?\s*d/i.test(String(e?.degree || '')) && eduIsOngoing(e),
    );
    const role =
      cv.headline ||
      cv.label ||
      cv.tagline ||
      (phd ? 'PhD researcher' : cv.currentJobTitle) ||
      cv.experience?.[0]?.title ||
      'researcher';
    const focus = deriveFocus(cv);
    const article = aOrAn(role);
    const fieldPart = focus ? ` in ${focus}` : '';
    const wherePart = location ? `, based in ${location}` : '';
    return `I'm ${article} ${role}${fieldPart}${wherePart}.`;
  }, [cv, location]);

  // "Some things I've built:" -> projects, each "<name> (<year>)".
  const built = useMemo(() => {
    return (cv.projects || []).map((p) => ({
      name: p.name,
      url: p.url || null,
      years: formatDate(p.date, { month: 'none', fallback: '' }),
    }));
  }, [cv]);

  // Closing "I enjoy ..." line, derived from the technical skill set.
  const closing = useMemo(() => {
    const tools = deriveTools(cv);
    if (tools.length > 0) {
      return `I enjoy the analytical side of the work: ${tools.join(
        ', ',
      )}, and everything in between.`;
    }
    const focus = deriveFocus(cv);
    return focus
      ? `I enjoy exploring where ${focus} meets data.`
      : 'I enjoy exploring where research meets data.';
  }, [cv]);

  // Compact links row: socials + website wear a ↗; email stays plain.
  const links = useMemo(() => {
    const socials = (cv.social || []).filter((s) => s?.url);
    const rank = (s) => {
      const n = String(s?.network || '').toLowerCase();
      if (n === 'github') return 0;
      if (n === 'linkedin') return 1;
      return 2;
    };
    const ordered = socials
      .map((s, i) => ({ s, i }))
      .sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i)
      .map(({ s }) => s);

    const items = ordered.map((s) => {
      const network = String(s.network || '');
      const isGithub = network.toLowerCase() === 'github';
      const label = isGithub && s.username ? `@${s.username}` : network || 'link';
      return { key: `${network}-${s.url}`, label, href: s.url, external: true };
    });

    if (website) {
      items.push({ key: 'website', label: 'website', href: website, external: true });
    }
    if (email) {
      items.push({
        key: 'email',
        label: 'email',
        href: `mailto:${email}`,
        external: false,
      });
    }
    return items;
  }, [cv, website, email]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Toggle>
          <ToggleButton
            type="button"
            onClick={() => onDarkModeChange?.(!darkMode)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </ToggleButton>
        </Toggle>

        <Main>
          <AvatarFrame>
            {avatar ? (
              <AvatarImg src={withBase(avatar)} alt={name} />
            ) : (
              <AvatarPlaceholder aria-hidden="true">{initials}</AvatarPlaceholder>
            )}
          </AvatarFrame>

          <Name>
            {name}
            <Caret aria-hidden="true" />
          </Name>

          <Intro>{intro}</Intro>

          {built.length > 0 && (
            <>
              <Lead>Some things I&apos;ve built:</Lead>
              <BuiltList>
                {built.map((item, idx) => (
                  <BuiltItem key={`${item.name}-${idx}`}>
                    <Bullet aria-hidden="true">▸</Bullet>
                    <span>
                      {item.url ? (
                        <Link href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.name}
                          <ExternalArrow />
                        </Link>
                      ) : (
                        <strong>{item.name}</strong>
                      )}
                      {item.years ? ` (${item.years})` : ''}
                    </span>
                  </BuiltItem>
                ))}
              </BuiltList>
            </>
          )}

          <Closing>{closing}</Closing>

          {links.length > 0 && (
            <LinkRow>
              {links.map((link, idx) => (
                <React.Fragment key={link.key}>
                  {idx > 0 && <Dot aria-hidden="true">·</Dot>}
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                    {link.external && <ExternalArrow />}
                  </Link>
                </React.Fragment>
              ))}
            </LinkRow>
          )}
        </Main>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.body};
  font-family: ${SERIF_STACK};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-sizing: border-box;
  padding: clamp(2rem, 8vh, 5rem) clamp(1.25rem, 5vw, 3rem) 4rem;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Toggle = styled.div`
  position: fixed;
  top: var(--app-top-offset, 0px);
  right: 0;
  padding: clamp(0.75rem, 2.5vw, 1.25rem);
  z-index: 20;
`;

const ToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: ${(props) => props.theme.muted};
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: ${(props) => props.theme.ink};
    background: ${(props) => props.theme.placeholderBg};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.accent};
    outline-offset: 2px;
  }
`;

const Main = styled.main`
  max-width: 36rem;
  margin: 0;

  @media (prefers-reduced-motion: no-preference) {
    > * {
      opacity: 0;
      animation: ${fadeUp} 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    > *:nth-child(1) { animation-delay: 0.05s; }
    > *:nth-child(2) { animation-delay: 0.14s; }
    > *:nth-child(3) { animation-delay: 0.23s; }
    > *:nth-child(4) { animation-delay: 0.32s; }
    > *:nth-child(5) { animation-delay: 0.41s; }
    > *:nth-child(6) { animation-delay: 0.50s; }
    > *:nth-child(7) { animation-delay: 0.59s; }
    > *:nth-child(8) { animation-delay: 0.68s; }
  }
`;

const Caret = styled.span`
  display: inline-block;
  width: 0.58em;
  height: 1.05em;
  margin-left: 0.1em;
  transform: translateY(0.12em);
  background: ${(props) => props.theme.accent};

  @media (prefers-reduced-motion: no-preference) {
    animation: ${caretBlink} 1.25s steps(1) infinite;
  }
`;

const AvatarFrame = styled.div`
  width: clamp(140px, 46vw, 208px);
  aspect-ratio: 1 / 1;
  margin-bottom: clamp(1.5rem, 5vw, 2.25rem);
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border: 1px solid ${(props) => props.theme.placeholderBorder};
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.placeholderBg};
  border: 1px solid ${(props) => props.theme.placeholderBorder};
  color: ${(props) => props.theme.placeholderInk};
  font-size: clamp(2rem, 9vw, 3rem);
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const Name = styled.h1`
  margin: 0 0 clamp(0.9rem, 3vw, 1.25rem);
  color: ${(props) => props.theme.ink};
  font-family: ${SERIF_STACK};
  font-weight: 700;
  font-size: clamp(1.8rem, 6.5vw, 2.4rem);
  line-height: 1.12;
  letter-spacing: -0.01em;
`;

const Intro = styled.p`
  margin: 0 0 clamp(1.4rem, 5vw, 1.9rem);
  font-size: clamp(1rem, 2.7vw, 1.09rem);
  line-height: 1.6;
`;

const Lead = styled.p`
  margin: 0 0 0.7rem;
  font-size: clamp(1rem, 2.7vw, 1.09rem);
  line-height: 1.6;
`;

const BuiltList = styled.ul`
  list-style: none;
  margin: 0 0 clamp(1.4rem, 5vw, 1.9rem);
  padding: 0;
`;

const BuiltItem = styled.li`
  display: flex;
  align-items: flex-start;
  font-size: clamp(1rem, 2.7vw, 1.09rem);
  line-height: 1.6;

  & + & {
    margin-top: 0.28rem;
  }

  strong {
    font-weight: 600;
    color: ${(props) => props.theme.ink};
  }
`;

const Bullet = styled.span`
  flex: none;
  margin-right: 0.7rem;
  color: ${(props) => props.theme.arrow};
  line-height: 1.6;
`;

const Closing = styled.p`
  margin: 0 0 clamp(1.6rem, 5vw, 2.2rem);
  font-size: clamp(1rem, 2.7vw, 1.09rem);
  line-height: 1.6;
`;

const LinkRow = styled.p`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.15rem 0.45rem;
  font-size: clamp(0.95rem, 2.6vw, 1.05rem);
  line-height: 1.6;
`;

const Dot = styled.span`
  color: ${(props) => props.theme.muted};
`;

const Link = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.1em;
  color: ${(props) => props.theme.accent};
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  transition: color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: ${(props) => props.theme.accentHover};
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.accent};
    outline-offset: 2px;
  }
`;

const Arrow = styled.svg`
  flex: none;
  margin-left: 0.05em;
  transform: translateY(-0.03em);
`;
