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

const SANS =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

// The source site is black-first with Tailwind gray/yellow accents.
const darkTheme = {
  bg: '#000000',
  text: '#d1d5db',
  bright: '#ffffff',
  faint: '#9ca3af',
  dim: '#6b7280',
  link: '#d1d5db',
  linkHover: '#fef08a',
  linkLine: 'currentColor',
  yellow: '#fef08a',
  navBg: '#1f2937',
  navBorder: '#4b5563',
  navText: '#ffffff',
  navHoverBg: '#263244',
  cardBorder: '#d1d5db',
  softBorder: '#374151',
  focus: '#fef08a',
};

const lightTheme = darkTheme;

const GlobalStyle = createGlobalStyle`
  html, body { background-color: ${(props) => props.theme.bg}; }
`;

const EMPTY_CV = {};
const EMPTY_ARRAY = [];

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
  const cv = useCV() ?? EMPTY_CV;
  const theme = darkMode ? darkTheme : lightTheme;

  const [view, setView] = useState('sidequests');

  const name = cv.name || 'Your Name';
  const website = cv.website || null;
  const location = cv.location || null;

  const socials = cv.social ?? EMPTY_ARRAY;
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
  const profDev = useMemo(
    () => (cv.professionalDevelopment || []).slice(0, 12),
    [cv.professionalDevelopment],
  );
  const certList = useMemo(() => {
    const entries = cv.certificationsSkills || [];
    const cert = entries.find((e) => /cert/i.test(e.label || ''));
    if (!cert?.details) return [];
    return String(cert.details).split(';').map((s) => s.trim()).filter(Boolean).slice(0, 6);
  }, [cv.certificationsSkills]);

  const views = [
    { id: 'home', label: 'home' },
    { id: 'bio', label: 'bio' },
    { id: 'essays', label: 'essays' },
    { id: 'projects', label: 'projects' },
    { id: 'sidequests', label: 'side quests' },
  ];

  const renderIntro = () => (
    <IntroHeader>
      <span>
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
        {sinceYear ? ` since around ${sinceYear}, with ` : ', with '}
        <LinkButton type="button" onClick={() => setView('sidequests')}>
          side quests
        </LinkButton>
        {' along the way'}
      </span>
    </IntroHeader>
  );

  const renderHome = () => (
    <>
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

  const renderQuestBand = (key, heading, summary, items) => {
    if (!items.length) return null;
    const visibleItems = items.slice(0, 5);
    return (
      <QuestCluster key={key}>
        <QuestRow>
          <QuestTextCard>
            <QuestTitle>{heading}</QuestTitle>
            <p>{summary}</p>
          </QuestTextCard>
          {visibleItems.slice(0, 2).map((item, i) => (
            <QuestTile key={`${key}-top-${i}`} as={item.href ? 'a' : 'div'} href={item.href || undefined} target={item.href ? '_blank' : undefined} rel={item.href ? 'noopener noreferrer' : undefined}>
              <QuestMeta>{item.meta}</QuestMeta>
              <QuestTileTitle>{item.title}</QuestTileTitle>
              {item.body && <p>{item.body}</p>}
            </QuestTile>
          ))}
        </QuestRow>
        {visibleItems.length > 2 && (
          <QuestRow>
            {visibleItems.slice(2).map((item, i) => (
              <QuestTile key={`${key}-bottom-${i}`} as={item.href ? 'a' : 'div'} href={item.href || undefined} target={item.href ? '_blank' : undefined} rel={item.href ? 'noopener noreferrer' : undefined}>
                <QuestMeta>{item.meta}</QuestMeta>
                <QuestTileTitle>{item.title}</QuestTileTitle>
                {item.body && <p>{item.body}</p>}
              </QuestTile>
            ))}
          </QuestRow>
        )}
      </QuestCluster>
    );
  };

  const renderSideQuests = () => {
    const communityItems = volunteer.map((v) => ({
      title: v.company || v.title || 'Volunteer work',
      body: [v.title, v.location, (v.highlights || [])[0]].filter(Boolean).join(' · '),
      meta: rangeLabel(v.startDate, v.endDate) || 'community',
    }));
    const awardItems = awards.map((a) => ({
      title: a.name || 'Award',
      body: a.summary || '',
      meta: yearLabel(a.date) || 'recognition',
    }));
    const developmentItems = [
      ...profDev.map((p) => ({
        title: p.name || 'Professional development',
        body: [p.summary, p.location].filter(Boolean).join(' · '),
        meta: yearLabel(p.date) || 'course',
      })),
      ...certList.map((c) => ({
        title: c,
        body: 'certification / skill credential',
        meta: 'certification',
      })),
    ];
    const makerItems = projects.slice(0, 5).map((p) => ({
      title: p.name || 'Project',
      body: p.summary || '',
      meta: p.date || 'project',
      href: p.url || null,
    }));

    const hasAny =
      communityItems.length || awardItems.length || developmentItems.length || makerItems.length;

    return (
      <>
        <PageTitle>SIDE QUESTS</PageTitle>
        {!hasAny && <Para>No side quests logged.</Para>}
        <QuestStack>
          {renderQuestBand(
            'community',
            'Community / service',
            'Volunteer roles, student work, and community-facing projects that sit outside the straight resume line.',
            communityItems,
          )}
          {renderQuestBand(
            'recognition',
            'Awards & recognition',
            'Honours and scholarships collected along the way.',
            awardItems,
          )}
          {renderQuestBand(
            'development',
            'Professional development',
            'Courses, credentials, and skill-building work that support the main practice.',
            developmentItems,
          )}
          {renderQuestBand(
            'makers',
            'Small software',
            'Side builds and utilities with the same compact gallery rhythm as the source.',
            makerItems,
          )}
        </QuestStack>
      </>
    );
  };

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

          <Content>
            {renderIntro()}
            {(content[view] || renderHome)()}
          </Content>
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
  font-family: ${SANS};
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
`;

const Shell = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0;
  max-width: none;
  margin: 0;
  padding: 0 16px 48px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    padding: 0 16px 48px;
  }
`;

const Sidebar = styled.nav`
  flex: 0 0 240px;
  align-self: flex-start;
  padding: 56px 48px 0 0;
  position: static;
  top: auto;

  @media (max-width: 640px) {
    width: 100%;
    flex-basis: auto;
    padding: 28px 0 0;
  }
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 192px;

  @media (max-width: 640px) {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    gap: 8px;
  }
`;

const navButtonStyles = css`
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  min-height: 38px;
  padding: 8px;
  border-radius: 2px;
  border: 2px solid ${(props) => props.theme.navBorder};
  background: ${(props) => props.theme.navBg};
  color: ${(props) => props.theme.navText};
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.25;
  font-weight: 700;
  text-align: left;
  text-transform: lowercase;
  text-decoration: none;
  cursor: pointer;
  opacity: ${(props) => (props.$active ? 1 : 0.6)};
  transition: background 0.15s ease, opacity 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${(props) => props.theme.navHoverBg};
    opacity: 1;
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
  max-width: 36rem;
  padding-top: 56px;

  @media (max-width: 640px) {
    max-width: none;
    width: 100%;
  }
`;

const A = styled.a`
  color: ${(props) => props.theme.link};
  text-decoration: underline;
  text-decoration-color: ${(props) => props.theme.linkLine};
  text-underline-offset: 0.3em;
  text-decoration-thickness: 1px;
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
  color: ${(props) => props.theme.yellow};
  font-weight: 700;
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
  text-underline-offset: 0.3em;
  text-decoration-thickness: 1px;
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

const IntroHeader = styled.header`
  padding-bottom: 16px;
  color: ${(props) => props.theme.text};
  font-size: 0.75rem;
  line-height: 20px;
  font-weight: 700;
  opacity: 0.5;
`;

const NewestBlock = styled.div`
  margin-top: 16px;
  line-height: 1.5;
`;

const NewestLabel = styled.span`
  display: block;
  color: ${(props) => props.theme.yellow};
  font-weight: 700;
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

const PageTitle = styled.h1`
  margin: 16px 0 8px;
  color: ${(props) => props.theme.text};
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 700;
  opacity: 0.5;
`;

const QuestStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuestCluster = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuestRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const questPanel = css`
  flex: 1 1 170px;
  min-width: min(100%, 170px);
  border-radius: 8px;
  padding: 16px;
  color: ${(props) => props.theme.text};
  font-size: 0.875rem;
  line-height: 1.35;
  text-decoration: none;

  p {
    margin: 0 0 16px;
  }

  p:last-child {
    margin-bottom: 0;
  }
`;

const QuestTextCard = styled.div`
  ${questPanel}
  min-height: 190px;
  border: 2px solid ${(props) => props.theme.cardBorder};
  display: flex;
  flex-direction: column;
`;

const QuestTile = styled.div`
  ${questPanel}
  min-height: 190px;
  border: 1px solid ${(props) => props.theme.softBorder};
  background:
    linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(0, 0, 0, 0.35));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;

  &:is(a):hover {
    border-color: ${(props) => props.theme.yellow};
  }
`;

const QuestTitle = styled.span`
  display: block;
  margin-bottom: 8px;
  color: ${(props) => props.theme.yellow};
  font-weight: 700;
`;

const QuestMeta = styled.span`
  display: block;
  margin-bottom: auto;
  color: ${(props) => props.theme.dim};
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: lowercase;
`;

const QuestTileTitle = styled.span`
  display: block;
  margin-bottom: 8px;
  color: ${(props) => props.theme.yellow};
  font-weight: 700;
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
