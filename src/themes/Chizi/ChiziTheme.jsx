import React, { useState, useEffect, useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV, useConfig } from '../../contexts/ConfigContext';
import { isArchived, isPresent } from '../../utils/cvHelpers';

// Load Inter font (closest to Uncut Sans available on Google Fonts)
// Uncut Sans is the original font but not available publicly
const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
`;

// Color tokens matching chizi.dev exactly
const colors = {
  light: {
    background: '#ffffff',
    foreground: '#2c3b49',
    primary: '#1e87f1',
    secondary: '#0d1216',
    muted: '#e9e9ec',
    mutedForeground: '#8a99a8',
    border: '#d7e3ea',
  },
  dark: {
    background: '#0e1115',
    foreground: '#e2e6e9',
    primary: '#3594f2',
    secondary: '#2b333b',
    muted: '#1f262e',
    mutedForeground: '#b6bfc9',
    border: '#252e37',
  },
};

// Process experience with nesting support
function processExperienceWithNesting(rawExperience = []) {
  const items = [];

  for (const entry of rawExperience) {
    if (!entry || isArchived(entry)) continue;

    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      // Nested positions under same company
      items.push({
        type: 'nested',
        company: entry.company,
        url: entry.url,
        positions: entry.positions.map(pos => ({
          title: pos.title || pos.position || entry.position,
          startDate: pos.start_date,
          endDate: pos.end_date,
          isCurrent: isPresent(pos.end_date),
        })),
      });
    } else {
      // Single position
      items.push({
        type: 'single',
        company: entry.company,
        title: entry.position,
        startDate: entry.start_date,
        endDate: entry.end_date,
        isCurrent: isPresent(entry.end_date),
        url: entry.url,
      });
    }
  }

  return items;
}

export function ChiziTheme({ darkMode }) {
  const cv = useCV();
  const { cvData } = useConfig();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Process experience with nesting from raw data
  const experienceItems = useMemo(() => {
    const raw = cvData?.cv?.sections?.experience || [];
    return processExperienceWithNesting(raw).slice(0, 6);
  }, [cvData]);

  // Education items
  const educationItems = useMemo(() => {
    const raw = cvData?.cv?.sections?.education || [];
    return raw.filter(e => e && !isArchived(e)).slice(0, 4);
  }, [cvData]);

  // Volunteer items
  const volunteerItems = useMemo(() => {
    const raw = cvData?.cv?.sections?.volunteer || [];
    return raw.filter(e => e && !isArchived(e)).map(vol => ({
      organization: vol.organization || vol.company || '',
      position: vol.position || vol.role || 'Volunteer',
      startDate: vol.start_date,
      endDate: vol.end_date,
      isCurrent: isPresent(vol.end_date),
      url: vol.url,
    })).slice(0, 4);
  }, [cvData]);

  // Publications items
  const publicationItems = useMemo(() => {
    const raw = cvData?.cv?.sections?.publications || [];
    return raw.filter(e => e && !isArchived(e)).slice(0, 6);
  }, [cvData]);

  if (!cv) return null;

  const {
    name,
    email,
    location,
    about,
    currentJobTitle,
    socialLinks,
    projects,
  } = cv;

  const theme = darkMode ? colors.dark : colors.light;
  const projectItems = projects.slice(0, 6);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    return { time: `${displayHours}:${minutes}:${seconds}`, ampm };
  };

  const { time: timeStr, ampm } = formatTime(time);

  return (
    <Container $theme={theme}>
      <FontLoader />
      <Content>
        {/* Header */}
        <Header>
          <LogoSection>
            <AvatarWrapper>
              <Avatar $theme={theme}>{name?.charAt(0) || 'C'}</Avatar>
            </AvatarWrapper>
          </LogoSection>
          <Nav>
            <NavLink $theme={theme} href="#about" $active>Index</NavLink>
            <NavLink $theme={theme} href="#work">Work</NavLink>
            <NavLink $theme={theme} href="#projects">Projects</NavLink>
            {email && (
              <NavLink $theme={theme} href={`mailto:${email}`}>Contact</NavLink>
            )}
          </Nav>
        </Header>

        {/* Main Content */}
        <Main>
          {/* About Section */}
          <Section id="about">
            <SectionLeft>
              <SectionName $theme={theme}>{name || 'Your Name'}</SectionName>
              <SectionRole $theme={theme}>{currentJobTitle || 'Software developer'}</SectionRole>
            </SectionLeft>
            <SectionRight>
              <AboutText $theme={theme}>
                {about || "Hi, I'm a software developer focused on building great products."}
              </AboutText>
              {(socialLinks.github || socialLinks.linkedin || socialLinks.twitter) && (
                <SocialRow>
                  {socialLinks.github && (
                    <StyledLink $theme={theme} href={socialLinks.github} target="_blank" rel="noreferrer">
                      GitHub
                    </StyledLink>
                  )}
                  {socialLinks.linkedin && (
                    <StyledLink $theme={theme} href={socialLinks.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </StyledLink>
                  )}
                  {socialLinks.twitter && (
                    <StyledLink $theme={theme} href={socialLinks.twitter} target="_blank" rel="noreferrer">
                      Twitter
                    </StyledLink>
                  )}
                </SocialRow>
              )}
            </SectionRight>
          </Section>

          {/* Spacer */}
          <Spacer />

          {/* Experience Section */}
          {experienceItems.length > 0 && (
            <Section id="work">
              <SectionLeft>
                <SectionTitle $theme={theme}>Experience</SectionTitle>
              </SectionLeft>
              <SectionRight>
                <ExperienceList>
                  {experienceItems.map((item, idx) => (
                    <ExperienceItem key={`exp-${idx}`}>
                      {item.type === 'nested' ? (
                        <>
                          <ExperienceInfo>
                            <ExperienceCompany $theme={theme}>{item.company}</ExperienceCompany>
                            <NestedPositions $theme={theme}>
                              {item.positions.map((pos, posIdx) => (
                                <NestedPosition key={`pos-${posIdx}`} $theme={theme}>
                                  <ExperienceRole $theme={theme}>{pos.title}</ExperienceRole>
                                  <NestedDate $theme={theme}>
                                    {pos.startDate?.split('-')[0] || ''} - {pos.isCurrent ? 'Present' : pos.endDate?.split('-')[0] || ''}
                                  </NestedDate>
                                </NestedPosition>
                              ))}
                            </NestedPositions>
                          </ExperienceInfo>
                        </>
                      ) : (
                        <>
                          <ExperienceDate $theme={theme}>
                            {item.isCurrent ? 'Present' : item.endDate?.split('-')[0] || ''}
                            {item.startDate && ` - ${item.startDate.split('-')[0]}`}
                          </ExperienceDate>
                          <ExperienceInfo>
                            <ExperienceRole $theme={theme}>{item.title}</ExperienceRole>
                            <ExperienceCompany $theme={theme}>{item.company}</ExperienceCompany>
                          </ExperienceInfo>
                        </>
                      )}
                    </ExperienceItem>
                  ))}
                </ExperienceList>
              </SectionRight>
            </Section>
          )}

          {/* Projects Section */}
          {projectItems.length > 0 && (
            <Section id="projects">
              <SectionLeft>
                <SectionTitle $theme={theme}>Projects</SectionTitle>
              </SectionLeft>
              <SectionRight>
                <ProjectList>
                  {projectItems.map((project, idx) => (
                    <ProjectItem key={`proj-${idx}`}>
                      <ProjectLink
                        $theme={theme}
                        href={project.url || '#'}
                        target={project.url ? '_blank' : undefined}
                        rel={project.url ? 'noreferrer' : undefined}
                      >
                        {project.name}
                        {project.url && <span> ↗</span>}
                      </ProjectLink>
                      <ProjectDesc $theme={theme}>{project.summary}</ProjectDesc>
                    </ProjectItem>
                  ))}
                </ProjectList>
              </SectionRight>
            </Section>
          )}

          {/* Education Section */}
          {educationItems.length > 0 && (
            <Section id="education">
              <SectionLeft>
                <SectionTitle $theme={theme}>Education</SectionTitle>
              </SectionLeft>
              <SectionRight>
                <ExperienceList>
                  {educationItems.map((edu, idx) => (
                    <ExperienceItem key={`edu-${idx}`}>
                      <ExperienceDate $theme={theme}>
                        {edu.end_date?.split('-')[0] || edu.graduation_date?.split('-')[0] || ''}
                        {edu.start_date && ` - ${edu.start_date.split('-')[0]}`}
                      </ExperienceDate>
                      <ExperienceInfo>
                        <ExperienceRole $theme={theme}>{edu.degree || edu.area}</ExperienceRole>
                        <ExperienceCompany $theme={theme}>{edu.institution}</ExperienceCompany>
                      </ExperienceInfo>
                    </ExperienceItem>
                  ))}
                </ExperienceList>
              </SectionRight>
            </Section>
          )}

          {/* Volunteer Section */}
          {volunteerItems.length > 0 && (
            <Section id="volunteer">
              <SectionLeft>
                <SectionTitle $theme={theme}>Volunteer</SectionTitle>
              </SectionLeft>
              <SectionRight>
                <ExperienceList>
                  {volunteerItems.map((vol, idx) => (
                    <ExperienceItem key={`vol-${idx}`}>
                      <ExperienceDate $theme={theme}>
                        {vol.isCurrent ? 'Present' : vol.endDate?.split('-')[0] || ''}
                        {vol.startDate && ` - ${vol.startDate.split('-')[0]}`}
                      </ExperienceDate>
                      <ExperienceInfo>
                        <ExperienceRole $theme={theme}>{vol.position}</ExperienceRole>
                        <ExperienceCompany $theme={theme}>{vol.organization}</ExperienceCompany>
                      </ExperienceInfo>
                    </ExperienceItem>
                  ))}
                </ExperienceList>
              </SectionRight>
            </Section>
          )}

          {/* Publications Section */}
          {publicationItems.length > 0 && (
            <Section id="publications">
              <SectionLeft>
                <SectionTitle $theme={theme}>Publications</SectionTitle>
              </SectionLeft>
              <SectionRight>
                <ProjectList>
                  {publicationItems.map((pub, idx) => (
                    <ProjectItem key={`pub-${idx}`}>
                      <ProjectLink
                        $theme={theme}
                        href={pub.url || (pub.doi ? `https://doi.org/${pub.doi}` : '#')}
                        target={pub.url || pub.doi ? '_blank' : undefined}
                        rel={pub.url || pub.doi ? 'noreferrer' : undefined}
                      >
                        {pub.name || pub.title}
                        {(pub.url || pub.doi) && <span> ↗</span>}
                      </ProjectLink>
                      <ProjectDesc $theme={theme}>
                        {pub.publisher || pub.journal}{pub.date && ` • ${String(pub.date).split('-')[0]}`}
                      </ProjectDesc>
                    </ProjectItem>
                  ))}
                </ProjectList>
              </SectionRight>
            </Section>
          )}
        </Main>

        {/* Footer */}
        <Footer>
          <ClockSection>
            <ClockTime $theme={theme}>
              (UTC) <ClockMono>{timeStr}</ClockMono> {ampm}
            </ClockTime>
            <ClockFace $theme={theme}>
              <ClockHand
                $rotation={time.getHours() * 30 + time.getMinutes() * 0.5}
                $height="20%"
                $theme={theme}
              />
              <ClockHand
                $rotation={time.getMinutes() * 6}
                $height="33%"
                $theme={theme}
                $opacity={0.5}
              />
              <ClockHand
                $rotation={time.getSeconds() * 6}
                $height="40%"
                $isSecond
                $theme={theme}
              />
              <ClockCenter $theme={theme} />
            </ClockFace>
          </ClockSection>
          <FooterLocation $theme={theme}>
            {location || 'Earth'}
          </FooterLocation>
        </Footer>
      </Content>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  min-height: 100%;
  width: 100%;
  background: ${({ $theme }) => $theme.background};
  color: ${({ $theme }) => $theme.foreground};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: -0.025em;
  overflow: auto;
  overscroll-behavior: none;
  transition: background 0.2s, color 0.2s;
`;

const Content = styled.div`
  max-width: 60rem;
  margin: 0 auto;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 5rem;
  padding: 2.5rem 1rem;

  @media (min-width: 1536px) {
    padding: 2.5rem 3rem;
  }
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 5rem;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Avatar = styled.div`
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.25rem;
  background: ${({ $theme }) => $theme.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
`;

const Nav = styled.nav`
  display: flex;
  width: 100%;
  max-width: 24rem;
  justify-content: space-between;
  gap: 1.25rem;
  font-size: 0.875rem;

  @media (min-width: 640px) {
    width: fit-content;
  }
`;

const NavLink = styled.a`
  display: inline;
  position: relative;
  padding-block: 0.125rem;
  color: ${({ $theme, $active }) => ($active ? $theme.foreground : $theme.mutedForeground)};
  text-decoration: none;
  border-radius: 0.25rem;
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  isolation: isolate;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10%;
    height: 1px;
    width: 100%;
    background: ${({ $theme }) => $theme.border};
    border-radius: 0.25rem;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -1;
  }

  @media (hover: hover) {
    &:hover {
      color: ${({ $theme }) => $theme.foreground};
    }

    &:hover::after {
      height: 80%;
      background: ${({ $theme }) => $theme.muted};
    }
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const Section = styled.section`
  display: grid;
  gap: 2.5rem;

  @media (min-width: 640px) {
    gap: 1rem;
    grid-template-columns: 1fr 2fr;
  }
`;

const SectionLeft = styled.div``;

const SectionRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionName = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: ${({ $theme }) => $theme.foreground};
`;

const SectionRole = styled.p`
  color: ${({ $theme }) => $theme.mutedForeground};
  line-height: 1;
  margin: 0;
`;

const SectionTitle = styled.h4`
  font-weight: 700;
  margin: 0;
  color: ${({ $theme }) => $theme.foreground};
`;

const AboutText = styled.p`
  margin: 0;
  line-height: 1.7;
  color: ${({ $theme }) => $theme.foreground};
`;

const SocialRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const StyledLink = styled.a`
  display: inline;
  position: relative;
  width: fit-content;
  padding-block: 0.125rem;
  color: ${({ $theme }) => $theme.mutedForeground};
  text-decoration: none;
  border-radius: 0.25rem;
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  isolation: isolate;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10%;
    z-index: -1;
    width: 100%;
    height: 1px;
    background: ${({ $theme }) => $theme.border};
    border-radius: 0.25rem;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (hover: hover) {
    &:hover {
      color: ${({ $theme }) => $theme.foreground};
    }

    &:hover::after {
      height: 80%;
      background: ${({ $theme }) => $theme.muted};
    }
  }
`;

const Spacer = styled.div``;

const ExperienceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ExperienceItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;

  @media (min-width: 640px) {
    flex-direction: row-reverse;
    gap: 1rem;
  }
`;

const ExperienceDate = styled.p`
  font-size: 0.875rem;
  color: ${({ $theme }) => $theme.mutedForeground};
  opacity: 0.7;
  margin: 0;
  flex-shrink: 0;

  @media (min-width: 640px) {
    color: ${({ $theme }) => $theme.mutedForeground};
    opacity: 1;
  }
`;

const ExperienceInfo = styled.div`
  flex: 1;
`;

const ExperienceRole = styled.p`
  margin: 0;
  color: ${({ $theme }) => $theme.foreground};
`;

const ExperienceCompany = styled.p`
  margin: 0;
  color: ${({ $theme }) => $theme.mutedForeground};
`;

const NestedPositions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid ${({ $theme }) => $theme.border};
`;

const NestedPosition = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
`;

const NestedDate = styled.span`
  font-size: 0.75rem;
  color: ${({ $theme }) => $theme.mutedForeground};
  flex-shrink: 0;
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProjectItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProjectLink = styled.a`
  display: inline;
  position: relative;
  width: fit-content;
  padding-block: 0.125rem;
  color: ${({ $theme }) => $theme.foreground};
  text-decoration: none;
  border-radius: 0.25rem;
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  isolation: isolate;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10%;
    z-index: -1;
    width: 100%;
    height: 1px;
    background: ${({ $theme }) => $theme.border};
    border-radius: 0.25rem;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (hover: hover) {
    &:hover::after {
      height: 80%;
      background: ${({ $theme }) => $theme.muted};
    }
  }
`;

const ProjectDesc = styled.p`
  margin: 0;
  color: ${({ $theme }) => $theme.mutedForeground};
  font-size: 0.875rem;
`;

const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const ClockSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ClockTime = styled.p`
  color: ${({ $theme }) => $theme.mutedForeground};
  opacity: 0.7;
  font-size: 0.75rem;
  flex-shrink: 0;
  margin: 0;
`;

const ClockMono = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
`;

const ClockFace = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(180deg);

  @media (min-width: 640px) {
    width: 4rem;
    height: 4rem;
  }
`;

const ClockHand = styled.div`
  position: absolute;
  top: 50%;
  left: calc(50% - 1px);
  width: 2px;
  height: ${({ $height }) => $height};
  background: ${({ $isSecond, $theme }) => ($isSecond ? $theme.primary : $theme.mutedForeground)};
  opacity: ${({ $opacity }) => $opacity || 1};
  transform-origin: center 0;
  transform: rotate(${({ $rotation }) => $rotation}deg);
`;

const ClockCenter = styled.div`
  position: absolute;
  width: 5%;
  height: 5%;
  border-radius: 50%;
  background: ${({ $theme }) => $theme.background};
  border: 0.5px solid ${({ $theme }) => $theme.border};
  z-index: 10;
`;

const FooterLocation = styled.p`
  font-size: 0.875rem;
  color: ${({ $theme }) => $theme.mutedForeground};
  margin: 0;
`;
