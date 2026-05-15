import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDateRange } from '../../utils/cvHelpers';

const COLOR_CLASSES = ['blue', 'ibm2', 'ibm4', 'ibm5', 'fullblue', 'green', 'red'];

function getEntryTitle(entry) {
  return entry?.name || entry?.title || entry?.project || entry?.company || entry?.institution || '';
}

function getEntryUrl(entry) {
  return entry?.url || entry?.website || entry?.link || null;
}

function getEntrySummary(entry) {
  if (entry?.summary) return entry.summary;
  if (entry?.description) return entry.description;
  if (Array.isArray(entry?.highlights) && entry.highlights.length > 0) return entry.highlights[0];
  return '';
}

function getYear(value) {
  if (!value) return '';
  const match = String(value).match(/\d{4}/);
  return match ? match[0] : String(value);
}

function getSocialLabel(item) {
  return item?.network || item?.name || item?.label || 'Link';
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="section">
      <article className="subsection cols">
        <div className="col col-l">
          <h2>{title}</h2>
        </div>
        <div className="col col-r">{children}</div>
      </article>
    </section>
  );
}

function ExternalLink({ href, children }) {
  if (!href) return <>{children}</>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function InlinePhrase({ label, children, colorIndex = 0 }) {
  if (!children) return null;

  return (
    <>
      <p className="intro-p">{label}</p>
      <p className={`intro-p large serif ${COLOR_CLASSES[colorIndex % COLOR_CLASSES.length]} intro-p-space-after`}>
        {children}
      </p>
    </>
  );
}

export function SebastianBernsTheme() {
  const cv = useCV();

  if (!cv) return null;

  const socials = cv.socialRaw || [];
  const projectItems = cv.projects.slice(0, 8);
  const experienceItems = cv.experience.slice(0, 8);
  const educationItems = cv.education.slice(0, 4);
  const skills = cv.skills.slice(0, 8);
  const moreItems = [
    ...cv.awards.slice(0, 4),
    ...cv.publications.slice(0, 4),
    ...cv.presentations.slice(0, 4),
    ...cv.professionalDevelopment.slice(0, 4),
  ].slice(0, 8);

  const currentLine = [cv.currentJobTitle, cv.location].filter(Boolean).join(' in ');
  const firstProject = projectItems[0];
  const secondaryProject = projectItems[1];

  return (
    <ThemeRoot>
      <SebastianGlobalStyle />
      <Main id="main" role="main">
        <header className="section">
          <article className="subsection cols">
            <div className="col col-l">
              <h1>
                {cv.name.split(/\s+/).map((part, index) => (
                  <React.Fragment key={`${part}-${index}`}>
                    {index > 0 && <br />}
                    {part}
                  </React.Fragment>
                ))}
                {cv.email && (
                  <>
                    <br />
                    <EmailLink href={`mailto:${cv.email}`}>{cv.email}</EmailLink>
                  </>
                )}
              </h1>
            </div>
            <nav className="col col-r" aria-label="Theme sections">
              <NavList>
                {projectItems.length > 0 && (
                  <li>
                    <a href="#projects">Projects</a>
                  </li>
                )}
                {experienceItems.length > 0 && (
                  <li>
                    <a href="#experience">Experience</a>
                  </li>
                )}
                {educationItems.length > 0 && (
                  <li>
                    <a href="#education">Education</a>
                  </li>
                )}
              </NavList>
              <LinkList>
                {cv.website && (
                  <li>
                    <ExternalLink href={cv.website}>Website</ExternalLink>
                  </li>
                )}
                {socials.map((social) => (
                  <li key={`${getSocialLabel(social)}-${social.url}`}>
                    <ExternalLink href={social.url}>{getSocialLabel(social)}</ExternalLink>
                  </li>
                ))}
              </LinkList>
            </nav>
          </article>
        </header>

        <section id="intro" className="section">
          <article className="subsection">
            <InlinePhrase label="Hello" colorIndex={4}>
              My name is {cv.name.split(/\s+/)[0] || cv.name}.
            </InlinePhrase>
            <InlinePhrase label="Currently" colorIndex={3}>
              {currentLine || cv.about}
            </InlinePhrase>
            <InlinePhrase label="About me" colorIndex={1}>
              {cv.about}
            </InlinePhrase>
            {firstProject && (
              <InlinePhrase label="Recently" colorIndex={2}>
                I worked on <ExternalLink href={getEntryUrl(firstProject)}>{getEntryTitle(firstProject)}</ExternalLink>
                {getEntrySummary(firstProject) ? `, ${getEntrySummary(firstProject)}` : '.'}
              </InlinePhrase>
            )}
            {secondaryProject && (
              <InlinePhrase label="Also" colorIndex={0}>
                I built <ExternalLink href={getEntryUrl(secondaryProject)}>{getEntryTitle(secondaryProject)}</ExternalLink>
                {getEntrySummary(secondaryProject) ? `, ${getEntrySummary(secondaryProject)}` : '.'}
              </InlinePhrase>
            )}
          </article>
        </section>

        {projectItems.length > 0 && (
          <Section id="projects" title="Projects">
            <EntryList>
              {projectItems.map((project, index) => (
                <li key={`${getEntryTitle(project)}-${index}`}>
                  <EntryKicker>{getYear(project.date || project.start_date)}</EntryKicker>
                  <ExternalLink href={getEntryUrl(project)}>{getEntryTitle(project)}</ExternalLink>
                  {getEntrySummary(project) && <span> {getEntrySummary(project)}</span>}
                </li>
              ))}
            </EntryList>
          </Section>
        )}

        {experienceItems.length > 0 && (
          <Section id="experience" title="Experience">
            <EntryList>
              {experienceItems.map((item, index) => (
                <li key={`${item.company}-${item.title}-${index}`}>
                  <EntryKicker>{formatDateRange(item.startDate, item.endDate)}</EntryKicker>
                  <strong>{item.company}</strong>
                  {item.title && <span> {item.title}</span>}
                  {Array.isArray(item.highlights) && item.highlights[0] && <SmallText>{item.highlights[0]}</SmallText>}
                </li>
              ))}
            </EntryList>
          </Section>
        )}

        {educationItems.length > 0 && (
          <Section id="education" title="Education">
            <EntryList>
              {educationItems.map((item, index) => (
                <li key={`${getEntryTitle(item)}-${index}`}>
                  <EntryKicker>{formatDateRange(item.start_date, item.end_date)}</EntryKicker>
                  <strong>{item.institution || item.school || item.name}</strong>
                  {(item.degree || item.area || item.study_type) && (
                    <span> {item.degree || item.study_type}{item.area ? `, ${item.area}` : ''}</span>
                  )}
                </li>
              ))}
            </EntryList>
          </Section>
        )}

        {skills.length > 0 && (
          <Section id="skills" title="Skills">
            <EntryList>
              {skills.map((skill, index) => {
                if (typeof skill === 'string') return <li key={`${skill}-${index}`}>{skill}</li>;
                const keywords = Array.isArray(skill.keywords) ? skill.keywords.join(', ') : skill.keywords;
                return (
                  <li key={`${skill.name || skill.category}-${index}`}>
                    <strong>{skill.name || skill.category || skill.label}</strong>
                    {keywords && <span> {keywords}</span>}
                  </li>
                );
              })}
            </EntryList>
          </Section>
        )}

        {moreItems.length > 0 && (
          <Section id="more" title="More">
            <EntryList>
              {moreItems.map((item, index) => (
                <li key={`${getEntryTitle(item)}-${index}`}>
                  <EntryKicker>{getYear(item.date || item.start_date || item.end_date)}</EntryKicker>
                  <ExternalLink href={getEntryUrl(item)}>{getEntryTitle(item)}</ExternalLink>
                  {getEntrySummary(item) && <span> {getEntrySummary(item)}</span>}
                </li>
              ))}
            </EntryList>
          </Section>
        )}

        <footer className="section">
          <article className="subsection">
            <div className="pad">
              <p>
                <span className="small">Typeset with a Work Sans-style grotesk.</span>{' '}
                <span className="small serif fullblue">Serif phrases inspired by Sebastian Berns.</span>
              </p>
            </div>
          </article>
        </footer>
      </Main>
    </ThemeRoot>
  );
}

const SebastianGlobalStyle = createGlobalStyle`
  body {
    background: #eeede9;
  }
`;

const ThemeRoot = styled.div`
  min-height: 100vh;
  background: #eeede9;
  color: #111;
  font-family: "Work Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(18px, 1.7vw, 23px);
  line-height: 1.4;
  text-rendering: optimizeLegibility;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  h1,
  h2,
  h3,
  p,
  ol,
  ul,
  li {
    margin: 0;
  }

  h1,
  h2,
  h3 {
    font-size: 1em;
    font-weight: 400;
  }

  p {
    margin-bottom: 0.8em;
  }

  a {
    color: inherit;
    text-decoration: none;
    padding-bottom: 0.1em;
    padding-top: 0.1em;
    border-bottom: 1px solid currentColor;
  }

  a:hover,
  a:focus {
    background-color: #fff;
  }

  a:focus {
    outline: 0;
    border: 1px solid currentColor;
    margin-left: -1px;
    margin-right: -1px;
  }

  strong {
    font-weight: 500;
  }

  .intro-p {
    display: inline;
    vertical-align: middle;
  }

  .intro-p-space-after {
    margin-right: 0.5em;
  }

  .small {
    font-size: 0.6em;
    line-height: 1.83;
  }

  .large {
    font-size: 2.1em;
    line-height: 1.3;
  }

  .serif {
    font-family: "Newsreader Display", "Iowan Old Style", "Cormorant Garamond", Garamond, "Times New Roman", Times, serif;
  }

  .blue { color: #44f; }
  .green { color: #1cd961; }
  .red { color: #ff665e; }
  .ibm2 { color: #785ef0; }
  .ibm4 { color: #fe6100; }
  .ibm5 { color: #f5a900; }
  .fullblue { color: #2020bc; }

  .section {
    padding-top: 4em;
  }

  .subsection {
    margin-bottom: 3.2em;
  }

  .col {
    padding-left: 0.8em;
    padding-right: 0.8em;
  }

  .col-l {
    margin-bottom: 0.8em;
  }

  @media (min-width: 440px) {
    .large {
      font-size: 2.4em;
    }
  }

  @media (min-width: 560px) {
    .large {
      font-size: 2.7em;
    }

    .section {
      padding-top: 5.6em;
    }

    .cols {
      display: table;
      width: 100%;
    }

    .pad,
    .col-l {
      padding-left: 1.6em;
    }

    .pad,
    .col-r {
      padding-right: 1.6em;
    }

    .col {
      display: table-cell;
      padding-right: 1.6em;
      vertical-align: top;
    }

    .col-l {
      width: 40%;
    }

    .col-r {
      width: 60%;
    }
  }

  @media (min-width: 640px) {
    .large {
      font-size: 3em;
    }
  }

  @media (min-width: 880px) {
    .pad,
    .col-l {
      padding-left: 10%;
    }

    .pad,
    .col-r {
      padding-right: 10%;
    }
  }

  @media (max-width: 559px) {
    .section {
      padding-top: 3em;
    }

    .large {
      font-size: 1.8em;
    }
  }
`;

const Main = styled.main`
  margin: 0 0.8em 3.2em;

  @media (min-width: 560px) {
    margin-left: 1.6em;
    margin-right: 1.6em;
    margin-bottom: 6.4em;
  }

  @media (min-width: 640px) {
    margin-left: 3.2em;
    margin-right: 3.2em;
  }

  @media (min-width: 1544px) {
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const EmailLink = styled.a`
  overflow-wrap: anywhere;
`;

const NavList = styled.ol`
  list-style: lower-latin;
  padding-left: 1.2em;
  line-height: 1.6;
  margin-bottom: 1em;
`;

const LinkList = styled.ul`
  list-style: none;
  padding-left: 0;
  line-height: 1.6;
`;

const EntryList = styled.ul`
  list-style: none;
  padding-left: 0;

  li {
    margin-bottom: 1.35em;
  }
`;

const EntryKicker = styled.span`
  display: block;
  color: #2020bc;
  font-family: "Newsreader Display", "Iowan Old Style", Garamond, "Times New Roman", Times, serif;
  font-size: 1.35em;
  line-height: 1.15;
`;

const SmallText = styled.span`
  display: block;
  font-size: 0.72em;
  line-height: 1.55;
  max-width: 68ch;
  margin-top: 0.35em;
`;
