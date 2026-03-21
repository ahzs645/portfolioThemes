import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';

// Default cursor: pink pixel hand
const DEFAULT_SRC = 'https://framerusercontent.com/images/eMcf8jlNZzRPxuNCIbULaSNyBI.png?width=128&height=128';
// Hover cursor: pink pixel hand (hover variant)
const HOVER_SRC = 'https://framerusercontent.com/images/RkorN6pnBDkNk8cBbzefZs93GfM.png?width=128&height=128';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.style.cursor = 'none';

    const onMove = (e) => {
      if (!visible) setVisible(true);
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.12,
        ease: 'power2.out',
      });
    };

    const onOver = (e) => {
      const t = e.target.closest('a, button, [role="button"], [data-cursor-hover]');
      setHovering(!!t);
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);

    const style = document.createElement('style');
    style.id = 'kelly-cursor-hide';
    style.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.body.style.cursor = '';
      style.remove();
    };
  }, [visible]);

  return (
    <CursorWrap ref={cursorRef} $visible={visible}>
      <CursorImg
        src={hovering ? HOVER_SRC : DEFAULT_SRC}
        alt=""
        draggable={false}
        width={20}
        height={20}
      />
    </CursorWrap>
  );
}

const CursorWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  pointer-events: none;
  transform: translate(-10px, -10px);
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 0.15s;

  @media (hover: none) {
    display: none;
  }
`;

const CursorImg = styled.img`
  display: block;
  width: 20px;
  height: 20px;
  image-rendering: pixelated;
`;
