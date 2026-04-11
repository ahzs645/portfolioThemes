import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';

function AboutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M9 9.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5zM9 10.75c-3.314 0-6 2.015-6 4.5 0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75c0-2.485-2.686-4.5-6-4.5z" />
    </svg>
  );
}

function ExperienceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M6 3.25A2.25 2.25 0 0 1 8.25 1h1.5A2.25 2.25 0 0 1 12 3.25V4h2.25A2.75 2.75 0 0 1 17 6.75v1.76c-2.377 1.15-5.131 1.74-8 1.74s-5.623-.59-8-1.74V6.75A2.75 2.75 0 0 1 3.75 4H6v-.75zm1.5.75h3v-.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V4z" />
      <path d="M1 10.166v4.084A2.75 2.75 0 0 0 3.75 17h10.5A2.75 2.75 0 0 0 17 14.25v-4.084c-2.447 1.1-5.21 1.584-8 1.584s-5.553-.484-8-1.584z" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M7.25 1.5h-4.5A1.75 1.75 0 0 0 1 3.25v4.5c0 .966.784 1.75 1.75 1.75h4.5A1.75 1.75 0 0 0 9 7.75v-4.5A1.75 1.75 0 0 0 7.25 1.5zM15.25 1.5h-4.5A1.75 1.75 0 0 0 9 3.25v4.5c0 .966.784 1.75 1.75 1.75h4.5A1.75 1.75 0 0 0 17 7.75v-4.5a1.75 1.75 0 0 0-1.75-1.75zM7.25 10.5h-4.5A1.75 1.75 0 0 0 1 12.25v2.5c0 .966.784 1.75 1.75 1.75h4.5A1.75 1.75 0 0 0 9 14.75v-2.5A1.75 1.75 0 0 0 7.25 10.5zM15.25 10.5h-4.5A1.75 1.75 0 0 0 9 12.25v2.5c0 .966.784 1.75 1.75 1.75h4.5A1.75 1.75 0 0 0 17 14.75v-2.5a1.75 1.75 0 0 0-1.75-1.75z" />
    </svg>
  );
}

function ConnectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M16.53 1.47a.75.75 0 0 0-.82-.163l-14 5.5a.75.75 0 0 0 .05 1.416l5.49 1.708 1.708 5.49a.75.75 0 0 0 1.416.05l5.5-14a.75.75 0 0 0-.344-1.001z" />
    </svg>
  );
}

const sections = [
  { id: 'about', label: 'About', Icon: AboutIcon },
  { id: 'experience', label: 'Experience', Icon: ExperienceIcon },
  { id: 'projects', label: 'Projects', Icon: ProjectsIcon },
  { id: 'connect', label: 'Connect', Icon: ConnectIcon },
];

export default function Nav({ theme }) {
  const [active, setActive] = useState('about');
  const [scrolled, setScrolled] = useState(false);
  const [pill, setPill] = useState({ left: 4, top: 2, width: 0, height: 0 });
  const barRef = useRef(null);
  const buttonRefs = useRef({});

  const measure = useCallback(() => {
    const bar = barRef.current;
    const btn = buttonRefs.current[active];
    if (!bar || !btn) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPill({
      left: btnRect.left - barRect.left,
      top: btnRect.top - barRect.top,
      width: btnRect.width,
      height: btnRect.height,
    });
  }, [active]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  useEffect(() => {
    const container = document.getElementById('as-scroll-container');
    if (!container) return;
    const handleScroll = () => {
      setScrolled(container.scrollTop > 8);

      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      if (atBottom) {
        setActive(sections[sections.length - 1].id);
        return;
      }
      const offsets = sections.map(s => {
        const el = document.getElementById(`as-${s.id}`);
        return { id: s.id, top: el ? el.getBoundingClientRect().top : Infinity };
      });
      const current = offsets.reduce((best, s) =>
        s.top <= 200 && s.top > (best?.top ?? -Infinity) ? s : best
      , offsets[0]);
      if (current) setActive(current.id);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(`as-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Bar ref={barRef} $theme={theme} $scrolled={scrolled}>
      <ActivePill
        $theme={theme}
        style={{
          left: `${pill.left}px`,
          top: `${pill.top}px`,
          width: `${pill.width}px`,
          height: `${pill.height}px`,
        }}
      />
      {sections.map(s => {
        const Icon = s.Icon;
        const isActive = active === s.id;
        return (
          <NavButton
            key={s.id}
            ref={el => (buttonRefs.current[s.id] = el)}
            $theme={theme}
            $active={isActive}
            onClick={() => scrollTo(s.id)}
            aria-label={s.label}
          >
            <IconSlot $active={isActive}>
              <Icon />
            </IconSlot>
            <Label $active={isActive}>{s.label}</Label>
          </NavButton>
        );
      })}
    </Bar>
  );
}

const Bar = styled.nav`
  position: fixed;
  top: calc(45px + var(--app-top-offset, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: ${p => p.$scrolled ? p.$theme.navBg : 'transparent'};
  border: 1px solid ${p => p.$scrolled ? p.$theme.navBorder : 'transparent'};
  box-shadow: ${p => p.$scrolled
    ? `0 0 0 1px ${p.$theme.navBorder}, 0 2px 8px ${p.$theme.shadowSm}`
    : '0 0 0 1px transparent, 0 2px 8px transparent'};
  backdrop-filter: ${p => p.$scrolled ? 'blur(12px) saturate(1.4)' : 'blur(0px)'};
  -webkit-backdrop-filter: ${p => p.$scrolled ? 'blur(12px) saturate(1.4)' : 'blur(0px)'};
  transition: background-color 0.35s ease, backdrop-filter 0.35s ease,
              -webkit-backdrop-filter 0.35s ease, box-shadow 0.35s ease,
              border-color 0.35s ease;

  @media (max-width: ${BREAKPOINT}px) {
    left: 24px;
    transform: none;
    background: ${p => p.$scrolled ? p.$theme.navBgMobile : 'transparent'};
  }
`;

const ActivePill = styled.span`
  position: absolute;
  border-radius: 999px;
  background: ${p => p.$theme.surface};
  box-shadow:
    0 0 0 1px ${p => p.$theme.shadowRing},
    0 1px 1px -0.5px ${p => p.$theme.shadowRing},
    0 3px 3px -1.5px ${p => p.$theme.shadowRing},
    0 6px 6px -3px ${p => p.$theme.shadowRing};
  transition: left 0.35s cubic-bezier(0.215, 0.61, 0.355, 1),
              top 0.35s cubic-bezier(0.215, 0.61, 0.355, 1),
              width 0.35s cubic-bezier(0.215, 0.61, 0.355, 1),
              height 0.35s cubic-bezier(0.215, 0.61, 0.355, 1);
  pointer-events: none;
  z-index: 0;
`;

const NavButton = styled.button`
  position: relative;
  z-index: 1;
  font-family: ${FONT.sans};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.02em;
  padding: 6px 16px;
  border-radius: 999px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${p => p.$active ? p.$theme.navActiveText : p.$theme.navInactiveText};

  &:hover {
    color: ${p => p.$active ? p.$theme.navActiveText : p.$theme.navHoverText};
  }

  @media (max-width: ${BREAKPOINT}px) {
    padding: 10px 12px;
    gap: ${p => p.$active ? '6px' : '0'};
  }
`;

const IconSlot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: ${p => p.$active ? 1 : 0.55};
  transition: opacity 0.15s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: ${BREAKPOINT}px) {
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const Label = styled.span`
  @media (max-width: ${BREAKPOINT}px) {
    display: ${p => p.$active ? 'inline' : 'none'};
  }
`;
