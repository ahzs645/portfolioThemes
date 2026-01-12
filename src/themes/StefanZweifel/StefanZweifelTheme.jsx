import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Present';
  // Try to extract month/year format like "08/2024"
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  }
  // Fallback: extract year
  const yearMatch = String(dateStr).match(/\d{4}/);
  return yearMatch ? yearMatch[0] : dateStr;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

export function StefanZweifelTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);
  const mastodonUrl = pickSocialUrl(socials, ['mastodon']);

  const aboutText = getAboutContent()?.markdown || '';

  // Current position
  const currentPosition = useMemo(() => {
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));
    if (experiences.length > 0) {
      const first = experiences[0];
      if (Array.isArray(first.positions) && first.positions.length > 0) {
        return first.positions[0]?.title || first.positions[0]?.position || '';
      }
      return first.position || '';
    }
    return '';
  }, [cv]);

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
            startDate: formatDateShort(pos.start_date),
            summary: pos.summary || exp.summary,
            url: exp.url,
          });
        }
      } else {
        items.push({
          company: exp.company,
          title: exp.position,
          startDate: formatDateShort(exp.start_date),
          summary: exp.summary,
          url: exp.url,
        });
      }
    }

    return items.slice(0, 8);
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  // Publication items
  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  return (
    <Container>
      <PrideBar />

      <Content>
        <Header>
          <HeaderName href="#">{fullName}</HeaderName>
          <Nav>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#experience">Experience</NavLink>
            <NavLink href="#projects">Projects</NavLink>
          </Nav>
        </Header>

        <Main>
          <IntroSection>
            <PrideSquare />
            <IntroName>{fullName}</IntroName>
            <IntroTitle>{currentPosition}</IntroTitle>
          </IntroSection>

          {aboutText && (
            <ProseSection id="about">
              <Prose>{aboutText}</Prose>
            </ProseSection>
          )}

          <Section>
            <SectionTitle>On the web</SectionTitle>
            <SocialList>
              {mastodonUrl && (
                <SocialItem>
                  <SocialLink href={mastodonUrl} target="_blank" rel="noopener">Mastodon</SocialLink>
                </SocialItem>
              )}
              {twitterUrl && (
                <SocialItem>
                  <SocialLink href={twitterUrl} target="_blank" rel="noopener">Twitter</SocialLink>
                </SocialItem>
              )}
              {githubUrl && (
                <SocialItem>
                  <SocialLink href={githubUrl} target="_blank" rel="noopener">GitHub</SocialLink>
                </SocialItem>
              )}
              {linkedinUrl && (
                <SocialItem>
                  <SocialLink href={linkedinUrl} target="_blank" rel="noopener">LinkedIn</SocialLink>
                </SocialItem>
              )}
              {email && (
                <SocialItem>
                  <SocialLink href={`mailto:${email}`}>Email</SocialLink>
                </SocialItem>
              )}
            </SocialList>
          </Section>

          {experienceItems.length > 0 && (
            <Section id="experience">
              <SectionTitle>Experience</SectionTitle>
              <ItemList>
                {experienceItems.map((exp, idx) => (
                  <ListItem key={`exp-${idx}`}>
                    <ItemDate>{exp.startDate}</ItemDate>
                    <ItemContent>
                      {exp.url ? (
                        <ItemLink href={exp.url} target="_blank" rel="noopener">
                          {exp.title} at {exp.company}
                        </ItemLink>
                      ) : (
                        <span>{exp.title} at {exp.company}</span>
                      )}
                    </ItemContent>
                  </ListItem>
                ))}
              </ItemList>
            </Section>
          )}

          {projectItems.length > 0 && (
            <Section id="projects">
              <SectionTitle>Projects</SectionTitle>
              <ItemList>
                {projectItems.map((project, idx) => (
                  <ListItem key={`proj-${idx}`}>
                    <ItemDate></ItemDate>
                    <ItemContent>
                      {project.url ? (
                        <ItemLink href={project.url} target="_blank" rel="noopener">
                          {project.name}
                        </ItemLink>
                      ) : (
                        <span>{project.name}</span>
                      )}
                      {project.summary && <ItemSummary> — {project.summary}</ItemSummary>}
                    </ItemContent>
                  </ListItem>
                ))}
              </ItemList>
            </Section>
          )}

          {publicationItems.length > 0 && (
            <Section>
              <SectionTitle>Writing</SectionTitle>
              <ItemList>
                {publicationItems.map((pub, idx) => (
                  <ListItem key={`pub-${idx}`}>
                    <ItemDate>{formatDateShort(pub.date || pub.releaseDate)}</ItemDate>
                    <ItemContent>
                      {pub.url ? (
                        <ItemLink href={pub.url} target="_blank" rel="noopener">
                          {pub.name || pub.title}
                        </ItemLink>
                      ) : (
                        <span>{pub.name || pub.title}</span>
                      )}
                    </ItemContent>
                  </ListItem>
                ))}
              </ItemList>
            </Section>
          )}
        </Main>

        <Footer>
          <FooterText>
            {location && <span>Based in {location}. </span>}
            <span>© {new Date().getFullYear()} {fullName}</span>
          </FooterText>
        </Footer>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #ffffff;
  color: #0f172a;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;

  ::selection {
    background-color: #fef4ad;
    color: #160404;
  }
`;

const PrideBar = styled.div`
  height: 2px;
  width: 100%;
  background: linear-gradient(
    90deg,
    #ef444400,
    #ef4444,
    #f97316,
    #eab308,
    #4ade80,
    #22c55e,
    #84cc16,
    #60a5fa,
    #3b82f6,
    #2563eb,
    #6366f1,
    #c084fc,
    #a855f7,
    #a855f700
  );
  filter: blur(1px);
`;

const Content = styled.div`
  max-width: 42rem;
  margin: 0 auto;
  padding: 0 1rem;

  @media (min-width: 768px) {
    padding: 0;
  }
`;

const Header = styled.header`
  margin-top: 2rem;
  margin-bottom: 6rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const HeaderName = styled.a`
  display: inline-block;
  margin-left: -0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
`;

const NavLink = styled.a`
  color: inherit;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;

const Main = styled.main``;

const IntroSection = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const PrideSquare = styled.div`
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(
    45deg,
    #ef4444,
    #f97316,
    #eab308,
    #4ade80,
    #22c55e,
    #84cc16,
    #60a5fa,
    #3b82f6,
    #2563eb,
    #6366f1,
    #c084fc,
    #a855f7
  );
  background-size: 500% 500%;
  animation: gradient-river 30s linear infinite;

  @keyframes gradient-river {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

const IntroName = styled.h1`
  font-size: 1rem;
  font-weight: 500;
  color: #0f172a;
  margin: 0;
`;

const IntroTitle = styled.h2`
  font-size: 1rem;
  font-weight: 500;
  color: #475569;
  margin: 0;
`;

const ProseSection = styled.section`
  margin-bottom: 4rem;
`;

const Prose = styled.div`
  color: #374151;
  line-height: 1.75;

  a {
    color: #0f172a;
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }

    &:visited {
      color: #0f172a;
    }
  }
`;

const Section = styled.section`
  margin: 4rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #0f172a;
  margin: 0 0 0.5rem;
`;

const SocialList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SocialItem = styled.li``;

const SocialLink = styled.a`
  color: inherit;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ListItem = styled.li`
  display: flex;
  gap: 0.5rem;
`;

const ItemDate = styled.span`
  flex-shrink: 0;
  width: 5rem;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
  font-size: 0.875rem;
`;

const ItemContent = styled.div`
  color: #1e293b;
`;

const ItemLink = styled.a`
  color: inherit;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;

const ItemSummary = styled.span`
  color: #6b7280;
`;

const Footer = styled.footer`
  margin-top: 6rem;
  margin-bottom: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;
