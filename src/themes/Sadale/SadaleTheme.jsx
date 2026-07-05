import React, { useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import {
  pickSocialUrl,
  formatRange,
  formatDate,
  filterActive,
} from '../../utils/cvHelpers';

/**
 * SadaleTheme — a CV-driven remake of sadale.net's gleeful early-web homepage.
 *
 * The source is a warm cream→yellow page with a big bubbly orange "WordArt"
 * greeting, plain bulleted sections ("About this website:", "What I do:",
 * "What I avoid:", "Tidbits:"), quiet lists further down, and a row of retro
 * 88x31 badges at the very bottom. We rebuild that voice from CV.yaml — every
 * fact (name, handle, day job, languages, projects, awards) comes from useCV(),
 * and the playful lines are synthesized from the role/field since cv.about is
 * empty. The signature heading uses 'Rammetto One' with a layered orange
 * text-shadow "extrusion" plus a gentle per-letter bob.
 */

const lightTheme = {
  gradTop: '#fffdf2',
  gradBottom: '#ffe680',
  text: '#3a3320',
  label: '#4a3d16',
  faint: '#7a6c40',
  link: '#554f33',
  linkHover: '#7f774c',
  rule: '#d9c884',
  panelBg: 'rgba(255, 255, 255, 0.45)',
  panelBorder: '#e2d193',
  btnBg: '#fff6cf',
  btnBorderLight: '#ffffff',
  btnBorderDarkReal: '#c9b56a',
};

const darkTheme = {
  gradTop: '#2b2013',
  gradBottom: '#120c05',
  text: '#efe3c2',
  label: '#ffd98a',
  faint: '#c7b483',
  link: '#e9c987',
  linkHover: '#ffe9b0',
  rule: '#5a4a22',
  panelBg: 'rgba(255, 236, 179, 0.05)',
  panelBorder: '#5a4a22',
  btnBg: '#3a2c17',
  btnBorderLight: '#6a5327',
  btnBorderDarkReal: '#140d04',
};

const HEADING_TEXT = 'WELCOME TO MY WEBSITE!';

// Retro 88x31 button badges, synthesized in CSS (no external GIFs).
function buildBadges({ github, alias }) {
  return [
    { top: 'made', bottom: 'with <3', bg: '#c0392b', fg: '#ffffff' },
    { top: 'best viewed', bottom: 'with a browser', bg: '#2d6cdf', fg: '#ffffff' },
    { top: 'built on', bottom: 'GNU/Linux', bg: '#101010', fg: '#f5c518' },
    { top: 'GitHub', bottom: `@${alias}`, bg: '#000000', fg: '#ffffff', href: github },
    { top: 'powered by', bottom: 'CV.yaml', bg: '#2e8b57', fg: '#ffffff' },
    { top: 'valid', bottom: 'RETRO!', bg: '#8e44ad', fg: '#ffffff' },
    { top: 'Y2K', bottom: 'survivor', bg: '#16a085', fg: '#ffffff' },
    { top: 'this site is', bottom: 'AQI approved', bg: '#e67e22', fg: '#201000' },
  ];
}

export function SadaleTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const [clicked, setClicked] = useState(false);

  const name = cv.name || 'Your Name';
  const firstName = name.split(/\s+/)[0] || name;
  const location = cv.location || null;
  const email = cv.email || null;
  const website = cv.website || null;

  const socials = cv.social || [];
  const github = pickSocialUrl(socials, ['github']);
  const linkedin = pickSocialUrl(socials, ['linkedin']);
  const facebook = pickSocialUrl(socials, ['facebook']);
  const instagram = pickSocialUrl(socials, ['instagram']);
  const githubEntry = socials.find((s) => String(s.network || '').toLowerCase() === 'github');
  const alias = githubEntry?.username || firstName.toLowerCase();

  // Section anchors — scroll via refs so nav works inside preview shadow DOM
  // without touching the app router's URL hash.
  const aboutRef = useRef(null);
  const projectsRef = useRef(null);
  const experienceRef = useRef(null);
  const awardsRef = useRef(null);
  const scrollTo = (ref) => (e) => {
    e.preventDefault();
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Certifications / Skills come as semicolon lists under labelled entries.
  const certSkills = cv.certificationsSkills || [];
  const skillList = useMemo(() => {
    const entry = certSkills.find((c) => /skill/i.test(c?.label || ''));
    return (entry?.details || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [certSkills]);
  const certList = useMemo(() => {
    const entry = certSkills.find((c) => /certification/i.test(c?.label || ''));
    return (entry?.details || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [certSkills]);

  const languages = useMemo(() => {
    const extra = skillList
      .filter((s) => /fluent in/i.test(s))
      .map((s) => s.replace(/fluent in/i, '').trim())
      .filter(Boolean);
    return Array.from(new Set(['English', ...extra]));
  }, [skillList]);

  const toolbox = useMemo(
    () => skillList.filter((s) => !/fluent in/i.test(s)).slice(0, 6),
    [skillList],
  );

  const experienceItems = useMemo(() => (cv.experience || []).slice(0, 6), [cv]);
  const currentJob = useMemo(
    () => (cv.experience || []).find((e) => e.isCurrent) || (cv.experience || [])[0] || null,
    [cv],
  );
  const projects = useMemo(() => filterActive(cv.projects || []), [cv]);
  const education = useMemo(() => filterActive(cv.education || []), [cv]);
  const currentEdu = useMemo(
    () => education.find((e) => String(e.end_date || '').match(/present/i) || Number(String(e.end_date).slice(0, 4)) >= new Date().getFullYear()) || education[0] || null,
    [education],
  );
  const awards = useMemo(() => filterActive(cv.awards || []).slice(0, 6), [cv]);

  const badges = useMemo(() => buildBadges({ github, alias }), [github, alias]);

  // Synthesized playful copy (cv.about is empty by design).
  const whatIDo = [
    'Chase black carbon, road dust, and particulate matter around northern BC 🌫️',
    'Turn messy aethalometer & air-quality data into charts a human can read 📊',
    'Build silly-useful desktop apps and web tools (scroll down to Projects) 🛠️',
    currentEdu
      ? `Quietly grind a ${currentEdu.degree || 'graduate'} in environmental health at ${currentEdu.institution || 'university'} 🎓`
      : 'Quietly grind a research degree when nobody is looking 🎓',
    'Mentor students, edit a student newspaper, and volunteer around town 🤝',
  ];
  const whatIAvoid = [
    'Judging you for breathing on a high-dust day (the AQI already does that) 😷',
    "Trusting any calibration I didn't run myself",
    'Deploying to production on a Friday afternoon',
    'Meetings that could very comfortably have been an email',
  ];

  return (
    <ThemeProvider theme={theme}>
      <Page>
        <Sheet>
          <TopRow>
            <TitleWrap>
              <SiteTitle
                href={website || '#'}
                target={website ? '_blank' : undefined}
                rel={website ? 'noopener noreferrer' : undefined}
                onClick={website ? undefined : (e) => e.preventDefault()}
              >
                <span aria-hidden="true">🌫️</span> {name} <Alias>({alias})</Alias>
              </SiteTitle>
              <Nav>
                <NavLink href="#about" onClick={scrollTo(aboutRef)}>ABOUT</NavLink>
                <Sep>|</Sep>
                <NavLink href="#projects" onClick={scrollTo(projectsRef)}>PROJECTS</NavLink>
                <Sep>|</Sep>
                <NavLink href="#experience" onClick={scrollTo(experienceRef)}>EXPERIENCE</NavLink>
                <Sep>|</Sep>
                <NavLink href="#awards" onClick={scrollTo(awardsRef)}>AWARDS</NavLink>
              </Nav>
            </TitleWrap>

            <Corner>
              <LangSwitch aria-label="Language switcher (decorative)">
                Language:{' '}
                <LangActive>EN</LangActive>
                {languages.slice(1).map((lang) => (
                  <React.Fragment key={lang}>
                    {' | '}
                    <LangOption>{lang.slice(0, 2).toUpperCase()}</LangOption>
                  </React.Fragment>
                ))}
              </LangSwitch>
              <RetroButton
                type="button"
                onClick={() => onDarkModeChange?.(!darkMode)}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? '☀ light' : '☾ dark'}
              </RetroButton>
            </Corner>
          </TopRow>

          <WordArt>
            <SrOnly>{HEADING_TEXT}</SrOnly>
            <WordArtInk aria-hidden="true">{renderWordArt(HEADING_TEXT)}</WordArtInk>
          </WordArt>

          <Section ref={aboutRef} id="about">
            <Label>About this website:</Label>
            <UL>
              <li>
                This is the personal corner of <strong>{name}</strong> — an air-quality &amp;
                environmental-health researcher hiding out in {location || 'the north'}. It&apos;s
                where I keep the fun stuff I build when I&apos;m not chasing particulate matter
                around British Columbia. Part lab notebook, part playground, entirely under
                construction. 🚧
              </li>
            </UL>
          </Section>

          <Section>
            <Label>What I do:</Label>
            <UL>
              {whatIDo.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
              <li>
                Shitpost responsibly across the information superhighway.
                <BounceBox>
                  <ClickMe
                    type="button"
                    onClick={() => setClicked((v) => !v)}
                    aria-pressed={clicked}
                  >
                    😀 click me 😀
                  </ClickMe>
                </BounceBox>
                {clicked && (
                  <Whisper>you clicked it. incredible. 10/10 — would click again.</Whisper>
                )}
              </li>
            </UL>
          </Section>

          <Section>
            <Label>What I avoid:</Label>
            <UL>
              {whatIAvoid.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </UL>
          </Section>

          <Section>
            <Label>Tidbits:</Label>
            <UL>
              <li>
                <Key>Real Name:</Key> {name}
              </li>
              <li>
                <Key>Handle:</Key> {alias} (yes, everywhere)
              </li>
              {currentJob && (
                <li>
                  <Key>Day job:</Key> {currentJob.title}
                  {currentJob.company ? ` @ ${currentJob.company}` : ''}
                </li>
              )}
              {currentEdu && (
                <li>
                  <Key>Currently:</Key> {currentEdu.degree}
                  {currentEdu.area ? ` in ${currentEdu.area}` : ''}
                  {currentEdu.institution ? `, ${currentEdu.institution}` : ''}
                </li>
              )}
              {location && (
                <li>
                  <Key>Home base:</Key> {location}
                </li>
              )}
              {languages.length > 0 && (
                <li>
                  <Key>Languages:</Key> {languages.join(', ')}
                </li>
              )}
              {toolbox.length > 0 && (
                <li>
                  <Key>Toolbox:</Key> {toolbox.join(' · ')}
                </li>
              )}
              {certList.length > 0 && (
                <li>
                  <Key>Certified in:</Key> {certList.join(', ')}
                </li>
              )}
            </UL>
          </Section>

          {projects.length > 0 && (
            <Section ref={projectsRef} id="projects">
              <Label>Projects:</Label>
              <UL>
                {projects.map((p, i) => (
                  <li key={i}>
                    {p.url ? (
                      <Link href={p.url} target="_blank" rel="noopener noreferrer">
                        {p.name}
                      </Link>
                    ) : (
                      <strong>{p.name}</strong>
                    )}
                    {p.summary ? <SubUL><li>{p.summary}</li></SubUL> : null}
                  </li>
                ))}
              </UL>
            </Section>
          )}

          {experienceItems.length > 0 && (
            <Section ref={experienceRef} id="experience">
              <Label>What I&apos;ve been up to (Experience):</Label>
              <UL>
                {experienceItems.map((exp, i) => (
                  <li key={i}>
                    <strong>{exp.title}</strong>
                    {exp.company ? ` — ${exp.company}` : ''}
                    <Faint>
                      {' '}
                      ({formatRange(exp.startDate, exp.endDate, { month: 'short' }) || '—'})
                    </Faint>
                  </li>
                ))}
              </UL>
            </Section>
          )}

          {education.length > 0 && (
            <Section>
              <Label>Schooling:</Label>
              <UL>
                {education.map((edu, i) => (
                  <li key={i}>
                    <strong>{edu.degree}</strong>
                    {edu.area ? `, ${edu.area}` : ''}
                    {edu.institution ? ` — ${edu.institution}` : ''}
                    <Faint>
                      {' '}
                      ({formatRange(edu.start_date, edu.end_date, { month: 'none' }) || '—'})
                    </Faint>
                  </li>
                ))}
              </UL>
            </Section>
          )}

          {awards.length > 0 && (
            <Section ref={awardsRef} id="awards">
              <Label>Shiny things (Awards):</Label>
              <UL>
                {awards.map((a, i) => (
                  <li key={i}>
                    <strong>{a.name}</strong>
                    {a.date ? (
                      <Faint> ({formatDate(a.date, { month: 'none' })})</Faint>
                    ) : null}
                    {a.summary ? <SubUL><li>{a.summary}</li></SubUL> : null}
                  </li>
                ))}
              </UL>
            </Section>
          )}

          <Section>
            <Label>Find me elsewhere:</Label>
            <UL>
              {email && (
                <li>
                  Email —{' '}
                  <Link href={`mailto:${email}`}>{email.replace('@', ' [at] ')}</Link>
                </li>
              )}
              {github && (
                <li>
                  GitHub —{' '}
                  <Link href={github} target="_blank" rel="noopener noreferrer">@{alias}</Link>
                </li>
              )}
              {linkedin && (
                <li>
                  LinkedIn —{' '}
                  <Link href={linkedin} target="_blank" rel="noopener noreferrer">{firstName}</Link>
                </li>
              )}
              {facebook && (
                <li>
                  Facebook —{' '}
                  <Link href={facebook} target="_blank" rel="noopener noreferrer">@{alias}</Link>
                </li>
              )}
              {instagram && (
                <li>
                  Instagram —{' '}
                  <Link href={instagram} target="_blank" rel="noopener noreferrer">@{alias}</Link>
                </li>
              )}
            </UL>
          </Section>

          <Rule />

          <BadgeHeader>
            <strong>88x31 GIF AREA</strong> — all hand-baked in CSS, no GIFs were harmed
          </BadgeHeader>
          <BadgeRow>
            {badges.map((b, i) => {
              const box = (
                <Badge style={{ background: b.bg, color: b.fg }}>
                  <span>{b.top}</span>
                  <span>{b.bottom}</span>
                </Badge>
              );
              return b.href ? (
                <a key={i} href={b.href} target="_blank" rel="noopener noreferrer" aria-label={`${b.top} ${b.bottom}`}>
                  {box}
                </a>
              ) : (
                <span key={i} aria-hidden="true">{box}</span>
              );
            })}
          </BadgeRow>

          <Copyright>
            Copyright &copy; {new Date().getFullYear()} {name} — built with CV.yaml, love, and
            questionable font choices.
          </Copyright>
        </Sheet>
      </Page>
    </ThemeProvider>
  );
}

// --- WordArt rendering: split into words (nowrap) then per-letter spans with
// a staggered animation delay. aria-hidden; a visually-hidden copy provides
// the accessible name.
function renderWordArt(text) {
  const words = text.split(' ');
  let idx = 0;
  return words.map((word, wi) => (
    <Word key={wi}>
      {Array.from(word).map((ch, ci) => {
        const delay = `${(idx++) * 0.05}s`;
        return (
          <Letter key={ci} style={{ '--d': delay }}>
            {ch}
          </Letter>
        );
      })}
    </Word>
  ));
}

/* ---------------------------------------------------------------- styles */

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(to bottom, ${(p) => p.theme.gradTop}, ${(p) => p.theme.gradBottom});
  color: ${(p) => p.theme.text};
  font-family: Verdana, Geneva, 'DejaVu Sans', Tahoma, sans-serif;
  font-size: 15px;
  line-height: 1.55;
  padding: clamp(1.25rem, 4vw, 2.5rem) clamp(0.9rem, 4vw, 3rem) 3rem;
  -webkit-text-size-adjust: 100%;
`;

const Sheet = styled.div`
  max-width: 60rem;
  margin: 0 auto;
`;

const TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem 1.25rem;
`;

const TitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SiteTitle = styled.a`
  font-weight: bold;
  font-size: 1.05rem;
  color: ${(p) => p.theme.link};
  text-decoration: none;

  &:hover,
  &:focus {
    color: ${(p) => p.theme.linkHover};
  }
`;

const Alias = styled.span`
  font-weight: bold;
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.95rem;
`;

const Sep = styled.span`
  color: ${(p) => p.theme.faint};
`;

const NavLink = styled.a`
  color: ${(p) => p.theme.link};
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;

  &:hover,
  &:focus {
    color: ${(p) => p.theme.linkHover};
  }
`;

const Corner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const LangSwitch = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${(p) => p.theme.faint};
`;

const LangActive = styled.span`
  font-weight: bold;
  color: ${(p) => p.theme.link};
`;

const LangOption = styled.span`
  color: ${(p) => p.theme.link};
  text-decoration: underline;
`;

const RetroButton = styled.button`
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  color: ${(p) => p.theme.text};
  background: ${(p) => p.theme.btnBg};
  border: 2px solid ${(p) => p.theme.btnBorderLight};
  border-right-color: ${(p) => p.theme.btnBorderDarkReal};
  border-bottom-color: ${(p) => p.theme.btnBorderDarkReal};

  &:active {
    border: 2px solid ${(p) => p.theme.btnBorderDarkReal};
    border-right-color: ${(p) => p.theme.btnBorderLight};
    border-bottom-color: ${(p) => p.theme.btnBorderLight};
  }
`;

/* WordArt — the source flashes each letter between a dark brown and bright
 * orange while it bobs (animated-text 0.2s alternate); we keep the same idea
 * but at a slightly gentler cadence. */
const flash = keyframes`
  from { transform: translateY(0); color: #7f4c00; }
  to   { transform: translateY(-5px); color: #ff9900; }
`;

const WordArt = styled.div`
  margin: 1.4rem 0 1.8rem;
`;

const WordArtInk = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  column-gap: 0.6em;
  row-gap: 0.15em;
  font-family: 'Rammetto One', 'Unica One', system-ui, sans-serif;
  font-size: clamp(2rem, 8.5vw, 4.4rem);
  line-height: 1.05;
  letter-spacing: 0.02em;
`;

const Word = styled.span`
  display: inline-flex;
  white-space: nowrap;
`;

const Letter = styled.span`
  display: inline-block;
  color: #ffb01f;
  text-shadow:
    1px 1px 0 #e07d00,
    2px 2px 0 #c96f00,
    3px 3px 0 #b26200,
    4px 4px 0 #9a5400,
    5px 5px 0 #834700,
    6px 6px 9px rgba(60, 30, 0, 0.45);

  @media (prefers-reduced-motion: no-preference) {
    animation: ${flash} 0.45s ease-in-out infinite alternate;
    animation-delay: var(--d, 0s);
  }
`;

/* Content */
const Section = styled.section`
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 1rem);
  margin: 0 0 1.1rem;
`;

const Label = styled.p`
  margin: 0 0 0.35rem;
  font-weight: bold;
  color: ${(p) => p.theme.label};
  font-size: 1rem;
`;

const UL = styled.ul`
  margin: 0 0 0.4rem;
  padding-left: 1.5rem;

  > li {
    margin: 0.2rem 0;
  }

  strong {
    color: ${(p) => p.theme.text};
  }
`;

const SubUL = styled.ul`
  margin: 0.15rem 0 0.3rem;
  padding-left: 1.4rem;
  list-style: circle;
  color: ${(p) => p.theme.faint};
  font-size: 0.92em;
`;

const Key = styled.span`
  font-weight: bold;
  color: ${(p) => p.theme.label};
`;

const Faint = styled.span`
  color: ${(p) => p.theme.faint};
  font-size: 0.9em;
`;

const Link = styled.a`
  color: ${(p) => p.theme.link};
  text-decoration: underline;

  &:hover,
  &:focus {
    color: ${(p) => p.theme.linkHover};
  }
`;

// The source bounces "click me" around a little box with nested
// alternating <marquee> tags (DVD-logo style); we reproduce that with two
// independent alternating position animations at different periods.
const bounceX = keyframes`
  from { left: 2px; }
  to   { left: calc(100% - 118px); }
`;
const bounceY = keyframes`
  from { top: 2px; }
  to   { top: calc(100% - 32px); }
`;

const BounceBox = styled.div`
  position: relative;
  width: min(240px, 100%);
  height: 82px;
  margin: 0.4rem 0 0.2rem;
  border: 1px dashed ${(p) => p.theme.rule};
  overflow: hidden;
`;

const ClickMe = styled.button`
  position: absolute;
  top: 2px;
  left: 2px;
  font-family: inherit;
  font-weight: bold;
  font-size: 0.95em;
  padding: 0.05rem 0.35rem;
  white-space: nowrap;
  cursor: pointer;
  color: ${(p) => p.theme.text};
  background: ${(p) => p.theme.btnBg};
  border: 2px solid ${(p) => p.theme.btnBorderLight};
  border-right-color: ${(p) => p.theme.btnBorderDarkReal};
  border-bottom-color: ${(p) => p.theme.btnBorderDarkReal};

  @media (prefers-reduced-motion: no-preference) {
    animation:
      ${bounceX} 2.7s linear infinite alternate,
      ${bounceY} 1.9s linear infinite alternate;
  }

  &:active {
    border-color: ${(p) => p.theme.btnBorderDarkReal};
  }
`;

const Whisper = styled.span`
  color: ${(p) => p.theme.faint};
  font-style: italic;
`;

const Rule = styled.hr`
  border: none;
  border-top: 2px dashed ${(p) => p.theme.rule};
  margin: 1.6rem 0 1rem;
`;

const BadgeHeader = styled.p`
  margin: 0 0 0.6rem;
  font-size: 0.85rem;
  color: ${(p) => p.theme.faint};
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  a {
    display: inline-block;
    line-height: 0;
  }
`;

const Badge = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 88px;
  height: 31px;
  border: 1px solid #000;
  box-shadow:
    inset -1px -1px 0 rgba(0, 0, 0, 0.55),
    inset 1px 1px 0 rgba(255, 255, 255, 0.45);
  font-family: 'Courier New', monospace;
  font-size: 9px;
  font-weight: bold;
  line-height: 1.15;
  text-align: center;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
`;

const Copyright = styled.p`
  margin: 1.4rem 0 0;
  font-size: 0.72rem;
  color: ${(p) => p.theme.faint};
`;

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export default SadaleTheme;
