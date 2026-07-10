import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Code2, Contact, ExternalLink, Mail } from 'lucide-react';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange } from '../../utils/cvHelpers';

const EMPTY = [];

function ReactiveDotField({ darkMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -1000, y: -1000 };
    let frame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let scrollY = window.scrollY;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const hour = new Date().getHours();
      const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
      const warm = hour < 10 || hour > 17;
      const base = darkMode ? [226, 229, 220] : [27, 29, 25];
      const accent = warm ? [212, 111, 58] : [78, 117, 150];
      const spacing = 40;
      const offsetY = -(scrollY % spacing);

      for (let y = offsetY; y < height + spacing; y += spacing) {
        for (let x = 0; x < width + spacing; x += spacing) {
          const distance = Math.hypot(pointer.x - x, pointer.y - y);
          const proximity = Math.max(0, 1 - distance / 150);
          const noise = media.matches ? 0 : (Math.sin((x + y) * 0.025 + time * 0.0012) + 1) * 0.04;
          const strength = 0.13 + proximity * 0.66 + noise;
          const tint = proximity * daylight * 0.45;
          const color = base.map((value, index) => Math.round(value * (1 - tint) + accent[index] * tint));
          context.beginPath();
          context.fillStyle = `rgba(${color.join(',')},${strength})`;
          context.arc(x, y, 1.35 + proximity * 1.25, 0, Math.PI * 2);
          context.fill();
        }
      }

      if (!media.matches) frame = window.requestAnimationFrame(draw);
    };

    const redraw = () => {
      window.cancelAnimationFrame(frame);
      draw(performance.now());
    };
    const onPointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      if (media.matches) redraw();
    };
    const onPointerLeave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
      if (media.matches) redraw();
    };
    const onScroll = () => {
      scrollY = window.scrollY;
      if (media.matches) redraw();
    };
    const onResize = () => {
      resize();
      redraw();
    };

    resize();
    draw();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    media.addEventListener?.('change', redraw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      media.removeEventListener?.('change', redraw);
    };
  }, [darkMode]);

  return <DotCanvas ref={canvasRef} aria-hidden="true" />;
}

function NetworkIcon({ network }) {
  const label = String(network || '').toLowerCase();
  if (label.includes('github')) return <Code2 aria-hidden="true" />;
  if (label.includes('linkedin')) return <Contact aria-hidden="true" />;
  if (label.includes('mail') || label.includes('email')) return <Mail aria-hidden="true" />;
  return <ExternalLink aria-hidden="true" />;
}

function WindowBlind({ darkMode, enabled, position, onPositionChange }) {
  const canvasRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      if (!enabled || position <= 0.001) return;

      const slatCount = 12;
      const slatHeight = height / slatCount;
      const visibleSlats = position * slatCount;
      const angle = (Math.PI * 2.5) / 180;

      if (darkMode) {
        const glow = context.createLinearGradient(0, 0, width, height);
        glow.addColorStop(0, 'rgba(233, 156, 51, .14)');
        glow.addColorStop(1, 'rgba(233, 156, 51, .02)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }

      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(angle);
      context.translate(-width / 2, -height / 2);
      for (let index = 0; index < slatCount; index += 1) {
        const coverage = Math.max(0, Math.min(1, visibleSlats - index));
        if (!coverage) continue;
        const center = (index + 0.5) * slatHeight;
        const halfShade = slatHeight * 0.28;
        const shade = context.createLinearGradient(0, center - halfShade, 0, center + halfShade);
        const alpha = (darkMode ? 0.72 : 0.34) * coverage;
        const color = darkMode ? '0, 0, 0' : '40, 32, 22';
        shade.addColorStop(0, `rgba(${color}, 0)`);
        shade.addColorStop(0.32, `rgba(${color}, ${alpha})`);
        shade.addColorStop(0.68, `rgba(${color}, ${alpha})`);
        shade.addColorStop(1, `rgba(${color}, 0)`);
        context.fillStyle = shade;
        context.fillRect(-width * 0.2, center - halfShade, width * 1.4, halfShade * 2);
      }
      context.restore();

      context.globalCompositeOperation = 'destination-in';
      const horizontalFade = context.createLinearGradient(0, 0, width, 0);
      horizontalFade.addColorStop(0, 'rgba(0,0,0,1)');
      horizontalFade.addColorStop(0.4, 'rgba(0,0,0,1)');
      horizontalFade.addColorStop(0.72, 'rgba(0,0,0,0)');
      context.fillStyle = horizontalFade;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [darkMode, enabled, position]);

  const setFromPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    onPositionChange(Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)));
  };

  const handlePointerDown = (event) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setFromPointer(event);
  };
  const handlePointerMove = (event) => {
    if (draggingRef.current) setFromPointer(event);
  };
  const handlePointerUp = (event) => {
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };
  const handleKeyDown = (event) => {
    const step = 0.06;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') onPositionChange(Math.min(1, position + step));
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') onPositionChange(Math.max(0, position - step));
    else if (event.key === 'Home') onPositionChange(0);
    else if (event.key === 'End') onPositionChange(1);
    else return;
    event.preventDefault();
  };

  return (
    <>
      <BlindCanvas ref={canvasRef} $dark={darkMode} $enabled={enabled} aria-hidden="true" />
      <BlindChain
        $enabled={enabled}
        $position={position}
        role="slider"
        tabIndex={enabled ? 0 : -1}
        aria-label="Window blind"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(position * 100)}
        title="Drag to raise or lower the blind"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      />
    </>
  );
}

export function JackHoganTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const [blindOn, setBlindOn] = useState(false);
  const [blindPosition, setBlindPosition] = useState(0.58);
  const nameParts = String(cv.name || 'Your Name').trim().split(/\s+/);
  const name = cv.name || 'Your Name';
  const role = cv.currentJobTitle || cv.label || 'Researcher · Hacker · Leader';
  const location = cv.location || 'Somewhere';
  const projects = cv.projects || EMPTY;
  const experience = cv.experience || EMPTY;
  const publications = cv.publications || EMPTY;
  const presentations = cv.presentations || EMPTY;

  const aboutParagraphs = useMemo(() => {
    if (cv.about?.trim()) return cv.about.trim().split(/\n{2,}/);
    return [
      `I work to create concise, useful solutions to complicated problems and have fun while doing so. I’m based in ${location}, working across research, technology, and public systems.`,
      `My interests lie in critical thinking, data, careful communication, and tools that make difficult work feel a little more human.`,
    ];
  }, [cv.about, location]);

  const writing = [...publications, ...presentations];

  return (
    <Page $dark={darkMode}>
      <ReactiveDotField darkMode={darkMode} />
      <SunWash aria-hidden="true" />
      <WindowBlind darkMode={darkMode} enabled={blindOn} position={blindPosition} onPositionChange={setBlindPosition} />
      <IdentityRail>
        <Name aria-label={name}>
          {nameParts.map((part) => <span key={part}>{part}</span>)}
        </Name>
        <Role>{role}</Role>
        <SocialRow aria-label="Social links">
          {cv.email && <a href={`mailto:${cv.email}`} aria-label="Email"><Mail aria-hidden="true" /></a>}
          {(cv.social || EMPTY).slice(0, 6).map((item) => (
            <a key={item.network} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.network}>
              <NetworkIcon network={item.network} />
            </a>
          ))}
        </SocialRow>
        <RailFooter>
          <RailControls>
            <BlindButton type="button" $active={blindOn} onClick={() => setBlindOn((current) => !current)} aria-label={blindOn ? 'Turn off window blind' : 'Turn on window blind'} aria-pressed={blindOn} title="Toggle window blind">
              ☼
            </BlindButton>
            <ModeButton type="button" onClick={() => onDarkModeChange?.(!darkMode)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {darkMode ? '☀' : '◐'}
            </ModeButton>
          </RailControls>
          <a href={cv.website || '#top'} target={cv.website ? '_blank' : undefined} rel={cv.website ? 'noopener noreferrer' : undefined}>
            ← {cv.website ? 'Personal site' : 'Home'} →
          </a>
          <span>© {new Date().getFullYear()} {name}</span>
        </RailFooter>
      </IdentityRail>

      <Content id="top">
        <Nav aria-label="Sections">
          <a href="#me">ME</a><i>•</i><a href="#work">WORK</a><i>•</i><a href="#notes">NOTES</a>
        </Nav>

        <Intro id="me">
          <h1>Hi, I’m {nameParts[0]}!</h1>
          {aboutParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </Intro>

        <Section id="work">
          <SectionTitle><span>Selected work</span><small>{String(projects.length).padStart(2, '0')} entries</small></SectionTitle>
          <CardGrid>
            {projects.slice(0, 8).map((project, index) => (
              <ProjectCard key={`${project.name}-${index}`} as={project.url ? 'a' : 'article'} href={project.url || undefined} target={project.url ? '_blank' : undefined} rel={project.url ? 'noopener noreferrer' : undefined}>
                <CardTop><span>{String(index + 1).padStart(2, '0')}</span><span>{project.date || 'UNDATED'} ↗</span></CardTop>
                <h2>{project.name || 'Untitled project'}</h2>
                <p>{project.summary || 'Selected project from the archive.'}</p>
              </ProjectCard>
            ))}
          </CardGrid>
        </Section>

        <Section>
          <SectionTitle><span>Experience</span><small>Timeline</small></SectionTitle>
          <Timeline>
            {experience.slice(0, 8).map((item, index) => (
              <TimelineRow key={`${item.company}-${item.title}-${index}`}>
                <time>{formatRange(item.startDate, item.endDate, { month: 'none', ongoingWhenNoEnd: true, presentLabel: 'Now' })}</time>
                <div><h3>{item.title}</h3><strong>{item.company}</strong><p>{item.highlights?.[0]}</p></div>
              </TimelineRow>
            ))}
          </Timeline>
        </Section>

        <Section id="notes">
          <SectionTitle><span>Notes & links</span><small>Index</small></SectionTitle>
          <NotesList>
            {(writing.length ? writing : projects.slice(0, 4)).map((item, index) => {
              const href = item.url || (item.doi ? `https://doi.org/${item.doi}` : null);
              return (
                <li key={`${item.title || item.name}-${index}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {href ? <a href={href} target="_blank" rel="noopener noreferrer">{item.title || item.name}</a> : <strong>{item.title || item.name}</strong>}
                  <time>{item.date || item.publisher || 'Archive'}</time>
                </li>
              );
            })}
          </NotesList>
        </Section>
      </Content>
    </Page>
  );
}

const Page = styled.div`
  --bg: ${({ $dark }) => $dark ? '#1c1917' : '#fafaf9'};
  --text: ${({ $dark }) => $dark ? '#f5f5f4' : '#0c0a09'};
  --muted: ${({ $dark }) => $dark ? '#a8a29e' : '#57534e'};
  --line: ${({ $dark }) => $dark ? '#44403c' : '#d6d3d1'};
  --card: ${({ $dark }) => $dark ? 'rgba(41,37,36,.82)' : 'rgba(250,250,249,.85)'};

  width: 100%;
  min-height: 100%;
  padding: 24px;
  position: relative;
  display: grid;
  grid-template-columns: 307px minmax(0, 768px);
  column-gap: 40px;
  align-items: start;
  color: var(--text);
  background-color: var(--bg);
  font-family: "Lora", Georgia, serif;

  *, *::before, *::after { box-sizing: border-box; }
  a { color: inherit; }

  @media (max-width: 1100px) and (min-width: 761px) {
    grid-template-columns: 260px minmax(0, 1fr);
    column-gap: 32px;
  }

  @media (max-width: 760px) {
    padding: 22px;
    grid-template-columns: 1fr;
    column-gap: 0;
  }
`;

const DotCanvas = styled.canvas`
  width: 100%;
  height: calc(100dvh - var(--app-top-offset, 0px));
  position: fixed;
  top: var(--app-top-offset, 0px);
  left: 0;
  z-index: 0;
  pointer-events: none;
  filter: blur(1.5px);
`;

const SunWash = styled.div`
  position: fixed;
  inset: var(--app-top-offset, 0px) 0 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(circle at 76% 12%, color-mix(in srgb, #e79b61 9%, transparent), transparent 42%);
  mix-blend-mode: multiply;
`;

const BlindCanvas = styled.canvas`
  width: 100%;
  height: calc(100dvh - var(--app-top-offset, 0px));
  position: fixed;
  top: var(--app-top-offset, 0px);
  left: 0;
  z-index: 3;
  opacity: ${({ $enabled }) => $enabled ? 1 : 0};
  pointer-events: none;
  filter: blur(2px);
  mix-blend-mode: ${({ $dark }) => $dark ? 'normal' : 'multiply'};
  transition: opacity 170ms ease;

  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

const BlindChain = styled.div`
  width: 14px;
  position: fixed;
  top: var(--app-top-offset, 0px);
  right: max(.3rem, env(safe-area-inset-right));
  bottom: 0;
  z-index: 4;
  border-radius: 0 0 8px 8px;
  cursor: grab;
  touch-action: none;
  pointer-events: ${({ $enabled }) => $enabled ? 'auto' : 'none'};
  background-image:
    radial-gradient(circle at 4px 5px, #8b8680 0 2.4px, transparent 3px),
    radial-gradient(circle at 10px 5px, #8b8680 0 2.4px, transparent 3px);
  background-size: 14px 10px;
  background-position: 0 ${({ $position }) => `calc(${Math.round($position * 100)}vh)`};
  background-repeat: repeat-y;
  transform: translateX(${({ $enabled }) => $enabled ? '0' : '190%'});
  transition: transform .42s cubic-bezier(.22, 1, .36, 1);

  &::before {
    content: '';
    width: 22px;
    height: 10px;
    position: absolute;
    top: 0;
    left: 50%;
    border-radius: 0 0 6px 6px;
    background: #8b8680;
    transform: translateX(-50%);
  }

  &:active { cursor: grabbing; }
  &:focus-visible { outline: 2px solid #4f9e73; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

const IdentityRail = styled.aside`
  min-height: calc(100dvh - var(--app-top-offset, 0px) - 48px);
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;

  @media (min-width: 761px) {
    position: sticky;
    top: 24px;
    height: calc(100dvh - var(--app-top-offset, 0px) - 48px);
  }

  @media (max-width: 760px) {
    min-height: auto;
    margin-bottom: 56px;
  }
`;

const Name = styled.div`
  display: flex;
  flex-direction: column;
  font: 400 72px/.875 "DM Serif Display", Georgia, serif;
  letter-spacing: -.015em;
`;

const Role = styled.div`
  margin-top: 16px;
  color: var(--muted);
  font: 400 20px/1.4 "DM Sans", sans-serif;
  text-transform: uppercase;
`;

const SocialRow = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  a { width: 28px; height: 28px; display: grid; place-items: center; color: var(--muted); text-decoration: none; transition: color 150ms ease, transform 150ms ease; }
  svg { width: 28px; height: 28px; stroke-width: 1.8; }
  a:hover { color: #4f9e73; transform: scale(1.1); }
`;

const RailFooter = styled.footer`
  margin-top: auto;
  padding-top: 36px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  font: 400 16px/1.4 "DM Mono", monospace;

  a { font-family: "DM Sans", sans-serif; text-decoration: none; }
  a:hover { text-decoration: underline; }

  @media (max-width: 760px) { margin-top: 34px; }
`;

const RailControls = styled.div`
  margin-bottom: 2px;
  display: flex;
  gap: 4px;
`;

const ModeButton = styled.button`
  width: 30px;
  height: 30px;
  border: 0;
  color: var(--text);
  background: transparent;
  cursor: pointer;
  font-size: 21px;
`;

const BlindButton = styled(ModeButton)`
  color: ${({ $active }) => $active ? '#4f9e73' : 'var(--muted)'};
`;

const Content = styled.main`
  width: 100%;
  max-width: 768px;
  min-width: 0;
  position: relative;
  z-index: 1;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 12px;
  font: 400 20px/1.4 "DM Sans", sans-serif;
  text-transform: uppercase;

  a { text-decoration: none; }
  a:first-child { font-weight: 700; }
  a:hover { text-decoration: underline; text-underline-offset: 4px; }
  i { color: var(--muted); font-style: normal; }
`;

const Intro = styled.section`
  min-height: calc(100dvh - var(--app-top-offset, 0px) - 76px);
  max-width: 768px;
  padding: 24px 0 80px;

  h1 { margin: 0 0 8px; font: 400 36px/1.12 "DM Serif Display", Georgia, serif; letter-spacing: 0; }
  > p { max-width: 768px; margin: 0 0 10px; font: 400 18px/1.55 "Lora", Georgia, serif; }

  @media (max-width: 760px) { min-height: auto; padding-bottom: 72px; }
`;

const Section = styled.section`
  padding: clamp(40px, 6vw, 76px) 0;
  border-top: 1px solid var(--line);
`;

const SectionTitle = styled.header`
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 20px;

  span { font: 700 clamp(30px, 4vw, 50px)/1 "DM Serif Display", Georgia, serif; }
  small { color: var(--muted); font: 700 9px/1 "DM Mono", monospace; text-transform: uppercase; }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);

  @media (max-width: 620px) { grid-template-columns: 1fr; }
`;

const ProjectCard = styled.article`
  min-width: 0;
  min-height: 240px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--card);
  text-decoration: none;

  h2 { margin: auto 0 0; font: 700 clamp(24px, 3vw, 38px)/.95 "DM Serif Display", Georgia, serif; }
  p { margin: 15px 0 0; color: var(--muted); font: 400 13px/1.45 "DM Sans", sans-serif; }
  &:hover { background: color-mix(in srgb, var(--card) 82%, var(--text)); }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font: 700 9px/1 "DM Mono", monospace;
`;

const Timeline = styled.div`border-top: 1px solid var(--line);`;

const TimelineRow = styled.article`
  padding: 24px 0;
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 24px;
  border-bottom: 1px solid var(--line);

  time { color: var(--muted); font: 600 10px/1.3 "DM Mono", monospace; }
  h3 { margin: 0; font: 700 19px/1.2 "DM Sans", sans-serif; }
  strong { display: block; margin-top: 4px; color: var(--muted); font: 600 12px/1.3 "DM Sans", sans-serif; }
  p { max-width: 650px; margin: 13px 0 0; font-size: 14px; line-height: 1.45; }

  @media (max-width: 520px) { grid-template-columns: 1fr; gap: 10px; }
`;

const NotesList = styled.ul`
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
  list-style: none;

  li { min-height: 56px; display: grid; grid-template-columns: 42px 1fr auto; align-items: center; gap: 16px; border-bottom: 1px solid var(--line); }
  li > span, time { color: var(--muted); font: 700 9px/1 "DM Mono", monospace; text-transform: uppercase; }
  a, strong { font: 600 14px/1.3 "DM Sans", sans-serif; text-decoration: none; }
  a:hover { text-decoration: underline; }

  @media (max-width: 520px) {
    li { grid-template-columns: 32px 1fr; padding: 14px 0; }
    time { grid-column: 2; }
  }
`;
