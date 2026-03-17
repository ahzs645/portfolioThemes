import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { BREAKPOINT, FONT } from '../utils/tokens';
import {
  getInitials,
  getFirstSentence,
  buildHeroCopy,
  buildTopicLine,
  buildContactLinks,
  getDisplayUrl,
} from '../utils/helpers';

export default function Hero({ cv, theme }) {
  const heroCopy = useMemo(() => buildHeroCopy(cv), [cv]);
  const topicLine = useMemo(() => buildTopicLine(cv.skills), [cv.skills]);
  const contactLinks = useMemo(() => buildContactLinks(cv), [cv]);
  const initials = getInitials(cv.name);
  const headline = getFirstSentence(cv.about) || 'Building things that matter.';
  const primaryLink = cv.website || cv.socialLinks?.linkedin || cv.socialLinks?.github;

  return (
    <Section>
      <EntryWrap>
        <TopRow>
          <AvatarCircle $theme={theme}>{initials}</AvatarCircle>
          <InfoCol>
            <Name $theme={theme}>{cv.name || 'Your Name'}</Name>
            <Role $theme={theme}>{cv.currentJobTitle || 'Portfolio'}</Role>
          </InfoCol>
        </TopRow>

        {topicLine && <TopicPill $theme={theme}>{topicLine}</TopicPill>}

        <Headline $theme={theme}>{headline}</Headline>
        <Body $theme={theme}>{heroCopy}</Body>

        <Actions>
          <PrimaryCTA $theme={theme} href="#contact">
            Contact
            <ArrowSpan>↗</ArrowSpan>
          </PrimaryCTA>
          {primaryLink && (
            <SecondaryCTA $theme={theme} href={primaryLink} target="_blank" rel="noreferrer">
              {getDisplayUrl(primaryLink)}
            </SecondaryCTA>
          )}
        </Actions>

        {contactLinks.length > 0 && (
          <LinkRow>
            {contactLinks.map(link => (
              <LinkPill
                key={link.label}
                $theme={theme}
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
              >
                {link.label}
              </LinkPill>
            ))}
          </LinkRow>
        )}

        {cv.location && (
          <Location $theme={theme}>Based in {cv.location}</Location>
        )}
      </EntryWrap>
    </Section>
  );
}

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Section = styled.section`
  padding: 100px 0 80px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: ${BREAKPOINT}px) {
    padding: 80px 0 60px;
  }
`;

const EntryWrap = styled.div`
  animation: ${fadeUp} 1s cubic-bezier(0.68, 0, 0.31, 0.91) both;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 680px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
`;

const AvatarCircle = styled.div`
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${p => p.$theme.accent};
  color: #ffffff;
  font-family: ${FONT.family};
  font-size: 18px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.04em;
  flex-shrink: 0;
`;

const InfoCol = styled.div`
  text-align: left;
`;

const Name = styled.div`
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 20px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 1.1;
`;

const Role = styled.div`
  margin-top: 3px;
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;

const TopicPill = styled.div`
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 16px;
  border-radius: 50px;
  border: 1px solid ${p => p.$theme.border};
  background: ${p => p.$theme.cardBg};
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 13px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  text-transform: lowercase;
  margin-bottom: 24px;
`;

const Headline = styled.h1`
  margin: 0 0 20px;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: clamp(36px, 7vw, 56px);
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 110%;
  text-align: center;
`;

const Body = styled.p`
  margin: 0 0 28px;
  max-width: 520px;
  color: ${p => p.$theme.text};
  opacity: 0.6;
  font-family: ${FONT.family};
  font-size: clamp(16px, 2vw, 18px);
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  line-height: 1.6;
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
`;

const PrimaryCTA = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 58px;
  padding: 0 24px;
  border-radius: 100px;
  background: ${p => p.$theme.accent};
  color: #ffffff;
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 17px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.04em;
  transition: background 0.2s;

  &:hover {
    background: ${p => p.$theme.accentHover};
  }
`;

const ArrowSpan = styled.span`
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  font-size: 16px;
`;

const SecondaryCTA = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 58px;
  padding: 0 24px;
  border-radius: 100px;
  background: ${p => p.$theme.cardBg};
  border: 1px solid ${p => p.$theme.border};
  color: ${p => p.$theme.text};
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 17px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.04em;
`;

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
`;

const LinkPill = styled.a`
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 14px;
  border-radius: 50px;
  border: 1px solid ${p => p.$theme.border};
  background: ${p => p.$theme.cardBg};
  color: ${p => p.$theme.textSecondary};
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 13px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;

  &:hover {
    color: ${p => p.$theme.text};
    border-color: ${p => p.$theme.text};
  }
`;

const Location = styled.p`
  margin: 0;
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;
