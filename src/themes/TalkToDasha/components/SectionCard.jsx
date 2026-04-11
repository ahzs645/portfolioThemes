import React from 'react';
import styled from 'styled-components';
import { palette, cards } from '../styles';

export function SectionCard({ tone = 'lavender', heading, children }) {
  return (
    <Card $tone={tone}>
      {heading && <Heading>{heading}</Heading>}
      {children}
    </Card>
  );
}

const Card = styled.section`
  position: relative;
  background: ${(p) => cards[p.$tone]?.bg || cards.lavender.bg};
  color: ${(p) => cards[p.$tone]?.ink || cards.lavender.ink};
  border-radius: 24px;
  padding: 72px 32px 48px;
  box-shadow:
    0 -4px 24px ${(p) => cards[p.$tone]?.shadow || cards.lavender.shadow},
    0 12px 32px ${(p) => cards[p.$tone]?.shadow || cards.lavender.shadow};
`;

const Heading = styled.h2`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: ${palette.textDark};
  background: ${palette.bg};
  padding: 8px 20px;
  border-radius: 1000px;
  white-space: nowrap;
`;
