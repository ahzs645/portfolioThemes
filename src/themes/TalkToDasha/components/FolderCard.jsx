import React from 'react';
import styled from 'styled-components';
import { cards, FOLDER_PATH, FOLDER_VIEWBOX } from '../styles';

export function FolderCard({ tone = 'lavender', label, children }) {
  const color = cards[tone] || cards.lavender;

  return (
    <Wrap>
      <Shape
        viewBox={FOLDER_VIEWBOX}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={`shadow-${tone}`} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="10"
              floodColor="#000"
              floodOpacity="0.12"
            />
          </filter>
        </defs>
        <path
          d={FOLDER_PATH}
          fill={color.bg}
          filter={`url(#shadow-${tone})`}
        />
      </Shape>

      <Inner>
        <InnerTop>{children}</InnerTop>
        {label && <Label $ink={color.ink}>{label}</Label>}
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  aspect-ratio: 230 / 260;
  min-height: 280px;
`;

const Shape = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

const Inner = styled.div`
  position: absolute;
  inset: 0;
  padding: 7% 6% 7%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
`;

const InnerTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 4%;
`;

const Label = styled.div`
  font-size: 22px;
  font-weight: 500;
  color: ${(p) => p.$ink};
  letter-spacing: -0.01em;
`;
