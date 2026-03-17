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
  const headline = cv.currentJobTitle || 'Portfolio';
  const description = getFirstSentence(cv.about) || heroCopy || 'Building things that matter.';
  const primaryLink = cv.website || cv.socialLinks?.linkedin || cv.socialLinks?.github;
  const badgeSocials = contactLinks.filter(l => l.label !== 'Email').slice(0, 3);

  return (
    <Section>
      <BadgeCard theme={theme} lanyard animate>
        {/* Progress dots */}
        <ProgressDots>
          <Dot $active $theme={theme} />
          <Dot $theme={theme} />
          <Dot $theme={theme} />
        </ProgressDots>

        {/* Identity row */}
        <IdentityRow>
          <Avatar $theme={theme}>{initials}</Avatar>
          <IdentityInfo>
            <IdentityName $theme={theme}>{cv.name || 'Your Name'}</IdentityName>
            <IdentityTitle $theme={theme}>{cv.currentJobTitle || 'Portfolio'}</IdentityTitle>
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
          </IdentityInfo>
        </IdentityRow>

        {/* Availability */}
        <AvailabilityRow>
          <AvailDot $theme={theme} />
          <AvailText $theme={theme}>
            {cv.location ? `Based in ${cv.location}` : 'Available for new opportunities'}
          </AvailText>
        </AvailabilityRow>
      </BadgeCard>

      {/* Hero text below badge */}
      <HeroText>
        <Headline $theme={theme}>{headline}</Headline>
        <Description $theme={theme}>{description}</Description>
        <Buttons>
          <PrimaryBtn $theme={theme} href={cv.email ? `mailto:${cv.email}` : '#work'}>
            Get in touch
          </PrimaryBtn>
          {primaryLink && (
            <SecondaryBtn $theme={theme} href={primaryLink} target="_blank" rel="noreferrer">
              {getDisplayUrl(primaryLink) || 'View work'}
            </SecondaryBtn>
          )}
        </Buttons>
      </HeroText>
    </Section>
  );
}

/* ── Keyframes ── */

const fadeUpContent = keyframes`
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
  padding: 80px 0 60px;

  @media (max-width: ${BREAKPOINT}px) {
    padding: 70px 0 40px;
  }
`;

/* Badge inner content */
const ProgressDots = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 8px;
`;

const Dot = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 4px;
  background: ${p => p.$active ? p.$theme.lime : p.$theme.border};
`;

const IdentityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  animation: ${fadeUpContent} 1.3s cubic-bezier(0.68, 0, 0.31, 0.91) 0s both;
`;

const Avatar = styled.div`
  display: grid;
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

const IdentityInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const IdentityName = styled.div`
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 18px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 1.2;
`;

const IdentityTitle = styled.div`
  margin-top: 2px;
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 6px;
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

const AvailabilityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const AvailDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$theme.lime};
  flex-shrink: 0;
  animation: ${pulseDot} 0.6s cubic-bezier(0.68, 0, 0.31, 0.91) infinite alternate;
`;

const AvailText = styled.span`
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;

/* Hero text below badge */
const HeroText = styled.div`
  max-width: 550px;
  width: 100%;
  text-align: center;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Headline = styled.h1`
  margin: 0;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: clamp(34px, 6vw, 50px);
  font-weight: ${FONT.semibold};
  letter-spacing: -0.05em;
  line-height: 110%;
  animation: ${fadeUpContent} 1.3s cubic-bezier(0.68, 0, 0.31, 0.91) 0.1s both;
`;

const Description = styled.p`
  margin: 0;
  max-width: 440px;
  color: ${p => p.$theme.text};
  opacity: 0.6;
  font-family: ${FONT.family};
  font-size: 16px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  line-height: 1.5;
  animation: ${fadeUpContent} 1.3s cubic-bezier(0.68, 0, 0.31, 0.91) 0.2s both;
`;

const Buttons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
  animation: ${fadeUpContent} 1.3s cubic-bezier(0.68, 0, 0.31, 0.91) 0.25s both;
`;

const PrimaryBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 58px;
  padding: 0 28px;
  border-radius: 100px;
  background: ${p => p.$theme.accent};
  color: #ffffff;
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 17px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.04em;
  transition: background 0.2s;
  &:hover { background: ${p => p.$theme.accentHover}; }
`;

const SecondaryBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 58px;
  padding: 0 28px;
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
