import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { ACCENT, ACCENT_SOFT, ASSETS } from '../constants';
import { useDotLottiePlayer } from '../hooks';

function getCurrentCompany(cv) {
  const active = (cv?.experience || []).filter((entry) => {
    const end = String(entry?.endDate || '').trim().toLowerCase();
    return !end || end === 'present';
  });

  return active.at(-1)?.company || cv?.experience?.[0]?.company || '';
}

function getPrimaryLinks(cv) {
  const social = cv?.socialLinks || {};
  return [
    social.twitter && { label: 'Twitter', href: social.twitter },
    social.linkedin && { label: 'LinkedIn', href: social.linkedin },
    social.instagram && { label: 'Instagram', href: social.instagram },
    social.github && { label: 'GitHub', href: social.github },
    cv?.email && { label: 'send me an email', href: `mailto:${cv.email}` },
  ].filter(Boolean);
}

function ContactSentence({ links }) {
  if (!links.length) return null;

  return (
    <>
      {"don't be a stranger - say hi on "}
      {links.map((link, index) => (
        <React.Fragment key={link.label}>
          <ContactLink href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </ContactLink>
          {index < links.length - 1 ? ' or ' : ' :)'}
        </React.Fragment>
      ))}
    </>
  );
}

export function HeroIntro({ cv }) {
  const isLottieReady = useDotLottiePlayer();
  const name = (cv?.name || 'joost damhuis').toLowerCase();
  const title = (cv?.currentJobTitle || 'junior visual designer').toLowerCase();
  const company = String(getCurrentCompany(cv) || '').toLowerCase();
  const contactLinks = getPrimaryLinks(cv).slice(0, 3);
  const roleHref = cv?.website || cv?.socialLinks?.linkedin || '';

  return (
    <Wrap
      initial={{ opacity: 0, filter: 'blur(5px)', y: 18 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
    >
      <ModelPill>
        {isLottieReady ? (
          <dotlottie-player
            src={ASSETS.modelLottie}
            autoplay
            loop
            direction="-1"
            speed="1"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <ModelFallback />
        )}
      </ModelPill>

      <CopyStack>
        <Name>{name}</Name>
        <Role>
          {title}
          {company ? (
            <>
              {' at '}
              {roleHref ? (
                <RoleLink href={roleHref} target="_blank" rel="noreferrer">
                  {company}
                </RoleLink>
              ) : (
                company
              )}
            </>
          ) : null}
        </Role>
        <Contact>
          <ContactSentence links={contactLinks} />
        </Contact>
      </CopyStack>
    </Wrap>
  );
}

const Wrap = styled(motion.div)`
  display: flex;
  width: min-content;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  text-align: center;
  user-select: none;
`;

const ModelPill = styled.div`
  width: 99px;
  height: 69px;
`;

const ModelFallback = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background:
    radial-gradient(circle at 35% 28%, rgba(120, 255, 223, 0.92), transparent 44%),
    radial-gradient(circle at 72% 64%, rgba(120, 255, 223, 0.36), transparent 42%),
    rgba(120, 255, 223, 0.08);
  box-shadow: inset 0 0 16px rgba(120, 255, 223, 0.14);
`;

const CopyStack = styled.div`
  display: flex;
  width: min-content;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const sharedText = `
  margin: 0;
  font-family: 'Alpha Lyrae', sans-serif;
  font-weight: 500;
  text-align: center;
  text-transform: lowercase;
`;

const Name = styled.p`
  ${sharedText}
  width: 211px;
  color: ${ACCENT};
  font-size: 22px;
  line-height: 1.1;
  letter-spacing: 0.01em;
  font-feature-settings: 'liga' off, 'ss01' on;
`;

const Role = styled.p`
  ${sharedText}
  width: 199px;
  color: ${ACCENT};
  font-size: 22px;
  letter-spacing: 0.01em;
  font-feature-settings: 'liga' off, 'calt' off, 'ss01' on;
`;

const Contact = styled.p`
  ${sharedText}
  width: 229px;
  color: ${ACCENT_SOFT};
  font-size: 15px;
  line-height: 1.6;
  letter-spacing: 0.03em;
  font-feature-settings: 'calt' off, 'salt' on, 'liga' off, 'ss01' on;
`;

const RoleLink = styled.a`
  color: ${ACCENT};
  text-decoration: none;

  &:hover {
    color: ${ACCENT_SOFT};
  }
`;

const ContactLink = styled.a`
  color: ${ACCENT_SOFT};
  text-decoration: none;

  &:hover {
    color: ${ACCENT};
  }
`;
