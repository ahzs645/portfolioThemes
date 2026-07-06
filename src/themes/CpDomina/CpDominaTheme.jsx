import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { pickSocialUrl, formatRange, formatDate } from '../../utils/cvHelpers';

/**
 * CpDominaTheme — a faithful, CV-driven remake of www.cpdomina.net (Pedro Oliveira).
 *
 * The source is an ultra-minimal two-page site built on the milligram CSS
 * framework: a white ground, light-weight Roboto (300) type in milligram's
 * signature grey (#606c76), a centered 800px column, quiet 46px h1s, and
 * inline purple (#9b4dca) links with no underline. The homepage is a single
 * "Hi" paragraph; a separate /publications sub page stacks h1 sections
 * (Publications, Patents, Selected Content) of plain paragraphs with bold
 * quoted titles and bold [pdf] links.
 *
 * We rebuild both pages entirely from CV.yaml: the publications sub page
 * maps to Publications / Presentations / Selected Projects, and a second
 * "resume" sub page carries the remaining CV sections (experience,
 * volunteering, education, professional development, certifications &
 * skills, awards) in the same milligram voice.
 */

// milligram's default palette: primary purple links on grey body text.
const lightTheme = {
  bg: '#ffffff',
  text: '#606c76',
  strong: '#3a4149',
  link: '#9b4dca',
  linkHover: '#606c76',
  muted: '#8b96a0',
  rule: 'rgba(0, 0, 0, 0.1)',
};

const darkTheme = {
  bg: '#12131a',
  text: '#b7bfc9',
  strong: '#e9edf2',
  link: '#c99be8',
  linkHover: '#e7d3f7',
  muted: '#7f8894',
  rule: 'rgba(255, 255, 255, 0.12)',
};

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.bg}; }
`;

// Extra attributes only for external http(s) links; mailto and in-page
// anchors stay plain.
function linkProps(href = '') {
  return /^https?:/i.test(href)
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};
}

function aOrAn(word = '') {
  return /^[aeiou]/i.test(String(word).trim()) ? 'an' : 'a';
}

// Describe a degree as a research role for the greeting sentence.
function degreeWord(degree = '') {
  const d = String(degree);
  if (/ph\.?\s?d|d\.?phil|doctor/i.test(d)) return 'doctoral researcher';
  if (/m\.?\s?sc|m\.?\s?a\b|m\.?eng|master/i.test(d)) return 'graduate researcher';
  return 'researcher';
}

// Prefer the highest-level graduate entry so the intro leads with the PhD.
function pickGradEducation(education = []) {
  return (
    education.find((e) => /ph\.?\s?d|d\.?phil|doctor/i.test(String(e?.degree))) ||
    education.find((e) => /m\.?\s?sc|m\.?\s?a\b|m\.?eng|master/i.test(String(e?.degree))) ||
    education[0] ||
    null
  );
}

// Surface a "Focus on ..." education highlight as a research-focus sentence.
function findFocus(education = []) {
  for (const entry of education) {
    for (const h of entry?.highlights || []) {
      const m = String(h).match(/^focus(?:ed|es|ing)?\s+on\s+(.+)$/i);
      if (m) return m[1].replace(/\.\s*$/, '').trim();
    }
  }
  return null;
}

// Build the prose that follows "I'm <name>" — role + field + place, with a
// graceful generic fallback when the CV lacks a job title and education.
function buildDescriptor(cv) {
  const role = cv.currentJobTitle || null;
  const grad = pickGradEducation(cv.education || []);
  const gradPhrase = grad
    ? [
        degreeWord(grad.degree),
        grad.area ? `in ${grad.area}` : '',
        grad.institution ? `at ${grad.institution}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  if (role && gradPhrase) return `${aOrAn(role)} ${role} and ${gradPhrase}`;
  if (role) return `${aOrAn(role)} ${role}`;
  if (gradPhrase) return `${aOrAn(gradPhrase)} ${gradPhrase}`;
  return 'a researcher and lifelong learner';
}

// Join a list of JSX fragments with commas and a trailing "and".
function joinNodes(nodes) {
  return nodes.map((node, i) => {
    let sep = '';
    if (i > 0) {
      if (i === nodes.length - 1) sep = nodes.length > 2 ? ', and ' : ' and ';
      else sep = ', ';
    }
    return (
      <React.Fragment key={i}>
        {sep}
        {node}
      </React.Fragment>
    );
  });
}

// The source joins author lists as "A, B, C, and D" (plain comma pair for
// two authors), with no emphasis on the site owner's own name.
function joinAuthors(authors = []) {
  if (authors.length <= 1) return authors.join('');
  if (authors.length === 2) return authors.join(', ');
  return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
}

export function CpDominaTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;
  const [page, setPage] = useState('home');
  const topRef = useRef(null);

  const name = cv.name || 'me';
  const website = cv.website || null;
  const email = cv.email || null;
  const socials = cv.social || [];

  const publications = Array.isArray(cv.publications) ? cv.publications : [];
  const presentations = Array.isArray(cv.presentations) ? cv.presentations : [];
  const projects = Array.isArray(cv.projects) ? cv.projects : [];
  const experience = Array.isArray(cv.experience) ? cv.experience : [];
  const volunteer = Array.isArray(cv.volunteer) ? cv.volunteer : [];
  const education = Array.isArray(cv.education) ? cv.education : [];
  const professionalDevelopment = Array.isArray(cv.professionalDevelopment)
    ? cv.professionalDevelopment
    : [];
  const certificationsSkills = Array.isArray(cv.certificationsSkills)
    ? cv.certificationsSkills
    : [];
  const awards = Array.isArray(cv.awards) ? cv.awards : [];

  const hasPublicationsPage =
    publications.length > 0 || presentations.length > 0 || projects.length > 0;
  const hasResumePage =
    experience.length > 0 ||
    volunteer.length > 0 ||
    education.length > 0 ||
    professionalDevelopment.length > 0 ||
    certificationsSkills.length > 0 ||
    awards.length > 0;

  const { descriptor, locationClause, focus } = useMemo(() => {
    return {
      descriptor: buildDescriptor(cv),
      locationClause: cv.location ? `, based in ${cv.location}` : '',
      focus: findFocus(cv.education || []),
    };
  }, [cv]);

  // Inline contact links in the source's order (email, GitHub, LinkedIn),
  // then any remaining profiles present in the CV.
  const contactLinks = useMemo(() => {
    const links = [];
    if (email) links.push({ label: 'email', href: `mailto:${email}` });
    const github = pickSocialUrl(socials, ['github']);
    const linkedin = pickSocialUrl(socials, ['linkedin']);
    const facebook = pickSocialUrl(socials, ['facebook']);
    const instagram = pickSocialUrl(socials, ['instagram']);
    if (github) links.push({ label: 'GitHub', href: github });
    if (linkedin) links.push({ label: 'LinkedIn', href: linkedin });
    if (facebook) links.push({ label: 'Facebook', href: facebook });
    if (instagram) links.push({ label: 'Instagram', href: instagram });
    return links;
  }, [email, socials]);

  // Sub pages are internal state (app routing owns the URL); mimic the
  // source's real page navigation by starting each page at the top.
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
    window.scrollTo(0, 0);
  }, [page]);

  const goTo = (target) => (e) => {
    e.preventDefault();
    setPage(target);
  };

  // The second sentence: "Here you can <actions>." Each action is optional so
  // the grammar (commas + trailing "and") always stays correct.
  const actions = [];
  if (contactLinks.length > 0) {
    actions.push(
      <React.Fragment>
        get my{' '}
        {joinNodes(
          contactLinks.map((l) => (
            <a key={l.href} href={l.href} {...linkProps(l.href)}>
              {l.label}
            </a>
          )),
        )}
      </React.Fragment>,
    );
  }
  if (website) {
    actions.push(
      <React.Fragment>
        download my{' '}
        <a href={website} {...linkProps(website)}>
          CV
        </a>
      </React.Fragment>,
    );
  }
  if (hasResumePage) {
    actions.push(
      <React.Fragment>
        browse my full{' '}
        <a href="#resume" onClick={goTo('resume')}>
          resume
        </a>
      </React.Fragment>,
    );
  }
  if (hasPublicationsPage) {
    actions.push(
      <React.Fragment>
        check out my{' '}
        <a href="#publications" onClick={goTo('publications')}>
          publications
        </a>
      </React.Fragment>,
    );
  }

  // "Name | Page" breadcrumb echoing the source sub page's document title
  // ("Pedro Oliveira | Publications"); the name links back home.
  const crumb = (label) => (
    <Crumb>
      <a href="#home" onClick={goTo('home')}>
        {name}
      </a>{' '}
      | {label}
    </Crumb>
  );

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page ref={topRef}>
        <Toggle
          type="button"
          onClick={() => onDarkModeChange?.(!darkMode)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </Toggle>

        <Container>
          {page === 'home' && (
            <section>
              <Heading>Hi</Heading>
              <Prose>
                I&apos;m <strong>{name}</strong>, {descriptor}
                {locationClause}.{focus ? ` My research focuses on ${focus}.` : ''}
                {actions.length > 0 && (
                  <>
                    <br />
                    Here you can {joinNodes(actions)}.
                  </>
                )}
              </Prose>
            </section>
          )}

          {page === 'publications' && (
            <section>
              {crumb('Publications')}

              {publications.length > 0 && (
                <>
                  <Heading>Publications</Heading>
                  {publications.map((pub, idx) => {
                    const title = pub.title || pub.name || 'Untitled';
                    const href = pub.doi
                      ? `https://doi.org/${pub.doi}`
                      : pub.url || null;
                    const authors = Array.isArray(pub.authors) ? pub.authors : [];
                    const meta = [pub.journal, pub.date].filter(Boolean).join(', ');
                    return (
                      <Prose key={`pub-${idx}`}>
                        {authors.length > 0 && `${joinAuthors(authors)}: `}
                        <strong>&ldquo;{title}&rdquo;</strong>
                        {meta && `, ${meta}`}
                        {href && (
                          <>
                            {' '}
                            <strong>
                              <a href={href} {...linkProps(href)}>
                                [{pub.doi ? 'doi' : 'link'}]
                              </a>
                            </strong>
                          </>
                        )}
                      </Prose>
                    );
                  })}
                </>
              )}

              {presentations.length > 0 && (
                <>
                  <Heading>Presentations</Heading>
                  {presentations.map((pres, idx) => {
                    const meta = [pres.summary, pres.location, pres.date]
                      .filter(Boolean)
                      .join(', ');
                    return (
                      <Prose key={`pres-${idx}`}>
                        <strong>&ldquo;{pres.name || pres.title}&rdquo;</strong>
                        {meta && `, ${meta}`}
                      </Prose>
                    );
                  })}
                </>
              )}

              {projects.length > 0 && (
                <>
                  <Heading>Selected Projects</Heading>
                  <List>
                    {projects.map((proj, idx) => (
                      <li key={`proj-${idx}`}>
                        {proj.url ? (
                          <a href={proj.url} {...linkProps(proj.url)}>
                            {proj.name}
                          </a>
                        ) : (
                          proj.name
                        )}
                        {proj.summary ? ` — ${proj.summary}` : ''}
                        {proj.date ? ` (${proj.date})` : ''}
                      </li>
                    ))}
                  </List>
                </>
              )}
            </section>
          )}

          {page === 'resume' && (
            <section>
              {crumb('Resume')}

              {experience.length > 0 && (
                <>
                  <Heading>Experience</Heading>
                  {experience.map((job, idx) => (
                    <React.Fragment key={`job-${idx}`}>
                      <Entry>
                        <strong>{job.title}</strong>
                        {job.company && `, ${job.company}`}
                        {(job.startDate || job.endDate) &&
                          `, ${formatRange(job.startDate, job.endDate)}`}
                      </Entry>
                      {job.highlights?.length > 0 && (
                        <List>
                          {job.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </List>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}

              {volunteer.length > 0 && (
                <>
                  <Heading>Volunteering</Heading>
                  {volunteer.map((role, idx) => (
                    <React.Fragment key={`vol-${idx}`}>
                      <Entry>
                        <strong>{role.title}</strong>
                        {role.company && `, ${role.company}`}
                        {(role.startDate || role.endDate) &&
                          `, ${formatRange(role.startDate, role.endDate)}`}
                      </Entry>
                      {role.highlights?.length > 0 && (
                        <List>
                          {role.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </List>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}

              {education.length > 0 && (
                <>
                  <Heading>Education</Heading>
                  {education.map((edu, idx) => (
                    <React.Fragment key={`edu-${idx}`}>
                      <Entry>
                        <strong>
                          {[edu.degree, edu.area].filter(Boolean).join(' in ')}
                        </strong>
                        {edu.institution && `, ${edu.institution}`}
                        {(edu.start_date || edu.end_date) &&
                          `, ${formatRange(edu.start_date, edu.end_date, { month: 'none' })}`}
                      </Entry>
                      {edu.highlights?.length > 0 && (
                        <List>
                          {edu.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </List>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}

              {professionalDevelopment.length > 0 && (
                <>
                  <Heading>Professional Development</Heading>
                  {professionalDevelopment.map((course, idx) => (
                    <Entry key={`pd-${idx}`}>
                      <strong>{course.name}</strong>
                      {course.summary && `, ${course.summary}`}
                      {course.date && `, ${formatDate(course.date)}`}
                    </Entry>
                  ))}
                </>
              )}

              {certificationsSkills.length > 0 && (
                <>
                  <Heading>Certifications &amp; Skills</Heading>
                  {certificationsSkills.map((group, idx) => (
                    <Entry key={`cs-${idx}`}>
                      <strong>{group.label}:</strong> {group.details}
                    </Entry>
                  ))}
                </>
              )}

              {awards.length > 0 && (
                <>
                  <Heading>Awards</Heading>
                  {awards.map((award, idx) => (
                    <React.Fragment key={`award-${idx}`}>
                      <Entry>
                        <strong>{award.name}</strong>
                        {award.summary && `, ${award.summary}`}
                        {award.date && `, ${formatDate(award.date)}`}
                      </Entry>
                      {award.highlights?.length > 0 && (
                        <List>
                          {award.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </List>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </section>
          )}
        </Container>
      </Page>
    </ThemeProvider>
  );
}

// milligram: html { font-size: 62.5% } so its rem values halve nicely into
// px — container 80rem→800px, section padding 7.5rem→75px, h1 4.6rem→46px,
// body 1.6em→16px, paragraph margins 2.5rem→25px.
const Page = styled.div`
  position: relative;
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-weight: 300;
  font-size: 16px;
  line-height: 1.6;
  transition: background-color 0.25s ease, color 0.25s ease;

  a {
    color: ${(props) => props.theme.link};
    text-decoration: none;
    transition: color 0.15s ease;
  }

  a:hover,
  a:focus-visible {
    color: ${(props) => props.theme.linkHover};
  }

  strong {
    font-weight: 700;
    color: ${(props) => props.theme.strong};
  }
`;

const Container = styled.main`
  margin: 0 auto;
  max-width: 800px;
  width: 100%;
  box-sizing: border-box;
  padding: 75px 20px;
`;

const Heading = styled.h1`
  margin: 0 0 20px;
  font-weight: 300;
  font-size: clamp(32px, 6vw, 46px);
  line-height: 1.2;
  letter-spacing: -1px;
  color: ${(props) => props.theme.text};

  * + & {
    margin-top: 45px;
  }
`;

const Prose = styled.p`
  margin: 0 0 25px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Entry = styled.p`
  margin: 0 0 15px;
`;

const List = styled.ul`
  list-style: circle inside;
  margin: 0 0 25px;
  padding-left: 0;

  li {
    margin-bottom: 6px;
  }
`;

const Crumb = styled.p`
  margin: 0 0 25px;
  font-size: 14px;
  color: ${(props) => props.theme.muted};
`;

const Toggle = styled.button`
  position: absolute;
  top: clamp(16px, 4vw, 28px);
  right: clamp(16px, 4vw, 32px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: ${(props) => props.theme.muted};
  cursor: pointer;
  opacity: 0.65;
  transition: opacity 0.15s ease, color 0.15s ease;

  &:hover,
  &:focus-visible {
    opacity: 1;
    color: ${(props) => props.theme.text};
    outline: none;
  }
`;
