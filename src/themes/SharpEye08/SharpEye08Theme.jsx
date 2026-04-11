import React, { useMemo, useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function formatYear(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'present';
  const match = String(dateStr).match(/\d{4}/);
  return match ? match[0] : String(dateStr);
}

function formatRange(start, end) {
  const s = formatYear(start);
  const e = formatYear(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || '';
}

function pickSocial(socials, names) {
  const lowered = names.map((n) => n.toLowerCase());
  return socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()))?.url || null;
}

function extractProjectTag(project) {
  const highlights = Array.isArray(project?.highlights) ? project.highlights : [];
  const techLine = highlights.find((h) => /^technologies?\s*[-–:]/i.test(String(h)));
  if (techLine) {
    const cleaned = String(techLine).replace(/^technologies?\s*[-–:]\s*/i, '');
    const first = cleaned.split(',')[0] || cleaned;
    return first.trim().toLowerCase().slice(0, 18);
  }
  if (project?.date) return formatYear(project.date);
  return '';
}

const darkTheme = {
  bg: '#000',
  fg: '#e8e8e8',
  fgHeading: '#fff',
  fgMeta: '#bbb',
  fgDot: '#555',
  fgDate: '#666',
  fgDesc: '#777',
  fgAbout: '#aaa',
  fgFooter: '#444',
  fgFooterHv: '#888',
  linkColor: '#e8e8e8',
  linkDec: '#555',
  linkHv: '#fff',
  linkDecHv: '#aaa',
  hrColor: '#333',
  toggleBg: '#1a1a1a',
  toggleBorder: '#333',
  toggleFg: '#888',
  toggleHv: '#bbb',
};

const lightTheme = {
  bg: '#fafafa',
  fg: '#1a1a1a',
  fgHeading: '#000',
  fgMeta: '#555',
  fgDot: '#bbb',
  fgDate: '#999',
  fgDesc: '#888',
  fgAbout: '#555',
  fgFooter: '#bbb',
  fgFooterHv: '#666',
  linkColor: '#1a1a1a',
  linkDec: '#bbb',
  linkHv: '#000',
  linkDecHv: '#666',
  hrColor: '#ddd',
  toggleBg: '#f0f0f0',
  toggleBorder: '#ddd',
  toggleFg: '#999',
  toggleHv: '#444',
};

export function SharpEye08Theme({ darkMode }) {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [isDark, setIsDark] = useState(darkMode ?? true);

  useEffect(() => {
    if (typeof darkMode === 'boolean') setIsDark(darkMode);
  }, [darkMode]);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const location = cv?.location || null;
  const headline = cv?.label || cv?.headline || cv?.tagline || null;
  const socials = Array.isArray(cv?.social) ? cv.social : [];

  const githubUrl = pickSocial(socials, ['github']);
  const xUrl = pickSocial(socials, ['twitter', 'x']);
  const linkedinUrl = pickSocial(socials, ['linkedin']);

  const aboutText = getAboutContent()?.markdown || '';

  const tagItems = useMemo(() => {
    const interests = cv?.sections?.interests;
    if (Array.isArray(interests) && interests.length > 0) {
      const first = interests[0];
      if (Array.isArray(first?.items)) return first.items.slice(0, 6);
      return interests.slice(0, 6).map((i) => i?.name || i).filter(Boolean);
    }
    const skills = cv?.sections?.skills;
    if (Array.isArray(skills) && skills.length > 0) {
      return skills
        .map((s) => s?.name || s?.label || s)
        .filter(Boolean)
        .slice(0, 6);
    }
    return [];
  }, [cv]);

  const projectItems = useMemo(
    () => (cv?.sections?.projects || []).filter((e) => !isArchived(e)).slice(0, 8),
    [cv],
  );

  const experienceItems = useMemo(() => {
    const out = [];
    const experiences = (cv?.sections?.experience || []).filter((e) => !isArchived(e));
    for (const exp of experiences) {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        for (const pos of exp.positions) {
          out.push({
            company: exp.company,
            title: pos.title || pos.position,
            startDate: pos.start_date,
            endDate: pos.end_date,
            summary: pos.summary || exp.summary || null,
            url: exp.url,
          });
        }
      } else {
        out.push({
          company: exp.company,
          title: exp.position,
          startDate: exp.start_date,
          endDate: exp.end_date,
          summary: exp.summary || null,
          url: exp.url,
        });
      }
    }
    return out.slice(0, 8);
  }, [cv]);

  const educationItems = useMemo(
    () => (cv?.sections?.education || []).filter((e) => !isArchived(e)).slice(0, 6),
    [cv],
  );

  const publicationItems = useMemo(
    () => (cv?.sections?.publications || []).filter((e) => !isArchived(e)).slice(0, 8),
    [cv],
  );

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalReset />
      <Page>
        <ThemeToggle onClick={() => setIsDark(!isDark)}>
          {isDark ? 'light' : 'dark'}
        </ThemeToggle>
        <Container>
          <Name>{fullName}</Name>

          {(location || headline) && (
            <MetaLine>
              {location && <span>{location}</span>}
              {location && headline && <Dot>·</Dot>}
              {headline && <span>{headline}</span>}
            </MetaLine>
          )}

          {tagItems.length > 0 && (
            <TagsLine>
              {tagItems.map((tag, idx) => (
                <React.Fragment key={`tag-${idx}`}>
                  {idx > 0 && <Dot>·</Dot>}
                  <span>{String(tag).toLowerCase()}</span>
                </React.Fragment>
              ))}
            </TagsLine>
          )}

          <Socials>
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}
            {xUrl && (
              <a href={xUrl} target="_blank" rel="noopener noreferrer" title="X">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                </svg>
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} title="Email">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>
            )}
          </Socials>

          <Divider />

          {aboutText && (
            <Section>
              <SectionTitle>about</SectionTitle>
              <About>{aboutText}</About>
            </Section>
          )}

          {projectItems.length > 0 && (
            <Section>
              <SectionTitle>projects</SectionTitle>
              {projectItems.map((project, idx) => {
                const tag = extractProjectTag(project);
                const label = project.name;
                return (
                  <React.Fragment key={`proj-${idx}`}>
                    <Entry>
                      <EntryTag>{tag}</EntryTag>
                      {project.url ? (
                        <EntryLink href={project.url} target="_blank" rel="noopener noreferrer">
                          {label}
                        </EntryLink>
                      ) : (
                        <EntryText>{label}</EntryText>
                      )}
                    </Entry>
                    {project.summary && <EntryDesc>{project.summary}</EntryDesc>}
                  </React.Fragment>
                );
              })}
            </Section>
          )}

          {experienceItems.length > 0 && (
            <Section>
              <SectionTitle>experience</SectionTitle>
              {experienceItems.map((exp, idx) => (
                <React.Fragment key={`exp-${idx}`}>
                  <Entry>
                    <EntryTag>{formatRange(exp.startDate, exp.endDate)}</EntryTag>
                    {exp.url ? (
                      <EntryLink href={exp.url} target="_blank" rel="noopener noreferrer">
                        {exp.title} — {exp.company}
                      </EntryLink>
                    ) : (
                      <EntryText>
                        {exp.title} — {exp.company}
                      </EntryText>
                    )}
                  </Entry>
                  {exp.summary && <EntryDesc>{exp.summary}</EntryDesc>}
                </React.Fragment>
              ))}
            </Section>
          )}

          {educationItems.length > 0 && (
            <Section>
              <SectionTitle>education</SectionTitle>
              {educationItems.map((edu, idx) => (
                <Entry key={`edu-${idx}`}>
                  <EntryTag>{formatRange(edu.start_date, edu.end_date)}</EntryTag>
                  <EntryText>
                    {[edu.degree, edu.area].filter(Boolean).join(' in ')}
                    {edu.institution ? `, ${edu.institution}` : ''}
                  </EntryText>
                </Entry>
              ))}
            </Section>
          )}

          {publicationItems.length > 0 && (
            <Section>
              <SectionTitle>publications</SectionTitle>
              {publicationItems.map((pub, idx) => {
                const title = pub.name || pub.title;
                const href = pub.doi ? `https://doi.org/${pub.doi}` : pub.url;
                return (
                  <React.Fragment key={`pub-${idx}`}>
                    <Entry>
                      <EntryTag>{formatYear(pub.date || pub.releaseDate)}</EntryTag>
                      {href ? (
                        <EntryLink href={href} target="_blank" rel="noopener noreferrer">
                          {title}
                        </EntryLink>
                      ) : (
                        <EntryText>{title}</EntryText>
                      )}
                    </Entry>
                    {pub.authors && <EntryDesc>{pub.authors}</EntryDesc>}
                  </React.Fragment>
                );
              })}
            </Section>
          )}
        </Container>
      </Page>
    </ThemeProvider>
  );
}

const GlobalReset = createGlobalStyle`
  body { margin: 0; }
`;

const Page = styled.div`
  background: ${(p) => p.theme.bg};
  color: ${(p) => p.theme.fg};
  font-family: "SF Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco,
    "Cascadia Mono", "Liberation Mono", monospace;
  font-size: 13px;
  flex: 1;
  min-height: 100%;
  width: 100%;
  overflow: auto;
  padding: 60px 0 40px 0;
  transition: background 0.2s, color 0.2s;
  box-sizing: border-box;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

const Container = styled.div`
  max-width: 820px;
  margin: 0 auto;
  padding: 0 40px;
`;

const ThemeToggle = styled.button`
  position: fixed;
  top: 24px;
  right: 32px;
  background: ${(p) => p.theme.toggleBg};
  border: 1px solid ${(p) => p.theme.toggleBorder};
  color: ${(p) => p.theme.toggleFg};
  font-family: "SF Mono", "SFMono-Regular", ui-monospace, Menlo, monospace;
  font-size: 12px;
  padding: 6px 12px;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.2s;

  &:hover {
    color: ${(p) => p.theme.toggleHv};
    border-color: ${(p) => p.theme.toggleHv};
  }
`;

const Name = styled.h1`
  font-family: Georgia, "Times New Roman", serif;
  font-size: 2.2rem;
  font-weight: normal;
  font-style: italic;
  color: ${(p) => p.theme.fgHeading};
  margin: 0 0 28px 0;
`;

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${(p) => p.theme.fgMeta};
  margin-bottom: 10px;
  font-size: 13px;
  flex-wrap: wrap;
`;

const TagsLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${(p) => p.theme.fgMeta};
  margin-bottom: 20px;
  font-size: 13px;
  flex-wrap: wrap;
`;

const Dot = styled.span`
  color: ${(p) => p.theme.fgDot};
`;

const Socials = styled.div`
  display: flex;
  gap: 18px;
  margin-bottom: 30px;

  a {
    color: ${(p) => p.theme.fgMeta};
    text-decoration: none;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }

  a:hover {
    color: ${(p) => p.theme.fgHeading};
  }

  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${(p) => p.theme.hrColor};
  width: 80px;
  margin: 10px 0 50px 0;
  transition: border-color 0.2s;
`;

const Section = styled.section`
  margin-bottom: 36px;
`;

const SectionTitle = styled.h2`
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.6rem;
  font-weight: normal;
  font-style: italic;
  color: ${(p) => p.theme.fgHeading};
  margin: 0 0 14px 0;
`;

const About = styled.p`
  color: ${(p) => p.theme.fgMeta};
  font-size: 13px;
  line-height: 2;
  max-width: 580px;
  margin: 0 0 36px 0;
`;

const Entry = styled.div`
  display: flex;
  align-items: baseline;
  gap: 20px;
  margin-bottom: 6px;
`;

const EntryTag = styled.span`
  font-size: 10px;
  color: ${(p) => p.theme.fgDate};
  white-space: nowrap;
  min-width: 90px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const EntryLink = styled.a`
  color: ${(p) => p.theme.linkColor};
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: ${(p) => p.theme.linkDec};
  font-size: 13px;
  cursor: pointer;
  transition: color 0.15s, text-decoration-color 0.15s;

  &:hover {
    color: ${(p) => p.theme.linkHv};
    text-decoration-color: ${(p) => p.theme.linkDecHv};
  }
`;

const EntryText = styled.span`
  color: ${(p) => p.theme.linkColor};
  font-size: 13px;
`;

const EntryDesc = styled.p`
  color: ${(p) => p.theme.fgAbout};
  font-size: 12px;
  margin: 3px 0 12px 110px;
  line-height: 1.7;
`;
