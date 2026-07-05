import React, { useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { pickSocialUrl } from '../../utils/cvHelpers';

/**
 * CpDominaTheme — a faithful, CV-driven remake of www.cpdomina.net (Pedro Oliveira).
 *
 * The source is an ultra-minimal page built on the milligram CSS framework:
 * a white ground, light-weight Roboto (300) type in milligram's signature
 * grey (#606c76), a quiet "Hi" heading, and a single flowing paragraph that
 * folds inline purple (#9b4dca) links (email, GitHub, LinkedIn, CV,
 * publications) straight into the sentence. We rebuild that voice entirely
 * from CV.yaml — the greeting, links, and an optional publications block are
 * synthesized from the normalized CV rather than hardcoding Pedro's copy.
 */

const PUB_ANCHOR = 'cpdomina-publications';

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

export function CpDominaTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'me';
  const website = cv.website || null;
  const email = cv.email || null;
  const socials = cv.social || [];

  const publications = Array.isArray(cv.publications) ? cv.publications : [];

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

  const handlePubJump = (e) => {
    const el = document.getElementById(PUB_ANCHOR);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
  if (publications.length > 0) {
    actions.push(
      <React.Fragment>
        check out my{' '}
        <a href={`#${PUB_ANCHOR}`} onClick={handlePubJump}>
          publications
        </a>
      </React.Fragment>,
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
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

        <Column>
          <section>
            <Greeting>Hi</Greeting>
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

          {publications.length > 0 && (
            <Publications id={PUB_ANCHOR}>
              <PubLabel>Publications</PubLabel>
              {publications.map((pub, idx) => {
                const title = pub.title || pub.name || 'Untitled';
                const href = pub.doi
                  ? `https://doi.org/${pub.doi}`
                  : pub.url || null;
                const authors = Array.isArray(pub.authors) ? pub.authors : [];
                const meta = [pub.journal, pub.date].filter(Boolean).join(', ');
                return (
                  <Pub key={`pub-${idx}`}>
                    <PubTitle>
                      {href ? (
                        <a href={href} {...linkProps(href)}>
                          {title}
                        </a>
                      ) : (
                        title
                      )}
                    </PubTitle>
                    {(authors.length > 0 || meta) && (
                      <PubMeta>
                        {authors.map((a, i) => (
                          <React.Fragment key={`${a}-${i}`}>
                            {i > 0 ? ', ' : ''}
                            {a === name ? <strong>{a}</strong> : a}
                          </React.Fragment>
                        ))}
                        {authors.length > 0 && meta ? '. ' : ''}
                        {meta}
                        {meta || authors.length ? '.' : ''}
                      </PubMeta>
                    )}
                  </Pub>
                );
              })}
            </Publications>
          )}
        </Column>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  position: relative;
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-weight: 300;
  padding: clamp(2.75rem, 10vh, 6.5rem) clamp(1.25rem, 5vw, 3.5rem) 4rem;
  transition: background-color 0.25s ease, color 0.25s ease;
`;

const Column = styled.div`
  width: 100%;
  max-width: 46rem;
`;

const Greeting = styled.h1`
  margin: 0 0 1.6rem;
  font-weight: 300;
  font-size: clamp(2rem, 6vw, 2.8rem);
  line-height: 1.2;
  letter-spacing: -0.05rem;
  color: ${(props) => props.theme.text};
`;

const Prose = styled.p`
  margin: 0;
  font-size: clamp(1rem, 2.6vw, 1.05rem);
  line-height: 1.6;

  strong {
    font-weight: 700;
    color: ${(props) => props.theme.strong};
  }

  a {
    color: ${(props) => props.theme.link};
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color 0.15s ease;
  }

  a:hover,
  a:focus-visible {
    color: ${(props) => props.theme.linkHover};
  }
`;

const Publications = styled.section`
  margin-top: clamp(2.75rem, 8vh, 4.5rem);
  padding-top: 1.75rem;
  border-top: 1px solid ${(props) => props.theme.rule};
`;

const PubLabel = styled.h2`
  margin: 0 0 1.1rem;
  font-size: 1rem;
  font-weight: 400;
  font-style: italic;
  color: ${(props) => props.theme.muted};
`;

const Pub = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PubTitle = styled.div`
  font-size: 1.05rem;
  line-height: 1.5;

  a {
    color: ${(props) => props.theme.link};
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color 0.15s ease;
  }

  a:hover,
  a:focus-visible {
    color: ${(props) => props.theme.linkHover};
  }
`;

const PubMeta = styled.div`
  margin-top: 0.2rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: ${(props) => props.theme.muted};

  strong {
    font-weight: 700;
    color: ${(props) => props.theme.text};
  }
`;

const Toggle = styled.button`
  position: absolute;
  top: clamp(1rem, 4vw, 1.75rem);
  right: clamp(1rem, 4vw, 2rem);
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
