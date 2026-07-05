import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { pickSocialUrl, getInitials, truncateText } from '../../utils/cvHelpers';

/**
 * VladSavrukTheme — a CV-driven remake of vladsavruk.com.
 *
 * The source is a whitespace-heavy designer portfolio on plain white: a
 * restrained "<Name> — <role>" masthead in an italic serif, a couple of short
 * intro sentences with inline pill links (works / services / email), a "•••"
 * divider, and its signature — a "Coverflow Interaction": a horizontal 3D
 * coverflow that autoplays, pauses on hover/drag, and can be stepped with
 * prev/next arrows or swiped. Projects have no imagery here, so each card is a
 * tastefully generated gradient panel keyed to its index. All content is drawn
 * from this app's CV via useCV(), never the original person's copy.
 *
 * Fonts: a clean sans (Geist/Inter/system) for body, a serif italic
 * (Sentient-like → Spectral/Georgia) for the name and pill accents.
 * Colors: white #fff ground, ink #111110, Tailwind grays (600/500/800/50).
 */

const SANS =
  "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF =
  "'Sentient', 'Spectral', 'Iowan Old Style', Georgia, 'Times New Roman', serif";

const lightTheme = {
  sans: SANS,
  serif: SERIF,
  isDark: false,
  bg: '#ffffff',
  ink: '#111110',
  name: '#111827',
  body: '#4b5563',
  muted: '#6b7280',
  faint: '#9ca3af',
  pillText: '#1f2937',
  pillBg: '#f9fafb',
  pillHover: '#f3f4f6',
  line: '#f3f4f6',
  underline: '#e5e7eb',
  stageBg: '#fafafa',
  cardMetaBg: '#ffffff',
  cardBorder: 'rgba(17, 17, 16, 0.08)',
  controlBg: 'rgba(255, 255, 255, 0.78)',
  controlBorder: 'rgba(75, 85, 99, 0.16)',
  cardShadow: '0 24px 48px -26px rgba(17, 17, 16, 0.35)',
};

const darkTheme = {
  sans: SANS,
  serif: SERIF,
  isDark: true,
  bg: '#0f0f0e',
  ink: '#f5f4f2',
  name: '#f6f5f3',
  body: '#a1a1aa',
  muted: '#8b8b93',
  faint: '#6b7280',
  pillText: '#e7e5e4',
  pillBg: 'rgba(255, 255, 255, 0.06)',
  pillHover: 'rgba(255, 255, 255, 0.11)',
  line: 'rgba(255, 255, 255, 0.07)',
  underline: 'rgba(255, 255, 255, 0.18)',
  stageBg: 'rgba(255, 255, 255, 0.02)',
  cardMetaBg: '#191917',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  controlBg: 'rgba(24, 24, 22, 0.82)',
  controlBorder: 'rgba(255, 255, 255, 0.14)',
  cardShadow: '0 26px 52px -24px rgba(0, 0, 0, 0.72)',
};

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.bg}; }
`;

function artGradient(index, dark) {
  const hue = (index * 47 + 8) % 360;
  const hue2 = (hue + 42) % 360;
  return dark
    ? `linear-gradient(145deg, hsl(${hue} 46% 34%), hsl(${hue2} 52% 22%))`
    : `linear-gradient(145deg, hsl(${hue} 74% 67%), hsl(${hue2} 66% 51%))`;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

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
    <path d="M3 2.2v7.6a.4.4 0 0 0 .61.34l6-3.8a.4.4 0 0 0 0-.68l-6-3.8A.4.4 0 0 0 3 2.2Z" fill="currentColor" />
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );

const Arrow = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true" style={{ marginLeft: '0.3em' }}>
    <path d="M3 9L9 3M9 3H4.5M9 3V7.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function VladSavrukTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const email = cv.email || null;
  const website = cv.website || null;
  const location = cv.location || null;
  const role = cv.currentJobTitle || cv.label || 'Researcher';

  const socials = cv.social || [];
  const linkedin = pickSocialUrl(socials, ['linkedin']);
  const github = pickSocialUrl(socials, ['github']);
  const facebook = pickSocialUrl(socials, ['facebook']);
  const instagram = pickSocialUrl(socials, ['instagram']);

  const currentOrg = cv.experience?.find((e) => e.isCurrent)?.company || cv.experience?.[0]?.company || null;

  const projects = useMemo(() => (cv.projects || []).slice(0, 12), [cv.projects]);
  const count = projects.length;

  // Synthesized intro (cv.about is empty) in a maker/designer voice.
  const introOne =
    "I'm interested in air quality, environmental health, and building tools that make messy data legible.";
  const introTwo = `I work as ${role}${currentOrg ? ` at ${currentOrg}` : ''}${
    location ? `, based in ${location}` : ''
  } — aiming for one clear direction that holds up in real use.`;

  // Coverflow state --------------------------------------------------------
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragU, setDragU] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [stageW, setStageW] = useState(560);

  const stageRef = useRef(null);
  const worksRef = useRef(null);
  const dirRef = useRef(1);
  const drag = useRef({ active: false, startX: 0, moved: false, pointerId: null });

  const cardW = clamp(Math.round(stageW * 0.6), 158, 288);
  const cardH = Math.round(cardW * 1.24);
  const stepPx = cardW * 0.56;

  // Measure the stage so the coverflow scales down cleanly at 390px.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => setStageW(el.clientWidth || 560);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Respect reduced-motion: no autoplay.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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

  // Autoplay ping-pong. Interval is cleaned up whenever playback stops.
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(advance, 3600);
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

  // Pointer drag / swipe (works for mouse + touch via Pointer Events).
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
    if (drag.current.moved) return; // was a swipe, not a tap
    if (i !== activeIndex) {
      dirRef.current = i > activeIndex ? 1 : -1;
      setActiveIndex(i);
    }
  };

  const scrollToWorks = (e) => {
    e.preventDefault();
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const active = projects[activeIndex] || null;

  const socialLinks = [
    { label: 'LinkedIn', url: linkedin },
    { label: 'GitHub', url: github },
    { label: 'Facebook', url: facebook },
    { label: 'Instagram', url: instagram },
  ].filter((s) => s.url);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Column>
          <TopRow>
            <Masthead aria-label="Breadcrumb">
              <span className="name">{name}</span>
              <span className="dash">—</span>
              <span className="role">{role}</span>
            </Masthead>
            <ToggleButton
              type="button"
              onClick={() => onDarkModeChange?.(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <SunMoon dark={darkMode} />
            </ToggleButton>
          </TopRow>

          <Intro>
            <p>{introOne}</p>
            <p>{introTwo}</p>
            <p>
              See my{' '}
              <PillLink as="a" href="#works" onClick={scrollToWorks}>
                works
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
                  Or reach me by{' '}
                  <PillLink href={`mailto:${email}`}>email</PillLink>.
                </>
              )}
            </p>
            <Dots aria-hidden="true">
              <span>•••</span>
            </Dots>
          </Intro>

          {count > 0 && (
            <Section ref={worksRef}>
              <Stage
                ref={stageRef}
                style={{ height: `${cardH + 8}px`, perspective: `${Math.round(cardW * 3.4)}px` }}
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
                aria-label="Coverflow of selected works"
                $dragging={isDragging}
              >
                <StageLabel aria-hidden="true">Coverflow Interaction</StageLabel>
                <Track>
                  {projects.map((p, i) => {
                    const eff = i - activeIndex + dragU;
                    const c = clamp(eff, -2.4, 2.4);
                    const ac = Math.abs(c);
                    const tx = c * stepPx;
                    const tz = -Math.min(ac, 2) * (cardW * 0.42);
                    const ry = -clamp(c, -1, 1) * 44;
                    const sc = 1 - Math.min(ac, 2) * 0.12;
                    const op = ac > 2.35 ? 0 : ac <= 1 ? 1 : Math.max(0, 1 - (ac - 1) * 0.72);
                    const zIndex = 200 - Math.round(ac * 20);
                    const isCenter = Math.round(eff) === 0;
                    return (
                      <Card
                        key={`${p.name}-${i}`}
                        onClick={() => selectCard(i)}
                        $center={isCenter}
                        aria-hidden={op < 0.1}
                        style={{
                          width: `${cardW}px`,
                          height: `${cardH}px`,
                          marginLeft: `${-cardW / 2}px`,
                          transform: `translate3d(${tx}px, 0, ${tz}px) rotateY(${ry}deg) scale(${sc})`,
                          opacity: op,
                          zIndex,
                          pointerEvents: op < 0.1 ? 'none' : 'auto',
                          transition: isDragging
                            ? 'none'
                            : 'transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.4s ease',
                        }}
                      >
                        <CardArt style={{ backgroundImage: artGradient(i, theme.isDark) }}>
                          <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                          <span className="initial">{getInitials(p.name, 2) || '·'}</span>
                        </CardArt>
                        <CardMeta>
                          <span className="cname">{p.name}</span>
                          {p.date && <span className="cdate">{p.date}</span>}
                        </CardMeta>
                      </Card>
                    );
                  })}
                </Track>
              </Stage>

              {active && (
                <Caption>
                  <span className="ctitle">{active.name}</span>
                  {active.summary && <span className="csum">{truncateText(active.summary, 130)}</span>}
                  {active.url && (
                    <a href={active.url} target="_blank" rel="noopener noreferrer">
                      View project
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
                    aria-label="Previous work"
                  >
                    <Chevron dir="left" />
                  </IconButton>
                  <IconButton
                    type="button"
                    onClick={() => go(1)}
                    disabled={activeIndex >= count - 1}
                    aria-label="Next work"
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

          <Footer>
            {location && (
              <p>
                Right now I&apos;m in {location}.
              </p>
            )}
            {(() => {
              const items = socialLinks.map((s) => ({ ...s, external: true }));
              if (email) items.push({ label: 'Email', url: `mailto:${email}`, external: false });
              if (items.length === 0) return null;
              return (
                <p>
                  You can also find me on{' '}
                  {items.map((it, i) => {
                    const sep = i === 0 ? '' : i === items.length - 1 ? ' or ' : ', ';
                    const linkProps = it.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {};
                    return (
                      <React.Fragment key={it.label}>
                        {sep}
                        <PillLink href={it.url} {...linkProps}>
                          {it.label}
                        </PillLink>
                      </React.Fragment>
                    );
                  })}
                  {email ? ' me directly.' : '.'}
                </p>
              );
            })()}
            <p className="copy">© {new Date().getFullYear()}, {name}</p>
          </Footer>
        </Column>
      </Page>
    </ThemeProvider>
  );
}

// Styles ------------------------------------------------------------------
const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: ${(p) => p.theme.bg};
  color: ${(p) => p.theme.body};
  font-family: ${(p) => p.theme.sans};
  -webkit-font-smoothing: antialiased;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Column = styled.div`
  width: 100%;
  max-width: 40rem;
  padding: clamp(2.5rem, 9vh, 6rem) 2rem clamp(4rem, 12vh, 9rem);
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const Masthead = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.875rem;
  min-width: 0;

  .name {
    font-family: ${(p) => p.theme.serif};
    font-style: italic;
    font-weight: 500;
    color: ${(p) => p.theme.name};
  }
  .dash {
    color: ${(p) => p.theme.faint};
  }
  .role {
    font-family: ${(p) => p.theme.serif};
    font-style: italic;
    color: ${(p) => p.theme.muted};
  }
`;

const ToggleButton = styled.button`
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(p) => p.theme.controlBorder};
  border-radius: 9px;
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
  padding-top: 1.4rem;
  max-width: 34rem;

  p {
    margin: 0;
    padding-top: 0.55rem;
    font-size: 0.9rem;
    line-height: 1.7;
    color: ${(p) => p.theme.body};
  }
`;

const PillLink = styled.a`
  display: inline-block;
  cursor: pointer;
  font-family: ${(p) => p.theme.serif};
  font-style: italic;
  font-weight: 500;
  color: ${(p) => p.theme.pillText};
  background: ${(p) => p.theme.pillBg};
  padding: 0 0.28rem;
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
  padding-top: 1.4rem;

  span {
    display: inline-block;
    padding: 0 0.5rem;
    border-radius: 6px;
    background: ${(p) => p.theme.pillBg};
    color: ${(p) => p.theme.faint};
    font-family: ${(p) => p.theme.serif};
    font-style: italic;
    letter-spacing: 0.1em;
  }
`;

const Section = styled.section`
  padding-top: 3rem;
`;

const Stage = styled.div`
  position: relative;
  width: 100%;
  border-radius: 14px;
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

const StageLabel = styled.div`
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  z-index: 40;
  padding: 0.15rem 0.45rem;
  font-size: 0.68rem;
  color: ${(p) => p.theme.muted};
  background: ${(p) => p.theme.controlBg};
  border: 1px solid ${(p) => p.theme.controlBorder};
  border-radius: 6px;
  backdrop-filter: blur(6px);
  pointer-events: none;
`;

const Track = styled.div`
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  display: block;
`;

const Card = styled.div`
  position: absolute;
  top: 4px;
  left: 50%;
  transform-origin: center center;
  will-change: transform, opacity;
  border-radius: 12px;
  overflow: hidden;
  background: ${(p) => p.theme.cardMetaBg};
  border: 1px solid ${(p) => p.theme.cardBorder};
  box-shadow: ${(p) => (p.$center ? p.theme.cardShadow : 'none')};
  display: flex;
  flex-direction: column;
`;

const CardArt = styled.div`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.96);

  .idx {
    position: absolute;
    top: 0.6rem;
    left: 0.7rem;
    font-size: 0.7rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    opacity: 0.85;
  }
  .initial {
    font-family: ${(p) => p.theme.serif};
    font-style: italic;
    font-weight: 600;
    font-size: clamp(2.4rem, 9vw, 3.6rem);
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.25);
  }
`;

const CardMeta = styled.div`
  flex: 0 0 auto;
  padding: 0.6rem 0.75rem 0.7rem;
  background: ${(p) => p.theme.cardMetaBg};
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  .cname {
    font-size: 0.78rem;
    font-weight: 500;
    color: ${(p) => p.theme.name};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cdate {
    font-size: 0.68rem;
    color: ${(p) => p.theme.faint};
    font-variant-numeric: tabular-nums;
  }
`;

const Caption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
  padding: 1.2rem 0.5rem 0;
  min-height: 4.5rem;

  .ctitle {
    font-family: ${(p) => p.theme.serif};
    font-style: italic;
    font-size: 1.02rem;
    color: ${(p) => p.theme.name};
  }
  .csum {
    font-size: 0.82rem;
    line-height: 1.55;
    color: ${(p) => p.theme.muted};
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
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: ${(p) => p.theme.faint};
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  color: ${(p) => p.theme.muted};
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

const Footer = styled.footer`
  padding-top: 4rem;
  text-align: center;

  p {
    margin: 0;
    padding-top: 0.55rem;
    font-size: 0.85rem;
    line-height: 1.7;
    color: ${(p) => p.theme.muted};
  }
  .copy {
    padding-top: 2.5rem;
    font-family: ${(p) => p.theme.serif};
    font-style: italic;
    color: ${(p) => p.theme.faint};
  }
`;
