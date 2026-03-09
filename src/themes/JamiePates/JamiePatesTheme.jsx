import React, { useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDateRange, formatMonthYear } from '../../utils/cvHelpers';

const PAGE_LABELS = {
  home: 'Homepage',
  projects: 'Projects',
  skills: 'Skills',
  history: 'History',
  config: 'Config',
};

const MENU_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'history', label: 'History' },
  { id: 'config', label: 'Config' },
];

const DEFAULT_WINDOW_COLORS = {
  topLeft: [2, 34, 186],
  topRight: [2, 24, 145],
  bottomLeft: [0, 15, 105],
  bottomRight: [0, 3, 50],
};

const COLOR_KEYS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
const MATERIA_COLORS = ['green', 'blue', 'yellow', 'pink', 'red'];

const AUDIO_FILES = {
  back: 'back.mp3',
  error: 'error.mp3',
  heal: 'heal.mp3',
  save: 'save.mp3',
  saveSelect: 'saveSelect.mp3',
  select: 'select.mp3',
  slash: 'slash.mp3',
};

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Departure Mono';
    src: url('/fonts/DepartureMono-Regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  body.crt-effect::before,
  body.crt-effect::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 999;
  }

  body.crt-effect::before {
    opacity: 0.14;
    background:
      linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 0 1px, transparent 1px 4px),
      linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 255, 0.02));
  }

  body.crt-effect::after {
    opacity: 0.08;
    animation: crtFlicker 140ms steps(2) infinite;
    background: rgba(255, 255, 255, 0.04);
  }

  @keyframes crtFlicker {
    0%,
    100% {
      opacity: 0.06;
    }

    50% {
      opacity: 0.11;
    }
  }
`;

function splitDetails(details = '') {
  return details
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProjectTechnologies(project = {}) {
  const source = (project.highlights || []).find((item) => /^technologies\s*-/i.test(item || ''));
  if (!source) return [];
  return source
    .replace(/^technologies\s*-\s*/i, '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function wrapLines(text = '', width = 38) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (words.length === 0) return [];

  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > width) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function getSummary(cv) {
  if (cv.about) return cv.about;
  if (cv.currentJobTitle && cv.location) {
    return `I'm a ${cv.currentJobTitle} based in ${cv.location}. Welcome to this personal sandbox built around live CV data with a PS1 interface treatment.`;
  }
  if (cv.currentJobTitle) {
    return `I'm a ${cv.currentJobTitle}. Welcome to this personal sandbox built around live CV data with a PS1 interface treatment.`;
  }
  return 'Welcome to this personal sandbox. Profile, projects, skills, and archive data are all pulled from CV.yaml.';
}

function getInitials(name = '') {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return 'CV';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function getLevel(cv) {
  const experience = (cv.experience || []).length;
  const projects = (cv.projects || []).length;
  const awards = (cv.awards || []).length;
  const education = (cv.education || []).length;
  return Math.min(99, 8 + experience * 4 + projects * 3 + awards * 2 + education);
}

function getGil(cv) {
  return (
    12000 +
    (cv.projects || []).length * 3400 +
    (cv.awards || []).length * 1800 +
    (cv.publications || []).length * 2200
  );
}

function getWindowStyle(colors) {
  return {
    backgroundImage: `
      linear-gradient(135deg, rgb(${colors.topLeft.join(',')}) 0%, transparent 50%, rgb(${colors.bottomRight.join(',')}) 100%),
      linear-gradient(45deg, rgb(${colors.bottomLeft.join(',')}) 0%, rgb(${colors.topRight.join(',')}) 100%)
    `,
  };
}

function buildSkills(cv) {
  const skillEntries = [];

  for (const item of cv.sectionsRaw?.certifications_skills || []) {
    const parts = splitDetails(item.details);
    for (const part of parts) {
      skillEntries.push({
        name: part,
        description: /cert/i.test(item.label || '')
          ? 'Loaded from certification inventory.'
          : 'Loaded from profile skill inventory.',
      });
    }
  }

  for (const project of cv.projects || []) {
    const technologies = parseProjectTechnologies(project);
    for (const technology of technologies) {
      skillEntries.push({
        name: technology,
        description: `Observed in project file: ${project.name}.`,
      });
    }
  }

  const unique = [];
  const seen = new Set();

  for (const item of skillEntries) {
    const key = item.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique.slice(0, 12).map((item, index) => ({
    id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: item.name,
    description: item.description,
    score: (index % 5) + 1,
    color: MATERIA_COLORS[index % MATERIA_COLORS.length],
  }));
}

function buildHistoryRecords(cv, mode) {
  if (mode === 'education') {
    return (cv.education || []).map((item, index) => ({
      id: `education-${index}`,
      name: item.institution,
      role: item.degree || item.area || 'Education',
      year: formatDateRange(item.start_date || item.startDate, item.end_date || item.endDate),
      summary: item.highlights?.[0] || item.area || item.degree || '',
      detail: item.location || '',
      link: item.url || null,
    }));
  }

  if (mode === 'awards') {
    return (cv.awards || []).map((item, index) => ({
      id: `award-${index}`,
      name: item.name,
      role: item.summary || 'Award',
      year: formatMonthYear(item.date),
      summary: item.highlights?.[0] || item.summary || '',
      detail: item.location || '',
      link: item.url || null,
    }));
  }

  return (cv.sectionsRaw?.experience || []).map((item, index) => ({
    id: `experience-${index}`,
    name: item.company,
    role: item.position || item.positions?.[0]?.title || 'Role',
    year: formatDateRange(
      item.start_date || item.positions?.[0]?.start_date,
      item.end_date || item.positions?.[item.positions.length - 1]?.end_date
    ),
    summary:
      item.highlights?.[0] ||
      item.positions?.[0]?.highlights?.[0] ||
      item.location ||
      '',
    detail: item.location || '',
    link: item.url || null,
  }));
}

function colorToCss(rgb) {
  return `rgb(${rgb.join(',')})`;
}

function formatClock(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function openExternal(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function JamiePatesTheme() {
  const cv = useCV();
  const [page, setPage] = useState('home');
  const [selectedProject, setSelectedProject] = useState(0);
  const [hoverProject, setHoverProject] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState(0);
  const [historyMode, setHistoryMode] = useState('experience');
  const [historyPhase, setHistoryPhase] = useState('select');
  const [historyProgress, setHistoryProgress] = useState(0);
  const [seconds, setSeconds] = useState(184);
  const [viewportScale, setViewportScale] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [windowColors, setWindowColors] = useState(DEFAULT_WINDOW_COLORS);
  const [activeColorSlot, setActiveColorSlot] = useState('topLeft');
  const [configHint, setConfigHint] = useState('Tune the interface options.');
  const [booted, setBooted] = useState(false);
  const [currentHealth, setCurrentHealth] = useState(null);
  const [currentMana, setCurrentMana] = useState(null);
  const [damageText, setDamageText] = useState(null);
  const [portraitShake, setPortraitShake] = useState(false);

  const summary = useMemo(() => getSummary(cv || {}), [cv]);
  const summaryLines = useMemo(() => wrapLines(summary, 38).slice(0, 6), [summary]);
  const projectLines = useMemo(() => wrapLines((cv?.projects || [])[hoverProject]?.summary || '', 28).slice(0, 6), [cv, hoverProject]);
  const skills = useMemo(() => buildSkills(cv || {}), [cv]);
  const historyRecords = useMemo(() => buildHistoryRecords(cv || {}, historyMode), [cv, historyMode]);
  const windowStyle = useMemo(() => getWindowStyle(windowColors), [windowColors]);

  const maxHealth = useMemo(() => {
    if (!cv) return 1200;
    return 800 + (cv.experience || []).length * 140 + (cv.projects || []).length * 55;
  }, [cv]);

  const maxMana = useMemo(() => 300 + skills.length * 28 + (cv?.awards || []).length * 18, [cv, skills]);
  const level = useMemo(() => getLevel(cv || {}), [cv]);
  const gil = useMemo(() => getGil(cv || {}), [cv]);
  const nextLevelProgress = useMemo(() => Math.min(100, 16 + ((cv?.projects || []).length * 11 + skills.length * 4) % 84), [cv, skills]);
  const limitProgress = useMemo(() => Math.min(100, 35 + (cv?.awards || []).length * 12), [cv]);

  const quickLinks = useMemo(() => {
    if (!cv) return [];
    return [
      cv.website ? { label: 'Website', value: cv.website.replace(/^https?:\/\//, ''), href: cv.website } : null,
      cv.socialLinks?.github ? { label: 'GitHub', value: 'Open profile', href: cv.socialLinks.github } : null,
      cv.socialLinks?.linkedin ? { label: 'LinkedIn', value: 'Open profile', href: cv.socialLinks.linkedin } : null,
      cv.email ? { label: 'Mail', value: cv.email, href: `mailto:${cv.email}` } : null,
    ].filter(Boolean);
  }, [cv]);

  const projectItems = cv?.projects || [];
  const hoveredProjectItem = projectItems[hoverProject] || projectItems[0] || null;
  const activeSkill = skills[selectedSkill] || skills[0] || null;

  function playSound(name) {
    const file = AUDIO_FILES[name];
    if (!file || !soundEnabled) return;
    const audio = new Audio(`/jamie-pates/audio/${file}`);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }

  useEffect(() => {
    setBooted(true);
  }, []);

  useEffect(() => {
    function updateScale() {
      const scale = Math.min(window.innerWidth / 1250, window.innerHeight / 975);
      setViewportScale(scale);
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    window.visualViewport?.addEventListener('resize', updateScale);
    window.visualViewport?.addEventListener('scroll', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
      window.visualViewport?.removeEventListener('resize', updateScale);
      window.visualViewport?.removeEventListener('scroll', updateScale);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('crt-effect', crtEnabled);
    return () => document.body.classList.remove('crt-effect');
  }, [crtEnabled]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((value) => (value >= 35999 ? 0 : value + 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setCurrentHealth(maxHealth);
  }, [maxHealth]);

  useEffect(() => {
    setCurrentMana(maxMana);
  }, [maxMana]);

  useEffect(() => {
    setHoverProject(selectedProject);
  }, [selectedProject]);

  useEffect(() => {
    if (historyPhase !== 'loading') return undefined;

    const timer = window.setInterval(() => {
      setHistoryProgress((value) => {
        const next = value + 10;
        if (next >= 100) {
          playSound('save');
          window.setTimeout(() => setHistoryPhase('loaded'), 90);
          return 110;
        }
        return next;
      });
    }, 80);

    return () => window.clearInterval(timer);
  }, [historyPhase]);

  if (!cv) return null;

  function changePage(nextPage) {
    if (nextPage === page) return;
    playSound(nextPage === 'home' ? 'back' : 'select');
    setPage(nextPage);
    if (nextPage !== 'history') {
      setHistoryPhase('select');
      setHistoryProgress(0);
    }
  }

  function startHistory(mode) {
    playSound('select');
    setHistoryMode(mode);
    setHistoryProgress(0);
    setHistoryPhase('loading');
  }

  function updateColor(slot, channel, value) {
    setWindowColors((current) => ({
      ...current,
      [slot]: current[slot].map((component, index) => (
        index === channel ? Number(value) : component
      )),
    }));
  }

  function handlePortraitAction() {
    if (!currentHealth && currentHealth !== 0) return;

    if (currentHealth === 0) {
      if ((currentMana || 0) < 34) {
        playSound('error');
        return;
      }

      playSound('heal');
      setCurrentHealth(maxHealth);
      setCurrentMana((value) => Math.max(0, (value || 0) - 34));
      setDamageText('REVIVE');
      window.setTimeout(() => setDamageText(null), 850);
      return;
    }

    const damage = Math.floor(Math.random() * 80) + 40;
    playSound('slash');
    setPortraitShake(true);
    setCurrentHealth((value) => Math.max(0, (value || maxHealth) - damage));
    setDamageText(`-${damage}`);
    window.setTimeout(() => setPortraitShake(false), 260);
    window.setTimeout(() => setDamageText(null), 800);
  }

  return (
    <>
      <GlobalStyle />
      <ThemeRoot>
        <ViewportFrame style={{ transform: `scale(${viewportScale})` }} $booted={booted}>
          <Scene>
            <SceneBackdrop />

            <PageInfoBox style={windowStyle}>
              <PageInfoText>{PAGE_LABELS[page]}</PageInfoText>
            </PageInfoBox>

            <MenuBox style={windowStyle}>
              {page !== 'home' && (
                <CloseButton
                  type="button"
                  aria-label="Back to home"
                  onMouseEnter={() => playSound('select')}
                  onClick={() => changePage('home')}
                >
                  X
                </CloseButton>
              )}

              <MenuList>
                {MENU_ITEMS.map((item) => (
                  <MenuItemButton
                    key={item.id}
                    type="button"
                    $active={page === item.id}
                    onMouseEnter={() => playSound('select')}
                    onClick={() => changePage(item.id)}
                  >
                    {item.label}
                  </MenuItemButton>
                ))}

                {quickLinks.map((item) => (
                  <MenuExternalLink
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={() => playSound('select')}
                    onClick={() => playSound('saveSelect')}
                  >
                    {item.label}
                  </MenuExternalLink>
                ))}
              </MenuList>
            </MenuBox>

            {page === 'home' && (
              <>
                <PartyBox style={windowStyle}>
                  <StatusRow>
                    <PortraitWrap
                      type="button"
                      $shake={portraitShake}
                      $isDead={currentHealth === 0}
                      onMouseEnter={() => playSound('select')}
                      onClick={handlePortraitAction}
                    >
                      {damageText && <DamagePopup>{damageText}</DamagePopup>}
                      <PortraitCore>
                        <PortraitGlow />
                        <PortraitInitials>{getInitials(cv.name)}</PortraitInitials>
                      </PortraitCore>
                      {currentHealth === 0 && <ReviveNote>Use MP to revive</ReviveNote>}
                    </PortraitWrap>

                    <StatusMeta>
                      <StatusName>{cv.name}</StatusName>
                      <LevelLine>lv {String(level).padStart(2, '0')}</LevelLine>
                      <ResourceCounter>
                        <ResourceLabel>HP</ResourceLabel>
                        <ResourceNumbers>
                          <span>{String(currentHealth || 0).padStart(4, '0')}</span>
                          <span>/</span>
                          <span>{String(maxHealth).padStart(4, '0')}</span>
                        </ResourceNumbers>
                        <ResourceBar>
                          <ResourceFill
                            style={{ width: `${((currentHealth || 0) / maxHealth) * 100}%`, background: 'linear-gradient(90deg, #4f8fd4, #c6cded)' }}
                          />
                        </ResourceBar>
                      </ResourceCounter>

                      <ResourceCounter>
                        <ResourceLabel>MP</ResourceLabel>
                        <ResourceNumbers>
                          <span>{String(currentMana || 0).padStart(3, '0')}</span>
                          <span>/</span>
                          <span>{String(maxMana).padStart(3, '0')}</span>
                        </ResourceNumbers>
                        <ResourceBar>
                          <ResourceFill
                            style={{ width: `${((currentMana || 0) / maxMana) * 100}%`, background: 'linear-gradient(90deg, #63d9c1, #c6cded)' }}
                          />
                        </ResourceBar>
                      </ResourceCounter>
                    </StatusMeta>

                    <ProgressStack>
                      <ProgressLabel>next level</ProgressLabel>
                      <ProgressBar>
                        <ProgressFill style={{ width: `${nextLevelProgress}%`, backgroundColor: '#f5c4d0' }} />
                      </ProgressBar>
                      <ProgressLabel>Limit level {Math.min(4, 1 + Math.floor(limitProgress / 25))}</ProgressLabel>
                      <ProgressBar $limit>
                        <ProgressFill style={{ width: `${limitProgress}%`, backgroundColor: '#dfbddd' }} />
                      </ProgressBar>
                    </ProgressStack>
                  </StatusRow>

                  <BioBox style={windowStyle}>
                    {summaryLines.map((line, index) => (
                      <BioLine key={`${line}-${index}`} style={{ animationDelay: `${index * 70}ms` }}>
                        {line}
                      </BioLine>
                    ))}
                  </BioBox>
                </PartyBox>

                <MetaBox style={windowStyle}>
                  <MetaRow>
                    <span>Time</span>
                    <strong>{formatClock(seconds)}</strong>
                  </MetaRow>
                  <MetaRow>
                    <span>Gil</span>
                    <strong>{gil}</strong>
                  </MetaRow>
                </MetaBox>
              </>
            )}

            {page === 'projects' && (
              <PageArea>
                <HeaderBox style={windowStyle}>
                  <HeaderLabel>Use</HeaderLabel>
                </HeaderBox>

                <DescriptionBox style={windowStyle}>
                  <DescriptionText>{hoveredProjectItem?.name || 'Project selection unavailable.'}</DescriptionText>
                </DescriptionBox>

                <ContentLeftBox style={windowStyle}>
                  <CompactStatus onMouseEnter={() => playSound('select')}>
                    <PortraitChip>{getInitials(cv.name)}</PortraitChip>
                    <CompactStatusMeta>
                      <strong>{cv.name}</strong>
                      <span>{cv.currentJobTitle || 'Profile loaded'}</span>
                    </CompactStatusMeta>
                  </CompactStatus>

                  {!!projectLines.length && (
                    <InfoPanel style={windowStyle}>
                      {projectLines.map((line, index) => (
                        <InfoLine key={`${line}-${index}`}>{line}</InfoLine>
                      ))}
                    </InfoPanel>
                  )}
                </ContentLeftBox>

                <ContentRightBox style={windowStyle}>
                  <ActionList>
                    {projectItems.map((project, index) => (
                      <ActionItemButton
                        key={`${project.name}-${index}`}
                        type="button"
                        onMouseEnter={() => {
                          playSound('select');
                          setHoverProject(index);
                        }}
                        onClick={() => {
                          setSelectedProject(index);
                          openExternal(project.url);
                        }}
                      >
                        <ActionItemMain>
                          <ActionIcon>{String(index + 1).padStart(2, '0')}</ActionIcon>
                          <span>{project.name}</span>
                        </ActionItemMain>
                        <ActionCount>{project.date || '----'}</ActionCount>
                      </ActionItemButton>
                    ))}
                  </ActionList>
                </ContentRightBox>
              </PageArea>
            )}

            {page === 'skills' && (
              <PageArea>
                <TallHeaderBox style={windowStyle}>
                  <StatusRow $compact>
                    <CompactStatus>
                      <PortraitChip>{getInitials(cv.name)}</PortraitChip>
                      <CompactStatusMeta>
                        <strong>{cv.name}</strong>
                        <span>{cv.currentJobTitle || 'Profile loaded'}</span>
                      </CompactStatusMeta>
                    </CompactStatus>

                    <EquipmentColumn>
                      <EquipmentLabel>Wpn. Toolkit</EquipmentLabel>
                      <EquipmentSlots>
                        {skills.slice(0, 5).map((item) => (
                          <MateriaSlot key={item.id} data-color={item.color} />
                        ))}
                      </EquipmentSlots>
                      <EquipmentLabel>Arm. Stack</EquipmentLabel>
                      <EquipmentSlots>
                        {skills.slice(5, 9).map((item) => (
                          <MateriaSlot key={item.id} data-color={item.color} />
                        ))}
                      </EquipmentSlots>
                    </EquipmentColumn>
                  </StatusRow>
                </TallHeaderBox>

                <DescriptionBox style={windowStyle}>
                  <DescriptionText>{activeSkill?.description || 'Skill file not selected.'}</DescriptionText>
                </DescriptionBox>

                <ContentLeftBox $short style={windowStyle}>
                  <SkillPreviewName data-color={activeSkill?.color}>{activeSkill?.name || 'Unknown'}</SkillPreviewName>
                  <StarRow>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarDot key={index} $active={index < (activeSkill?.score || 0)} data-color={activeSkill?.color} />
                    ))}
                  </StarRow>
                </ContentLeftBox>

                <ContentRightBox $short style={windowStyle}>
                  <ActionList>
                    {skills.map((skill, index) => (
                      <ActionItemButton
                        key={skill.id}
                        type="button"
                        onMouseEnter={() => {
                          playSound('select');
                          setSelectedSkill(index);
                        }}
                        onClick={() => setSelectedSkill(index)}
                      >
                        <ActionItemMain>
                          <MateriaInline data-color={skill.color} />
                          <span>{skill.name}</span>
                        </ActionItemMain>
                      </ActionItemButton>
                    ))}
                  </ActionList>
                </ContentRightBox>
              </PageArea>
            )}

            {page === 'history' && (
              <PageArea>
                <HeaderBox style={windowStyle}>
                  <HeaderRow>
                    <HeaderLabel>{historyPhase === 'loaded' ? 'Select a file.' : 'Select a Save Data File.'}</HeaderLabel>
                    {historyPhase === 'loaded' && <HeaderFile>FILE {historyMode === 'experience' ? '01' : historyMode === 'education' ? '02' : '03'}</HeaderFile>}
                  </HeaderRow>
                </HeaderBox>

                <HistoryBody style={windowStyle}>
                  {historyPhase === 'select' && (
                    <CenteredSelector>
                      <SelectorButton
                        type="button"
                        onMouseEnter={() => playSound('select')}
                        onClick={() => startHistory('experience')}
                      >
                        Work
                      </SelectorButton>
                      <SelectorButton
                        type="button"
                        onMouseEnter={() => playSound('select')}
                        onClick={() => startHistory('education')}
                      >
                        Education
                      </SelectorButton>
                      <SelectorButton
                        type="button"
                        onMouseEnter={() => playSound('select')}
                        onClick={() => startHistory('awards')}
                      >
                        Awards
                      </SelectorButton>
                    </CenteredSelector>
                  )}

                  {historyPhase === 'loading' && (
                    <LoadingWrap>
                      <LoadingLabel>Checking Save Data File.</LoadingLabel>
                      <MemoryBar>
                        <MemoryFill style={{ width: `${historyProgress}%` }} />
                      </MemoryBar>
                    </LoadingWrap>
                  )}

                  {historyPhase === 'loaded' && (
                    <HistoryCardList>
                      {historyRecords.slice(0, 3).map((item, index) => (
                        <HistoryCard
                          key={item.id}
                          href={item.link || '#'}
                          onMouseEnter={() => playSound('select')}
                          onClick={(event) => {
                            if (!item.link) {
                              event.preventDefault();
                              playSound('error');
                            } else {
                              playSound('saveSelect');
                            }
                          }}
                        >
                          <HistoryThumb>{getInitials(item.name)}</HistoryThumb>
                          <HistoryInfo>
                            <HistoryName>{item.name}</HistoryName>
                            <HistoryMeta>{item.role}</HistoryMeta>
                            <HistorySummary>{item.summary}</HistorySummary>
                          </HistoryInfo>
                          <HistoryMetaBox style={windowStyle}>
                            <MetaRow>
                              <span>Role</span>
                              <strong>{item.role}</strong>
                            </MetaRow>
                            <MetaRow>
                              <span>Years</span>
                              <strong>{item.year}</strong>
                            </MetaRow>
                          </HistoryMetaBox>
                        </HistoryCard>
                      ))}
                    </HistoryCardList>
                  )}
                </HistoryBody>
              </PageArea>
            )}

            {page === 'config' && (
              <PageArea>
                <HeaderBox style={windowStyle}>
                  <HeaderLabel>{configHint}</HeaderLabel>
                </HeaderBox>

                <ConfigBody style={windowStyle}>
                  <ConfigRow
                    onMouseEnter={() => setConfigHint('Select colours for the window')}
                    onMouseLeave={() => setConfigHint('Tune the interface options.')}
                  >
                    <ConfigLabel>Window Color</ConfigLabel>

                    <ColorPicker>
                      <ColorQuadrants>
                        {COLOR_KEYS.map((slot) => (
                          <ColorQuadrantButton
                            key={slot}
                            type="button"
                            $active={slot === activeColorSlot}
                            style={{ backgroundColor: colorToCss(windowColors[slot]) }}
                            onMouseEnter={() => playSound('select')}
                            onClick={() => setActiveColorSlot(slot)}
                          />
                        ))}
                      </ColorQuadrants>

                      <SliderGroup>
                        {windowColors[activeColorSlot].map((value, index) => (
                          <SliderRow key={`${activeColorSlot}-${index}`}>
                            <span>{['R', 'G', 'B'][index]}</span>
                            <span>{String(value).padStart(3, '0')}</span>
                            <SliderInput
                              type="range"
                              min="0"
                              max="255"
                              value={value}
                              onChange={(event) => updateColor(activeColorSlot, index, event.target.value)}
                            />
                          </SliderRow>
                        ))}
                      </SliderGroup>
                    </ColorPicker>
                  </ConfigRow>

                  <ConfigRow
                    onMouseEnter={() => setConfigHint('Enable or disable sound')}
                    onMouseLeave={() => setConfigHint('Tune the interface options.')}
                  >
                    <ConfigLabel>Sound</ConfigLabel>
                    <ToggleButtons>
                      <ToggleButton
                        type="button"
                        $active={soundEnabled}
                        onMouseEnter={() => playSound('select')}
                        onClick={() => setSoundEnabled(true)}
                      >
                        On
                      </ToggleButton>
                      <ToggleButton
                        type="button"
                        $active={!soundEnabled}
                        onMouseEnter={() => playSound('select')}
                        onClick={() => setSoundEnabled(false)}
                      >
                        Off
                      </ToggleButton>
                    </ToggleButtons>
                  </ConfigRow>

                  <ConfigRow
                    onMouseEnter={() => setConfigHint('Enable or disable CRT effects')}
                    onMouseLeave={() => setConfigHint('Tune the interface options.')}
                  >
                    <ConfigLabel>CRT Effect</ConfigLabel>
                    <ToggleButtons>
                      <ToggleButton
                        type="button"
                        $active={crtEnabled}
                        onMouseEnter={() => playSound('select')}
                        onClick={() => setCrtEnabled(true)}
                      >
                        On
                      </ToggleButton>
                      <ToggleButton
                        type="button"
                        $active={!crtEnabled}
                        onMouseEnter={() => playSound('select')}
                        onClick={() => setCrtEnabled(false)}
                      >
                        Off
                      </ToggleButton>
                    </ToggleButtons>
                  </ConfigRow>
                </ConfigBody>
              </PageArea>
            )}
          </Scene>
        </ViewportFrame>
      </ThemeRoot>
    </>
  );
}

const bootIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const lineIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shake = keyframes`
  0%,
  100% {
    transform: translateY(0);
  }

  20% {
    transform: translateY(-6px);
  }

  40% {
    transform: translateY(8px);
  }

  60% {
    transform: translateY(-10px);
  }

  80% {
    transform: translateY(4px);
  }
`;

const pulse = keyframes`
  0%,
  100% {
    opacity: 0.65;
  }

  50% {
    opacity: 1;
  }
`;

const ThemeRoot = styled.div`
  min-height: calc(100vh - 56px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(59, 82, 180, 0.2), transparent 34%),
    radial-gradient(circle at bottom right, rgba(10, 105, 175, 0.14), transparent 30%),
    #000;
  background-image:
    radial-gradient(circle at top, rgba(59, 82, 180, 0.2), transparent 34%),
    radial-gradient(circle at bottom right, rgba(10, 105, 175, 0.14), transparent 30%),
    url('/jamie-pates/checkerboard.png');
  background-size: auto, auto, 340px 340px;
  font-family: 'Departure Mono', 'Courier New', monospace;
`;

const ViewportFrame = styled.div`
  width: 1100px;
  height: 825px;
  margin: 5rem auto;
  transform-origin: top center;
  opacity: ${({ $booted }) => ($booted ? 1 : 0)};
  animation: ${bootIn} 260ms ease-out both;
`;

const Scene = styled.div`
  position: relative;
  width: 1100px;
  height: 825px;
`;

const SceneBackdrop = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.06) 55%, transparent);
`;

const boxShell = css`
  position: absolute;
  border: 2.2px solid rgba(255, 255, 255, 0.24);
  border-top-color: rgba(255, 255, 255, 0.28);
  border-left-color: rgba(255, 255, 255, 0.28);
  border-bottom-color: rgba(0, 0, 0, 0.5);
  border-right-color: rgba(0, 0, 0, 0.5);
  border-radius: 6px;
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.35),
    0 18px 42px rgba(0, 0, 0, 0.28);
  color: #fff;
`;

const PageInfoBox = styled.div`
  ${boxShell}
  top: 0;
  right: 0;
  width: 535px;
  height: 95px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
`;

const PageInfoText = styled.div`
  font-size: 32px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const MenuBox = styled.div`
  ${boxShell}
  top: 190px;
  right: 0;
  width: 270px;
  min-height: 530px;
  padding: 18px 18px 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 0 6px 0 6px;
  background: rgba(8, 16, 42, 0.95);
  color: #fff6d1;
  cursor: pointer;
`;

const MenuList = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 10px;
`;

const interactiveHover = css`
  position: relative;
  cursor: pointer;

  &:hover::before,
  &:focus-visible::before {
    content: '';
    position: absolute;
    width: 76px;
    height: 46px;
    left: -72px;
    top: 50%;
    transform: translateY(-50%);
    background: url('/jamie-pates/cursor.png') center / contain no-repeat;
    pointer-events: none;
  }
`;

const MenuItemButton = styled.button`
  ${interactiveHover}
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ $active }) => ($active ? '#fff5af' : '#fff')};
  text-align: left;
  font-size: 26px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const MenuExternalLink = styled.a`
  ${interactiveHover}
  display: inline-block;
  color: #fff;
  font-size: 22px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const PartyBox = styled.div`
  ${boxShell}
  top: 44px;
  left: 0;
  width: 1000px;
  height: 720px;
  padding: 28px 28px 24px;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 28px;
  align-items: flex-start;

  ${({ $compact }) =>
    $compact &&
    css`
      align-items: center;
    `}
`;

const PortraitWrap = styled.button`
  ${interactiveHover}
  position: relative;
  border: 0;
  background: transparent;
  padding: 0;
  color: inherit;
  animation: ${({ $shake }) => ($shake ? shake : 'none')} 260ms linear;

  ${({ $isDead }) =>
    $isDead &&
    css`
      filter: grayscale(1) brightness(0.75);
    `}
`;

const PortraitCore = styled.div`
  position: relative;
  width: 165px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 38% 24%, rgba(255, 255, 255, 0.26), transparent 18%),
    linear-gradient(180deg, rgba(79, 143, 212, 0.3), rgba(11, 25, 61, 0.92)),
    linear-gradient(135deg, rgba(203, 215, 255, 0.18), transparent 45%);
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const PortraitGlow = styled.div`
  position: absolute;
  inset: 14px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(86, 167, 255, 0.26), transparent 70%);
  filter: blur(8px);
`;

const PortraitInitials = styled.div`
  position: relative;
  z-index: 1;
  font-size: 68px;
  line-height: 1;
  letter-spacing: 0.06em;
`;

const DamagePopup = styled.div`
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff5af;
  font-size: 24px;
  animation: ${lineIn} 120ms ease-out;
`;

const ReviveNote = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  white-space: nowrap;
`;

const StatusMeta = styled.div`
  flex: 1 1 auto;
  padding-top: 8px;
`;

const StatusName = styled.h1`
  margin: 0 0 10px;
  font-size: 38px;
  line-height: 1.05;
  text-transform: uppercase;
`;

const LevelLine = styled.div`
  margin-bottom: 18px;
  font-size: 22px;
  text-transform: lowercase;
`;

const ResourceCounter = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  align-items: start;
  margin-bottom: 16px;
`;

const ResourceLabel = styled.span`
  font-size: 18px;
  text-transform: uppercase;
`;

const ResourceNumbers = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;

  span:first-child {
    min-width: 92px;
    text-align: right;
  }

  span:last-child {
    min-width: 92px;
    text-align: right;
  }
`;

const ResourceBar = styled.div`
  grid-column: 2;
  height: 12px;
  margin-top: 6px;
  background: rgba(0, 0, 0, 0.42);
  border-radius: 999px;
  overflow: hidden;
`;

const ResourceFill = styled.div`
  height: 100%;
  transition: width 220ms ease-out;
`;

const ProgressStack = styled.div`
  width: 240px;
  padding-top: 30px;
`;

const ProgressLabel = styled.div`
  margin-bottom: 10px;
  font-size: 18px;
  text-transform: uppercase;
`;

const ProgressBar = styled.div`
  height: 14px;
  margin: 0 0 18px 22px;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 999px;
  overflow: hidden;

  ${({ $limit }) =>
    $limit &&
    css`
      animation: ${pulse} 1.2s linear infinite;
    `}
`;

const ProgressFill = styled.div`
  height: 100%;
  transition: width 220ms ease-out;
`;

const BioBox = styled.div`
  ${boxShell}
  position: absolute;
  left: 53px;
  right: 220px;
  top: 294px;
  height: 340px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
`;

const BioLine = styled.p`
  margin: 0;
  font-size: 28px;
  line-height: 1.14;
  animation: ${lineIn} 180ms ease-out both;
`;

const MetaBox = styled.div`
  ${boxShell}
  right: 0;
  bottom: 110px;
  width: 280px;
  height: 110px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 18px;
  font-size: 18px;
  text-transform: uppercase;

  strong {
    color: #fff;
  }
`;

const PageArea = styled.div`
  position: absolute;
  top: 44px;
  left: 0;
  width: 1000px;
  height: 720px;
`;

const HeaderBox = styled.div`
  ${boxShell}
  top: 0;
  left: 0;
  right: 315px;
  height: 84px;
  padding: 16px 22px;
  display: flex;
  align-items: center;
`;

const TallHeaderBox = styled(HeaderBox)`
  height: 261px;
  align-items: stretch;
`;

const HeaderLabel = styled.div`
  font-size: 26px;
  line-height: 1.3;
  text-transform: uppercase;
`;

const HeaderRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderFile = styled.div`
  font-size: 22px;
  color: #fff5af;
  text-transform: uppercase;
`;

const DescriptionBox = styled.div`
  ${boxShell}
  top: 93px;
  left: 0;
  right: 315px;
  height: 87px;
  padding: 16px 22px;
  display: flex;
  align-items: center;
`;

const DescriptionText = styled.div`
  font-size: 24px;
  line-height: 1.2;
  text-transform: uppercase;
`;

const ContentLeftBox = styled.div`
  ${boxShell}
  top: 190px;
  left: 0;
  width: 485px;
  bottom: 0;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${({ $short }) =>
    $short &&
    css`
      top: 359px;
    `}
`;

const ContentRightBox = styled.div`
  ${boxShell}
  top: 190px;
  right: 315px;
  width: 470px;
  bottom: 0;
  padding: 20px 22px;
  overflow: hidden;

  ${({ $short }) =>
    $short &&
    css`
      top: 359px;
    `}
`;

const CompactStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const PortraitChip = styled.div`
  width: 74px;
  height: 74px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(113, 198, 255, 0.9), rgba(95, 74, 255, 0.85));
  font-size: 28px;
`;

const CompactStatusMeta = styled.div`
  display: grid;
  gap: 6px;

  strong {
    font-size: 24px;
    text-transform: uppercase;
  }

  span {
    font-size: 16px;
    color: #d8e5ff;
  }
`;

const InfoPanel = styled.div`
  ${boxShell}
  position: static;
  min-height: 180px;
  padding: 18px 20px;
`;

const InfoLine = styled.p`
  margin: 0 0 10px;
  font-size: 22px;
  line-height: 1.25;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionList = styled.div`
  display: grid;
  gap: 10px;
  max-height: 100%;
  overflow: auto;
`;

const ActionItemButton = styled.button`
  ${interactiveHover}
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: #fff;
  text-align: left;
  font-size: 20px;
`;

const ActionItemMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionIcon = styled.div`
  width: 36px;
  color: #fff5af;
`;

const ActionCount = styled.div`
  font-size: 18px;
  color: #c5d9ff;
`;

const EquipmentColumn = styled.div`
  display: grid;
  gap: 18px;
  align-content: center;
`;

const EquipmentLabel = styled.div`
  font-size: 18px;
  color: #8ddcff;
  text-transform: uppercase;
`;

const EquipmentSlots = styled.div`
  display: flex;
  gap: 10px;
`;

const MateriaSlot = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.2);

  &[data-color='green'] {
    background: radial-gradient(circle, #9effbb, #138c4f);
  }

  &[data-color='blue'] {
    background: radial-gradient(circle, #80ecff, #2b5ef8);
  }

  &[data-color='yellow'] {
    background: radial-gradient(circle, #ffe68a, #ff9d36);
  }

  &[data-color='pink'] {
    background: radial-gradient(circle, #ffb2ea, #ba4bf0);
  }

  &[data-color='red'] {
    background: radial-gradient(circle, #ffad9f, #f14c43);
  }
`;

const SkillPreviewName = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 34px;
  text-transform: uppercase;

  &::before {
    content: '';
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: radial-gradient(circle, #80ecff, #2b5ef8);
  }

  &[data-color='green']::before {
    background: radial-gradient(circle, #9effbb, #138c4f);
  }

  &[data-color='blue']::before {
    background: radial-gradient(circle, #80ecff, #2b5ef8);
  }

  &[data-color='yellow']::before {
    background: radial-gradient(circle, #ffe68a, #ff9d36);
  }

  &[data-color='pink']::before {
    background: radial-gradient(circle, #ffb2ea, #ba4bf0);
  }

  &[data-color='red']::before {
    background: radial-gradient(circle, #ffad9f, #f14c43);
  }
`;

const StarRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 18px;
`;

const StarDot = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: ${({ $active }) => ($active ? '#fff3a2' : 'rgba(255, 255, 255, 0.12)')};
  box-shadow: ${({ $active }) => ($active ? '0 0 18px rgba(255, 243, 162, 0.55)' : 'none')};
`;

const MateriaInline = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: radial-gradient(circle, #80ecff, #2b5ef8);

  &[data-color='green'] {
    background: radial-gradient(circle, #9effbb, #138c4f);
  }

  &[data-color='blue'] {
    background: radial-gradient(circle, #80ecff, #2b5ef8);
  }

  &[data-color='yellow'] {
    background: radial-gradient(circle, #ffe68a, #ff9d36);
  }

  &[data-color='pink'] {
    background: radial-gradient(circle, #ffb2ea, #ba4bf0);
  }

  &[data-color='red'] {
    background: radial-gradient(circle, #ffad9f, #f14c43);
  }
`;

const HistoryBody = styled.div`
  ${boxShell}
  top: 93px;
  left: 0;
  right: 315px;
  bottom: 0;
  padding: 22px;
`;

const CenteredSelector = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 12px;
`;

const SelectorButton = styled.button`
  ${interactiveHover}
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 28px;
  text-transform: uppercase;
`;

const LoadingWrap = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 18px;
`;

const LoadingLabel = styled.div`
  font-size: 28px;
  text-transform: uppercase;
`;

const MemoryBar = styled.div`
  width: 430px;
  height: 48px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
  border-radius: 6px;
`;

const MemoryFill = styled.div`
  height: 100%;
  background: linear-gradient(180deg, #2500cf, #6852ff 43%, #4831f7 55%, #2400d3 60%, transparent 90%);
`;

const HistoryCardList = styled.div`
  display: grid;
  gap: 18px;
`;

const HistoryCard = styled.a`
  ${interactiveHover}
  ${boxShell}
  position: relative;
  display: grid;
  grid-template-columns: 118px 1fr 275px;
  gap: 20px;
  min-height: 235px;
  padding: 22px;
  color: #fff;
`;

const HistoryThumb = styled.div`
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(111, 206, 255, 0.24), rgba(255, 255, 255, 0.06));
  border-radius: 12px;
  font-size: 42px;
`;

const HistoryInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const HistoryName = styled.h2`
  margin: 0 0 10px;
  font-size: 30px;
  line-height: 1.1;
  text-transform: uppercase;
`;

const HistoryMeta = styled.div`
  margin-bottom: 12px;
  color: #fff5af;
  font-size: 22px;
  text-transform: uppercase;
`;

const HistorySummary = styled.div`
  font-size: 18px;
  line-height: 1.45;
  color: #d6e3ff;
`;

const HistoryMetaBox = styled.div`
  ${boxShell}
  position: static;
  min-height: 100%;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
`;

const ConfigBody = styled.div`
  ${boxShell}
  top: 93px;
  left: 0;
  right: 315px;
  bottom: 0;
  padding: 28px 32px;
  display: grid;
  align-content: start;
  gap: 34px;
`;

const ConfigRow = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 28px;
  align-items: start;
`;

const ConfigLabel = styled.div`
  font-size: 24px;
  color: #8ddcff;
  text-transform: uppercase;
  padding-top: 8px;
`;

const ColorPicker = styled.div`
  position: relative;
`;

const ColorQuadrants = styled.div`
  position: relative;
  width: 224px;
  height: 88px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 6px;
`;

const ColorQuadrantButton = styled.button`
  border: 2px solid ${({ $active }) => ($active ? '#fff5af' : 'rgba(255, 255, 255, 0.22)')};
  background: transparent;
  cursor: pointer;
`;

const SliderGroup = styled.div`
  margin-top: 18px;
  display: grid;
  gap: 12px;
`;

const SliderRow = styled.label`
  display: grid;
  grid-template-columns: 20px 48px 1fr;
  gap: 12px;
  align-items: center;
  font-size: 18px;
`;

const SliderInput = styled.input`
  width: 100%;
`;

const ToggleButtons = styled.div`
  display: flex;
  gap: 22px;
`;

const ToggleButton = styled.button`
  ${interactiveHover}
  min-width: 88px;
  border: 0;
  background: transparent;
  color: ${({ $active }) => ($active ? '#fff5af' : '#fff')};
  font-size: 24px;
  text-transform: uppercase;
`;
