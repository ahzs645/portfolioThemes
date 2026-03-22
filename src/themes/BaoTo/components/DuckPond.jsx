import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { DuckSvg } from './DuckSvg';
import { createDuck, updateDucks, createFoodPellets, DUCK_QUOTES } from './duckAI';
import { initWaterGL } from './waterGL';
import { generatePlantData, renderPlants } from './plantCanvas';

/* ═══ Duck Pond — Full simulation ═══ */

const Wrapper = styled.div`
  position: relative;
  width: 88vw;
  height: 45dvh;
  max-width: 900px;
  max-height: 600px;
  margin: 0 auto;
  overflow: visible;
  cursor: pointer;
  user-select: none;
  @media (min-width: 640px) { width: 70vw; height: 65vh; }
`;

const InnerClip = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  overflow: hidden;
  outline: none;
  border: 0;
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
`;

const PlantLayer = styled.canvas`
  position: absolute;
  inset: -200px;
  width: calc(100% + 400px);
  height: calc(100% + 400px);
  pointer-events: none;
  z-index: 7;
`;

const DuckDiv = styled.div`
  position: absolute;
  pointer-events: none;
  will-change: transform, opacity;
  filter: blur(0.45px) drop-shadow(rgba(42,37,32,0.08) 0px 0px 3px);
  z-index: 2;
`;

const FoodDot = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.5s;
`;

const SpeechBubble = styled.div`
  position: absolute;
  z-index: 50;
  pointer-events: none;
  transform: translate(-50%, -100%) translateY(-44px);
  background: white;
  color: rgba(42,37,32,0.7);
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  white-space: nowrap;
  opacity: ${p => p.$visible ? 1 : 0};
  transition: opacity 0.3s;
`;

const FeedBtn = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin: 8px auto 0;
  transition: transform 0.3s;
  &:hover { transform: scale(1.1); }
  &:active { transform: scale(0.95); }
`;

const BREAD_DOTS = [
  { l: 22, t: 20, s: 8, h: 34, b: 0.6 }, { l: 15, t: 16, s: 7, h: 30, b: 0.9 },
  { l: 29, t: 17, s: 7.5, h: 38, b: 1.2 }, { l: 18, t: 26, s: 6.5, h: 32, b: 0.6 },
  { l: 27, t: 25, s: 7, h: 36, b: 0.9 }, { l: 24, t: 12, s: 5.5, h: 29, b: 1.2 },
  { l: 11, t: 21, s: 5, h: 31, b: 0.6 }, { l: 35, t: 23, s: 5.5, h: 33, b: 0.9 },
  { l: 13, t: 28, s: 4.5, h: 28, b: 1.2 }, { l: 32, t: 29, s: 5, h: 35, b: 0.6 },
  { l: 9, t: 14, s: 4, h: 30, b: 0.9 }, { l: 37, t: 15, s: 4.2, h: 32, b: 1.2 },
];

export function DuckPond() {
  const waterRef = useRef(null);
  const overlayRef = useRef(null);
  const plantRef = useRef(null);
  const wrapRef = useRef(null);
  const glCtx = useRef(null);
  const plantDataRef = useRef(null);
  const ducksRef = useRef([]);
  const foodRef = useRef([]);
  const duckDivsRef = useRef({});
  const foodDivsRef = useRef({});
  const simRef = useRef(null);
  const [paddleX, setPaddleX] = useState(21.5);
  const [speechBubble, setSpeechBubble] = useState(null);
  const speechRef = useRef(null);
  const [, forceUpdate] = useState(0);
  const lastQuoteRef = useRef('');

  // Paddling feet 250ms
  useEffect(() => {
    const iv = setInterval(() => setPaddleX(x => x === 21.5 ? 26 : 21.5), 250);
    return () => clearInterval(iv);
  }, []);

  // Init WebGL + simulation
  useEffect(() => {
    const glCanvas = waterRef.current;
    const ovCanvas = overlayRef.current;
    if (!glCanvas || !ovCanvas) return;

    const ctx = initWaterGL(glCanvas, ovCanvas);
    if (!ctx) return;
    glCtx.current = ctx;

    // Generate plant data
    if (plantRef.current) {
      const pCanvas = plantRef.current;
      const pRect = wrapRef.current?.getBoundingClientRect();
      if (pRect) {
        const pondW = Math.round(pRect.width);
        const pondH = Math.round(pRect.height);
        pCanvas.width = pondW + 400;
        pCanvas.height = pondH + 400;
        const data = generatePlantData(pondW, pondH);
        data._pondW = pondW;
        data._pondH = pondH;
        plantDataRef.current = data;
      }
    }

    // Initial 2 ducks
    const t0 = ctx.timeRef.current;
    ducksRef.current = [
      createDuck(0.35, 0.45, t0),
      createDuck(0.65, 0.55, t0 + 0.5),
    ];
    ducksRef.current[1].mallard = true;
    forceUpdate(n => n + 1);

    // Simulation loop
    let lastTime = performance.now();
    let running = true;

    const sim = () => {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = ctx.timeRef.current;

      // Update duck AI
      const result = updateDucks(ducksRef.current, time, dt, foodRef.current);
      ducksRef.current = result.ducks;

      // Spawn AI ripples in WebGL
      const rect = wrapRef.current?.getBoundingClientRect();
      if (rect) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (const r of result.ripples) {
          ctx.addRipple(r.nx * rect.width * dpr, r.ny * rect.height * dpr, 0.6);
        }
      }

      // Remove eaten food
      foodRef.current = foodRef.current.filter(f => !f.eaten);

      // Direct DOM update for ducks (performance)
      for (const duck of ducksRef.current) {
        const el = duckDivsRef.current[duck.id];
        if (el) {
          el.style.left = `${duck.nx * 100}%`;
          el.style.top = `${duck.ny * 100}%`;
          el.style.transform = `translate(-50%,-50%) rotate(${duck.rotation}deg) scale(${duck.scale})`;
          el.style.opacity = duck.opacity;
        }
      }

      // Speech bubble tracking
      if (speechRef.current && speechRef.current._duckId) {
        const sd = ducksRef.current.find(d => d.id === speechRef.current._duckId);
        if (sd) {
          speechRef.current.style.left = `${sd.nx * 100}%`;
          speechRef.current.style.top = `${sd.ny * 100}%`;
        }
      }

      // Food divs
      for (const food of foodRef.current) {
        const el = foodDivsRef.current[food.id];
        if (el) {
          el.style.opacity = food.eaten ? '0' : '1';
        }
      }

      // Plants
      if (plantRef.current && plantDataRef.current) {
        const pCtx = plantRef.current.getContext('2d');
        if (pCtx) {
          renderPlants(pCtx, plantDataRef.current, plantDataRef.current._pondW, plantDataRef.current._pondH, time);
        }
      }

      simRef.current = requestAnimationFrame(sim);
    };
    simRef.current = requestAnimationFrame(sim);

    return () => {
      running = false;
      cancelAnimationFrame(simRef.current);
      ctx.destroy();
    };
  }, []);

  // Click to spawn duck
  const handleClick = useCallback((e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const ctx = glCtx.current;
    if (!rect || !ctx) return;

    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // WebGL ripple
    ctx.addRipple(nx * rect.width * dpr, ny * rect.height * dpr, 1.0);

    // Spawn new duck
    const duck = createDuck(nx, ny, ctx.timeRef.current);
    ducksRef.current = [...ducksRef.current, duck];
    forceUpdate(n => n + 1);

    // Speech bubble — attach to the new duck
    let quote;
    do { quote = DUCK_QUOTES[Math.floor(Math.random() * DUCK_QUOTES.length)]; } while (quote === lastQuoteRef.current && DUCK_QUOTES.length > 1);
    lastQuoteRef.current = quote;
    const bubbleId = duck.id;
    setSpeechBubble({ text: quote, duckId: bubbleId, id: bubbleId });
    setTimeout(() => setSpeechBubble(prev => prev?.id === bubbleId ? null : prev), 4000 + Math.random() * 1500);
  }, []);

  // Feed button drops food
  const handleFeed = useCallback(() => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const ctx = glCtx.current;
    if (!rect || !ctx) return;

    const nx = 0.3 + Math.random() * 0.4;
    const ny = 0.3 + Math.random() * 0.3;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctx.addRipple(nx * rect.width * dpr, ny * rect.height * dpr, 0.8);

    const pellets = createFoodPellets(nx, ny);
    foodRef.current = [...foodRef.current, ...pellets];
    forceUpdate(n => n + 1);
  }, []);

  const ducks = ducksRef.current;
  const food = foodRef.current;

  return (
    <div>
      <Wrapper ref={wrapRef}>
        <InnerClip onClick={handleClick}>
          <WaterCanvas ref={waterRef} />

          {/* Food pellets */}
          {food.map(f => (
            <FoodDot
              key={f.id}
              ref={el => { if (el) foodDivsRef.current[f.id] = el; }}
              style={{
                left: `${f.nx * 100}%`, top: `${f.ny * 100}%`,
                width: f.size, height: f.size,
                transform: 'translate(-50%,-50%)',
                filter: `blur(${f.blur}px)`,
                background: `radial-gradient(circle,hsla(${f.hue},45%,60%,0.5),hsla(${f.hue},35%,35%,0.1))`,
                boxShadow: `0 0 ${f.size}px hsla(${f.hue},35%,50%,0.15)`,
              }}
            />
          ))}

          {/* Ducks */}
          {ducks.map(d => (
            <DuckDiv
              key={d.id}
              ref={el => { if (el) duckDivsRef.current[d.id] = el; }}
              style={{
                left: `${d.nx * 100}%`, top: `${d.ny * 100}%`,
                transform: `translate(-50%,-50%) rotate(${d.rotation}deg) scale(${d.scale})`,
                opacity: d.opacity,
              }}
            >
              <DuckSvg mallard={d.mallard} paddleX={paddleX} />
            </DuckDiv>
          ))}

          {/* Speech bubble — follows duck via direct DOM update in sim loop */}
          {speechBubble && (
            <SpeechBubble
              $visible={true}
              ref={el => {
                speechRef.current = el;
                if (el) el._duckId = speechBubble.duckId;
              }}
              style={{ left: `${(ducksRef.current.find(d => d.id === speechBubble.duckId)?.nx || 0.5) * 100}%`,
                       top: `${(ducksRef.current.find(d => d.id === speechBubble.duckId)?.ny || 0.5) * 100}%` }}
            >
              {speechBubble.text}
            </SpeechBubble>
          )}

          <OverlayCanvas ref={overlayRef} />
        </InnerClip>
        <PlantLayer ref={plantRef} />
      </Wrapper>

      <FeedBtn onClick={handleFeed} aria-label="Feed the ducks" title="Feed the ducks">
        <div style={{ position: 'relative', width: 46, height: 46, filter: 'blur(0.4px)' }}>
          {BREAD_DOTS.map((d, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%', left: d.l, top: d.t,
              width: d.s, height: d.s, transform: 'translate(-50%,-50%)',
              filter: `blur(${d.b}px)`,
              background: `radial-gradient(circle,hsla(${d.h},45%,60%,0.5) 0%,hsla(${d.h},40%,45%,0.3) 50%,hsla(${d.h},35%,35%,0.1) 100%)`,
              boxShadow: `0 0 ${d.s * 1.5}px hsla(${d.h},35%,50%,0.15)`,
            }} />
          ))}
        </div>
      </FeedBtn>
    </div>
  );
}
