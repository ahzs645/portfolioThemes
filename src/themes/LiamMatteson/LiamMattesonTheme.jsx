import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Cormorant+Garamond:wght@500;600&display=swap');
`;

const revealUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
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

/* ── Clock Widget ──────────────────────────────────────── */
function ClockWidget({ theme }) {
  const [now, setNow] = useState(new Date());
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setExpanded(false);
    };
    if (expanded) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  const hours = (now.getHours() % 12) * 30 + (now.getMinutes() / 60) * 30;
  const minutes = now.getMinutes() * 6 + (now.getSeconds() / 60) * 6;
  const seconds = now.getSeconds() * 6;
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeParts = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).split(' ');
  const timeStr = timeParts[0];
  const ampm = timeParts[1];

  return (
    <ClockContainer ref={ref}>
      {expanded && <WidgetOverlay onClick={() => setExpanded(false)} />}
      {expanded ? (
        <ClockExpanded $theme={theme} onClick={() => setExpanded(false)}>
          <ClockDate $theme={theme}>{dateStr}</ClockDate>
          <ClockFace>
            <ClockRing $theme={theme} />
            {Array.from({ length: 60 }).map((_, i) => {
              const isMajor = i % 5 === 0;
              const isQuarter = i % 15 === 0;
              return (
                <ClockTick
                  key={i}
                  $angle={i * 6}
                  $theme={theme}
                  $isMajor={isMajor}
                  $isQuarter={isQuarter}
                />
              );
            })}
            <ClockHand $angle={hours - 90} $length="30px" $width="2px" $color={theme.text} />
            <ClockHand $angle={minutes - 90} $length="42px" $width="2px" $color={theme.text} />
            <ClockSecondHand $angle={seconds - 90} $theme={theme} />
            <ClockCenter $theme={theme} />
          </ClockFace>
          <ClockTimeExpanded $theme={theme}>{timeStr}</ClockTimeExpanded>
          <ClockAmPm $theme={theme}>{ampm}</ClockAmPm>
        </ClockExpanded>
      ) : (
        <ClockCollapsed $theme={theme} onClick={() => setExpanded(true)}>
          <ClockDateSmall $theme={theme}>{dateStr}</ClockDateSmall>
          <ClockFaceSmall>
            <ClockHandSmall $angle={hours - 90} $length="7px" $width="1.2px" $color={theme.muted} />
            <ClockHandSmall $angle={minutes - 90} $length="9px" $width="1px" $color={theme.muted} />
            <ClockSecondHandSmall $angle={seconds - 90} $color={theme.underline} />
            <ClockCenterSmall $theme={theme} />
          </ClockFaceSmall>
        </ClockCollapsed>
      )}
    </ClockContainer>
  );
}

/* ── Status Widget (location pill) ─────────────────────── */
function StatusWidget({ theme, location, role }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setExpanded(false);
    };
    if (expanded) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  return (
    <StatusContainer ref={ref}>
      {expanded && <WidgetOverlay onClick={() => setExpanded(false)} />}
      {expanded ? (
        <StatusExpanded $theme={theme} onClick={() => setExpanded(false)}>
          <StatusIcon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </StatusIcon>
          <StatusExpandedText>
            <StatusLabel $theme={theme}>Location</StatusLabel>
            <StatusValue $theme={theme}>{location}</StatusValue>
          </StatusExpandedText>
          {role && (
            <StatusExpandedText>
              <StatusLabel $theme={theme}>Role</StatusLabel>
              <StatusValue $theme={theme}>{role}</StatusValue>
            </StatusExpandedText>
          )}
        </StatusExpanded>
      ) : (
        <StatusCollapsed $theme={theme} onClick={() => setExpanded(true)}>
          <StatusDot />
          <StatusTextEl $theme={theme}>{location}</StatusTextEl>
        </StatusCollapsed>
      )}
    </StatusContainer>
  );
}

/* ── Main Theme ────────────────────────────────────────── */
export function LiamMattesonTheme({ darkMode }) {
  const cv = useCV();

  if (!cv) return null;

  const theme = darkMode
    ? {
        bg: '#171b17',
        surface: '#1d241d',
        text: '#e8ece5',
        muted: '#9aa394',
        soft: '#2a322a',
        underline: '#313a31',
        border: 'rgba(232, 236, 229, 0.1)',
      }
    : {
        bg: '#f7f7f2',
        surface: '#ffffff',
        text: '#123727',
        muted: '#6b7467',
        soft: '#eceee7',
        underline: '#e8ebe3',
        border: 'rgba(18, 55, 39, 0.09)',
      };

  const intro = firstSentence(cv.about) || 'Software designed with creativity and care through relentless iteration and meticulous detail.';
  const introWords = intro.split(' ');
  const currentRole = cv.experience[0];
  const heroLinks = [
    { label: 'Work', href: cv.website || '#' },
    { label: 'Projects', href: cv.website || '#' },
    { label: 'Connect', href: cv.email ? `mailto:${cv.email}` : '#' },
  ];
  if (cv.socialLinks?.linkedin) heroLinks.push({ label: 'LinkedIn', href: cv.socialLinks.linkedin });

  return (
    <Page $theme={theme}>
      <FontLoader />
      <ScreenWrap>
        <ContentArea>
          <Header>
            <HeaderLeft>
              <MarkLink href={cv.website || '#'} target="_blank" rel="noreferrer" aria-label={cv.name}>
                <IconMark viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M19.444 14.284c.307 0 .556.249.556.556v2.936A2.222 2.222 0 0 1 17.778 20H7.699a.556.556 0 0 1-.556-.557V14.84c0-.307.249-.556.556-.556h11.745Z" fill="currentColor" />
                  <path d="M7.696 12.856a.556.556 0 0 1-.556-.555V.556C7.14.249 7.39 0 7.696 0h2.936a2.222 2.222 0 0 1 2.222 2.222V12.3a.556.556 0 0 1-.555.556H7.696Z" fill="currentColor" />
                  <path d="M14.84 12.856a.556.556 0 0 1-.556-.555V.556c0-.307.25-.556.556-.556h2.937A2.222 2.222 0 0 1 20 2.222V12.3a.556.556 0 0 1-.556.556H14.84Z" fill="currentColor" />
                  <path d="M0 2.222A2.222 2.222 0 0 1 2.222 0h2.936c.307 0 .556.249.556.556v18.887a.556.556 0 0 1-.556.557H2.222A2.222 2.222 0 0 1 0 17.776V2.222Z" fill="currentColor" />
                </IconMark>
              </MarkLink>
            </HeaderLeft>
            <HeaderCenter>
              <StatusWidget
                theme={theme}
                location={cv.location}
                role={currentRole ? `${currentRole.title} at ${currentRole.company}` : null}
              />
            </HeaderCenter>
            <HeaderRight>
              <ClockWidget theme={theme} />
            </HeaderRight>
          </Header>

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
              {heroLinks.map((link) => (
                <NavLink key={link.label} href={link.href} target="_blank" rel="noreferrer" $theme={theme}>
                  {link.label}
                </NavLink>
              ))}
            </NavRow>
          </IntroBlock>
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

  @media (max-width: 640px) {
    padding: 24px 24px 0;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  margin-bottom: 16px;
  gap: 0;

  @media (min-width: 640px) {
    height: 80px;
    margin-bottom: 32px;
  }
`;

const HeaderLeft = styled.div`
  width: 90px;
  display: flex;
  align-items: center;

  @media (min-width: 640px) {
    width: 120px;
  }
`;

const HeaderCenter = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderRight = styled.div`
  width: 90px;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  @media (min-width: 640px) {
    width: 120px;
  }
`;

const MarkLink = styled.a`
  color: inherit;
  display: inline-flex;
  align-items: center;
  opacity: 0.5;
  transition: opacity 200ms ease;

  &:hover {
    opacity: 0.8;
  }
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

  &:hover {
    opacity: 0.72;
  }
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
  color: inherit;
  white-space: nowrap;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-skip-ink: none;
  text-decoration-color: ${({ $theme }) => $theme.underline};
  border-radius: 4px;
  transition: background-color 200ms ease, opacity 200ms ease;

  &:hover {
    background-color: rgba(20, 27, 20, 0.08);
  }
`;

/* ── Widget Shared ─────────────────────────────────────── */

const WidgetOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
`;

/* ── Clock Widget Styles ───────────────────────────────── */

const ClockContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
`;

const ClockExpanded = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 9999;
  padding: 24px;
  border-radius: 24px;
  background: ${({ $theme }) => $theme.surface};
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0px 3px 3px -1.5px rgba(0, 0, 0, 0.05),
    0px 6px 6px -3px rgba(0, 0, 0, 0.03),
    0px 12px 12px -6px rgba(0, 0, 0, 0.05),
    0px 24px 24px -12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  animation: ${fadeIn} 0.25s ease forwards;
`;

const ClockDate = styled.span`
  font-family: 'JetBrains Mono', 'Instrument Sans', monospace;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $theme }) => $theme.text};
  font-variant-numeric: tabular-nums;
`;

const ClockFace = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClockRing = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px ${({ $theme }) => `${$theme.text}26`};
`;

const ClockTick = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center bottom;
  transform: translate(-50%, -50%) rotate(${({ $angle }) => $angle}deg) translateY(-54px);

  &::after {
    content: '';
    display: block;
    border-radius: 999px;
    background: ${({ $theme, $isMajor }) => $isMajor ? `${$theme.text}99` : `${$theme.text}40`};
    width: ${({ $isQuarter, $isMajor }) => $isQuarter ? '2px' : $isMajor ? '1.5px' : '1px'};
    height: ${({ $isQuarter, $isMajor }) => $isQuarter ? '8px' : $isMajor ? '6px' : '4px'};
  }
`;

const ClockHand = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  transform-origin: center center;
  transform: rotate(${({ $angle }) => $angle}deg);

  &::after {
    content: '';
    position: absolute;
    width: ${({ $length }) => $length};
    height: ${({ $width }) => $width};
    left: calc(50% + 2px);
    top: 50%;
    transform: translateY(-50%);
    border-radius: 2px;
    background: ${({ $color }) => $color};
  }
`;

const ClockSecondHand = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  transform-origin: center center;
  transform: rotate(${({ $angle }) => $angle}deg);

  &::before {
    content: '';
    position: absolute;
    width: 10px;
    height: 1px;
    right: calc(50% + 2px);
    top: 50%;
    transform: translateY(-50%);
    border-radius: 0.5px;
    background: ${({ $theme }) => $theme.underline};
  }

  &::after {
    content: '';
    position: absolute;
    width: 48px;
    height: 1px;
    left: calc(50% + 2px);
    top: 50%;
    transform: translateY(-50%);
    border-radius: 0.5px;
    background: ${({ $theme }) => $theme.underline};
  }
`;

const ClockCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  z-index: 10;
  background: ${({ $theme }) => $theme.underline};
  box-shadow: 0 0 0 1.5px ${({ $theme }) => $theme.surface};
`;

const ClockTimeExpanded = styled.span`
  font-family: 'JetBrains Mono', 'Instrument Sans', monospace;
  font-size: 24px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: ${({ $theme }) => $theme.text};
`;

const ClockAmPm = styled.span`
  font-family: 'JetBrains Mono', 'Instrument Sans', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  color: ${({ $theme }) => $theme.muted};
  margin-top: -4px;
`;

const ClockCollapsed = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  color: inherit;
  transition: background-color 200ms ease;

  &:hover {
    background-color: rgba(20, 27, 20, 0.08);
  }
`;

const ClockDateSmall = styled.span`
  display: none;
  font-family: 'JetBrains Mono', 'Instrument Sans', monospace;
  font-size: 13px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-skip-ink: none;
  color: ${({ $theme }) => $theme.muted};
  text-decoration-color: ${({ $theme }) => $theme.underline};

  @media (min-width: 640px) {
    display: inline;
  }
`;

const ClockFaceSmall = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClockHandSmall = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0% 50%;
  transform: rotate(${({ $angle }) => $angle}deg);

  &::after {
    content: '';
    display: block;
    width: ${({ $length }) => $length};
    height: ${({ $width }) => $width};
    border-radius: 999px;
    background: ${({ $color }) => $color};
  }
`;

const ClockSecondHandSmall = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0% 50%;
  transform: rotate(${({ $angle }) => $angle}deg);

  &::after {
    content: '';
    display: block;
    width: 10px;
    height: 0.75px;
    border-radius: 999px;
    background: ${({ $color }) => $color};
  }
`;

const ClockCenterSmall = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  z-index: 10;
  background: ${({ $theme }) => $theme.underline};
`;

/* ── Status Widget Styles ──────────────────────────────── */

const StatusContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
`;

const StatusExpanded = styled.div`
  position: absolute;
  top: -8px;
  z-index: 9999;
  padding: 20px 24px;
  border-radius: 20px;
  background: ${({ $theme }) => $theme.surface};
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0px 3px 3px -1.5px rgba(0, 0, 0, 0.05),
    0px 6px 6px -3px rgba(0, 0, 0, 0.03),
    0px 12px 12px -6px rgba(0, 0, 0, 0.05),
    0px 24px 24px -12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  white-space: nowrap;
  animation: ${fadeIn} 0.25s ease forwards;
`;

const StatusIcon = styled.div`
  color: inherit;
  opacity: 0.5;
`;

const StatusExpandedText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatusLabel = styled.span`
  font-family: 'Instrument Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ $theme }) => $theme.muted};
`;

const StatusValue = styled.span`
  font-family: 'Instrument Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: ${({ $theme }) => $theme.text};
`;

const StatusCollapsed = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${({ $theme }) => $theme.text}0d;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  color: inherit;
  transition: background-color 200ms ease;

  &:hover {
    background: ${({ $theme }) => $theme.text}1a;
  }
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
`;

const StatusTextEl = styled.span`
  font-family: 'Instrument Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $theme }) => $theme.muted};
`;
