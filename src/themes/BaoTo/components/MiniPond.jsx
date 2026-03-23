import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { DuckSvg } from './DuckSvg';
import { createDuck, updateDucks, DUCK_QUOTES } from './duckAI';
import { initWaterGL } from './waterGL';

/* ═══ Mini Pond — Compact duck pond (320px) without plants ═══
   Used on the About page footer area.
   Same WebGL water + paper overlay, 3 ducks, speech bubbles, click to spawn.
   ═════════════════════════════════════════════════════════════ */

const Wrapper = styled.div`
  position: relative;
  width: 88vw;
  max-width: 900px;
  height: 320px;
  margin: 0 auto;
  touch-action: pan-y;
  @media (min-width: 640px) { width: 70vw; }
`;

const InnerClip = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
`;

const WaterCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const OverlayCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`;

const DuckDiv = styled.div`
  position: absolute;
  pointer-events: none;
  will-change: transform;
  z-index: 2;
  filter: blur(0.45px) drop-shadow(rgba(42,37,32,0.08) 0px 0px 3px);
`;

const Bubble = styled.div`
  position: absolute;
  pointer-events: none;
  z-index: 10;
  will-change: transform, opacity;
  transform: translate(-50%, -100%);
  opacity: ${p => p.$visible ? 1 : 0};
  transition: opacity 0.3s;
`;

const BubbleInner = styled.div`
  position: relative;
  padding: 4px 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.06);
  white-space: nowrap;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: rgba(42,37,32,0.7);
  line-height: 1.5;

  @media (min-width: 640px) { font-size: 11px; }

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 10px;
    height: 10px;
    background: white;
    border-right: 1px solid rgba(0,0,0,0.06);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
`;

export function MiniPond() {
  const waterRef = useRef(null);
  const overlayRef = useRef(null);
  const wrapRef = useRef(null);
  const glCtx = useRef(null);
  const ducksRef = useRef([]);
  const duckDivsRef = useRef({});
  const simRef = useRef(null);
  const [paddleX, setPaddleX] = useState(21.5);
  const [speechBubble, setSpeechBubble] = useState(null);
  const speechRef = useRef(null);
  const [, forceUpdate] = useState(0);
  const lastQuoteRef = useRef('');

  // Paddling
  useEffect(() => {
    const iv = setInterval(() => setPaddleX(x => x === 21.5 ? 26 : 21.5), 250);
    return () => clearInterval(iv);
  }, []);

  // Init
  useEffect(() => {
    const glCanvas = waterRef.current;
    const ovCanvas = overlayRef.current;
    if (!glCanvas || !ovCanvas) return;

    const ctx = initWaterGL(glCanvas, ovCanvas);
    if (!ctx) return;
    glCtx.current = ctx;

    // Initial 3 ducks (2 white, 1 mallard)
    const t0 = ctx.timeRef.current;
    ducksRef.current = [
      createDuck(0.14, 0.35, t0),
      createDuck(0.60, 0.53, t0 + 0.3),
      createDuck(0.90, 0.28, t0 + 0.6),
    ];
    ducksRef.current[1].mallard = true;
    forceUpdate(n => n + 1);

    let running = true, lastTime = performance.now();
    const sim = () => {
      if (!running) return;
      simRef.current = requestAnimationFrame(sim);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = ctx.timeRef.current;

      const result = updateDucks(ducksRef.current, time, dt, []);
      ducksRef.current = result.ducks;

      const rect = wrapRef.current?.getBoundingClientRect();
      if (rect) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (const r of result.ripples) {
          ctx.addRipple(r.nx * rect.width * dpr, r.ny * rect.height * dpr, 0.6);
        }
      }

      // Direct DOM updates
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
    };
    simRef.current = requestAnimationFrame(sim);

    return () => { running = false; cancelAnimationFrame(simRef.current); ctx.destroy(); };
  }, []);

  const handleClick = useCallback((e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const ctx = glCtx.current;
    if (!rect || !ctx) return;

    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.addRipple(nx * rect.width * dpr, ny * rect.height * dpr, 1.0);

    const duck = createDuck(nx, ny, ctx.timeRef.current);
    ducksRef.current = [...ducksRef.current, duck];
    forceUpdate(n => n + 1);

    let quote;
    do { quote = DUCK_QUOTES[Math.floor(Math.random() * DUCK_QUOTES.length)]; } while (quote === lastQuoteRef.current && DUCK_QUOTES.length > 1);
    lastQuoteRef.current = quote;
    const bubbleId = duck.id;
    setSpeechBubble({ text: quote, duckId: bubbleId, id: bubbleId });
    setTimeout(() => setSpeechBubble(prev => prev?.id === bubbleId ? null : prev), 4000 + Math.random() * 1500);
  }, []);

  const ducks = ducksRef.current;

  return (
    <Wrapper ref={wrapRef}>
      <InnerClip onClick={handleClick}>
        <WaterCanvas ref={waterRef} />

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

        {speechBubble && (
          <Bubble
            $visible={true}
            ref={el => {
              speechRef.current = el;
              if (el) el._duckId = speechBubble.duckId;
            }}
            style={{
              left: `${(ducksRef.current.find(d => d.id === speechBubble.duckId)?.nx || 0.5) * 100}%`,
              top: `${(ducksRef.current.find(d => d.id === speechBubble.duckId)?.ny || 0.5) * 100}%`,
            }}
          >
            <BubbleInner>{speechBubble.text}</BubbleInner>
          </Bubble>
        )}

        <OverlayCanvas ref={overlayRef} />
      </InnerClip>
    </Wrapper>
  );
}
