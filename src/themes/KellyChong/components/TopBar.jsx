import React from 'react';
import styled from 'styled-components';
import { HomeIcon, InfoIcon, ProjectsIcon, LogsIcon, CreditsIcon } from './NavIcons';

const navItems = [
  { id: 'home', label: 'HOME', icon: HomeIcon },
  { id: 'info', label: 'INFO', icon: InfoIcon },
  { id: 'projects', label: 'PROJECTS', icon: ProjectsIcon },
  { id: 'logs', label: 'LOGS', icon: LogsIcon },
];

export default function TopBar({ activeSection, onNavigate }) {
  return (
    <>
      <Bar>
        <GradientBg />
        <NavContent>
          <NavLinks>
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                href={`#${item.id}`}
                $active={activeSection === item.id}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
              >
                <item.icon active={activeSection === item.id} />
                <NavLabel $active={activeSection === item.id}>{item.label}</NavLabel>
              </NavLink>
            ))}
          </NavLinks>
          <NavLink
            href="#credits"
            $active={activeSection === 'credits'}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('credits');
            }}
          >
            <CreditsIcon active={activeSection === 'credits'} />
            <NavLabel $active={activeSection === 'credits'}>CREDITS</NavLabel>
          </NavLink>
        </NavContent>
      </Bar>

      <MobileNav>
        {navItems.map((item) => (
          <MobileNavItem
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.id);
            }}
          >
            <item.icon active={activeSection === item.id} />
          </MobileNavItem>
        ))}
        <MobileNavItem
          href="#credits"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('credits');
          }}
        >
          <CreditsIcon active={activeSection === 'credits'} />
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
  gap: 28px;
  align-items: center;
`;

const NavLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  cursor: pointer;
  padding: 4px 0;

  svg path {
    transition: fill 0.2s;
  }

  &:hover svg path {
    fill: rgb(194, 255, 97);
  }

  &:hover span {
    color: rgb(194, 255, 97);
  }
`;

const NavLabel = styled.span`
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: -0.03em;
  color: ${(p) => (p.$active ? 'rgb(255, 255, 255)' : 'rgb(255, 255, 255)')};
  text-decoration: ${(p) => (p.$active ? 'underline' : 'none')};
  text-underline-offset: 3px;
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

const MobileNavItem = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 2px;
`;
