import React from 'react';
import styled from 'styled-components';
import { BREAKPOINT, FONT } from '../utils/tokens';

/* Phosphor House icon – regular weight, 256×256 viewBox */
const HouseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"
      fill="currentColor"
    />
  </svg>
);

export default function Header({ theme, cv }) {
  const contactHref = cv?.email ? `mailto:${cv.email}` : (cv?.socialLinks?.linkedin || '#');

  return (
    <Nav $theme={theme}>
      <NavInner>
        <HomeButton href="#" aria-label="Go to homepage">
          <HouseIcon />
        </HomeButton>
        <ContactButton $theme={theme} href={contactHref}>
          Contact
        </ContactButton>
      </NavInner>
    </Nav>
  );
}

const Nav = styled.nav`
  position: fixed;
  z-index: 9;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  height: 60px;
  display: flex;
  align-items: center;
  border-radius: 50px;
  background: ${p => p.$theme.headerBg};
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  border: 1px solid ${p => p.$theme.headerBorder};
  box-shadow: ${p => p.$theme.headerShadow};

  @media (max-width: ${BREAKPOINT}px) {
    bottom: auto;
    top: 8px;
    background: ${p => p.$theme.headerBgMobile};
    box-shadow: ${p => p.$theme.headerShadowMobile};
  }
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 6px 0 13px;
`;

const HomeButton = styled.a`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50px;
  background: #ffffff;
  color: #171717;
  text-decoration: none;
  flex-shrink: 0;
`;

const ContactButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 46px;
  min-width: 94px;
  padding: 0 20px;
  border-radius: 50px;
  background: #ffffff;
  color: #171717;
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 15px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.05em;
  box-shadow: ${p => p.$theme.buttonShadow};
  transition: background 0.25s, color 0.25s;

  &:hover {
    background: ${p => p.$theme.accent};
    color: #ffffff;
  }
`;
