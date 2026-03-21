import React, { useState } from 'react';
import styled from 'styled-components';

const crosshairSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" width="9" height="9">
    <path d="M 4.5 0 L 4.5 9" fill="none" stroke="rgb(255, 255, 255)" strokeWidth="1" />
    <path d="M 0 4.5 L 9 4.5" fill="none" stroke="rgb(255, 255, 255)" strokeWidth="1" />
  </svg>
);

export function ProjectMarker({ label, accent = false, style, href, onHover, onLeave }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Wrapper
      style={style}
      onMouseEnter={() => { setHovered(true); onHover?.(); }}
      onMouseLeave={() => { setHovered(false); onLeave?.(); }}
    >
      <MarkerRow as={href ? 'a' : 'div'} href={href || undefined} target={href ? '_blank' : undefined} rel={href ? 'noreferrer' : undefined}>
        <IconBox $accent={accent} $hovered={hovered}>
          {crosshairSvg}
        </IconBox>
        <LabelWrap $visible={hovered}>
          <LabelText>{label}</LabelText>
        </LabelWrap>
      </MarkerRow>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: absolute;
  transform: translate(-10px, -10px);
  z-index: 1;

  &:hover {
    z-index: 10;
  }
`;

const MarkerRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  cursor: pointer;
  text-decoration: none;
  height: 20px;
  overflow: visible;
`;

const IconBox = styled.div`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => (p.$accent ? '#f77c11' : p.$hovered ? '#000' : '#757575')};
  transition: background-color 0.15s ease;
`;

const LabelWrap = styled.div`
  display: ${(p) => (p.$visible ? 'flex' : 'none')};
  align-items: center;
  padding: 0 10px;
  background: #000;
`;

const LabelText = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  color: #fff;
  white-space: nowrap;
`;
