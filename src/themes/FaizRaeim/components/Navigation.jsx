import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', href: '#fr-home' },
  { name: 'About', href: '#fr-about' },
  { name: 'Experience', href: '#fr-experience' },
  { name: 'Projects', href: '#fr-projects' },
  { name: 'Contact', href: '#fr-contact' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <>
      <Nav $scrolled={isScrolled}>
        <NavInner>
          <DesktopLinks>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.name} href={item.href} onClick={(e) => scrollTo(e, item.href)}>
                {item.name}
              </NavLink>
            ))}
          </DesktopLinks>
          <MobileToggle onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </MobileToggle>
          <MobileLabel>Menu</MobileLabel>
        </NavInner>
      </Nav>

      {mobileOpen && (
        <MobileDropdown>
          {NAV_ITEMS.map((item) => (
            <MobileLink key={item.name} href={item.href} onClick={(e) => scrollTo(e, item.href)}>
              {item.name}
            </MobileLink>
          ))}
        </MobileDropdown>
      )}
    </>
  );
}

const Nav = styled.nav`
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  transition: all 0.3s;
  background: ${(p) => (p.$scrolled ? 'rgba(39,39,42,0.9)' : 'rgba(39,39,42,0.7)')};
  backdrop-filter: ${(p) => (p.$scrolled ? 'blur(12px)' : 'blur(4px)')};
  border: 1px solid #3f3f46;
  border-radius: 9999px;
  padding: 8px;
  box-shadow: ${(p) => (p.$scrolled ? '0 10px 15px -3px rgba(0,0,0,0.3)' : 'none')};
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DesktopLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #d4d4d8;
  border-radius: 9999px;
  transition: all 0.2s;
  text-decoration: none;
  &:hover {
    color: #fafafa;
    background: #3f3f46;
  }
`;

const MobileToggle = styled.button`
  display: none;
  padding: 8px;
  color: #d4d4d8;
  border: none;
  background: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: #fafafa;
    background: #3f3f46;
  }
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileLabel = styled.span`
  display: none;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: #d4d4d8;
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileDropdown = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
    width: 90%;
    max-width: 384px;
    background: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    padding: 16px;
  }
`;

const MobileLink = styled.a`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #d4d4d8;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
  &:hover {
    color: #fafafa;
    background: #3f3f46;
  }
`;
