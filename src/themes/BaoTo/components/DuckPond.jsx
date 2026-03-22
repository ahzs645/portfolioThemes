import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const COLORS = {
  text: '#2a2520',
  text08: 'rgba(42, 37, 32, 0.08)',
};

/* ── Duck SVG ── */

function DuckSvg({ variant = 'white' }) {
  const isMallard = variant === 'mallard';
  return (
    <svg width="72" height="72" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        {/* Shadow */}
        <ellipse cx="24.5" cy="28" rx="7.5" ry="6" fill="#1a4a65" opacity="0.08" />
        {/* Feet */}
        <g opacity="0.35">
          <line x1={isMallard ? "26.5" : "22"} y1="33" x2={isMallard ? "26.5" : "22"} y2="36" stroke="#E8A030" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <g transform={`translate(${isMallard ? 26 : 21.5}, 35.5)`}>
            <path d="M-0.8 0 L-1.5 2 L-0.3 1.5 L0.5 2.5 L1.3 1.5 L2.5 2 L1.8 0Z" fill="#E8A030" />
          </g>
        </g>
        {/* Tail */}
        <path d="M22 34 Q24 38, 26 34" fill="#E0D8CC" />
        <path d="M23 34 Q24 36.5, 25 34" fill="#E8E2D8" />
        {/* Body */}
        <ellipse cx="24" cy="26" rx="7" ry="8.5" fill={isMallard ? "#8E8680" : "#F0EBE3"} />
        <path d="M17.5 28 Q20 34, 24 35 Q28 34, 30.5 28" fill="#C8C0B0" opacity="0.35" />
        <ellipse cx="23" cy="23" rx="2.5" ry="3" fill="white" opacity="0.2" />
        <ellipse cx="24" cy="26" rx="7" ry="8.5" fill="none" stroke="#B8B0A0" strokeWidth="0.35" opacity="0.18" />
        {/* Wings */}
        <path d="M17 21 Q15.5 26.5, 17 32.5 Q19.5 27, 17 21Z" fill={isMallard ? "#726B64" : "#E8E2D8"} />
        <path d="M17 21 Q15.5 26.5, 17 32.5" fill="none" stroke="#B8B0A0" strokeWidth="0.35" opacity="0.25" />
        <path d="M31 21 Q32.5 26.5, 31 32.5 Q28.5 27, 31 21Z" fill={isMallard ? "#726B64" : "#E8E2D8"} />
        <path d="M31 21 Q32.5 26.5, 31 32.5" fill="none" stroke="#B8B0A0" strokeWidth="0.35" opacity="0.25" />
        {/* Neck */}
        <ellipse cx="24" cy="19.5" rx="3" ry="1.2" fill="#C4BAA8" opacity="0.2" />
        <ellipse cx="24" cy="18.5" rx="2.3" ry="1.5" fill="#EDE8E0" />
        {/* Head */}
        <circle cx="24" cy="15.2" r="3.2" fill={isMallard ? "#1B5E3A" : "#F5F1EB"} />
        <circle cx="23" cy="14" r="1.2" fill="white" opacity="0.25" />
        <circle cx="24" cy="15.2" r="3.2" fill="none" stroke="#B8B0A2" strokeWidth="0.3" opacity="0.2" />
        {/* Eyes */}
        <circle cx="21.3" cy="15" r="0.6" fill="#1a1a1a" />
        <circle cx="26.7" cy="15" r="0.6" fill="#1a1a1a" />
        <circle cx="21.5" cy="14.8" r="0.2" fill="white" opacity="0.6" />
        <circle cx="26.9" cy="14.8" r="0.2" fill="white" opacity="0.6" />
        {/* Beak */}
        <path d="M20.8 13.5 Q20.2 11.5, 21.5 10 Q24 8.5, 26.5 10 Q27.8 11.5, 27.2 13.5" fill={isMallard ? "#A08020" : "#F0B848"} />
        <path d="M22.5 10.5 Q24 9.5, 25.5 10.5" fill="white" opacity="0.15" />
        <path d="M20.8 13.5 Q20.2 11.5, 21.5 10 Q24 8.5, 26.5 10 Q27.8 11.5, 27.2 13.5" fill="none" stroke="#B07020" strokeWidth="0.35" opacity="0.35" />
        {/* Nostrils */}
        <ellipse cx="23" cy="11" rx="0.4" ry="0.2" fill="#B07020" opacity="0.3" />
        <ellipse cx="25" cy="11" rx="0.4" ry="0.2" fill="#B07020" opacity="0.3" />
      </g>
    </svg>
  );
}

/* ── Breadcrumb particles ── */

const crumbFade = keyframes`
  0%   { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.3); }
`;

const Crumb = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  animation: ${crumbFade} 1.8s ease-out forwards;
`;

/* ── Styled components ── */

const PondWrapper = styled.div`
  position: relative;
  width: 88vw;
  height: 45dvh;
  max-width: 900px;
  max-height: 600px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: ${p => p.$bg || COLORS.text08};

  @media (min-width: 640px) {
    width: 70vw;
    height: 65vh;
  }
`;

const DuckEl = styled.div`
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  will-change: transform, opacity;
  filter: blur(0.45px) drop-shadow(${COLORS.text08} 0px 0px 3px);
  transition: transform 2s cubic-bezier(0.22, 1, 0.36, 1);
`;

const FeedButton = styled.button`
  all: unset;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  transition: transform 0.3s ease;
  margin-top: 8px;

  &:hover { transform: scale(1.1); }
  &:active { transform: scale(0.95); }
`;

const BreadDot = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: ${p => `blur(${p.$blur}px)`};
  background: ${p => p.$bg};
  box-shadow: ${p => p.$shadow};
`;

const PondContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

/* ── Duck state ── */

function randomPos() {
  return {
    x: 20 + Math.random() * 60,
    y: 30 + Math.random() * 40,
    rotation: Math.random() * 720 - 180,
  };
}

const INITIAL_DUCKS = [
  { id: 0, variant: 'white', ...randomPos() },
  { id: 1, variant: 'white', ...randomPos() },
  { id: 2, variant: 'white', ...randomPos() },
];

const BREAD_DOTS = [
  { left: 22, top: 20, size: 8, hue: 34, blur: 0.6 },
  { left: 15, top: 16, size: 7, hue: 30, blur: 0.9 },
  { left: 29, top: 17, size: 7.5, hue: 38, blur: 1.2 },
  { left: 18, top: 26, size: 6.5, hue: 32, blur: 0.6 },
  { left: 27, top: 25, size: 7, hue: 36, blur: 0.9 },
  { left: 24, top: 12, size: 5.5, hue: 29, blur: 1.2 },
  { left: 11, top: 21, size: 5, hue: 31, blur: 0.6 },
  { left: 35, top: 23, size: 5.5, hue: 33, blur: 0.9 },
  { left: 13, top: 28, size: 4.5, hue: 28, blur: 1.2 },
  { left: 32, top: 29, size: 5, hue: 35, blur: 0.6 },
  { left: 9, top: 14, size: 4, hue: 30, blur: 0.9 },
  { left: 37, top: 15, size: 4.2, hue: 32, blur: 1.2 },
];

/* ── Component ── */

export function DuckPond() {
  const [ducks, setDucks] = useState(INITIAL_DUCKS);
  const [crumbs, setCrumbs] = useState([]);
  const pondRef = useRef(null);
  const driftRef = useRef(null);

  // Gentle drift animation
  useEffect(() => {
    const drift = () => {
      setDucks(prev =>
        prev.map(d => ({
          ...d,
          x: d.x + (Math.random() - 0.5) * 1.5,
          y: d.y + (Math.random() - 0.5) * 1,
          rotation: d.rotation + (Math.random() - 0.5) * 8,
        }))
      );
    };
    driftRef.current = setInterval(drift, 3000);
    return () => clearInterval(driftRef.current);
  }, []);

  // Click to scatter
  const handlePondClick = useCallback((e) => {
    const rect = pondRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Add crumbs at click
    const newCrumbs = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: clickX + (Math.random() - 0.5) * 8,
      y: clickY + (Math.random() - 0.5) * 8,
      size: 3 + Math.random() * 4,
      hue: 28 + Math.random() * 12,
    }));
    setCrumbs(prev => [...prev, ...newCrumbs]);
    setTimeout(() => {
      setCrumbs(prev => prev.filter(c => !newCrumbs.find(nc => nc.id === c.id)));
    }, 2000);

    // Move ducks toward click
    setDucks(prev =>
      prev.map(d => ({
        ...d,
        x: clickX + (Math.random() - 0.5) * 20,
        y: clickY + (Math.random() - 0.5) * 15,
        rotation: d.rotation + (Math.random() - 0.5) * 60,
      }))
    );
  }, []);

  // Feed button scatters randomly
  const handleFeed = useCallback(() => {
    const cx = 40 + Math.random() * 20;
    const cy = 35 + Math.random() * 20;

    const newCrumbs = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: cx + (Math.random() - 0.5) * 20,
      y: cy + (Math.random() - 0.5) * 15,
      size: 3 + Math.random() * 5,
      hue: 28 + Math.random() * 12,
    }));
    setCrumbs(prev => [...prev, ...newCrumbs]);
    setTimeout(() => {
      setCrumbs(prev => prev.filter(c => !newCrumbs.find(nc => nc.id === c.id)));
    }, 2000);

    setDucks(prev =>
      prev.map(d => ({
        ...d,
        x: cx + (Math.random() - 0.5) * 25,
        y: cy + (Math.random() - 0.5) * 20,
        rotation: d.rotation + (Math.random() - 0.5) * 90,
      }))
    );
  }, []);

  return (
    <PondContainer>
      <PondWrapper ref={pondRef} onClick={handlePondClick}>
        {/* Ducks */}
        {ducks.map(d => (
          <DuckEl
            key={d.id}
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: `translate(-50%, -50%) rotate(${d.rotation}deg) scale(1)`,
              opacity: 1,
            }}
          >
            <DuckSvg variant={d.variant} />
          </DuckEl>
        ))}

        {/* Crumbs */}
        {crumbs.map(c => (
          <Crumb
            key={c.id}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.size,
              height: c.size,
              background: `radial-gradient(circle, hsla(${c.hue}, 40%, 55%, 0.6), transparent)`,
            }}
          />
        ))}
      </PondWrapper>

      {/* Feed button */}
      <FeedButton onClick={handleFeed} aria-label="Feed the ducks" title="Feed the ducks">
        <div style={{ position: 'relative', width: 46, height: 46, filter: 'blur(0.4px)' }}>
          {BREAD_DOTS.map((dot, i) => (
            <BreadDot
              key={i}
              style={{
                left: dot.left,
                top: dot.top,
                width: dot.size,
                height: dot.size,
                transform: 'translate(-50%, -50%)',
              }}
              $blur={dot.blur}
              $bg={`radial-gradient(circle, hsla(${dot.hue}, 45%, 60%, 0.5) 0%, hsla(${dot.hue}, 40%, 45%, 0.3) 50%, hsla(${dot.hue}, 35%, 35%, 0.1) 100%)`}
              $shadow={`0 0 ${dot.size * 1.5}px hsla(${dot.hue}, 35%, 50%, 0.15)`}
            />
          ))}
        </div>
      </FeedButton>
    </PondContainer>
  );
}
