import React, { useMemo } from 'react';
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
 * The source is a web-1.0 academic homepage: a white page in Times serif with
 * a big blue "✿ name ✿" link, a bulleted "• about • research" nav, a bold
 * "Main" heading, a tiny captioned portrait, plain serif bio paragraphs, a
 * "CV is available here (last updated …)" link, a spaced-out email line, and
 * — the signature — a dotted MAGENTA box titled "~* Some recent news:*~" full
 * of bold, dated entries. We rebuild that voice from this app's CV data and
 * add a quiet retro dark palette for the shell's dark-mode toggle.
 */

// Real jenliujenliu.com palette: black text on a mint-green ground, with a
// hot-pink name/portrait and a dotted-magenta news box.
const lightTheme = {
  bg: '#dbffea',
  text: '#000000',
  heading: '#ff2d95',
  link: '#000000',
  visited: '#000000',
  muted: 'rgba(0, 0, 0, 0.5)',
  news: '#ff00ff',
  newsInk: '#000000',
  rule: 'rgba(0, 0, 0, 0.4)',
  placeholder: '#c6f4d8',
};

const darkTheme = {
  bg: '#0e0e14',
  text: '#d7d7e0',
  heading: '#8ab4ff',
  link: '#8ab4ff',
  visited: '#c6a6ff',
  muted: '#9a9aac',
  news: '#ff5cff',
  newsInk: '#d7d7e0',
  rule: '#2a2a36',
  placeholder: '#15151d',
};

const GlobalStyle = createGlobalStyle`
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

export function JenLiuTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const website = cv.website || null;
  const email = cv.email || null;
  const location = cv.location || null;

  const socials = cv.social || [];
  const linkedin = pickSocialUrl(socials, ['linkedin']);
  const github = pickSocialUrl(socials, ['github']);
  const facebook = pickSocialUrl(socials, ['facebook']);
  const instagram = pickSocialUrl(socials, ['instagram']);

  const avatarSrc = cv.avatar
    ? (/^https?:\/\//i.test(cv.avatar) ? cv.avatar : withBase(cv.avatar))
    : null;

  const experience = cv.experience || [];
  const projects = cv.projects || [];
  const education = cv.education || [];
  const publications = cv.publications || [];

  // --- Synthesized bio (cv.about is empty) -----------------------------------
  const bio = useMemo(() => {
    const role = cv.currentJobTitle || 'researcher';
    const org = experience[0]?.company || null;
    const topEdu = education[0] || null;

    const paras = [];

    const roleLine =
      `I am ${withArticle(role)}` +
      (org ? ` at ${org}` : '') +
      (location ? `, based in ${location}` : '') +
      '. My work sits at the intersection of air quality and ' +
      'environmental health.';
    paras.push(roleLine);

    paras.push(
      'My research examines how air pollution — wildfire smoke, fine ' +
      'particulate matter, and the everyday exhaust of the places we live — ' +
      'moves through communities and shapes human health. I work with ' +
      'environmental monitoring data and exposure modelling to make these ' +
      'often-invisible exposures legible across northern British Columbia and ' +
      'beyond.',
    );

    if (topEdu) {
      const degree = topEdu.degree || topEdu.studyType || topEdu.area;
      const inArea = topEdu.area && topEdu.area !== degree ? ` in ${topEdu.area}` : '';
      const at = topEdu.institution ? ` at ${topEdu.institution}` : '';
      if (degree) {
        paras.push(`I pursued my ${degree}${inArea}${at}, where I built the ` +
          'methods and questions that anchor my work today.');
      }
    }

    return paras;
  }, [cv.currentJobTitle, experience, education, location]);

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

    (cv.presentations || []).forEach((p, i) => {
      if (!p?.name) return;
      items.push({
        key: `pres-${i}`,
        sort: dateSortKey(p.date),
        label: monthYear(p.date),
        content: (
          <>
            Presented {p.name}
            {p.location ? ` (${p.location})` : ''}.
          </>
        ),
      });
    });

    (cv.publications || []).forEach((p, i) => {
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
              <A href={href} target="_blank" rel="noopener noreferrer">{title}</A>
            ) : (
              title
            )}
            {p.journal ? (
              <> is out in <em>{p.journal}</em>!</>
            ) : null}
          </>
        ),
      });
    });

    return items
      .filter((it) => it.label)
      .sort((a, b) => b.sort - a.sort)
      .slice(0, 14);
  }, [cv.awards, cv.presentations, cv.publications]);

  const lastUpdated =
    newsItems[0]?.label ||
    `${MONTHS_LONG[new Date().getMonth()]} ${new Date().getFullYear()}`;

  const elsewhere = [
    website ? { label: 'website', url: website } : null,
    linkedin ? { label: 'linkedin', url: linkedin } : null,
    github ? { label: 'github', url: github } : null,
    facebook ? { label: 'facebook', url: facebook } : null,
    instagram ? { label: 'instagram', url: instagram } : null,
  ].filter(Boolean);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Shell>
          <TopBar>
            <NameHeading>
              {website ? (
                <a href={website} target="_blank" rel="noopener noreferrer">
                  ✿ {name} ✿
                </a>
              ) : (
                <span>✿ {name} ✿</span>
              )}
            </NameHeading>
            <Toggle
              type="button"
              onClick={() => onDarkModeChange?.(!darkMode)}
              aria-pressed={darkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀ lights on' : '☾ lights off'}
            </Toggle>
          </TopBar>

          <Nav aria-label="sections">
            <ul>
              <li><A href="#about">about</A></li>
              <li><A href="#research">research</A></li>
            </ul>
          </Nav>

          <MainHeading id="about">Main</MainHeading>

          <Portrait>
            {avatarSrc ? (
              <img src={avatarSrc} alt={name} />
            ) : (
              <Placeholder aria-label={name}>{getInitials(name)}</Placeholder>
            )}
          </Portrait>

          {bio.map((para, i) => (
            <Para key={`bio-${i}`}>{para}</Para>
          ))}

          <Para>
            {website ? (
              <A href={website} target="_blank" rel="noopener noreferrer">
                CV is available here (last updated {lastUpdated})
              </A>
            ) : (
              <>CV is available here (last updated {lastUpdated})</>
            )}
          </Para>

          {email && (
            <Para>My email is {spaceOutAt(email)}</Para>
          )}

          {newsItems.length > 0 && (
            <NewsBox>
              <NewsTitle>~* Some recent news:*~</NewsTitle>
              {newsItems.map((item) => (
                <NewsItem key={item.key}>
                  <b>{item.label}:</b> {item.content}
                </NewsItem>
              ))}
            </NewsBox>
          )}

          {projects.length > 0 && (
            <Section id="research">
              <SectionHeading>research</SectionHeading>
              {projects.map((proj, i) => (
                <QuietItem key={`proj-${i}`}>
                  {proj.url ? (
                    <A href={proj.url} target="_blank" rel="noopener noreferrer">
                      {proj.name}
                    </A>
                  ) : (
                    <strong>{proj.name}</strong>
                  )}
                  {proj.summary ? <> — {proj.summary}</> : null}
                </QuietItem>
              ))}
            </Section>
          )}

          {experience.length > 0 && (
            <Section>
              <SectionHeading>experience</SectionHeading>
              {experience.map((exp, i) => {
                const range = formatRange(exp.startDate, exp.endDate, {
                  month: 'none',
                  ongoingWhenNoEnd: true,
                });
                return (
                  <QuietItem key={`exp-${i}`}>
                    <strong>{exp.title}</strong>
                    {exp.company ? `, ${exp.company}` : ''}
                    {range ? <Muted> ({range})</Muted> : null}
                  </QuietItem>
                );
              })}
            </Section>
          )}

          {education.length > 0 && (
            <Section>
              <SectionHeading>education</SectionHeading>
              {education.map((edu, i) => {
                const degree = edu.degree || edu.studyType;
                const range = formatRange(edu.start_date, edu.end_date, {
                  month: 'none',
                });
                return (
                  <QuietItem key={`edu-${i}`}>
                    <strong>{[degree, edu.area].filter(Boolean).join(', ')}</strong>
                    {edu.institution ? `, ${edu.institution}` : ''}
                    {range ? <Muted> ({range})</Muted> : null}
                  </QuietItem>
                );
              })}
            </Section>
          )}

          {publications.length > 0 && (
            <Section>
              <SectionHeading>publications</SectionHeading>
              {publications.map((pub, i) => {
                const title = pub.title || pub.name;
                const href = pub.doi ? `https://doi.org/${pub.doi}` : pub.url || null;
                const authors = Array.isArray(pub.authors)
                  ? pub.authors.join(', ')
                  : pub.authors;
                return (
                  <QuietItem key={`pub-${i}`}>
                    {href ? (
                      <A href={href} target="_blank" rel="noopener noreferrer">
                        {title}
                      </A>
                    ) : (
                      <strong>{title}</strong>
                    )}
                    {authors ? <Muted> — {authors}</Muted> : null}
                    {pub.journal ? <Muted>. <em>{pub.journal}</em></Muted> : null}
                    {pub.date ? <Muted>, {monthYear(pub.date) || pub.date}</Muted> : null}
                  </QuietItem>
                );
              })}
            </Section>
          )}

          {elsewhere.length > 0 && (
            <Footer>
              <SectionHeading>elsewhere</SectionHeading>
              <ul>
                {elsewhere.map((link) => (
                  <li key={link.url}>
                    <A href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </A>
                  </li>
                ))}
              </ul>
            </Footer>
          )}
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
  font-family: 'Times New Roman', Times, Georgia, serif;
  font-size: 16px;
  line-height: 1.4;
  box-sizing: border-box;
`;

const Shell = styled.div`
  max-width: 860px;
  margin: 0;
  padding: clamp(20px, 4vw, 36px);
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }
`;

const A = styled.a`
  color: ${(props) => props.theme.link};
  text-decoration: underline;

  &:visited {
    color: ${(props) => props.theme.visited};
  }

  &:hover {
    text-decoration: none;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

const TopBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px 16px;
  margin-bottom: 1.2em;
`;

const NameHeading = styled.h1`
  font-size: clamp(1.6rem, 6vw, 2.1rem);
  font-weight: 700;
  line-height: 1.1;
  margin: 0;

  a,
  span {
    color: ${(props) => props.theme.heading};
  }

  a {
    text-decoration: underline;
  }

  a:hover {
    text-decoration: none;
  }
`;

const Toggle = styled.button`
  font-family: inherit;
  font-size: 0.85rem;
  color: ${(props) => props.theme.link};
  background: transparent;
  border: 1px dashed ${(props) => props.theme.news};
  border-radius: 2px;
  padding: 4px 10px;
  cursor: pointer;
  white-space: nowrap;
  min-height: 32px;

  &:hover {
    color: ${(props) => props.theme.news};
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

const Nav = styled.nav`
  margin: 0 0 2.4em 0;

  ul {
    list-style: disc;
    margin: 0;
    padding-left: 1.6em;
  }

  li {
    margin: 0.15em 0;
  }
`;

const MainHeading = styled.h2`
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  font-weight: 700;
  margin: 0 0 1.1em 0;
  scroll-margin-top: var(--app-top-offset, 0px);
`;

const Portrait = styled.div`
  margin: 0 0 1.4em 0;

  img {
    display: block;
    width: clamp(120px, 22vw, 170px);
    height: auto;
    max-width: 100%;
  }
`;

const Placeholder = styled.div`
  width: clamp(120px, 22vw, 170px);
  max-width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 700;
  font-size: clamp(2.6rem, 7vw, 3.6rem);
  letter-spacing: 0.04em;
  color: ${(props) => props.theme.muted};
  background: ${(props) => props.theme.placeholder};
  border: 1px solid ${(props) => props.theme.rule};
`;

const Para = styled.p`
  max-width: 800px;
  margin: 0 0 1em 0;
`;

const NewsBox = styled.div`
  margin: 1.6em 0 2.4em 0;
  max-width: 800px;
  width: 100%;
  max-height: 340px;
  overflow: auto;
  border: 3px dotted ${(props) => props.theme.news};
  padding: 12px 14px;
  color: ${(props) => props.theme.newsInk};

  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.news} transparent;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.news};
  }
`;

const NewsTitle = styled.p`
  margin: 0 0 1em 0;
`;

const NewsItem = styled.p`
  margin: 0 0 1em 0;

  &:last-child {
    margin-bottom: 0;
  }

  b {
    font-weight: 700;
  }
`;

const Section = styled.section`
  margin: 0 0 2em 0;
  scroll-margin-top: var(--app-top-offset, 0px);
`;

const SectionHeading = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.8em 0;
`;

const QuietItem = styled.p`
  max-width: 800px;
  margin: 0 0 0.7em 0;

  strong {
    font-weight: 700;
  }
`;

const Muted = styled.span`
  color: ${(props) => props.theme.muted};
`;

const Footer = styled.footer`
  margin: 2.4em 0 0 0;

  ul {
    list-style: disc;
    margin: 0;
    padding-left: 1.6em;
  }

  li {
    margin: 0.15em 0;
  }
`;
