import React, { useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes, css } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, pickSocialUrl } from '../../utils/cvHelpers';
import iridescentTexture from './iridescent.jpg';

/**
 * SpencerKinneyTheme — a faithful, CV-driven remake of www.spencerkinney.dev.
 *
 * Spencer's site is a single centered ~576px column on near-black (#121212):
 * a HUGE Montserrat-black uppercase name split across two lines, its glyphs
 * filled with an iridescent holographic texture (background-clip:text); a
 * Space Mono tagline ("building AI products at <company>") with the company
 * underlined; then two hairline-ruled sections — an uppercase letter-spaced
 * gray label ("PREVIOUSLY" / "LINKS") over bold mono titles with muted
 * one-line descriptions, and a 3-column grid of underlined mono links.
 *
 * We rebuild that voice from useCV() rather than hardcoding Spencer's copy.
 * The name keeps the authentic iridescent.jpg fill in dark mode; the light
 * "paper" variant swaps to a saturated animated holo gradient so the letters
 * stay legible on white.
 */

// Tailwind neutral scale mirrored from the source stylesheet.
const darkTheme = {
  mode: 'dark',
  pageBg: '#121212',
  title: '#ffffff', // text-white — entry titles
  tagline: '#e5e5e5', // text-neutral-200
  link: '#d4d4d4', // text-neutral-300
  desc: '#a3a3a3', // text-neutral-400
  label: '#737373', // text-neutral-500
  faint: '#525252', // text-neutral-600 — dim year + underline
  rule: '#262626', // border-neutral-800 — section dividers
  linkHover: '#ffffff',
  // Authentic pale iridescent photo fill.
  nameBg: `url(${iridescentTexture})`,
  nameBgSize: 'cover',
  nameShadow: 'none',
};

const lightTheme = {
  mode: 'light',
  pageBg: '#f6f5f3', // warm paper
  title: '#171717',
  tagline: '#262626',
  link: '#404040',
  desc: '#525252',
  label: '#a3a3a3',
  faint: '#a3a3a3',
  rule: '#e5e3df',
  linkHover: '#000000',
  // Vivid holographic gradient so the name reads on light paper.
  nameBg:
    'linear-gradient(100deg, #f472b6 0%, #a78bfa 22%, #60a5fa 44%, #34d399 62%, #fbbf24 80%, #f472b6 100%)',
  nameBgSize: '300% 300%',
  nameShadow: '0 1px 0 rgba(0,0,0,0.06)',
};

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Space+Mono:wght@400;700&display=swap');
  body { background-color: ${(props) => props.theme.pageBg}; }
`;

const holo = keyframes`
  0%   { background-position: 15% 30%; }
  50%  { background-position: 85% 70%; }
  100% { background-position: 15% 30%; }
`;

const MONO =
  "'Space Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const DISPLAY =
  "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Turn a role/title into a short lowercase "field" that reads naturally after
// the word "building", so the tagline echoes "building AI products at orgo".
function deriveField(role = '') {
  const r = String(role).toLowerCase();
  if (!r) return 'things';
  if (/informatic/.test(r)) return 'health informatics';
  if (/gis|geographic|spatial/.test(r)) return 'spatial data';
  if (/research|scientist|\blab\b|laborator/.test(r)) return 'research';
  if (/analyst|\bdata\b/.test(r)) return 'data tools';
  if (/engineer|develop|software|program/.test(r)) return 'software';
  if (/teach|instruct|tutor/.test(r)) return 'learning tools';
  if (/design/.test(r)) return 'design';
  return r;
}

export function SpencerKinneyTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const nameParts = useMemo(() => {
    const words = String(name).trim().split(/\s+/).filter(Boolean);
    if (words.length <= 1) return [words[0] || name, ''];
    return [words[0], words.slice(1).join(' ')];
  }, [name]);

  const email = cv.email || null;
  const website = cv.website || null;
  const socials = cv.social || [];
  const socialLinks = cv.socialLinks || {};

  const experience = useMemo(
    () => (Array.isArray(cv.experience) ? cv.experience : []),
    [cv.experience],
  );

  // The role/company featured in the tagline: the current position with the
  // latest start date, falling back to the most recent listed experience.
  const feature = useMemo(() => {
    const current = experience.filter((e) => e && e.isCurrent);
    const pool = current.length ? current : experience;
    if (!pool.length) return null;
    return pool.reduce((best, e) =>
      String(e.startDate || '') > String(best.startDate || '') ? e : best,
    );
  }, [experience]);

  const taglineField = deriveField(feature?.title || cv.currentJobTitle || '');
  const taglineCompany = feature?.company || null;

  // "Previously": unique companies (in listed order), excluding the featured
  // one, each collapsed to a role + year range.
  const previously = useMemo(() => {
    const byCompany = new Map();
    for (const e of experience) {
      if (!e || !e.company) continue;
      if (!byCompany.has(e.company)) {
        byCompany.set(e.company, { company: e.company, role: e.title || '', starts: [], ends: [], current: false });
      }
      const g = byCompany.get(e.company);
      if (e.startDate) g.starts.push(String(e.startDate));
      if (e.isCurrent) g.current = true;
      else if (e.endDate) g.ends.push(String(e.endDate));
    }
    const rows = [];
    for (const g of byCompany.values()) {
      if (taglineCompany && g.company === taglineCompany) continue;
      const start = g.starts.length ? g.starts.slice().sort()[0] : null;
      const end = g.current ? 'present' : g.ends.length ? g.ends.slice().sort().pop() : null;
      const years = formatRange(start, end, { month: 'none', presentLabel: 'present' });
      rows.push({ company: g.company, role: g.role, years });
    }
    return rows.slice(0, 6);
  }, [experience, taglineCompany]);

  // "Links": ordered like the source (email, github, linkedin, socials, site).
  const links = useMemo(() => {
    const out = [];
    if (email) out.push({ label: 'email', href: `mailto:${email}`, external: false });
    if (socialLinks.github) out.push({ label: 'github', href: socialLinks.github, external: true });
    if (socialLinks.linkedin) out.push({ label: 'linkedin', href: socialLinks.linkedin, external: true });
    const facebook = pickSocialUrl(socials, ['facebook']);
    const instagram = pickSocialUrl(socials, ['instagram']);
    const twitter = socialLinks.twitter;
    if (facebook) out.push({ label: 'facebook', href: facebook, external: true });
    if (instagram) out.push({ label: 'instagram', href: instagram, external: true });
    if (twitter) out.push({ label: 'twitter', href: twitter, external: true });
    if (website) out.push({ label: 'website', href: website, external: true });
    return out;
  }, [email, website, socials, socialLinks]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Column>
          <ModeToggle
            type="button"
            onClick={() => onDarkModeChange?.(!darkMode)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? 'light' : 'dark'}
          </ModeToggle>

          <Hero>
            <Name aria-label={name}>
              <NameLine aria-hidden="true">{nameParts[0]}</NameLine>
              {nameParts[1] ? <NameLine aria-hidden="true" $second>{nameParts[1]}</NameLine> : null}
            </Name>
            <Tagline>
              building {taglineField}
              {taglineCompany ? (
                <>
                  {' '}at{' '}
                  {website ? (
                    <CompanyLink href={website} target="_blank" rel="noopener noreferrer">
                      {taglineCompany}
                    </CompanyLink>
                  ) : (
                    <CompanyName>{taglineCompany}</CompanyName>
                  )}
                </>
              ) : null}
            </Tagline>
          </Hero>

          {previously.length > 0 && (
            <Section>
              <Label>Previously</Label>
              <Entries>
                {previously.map((row, i) => (
                  <Entry key={`${row.company}-${i}`}>
                    <EntryTitle>{row.company}</EntryTitle>
                    <EntryDesc>
                      {row.role ? <span className="role">{row.role}</span> : null}
                      {row.years ? <span className="years">{row.years}</span> : null}
                    </EntryDesc>
                  </Entry>
                ))}
              </Entries>
            </Section>
          )}

          {links.length > 0 && (
            <Section>
              <Label>Links</Label>
              <LinkGrid>
                {links.map((l) => (
                  <LinkCell
                    key={l.label}
                    href={l.href}
                    {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span>{l.label}</span>
                  </LinkCell>
                ))}
              </LinkGrid>
            </Section>
          )}
        </Column>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: calc(100dvh - var(--app-top-offset, 0px));
  width: 100%;
  box-sizing: border-box;
  background-color: ${(props) => props.theme.pageBg};
  color: ${(props) => props.theme.title};
  font-family: ${MONO};
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  transition: background-color 0.3s ease, color 0.3s ease;

  @media (min-width: 640px) {
    justify-content: center;
  }
`;

const Column = styled.div`
  position: relative;
  width: 100%;
  max-width: 36rem;
  margin: 0 auto;
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  box-sizing: border-box;
`;

const ModeToggle = styled.button`
  position: absolute;
  top: 1.25rem;
  right: 0;
  border: 1px solid ${(props) => props.theme.rule};
  background: transparent;
  color: ${(props) => props.theme.label};
  font-family: ${MONO};
  font-size: 0.7rem;
  text-transform: lowercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.55rem;
  border-radius: 0.35rem;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: ${(props) => props.theme.linkHover};
    border-color: ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Name = styled.h1`
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const NameLine = styled.span`
  font-family: ${DISPLAY};
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.9;
  letter-spacing: -0.05em;
  font-size: clamp(2.5rem, 12.5vw, 4.5rem);
  overflow-wrap: break-word;

  background: ${(props) => props.theme.nameBg};
  background-size: ${(props) => props.theme.nameBgSize};
  background-position: 15% 30%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: ${(props) => props.theme.nameShadow};

  animation: ${holo} 14s ease-in-out infinite;
  ${(props) =>
    props.$second &&
    css`
      animation-delay: -7s;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-position: ${(props) => (props.$second ? '70% 65%' : '30% 40%')};
  }
`;

const Tagline = styled.p`
  margin: 1rem 0 0;
  font-family: ${MONO};
  font-size: 1rem;
  line-height: 1.5;
  color: ${(props) => props.theme.tagline};
`;

const CompanyLink = styled.a`
  color: ${(props) => props.theme.linkHover};
  text-decoration: none;
  border-bottom: 1px solid ${(props) => props.theme.faint};
  transition: border-color 0.2s ease;

  &:hover,
  &:focus-visible {
    border-color: ${(props) => props.theme.linkHover};
    outline: none;
  }
`;

const CompanyName = styled.span`
  color: ${(props) => props.theme.linkHover};
  border-bottom: 1px solid ${(props) => props.theme.faint};
`;

const Section = styled.section`
  padding-top: 1.5rem;
  border-top: 1px solid ${(props) => props.theme.rule};
`;

const Label = styled.p`
  margin: 0 0 1rem;
  font-family: ${MONO};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.label};
`;

const Entries = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Entry = styled.div`
  transition: transform 0.3s ease;

  &:hover {
    transform: translateX(0.25rem);
  }
`;

const EntryTitle = styled.p`
  margin: 0;
  font-family: ${MONO};
  font-size: 1rem;
  font-weight: 700;
  color: ${(props) => props.theme.title};
`;

const EntryDesc = styled.p`
  margin: 0.15rem 0 0;
  font-family: ${MONO};
  font-size: 0.875rem;
  text-transform: lowercase;
  color: ${(props) => props.theme.desc};

  .years {
    color: ${(props) => props.theme.faint};
  }

  .role + .years::before {
    content: ' · ';
    color: ${(props) => props.theme.faint};
  }
`;

const LinkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 1.5rem;
  row-gap: 0.75rem;
  max-width: fit-content;

  @media (max-width: 380px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const LinkCell = styled.a`
  color: ${(props) => props.theme.link};
  text-decoration: none;
  transition: color 0.2s ease;

  span {
    font-family: ${MONO};
    font-size: 0.875rem;
    text-transform: lowercase;
    border-bottom: 1px solid ${(props) => props.theme.faint};
    padding-bottom: 1px;
    transition: border-color 0.2s ease;
  }

  &:hover {
    color: ${(props) => props.theme.linkHover};
  }

  &:hover span {
    border-color: ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 3px;
  }
`;

export default SpencerKinneyTheme;
