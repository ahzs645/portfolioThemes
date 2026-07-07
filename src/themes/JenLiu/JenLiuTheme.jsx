import React, { useMemo, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { withBase } from '../../utils/assetPath';
import {
  formatDate,
  formatRange,
  parseDateParts,
  pickSocialUrl,
  getInitials,
  MONTHS_LONG,
} from '../../utils/cvHelpers';

/**
 * JenLiuTheme — a faithful, CV-driven remake of jenliujenliu.com.
 *
 * The source is an Indexhibit site: BLUE (rgba(0,4,255,1)) Gill Sans text on
 * a mint ground, a fixed 200px left index with a 16px "✿ name ✿" h1 and an
 * about/research nav (active item red + 500), and an exhibit column offset
 * 285px. The about page holds a small hand-drawn portrait, bio paragraphs, a
 * "CV is available here" link, a spaced-out email, and the signature dotted
 * MAGENTA "~* Some recent news:*~" box (250px tall, gold scrollbar). The
 * research page is a 24px "Research" title and 3px-dashed-red hr-separated
 * groups: an italic 20px theme title, prose, then 14px linked citations.
 * We rebuild both pages from CV.yaml; the portrait slot renders the owner's
 * initials as an SL Wronghand handwritten signature when no avatar exists.
 */

// Real jenliujenliu.com palette: the site overrides Indexhibit's default ink
// with blue rgba(0,4,255,1) on mint, dotted-magenta news box, dashed red hrs.
const lightTheme = {
  bg: '#dbffea',
  text: '#0004ff',
  visited: 'rgba(0, 4, 255, 0.5)',
  active: '#ff0000',
  hr: '#ff0000',
  news: '#ff00ff',
  scrollbar: 'gold',
  highlight: '#f3ffc1',
};

const darkTheme = {
  bg: '#0e0e14',
  text: '#8ab4ff',
  visited: 'rgba(138, 180, 255, 0.5)',
  active: '#ff6b6b',
  hr: '#ff6b6b',
  news: '#ff5cff',
  scrollbar: 'gold',
  highlight: '#2a2a10',
};

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'SL Wronghand';
    src: url('${withBase('fonts/SLWronghand-Regular.ttf')}') format('truetype');
    font-weight: 400;
    font-display: swap;
  }

  body { background-color: ${(props) => props.theme.bg}; }
`;

// "me@ahmadjalil.com" -> "me @ ahmadjalil.com" (the source's spam-shy flourish).
function spaceOutAt(email = '') {
  return String(email).replace('@', ' @ ');
}

function withArticle(word = '') {
  return /^[aeiou]/i.test(String(word).trim()) ? `an ${word}` : `a ${word}`;
}

// Sortable integer for a CV date string; "present" floats to the top.
function dateSortKey(value) {
  const parts = parseDateParts(value);
  if (!parts) return -1;
  if (parts.present) return Number.MAX_SAFE_INTEGER;
  return parts.year * 100 + (parts.month || 0);
}

function monthYear(value) {
  return formatDate(value, { month: 'long', year: 'full', fallback: '' });
}

// "A, B, and C" author joining for the research-page citations.
function joinAuthors(authors = []) {
  if (!Array.isArray(authors)) return String(authors || '');
  if (authors.length <= 1) return authors.join('');
  if (authors.length === 2) return authors.join(' and ');
  return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
}

// Surface a "Focus on ..." education highlight as the research theme title.
function findFocus(education = []) {
  for (const entry of education) {
    for (const h of entry?.highlights || []) {
      const m = String(h).match(/^focus(?:ed|es|ing)?\s+on\s+(.+)$/i);
      if (m) return m[1].replace(/\.\s*$/, '').trim();
    }
  }
  return null;
}

function titleCase(text = '') {
  return String(text).replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export function JenLiuTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;
  const [page, setPage] = useState('about');
  const [menuOpen, setMenuOpen] = useState(false);

  const name = cv.name || 'Your Name';
  const website = cv.website || null;
  const email = cv.email || null;
  const location = cv.location || null;

  const socials = cv.social || [];
  const linkedin = pickSocialUrl(socials, ['linkedin']);
  const github = pickSocialUrl(socials, ['github']);

  const avatarSrc = cv.avatar
    ? (/^https?:\/\//i.test(cv.avatar) ? cv.avatar : withBase(cv.avatar))
    : null;

  const experience = cv.experience || [];
  const projects = cv.projects || [];
  const education = cv.education || [];
  const publications = cv.publications || [];
  const presentations = cv.presentations || [];

  const focus = findFocus(education);

  const goTo = (target) => (e) => {
    e.preventDefault();
    setPage(target);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // --- Synthesized bio (cv.about is empty) -----------------------------------
  const bio = useMemo(() => {
    const role = cv.currentJobTitle || 'researcher';
    const org = experience[0]?.company || null;
    const topEdu = education[0] || null;

    const paras = [];

    const roleLine =
      `I am ${withArticle(role)}` +
      (org ? ` at ${org}` : '') +
      (topEdu?.institution && topEdu.institution !== org
        ? ` and ${withArticle(
            /ph\.?\s?d|doctor/i.test(String(topEdu.degree)) ? 'doctoral researcher' : 'graduate researcher',
          )} at ${topEdu.institution}`
        : '') +
      (location ? `, based in ${location}` : '') +
      '.';
    paras.push(roleLine);

    if (focus) {
      paras.push(
        `My research focuses on ${focus}. I work with environmental ` +
        'monitoring data to make often-invisible exposures legible for the ' +
        'communities that live with them.',
      );
    }

    if (github || linkedin) {
      paras.push(
        <>
          You can also find me on{' '}
          {github && (
            <A href={github} target="_blank" rel="noopener noreferrer">GitHub</A>
          )}
          {github && linkedin && ' and '}
          {linkedin && (
            <A href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</A>
          )}
          .
        </>,
      );
    }

    return paras;
  }, [cv.currentJobTitle, experience, education, location, focus, github, linkedin]);

  // --- "~* Some recent news:*~" ------------------------------------------------
  const newsItems = useMemo(() => {
    const items = [];

    (cv.awards || []).forEach((a, i) => {
      if (!a?.name) return;
      items.push({
        key: `award-${i}`,
        sort: dateSortKey(a.date),
        label: monthYear(a.date),
        content: (
          <>
            {a.name}
            {a.summary ? ` — ${a.summary}` : ''}
          </>
        ),
      });
    });

    presentations.forEach((p, i) => {
      if (!p?.name) return;
      items.push({
        key: `pres-${i}`,
        sort: dateSortKey(p.date),
        label: monthYear(p.date),
        content: (
          <>
            Presented "{p.name}"
            {p.summary ? ` at ${p.summary}` : ''}
            {p.location ? ` (${p.location})` : ''}.
          </>
        ),
      });
    });

    publications.forEach((p, i) => {
      const title = p?.title || p?.name;
      if (!title) return;
      const href = p.doi ? `https://doi.org/${p.doi}` : p.url || null;
      items.push({
        key: `pub-${i}`,
        sort: dateSortKey(p.date),
        label: monthYear(p.date),
        content: (
          <>
            {href ? (
              <A href={href} target="_blank" rel="noopener noreferrer">"{title}"</A>
            ) : (
              `"${title}"`
            )}
            {p.journal ? <> is out in {p.journal}!</> : null}
          </>
        ),
      });
    });

    return items
      .filter((it) => it.label)
      .sort((a, b) => b.sort - a.sort)
      .slice(0, 14);
  }, [cv.awards, presentations, publications]);

  const lastUpdated =
    newsItems[0]?.label ||
    `${MONTHS_LONG[new Date().getMonth()]} ${new Date().getFullYear()}`;

  const citation = (pub) => {
    const authors = joinAuthors(pub.authors);
    const parts = parseDateParts(pub.date);
    const year = parts?.year ? `${parts.year}.` : '';
    const doiText = pub.doi ? ` https://doi.org/${pub.doi}` : '';
    return `${authors ? `${authors}. ` : ''}${year} "${pub.title || pub.name}". ${
      pub.journal ? `${pub.journal}.` : ''
    }${doiText}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Index $open={menuOpen}>
          <IndexContainer>
            <Top>
              <h1>
                <a href="#about" onClick={goTo('about')}>✿ {name.toLowerCase()} ✿</a>
              </h1>
              <Hamburger
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                ☰
              </Hamburger>
            </Top>

            <IndexNav $open={menuOpen}>
              <ul>
                <li className={page === 'about' ? 'active' : ''}>
                  <a href="#about" onClick={goTo('about')}>about</a>
                </li>
                <li className={page === 'research' ? 'active' : ''}>
                  <a href="#research" onClick={goTo('research')}>research</a>
                </li>
              </ul>

              <Toggle
                type="button"
                onClick={() => onDarkModeChange?.(!darkMode)}
                aria-pressed={darkMode}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? '☀ lights on' : '☾ lights off'}
              </Toggle>
            </IndexNav>
          </IndexContainer>
        </Index>

        <Exhibit>
          <ExhibitContainer>
            {page === 'about' && (
              <>
                {avatarSrc ? (
                  <PortraitImg src={avatarSrc} alt={`very okay drawing of ${name}`} />
                ) : (
                  <Signature aria-label={name}>{getInitials(name)}</Signature>
                )}

                {bio.map((para, i) => (
                  <p key={`bio-${i}`}>{para}</p>
                ))}

                <p>
                  {website ? (
                    <A href={website} target="_blank" rel="noopener noreferrer">
                      CV is available here (last updated {lastUpdated})
                    </A>
                  ) : (
                    <>CV is available here (last updated {lastUpdated})</>
                  )}
                </p>

                {email && <p>My email is {spaceOutAt(email)}</p>}

                {newsItems.length > 0 && (
                  <NewsBox>
                    <p>~* Some recent news:*~</p>
                    {newsItems.map((item) => (
                      <p key={item.key}>
                        <b>{item.label}:</b> {item.content}
                      </p>
                    ))}
                  </NewsBox>
                )}
              </>
            )}

            {page === 'research' && (
              <>
                <PageTitle>Research</PageTitle>
                <p>
                  I am interested in research across a wide variety of formats —
                  from conference presentations and posters to peer-reviewed
                  publications{focus ? `, centred on ${focus}` : ''}.
                </p>

                {email && (
                  <p>
                    (please contact me if you need to access an article:{' '}
                    {spaceOutAt(email)})
                  </p>
                )}

                <Hr />

                {publications.length > 0 && (
                  <>
                    <GroupTitle>
                      <i>{focus ? titleCase(focus) : 'Publications'}</i>
                    </GroupTitle>
                    <p>
                      In this work, I examine {focus || 'my research questions'}{' '}
                      through environmental monitoring, data analysis, and
                      collaborative fieldwork.
                    </p>
                    {publications.map((pub, i) => {
                      const href = pub.doi
                        ? `https://doi.org/${pub.doi}`
                        : pub.url || null;
                      return (
                        <Description key={`pub-${i}`}>
                          {href ? (
                            <A href={href} target="_blank" rel="noopener noreferrer">
                              {citation(pub)}
                            </A>
                          ) : (
                            citation(pub)
                          )}
                        </Description>
                      );
                    })}
                    <Hr />
                  </>
                )}

                {presentations.length > 0 && (
                  <>
                    <GroupTitle><i>Presentations and Talks</i></GroupTitle>
                    <p>
                      Conference presentations and posters where I have shared
                      this research.
                    </p>
                    {presentations.map((pres, i) => (
                      <Description key={`pres-${i}`}>
                        {pres.name}.{' '}
                        {[pres.summary, pres.location, pres.date]
                          .filter(Boolean)
                          .join(', ')}
                        .
                      </Description>
                    ))}
                    <Hr />
                  </>
                )}

                {projects.length > 0 && (
                  <>
                    <GroupTitle><i>Projects and Tools</i></GroupTitle>
                    <p>
                      I also build tools that re-frame how digital methods are
                      used for research and everyday work.
                    </p>
                    {projects.map((proj, i) => (
                      <Description key={`proj-${i}`}>
                        {proj.url ? (
                          <A href={proj.url} target="_blank" rel="noopener noreferrer">
                            {proj.name}
                            {proj.date ? ` (${proj.date})` : ''}
                          </A>
                        ) : (
                          <>
                            {proj.name}
                            {proj.date ? ` (${proj.date})` : ''}
                          </>
                        )}
                        {proj.summary ? ` — ${proj.summary}` : ''}
                      </Description>
                    ))}
                    <Hr />
                  </>
                )}
              </>
            )}
          </ExhibitContainer>
        </Exhibit>
      </Page>
    </ThemeProvider>
  );
}

// Source metrics: 16px Gill Sans at 1.4em on the mint ground, --margin: 36px
// paddings (18px ≤900px), #index fixed at 200px wide, #exhibit offset 285px,
// p max-width 800px, h1/h2 reset to 16px weight 500 with 3em bottom margins.
const Page = styled.div`
  min-height: 100%;
  width: 100%;
  max-width: 1800px;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
  font-size: 16px;
  line-height: 1.4em;
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }

  p {
    max-width: 800px;
    margin: 0 0 1em;
  }

  b {
    font-weight: 500;
  }
`;

const A = styled.a`
  color: ${(props) => props.theme.text};
  text-decoration: none;
  border-bottom: 1px solid ${(props) => props.theme.text};

  &:visited {
    color: ${(props) => props.theme.visited};
  }

  &:hover {
    border-bottom: 0;
  }
`;

const Index = styled.div`
  position: fixed;
  top: var(--app-top-offset, 0px);
  left: 0;
  width: 200px;
  z-index: 5;

  @media (max-width: 900px) {
    width: 100vw;
    height: ${(props) => (props.$open ? '100vh' : '55px')};
    overflow: ${(props) => (props.$open ? 'auto' : 'hidden')};
    background: ${(props) => (props.$open ? props.theme.bg : 'transparent')};
  }
`;

const IndexContainer = styled.div`
  padding: 36px;

  @media (max-width: 900px) {
    padding: 18px;
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;

  h1 {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4em;
    margin: 0 0 3em;
  }

  h1 a {
    color: ${(props) => props.theme.text};
    text-decoration: none;
  }

  h1 a:hover {
    opacity: 0.5;
  }
`;

const Hamburger = styled.button`
  display: none;
  font-family: inherit;
  font-size: 18px;
  line-height: 1;
  color: ${(props) => props.theme.text};
  background: transparent;
  border: none;
  padding: 0 0 0 12px;
  cursor: pointer;
  align-self: flex-start;

  @media (max-width: 900px) {
    display: block;
  }
`;

const IndexNav = styled.nav`
  ul {
    list-style: none;
    margin: 0 0 1em;
    padding: 0;
  }

  a {
    color: ${(props) => props.theme.text};
    text-decoration: none;
  }

  a:hover {
    opacity: 0.5;
  }

  li.active a {
    font-weight: 500;
    color: ${(props) => props.theme.active};
  }

  @media (max-width: 900px) {
    display: ${(props) => (props.$open ? 'block' : 'none')};
  }
`;

const Toggle = styled.button`
  font-family: inherit;
  font-size: 11px;
  text-transform: uppercase;
  color: ${(props) => props.theme.text};
  background: transparent;
  border: none;
  padding: 0;
  margin-top: 2em;
  cursor: pointer;

  &:hover {
    opacity: 0.5;
  }
`;

const Exhibit = styled.div`
  margin: 0 0 0 285px;

  @media (max-width: 900px) {
    margin: 0;
    padding-top: 100px;
  }
`;

const ExhibitContainer = styled.div`
  padding: 36px;
  min-height: 90vh;

  @media (max-width: 900px) {
    padding: 18px;

    p {
      max-width: none;
    }
  }
`;

// The source portrait is a small hand drawing at 20% width.
const PortraitImg = styled.img`
  width: 20%;
  min-width: 120px;
  height: auto;
  margin: 0 0 1em;
`;

// Avatar-less stand-in for the "very okay drawing": the owner's initials as
// an SL Wronghand handwritten signature.
const Signature = styled.div`
  font-family: 'SL Wronghand', 'Comic Sans MS', cursive;
  font-size: clamp(72px, 12vw, 120px);
  line-height: 1.1;
  margin: 0 0 0.2em;
  color: ${(props) => props.theme.text};
`;

const PageTitle = styled.p`
  font-size: 24px;
`;

const GroupTitle = styled.p`
  font-size: 20px;
`;

const Description = styled.p`
  font-size: 14px;
`;

const Hr = styled.hr`
  border: none;
  border-top: 3px dashed ${(props) => props.theme.hr};
  height: 10px;
  width: 100%;
  margin: 0 0 1em;
`;

// The signature dotted-magenta marquee box, styles lifted from the source's
// inline style attribute (250px tall, gold scrollbar, 10px padding).
const NewsBox = styled.div`
  height: 250px;
  width: 800px;
  max-width: 100%;
  overflow: auto;
  border: 3px dotted ${(props) => props.theme.news};
  padding: 10px;
  margin-bottom: 2em;

  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.scrollbar} transparent;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.scrollbar};
  }
`;
