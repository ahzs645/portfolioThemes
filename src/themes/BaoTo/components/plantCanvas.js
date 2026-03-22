/**
 * Plant/cattail renderer — from baothiento.com source (module 17938)
 * Plants grow FROM the pond edges INWARD over the water surface
 */

const GREENS = [
  'rgba(120,160,105,0.72)', 'rgba(130,168,112,0.68)',
  'rgba(112,152,100,0.65)', 'rgba(135,172,118,0.62)', 'rgba(125,164,108,0.68)',
];

function seededRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export function renderPlants(canvas, time) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';

  const rng = seededRng(42);

  // Plant clusters at each edge of the pond
  // Plants grow FROM the edge INWARD over the water
  const clusters = [];

  // Bottom edge — 12 clusters, tall grass growing UP into pond
  for (let i = 0; i < 12; i++) {
    clusters.push({
      edge: 'bottom', along: 0.04 + (i / 12) * 0.92,
      blades: 4 + Math.floor(rng() * 9), spread: 0.015 + rng() * 0.02,
      hMin: 60, hMax: 160, cattail: rng() > 0.5,
    });
  }
  // Top edge — 8 clusters
  for (let i = 0; i < 8; i++) {
    clusters.push({
      edge: 'top', along: 0.06 + (i / 8) * 0.88,
      blades: 3 + Math.floor(rng() * 6), spread: 0.015 + rng() * 0.015,
      hMin: 50, hMax: 130, cattail: rng() > 0.55,
    });
  }
  // Left edge — 6 clusters
  for (let i = 0; i < 6; i++) {
    clusters.push({
      edge: 'left', along: 0.1 + (i / 6) * 0.8,
      blades: 2 + Math.floor(rng() * 5), spread: 0.02,
      hMin: 40, hMax: 110, cattail: rng() > 0.5,
    });
  }
  // Right edge — 6 clusters
  for (let i = 0; i < 6; i++) {
    clusters.push({
      edge: 'right', along: 0.1 + (i / 6) * 0.8,
      blades: 2 + Math.floor(rng() * 5), spread: 0.02,
      hMin: 40, hMax: 110, cattail: rng() > 0.5,
    });
  }

  clusters.forEach((cl, ci) => {
    for (let b = 0; b < cl.blades; b++) {
      const spread = cl.spread * Math.min(w, h);
      const offset = (rng() - 0.5) * spread;
      let bx, by;

      // Base at the very edge of the canvas
      if (cl.edge === 'bottom') { bx = cl.along * w + offset; by = h; }
      else if (cl.edge === 'top') { bx = cl.along * w + offset; by = 0; }
      else if (cl.edge === 'left') { bx = 0; by = cl.along * h + offset; }
      else { bx = w; by = cl.along * h + offset; }

      const height = cl.hMin + rng() * (cl.hMax - cl.hMin);
      const lean = (rng() - 0.5) * 0.35;
      const curve = 0.15 + rng() * 0.25;
      const windPhase = ci * 1.3 + b * 0.7;
      const windFlex = 0.4 + rng() * 0.6;
      const bladeW = 0.7 + rng() * 1.2;
      const isCattail = cl.cattail && b === 0;

      // Wind animation (dual sine from source)
      const wind = Math.sin(time * 0.8 + windPhase) * 8 * windFlex
                  + Math.sin(time * 0.3 + windPhase * 0.7 + bx * 0.01) * 3 * windFlex;
      const sway = lean + (wind / height) * 0.5;

      // Tip grows INWARD: bottom→up, top→down, left→right, right→left
      let tipX, tipY, midX, midY;
      if (cl.edge === 'bottom') {
        tipX = bx + Math.sin(sway) * height * 0.3 + wind * curve;
        tipY = by - height; // grow UP
        midX = bx + Math.sin(sway * 0.4) * height * 0.15 + wind * curve * 0.3;
        midY = by - height * 0.55;
      } else if (cl.edge === 'top') {
        tipX = bx + Math.sin(sway) * height * 0.3 + wind * curve;
        tipY = by + height; // grow DOWN
        midX = bx + Math.sin(sway * 0.4) * height * 0.15 + wind * curve * 0.3;
        midY = by + height * 0.55;
      } else if (cl.edge === 'left') {
        tipX = bx + height; // grow RIGHT
        tipY = by + Math.sin(sway) * height * 0.3 + wind * curve;
        midX = bx + height * 0.55;
        midY = by + Math.sin(sway * 0.4) * height * 0.15 + wind * curve * 0.3;
      } else {
        tipX = bx - height; // grow LEFT
        tipY = by + Math.sin(sway) * height * 0.3 + wind * curve;
        midX = bx - height * 0.55;
        midY = by + Math.sin(sway * 0.4) * height * 0.15 + wind * curve * 0.3;
      }

      // Draw blade
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.strokeStyle = GREENS[Math.floor(rng() * GREENS.length)];
      ctx.lineWidth = bladeW;
      ctx.stroke();

      // Cattail head at ~72% along the blade
      if (isCattail) {
        const hx = bx + (tipX - bx) * 0.72;
        const hy = by + (tipY - by) * 0.72;
        const headLen = 8 + rng() * 7;
        const headW = 2.5 + rng() * 1.2;
        const headAngle = Math.atan2(tipY - midY, tipX - midX);

        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(headAngle);

        // Shadow
        ctx.beginPath();
        ctx.ellipse(0, 0, headLen / 2 + 1, headW + 1.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140,118,98,0.25)';
        ctx.fill();

        // Head with gradient
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(headLen / 2, headW));
        grad.addColorStop(0, 'rgba(95,68,52,0.75)');
        grad.addColorStop(0.6, 'rgba(120,92,72,0.55)');
        grad.addColorStop(1, 'rgba(125,108,92,0.08)');
        ctx.beginPath();
        ctx.ellipse(0, 0, headLen / 2, headW, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Grain lines on head
        ctx.strokeStyle = 'rgba(80,55,40,0.12)';
        ctx.lineWidth = 0.4;
        for (let t = -(headW * 0.6); t < headW * 0.6; t += 3) {
          const lw = (headLen / 2) * Math.sqrt(Math.max(0, 1 - (t / headW) * (t / headW))) * 0.85;
          ctx.beginPath(); ctx.moveTo(-lw, t); ctx.lineTo(lw, t); ctx.stroke();
        }

        // Seed pod spike
        const podH = headLen * 0.22;
        ctx.beginPath();
        ctx.moveTo(0, -headW);
        ctx.lineTo(-0.4, -headW - podH * 0.35);
        ctx.lineTo(0, -headW - podH);
        ctx.lineTo(0.4, -headW - podH * 0.35);
        ctx.closePath();
        ctx.fillStyle = 'rgba(125,160,108,0.6)';
        ctx.fill();

        ctx.restore();
      }
    }
  });
}
