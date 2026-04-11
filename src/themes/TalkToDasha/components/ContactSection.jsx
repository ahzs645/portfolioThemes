import React from 'react';
import styled from 'styled-components';
import { FolderCard } from './FolderCard';
import { palette, FILE_TAB_PATH, FILE_TAB_VIEWBOX } from '../styles';

export function ContactSection({ email }) {
  return (
    <FolderCard tone="terracotta" label="Contact">
      <Card>
        <Shape viewBox={FILE_TAB_VIEWBOX} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="contact-shadow" x="-5%" y="-10%" width="110%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.08" />
            </filter>
          </defs>
          <path d={FILE_TAB_PATH} fill={palette.white} filter="url(#contact-shadow)" />
        </Shape>
        <Content>
          <Tagline>
            Looking for <strong>a design mentorship?</strong>
          </Tagline>
          {email && (
            <Link href={`mailto:${email}`}>See available slots</Link>
          )}
        </Content>
      </Card>
    </FolderCard>
  );
}

const Card = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 230 / 120;
`;

const Shape = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

const Content = styled.div`
  position: absolute;
  inset: 0;
  padding: 14% 14% 10% 10%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;
  text-align: left;
`;

const Tagline = styled.div`
  font-size: 14px;
  color: ${palette.textDark};
  line-height: 1.35;

  strong {
    font-weight: 500;
  }
`;

const Link = styled.a`
  font-size: 14px;
  color: ${palette.textDark};
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
  width: fit-content;
`;
