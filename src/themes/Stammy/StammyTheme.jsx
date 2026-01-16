import React, { useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

// Global styles to fix overscroll color
const GlobalStyle = createGlobalStyle`
  html, body {
    background-color: ${({ $bg }) => $bg};
    transition: background-color 0.4s ease;
  }
`;

// Helper to check if archived
const isArchived = (entry) => Array.isArray(entry?.tags) && entry.tags.includes('archived');

// Helper to check if present
const isPresent = (value) => String(value || '').trim().toLowerCase() === 'present';

// SVG Icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Theme colors
const themes = {
  dark: {
    bg: '#1c1f1c',
    text: '#e8e4d9',
    textMuted: '#a0a090',
    textSubtle: '#6b6b5f',
    heroGradient: 'linear-gradient(135deg, #a4c639 0%, #8db600 50%, #6b8e23 100%)',
  },
  light: {
    bg: '#f5f4f0',
    text: '#1c1f1c',
    textMuted: '#5a5a50',
    textSubtle: '#8a8a7a',
    heroGradient: 'linear-gradient(135deg, #c4e639 0%, #adb600 50%, #8b9e23 100%)',
  },
};

export function StammyTheme() {
  const cv = useCV();
  const [isDark, setIsDark] = useState(true);

  // Refs for scrolling
  const headerRef = useRef(null);
  const workRef = useRef(null);
  const elsewhereRef = useRef(null);

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
    sectionsRaw,
  } = cv;

  // Get raw experience and volunteer data
  const experienceRaw = (sectionsRaw?.experience || []).filter(e => !isArchived(e));
  const volunteerRaw = (sectionsRaw?.volunteer || []).filter(e => !isArchived(e));
  const awardsRaw = (sectionsRaw?.awards || []).filter(e => !isArchived(e));
  const presentationsRaw = (sectionsRaw?.presentations || []).filter(e => !isArchived(e));
  const publicationsRaw = (sectionsRaw?.publications || []).filter(e => !isArchived(e));
  const professionalDevRaw = (sectionsRaw?.professional_development || []).filter(e => !isArchived(e));

  // Get first name for greeting
  const firstName = name?.split(' ')[0] || 'Hello';

  // Format date range
  const formatDateRange = (startDate, endDate) => {
    const start = startDate ? String(startDate).split('-')[0] : '';
    const end = isPresent(endDate) ? 'Present' : endDate ? String(endDate).split('-')[0] : '';
    if (start === end) return start;
    return `${start}–${end}`;
  };

  // Scroll to section
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Toggle theme with View Transition API circular reveal effect
  const toggleTheme = async (event) => {
    const newTheme = !isDark;

    // If View Transitions API is not supported, just toggle
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsDark(newTheme);
      return;
    }

    // Get button position for the reveal origin
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxDimension = Math.max(window.innerWidth, window.innerHeight);

    // Create transition styles
    const style = document.createElement('style');
    style.id = 'theme-transition-styles';
    style.textContent = `
      ::view-transition-group(root) {
        animation-duration: 800ms;
        animation-timing-function: ease-in-out;
      }

      ::view-transition-new(root) {
        animation: themeReveal 800ms ease-in-out forwards;
        mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-66 -66 132 132"><defs><filter id="blur"><feGaussianBlur stdDeviation="5"/></filter></defs><circle cx="0" cy="0" r="33" fill="black" filter="url(%23blur)"/></svg>') 0 0 / 100% 100% no-repeat;
        mask-position: ${x}px ${y}px;
      }

      ::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }

      @keyframes themeReveal {
        0% {
          mask-position: ${x}px ${y}px;
          mask-size: 0;
        }
        100% {
          mask-position: ${x - 10 * maxDimension / 2}px ${y - 10 * maxDimension / 2}px;
          mask-size: ${10 * maxDimension}px;
        }
      }
    `;
    document.head.appendChild(style);

    try {
      const transition = document.startViewTransition(() => {
        setIsDark(newTheme);
      });

      await transition.finished;

      // Clean up styles
      const existingStyle = document.getElementById('theme-transition-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    } catch (error) {
      console.error('View transition failed:', error);
      setIsDark(newTheme);
    }
  };

  const theme = isDark ? themes.dark : themes.light;

  return (
    <Container $theme={theme} $isDark={isDark}>
      <GlobalStyle $bg={theme.bg} />
      {/* Left Sidebar Navigation */}
      <Sidebar>
        <NavGroup>
          <NavButton
            onClick={() => scrollToSection(headerRef)}
            title="Home"
            $theme={theme}
          >
            <HomeIcon />
          </NavButton>
          <NavButton
            onClick={() => scrollToSection(workRef)}
            title="Work"
            $theme={theme}
          >
            <PersonIcon />
          </NavButton>
          <NavButton
            onClick={() => scrollToSection(elsewhereRef)}
            title="Contact"
            $theme={theme}
          >
            <ChatIcon />
          </NavButton>
          <ThemeToggle
            onClick={(e) => toggleTheme(e)}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            $theme={theme}
            $isDark={isDark}
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
          </ThemeToggle>
        </NavGroup>
      </Sidebar>

      {/* Main Content */}
      <Main>
        <Content>
          {/* Header */}
          <Header ref={headerRef}>
            <Title $theme={theme}>Hello</Title>
            <Subtitle $theme={theme}>
              I'm {firstName}, but I go by {firstName}
            </Subtitle>
          </Header>

          {/* Avatar/Image placeholder */}
          <HeroImage $theme={theme}>
            <HeroInitial>{name?.charAt(0) || 'A'}</HeroInitial>
          </HeroImage>
          <ImageCaption $theme={theme}>
            {location && <>Based in {location}</>}
          </ImageCaption>

          {/* Bio */}
          {about && (
            <Bio>
              <BioText $theme={theme}>{about}</BioText>
              {currentJobTitle && (
                <BioText $theme={theme}>
                  Currently working as a {currentJobTitle.toLowerCase()}.
                </BioText>
              )}
            </Bio>
          )}

          {/* Work Section */}
          {experienceRaw.length > 0 && (
            <Section ref={workRef}>
              <SectionTitle $theme={theme}>Work</SectionTitle>
              <WorkTable>
                {experienceRaw.map((company, idx) => {
                  if (company.positions && company.positions.length > 0) {
                    return company.positions.map((pos, posIdx) => (
                      <WorkRow key={`exp-${idx}-${posIdx}`}>
                        <WorkCompany $theme={theme}>
                          {company.url ? (
                            <WorkLink href={company.url} target="_blank" rel="noreferrer" $theme={theme}>
                              {company.company}
                            </WorkLink>
                          ) : (
                            company.company
                          )}
                        </WorkCompany>
                        <WorkRole $theme={theme}>{pos.title}</WorkRole>
                        <WorkDate $theme={theme}>{formatDateRange(pos.start_date, pos.end_date)}</WorkDate>
                      </WorkRow>
                    ));
                  }
                  return (
                    <WorkRow key={`exp-${idx}`}>
                      <WorkCompany $theme={theme}>
                        {company.url ? (
                          <WorkLink href={company.url} target="_blank" rel="noreferrer" $theme={theme}>
                            {company.company}
                          </WorkLink>
                        ) : (
                          company.company
                        )}
                      </WorkCompany>
                      <WorkRole $theme={theme}>{company.position}</WorkRole>
                      <WorkDate $theme={theme}>{formatDateRange(company.start_date, company.end_date)}</WorkDate>
                    </WorkRow>
                  );
                })}
              </WorkTable>
            </Section>
          )}

          {/* Volunteer Section */}
          {volunteerRaw.length > 0 && (
            <Section>
              <SectionTitle $theme={theme}>Volunteer</SectionTitle>
              <WorkTable>
                {volunteerRaw.map((item, idx) => (
                  <WorkRow key={`vol-${idx}`}>
                    <WorkCompany $theme={theme}>
                      {item.url ? (
                        <WorkLink href={item.url} target="_blank" rel="noreferrer" $theme={theme}>
                          {item.company}
                        </WorkLink>
                      ) : (
                        item.company
                      )}
                    </WorkCompany>
                    <WorkRole $theme={theme}>{item.position}</WorkRole>
                    <WorkDate $theme={theme}>{formatDateRange(item.start_date, item.end_date)}</WorkDate>
                  </WorkRow>
                ))}
              </WorkTable>
            </Section>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <Section>
              <SectionTitle $theme={theme}>Education</SectionTitle>
              <WorkTable>
                {education.map((item, idx) => (
                  <WorkRow key={`edu-${idx}`}>
                    <WorkCompany $theme={theme}>{item.institution}</WorkCompany>
                    <WorkRole $theme={theme}>{item.degree} in {item.area}</WorkRole>
                    <WorkDate $theme={theme}>{item.end_date ? String(item.end_date).split('-')[0] : ''}</WorkDate>
                  </WorkRow>
                ))}
              </WorkTable>
            </Section>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <Section>
              <SectionTitle $theme={theme}>Projects</SectionTitle>
              <BioText $theme={theme}>
                Some things I've built:
              </BioText>
              <DashList>
                {projects.slice(0, 6).map((project, idx) => (
                  <DashItem key={`proj-${idx}`} $theme={theme}>
                    {project.url ? (
                      <StyledLink href={project.url} target="_blank" rel="noreferrer" $theme={theme}>
                        {project.name}
                      </StyledLink>
                    ) : (
                      project.name
                    )}
                    {project.summary && ` — ${project.summary}`}
                  </DashItem>
                ))}
              </DashList>
            </Section>
          )}

          {/* Awards Section */}
          {awardsRaw.length > 0 && (
            <Section>
              <SectionTitle $theme={theme}>Awards</SectionTitle>
              <WorkTable>
                {awardsRaw.map((item, idx) => (
                  <WorkRow key={`award-${idx}`}>
                    <WorkCompany $theme={theme}>{item.name}</WorkCompany>
                    <WorkRole $theme={theme}>{item.summary || ''}</WorkRole>
                    <WorkDate $theme={theme}>{item.date ? String(item.date).split('-')[0] : ''}</WorkDate>
                  </WorkRow>
                ))}
              </WorkTable>
            </Section>
          )}

          {/* Presentations Section */}
          {presentationsRaw.length > 0 && (
            <Section>
              <SectionTitle $theme={theme}>Presentations</SectionTitle>
              <WorkTable>
                {presentationsRaw.map((item, idx) => (
                  <WorkRow key={`pres-${idx}`}>
                    <WorkCompany $theme={theme}>{item.name}</WorkCompany>
                    <WorkRole $theme={theme}>{item.location || ''}</WorkRole>
                    <WorkDate $theme={theme}>{item.date ? String(item.date).split('-')[0] : ''}</WorkDate>
                  </WorkRow>
                ))}
              </WorkTable>
            </Section>
          )}

          {/* Publications Section */}
          {publicationsRaw.length > 0 && (
            <Section>
              <SectionTitle $theme={theme}>Publications</SectionTitle>
              <DashList>
                {publicationsRaw.map((pub, idx) => (
                  <DashItem key={`pub-${idx}`} $theme={theme}>
                    {pub.doi ? (
                      <StyledLink href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer" $theme={theme}>
                        {pub.title || pub.name}
                      </StyledLink>
                    ) : (
                      pub.title || pub.name
                    )}
                    {pub.journal && ` — ${pub.journal}`}
                  </DashItem>
                ))}
              </DashList>
            </Section>
          )}

          {/* Professional Development Section */}
          {professionalDevRaw.length > 0 && (
            <Section>
              <SectionTitle $theme={theme}>Professional Development</SectionTitle>
              <WorkTable>
                {professionalDevRaw.map((item, idx) => (
                  <WorkRow key={`profdev-${idx}`}>
                    <WorkCompany $theme={theme}>{item.name}</WorkCompany>
                    <WorkRole $theme={theme}>{item.location || ''}</WorkRole>
                    <WorkDate $theme={theme}>{item.date ? String(item.date).split('-')[0] : ''}</WorkDate>
                  </WorkRow>
                ))}
              </WorkTable>
            </Section>
          )}

          {/* Elsewhere Section */}
          <Section ref={elsewhereRef}>
            <SectionTitle $theme={theme}>Elsewhere</SectionTitle>
            <BioText $theme={theme}>
              Find me on various platforms:
            </BioText>
            <DashList>
              {email && (
                <DashItem $theme={theme}>
                  Email: <StyledLink href={`mailto:${email}`} $theme={theme}>{email}</StyledLink>
                </DashItem>
              )}
              {phone && (
                <DashItem $theme={theme}>
                  Phone: <StyledLink href={`tel:${phone}`} $theme={theme}>{phone}</StyledLink>
                </DashItem>
              )}
              {socialLinks.github && (
                <DashItem $theme={theme}>
                  GitHub: <StyledLink href={socialLinks.github} target="_blank" rel="noreferrer" $theme={theme}>
                    @{socialLinks.github.split('/').pop()}
                  </StyledLink>
                </DashItem>
              )}
              {socialLinks.linkedin && (
                <DashItem $theme={theme}>
                  LinkedIn: <StyledLink href={socialLinks.linkedin} target="_blank" rel="noreferrer" $theme={theme}>
                    {socialLinks.linkedin.replace('https://www.linkedin.com', '').replace('https://linkedin.com', '')}
                  </StyledLink>
                </DashItem>
              )}
              {socialLinks.twitter && (
                <DashItem $theme={theme}>
                  Twitter: <StyledLink href={socialLinks.twitter} target="_blank" rel="noreferrer" $theme={theme}>
                    @{socialLinks.twitter.split('/').pop()}
                  </StyledLink>
                </DashItem>
              )}
            </DashList>
          </Section>

          {/* Footer */}
          <Footer $theme={theme}>
            Built with care. {new Date().getFullYear()}.
          </Footer>
        </Content>
      </Main>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  height: 100%;
  width: 100%;
  background: ${({ $theme }) => $theme.bg};
  color: ${({ $theme }) => $theme.text};
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 1.0625rem;
  line-height: 1.7;
  display: flex;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: none;
  transition: background-color 0.4s ease, color 0.4s ease;
`;

const Sidebar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 5rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 100;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const NavButton = styled.button`
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  border: none;
  background: transparent;
  color: ${({ $theme }) => $theme.textSubtle};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  position: relative;

  svg {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:hover {
    background: ${({ $theme }) => $theme.text}15;
    color: ${({ $theme }) => $theme.text};

    svg {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.95);
    background: ${({ $theme }) => $theme.text}20;

    svg {
      transform: scale(0.95);
    }
  }
`;

const ThemeToggle = styled.button`
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  border: none;
  background: transparent;
  color: ${({ $theme }) => $theme.textSubtle};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;

  svg {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:hover {
    background: ${({ $theme }) => $theme.text}15;
    color: ${({ $theme }) => $theme.text};

    svg {
      transform: rotate(${({ $isDark }) => $isDark ? '-20deg' : '20deg'});
    }
  }

  &:active {
    transform: scale(0.95);
    background: ${({ $theme }) => $theme.text}20;
  }
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  padding: 4rem 2rem 6rem 6rem;
  margin-left: 5rem;

  @media (max-width: 768px) {
    padding: 3rem 1.5rem 4rem;
    margin-left: 0;
  }
`;

const Content = styled.div`
  max-width: 38rem;
  width: 100%;
`;

const Header = styled.header`
  margin-bottom: 2rem;
  scroll-margin-top: 2rem;
`;

const Title = styled.h1`
  font-family: Georgia, serif;
  font-size: 2.5rem;
  font-weight: 400;
  margin: 0 0 0.5rem 0;
  color: ${({ $theme }) => $theme.text};
  letter-spacing: -0.02em;
  transition: color 0.4s ease;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ $theme }) => $theme.textMuted};
  margin: 0;
  transition: color 0.4s ease;
`;

const HeroImage = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  max-width: 32rem;
  background: ${({ $theme }) => $theme.heroGradient};
  border-radius: 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: contrast(1.1) saturate(0.9);
  transition: filter 0.4s ease;
`;

const HeroInitial = styled.span`
  font-family: Georgia, serif;
  font-size: 8rem;
  color: rgba(0, 0, 0, 0.3);
  font-weight: 400;
`;

const ImageCaption = styled.p`
  font-size: 0.9375rem;
  color: ${({ $theme }) => $theme.textSubtle};
  margin: 0 0 2.5rem 0;
  transition: color 0.4s ease;
`;

const Bio = styled.div`
  margin-bottom: 3rem;
`;

const BioText = styled.p`
  margin: 0 0 1.25rem 0;
  color: ${({ $theme }) => $theme.text};
  transition: color 0.4s ease;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Section = styled.section`
  margin-bottom: 3rem;
  scroll-margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-family: Georgia, serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: ${({ $theme }) => $theme.textMuted};
  margin: 0 0 1.25rem 0;
  transition: color 0.4s ease;
`;

const WorkTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const WorkRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: baseline;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }
`;

const WorkCompany = styled.span`
  color: ${({ $theme }) => $theme.text};
  transition: color 0.4s ease;
`;

const WorkLink = styled.a`
  color: ${({ $theme }) => $theme.text};
  text-decoration: underline;
  text-decoration-color: ${({ $theme }) => $theme.textSubtle};
  text-underline-offset: 3px;
  transition: text-decoration-color 0.2s ease, color 0.4s ease;

  &:hover {
    text-decoration-color: ${({ $theme }) => $theme.text};
  }
`;

const WorkRole = styled.span`
  color: ${({ $theme }) => $theme.textMuted};
  white-space: nowrap;
  transition: color 0.4s ease;

  @media (max-width: 640px) {
    white-space: normal;
  }
`;

const WorkDate = styled.span`
  color: ${({ $theme }) => $theme.textSubtle};
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  transition: color 0.4s ease;
`;

const DashList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
`;

const DashItem = styled.li`
  color: ${({ $theme }) => $theme.text};
  padding-left: 1.5rem;
  position: relative;
  margin-bottom: 0.5rem;
  transition: color 0.4s ease;

  &::before {
    content: '—';
    position: absolute;
    left: 0;
    color: ${({ $theme }) => $theme.textSubtle};
    transition: color 0.4s ease;
  }
`;

const StyledLink = styled.a`
  color: ${({ $theme }) => $theme.text};
  text-decoration: underline;
  text-decoration-color: ${({ $theme }) => $theme.textSubtle};
  text-underline-offset: 3px;
  transition: text-decoration-color 0.2s ease, color 0.4s ease;

  &:hover {
    text-decoration-color: ${({ $theme }) => $theme.text};
  }
`;

const Footer = styled.footer`
  margin-top: 4rem;
  padding-top: 2rem;
  color: ${({ $theme }) => $theme.textSubtle};
  font-size: 0.9375rem;
  transition: color 0.4s ease;
`;
