import React, { useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { getInitials, pickSocialUrl } from '../../utils/cvHelpers';

/**
 * AidanNelsonTheme — a CV-driven remake of aidanjnelson.com.
 *
 * Aidan Nelson's site is a quiet editorial reader on warm white: a small plain
 * name at the very top, a big bold serif "Hello and welcome!" greeting, one or
 * two generous serif bio paragraphs, and a "Find me on … or write an
 * old-fashioned email to <mono>name at gmail dot com</mono>" line. A thin rule
 * separates that intro from a bold "Projects" heading and a list of projects —
 * each a small tile + a bold blue linked title + a one-line description, the
 * entries divided by hairline rules. We rebuild that voice from CV.yaml.
 *
 * Source type/colors: body font-family "IBM Plex Sans"; headings "Inknut
 * Antiqua, serif"; page background #fffffa; body text #262626; the tile accent
 * palette (#300032 purple, #4a4a4a gray, #3265c4 blue, #c43235 red) comes
 * straight from the source stylesheet. The reference render shows the reader in
 * a browser-default serif with classic blue underlined links and a monospace
 * email, which is the look this remake commits to.
 */

// Accent tiles cycle through the source stylesheet's own bg-* palette.
const TILE_COLORS = ['#300032', '#3265c4', '#c43235', '#4a4a4a'];

const SERIF =
  "Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Times New Roman', Times, serif";
const MONO =
  "'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

const lightTheme = {
  background: '#fffffa',
  text: '#262626',
  heading: '#151515',
  name: '#111111',
  muted: '#4a4a46',
  link: '#0b57d0',
  linkHover: '#083b86',
  rule: 'rgba(0, 0, 0, 0.14)',
  thumbBorder: 'rgba(0, 0, 0, 0.10)',
  toggleBorder: 'rgba(0, 0, 0, 0.18)',
};

const darkTheme = {
  background: '#181712',
  text: '#e6e3da',
  heading: '#f4f1ea',
  name: '#f4f1ea',
  muted: '#b6b2a7',
  link: '#8ab4f8',
  linkHover: '#adc8fb',
  rule: 'rgba(255, 255, 255, 0.16)',
  thumbBorder: 'rgba(255, 255, 255, 0.14)',
  toggleBorder: 'rgba(255, 255, 255, 0.24)',
};

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.background}; }
`;

// "me@ahmadjalil.com" -> "me at ahmadjalil dot com" — the source's
// old-fashioned, spam-averse spelling-out of the address.
function obfuscateEmail(email = '') {
  return String(email).replace('@', ' at ').replace(/\./g, ' dot ');
}

export function AidanNelsonTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const location = cv.location || null;
  const email = cv.email || null;
  const website = cv.website || null;

  const github = cv.socialLinks?.github || pickSocialUrl(cv.social || [], ['github']);
  const linkedin = cv.socialLinks?.linkedin || pickSocialUrl(cv.social || [], ['linkedin']);

  const current = useMemo(() => {
    const roles = Array.isArray(cv.experience) ? cv.experience : [];
    const active = roles.filter((r) => r && r.isCurrent);
    if (active.length > 0) {
      return [...active].sort((a, b) =>
        String(b.startDate || '').localeCompare(String(a.startDate || '')),
      )[0];
    }
    return roles[0] || null;
  }, [cv.experience]);

  const projects = useMemo(
    () => (Array.isArray(cv.projects) ? cv.projects.filter((p) => p && p.name) : []),
    [cv.projects],
  );

  const roleHref = website || linkedin || github || null;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Reader>
          <TopRow>
            <NameLine>{name}</NameLine>
            <ToggleButton
              type="button"
              onClick={() => onDarkModeChange?.(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀' : '☾'}
            </ToggleButton>
          </TopRow>

          <Greeting>Hello and welcome!</Greeting>

          <Bio>
            I am a{location ? ` ${location}–based` : 'n'} air quality and
            environmental&#8209;health researcher
            {current?.title ? (
              <>
                {' '}and{' '}
                {roleHref ? (
                  <TextLink href={roleHref} target="_blank" rel="noopener noreferrer">
                    {current.title}
                  </TextLink>
                ) : (
                  <strong>{current.title}</strong>
                )}
                {current.company ? ` at ${current.company}` : ''}
              </>
            ) : null}
            .
          </Bio>

          <Bio>
            My work spans open&#8209;source tools and data pipelines for environmental
            monitoring and public health — from air&#8209;quality analysis to mapping and
            transcription — built to make these methods more accessible to fellow
            researchers and the communities they serve.
          </Bio>

          {(github || linkedin || email) && (
            <Bio>
              Find me on
              {github && (
                <>
                  {' '}
                  <TextLink href={github} target="_blank" rel="noopener noreferrer">
                    Github
                  </TextLink>
                </>
              )}
              {github && linkedin ? ',' : ''}
              {linkedin && (
                <>
                  {' '}
                  <TextLink href={linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </TextLink>
                </>
              )}
              {email && (
                <>
                  {' '}or write an old&#8209;fashioned email to{' '}
                  <MonoLink href={`mailto:${email}`}>{obfuscateEmail(email)}</MonoLink>
                </>
              )}
              .
            </Bio>
          )}

          {projects.length > 0 && (
            <>
              <Divider />
              <ProjectsHeading>Projects</ProjectsHeading>

              <ProjectList>
                {projects.map((project, index) => (
                  <React.Fragment key={`${project.name}-${index}`}>
                    {index > 0 && <Rule aria-hidden="true" />}
                    <ProjectRow>
                      <Thumb $bg={TILE_COLORS[index % TILE_COLORS.length]}>
                        {getInitials(project.name, 1, '•')}
                      </Thumb>
                      <ProjectInfo>
                        {project.url ? (
                          <ProjectTitle
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {project.name}
                          </ProjectTitle>
                        ) : (
                          <ProjectTitlePlain>{project.name}</ProjectTitlePlain>
                        )}
                        {project.summary && <ProjectDesc>{project.summary}</ProjectDesc>}
                      </ProjectInfo>
                    </ProjectRow>
                  </React.Fragment>
                ))}
              </ProjectList>
            </>
          )}
        </Reader>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  font-family: ${SERIF};
  box-sizing: border-box;
  display: flex;
  justify-content: center;
`;

const Reader = styled.main`
  width: 100%;
  max-width: 48rem;
  padding: clamp(2rem, 6vw, 4rem) clamp(1.15rem, 5vw, 2.5rem) 5rem;
  box-sizing: border-box;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: clamp(1.75rem, 5vw, 3rem);
`;

const NameLine = styled.div`
  font-family: ${SERIF};
  font-weight: 600;
  font-size: 1rem;
  color: ${(props) => props.theme.name};
`;

const ToggleButton = styled.button`
  flex: none;
  width: 2.1rem;
  height: 2.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  border-radius: 999px;
  border: 1px solid ${(props) => props.theme.toggleBorder};
  background: transparent;
  color: ${(props) => props.theme.muted};
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;

  &:hover {
    color: ${(props) => props.theme.heading};
    border-color: ${(props) => props.theme.link};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const Greeting = styled.h1`
  font-family: ${SERIF};
  font-weight: 700;
  font-size: clamp(2rem, 5.5vw, 2.75rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin: 0 0 1.5rem;
  color: ${(props) => props.theme.heading};
`;

const Bio = styled.p`
  font-family: ${SERIF};
  font-size: clamp(1.05rem, 2.4vw, 1.18rem);
  line-height: 1.68;
  margin: 0 0 1.35rem;
  color: ${(props) => props.theme.text};

  strong {
    font-weight: 700;
    color: inherit;
  }
`;

const TextLink = styled.a`
  color: ${(props) => props.theme.link};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const MonoLink = styled.a`
  font-family: ${MONO};
  font-size: 0.9em;
  color: ${(props) => props.theme.muted};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${(props) => props.theme.heading};
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background: ${(props) => props.theme.rule};
  margin: clamp(2rem, 5vw, 2.75rem) 0;
`;

const ProjectsHeading = styled.h2`
  font-family: ${SERIF};
  font-weight: 700;
  font-size: clamp(1.4rem, 3.6vw, 1.75rem);
  margin: 0 0 1.5rem;
  color: ${(props) => props.theme.heading};
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Rule = styled.hr`
  border: 0;
  height: 1px;
  background: ${(props) => props.theme.rule};
  margin: 1.5rem 0;
`;

const ProjectRow = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(1rem, 3vw, 1.5rem);
`;

const Thumb = styled.div`
  flex: none;
  width: clamp(64px, 16vw, 104px);
  height: clamp(64px, 16vw, 104px);
  border-radius: 3px;
  border: 1px solid ${(props) => props.theme.thumbBorder};
  background: ${(props) => props.$bg || '#4a4a4a'};
  color: #fffffa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${SERIF};
  font-weight: 700;
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  line-height: 1;
  user-select: none;
`;

const ProjectInfo = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`;

const projectTitleStyles = `
  display: inline-block;
  font-weight: 700;
  font-size: clamp(1.02rem, 2.4vw, 1.15rem);
  line-height: 1.3;
  margin-bottom: 0.35rem;
`;

const ProjectTitle = styled.a`
  ${projectTitleStyles}
  color: ${(props) => props.theme.link};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const ProjectTitlePlain = styled.span`
  ${projectTitleStyles}
  color: ${(props) => props.theme.heading};
`;

const ProjectDesc = styled.p`
  margin: 0;
  font-size: clamp(0.95rem, 2.2vw, 1.05rem);
  line-height: 1.5;
  color: ${(props) => props.theme.muted};
`;
