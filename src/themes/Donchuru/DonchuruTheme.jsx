import React, { useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { pickSocialUrl } from '../../utils/cvHelpers';

/**
 * DonchuruTheme — a faithful CV-driven remake of donchuru.github.io.
 *
 * David Onchuru's site is a single, quiet paragraph of prose: an Inter
 * "hi, i'm <name>" greeting on a near-white slate ground, followed by a few
 * muted blurbs that fold the bio, work, writing, and contact into plain
 * sentences with understated underlined links, and a closing "Links:" row.
 * We rebuild that voice from CV.yaml rather than hardcoding David's copy.
 */

const lightTheme = {
  background: '#f9fafb',
  greeting: '#374151',
  greetingHover: '#111827',
  blurb: '#6b7280',
  blurbHover: '#374151',
};

const darkTheme = {
  background: '#0f1115',
  greeting: '#e5e7eb',
  greetingHover: '#ffffff',
  blurb: '#9aa2ad',
  blurbHover: '#e5e7eb',
};

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.background}; }
`;

// "you@example.com" -> "you [at] example [dot] com", matching the source's
// gentle spam-avoidance flourish.
function obfuscateEmail(email = '') {
  return email.replace('@', ' [at] ').replace(/\.([^.]*)$/, ' [dot] $1');
}

function firstSentences(about = '', max = 2) {
  const text = String(about).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const parts = text.match(/[^.!?]+[.!?]+/g);
  if (!parts) return text;
  return parts.slice(0, max).join(' ').trim();
}

export function DonchuruTheme({ darkMode = false }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const firstName = name.split(/\s+/)[0] || name;
  const email = cv.email || null;

  const socials = cv.social || [];
  const linkedin = pickSocialUrl(socials, ['linkedin']);
  const github = pickSocialUrl(socials, ['github']);
  const website = cv.website || null;
  const nameHref = linkedin || website || github || null;

  const current = cv.experience?.find((e) => e.isCurrent) || cv.experience?.[0] || null;
  const blurbLead = firstSentences(cv.about, 2);

  // A "Links:" row from any remaining social profiles (skip the one already
  // used for the name link so it isn't duplicated).
  const linkRow = useMemo(() => {
    const used = new Set([nameHref].filter(Boolean));
    return socials
      .filter((s) => s.url && !used.has(s.url))
      .map((s) => ({ label: String(s.network || '').toLowerCase(), url: s.url }));
  }, [socials, nameHref]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Main>
          <Greeting>
            hi, i&apos;m{' '}
            {nameHref ? (
              <a href={nameHref} target="_blank" rel="noopener noreferrer">
                {firstName}
              </a>
            ) : (
              <strong>{firstName}</strong>
            )}
          </Greeting>

          {current && (
            <Blurb>
              I currently work as {current.title}
              {current.company ? (
                <>
                  {' '}at <strong>{current.company}</strong>
                </>
              ) : null}
              {cv.location ? `, based in ${cv.location}` : ''}.{' '}
              {blurbLead}
            </Blurb>
          )}

          {!current && blurbLead && <Blurb>{blurbLead}</Blurb>}

          {website && (
            <Blurb>
              You can read more about my work{' '}
              <a href={website} target="_blank" rel="noopener noreferrer">
                here
              </a>
              .
            </Blurb>
          )}

          {email && (
            <Blurb>
              If you&apos;d like to connect, ping me at{' '}
              <a href={`mailto:${email}`}>{obfuscateEmail(email)}</a> :)
            </Blurb>
          )}

          {linkRow.length > 0 && (
            <Blurb>
              Links:{' '}
              {linkRow.map((link, i) => (
                <React.Fragment key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                  {i < linkRow.length - 1 ? ', ' : '.'}
                </React.Fragment>
              ))}
            </Blurb>
          )}
        </Main>
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.background};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(2.5rem, 18vh, 12rem) 1rem 4rem;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Main = styled.main`
  padding: 2.5rem;
  width: 100%;
  max-width: 40rem;

  @media (max-width: 480px) {
    padding: 0;
  }
`;

const Greeting = styled.div`
  font-size: 1.25rem;
  line-height: 1.5;
  color: ${(props) => props.theme.greeting};

  a,
  strong {
    font-weight: 500;
    text-decoration: underline;
    color: inherit;
  }

  a:hover {
    color: ${(props) => props.theme.greetingHover};
  }
`;

const Blurb = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  color: ${(props) => props.theme.blurb};

  a {
    color: inherit;
    text-decoration: underline;
  }

  a:hover {
    color: ${(props) => props.theme.blurbHover};
  }

  strong {
    font-weight: 500;
    color: inherit;
  }
`;
