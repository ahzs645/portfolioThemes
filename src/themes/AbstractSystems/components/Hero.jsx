import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';
import { getSkillLabel } from '../utils/helpers';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function isDaytime(date) {
  const h = date.getHours();
  return h >= 6 && h < 20;
}

function SunIcon({ theme }) {
  return (
    <IconWrap $theme={theme}>
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <line x1="9" y1=".75" x2="9" y2="2.25" />
        <line x1="14.834" y1="3.166" x2="13.773" y2="4.227" />
        <line x1="17.25" y1="9" x2="15.75" y2="9" />
        <line x1="14.834" y1="14.834" x2="13.773" y2="13.773" />
        <line x1="9" y1="17.25" x2="9" y2="15.75" />
        <line x1="3.166" y1="14.834" x2="4.227" y2="13.773" />
        <line x1=".75" y1="9" x2="2.25" y2="9" />
        <line x1="3.166" y1="3.166" x2="4.227" y2="4.227" />
        <circle cx="9" cy="9" r="4.25" />
      </svg>
    </IconWrap>
  );
}

function MoonIcon({ theme }) {
  return (
    <IconWrap $theme={theme}>
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <path d="M15.935 9.644A7.063 7.063 0 0 1 8.356 2.065 7.065 7.065 0 1 0 15.935 9.644z" />
      </svg>
    </IconWrap>
  );
}

export default function Hero({ cv, theme }) {
  const skills = (cv.skills || []).map(getSkillLabel).filter(Boolean).slice(0, 7);
  const now = useClock();
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const day = isDaytime(now);

  return (
    <Section id="as-about">
      <StatusRow $delay={0}>
        <PingDotWrap>
          <PingDot $theme={theme} />
          <PingRing $theme={theme} />
        </PingDotWrap>
        <StatusText $theme={theme}>
          {cv.location || 'Available'}
        </StatusText>
        {day ? <SunIcon theme={theme} /> : <MoonIcon theme={theme} />}
        <ClockText $theme={theme}>{timeStr}</ClockText>
      </StatusRow>

      <Name $theme={theme} $delay={1}>
        {cv.name || 'Portfolio'}
      </Name>

      <Title $theme={theme} $delay={2}>
        {cv.currentJobTitle || 'Professional'}
      </Title>

      {cv.about && (
        <Tagline $theme={theme} $delay={3}>
          {cv.about.split('.')[0]}.
        </Tagline>
      )}

      {cv.about && cv.about.split('.').length > 1 && (
        <Body $theme={theme} $delay={4}>
          {cv.about.split('.').slice(1).join('.').trim()}
        </Body>
      )}

      {skills.length > 0 && (
        <PillRow $delay={5}>
          {skills.map((label, i) => (
            <Pill key={i} $theme={theme}>
              {label}
            </Pill>
          ))}
        </PillRow>
      )}
    </Section>
  );
}

const fadeSlideUp = keyframes`
  from {
    opacity: 0;
    filter: blur(4px);
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0);
  }
`;

const pingRing = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FadeIn = styled.div`
  opacity: 0;
  animation: ${fadeSlideUp} 1.2s forwards;
  animation-delay: ${p => (p.$delay || 0) * 60}ms;
`;

const StatusRow = styled(FadeIn)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  margin-bottom: 16px;
`;

const PingDotWrap = styled.span`
  position: relative;
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  margin-right: 2px;
`;

const PingDot = styled.span`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: ${p => p.$theme.green};
`;

const PingRing = styled.span`
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1px solid ${p => p.$theme.green};
  animation: ${pingRing} 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
`;

const StatusText = styled.span`
  font-family: ${FONT.mono};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${p => p.$theme.muted};
  flex-shrink: 0;
`;

const IconWrap = styled.span`
  flex-shrink: 0;
  color: ${p => p.$theme.muted};
  display: flex;
  align-items: center;
`;

const ClockText = styled.span`
  font-family: ${FONT.mono};
  font-size: 12px;
  line-height: 16px;
  color: ${p => p.$theme.muted};
  display: flex;
  align-items: center;
  font-variant-numeric: tabular-nums;
`;

const Name = styled(FadeIn)`
  font-family: ${FONT.sans};
  font-size: 32px;
  line-height: 34px;
  letter-spacing: -0.02em;
  font-weight: 600;
  color: ${p => p.$theme.heading};
  margin-bottom: 4px;
`;

const Title = styled(FadeIn)`
  font-family: ${FONT.sans};
  font-size: 18px;
  line-height: 22px;
  color: ${p => p.$theme.muted};
  margin-bottom: 20px;
`;

const Tagline = styled(FadeIn)`
  font-family: ${FONT.sans};
  font-size: 16px;
  line-height: 26px;
  font-weight: 500;
  color: ${p => p.$theme.heading};
  margin-bottom: 8px;
`;

const Body = styled(FadeIn)`
  font-family: ${FONT.sans};
  font-size: 16px;
  line-height: 24px;
  color: ${p => p.$theme.body};
  margin-bottom: 20px;
`;

const PillRow = styled(FadeIn)`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

const Pill = styled.span`
  font-family: ${FONT.sans};
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: -0.02em;
  padding: 5px 12px;
  border-radius: 999px;
  background: ${p => p.$theme.pillBg};
  color: ${p => p.$theme.body};
  cursor: default;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(1);
  }
`;
