import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { BREAKPOINT, FONT } from '../utils/tokens';
import BadgeCard from './BadgeCard';
import {
  getInitials,
  getFirstSentence,
  buildHeroCopy,
  buildContactLinks,
  getDisplayUrl,
} from '../utils/helpers';

/* Inline social SVGs */
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WebIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-26.37,144H154.37a143.21,143.21,0,0,1-26.37,52.75A143.21,143.21,0,0,1,101.63,168ZM98,152a145.72,145.72,0,0,1,0-48h60a145.72,145.72,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.79a161.79,161.79,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128Zm114.37-40H101.63a143.21,143.21,0,0,1,26.37-52.75A143.21,143.21,0,0,1,154.37,88ZM174.21,104h38.46a88.15,88.15,0,0,1,0,48H174.21a161.79,161.79,0,0,0,0-48Zm32.1-16H170.94a167.84,167.84,0,0,0-22.29-45.6A88.34,88.34,0,0,1,206.31,88ZM107.35,42.4A167.84,167.84,0,0,0,85.06,88H49.69A88.34,88.34,0,0,1,107.35,42.4ZM49.69,168H85.06a167.84,167.84,0,0,0,22.29,45.6A88.34,88.34,0,0,1,49.69,168Zm98.96,45.6a167.84,167.84,0,0,0,22.29-45.6h35.37A88.34,88.34,0,0,1,148.65,213.6Z" />
  </svg>
);

const LocationIcon = () => (
  <svg width="13" height="14" viewBox="0 0 13 14" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M6.5 0C3.46 0 1 2.46 1 5.5 1 9.63 6.05 13.68 6.27 13.85a.5.5 0 0 0 .46 0C6.95 13.68 12 9.63 12 5.5 12 2.46 9.54 0 6.5 0Zm0 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

function getSocialIcon(label) {
  const l = label.toLowerCase();
  if (l === 'x' || l.includes('twitter')) return <XIcon />;
  if (l.includes('github')) return <GitHubIcon />;
  if (l.includes('linkedin')) return <LinkedInIcon />;
  return <WebIcon />;
}

export default function Hero({ cv, theme }) {
  const heroCopy = useMemo(() => buildHeroCopy(cv), [cv]);
  const contactLinks = useMemo(() => buildContactLinks(cv), [cv]);
  const initials = getInitials(cv.name);
  const headline = getFirstSentence(cv.about) || `${cv.currentJobTitle || 'Portfolio'}.`;
  const skills = (cv.skills || []).slice(0, 3).map(s => typeof s === 'string' ? s : s?.name || '').filter(Boolean);
  const topicLine = skills.length > 0 ? skills.join('   +   ') : '';
  const description = heroCopy || 'Building things that matter.';
  const primaryLink = cv.website || cv.socialLinks?.linkedin || cv.socialLinks?.github;
  const badgeSocials = contactLinks.filter(l => l.label !== 'Email').slice(0, 3);
  const contactHref = cv.email ? `mailto:${cv.email}` : (primaryLink || '#');

  return (
    <Section>
      <BadgeCard theme={theme} lanyard animate>
        {/* Progress dots */}
        <ProgressDots>
          <Dot $active $theme={theme} />
          <Dot $theme={theme} />
          <Dot $theme={theme} />
        </ProgressDots>

        {/* Top: Avatar + Name/Title + Socials */}
        <TopSection>
          <Avatar $theme={theme}>{initials}</Avatar>
          <ContentCol>
            <TextCol>
              <NameText $theme={theme}>{cv.name || 'Your Name'}</NameText>
              <TitleText $theme={theme}>{cv.currentJobTitle || 'Portfolio'}</TitleText>
            </TextCol>
            {badgeSocials.length > 0 && (
              <SocialIcons>
                {badgeSocials.map(link => (
                  <SocialLink
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    title={link.label}
                    $theme={theme}
                  >
                    {getSocialIcon(link.label)}
                  </SocialLink>
                ))}
              </SocialIcons>
            )}
          </ContentCol>
        </TopSection>

        {/* Available */}
        <AvailRow>
          <AvailDotWrap>
            <AvailDot $theme={theme} />
          </AvailDotWrap>
          <AvailLabel $theme={theme}>
            {cv.location ? `Based in ${cv.location}` : 'Available for opportunities'}
          </AvailLabel>
        </AvailRow>

        {/* Headline */}
        <HeadlineWrap>
          <Headline $theme={theme}>{headline}</Headline>
        </HeadlineWrap>

        {/* Topic + description */}
        <DescBlock>
          {topicLine && (
            <TopicBadge $theme={theme}>
              <TopicText $theme={theme}>{topicLine}</TopicText>
            </TopicBadge>
          )}
          <BodyText $theme={theme}>{description}</BodyText>
        </DescBlock>

        {/* Button */}
        <ButtonRow>
          <ContactBtn $theme={theme} href={contactHref}>
            <BtnLabel>Contact</BtnLabel>
            <BtnIcon $theme={theme}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="13" x2="13" y2="1" />
                <polyline points="4 1 13 1 13 10" />
              </svg>
            </BtnIcon>
          </ContactBtn>
        </ButtonRow>

        {/* Bottom location */}
        <BottomRow>
          <LocationRow $theme={theme}>
            <LocationIcon />
            <LocationText $theme={theme}>
              <LocationMuted>Currently based in </LocationMuted>
              {cv.location || 'Remote'}
              <LocationMuted>, available worldwide.</LocationMuted>
            </LocationText>
          </LocationRow>
        </BottomRow>
      </BadgeCard>
    </Section>
  );
}

/* ── Keyframes ── */

const fadeUp = keyframes`
  from { opacity: 0.001; transform: translateY(30px); }
  to   { opacity: 1;     transform: translateY(0); }
`;

const pulseDot = keyframes`
  from { opacity: 1; }
  to   { opacity: 0.4; }
`;

/* ── Styled ── */

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0 40px;

  @media (max-width: ${BREAKPOINT}px) {
    padding: 70px 0 30px;
  }
`;

/* Progress dots */
const ProgressDots = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 16px;
`;

const Dot = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 50px;
  background: ${p => p.$active ? 'rgb(158, 243, 74)' : 'rgb(239, 239, 239)'};
`;

/* Top section */
const TopSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  animation: ${fadeUp} 1.3s cubic-bezier(0.68, 0, 0.31, 0.91) 0s both;
`;

const Avatar = styled.div`
  display: var(--initial-display, grid);
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${p => p.$theme.accent} 0%, ${p => p.$theme.lime} 100%);
  color: #ffffff;
  font-family: ${FONT.family};
  font-size: 20px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.06em;
  flex-shrink: 0;
`;

const ContentCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

const TextCol = styled.div``;

const NameText = styled.div`
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 18px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 1.2;
`;

const TitleText = styled.div`
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 10px;
`;

const SocialLink = styled.a`
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  color: ${p => p.$theme.text};
  opacity: 0.4;
  transition: opacity 0.2s;
  text-decoration: none;
  &:hover { opacity: 1; }
`;

/* Available */
const AvailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const AvailDotWrap = styled.div`
  display: flex;
  align-items: center;
`;

const AvailDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$theme.lime};
  animation: ${pulseDot} 0.6s cubic-bezier(0.68, 0, 0.31, 0.91) infinite alternate;
`;

const AvailLabel = styled.span`
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;

/* Headline */
const HeadlineWrap = styled.div`
  margin-bottom: 20px;
  animation: ${fadeUp} 1.3s cubic-bezier(0.68, 0, 0.31, 0.91) 0.1s both;
`;

const Headline = styled.h1`
  margin: 0;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: clamp(30px, 5vw, 42px);
  font-weight: ${FONT.semibold};
  letter-spacing: -0.05em;
  line-height: 110%;
`;

/* Description block */
const DescBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  animation: ${fadeUp} 1.3s cubic-bezier(0.68, 0, 0.31, 0.91) 0.2s both;
`;

const TopicBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 50px;
  background: ${p => p.$theme.formBg};
  align-self: flex-start;
`;

const TopicText = styled.span`
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 13px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.02em;
  text-transform: lowercase;
`;

const BodyText = styled.p`
  margin: 0;
  color: ${p => p.$theme.text};
  opacity: 0.6;
  font-family: ${FONT.family};
  font-size: 16px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  line-height: 1.55;
`;

/* Button */
const ButtonRow = styled.div`
  margin-bottom: 24px;
  animation: ${fadeUp} 1.3s cubic-bezier(0.68, 0, 0.31, 0.91) 0.25s both;
`;

const ContactBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 8px 0 24px;
  border-radius: 100px;
  background: ${p => p.$theme.accent};
  color: #ffffff;
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 16px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.04em;
  transition: opacity 0.2s;
  position: relative;
  overflow: hidden;

  &:hover { opacity: 0.9; }
`;

const BtnLabel = styled.span``;

const BtnIcon = styled.span`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: ${p => p.$theme.white};
`;

/* Bottom location */
const BottomRow = styled.div``;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${p => p.$theme.text};
  opacity: 0.7;
`;

const LocationText = styled.span`
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  color: ${p => p.$theme.text};
`;

const LocationMuted = styled.span`
  opacity: 0.6;
`;
