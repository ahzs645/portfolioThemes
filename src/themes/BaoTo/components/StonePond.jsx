import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * Interactive stone-skipping pond from baothiento.com's About page.
 * Click to throw stones that bounce and create ripple effects on water.
 */

const C = {
  text08: 'rgba(42,37,32,0.08)',
  water: 'rgba(42,37,32,0.02)',
};

const STONE_COLORS = ['#9E9688', '#8A8580', '#A09078', '#787070', '#8A9098', '#928878'];

const rippleExpand = keyframes`
  from {
    width: 0;
    height: 0;
    opacity: 0.5;
    border-width: 1.5px;
  }
  to {
    width: 120px;
    height: 60px;
    opacity: 0;
    border-width: 0.5px;
  }
`;

const splashUp = keyframes`
  0%   { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-20px) scale(0.3); opacity: 0; }
`;

const Pond = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 7;
  max-height: 320px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(42,37,32,0.015) 0%, rgba(42,37,32,0.04) 100%);
  user-select: none;
`;

const WaterSurface = styled.div`
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 60px,
      rgba(42,37,32,0.008) 60px,
      rgba(42,37,32,0.008) 61px
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 30px,
      rgba(42,37,32,0.005) 30px,
      rgba(42,37,32,0.005) 31px
    );
`;

const Ripple = styled.div`
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(42,37,32,0.12);
  transform: translate(-50%, -50%) scaleY(0.5);
  pointer-events: none;
  animation: ${rippleExpand} ${p => p.$duration || 1.2}s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
  animation-delay: ${p => p.$delay || 0}s;
`;

const Splash = styled.div`
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(42,37,32,0.15);
  pointer-events: none;
  animation: ${splashUp} 0.6s ease-out forwards;
  animation-delay: ${p => p.$delay || 0}s;
`;

const Stone = styled.div`
  position: absolute;
  pointer-events: none;
  transition: none;
`;

const HintText = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(42,37,32,0.20);
  letter-spacing: 0.06em;
  opacity: ${p => p.$show ? 1 : 0};
  transition: opacity 0.5s;
`;

function makeStoneShape(size) {
  const points = 7;
  const d = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = size * (0.7 + Math.random() * 0.3);
    const x = Math.cos(angle) * r + size;
    const y = Math.sin(angle) * r + size;
    d.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return d.join(' ') + 'Z';
}

export function StonePond() {
  const [ripples, setRipples] = useState([]);
  const [splashes, setSplashes] = useState([]);
  const [hasClicked, setHasClicked] = useState(false);
  const pondRef = useRef(null);

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples(prev => prev.filter(r => Date.now() - r.time < 2500));
    }, 2500);
    return () => clearTimeout(timer);
  }, [ripples]);

  useEffect(() => {
    if (splashes.length === 0) return;
    const timer = setTimeout(() => {
      setSplashes(prev => prev.filter(s => Date.now() - s.time < 1000));
    }, 1000);
    return () => clearTimeout(timer);
  }, [splashes]);

  const handleClick = useCallback((e) => {
    const rect = pondRef.current?.getBoundingClientRect();
    if (!rect) return;

    setHasClicked(true);

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const now = Date.now();

    // Create bouncing ripples (3-5 bounces)
    const bounces = 3 + Math.floor(Math.random() * 3);
    const newRipples = [];
    const newSplashes = [];
    let bx = x;

    for (let i = 0; i < bounces; i++) {
      bx += 6 + Math.random() * 8;
      const by = y + (Math.random() - 0.5) * 10;
      const delay = i * 0.25;

      newRipples.push({
        id: now + i,
        x: bx,
        y: by,
        delay,
        duration: 1.2 + Math.random() * 0.5,
        time: now,
      });

      // Splash drops
      for (let j = 0; j < 3; j++) {
        newSplashes.push({
          id: now + i * 10 + j,
          x: bx + (Math.random() - 0.5) * 6,
          y: by + (Math.random() - 0.5) * 4,
          delay: delay + Math.random() * 0.1,
          time: now,
        });
      }
    }

    setRipples(prev => [...prev, ...newRipples]);
    setSplashes(prev => [...prev, ...newSplashes]);
  }, []);

  return (
    <Pond ref={pondRef} onClick={handleClick}>
      <WaterSurface />

      {ripples.map(r => (
        <Ripple
          key={r.id}
          style={{ left: `${r.x}%`, top: `${r.y}%` }}
          $delay={r.delay}
          $duration={r.duration}
        />
      ))}

      {splashes.map(s => (
        <Splash
          key={s.id}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          $delay={s.delay}
        />
      ))}

      <HintText $show={!hasClicked}>
        click to skip stones
      </HintText>
    </Pond>
  );
}
