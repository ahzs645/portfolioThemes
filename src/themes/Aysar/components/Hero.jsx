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
  const currentCompany = cv.experience?.[0]?.company || '';
  const detailLine = currentCompany
    ? `Current work spans ${currentCompany} and adjacent high-context problems.`
    : cv.currentJobTitle
      ? `Focused on ${cv.currentJobTitle}.`
      : 'Available for new opportunities.';

  return (
    <Section>
      <HeroGrid>
        {/* Floating badge card */}
        <BadgeColumn>
          <BadgeWrap>
            <BadgeShadow $theme={theme} />
            <BadgeCard $theme={theme}>
              <CardPunch $theme={theme} />
              <BadgeInner $theme={theme}>
                <Identity>
                  <Avatar $theme={theme}>{initials}</Avatar>
                  <IdentityText>
                    <IdentityName $theme={theme}>{cv.name || 'Your Name'}</IdentityName>
                    <IdentityRole $theme={theme}>{cv.currentJobTitle || 'Portfolio'}</IdentityRole>
                  </IdentityText>
                </Identity>

                {contactLinks.length > 0 && (
                  <SocialRow>
                    {contactLinks.slice(0, 3).map(link => (
                      <SocialPill
                        key={link.label}
                        $theme={theme}
                        href={link.href}
                        target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                      >
                        {link.label}
                      </SocialPill>
                    ))}
                  </SocialRow>
                )}

                <AvailabilityBar $theme={theme}>
                  <AvailabilityDot $theme={theme} />
                  <div>
                    <AvailabilityTitle $theme={theme}>
                      {cv.location ? `Based in ${cv.location}` : 'Available worldwide'}
                    </AvailabilityTitle>
                    <AvailabilityMeta $theme={theme}>
                      {detailLine}
                    </AvailabilityMeta>
                  </div>
                </AvailabilityBar>
              </BadgeInner>
            </BadgeCard>
          </BadgeWrap>
        </BadgeColumn>

        {/* Copy block */}
        <CopyColumn>
          <EntryWrap>
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
                  Visit {getDisplayUrl(primaryLink)}
                </SecondaryCTA>
              )}
            </Actions>

            {cv.location && (
              <Location $theme={theme}>
                Currently based in {cv.location}.
              </Location>
            )}
          </EntryWrap>
        </CopyColumn>
      </HeroGrid>
    </Section>
  );
}

/* ── Keyframes ── */

const floatCard = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-4deg); }
  50%      { transform: translateY(-10px) rotate(-2deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.12); opacity: 0.76; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── Layout ── */

const Section = styled.section`
  padding: 80px 0 60px;

  @media (max-width: ${BREAKPOINT}px) {
    padding: 60px 0 40px;
  }
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 400px) minmax(0, 1fr);
  align-items: center;
  gap: 56px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`;

/* ── Badge card (left column) ── */

const BadgeColumn = styled.div`
  @media (max-width: 920px) {
    display: flex;
    justify-content: center;
  }
`;

const BadgeWrap = styled.div`
  position: relative;
  animation: ${floatCard} 5s ease-in-out infinite;
  max-width: 380px;
`;

const BadgeShadow = styled.div`
  position: absolute;
  inset: 30px 18px 10px;
  border-radius: 38px;
  background: ${p => p.$theme.accentSoft};
  filter: blur(26px);
`;

const BadgeCard = styled.div`
  position: relative;
  padding: 16px;
  border-radius: 38px;
  background: ${p => p.$theme.badgeSurface};
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.1);
  border: 1px solid ${p => p.$theme.border};
`;

const CardPunch = styled.div`
  position: absolute;
  top: 14px;
  left: 50%;
  width: 18px;
  height: 18px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: ${p => p.$theme.badgeTint};
  box-shadow: inset 0 0 0 1px ${p => p.$theme.border};
`;

const BadgeInner = styled.div`
  padding: 34px 22px 22px;
  border-radius: 30px;
  background:
    radial-gradient(circle at top right, ${p => p.$theme.accentSoft}, transparent 40%),
    ${p => p.$theme.badgeSurface};
  box-shadow: inset 0 0 0 1px ${p => p.$theme.border};
`;

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Avatar = styled.div`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 24px;
  background: linear-gradient(135deg, ${p => p.$theme.accent} 0%, ${p => p.$theme.lime} 100%);
  color: #ffffff;
  font-family: ${FONT.family};
  font-size: 20px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.06em;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
  flex-shrink: 0;
`;

const IdentityText = styled.div`
  min-width: 0;
`;

const IdentityName = styled.div`
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: clamp(22px, 3vw, 28px);
  font-weight: ${FONT.bold};
  letter-spacing: -0.06em;
  line-height: 1.05;
`;

const IdentityRole = styled.div`
  margin-top: 6px;
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;

const SocialRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
`;

const SocialPill = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 12px;
  border-radius: 50px;
  background: ${p => p.$theme.badgeTint};
  color: ${p => p.$theme.textSecondary};
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 12px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.03em;
  box-shadow: inset 0 0 0 1px ${p => p.$theme.border};

  &:hover {
    color: ${p => p.$theme.text};
  }
`;

const AvailabilityBar = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 24px;
  background: ${p => p.$theme.badgeTint};
  box-shadow: inset 0 0 0 1px ${p => p.$theme.border};
`;

const AvailabilityDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
  background: ${p => p.$theme.lime};
  animation: ${pulse} 2.8s ease-in-out infinite;
`;

const AvailabilityTitle = styled.div`
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 15px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.04em;
  line-height: 1.2;
`;

const AvailabilityMeta = styled.div`
  margin-top: 4px;
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 13px;
  font-weight: ${FONT.semibold};
  line-height: 1.45;
`;

/* ── Copy block (right column) ── */

const CopyColumn = styled.div``;

const EntryWrap = styled.div`
  animation: ${fadeUp} 1s cubic-bezier(0.68, 0, 0.31, 0.91) both;
  max-width: 670px;
`;

const TopicPill = styled.div`
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 16px;
  border-radius: 50px;
  border: 1px solid ${p => p.$theme.border};
  background: ${p => p.$theme.cardBg};
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 13px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.04em;
  text-transform: lowercase;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
`;

const Headline = styled.h1`
  margin: 18px 0 16px;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: clamp(44px, 7vw, 78px);
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 0.96;
`;

const Body = styled.p`
  margin: 0;
  max-width: 640px;
  color: ${p => p.$theme.text};
  opacity: 0.6;
  font-family: ${FONT.family};
  font-size: clamp(17px, 2.3vw, 20px);
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
`;

const PrimaryCTA = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 10px 0 22px;
  border-radius: 100px;
  background: ${p => p.$theme.accent};
  color: #ffffff;
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 16px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.04em;
  transition: background 0.2s;

  &:hover {
    background: ${p => p.$theme.accentHover};
  }
`;

const ArrowSpan = styled.span`
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
`;

const SecondaryCTA = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 22px;
  border-radius: 100px;
  background: ${p => p.$theme.cardBg};
  border: 1px solid ${p => p.$theme.border};
  color: ${p => p.$theme.text};
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 16px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.04em;
`;

const Location = styled.p`
  margin: 20px 0 0;
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  line-height: 1.5;
`;
