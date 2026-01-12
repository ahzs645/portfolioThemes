import React, { useMemo, useEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Present';
  // Extract only the year
  const yearMatch = String(dateStr).match(/\d{4}/);
  return yearMatch ? yearMatch[0] : dateStr;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

// Scroll animation hook
function useScrollAnimation() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

// Animated component
function AnimatedSection({ children, delay = 0 }) {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <AnimatedDiv ref={ref} $visible={isVisible} $delay={delay}>
      {children}
    </AnimatedDiv>
  );
}

// Animated row component for timeline items
function AnimatedRow({ children, index = 0, isDark }) {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <AnimatedTimelineRow ref={ref} $visible={isVisible} $delay={index * 100} $dark={isDark}>
      {children}
    </AnimatedTimelineRow>
  );
}

export function FelixDornerTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [isDark, setIsDark] = useState(true);

  const fullName = cv?.name || 'Your Name';
  const firstName = fullName.split(' ')[0];
  const email = cv?.email || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  // Generate tagline from current position and location
  const tagline = useMemo(() => {
    const parts = [];
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));
    if (experiences.length > 0) {
      const first = experiences[0];
      if (Array.isArray(first.positions) && first.positions.length > 0) {
        parts.push(first.positions[0]?.title || first.positions[0]?.position || '');
      } else if (first.position) {
        parts.push(first.position);
      }
    }
    if (location) parts.push(location);
    return parts.join(', ');
  }, [cv, location]);

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
            startDate: formatDate(pos.start_date),
            endDate: formatDate(pos.end_date),
            summary: pos.summary || exp.summary,
            url: exp.url,
          });
        }
      } else {
        items.push({
          company: exp.company,
          title: exp.position,
          startDate: formatDate(exp.start_date),
          endDate: formatDate(exp.end_date),
          summary: exp.summary,
          url: exp.url,
        });
      }
    }

    return items.slice(0, 10);
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  // Volunteer items
  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  // Publication items
  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  // Education items
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  return (
    <Container $dark={isDark}>
      <Main>
        <AnimatedSection delay={0}>
          <Header>
            <Greeting $dark={isDark}>Hi, I'm {firstName}.</Greeting>
            {tagline && <Tagline $dark={isDark}>{tagline}</Tagline>}
          </Header>
        </AnimatedSection>

        {aboutText && (
          <AnimatedSection delay={100}>
            <Section>
              <SectionLabel $dark={isDark}>Background</SectionLabel>
              <Paragraph $dark={isDark}>{aboutText}</Paragraph>
            </Section>
          </AnimatedSection>
        )}

        {experienceItems.length > 0 && (
          <AnimatedSection delay={200}>
            <Section>
              <SectionLabel $dark={isDark}>Select timeline</SectionLabel>
              <TimelineList>
                {experienceItems.map((exp, idx) => (
                  <AnimatedRow key={`exp-${idx}`} index={idx} isDark={isDark}>
                    <TimelineDate $dark={isDark}>
                      {exp.startDate}{exp.endDate && exp.endDate !== exp.startDate ? ` - ${exp.endDate}` : ''}
                    </TimelineDate>
                    <TimelineContent>
                      <TimelineText $dark={isDark}>
                        {exp.summary || `${exp.title} at ${exp.company}`}
                      </TimelineText>
                      {exp.url && (
                        <TimelineLink href={exp.url} target="_blank" rel="noopener">
                          View project <Arrow>↗</Arrow>
                        </TimelineLink>
                      )}
                    </TimelineContent>
                  </AnimatedRow>
                ))}
              </TimelineList>
            </Section>
          </AnimatedSection>
        )}

        {projectItems.length > 0 && (
          <AnimatedSection delay={300}>
            <Section>
              <SectionLabel $dark={isDark}>Projects</SectionLabel>
              <TimelineList>
                {projectItems.map((project, idx) => (
                  <AnimatedRow key={`proj-${idx}`} index={idx} isDark={isDark}>
                    <TimelineDate $dark={isDark}></TimelineDate>
                    <TimelineContent>
                      <TimelineText $dark={isDark}>{project.name}</TimelineText>
                      {project.summary && (
                        <TimelineSubtext $dark={isDark}>{project.summary}</TimelineSubtext>
                      )}
                      {project.url && (
                        <TimelineLink href={project.url} target="_blank" rel="noopener">
                          View project <Arrow>↗</Arrow>
                        </TimelineLink>
                      )}
                    </TimelineContent>
                  </AnimatedRow>
                ))}
              </TimelineList>
            </Section>
          </AnimatedSection>
        )}

        {volunteerItems.length > 0 && (
          <AnimatedSection delay={400}>
            <Section>
              <SectionLabel $dark={isDark}>Volunteer</SectionLabel>
              <TimelineList>
                {volunteerItems.map((vol, idx) => (
                  <AnimatedRow key={`vol-${idx}`} index={idx} isDark={isDark}>
                    <TimelineDate $dark={isDark}>
                      {formatDate(vol.start_date)}{vol.end_date && formatDate(vol.end_date) !== formatDate(vol.start_date) ? ` - ${formatDate(vol.end_date)}` : ''}
                    </TimelineDate>
                    <TimelineContent>
                      <TimelineText $dark={isDark}>
                        {vol.position || vol.role} at {vol.organization || vol.company}
                      </TimelineText>
                      {vol.summary && (
                        <TimelineSubtext $dark={isDark}>{vol.summary}</TimelineSubtext>
                      )}
                      {vol.url && (
                        <TimelineLink href={vol.url} target="_blank" rel="noopener">
                          Learn more <Arrow>↗</Arrow>
                        </TimelineLink>
                      )}
                    </TimelineContent>
                  </AnimatedRow>
                ))}
              </TimelineList>
            </Section>
          </AnimatedSection>
        )}

        {publicationItems.length > 0 && (
          <AnimatedSection delay={500}>
            <Section>
              <SectionLabel $dark={isDark}>Publications</SectionLabel>
              <TimelineList>
                {publicationItems.map((pub, idx) => (
                  <AnimatedRow key={`pub-${idx}`} index={idx} isDark={isDark}>
                    <TimelineDate $dark={isDark}>
                      {formatDate(pub.date || pub.releaseDate)}
                    </TimelineDate>
                    <TimelineContent>
                      <TimelineText $dark={isDark}>{pub.name || pub.title}</TimelineText>
                      {pub.publisher && (
                        <TimelineSubtext $dark={isDark}>{pub.publisher}</TimelineSubtext>
                      )}
                      {pub.summary && (
                        <TimelineSubtext $dark={isDark}>{pub.summary}</TimelineSubtext>
                      )}
                      {pub.url && (
                        <TimelineLink href={pub.url} target="_blank" rel="noopener">
                          Read publication <Arrow>↗</Arrow>
                        </TimelineLink>
                      )}
                    </TimelineContent>
                  </AnimatedRow>
                ))}
              </TimelineList>
            </Section>
          </AnimatedSection>
        )}

        {educationItems.length > 0 && (
          <AnimatedSection delay={600}>
            <Section>
              <SectionLabel $dark={isDark}>Education</SectionLabel>
              <TimelineList>
                {educationItems.map((edu, idx) => (
                  <AnimatedRow key={`edu-${idx}`} index={idx} isDark={isDark}>
                    <TimelineDate $dark={isDark}>
                      {formatDate(edu.end_date) || formatDate(edu.start_date)}
                    </TimelineDate>
                    <TimelineContent>
                      <TimelineText $dark={isDark}>
                        {edu.degree}{edu.area ? ` in ${edu.area}` : ''}
                      </TimelineText>
                      <TimelineSubtext $dark={isDark}>{edu.institution}</TimelineSubtext>
                      {edu.url && (
                        <TimelineLink href={edu.url} target="_blank" rel="noopener">
                          View institution <Arrow>↗</Arrow>
                        </TimelineLink>
                      )}
                    </TimelineContent>
                  </AnimatedRow>
                ))}
              </TimelineList>
            </Section>
          </AnimatedSection>
        )}

        <AnimatedSection delay={700}>
          <Section>
            <SectionLabel $dark={isDark}>Connect</SectionLabel>
            <ConnectList>
              {email && (
                <ConnectItem>
                  <ConnectLink href={`mailto:${email}`} $dark={isDark}>
                    Email <Arrow>↗</Arrow>
                  </ConnectLink>
                </ConnectItem>
              )}
              {linkedinUrl && (
                <ConnectItem>
                  <ConnectLink href={linkedinUrl} target="_blank" rel="noopener" $dark={isDark}>
                    LinkedIn <Arrow>↗</Arrow>
                  </ConnectLink>
                </ConnectItem>
              )}
              {githubUrl && (
                <ConnectItem>
                  <ConnectLink href={githubUrl} target="_blank" rel="noopener" $dark={isDark}>
                    GitHub <Arrow>↗</Arrow>
                  </ConnectLink>
                </ConnectItem>
              )}
              {twitterUrl && (
                <ConnectItem>
                  <ConnectLink href={twitterUrl} target="_blank" rel="noopener" $dark={isDark}>
                    Twitter <Arrow>↗</Arrow>
                  </ConnectLink>
                </ConnectItem>
              )}
            </ConnectList>
          </Section>
        </AnimatedSection>
      </Main>

      <FloatingNav $dark={isDark}>
        <NavPill $dark={isDark}>
          <NavLink $dark={isDark} onClick={() => setIsDark(!isDark)}>
            {isDark ? 'Light' : 'Dark'}
          </NavLink>
          <NavDivider $dark={isDark}>/</NavDivider>
          <NavLink $dark={isDark} $active>About</NavLink>
        </NavPill>
      </FloatingNav>
    </Container>
  );
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedDiv = styled.div`
  opacity: 0;
  transform: translateY(20px);
  ${props => props.$visible && css`
    animation: ${fadeIn} 0.5s ease-out forwards;
    animation-delay: ${props.$delay}ms;
  `}
`;

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${props => props.$dark ? '#121212' : '#ffffff'};
  color: ${props => props.$dark ? '#e5e5e5' : '#171717'};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Main = styled.main`
  max-width: 500px;
  margin: 0 auto;
  padding: 96px 32px 160px;

  @media (max-width: 600px) {
    padding: 64px 24px 140px;
  }
`;

const Header = styled.header`
  margin-bottom: 64px;
`;

const Greeting = styled.h1`
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0 0 6px;
  color: ${props => props.$dark ? '#ffffff' : '#000000'};
`;

const Tagline = styled.p`
  font-size: 14px;
  color: ${props => props.$dark ? '#a3a3a3' : '#525252'};
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: 64px;
`;

const SectionLabel = styled.h2`
  font-size: 13px;
  font-weight: 400;
  color: ${props => props.$dark ? '#525252' : '#a3a3a3'};
  margin: 0 0 24px;
`;

const Paragraph = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.$dark ? '#e5e5e5' : '#171717'};
  margin: 0;
`;

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TimelineRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 24px;
  padding: 20px 0;
  border-top: 1px dotted ${props => props.$dark ? '#3a3a3a' : '#d4d4d4'};

  &:last-child {
    border-bottom: 1px dotted ${props => props.$dark ? '#3a3a3a' : '#d4d4d4'};
  }

  @media (max-width: 500px) {
    grid-template-columns: 80px 1fr;
    gap: 16px;
  }
`;

const AnimatedTimelineRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 24px;
  padding: 20px 0;
  border-top: 1px dotted ${props => props.$dark ? '#3a3a3a' : '#d4d4d4'};
  opacity: 0;
  transform: translateY(20px);

  ${props => props.$visible && css`
    animation: ${fadeIn} 0.5s ease-out forwards;
    animation-delay: ${props.$delay}ms;
  `}

  &:last-child {
    border-bottom: 1px dotted ${props => props.$dark ? '#3a3a3a' : '#d4d4d4'};
  }

  @media (max-width: 500px) {
    grid-template-columns: 80px 1fr;
    gap: 16px;
  }
`;

const TimelineDate = styled.span`
  font-size: 13px;
  color: ${props => props.$dark ? '#525252' : '#a3a3a3'};
  white-space: nowrap;
`;

const TimelineContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TimelineText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.$dark ? '#e5e5e5' : '#171717'};
  margin: 0;
`;

const TimelineSubtext = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${props => props.$dark ? '#a3a3a3' : '#525252'};
  margin: 0;
`;

const TimelineLink = styled.a`
  font-size: 13px;
  color: #0096ff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const Arrow = styled.span`
  font-size: 12px;
`;

const ConnectList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

const ConnectItem = styled.div``;

const ConnectLink = styled.a`
  font-size: 14px;
  color: ${props => props.$dark ? '#e5e5e5' : '#171717'};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #0096ff;
  }
`;

const FloatingNav = styled.nav`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
`;

const NavPill = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background-color: ${props => props.$dark ? '#1a1a1a' : '#ffffff'};
  border: 1px solid ${props => props.$dark ? '#2a2a2a' : '#e5e5e5'};
  border-radius: 100px;
  box-shadow: 0 4px 12px ${props => props.$dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'};
`;

const NavLink = styled.button`
  font-size: 13px;
  font-weight: 400;
  color: ${props => props.$active
    ? (props.$dark ? '#ffffff' : '#000000')
    : (props.$dark ? '#a3a3a3' : '#525252')};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    color: ${props => props.$dark ? '#ffffff' : '#000000'};
  }
`;

const NavDivider = styled.span`
  color: ${props => props.$dark ? '#404040' : '#d4d4d4'};
  font-size: 13px;
`;
