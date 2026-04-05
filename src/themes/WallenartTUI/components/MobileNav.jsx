import React from 'react';
import styled from 'styled-components';
import { colors } from '../utils/tokens';

export function MobileNav({ name, menuOpen, onToggle }) {
  return (
    <NavContainer>
      <NavName>{name}</NavName>
      <HamburgerWrap>
        <Checkbox
          type="checkbox"
          checked={menuOpen}
          onChange={onToggle}
          aria-label="Mobile menu toggle"
        />
        <HamburgerLines>
          <Line $open={menuOpen} $line={1} />
          <Line $open={menuOpen} $line={2} />
          <Line $open={menuOpen} $line={3} />
        </HamburgerLines>
      </HamburgerWrap>
    </NavContainer>
  );
}

const NavContainer = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    top: var(--app-top-offset, 0px);
    left: 0;
    justify-content: space-between;
    align-items: center;
    padding: 0 5vw;
    width: 100vw;
    height: 60px;
    background-color: ${colors.primaryBg};
    opacity: 0.95;
    z-index: 999;
    box-sizing: border-box;
  }
`;

const NavName = styled.div`
  font-size: 1.1rem;
  color: ${colors.lightBlue};
  font-weight: bold;
`;

const HamburgerWrap = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
`;

const Checkbox = styled.input`
  display: block;
  position: absolute;
  height: 32px;
  width: 32px;
  cursor: pointer;
  opacity: 0;
  z-index: 5;
  margin: 0;
`;

const HamburgerLines = styled.div`
  height: 26px;
  width: 30px;
  position: absolute;
  top: 3px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
`;

const Line = styled.span`
  display: block;
  height: 3px;
  width: 100%;
  border: 0.1px solid ${colors.primaryText};
  transition: transform 0.2s ease-in-out;

  ${(p) => {
    if (p.$line === 1) {
      return `
        transform-origin: 0% 0%;
        transform: ${p.$open ? 'rotate(45deg)' : 'none'};
      `;
    }
    if (p.$line === 2) {
      return `
        transform: ${p.$open ? 'scaleY(0)' : 'none'};
      `;
    }
    if (p.$line === 3) {
      return `
        transform-origin: 0% 100%;
        transform: ${p.$open ? 'rotate(-45deg)' : 'none'};
      `;
    }
  }}
`;
