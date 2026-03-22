import React from 'react';
import styled from 'styled-components';
import { HomeIcon, InfoIcon, ProjectsIcon, LogsIcon, CreditsIcon } from './NavIcons';

const navItems = [
  { id: 'home', label: 'HOME', Icon: HomeIcon },
  { id: 'info', label: 'INFO', Icon: InfoIcon },
  { id: 'projects', label: 'PROJECTS', Icon: ProjectsIcon },
  { id: 'logs', label: 'LOGS', Icon: LogsIcon },
];

const BAR_GRADIENTS = {
  home: 'linear-gradient(180deg, rgb(34, 41, 87) 0%, rgb(74, 88, 189) 49%, rgba(74, 87, 189, 0) 100%)',
  info: 'linear-gradient(180deg, rgb(87, 55, 34) 0%, rgb(189, 140, 74) 49%, rgba(189, 140, 74, 0) 100%)',
  projects: 'linear-gradient(180deg, rgb(34, 60, 87) 0%, rgb(74, 140, 189) 49%, rgba(74, 140, 189, 0) 100%)',
  logs: 'linear-gradient(180deg, rgb(38, 70, 45) 0%, rgb(80, 155, 100) 49%, rgba(80, 155, 100, 0) 100%)',
  credits: 'linear-gradient(180deg, rgb(60, 38, 80) 0%, rgb(130, 95, 170) 49%, rgba(130, 95, 170, 0) 100%)',
};

export default function TopBar({ activeTab, onTabChange }) {
  return (
    <>
      <Bar>
        <GradientBg style={{ background: BAR_GRADIENTS[activeTab] || BAR_GRADIENTS.home }} />
        <NavContent>
          <NavLinks>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const iconColor = isActive ? 'rgb(194, 255, 97)' : 'rgb(255, 255, 255)';
              return (
                <NavLink
                  key={item.id}
                  $active={isActive}
                  onClick={() => onTabChange(item.id)}
                  data-cursor-hover
                >
                  <item.Icon color={iconColor} size={16} />
                  <NavLabel $active={isActive}>{item.label}</NavLabel>
                </NavLink>
              );
            })}
          </NavLinks>
          <NavLink
            $active={activeTab === 'credits'}
            onClick={() => onTabChange('credits')}
            data-cursor-hover
          >
            <CreditsIcon
              color={activeTab === 'credits' ? 'rgb(194, 255, 97)' : 'rgb(255, 255, 255)'}
              size={16}
            />
            <NavLabel $active={activeTab === 'credits'}>CREDITS</NavLabel>
          </NavLink>
        </NavContent>
      </Bar>

      <MobileNav>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <MobileNavItem
              key={item.id}
              onClick={() => onTabChange(item.id)}
            >
              <item.Icon color={isActive ? 'rgb(41, 73, 111)' : 'rgb(175, 184, 196)'} size={20} />
            </MobileNavItem>
          );
        })}
        <MobileNavItem onClick={() => onTabChange('credits')}>
          <CreditsIcon
            color={activeTab === 'credits' ? 'rgb(41, 73, 111)' : 'rgb(175, 184, 196)'}
            size={20}
          />
        </MobileNavItem>
      </MobileNav>
    </>
  );
}

const Bar = styled.div`
  position: absolute;
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
  pointer-events: none;
  transition: background 0.5s ease;
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
  gap: 6px;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: none;

  &:hover span {
    color: rgb(194, 255, 97);
  }

  &:hover svg path,
  &:hover svg rect,
  &:hover svg circle,
  &:hover svg line {
    stroke: rgb(194, 255, 97);
    fill: rgb(194, 255, 97);
  }
`;

const NavLabel = styled.span`
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.03em;
  color: ${(p) => (p.$active ? 'rgb(194, 255, 97)' : 'rgb(255, 255, 255)')};
  text-decoration: ${(p) => (p.$active ? 'underline' : 'none')};
  text-decoration-style: ${(p) => (p.$active ? 'wavy' : 'solid')};
  text-underline-offset: 2px;
  transition: color 0.2s;
`;

const MobileNav = styled.nav`
  display: none;
  position: absolute;
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
