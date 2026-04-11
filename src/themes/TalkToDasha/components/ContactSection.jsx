import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { palette, cards, FOLDER_PATH, FOLDER_VIEWBOX } from '../styles';

export function ContactSection({ email }) {
  const href = email ? `mailto:${email}` : '#';

  return (
    <Wrap>
      <ActionCard
        href={href}
        target={email ? undefined : '_self'}
        whileHover={{ rotate: 4, y: -3 }}
        whileFocus={{ rotate: 4, y: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <Content>
          <Tagline>
            <Muted>Looking for a design</Muted>
            <strong>mentorship?</strong>
          </Tagline>
          {email && <LinkText>See available slots</LinkText>}
        </Content>
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
  top: 18px;
  left: 18px;
  right: 18px;
  bottom: 45px;
  border-radius: 8px;
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

const Tagline = styled.div`
  font-size: 18px;
  color: ${palette.textDark};
  line-height: 1.08;
  font-weight: 500;

  strong {
    font-weight: 500;
    display: block;
  }
`;

const Muted = styled.span`
  display: block;
  color: ${palette.text};
`;

const LinkText = styled.span`
  margin-top: 6px;
  font-size: 14px;
  color: ${palette.textDark};
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
  width: fit-content;
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
