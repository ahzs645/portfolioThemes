import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, formatDate } from '../../utils/cvHelpers';

/**
 * KielljoyTheme — a CV-driven remake of kielljoy.neocities.org.
 *
 * The source is an intentionally sparse neocities landing page: a lowercase
 * handle in bold serif Times, trailed by a hard-blinking text cursor bar
 * ("kielljoy|"), above a tiny bullet nav where every bullet marker is a
 * different bright color (magenta, green, blue) and the links are the classic
 * underlined browser blue. We keep that airy retro-personal-site voice, then
 * fill the page below with quiet serif CV sections so it isn't empty.
 *
 * Dark mode is a nod to the site's *intended* stylesheet (2024.css), which
 * paints a black ground with magenta (#CF00FF) text and a blue cursor.
 */

// Bullet-marker colors, straight from the source's inline <li style="color:…">
// declarations (including the two it keeps commented out for later).
const DOT_COLORS = ['#ff008f', '#00ff1c', '#5000ff', '#00cfff', '#ffe300', '#ff6a00'];

const lightTheme = {
  bg: '#ffffff',
  heading: '#000000',
  text: '#1c1c1c',
  muted: '#585858',
  faint: '#8a8a8a',
  link: '#0000ee',
  linkHover: '#4b4bff',
  cursor: '#000000',
  rule: '#e6e6e6',
};

const darkTheme = {
  bg: '#0b0b0e',
  heading: '#f4f2f6',
  text: '#d8d3de',
  muted: '#9b93a6',
  faint: '#6f6879',
  link: '#7db4ff',
  linkHover: '#aaccff',
  cursor: '#cf00ff', // magenta cursor — echoes the real 2024.css palette
  rule: '#242029',
};

const SERIF = "'Times New Roman', Times, Georgia, serif";

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.bg}; }
`;

function articleFor(word = '') {
  return /^[aeiou]/i.test(String(word).trim()) ? 'an' : 'a';
}

function displayHost(url = '') {
  return String(url).replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

export function KielljoyTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  // Hard-blinking cursor bar. A JS interval (not a CSS animation) so we can be
  // certain it's torn down on unmount, per the theme contract.
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  const name = cv.name || 'your name';
  const handle = name.toLowerCase();
  const firstName = name.split(/\s+/)[0] || name;

  const experience = useMemo(() => cv.experience || [], [cv.experience]);
  const projects = useMemo(() => cv.projects || [], [cv.projects]);
  const education = useMemo(() => cv.education || [], [cv.education]);
  const awards = useMemo(() => cv.awards || [], [cv.awards]);

  const email = cv.email || null;
  const website = cv.website || null;
  const location = cv.location || null;

  const role = cv.currentJobTitle || experience[0]?.title || null;
  const company =
    experience.find((e) => e.isCurrent)?.company || experience[0]?.company || null;

  // cv.about is empty for this dataset — synthesize a short, honest blurb from
  // the structured role/field/location facts rather than inventing specifics.
  const aboutParagraphs = useMemo(() => {
    const existing = String(cv.about || '').trim();
    if (existing) {
      return existing.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    }

    let intro = `Hi, I'm ${firstName}.`;
    if (role) {
      intro += ` I'm ${articleFor(role)} ${role}`;
      if (company) intro += ` at ${company}`;
      if (location) intro += `, based in ${location}`;
      intro += '.';
    } else if (location) {
      intro += ` Based in ${location}.`;
    }

    return [
      intro,
      "This is a small, quiet corner of the internet — somewhere to keep my work, projects, and a few notes on what I'm working on.",
    ];
  }, [cv.about, firstName, role, company, location]);

  const socialList = useMemo(() => {
    const raw = cv.social || [];
    return raw
      .map((s) => ({ label: String(s.network || '').trim(), url: s.url }))
      .filter((s) => s.label && s.url);
  }, [cv.social]);

  const hasElsewhere = Boolean(email || website || socialList.length);

  // Sections that actually have content — drives both the bullet nav and the
  // rendered blocks below so they never drift out of sync.
  const navSections = useMemo(() => {
    const list = [{ id: 'about', label: 'about' }];
    if (experience.length) list.push({ id: 'experience', label: 'experience' });
    if (projects.length) list.push({ id: 'projects', label: 'projects' });
    if (education.length) list.push({ id: 'education', label: 'education' });
    if (awards.length) list.push({ id: 'awards', label: 'awards' });
    if (hasElsewhere) list.push({ id: 'elsewhere', label: 'elsewhere' });
    return list;
  }, [experience.length, projects.length, education.length, awards.length, hasElsewhere]);

  const sectionRefs = useRef({});
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const setRef = (id) => (el) => {
    sectionRefs.current[id] = el;
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Column>
          <HeaderRow>
            <Title>
              {handle}
              <Cursor $on={cursorOn} aria-hidden="true">|</Cursor>
            </Title>
            <Toggle
              type="button"
              onClick={() => onDarkModeChange?.(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? 'light' : 'dark'}
            </Toggle>
          </HeaderRow>

          <Nav>
            {navSections.map((s, i) => (
              <NavItem key={s.id} style={{ color: DOT_COLORS[i % DOT_COLORS.length] }}>
                <NavLink href={`#${s.id}`} onClick={scrollTo(s.id)}>
                  {s.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>

          <Section id="about" ref={setRef('about')}>
            <SectionLabel>about</SectionLabel>
            {aboutParagraphs.map((para, i) => (
              <Paragraph key={i}>{para}</Paragraph>
            ))}
          </Section>

          {experience.length > 0 && (
            <Section id="experience" ref={setRef('experience')}>
              <SectionLabel>experience</SectionLabel>
              {experience.map((exp, i) => (
                <Entry key={`exp-${i}`}>
                  <EntryTitle>{exp.title}</EntryTitle>
                  {exp.company && <EntryMeta>{exp.company}</EntryMeta>}
                  {(exp.startDate || exp.endDate) && (
                    <EntryDate>
                      {formatRange(exp.startDate, exp.endDate, {
                        month: 'short',
                        presentLabel: 'present',
                        ongoingWhenNoEnd: true,
                      })}
                    </EntryDate>
                  )}
                  {exp.highlights?.length > 0 && (
                    <Highlights>
                      {exp.highlights.map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </Highlights>
                  )}
                </Entry>
              ))}
            </Section>
          )}

          {projects.length > 0 && (
            <Section id="projects" ref={setRef('projects')}>
              <SectionLabel>projects</SectionLabel>
              {projects.map((proj, i) => (
                <Entry key={`proj-${i}`}>
                  <EntryTitle>
                    {proj.url ? (
                      <InlineLink href={proj.url} target="_blank" rel="noopener noreferrer">
                        {proj.name}
                      </InlineLink>
                    ) : (
                      proj.name
                    )}
                  </EntryTitle>
                  {proj.date && (
                    <EntryDate>{formatDate(proj.date, { month: 'short' })}</EntryDate>
                  )}
                  {proj.summary && <Summary>{proj.summary}</Summary>}
                </Entry>
              ))}
            </Section>
          )}

          {education.length > 0 && (
            <Section id="education" ref={setRef('education')}>
              <SectionLabel>education</SectionLabel>
              {education.map((edu, i) => (
                <Entry key={`edu-${i}`}>
                  <EntryTitle>
                    {edu.degree || edu.studyType || edu.area || 'Studies'}
                    {edu.degree && edu.area ? ` in ${edu.area}` : ''}
                  </EntryTitle>
                  {(edu.institution || edu.school) && (
                    <EntryMeta>{edu.institution || edu.school}</EntryMeta>
                  )}
                  {(edu.start_date || edu.end_date) && (
                    <EntryDate>
                      {formatRange(edu.start_date, edu.end_date, {
                        month: 'short',
                        presentLabel: 'present',
                      })}
                    </EntryDate>
                  )}
                </Entry>
              ))}
            </Section>
          )}

          {awards.length > 0 && (
            <Section id="awards" ref={setRef('awards')}>
              <SectionLabel>awards</SectionLabel>
              {awards.map((award, i) => (
                <Entry key={`award-${i}`}>
                  <EntryTitle>{award.name || award.title}</EntryTitle>
                  {(award.awarder || award.issuer) && (
                    <EntryMeta>{award.awarder || award.issuer}</EntryMeta>
                  )}
                  {award.date && (
                    <EntryDate>{formatDate(award.date, { month: 'short' })}</EntryDate>
                  )}
                  {award.summary && <Summary>{award.summary}</Summary>}
                </Entry>
              ))}
            </Section>
          )}

          {hasElsewhere && (
            <Section id="elsewhere" ref={setRef('elsewhere')}>
              <SectionLabel>elsewhere</SectionLabel>
              <Elsewhere>
                {[
                  email && { label: email, href: `mailto:${email}`, external: false },
                  website && { label: displayHost(website), href: website, external: true },
                  ...socialList.map((s) => ({
                    label: s.label.toLowerCase(),
                    href: s.url,
                    external: true,
                  })),
                ]
                  .filter(Boolean)
                  .map((item, i, arr) => (
                    <React.Fragment key={item.href}>
                      <InlineLink
                        href={item.href}
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.label}
                      </InlineLink>
                      {i < arr.length - 1 ? <Sep aria-hidden="true"> · </Sep> : null}
                    </React.Fragment>
                  ))}
              </Elsewhere>
            </Section>
          )}

          <Footer>a quiet page on the internet — {new Date().getFullYear()}</Footer>
        </Column>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  font-family: ${SERIF};
  padding: clamp(2rem, 6vh, 4.5rem) clamp(1.25rem, 5vw, 3.5rem) 5rem;
  transition: background-color 0.25s ease, color 0.25s ease;
`;

const Column = styled.div`
  max-width: 42rem;
  width: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const Title = styled.h1`
  margin: 0;
  font-family: ${SERIF};
  font-weight: 700;
  color: ${(props) => props.theme.heading};
  font-size: clamp(2.1rem, 8vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.01em;
  word-break: break-word;
`;

const Cursor = styled.span`
  font-weight: 100;
  color: ${(props) => props.theme.cursor};
  opacity: ${(props) => (props.$on ? 1 : 0)};
  margin-left: 0.02em;
`;

const Toggle = styled.button`
  flex: 0 0 auto;
  margin-top: 0.6rem;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: ${SERIF};
  font-size: 1rem;
  color: ${(props) => props.theme.link};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 3px;
  }
`;

const Nav = styled.ul`
  list-style: disc;
  padding-left: 1.4em;
  margin: 1.6rem 0 0;
`;

// The bullet marker inherits the <li>'s color (a bright per-item accent),
// exactly as the source does; the link itself stays underlined blue.
const NavItem = styled.li`
  margin: 0.15rem 0;
  font-size: 1.35rem;
  line-height: 1.5;

  &::marker {
    font-size: 1em;
  }
`;

const NavLink = styled.a`
  color: ${(props) => props.theme.link};
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 1.1rem;

  &:hover {
    color: ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 3px;
  }
`;

const Section = styled.section`
  margin-top: 2.75rem;
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 1rem);
`;

const SectionLabel = styled.h2`
  margin: 0 0 1rem;
  font-family: ${SERIF};
  font-weight: 700;
  font-size: 1.5rem;
  color: ${(props) => props.theme.heading};
  border-bottom: 1px solid ${(props) => props.theme.rule};
  padding-bottom: 0.35rem;
`;

const Paragraph = styled.p`
  margin: 0 0 0.9rem;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: ${(props) => props.theme.text};
  max-width: 38rem;
`;

const Entry = styled.div`
  margin-bottom: 1.6rem;
`;

const EntryTitle = styled.div`
  font-size: 1.0625rem;
  font-weight: 700;
  color: ${(props) => props.theme.heading};
`;

const EntryMeta = styled.div`
  font-size: 1rem;
  font-style: italic;
  color: ${(props) => props.theme.muted};
`;

const EntryDate = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.faint};
  margin-top: 0.1rem;
`;

const Highlights = styled.ul`
  list-style: square;
  margin: 0.5rem 0 0;
  padding-left: 1.3em;

  li {
    font-size: 0.98rem;
    line-height: 1.55;
    color: ${(props) => props.theme.text};
    margin: 0.2rem 0;
  }

  &::marker {
    color: ${(props) => props.theme.faint};
  }
`;

const Summary = styled.p`
  margin: 0.35rem 0 0;
  font-size: 1rem;
  line-height: 1.6;
  color: ${(props) => props.theme.text};
  max-width: 38rem;
`;

const InlineLink = styled.a`
  color: ${(props) => props.theme.link};
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-word;

  &:hover {
    color: ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 3px;
  }
`;

const Elsewhere = styled.div`
  font-size: 1.0625rem;
  line-height: 1.9;
`;

const Sep = styled.span`
  color: ${(props) => props.theme.faint};
`;

const Footer = styled.footer`
  margin-top: 3.5rem;
  font-size: 0.85rem;
  font-style: italic;
  color: ${(props) => props.theme.faint};
`;
