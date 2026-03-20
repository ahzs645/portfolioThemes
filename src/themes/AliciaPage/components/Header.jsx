import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';

export default function Header({ theme, activeSection, onNavigate }) {
  const navItems = [
    { id: 'experience', label: 'experience' },
    { id: 'projects', label: 'projects' },
    { id: 'education', label: 'education' },
    { id: 'about', label: 'about' },
  ];

  return (
    <HeaderBar>
      <HeaderInner>
        <LogoLink onClick={() => onNavigate?.('top')}>
          <LogoSvg viewBox="0 0 128 128" $theme={theme}>
            <path d="M128 83.6S99.1 77 70.2 77.8c-5.4 14.5-6.7 50.2-6.7 50.2s-3.7-26.1-18-47.9C32.3 82.5 7.6 93.7 7.6 93.7s17-13.6 25.8-29.5C24.4 54.2 0 38.5 0 38.5s24.4 9.9 44.4 9.4C48.2 35.4 45.8 0 45.8 0s2.5 23.3 18.4 44.6c13.5-3.1 47.1-20.1 47.1-20.1S93.7 37.1 80.7 57.3C92.5 68.6 128 83.6 128 83.6z" />
          </LogoSvg>
        </LogoLink>
        <Nav>
          {navItems.map(item => (
            <NavItem
              key={item.id}
              $active={activeSection === item.id}
              $theme={theme}
              onClick={() => onNavigate?.(item.id)}
            >
              {item.label}
            </NavItem>
          ))}
        </Nav>
      </HeaderInner>
    </HeaderBar>
  );
}

const HeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  margin-top: 16px;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 948px;
  width: 100%;
  padding: 0 8px;
  @media (min-width: 768px) { padding: 0 12px; }
`;

const LogoLink = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;

const LogoSvg = styled.svg`
  width: 32px;
  height: 32px;
  fill: ${p => p.$theme.primary};
  transition: transform 1s, color 0.5s;
  &:hover { transform: rotate(-270deg); }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NavItem = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: ${FONT.sans};
  font-size: 14px;
  color: ${p => p.$active ? p.$theme.primary : p.$theme.gray100};
  transition: color 0.3s ease-linear;
  padding: 0;
  &:hover { color: ${p => p.$theme.primary}; }
`;
