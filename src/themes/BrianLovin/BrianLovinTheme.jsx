import React from 'react';
import styled from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDateRange } from '../../utils/cvHelpers';

export function BrianLovinTheme({ darkMode }) {
  const cv = useCV();

  if (!cv) return null;

  // All data is now pre-normalized by ConfigContext
  const {
    name,
    email,
    location,
    about,
    socialLinks,
    experience,
    volunteer,
    projects,
    education,
    presentations,
    publications,
    awards,
  } = cv;

  // Apply limits for display
  const experienceItems = experience.slice(0, 8);
  const volunteerItems = volunteer.slice(0, 6);
  const projectItems = projects.slice(0, 10);
  const presentationItems = presentations.slice(0, 10);
  const awardItems = awards.slice(0, 8);

  return (
    <Container $darkMode={darkMode}>
      <Content>
        {/* Header */}
        <Header>
          <Avatar>{name.charAt(0)}</Avatar>
          <Name $darkMode={darkMode}>{name}</Name>
          {about && <Bio $darkMode={darkMode}>{about}</Bio>}

          <SocialRow>
            {socialLinks.twitter && (
              <SocialLink $darkMode={darkMode} href={socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter/X">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialLink>
            )}
            {socialLinks.youtube && (
              <SocialLink $darkMode={darkMode} href={socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </SocialLink>
            )}
            {socialLinks.github && (
              <SocialLink $darkMode={darkMode} href={socialLinks.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </SocialLink>
            )}
            {socialLinks.linkedin && (
              <SocialLink $darkMode={darkMode} href={socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </SocialLink>
            )}
            {email && (
              <SocialLink $darkMode={darkMode} href={`mailto:${email}`} aria-label="Email">
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
            <SectionTitle $darkMode={darkMode}>Projects</SectionTitle>
            <ProjectList>
              {projectItems.map((project, idx) => (
                <ProjectItem
                  key={`proj-${idx}`}
                  href={project.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  $hasUrl={!!project.url}
                >
                  <ProjectName $darkMode={darkMode}>
                    {project.name}
                    {project.url && <ExternalArrow>↗</ExternalArrow>}
                  </ProjectName>
                  <ProjectDesc $darkMode={darkMode}>{project.summary}</ProjectDesc>
                </ProjectItem>
              ))}
            </ProjectList>
          </Section>
        )}

        {/* Work Experience */}
        {experienceItems.length > 0 && (
          <Section>
            <SectionTitle $darkMode={darkMode}>Work</SectionTitle>
            <WorkList>
              {experienceItems.map((item, idx) => (
                <WorkItem key={`work-${idx}`}>
                  <WorkIcon $darkMode={darkMode}>{item.company?.charAt(0) || 'W'}</WorkIcon>
                  <WorkInfo>
                    <WorkCompany $darkMode={darkMode}>{item.company}</WorkCompany>
                    <WorkRole $darkMode={darkMode}>{item.title}</WorkRole>
                  </WorkInfo>
                  <WorkDate $darkMode={darkMode}>{formatDateRange(item.startDate, item.endDate)}</WorkDate>
                </WorkItem>
              ))}
            </WorkList>
          </Section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Section>
            <SectionTitle $darkMode={darkMode}>Education</SectionTitle>
            <WorkList>
              {education.map((edu, idx) => (
                <WorkItem key={`edu-${idx}`}>
                  <WorkIcon $darkMode={darkMode} $variant="education">{edu.institution?.charAt(0) || 'E'}</WorkIcon>
                  <WorkInfo>
                    <WorkCompany $darkMode={darkMode}>{edu.institution}</WorkCompany>
                    <WorkRole $darkMode={darkMode}>{edu.degree} in {edu.area}</WorkRole>
                  </WorkInfo>
                  <WorkDate $darkMode={darkMode}>{formatDateRange(edu.start_date, edu.end_date)}</WorkDate>
                </WorkItem>
              ))}
            </WorkList>
          </Section>
        )}

        {/* Volunteer */}
        {volunteerItems.length > 0 && (
          <Section>
            <SectionTitle $darkMode={darkMode}>Volunteer</SectionTitle>
            <WorkList>
              {volunteerItems.map((item, idx) => (
                <WorkItem key={`vol-${idx}`}>
                  <WorkIcon $darkMode={darkMode} $variant="volunteer">{item.company?.charAt(0) || 'V'}</WorkIcon>
                  <WorkInfo>
                    <WorkCompany $darkMode={darkMode}>{item.company}</WorkCompany>
                    <WorkRole $darkMode={darkMode}>{item.title}</WorkRole>
                  </WorkInfo>
                  <WorkDate $darkMode={darkMode}>{formatDateRange(item.startDate, item.endDate)}</WorkDate>
                </WorkItem>
              ))}
            </WorkList>
          </Section>
        )}

        {/* Speaking/Presentations */}
        {presentationItems.length > 0 && (
          <Section>
            <SectionTitle $darkMode={darkMode}>Speaking</SectionTitle>
            <SimpleList>
              {presentationItems.map((pres, idx) => (
                <SimpleItem key={`pres-${idx}`}>
                  <SimpleTitle $darkMode={darkMode}>{pres.name}</SimpleTitle>
                  <SimpleDate $darkMode={darkMode}>{pres.date}</SimpleDate>
                </SimpleItem>
              ))}
            </SimpleList>
          </Section>
        )}

        {/* Publications */}
        {publications.length > 0 && (
          <Section>
            <SectionTitle $darkMode={darkMode}>Publications</SectionTitle>
            <ProjectList>
              {publications.map((pub, idx) => (
                <ProjectItem
                  key={`pub-${idx}`}
                  href={pub.doi ? `https://doi.org/${pub.doi}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  $hasUrl={!!pub.doi}
                >
                  <ProjectName $darkMode={darkMode}>
                    {pub.title}
                    {pub.doi && <ExternalArrow>↗</ExternalArrow>}
                  </ProjectName>
                  <ProjectDesc $darkMode={darkMode}>{pub.journal} • {pub.date}</ProjectDesc>
                </ProjectItem>
              ))}
            </ProjectList>
          </Section>
        )}

        {/* Awards */}
        {awardItems.length > 0 && (
          <Section>
            <SectionTitle $darkMode={darkMode}>Awards</SectionTitle>
            <SimpleList>
              {awardItems.map((award, idx) => (
                <SimpleItem key={`award-${idx}`}>
                  <SimpleTitle $darkMode={darkMode}>{award.name}</SimpleTitle>
                  <SimpleDate $darkMode={darkMode}>{award.date}</SimpleDate>
                </SimpleItem>
              ))}
            </SimpleList>
          </Section>
        )}

        {/* Footer */}
        <Footer $darkMode={darkMode}>
          {location && <FooterText $darkMode={darkMode}>{location}</FooterText>}
          {email && <FooterLink $darkMode={darkMode} href={`mailto:${email}`}>{email}</FooterLink>}
        </Footer>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${({ $darkMode }) => ($darkMode ? '#000' : '#fff')};
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  overflow: auto;
  overscroll-behavior: none;
  transition: background-color 0.2s, color 0.2s;
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
  background: #6366f1;
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
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
`;

const Bio = styled.p`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')};
  line-height: 1.4;
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
  color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)')};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
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
  color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
  text-transform: capitalize;
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
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const ExternalArrow = styled.span`
  font-size: 0.875rem;
  opacity: 0.6;
  margin-left: 0.25rem;
`;

const ProjectDesc = styled.span`
  font-size: 1.125rem;
  color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
  flex: 1;
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
  background: ${({ $variant, $darkMode }) => {
    if ($variant === 'education') return 'rgba(96, 165, 250, 0.2)';
    if ($variant === 'volunteer') return 'rgba(74, 222, 128, 0.2)';
    return $darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
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
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WorkRole = styled.span`
  font-size: 1.125rem;
  color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WorkDate = styled.span`
  font-size: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
  flex-shrink: 0;
  margin-left: auto;
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
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
  flex: 1;
  min-width: 0;
`;

const SimpleDate = styled.span`
  font-size: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
  flex-shrink: 0;
`;

const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
`;

const FooterText = styled.span`
  font-size: 0.875rem;
  color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
`;

const FooterLink = styled.a`
  font-size: 0.875rem;
  color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
  }
`;
