import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, isPresent } from '../../utils/cvHelpers';

/**
 * YongseokTheme — a faithful CV-driven remake of yongseok.me.
 *
 * A quiet zinc blog shell with a top bar (a KO · EN · JA language switch, a
 * ticking clock, and blog/about links) sitting above a dark hero panel filled
 * with a warping field of monospace glyphs and a glowing monospace wordmark.
 * Below, calm "about" and "log" sections render the CV, and a floating "scroll
 * to top"
 * control mirrors the source's 위로 올라가요 button. Everything comes from
 * CV.yaml; only the chrome and the rain are borrowed.
 */

const light = {
  bg: '#fafafa',
  panel: '#ffffff',
  ink: '#18181b',
  muted: '#71717a',
  line: '#e4e4e7',
  barBg: 'rgba(250,250,250,0.85)',
  accent: '#4f46e5',
};

const dark = {
  bg: '#0b0b0f',
  panel: '#141419',
  ink: '#f4f4f5',
  muted: '#a1a1aa',
  line: '#26262c',
  barBg: 'rgba(11,11,15,0.85)',
  accent: '#a5b4fc',
};

// The hero panel is dark in both modes (like the source), so its palette is fixed.
const HERO_BG = '#0c1024';

const GlobalStyle = createGlobalStyle`
  body { background: ${(props) => props.theme.bg}; }
`;

const LOCALES = {
  EN: { blog: 'log', about: 'about', top: 'back to top', updated: 'updated' },
  KO: { blog: '기록', about: '소개', top: '위로 올라가요', updated: '업데이트' },
  JA: { blog: 'ログ', about: 'について', top: '上に戻る', updated: '更新' },
};

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌ0123456789<>[]{}/\\=+*-abcdef';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString('en-GB', { hour12: false });
}

/**
 * Geometric distortions ported from the source's index.astro script. Each takes
 * a NORMALIZED (0..1) coordinate and a centre (cx,cy) and returns a displaced
 * normalized coordinate. The hero passes every glyph's grid position through the
 * active distortion each frame, so the whole field ripples and swirls.
 */
const DISTORTIONS = [
  // wave — a vertical ripple travelling across the field
  (x, y, cx, cy, time) => [x, y + Math.sin(x * 10 + time * 2) * 0.05],
  // spiral — rotate each point about the centre by an angle that grows with radius
  (x, y, cx, cy, time) => {
    const a = x - cx;
    const o = y - cy;
    const s = Math.sqrt(a * a + o * o);
    const c = Math.atan2(o, a) - Math.sqrt(s) * time * 0.5;
    return [cx + Math.cos(c) * s, cy + Math.sin(c) * s];
  },
  // zoom — a pulsing scale in and out from the centre
  (x, y, cx, cy, time) => {
    const a = Math.sin(time) * 0.5 + 1;
    const o = x - cx;
    const s = y - cy;
    return [cx + o * a, cy + s * a];
  },
  // hurricane — a swirling shear whose strength grows with distance
  (x, y, cx, cy, time) => {
    const a = time * 0.5;
    const o = x - cx;
    const s = y - cy;
    const c = Math.sqrt(o * o + s * s);
    return [
      cx + o * Math.cos(a) - s * Math.sin(a) * c * 0.01,
      cy + o * Math.sin(a) + s * Math.cos(a) * c * 0.01,
    ];
  },
];

const CYCLE_SEC = 7; // hold each distortion this long before cross-fading
const BLEND_SEC = 1.4; // cross-fade into the next distortion over this long
const WORDMARK_COLOR = 'rgba(190,206,255,0.95)';
const BRIGHT_COLOR = 'rgba(214,226,255,0.98)';

/** A centred, boxed ASCII wordmark of `name`; degrades gracefully when narrow. */
function makeBanner(rawName, cols) {
  const label =
    String(rawName || '')
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .trim() || 'HELLO';
  const padded = `  ${label}  `;
  const maxInner = Math.max(3, cols - 4);
  if (padded.length > maxInner) {
    const inner = Math.max(1, cols - 2);
    return [label.length > inner ? label.slice(0, inner) : label];
  }
  const bar = '═'.repeat(padded.length);
  return [`╔${bar}╗`, `║${padded}║`, `╚${bar}╝`];
}

/**
 * A warping field of monospace glyphs confined to the hero canvas. A grid of
 * mono cells fills the panel; the centre region is seeded with a boxed ASCII
 * wordmark of the name so a recognizable shape surfaces from the noise. Every
 * frame each cell's base position is pushed through the active distortion and
 * the glyph is drawn at the displaced spot — the field undulates and swirls
 * instead of falling.
 */
function AsciiWarp({ name }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const fontSize = 15;
    const cellW = fontSize * 0.62; // monospace advance width
    const cellH = fontSize * 1.15; // line height

    let raf = 0;
    let cols = 0;
    let rows = 0;
    let glyphs = [];
    let colors = [];
    let mark = [];
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    // Seed the grid: a fixed glyph + colour per cell, wordmark region reserved.
    function build() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      cols = Math.max(1, Math.floor(w / cellW));
      rows = Math.max(1, Math.floor(h / cellH));
      const total = cols * rows;
      glyphs = new Array(total);
      colors = new Array(total);
      mark = new Array(total);

      const banner = makeBanner(name, cols);
      let bw = 0;
      for (const line of banner) bw = Math.max(bw, line.length);
      const bh = banner.length;
      const startCol = Math.floor((cols - bw) / 2);
      const startRow = Math.floor((rows - bh) / 2);

      for (let j = 0; j < rows; j += 1) {
        for (let i = 0; i < cols; i += 1) {
          const k = j * cols + i;
          let ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          let wm = false;
          const bj = j - startRow;
          if (bj >= 0 && bj < bh) {
            const line = banner[bj];
            const bi = i - startCol;
            if (bi >= 0 && bi < line.length && line[bi] !== ' ') {
              ch = line[bi];
              wm = true;
            }
          }
          glyphs[k] = ch;
          mark[k] = wm;
          colors[k] = wm
            ? WORDMARK_COLOR
            : `rgba(129,161,255,${(0.3 + Math.random() * 0.45).toFixed(2)})`;
        }
      }
    }

    function resize() {
      const parent = canvas.parentElement;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      build();
    }

    // Render one frame at animation time `t` (seconds).
    function draw(t) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = HERO_BG;
      ctx.fillRect(0, 0, w, h);

      // Pick the active distortion and cross-fade into the next near the end.
      const n = DISTORTIONS.length;
      const pos = t / CYCLE_SEC;
      const idx = Math.floor(pos) % n;
      const distA = DISTORTIONS[idx];
      const distB = DISTORTIONS[(idx + 1) % n];
      const frac = pos - Math.floor(pos);
      const blendStart = 1 - BLEND_SEC / CYCLE_SEC;
      const mix = frac > blendStart ? (frac - blendStart) / (BLEND_SEC / CYCLE_SEC) : 0;

      const cx = 0.5;
      const cy = 0.5;
      for (let j = 0; j < rows; j += 1) {
        for (let i = 0; i < cols; i += 1) {
          const k = j * cols + i;
          const bx = (i + 0.5) / cols;
          const by = (j + 0.5) / rows;
          const p = distA(bx, by, cx, cy, t);
          let nx = p[0];
          let ny = p[1];
          if (mix > 0) {
            const q = distB(bx, by, cx, cy, t);
            nx += (q[0] - nx) * mix;
            ny += (q[1] - ny) * mix;
          }
          ctx.fillStyle = !mark[k] && Math.random() > 0.994 ? BRIGHT_COLOR : colors[k];
          ctx.fillText(glyphs[k], nx * w, ny * h);
        }
      }
    }

    function frame() {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const t = (now - start) / 1000;
      // A little flicker: mutate a handful of non-wordmark glyphs each frame.
      for (let m = 0; m < cols; m += 1) {
        const k = (Math.random() * glyphs.length) | 0;
        if (!mark[k]) glyphs[k] = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      draw(t);
      raf = requestAnimationFrame(frame);
    }

    resize();
    if (reduce) {
      draw(0.8); // a single, gently distorted static frame
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0.8);
    });
    ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [name]);

  return <Canvas ref={canvasRef} aria-hidden="true" />;
}

export function YongseokTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? dark : light;
  const [locale, setLocale] = useState('EN');
  const t = LOCALES[locale];
  const clock = useClock();
  const scrollRef = useRef(null);

  const name = cv.name || 'Your Name';
  const role = cv.currentJobTitle || cv.headline || '';
  const aboutLines = useMemo(() => {
    if (cv.about) {
      return String(cv.about)
        .split(/\n{2,}/)
        .map((s) => s.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    }
    const edu = cv.education?.[0];
    return [
      `${name} is ${role ? `a ${role.toLowerCase()} and ` : ''}a researcher${
        cv.location ? ` based in ${cv.location}` : ''
      }.`,
      edu
        ? `Currently ${edu.degree} in ${edu.area} at ${edu.institution}, focused on air quality and environmental health.`
        : 'Focused on air quality and environmental health.',
    ];
  }, [cv, name, role]);

  const experience = (cv.experience || []).slice(0, 6);
  const projects = (cv.projects || []).slice(0, 6);

  const scrollTop = () => {
    scrollRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page ref={scrollRef}>
        <Bar>
          <BrandLink href="#top">{name.toLowerCase()} · {t.blog}</BrandLink>
          <BarRight>
            <Langs>
              {['KO', 'EN', 'JA'].map((l, i) => (
                <React.Fragment key={l}>
                  {i > 0 && <span className="sep">|</span>}
                  <button
                    type="button"
                    className={l === locale ? 'active' : ''}
                    onClick={() => setLocale(l)}
                  >
                    {l}
                  </button>
                </React.Fragment>
              ))}
            </Langs>
            <Clock>{clock}</Clock>
            <NavLinks>
              <a href="#log">/ {t.blog}</a>
              <a href="#about">/ {t.about}</a>
            </NavLinks>
          </BarRight>
        </Bar>

        <span id="top" />
        <Hero>
          <AsciiWarp name={name} />
          <HeroInner>
            <HeroName>{name}</HeroName>
            {role && <HeroRole>{role}</HeroRole>}
          </HeroInner>
        </Hero>

        <Content>
          <Section id="about">
            <SectionLabel>{t.about}</SectionLabel>
            {aboutLines.map((line, i) => (
              <Para key={i}>{line}</Para>
            ))}
          </Section>

          {experience.length > 0 && (
            <Section id="log">
              <SectionLabel>{t.blog}</SectionLabel>
              {experience.map((e, i) => (
                <Entry key={`e-${i}`}>
                  <EntryDate>
                    {formatRange(e.startDate, e.endDate, {
                      month: 'short',
                      ongoingWhenNoEnd: e.isCurrent,
                    }) || (isPresent(e.endDate) ? 'Present' : '')}
                  </EntryDate>
                  <div>
                    <EntryTitle>{e.title}</EntryTitle>
                    <EntryMeta>{e.company}</EntryMeta>
                  </div>
                </Entry>
              ))}
            </Section>
          )}

          {projects.length > 0 && (
            <Section>
              <SectionLabel>projects</SectionLabel>
              {projects.map((p, i) => (
                <Entry key={`p-${i}`}>
                  <EntryDate>{p.date}</EntryDate>
                  <div>
                    {p.url ? (
                      <EntryTitle as="a" href={p.url} target="_blank" rel="noopener noreferrer">
                        {p.name}
                      </EntryTitle>
                    ) : (
                      <EntryTitle>{p.name}</EntryTitle>
                    )}
                    {p.summary && <EntryMeta>{p.summary}</EntryMeta>}
                  </div>
                </Entry>
              ))}
            </Section>
          )}

          <Footer>
            <button type="button" className="top" onClick={scrollTop}>
              ▲ {t.top}
            </button>
            <button type="button" className="mode" onClick={() => onDarkModeChange?.(!darkMode)}>
              {darkMode ? '☀' : '☾'}
            </button>
            <span className="copy">
              © {new Date().getFullYear()} · {name.toLowerCase()}
            </span>
          </Footer>
        </Content>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  height: 100%;
  overflow-y: auto;
  background: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.ink};
  font-family: 'Atkinson Hyperlegible', 'Inter', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
`;

const Bar = styled.header`
  position: sticky;
  top: var(--app-top-offset, 0px);
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: ${(props) => props.theme.barBg};
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${(props) => props.theme.line};
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }
`;

const BrandLink = styled.a`
  color: ${(props) => props.theme.ink};
  text-decoration: none;
  font-weight: 500;
`;

const BarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Langs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${(props) => props.theme.muted};

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: ${(props) => props.theme.muted};
    font: inherit;
    &.active {
      color: ${(props) => props.theme.accent};
      font-weight: 700;
    }
  }
  .sep {
    opacity: 0.5;
  }
`;

const Clock = styled.span`
  color: ${(props) => props.theme.muted};
  font-variant-numeric: tabular-nums;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 0.75rem;
  a {
    color: ${(props) => props.theme.ink};
    text-decoration: none;
    &:hover {
      color: ${(props) => props.theme.accent};
    }
  }
`;

const Hero = styled.div`
  position: relative;
  height: clamp(260px, 46dvh, 520px);
  background: ${HERO_BG};
  overflow: hidden;
`;

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  pointer-events: none;
`;

const HeroName = styled.h1`
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: clamp(2rem, 8vw, 4.5rem);
  letter-spacing: 0.02em;
  color: #eaf0ff;
  text-shadow: 0 0 24px rgba(129, 161, 255, 0.6);
`;

const HeroRole = styled.p`
  margin: 0.75rem 0 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(0.8rem, 2.5vw, 1rem);
  color: rgba(180, 200, 255, 0.85);
`;

const Content = styled.main`
  max-width: 46rem;
  margin: 0 auto;
  padding: 3rem 1.25rem 5rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 3.5rem);
`;

const SectionLabel = styled.h2`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: ${(props) => props.theme.accent};
  margin: 0 0 1.25rem;
`;

const Para = styled.p`
  margin: 0 0 1rem;
  color: ${(props) => props.theme.ink};
`;

const Entry = styled.article`
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 1rem;
  padding: 0.9rem 0;
  border-top: 1px solid ${(props) => props.theme.line};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
`;

const EntryDate = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: ${(props) => props.theme.muted};
  padding-top: 0.15rem;
`;

const EntryTitle = styled.div`
  font-weight: 600;
  color: ${(props) => props.theme.ink};
  text-decoration: none;
  &[href]:hover {
    color: ${(props) => props.theme.accent};
    text-decoration: underline;
  }
`;

const EntryMeta = styled.div`
  color: ${(props) => props.theme.muted};
  font-size: 0.95rem;
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid ${(props) => props.theme.line};
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: ${(props) => props.theme.muted};

  button {
    background: none;
    border: 1px solid ${(props) => props.theme.line};
    border-radius: 6px;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    color: ${(props) => props.theme.ink};
    font: inherit;
    &:hover {
      border-color: ${(props) => props.theme.accent};
      color: ${(props) => props.theme.accent};
    }
  }
  .copy {
    margin-left: auto;
  }
`;
