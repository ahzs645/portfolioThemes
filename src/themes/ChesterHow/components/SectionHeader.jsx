import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../styles';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0.5rem 2rem;

  @media (min-width: 768px) { gap: 2rem; }
`;

const Title = styled.h1`
  margin: 0;
  font-family: ${fonts.serif};
  font-variation-settings: "opsz" 72, "SOFT" 50;
  font-weight: 200;
  font-size: 3.75rem;
  line-height: 1;
  letter-spacing: -0.03em;
  color: ${colors.text900};

  @media (min-width: 768px) { font-size: 6rem; }
`;

const Sub = styled.p`
  margin: 0;
  max-width: 65ch;
  letter-spacing: -0.025em;
  color: ${colors.text400};
  font-weight: 300;
`;

export function SectionHeader({ title, description }) {
  return (
    <Wrap>
      <Title>{title}<span style={{ color: colors.text400 }}>.</span></Title>
      {description && <Sub>{description}</Sub>}
    </Wrap>
  );
}
