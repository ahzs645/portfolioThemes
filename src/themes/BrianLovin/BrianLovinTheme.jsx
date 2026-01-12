import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function formatDateRange(start, end) {
  const getYear = (d) => {
    if (!d) return '';
    if (isPresent(d)) return 'Current';
    const parts = d.split('-');
    return parts[0]?.slice(-2) || d;
  };

  const startYear = getYear(start);
  const endYear = getYear(end);

  if (!startYear && !endYear) return '';
  if (endYear === 'Current') return 'Current';
  if (!endYear || startYear === endYear) return `'${startYear}`;
  return `${startYear}–${endYear}`;
}

function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = dateStr.split('-');
  const year = parts[0]?.slice(-2) || '';
  const month = parts[1] ? months[parseInt(parts[1], 10) - 1] : '';
  if (month && year) return `${month} '${year}`;
  if (year) return `'${year}`;
  return dateStr;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

function flattenExperience(experience = []) {
  const items = [];
  for (const entry of experience) {
    if (!entry || isArchived(entry)) continue;
    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      for (const position of entry.positions) {
        items.push({
          company: entry.company,
          title: position?.title || entry.position,
          startDate: position?.start_date ?? entry.start_date,
          endDate: position?.end_date ?? entry.end_date ?? null,
        });
      }
    } else {
      items.push({
        company: entry.company,
        title: entry.position,
        startDate: entry.start_date,
        endDate: entry.end_date ?? null,
      });
    }
  }
  return items;
}

export function BrianLovinTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);
  const youtubeUrl = pickSocialUrl(socials, ['youtube']);

  const aboutText = getAboutContent()?.markdown || '';

  const experienceItems = useMemo(() => {
    return flattenExperience(cv?.sections?.experience || []).slice(0, 8);
  }, [cv]);

  const volunteerItems = useMemo(() => {
    return flattenExperience(cv?.sections?.volunteer || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 10);
  }, [cv]);

  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e)).slice(0, 10);
  }, [cv]);

  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e)).slice(0, 8);
  }, [cv]);

  return (
    <Container>
      <Content>
        {/* Header */}
        <Header>
          <Avatar>{fullName.charAt(0)}</Avatar>
          <Name>{fullName}</Name>
          {aboutText && <Bio>{aboutText}</Bio>}

          <SocialRow>
            {twitterUrl && (
              <SocialLink href={twitterUrl} target="_blank" rel="noreferrer" aria-label="Twitter/X">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialLink>
            )}
            {youtubeUrl && (
              <SocialLink href={youtubeUrl} target="_blank" rel="noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </SocialLink>
            )}
            {githubUrl && (
              <SocialLink href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </SocialLink>
            )}
            {linkedinUrl && (
              <SocialLink href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </SocialLink>
            )}
            {email && (
              <SocialLink href={`mailto:${email}`} aria-label="Email">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </SocialLink>
            )}
          </SocialRow>
        </Header>

        {/* Projects */}
        {projectItems.length > 0 && (
          <Section>
            <SectionTitle>Projects</SectionTitle>
            <ProjectList>
              {projectItems.map((project, idx) => (
                <ProjectItem
                  key={`proj-${idx}`}
                  href={project.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  $hasUrl={!!project.url}
                >
                  <ProjectName>
                    {project.name}
                    {project.url && <ExternalArrow>↗</ExternalArrow>}
                  </ProjectName>
                  <ProjectDesc>{project.summary}</ProjectDesc>
                </ProjectItem>
              ))}
            </ProjectList>
          </Section>
        )}

        {/* Work Experience */}
        {experienceItems.length > 0 && (
          <Section>
            <SectionTitle>Work</SectionTitle>
            <WorkList>
              {experienceItems.map((item, idx) => (
                <WorkItem key={`work-${idx}`}>
                  <WorkIcon>{item.company?.charAt(0) || 'W'}</WorkIcon>
                  <WorkInfo>
                    <WorkCompany>{item.company}</WorkCompany>
                    <WorkRole>{item.title}</WorkRole>
                  </WorkInfo>
                  <WorkDate>{formatDateRange(item.startDate, item.endDate)}</WorkDate>
                </WorkItem>
              ))}
            </WorkList>
          </Section>
        )}

        {/* Education */}
        {educationItems.length > 0 && (
          <Section>
            <SectionTitle>Education</SectionTitle>
            <WorkList>
              {educationItems.map((edu, idx) => (
                <WorkItem key={`edu-${idx}`}>
                  <WorkIcon $variant="education">{edu.institution?.charAt(0) || 'E'}</WorkIcon>
                  <WorkInfo>
                    <WorkCompany>{edu.institution}</WorkCompany>
                    <WorkRole>{edu.degree} in {edu.area}</WorkRole>
                  </WorkInfo>
                  <WorkDate>{formatDateRange(edu.start_date, edu.end_date)}</WorkDate>
                </WorkItem>
              ))}
            </WorkList>
          </Section>
        )}

        {/* Volunteer */}
        {volunteerItems.length > 0 && (
          <Section>
            <SectionTitle>Volunteer</SectionTitle>
            <WorkList>
              {volunteerItems.map((item, idx) => (
                <WorkItem key={`vol-${idx}`}>
                  <WorkIcon $variant="volunteer">{item.company?.charAt(0) || 'V'}</WorkIcon>
                  <WorkInfo>
                    <WorkCompany>{item.company}</WorkCompany>
                    <WorkRole>{item.title}</WorkRole>
                  </WorkInfo>
                  <WorkDate>{formatDateRange(item.startDate, item.endDate)}</WorkDate>
                </WorkItem>
              ))}
            </WorkList>
          </Section>
        )}

        {/* Speaking/Presentations */}
        {presentationItems.length > 0 && (
          <Section>
            <SectionTitle>Speaking</SectionTitle>
            <SimpleList>
              {presentationItems.map((pres, idx) => (
                <SimpleItem key={`pres-${idx}`}>
                  <SimpleTitle>{pres.name}</SimpleTitle>
                  <SimpleDate>{pres.date}</SimpleDate>
                </SimpleItem>
              ))}
            </SimpleList>
          </Section>
        )}

        {/* Publications */}
        {publicationItems.length > 0 && (
          <Section>
            <SectionTitle>Publications</SectionTitle>
            <ProjectList>
              {publicationItems.map((pub, idx) => (
                <ProjectItem
                  key={`pub-${idx}`}
                  href={pub.doi ? `https://doi.org/${pub.doi}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  $hasUrl={!!pub.doi}
                >
                  <ProjectName>
                    {pub.title}
                    {pub.doi && <ExternalArrow>↗</ExternalArrow>}
                  </ProjectName>
                  <ProjectDesc>{pub.journal} • {pub.date}</ProjectDesc>
                </ProjectItem>
              ))}
            </ProjectList>
          </Section>
        )}

        {/* Awards */}
        {awardItems.length > 0 && (
          <Section>
            <SectionTitle>Awards</SectionTitle>
            <SimpleList>
              {awardItems.map((award, idx) => (
                <SimpleItem key={`award-${idx}`}>
                  <SimpleTitle>{award.name}</SimpleTitle>
                  <SimpleDate>{award.date}</SimpleDate>
                </SimpleItem>
              ))}
            </SimpleList>
          </Section>
        )}

        {/* Footer */}
        <Footer>
          {location && <FooterText>{location}</FooterText>}
          {email && <FooterLink href={`mailto:${email}`}>{email}</FooterLink>}
        </Footer>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  background-color: #000;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  overflow: auto;
  overscroll-behavior: none;

  @media (prefers-color-scheme: light) {
    background-color: #fff;
    color: #000;
  }
`;

const Content = styled.div`
  max-width: 42rem;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;

  @media (min-width: 640px) {
    padding: 8rem 2rem;
  }
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const Name = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: inherit;

  @media (prefers-color-scheme: light) {
    color: #000;
  }
`;

const Bio = styled.p`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.5);
  }
`;

const SocialRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.4);

    &:hover {
      color: #000;
    }
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 0.875rem;
  font-weight: 400;
  margin: 0;
  color: rgba(255, 255, 255, 0.4);
  text-transform: capitalize;

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.4);
  }
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProjectItem = styled.a`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0.5rem 0;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  &:hover {
    opacity: ${props => props.$hasUrl ? 0.7 : 1};
  }
`;

const ProjectName = styled.span`
  font-size: 1.125rem;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  @media (prefers-color-scheme: light) {
    color: #000;
  }
`;

const ExternalArrow = styled.span`
  font-size: 0.875rem;
  opacity: 0.6;
  margin-left: 0.25rem;
`;

const ProjectDesc = styled.span`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.4);
  flex: 1;

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.4);
  }
`;

const WorkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const WorkItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
`;

const WorkIcon = styled.div`
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  background: ${props => {
    if (props.$variant === 'education') return 'rgba(96, 165, 250, 0.2)';
    if (props.$variant === 'volunteer') return 'rgba(74, 222, 128, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;

  @media (prefers-color-scheme: light) {
    background: ${props => {
      if (props.$variant === 'education') return 'rgba(96, 165, 250, 0.15)';
      if (props.$variant === 'volunteer') return 'rgba(74, 222, 128, 0.15)';
      return 'rgba(0, 0, 0, 0.05)';
    }};
  }
`;

const WorkInfo = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 0;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
`;

const WorkCompany = styled.span`
  font-size: 1.125rem;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (prefers-color-scheme: light) {
    color: #000;
  }
`;

const WorkRole = styled.span`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.4);
  }
`;

const WorkDate = styled.span`
  font-size: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
  margin-left: auto;

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.4);
  }
`;

const SimpleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SimpleItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0.25rem 0;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
`;

const SimpleTitle = styled.span`
  font-size: 1.125rem;
  font-weight: 500;
  color: #fff;
  flex: 1;
  min-width: 0;

  @media (prefers-color-scheme: light) {
    color: #000;
  }
`;

const SimpleDate = styled.span`
  font-size: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.4);
  }
`;

const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (prefers-color-scheme: light) {
    border-color: rgba(0, 0, 0, 0.1);
  }
`;

const FooterText = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.4);
  }
`;

const FooterLink = styled.a`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.4);

    &:hover {
      color: #000;
    }
  }
`;
