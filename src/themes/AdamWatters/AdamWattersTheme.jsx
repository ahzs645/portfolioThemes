import React, { useMemo, useRef } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { pickSocialUrl, getInitials, truncateText } from '../../utils/cvHelpers';

/**
 * AdamWattersTheme — a CV-driven remake of adamwatters.co.
 *
 * The source is a quiet, LIGHT maker / creative-technologist portfolio: a
 * reader-style React SPA on a white ground with black text, hairline
 * low-opacity borders, a Tailwind system sans for body and a mono for the
 * small labels and dates. Its top nav carries "Home / Projects / Essays", the
 * home view is a short warm bio, projects read as a grid of aspect-video
 * cards, and writing is a minimal dated blog index. The real site's signature
 * flourish is a soft yellow accent (Tailwind yellow-200) over an optional dark
 * ground — echoed here in the dark variant and in the section eyebrows.
 *
 * We rebuild that design from this app's CV (useCV), never Adam's content.
 */

const SANS =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const lightTheme = {
  bg: '#ffffff',
  text: '#141414',
  muted: 'rgba(0, 0, 0, 0.56)',
  faint: 'rgba(0, 0, 0, 0.4)',
  border: 'rgba(0, 0, 0, 0.1)',
  borderFaint: 'rgba(0, 0, 0, 0.06)',
  surface: 'rgba(0, 0, 0, 0.015)',
  surfaceHover: 'rgba(0, 0, 0, 0.035)',
  navBg: 'rgba(255, 255, 255, 0.82)',
  accent: '#a16207',
  shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
};

const darkTheme = {
  bg: '#0b0b0c',
  text: '#d6d6d6',
  muted: 'rgba(255, 255, 255, 0.52)',
  faint: 'rgba(255, 255, 255, 0.38)',
  border: 'rgba(255, 255, 255, 0.12)',
  borderFaint: 'rgba(255, 255, 255, 0.07)',
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceHover: 'rgba(255, 255, 255, 0.06)',
  navBg: 'rgba(11, 11, 12, 0.82)',
  accent: '#fde68a',
  shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
};

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.bg}; }
`;

// A 2-char mono monogram for a project (projects have no images on the source).
function monogram(name = '') {
  const initials = getInitials(name, 2);
  if (initials && initials.length >= 2) return initials;
  const clean = String(name).replace(/[^A-Za-z0-9]/g, '');
  return (clean.slice(0, 2) || '··').toUpperCase();
}

// Year-ish date string for the mono date columns.
function yearLabel(value) {
  if (!value) return '';
  const match = String(value).match(/\d{4}/);
  return match ? match[0] : String(value);
}

export function AdamWattersTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const email = cv.email || null;
  const website = cv.website || null;
  const location = cv.location || null;

  const socials = cv.social || [];
  const github = pickSocialUrl(socials, ['github']);
  const linkedin = pickSocialUrl(socials, ['linkedin']);

  const topRef = useRef(null);
  const projectsRef = useRef(null);
  const essaysRef = useRef(null);

  const scrollTo = (ref) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const projects = useMemo(() => (cv.projects || []).slice(0, 12), [cv.projects]);

  // A warm, synthesized maker/technologist intro (cv.about is empty).
  const eyebrow = 'Maker · Researcher';
  const bio = useMemo(() => {
    if (cv.about && cv.about.trim()) {
      return cv.about.trim().split(/\n{2,}/).slice(0, 2);
    }
    // Derive the degree/field/institution from CV so the copy stays truthful.
    const highest =
      (cv.education || []).find((e) => /phd|doctor/i.test(e.degree || '')) ||
      (cv.education || [])[0] ||
      null;
    const degree = highest?.degree ? `${highest.degree} researcher` : 'researcher';
    const field = highest?.area || 'environmental studies';
    const focus =
      Array.isArray(highest?.highlights) && highest.highlights[0]
        ? String(highest.highlights[0]).replace(/^focus on\s*/i, '')
        : 'air quality and environmental health';
    const at = highest?.institution ? ` at ${highest.institution}` : '';
    const place = location ? `, based in ${location}` : '';
    const lead = `I'm a ${degree} in ${field}${at}${place}, working on ${focus}.`;
    const maker =
      `Mostly, I like building things — open-source tools for wrangling ` +
      `research data, small web utilities, and hardware-adjacent experiments ` +
      `that live somewhere between the lab bench and the browser.`;
    return [lead, maker];
  }, [cv.about, cv.education, location]);

  // "Essays"-style writing index: publications + presentations, dated + deked.
  const writing = useMemo(() => {
    const pubs = (cv.publications || []).map((p) => ({
      key: `pub-${p.title || p.name}`,
      title: p.title || p.name || 'Untitled',
      dek: p.journal || (Array.isArray(p.authors) ? p.authors.join(', ') : ''),
      date: yearLabel(p.date),
      href: p.doi ? `https://doi.org/${p.doi}` : p.url || null,
      kind: 'Paper',
    }));
    const talks = (cv.presentations || []).map((t) => ({
      key: `talk-${t.name}`,
      title: t.name || 'Untitled',
      dek: [t.summary, t.location].filter(Boolean).join(' · '),
      date: yearLabel(t.date),
      href: t.url || null,
      kind: 'Talk',
    }));
    return [...pubs, ...talks].sort(
      (a, b) => (parseInt(b.date, 10) || 0) - (parseInt(a.date, 10) || 0)
    );
  }, [cv.publications, cv.presentations]);

  const footerLinks = [
    github && { label: 'github', url: github },
    linkedin && { label: 'linkedin', url: linkedin },
    email && { label: 'email', url: `mailto:${email}` },
    website && { label: 'website', url: website },
  ].filter(Boolean);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page ref={topRef}>
        <Nav>
          <NavInner>
            <Brand type="button" onClick={() => scrollTo(topRef)}>
              {name}
            </Brand>
            <NavLinks>
              <NavItem type="button" onClick={() => scrollTo(projectsRef)}>
                Projects
              </NavItem>
              <NavItem type="button" onClick={() => scrollTo(essaysRef)}>
                Essays
              </NavItem>
              <ThemeToggle
                type="button"
                onClick={() => onDarkModeChange?.(!darkMode)}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                  </svg>
                )}
              </ThemeToggle>
            </NavLinks>
          </NavInner>
        </Nav>

        <Wrap>
          <Hero>
            <Eyebrow>{eyebrow}</Eyebrow>
            <HeroName>{name}</HeroName>
            {bio.map((line, i) => (
              <Lede key={i}>{line}</Lede>
            ))}
            <HeroLinks>
              {website && (
                <HeroLink href={website} target="_blank" rel="noopener noreferrer">
                  {website.replace(/^https?:\/\//, '')}
                </HeroLink>
              )}
              {email && <HeroLink href={`mailto:${email}`}>{email}</HeroLink>}
              {github && (
                <HeroLink href={github} target="_blank" rel="noopener noreferrer">
                  github
                </HeroLink>
              )}
            </HeroLinks>
          </Hero>

          {projects.length > 0 && (
            <Section ref={projectsRef}>
              <SectionHead>
                <SectionLabel>Projects</SectionLabel>
                <SectionMeta>{projects.length} things I've built</SectionMeta>
              </SectionHead>
              <Grid>
                {projects.map((project, idx) => {
                  const inner = (
                    <>
                      <Thumb>
                        <Monogram>{monogram(project.name)}</Monogram>
                        {project.date && <ThumbDate>{yearLabel(project.date)}</ThumbDate>}
                      </Thumb>
                      <CardBody>
                        <CardTitle>{project.name}</CardTitle>
                        {project.summary && (
                          <CardDesc>{truncateText(project.summary, 130)}</CardDesc>
                        )}
                      </CardBody>
                    </>
                  );
                  return project.url ? (
                    <Card
                      as="a"
                      key={`proj-${idx}`}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {inner}
                    </Card>
                  ) : (
                    <Card as="div" key={`proj-${idx}`} $static>
                      {inner}
                    </Card>
                  );
                })}
              </Grid>
            </Section>
          )}

          {writing.length > 0 && (
            <Section ref={essaysRef}>
              <SectionHead>
                <SectionLabel>Essays</SectionLabel>
                <SectionMeta>Papers &amp; talks</SectionMeta>
              </SectionHead>
              <WriteList>
                {writing.map((item) => {
                  const row = (
                    <>
                      <WriteDate>{item.date || '—'}</WriteDate>
                      <WriteMain>
                        <WriteTitle>
                          {item.title}
                          <Kind>{item.kind}</Kind>
                        </WriteTitle>
                        {item.dek && <WriteDek>{item.dek}</WriteDek>}
                      </WriteMain>
                    </>
                  );
                  return item.href ? (
                    <WriteRow
                      as="a"
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row}
                    </WriteRow>
                  ) : (
                    <WriteRow as="div" key={item.key} $static>
                      {row}
                    </WriteRow>
                  );
                })}
              </WriteList>
            </Section>
          )}

          <Footer>
            <FooterName>{name}</FooterName>
            {footerLinks.length > 0 && (
              <FooterLinks>
                {footerLinks.map((link) => (
                  <FooterLink
                    key={link.label}
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </FooterLink>
                ))}
              </FooterLinks>
            )}
          </Footer>
        </Wrap>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  font-family: ${SANS};
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.25s ease, color 0.25s ease;
`;

const Nav = styled.nav`
  position: sticky;
  top: var(--app-top-offset, 0px);
  z-index: 20;
  background: ${(props) => props.theme.navBg};
  backdrop-filter: saturate(180%) blur(10px);
  -webkit-backdrop-filter: saturate(180%) blur(10px);
  border-bottom: 1px solid ${(props) => props.theme.borderFaint};
`;

const NavInner = styled.div`
  max-width: 44rem;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const Brand = styled.button`
  font-family: ${MONO};
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
  color: ${(props) => props.theme.text};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  max-width: 55vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: ${(props) => props.theme.accent};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
`;

const NavItem = styled.button`
  font-family: ${MONO};
  font-size: 0.6875rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${(props) => props.theme.muted};
  background: none;
  border: none;
  padding: 0.15rem 0;
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: ${(props) => props.theme.text};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.accent};
    outline-offset: 3px;
  }
`;

const ThemeToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 0.375rem;
  border: 1px solid ${(props) => props.theme.border};
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.muted};
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: ${(props) => props.theme.text};
    background: ${(props) => props.theme.surfaceHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.accent};
    outline-offset: 2px;
  }
`;

const Wrap = styled.main`
  max-width: 44rem;
  margin: 0 auto;
  padding: 0 1.25rem 5rem;
  box-sizing: border-box;
`;

const Hero = styled.header`
  padding: clamp(3rem, 9vh, 5.5rem) 0 2.75rem;
`;

const Eyebrow = styled.div`
  font-family: ${MONO};
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${(props) => props.theme.accent};
  margin-bottom: 0.9rem;
`;

const HeroName = styled.h1`
  font-size: clamp(1.875rem, 6vw, 2.75rem);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 1.4rem;
`;

const Lede = styled.p`
  font-size: 1.0625rem;
  line-height: 1.65;
  color: ${(props) => props.theme.muted};
  max-width: 38rem;
  margin: 0 0 0.9rem;

  &:last-of-type {
    color: ${(props) => props.theme.muted};
  }
`;

const HeroLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
  margin-top: 1.75rem;
`;

const HeroLink = styled.a`
  font-family: ${MONO};
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: ${(props) => props.theme.text};
  text-decoration: none;
  border-bottom: 1px solid ${(props) => props.theme.border};
  padding-bottom: 1px;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: ${(props) => props.theme.accent};
    border-color: ${(props) => props.theme.accent};
  }
`;

const Section = styled.section`
  padding-top: 2.75rem;
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 4rem);
  border-top: 1px solid ${(props) => props.theme.borderFaint};
  margin-top: 2.75rem;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
`;

const SectionLabel = styled.h2`
  font-family: ${MONO};
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 500;
  color: ${(props) => props.theme.accent};
  margin: 0;
`;

const SectionMeta = styled.span`
  font-family: ${MONO};
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  color: ${(props) => props.theme.faint};
  text-align: right;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem 1.25rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }
`;

const Card = styled.a`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  cursor: ${(props) => (props.$static ? 'default' : 'pointer')};

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.accent};
    outline-offset: 4px;
    border-radius: 0.5rem;
  }
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 0.5rem;
  background: ${(props) => props.theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: ${(props) => props.theme.shadow};
  transition: border-color 0.18s ease, background 0.18s ease;

  ${Card}[href]:hover & {
    border-color: ${(props) => props.theme.accent};
    background: ${(props) => props.theme.surfaceHover};
  }
`;

const Monogram = styled.span`
  font-family: ${MONO};
  font-size: 1.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: ${(props) => props.theme.faint};
  transition: color 0.18s ease;

  ${Card}[href]:hover & {
    color: ${(props) => props.theme.text};
  }
`;

const ThumbDate = styled.span`
  position: absolute;
  top: 0.55rem;
  right: 0.6rem;
  font-family: ${MONO};
  font-size: 0.625rem;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.faint};
`;

const CardBody = styled.div`
  padding-top: 0.85rem;
`;

const CardTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.35;
  margin-bottom: 0.35rem;

  ${Card}[href]:hover & {
    text-decoration: underline;
    text-decoration-color: ${(props) => props.theme.accent};
    text-underline-offset: 3px;
  }
`;

const CardDesc = styled.p`
  font-size: 0.8125rem;
  line-height: 1.55;
  color: ${(props) => props.theme.muted};
  margin: 0;
`;

const WriteList = styled.div`
  display: flex;
  flex-direction: column;
`;

const WriteRow = styled.a`
  display: grid;
  grid-template-columns: 3.5rem 1fr;
  gap: 1rem;
  padding: 1.1rem 0;
  text-decoration: none;
  color: inherit;
  border-top: 1px solid ${(props) => props.theme.borderFaint};
  cursor: ${(props) => (props.$static ? 'default' : 'pointer')};
  transition: opacity 0.15s ease;

  &:first-child {
    border-top: none;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.accent};
    outline-offset: 3px;
    border-radius: 0.25rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 3rem 1fr;
    gap: 0.75rem;
  }
`;

const WriteDate = styled.span`
  font-family: ${MONO};
  font-size: 0.75rem;
  color: ${(props) => props.theme.faint};
  padding-top: 0.15rem;
  white-space: nowrap;
`;

const WriteMain = styled.div`
  min-width: 0;
`;

const WriteTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.4;
  color: ${(props) => props.theme.text};

  /* Only real links (rendered as <a href>) get the accent on hover. */
  ${WriteRow}[href]:hover & {
    color: ${(props) => props.theme.accent};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const Kind = styled.span`
  display: inline-block;
  margin-left: 0.55rem;
  font-family: ${MONO};
  font-size: 0.5625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${(props) => props.theme.faint};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 0.25rem;
  padding: 0.05rem 0.35rem;
  vertical-align: middle;
  transform: translateY(-1px);
`;

const WriteDek = styled.p`
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${(props) => props.theme.muted};
  margin: 0.3rem 0 0;
`;

const Footer = styled.footer`
  margin-top: 4rem;
  padding-top: 1.75rem;
  border-top: 1px solid ${(props) => props.theme.borderFaint};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
`;

const FooterName = styled.span`
  font-family: ${MONO};
  font-size: 0.75rem;
  color: ${(props) => props.theme.faint};
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.1rem;
`;

const FooterLink = styled.a`
  font-family: ${MONO};
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: ${(props) => props.theme.muted};
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: ${(props) => props.theme.accent};
  }
`;
