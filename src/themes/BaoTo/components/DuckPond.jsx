import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

/* ═══════════════════════════════════════════════════════
   Duck Pond — Canvas-rendered water with grain texture,
   floating SVG ducks, and cattail plants on edges.
   Matches baothiento.com's About page pond.
   ═══════════════════════════════════════════════════════ */

const WATER = { r: 58, g: 82, b: 102 }; // dark slate-blue
const BG = { r: 245, g: 241, b: 236 };

const Wrapper = styled.div`
  position: relative;
  width: 88vw;
  max-width: 900px;
  aspect-ratio: 16 / 9;
  max-height: 500px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  user-select: none;

  @media (min-width: 640px) {
    width: 70vw;
  }
`;

const WaterCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const PlantCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
`;

const DuckLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`;

const DuckEl = styled.div`
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  will-change: transform;
  filter: blur(0.3px) drop-shadow(rgba(20, 30, 40, 0.15) 0px 1px 3px);
  transition: left 2.5s cubic-bezier(0.22, 1, 0.36, 1),
              top 2.5s cubic-bezier(0.22, 1, 0.36, 1);
`;

const rippleExpand = keyframes`
  from { width: 0; height: 0; opacity: 0.35; }
  to   { width: 80px; height: 40px; opacity: 0; }
`;

const RippleEl = styled.div`
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(200, 210, 220, 0.25);
  transform: translate(-50%, -50%) scaleY(0.5);
  pointer-events: none;
  z-index: 3;
  animation: ${rippleExpand} 1.5s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
  animation-delay: ${p => p.$delay || 0}s;
`;

const FeedBtn = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 8px auto 0;
  transition: transform 0.3s;
  &:hover { transform: scale(1.1); }
  &:active { transform: scale(0.95); }
`;

/* ── Duck SVG ── */

function DuckSvg({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Shadow on water */}
      <ellipse cx="24.5" cy="29" rx="8" ry="4" fill="rgba(20,30,40,0.12)" />
      {/* Body */}
      <ellipse cx="24" cy="26" rx="7" ry="8.5" fill="#F0EBE3" />
      <ellipse cx="24" cy="26" rx="7" ry="8.5" fill="none" stroke="#C8C0B0" strokeWidth="0.3" opacity="0.3" />
      <path d="M17.5 28 Q20 34, 24 35 Q28 34, 30.5 28" fill="#D8D0C4" opacity="0.4" />
      <ellipse cx="23" cy="23" rx="2.5" ry="3" fill="white" opacity="0.15" />
      {/* Wings */}
      <path d="M17 21 Q15.5 26.5, 17 32.5 Q19.5 27, 17 21Z" fill="#E8E2D8" />
      <path d="M31 21 Q32.5 26.5, 31 32.5 Q28.5 27, 31 21Z" fill="#E8E2D8" />
      <path d="M17 21 Q15.5 26.5, 17 32.5" fill="none" stroke="#B8B0A0" strokeWidth="0.3" opacity="0.25" />
      <path d="M31 21 Q32.5 26.5, 31 32.5" fill="none" stroke="#B8B0A0" strokeWidth="0.3" opacity="0.25" />
      {/* Tail */}
      <path d="M22 34 Q24 37, 26 34" fill="#DDD6CC" />
      {/* Neck */}
      <ellipse cx="24" cy="18.5" rx="2.3" ry="1.5" fill="#EDE8E0" />
      {/* Head */}
      <circle cx="24" cy="15.2" r="3.2" fill="#F5F1EB" />
      <circle cx="24" cy="15.2" r="3.2" fill="none" stroke="#C8C0B2" strokeWidth="0.25" opacity="0.2" />
      <circle cx="23" cy="14" r="1" fill="white" opacity="0.2" />
      {/* Eyes */}
      <circle cx="21.8" cy="15" r="0.5" fill="#1a1a1a" />
      <circle cx="26.2" cy="15" r="0.5" fill="#1a1a1a" />
      <circle cx="22" cy="14.8" r="0.15" fill="white" opacity="0.6" />
      <circle cx="26.4" cy="14.8" r="0.15" fill="white" opacity="0.6" />
      {/* Beak */}
      <path d="M21.2 13.5 Q20.6 11.5, 21.8 10.2 Q24 8.8, 26.2 10.2 Q27.4 11.5, 26.8 13.5" fill="#E8A830" />
      <path d="M21.2 13.5 Q20.6 11.5, 21.8 10.2 Q24 8.8, 26.2 10.2 Q27.4 11.5, 26.8 13.5" fill="none" stroke="#B07820" strokeWidth="0.3" opacity="0.3" />
    </svg>
  );
}

/* ── Water Canvas Renderer ── */

function renderWater(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(canvas.clientWidth * dpr * 0.6);
  const h = Math.round(canvas.clientHeight * dpr * 0.6);
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = ctx.createImageData(w, h);
  const d = img.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const nx = x / w;
      const ny = y / h;

      // Water base with slight variation
      const vx = Math.sin(nx * 12 + ny * 8) * 4;
      const vy = Math.cos(ny * 10 + nx * 6) * 3;

      // Depth gradient (darker center, lighter edges)
      const cx = (nx - 0.5) * 2;
      const cy = (ny - 0.5) * 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const depth = Math.max(0, 1 - dist * 0.6) * 12;

      // Film grain
      const grain = (Math.random() - 0.5) * 22;

      // Edge softness (blend to background at rounded corners)
      const edgeMargin = 0.04;
      const cornerR = 0.06;
      let edgeMask = 1;

      // Rounded rectangle mask
      const rx = Math.max(0, Math.abs(nx - 0.5) - (0.5 - cornerR));
      const ry = Math.max(0, Math.abs(ny - 0.5) - (0.5 - cornerR));
      const cornerDist = Math.sqrt(rx * rx + ry * ry);
      if (cornerDist > cornerR * 0.5) {
        edgeMask = Math.max(0, 1 - (cornerDist - cornerR * 0.5) / (cornerR * 0.8));
      }

      // Edge fade
      const edgeFade = Math.min(nx / edgeMargin, (1 - nx) / edgeMargin, ny / edgeMargin, (1 - ny) / edgeMargin);
      edgeMask *= Math.min(1, edgeFade);

      const r = WATER.r + vx + depth + grain;
      const g = WATER.g + vy + depth + grain;
      const b = WATER.b + vx * 0.5 + depth * 1.2 + grain;

      // Blend with background
      d[idx]     = BG.r + (r - BG.r) * edgeMask;
      d[idx + 1] = BG.g + (g - BG.g) * edgeMask;
      d[idx + 2] = BG.b + (b - BG.b) * edgeMask;
      d[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

/* ── Plant Canvas Renderer (cattails/reeds) ── */

function renderPlants(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.lineCap = 'round';

  // Plant positions around edges
  const plants = [];
  const count = Math.round(w / 45);

  // Bottom edge
  for (let i = 0; i < count; i++) {
    const x = (i / count) * w + (Math.random() - 0.5) * 30;
    plants.push({ x, y: h, side: 'bottom' });
  }
  // Top edge
  for (let i = 0; i < count * 0.6; i++) {
    const x = (i / (count * 0.6)) * w + (Math.random() - 0.5) * 30;
    plants.push({ x, y: 0, side: 'top' });
  }
  // Left edge
  for (let i = 0; i < 4; i++) {
    const y = h * 0.2 + (i / 4) * h * 0.6;
    plants.push({ x: 0, y, side: 'left' });
  }
  // Right edge
  for (let i = 0; i < 4; i++) {
    const y = h * 0.2 + (i / 4) * h * 0.6;
    plants.push({ x: w, y, side: 'right' });
  }

  plants.forEach(plant => {
    const isCattail = Math.random() > 0.4;
    const bladeCount = 2 + Math.floor(Math.random() * 4);

    for (let b = 0; b < bladeCount; b++) {
      const height = 30 + Math.random() * 50;
      const sway = (Math.random() - 0.5) * 20;

      let tipX, tipY;
      const baseX = plant.x + (Math.random() - 0.5) * 10;
      const baseY = plant.y;

      if (plant.side === 'bottom') {
        tipX = baseX + sway;
        tipY = baseY - height;
      } else if (plant.side === 'top') {
        tipX = baseX + sway;
        tipY = baseY + height;
      } else if (plant.side === 'left') {
        tipX = baseX + height;
        tipY = plant.y + sway * 0.5;
      } else {
        tipX = baseX - height;
        tipY = plant.y + sway * 0.5;
      }

      // Grass blade
      const midX = (baseX + tipX) / 2 + (Math.random() - 0.5) * 12;
      const midY = (baseY + tipY) / 2 + (Math.random() - 0.5) * 8;

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);

      const green = 120 + Math.floor(Math.random() * 50);
      const alpha = 0.35 + Math.random() * 0.3;
      ctx.strokeStyle = `rgba(${80 + Math.floor(Math.random() * 30)}, ${green}, ${40 + Math.floor(Math.random() * 30)}, ${alpha})`;
      ctx.lineWidth = 0.8 + Math.random() * 1.2;
      ctx.stroke();

      // Cattail head on some
      if (isCattail && b === 0) {
        ctx.beginPath();
        const headLen = 8 + Math.random() * 6;
        const angle = Math.atan2(tipY - midY, tipX - midX);
        const headX = tipX + Math.cos(angle) * headLen * 0.3;
        const headY = tipY + Math.sin(angle) * headLen * 0.3;

        ctx.ellipse(
          (tipX + headX) / 2,
          (tipY + headY) / 2,
          headLen / 2,
          2.5 + Math.random(),
          angle,
          0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(${90 + Math.floor(Math.random() * 30)}, ${55 + Math.floor(Math.random() * 20)}, ${30 + Math.floor(Math.random() * 20)}, ${0.6 + Math.random() * 0.3})`;
        ctx.fill();

        // Thin stem above cattail
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        const stemTipX = headX + Math.cos(angle) * 12;
        const stemTipY = headY + Math.sin(angle) * 12;
        ctx.lineTo(stemTipX, stemTipY);
        ctx.strokeStyle = `rgba(100, 140, 60, 0.3)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  });
}

/* ── Component ── */

const INITIAL_DUCKS = [
  { id: 0, x: 38, y: 42 },
  { id: 1, x: 62, y: 55 },
];

export function DuckPond() {
  const [ducks, setDucks] = useState(INITIAL_DUCKS);
  const [ripples, setRipples] = useState([]);
  const waterRef = useRef(null);
  const plantRef = useRef(null);
  const wrapRef = useRef(null);

  // Render canvases
  useEffect(() => {
    if (waterRef.current) renderWater(waterRef.current);
    if (plantRef.current) renderPlants(plantRef.current);
  }, []);

  // Gentle duck drift
  useEffect(() => {
    const interval = setInterval(() => {
      setDucks(prev => prev.map(d => ({
        ...d,
        x: Math.max(15, Math.min(85, d.x + (Math.random() - 0.5) * 3)),
        y: Math.max(20, Math.min(75, d.y + (Math.random() - 0.5) * 2)),
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Clean up ripples
  useEffect(() => {
    if (!ripples.length) return;
    const timer = setTimeout(() => {
      setRipples(prev => prev.filter(r => Date.now() - r.time < 2000));
    }, 2000);
    return () => clearTimeout(timer);
  }, [ripples]);

  const handleClick = useCallback((e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = ((e.clientX - rect.left) / rect.width) * 100;
    const cy = ((e.clientY - rect.top) / rect.height) * 100;
    const now = Date.now();

    // Ripples at click
    setRipples(prev => [...prev,
      { id: now, x: cx, y: cy, delay: 0, time: now },
      { id: now + 1, x: cx, y: cy, delay: 0.15, time: now },
    ]);

    // Ducks swim toward click
    setDucks(prev => prev.map(d => ({
      ...d,
      x: cx + (Math.random() - 0.5) * 18,
      y: cy + (Math.random() - 0.5) * 14,
    })));
  }, []);

  return (
    <div>
      <Wrapper ref={wrapRef} onClick={handleClick}>
        <WaterCanvas ref={waterRef} />
        <DuckLayer>
          {ducks.map(d => (
            <DuckEl
              key={d.id}
              style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <DuckSvg size={36} />
            </DuckEl>
          ))}
        </DuckLayer>
        {ripples.map(r => (
          <RippleEl
            key={r.id}
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
            $delay={r.delay}
          />
        ))}
        <PlantCanvas ref={plantRef} />
      </Wrapper>

      {/* Feed button — bread dots */}
      <FeedBtn
        onClick={() => {
          const cx = 35 + Math.random() * 30;
          const cy = 35 + Math.random() * 25;
          const now = Date.now();
          setRipples(prev => [...prev,
            ...Array.from({ length: 3 }, (_, i) => ({
              id: now + 10 + i,
              x: cx + (Math.random() - 0.5) * 15,
              y: cy + (Math.random() - 0.5) * 10,
              delay: i * 0.12,
              time: now,
            })),
          ]);
          setDucks(prev => prev.map(d => ({
            ...d,
            x: cx + (Math.random() - 0.5) * 20,
            y: cy + (Math.random() - 0.5) * 16,
          })));
        }}
        aria-label="Feed the ducks"
        title="Feed the ducks"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {[0, 1, 2, 3, 4, 5].map(i => {
            const angle = (i / 6) * Math.PI * 2;
            const r = 4 + Math.random() * 4;
            const cx = 12 + Math.cos(angle) * r;
            const cy = 12 + Math.sin(angle) * r;
            return <circle key={i} cx={cx} cy={cy} r={1.5 + Math.random()} fill="rgba(42,37,32,0.15)" />;
          })}
        </svg>
      </FeedBtn>
    </div>
  );
}
