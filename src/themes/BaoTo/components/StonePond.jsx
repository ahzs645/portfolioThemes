import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { initWaterGL } from './waterGL';
import { generatePlantData, renderPlants } from './plantCanvas';

/* ═══ Stone Pond — Same WebGL water as DuckPond but with stone skipping ═══
   Source: baothiento.com RockPond component
   - WebGL seascape water + paper overlay + plant canvas
   - Click to throw stones that bounce and create ripples
   - Stone SVGs are procedural irregular polygons in muted colors
   ═══════════════════════════════════════════════════════════════════════════ */

const STONE_COLORS = ['#9E9688','#8A8580','#A09078','#787070','#8A9098','#928878'];

const Wrapper = styled.div`
  position: relative;
  width: 88vw;
  height: 70dvh;
  max-width: 900px;
  max-height: 900px;
  margin: 0 auto;
  overflow: visible;
  @media (min-width: 640px) { width: 70vw; height: 80vh; }
`;

const InnerClip = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  touch-action: pan-y;
`;

const WaterCanvas = styled.canvas`
  position: absolute;
  inset: -1.25px;
  width: calc(100% + 2.5px);
  height: calc(100% + 2.5px);
`;

const OverlayCanvas = styled.canvas`
  position: absolute;
  inset: -1.25px;
  width: calc(100% + 2.5px);
  height: calc(100% + 2.5px);
  pointer-events: none;
  z-index: 6;
`;

const StonesLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
`;

const PlantLayer = styled.canvas`
  position: absolute;
  inset: -200px;
  width: calc(100% + 400px);
  height: calc(100% + 400px);
  pointer-events: none;
  z-index: 7;
`;

const HintText = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(42,37,32,0.22);
  letter-spacing: 0.06em;
  z-index: 8;
  pointer-events: none;
  opacity: ${p => p.$show ? 1 : 0};
  transition: opacity 0.6s;
`;

/* ── Stone physics (from source lines 4420-4524) ── */

function createStone(nx, ny) {
  const angle = -Math.PI/2 + (Math.random()-0.5)*1.0;
  const strength = 0.7 + Math.random()*0.3;
  const speed = 0.4 + strength*0.3;
  return {
    x: nx, y: ny,
    vx: Math.cos(angle)*speed,
    vy: Math.sin(angle)*speed,
    z: 0.05 + strength*0.06,
    vz: 0.55 + strength*0.25,
    v0: speed,
    bounces: 0,
    maxBounces: 6 + Math.floor(strength*8),
    rotation: Math.random()*360,
    spin: 400 + Math.random()*200,
    curve: (Math.random()-0.5)*0.06,
    done: false,
    sinkProgress: 0,
    color: STONE_COLORS[Math.floor(Math.random()*STONE_COLORS.length)],
    size: 4 + Math.random()*4,
    id: Date.now()+Math.random(),
  };
}

function updateStone(stone, dt) {
  if (stone.done) {
    stone.sinkProgress = Math.min(1, stone.sinkProgress + dt*0.5);
    return null;
  }
  stone.vz -= dt*9; // gravity
  stone.z += stone.vz*dt;
  stone.vx += stone.curve*dt;
  stone.x += stone.vx*dt;
  stone.y += stone.vy*dt;
  stone.rotation += stone.spin*dt;

  if (stone.z <= 0) {
    stone.z = 0;
    stone.bounces++;
    const t = stone.bounces/stone.maxBounces;
    if (t >= 1 || Math.abs(stone.vy) < 0.02) {
      stone.done = true;
      return null;
    }
    const decay = Math.sqrt(1-t);
    const n = Math.sqrt(stone.vx*stone.vx + stone.vy*stone.vy);
    if (n > 0.001) {
      const s = (stone.v0*decay)/n;
      stone.vx *= s; stone.vy *= s;
    }
    stone.vz = (0.5 + stone.v0*0.35)*decay*decay*(0.9+Math.random()*0.2);
    return { x: stone.x, y: stone.y }; // bounce point for ripple
  }
  if (stone.x < -0.1 || stone.x > 1.1 || stone.y < -0.15 || stone.y > 1.1) {
    stone.done = true;
  }
  return null;
}

/* ── Stone SVG shape ── */

function makeStoneShape(size) {
  const points = 6 + Math.floor(Math.random()*3);
  let d = '';
  for (let i = 0; i < points; i++) {
    const angle = (i/points)*Math.PI*2;
    const r = size*(0.82 + Math.random()*0.36);
    const x = Math.cos(angle)*r + size*1.2;
    const y = Math.sin(angle)*r + size*1.2;
    d += `${i===0?'M':'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d+'Z';
}

/* ═══ Component ═══ */

export function StonePond() {
  const waterRef = useRef(null);
  const overlayRef = useRef(null);
  const plantRef = useRef(null);
  const wrapRef = useRef(null);
  const glCtx = useRef(null);
  const plantDataRef = useRef(null);
  const stonesRef = useRef([]);
  const [stoneEls, setStoneEls] = useState([]);
  const [hasClicked, setHasClicked] = useState(false);
  const animRef = useRef(0);

  // Init WebGL + plants
  useEffect(() => {
    const glCanvas = waterRef.current;
    const ovCanvas = overlayRef.current;
    if (!glCanvas || !ovCanvas) return;

    const ctx = initWaterGL(glCanvas, ovCanvas);
    if (!ctx) return;
    glCtx.current = ctx;

    // Plants
    if (plantRef.current && wrapRef.current) {
      const pRect = wrapRef.current.getBoundingClientRect();
      const pondW = Math.round(pRect.width);
      const pondH = Math.round(pRect.height);
      plantRef.current.width = pondW + 400;
      plantRef.current.height = pondH + 400;
      const data = generatePlantData(pondW, pondH);
      data._pondW = pondW; data._pondH = pondH;
      plantDataRef.current = data;
    }

    // Animation loop for plants + stone physics
    let running = true;
    let lastTime = performance.now();

    const frame = () => {
      if (!running) return;
      animRef.current = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min((now-lastTime)/1000, 0.05);
      lastTime = now;
      const time = ctx.timeRef.current;

      // Plants
      if (plantRef.current && plantDataRef.current) {
        const pCtx = plantRef.current.getContext('2d');
        if (pCtx) renderPlants(pCtx, plantDataRef.current, plantDataRef.current._pondW, plantDataRef.current._pondH, time);
      }

      // Stone physics
      const stones = stonesRef.current;
      let needsUpdate = false;
      const rect = wrapRef.current?.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio||1, 2);

      for (const stone of stones) {
        if (stone.sinkProgress >= 1) continue;
        const bounce = updateStone(stone, dt);
        needsUpdate = true;
        if (bounce && rect) {
          ctx.addRipple(bounce.x*rect.width*dpr, bounce.y*rect.height*dpr, 0.7);
        }
      }

      if (needsUpdate) {
        // Remove fully sunk stones
        stonesRef.current = stones.filter(s => s.sinkProgress < 1);
        setStoneEls(stonesRef.current.map(s => ({
          id: s.id, x: s.x, y: s.y, z: s.z,
          rotation: s.rotation, color: s.color, size: s.size,
          opacity: s.done ? 1-s.sinkProgress : 1,
          path: s._path,
        })));
      }
    };
    animRef.current = requestAnimationFrame(frame);

    return () => { running = false; cancelAnimationFrame(animRef.current); ctx.destroy(); };
  }, []);

  const handleClick = useCallback((e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const ctx = glCtx.current;
    if (!rect || !ctx) return;

    setHasClicked(true);
    const nx = (e.clientX-rect.left)/rect.width;
    const ny = (e.clientY-rect.top)/rect.height;
    const dpr = Math.min(window.devicePixelRatio||1, 2);

    // Initial splash ripple
    ctx.addRipple(nx*rect.width*dpr, ny*rect.height*dpr, 1.0);

    // Create stone
    const stone = createStone(nx, ny);
    stone._path = makeStoneShape(stone.size);
    stonesRef.current = [...stonesRef.current, stone];
  }, []);

  return (
    <Wrapper ref={wrapRef}>
      <InnerClip onClick={handleClick}>
        <WaterCanvas ref={waterRef} />
        <StonesLayer>
          {stoneEls.map(s => (
            <svg key={s.id} style={{
              position: 'absolute',
              left: `${s.x*100}%`, top: `${s.y*100}%`,
              width: s.size*2.4, height: s.size*2.4,
              transform: `translate(-50%,-50%) translateY(${-s.z*200}px) rotate(${s.rotation}deg) scale(${0.5+s.z*2})`,
              opacity: s.opacity,
              pointerEvents: 'none',
              filter: `blur(${s.z>0.02?0.3:0.8}px) drop-shadow(0 ${s.z*10}px ${2+s.z*8}px rgba(0,0,0,${0.05+s.z*0.1}))`,
            }} viewBox={`0 0 ${s.size*2.4} ${s.size*2.4}`} fill="none">
              <path d={s.path} fill={s.color} opacity="0.7" />
              <path d={s.path} fill="none" stroke={s.color} strokeWidth="0.8" opacity="0.25" />
            </svg>
          ))}
        </StonesLayer>
        <OverlayCanvas ref={overlayRef} />
      </InnerClip>
      <PlantLayer ref={plantRef} />
      <HintText $show={!hasClicked}>click to skip stones</HintText>
    </Wrapper>
  );
}
