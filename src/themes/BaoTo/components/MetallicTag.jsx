import React from 'react';
import styled from 'styled-components';

/**
 * Metallic-styled tag pill matching baothiento.com's Tag component.
 * Gradient background with subtle shine effects.
 */

const TagEl = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: rgba(42, 37, 32, 0.40);
  padding: 2px 8px;
  border-radius: 5px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 120%, rgba(220, 224, 228, 0.4) 0%, rgba(180, 186, 194, 0.25) 50%, rgba(140, 148, 158, 0.15) 100%),
    rgba(0, 0, 0, 0.03);
  cursor: ${p => p.as === 'a' ? 'pointer' : 'default'};
  text-decoration: none;
  transition: color 0.2s;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
    pointer-events: none;
  }

  &:hover {
    color: rgba(42, 37, 32, 0.65);
  }

  @media (min-width: 768px) {
    font-size: 11px;
    padding: 2px 10px;
  }
`;

export function MetallicTag({ label, href }) {
  if (href) {
    return (
      <TagEl as="a" href={href} target="_blank" rel="noreferrer">
        {label}
      </TagEl>
    );
  }
  return <TagEl>{label}</TagEl>;
}
