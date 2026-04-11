import React from 'react';
import styled from 'styled-components';
import { TAG_PALETTE, fonts } from '../styles';

const Chip = styled.span`
  display: inline-block;
  padding: 0.125rem 0.375rem 0.25rem;
  border-radius: 0.25rem;
  font-family: ${fonts.mono};
  font-size: 0.75rem;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 -2px 0 1px rgba(0, 0, 0, 0.1);
`;

export function Tag({ label, color = 'orange' }) {
  const palette = TAG_PALETTE[color] || TAG_PALETTE.orange;
  return (
    <Chip $bg={palette.bg} $color={palette.text}>
      {String(label || '').toUpperCase()}
    </Chip>
  );
}
