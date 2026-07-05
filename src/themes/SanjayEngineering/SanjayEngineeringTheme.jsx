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
 * Everything is set in Geist Mono (regular 400, with a few thin 300 accents),
 * with a rotated "<name> · <field>" rail down the left edge, blocky Departure
 * Mono section headers (PROJECTS / WRITING / EXPERIENCE), and quiet two-column
 * rows. Rebuilt from CV.yaml, down to the "Typeset in Departure Mono" colophon.
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
  const firstName = name.split(/\s+/)[0] || name;
  const field = fieldWord(cv);
  const tagline = cv.tagline || cv.headline || 'chasing clean air';

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
      <Page>
        <Rail aria-hidden="true">
          <span>
            {firstName} · {field}
          </span>
        </Rail>

        <Column className="antialiased">
          <Nav>
            <a href="#projects">projects</a>
            <a href="#writing">writing</a>
            <a href="#experience">experience</a>
          </Nav>

          <Masthead>
            <div>
              {firstName} • {field}
            </div>
            <div>
              {firstName} • {tagline}
            </div>
          </Masthead>

          <Intro>
            Just another {field === 'engineering' ? 'builder' : 'researcher'} who loves building
            things{cv.location ? `, based in ${cv.location}` : ''}…
          </Intro>

          {projects.length > 0 && (
            <Section id="projects">
              <Heading>Projects</Heading>
              {projects.map((p, i) => (
                <Row key={`p-${i}`}>
                  {p.url ? (
                    <RowTitle as="a" href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.name}
                    </RowTitle>
                  ) : (
                    <RowTitle>{p.name}</RowTitle>
                  )}
                  <RowMeta>{p.summary}</RowMeta>
                </Row>
              ))}
            </Section>
          )}

          {writing.length > 0 && (
            <Section id="writing">
              <Heading>Writing</Heading>
              {writing.map((w, i) => (
                <Row key={`w-${i}`}>
                  {w.url ? (
                    <RowTitle as="a" href={w.url} target="_blank" rel="noopener noreferrer">
                      {w.title}
                    </RowTitle>
                  ) : (
                    <RowTitle>{w.title}</RowTitle>
                  )}
                  <RowMeta $mono>{formatDate(w.date, { month: 'numeric', fallback: w.date })}</RowMeta>
                </Row>
              ))}
            </Section>
          )}

          {experience.length > 0 && (
            <Section id="experience">
              <Heading>Experience</Heading>
              {experience.map((e, i) => (
                <Row key={`e-${i}`} $stack>
                  <RowLeft>
                    <RowTitle>{e.title}</RowTitle>
                    <RowMeta $mono>
                      {formatRange(e.startDate, e.endDate, {
                        month: 'short',
                        ongoingWhenNoEnd: e.isCurrent,
                        presentLabel: 'Present',
                      }) || (isPresent(e.endDate) ? 'Present' : '')}
                    </RowMeta>
                  </RowLeft>
                  <RowCompany>{e.company}</RowCompany>
                </Row>
              ))}
            </Section>
          )}

          <Footer>
            <div>
              © {new Date().getFullYear()} {name} • {tagline}
            </div>
            <div className="colophon">Typeset in Departure Mono by Helena Zhang</div>
          </Footer>
        </Column>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  position: relative;
  background: ${(props) => props.theme.gradient};
  color: ${(props) => props.theme.ink};
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, 'Roboto Mono', Menlo, monospace;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.55;
  box-sizing: border-box;
  padding: 2rem 1rem 4rem;
  transition: background 1.5s linear, color 1.5s linear;
`;

const Rail = styled.div`
  position: absolute;
  left: 0.35rem;
  top: 2rem;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  color: ${(props) => props.theme.rail};
  font-weight: 300;
  letter-spacing: 0.12em;
  font-size: 13px;
  user-select: none;

  @media (max-width: 720px) {
    display: none;
  }
`;

const Column = styled.main`
  max-width: 36rem;
  margin: 0 auto 0 3rem;

  @media (max-width: 720px) {
    margin: 0 auto;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.25rem;
  margin-bottom: 2.5rem;

  a {
    color: ${(props) => props.theme.ink};
    text-decoration: none;
    transition: color 0.3s ease;
    &:hover {
      color: ${(props) => props.theme.accent};
    }
  }
`;

const Masthead = styled.header`
  margin-bottom: 1.25rem;
  line-height: 1.4;
  div {
    color: ${(props) => props.theme.head};
    transition: color 1s linear;
  }
`;

const Intro = styled.p`
  margin: 0 0 3rem;
  color: ${(props) => props.theme.ink};
  opacity: 0.9;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 1rem);
`;

const Heading = styled.h2`
  font-family: 'Departure Mono', 'Geist Mono', ui-monospace, monospace;
  font-weight: 400;
  font-size: clamp(1.9rem, 6vw, 2.6rem);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${(props) => props.theme.head};
  transition: color 1s linear;
  margin: 0 0 1.1rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: ${(props) => (props.$stack ? 'flex-start' : 'baseline')};
  gap: 1.5rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid ${(props) => props.theme.rule};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.15rem;
  }
`;

const RowLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const RowTitle = styled.span`
  color: ${(props) => props.theme.head};
  font-weight: 400;
  letter-spacing: 0.01em;
  text-decoration: none;
  transition: color 0.3s ease;

  &[href]:hover {
    color: ${(props) => props.theme.accent};
  }
`;

const RowMeta = styled.span`
  color: ${(props) => props.theme.muted};
  text-align: right;
  ${(props) => (props.$mono ? 'font-variant-numeric: tabular-nums; white-space: nowrap;' : '')}

  @media (max-width: 480px) {
    text-align: left;
  }
`;

const RowCompany = styled.span`
  color: ${(props) => props.theme.muted};
  text-align: right;
  white-space: nowrap;

  @media (max-width: 480px) {
    text-align: left;
  }
`;

const Footer = styled.footer`
  margin-top: 4rem;
  color: ${(props) => props.theme.muted};
  font-size: 13px;

  .colophon {
    margin-top: 0.35rem;
    font-weight: 300;
    opacity: 0.8;
  }
`;
