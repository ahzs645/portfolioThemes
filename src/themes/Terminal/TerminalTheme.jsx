import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

const GEIST_MONO_FONT_ID = 'terminal-theme-geist-mono-font';
const GEIST_MONO_FONT_URL = 'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap';

function useGeistMonoFont() {
  useEffect(() => {
    if (document.getElementById(GEIST_MONO_FONT_ID)) return;

    const link = document.createElement('link');
    link.id = GEIST_MONO_FONT_ID;
    link.rel = 'stylesheet';
    link.href = GEIST_MONO_FONT_URL;
    document.head.appendChild(link);
  }, []);
}

// Helper to check if archived
const isArchived = (entry) => Array.isArray(entry?.tags) && entry.tags.includes('archived');

// Helper to check if present
const isPresent = (value) => String(value || '').trim().toLowerCase() === 'present';

export function TerminalTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV();
  useGeistMonoFont();
  const light = !darkMode;

  if (!cv) return null;

  const {
    name,
    email,
    phone,
    location,
    about,
    currentJobTitle,
    socialLinks,
    projects,
    education,
    publications,
    awards,
    sectionsRaw,
  } = cv;

  // Get additional sections
  const presentationsRaw = (sectionsRaw?.presentations || []).filter(e => !isArchived(e));
  const professionalDevRaw = (sectionsRaw?.professional_development || []).filter(e => !isArchived(e));

  // Get raw experience and volunteer data
  const experienceRaw = (sectionsRaw?.experience || []).filter(e => !isArchived(e));
  const volunteerRaw = (sectionsRaw?.volunteer || []).filter(e => !isArchived(e));

  return (
    <Container $light={light}>
      {/* Light/dark toggle */}
      <ThemeToggle
        type="button"
        onClick={() => onDarkModeChange?.(!darkMode)}
        aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        [{light ? 'DARK' : 'LIGHT'}]
      </ThemeToggle>

      {/* Avatar in corner */}
      <AvatarWrapper>
        <Avatar>{name?.charAt(0) || 'A'}</Avatar>
      </AvatarWrapper>

      <Content>
        {/* Header */}
        <Header>
          <Name>{name || 'YOUR NAME'}<Caret>_</Caret></Name>
          <Location>{location || 'EARTH'}</Location>
        </Header>

        <Spacer />

        {/* About Section */}
        {about && (
          <>
            <SectionTitle>ABOUT</SectionTitle>
            <SectionText>
              {about.toUpperCase()}
              {currentJobTitle && ` CURRENTLY WORKING AS ${currentJobTitle.toUpperCase()}.`}
            </SectionText>
          </>
        )}

        {/* Experience Section */}
        {experienceRaw.length > 0 && (
          <>
            <SectionTitle>EXPERIENCE</SectionTitle>
            <List>
              {experienceRaw.map((company, idx) => (
                <ListItem key={`exp-${idx}`}>
                  <CompanyName>{company.company?.toUpperCase()}</CompanyName>
                  {company.positions && company.positions.length > 0 ? (
                    company.positions.map((pos, posIdx) => (
                      <PositionLine key={`pos-${posIdx}`}>
                        {pos.title?.toUpperCase()} ({isPresent(pos.end_date) ? 'PRESENT' : pos.end_date ? String(pos.end_date).split('-')[0] : ''} - {pos.start_date ? String(pos.start_date).split('-')[0] : ''})
                      </PositionLine>
                    ))
                  ) : (
                    <PositionLine>
                      {company.position?.toUpperCase()} ({isPresent(company.end_date) ? 'PRESENT' : company.end_date ? String(company.end_date).split('-')[0] : ''} - {company.start_date ? String(company.start_date).split('-')[0] : ''})
                    </PositionLine>
                  )}
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <>
            <SectionTitle>EDUCATION</SectionTitle>
            <List>
              {education.map((item, idx) => (
                <ListItem key={`edu-${idx}`}>
                  {item.degree?.toUpperCase()} IN {item.area?.toUpperCase()}, {item.institution?.toUpperCase()} ({item.end_date ? String(item.end_date).split('-')[0] : ''})
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <>
            <SectionTitle>PROJECTS</SectionTitle>
            <List>
              {projects.slice(0, 6).map((project, idx) => (
                <ListItem key={`proj-${idx}`}>
                  {project.url ? (
                    <StyledLink href={project.url} target="_blank" rel="noreferrer">
                      {project.name?.toUpperCase()}
                    </StyledLink>
                  ) : (
                    project.name?.toUpperCase()
                  )}
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Volunteer Section */}
        {volunteerRaw.length > 0 && (
          <>
            <SectionTitle>VOLUNTEER</SectionTitle>
            <List>
              {volunteerRaw.slice(0, 5).map((item, idx) => (
                <ListItem key={`vol-${idx}`}>
                  {item.position?.toUpperCase()} AT {item.company?.toUpperCase()}
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Awards Section */}
        {awards.length > 0 && (
          <>
            <SectionTitle>AWARDS</SectionTitle>
            <List>
              {awards.slice(0, 5).map((award, idx) => (
                <ListItem key={`award-${idx}`}>
                  {award.name?.toUpperCase()} ({award.date ? String(award.date).split('-')[0] : ''})
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Publications Section */}
        {publications.length > 0 && (
          <>
            <SectionTitle>PUBLICATIONS</SectionTitle>
            <List>
              {publications.map((pub, idx) => (
                <ListItem key={`pub-${idx}`}>
                  {pub.doi ? (
                    <StyledLink href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer">
                      {pub.title?.toUpperCase()}
                    </StyledLink>
                  ) : (
                    pub.title?.toUpperCase()
                  )}
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Presentations Section */}
        {presentationsRaw.length > 0 && (
          <>
            <SectionTitle>PRESENTATIONS</SectionTitle>
            <List>
              {presentationsRaw.map((pres, idx) => (
                <ListItem key={`pres-${idx}`}>
                  {pres.name?.toUpperCase()} {pres.location && `— ${pres.location?.toUpperCase()}`} ({pres.date ? String(pres.date).split('-')[0] : ''})
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Professional Development Section */}
        {professionalDevRaw.length > 0 && (
          <>
            <SectionTitle>PROFESSIONAL DEVELOPMENT</SectionTitle>
            <List>
              {professionalDevRaw.map((item, idx) => (
                <ListItem key={`profdev-${idx}`}>
                  {item.name?.toUpperCase()} {item.location && `— ${item.location?.toUpperCase()}`} ({item.date ? String(item.date).split('-')[0] : ''})
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Connect Section */}
        <SectionTitle>CONNECT</SectionTitle>
        <SectionText>
          {email && (
            <>
              REACH ME AT{' '}
              <StyledLink href={`mailto:${email}`}>{email.toUpperCase()}</StyledLink>
            </>
          )}
          {phone && (
            <>
              {email ? ' OR CALL ' : 'CALL '}
              <StyledLink href={`tel:${phone}`}>{phone}</StyledLink>
            </>
          )}
          {socialLinks.github && (
            <>
              {(email || phone) ? '. FOLLOW MY WORK ON ' : 'FOLLOW MY WORK ON '}
              <StyledLink href={socialLinks.github} target="_blank" rel="noreferrer">
                GITHUB
              </StyledLink>
            </>
          )}
          {socialLinks.linkedin && (
            <>
              {' '}AND{' '}
              <StyledLink href={socialLinks.linkedin} target="_blank" rel="noreferrer">
                LINKEDIN
              </StyledLink>
            </>
          )}
          .
        </SectionText>

        {/* Decorative separator */}
        <Separator>[***]</Separator>

        {/* Quote */}
        <Quote>
          "THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO." — STEVE JOBS
        </Quote>
      </Content>
    </Container>
  );
}

// Animations
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

// Styled Components
const Container = styled.div`
  --term-bg: ${(p) => (p.$light ? '#f4f3ee' : '#000000')};
  --term-fg: ${(p) => (p.$light ? '#1a1a1a' : '#ffffff')};
  --term-muted: ${(p) => (p.$light ? '#5a5a5a' : '#909090')};
  --term-avatar-bg: ${(p) => (p.$light ? '#e2e1da' : '#1a1a1a')};
  --term-sel-bg: ${(p) => (p.$light ? 'black' : 'white')};
  --term-sel-fg: ${(p) => (p.$light ? 'white' : 'black')};

  height: 100%;
  width: 100%;
  background: var(--term-bg);
  color: var(--term-fg);
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  line-height: 1.3;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: none;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: center;
  position: relative;
  transition: background 0.2s ease, color 0.2s ease;

  * {
    text-transform: uppercase;
  }

  ::selection {
    background: var(--term-sel-bg);
    color: var(--term-sel-fg);
  }

  @media (min-width: 640px) {
    padding: 1.5rem;
  }
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 2;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.75rem;
  color: var(--term-muted);
  transition: color 0.2s ease;

  &:hover {
    color: var(--term-fg);
  }

  @media (max-width: 640px) {
    top: 1rem;
    left: 1rem;
  }
`;

const AvatarWrapper = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 8rem;
  display: var(--initial-display, block);
  height: 8rem;

  @media (max-width: 640px) {
    position: relative;
    top: 0;
    right: 0;
    width: 6rem;
    height: 6rem;
    margin-bottom: 2rem;
  }
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  background: var(--term-avatar-bg);
  color: var(--term-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 400;
`;

const Content = styled.div`
  max-width: 33rem;
  width: 100%;
  padding: 3.5rem 0;

  @media (max-width: 640px) {
    padding: 0 0 2rem 0;
  }
`;

const Header = styled.header`
  margin-bottom: 0.5rem;
`;

const Name = styled.h1`
  font-size: 0.75rem;
  font-weight: 400;
  margin: 0 0 0.2rem 0;
  color: var(--term-fg);
`;

const Caret = styled.span`
  animation: ${blink} 1s step-end infinite;
`;

const Location = styled.p`
  font-size: 0.75rem;
  color: var(--term-muted);
  margin: 0;
`;

const Spacer = styled.div`
  height: 1.5rem;

  @media (min-width: 640px) {
    height: 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--term-fg);
  margin: 0 0 0.5rem 0;
`;

const SectionText = styled.p`
  font-size: 0.75rem;
  color: var(--term-muted);
  margin: 0 0 1.5rem 0;
  line-height: 1.3rem;

  @media (min-width: 640px) {
    margin-bottom: 2rem;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;

  @media (min-width: 640px) {
    margin-bottom: 2rem;
  }
`;

const ListItem = styled.li`
  color: var(--term-muted);
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  line-height: 1.3rem;

  @media (max-width: 640px) {
    font-size: 0.7rem;
    line-height: 1.2rem;
  }
`;

const CompanyName = styled.div`
  color: var(--term-muted);
  font-weight: 400;
  margin-top: 0.5rem;

  &:first-child {
    margin-top: 0;
  }
`;

const PositionLine = styled.div`
  color: var(--term-muted);
  padding-left: 0.5rem;
`;

const StyledLink = styled.a`
  position: relative;
  text-decoration: none;
  color: var(--term-muted);
  cursor: pointer;
  word-break: break-word;

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 1px;
    bottom: -0.5px;
    left: 0;
    background-color: var(--term-muted);
    transform: scaleX(1);
    transform-origin: bottom left;
    transition: transform 0.3s ease-out;
  }

  &:hover::after {
    transform: scaleX(0);
    transform-origin: bottom right;
  }
`;

const Separator = styled.div`
  color: var(--term-muted);
  margin: 1.5rem 0 1rem 0;

  @media (min-width: 640px) {
    margin: 2rem 0 1rem 0;
  }
`;

const Quote = styled.blockquote`
  font-size: 0.75rem;
  color: var(--term-muted);
  font-style: italic;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 0.7rem;
  }
`;
