import React, { useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, formatDate, isPresent } from '../../utils/cvHelpers';

/**
 * SanjayEngineeringTheme — a faithful CV-driven remake of sanjay.engineering.
 *
 * A calm sky-blue gradient page set entirely in Geist Mono, with a rotated
 * "<name> · <field>" rail running down the left edge, blocky Departure Mono
 * section headers (PROJECTS / WRITING / EXPERIENCE), and quiet two-column rows
 * — a title on the left, a description or date on the right. Rebuilt from
 * CV.yaml rather than Sanjay's own content, down to the "Typeset in Departure
 * Mono" colophon (which we can honor because the shell already ships the font).
 */

const light = {
  gradient: 'linear-gradient(162deg, #9dc0e6 0%, #b9d2ea 32%, #dce8f4 72%, #eef4fa 100%)',
  ink: '#2b3a4d',
  head: '#1c2a3c',
  muted: '#5d6f83',
  rail: 'rgba(28, 42, 60, 0.45)',
  rule: 'rgba(28, 42, 60, 0.18)',
  accent: '#e25a1c',
  link: '#2b3a4d',
};

const dark = {
  gradient: 'linear-gradient(162deg, #0d1a2b 0%, #122439 40%, #16293f 100%)',
  ink: '#c3d2e2',
  head: '#e6eef6',
  muted: '#8aa0b6',
  rail: 'rgba(195, 210, 226, 0.4)',
  rule: 'rgba(195, 210, 226, 0.16)',
  accent: '#ff8a4c',
  link: '#dbe6f1',
};

const GlobalStyle = createGlobalStyle`
  body { background: ${(props) => props.theme.gradient}; background-attachment: fixed; }
`;

function fieldWord(cv) {
  const area = cv.education?.[0]?.area || '';
  if (/environ/i.test(area)) return 'environment';
  if (/biomed|health/i.test(area)) return 'research';
  if (/comput|software|engineer/i.test(area)) return 'engineering';
  return (area.split(/\s+/)[0] || 'research').toLowerCase();
}

export function SanjayEngineeringTheme({ darkMode = false }) {
  const cv = useCV() || {};
  const theme = darkMode ? dark : light;

  const name = cv.name || 'Your Name';
  const firstName = name.split(/\s+/)[0] || name;
  const field = fieldWord(cv);
  const tagline = cv.tagline || cv.headline || 'chasing clean air';

  const projects = (cv.projects || []).slice(0, 8);

  // "Writing" — publications + presentations sorted newest-first, shown as
  // title + year, echoing Sanjay's dated writing list.
  const writing = useMemo(() => {
    const pubs = (cv.publications || []).map((p) => ({
      title: p.title || p.name,
      date: p.date,
      url: p.doi ? `https://doi.org/${p.doi}` : p.url,
    }));
    const pres = (cv.presentations || []).map((p) => ({
      title: p.name,
      date: p.date,
      url: p.url,
    }));
    return [...pubs, ...pres]
      .filter((w) => w.title)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .slice(0, 8);
  }, [cv]);

  const experience = (cv.experience || []).slice(0, 6);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Rail aria-hidden="true">
          <span>
            {firstName} · {field}
          </span>
        </Rail>

        <Column className="antialiased">
          <Nav>
            <a href="#projects">projects</a>
            <a href="#writing">writing</a>
            <a href="#experience">experience</a>
          </Nav>

          <Masthead>
            <div>
              {firstName} • {field}
            </div>
            <div>
              {firstName} • {tagline}
            </div>
          </Masthead>

          <Intro>
            Just another {field === 'engineering' ? 'builder' : 'researcher'} who loves building
            things{cv.location ? `, based in ${cv.location}` : ''}…
          </Intro>

          {projects.length > 0 && (
            <Section id="projects">
              <Heading>Projects</Heading>
              {projects.map((p, i) => (
                <Row key={`p-${i}`}>
                  {p.url ? (
                    <RowTitle as="a" href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.name}
                    </RowTitle>
                  ) : (
                    <RowTitle>{p.name}</RowTitle>
                  )}
                  <RowMeta>{p.summary}</RowMeta>
                </Row>
              ))}
            </Section>
          )}

          {writing.length > 0 && (
            <Section id="writing">
              <Heading>Writing</Heading>
              {writing.map((w, i) => (
                <Row key={`w-${i}`}>
                  {w.url ? (
                    <RowTitle as="a" href={w.url} target="_blank" rel="noopener noreferrer">
                      {w.title}
                    </RowTitle>
                  ) : (
                    <RowTitle>{w.title}</RowTitle>
                  )}
                  <RowMeta $mono>{formatDate(w.date, { month: 'numeric', fallback: w.date })}</RowMeta>
                </Row>
              ))}
            </Section>
          )}

          {experience.length > 0 && (
            <Section id="experience">
              <Heading>Experience</Heading>
              {experience.map((e, i) => (
                <Row key={`e-${i}`} $stack>
                  <RowLeft>
                    <RowTitle>{e.title}</RowTitle>
                    <RowMeta $mono>
                      {formatRange(e.startDate, e.endDate, {
                        month: 'short',
                        ongoingWhenNoEnd: e.isCurrent,
                        presentLabel: 'Present',
                      }) || (isPresent(e.endDate) ? 'Present' : '')}
                    </RowMeta>
                  </RowLeft>
                  <RowCompany>{e.company}</RowCompany>
                </Row>
              ))}
            </Section>
          )}

          <Footer>
            <div>
              © {new Date().getFullYear()} {name} • {tagline}
            </div>
            <div className="colophon">Typeset in Departure Mono by Helena Zhang</div>
          </Footer>
        </Column>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  position: relative;
  background: ${(props) => props.theme.gradient};
  color: ${(props) => props.theme.ink};
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, 'Roboto Mono', Menlo, monospace;
  font-size: 15px;
  line-height: 1.55;
  box-sizing: border-box;
  padding: 2rem 1rem 4rem;
`;

const Rail = styled.div`
  position: absolute;
  left: 0.35rem;
  top: 2rem;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  color: ${(props) => props.theme.rail};
  letter-spacing: 0.12em;
  font-size: 13px;
  user-select: none;

  @media (max-width: 720px) {
    display: none;
  }
`;

const Column = styled.main`
  max-width: 36rem;
  margin: 0 auto 0 3rem;

  @media (max-width: 720px) {
    margin: 0 auto;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.25rem;
  margin-bottom: 2.5rem;

  a {
    color: ${(props) => props.theme.ink};
    text-decoration: none;
    &:hover {
      color: ${(props) => props.theme.accent};
    }
  }
`;

const Masthead = styled.header`
  margin-bottom: 1.25rem;
  line-height: 1.4;
  div {
    color: ${(props) => props.theme.head};
  }
`;

const Intro = styled.p`
  margin: 0 0 3rem;
  color: ${(props) => props.theme.muted};
`;

const Section = styled.section`
  margin-bottom: 3rem;
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 1rem);
`;

const Heading = styled.h2`
  font-family: 'Departure Mono', 'Geist Mono', ui-monospace, monospace;
  font-weight: 400;
  font-size: clamp(1.9rem, 6vw, 2.6rem);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${(props) => props.theme.head};
  margin: 0 0 1.1rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: ${(props) => (props.$stack ? 'flex-start' : 'baseline')};
  gap: 1.5rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid ${(props) => props.theme.rule};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.15rem;
  }
`;

const RowLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const RowTitle = styled.span`
  color: ${(props) => props.theme.head};
  font-weight: 500;
  text-decoration: none;

  &[href]:hover {
    color: ${(props) => props.theme.accent};
  }
`;

const RowMeta = styled.span`
  color: ${(props) => props.theme.muted};
  text-align: right;
  ${(props) => (props.$mono ? 'font-variant-numeric: tabular-nums; white-space: nowrap;' : '')}

  @media (max-width: 480px) {
    text-align: left;
  }
`;

const RowCompany = styled.span`
  color: ${(props) => props.theme.muted};
  text-align: right;
  white-space: nowrap;

  @media (max-width: 480px) {
    text-align: left;
  }
`;

const Footer = styled.footer`
  margin-top: 4rem;
  color: ${(props) => props.theme.muted};
  font-size: 13px;

  .colophon {
    margin-top: 0.35rem;
    opacity: 0.8;
  }
`;
