/**
 * Plant/cattail renderer — exact port from baothiento.com (module 17938)
 *
 * Architecture:
 * - Canvas extends 200px beyond pond on each side (inset: -200px, +400px size)
 * - ctx.translate(200, 200) so coord (0,0) = pond top-left
 * - Plant positions use normalized coords (0-1) * pondSize
 * - Binary search finds exact pond edge via SDF
 * - Blades are FILLED tapered shapes, not stroked lines
 */

/* ── Constants from source ── */

const PAPER = {
  edgeMargin: 5, cornerRadius: 28, edgeNoise: 27,
};

const GREENS = [
  'rgba(120, 160, 105, 0.72)',
  'rgba(130, 168, 112, 0.68)',
  'rgba(112, 152, 100, 0.65)',
  'rgba(135, 172, 118, 0.62)',
  'rgba(125, 164, 108, 0.68)',
];

/* ── SDF at point (for edge detection) ── */

function hash2d(x, y) {
  let a = x * 374761393 + y * 668265263;
  return (((a = (a ^ (a >> 13)) * 1274126177) ^ (a >> 16)) & 2147483647) / 2147483647;
}
function smoothNoise(x, y, scale) {
  const sx = x * scale, sy = y * scale;
  const ix = Math.floor(sx), iy = Math.floor(sy);
  const fx = sx - ix, fy = sy - iy;
  const ux = fx * fx * (3 - fx * 2), uy = fy * fy * (3 - fy * 2);
  return (hash2d(ix, iy) * (1 - ux) + hash2d(ix + 1, iy) * ux) * (1 - uy)
       + (hash2d(ix, iy + 1) * (1 - ux) + hash2d(ix + 1, iy + 1) * ux) * uy;
}
function fractalNoise(x, y) {
  return smoothNoise(x, y, 0.004) * 0.6 + smoothNoise(x, y, 0.01) * 0.25 + smoothNoise(x, y, 0.025) * 0.15;
}

function sdfAt(px, py, w, h) {
  const margin = (PAPER.edgeMargin / 100) * Math.min(w, h);
  const cx = w / 2, cy = h / 2;
  const sx = cx - margin, sy = cy - margin;
  const minS = Math.min(sx, sy);
  const cr = (PAPER.cornerRadius / 100) * minS;
  const noiseAmt = (PAPER.edgeNoise / 100) * Math.min(w, h) * 0.06;
  const dx = Math.abs(px - cx) - (sx - cr);
  const dy = Math.abs(py - cy) - (sy - cr);
  const gx = Math.max(dx, 0), gy = Math.max(dy, 0);
  let f = Math.sqrt(gx * gx + gy * gy) + Math.min(Math.max(dx, dy), 0) - cr;
  if (noiseAmt > 0) f += (fractalNoise(px, py) * 2 - 1) * noiseAmt;
  return f;
}

/* ── Binary search for edge position (SDF = -20) ── */

function findEdge(edge, along, pondW, pondH) {
  let lo, hi;
  if (edge === 'bottom') {
    const x = along * pondW;
    lo = pondH * 0.5; hi = pondH;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (sdfAt(x, mid, pondW, pondH) < -20) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2 / pondH;
  }
  if (edge === 'top') {
    const x = along * pondW;
    lo = 0; hi = pondH * 0.5;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (sdfAt(x, mid, pondW, pondH) < -20) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2 / pondH;
  }
  if (edge === 'left') {
    const y = along * pondH;
    lo = 0; hi = pondW * 0.5;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (sdfAt(mid, y, pondW, pondH) < -20) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2 / pondW;
  }
  // right
  const y = along * pondH;
  lo = pondW * 0.5; hi = pondW;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (sdfAt(mid, y, pondW, pondH) < -20) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2 / pondW;
}

/* ── Exact cluster definitions from source ── */

const PLANT_CLUSTERS = [
  { edge:'bottom', along:0.06, bladeCount:12, spread:0.03, heightRange:[80,150], cattailChance:0.25 },
  { edge:'bottom', along:0.12, bladeCount:10, spread:0.025, heightRange:[70,130], cattailChance:0.2 },
  { edge:'bottom', along:0.18, bladeCount:8, spread:0.025, heightRange:[55,110], cattailChance:0.15 },
  { edge:'bottom', along:0.24, bladeCount:6, spread:0.02, heightRange:[42,90], cattailChance:0.1 },
  { edge:'bottom', along:0.30, bladeCount:4, spread:0.018, heightRange:[35,70], cattailChance:0.1 },
  { edge:'bottom', along:0.42, bladeCount:3, spread:0.02, heightRange:[28,55], cattailChance:0.15 },
  { edge:'bottom', along:0.55, bladeCount:3, spread:0.018, heightRange:[25,50], cattailChance:0.2 },
  { edge:'bottom', along:0.70, bladeCount:4, spread:0.018, heightRange:[35,70], cattailChance:0.1 },
  { edge:'bottom', along:0.76, bladeCount:5, spread:0.02, heightRange:[38,85], cattailChance:0.1 },
  { edge:'bottom', along:0.82, bladeCount:7, spread:0.025, heightRange:[52,105], cattailChance:0.15 },
  { edge:'bottom', along:0.88, bladeCount:9, spread:0.025, heightRange:[62,125], cattailChance:0.2 },
  { edge:'bottom', along:0.94, bladeCount:11, spread:0.03, heightRange:[75,145], cattailChance:0.25 },
  { edge:'left', along:0.22, bladeCount:3, spread:0.01, heightRange:[32,62], cattailChance:0.3 },
  { edge:'left', along:0.35, bladeCount:3, spread:0.012, heightRange:[35,70], cattailChance:0.3 },
  { edge:'left', along:0.50, bladeCount:4, spread:0.012, heightRange:[42,84], cattailChance:0.35 },
  { edge:'left', along:0.65, bladeCount:5, spread:0.015, heightRange:[48,98], cattailChance:0.3 },
  { edge:'left', along:0.80, bladeCount:6, spread:0.018, heightRange:[55,110], cattailChance:0.3 },
  { edge:'right', along:0.25, bladeCount:3, spread:0.01, heightRange:[32,62], cattailChance:0.3 },
  { edge:'right', along:0.38, bladeCount:3, spread:0.012, heightRange:[35,70], cattailChance:0.35 },
  { edge:'right', along:0.52, bladeCount:4, spread:0.012, heightRange:[38,76], cattailChance:0.3 },
  { edge:'right', along:0.68, bladeCount:5, spread:0.015, heightRange:[45,90], cattailChance:0.3 },
  { edge:'right', along:0.82, bladeCount:6, spread:0.018, heightRange:[52,105], cattailChance:0.25 },
  { edge:'top', along:0.08, bladeCount:6, spread:0.02, heightRange:[48,98], cattailChance:0.2 },
  { edge:'top', along:0.15, bladeCount:4, spread:0.018, heightRange:[38,76], cattailChance:0.15 },
  { edge:'top', along:0.35, bladeCount:3, spread:0.018, heightRange:[28,55], cattailChance:0.2 },
  { edge:'top', along:0.60, bladeCount:3, spread:0.018, heightRange:[25,52], cattailChance:0.25 },
  { edge:'top', along:0.85, bladeCount:4, spread:0.018, heightRange:[35,70], cattailChance:0.15 },
  { edge:'top', along:0.92, bladeCount:5, spread:0.02, heightRange:[45,90], cattailChance:0.2 },
];

/* ── PRNG matching source (mulberry32 variant) ── */

function prng(seed) {
  let a = seed | 0;
  return () => {
    let e = Math.imul((a = (a + 1831565813) | 0) ^ (a >>> 15), a | 1);
    return (((e = (e + Math.imul(e ^ (e >>> 7), e | 61)) ^ e) ^ (e >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Generate plant data (called once on mount/resize) ── */

export function generatePlantData(pondW, pondH) {
  const rand = prng(42);
  return {
    clusters: PLANT_CLUSTERS.map(cl => {
      const edgePos = findEdge(cl.edge, cl.along, pondW, pondH);
      let x, y;
      if (cl.edge === 'bottom' || cl.edge === 'top') { x = cl.along; y = edgePos; }
      else { x = edgePos; y = cl.along; }

      const blades = [];
      for (let i = 0; i < cl.bladeCount; i++) {
        const t = cl.bladeCount > 1 ? i / (cl.bladeCount - 1) : 0.5;
        const isCattail = rand() < cl.cattailChance;
        const leanBase = (t - 0.5) * 0.8;
        let cx = (rand() - 0.5) * cl.spread;
        let cy = (rand() - 0.5) * cl.spread * 0.3;
        if (cl.edge === 'left' || cl.edge === 'right') { [cx, cy] = [cy, cx]; }

        const height = cl.heightRange[0] + rand() * (cl.heightRange[1] - cl.heightRange[0]);
        blades.push({
          baseX: x + cx,
          baseY: y + cy,
          height,
          lean: leanBase + (rand() - 0.5) * 0.3,
          curve: 0.15 + rand() * 0.35,
          width: isCattail ? 1.2 + rand() * 0.6 : 0.6 + rand() * 0.9,
          color: GREENS[Math.floor(rand() * GREENS.length)],
          windPhase: rand() * Math.PI * 2,
          windFlex: 0.3 + rand() * 0.5,
          type: isCattail ? 'cattail' : 'reed',
          headHeight: isCattail ? 8 + rand() * 7 : undefined,
        });
      }
      blades.sort((a, b) => b.height - a.height);
      return { x, y, blades };
    }),
  };
}

/* ── Render plants (called every frame) ── */

export function renderPlants(ctx, plantData, pondW, pondH, time) {
  const canvasW = pondW + 400;
  const canvasH = pondH + 400;
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.save();
  ctx.translate(200, 200); // Offset so (0,0) = pond top-left

  for (const cluster of plantData.clusters) {
    for (const blade of cluster.blades) {
      drawBlade(ctx, blade, pondW, pondH, time);
    }
  }

  ctx.restore();
}

/* ── Draw a single blade (exact port from source lines 2141-2215) ── */

function drawBlade(ctx, blade, pondW, pondH, time) {
  const n = blade.baseX * pondW;  // pixel x
  const r = blade.baseY * pondH;  // pixel y

  // Wind
  const wind = Math.sin(time * 0.8 + blade.windPhase) * 8 * blade.windFlex
             + Math.sin(time * 0.3 + blade.windPhase * 0.7 + n * 0.01) * 3 * blade.windFlex;
  const sway = blade.lean + (wind / blade.height) * 0.5;

  // Tip and midpoint (ALL blades grow upward: y - cos * height)
  const tipX = n + Math.sin(sway) * blade.height + wind * blade.curve;
  const tipY = r - Math.cos(sway) * blade.height;
  const midX = n + Math.sin(sway * 0.4) * blade.height * 0.55 + wind * blade.curve * 0.3;
  const midY = r - Math.cos(sway * 0.4) * blade.height * 0.55;

  // Blade width (tapered shape, not a stroked line)
  const halfW = blade.width * 0.5;
  const perpX = Math.cos(sway * 0.3);
  const perpY = Math.sin(sway * 0.3);

  ctx.beginPath();
  ctx.moveTo(n - perpX * halfW, r - perpY * halfW);
  ctx.quadraticCurveTo(midX - perpX * halfW * 0.5, midY, tipX, tipY);
  ctx.quadraticCurveTo(midX + perpX * halfW * 0.5, midY, n + perpX * halfW, r + perpY * halfW);
  ctx.closePath();
  ctx.fillStyle = blade.color;
  ctx.fill();

  // Cattail head
  if (blade.type === 'cattail' && blade.headHeight) {
    const hx = n + Math.sin(sway * 0.72) * blade.height * 0.72 + wind * blade.curve * 0.36;
    const hy = r - Math.cos(sway * 0.72) * blade.height * 0.72;
    const headAngle = sway * 0.6;
    const headH = blade.headHeight * 0.55;
    const headW = blade.width * 1.3;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(headAngle);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 0, headW + 1.2, headH + 1.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(140, 118, 98, 0.25)';
    ctx.fill();

    // Gradient head
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(headW, headH));
    grad.addColorStop(0, 'rgba(95, 68, 52, 0.75)');
    grad.addColorStop(0.6, 'rgba(120, 92, 72, 0.55)');
    grad.addColorStop(1, 'rgba(125, 108, 92, 0.08)');
    ctx.beginPath();
    ctx.ellipse(0, 0, headW, headH, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Grain lines
    ctx.strokeStyle = 'rgba(65, 48, 38, 0.12)';
    ctx.lineWidth = 0.3;
    for (let t = -(headH * 0.6); t < headH * 0.6; t += 3.5) {
      const lw = headW * Math.sqrt(Math.max(0, 1 - (t / headH) * (t / headH))) * 0.85;
      ctx.beginPath(); ctx.moveTo(-lw, t); ctx.lineTo(lw, t); ctx.stroke();
    }

    // Seed pod spike
    const podH = blade.headHeight * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -headH);
    ctx.lineTo(-0.35, -headH - podH * 0.35);
    ctx.lineTo(0, -headH - podH);
    ctx.lineTo(0.35, -headH - podH * 0.35);
    ctx.closePath();
    ctx.fillStyle = 'rgba(125, 160, 108, 0.6)';
    ctx.fill();

    ctx.restore();
  }
}
