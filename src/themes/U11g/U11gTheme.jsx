import React, { useMemo, useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';
import {
  MatrixRain,
  InfoLogs,
  TypingTerminal,
  Equalizer,
  SpinningGeometry,
  CellularAutomaton,
  FlowDiagram,
  SystemLoad,
} from './components/TileAnimations';
import { TileIcon } from './components/TileIcons';
import { LiveFeed } from './components/LiveFeed';
import { ActionMenu } from './components/ActionMenu';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

function renderTileAnimation(tileId, accent, active) {
  switch (tileId) {
    case 'projects':
      return <MatrixRain active={active} />;
    case 'work':
      return <FlowDiagram active={active} color={accent} />;
    case 'skills':
      return <CellularAutomaton active={active} color={accent} />;
    case 'about':
      return <Equalizer active={active} color={accent} />;
    case 'education':
      return <SystemLoad active={active} color={accent} />;
    case 'awards':
      return <InfoLogs active={active} color={accent} />;
    case 'more':
      return <TypingTerminal active={active} color={accent} />;
    case 'contact':
      return <SpinningGeometry active={active} color={accent} />;
    default:
      return null;
  }
}

// Tile configuration - based on CV sections
const tileConfig = [
  { id: 'projects', number: '01', title: 'Projects', accent: '#f97316', colSpan: 2, rowSpan: 2 },
  { id: 'awards', number: '06', title: 'Awards', accent: '#eab308' },
  { id: 'more', number: '07', title: 'More', accent: '#14b8a6' },
  { id: 'about', number: '04', title: 'About', accent: '#a855f7' },
  { id: 'contact', number: '08', title: 'Contact', accent: '#06b6d4' },
  { id: 'skills', number: '03', title: 'Skills', accent: '#3b82f6' },
  { id: 'work', number: '02', title: 'Work', accent: '#22c55e' },
  { id: 'education', number: '05', title: 'Education', accent: '#ec4899' },
];

export function U11gTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [activePage, setActivePage] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  // Experience items
  const experienceItems = useMemo(() => {
    const items = [];
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));

    for (const exp of experiences) {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        for (const pos of exp.positions) {
          items.push({
            company: exp.company,
            title: pos.title || pos.position,
            description: pos.description || exp.description || '',
            url: exp.url || '',
          });
        }
      } else {
        items.push({
          company: exp.company,
          title: exp.position,
          description: exp.description || '',
          url: exp.url || '',
        });
      }
    }

    return items;
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e));
  }, [cv]);

  // Skills
  const skills = useMemo(() => {
    return cv?.sections?.skills || [];
  }, [cv]);

  // Education
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  // Awards
  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e));
  }, [cv]);

  // Volunteer
  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || []).filter(e => !isArchived(e));
  }, [cv]);

  // Publications
  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  // Presentations
  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e));
  }, [cv]);

  // Professional Development
  const professionalDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e));
  }, [cv]);

  // Certifications & Skills
  const certificationsSkillsItems = useMemo(() => {
    return cv?.sections?.certifications_skills || [];
  }, [cv]);

  // Live feed items — recent projects + experience
  const feedItems = useMemo(() => {
    const items = [];
    projectItems.slice(0, 6).forEach((p) => {
      items.push({
        title: p.name || 'Untitled',
        category: 'PROJECT',
        date: p.date || '',
        targetId: 'projects',
      });
    });
    experienceItems.slice(0, 6).forEach((e) => {
      items.push({
        title: e.title || e.company || 'Role',
        category: 'WORK',
        date: e.date || '',
        targetId: 'work',
      });
    });
    awardItems.slice(0, 4).forEach((a) => {
      items.push({
        title: a.name || 'Award',
        category: 'AWARD',
        date: a.date || '',
        targetId: 'awards',
      });
    });
    return items;
  }, [projectItems, experienceItems, awardItems]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        setSearchQuery('');
      }
      if (e.key === 'Escape') {
        if (showCommandPalette) {
          setShowCommandPalette(false);
        } else if (activePage) {
          setActivePage(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, activePage]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [
        ...tileConfig.map(t => ({ type: 'NAVIGATE', label: t.title, id: t.id })),
        ...projectItems.slice(0, 5).map(p => ({ type: 'PROJECT', label: p.name, url: p.url })),
      ];
    }
    const q = searchQuery.toLowerCase();
    const results = [];

    tileConfig.forEach(t => {
      if (t.title.toLowerCase().includes(q)) {
        results.push({ type: 'NAVIGATE', label: t.title, id: t.id });
      }
    });

    projectItems.forEach(p => {
      if (p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
        results.push({ type: 'PROJECT', label: p.name, url: p.url });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, projectItems]);

  const handleResultClick = (result) => {
    if (result.type === 'NAVIGATE') {
      setActivePage(result.id);
    } else if (result.url) {
      window.open(result.url, '_blank');
    }
    setShowCommandPalette(false);
  };

  const handleTileClick = (tileId) => {
    setActivePage(tileId);
  };

  const renderSubpage = () => {
    if (!activePage) return null;

    const tile = tileConfig.find(t => t.id === activePage);

    return (
      <SubpageOverlay onClick={() => setActivePage(null)}>
        <SubpageContent onClick={(e) => e.stopPropagation()}>
          <SubpageHeader>
            <SubpageNumber>{tile?.number}</SubpageNumber>
            <SubpageTitle>{tile?.title}</SubpageTitle>
            <CloseButton onClick={() => setActivePage(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </CloseButton>
          </SubpageHeader>
          <SubpageBody>
            {activePage === 'projects' && (
              <SubpageGrid>
                {projectItems.map((project, idx) => (
                  <ProjectCard
                    key={idx}
                    href={project.url}
                    target="_blank"
                    rel="noopener"
                    as={project.url ? 'a' : 'div'}
                  >
                    <ProjectName>{project.name}</ProjectName>
                    {project.description && (
                      <ProjectDesc>{project.description}</ProjectDesc>
                    )}
                  </ProjectCard>
                ))}
              </SubpageGrid>
            )}
            {activePage === 'work' && (
              <WorkList>
                {experienceItems.map((exp, idx) => (
                  <WorkItem key={idx}>
                    <WorkCompany>{exp.company}</WorkCompany>
                    <WorkTitle>{exp.title}</WorkTitle>
                    {exp.description && <WorkDesc>{exp.description}</WorkDesc>}
                  </WorkItem>
                ))}
              </WorkList>
            )}
            {activePage === 'about' && (
              <AboutContent>
                <AboutName>{fullName}</AboutName>
                <AboutBio>{aboutText}</AboutBio>
              </AboutContent>
            )}
            {activePage === 'skills' && (
              <SkillsGrid>
                {skills.map((skill, idx) => (
                  <SkillCard key={idx}>
                    <SkillName>{skill.name || skill}</SkillName>
                    {skill.keywords && (
                      <SkillTags>
                        {skill.keywords.map((kw, i) => (
                          <SkillTag key={i}>{kw}</SkillTag>
                        ))}
                      </SkillTags>
                    )}
                  </SkillCard>
                ))}
              </SkillsGrid>
            )}
            {activePage === 'education' && (
              <WorkList>
                {educationItems.map((edu, idx) => (
                  <WorkItem key={idx}>
                    <WorkCompany>{edu.institution}</WorkCompany>
                    <WorkTitle>{edu.area || edu.studyType}</WorkTitle>
                    {edu.studyType && edu.area && <WorkDesc>{edu.studyType}</WorkDesc>}
                  </WorkItem>
                ))}
              </WorkList>
            )}
            {activePage === 'awards' && (
              <WorkList>
                {awardItems.map((award, idx) => (
                  <WorkItem key={idx}>
                    <WorkCompany>{award.date}</WorkCompany>
                    <WorkTitle>{award.name}</WorkTitle>
                    {award.summary && <WorkDesc>{award.summary}</WorkDesc>}
                  </WorkItem>
                ))}
              </WorkList>
            )}
            {activePage === 'more' && (
              <WorkList>
                {volunteerItems.length > 0 && (
                  <>
                    <SubpageSectionLabel>Volunteer</SubpageSectionLabel>
                    {volunteerItems.map((vol, idx) => (
                      <WorkItem key={`vol-${idx}`}>
                        <WorkCompany>{vol.organization}</WorkCompany>
                        <WorkTitle>{vol.position || vol.title}</WorkTitle>
                        {vol.summary && <WorkDesc>{vol.summary}</WorkDesc>}
                      </WorkItem>
                    ))}
                  </>
                )}
                {publicationItems.length > 0 && (
                  <>
                    <SubpageSectionLabel>Publications</SubpageSectionLabel>
                    {publicationItems.map((pub, idx) => (
                      <WorkItem key={`pub-${idx}`}>
                        <WorkCompany>{pub.journal} ({pub.date})</WorkCompany>
                        <WorkTitle>{pub.title}</WorkTitle>
                      </WorkItem>
                    ))}
                  </>
                )}
                {presentationItems.length > 0 && (
                  <>
                    <SubpageSectionLabel>Presentations</SubpageSectionLabel>
                    {presentationItems.map((pres, idx) => (
                      <WorkItem key={`pres-${idx}`}>
                        <WorkCompany>{pres.date}{pres.location ? ` — ${pres.location}` : ''}</WorkCompany>
                        <WorkTitle>{pres.name}</WorkTitle>
                        {pres.summary && <WorkDesc>{pres.summary}</WorkDesc>}
                      </WorkItem>
                    ))}
                  </>
                )}
                {professionalDevItems.length > 0 && (
                  <>
                    <SubpageSectionLabel>Professional Development</SubpageSectionLabel>
                    {professionalDevItems.map((item, idx) => (
                      <WorkItem key={`pd-${idx}`}>
                        <WorkCompany>{item.date}{item.location ? ` — ${item.location}` : ''}</WorkCompany>
                        <WorkTitle>{item.name}</WorkTitle>
                        {item.summary && <WorkDesc>{item.summary}</WorkDesc>}
                      </WorkItem>
                    ))}
                  </>
                )}
                {certificationsSkillsItems.length > 0 && (
                  <>
                    <SubpageSectionLabel>Certifications & Skills</SubpageSectionLabel>
                    {certificationsSkillsItems.map((item, idx) => (
                      <WorkItem key={`cs-${idx}`}>
                        <WorkCompany>{item.label}</WorkCompany>
                        <WorkDesc>{item.details}</WorkDesc>
                      </WorkItem>
                    ))}
                  </>
                )}
              </WorkList>
            )}
            {activePage === 'contact' && (
              <ContactContent>
                {email && (
                  <ContactItem href={`mailto:${email}`}>
                    <ContactLabel>Email</ContactLabel>
                    <ContactValue>{email}</ContactValue>
                  </ContactItem>
                )}
                {githubUrl && (
                  <ContactItem href={githubUrl} target="_blank" rel="noopener">
                    <ContactLabel>GitHub</ContactLabel>
                    <ContactValue>{githubUrl}</ContactValue>
                  </ContactItem>
                )}
                {linkedinUrl && (
                  <ContactItem href={linkedinUrl} target="_blank" rel="noopener">
                    <ContactLabel>LinkedIn</ContactLabel>
                    <ContactValue>{linkedinUrl}</ContactValue>
                  </ContactItem>
                )}
                {twitterUrl && (
                  <ContactItem href={twitterUrl} target="_blank" rel="noopener">
                    <ContactLabel>X / Twitter</ContactLabel>
                    <ContactValue>{twitterUrl}</ContactValue>
                  </ContactItem>
                )}
              </ContactContent>
            )}
          </SubpageBody>
        </SubpageContent>
      </SubpageOverlay>
    );
  };

  return (
    <Container>
      {/* Mobile brand bar */}
      <MobileBrand>
        <BrandText>{(fullName || 'portfolio').toLowerCase().replace(/\s+/g, '')}</BrandText>
        <BrandDot />
      </MobileBrand>

      <Dashboard>
        {/* Render tiles dynamically from config */}
        {tileConfig.map((tile) => {
          const isHovered = hoveredTile === tile.id;

          // Split tile: "about" is a half-tile on top with LiveFeed on bottom
          if (tile.id === 'about') {
            return (
              <SplitTile key={tile.id} $colSpan={tile.colSpan} $rowSpan={tile.rowSpan}>
                <Tile
                  as="button"
                  $accent={tile.accent}
                  onClick={() => handleTileClick(tile.id)}
                  onMouseEnter={() => setHoveredTile(tile.id)}
                  onMouseLeave={() => setHoveredTile(null)}
                  style={{ height: '50%' }}
                >
                  {renderTileAnimation(tile.id, tile.accent, isHovered)}
                  <TileIconWrap>
                    <TileIcon id={tile.id} />
                  </TileIconWrap>
                  <TileContent>
                    <TileNumber>{tile.number}</TileNumber>
                    <TileBottom>
                      <GlitchTitle data-text={tile.title} $hovered={isHovered}>
                        {tile.title}
                      </GlitchTitle>
                      <TileAccent $color={tile.accent} />
                    </TileBottom>
                  </TileContent>
                </Tile>
                <LiveFeedWrap>
                  <LiveFeed
                    items={feedItems}
                    onSelect={(item) => item?.targetId && setActivePage(item.targetId)}
                  />
                </LiveFeedWrap>
              </SplitTile>
            );
          }

          return (
            <Tile
              key={tile.id}
              $colSpan={tile.colSpan}
              $rowSpan={tile.rowSpan}
              $accent={tile.accent}
              onClick={() => handleTileClick(tile.id)}
              onMouseEnter={() => setHoveredTile(tile.id)}
              onMouseLeave={() => setHoveredTile(null)}
            >
              {renderTileAnimation(tile.id, tile.accent, isHovered)}
              <TileIconWrap>
                <TileIcon id={tile.id} />
              </TileIconWrap>
              <TileContent>
                <TileNumber>{tile.number}</TileNumber>
                <TileBottom>
                  <GlitchTitle
                    data-text={tile.title}
                    $large={tile.colSpan === 2}
                    $hovered={isHovered}
                  >
                    {tile.title}
                  </GlitchTitle>
                  <TileAccent $color={tile.accent} />
                </TileBottom>
              </TileContent>
            </Tile>
          );
        })}

        {/* Action Menu Tile */}
        <ActionTileWrap>
          <ActionMenu
            socials={{ github: githubUrl, linkedin: linkedinUrl, twitter: twitterUrl }}
            email={email}
            resumeUrl={cv?.resumeUrl || null}
            onCommandPalette={() => setShowCommandPalette(true)}
          />
        </ActionTileWrap>
      </Dashboard>

      {/* Subpage */}
      {renderSubpage()}

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPaletteOverlay onClick={() => setShowCommandPalette(false)}>
          <CommandPalette onClick={(e) => e.stopPropagation()}>
            <CommandHeader>
              <CommandCursor>▐</CommandCursor>
              <CommandInput
                type="text"
                placeholder="ENTER COMMAND..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </CommandHeader>
            <CommandResults>
              {searchResults.map((result, idx) => (
                <CommandItem key={idx} onClick={() => handleResultClick(result)}>
                  <CommandItemLabel>{result.label}</CommandItemLabel>
                  <CommandItemType $type={result.type}>{result.type}</CommandItemType>
                </CommandItem>
              ))}
            </CommandResults>
          </CommandPalette>
        </CommandPaletteOverlay>
      )}
    </Container>
  );
}

// Color palette
const colors = {
  appBg: '#27272a',
  surface: '#0a0a0a',
  surfaceHover: '#18181b',
  primary: '#ffffff',
  secondary: '#a1a1aa',
  passive: '#333333',
};

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Styled Components
const Container = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: ${colors.appBg};
  color: ${colors.primary};
  font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
`;

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 1fr;
  gap: 1px;
  background: ${colors.appBg};
  width: 100%;
  min-height: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    height: 100%;
  }
`;

const MobileBrand = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.passive};

  @media (min-width: 768px) {
    display: none;
  }
`;

const BrandText = styled.h1`
  color: ${colors.primary};
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.04em;
  margin: 0;
`;

const brandPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
`;

const BrandDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: ${brandPulse} 1.6s ease-in-out infinite;
`;

const Tile = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  background: ${colors.surface};
  border: none;
  color: ${colors.primary};
  cursor: pointer;
  transition: background 0.2s;
  overflow: hidden;
  text-align: left;
  width: 100%;

  @media (min-width: 768px) {
    padding: 24px;
    grid-column: ${props => props.$colSpan ? `span ${props.$colSpan}` : 'span 1'};
    grid-row: ${props => props.$rowSpan ? `span ${props.$rowSpan}` : 'span 1'};
  }

  &:hover {
    background: ${colors.surfaceHover};
  }
`;

const SplitTile = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: ${colors.appBg};
  min-height: 320px;

  @media (min-width: 768px) {
    min-height: 0;
    grid-column: ${props => props.$colSpan ? `span ${props.$colSpan}` : 'span 1'};
    grid-row: ${props => props.$rowSpan ? `span ${props.$rowSpan}` : 'span 1'};
  }
`;

const LiveFeedWrap = styled.div`
  flex: 1;
  min-height: 0;
  height: 50%;
`;

const TileIconWrap = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  color: ${colors.secondary};
  transition: color 0.3s;
  pointer-events: none;

  ${Tile}:hover & {
    color: ${colors.primary};
  }

  @media (min-width: 768px) {
    top: 24px;
    right: 24px;
  }
`;

const TileContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const TileNumber = styled.span`
  font-size: 14px;
  color: ${colors.secondary};
  font-family: 'JetBrains Mono', monospace;
`;

const TileBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const glitchTop = keyframes`
  0%, 100% { clip-path: inset(0 0 85% 0); transform: translate(0, 0); }
  20% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 0); }
  40% { clip-path: inset(45% 0 30% 0); transform: translate(2px, 0); }
  60% { clip-path: inset(10% 0 75% 0); transform: translate(-1px, 0); }
  80% { clip-path: inset(30% 0 50% 0); transform: translate(1px, 0); }
`;

const glitchBottom = keyframes`
  0%, 100% { clip-path: inset(85% 0 0 0); transform: translate(0, 0); }
  20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, 0); }
  40% { clip-path: inset(30% 0 35% 0); transform: translate(-2px, 0); }
  60% { clip-path: inset(75% 0 5% 0); transform: translate(1px, 0); }
  80% { clip-path: inset(50% 0 20% 0); transform: translate(-1px, 0); }
`;

const GlitchTitle = styled.h2`
  position: relative;
  font-size: ${props => props.$large ? '48px' : '24px'};
  font-weight: normal;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  color: ${colors.primary};

  @media (min-width: 768px) {
    font-size: ${props => props.$large ? '64px' : '32px'};
  }

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.1s;
  }

  &::before {
    color: #f97316;
    z-index: 1;
  }

  &::after {
    color: #06b6d4;
    z-index: 2;
  }

  ${(p) =>
    p.$hovered &&
    css`
      &::before {
        opacity: 0.8;
        animation: ${glitchTop} 1.6s steps(2, end) infinite;
      }
      &::after {
        opacity: 0.8;
        animation: ${glitchBottom} 1.6s steps(2, end) infinite;
      }
    `}
`;

const TileAccent = styled.div`
  width: 32px;
  height: 4px;
  background: ${props => props.$color};
`;

const ActionTileWrap = styled.div`
  position: relative;
  min-height: 320px;
  width: 100%;

  @media (min-width: 768px) {
    min-height: 0;
  }
`;

// Subpage styles
const SubpageOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const SubpageContent = styled.div`
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: ${colors.surface};
  border: 1px solid ${colors.passive};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SubpageHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${colors.passive};
  gap: 16px;
`;

const SubpageNumber = styled.span`
  font-size: 14px;
  color: ${colors.secondary};
`;

const SubpageTitle = styled.h1`
  font-size: 32px;
  font-weight: normal;
  margin: 0;
  flex: 1;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid ${colors.passive};
  color: ${colors.secondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${colors.primary};
    border-color: ${colors.secondary};
  }
`;

const SubpageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const SubpageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const ProjectCard = styled.a`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.passive};
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.secondary};
  }
`;

const ProjectName = styled.h3`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
`;

const ProjectDesc = styled.p`
  font-size: 14px;
  color: ${colors.secondary};
  margin: 0;
  line-height: 1.5;
`;

const SubpageSectionLabel = styled.h2`
  font-size: 14px;
  text-transform: uppercase;
  color: ${colors.secondary};
  margin: 24px 0 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${colors.passive};

  &:first-child {
    margin-top: 0;
  }
`;

const WorkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const WorkItem = styled.div`
  padding: 20px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.passive};
`;

const WorkCompany = styled.div`
  font-size: 12px;
  color: ${colors.secondary};
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const WorkTitle = styled.h3`
  font-size: 18px;
  font-weight: normal;
  margin: 0 0 8px;
`;

const WorkDesc = styled.p`
  font-size: 14px;
  color: ${colors.secondary};
  margin: 0;
  line-height: 1.5;
`;

const AboutContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const AboutName = styled.h2`
  font-size: 32px;
  font-weight: normal;
  margin: 0;
`;

const AboutBio = styled.p`
  font-size: 16px;
  color: ${colors.secondary};
  line-height: 1.8;
  margin: 0;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const SkillCard = styled.div`
  padding: 20px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.passive};
`;

const SkillName = styled.h3`
  font-size: 16px;
  font-weight: normal;
  margin: 0 0 12px;
  color: ${colors.primary};
`;

const SkillTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SkillTag = styled.span`
  font-size: 11px;
  padding: 4px 8px;
  background: ${colors.surface};
  border: 1px solid ${colors.passive};
  color: ${colors.secondary};
`;

const ContactContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ContactItem = styled.a`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.passive};
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.secondary};
  }
`;

const ContactLabel = styled.span`
  font-size: 12px;
  color: ${colors.secondary};
  text-transform: uppercase;
`;

const ContactValue = styled.span`
  font-size: 16px;
  color: ${colors.primary};
`;

// Command Palette
const CommandPaletteOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: flex-end;
`;

const CommandPalette = styled.div`
  width: 100%;
  max-height: 75vh;
  background: ${colors.surface};
  border-top: 1px solid ${colors.passive};
  display: flex;
  flex-direction: column;
  padding: 32px;
`;

const CommandHeader = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${colors.passive};
  padding-bottom: 24px;
  margin-bottom: 24px;
`;

const CommandCursor = styled.span`
  color: #f97316;
  font-size: 32px;
  margin-right: 24px;
  animation: ${pulse} 1s infinite;
`;

const CommandInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 32px;
  font-family: inherit;
  color: ${colors.primary};
  text-transform: uppercase;
  letter-spacing: -0.02em;

  &::placeholder {
    color: ${colors.passive};
  }

  @media (min-width: 768px) {
    font-size: 48px;
  }
`;

const CommandResults = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: ${colors.passive}50;
  border: 1px solid ${colors.passive}50;
`;

const CommandItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: ${colors.surface};
  border: none;
  color: ${colors.secondary};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: ${colors.surfaceHover};
    color: ${colors.primary};
  }
`;

const CommandItemLabel = styled.span`
  font-size: 18px;
  font-family: inherit;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

const CommandItemType = styled.span`
  font-size: 10px;
  padding: 4px 8px;
  text-transform: uppercase;
  font-weight: bold;
  color: ${colors.surface};
  background: ${props => {
    switch (props.$type) {
      case 'NAVIGATE': return '#a855f7';
      case 'PROJECT': return '#f97316';
      default: return colors.secondary;
    }
  }};
`;
