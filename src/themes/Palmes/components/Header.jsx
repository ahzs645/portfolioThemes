import React from 'react';
import styled from 'styled-components';

const Nav = styled.nav`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled.a`
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;

  &:hover {
    color: #06b6d4;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled.a`
  color: #a1a1aa;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;

  &:hover {
    color: #06b6d4;
  }
`;

export default function Header({ name, scrollContainerRef }) {
  const firstName = name?.split(' ')[0] || 'Portfolio';

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const element = document.getElementById(id);
    const container = scrollContainerRef?.current;

    if (element && container) {
      const elementTop = element.offsetTop;
      container.scrollTo({
        top: elementTop - 60,
        behavior: 'smooth'
      });
    } else if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Nav>
      <Logo href="#" onClick={scrollTo('welcome')}>
        {firstName}
      </Logo>
      <NavLinks>
        <NavLink href="#bio" onClick={scrollTo('bio')}>About</NavLink>
        <NavLink href="#experience" onClick={scrollTo('experience')}>Experience</NavLink>
        <NavLink href="#projects" onClick={scrollTo('projects')}>Projects</NavLink>
        <NavLink href="#skills" onClick={scrollTo('skills')}>Skills</NavLink>
      </NavLinks>
    </Nav>
  );
}
