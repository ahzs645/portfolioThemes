import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

// Load Inter font
const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
`;

// Color tokens matching amirmxt.com
const colors = {
  light: {
    primaryColor: '#1a1a1a',
    secondaryColor: '#4a4a4a',
    linkColor: '#2a2a2a',
    linkHover: '#000000',
    bgColor: '#ffffff',
    bgSecondary: '#f8f9fa',
    primaryBorder: '#f3f4f6',
    accentColor: '#1a1a1a',
  },
  dark: {
    primaryColor: '#e5e5e5',
    secondaryColor: '#a0a0a0',
    linkColor: '#d0d0d0',
    linkHover: '#ffffff',
    bgColor: '#0f0f0f',
    bgSecondary: '#1a1a1a',
    primaryBorder: '#2a2a2a',
    accentColor: '#e5e5e5',
  },
};

// Helper to check if archived
const isArchived = (entry) => Array.isArray(entry?.tags) && entry.tags.includes('archived');

// Helper to check if present
const isPresent = (value) => String(value || '').trim().toLowerCase() === 'present';

export function AmirmxtTheme({ darkMode }) {
  const cv = useCV();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    presentations,
    professionalDevelopment,
    sectionsRaw,
  } = cv;

  const theme = darkMode ? colors.dark : colors.light;

  // Get raw experience data to preserve nested structure, filter out archived
  const experienceRaw = (sectionsRaw?.experience || []).filter(e => !isArchived(e));

  // Get raw volunteer data, filter out archived
  const volunteerRaw = (sectionsRaw?.volunteer || []).filter(e => !isArchived(e));

  const projectItems = projects.slice(0, 6);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <Container $theme={theme}>
      <FontLoader />
      <PageWrapper>
        <MainWrapper>
          <ContentContainer>
            {/* Bio Section */}
            <BioWrapper>
              <BioIntro>
                <ProfileRow>
                  <Avatar $theme={theme}>{name?.charAt(0) || 'A'}</Avatar>
                  <Name $theme={theme}>{name || 'Your Name'}</Name>
                </ProfileRow>
              </BioIntro>

              <BioText>
                <BioDescription $theme={theme}>
                  {about || "Hi, I'm a software developer focused on building great products."}
                </BioDescription>
                {currentJobTitle && (
                  <BioDescription $theme={theme}>
                    Currently working as a {currentJobTitle}.
                  </BioDescription>
                )}
              </BioText>

              {(socialLinks.github || socialLinks.linkedin || socialLinks.twitter || email || phone) && (
                <ContactButtons>
                  {email && (
                    <Button $theme={theme} href={`mailto:${email}`}>
                      Email
                      <ButtonIcon>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 12h8M12 8l4 4-4 4" />
                        </svg>
                      </ButtonIcon>
                    </Button>
                  )}
                  {phone && (
                    <Button $theme={theme} href={`tel:${phone}`}>
                      Phone
                      <ButtonIcon>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 12h8M12 8l4 4-4 4" />
                        </svg>
                      </ButtonIcon>
                    </Button>
                  )}
                  {socialLinks.github && (
                    <Button $theme={theme} href={socialLinks.github} target="_blank" rel="noreferrer">
                      GitHub
                      <ButtonIcon>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 12h8M12 8l4 4-4 4" />
                        </svg>
                      </ButtonIcon>
                    </Button>
                  )}
                  {socialLinks.linkedin && (
                    <Button $theme={theme} href={socialLinks.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                      <ButtonIcon>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 12h8M12 8l4 4-4 4" />
                        </svg>
                      </ButtonIcon>
                    </Button>
                  )}
                  {socialLinks.twitter && (
                    <Button $theme={theme} href={socialLinks.twitter} target="_blank" rel="noreferrer">
                      Twitter
                      <ButtonIcon>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 12h8M12 8l4 4-4 4" />
                        </svg>
                      </ButtonIcon>
                    </Button>
                  )}
                </ContactButtons>
              )}
            </BioWrapper>

            {/* Projects Section */}
            {projectItems.length > 0 && (
              <Section>
                <SectionHeader $theme={theme}>Projects</SectionHeader>
                <ProjectList>
                  {projectItems.map((project, idx) => (
                    <ProjectCard
                      key={`proj-${idx}`}
                      $theme={theme}
                      href={project.url || '#'}
                      target={project.url ? '_blank' : undefined}
                      rel={project.url ? 'noreferrer' : undefined}
                    >
                      <ProjectIcon $theme={theme}>
                        {project.name?.charAt(0) || 'P'}
                      </ProjectIcon>
                      <ProjectInfo>
                        <ProjectName $theme={theme}>{project.name}</ProjectName>
                        <ProjectDescription $theme={theme}>
                          {project.summary}
                        </ProjectDescription>
                      </ProjectInfo>
                      {project.url && (
                        <LearnMore $theme={theme}>
                          View
                          <ButtonIcon>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M8 12h8M12 8l4 4-4 4" />
                            </svg>
                          </ButtonIcon>
                        </LearnMore>
                      )}
                    </ProjectCard>
                  ))}
                </ProjectList>
              </Section>
            )}

            {/* Experience Section */}
            {experienceRaw.length > 0 && (
              <Section>
                <SectionHeader $theme={theme}>Experience</SectionHeader>
                <ExperienceList>
                  {experienceRaw.map((company, idx) => (
                    <ExperienceCompanyBlock key={`exp-${idx}`}>
                      <ExperienceCompanyName $theme={theme}>
                        {company.company}
                        {company.location && (
                          <ExperienceLocation $theme={theme}>{company.location}</ExperienceLocation>
                        )}
                      </ExperienceCompanyName>
                      {company.positions && company.positions.length > 0 ? (
                        <PositionsList $theme={theme}>
                          {company.positions.map((pos, posIdx) => (
                            <PositionItem key={`pos-${posIdx}`}>
                              <ExperiencePosition $theme={theme}>
                                {pos.title}
                                <ExperienceDate $theme={theme}>
                                  {isPresent(pos.end_date) ? 'Present' : pos.end_date ? String(pos.end_date).split('-')[0] : ''}
                                  {pos.start_date && ` — ${String(pos.start_date).split('-')[0]}`}
                                </ExperienceDate>
                              </ExperiencePosition>
                            </PositionItem>
                          ))}
                        </PositionsList>
                      ) : (
                        <ExperiencePosition $theme={theme}>
                          {company.position}
                          <ExperienceDate $theme={theme}>
                            {isPresent(company.end_date) ? 'Present' : company.end_date ? String(company.end_date).split('-')[0] : ''}
                            {company.start_date && ` — ${String(company.start_date).split('-')[0]}`}
                          </ExperienceDate>
                        </ExperiencePosition>
                      )}
                    </ExperienceCompanyBlock>
                  ))}
                </ExperienceList>
              </Section>
            )}

            {/* Volunteer Section */}
            {volunteerRaw.length > 0 && (
              <Section>
                <SectionHeader $theme={theme}>Volunteer</SectionHeader>
                <ExperienceList>
                  {volunteerRaw.map((item, idx) => (
                    <ExperienceCompanyBlock key={`vol-${idx}`}>
                      <ExperienceCompanyName $theme={theme}>
                        {item.company}
                        {item.location && (
                          <ExperienceLocation $theme={theme}>{item.location}</ExperienceLocation>
                        )}
                      </ExperienceCompanyName>
                      <ExperiencePosition $theme={theme}>
                        {item.position}
                        <ExperienceDate $theme={theme}>
                          {isPresent(item.end_date) ? 'Present' : item.end_date ? String(item.end_date).split('-')[0] : ''}
                          {item.start_date && ` — ${String(item.start_date).split('-')[0]}`}
                        </ExperienceDate>
                      </ExperiencePosition>
                    </ExperienceCompanyBlock>
                  ))}
                </ExperienceList>
              </Section>
            )}

            {/* Education Section */}
            {education.length > 0 && (
              <Section>
                <SectionHeader $theme={theme}>Education</SectionHeader>
                <ExperienceList>
                  {education.map((item, idx) => (
                    <ExperienceCompanyBlock key={`edu-${idx}`}>
                      <ExperienceCompanyName $theme={theme}>
                        {item.institution}
                        {item.location && (
                          <ExperienceLocation $theme={theme}>{item.location}</ExperienceLocation>
                        )}
                      </ExperienceCompanyName>
                      <ExperiencePosition $theme={theme}>
                        {item.degree} — {item.area}
                        <ExperienceDate $theme={theme}>
                          {item.end_date ? String(item.end_date).split('-')[0] : ''}
                          {item.start_date && ` — ${String(item.start_date).split('-')[0]}`}
                        </ExperienceDate>
                      </ExperiencePosition>
                    </ExperienceCompanyBlock>
                  ))}
                </ExperienceList>
              </Section>
            )}

            {/* Publications Section */}
            {publications.length > 0 && (
              <Section>
                <SectionHeader $theme={theme}>Publications</SectionHeader>
                <PublicationList>
                  {publications.map((pub, idx) => (
                    <PublicationItem key={`pub-${idx}`}>
                      <PublicationTitle $theme={theme}>{pub.title}</PublicationTitle>
                      <PublicationMeta $theme={theme}>
                        {pub.authors?.join(', ')}
                      </PublicationMeta>
                      <PublicationMeta $theme={theme}>
                        {pub.journal} ({pub.date})
                        {pub.doi && (
                          <PublicationLink
                            $theme={theme}
                            href={`https://doi.org/${pub.doi}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            DOI ↗
                          </PublicationLink>
                        )}
                      </PublicationMeta>
                    </PublicationItem>
                  ))}
                </PublicationList>
              </Section>
            )}

            {/* Awards Section */}
            {awards?.length > 0 && (
              <Section>
                <SectionHeader $theme={theme}>Awards</SectionHeader>
                <ExperienceList>
                  {awards.map((award, idx) => (
                    <ExperienceCompanyBlock key={`award-${idx}`}>
                      <ExperienceCompanyName $theme={theme}>
                        {award.name}
                        {award.date && (
                          <ExperienceDate $theme={theme}>{award.date}</ExperienceDate>
                        )}
                      </ExperienceCompanyName>
                      {award.summary && (
                        <ExperiencePosition $theme={theme}>
                          {award.summary}
                        </ExperiencePosition>
                      )}
                    </ExperienceCompanyBlock>
                  ))}
                </ExperienceList>
              </Section>
            )}

            {/* Presentations Section */}
            {presentations?.length > 0 && (
              <Section>
                <SectionHeader $theme={theme}>Presentations</SectionHeader>
                <ExperienceList>
                  {presentations.map((pres, idx) => (
                    <ExperienceCompanyBlock key={`pres-${idx}`}>
                      <ExperienceCompanyName $theme={theme}>
                        {pres.name}
                        {pres.location && (
                          <ExperienceLocation $theme={theme}>{pres.location}</ExperienceLocation>
                        )}
                      </ExperienceCompanyName>
                      <ExperiencePosition $theme={theme}>
                        {pres.summary}
                        <ExperienceDate $theme={theme}>{pres.date}</ExperienceDate>
                      </ExperiencePosition>
                    </ExperienceCompanyBlock>
                  ))}
                </ExperienceList>
              </Section>
            )}

            {/* Professional Development Section */}
            {professionalDevelopment?.length > 0 && (
              <Section>
                <SectionHeader $theme={theme}>Professional Development</SectionHeader>
                <ExperienceList>
                  {professionalDevelopment.map((item, idx) => (
                    <ExperienceCompanyBlock key={`profdev-${idx}`}>
                      <ExperienceCompanyName $theme={theme}>
                        {item.name}
                        {item.location && (
                          <ExperienceLocation $theme={theme}>{item.location}</ExperienceLocation>
                        )}
                      </ExperienceCompanyName>
                      <ExperiencePosition $theme={theme}>
                        {item.summary}
                        <ExperienceDate $theme={theme}>{item.date}</ExperienceDate>
                      </ExperiencePosition>
                    </ExperienceCompanyBlock>
                  ))}
                </ExperienceList>
              </Section>
            )}
          </ContentContainer>
        </MainWrapper>

        {/* Footer */}
        <Footer $theme={theme}>
          <FooterContent>
            <FooterText $theme={theme}>Always be building.</FooterText>
            <TimeSection $theme={theme}>
              <ClockIcon $theme={theme}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </ClockIcon>
              <TimeText>{formatTime(time)}</TimeText>
              <LocationText $theme={theme}>{location || 'Earth'}</LocationText>
            </TimeSection>
          </FooterContent>
        </Footer>
      </PageWrapper>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  height: 100%;
  width: 100%;
  background: ${({ $theme }) => $theme.bgColor};
  color: ${({ $theme }) => $theme.primaryColor};
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.9375rem;
  line-height: 1.6;
  letter-spacing: -0.02em;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainWrapper = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 0.75rem;
`;

const ContentContainer = styled.div`
  max-width: 42rem;
  width: 100%;
  margin: 0 auto;
  padding: 1.25rem;
  box-sizing: border-box;
`;

const BioWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
  margin-top: 1.25rem;
`;

const BioIntro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 0.375rem;
  background: ${({ $theme }) => $theme.primaryBorder};
  color: ${({ $theme }) => $theme.primaryColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
`;

const Name = styled.h1`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  color: ${({ $theme }) => $theme.primaryColor};
  letter-spacing: -0.02em;
`;

const BioText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BioDescription = styled.p`
  margin: 0;
  line-height: 1.6;
  color: ${({ $theme }) => $theme.primaryColor};
`;

const ContactButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.375rem;
  padding: 0.25rem 0.375rem;
  border: 1px solid ${({ $theme }) => $theme.primaryBorder};
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 400;
  color: ${({ $theme }) => $theme.primaryColor};
  text-decoration: none;
  transition: all 0.2s ease;
  background: ${({ $theme }) => $theme.bgColor};
  white-space: nowrap;
  line-height: 1.25;

  &:hover {
    background: ${({ $theme }) => $theme.bgSecondary};
    transform: translateY(-2px);
  }
`;

const ButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid ${({ $theme }) => $theme?.primaryBorder || '#f3f4f6'};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
  padding-top: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ $theme }) => $theme.primaryBorder};
  color: ${({ $theme }) => $theme.primaryColor};
  letter-spacing: -0.02em;
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ProjectCard = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid ${({ $theme }) => $theme.primaryBorder};
  border-radius: 0.375rem;
  text-decoration: none;
  transition: all 0.15s ease;
  background: ${({ $theme }) => $theme.bgColor};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const ProjectIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  background: ${({ $theme }) => $theme.bgSecondary};
  color: ${({ $theme }) => $theme.primaryColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
`;

const ProjectInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProjectName = styled.div`
  font-weight: 500;
  color: ${({ $theme }) => $theme.primaryColor};
  font-size: 0.9375rem;
`;

const ProjectDescription = styled.div`
  color: ${({ $theme }) => $theme.secondaryColor};
  font-size: 0.875rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const LearnMore = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ $theme }) => $theme.secondaryColor};
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const ExperienceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ExperienceCompanyBlock = styled.li`
  margin: 0;
  line-height: 1.6;
`;

const ExperienceCompanyName = styled.div`
  font-weight: 600;
  color: ${({ $theme }) => $theme.primaryColor};
  font-size: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ExperienceLocation = styled.span`
  font-weight: 400;
  font-size: 0.75rem;
  color: ${({ $theme }) => $theme.secondaryColor};
`;

const PositionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.75rem;
  border-left: 2px solid ${({ $theme }) => $theme?.primaryBorder || '#f3f4f6'};
`;

const PositionItem = styled.div`
  padding: 0.25rem 0;
`;

const ExperiencePosition = styled.div`
  font-weight: 500;
  color: ${({ $theme }) => $theme.primaryColor};
  font-size: 0.9375rem;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const ExperienceDate = styled.span`
  color: ${({ $theme }) => $theme.secondaryColor};
  font-size: 0.75rem;
  font-weight: 400;
`;

const PublicationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PublicationItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PublicationTitle = styled.div`
  font-weight: 500;
  color: ${({ $theme }) => $theme.primaryColor};
  font-size: 0.9375rem;
  line-height: 1.5;
`;

const PublicationMeta = styled.div`
  color: ${({ $theme }) => $theme.secondaryColor};
  font-size: 0.8125rem;
  line-height: 1.5;
`;

const PublicationLink = styled.a`
  color: ${({ $theme }) => $theme.linkColor};
  text-decoration: none;
  margin-left: 0.5rem;
  font-size: 0.75rem;

  &:hover {
    color: ${({ $theme }) => $theme.linkHover};
  }
`;

const Footer = styled.footer`
  width: 100%;
  padding: 1rem 0;
  background: ${({ $theme }) => $theme.bgSecondary};
  border-top: 1px solid ${({ $theme }) => $theme.primaryBorder};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 42rem;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0 1.25rem;
`;

const FooterText = styled.p`
  font-size: 0.75rem;
  font-weight: 400;
  color: ${({ $theme }) => $theme.secondaryColor};
  margin: 0;
`;

const TimeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ $theme }) => $theme.secondaryColor};
  font-size: 0.875rem;
`;

const ClockIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${({ $theme }) => $theme.secondaryColor};
`;

const TimeText = styled.span`
  font-size: 0.75rem;
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
`;

const LocationText = styled.span`
  font-size: 0.625rem;
  color: ${({ $theme }) => $theme.secondaryColor};
  margin-left: 0.25rem;
  opacity: 0.7;
`;
