import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hide default cursor on the whole page
    document.body.style.cursor = 'none';

    const onMove = (e) => {
      if (!visible) setVisible(true);
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      });
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);

    // Add cursor:none to all interactive elements
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { cursor: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.body.style.cursor = '';
      style.remove();
    };
  }, [visible]);

  return (
    <CursorDot ref={cursorRef} $visible={visible}>
      {/* Pink flower / star shape */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="5" fill="rgb(255, 160, 180)" />
        <circle cx="14" cy="6" r="4" fill="rgb(255, 180, 200)" opacity="0.9" />
        <circle cx="14" cy="22" r="4" fill="rgb(255, 180, 200)" opacity="0.9" />
        <circle cx="6" cy="14" r="4" fill="rgb(255, 180, 200)" opacity="0.9" />
        <circle cx="22" cy="14" r="4" fill="rgb(255, 180, 200)" opacity="0.9" />
        <circle cx="8.3" cy="8.3" r="3.5" fill="rgb(255, 170, 190)" opacity="0.8" />
        <circle cx="19.7" cy="8.3" r="3.5" fill="rgb(255, 170, 190)" opacity="0.8" />
        <circle cx="8.3" cy="19.7" r="3.5" fill="rgb(255, 170, 190)" opacity="0.8" />
        <circle cx="19.7" cy="19.7" r="3.5" fill="rgb(255, 170, 190)" opacity="0.8" />
        <circle cx="14" cy="14" r="2.5" fill="rgb(255, 220, 100)" />
      </svg>
    </CursorDot>
  );
}

const CursorDot = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
  transform: translate(-14px, -14px);
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 0.2s;
  mix-blend-mode: normal;

  @media (hover: none) {
    display: none;
  }
`;
