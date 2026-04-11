import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { colors, fonts } from '../styles';

const NavBar = styled.nav`
  pointer-events: none;
  position: sticky;
  top: 0;
  isolation: isolate;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.25rem;

  @media (min-width: 768px) { justify-content: space-between; }
`;

const Pill = styled(motion.div)`
  position: relative;
  display: flex;
  pointer-events: auto;
  background: hsla(0, 0%, 100%, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${colors.border};
  border-radius: 0.5rem;
  padding: 0.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
`;

const Slider = styled.div`
  position: absolute;
  left: 0;
  top: 0.25rem;
  z-index: -1;
  height: 1.75rem;
  border-radius: 0.25rem;
  background: ${colors.bg200};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition-property: width, transform, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
`;

const NavLink = styled.button`
  position: relative;
  z-index: 1;
  padding: 0.25rem 0.5rem;
  border: 0;
  background: transparent;
  font-family: ${fonts.sans};
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  border-radius: 0.25rem;
  color: ${(p) => (p.$active ? colors.text900 : colors.text400)};
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover, &:focus { color: ${colors.text900}; }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgb(191 219 254);
  }
`;

const SideLinks = styled(motion.div)`
  display: none;
  pointer-events: auto;

  @media (min-width: 768px) { display: flex; }

  a {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    letter-spacing: -0.025em;
    color: ${colors.text400};
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-color: transparent;
    text-underline-offset: 4px;
    transition: color 0.15s, text-decoration-color 0.15s;
    cursor: alias;

    &:hover {
      color: ${colors.text900};
      text-decoration-color: currentColor;
    }
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 4px rgb(191 219 254);
      color: ${colors.text900};
      text-decoration-color: currentColor;
    }
  }
`;

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}

export function Nav({ sections, activeId, onSelect, sideLinks }) {
  const pillRef = useRef(null);
  const linkRefs = useRef({});
  const [hoverState, setHoverState] = useState({ rect: null, fresh: true });
  const [pillRect, setPillRect] = useState(null);
  const scrollY = useScrollY();

  const handleHover = useCallback(
    (id, event) => {
      const target = event.currentTarget;
      const nextRect = target.getBoundingClientRect();
      const pill = pillRef.current ? pillRef.current.getBoundingClientRect() : null;
      setPillRect(pill);
      setHoverState((prev) => ({ rect: nextRect, fresh: prev.rect == null }));
    },
    [],
  );

  const handleLeave = useCallback(() => {
    setHoverState({ rect: null, fresh: false });
  }, []);

  const sliderStyle =
    hoverState.rect && pillRect
      ? {
          width: `${hoverState.rect.width}px`,
          transform: `translateX(${hoverState.rect.left - pillRect.left}px)`,
          opacity: 0.6,
          transitionDuration: hoverState.fresh ? '0ms' : '150ms',
        }
      : {
          opacity: 0,
          transitionDuration: '150ms',
        };

  const sideHidden = scrollY > 20;

  return (
    <NavBar aria-label="Primary">
      <Pill
        ref={pillRef}
        onMouseLeave={handleLeave}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Slider style={sliderStyle} />
        {sections.map((section) => (
          <NavLink
            key={section.id}
            ref={(el) => {
              linkRefs.current[section.id] = el;
            }}
            $active={section.id === activeId}
            type="button"
            onClick={() => onSelect(section.id)}
            onMouseOver={(event) => handleHover(section.id, event)}
            onFocus={(event) => handleHover(section.id, event)}
          >
            {section.label}
          </NavLink>
        ))}
      </Pill>

      {sideLinks && sideLinks.length > 0 && (
        <SideLinks
          initial={{ opacity: 0 }}
          animate={{ opacity: sideHidden ? 0 : 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          style={sideHidden ? { pointerEvents: 'none' } : undefined}
          aria-hidden={sideHidden}
        >
          {sideLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </SideLinks>
      )}
    </NavBar>
  );
}
