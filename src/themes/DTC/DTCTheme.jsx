import React, { useMemo, useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function formatYear(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Present';
  const yearMatch = String(dateStr).match(/\d{4}/);
  return yearMatch ? yearMatch[0] : dateStr;
}

// Particles Component
function Particles({ isDark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particleColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';
      const lineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

      // Draw particles
      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1 - dist / 150;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(drawParticles);
    };

    resize();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return <ParticlesCanvas ref={canvasRef} />;
}

// Color palette for timeline icons and project cards
const COLORS = [
  { bg: '#1976d2', fg: '#fff' }, // Blue
  { bg: '#388e3c', fg: '#fff' }, // Green
  { bg: '#f57c00', fg: '#fff' }, // Orange
  { bg: '#7b1fa2', fg: '#fff' }, // Purple
  { bg: '#c2185b', fg: '#fff' }, // Pink
  { bg: '#00796b', fg: '#fff' }, // Teal
  { bg: '#5d4037', fg: '#fff' }, // Brown
  { bg: '#455a64', fg: '#fff' }, // Blue Grey
];

export function DTCTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const fullName = cv?.name || 'Your Name';
  const avatarUrl = cv?.avatar || null;
  const subtitle = cv?.label || cv?.headline || '';
  const phone = cv?.phone || null;
  const email = cv?.email || null;

  const socials = cv?.social || [];
  const aboutText = getAboutContent()?.markdown || '';

  // Experience items for timeline - with nesting support
  const experienceItems = useMemo(() => {
    const items = [];
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));

    for (const exp of experiences) {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        // Nested positions under company
        items.push({
          type: 'nested',
          company: exp.company,
          url: exp.url,
          location: exp.location,
          positions: exp.positions.map(pos => ({
            title: pos.title || pos.position,
            startDate: formatYear(pos.start_date),
            endDate: formatYear(pos.end_date),
            summary: pos.summary,
          })),
        });
      } else {
        // Single position
        items.push({
          type: 'single',
          company: exp.company,
          title: exp.position,
          startDate: formatYear(exp.start_date),
          endDate: formatYear(exp.end_date),
          summary: exp.summary,
          url: exp.url,
          location: exp.location,
        });
      }
    }

    return items.slice(0, 10);
  }, [cv]);

  // Education items
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e)).map(edu => ({
      institution: edu.institution,
      degree: edu.degree || edu.area,
      startDate: formatYear(edu.start_date),
      endDate: formatYear(edu.end_date) || formatYear(edu.graduation_date),
      summary: edu.summary,
      url: edu.url,
      location: edu.location,
    })).slice(0, 6);
  }, [cv]);

  // Volunteer items
  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || []).filter(e => !isArchived(e)).map(vol => ({
      organization: vol.organization,
      position: vol.position || vol.role,
      startDate: formatYear(vol.start_date),
      endDate: formatYear(vol.end_date),
      summary: vol.summary,
      url: vol.url,
    })).slice(0, 6);
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  // Awards items
  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e));
  }, [cv]);

  // Presentations items
  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e));
  }, [cv]);

  // Publications items
  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  // Professional Development items
  const professionalDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e));
  }, [cv]);

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default to dark for this theme
  });

  const toggleDarkMode = () => setIsDark(prev => !prev);
  const theme = { isDark };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        {/* Particles Background */}
        <Particles isDark={isDark} />

        {/* Splash Hero */}
        <Splash>
          {avatarUrl ? (
            <ProfilePicture src={avatarUrl} alt={fullName} />
          ) : (
            <ProfilePlaceholder>{fullName.charAt(0)}</ProfilePlaceholder>
          )}
          <SplashName>{fullName}</SplashName>
          <SplashSubtitle>{subtitle}</SplashSubtitle>
          <Socials>
            {socials.map((social, idx) => (
              <SocialLink
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener"
                title={social.network}
              >
                {social.network}
              </SocialLink>
            ))}
            {phone && (
              <SocialLink
                href={`tel:${phone}`}
                title="Phone"
              >
                Phone
              </SocialLink>
            )}
            {email && (
              <SocialLink
                href={`mailto:${email}`}
                title="Email"
              >
                Email
              </SocialLink>
            )}
            <ThemeToggle onClick={toggleDarkMode} title="Toggle theme">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </ThemeToggle>
          </Socials>
        </Splash>

        {/* About Me Section */}
        {aboutText && (
          <Section>
            <SectionContainer>
              <AboutText>{aboutText}</AboutText>
            </SectionContainer>
          </Section>
        )}

        {/* Portfolio Section */}
        <SectionTitle>
          <h2>Portfolio</h2>
        </SectionTitle>

        {projectItems.length > 0 && (
          <Section>
            <SectionContainer>
              <SectionHeading>Top Projects</SectionHeading>
              <ProjectsGrid>
                {projectItems.map((project, idx) => {
                  const color = COLORS[idx % COLORS.length];
                  return (
                    <ProjectCard key={idx} $bg={color.bg} $fg={color.fg}>
                      <ProjectCardContent>
                        <ProjectIcon>{project.name?.charAt(0) || 'P'}</ProjectIcon>
                        <ProjectName>{project.name}</ProjectName>
                        {project.summary && (
                          <ProjectDescription>{project.summary}</ProjectDescription>
                        )}
                      </ProjectCardContent>
                      {project.url && (
                        <ProjectCardActions>
                          <ProjectButton href={project.url} target="_blank" rel="noopener">
                            View Project
                          </ProjectButton>
                        </ProjectCardActions>
                      )}
                    </ProjectCard>
                  );
                })}
              </ProjectsGrid>

              {/* Experience Timeline */}
              {experienceItems.length > 0 && (
                <>
                  <SectionHeading>Experience</SectionHeading>
                  <Timeline>
                    {experienceItems.map((item, idx) => {
                      const color = COLORS[idx % COLORS.length];
                      return (
                        <TimelineElement key={idx}>
                          <TimelineIcon $bg={color.bg} $fg={color.fg}>
                            <BriefcaseIcon />
                          </TimelineIcon>
                          <TimelineContent>
                            {item.type === 'nested' ? (
                              <>
                                <TimelineCompany>
                                  {item.url ? (
                                    <a href={item.url} target="_blank" rel="noopener">{item.company}</a>
                                  ) : (
                                    item.company
                                  )}
                                  {item.location && <TimelineLocation>{item.location}</TimelineLocation>}
                                </TimelineCompany>
                                <NestedPositions>
                                  {item.positions.map((pos, posIdx) => (
                                    <NestedPosition key={posIdx}>
                                      <NestedPositionTitle>{pos.title}</NestedPositionTitle>
                                      <NestedPositionDate>
                                        {pos.startDate} — {pos.endDate || 'Present'}
                                      </NestedPositionDate>
                                      {pos.summary && (
                                        <TimelineDescription>{pos.summary}</TimelineDescription>
                                      )}
                                    </NestedPosition>
                                  ))}
                                </NestedPositions>
                              </>
                            ) : (
                              <>
                                <TimelineTitle>{item.title}</TimelineTitle>
                                <TimelineSubtitle>
                                  {item.url ? (
                                    <a href={item.url} target="_blank" rel="noopener">{item.company}</a>
                                  ) : (
                                    item.company
                                  )}
                                  {item.location && <TimelineLocation>{item.location}</TimelineLocation>}
                                </TimelineSubtitle>
                                {item.summary && (
                                  <TimelineDescription>{item.summary}</TimelineDescription>
                                )}
                                <TimelineDate>
                                  {item.startDate} — {item.endDate || 'Present'}
                                </TimelineDate>
                              </>
                            )}
                          </TimelineContent>
                        </TimelineElement>
                      );
                    })}
                  </Timeline>
                </>
              )}

              {/* Education Timeline */}
              {educationItems.length > 0 && (
                <>
                  <SectionHeading>Education</SectionHeading>
                  <Timeline>
                    {educationItems.map((item, idx) => {
                      const color = COLORS[(idx + 3) % COLORS.length];
                      return (
                        <TimelineElement key={idx}>
                          <TimelineIcon $bg={color.bg} $fg={color.fg}>
                            <GraduationIcon />
                          </TimelineIcon>
                          <TimelineContent>
                            <TimelineTitle>{item.degree}</TimelineTitle>
                            <TimelineSubtitle>
                              {item.url ? (
                                <a href={item.url} target="_blank" rel="noopener">{item.institution}</a>
                              ) : (
                                item.institution
                              )}
                              {item.location && <TimelineLocation>{item.location}</TimelineLocation>}
                            </TimelineSubtitle>
                            {item.summary && (
                              <TimelineDescription>{item.summary}</TimelineDescription>
                            )}
                            <TimelineDate>
                              {item.startDate} — {item.endDate || 'Present'}
                            </TimelineDate>
                          </TimelineContent>
                        </TimelineElement>
                      );
                    })}
                  </Timeline>
                </>
              )}

              {/* Volunteer Timeline */}
              {volunteerItems.length > 0 && (
                <>
                  <SectionHeading>Volunteer</SectionHeading>
                  <Timeline>
                    {volunteerItems.map((item, idx) => {
                      const color = COLORS[(idx + 5) % COLORS.length];
                      return (
                        <TimelineElement key={idx}>
                          <TimelineIcon $bg={color.bg} $fg={color.fg}>
                            <HeartIcon />
                          </TimelineIcon>
                          <TimelineContent>
                            <TimelineTitle>{item.position}</TimelineTitle>
                            <TimelineSubtitle>
                              {item.url ? (
                                <a href={item.url} target="_blank" rel="noopener">{item.organization}</a>
                              ) : (
                                item.organization
                              )}
                            </TimelineSubtitle>
                            {item.summary && (
                              <TimelineDescription>{item.summary}</TimelineDescription>
                            )}
                            <TimelineDate>
                              {item.startDate} — {item.endDate || 'Present'}
                            </TimelineDate>
                          </TimelineContent>
                        </TimelineElement>
                      );
                    })}
                  </Timeline>
                </>
              )}

              {/* Awards Timeline */}
              {awardItems.length > 0 && (
                <>
                  <SectionHeading>Awards</SectionHeading>
                  <Timeline>
                    {awardItems.map((item, idx) => {
                      const color = COLORS[(idx + 1) % COLORS.length];
                      return (
                        <TimelineElement key={idx}>
                          <TimelineIcon $bg={color.bg} $fg={color.fg}>
                            <TrophyIcon />
                          </TimelineIcon>
                          <TimelineContent>
                            <TimelineTitle>{item.name}</TimelineTitle>
                            {item.summary && (
                              <TimelineDescription>{item.summary}</TimelineDescription>
                            )}
                            <TimelineDate>
                              {formatYear(item.date)}
                            </TimelineDate>
                          </TimelineContent>
                        </TimelineElement>
                      );
                    })}
                  </Timeline>
                </>
              )}

              {/* Presentations Timeline */}
              {presentationItems.length > 0 && (
                <>
                  <SectionHeading>Presentations</SectionHeading>
                  <Timeline>
                    {presentationItems.map((item, idx) => {
                      const color = COLORS[(idx + 2) % COLORS.length];
                      return (
                        <TimelineElement key={idx}>
                          <TimelineIcon $bg={color.bg} $fg={color.fg}>
                            <MicIcon />
                          </TimelineIcon>
                          <TimelineContent>
                            <TimelineTitle>{item.name}</TimelineTitle>
                            {item.location && (
                              <TimelineSubtitle>{item.location}</TimelineSubtitle>
                            )}
                            {item.summary && (
                              <TimelineDescription>{item.summary}</TimelineDescription>
                            )}
                            <TimelineDate>
                              {formatYear(item.date)}
                            </TimelineDate>
                          </TimelineContent>
                        </TimelineElement>
                      );
                    })}
                  </Timeline>
                </>
              )}

              {/* Publications Timeline */}
              {publicationItems.length > 0 && (
                <>
                  <SectionHeading>Publications</SectionHeading>
                  <Timeline>
                    {publicationItems.map((item, idx) => {
                      const color = COLORS[(idx + 4) % COLORS.length];
                      return (
                        <TimelineElement key={idx}>
                          <TimelineIcon $bg={color.bg} $fg={color.fg}>
                            <BookIcon />
                          </TimelineIcon>
                          <TimelineContent>
                            <TimelineTitle>
                              {item.url || item.doi ? (
                                <a href={item.url || `https://doi.org/${item.doi}`} target="_blank" rel="noopener">
                                  {item.name || item.title}
                                </a>
                              ) : (
                                item.name || item.title
                              )}
                            </TimelineTitle>
                            {(item.publisher || item.journal) && (
                              <TimelineSubtitle>{item.publisher || item.journal}</TimelineSubtitle>
                            )}
                            {item.summary && (
                              <TimelineDescription>{item.summary}</TimelineDescription>
                            )}
                            <TimelineDate>
                              {formatYear(item.date)}
                            </TimelineDate>
                          </TimelineContent>
                        </TimelineElement>
                      );
                    })}
                  </Timeline>
                </>
              )}

              {/* Professional Development Timeline */}
              {professionalDevItems.length > 0 && (
                <>
                  <SectionHeading>Professional Development</SectionHeading>
                  <Timeline>
                    {professionalDevItems.map((item, idx) => {
                      const color = COLORS[(idx + 6) % COLORS.length];
                      return (
                        <TimelineElement key={idx}>
                          <TimelineIcon $bg={color.bg} $fg={color.fg}>
                            <StarIcon />
                          </TimelineIcon>
                          <TimelineContent>
                            <TimelineTitle>{item.name}</TimelineTitle>
                            {item.location && (
                              <TimelineSubtitle>{item.location}</TimelineSubtitle>
                            )}
                            {item.summary && (
                              <TimelineDescription>{item.summary}</TimelineDescription>
                            )}
                            <TimelineDate>
                              {formatYear(item.date)}
                            </TimelineDate>
                          </TimelineContent>
                        </TimelineElement>
                      );
                    })}
                  </Timeline>
                </>
              )}
            </SectionContainer>
          </Section>
        )}

        {/* Footer */}
        <Footer>
          <FooterContainer>
            <FooterSection>
              <FooterTitle>Contact</FooterTitle>
              <FooterLinks>
                {socials.slice(0, 4).map((social, idx) => (
                  <FooterLink key={idx} href={social.url} target="_blank" rel="noopener">
                    {social.network}
                  </FooterLink>
                ))}
              </FooterLinks>
            </FooterSection>
          </FooterContainer>
          <Copyright>
            <CopyrightContainer>
              <CopyrightText>&copy; {new Date().getFullYear()} {fullName}</CopyrightText>
            </CopyrightContainer>
          </Copyright>
        </Footer>
      </Container>
    </ThemeProvider>
  );
}

// Icons
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
  </svg>
);

const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${props => props.theme.isDark ? '#1b1b1b' : '#f5f5f5'};
  color: ${props => props.theme.isDark ? '#e5e5e5' : '#333'};
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.43;
  -webkit-font-smoothing: antialiased;
  position: relative;
`;

const ParticlesCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

const Splash = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
`;

const ProfilePicture = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
`;

const ProfilePlaceholder = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 300;
  color: white;
`;

const SplashName = styled.h1`
  font-family: 'Nunito', 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 300;
  margin: 30px 0 10px;
  color: ${props => props.theme.isDark ? '#fff' : '#333'};
`;

const SplashSubtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0;
  color: ${props => props.theme.isDark ? '#e5e5e5' : '#666'};
`;

const Socials = styled.div`
  margin-top: 32px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const SocialLink = styled.a`
  padding: 8px 16px;
  background: ${props => props.theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  color: ${props => props.theme.isDark ? '#fff' : '#333'};
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
  }
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: ${props => props.theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  color: ${props => props.theme.isDark ? '#fff' : '#333'};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
  }
`;

const Section = styled.div`
  background: ${props => props.theme.isDark ? '#fff' : '#fff'};
  color: ${props => props.theme.isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.8)'};
  padding: 24px 0;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
  position: relative;
  z-index: 1;
`;

const SectionContainer = styled.div`
  width: 100%;
  max-width: 1280px;
  padding: clamp(8px, 5%, 24px);
  margin: 0 auto;
`;

const AboutText = styled.p`
  font-weight: 300;
  font-size: 1.5rem;
  line-height: 1.6;
  margin: 0;
`;

const SectionTitle = styled.div`
  padding: 75px 0;
  color: ${props => props.theme.isDark ? '#fff' : '#333'};
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  z-index: 1;

  h2 {
    margin: 0;
    font-size: 2.125rem;
    font-weight: 400;
    line-height: 1.235;
  }
`;

const SectionHeading = styled.h3`
  margin: 40px 0 20px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.334;

  &:first-of-type {
    margin-top: 0;
  }
`;

const ProjectsGrid = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-content: center;
  gap: 20px;
`;

const ProjectCard = styled.div`
  width: clamp(280px, 100%, 350px);
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background-color: ${props => props.$bg};
  color: ${props => props.$fg};
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
`;

const ProjectCardContent = styled.div`
  padding: 16px;
  flex-grow: 1;
`;

const ProjectIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 500;
`;

const ProjectName = styled.h4`
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.6;
  margin: 0 0 8px;
  text-align: center;
`;

const ProjectDescription = styled.p`
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
`;

const ProjectCardActions = styled.div`
  display: flex;
  padding: 8px;
  align-items: center;
`;

const ProjectButton = styled.a`
  padding: 4px 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.75;
  border-radius: 4px;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

const Timeline = styled.div`
  margin: 2em auto;
  max-width: 1170px;
  padding: 2em 0;
  position: relative;
  width: 95%;

  &::before {
    content: '';
    background: ${props => props.theme.isDark ? '#1b1b1b' : '#ddd'};
    background-image: linear-gradient(
      180deg,
      ${props => props.theme.isDark ? '#fff' : '#fff'} 0,
      ${props => props.theme.isDark ? '#1b1b1b' : '#ddd'} 30px,
      ${props => props.theme.isDark ? '#1b1b1b' : '#ddd'} calc(100% - 30px),
      ${props => props.theme.isDark ? '#fff' : '#fff'}
    );
    border-radius: 4px;
    height: 100%;
    position: absolute;
    top: 0;
    width: 4px;
    left: 18px;
  }

  @media (min-width: 1170px) {
    margin: 3em auto;
    width: 90%;

    &::before {
      left: 50%;
      margin-left: -2px;
    }
  }
`;

const TimelineElement = styled.div`
  position: relative;
  margin: 2em 0;

  &::after {
    clear: both;
    content: '';
    display: table;
  }

  @media (min-width: 1170px) {
    margin: 4em 0;

    &:nth-child(2n) > div:last-child {
      float: right;
    }

    &:nth-child(2n) span:last-child {
      left: auto;
      right: 124%;
      text-align: right;
    }
  }
`;

const TimelineIcon = styled.span`
  border-radius: 50%;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
  height: 40px;
  width: 40px;
  left: 0;
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$bg};
  color: ${props => props.$fg};

  svg {
    width: 20px;
    height: 20px;
  }

  @media (min-width: 1170px) {
    width: 60px;
    height: 60px;
    left: 50%;
    margin-left: -30px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const TimelineContent = styled.div`
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
  background: #fff;
  border-radius: 0.25em;
  margin-left: 60px;
  padding: 1em;
  position: relative;
  color: #333;

  @media (min-width: 1170px) {
    margin-left: 0;
    padding: 1.5em;
    width: 44%;
  }
`;

const TimelineTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.334;
  margin: 0;
  color: #333;
`;

const TimelineSubtitle = styled.h5`
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  margin: 4px 0 0;
  color: #666;

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const TimelineDescription = styled.p`
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.6;
  margin: 1em 0 0;
  color: #555;
`;

const TimelineDate = styled.span`
  color: #333;
  font-size: 0.8125rem;
  font-weight: 500;
  display: inline-block;
  float: left;
  opacity: 0.7;
  padding: 0.8em 0;

  @media (min-width: 1170px) {
    font-size: 1rem;
    left: 124%;
    position: absolute;
    top: 6px;
    width: 100%;
  }
`;

const TimelineCompany = styled.h4`
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.334;
  margin: 0 0 0.5rem;
  color: #333;

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const TimelineLocation = styled.span`
  font-size: 0.875rem;
  font-weight: 400;
  color: #888;
  margin-left: 0.5rem;

  &::before {
    content: '·';
    margin-right: 0.5rem;
  }
`;

const NestedPositions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid #e5e5e5;
`;

const NestedPosition = styled.div`
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -1rem;
    top: 0.5rem;
    width: 8px;
    height: 8px;
    background: #999;
    border-radius: 50%;
    transform: translateX(-50%);
  }
`;

const NestedPositionTitle = styled.h5`
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
  margin: 0;
  color: #333;
`;

const NestedPositionDate = styled.span`
  font-size: 0.8125rem;
  font-weight: 400;
  color: #666;
  display: block;
  margin-top: 2px;
`;

const Footer = styled.footer`
  background: ${props => props.theme.isDark ? '#1f1f1f' : '#333'};
  color: ${props => props.theme.isDark ? '#e5e5e5' : '#fff'};
  position: relative;
  z-index: 1;
`;

const FooterContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;

const FooterSection = styled.div`
  flex-grow: 1;
`;

const FooterTitle = styled.h2`
  margin: 0 0 0.656rem 0;
  font-size: 1.25rem;
  font-weight: 400;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.a`
  color: #00acff;
  text-decoration: none;
  display: block;
  padding: 4px 0;

  &:hover {
    text-decoration: underline;
  }
`;

const Copyright = styled.div`
  background: rgba(0, 0, 0, 0.3);
`;

const CopyrightContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 8px 24px;
`;

const CopyrightText = styled.p`
  margin: 0;
  font-weight: 300;
  font-size: 0.8rem;
`;
