import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  ArrowRight, Mail, MapPin,
  Terminal, Radio, ChevronDown, Plus, Circle,
  Sparkles, Activity,
} from 'lucide-react';
import { GithubIcon as Github, LinkedinIcon as Linkedin } from './Icons';
import { Block, SectionGrid } from './Block';

const SVG_BG = `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%233f3f46' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`;

export default function Hero({ cv }) {
  const { name, currentJobTitle, location, email, avatar, socialLinks } = cv;

  const scrollToProjects = (e) => {
    e.preventDefault();
    const el = document.querySelector('#fr-projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <HeroSection id="fr-home" style={{ backgroundImage: SVG_BG }}>
      <FloatingPlus
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Plus size={24} />
      </FloatingPlus>
      <FloatingCircle
        animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <Circle size={16} fill="currentColor" />
      </FloatingCircle>

      <SectionGrid>
        {/* Profile Image */}
        {avatar && (
          <Block style={{ gridColumn: 'span 12', padding: 16 }} className="profile-img-block">
            <ProfileImageWrap>
              <ProfileImageInner>
                <ProfileImg src={avatar} alt={name} />
                <StatusDot />
              </ProfileImageInner>
            </ProfileImageWrap>
          </Block>
        )}

        {/* Profile Info */}
        <Block style={{ gridColumn: 'span 12' }} className="profile-info-block">
          <ProfileInfo>
            <PortfolioLabel>
              <Terminal size={18} color="#71717a" />
              <span>portfolio</span>
            </PortfolioLabel>
            <Name>{name}</Name>
            <TitleRow>
              <TitleText>{currentJobTitle}</TitleText>
            </TitleRow>
          </ProfileInfo>
        </Block>

        {/* Status */}
        <StatusBlock
          whileHover={{ rotate: '2deg', scale: 1.05 }}
          style={{ gridColumn: 'span 12' }}
        >
          <StatusGlow />
          <StatusContent>
            <LiveBadge
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <LiveDotWrap>
                <LiveDotGlow
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Radio size={12} fill="currentColor" style={{ position: 'relative', color: '#4ade80' }} />
              </LiveDotWrap>
              <LiveText>LIVE</LiveText>
            </LiveBadge>
            <StatusTitle>Available</StatusTitle>
            <StatusSub>Open to new opportunities</StatusSub>
          </StatusContent>
        </StatusBlock>

        {/* Socials */}
        <Block style={{ gridColumn: 'span 12' }} className="socials-block">
          <SocialsLabel>Connect</SocialsLabel>
          <SocialsRow>
            {socialLinks?.github && (
              <SocialBtn href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github size={28} color="#fff" />
              </SocialBtn>
            )}
            {socialLinks?.linkedin && (
              <SocialBtn href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" $hoverBg="#2563eb">
                <Linkedin size={28} color="#60a5fa" />
              </SocialBtn>
            )}
            {email && (
              <SocialBtn href={`mailto:${email}`} aria-label="Email" $hoverBg="#16a34a">
                <Mail size={28} color="#4ade80" />
              </SocialBtn>
            )}
          </SocialsRow>
        </Block>

        {/* Location */}
        {location && (
          <Block whileHover={{ rotate: '1.5deg', scale: 1.02 }} style={{ gridColumn: 'span 12' }} className="location-block">
            <MapPin size={28} color="#fbbf24" style={{ marginBottom: 12 }} />
            <LocationLabel>Based in</LocationLabel>
            <LocationValue>{location}</LocationValue>
          </Block>
        )}

        {/* Tagline */}
        <TaglineBlock style={{ gridColumn: 'span 12' }}>
          <TaglineInner>
            <Sparkles size={24} color="#c084fc" style={{ flexShrink: 0 }} />
            <TaglineText>{cv.about ? cv.about.split('.')[0] + '.' : `${name}'s Portfolio`}</TaglineText>
          </TaglineInner>
        </TaglineBlock>

        {/* CTA */}
        <CTAMotion
          variants={{
            initial: { scale: 0.5, y: 50, opacity: 0 },
            animate: { scale: 1, y: 0, opacity: 1 },
          }}
          transition={{ type: 'spring', mass: 3, stiffness: 400, damping: 50 }}
          whileHover={{ rotate: '-1deg', scale: 1.03, y: -4 }}
        >
          <CTALink href="#fr-projects" onClick={scrollToProjects}>
            <ShimmerBar
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <CTAContent>
              <Activity size={28} color="#fb923c" style={{ marginBottom: 8 }} />
              <CTATitle>View Work</CTATitle>
              <CTASub>See what I've built</CTASub>
            </CTAContent>
          </CTALink>
        </CTAMotion>

        {/* Scroll indicator */}
        <ScrollIndicator
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ScrollLabel>Scroll</ScrollLabel>
          <ScrollChevronWrap>
            <ChevronDown size={20} color="#52525b" />
            <ScrollChevronPulse
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown size={20} color="#fbbf24" />
            </ScrollChevronPulse>
          </ScrollChevronWrap>
        </ScrollIndicator>
      </SectionGrid>
    </HeroSection>
  );
}

/* ---- Responsive column overrides ---- */
const responsiveColumns = `
  @media (min-width: 640px) { grid-column: span 6; }
`;

/* ---- Styled components ---- */

const HeroSection = styled.section`
  min-height: 100vh;
  background-color: #18181b;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding-top: 160px;
  padding-bottom: 40px;
  @media (min-width: 640px) { padding-top: 96px; }

  .profile-img-block { ${responsiveColumns} @media (min-width: 768px) { grid-column: span 3; } }
  .profile-info-block { ${responsiveColumns} @media (min-width: 768px) { grid-column: span 9; } }
  .socials-block { ${responsiveColumns} @media (min-width: 768px) { grid-column: span 4; } }
  .location-block { ${responsiveColumns} @media (min-width: 768px) { grid-column: span 4; } }
`;

const FloatingPlus = styled(motion.div)`
  position: absolute;
  top: 128px;
  left: 25%;
  color: rgba(63, 63, 70, 0.5);
`;

const FloatingCircle = styled(motion.div)`
  position: absolute;
  bottom: 33%;
  right: 25%;
  color: rgba(63, 63, 70, 0.3);
`;

const ProfileImageWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const ProfileImageInner = styled.div`
  position: relative;
`;

const ProfileImg = styled.img`
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
`;

const StatusDot = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #4ade80;
  border-radius: 50%;
  border: 4px solid #27272a;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  gap: 12px;
`;

const PortfolioLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  & > span {
    font-size: 12px;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;

const Name = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  @media (min-width: 640px) { font-size: 3rem; }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleText = styled.span`
  font-size: 14px;
  color: #71717a;
`;

const StatusBlock = styled(Block)`
  background: linear-gradient(135deg, rgba(20, 83, 45, 0.2), rgba(6, 78, 59, 0.2));
  border-color: rgba(22, 101, 52, 0.3);
  position: relative;
  overflow: hidden;
  @media (min-width: 640px) { grid-column: span 6; }
  @media (min-width: 768px) { grid-column: span 4; }
`;

const StatusGlow = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 128px;
  height: 128px;
  background: rgba(74, 222, 128, 0.05);
  border-radius: 50%;
  filter: blur(24px);
`;

const StatusContent = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  height: 100%;
  place-content: center;
  text-align: center;
`;

const LiveBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 9999px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  width: fit-content;
  margin: 0 auto;
`;

const LiveDotWrap = styled.div`
  position: relative;
`;

const LiveDotGlow = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: #4ade80;
  border-radius: 50%;
  filter: blur(8px);
`;

const LiveText = styled.span`
  color: #4ade80;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.05em;
`;

const StatusTitle = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 8px 0 0;
`;

const StatusSub = styled.p`
  font-size: 12px;
  color: #71717a;
  margin: 4px 0 0;
`;

const SocialsLabel = styled.h3`
  font-size: 12px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
`;

const SocialsRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const SocialBtn = styled.a`
  padding: 16px;
  background: #3f3f46;
  border-radius: 8px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: ${(p) => p.$hoverBg || '#52525b'};
  }
`;

const LocationLabel = styled.p`
  font-size: 12px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 4px;
`;

const LocationValue = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0;
`;

const TaglineBlock = styled(Block)`
  background: linear-gradient(90deg, rgba(39, 39, 42, 0.5), transparent);
  @media (min-width: 640px) { grid-column: span 6; }
  @media (min-width: 768px) { grid-column: span 8; }
`;

const TaglineInner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TaglineText = styled.p`
  font-size: 20px;
  line-height: 1.6;
  color: #d4d4d8;
  margin: 0;
`;

const CTAMotion = styled(motion.div)`
  grid-column: span 12;
  background: #27272a;
  border-radius: 12px;
  border: 2px solid #3f3f46;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  @media (min-width: 640px) { grid-column: span 6; }
  @media (min-width: 768px) { grid-column: span 4; }
`;

const CTALink = styled.a`
  display: block;
  height: 100%;
  text-decoration: none;
`;

const ShimmerBar = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(82, 82, 91, 0.2), transparent);
`;

const CTAContent = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  height: 100%;
  place-content: center;
  text-align: center;
  padding: 24px;
`;

const CTATitle = styled.p`
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  margin: 0 0 8px;
`;

const CTASub = styled.p`
  color: #a1a1aa;
  font-size: 12px;
  margin: 0;
`;

const ScrollIndicator = styled(motion.div)`
  grid-column: span 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
  gap: 8px;
  color: #71717a;
`;

const ScrollLabel = styled.p`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
`;

const ScrollChevronWrap = styled.div`
  position: relative;
`;

const ScrollChevronPulse = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
