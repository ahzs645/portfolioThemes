import React, { useState, useRef, useCallback } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDateRange } from '../../utils/cvHelpers';

/* ───── fonts ───── */
const FontStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600&display=swap');
`;

/* ───── animations ───── */
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0px);
  }
`;

/* ───── spotlight card ───── */
function SpotlightCard({ children, darkMode, href, ...rest }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const Wrapper = href ? SpotlightAnchor : SpotlightDiv;

  return (
    <Wrapper
      ref={ref}
      $darkMode={darkMode}
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      {...rest}
    >
      <SpotlightGlow
        $darkMode={darkMode}
        style={{
          left: pos.x,
          top: pos.y,
          opacity: hovering ? 1 : 0,
        }}
      />
      <SpotlightInner $darkMode={darkMode}>{children}</SpotlightInner>
    </Wrapper>
  );
}

/* ───── arrow icon for social links ───── */
function ArrowUpRight() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 12, height: 12 }}
    >
      <path
        d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ───── main theme component ───── */
export function NimTheme({ darkMode }) {
  const cv = useCV();
  if (!cv) return null;

  const {
    name,
    about,
    email,
    phone,
    location,
    currentJobTitle,
    socialLinks,
    experience,
    projects,
    education,
    volunteer,
    awards,
    presentations,
    publications,
    professionalDevelopment,
    skills,
    languages,
    certifications,
    certificationsSkills,
  } = cv;

  const experienceItems = experience.slice(0, 8);
  const projectItems = projects.slice(0, 6);
  const educationItems = education.slice(0, 4);
  const volunteerItems = volunteer.slice(0, 4);
  const awardItems = awards.slice(0, 6);
  const presentationItems = presentations.slice(0, 6);
  const certItems = certifications?.slice(0, 6) || [];
  const certSkillItems = certificationsSkills?.slice(0, 6) || [];

  /* build social pills */
  const pills = [];
  if (socialLinks.github) pills.push({ label: 'Github', href: socialLinks.github });
  if (socialLinks.twitter) pills.push({ label: 'Twitter', href: socialLinks.twitter });
  if (socialLinks.linkedin) pills.push({ label: 'LinkedIn', href: socialLinks.linkedin });
  if (socialLinks.youtube) pills.push({ label: 'YouTube', href: socialLinks.youtube });
  if (socialLinks.website) pills.push({ label: 'Website', href: socialLinks.website });

  let sectionIndex = 0;

  return (
    <>
      <FontStyle />
      <Container $darkMode={darkMode}>
        <PageWrap>
          {/* ── Header ── */}
          <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
            <HeaderWrap>
              <NameText $darkMode={darkMode}>{name}</NameText>
              {currentJobTitle && (
                <JobTitle $darkMode={darkMode}>{currentJobTitle}</JobTitle>
              )}
            </HeaderWrap>
          </AnimSection>

          {/* ── About ── */}
          {about && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <AboutText $darkMode={darkMode}>{about}</AboutText>
            </AnimSection>
          )}

          {/* ── Projects ── */}
          {projectItems.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Selected Projects</SectionHeading>
              <ProjectGrid>
                {projectItems.map((p, i) => (
                  <ProjectCard key={i}>
                    <ProjectFrame $darkMode={darkMode}>
                      <ProjectInitial $darkMode={darkMode}>
                        {p.name?.charAt(0) || 'P'}
                      </ProjectInitial>
                    </ProjectFrame>
                    <ProjectMeta>
                      <ProjectName
                        $darkMode={darkMode}
                        href={p.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        $hasUrl={!!p.url}
                      >
                        {p.name}
                        <ProjectUnderline $darkMode={darkMode} />
                      </ProjectName>
                      <ProjectDesc $darkMode={darkMode}>{p.summary}</ProjectDesc>
                    </ProjectMeta>
                  </ProjectCard>
                ))}
              </ProjectGrid>
            </AnimSection>
          )}

          {/* ── Work Experience ── */}
          {experienceItems.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Work Experience</SectionHeading>
              <CardStack>
                {experienceItems.map((job, i) => (
                  <SpotlightCard key={i} darkMode={darkMode}>
                    <CardRow>
                      <CardInfo>
                        <CardTitle $darkMode={darkMode}>{job.title}</CardTitle>
                        <CardSub $darkMode={darkMode}>{job.company}</CardSub>
                      </CardInfo>
                      <CardDate $darkMode={darkMode}>
                        {formatDateRange(job.startDate, job.endDate)}
                      </CardDate>
                    </CardRow>
                  </SpotlightCard>
                ))}
              </CardStack>
            </AnimSection>
          )}

          {/* ── Education ── */}
          {educationItems.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Education</SectionHeading>
              <CardStack>
                {educationItems.map((edu, i) => (
                  <SpotlightCard key={i} darkMode={darkMode}>
                    <CardRow>
                      <CardInfo>
                        <CardTitle $darkMode={darkMode}>{edu.institution}</CardTitle>
                        <CardSub $darkMode={darkMode}>
                          {edu.degree}{edu.area ? ` in ${edu.area}` : ''}
                        </CardSub>
                      </CardInfo>
                      <CardDate $darkMode={darkMode}>
                        {formatDateRange(edu.start_date, edu.end_date)}
                      </CardDate>
                    </CardRow>
                  </SpotlightCard>
                ))}
              </CardStack>
            </AnimSection>
          )}

          {/* ── Volunteer ── */}
          {volunteerItems.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Volunteering</SectionHeading>
              <CardStack>
                {volunteerItems.map((v, i) => (
                  <SpotlightCard key={i} darkMode={darkMode}>
                    <CardRow>
                      <CardInfo>
                        <CardTitle $darkMode={darkMode}>{v.title}</CardTitle>
                        <CardSub $darkMode={darkMode}>{v.company}</CardSub>
                      </CardInfo>
                      <CardDate $darkMode={darkMode}>
                        {formatDateRange(v.startDate, v.endDate)}
                      </CardDate>
                    </CardRow>
                  </SpotlightCard>
                ))}
              </CardStack>
            </AnimSection>
          )}

          {/* ── Presentations ── */}
          {presentationItems.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Speaking</SectionHeading>
              <ListBlock>
                {presentationItems.map((p, i) => (
                  <ListRow key={i} $darkMode={darkMode}>
                    <ListName $darkMode={darkMode}>{p.name}</ListName>
                    <ListDate $darkMode={darkMode}>{p.date}</ListDate>
                  </ListRow>
                ))}
              </ListBlock>
            </AnimSection>
          )}

          {/* ── Publications ── */}
          {publications.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Publications</SectionHeading>
              <CardStack>
                {publications.map((pub, i) => (
                  <PubCard key={i} $darkMode={darkMode} href={pub.doi ? `https://doi.org/${pub.doi}` : undefined}>
                    <PubTitle $darkMode={darkMode}>{pub.title}</PubTitle>
                    <PubMeta $darkMode={darkMode}>
                      {pub.journal}{pub.date && ` \u00B7 ${pub.date}`}
                    </PubMeta>
                  </PubCard>
                ))}
              </CardStack>
            </AnimSection>
          )}

          {/* ── Awards ── */}
          {awardItems.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Awards</SectionHeading>
              <ListBlock>
                {awardItems.map((a, i) => (
                  <ListRow key={i} $darkMode={darkMode}>
                    <ListName $darkMode={darkMode}>{a.name}</ListName>
                    <ListDate $darkMode={darkMode}>{a.date}</ListDate>
                  </ListRow>
                ))}
              </ListBlock>
            </AnimSection>
          )}

          {/* ── Skills ── */}
          {skills?.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Skills</SectionHeading>
              <TagWrap>
                {skills.map((s, i) => (
                  <Tag key={i} $darkMode={darkMode}>{s.name || s}</Tag>
                ))}
              </TagWrap>
            </AnimSection>
          )}

          {/* ── Languages ── */}
          {languages?.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Languages</SectionHeading>
              <TagWrap>
                {languages.map((l, i) => (
                  <Tag key={i} $darkMode={darkMode}>
                    {l.language || l.name || l}{l.fluency ? ` \u2014 ${l.fluency}` : ''}
                  </Tag>
                ))}
              </TagWrap>
            </AnimSection>
          )}

          {/* ── Certifications ── */}
          {certItems.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Certifications</SectionHeading>
              <ListBlock>
                {certItems.map((c, i) => (
                  <ListRow key={i} $darkMode={darkMode}>
                    <ListName $darkMode={darkMode}>{c.name || c.title}</ListName>
                    <ListDate $darkMode={darkMode}>{c.date || c.issuer}</ListDate>
                  </ListRow>
                ))}
              </ListBlock>
            </AnimSection>
          )}

          {/* ── Certifications & Skills ── */}
          {certSkillItems.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Certifications & Skills</SectionHeading>
              <ListBlock>
                {certSkillItems.map((cs, i) => (
                  <ListRow key={i} $darkMode={darkMode}>
                    <ListName $darkMode={darkMode}>{cs.name || cs.title}</ListName>
                    <ListDate $darkMode={darkMode}>{cs.date}</ListDate>
                  </ListRow>
                ))}
              </ListBlock>
            </AnimSection>
          )}

          {/* ── Professional Development ── */}
          {professionalDevelopment?.length > 0 && (
            <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
              <SectionHeading $darkMode={darkMode}>Professional Development</SectionHeading>
              <ListBlock>
                {professionalDevelopment.map((pd, i) => (
                  <ListRow key={i} $darkMode={darkMode}>
                    <ListName $darkMode={darkMode}>{pd.name}</ListName>
                    <ListDate $darkMode={darkMode}>{pd.date}</ListDate>
                  </ListRow>
                ))}
              </ListBlock>
            </AnimSection>
          )}

          {/* ── Connect ── */}
          <AnimSection style={{ animationDelay: `${sectionIndex++ * 0.15}s` }}>
            <SectionHeading $darkMode={darkMode}>Connect</SectionHeading>
            {email && (
              <ConnectText $darkMode={darkMode}>
                Feel free to contact me at{' '}
                <ConnectEmail $darkMode={darkMode} href={`mailto:${email}`}>
                  {email}
                </ConnectEmail>
              </ConnectText>
            )}
            {pills.length > 0 && (
              <PillRow>
                {pills.map((pill) => (
                  <SocialPill
                    key={pill.label}
                    $darkMode={darkMode}
                    href={pill.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pill.label}
                    <ArrowUpRight />
                  </SocialPill>
                ))}
              </PillRow>
            )}
          </AnimSection>

          {/* ── Footer ── */}
          <FooterBar $darkMode={darkMode}>
            <FooterText $darkMode={darkMode}>
              {location && <span>{location}</span>}
            </FooterText>
          </FooterBar>
        </PageWrap>
      </Container>
    </>
  );
}

/* ═══════════════════════════════════════════
   styled-components
   ═══════════════════════════════════════════ */

const zinc = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  overscroll-behavior: none;
  background: ${({ $darkMode }) => ($darkMode ? zinc[950] : '#fff')};
  color: ${({ $darkMode }) => ($darkMode ? zinc[50] : zinc[900])};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.011em;
  transition: background 0.2s, color 0.2s;
`;

const PageWrap = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 6rem;

  @media (min-width: 640px) {
    padding: 5rem 1.5rem;
  }
`;

const AnimSection = styled.div`
  animation: ${fadeInUp} 0.4s ease both;
`;

/* ── header ── */
const HeaderWrap = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const NameText = styled.h1`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
`;

const JobTitle = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? zinc[500] : zinc[600])};
`;

/* ── about ── */
const AboutText = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? zinc[400] : zinc[600])};
  max-width: 540px;
  line-height: 1.7;
`;

/* ── section heading ── */
const SectionHeading = styled.h3`
  margin: 0 0 1.25rem;
  font-size: 1.125rem;
  font-weight: 500;
  color: ${({ $darkMode }) => ($darkMode ? zinc[50] : zinc[900])};
`;

/* ── projects ── */
const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ProjectCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProjectFrame = styled.div`
  aspect-ratio: 16 / 9;
  border-radius: 0.75rem;
  background: ${({ $darkMode }) =>
    $darkMode ? `rgba(255,255,255,0.03)` : `rgba(0,0,0,0.02)`};
  border: 1px solid ${({ $darkMode }) =>
    $darkMode ? `rgba(255,255,255,0.06)` : `rgba(0,0,0,0.06)`};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ProjectInitial = styled.span`
  font-size: 2rem;
  font-weight: 600;
  color: ${({ $darkMode }) =>
    $darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
  user-select: none;
`;

const ProjectMeta = styled.div`
  padding: 0 0.25rem;
`;

const ProjectName = styled.a`
  position: relative;
  display: inline-block;
  font-size: 1rem;
  font-weight: 450;
  color: ${({ $darkMode }) => ($darkMode ? zinc[50] : zinc[900])};
  text-decoration: none;
  cursor: ${({ $hasUrl }) => ($hasUrl ? 'pointer' : 'default')};
`;

const ProjectUnderline = styled.span`
  position: absolute;
  bottom: 1px;
  left: 0;
  height: 1px;
  width: 0;
  background: ${({ $darkMode }) => ($darkMode ? zinc[50] : zinc[900])};
  transition: width 0.2s ease;

  ${ProjectName}:hover & {
    width: 100%;
  }
`;

const ProjectDesc = styled.p`
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? zinc[400] : zinc[600])};
`;

/* ── spotlight work cards ── */
const spotlightBase = `
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  text-decoration: none;
  color: inherit;
  display: block;
`;

const SpotlightAnchor = styled.a`
  ${spotlightBase}
  background: ${({ $darkMode }) =>
    $darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  padding: 1px;
`;

const SpotlightDiv = styled.div`
  ${spotlightBase}
  background: ${({ $darkMode }) =>
    $darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  padding: 1px;
`;

const SpotlightGlow = styled.div`
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease;
  background: ${({ $darkMode }) =>
    $darkMode
      ? 'radial-gradient(circle, rgba(244,244,245,0.35) 0%, transparent 70%)'
      : 'radial-gradient(circle, rgba(63,63,70,0.2) 0%, transparent 70%)'};
  filter: blur(16px);
  z-index: 1;
`;

const SpotlightInner = styled.div`
  position: relative;
  z-index: 2;
  border-radius: 15px;
  background: ${({ $darkMode }) => ($darkMode ? zinc[950] : '#fff')};
  padding: 1rem;
`;

const CardStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CardRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
  color: ${({ $darkMode }) => ($darkMode ? zinc[100] : zinc[900])};
`;

const CardSub = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ $darkMode }) => ($darkMode ? zinc[400] : zinc[500])};
`;

const CardDate = styled.span`
  font-size: 0.875rem;
  color: ${({ $darkMode }) => ($darkMode ? zinc[400] : zinc[600])};
  flex-shrink: 0;
  white-space: nowrap;
`;

/* ── simple list (presentations, awards, etc.) ── */
const ListBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ListRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 0.75rem;
  margin: 0 -0.75rem;
  border-radius: 0.75rem;
  transition: background 0.15s ease;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  &:hover {
    background: ${({ $darkMode }) =>
      $darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
  }
`;

const ListName = styled.span`
  font-size: 1rem;
  font-weight: 400;
  color: ${({ $darkMode }) => ($darkMode ? zinc[100] : zinc[900])};
`;

const ListDate = styled.span`
  font-size: 0.875rem;
  color: ${({ $darkMode }) => ($darkMode ? zinc[400] : zinc[500])};
  flex-shrink: 0;
`;

/* ── publications ── */
const PubCard = styled.a`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: inherit;
  background: ${({ $darkMode }) =>
    $darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
  border: 1px solid ${({ $darkMode }) =>
    $darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
  transition: background 0.15s ease;

  &:hover {
    background: ${({ $darkMode }) =>
      $darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  }
`;

const PubTitle = styled.span`
  font-size: 1rem;
  font-weight: 450;
  line-height: 1.5;
  color: ${({ $darkMode }) => ($darkMode ? zinc[100] : zinc[900])};
`;

const PubMeta = styled.span`
  font-size: 0.875rem;
  color: ${({ $darkMode }) => ($darkMode ? zinc[400] : zinc[500])};
`;

/* ── tags (skills, languages) ── */
const TagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  background: ${({ $darkMode }) => ($darkMode ? zinc[800] : zinc[100])};
  color: ${({ $darkMode }) => ($darkMode ? zinc[300] : zinc[600])};
`;

/* ── connect ── */
const ConnectText = styled.p`
  margin: 0 0 1.25rem;
  font-size: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? zinc[400] : zinc[600])};
`;

const ConnectEmail = styled.a`
  text-decoration: underline;
  text-underline-offset: 2px;
  color: ${({ $darkMode }) => ($darkMode ? zinc[300] : zinc[700])};
  transition: color 0.15s;

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
  }
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const SocialPill = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  text-decoration: none;
  background: ${({ $darkMode }) => ($darkMode ? zinc[800] : zinc[100])};
  color: ${({ $darkMode }) => ($darkMode ? zinc[100] : '#000')};
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? zinc[700] : zinc[950])};
    color: ${({ $darkMode }) => ($darkMode ? '#fff' : zinc[50])};
  }
`;

/* ── footer ── */
const FooterBar = styled.footer`
  margin-top: 0;
  padding-top: 1rem;
  border-top: 1px solid ${({ $darkMode }) =>
    $darkMode ? zinc[800] : zinc[100]};
`;

const FooterText = styled.div`
  font-size: 0.75rem;
  color: ${({ $darkMode }) => ($darkMode ? zinc[500] : zinc[400])};
`;
