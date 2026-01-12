import React, { useMemo, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
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
  return dateStr;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

// Light and dark themes
const lightTheme = {
  background: '#ffffff',
  foreground: '#000000',
  muted: 'rgba(0, 0, 0, 0.5)',
  underline: 'rgba(128, 128, 128, 0.5)',
};

const darkTheme = {
  background: '#1a1a1a',
  foreground: '#e5e5e5',
  muted: 'rgba(255, 255, 255, 0.5)',
  underline: 'rgba(128, 128, 128, 0.5)',
};

export function GerhardTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [isDark, setIsDark] = useState(false);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  // Current position (first active experience)
  const currentPosition = useMemo(() => {
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));
    if (experiences.length === 0) return null;
    const current = experiences[0];
    // Check for nested positions
    if (Array.isArray(current.positions) && current.positions.length > 0) {
      const activePos = current.positions.find(p => !p.end_date || isPresent(p.end_date));
      if (activePos) {
        return `${activePos.title || activePos.position}, ${current.company}`;
      }
    }
    return `${current.position}, ${current.company}`;
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 8);
  }, [cv]);

  // Experience items with nested positions support
  const experienceItems = useMemo(() => {
    const items = [];
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));

    for (const exp of experiences) {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        // Has nested positions
        items.push({
          company: exp.company,
          positions: exp.positions.map(pos => ({
            title: pos.title || pos.position,
            startDate: formatDate(pos.start_date),
            endDate: formatDate(pos.end_date),
          })),
        });
      } else {
        // Single position
        items.push({
          company: exp.company,
          positions: [{
            title: exp.position,
            startDate: formatDate(exp.start_date),
            endDate: formatDate(exp.end_date),
          }],
        });
      }
    }

    return items.slice(0, 8);
  }, [cv]);

  // Volunteer items
  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || []).filter(e => !isArchived(e)).slice(0, 8);
  }, [cv]);

  // Education items
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Header>
          <IconButton onClick={() => setIsDark(!isDark)} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </IconButton>
        </Header>

        <Main>
          <Name>{fullName}</Name>

          <SectionLabel>About</SectionLabel>
          {aboutText && <Paragraph>{aboutText}</Paragraph>}
          {location && <Paragraph>Based in {location}.</Paragraph>}
          {currentPosition && <Paragraph>{currentPosition}</Paragraph>}

          {projectItems.length > 0 && (
            <>
              <SectionLabel>Projects</SectionLabel>
              <List>
                {projectItems.map((project, idx) => (
                  <ListItem key={`proj-${idx}`}>
                    {project.url ? (
                      <Link href={project.url} target="_blank" rel="noopener" className="spacing">
                        {project.name}
                      </Link>
                    ) : (
                      <span className="spacing">{project.name}</span>
                    )}
                    {project.summary && <Small>{project.summary}</Small>}
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {experienceItems.length > 0 && (
            <>
              <SectionLabel>Experience</SectionLabel>
              <ExperienceList>
                {experienceItems.map((exp, idx) => (
                  <ExperienceItem key={`exp-${idx}`}>
                    <ExperienceHeader>
                      <Small>{exp.positions[0]?.startDate}{exp.positions[0]?.endDate && ` - ${exp.positions[0]?.endDate}`}</Small>
                      <span className="company">{exp.company}</span>
                    </ExperienceHeader>
                    {exp.positions.map((pos, posIdx) => (
                      <PositionItem key={`pos-${posIdx}`} $indented>
                        {pos.title}
                        {exp.positions.length > 1 && (
                          <Small className="date"> ({pos.startDate}{pos.endDate && ` - ${pos.endDate}`})</Small>
                        )}
                      </PositionItem>
                    ))}
                  </ExperienceItem>
                ))}
              </ExperienceList>
            </>
          )}

          {volunteerItems.length > 0 && (
            <>
              <SectionLabel>Volunteer</SectionLabel>
              <ExperienceList>
                {volunteerItems.map((vol, idx) => (
                  <ExperienceItem key={`vol-${idx}`}>
                    <ExperienceHeader>
                      <Small>{formatDate(vol.start_date)}{vol.end_date && ` - ${formatDate(vol.end_date)}`}</Small>
                      <span className="company">{vol.organization || vol.company}</span>
                    </ExperienceHeader>
                    <PositionItem $indented>
                      {vol.position || vol.role}
                      {vol.summary && <Small> - {vol.summary}</Small>}
                    </PositionItem>
                  </ExperienceItem>
                ))}
              </ExperienceList>
            </>
          )}

          {educationItems.length > 0 && (
            <>
              <SectionLabel>Education</SectionLabel>
              <List>
                {educationItems.map((edu, idx) => (
                  <ListItem key={`edu-${idx}`}>
                    <Small className="spacing">{formatDate(edu.end_date)}</Small>
                    <span>{edu.degree} in {edu.area}, {edu.institution}</span>
                  </ListItem>
                ))}
              </List>
            </>
          )}

          <SectionLabel>Elsewhere</SectionLabel>
          <List>
            {email && (
              <ListItem>
                <Link href={`mailto:${email}`}>{email}</Link>
              </ListItem>
            )}
            {githubUrl && (
              <ListItem>
                <Link href={githubUrl} target="_blank" rel="noopener">GitHub</Link>
              </ListItem>
            )}
            {linkedinUrl && (
              <ListItem>
                <Link href={linkedinUrl} target="_blank" rel="noopener">LinkedIn</Link>
              </ListItem>
            )}
            {twitterUrl && (
              <ListItem>
                <Link href={twitterUrl} target="_blank" rel="noopener">Twitter</Link>
              </ListItem>
            )}
          </List>
        </Main>

        <Footer>
          <FooterList>
            <li><Small>Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Small></li>
            <li><Small><em>No hurry, no pause...</em></Small></li>
            <li><Small>&copy; {new Date().getFullYear()}</Small></li>
          </FooterList>
        </Footer>
      </Container>
    </ThemeProvider>
  );
}

const Container = styled.div`
  min-height: 100%;
  width: 100%;
  font: 80%/1.6 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: 0;
  padding: 2rem;
  max-width: 60ch;
  box-sizing: border-box;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.foreground};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Header = styled.header`
  margin-bottom: 1rem;
`;

const IconButton = styled.button`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${props => props.theme.foreground};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.muted}20;
  }
`;

const Main = styled.main``;

const Name = styled.h1`
  font: unset;
  margin-bottom: 1rem;
  margin-top: 2rem;
`;

const SectionLabel = styled.h2`
  font: unset;
  margin-top: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
  font-weight: 500;
`;

const Paragraph = styled.p`
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.25rem;

  .spacing {
    margin-right: 1rem;
  }
`;

const ExperienceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ExperienceItem = styled.div``;

const ExperienceHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-bottom: 0.25rem;

  .company {
    font-weight: 500;
  }
`;

const PositionItem = styled.div`
  padding-left: ${props => props.$indented ? '1rem' : '0'};

  .date {
    margin-left: 0.5rem;
  }
`;

const Link = styled.a`
  color: unset;
  text-decoration: underline;
  text-decoration-color: ${props => props.theme.underline};
  transition: text-decoration-color 0.2s ease;

  &:hover,
  &:focus {
    text-decoration-color: currentColor;
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

const Small = styled.small`
  opacity: 0.7;
`;

const Footer = styled.footer`
  margin-top: 2rem;
`;

const FooterList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  row-gap: 0.5rem;
`;
