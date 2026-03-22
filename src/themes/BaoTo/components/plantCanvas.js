/**
 * Plant/cattail renderer — from baothiento.com source (module 17938)
 * Wind-animated reeds and cattails around pond edges
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
  const clusters = [];

  // 28 clusters matching source PLANT_CLUSTERS
  for (let i = 0; i < 12; i++) clusters.push({ edge: 'bottom', along: 0.06 + (i / 12) * 0.88, blades: 3 + Math.floor(rng() * 8), spread: 0.02 + rng() * 0.02, hMin: 40, hMax: 150, cattail: rng() > 0.55 });
  for (let i = 0; i < 6; i++) clusters.push({ edge: 'top', along: 0.08 + (i / 6) * 0.84, blades: 2 + Math.floor(rng() * 5), spread: 0.02, hMin: 30, hMax: 100, cattail: rng() > 0.6 });
  for (let i = 0; i < 5; i++) clusters.push({ edge: 'left', along: 0.2 + (i / 5) * 0.6, blades: 2 + Math.floor(rng() * 4), spread: 0.02, hMin: 30, hMax: 90, cattail: rng() > 0.5 });
  for (let i = 0; i < 5; i++) clusters.push({ edge: 'right', along: 0.2 + (i / 5) * 0.6, blades: 2 + Math.floor(rng() * 4), spread: 0.02, hMin: 30, hMax: 90, cattail: rng() > 0.5 });

  clusters.forEach((cl, ci) => {
    for (let b = 0; b < cl.blades; b++) {
      const spread = cl.spread * Math.min(w, h);
      const offset = (rng() - 0.5) * spread;
      let bx, by, growDir;

      if (cl.edge === 'bottom') { bx = cl.along * w + offset; by = h; growDir = -1; }
      else if (cl.edge === 'top') { bx = cl.along * w + offset; by = 0; growDir = 1; }
      else if (cl.edge === 'left') { bx = 0; by = cl.along * h + offset; growDir = 1; }
      else { bx = w; by = cl.along * h + offset; growDir = -1; }

      const height = cl.hMin + rng() * (cl.hMax - cl.hMin);
      const lean = (rng() - 0.5) * 0.4;
      const curve = 0.15 + rng() * 0.3;
      const windPhase = ci * 1.3 + b * 0.7;
      const windFlex = 0.4 + rng() * 0.6;
      const bladeW = 0.6 + rng() * 1.0;
      const isCattail = cl.cattail && b === 0;

      const wind = Math.sin(time * 0.8 + windPhase) * 8 * windFlex
                  + Math.sin(time * 0.3 + windPhase * 0.7 + bx * 0.01) * 3 * windFlex;
      const sway = lean + (wind / height) * 0.5;

      let tipX, tipY, midX, midY;
      if (cl.edge === 'bottom' || cl.edge === 'top') {
        tipX = bx + Math.sin(sway) * height + wind * curve;
        tipY = by + growDir * Math.cos(sway) * height;
        midX = bx + Math.sin(sway * 0.4) * height * 0.55 + wind * curve * 0.3;
        midY = by + growDir * Math.cos(sway * 0.4) * height * 0.55;
      } else {
        tipX = bx + growDir * Math.cos(sway) * height;
        tipY = by + Math.sin(sway) * height + wind * curve;
        midX = bx + growDir * Math.cos(sway * 0.4) * height * 0.55;
        midY = by + Math.sin(sway * 0.4) * height * 0.55 + wind * curve * 0.3;
      }

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.strokeStyle = GREENS[Math.floor(rng() * GREENS.length)];
      ctx.lineWidth = bladeW;
      ctx.stroke();

      if (isCattail) {
        const pct = 0.72;
        let hx, hy;
        if (cl.edge === 'bottom' || cl.edge === 'top') {
          hx = bx + Math.sin(sway * pct) * height * pct + wind * curve * pct * 0.5;
          hy = by + growDir * Math.cos(sway * pct) * height * pct;
        } else {
          hx = bx + growDir * Math.cos(sway * pct) * height * pct;
          hy = by + Math.sin(sway * pct) * height * pct + wind * curve * pct * 0.5;
        }
        const headLen = 8 + rng() * 6;
        const headW = 2.5 + rng();
        const headAngle = Math.atan2(tipY - midY, tipX - midX);

        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(headAngle);

        ctx.beginPath();
        ctx.ellipse(0, 0, headLen / 2 + 1.2, headW + 1.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140,118,98,0.25)';
        ctx.fill();

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(headLen / 2, headW));
        grad.addColorStop(0, 'rgba(95,68,52,0.75)');
        grad.addColorStop(0.6, 'rgba(120,92,72,0.55)');
        grad.addColorStop(1, 'rgba(125,108,92,0.08)');
        ctx.beginPath();
        ctx.ellipse(0, 0, headLen / 2, headW, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(80,55,40,0.12)';
        ctx.lineWidth = 0.4;
        for (let t = -(headW * 0.6); t < headW * 0.6; t += 3.5) {
          const lw = (headLen / 2) * Math.sqrt(1 - (t / headW) * (t / headW)) * 0.85;
          ctx.beginPath(); ctx.moveTo(-lw, t); ctx.lineTo(lw, t); ctx.stroke();
        }

        const podH = headLen * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, -headW);
        ctx.lineTo(-0.35, -headW - podH * 0.35);
        ctx.lineTo(0, -headW - podH);
        ctx.lineTo(0.35, -headW - podH * 0.35);
        ctx.closePath();
        ctx.fillStyle = 'rgba(125,160,108,0.6)';
        ctx.fill();
        ctx.restore();
      }
    }
  });
}
