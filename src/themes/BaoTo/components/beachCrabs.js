/**
 * Crab rendering — exact port from baothiento.com source
 * Cached via OffscreenCanvas per color/size/frame
 */

export const CRAB_PALETTES = [
  { body:'#6A7050', dark:'#505838', leg:'#5E6546', claw:'#78805A', hi:'#889068', eye:'#101008' },
  { body:'#C0B89A', dark:'#A49C80', leg:'#B0A88C', claw:'#CCC4A8', hi:'#D8D0B8', eye:'#1A1510' },
  { body:'#787068', dark:'#5C5650', leg:'#6E6860', claw:'#888078', hi:'#989088', eye:'#101010' },
  { body:'#5C6E6A', dark:'#445450', leg:'#50625E', claw:'#6A7E78', hi:'#7A8E88', eye:'#0E1012' },
  { body:'#585E48', dark:'#404838', leg:'#505640', claw:'#656C52', hi:'#757C62', eye:'#0E0E08' },
  { body:'#8A7A60', dark:'#6A5E48', leg:'#7E7058', claw:'#988868', hi:'#A89878', eye:'#121008' },
];

const LEG_JOINTS = [[0.82,-0.38],[0.98,-0.1],[0.92,0.12],[0.72,0.3]];

const crabCache = new Map();

function renderCrabSprite(ctx, size, frame, colorIdx) {
  const pal = CRAB_PALETTES[colorIdx % CRAB_PALETTES.length];
  const r = size * 0.5;
  const n = size * 0.39;
  const o = (frame / 4) * Math.PI * 2;

  ctx.lineCap = 'round';

  // Legs (4 per side)
  for (let side = -1; side <= 1; side += 2) {
    for (let s = 0; s < 4; s++) {
      const [cx, cy] = LEG_JOINTS[s];
      const d = side * cx * r;
      const f = cy * n;
      const u = (side > 0 ? 0 : Math.PI) + (s - 1.5) * 0.18 * side +
                ((s + (frame & 1)) % 2 === 0 ? Math.sin(o) : Math.cos(o)) * 0.12;
      const p = size * 0.2;
      const x = d + Math.cos(u) * p;
      const g = f + Math.sin(u) * p;

      ctx.strokeStyle = pal.leg;
      ctx.lineWidth = size * 0.05;
      ctx.beginPath(); ctx.moveTo(d, f); ctx.lineTo(x, g); ctx.stroke();

      const m = u + side * 0.35;
      const v = size * 0.16;
      ctx.lineWidth = size * 0.032;
      ctx.beginPath(); ctx.moveTo(x, g);
      ctx.lineTo(x + Math.cos(m) * v, g + Math.sin(m) * v); ctx.stroke();
    }
  }

  // Body
  ctx.fillStyle = pal.body;
  ctx.beginPath();
  ctx.moveTo(0, n * 0.55);
  ctx.quadraticCurveTo(r * 0.5, n * 0.5, r * 0.78, n * 0.15);
  ctx.lineTo(r, -(n * 0.05));
  ctx.quadraticCurveTo(r * 0.92, -(n * 0.45), r * 0.55, -(n * 0.6));
  ctx.quadraticCurveTo(r * 0.25, -(n * 0.72), 0, -(n * 0.55));
  ctx.quadraticCurveTo(-(r * 0.25), -(n * 0.72), -(r * 0.55), -(n * 0.6));
  ctx.quadraticCurveTo(-(r * 0.92), -(n * 0.45), -r, -(n * 0.05));
  ctx.lineTo(-(r * 0.78), n * 0.15);
  ctx.quadraticCurveTo(-(r * 0.5), n * 0.5, 0, n * 0.55);
  ctx.closePath();
  ctx.fill();

  // Belly shadow
  ctx.fillStyle = pal.dark; ctx.globalAlpha = 0.22;
  ctx.beginPath(); ctx.ellipse(0, n * 0.15, r * 0.7, n * 0.4, 0, 0, Math.PI); ctx.fill();
  ctx.globalAlpha = 1;

  // Highlight
  ctx.fillStyle = pal.hi; ctx.globalAlpha = 0.14;
  ctx.beginPath(); ctx.ellipse(0, -(n * 0.18), r * 0.35, n * 0.22, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Shell lines
  ctx.strokeStyle = pal.dark; ctx.lineWidth = size * 0.012; ctx.globalAlpha = 0.2;
  ctx.beginPath(); ctx.moveTo(0, -(n * 0.3)); ctx.lineTo(0, n * 0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(r * 0.25, -(n * 0.25)); ctx.quadraticCurveTo(r * 0.12, n * 0.05, r * 0.18, n * 0.3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-(r * 0.25), -(n * 0.25)); ctx.quadraticCurveTo(-(r * 0.12), n * 0.05, -(r * 0.18), n * 0.3); ctx.stroke();
  ctx.globalAlpha = 1;

  // Claws
  const sw = Math.sin(o) * 0.07;
  for (const side of [-1, 1]) {
    const scale = side === 1 ? 1.25 : 0.85;
    ctx.save();
    ctx.translate(side * r * 0.55, -(n * 0.5));
    ctx.rotate(side * (-0.5 + sw));
    ctx.fillStyle = pal.claw;
    const armW = size * 0.05 * scale;
    const armH = size * 0.15 * scale;
    ctx.beginPath(); ctx.ellipse(0, -(armH * 0.5), armW, armH * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    const h = -armH;
    // Left pincer
    ctx.beginPath();
    ctx.moveTo(-armW, h + armW);
    ctx.quadraticCurveTo(-(size * 0.07 * scale), h - size * 0.07 * scale, 0, h - size * 0.05 * scale);
    ctx.lineTo(0, h + armW); ctx.closePath(); ctx.fill();
    // Right pincer
    ctx.beginPath();
    ctx.moveTo(armW, h + armW);
    ctx.quadraticCurveTo(size * 0.07 * scale, h - size * 0.07 * scale, 0, h - size * 0.05 * scale);
    ctx.lineTo(0, h + armW); ctx.closePath(); ctx.fill();
    // Dividing line
    ctx.strokeStyle = pal.dark; ctx.lineWidth = size * 0.008;
    ctx.beginPath(); ctx.moveTo(0, h + armW * 0.5); ctx.lineTo(0, h - size * 0.035 * scale); ctx.stroke();
    ctx.restore();
  }

  // Eyes
  for (const side of [-1, 1]) {
    const ex = side * r * 0.28;
    ctx.strokeStyle = pal.body; ctx.lineWidth = size * 0.028;
    ctx.beginPath(); ctx.moveTo(ex, -(n * 0.2)); ctx.lineTo(ex, -n - size * 0.04); ctx.stroke();
    ctx.fillStyle = pal.eye;
    ctx.beginPath(); ctx.arc(ex, -n - size * 0.04, size * 0.035, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(ex + size * 0.008, -n - size * 0.05, size * 0.012, 0, Math.PI * 2); ctx.fill();
  }
}

/**
 * Draw a crab at its position with cached sprite.
 * crab: { x, y, size, frame, colorIdx, dir, rotation }
 */
export function drawCrab(ctx, crab) {
  const frameKey = ((crab.frame / 4) | 0) * 4 || 4;
  const key = `${crab.colorIdx}_${crab.size}_${frameKey}`;

  let cached = crabCache.get(key);
  if (!cached) {
    const dim = Math.ceil(crab.size * 1.3 * 2);
    try { cached = new OffscreenCanvas(dim, dim); }
    catch { cached = document.createElement('canvas'); cached.width = dim; cached.height = dim; }
    const spriteCtx = cached.getContext('2d');
    spriteCtx.translate(dim / 2, dim / 2);
    renderCrabSprite(spriteCtx, crab.size, crab.frame | 0, crab.colorIdx);
    crabCache.set(key, cached);
  }

  const dim = Math.ceil(crab.size * 1.3 * 2);
  ctx.save();
  ctx.translate(crab.x, crab.y);
  ctx.scale(crab.dir || 1, 1);
  if (crab.rotation) ctx.rotate(crab.rotation);
  ctx.drawImage(cached, -dim / 2, -dim / 2);
  ctx.restore();
}
