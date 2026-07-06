import React, { useEffect, useMemo, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, formatDate, isPresent } from '../../utils/cvHelpers';

/**
 * SanjayEngineeringTheme — a faithful CV-driven remake of sanjay.engineering.
 *
 * The tagline is "chasing light": the page background is a LIVE SKY GRADIENT
 * computed from the sun's real position over the CV owner's city. We calculate
 * the solar elevation for the current moment (recomputed every minute) and map
 * it to a top→bottom sky — blue by day, warm gold at dawn/dusk, deep navy after
 * dark — and flip to the dark ink variant once the sun drops below the horizon.
 *
 * Everything — body text included — is set in Departure Mono at 16px/1.5,
 * inside a left-hugging 36rem column: a small nav (mb-16), then a flex row of
 * a sticky vertical 22px "<name> • <field>" rail (desktop) beside the content.
 * On mobile the rail hides and a single 22px "<name> • <tagline>" masthead
 * shows instead. Section headers are blocky uppercase Departure Mono at
 * 33px/44px with -5px letter-spacing; rows are quiet two-column flex lines
 * with no rules, and the footer carries arrow-icon profile links, an
 * uppercase © line, and the "Typeset in Departure Mono" colophon. Rebuilt
 * from CV.yaml.
 */

// The owner's city (Prince George, BC). The sky is computed for this location,
// so the background is literally the local sky at the visitor's current time.
const LAT = 53.9171;
const LNG = -122.7497;

// ---- Compact NOAA / SunCalc-style solar position (altitude in degrees) ----
const RAD = Math.PI / 180;
const DAY_MS = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;
const OBLIQUITY = RAD * 23.4397; // obliquity of the ecliptic

function solarElevation(date, lat, lng) {
  const days = date.valueOf() / DAY_MS - 0.5 + J1970 - J2000;
  const M = RAD * (357.5291 + 0.98560028 * days); // solar mean anomaly
  const C =
    RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)); // equation of center
  const L = M + C + RAD * 102.9372 + Math.PI; // ecliptic longitude
  const dec = Math.asin(Math.sin(OBLIQUITY) * Math.sin(L)); // declination
  const ra = Math.atan2(Math.sin(L) * Math.cos(OBLIQUITY), Math.cos(L)); // right ascension
  const th = RAD * (280.16 + 360.9856235 * days) - RAD * -lng; // sidereal time
  const H = th - ra; // hour angle
  const phi = RAD * lat;
  const alt = Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H),
  );
  return alt / RAD; // degrees above the horizon
}

// ---- Sky bands: solar elevation (deg) -> vertical gradient stops (top, bottom).
// Anchors are interpolated so the sky shifts smoothly minute to minute.
const SKY = [
  { e: 60, top: '#9dc0e6', bottom: '#eef4fa' }, // clear day, sun high — pale airy sky
  { e: 20, top: '#a9c9e8', bottom: '#eef4fa' }, // day
  { e: 10, top: '#7b8fd0', bottom: '#f3d6ad' }, // low sun, warming
  { e: 3, top: '#9a9ed0', bottom: '#f4bf90' }, // golden hour, periwinkle -> peach
  { e: 0, top: '#9a86bb', bottom: '#e39a6b' }, // sunrise / sunset horizon
  { e: -2, top: '#2a2c54', bottom: '#3d3350' }, // civil twilight, indigo -> dusky warm
  { e: -6, top: '#1f2549', bottom: '#2c2746' }, // end of civil twilight
  { e: -12, top: '#121d34', bottom: '#1e2c44' }, // nautical night
  { e: -18, top: '#0d1a2b', bottom: '#16293f' }, // astronomical night
];

// Ink palettes: dark slate for light (day) skies, light for dark (night) skies.
const DAY_INK = {
  ink: '#2b3a4d',
  head: '#1c2a3c',
  muted: '#5d6f83',
  rail: 'rgba(28, 42, 60, 0.45)',
  rule: 'rgba(28, 42, 60, 0.18)',
  accent: '#e25a1c',
  link: '#2b3a4d',
};

const NIGHT_INK = {
  ink: '#c3d2e2',
  head: '#e6eef6',
  muted: '#8aa0b6',
  rail: 'rgba(195, 210, 226, 0.4)',
  rule: 'rgba(195, 210, 226, 0.16)',
  accent: '#ff8a4c',
  link: '#dbe6f1',
};

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const c = (i) => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`;
}

// Relative luminance (WCAG) — used to pick legible ink for the current sky.
function relLuminance(hex) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function buildSkyTheme(elevation) {
  const e = Math.max(-18, Math.min(60, elevation));
  let hi = SKY[0];
  let lo = SKY[SKY.length - 1];
  for (let i = 0; i < SKY.length - 1; i += 1) {
    if (e <= SKY[i].e && e >= SKY[i + 1].e) {
      hi = SKY[i];
      lo = SKY[i + 1];
      break;
    }
  }
  const t = hi.e === lo.e ? 0 : (hi.e - e) / (hi.e - lo.e);
  const top = mixHex(hi.top, lo.top, t);
  const bottom = mixHex(hi.bottom, lo.bottom, t);
  // Legibility: switch to light ink once the average sky is dark (roughly the
  // moment the sun dips below the horizon).
  const avgLum = (relLuminance(top) + relLuminance(bottom)) / 2;
  const ink = avgLum < 0.3 ? NIGHT_INK : DAY_INK;
  return {
    ...ink,
    gradient: `linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)`,
  };
}

const GlobalStyle = createGlobalStyle`
  body {
    background: ${(props) => props.theme.gradient};
    background-attachment: fixed;
    transition: background 1.5s linear;
  }
`;

function fieldWord(cv) {
  const area = cv.education?.[0]?.area || '';
  if (/environ/i.test(area)) return 'environment';
  if (/biomed|health/i.test(area)) return 'research';
  if (/comput|software|engineer/i.test(area)) return 'engineering';
  return (area.split(/\s+/)[0] || 'research').toLowerCase();
}

export function SanjayEngineeringTheme({ darkMode = false }) {
  const cv = useCV() || {};

  // Live solar elevation for the current moment, recomputed every ~60s.
  const [elevation, setElevation] = useState(() => solarElevation(new Date(), LAT, LNG));
  useEffect(() => {
    const tick = () => setElevation(solarElevation(new Date(), LAT, LNG));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // Sun-driven dark mode: below the horizon the sky (and its ink) go dark on
  // their own. If the shell explicitly forces dark via the prop, that wins — we
  // render the deep-night sky so the light ink stays legible even in daylight;
  // otherwise the live sun decides both the gradient and the dark/light ink.
  const theme = useMemo(
    () => buildSkyTheme(darkMode ? -18 : elevation),
    [darkMode, elevation],
  );

  const name = cv.name || 'Your Name';
  const firstName = (name.split(/\s+/)[0] || name).toLowerCase();
  const field = fieldWord(cv);
  const tagline = cv.tagline || cv.headline || 'chasing clean air';
  const builderWord = field === 'engineering' ? 'guy' : 'researcher';

  // Footer profile links, CV-driven (the source lists rss + github).
  const footerLinks = useMemo(() => {
    const links = (cv.social || [])
      .filter((s) => s?.url)
      .map((s) => ({ label: String(s.network || 'link').toLowerCase(), href: s.url }));
    if (cv.email) links.push({ label: 'email', href: `mailto:${cv.email}` });
    return links;
  }, [cv]);

  const projects = (cv.projects || []).slice(0, 8);

  // "Writing" — publications + presentations sorted newest-first, shown as
  // title + year, echoing Sanjay's dated writing list.
  const writing = useMemo(() => {
    const pubs = (cv.publications || []).map((p) => ({
      title: p.title || p.name,
      date: p.date,
      url: p.doi ? `https://doi.org/${p.doi}` : p.url,
    }));
    const pres = (cv.presentations || []).map((p) => ({
      title: p.name,
      date: p.date,
      url: p.url,
    }));
    return [...pubs, ...pres]
      .filter((w) => w.title)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .slice(0, 8);
  }, [cv]);

  const experience = (cv.experience || []).slice(0, 6);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page className="antialiased">
        <Frame>
          <Nav>
            <a href="#projects">projects</a>
            <a href="#writing">writing</a>
            <a href="#experience">experience</a>
          </Nav>

          <Body>
            <Rail>
              {firstName} <span>• {field}</span>
            </Rail>

            <Column>
              <Masthead>
                {firstName} <span>• {tagline}</span>
              </Masthead>

              <Intro>Just another {builderWord} who loves building...</Intro>

              {projects.length > 0 && (
                <Section id="projects">
                  <Heading>Projects</Heading>
                  <div>
                    {projects.map((p, i) =>
                      p.url ? (
                        <Row
                          key={`p-${i}`}
                          as="a"
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <RowTitle>{p.name}</RowTitle>
                          <RowMeta>{p.summary}</RowMeta>
                        </Row>
                      ) : (
                        <Row key={`p-${i}`}>
                          <RowTitle>{p.name}</RowTitle>
                          <RowMeta>{p.summary}</RowMeta>
                        </Row>
                      ),
                    )}
                  </div>
                </Section>
              )}

              {writing.length > 0 && (
                <Section id="writing">
                  <Heading>Writing</Heading>
                  <div>
                    {writing.map((w, i) =>
                      w.url ? (
                        <Row
                          key={`w-${i}`}
                          as="a"
                          href={w.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <RowTitle>{w.title}</RowTitle>
                          <RowMeta>{formatDate(w.date, { month: 'numeric', fallback: w.date })}</RowMeta>
                        </Row>
                      ) : (
                        <Row key={`w-${i}`}>
                          <RowTitle>{w.title}</RowTitle>
                          <RowMeta>{formatDate(w.date, { month: 'numeric', fallback: w.date })}</RowMeta>
                        </Row>
                      ),
                    )}
                  </div>
                </Section>
              )}

              {experience.length > 0 && (
                <Section id="experience">
                  <Heading>Experience</Heading>
                  <ul>
                    {experience.map((e, i) => (
                      <JobRow key={`e-${i}`}>
                        <JobLeft>
                          <RowTitle>{e.title}</RowTitle>
                          <JobDates>
                            {formatRange(e.startDate, e.endDate, {
                              month: 'short',
                              separator: ' - ',
                              ongoingWhenNoEnd: e.isCurrent,
                              presentLabel: 'Present',
                            }) || (isPresent(e.endDate) ? 'Present' : '')}
                          </JobDates>
                        </JobLeft>
                        <RowMeta>{e.company}</RowMeta>
                      </JobRow>
                    ))}
                  </ul>
                </Section>
              )}

              <Footer>
                {footerLinks.length > 0 && (
                  <FooterLinks>
                    {footerLinks.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          {...(/^https?:/i.test(l.href)
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z" fill="currentColor" />
                          </svg>
                          <span>{l.label}</span>
                        </a>
                      </li>
                    ))}
                  </FooterLinks>
                )}
                <Copyright>
                  © {new Date().getFullYear()} {name} <span>• {tagline}</span>
                </Copyright>
                <Colophon>
                  Typeset in{' '}
                  <a href="https://departuremono.com/" target="_blank" rel="noopener noreferrer">
                    Departure Mono
                  </a>{' '}
                  by Helena Zhang
                </Colophon>
              </Footer>
            </Column>
          </Body>
        </Frame>
      </Page>
    </ThemeProvider>
  );
}

// Source metrics (Tailwind, --spacing: .25rem): body max-w-xl (36rem) mx-4
// mt-8, main mt-6, nav aside mb-16, sections my-8, section headers my-2 at
// 33px (44px ≥640px) with -5px letter-spacing, rows my-2 with no rules, and
// 22px masthead / rail / intro. The whole site is set in Departure Mono at
// the browser's 16px/1.5 base.
const Page = styled.div`
  min-height: 100%;
  width: 100%;
  position: relative;
  background: ${(props) => props.theme.gradient};
  color: ${(props) => props.theme.ink};
  font-family: 'Departure Mono', 'Geist Mono', ui-monospace, SFMono-Regular, 'Roboto Mono', Menlo, monospace;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  box-sizing: border-box;
  padding: 3.5rem 1rem 4rem;
  transition: background 1.5s linear, color 1.5s linear;
`;

const Frame = styled.main`
  max-width: 36rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 4rem;
  letter-spacing: -0.025em;

  a {
    color: ${(props) => props.theme.ink};
    text-decoration: none;
    transition: color 0.3s ease;
    &:hover {
      color: ${(props) => props.theme.accent};
    }
  }
`;

// The rail sits inside the content row (flex gap-4), not on the screen edge.
const Body = styled.div`
  display: flex;
  gap: 1rem;
`;

const Rail = styled.h1`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  position: sticky;
  top: calc(var(--app-top-offset, 0px) + 2rem);
  align-self: flex-start;
  flex-shrink: 0;
  margin: 0;
  font-size: 22px;
  font-weight: 400;
  letter-spacing: -0.05em;
  color: ${(props) => props.theme.head};
  transition: color 1s linear;
  user-select: none;

  @media (max-width: 639px) {
    display: none;
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 0;
`;

// The source shows this single-line masthead only below the sm breakpoint,
// where the vertical rail is hidden.
const Masthead = styled.h1`
  display: none;
  margin: 0 0 2rem;
  font-size: 22px;
  font-weight: 400;
  letter-spacing: -0.05em;
  color: ${(props) => props.theme.head};
  transition: color 1s linear;

  @media (max-width: 639px) {
    display: block;
  }
`;

const Intro = styled.p`
  margin: 0 0 2rem;
  font-size: 22px;
  line-height: 1.25;
  color: ${(props) => props.theme.ink};
`;

const Section = styled.section`
  margin: 2rem 0;
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 1rem);

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`;

const Heading = styled.h3`
  font-weight: 400;
  font-size: 33px;
  letter-spacing: -5px;
  text-transform: uppercase;
  line-height: 1.5;
  color: ${(props) => props.theme.head};
  transition: color 1s linear;
  margin: 0.5rem 0;

  @media (min-width: 640px) {
    font-size: 44px;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 1rem;
  color: inherit;
  text-decoration: none;

  &[href]:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.15rem;
  }
`;

const JobRow = styled.li`
  display: flex;
  gap: 1rem;
  margin: 0.5rem 0;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.15rem;
  }
`;

const JobLeft = styled.div`
  flex: 1;
`;

const JobDates = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.43;
  text-transform: uppercase;
  color: ${(props) => props.theme.muted};
`;

const RowTitle = styled.h3`
  flex: 1;
  margin: 0;
  font-size: inherit;
  font-weight: 400;
  color: ${(props) => props.theme.head};
  transition: color 0.3s ease;
`;

const RowMeta = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.43;
  color: ${(props) => props.theme.muted};
  text-align: right;
  align-self: flex-start;

  @media (max-width: 480px) {
    text-align: left;
  }
`;

const Footer = styled.footer`
  margin-bottom: 4rem;
`;

const FooterLinks = styled.ul`
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  a {
    display: flex;
    align-items: center;
    color: ${(props) => props.theme.muted};
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
      color: ${(props) => props.theme.head};
    }

    span {
      margin-left: 0.5rem;
      height: 1.75rem;
    }
  }

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
  }
`;

const Copyright = styled.p`
  margin: 2rem 0 0;
  font-size: 12px;
  line-height: 1.33;
  text-transform: uppercase;
  color: ${(props) => props.theme.muted};
`;

const Colophon = styled.p`
  margin: 0.5rem 0 0;
  font-size: 12px;
  line-height: 1.33;
  text-transform: uppercase;
  color: ${(props) => props.theme.muted};
  opacity: 0.85;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
      color: ${(props) => props.theme.head};
    }
  }
`;
