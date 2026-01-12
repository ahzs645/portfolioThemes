import React, { useMemo, useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

// Group experience entries by company with their positions
function groupExperience(experience = []) {
  const groups = [];

  for (const entry of experience) {
    if (!entry || isArchived(entry)) continue;

    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      // Company with multiple positions
      groups.push({
        company: entry.company,
        location: entry.location,
        positions: entry.positions.map(pos => ({
          title: pos?.title || entry.position,
          startDate: pos?.start_date ?? entry.start_date,
          endDate: pos?.end_date ?? entry.end_date ?? null,
          highlights: pos?.highlights || [],
        })),
      });
    } else {
      // Single position entry
      groups.push({
        company: entry.company,
        location: entry.location,
        positions: [{
          title: entry.position,
          startDate: entry.start_date,
          endDate: entry.end_date ?? null,
          highlights: entry.highlights || [],
        }],
      });
    }
  }

  return groups;
}

function getYear(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Present';
  if (dateStr.length >= 4) return dateStr.substring(0, 4);
  return dateStr;
}

function formatDateRange(start, end) {
  const startYear = getYear(start);
  const endYear = getYear(end);
  if (!startYear && !endYear) return '';
  if (!endYear || startYear === endYear) return startYear;
  return `${startYear} - ${endYear}`;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

// Generate a color based on string hash
function stringToColor(str) {
  const colors = ['#f5f5dc', '#333', '#5cd5b0', '#fff176', '#90caf9', '#f48fb1', '#ce93d8'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function NickComputerTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Inject Rammetto One font
  useEffect(() => {
    const linkId = 'nick-computer-font';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Rammetto+One&display=swap';
      document.head.appendChild(link);
    }

    // Trigger entrance animations after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => {
      const el = document.getElementById(linkId);
      if (el) el.remove();
      clearTimeout(timer);
    };
  }, []);

  const fullName = cv?.name || 'Your Name';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const email = cv?.email || null;
  const website = cv?.website || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || "I'm a developer who builds things for the web.";

  // Grouped experience (connected positions)
  const experienceGroups = useMemo(() => {
    return groupExperience(cv?.sections?.experience || []).slice(0, 6);
  }, [cv]);

  // Volunteer entries
  const volunteerGroups = useMemo(() => {
    return groupExperience(cv?.sections?.volunteer || []).slice(0, 6);
  }, [cv]);

  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).slice(0, 8);
  }, [cv]);

  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  const profDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  const certSkillItems = useMemo(() => {
    return cv?.sections?.certifications_skills || [];
  }, [cv]);

  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  return (
    <Container>
      <Content>
        <Header $isLoaded={isLoaded}>
          <Name>
            <NameLine $delay={0}>{firstName}</NameLine>
            {lastName && <NameLine $delay={0.1}>{lastName}</NameLine>}
          </Name>
          <Bio $delay={0.2}>{aboutText}</Bio>
          {location && <Location $delay={0.25}>{location}</Location>}

          <SocialLinks $delay={0.3}>
            {linkedinUrl && (
              <SocialLink href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </SocialLink>
            )}
            {email && (
              <SocialLink href={`mailto:${email}`} aria-label="Email">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </SocialLink>
            )}
            {website && (
              <SocialLink href={website} target="_blank" rel="noreferrer" aria-label="Website">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </SocialLink>
            )}
            {githubUrl && (
              <SocialLink href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </SocialLink>
            )}
            {twitterUrl && (
              <SocialLink href={twitterUrl} target="_blank" rel="noreferrer" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialLink>
            )}
          </SocialLinks>
        </Header>

        {projectItems.length > 0 && (
          <Section $delay={0.4}>
            <SectionTitle>Work</SectionTitle>
            <ProjectsScroller>
              <ProjectsTrack>
                {projectItems.map((project, idx) => (
                  <ProjectCard
                    key={`${project.name}-${idx}`}
                    href={project.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    style={{ backgroundColor: stringToColor(project.name || 'project') }}
                    $index={idx}
                  >
                    <ProjectInner $light={['#f5f5dc', '#fff176', '#90caf9'].includes(stringToColor(project.name || 'project'))}>
                      <ProjectLogo>{project.name?.charAt(0) || 'P'}</ProjectLogo>
                      <ProjectName>{project.name}</ProjectName>
                      {project.summary && <ProjectSummary $light={['#f5f5dc', '#fff176', '#90caf9'].includes(stringToColor(project.name || 'project'))}>{project.summary}</ProjectSummary>}
                    </ProjectInner>
                  </ProjectCard>
                ))}
              </ProjectsTrack>
            </ProjectsScroller>
          </Section>
        )}

        {experienceGroups.length > 0 && (
          <Section $delay={0.5}>
            <SectionTitle>Experience</SectionTitle>
            <ExperienceList>
              {experienceGroups.map((group, groupIdx) => (
                <ExperienceGroup key={`${group.company}-${groupIdx}`}>
                  <ExperienceCompanyRow>
                    <ExperienceIcon>{group.company?.charAt(0) || 'W'}</ExperienceIcon>
                    <ExperienceCompanyName>{group.company}</ExperienceCompanyName>
                    {group.location && <ExperienceLocation>{group.location}</ExperienceLocation>}
                  </ExperienceCompanyRow>
                  <PositionsList $connected={group.positions.length > 1}>
                    {group.positions.map((pos, posIdx) => (
                      <PositionItem key={`${pos.title}-${posIdx}`} $isFirst={posIdx === 0} $isLast={posIdx === group.positions.length - 1}>
                        {group.positions.length > 1 && <PositionConnector $isFirst={posIdx === 0} $isLast={posIdx === group.positions.length - 1} />}
                        <PositionContent>
                          <PositionHeader>
                            <PositionTitle>{pos.title}</PositionTitle>
                            <PositionYear>{formatDateRange(pos.startDate, pos.endDate)}</PositionYear>
                          </PositionHeader>
                          {pos.highlights.length > 0 && (
                            <PositionDesc>{pos.highlights[0]}</PositionDesc>
                          )}
                        </PositionContent>
                      </PositionItem>
                    ))}
                  </PositionsList>
                </ExperienceGroup>
              ))}
            </ExperienceList>
          </Section>
        )}

        {volunteerGroups.length > 0 && (
          <Section $delay={0.6}>
            <SectionTitle>Volunteer</SectionTitle>
            <ExperienceList>
              {volunteerGroups.map((group, groupIdx) => (
                <ExperienceGroup key={`vol-${group.company}-${groupIdx}`}>
                  <ExperienceCompanyRow>
                    <ExperienceIcon $variant="volunteer">{group.company?.charAt(0) || 'V'}</ExperienceIcon>
                    <ExperienceCompanyName>{group.company}</ExperienceCompanyName>
                  </ExperienceCompanyRow>
                  <PositionsList $connected={group.positions.length > 1}>
                    {group.positions.map((pos, posIdx) => (
                      <PositionItem key={`vol-${pos.title}-${posIdx}`} $isFirst={posIdx === 0} $isLast={posIdx === group.positions.length - 1}>
                        {group.positions.length > 1 && <PositionConnector $isFirst={posIdx === 0} $isLast={posIdx === group.positions.length - 1} />}
                        <PositionContent>
                          <PositionHeader>
                            <PositionTitle>{pos.title}</PositionTitle>
                            <PositionYear>{formatDateRange(pos.startDate, pos.endDate)}</PositionYear>
                          </PositionHeader>
                          {pos.highlights.length > 0 && (
                            <PositionDesc>{pos.highlights[0]}</PositionDesc>
                          )}
                        </PositionContent>
                      </PositionItem>
                    ))}
                  </PositionsList>
                </ExperienceGroup>
              ))}
            </ExperienceList>
          </Section>
        )}

        {educationItems.length > 0 && (
          <Section $delay={0.7}>
            <SectionTitle>Education</SectionTitle>
            <EducationList>
              {educationItems.map((edu, idx) => (
                <EducationItem key={`edu-${idx}`}>
                  <EducationIcon>{edu.institution?.charAt(0) || 'E'}</EducationIcon>
                  <EducationContent>
                    <EducationDegree>{edu.degree} in {edu.area}</EducationDegree>
                    <EducationInstitution>{edu.institution}</EducationInstitution>
                    <EducationYear>{formatDateRange(edu.start_date, edu.end_date)}</EducationYear>
                    {edu.highlights?.length > 0 && (
                      <EducationHighlights>
                        {edu.highlights.map((h, hIdx) => (
                          <EducationHighlight key={hIdx}>{h}</EducationHighlight>
                        ))}
                      </EducationHighlights>
                    )}
                  </EducationContent>
                </EducationItem>
              ))}
            </EducationList>
          </Section>
        )}

        {awardItems.length > 0 && (
          <Section $delay={0.8}>
            <SectionTitle>Awards</SectionTitle>
            <AwardsList>
              {awardItems.map((award, idx) => (
                <AwardItem key={`award-${idx}`}>
                  <AwardIcon>★</AwardIcon>
                  <AwardContent>
                    <AwardName>{award.name}</AwardName>
                    <AwardOrg>{award.summary}</AwardOrg>
                    <AwardYear>{award.date}</AwardYear>
                  </AwardContent>
                </AwardItem>
              ))}
            </AwardsList>
          </Section>
        )}

        {presentationItems.length > 0 && (
          <Section $delay={0.85}>
            <SectionTitle>Presentations</SectionTitle>
            <SimpleList>
              {presentationItems.map((pres, idx) => (
                <SimpleItem key={`pres-${idx}`}>
                  <SimpleTitle>{pres.name}</SimpleTitle>
                  <SimpleMeta>{pres.summary} • {pres.location} • {pres.date}</SimpleMeta>
                </SimpleItem>
              ))}
            </SimpleList>
          </Section>
        )}

        {publicationItems.length > 0 && (
          <Section $delay={0.9}>
            <SectionTitle>Publications</SectionTitle>
            <SimpleList>
              {publicationItems.map((pub, idx) => (
                <SimpleItem key={`pub-${idx}`}>
                  <SimpleTitle>{pub.title}</SimpleTitle>
                  <SimpleMeta>
                    {pub.authors?.slice(0, 3).join(', ')}{pub.authors?.length > 3 ? ' et al.' : ''} • {pub.journal} • {pub.date}
                  </SimpleMeta>
                  {pub.doi && (
                    <PublicationLink href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer">
                      DOI: {pub.doi}
                    </PublicationLink>
                  )}
                </SimpleItem>
              ))}
            </SimpleList>
          </Section>
        )}

        {profDevItems.length > 0 && (
          <Section $delay={0.95}>
            <SectionTitle>Professional Development</SectionTitle>
            <TagsGrid>
              {profDevItems.map((item, idx) => (
                <TagItem key={`pd-${idx}`}>
                  <TagName>{item.name}</TagName>
                  <TagMeta>{item.summary} • {item.date}</TagMeta>
                </TagItem>
              ))}
            </TagsGrid>
          </Section>
        )}

        {certSkillItems.length > 0 && (
          <Section $delay={1}>
            <SectionTitle>Skills & Certifications</SectionTitle>
            <SkillsGrid>
              {certSkillItems.map((item, idx) => (
                <SkillCategory key={`cs-${idx}`}>
                  <SkillLabel>{item.label}</SkillLabel>
                  <SkillDetails>{item.details}</SkillDetails>
                </SkillCategory>
              ))}
            </SkillsGrid>
          </Section>
        )}
      </Content>
    </Container>
  );
}

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Container = styled.div`
  height: 100%;
  width: 100%;
  background-color: #333;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.35;
  letter-spacing: -0.4px;
  overflow: auto;
  overscroll-behavior: none;

  @media (prefers-color-scheme: light) {
    background-color: #fff;
    color: #333;
  }

  ::selection {
    background: #333;
    color: #fff;
  }

  @media (prefers-color-scheme: light) {
    ::selection {
      background: #333;
      color: #fff;
    }
  }
`;

const Content = styled.div`
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem;

  @media (min-width: 768px) {
    padding: 3rem;
  }
`;

const Header = styled.header`
  margin-bottom: 5rem;
  opacity: ${props => props.$isLoaded ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const Name = styled.h1`
  font-family: 'Rammetto One', cursive;
  font-size: 2rem;
  font-weight: 400;
  margin: 0 0 0.75rem;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const NameLine = styled.span`
  display: block;
  animation: ${slideInLeft} 0.6s ease forwards;
  animation-delay: ${props => props.$delay || 0}s;
  opacity: 0;
`;

const Bio = styled.p`
  font-size: 1rem;
  margin: 0 0 1rem;
  max-width: 40ch;
  padding-right: 2rem;
  animation: ${fadeInUp} 0.6s ease forwards;
  animation-delay: ${props => props.$delay || 0}s;
  opacity: 0;

  @media (prefers-color-scheme: light) {
    color: #333;
  }
`;

const Location = styled.p`
  font-size: 0.875rem;
  margin: 0 0 2rem;
  opacity: 0;
  animation: ${fadeInUp} 0.6s ease forwards;
  animation-delay: ${props => props.$delay || 0}s;
  color: rgba(255, 255, 255, 0.6);

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.5);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.6s ease forwards;
  animation-delay: ${props => props.$delay || 0}s;
  opacity: 0;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: inherit;
  transition: all 0.25s ease;
  border-radius: 50%;

  &:hover {
    opacity: 0.7;
    transform: scale(1.15);
    background: rgba(255, 255, 255, 0.1);
  }

  @media (prefers-color-scheme: light) {
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const Section = styled.section`
  margin-bottom: 5rem;
  animation: ${fadeInUp} 0.6s ease forwards;
  animation-delay: ${props => props.$delay || 0}s;
  opacity: 0;
`;

const SectionTitle = styled.h2`
  font-family: 'Rammetto One', cursive;
  font-size: 1.25rem;
  font-weight: 400;
  margin: 0 0 1.35rem;
`;

const ProjectsScroller = styled.div`
  margin: 0 -1.25rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 1.25rem;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    margin: 0 -3rem;
    padding: 0 3rem;
  }
`;

const ProjectsTrack = styled.div`
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
`;

const ProjectCard = styled.a`
  flex-shrink: 0;
  width: 13.25rem;
  height: 20rem;
  border-radius: 0;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${scaleIn} 0.5s ease forwards;
  animation-delay: ${props => 0.4 + (props.$index * 0.08)}s;
  opacity: 0;

  &:hover {
    transform: scale(1.03) translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  @media (min-width: 768px) {
    width: 17.8rem;
    height: 26rem;
  }
`;

const ProjectInner = styled.div`
  padding: 2.5rem 2.25rem;
  color: ${props => props.$light ? '#333' : '#fff'};

  @media (min-width: 768px) {
    padding: 3rem 2.5rem;
  }
`;

const ProjectLogo = styled.div`
  font-family: 'Rammetto One', cursive;
  font-size: 2.5rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    font-size: 3rem;
    margin-bottom: 2rem;
  }
`;

const ProjectName = styled.div`
  font-size: 1rem;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const ProjectSummary = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: ${props => props.$light ? '#555' : 'rgba(255,255,255,0.8)'};
`;

const ExperienceList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ExperienceGroup = styled.li`
  margin-bottom: 2.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ExperienceCompanyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ExperienceIcon = styled.div`
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rammetto One', cursive;
  font-size: 1rem;
  background: ${props => props.$variant === 'volunteer' ? 'rgba(92, 213, 176, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  transition: transform 0.25s ease;

  @media (prefers-color-scheme: light) {
    background: ${props => props.$variant === 'volunteer' ? 'rgba(92, 213, 176, 0.15)' : 'rgba(0, 0, 0, 0.05)'};
  }

  ${ExperienceGroup}:hover & {
    transform: scale(1.1);
  }
`;

const ExperienceCompanyName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const ExperienceLocation = styled.span`
  font-size: 0.8rem;
  opacity: 0.6;
`;

const PositionsList = styled.div`
  margin-left: ${props => props.$connected ? '1.25rem' : '0'};
  padding-left: ${props => props.$connected ? '2.25rem' : '3.5rem'};
  border-left: ${props => props.$connected ? '2px solid rgba(255, 255, 255, 0.15)' : 'none'};

  @media (prefers-color-scheme: light) {
    border-color: rgba(0, 0, 0, 0.1);
  }
`;

const PositionItem = styled.div`
  position: relative;
  padding: 0.75rem 0;
  transition: all 0.25s ease;

  &:hover {
    transform: translateX(4px);
  }
`;

const PositionConnector = styled.div`
  position: absolute;
  left: -2.25rem;
  top: 50%;
  width: 1rem;
  height: 2px;
  background: rgba(255, 255, 255, 0.15);

  @media (prefers-color-scheme: light) {
    background: rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: -4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$isFirst ? '#5cd5b0' : 'rgba(255, 255, 255, 0.3)'};
    transition: all 0.25s ease;

    @media (prefers-color-scheme: light) {
      background: ${props => props.$isFirst ? '#5cd5b0' : 'rgba(0, 0, 0, 0.15)'};
    }
  }

  ${PositionItem}:hover &::before {
    transform: scale(1.3);
    background: #5cd5b0;
  }
`;

const PositionContent = styled.div`
  flex: 1;
`;

const PositionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
`;

const PositionTitle = styled.h4`
  font-size: inherit;
  font-weight: 500;
  margin: 0;
`;

const PositionYear = styled.span`
  font-size: 0.8rem;
  opacity: 0.6;
  font-weight: 400;
`;

const PositionDesc = styled.p`
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.7;
  max-width: 50ch;
  line-height: 1.5;
`;

// Education styles
const EducationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const EducationItem = styled.div`
  display: flex;
  gap: 1rem;
  transition: transform 0.25s ease;

  &:hover {
    transform: translateX(4px);
  }
`;

const EducationIcon = styled.div`
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rammetto One', cursive;
  font-size: 1rem;
  background: rgba(144, 202, 249, 0.2);
  border-radius: 8px;
`;

const EducationContent = styled.div`
  flex: 1;
`;

const EducationDegree = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
`;

const EducationInstitution = styled.p`
  margin: 0;
  opacity: 0.8;
`;

const EducationYear = styled.span`
  font-size: 0.8rem;
  opacity: 0.6;
`;

const EducationHighlights = styled.ul`
  margin: 0.5rem 0 0;
  padding-left: 1rem;
  list-style: disc;
`;

const EducationHighlight = styled.li`
  font-size: 0.85rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
`;

// Awards styles
const AwardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AwardItem = styled.div`
  display: flex;
  gap: 1rem;
  transition: transform 0.25s ease;

  &:hover {
    transform: translateX(4px);
  }
`;

const AwardIcon = styled.div`
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #fff176;
`;

const AwardContent = styled.div`
  flex: 1;
`;

const AwardName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
`;

const AwardOrg = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const AwardYear = styled.span`
  font-size: 0.8rem;
  opacity: 0.6;
`;

// Simple list styles (for presentations, publications)
const SimpleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SimpleItem = styled.div`
  transition: transform 0.25s ease;

  &:hover {
    transform: translateX(4px);
  }
`;

const SimpleTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0 0 0.35rem;
  line-height: 1.4;
`;

const SimpleMeta = styled.p`
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.6;
`;

const PublicationLink = styled.a`
  display: inline-block;
  font-size: 0.75rem;
  margin-top: 0.35rem;
  color: #5cd5b0;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
`;

// Tags/Grid styles (for professional development)
const TagsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const TagItem = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.25s ease;

  @media (prefers-color-scheme: light) {
    background: rgba(0, 0, 0, 0.03);
  }

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);

    @media (prefers-color-scheme: light) {
      background: rgba(0, 0, 0, 0.05);
    }
  }
`;

const TagName = styled.h4`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 0.35rem;
`;

const TagMeta = styled.p`
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.6;
`;

// Skills styles
const SkillsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SkillCategory = styled.div`
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (prefers-color-scheme: light) {
    border-color: rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SkillLabel = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
`;

const SkillDetails = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.7;
`;
