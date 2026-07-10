import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCV } from '../../contexts/ConfigContext';
import { getInitials } from '../../utils/cvHelpers';

const EMPTY = [];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now.toLocaleTimeString([], { hour12: false });
}

export function ChrisPramanaTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const [panel, setPanel] = useState(null);
  const [filter, setFilter] = useState('all');
  const [activeArtifact, setActiveArtifact] = useState(0);
  const reduceMotion = useReducedMotion();
  const clock = useClock();
  const name = cv.name || 'Your Name';
  const location = cv.location || 'Somewhere';
  const role = cv.currentJobTitle || cv.label || 'builder and researcher';
  const projects = cv.projects || EMPTY;

  const statement = useMemo(() => {
    if (cv.about?.trim()) return cv.about.trim();
    return `is focused on useful work with lasting impact. This season, ${name.split(' ')[0]} is building thoughtful systems across research and technology.`;
  }, [cv.about, name]);

  const handle = useMemo(() => {
    const github = (cv.social || EMPTY).find((item) => String(item?.network).toLowerCase() === 'github');
    return github?.username ? `@${github.username}` : cv.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') || name;
  }, [cv.social, cv.website, name]);

  const writing = useMemo(() => {
    const publications = (cv.publications || EMPTY).map((item) => ({
      name: item.title || item.name,
      summary: item.summary || item.publisher || 'Published writing',
      date: item.date,
      url: item.doi ? `https://doi.org/${item.doi}` : item.url,
      type: 'writing',
    }));
    const presentations = (cv.presentations || EMPTY).map((item) => ({
      name: item.name || item.title,
      summary: item.summary || item.event || 'Presentation',
      date: item.date,
      url: item.url,
      type: 'writing',
    }));
    const projectEntries = projects.map((item) => ({ ...item, type: 'project' }));
    return publications.length || presentations.length
      ? [...publications, ...presentations, ...projectEntries.slice(0, 3)]
      : projectEntries;
  }, [cv.presentations, cv.publications, projects]);

  const filteredWriting = filter === 'all'
    ? writing
    : writing.filter((item) => item.type === filter);

  const togglePanel = (next) => setPanel((current) => current === next ? null : next);

  return (
    <Desktop $dark={darkMode}>
      <CornerLocation>{location.toLowerCase()}</CornerLocation>
      <OrbitalMark aria-hidden="true"><span /><span /><i>{getInitials(name, 1, 'Y')}</i></OrbitalMark>

      <Hero>
        <h1>{name}</h1>
        <p>{statement}</p>
      </Hero>

      <AnimatePresence mode="popLayout">
        {panel && (
          <Sheet
            key={panel}
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.34, 1.15, 0.64, 1] }}
          >
            <SheetHeader>
              <span>{panel} / {name}</span>
              <button type="button" onClick={() => setPanel(null)} aria-label="Close panel">×</button>
            </SheetHeader>
            {panel === 'writing' && (
              <>
                <FilterBar aria-label="Writing filters">
                  {['all', 'writing', 'project'].map((value) => (
                    <FilterButton key={value} type="button" $active={filter === value} onClick={() => setFilter(value)}>
                      {value}
                    </FilterButton>
                  ))}
                </FilterBar>
                <WorkGrid>
                  {filteredWriting.slice(0, 8).map((item, index) => (
                    <ProjectLink
                      as={item.url ? 'a' : 'div'}
                      href={item.url || undefined}
                      target={item.url ? '_blank' : undefined}
                      rel={item.url ? 'noopener noreferrer' : undefined}
                      key={`${item.name}-${index}`}
                    >
                      <span>{String(index + 1).padStart(2, '0')} / {item.date || item.type}</span>
                      <strong>{item.name || 'Untitled entry'}</strong>
                      <p>{item.summary || 'Selected work from the archive.'}</p>
                    </ProjectLink>
                  ))}
                </WorkGrid>
              </>
            )}
            {panel === 'vault' && (
              <VaultStage>
                <VaultCaption>
                  <PanelLabel>Project artifacts</PanelLabel>
                  <strong>{projects[activeArtifact]?.name || 'The vault is ready'}</strong>
                  <p>{projects[activeArtifact]?.summary || 'Add projects to CV.yaml to fill this artifact pile.'}</p>
                </VaultCaption>
                <VaultPile>
                  {projects.slice(0, 6).map((project, index) => {
                    const selected = activeArtifact === index;
                    const offsets = [-52, -30, -8, 14, 36, 58];
                    const rotations = [-8, 6, -3, 8, -6, 3];
                    return (
                      <VaultCard
                        type="button"
                        key={`${project.name}-${index}`}
                        onClick={() => setActiveArtifact(index)}
                        animate={{
                          x: selected ? 0 : offsets[index],
                          y: selected ? -20 : index * 5,
                          rotate: selected ? 0 : rotations[index],
                          scale: selected ? 1.04 : 0.96,
                          zIndex: selected ? 20 : index + 1,
                        }}
                        whileHover={reduceMotion ? undefined : { y: selected ? -25 : index * 5 - 8, scale: selected ? 1.05 : 1 }}
                        transition={{ type: 'spring', stiffness: 330, damping: 27 }}
                        aria-pressed={selected}
                      >
                        <small>{String(index + 1).padStart(2, '0')} / {project.date || 'artifact'}</small>
                        <strong>{project.name || 'Untitled project'}</strong>
                      </VaultCard>
                    );
                  })}
                </VaultPile>
              </VaultStage>
            )}
          </Sheet>
        )}
      </AnimatePresence>

      <BottomBar>
        <Clock>{clock}</Clock>
        <Dock layout aria-label="Portfolio controls">
          <DockButton type="button" $active={!panel} onClick={() => setPanel(null)} aria-label="Home" data-label="Home">
            <span>⌂</span><small>Home</small>
          </DockButton>
          <DockButton type="button" $active={panel === 'writing'} onClick={() => togglePanel('writing')} aria-label="Writing" data-label="Writing">
            <span>✎</span><small>Writing</small>
          </DockButton>
          <DockButton type="button" $active={panel === 'vault'} onClick={() => togglePanel('vault')} aria-label="Vault" data-label="Vault">
            <span>▧</span><small>Vault</small>
          </DockButton>
          <DockDivider />
          <DockButton type="button" onClick={() => onDarkModeChange?.(!darkMode)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} data-label="Mode">
            <span>{darkMode ? '☀' : '◐'}</span><small>Mode</small>
          </DockButton>
          {cv.email && <DockLink href={`mailto:${cv.email}`} aria-label="Email" data-label="Email"><span>✉</span></DockLink>}
          <MusicChip layout>
            <div><small>NOW PLAYING</small><strong>{projects[0]?.name || role}</strong></div>
            <IdentityDisc>{getInitials(name, 2, 'YN')}</IdentityDisc>
          </MusicChip>
        </Dock>
        <Handle>{handle}</Handle>
      </BottomBar>
    </Desktop>
  );
}

const Desktop = styled.div`
  --glass: ${({ $dark }) => $dark ? 'rgba(24, 24, 25, .82)' : 'rgba(255, 255, 255, .78)'};
  --tooltip-bg: ${({ $dark }) => $dark ? '#f2f2ef' : '#151515'};
  --tooltip-text: ${({ $dark }) => $dark ? '#151515' : '#f2f2ef'};
  --engraved-fill: ${({ $dark }) => $dark ? '#101011' : '#f4f4f3'};
  --engraved-shadow: ${({ $dark }) => $dark ? 'rgba(0, 0, 0, .82)' : 'rgba(86, 86, 86, .24)'};
  --engraved-highlight: ${({ $dark }) => $dark ? 'rgba(255, 255, 255, .09)' : 'rgba(255, 255, 255, .96)'};
  width: 100%;
  height: 100%;
  min-height: 520px;
  position: relative;
  overflow: hidden;
  color: ${({ $dark }) => $dark ? '#ededeb' : '#171717'};
  background: ${({ $dark }) => $dark ? '#0e0e0f' : '#f4f4f3'};
  font-family: "DM Mono", ui-monospace, monospace;
  transition: color 180ms ease, background 180ms ease;

  *, *::before, *::after { box-sizing: border-box; }
  button, a { color: inherit; font: inherit; }
`;

const CornerLocation = styled.div`
  position: absolute;
  top: clamp(24px, 4vw, 48px);
  left: clamp(22px, 4vw, 48px);
  font-size: 14px;
  letter-spacing: .04em;
`;

const OrbitalMark = styled.div`
  width: 38px;
  height: 38px;
  position: absolute;
  top: clamp(22px, 4vw, 42px);
  right: clamp(22px, 4vw, 48px);
  transform: rotate(-18deg);

  span { position: absolute; inset: 16px 0 auto; height: 2px; background: currentColor; border-radius: 99px; }
  span:nth-child(2) { transform: rotate(118deg); }
  i { position: absolute; right: 0; bottom: 0; font: italic 18px/1 Georgia, serif; }
`;

const Hero = styled.main`
  width: min(570px, calc(100% - 44px));
  position: absolute;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);

  h1 {
    margin: 0;
    width: fit-content;
    color: var(--engraved-fill);
    text-shadow:
      -1px -1px 1px var(--engraved-shadow),
      1px 1px 1px var(--engraved-highlight),
      0 0 1px var(--engraved-shadow);
    font: 600 clamp(35px, 6vw, 56px)/.95 "DM Sans", sans-serif;
    letter-spacing: -.06em;
  }

  p {
    margin: 18px 0 0;
    max-width: 540px;
    color: var(--engraved-fill);
    text-shadow:
      -1px -1px 1px var(--engraved-shadow),
      1px 1px 1px var(--engraved-highlight);
    font: 400 clamp(14px, 1.7vw, 18px)/1.42 "DM Sans", sans-serif;
  }

  @media (max-width: 640px) { top: 40%; }
`;

const Sheet = styled(motion.section)`
  width: min(760px, calc(100% - 32px));
  max-height: min(430px, calc(100% - 190px));
  position: absolute;
  right: 16px;
  left: 16px;
  bottom: 96px;
  z-index: 4;
  margin: 0 auto;
  overflow: auto;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 20px;
  background: var(--glass);
  box-shadow: 0 24px 70px rgba(0,0,0,.18);
  backdrop-filter: blur(22px);
`;

const SheetHeader = styled.header`
  min-height: 44px;
  padding: 0 12px 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  font-size: 10px;
  text-transform: uppercase;

  button { width: 30px; height: 30px; border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-size: 20px; }
  button:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
`;

const PanelLabel = styled.div`
  margin-bottom: 12px;
  opacity: .5;
  font-size: 9px;
  text-transform: uppercase;
`;

const FilterBar = styled.div`
  padding: 12px 14px 0;
  display: flex;
  gap: 7px;
`;

const FilterButton = styled.button`
  padding: 7px 10px;
  border: 1px solid color-mix(in srgb, currentColor 13%, transparent);
  border-radius: 999px;
  color: inherit;
  background: ${({ $active }) => $active ? 'color-mix(in srgb, currentColor 11%, transparent)' : 'transparent'};
  cursor: pointer;
  font-size: 9px;
  text-transform: uppercase;
`;

const WorkGrid = styled.div`
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const ProjectLink = styled.div`
  min-width: 0;
  padding: 16px;
  border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 12px;
  text-decoration: none;

  > span { opacity: .45; font-size: 9px; text-transform: uppercase; }
  strong { margin-top: 18px; display: block; font: 600 17px/1.1 "DM Sans", sans-serif; }
  p { margin: 8px 0 0; opacity: .55; font: 400 11px/1.4 "DM Sans", sans-serif; }
  &:hover { background: color-mix(in srgb, currentColor 6%, transparent); }
`;

const VaultStage = styled.div`
  min-height: 330px;
  padding: 24px;
  display: grid;
  grid-template-columns: minmax(180px, .72fr) minmax(300px, 1.28fr);
  gap: 20px;

  @media (max-width: 620px) {
    min-height: 430px;
    grid-template-columns: 1fr;
  }
`;

const VaultCaption = styled.div`
  align-self: center;

  strong { display: block; font: 600 clamp(22px, 3vw, 34px)/1 "DM Sans", sans-serif; letter-spacing: -.035em; }
  p { margin: 14px 0 0; opacity: .58; font: 400 12px/1.45 "DM Sans", sans-serif; }
`;

const VaultPile = styled.div`
  min-height: 270px;
  position: relative;
  overflow: hidden;
  border: 1px dashed color-mix(in srgb, currentColor 16%, transparent);
  border-radius: 14px;
`;

const VaultCard = styled(motion.button)`
  width: min(270px, calc(100% - 54px));
  min-height: 166px;
  padding: 18px;
  position: absolute;
  top: 54px;
  left: calc(50% - min(135px, calc((100% - 54px) / 2)));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  border: 8px solid #f3f0e8;
  border-radius: 8px;
  color: #1b1b1b;
  background: #dedbd3;
  box-shadow: 0 7px 20px rgba(0,0,0,.2);
  cursor: pointer;
  text-align: left;

  small { opacity: .48; font-size: 9px; text-transform: uppercase; }
  strong { max-width: 220px; font: 700 20px/1.05 "DM Sans", sans-serif; letter-spacing: -.035em; }
`;

const BottomBar = styled.footer`
  position: absolute;
  right: clamp(22px, 4vw, 48px);
  bottom: clamp(22px, 4vw, 44px);
  left: clamp(22px, 4vw, 48px);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;

  @media (max-width: 600px) { grid-template-columns: 1fr auto; }
`;

const Clock = styled.div`font-size: 13px;`;
const Handle = styled.div`
  justify-self: end;
  font-size: 12px;

  @media (max-width: 600px) { display: none; }
`;

const Dock = styled(motion.div)`
  min-height: 60px;
  padding: 6px 7px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid color-mix(in srgb, currentColor 13%, transparent);
  border-radius: 999px;
  background: var(--glass);
  box-shadow: 0 8px 30px rgba(0,0,0,.08);
  backdrop-filter: blur(18px);

  @media (max-width: 600px) { justify-self: end; }
`;

const DockButton = styled.button`
  width: 47px;
  height: 47px;
  position: relative;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: ${({ $active }) => $active ? 'color-mix(in srgb, currentColor 10%, transparent)' : 'transparent'};
  cursor: pointer;

  span { font-size: 18px; line-height: 1; }
  small { display: none; }
  &:hover { background: color-mix(in srgb, currentColor 8%, transparent); }

  &::after {
    content: attr(data-label);
    position: absolute;
    bottom: calc(100% + 10px);
    padding: 5px 7px;
    border-radius: 6px;
    color: var(--tooltip-text);
    background: var(--tooltip-bg);
    opacity: 0;
    pointer-events: none;
    transform: translateY(4px);
    transition: opacity 120ms ease, transform 120ms ease;
    font-size: 8px;
  }
  &:hover::after, &:focus-visible::after { opacity: 1; transform: translateY(0); }
`;

const DockLink = styled.a`
  width: 47px;
  height: 47px;
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 50%;
  text-decoration: none;

  &:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
`;

const DockDivider = styled.i`
  width: 1px;
  height: 28px;
  margin: 0 3px;
  background: color-mix(in srgb, currentColor 13%, transparent);
`;

const IdentityDisc = styled.div`
  width: 47px;
  height: 47px;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 50%;
  font: 600 10px/1 "DM Sans", sans-serif;
`;

const MusicChip = styled(motion.div)`
  min-width: 168px;
  height: 47px;
  padding-left: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid color-mix(in srgb, currentColor 11%, transparent);
  border-radius: 8px 24px 24px 8px;
  overflow: hidden;

  > div:first-child { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  small { opacity: .4; font-size: 7px; }
  strong { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 600 9px/1 "DM Sans", sans-serif; }

  @media (max-width: 680px) { display: none; }
`;
