import React, { useMemo, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle, css } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import {
  pickSocialUrl,
  getSkillLabel,
  formatDate,
  formatRange,
  parseDateParts,
} from '../../utils/cvHelpers';

/**
 * AdamWattersTheme — a CV-driven remake of adamwatters.co.
 *
 * The real site is dark, minimal and text-only: a near-black, faintly blue
 * ground with muted grey type and underlined links. A ~200px left column
 * holds a vertical stack of bordered, rounded, navy-tinted buttons — one per
 * view (home / bio / essays / projects / side quests) plus one external
 * social button. Clicking a button swaps the main content via React state
 * (no routing). The home view is a terse, dash-separated intro built from the
 * CV. We rebuild that voice and layout from useCV(), never Adam's content.
 */

const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// Dark is the site's native mode: near-black, slightly blue-tinted, muted grey.
const darkTheme = {
  bg: '#0a0c10',
  text: '#8a8f98',
  bright: '#e6e8ec',
  faint: '#5b626d',
  link: '#9aa0a8',
  linkHover: '#f4f5f7',
  linkLine: '#39424f',
  navBg: '#141b28',
  navBorder: '#26303f',
  navText: '#8a8f98',
  navLine: '#3a4557',
  navHoverBg: '#182234',
  navActiveBg: '#1c2740',
  navActiveBorder: '#33405a',
  navActiveText: '#e6e8ec',
  focus: '#5b83c0',
};

// A tasteful light variant so the shell's dark-mode toggle still reads well.
const lightTheme = {
  bg: '#f6f7f9',
  text: '#5a6472',
  bright: '#1b2430',
  faint: '#8a93a1',
  link: '#4b5563',
  linkHover: '#0a0c10',
  linkLine: '#c4ccd6',
  navBg: '#eceff3',
  navBorder: '#d5dae1',
  navText: '#5a6472',
  navLine: '#b7c0cc',
  navHoverBg: '#e4e8ee',
  navActiveBg: '#dde3ec',
  navActiveBorder: '#c2cad6',
  navActiveText: '#1b2430',
  focus: '#3b6fbf',
};

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.bg}; }
`;

// A sortable numeric key from a CV date ("2025", "2024-08", "present").
function sortKey(value) {
  const parts = parseDateParts(value);
  if (!parts) return 0;
  if (parts.present) return Number.MAX_SAFE_INTEGER;
  return (parts.year || 0) * 10000 + (parts.month || 0) * 100 + (parts.day || 0);
}

// Year-only label, e.g. "2024" or "present".
function yearLabel(value) {
  return formatDate(value, { month: 'none', presentLabel: 'present', fallback: '' });
}

// A quiet "2022 – present" style range for list rows.
function rangeLabel(start, end) {
  return formatRange(start, end, {
    month: 'none',
    presentLabel: 'present',
    ongoingWhenNoEnd: true,
  });
}

export function AdamWattersTheme({ darkMode = false }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const [view, setView] = useState('home');

  const name = cv.name || 'Your Name';
  const website = cv.website || null;
  const location = cv.location || null;

  const socials = cv.social || [];
  const github = pickSocialUrl(socials, ['github']);
  const linkedin = pickSocialUrl(socials, ['linkedin']);

  // The external nav button: prefer X/Twitter (the source's last item), then
  // GitHub, then LinkedIn — labelled by its network, opens in a new tab.
  const external = useMemo(() => {
    const twitter = pickSocialUrl(socials, ['twitter', 'x']);
    if (twitter) {
      const net = socials.find((s) =>
        ['twitter', 'x'].includes(String(s.network || '').toLowerCase()),
      );
      return { url: twitter, label: String(net?.network || 'twitter').toLowerCase() };
    }
    if (github) return { url: github, label: 'github' };
    if (linkedin) return { url: linkedin, label: 'linkedin' };
    return null;
  }, [socials, github, linkedin]);

  // A few skill/domain keywords for the intro line.
  const keywordText = useMemo(() => {
    const fromSkills = (cv.skills || []).map(getSkillLabel).filter(Boolean);
    if (fromSkills.length) return fromSkills.slice(0, 3).join(', ').toLowerCase();
    const skillsRow = (cv.certificationsSkills || []).find((r) =>
      /skill/i.test(r?.label || ''),
    );
    if (skillsRow?.details) {
      const parts = String(skillsRow.details)
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length) return parts.slice(0, 3).join(', ').toLowerCase();
    }
    const area = (cv.education || [])[0]?.area;
    if (area) return String(area).toLowerCase();
    return 'software, research, data';
  }, [cv.skills, cv.certificationsSkills, cv.education]);

  // Earliest plausible "making software since" year across the CV.
  const sinceYear = useMemo(() => {
    const years = [];
    const push = (v) => {
      const p = parseDateParts(v);
      if (p?.year) years.push(p.year);
    };
    (cv.experience || []).forEach((e) => push(e.startDate));
    (cv.education || []).forEach((e) => push(e.start_date));
    (cv.projects || []).forEach((p) => push(p.date));
    return years.length ? Math.min(...years) : null;
  }, [cv.experience, cv.education, cv.projects]);

  // Essays index = publications + presentations, newest first.
  const essays = useMemo(() => {
    const pubs = (cv.publications || []).map((p, i) => ({
      key: `pub-${i}`,
      title: p.title || p.name || 'Untitled',
      href: p.doi ? `https://doi.org/${p.doi}` : p.url || null,
      date: p.date,
      sort: sortKey(p.date),
    }));
    const talks = (cv.presentations || []).map((t, i) => ({
      key: `talk-${i}`,
      title: t.name || t.title || 'Untitled',
      href: t.url || null,
      date: t.date,
      sort: sortKey(t.date),
    }));
    return [...pubs, ...talks].sort((a, b) => b.sort - a.sort);
  }, [cv.publications, cv.presentations]);

  const newestEssay = essays[0] || null;

  // Bio prose — synthesize from role / education / location when about is empty.
  const bioParas = useMemo(() => {
    if (cv.about && cv.about.trim()) {
      return cv.about.trim().split(/\n{2,}/).slice(0, 3);
    }
    const role = cv.currentJobTitle;
    const edu =
      (cv.education || []).find((e) => /phd|doctor/i.test(e.degree || '')) ||
      (cv.education || [])[0] ||
      null;
    const out = [];
    const lead =
      `${name}${location ? `, based in ${location},` : ''} is a ` +
      `${role ? role.toLowerCase() : 'maker and researcher'}.`;
    out.push(lead);
    if (edu) {
      const degree = [edu.degree, edu.area].filter(Boolean).join(' in ');
      out.push(
        `${degree || 'A graduate'}${edu.institution ? ` at ${edu.institution}` : ''}` +
          ` — mostly building small software along the way.`,
      );
    } else {
      out.push('Mostly building small software along the way.');
    }
    return out;
  }, [cv.about, cv.currentJobTitle, cv.education, name, location]);

  const experience = useMemo(() => (cv.experience || []).slice(0, 12), [cv.experience]);
  const projects = useMemo(() => (cv.projects || []).slice(0, 16), [cv.projects]);
  const volunteer = useMemo(() => (cv.volunteer || []).slice(0, 12), [cv.volunteer]);
  const awards = useMemo(() => (cv.awards || []).slice(0, 12), [cv.awards]);

  const views = [
    { id: 'home', label: 'home' },
    { id: 'bio', label: 'bio' },
    { id: 'essays', label: 'essays' },
    { id: 'projects', label: 'projects' },
    { id: 'sidequests', label: 'side quests' },
  ];

  const renderHome = () => (
    <>
      <Lede>
        {website ? (
          <A href={website} target="_blank" rel="noopener noreferrer">
            {name}
          </A>
        ) : (
          <Bright>{name}</Bright>
        )}
        {' here ----- '}
        {keywordText}
        {' ----- '}
        {github ? (
          <A href={github} target="_blank" rel="noopener noreferrer">
            making software
          </A>
        ) : (
          'making software'
        )}
        {sinceYear ? ` since ${sinceYear}, with ` : ', with '}
        <LinkButton type="button" onClick={() => setView('sidequests')}>
          side quests
        </LinkButton>
        {' along the way.'}
      </Lede>

      {newestEssay && (
        <NewestBlock>
          <NewestLabel>newest essay:</NewestLabel>
          <div>
            {newestEssay.href ? (
              <ABright href={newestEssay.href} target="_blank" rel="noopener noreferrer">
                {newestEssay.title}
              </ABright>
            ) : (
              <Bright>{newestEssay.title}</Bright>
            )}
          </div>
        </NewestBlock>
      )}
    </>
  );

  const renderBio = () => (
    <>
      {bioParas.map((para, i) => (
        <Para key={i}>{para}</Para>
      ))}
      {experience.length > 0 && (
        <Block>
          <MiniLabel>experience</MiniLabel>
          {experience.map((exp, i) => (
            <Row key={`exp-${i}`}>
              <RowMain>
                <Bright>{exp.company}</Bright>
                {exp.title ? ` · ${exp.title}` : ''}
              </RowMain>
              {rangeLabel(exp.startDate, exp.endDate) && (
                <RowMeta>{rangeLabel(exp.startDate, exp.endDate)}</RowMeta>
              )}
            </Row>
          ))}
        </Block>
      )}
    </>
  );

  const renderEssays = () =>
    essays.length === 0 ? (
      <Para>Nothing published yet.</Para>
    ) : (
      <Block>
        {essays.map((item) => (
          <EssayRow key={item.key}>
            <EssayTitle>
              {item.href ? (
                <A href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </A>
              ) : (
                item.title
              )}
            </EssayTitle>
            {yearLabel(item.date) && <RowMeta>{yearLabel(item.date)}</RowMeta>}
          </EssayRow>
        ))}
      </Block>
    );

  const renderProjects = () =>
    projects.length === 0 ? (
      <Para>No projects listed.</Para>
    ) : (
      <Block>
        {projects.map((project, i) => (
          <Row key={`proj-${i}`}>
            <RowMain>
              {project.url ? (
                <A href={project.url} target="_blank" rel="noopener noreferrer">
                  {project.name}
                </A>
              ) : (
                <Bright>{project.name}</Bright>
              )}
              {project.summary && <RowSub>{project.summary}</RowSub>}
            </RowMain>
          </Row>
        ))}
      </Block>
    );

  const renderSideQuests = () => (
    <>
      {volunteer.length === 0 && awards.length === 0 && (
        <Para>No side quests logged.</Para>
      )}
      {volunteer.length > 0 && (
        <Block>
          <MiniLabel>volunteering</MiniLabel>
          {volunteer.map((v, i) => (
            <Row key={`vol-${i}`}>
              <RowMain>
                <Bright>{v.company}</Bright>
                {v.title ? ` · ${v.title}` : ''}
              </RowMain>
              {rangeLabel(v.startDate, v.endDate) && (
                <RowMeta>{rangeLabel(v.startDate, v.endDate)}</RowMeta>
              )}
            </Row>
          ))}
        </Block>
      )}
      {awards.length > 0 && (
        <Block>
          <MiniLabel>awards</MiniLabel>
          {awards.map((a, i) => (
            <Row key={`award-${i}`}>
              <RowMain>
                <Bright>{a.name}</Bright>
                {a.summary && <RowSub>{a.summary}</RowSub>}
              </RowMain>
              {yearLabel(a.date) && <RowMeta>{yearLabel(a.date)}</RowMeta>}
            </Row>
          ))}
        </Block>
      )}
    </>
  );

  const content = {
    home: renderHome,
    bio: renderBio,
    essays: renderEssays,
    projects: renderProjects,
    sidequests: renderSideQuests,
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Shell>
          <Sidebar aria-label="Sections">
            <NavList>
              {views.map((v) => (
                <NavButton
                  key={v.id}
                  type="button"
                  $active={view === v.id}
                  aria-current={view === v.id ? 'page' : undefined}
                  onClick={() => setView(v.id)}
                >
                  {v.label}
                </NavButton>
              ))}
              {external && (
                <NavExternal
                  href={external.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {external.label}
                </NavExternal>
              )}
            </NavList>
          </Sidebar>

          <Content>{(content[view] || renderHome)()}</Content>
        </Shell>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  font-family: ${MONO};
  font-size: 15px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.25s ease, color 0.25s ease;
`;

const Shell = styled.div`
  display: flex;
  align-items: flex-start;
  gap: clamp(2rem, 6vw, 5rem);
  max-width: 62rem;
  margin: 0 auto;
  padding: clamp(2.5rem, 9vh, 5.5rem) 1.75rem 5rem;
  box-sizing: border-box;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1.75rem;
    padding: 1.5rem 1.25rem 4rem;
  }
`;

const Sidebar = styled.nav`
  flex: 0 0 auto;
  align-self: flex-start;
  position: sticky;
  top: calc(var(--app-top-offset, 0px) + clamp(2.5rem, 9vh, 5.5rem));

  @media (max-width: 640px) {
    position: static;
    top: auto;
    width: 100%;
  }
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 190px;

  @media (max-width: 640px) {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    gap: 10px;
  }
`;

const navButtonStyles = css`
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid
    ${(props) => (props.$active ? props.theme.navActiveBorder : props.theme.navBorder)};
  background: ${(props) => (props.$active ? props.theme.navActiveBg : props.theme.navBg)};
  color: ${(props) => (props.$active ? props.theme.navActiveText : props.theme.navText)};
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.4;
  text-align: left;
  text-transform: lowercase;
  text-decoration: underline;
  text-decoration-color: ${(props) => props.theme.navLine};
  text-underline-offset: 3px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${(props) => props.theme.navHoverBg};
    color: ${(props) => props.theme.navActiveText};
    text-decoration-color: currentColor;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.focus};
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    width: auto;
    min-height: 40px;
  }
`;

const NavButton = styled.button`
  ${navButtonStyles}
`;

const NavExternal = styled.a`
  ${navButtonStyles}
`;

const Content = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  max-width: 42rem;
`;

const A = styled.a`
  color: ${(props) => props.theme.link};
  text-decoration: underline;
  text-decoration-color: ${(props) => props.theme.linkLine};
  text-underline-offset: 3px;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;

  &:hover,
  &:focus-visible {
    color: ${(props) => props.theme.linkHover};
    text-decoration-color: currentColor;
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.focus};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const ABright = styled(A)`
  color: ${(props) => props.theme.bright};
`;

const LinkButton = styled.button`
  font: inherit;
  color: ${(props) => props.theme.link};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: ${(props) => props.theme.linkLine};
  text-underline-offset: 3px;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;

  &:hover {
    color: ${(props) => props.theme.linkHover};
    text-decoration-color: currentColor;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.focus};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const Bright = styled.span`
  color: ${(props) => props.theme.bright};
`;

const Lede = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 2;
  color: ${(props) => props.theme.text};
  max-width: 40rem;
`;

const NewestBlock = styled.div`
  margin-top: 2.5rem;
  line-height: 2;
`;

const NewestLabel = styled.span`
  display: block;
  color: ${(props) => props.theme.bright};
  font-weight: 600;
`;

const Para = styled.p`
  margin: 0 0 1.1rem;
  color: ${(props) => props.theme.text};
  max-width: 40rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Block = styled.section`
  margin-top: 2.5rem;

  &:first-child {
    margin-top: 0;
  }
`;

const MiniLabel = styled.h2`
  margin: 0 0 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${(props) => props.theme.faint};
`;

const Row = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 0.55rem 0;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.15rem;
  }
`;

const RowMain = styled.div`
  min-width: 0;
  color: ${(props) => props.theme.text};
`;

const RowSub = styled.p`
  margin: 0.3rem 0 0;
  color: ${(props) => props.theme.faint};
  font-size: 0.875rem;
  line-height: 1.6;
`;

const RowMeta = styled.span`
  flex: 0 0 auto;
  color: ${(props) => props.theme.faint};
  font-size: 0.8125rem;
  white-space: nowrap;
`;

const EssayRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 0.6rem 0;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.2rem;
  }
`;

const EssayTitle = styled.div`
  min-width: 0;
  color: ${(props) => props.theme.text};
`;
