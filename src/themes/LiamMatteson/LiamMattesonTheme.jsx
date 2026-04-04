import React, { useState, useMemo, memo } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { ClockWidget } from './components/ClockWidget';
import { SubPageHeaderBlock, WorkPage, ProjectsPage, ConnectPage } from './components/SubPages';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Cormorant+Garamond:wght@500;600&display=swap');
`;

const revealUp = keyframes`
  from { opacity: 0; transform: translateY(10px); filter: blur(16px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; filter: blur(12px); transform: translateY(24px); }
  to   { opacity: 1; filter: blur(0);    transform: translateY(0); }
`;

const navReveal = keyframes`
  from { opacity: 0; filter: blur(8px); transform: translateY(20px); }
  to   { opacity: 1; filter: blur(0);   transform: translateY(0); }
`;

function firstSentence(text = '') {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  const match = normalized.match(/^.*?[.!?](?:\s|$)/);
  return (match ? match[0] : normalized).trim();
}

/* ── Intro block (memoised so clock ticks don't re-animate it) ── */
const IntroContent = memo(function IntroContent({ cv, theme, currentRole, introWords, navItems, onNav }) {
  return (
    <IntroBlock>
      <NameHeading $delay={0}>{cv.name}</NameHeading>
      <RoleLine $delay={100}>
        {currentRole ? (
          <>
            <span>{currentRole.title}</span>
            <span> at </span>
            <InlineLink href={cv.website || cv.socialLinks?.linkedin || '#'} target="_blank" rel="noreferrer" $theme={theme}>
              {currentRole.company}
            </InlineLink>
            {cv.location && <span> in {cv.location}</span>}
          </>
        ) : (
          <span>{cv.location}</span>
        )}
      </RoleLine>

      <Statement $theme={theme}>
        {introWords.map((word, index) => (
          <StatementWord key={`${word}-${index}`} $delay={index}>
            {word}
          </StatementWord>
        ))}
      </Statement>

      <NavRow>
        {navItems.map((label) => (
          <NavLink key={label} as="button" onClick={() => onNav(label)} $theme={theme}>
            {label}
          </NavLink>
        ))}
      </NavRow>
    </IntroBlock>
  );
});

/* ── Shared nav bar for sub-pages ──────────────────────── */
const SubPageNav = memo(function SubPageNav({ navItems, activeView, theme, onNav }) {
  return (
    <NavRow>
      {navItems.map((label) => (
        <NavLink
          key={label}
          as="button"
          onClick={() => onNav(label)}
          $theme={theme}
          $active={activeView === label.toLowerCase()}
        >
          {label}
        </NavLink>
      ))}
    </NavRow>
  );
});

/* ── Main Theme ────────────────────────────────────────── */
export function LiamMattesonTheme({ darkMode }) {
  const cv = useCV();
  const [view, setView] = useState('home');

  const theme = useMemo(() => darkMode
    ? { bg: '#171b17', surface: '#1d241d', text: '#e8ece5', muted: '#9aa394', soft: '#2a322a', underline: '#313a31', border: 'rgba(232, 236, 229, 0.1)' }
    : { bg: '#f7f7f2', surface: '#ffffff', text: '#123727', muted: '#6b7467', soft: '#eceee7', underline: '#e8ebe3', border: 'rgba(18, 55, 39, 0.09)' },
    [darkMode]
  );

  if (!cv) return null;

  const intro = firstSentence(cv.about) || 'Software designed with creativity and care through relentless iteration and meticulous detail.';
  const introWords = intro.split(' ');
  const currentRole = cv.experience[0];
  const navItems = ['Work', 'Projects', 'Connect'];
  const handleNav = (label) => setView(label.toLowerCase());

  const header = (
    <Header>
      <HeaderSide>
        <LogoButton onClick={() => setView('home')} aria-label={cv.name}>
          <IconMark viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M19.444 14.284c.307 0 .556.249.556.556v2.936A2.222 2.222 0 0 1 17.778 20H7.699a.556.556 0 0 1-.556-.557V14.84c0-.307.249-.556.556-.556h11.745Z" fill="currentColor" />
            <path d="M7.696 12.856a.556.556 0 0 1-.556-.555V.556C7.14.249 7.39 0 7.696 0h2.936a2.222 2.222 0 0 1 2.222 2.222V12.3a.556.556 0 0 1-.555.556H7.696Z" fill="currentColor" />
            <path d="M14.84 12.856a.556.556 0 0 1-.556-.555V.556c0-.307.25-.556.556-.556h2.937A2.222 2.222 0 0 1 20 2.222V12.3a.556.556 0 0 1-.556.556H14.84Z" fill="currentColor" />
            <path d="M0 2.222A2.222 2.222 0 0 1 2.222 0h2.936c.307 0 .556.249.556.556v18.887a.556.556 0 0 1-.556.557H2.222A2.222 2.222 0 0 1 0 17.776V2.222Z" fill="currentColor" />
          </IconMark>
        </LogoButton>
      </HeaderSide>
      <HeaderCenter />
      <HeaderSide $right>
        <ClockWidget theme={theme} />
      </HeaderSide>
    </Header>
  );

  /* ── Sub-page views ── */
  if (view !== 'home') {
    const pages = {
      work:     { title: 'Work', subtitle: 'Selected experience', content: <WorkPage theme={theme} experience={cv.experience} /> },
      projects: { title: 'Projects', subtitle: 'Selected projects and work', content: <ProjectsPage theme={theme} projects={cv.projects} /> },
      connect:  { title: 'Connect', subtitle: 'Get in touch', content: <ConnectPage theme={theme} cv={cv} /> },
    };
    const page = pages[view];
    if (!page) { setView('home'); return null; }

    return (
      <Page $theme={theme}>
        <FontLoader />
        <SubPageWrap>
          <ContentArea>{header}<SubPageNav navItems={navItems} activeView={view} theme={theme} onNav={handleNav} /></ContentArea>
          <SubPageBody>
            <SubPageHeaderBlock theme={theme} title={page.title} subtitle={page.subtitle} onBack={() => setView('home')} />
            {page.content}
          </SubPageBody>
        </SubPageWrap>
      </Page>
    );
  }

  /* ── Home view ── */
  return (
    <Page $theme={theme}>
      <FontLoader />
      <ScreenWrap>
        <ContentArea>
          {header}
          <IntroContent cv={cv} theme={theme} currentRole={currentRole} introWords={introWords} navItems={navItems} onNav={handleNav} />
        </ContentArea>
      </ScreenWrap>
    </Page>
  );
}

/* ── Styled Components ─────────────────────────────────── */

const Page = styled.div`
  min-height: 100vh;
  background: ${({ $theme }) => $theme.bg};
  color: ${({ $theme }) => $theme.text};
`;

const ScreenWrap = styled.div`
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ContentArea = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 24px 0;
  width: 100%;
  @media (max-width: 640px) { padding: 24px 24px 0; }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  margin-bottom: 16px;
  gap: 0;
  @media (min-width: 640px) { height: 80px; margin-bottom: 32px; }
`;

const HeaderSide = styled.div`
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: ${({ $right }) => $right ? 'flex-end' : 'flex-start'};
  @media (min-width: 640px) { width: 120px; }
`;

const HeaderCenter = styled.div`
  flex-shrink: 0;
`;

const LogoButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  display: inline-flex;
  align-items: center;
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 200ms ease;
  &:hover { opacity: 0.8; }
`;

const IconMark = styled.svg`
  width: 20px;
  height: 20px;
`;

const IntroBlock = styled.section`
  max-width: 720px;
`;

const NameHeading = styled.h1`
  margin: 0 0 4px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  opacity: 0;
  animation: ${fadeIn} 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) ${({ $delay }) => $delay}ms forwards;
`;

const RoleLine = styled.div`
  font-family: 'Instrument Sans', sans-serif;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 4px;
  opacity: 0;
  animation: ${fadeIn} 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) ${({ $delay }) => $delay}ms forwards;
`;

const InlineLink = styled.a`
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-skip-ink: none;
  text-decoration-color: ${({ $theme }) => $theme.underline};
  transition: text-decoration-color 1s ease-out;
  &:hover { opacity: 0.72; }
`;

const Statement = styled.p`
  margin: 48px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0 0.25em;
  max-width: 600px;
  color: ${({ $theme }) => $theme.muted};
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: -0.22px;
`;

const StatementWord = styled.span`
  display: inline-block;
  opacity: 0;
  animation: ${revealUp} 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  animation-delay: ${({ $delay }) => 480 + $delay * 40}ms;
`;

const NavRow = styled.nav`
  display: flex;
  gap: 16px;
  margin-left: -8px;
  overflow-x: auto;
  flex-wrap: nowrap;
  opacity: 0;
  animation: ${navReveal} 1s cubic-bezier(0.25, 0.1, 0.25, 1) 800ms forwards;
  &::-webkit-scrollbar { display: none; }
`;

const NavLink = styled.a`
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: ${({ $active, $theme }) => $active ? $theme?.text : 'inherit'};
  white-space: nowrap;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-skip-ink: none;
  text-decoration-color: ${({ $theme }) => $theme?.underline};
  border: none;
  background: ${({ $active }) => $active ? 'rgba(20, 27, 20, 0.08)' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 200ms ease;
  &:hover { background-color: rgba(20, 27, 20, 0.08); }
`;

const SubPageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const SubPageBody = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
`;
