import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { pickSocialUrl } from '../../utils/cvHelpers';

/**
 * SolarTheme — a CV-driven remake of seanxthielen.com.
 *
 * Sean Thielen-Esparza's site has no fixed colour scheme: the whole palette
 * (background, ink, accent, links) is computed continuously from the sun's
 * real altitude for the visitor's local clock and latitude, so every moment —
 * and every season — renders a unique page. Four anchor palettes (dawn, day,
 * dusk, night) are blended by the sun's altitude; the background travels
 * through real twilight colours (deep blue hour, dusty ember, warm gold hour),
 * and the body ink snaps light<->dark at the neutral midpoint so it never
 * fades out. Two faint celestial arcs frame the page — the sun rides the top
 * by day, the moon the bottom by night — with a 24h clock beneath.
 *
 * The layout is a quiet centred column: an intro sentence and an italic
 * label / value grid, rebuilt here from CV.yaml (Currently / Past / Bio /
 * projects / Contact) rather than hardcoding Sean's copy. The maths and the
 * anchor palettes are transcribed from the original site's theme.js.
 */

// ---- solar palette engine (ported from seanxthielen.com/theme.js) ----

const RAD = Math.PI / 180;

// Latitude drives how high the sun climbs and how long twilight lasts. The
// original stamps a geo-located value from the edge; we can't, so pick a
// temperate mid-northern latitude that gives a clear day/twilight/night cycle.
const LAT = 40;

const PAL = {
  night: { bg: [15, 18, 24], text: [174, 182, 200], accent: [223, 230, 245], link: [163, 158, 242] },
  dawn: { bg: [220, 204, 194], text: [63, 49, 43], accent: [36, 23, 18], link: [158, 58, 80] },
  day: { bg: [244, 239, 230], text: [35, 39, 47], accent: [14, 16, 22], link: [32, 96, 192] },
  dusk: { bg: [94, 63, 71], text: [245, 221, 204], accent: [255, 226, 196], link: [242, 166, 90] },
};

const A_NIGHT = -14;
const A_DAY = 18;

// Colour of the sun/moon dot per phase.
const BODYCOL = { dawn: '#e8864a', day: '#e8972b', dusk: '#ff9a45', night: '#c8d2ec' };

// The background travels through real twilight colours between the anchors.
const BLUE = [34, 46, 92];
const EMBER = [138, 80, 86];
const GOLD = [232, 174, 116];
const RISE = [[-90, PAL.night.bg], [-14, PAL.night.bg], [-9, BLUE], [-4, EMBER], [0, PAL.dawn.bg], [18, PAL.day.bg], [90, PAL.day.bg]];
const FALL = [[-90, PAL.night.bg], [-14, PAL.night.bg], [-5, BLUE], [0, PAL.dusk.bg], [6, GOLD], [18, PAL.day.bg], [90, PAL.day.bg]];

function sstep(x) {
  const c = x < 0 ? 0 : x > 1 ? 1 : x;
  return c * c * (3 - 2 * c);
}

function mix(a, b, t) {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}

function gradAt(stops, alt) {
  if (alt <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (alt <= stops[i][0]) {
      const a = stops[i - 1];
      const b = stops[i];
      const t = sstep((alt - a[0]) / (b[0] - a[0]));
      return [a[1][0] + (b[1][0] - a[1][0]) * t, a[1][1] + (b[1][1] - a[1][1]) * t, a[1][2] + (b[1][2] - a[1][2]) * t];
    }
  }
  return stops[stops.length - 1][1];
}

function relLum(c) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}

function rgbStr(c) {
  return `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
}

function skyVars(alt, rising) {
  let A;
  let B;
  let s;
  let crossing;
  if (alt <= A_NIGHT) {
    A = B = PAL.night;
    s = 0;
    crossing = false;
  } else if (alt >= A_DAY) {
    A = B = PAL.day;
    s = 0;
    crossing = false;
  } else {
    const twi = rising ? PAL.dawn : PAL.dusk;
    if (alt < 0) {
      A = PAL.night;
      B = twi;
      s = sstep((alt - A_NIGHT) / (0 - A_NIGHT));
      crossing = rising;
    } else {
      A = twi;
      B = PAL.day;
      s = sstep(alt / A_DAY);
      crossing = !rising;
    }
  }
  const bg = gradAt(rising ? RISE : FALL, alt);
  // the body ink snaps at the background's own dark/light crossover so it
  // never fades to an unreadable mid-tone.
  const si = crossing ? (relLum(bg) < 0.3 ? 0 : 1) : s;
  return {
    bg: rgbStr(bg),
    dark: relLum(bg) < 0.3,
    accent: mix(A.accent, B.accent, si),
    text: mix(A.text, B.text, si),
    link: mix(A.link, B.link, si),
  };
}

// Full solar state for a given local hour and calendar date.
function solarState(hour, date, lat) {
  const doy = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const dec = -23.44 * Math.cos(RAD * (360 / 365) * (doy + 10)) * RAD;
  const phi = lat * RAD;
  const H = (hour - 12) * 15 * RAD;
  const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)) / RAD;
  const cosH0 = (Math.sin(-0.833 * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
  const H0 = cosH0 <= -1 ? Math.PI : cosH0 >= 1 ? 0 : Math.acos(cosH0);
  const rising = H < 0;

  let phase;
  let arc;
  if (alt < -6) {
    phase = 'night';
    arc = 'bottom';
  } else if (alt >= 6) {
    phase = 'day';
    arc = 'top';
  } else {
    phase = rising ? 'dawn' : 'dusk';
    arc = 'top';
  }

  let frac;
  if (arc === 'top') {
    frac = H0 > 0 ? 0.5 + H / (2 * H0) : 0.5;
  } else {
    const Hn = H < 0 ? H + 2 * Math.PI : H;
    const span = 2 * Math.PI - 2 * H0;
    frac = span > 0 ? (Hn - H0) / span : 0.5;
  }
  frac = Math.max(0, Math.min(1, frac));

  return { phase, arc, frac, vars: skyVars(alt, rising) };
}

// ---- celestial arc geometry ----

function yAt(which, t, H) {
  return which === 'top'
    ? (H - 15) - (H - 30) * Math.sin(Math.PI * t)
    : 15 + (H - 30) * Math.sin(Math.PI * t);
}

function arcPath(which, width, H) {
  const pts = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    pts.push(`${i ? 'L' : 'M'}${(t * width).toFixed(1)} ${yAt(which, t, H).toFixed(1)}`);
  }
  return pts.join(' ');
}

// ---- content helpers ----

function firstSentences(about = '', max = 2) {
  const text = String(about).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const parts = text.match(/[^.!?]+[.!?]+/g);
  if (!parts) return text;
  return parts.slice(0, max).join(' ').trim();
}

function article(word = '') {
  return /^[aeiou]/i.test(String(word).trim()) ? 'an' : 'a';
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

export function SolarTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};

  // null = live (track the real clock); a number 0–24 freezes a chosen hour.
  const [manualHour, setManualHour] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const width = useViewportWidth();
  const compact = width < 600;
  const arcHeight = compact ? 96 : 132;

  // drift the live palette, arc, and clock through the day.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000);
    const onShow = () => setNow(new Date());
    window.addEventListener('pageshow', onShow);
    return () => {
      clearInterval(id);
      window.removeEventListener('pageshow', onShow);
    };
  }, []);

  const liveHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const sunHour = manualHour != null ? manualHour : liveHour;
  const st = useMemo(() => solarState(sunHour, now, LAT), [sunHour, now]);
  const { vars, phase, arc, frac } = st;

  // Reconcile with the shell's single dark-mode boolean. We track the last
  // darkness we synced: a mismatch on `darkMode` means the TopBar toggled
  // (so snap to a day/night hour); a mismatch on the computed palette means
  // the live sun crossed the horizon (so tell the shell to flip its icon).
  const reportedDark = useRef(darkMode);

  useEffect(() => {
    if (darkMode !== reportedDark.current) {
      reportedDark.current = darkMode;
      setManualHour(darkMode ? 23 : 12);
    }
  }, [darkMode]);

  useEffect(() => {
    if (vars.dark !== reportedDark.current) {
      reportedDark.current = vars.dark;
      onDarkModeChange?.(vars.dark);
    }
  }, [vars.dark, onDarkModeChange]);

  const theme = {
    bg: vars.bg,
    text: vars.text,
    accent: vars.accent,
    link: vars.link,
  };

  // ---- map CV.yaml into Sean's label / value structure ----

  const name = cv.name || 'Your Name';
  const headline = cv.headline || cv.currentJobTitle || 'multidisciplinary technologist';
  const location = cv.location || null;
  const email = cv.email || null;

  const socials = cv.social || [];
  const website = cv.website || null;

  const experience = useMemo(() => (Array.isArray(cv.experience) ? cv.experience : []), [cv.experience]);
  const current = useMemo(() => experience.find((e) => e.isCurrent) || experience[0] || null, [experience]);
  const pastCompanies = useMemo(() => {
    const seen = new Set();
    if (current?.company) seen.add(current.company);
    const out = [];
    for (const e of experience) {
      const company = e?.company;
      if (!company || seen.has(company)) continue;
      seen.add(company);
      out.push(company);
      if (out.length >= 3) break;
    }
    return out;
  }, [experience, current]);

  const bio = firstSentences(cv.about, 2);
  const tagline = cv.tagline && cv.tagline !== headline ? cv.tagline : null;

  const projects = useMemo(
    () => (Array.isArray(cv.projects) ? cv.projects : []).filter((p) => p?.name).slice(0, 4),
    [cv.projects],
  );

  const linkedin = pickSocialUrl(socials, ['linkedin']);
  const github = pickSocialUrl(socials, ['github']);
  const twitter = pickSocialUrl(socials, ['twitter', 'x']);
  const instagram = pickSocialUrl(socials, ['instagram']);

  const contacts = useMemo(() => {
    const out = [];
    if (email) out.push({ label: 'Email', url: `mailto:${email}` });
    if (twitter) out.push({ label: 'Twitter', url: twitter });
    if (instagram) out.push({ label: 'Instagram', url: instagram });
    if (github) out.push({ label: 'GitHub', url: github });
    if (linkedin) out.push({ label: 'LinkedIn', url: linkedin });
    return out;
  }, [email, twitter, instagram, github, linkedin]);

  const clockLabel = `${String(Math.floor(sunHour) % 24).padStart(2, '0')}:${String(Math.floor((sunHour % 1) * 60)).padStart(2, '0')}`;

  const dotX = (arc === 'bottom' ? 1 - frac : frac) * width;
  const dotY = yAt(arc, frac, arcHeight);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        {/* faint celestial arcs; the sun rides the top by day, the moon the
            bottom by night. Both tracks are always drawn. */}
        <SkyTop aria-hidden="true" style={{ height: arcHeight }}>
          <svg width="100%" height={arcHeight} viewBox={`0 0 ${width} ${arcHeight}`} preserveAspectRatio="none">
            <path d={arcPath('top', width, arcHeight)} vectorEffect="non-scaling-stroke" />
            {arc === 'top' && <circle r="6" cx={dotX} cy={dotY} fill={BODYCOL[phase]} />}
          </svg>
        </SkyTop>
        <SkyBottom aria-hidden="true" style={{ height: arcHeight }}>
          <svg width="100%" height={arcHeight} viewBox={`0 0 ${width} ${arcHeight}`} preserveAspectRatio="none">
            <path d={arcPath('bottom', width, arcHeight)} vectorEffect="non-scaling-stroke" />
            {arc === 'bottom' && <circle r="6" cx={dotX} cy={dotY} fill={BODYCOL[phase]} />}
          </svg>
        </SkyBottom>
        <Clock aria-hidden="true" style={{ '--arc-h': `${arcHeight}px` }}>{clockLabel}</Clock>

        <Main>
          <Intro>
            <h1>
              {name} is {article(headline)} {headline}
              {location ? ` based in ${location}` : ''}.
            </h1>
          </Intro>

          <Grid>
            {current && (
              <>
                <Label><em>Currently</em></Label>
                <Value>
                  {current.title}
                  {current.company ? (
                    <>
                      {' '}at{' '}
                      {website ? (
                        <a href={website} target="_blank" rel="noopener noreferrer">{current.company}</a>
                      ) : (
                        <Accent>{current.company}</Accent>
                      )}
                    </>
                  ) : null}
                  .
                </Value>
              </>
            )}

            {pastCompanies.length > 0 && (
              <>
                <Label><em>Past</em></Label>
                <Value>{pastCompanies.join(', ')}.</Value>
              </>
            )}

            {bio && (
              <>
                <Label><em>Bio</em></Label>
                <Value>{bio}</Value>
              </>
            )}

            {tagline && (
              <>
                <Label><em>Motivation</em></Label>
                <Value>{tagline}</Value>
              </>
            )}

            {projects.length > 0 && (
              <>
                <Label />
                <Value><Divider>–––</Divider></Value>
                {projects.map((project) => (
                  <React.Fragment key={project.name}>
                    <Label>
                      {project.url ? (
                        <a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a>
                      ) : (
                        <em>{project.name}</em>
                      )}
                    </Label>
                    <Value>{project.summary || ''}</Value>
                  </React.Fragment>
                ))}
              </>
            )}

            {contacts.length > 0 && (
              <>
                <Label><em>Contact</em></Label>
                <Value>
                  {contacts.map((c, i) => (
                    <React.Fragment key={c.label}>
                      <a href={c.url} target={c.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
                        {c.label}
                      </a>
                      {i < contacts.length - 1 ? ' - ' : ''}
                    </React.Fragment>
                  ))}
                </Value>
              </>
            )}
          </Grid>

          {/* scrub through the day and watch the palette morph; "Live" resumes
              tracking the real clock. */}
          <Controls>
            <input
              type="range"
              min="0"
              max="24"
              step="0.1"
              value={sunHour}
              aria-label="Time of day"
              onChange={(e) => setManualHour(parseFloat(e.target.value))}
            />
            <button
              type="button"
              className={manualHour == null ? 'active' : ''}
              onClick={() => setManualHour(null)}
            >
              {manualHour == null ? '● Live' : 'Live'}
            </button>
          </Controls>
        </Main>
      </Page>
    </ThemeProvider>
  );
}

// ---- styles ----

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.bg}; }
`;

const Page = styled.div`
  position: relative;
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 148px 1.25rem;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 500;
  -webkit-font-smoothing: antialiased;
  transition: background-color 1.2s linear, color 1.2s linear;
  overflow-x: hidden;

  @media (max-width: 600px) {
    padding: 112px 1.25rem;
    align-items: flex-start;
  }
`;

const Main = styled.main`
  width: 100%;
  max-width: 34rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Intro = styled.div`
  padding-bottom: 0.25rem;

  h1 {
    color: ${(props) => props.theme.accent};
    font-size: 16px;
    line-height: 1.3;
    font-weight: 500;
    transition: color 1.2s linear;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 0.28fr 1fr;
  column-gap: 0.75rem;
  row-gap: 0.4rem;

  a {
    color: ${(props) => props.theme.link};
    text-decoration: none;
    transition: color 1.2s linear;
  }
  a:hover { text-decoration: underline; }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    row-gap: 0.15rem;

    & > *:nth-child(even) { margin-bottom: 0.6rem; }
  }
`;

const Label = styled.div`
  font-style: italic;
  color: ${(props) => props.theme.text};

  a { font-style: italic; }
`;

const Value = styled.div`
  color: ${(props) => props.theme.text};
`;

const Accent = styled.span`
  color: ${(props) => props.theme.accent};
`;

const Divider = styled.span`
  color: ${(props) => props.theme.text};
  opacity: 0.7;
`;

const SkyBase = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  z-index: 4;
  pointer-events: none;
  color: ${(props) => props.theme.text};

  svg { display: block; width: 100%; }
  path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.2;
    stroke-opacity: 0.26;
  }
  circle { transition: fill 1.2s linear; }
`;

const SkyTop = styled(SkyBase)`
  top: var(--app-top-offset, 0px);
`;

const SkyBottom = styled(SkyBase)`
  bottom: 0;
`;

const Clock = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: calc(var(--app-top-offset, 0px) + var(--arc-h, 132px) - 40px);
  z-index: 4;
  pointer-events: none;
  text-align: center;
  color: ${(props) => props.theme.text};
  font-size: 15px;
  letter-spacing: 0.08em;
  transition: color 1.2s linear;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.75rem;
  opacity: 0.55;
  transition: opacity 0.2s ease;

  &:hover { opacity: 1; }

  input[type='range'] {
    flex: 1;
    height: 2px;
    -webkit-appearance: none;
    appearance: none;
    background: ${(props) => props.theme.text};
    opacity: 0.5;
    cursor: pointer;
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${(props) => props.theme.link};
    cursor: pointer;
  }
  input[type='range']::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: none;
    border-radius: 50%;
    background: ${(props) => props.theme.link};
    cursor: pointer;
  }

  button {
    flex: 0 0 auto;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: 13px;
    letter-spacing: 0.04em;
    color: ${(props) => props.theme.text};
    cursor: pointer;
  }
  button.active { color: ${(props) => props.theme.link}; }
`;
