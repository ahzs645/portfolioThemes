import React, { useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { withBase } from '../../utils/assetPath';
import {
  formatRange,
  formatDate,
  getInitials,
} from '../../utils/cvHelpers';

/**
 * SylvainParisTheme — a CV-driven remake of the classic early-2000s academic
 * homepage at people.csail.mit.edu/sparis.
 *
 * The design: a light-gray page, a centered fixed bar of tab-like anchor
 * links, and one pale blue-gray content panel with a thin border. Inside, a
 * two-column identity block (name + blue affiliation/address lines + contacts
 * on the left, a bordered portrait on the right), a "What's new?" note, then
 * beveled gray→white section-header bars ("Useful Information", …) each
 * followed by centered, bullet-wrapped sub-headers ("• Research Interest •")
 * and justified body copy. All content is pulled from useCV().
 */

const lightTheme = {
  pageBg: 'rgb(240,240,240)',
  panelBg: 'rgb(211,230,234)',
  panelBorder: 'gray',
  text: '#111111',
  muted: '#555555',
  link: '#0000cc',
  linkHover: '#6464ff',
  menuText: '#111111',
  menuHover: 'rgb(230,230,230)',
  barGradient: 'linear-gradient(to bottom, #e2e2e2 0%, #ffffff 85%)',
  barBorder: '#000000',
  barText: '#111111',
  cardBg: 'rgb(210,210,225)',
  cardBorderLight: '#e8e8f2',
  cardBorderDark: '#9a9ab0',
  thumbBg: 'rgb(180,180,180)',
  thumbBorder: '#9a9ab0',
};

const darkTheme = {
  pageBg: '#14171b',
  panelBg: '#1f2833',
  panelBorder: '#3a4654',
  text: '#dbe2ea',
  muted: '#9aa6b2',
  link: '#7fb2ff',
  linkHover: '#a9ccff',
  menuText: '#c9d3dd',
  menuHover: '#2b3743',
  barGradient: 'linear-gradient(to bottom, #38444f 0%, #2a343d 90%)',
  barBorder: '#586878',
  barText: '#eef3f8',
  cardBg: '#26303c',
  cardBorderLight: '#3c4a58',
  cardBorderDark: '#161d24',
  thumbBg: '#33404d',
  thumbBorder: '#151b21',
};

const GlobalStyle = createGlobalStyle`
  body { background: ${(props) => props.theme.pageBg}; }
`;

// Join an author array into "A, B, and C", emphasizing the CV owner.
function renderAuthors(authors, ownerName) {
  const list = Array.isArray(authors) ? authors.filter(Boolean) : [];
  if (list.length === 0) return null;
  const owner = String(ownerName || '').trim().toLowerCase();

  return list.map((author, idx) => {
    const isOwner = owner && String(author).trim().toLowerCase() === owner;
    let sep = '';
    if (idx < list.length - 2) sep = ', ';
    else if (idx === list.length - 2) sep = list.length > 2 ? ', and ' : ' and ';

    return (
      <React.Fragment key={`${author}-${idx}`}>
        {isOwner ? <b>{author}</b> : author}
        {sep}
      </React.Fragment>
    );
  });
}

export function SylvainParisTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const email = cv.email || null;
  const phone = cv.phone || null;
  const location = cv.location || null;
  const website = cv.website || null;

  const avatarSrc = cv.avatar
    ? (/^https?:\/\//i.test(cv.avatar) ? cv.avatar : withBase(cv.avatar))
    : null;

  const education = Array.isArray(cv.education) ? cv.education : [];
  const experience = Array.isArray(cv.experience) ? cv.experience : [];
  const publications = Array.isArray(cv.publications) ? cv.publications : [];
  const presentations = Array.isArray(cv.presentations) ? cv.presentations : [];
  const awards = Array.isArray(cv.awards) ? cv.awards : [];
  const professionalDevelopment = Array.isArray(cv.professionalDevelopment)
    ? cv.professionalDevelopment
    : [];

  // Current graduate program drives the affiliation block.
  const currentEdu = education[0] || null;
  const institution = currentEdu?.institution || cv.currentJobTitle || null;
  const department = currentEdu?.area || null;

  const mapsUrl = location
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        [institution, location].filter(Boolean).join(', '),
      )}`
    : null;

  const updatedLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [],
  );

  // Synthesize a "Research Interest" bio from field + education + current role.
  const researchParagraphs = useMemo(() => {
    const field = 'air quality and environmental health';
    const current = experience.find((e) => e.isCurrent) || experience[0] || null;

    const degreeWord = (() => {
      const d = String(currentEdu?.degree || '').toLowerCase();
      if (d.includes('phd') || d.includes('ph.d')) return 'doctoral';
      if (d.includes('m.sc') || d.includes('msc') || d.includes('master')) return 'graduate';
      return 'graduate';
    })();

    const affiliation = [
      currentEdu?.area ? `${currentEdu.area}` : null,
      institution ? `at ${institution}` : null,
      location ? `in ${location}` : null,
    ]
      .filter(Boolean)
      .join(' ');

    const p1 =
      `My research centers on ${field}, examining how ambient air pollution and ` +
      `airborne particulate matter affect the well-being of northern and rural ` +
      `communities. As a ${degreeWord} researcher` +
      (affiliation ? ` in ${affiliation}` : '') +
      `, I combine field measurement, laboratory analysis, and data-driven ` +
      `methods — from black carbon and particulate-bound metals to road-dust ` +
      `chemistry — to understand the exposures faced by the populations most ` +
      `affected by poor air quality.`;

    const p2 = current
      ? `Alongside my graduate studies, I work as ${current.title}` +
        (current.company ? ` at ${current.company}` : '') +
        `, where I collect and process environmental samples, maintain and ` +
        `calibrate analytical instrumentation, and translate laboratory results ` +
        `into reports and peer-reviewed research. I am broadly interested in ` +
        `bridging environmental monitoring, public-health informatics, and the ` +
        `tools that make research reproducible.`
      : `I am broadly interested in bridging environmental monitoring, ` +
        `public-health informatics, and the tools that make research reproducible.`;

    return [p1, p2];
  }, [experience, currentEdu, institution, location]);

  const navItems = [
    { href: '#contact', label: 'Contact' },
    { href: '#info', label: 'Information' },
    { href: '#publications', label: 'Publications' },
    { href: '#awards', label: 'Awards' },
    { href: '#development', label: 'Development' },
  ];

  const scrollTo = (event, href) => {
    event.preventDefault();
    const el = document.getElementById(href.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Menu>
          <MenuInner>
            {navItems.map((item) => (
              <MenuLink
                key={item.href}
                href={item.href}
                onClick={(e) => scrollTo(e, item.href)}
              >
                {item.label}
              </MenuLink>
            ))}
            <Toggle
              type="button"
              onClick={() => onDarkModeChange?.(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀' : '☾'}
            </Toggle>
          </MenuInner>
        </Menu>

        <Content>
          <Panel>
            <Anchor id="contact" />

            <IdBlock>
              <Portrait>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={name} />
                ) : (
                  <PortraitPlaceholder aria-hidden="true">
                    {getInitials(name, 2, '—')}
                  </PortraitPlaceholder>
                )}
              </Portrait>

              <Name>{name}</Name>

              {(institution || department || location) && (
                <Address>
                  {mapsUrl ? (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                      {institution && (
                        <>
                          {institution}
                          <br />
                        </>
                      )}
                      {department && (
                        <>
                          {department}
                          <br />
                        </>
                      )}
                      {location}
                    </a>
                  ) : (
                    <span>
                      {institution && (
                        <>
                          {institution}
                          <br />
                        </>
                      )}
                      {department && (
                        <>
                          {department}
                          <br />
                        </>
                      )}
                      {location}
                    </span>
                  )}
                </Address>
              )}

              <Address>
                {email && (
                  <a className="email" href={`mailto:${email}`}>
                    {email}
                  </a>
                )}
                {email && phone && <Dash>&mdash;</Dash>}
                {phone && (
                  <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>
                )}
              </Address>

              {website && (
                <Note>
                  More at{' '}
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                  .
                </Note>
              )}
            </IdBlock>

            <SmallTitle>What&apos;s new?</SmallTitle>
            <News>
              <InlineTitle>Updated {updatedLabel}:</InlineTitle> added recent{' '}
              <a href="#publications" onClick={(e) => scrollTo(e, '#publications')}>
                publications
              </a>{' '}
              and{' '}
              <a href="#awards" onClick={(e) => scrollTo(e, '#awards')}>
                awards
              </a>
              .
            </News>

            {/* ---- Useful Information ---- */}
            <Anchor id="info" />
            <Bar>Useful Information</Bar>

            <SubHead>Research Interest</SubHead>
            {researchParagraphs.map((para, i) => (
              <P key={`ri-${i}`}>{para}</P>
            ))}

            {education.length > 0 && (
              <>
                <SubHead>Education</SubHead>
                {education.map((edu, i) => {
                  const range = formatRange(edu.start_date, edu.end_date, {
                    month: 'none',
                    ongoingWhenNoEnd: false,
                  });
                  const highlights = Array.isArray(edu.highlights)
                    ? edu.highlights
                    : [];
                  return (
                    <Entry key={`edu-${i}`}>
                      <EntryTitle>
                        {[edu.degree, edu.area].filter(Boolean).join(', ')}
                      </EntryTitle>
                      <EntryMeta>
                        {[edu.institution, edu.location, range]
                          .filter(Boolean)
                          .map((part, idx, arr) => (
                            <React.Fragment key={idx}>
                              {part}
                              {idx < arr.length - 1 && <Bullet>&bull;</Bullet>}
                            </React.Fragment>
                          ))}
                      </EntryMeta>
                      {highlights.length > 0 && (
                        <SquareList>
                          {highlights.map((h, hi) => (
                            <li key={hi}>{h}</li>
                          ))}
                        </SquareList>
                      )}
                    </Entry>
                  );
                })}
              </>
            )}

            {experience.length > 0 && (
              <>
                <SubHead>Experience</SubHead>
                {experience.map((exp, i) => {
                  const range = formatRange(exp.startDate, exp.endDate, {
                    month: 'short',
                    ongoingWhenNoEnd: false,
                  });
                  const highlights = Array.isArray(exp.highlights)
                    ? exp.highlights
                    : [];
                  return (
                    <Entry key={`exp-${i}`}>
                      <EntryTitle>{exp.title}</EntryTitle>
                      <EntryMeta>
                        {[exp.company, range].filter(Boolean).map((part, idx, arr) => (
                          <React.Fragment key={idx}>
                            {part}
                            {idx < arr.length - 1 && <Bullet>&bull;</Bullet>}
                          </React.Fragment>
                        ))}
                      </EntryMeta>
                      {highlights.length > 0 && (
                        <SquareList>
                          {highlights.map((h, hi) => (
                            <li key={hi}>{h}</li>
                          ))}
                        </SquareList>
                      )}
                    </Entry>
                  );
                })}
              </>
            )}

            {/* ---- Publications & Talks ---- */}
            <Anchor id="publications" />
            <Bar>Publications &amp; Talks</Bar>

            {publications.length > 0 && (
              <>
                <SubHead>Selected Publications</SubHead>
                <P>
                  Here are selected publications in reverse-chronological order.
                  A full list is available on request.
                </P>
                {publications.map((pub, i) => {
                  const year = formatDate(pub.date, {
                    month: 'none',
                    fallback: pub.date || '',
                  });
                  return (
                    <PubCard key={`pub-${i}`}>
                      <PubNum>[{publications.length - i}]</PubNum>
                      <PubBody>
                        <PubTitle>{pub.title}</PubTitle>
                        {Array.isArray(pub.authors) && pub.authors.length > 0 && (
                          <PubAuthors>{renderAuthors(pub.authors, name)}</PubAuthors>
                        )}
                        {(pub.journal || year) && (
                          <PubWhere>
                            {[pub.journal, year].filter(Boolean).join(', ')}
                          </PubWhere>
                        )}
                        {pub.doi && (
                          <PubLinks>
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              doi:{pub.doi}
                            </a>
                          </PubLinks>
                        )}
                      </PubBody>
                    </PubCard>
                  );
                })}
              </>
            )}

            {presentations.length > 0 && (
              <>
                <SubHead>Talks &amp; Presentations</SubHead>
                <SquareList $loose>
                  {presentations.map((pres, i) => {
                    const year = formatDate(pres.date, {
                      month: 'none',
                      fallback: pres.date || '',
                    });
                    return (
                      <li key={`pres-${i}`}>
                        <b>{pres.name}</b>
                        {(pres.summary || pres.location || year) && (
                          <PresMeta>
                            {[pres.summary, pres.location, year]
                              .filter(Boolean)
                              .join(', ')}
                          </PresMeta>
                        )}
                      </li>
                    );
                  })}
                </SquareList>
              </>
            )}

            {/* ---- Honors & Awards ---- */}
            <Anchor id="awards" />
            <Bar>Honors &amp; Awards</Bar>

            {awards.length > 0 && (
              <>
                <SubHead>Awards</SubHead>
                {awards.map((award, i) => {
                  const year = formatDate(award.date, {
                    month: 'long',
                    fallback: award.date || '',
                  });
                  const blurb = Array.isArray(award.highlights)
                    ? award.highlights[0]
                    : null;
                  return (
                    <Entry key={`award-${i}`}>
                      <EntryTitle>{award.name}</EntryTitle>
                      <EntryMeta>
                        {[award.summary, year].filter(Boolean).map((part, idx, arr) => (
                          <React.Fragment key={idx}>
                            {part}
                            {idx < arr.length - 1 && <Bullet>&bull;</Bullet>}
                          </React.Fragment>
                        ))}
                      </EntryMeta>
                      {blurb && <P $tight>{blurb}</P>}
                    </Entry>
                  );
                })}
              </>
            )}

            {/* ---- Professional Development ---- */}
            <Anchor id="development" />
            <Bar>Professional Development</Bar>

            {professionalDevelopment.length > 0 ? (
              <>
                <SubHead>Courses &amp; Training</SubHead>
                <SquareList $loose>
                  {professionalDevelopment.map((item, i) => {
                    const year = formatDate(item.date, {
                      month: 'short',
                      fallback: item.date || '',
                    });
                    return (
                      <li key={`pd-${i}`}>
                        <b>{item.name}</b>
                        {(item.summary || item.location || year) && (
                          <PresMeta>
                            {[item.summary, item.location, year]
                              .filter(Boolean)
                              .join(', ')}
                          </PresMeta>
                        )}
                      </li>
                    );
                  })}
                </SquareList>
              </>
            ) : (
              <P>Details available on request.</P>
            )}

            <FootNote>
              <hr />
              {name} &middot; Last updated {updatedLabel}
            </FootNote>
          </Panel>
        </Content>
      </Page>
    </ThemeProvider>
  );
}

/* ------------------------------------------------------------------ */
/* styled components                                                  */
/* ------------------------------------------------------------------ */

const FONT_STACK =
  "'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  background: ${(props) => props.theme.pageBg};
  color: ${(props) => props.theme.text};
  font-family: ${FONT_STACK};
  font-weight: 300;
  line-height: 1.25;

  a {
    color: ${(props) => props.theme.link};
    text-decoration: none;
    margin: 0 2px;
  }
  a:hover {
    color: ${(props) => props.theme.linkHover};
  }
  b {
    font-weight: 600;
  }
`;

const Menu = styled.nav`
  position: fixed;
  top: var(--app-top-offset, 0px);
  left: 0;
  width: 100%;
  z-index: 100;
  background: ${(props) => props.theme.pageBg};
  box-shadow: 0 6px 8px -8px rgba(0, 0, 0, 0.55);
`;

const MenuInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.25rem 0.5rem;
  padding: 0.55rem 0.75rem;
`;

const MenuLink = styled.a`
  && {
    color: ${(props) => props.theme.menuText};
  }
  padding: 0.25ex 1ex;
  margin: 0 0.35em;
  line-height: 1.5;
  border-radius: 2px;

  &:hover {
    background: ${(props) => props.theme.menuHover};
    color: ${(props) => props.theme.menuText};
  }
`;

const Toggle = styled.button`
  && {
    color: ${(props) => props.theme.menuText};
  }
  margin-left: 0.5em;
  padding: 0.1ex 0.9ex;
  font-size: 0.95rem;
  line-height: 1.5;
  background: transparent;
  border: 1px solid ${(props) => props.theme.panelBorder};
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.menuHover};
  }
`;

const Content = styled.div`
  padding: 4rem 1.5rem 4rem;
  box-sizing: border-box;

  @media (max-width: 800px) {
    padding: 4.5rem 0.75rem 3rem;
  }
`;

const Panel = styled.main`
  position: relative;
  max-width: 52em;
  margin: 0 auto;
  padding: 1.75ex 2.5ex;
  background: ${(props) => props.theme.panelBg};
  border: 1px solid ${(props) => props.theme.panelBorder};
  text-align: justify;
  overflow: hidden;
`;

const Anchor = styled.span`
  display: block;
  position: relative;
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 4rem);
`;

const IdBlock = styled.div`
  margin-bottom: 3ex;
  overflow: hidden;
`;

const Portrait = styled.div`
  float: right;
  margin: 0.5ex 0 1.5ex 2ex;

  img {
    display: block;
    width: 170px;
    max-width: 33vw;
    height: auto;
    border: 3px solid ${(props) => (props.theme.text === '#111111' ? '#000' : props.theme.cardBorderDark)};
  }

  @media (max-width: 800px) {
    float: none;
    margin: 0 0 1.5ex 0;
    img {
      width: 130px;
      max-width: 40vw;
    }
  }
`;

const PortraitPlaceholder = styled.div`
  width: 170px;
  height: 200px;
  max-width: 33vw;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid ${(props) => (props.theme.text === '#111111' ? '#000' : props.theme.cardBorderDark)};
  background: ${(props) => props.theme.thumbBg};
  color: ${(props) => props.theme.muted};
  font-size: 2.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;

  @media (max-width: 800px) {
    width: 130px;
    height: 150px;
    max-width: 40vw;
    font-size: 2rem;
  }
`;

const Name = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-align: left;
`;

const Address = styled.div`
  margin-top: 0.6ex;
  text-align: left;
  line-height: 1.45;

  a {
    margin: 0;
  }
`;

const Dash = styled.span`
  margin: 0 0.4em;
  color: ${(props) => props.theme.muted};
`;

const Note = styled.div`
  margin-top: 1ex;
  font-style: italic;
  text-align: left;
  color: ${(props) => props.theme.muted};

  a {
    margin: 0;
  }
`;

const SmallTitle = styled.div`
  font-weight: 400;
  text-align: left;
`;

const News = styled.div`
  margin: 0.5ex 0 1ex 2ex;
  text-align: left;
`;

const InlineTitle = styled.span`
  color: ${(props) => props.theme.muted};
  font-weight: 400;
`;

const Bar = styled.h1`
  margin: 5ex 0 3ex;
  margin-left: -2.5ex;
  width: 72%;
  min-height: 2.25ex;
  padding: 0.7ex 0.6ex 0.5ex 20px;
  box-sizing: border-box;
  background: ${(props) => props.theme.barGradient};
  border: 1px solid ${(props) => props.theme.barBorder};
  color: ${(props) => props.theme.barText};
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.38em;
  text-align: left;
  text-transform: none;

  @media (max-width: 800px) {
    margin-left: 0;
    width: auto;
    letter-spacing: 0.22em;
    padding-left: 12px;
    font-size: 1.05rem;
  }
`;

const SubHead = styled.h2`
  margin: 4ex 0 1.6ex;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-align: center;
  color: ${(props) => props.theme.text};

  &::before {
    content: '\\2022';
    margin-right: 0.9ex;
  }
  &::after {
    content: '\\2022';
    margin-left: 0.9ex;
  }
`;

const P = styled.p`
  margin: 0 0 ${(props) => (props.$tight ? '0.5ex' : '1.4ex')};
  text-align: justify;
  line-height: 1.5;
`;

const Entry = styled.div`
  margin: 0 0 2ex;
  text-align: left;
`;

const EntryTitle = styled.div`
  font-weight: 600;
  text-align: left;
`;

const EntryMeta = styled.div`
  font-style: italic;
  color: ${(props) => props.theme.muted};
  margin-top: 0.15ex;
  text-align: left;
`;

const Bullet = styled.span`
  margin: 0 0.6em;
  font-style: normal;
`;

const SquareList = styled.ul`
  list-style-type: square;
  margin: ${(props) => (props.$loose ? '0.5ex 0 1ex' : '0.6ex 0 1ex')};
  padding-left: 2.4ex;
  text-align: left;

  li {
    margin-bottom: ${(props) => (props.$loose ? '1.1ex' : '0.5ex')};
    line-height: 1.45;
  }
`;

const PresMeta = styled.div`
  font-style: italic;
  color: ${(props) => props.theme.muted};
  margin-top: 0.1ex;
`;

const PubCard = styled.div`
  display: flex;
  gap: 1ex;
  background: ${(props) => props.theme.cardBg};
  border-top: 2px solid ${(props) => props.theme.cardBorderLight};
  border-left: 2px solid ${(props) => props.theme.cardBorderLight};
  border-right: 2px solid ${(props) => props.theme.cardBorderDark};
  border-bottom: 2px solid ${(props) => props.theme.cardBorderDark};
  padding: 1.1ex 1.5ex;
  margin-bottom: 1.5ex;
  text-align: left;
`;

const PubNum = styled.div`
  flex: 0 0 auto;
  font-weight: 600;
  color: ${(props) => props.theme.muted};
`;

const PubBody = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const PubTitle = styled.div`
  font-weight: 700;
`;

const PubAuthors = styled.div`
  margin-top: 0.2ex;
`;

const PubWhere = styled.div`
  font-style: italic;
  color: ${(props) => props.theme.muted};
  margin-top: 0.1ex;
`;

const PubLinks = styled.div`
  margin-top: 0.4ex;

  a {
    margin: 0;
  }
`;

const FootNote = styled.div`
  margin: 8ex 0 2ex;
  padding: 1ex;
  font-size: 0.85rem;
  text-align: center;
  color: ${(props) => props.theme.muted};

  hr {
    width: 300px;
    max-width: 60%;
    border: 0;
    border-top: 1px solid ${(props) => props.theme.panelBorder};
    margin: 0 auto 1.5ex;
  }
`;
