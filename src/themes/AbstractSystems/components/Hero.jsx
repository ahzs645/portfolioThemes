import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';
import { getSkillLabel } from '../utils/helpers';

export default function Hero({ cv, theme }) {
  const skills = (cv.skills || []).map(getSkillLabel).filter(Boolean).slice(0, 7);

  return (
    <Section id="as-about">
      <StatusRow $delay={0}>
        <StatusDot $theme={theme} />
        <StatusText $theme={theme}>
          {cv.location || 'Available'}
        </StatusText>
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
  margin-bottom: 16px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$theme.green};
`;

const StatusText = styled.span`
  font-family: ${FONT.mono};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${p => p.$theme.muted};
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
