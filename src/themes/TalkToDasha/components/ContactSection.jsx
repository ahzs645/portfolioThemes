import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { palette, cards, FOLDER_PATH, FOLDER_VIEWBOX } from '../styles';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function ContactSection({ email }) {
  const href = email ? `mailto:${email}` : '#';
  const [active, setActive] = useState(false);
  const [marker, setMarker] = useState({ x: 0, y: 0 });

  const updateMarker = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;

    setMarker({
      x: clamp(localX - bounds.width * 0.5, -18, 18),
      y: clamp(localY - bounds.height * 0.5, -10, 10),
    });
  };

  return (
    <Wrap>
      <ActionCard
        href={href}
        target={email ? undefined : '_self'}
        initial={false}
        animate={{
          rotate: active ? 4 : 0,
          top: active ? 13 : 18,
          bottom: 45,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        onMouseEnter={() => setActive(true)}
        onMouseMove={updateMarker}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
      >
        <Content>
          <Heading>
            <Muted>Looking for </Muted>
            a design mentorship?
          </Heading>
          <LinkText>See available slots</LinkText>
        </Content>

        {active ? (
          <Badge
            initial={{ opacity: 0, scale: 0.96, rotate: -7 }}
            animate={{ opacity: 1, scale: 1, rotate: -7 }}
            exit={{ opacity: 0, scale: 0.96, rotate: -7 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <BadgeMarker
              animate={{ x: marker.x, y: marker.y }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
            <BadgeText>See you soon!</BadgeText>
          </Badge>
        ) : null}
      </ActionCard>

      <FolderFace
        viewBox={FOLDER_VIEWBOX}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={FOLDER_PATH} fill={cards.terracotta.bg} />
      </FolderFace>

      <FooterRow>
        <Label>Contact</Label>
      </FooterRow>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  width: min(230px, 100%);
  aspect-ratio: 230 / 248;
  justify-self: center;
  border-radius: 24px;
  overflow: hidden;
  background: ${cards.terracotta.bg};
`;

const ActionCard = styled(motion.a)`
  position: absolute;
  left: 18px;
  right: 18px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -4px 20px rgba(129, 29, 29, 0.2);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
`;

const Content = styled.div`
  position: absolute;
  top: 9px;
  left: 11px;
  width: 170px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
`;

const Heading = styled.h4`
  margin: 0;
  font-size: 18px;
  color: ${palette.textDark};
  line-height: 1.08;
  font-weight: 500;
`;

const Muted = styled.span`
  color: ${palette.text};
`;

const LinkText = styled.span`
  margin-top: 6px;
  width: fit-content;
  font-size: 18px;
  font-weight: 500;
  color: ${palette.textDark};
  text-decoration: underline;
  text-underline-offset: 3px;
`;

const Badge = styled(motion.div)`
  position: absolute;
  top: 45px;
  right: 10px;
  padding: 9px 12px 9px 31px;
  border-radius: 10px;
  background: #000;
  color: #fff;
  overflow: hidden;
`;

const BadgeMarker = styled(motion.span)`
  position: absolute;
  left: 12px;
  top: calc(50% - 5px);
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #fff;
  opacity: 0.9;
`;

const BadgeText = styled.div`
  position: relative;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
`;

const FolderFace = styled.svg`
  position: absolute;
  left: 0;
  right: 0;
  top: 128px;
  bottom: 0;
  width: 100%;
  height: auto;
  display: block;
`;

const FooterRow = styled.div`
  position: absolute;
  left: 11px;
  width: 208px;
  bottom: 16px;
  display: flex;
  align-items: center;
`;

const Label = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: ${cards.terracotta.ink};
`;
