import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, isPresent } from '../../utils/cvHelpers';

/**
 * YongseokTheme — a faithful CV-driven remake of yongseok.me.
 *
 * A quiet zinc blog shell with a top bar (a KO · EN · JA language switch, a
 * ticking clock, and blog/about links) sitting above a dark hero panel filled
 * with a soft matrix-style ASCII rain and a glowing monospace wordmark. Below,
 * calm "about" and "log" sections render the CV, and a floating "scroll to top"
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
const HERO_GLYPH = 'rgba(129,161,255,0.85)';
const HERO_FAINT = 'rgba(129,161,255,0.16)';

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

/** Matrix-style ASCII rain confined to the hero canvas. */
function AsciiRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let cols = 0;
    let drops = [];
    const fontSize = 16;

    function resize() {
      const parent = canvas.parentElement;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * (h / fontSize));
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
    }

    function frame() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = 'rgba(12,16,36,0.18)';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < cols; i += 1) {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = Math.random() > 0.975 ? 'rgba(180,200,255,0.95)' : HERO_GLYPH;
        ctx.fillText(ch, x, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      }
      raf = requestAnimationFrame(frame);
    }

    function drawStatic() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = HERO_BG;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = HERO_FAINT;
      for (let y = fontSize; y < h; y += fontSize) {
        for (let x = 0; x < w; x += fontSize) {
          if (Math.random() > 0.5) ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, y);
        }
      }
    }

    resize();
    if (reduce) {
      drawStatic();
    } else {
      ctx.fillStyle = HERO_BG;
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) drawStatic();
    });
    ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

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
          <AsciiRain />
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
