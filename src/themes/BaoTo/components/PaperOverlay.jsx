import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

/**
 * Film grain + paper texture overlay matching baothiento.com's PaperOverlay.
 * Renders noise, edge fade, fog, and light leak to a fixed canvas.
 */

const Canvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  mix-blend-mode: multiply;
  opacity: 0.35;
`;

const BG = { r: 245, g: 241, b: 236 };
const PAPER = {
  grain: 71,
  grainPop: 9,
  fog: 63,
  lightLeak: 12,
  edgeFade: 10,
  edgeMargin: 5,
};

export function PaperOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(window.innerWidth * dpr * 0.5);
    const h = Math.round(window.innerHeight * dpr * 0.5);
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;

        // Film grain
        const grain = (Math.random() - 0.5) * PAPER.grain * 0.01 * 60;
        const pop = Math.random() < 0.002 ? (Math.random() - 0.5) * PAPER.grainPop * 3 : 0;

        // Edge fade
        const ex = x / w;
        const ey = y / h;
        const edgeDist = Math.min(ex, 1 - ex, ey, 1 - ey);
        const edgeFade = Math.max(0, 1 - edgeDist / (PAPER.edgeMargin * 0.01)) * PAPER.edgeFade * 0.3;

        // Fog (radial center glow)
        const dx = ex - 0.5;
        const dy = ey - 0.5;
        const fogDist = Math.sqrt(dx * dx + dy * dy);
        const fog = Math.max(0, 1 - fogDist * 2) * PAPER.fog * 0.06;

        // Light leak (top-left warm spot)
        const llDist = Math.sqrt(ex * ex + ey * ey);
        const lightLeak = Math.max(0, 1 - llDist * 1.8) * PAPER.lightLeak * 0.15;

        const v = grain + pop - edgeFade + fog + lightLeak;

        data[idx] = BG.r + v;
        data[idx + 1] = BG.g + v;
        data[idx + 2] = BG.b + v - lightLeak * 0.3;
        data[idx + 3] = 30;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  return <Canvas ref={canvasRef} />;
}
