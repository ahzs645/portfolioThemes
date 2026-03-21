import React from 'react';
import styled from 'styled-components';

const navItems = [
  { id: 'home', label: 'HOME', emoji: '\u{1F3E0}' },
  { id: 'info', label: 'INFO', emoji: '\u{1F48C}' },
  { id: 'projects', label: 'PROJECTS', emoji: '\u{1F4BB}' },
  { id: 'logs', label: 'LOGS', emoji: '\u{1F340}' },
];

export default function TopBar({ activeTab, onTabChange }) {
  return (
    <>
      <Bar>
        <GradientBg />
        <NavContent>
          <NavLinks>
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                $active={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
                data-cursor-hover
              >
                <NavEmoji>{item.emoji}</NavEmoji>
                <NavLabel $active={activeTab === item.id}>{item.label}</NavLabel>
              </NavLink>
            ))}
          </NavLinks>
          <NavLink
            $active={activeTab === 'credits'}
            onClick={() => onTabChange('credits')}
            data-cursor-hover
          >
            <NavEmoji>{'\u{1F39E}'}</NavEmoji>
            <NavLabel $active={activeTab === 'credits'}>CREDITS</NavLabel>
          </NavLink>
        </NavContent>
      </Bar>

      <MobileNav>
        {navItems.map((item) => (
          <MobileNavItem
            key={item.id}
            $active={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          >
            <MobileEmoji>{item.emoji}</MobileEmoji>
          </MobileNavItem>
        ))}
        <MobileNavItem
          $active={activeTab === 'credits'}
          onClick={() => onTabChange('credits')}
        >
          <MobileEmoji>{'\u{1F39E}'}</MobileEmoji>
        </MobileNavItem>
      </MobileNav>
    </>
  );
}

const Bar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 52px;
  z-index: 10;

  @media (max-width: 809px) {
    display: none;
  }
`;

const GradientBg = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgb(34, 41, 87) 0%,
    rgb(74, 88, 189) 49%,
    rgba(74, 87, 189, 0) 100%
  );
  pointer-events: none;
`;

const NavContent = styled.nav`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 64px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

const NavLink = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: none;

  &:hover span {
    color: rgb(194, 255, 97);
  }
`;

const NavEmoji = styled.span`
  font-family: 'Noto Emoji', sans-serif;
  font-size: 14px;
  letter-spacing: -0.03em;
  color: rgb(255, 255, 255);
  transition: color 0.2s;
`;

const NavLabel = styled.span`
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.03em;
  color: ${(p) => (p.$active ? 'rgb(194, 255, 97)' : 'rgb(255, 255, 255)')};
  text-decoration: ${(p) => (p.$active ? 'underline' : 'none')};
  text-decoration-style: ${(p) => (p.$active ? 'wavy' : 'none')};
  text-underline-offset: 2px;
  transition: color 0.2s;
`;

const MobileNav = styled.nav`
  display: none;
  position: fixed;
  top: 9px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  padding: 8px 16px;
  gap: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);

  @media (max-width: 809px) {
    display: flex;
    align-items: center;
  }
`;

const MobileNavItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 2px;
  cursor: none;
`;

const MobileEmoji = styled.span`
  font-size: 18px;
`;
