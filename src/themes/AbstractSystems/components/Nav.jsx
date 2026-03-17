import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';

const sections = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'connect', label: 'Connect' },
];

export default function Nav({ theme }) {
  const [active, setActive] = useState('about');

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sections.map(s => {
        const el = document.getElementById(`as-${s.id}`);
        return { id: s.id, top: el ? el.getBoundingClientRect().top : Infinity };
      });
      const current = offsets.reduce((best, s) =>
        s.top <= 200 && s.top > (best?.top ?? -Infinity) ? s : best
      , offsets[0]);
      if (current) setActive(current.id);
    };
    const container = document.getElementById('as-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(`as-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Bar $theme={theme}>
      <PingDot $theme={theme}>
        <PingRing $theme={theme} />
      </PingDot>
      {sections.map(s => (
        <NavButton
          key={s.id}
          $theme={theme}
          $active={active === s.id}
          onClick={() => scrollTo(s.id)}
        >
          {s.label}
        </NavButton>
      ))}
    </Bar>
  );
}

const pingRingAnim = keyframes`
  0% { opacity: 0.6; transform: scale(0.5); }
  70% { opacity: 0; transform: scale(1.5); }
  100% { opacity: 0; transform: scale(1.5); }
`;

const Bar = styled.nav`
  position: fixed;
  top: 45px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px;
  border-radius: 999px;
  background: ${p => p.$theme.navBg};
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 9px 27px ${p => p.$theme.shadowRing};
  backdrop-filter: blur(12px);

  @media (max-width: ${BREAKPOINT}px) {
    top: 45px;
    left: 24px;
    transform: none;
    background: ${p => p.$theme.navBgMobile};
  }
`;

const PingDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$theme.green};
  margin: 0 6px 0 8px;
  position: relative;
  flex-shrink: 0;
`;

const PingRing = styled.div`
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid ${p => p.$theme.green};
  animation: ${pingRingAnim} 2.5s ease-out infinite;
`;

const NavButton = styled.button`
  font-family: ${FONT.sans};
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: -0.02em;
  padding: 6px 14px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  color: ${p => p.$active ? p.$theme.navActiveText : 'rgba(255, 255, 255, 0.5)'};
  background: ${p => p.$active ? p.$theme.navActiveBg : 'transparent'};

  &:hover {
    color: ${p => p.$active ? p.$theme.navActiveText : 'rgba(255, 255, 255, 0.7)'};
  }

  &:active {
    transform: scale(1);
  }
`;
