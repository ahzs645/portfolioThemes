import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { DuckSvg } from './DuckSvg';

/* ═══ Duck Race Track — Oval racetrack on grass with racing ducks ═══
   Source: baothiento.com FooterDucks (module 6328, cd2a2b96e6e49c3a.js)
   ════════════════════════════════════════════════════════════════════ */

const BG = { r: 245, g: 241, b: 236 };

const RACE_QUOTES = [
  "we've been running for 84 years", "i've outlasted three javascript frameworks on this page",
  "the economy is in shambles but at least we have laps", "is this a marathon or a lifestyle",
  "my legs are so short how am i this fast", "someone tell bao to add a finish line",
  "i can see my house from here", "quack quack (that means faster)", "plot twist: there is no finish line",
  "i'm not racing i'm vibing", "technically we're all winning", "this is my cardio for the year",
  "*heavy breathing*", "left turn again? groundbreaking", "my fitbit is confused",
  "i think we passed that same rock 47 times", "who even signed us up for this",
  "the real treasure was the laps we ran along the way", "are we there yet",
  "i was told there'd be bread", "update: still running", "this track has zero shade",
];

const SPECKLE_GRASS = [
  [185,178,165], [170,165,152], [195,188,172], [160,156,148],
  [178,172,160], [192,185,168],
];
const SPECKLE_FLOWER = [
  [225,175,185], [248,242,218], [200,185,220], [238,218,168],
  [215,195,200], [230,225,195],
];

/* ── Noise ── */
function hash(x,y){let a=x*374761393+y*668265263;return(((a=(a^(a>>13))*1274126177)^(a>>16))&2147483647)/2147483647}
function sn(x,y,s){const sx=x*s,sy=y*s,ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;const ux=fx*fx*(3-fx*2),uy=fy*fy*(3-fy*2);return(hash(ix,iy)*(1-ux)+hash(ix+1,iy)*ux)*(1-uy)+(hash(ix,iy+1)*(1-ux)+hash(ix+1,iy+1)*ux)*uy}
function fn(x,y){return sn(x,y,0.004)*0.6+sn(x,y,0.01)*0.25+sn(x,y,0.025)*0.15}
function filmGrain(){return((Math.random()+Math.random()+Math.random())/3-0.5)*6}
function ss(a,b,t){const l=Math.max(0,Math.min(1,(t-a)/(b-a)));return l*l*(3-l*2)}
function prng(s){let t=s|0;return()=>{let e=Math.imul((t=(t+1831565813)|0)^(t>>>15),t|1);return(((e=(e+Math.imul(e^(e>>>7),e|61))^e)^(e>>>14))>>>0)/4294967296}}

/* ── Track generation ── */

function generateTrack(w, h) {
  // Source: radius = (h-160)/2, straight = max(0, w-160-radius*2)
  const cx = w / 2;
  const cy = h / 2;
  const radius = (h - 160) / 2; // semicircle radius at each end (80px for h=320)
  const straight = Math.max(0, w - 160 - radius * 2); // straight segment length
  const trackRad = 30; // path half-width for distance field
  const totalPerimeter = straight * 2 + Math.PI * 2 * radius;

  // Source parametric function: walks parameter t∈[0,1) around 4 segments
  function stadiumPoint(t) {
    let d = (((t % 1) + 1) % 1) * totalPerimeter;
    // Segment 1: top straight (left to right)
    if (d < straight) {
      return { x: cx - straight / 2 + d, y: cy - radius };
    }
    d -= straight;
    // Segment 2: right semicircle
    if (d < Math.PI * radius) {
      const a = -Math.PI / 2 + d / radius;
      return { x: cx + straight / 2 + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
    }
    d -= Math.PI * radius;
    // Segment 3: bottom straight (right to left)
    if (d < straight) {
      return { x: cx + straight / 2 - d, y: cy + radius };
    }
    d -= straight;
    // Segment 4: left semicircle
    const a = Math.PI / 2 + d / radius;
    return { x: cx - straight / 2 + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  }

  // 24 control points with jitter (source: +-3px x, +-2.5px y)
  const rand = prng(42);
  const raw = [];
  for (let i = 0; i < 24; i++) {
    const p = stadiumPoint(i / 24);
    raw.push({ x: p.x + (rand() - 0.5) * 6, y: p.y + (rand() - 0.5) * 5 });
  }

  // Catmull-Rom spline with adaptive subdivision (source: ceil(segLen/3), min 4)
  const pts = [];
  for (let i = 0; i < raw.length; i++) {
    const p0 = raw[(i - 1 + 24) % 24];
    const p1 = raw[i];
    const p2 = raw[(i + 1) % 24];
    const p3 = raw[(i + 2) % 24];
    const segLen = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    const subdiv = Math.max(4, Math.ceil(segLen / 3));
    for (let j = 0; j < subdiv; j++) {
      const t = j / subdiv;
      const t2 = t * t, t3 = t2 * t;
      pts.push({
        x: 0.5 * (2*p1.x + (-p0.x+p2.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*t2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
        y: 0.5 * (2*p1.y + (-p0.y+p2.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*t2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*t3),
      });
    }
  }

  // Cumulative arc lengths
  const cumLen = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
    cumLen.push(cumLen[i-1] + Math.sqrt(dx*dx + dy*dy));
  }
  const totalLen = cumLen[cumLen.length-1] + Math.sqrt(
    (pts[0].x - pts[pts.length-1].x)**2 + (pts[0].y - pts[pts.length-1].y)**2
  );

  return { pts, cumLen, totalLen, rad: trackRad };
}

// Binary search position at distance d along track
function trackPosAt(track, d) {
  d = ((d % track.totalLen) + track.totalLen) % track.totalLen;
  const { pts, cumLen } = track;
  let lo = 0, hi = cumLen.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (cumLen[mid] <= d) lo = mid; else hi = mid - 1;
  }
  const i = lo;
  const ni = (i + 1) % pts.length;
  const segLen = Math.sqrt((pts[ni].x - pts[i].x)**2 + (pts[ni].y - pts[i].y)**2);
  const t = segLen > 0 ? (d - cumLen[i]) / segLen : 0;
  const x = pts[i].x + (pts[ni].x - pts[i].x) * t;
  const y = pts[i].y + (pts[ni].y - pts[i].y) * t;
  const angle = Math.atan2(pts[ni].y - pts[i].y, pts[ni].x - pts[i].x);
  return { x, y, angle };
}

/* ── Track texture rendering (once) ── */

function renderTrackCanvas(canvas, track, cssW, cssH) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round(cssW * dpr), h = Math.round(cssH * dpr);
  canvas.width = w; canvas.height = h;
  canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px';
  const ctx = canvas.getContext('2d'); if (!ctx) return;

  // Scale track points to canvas
  const scale = dpr;
  const scaledPts = track.pts.map(p => ({ x: p.x * scale, y: p.y * scale }));
  const trackRad = track.rad * scale;

  // Build spatial hash for fast distance lookups
  const cellSize = 64;
  const grid = new Map();
  for (let i = 0; i < scaledPts.length; i++) {
    const gx = (scaledPts[i].x / cellSize) | 0;
    const gy = (scaledPts[i].y / cellSize) | 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${gx+dx},${gy+dy}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(i);
      }
    }
  }

  function distToTrack(px, py) {
    const gx = (px / cellSize) | 0, gy = (py / cellSize) | 0;
    const key = `${gx},${gy}`;
    const indices = grid.get(key);
    let minD = Infinity;
    if (indices) {
      for (const i of indices) {
        const dx = px - scaledPts[i].x, dy = py - scaledPts[i].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < minD) minD = d;
      }
    }
    // Subtract track radius and add fractal noise displacement (~9px amplitude)
    return minD - trackRad
      + (fn(px * 3.5, py * 3.5) * 2 - 1) * 5
      + (fn(px * 9, py * 9) * 2 - 1) * 2.5
      + (fn(px * 22, py * 22) * 2 - 1) * 1.5;
  }

  // Render pixels
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const margin = Math.min(w,h) * 0.005;
  const cr = 30 * scale;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = (y * w + x) * 4;
      // Edge SDF
      const cx2 = w/2, cy2 = h/2;
      const edx = Math.abs(x-cx2) - (cx2-margin-cr);
      const edy = Math.abs(y-cy2) - (cy2-margin-cr);
      const edgeSdf = Math.sqrt(Math.max(edx,0)**2+Math.max(edy,0)**2)+Math.min(Math.max(edx,edy),0)-cr
        + (fn(x*0.8,y*0.8)*2-1)*Math.min(w,h)*0.006;

      if (edgeSdf > 0) {
        data[pi]=BG.r; data[pi+1]=BG.g; data[pi+2]=BG.b; data[pi+3]=255;
        continue;
      }

      const td = distToTrack(x, y);
      const noiseVal = fn(x * 0.008, y * 0.012);
      const grain = filmGrain();

      // Grass color (dark muted green with noise variation)
      const gr = 58 + noiseVal * 22 + grain;
      const gg = 85 + noiseVal * 28 + grain;
      const gb = 44 + noiseVal * 16 + grain;

      // Sand/track color (warm cream, slightly darker than BG)
      const sr = BG.r - 4 + grain;
      const sg = BG.g - 6 + grain;
      const sb = BG.b - 10 + grain;

      // Blend: td<0 = on track (sand), td>0 = grass
      // Source uses smoothstep 0-10 for the transition
      const blend = ss(-2, 8, td);
      let r = sr + (gr - sr) * blend;
      let g = sg + (gg - sg) * blend;
      let b = sb + (gb - sb) * blend;

      // Shadow near track-grass boundary (darkens grass edge)
      if (td > -5 && td < 15) {
        const shadow = 1 - ss(-5, 15, td) * 0.12;
        r *= shadow; g *= shadow; b *= shadow;
      }

      // Warm tint
      r += 5.4;

      // Edge fade (source uses min*0.28 for sand canvas, ~0.12 here for tighter grass)
      const fadeR = Math.min(w,h) * 0.1;
      if (-edgeSdf < fadeR) {
        const f = ss(0, fadeR, -edgeSdf);
        r = BG.r + (r - BG.r) * f;
        g = BG.g + (g - BG.g) * f;
        b = BG.b + (b - BG.b) * f;
      }

      data[pi]=Math.max(0,Math.min(255,r|0));
      data[pi+1]=Math.max(0,Math.min(255,g|0));
      data[pi+2]=Math.max(0,Math.min(255,b|0));
      data[pi+3]=255;
    }
  }
  ctx.putImageData(img, 0, 0);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr, dpr);

  // Grass speckles — subtle earth-tone dots on grass (source: pixelCount/500)
  const rand = prng(42);
  const pixelCount = cssW * cssH;
  const pad = 15;
  for (let i = 0; i < pixelCount / 600; i++) {
    const sx = pad + rand() * (cssW - pad*2);
    const sy = pad + rand() * (cssH - pad*2);
    const d = distToTrack(sx * dpr, sy * dpr);
    if (d < 8) continue; // well into grass, away from track
    const c = SPECKLE_GRASS[Math.floor(rand()*SPECKLE_GRASS.length)];
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
    ctx.beginPath(); ctx.arc(sx, sy, 0.5 + rand() * 1.2, 0, Math.PI * 2); ctx.fill();
  }

  // Flower speckles — small pastel dots deep in grass (source: pixelCount/800)
  for (let i = 0; i < pixelCount / 1000; i++) {
    const sx = pad + rand() * (cssW - pad*2);
    const sy = pad + rand() * (cssH - pad*2);
    const d = distToTrack(sx * dpr, sy * dpr);
    if (d < 25) continue; // deep into grass
    const c = SPECKLE_FLOWER[Math.floor(rand()*SPECKLE_FLOWER.length)];
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
    ctx.beginPath(); ctx.arc(sx, sy, 0.8 + rand() * 1.5, 0, Math.PI * 2); ctx.fill();
  }

  // Center lane dashed line
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 10]);
  ctx.beginPath();
  for (let i = 0; i < track.pts.length; i++) {
    const p = track.pts[i];
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // Start/finish line
  const start = trackPosAt(track, 0);
  const perpX = -Math.sin(start.angle) * track.rad;
  const perpY = Math.cos(start.angle) * track.rad;
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(start.x - perpX, start.y - perpY);
  ctx.lineTo(start.x + perpX, start.y + perpY);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

/* ── Styled ── */
const Wrapper = styled.div`
  position: relative;
  width: 88vw;
  max-width: 900px;
  height: 320px;
  margin: 48px auto;
  touch-action: pan-y;
  @media (min-width: 640px) { width: 70vw; }
`;
const TrackCanvas = styled.canvas`position:absolute;inset:0;width:100%;height:100%;`;
const OverlayCanvas = styled.canvas`position:absolute;inset:0;z-index:1;pointer-events:none;`;
const DuckDiv = styled.div`position:absolute;pointer-events:none;will-change:transform;z-index:2;filter:blur(0.45px) drop-shadow(rgba(42,37,32,0.08) 0px 0px 3px);`;
const Bubble = styled.div`
  position: absolute; pointer-events: none; z-index: 10;
  will-change: transform, opacity; transform: translate(-50%, -100%);
  opacity: ${p => p.$vis ? 1 : 0}; transition: opacity 0.3s;
`;
const BubbleInner = styled.div`
  position: relative; padding: 4px 12px; background: white; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.06);
  white-space: nowrap; text-align: center; font-family: 'DM Sans', sans-serif;
  font-size: 10px; color: rgba(42,37,32,0.7); line-height: 1.5;
  @media (min-width: 640px) { font-size: 11px; }
  &::after {
    content:''; position:absolute; bottom:-5px; left:50%; transform:translateX(-50%) rotate(45deg);
    width:10px; height:10px; background:white; border-right:1px solid rgba(0,0,0,0.06); border-bottom:1px solid rgba(0,0,0,0.06);
  }
`;

/* ═══ Component ═══ */

export function DuckRace() {
  const trackCanvasRef = useRef(null);
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const ducksRef = useRef([]);
  const duckDivsRef = useRef([null, null, null]);
  const animRef = useRef(0);
  const [paddleX, setPaddleX] = useState(21.5);
  const [bubble, setBubble] = useState(null);
  const bubbleRef = useRef(null);
  const bubbleDuckIdx = useRef(-1); // tracks which duck the bubble follows
  const lastQuote = useRef('');

  useEffect(() => {
    const iv = setInterval(() => setPaddleX(x => x === 21.5 ? 26 : 21.5), 250);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = trackCanvasRef.current;
    if (!wrap || !canvas) return;

    const rect = wrap.getBoundingClientRect();
    const cssW = Math.round(rect.width), cssH = 320;
    const track = generateTrack(cssW, cssH);
    trackRef.current = track;

    renderTrackCanvas(canvas, track, cssW, cssH);

    // Init 3 ducks
    const spacing = track.totalLen / 3;
    ducksRef.current = [
      { d: 0, base: 2.5, freq: 0.31, lane: -0.7, mallard: false, phase: 0 },
      { d: spacing, base: 2.9, freq: 0.43, lane: 0, mallard: true, phase: 2.1 },
      { d: spacing * 2, base: 2.7, freq: 0.37, lane: 0.7, mallard: false, phase: 4.2 },
    ];

    let running = true;
    let lastTime = performance.now();

    // Speech bubble timer
    let quoteTimer = null;
    function scheduleQuote() {
      quoteTimer = setTimeout(() => {
        if (!running) return;
        let q;
        do { q = RACE_QUOTES[Math.floor(Math.random() * RACE_QUOTES.length)]; } while (q === lastQuote.current && RACE_QUOTES.length > 1);
        lastQuote.current = q;
        const duckIdx = Math.floor(Math.random() * 3);
        bubbleDuckIdx.current = duckIdx;
        const bubbleId = Date.now();
        setBubble({ text: q, duckIdx, id: bubbleId });
        setTimeout(() => {
          setBubble(prev => prev?.id === bubbleId ? null : prev);
          if (bubbleDuckIdx.current === duckIdx) bubbleDuckIdx.current = -1;
        }, 3500 + Math.random() * 2000);
        scheduleQuote();
      }, 3000 + Math.random() * 2000);
    }
    scheduleQuote();

    const frame = () => {
      if (!running) return;
      animRef.current = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = now / 1000;

      for (let i = 0; i < 3; i++) {
        const duck = ducksRef.current[i];
        // Speed with sinusoidal variation
        let speed = duck.base + Math.sin(time * duck.freq * Math.PI * 2 + duck.phase) * 0.45;

        // Slow on curves (check angle diff over 8 units)
        const pos1 = trackPosAt(track, duck.d);
        const pos2 = trackPosAt(track, duck.d + 8);
        const angleDiff = Math.abs(pos2.angle - pos1.angle);
        if (angleDiff > 0.015) speed *= 0.88;

        duck.d = (duck.d + speed * dt * 60) % track.totalLen;

        const pos = trackPosAt(track, duck.d);
        // Lane offset (perpendicular to track)
        const laneOffset = duck.lane * 12;
        const px = pos.x - Math.sin(pos.angle) * laneOffset;
        const py = pos.y + Math.cos(pos.angle) * laneOffset;

        // Wobble
        const wobble = Math.sin(time * 7 + duck.phase) * 3;
        const bob = Math.sin(time * 14 + duck.phase) * 1;
        const rot = (pos.angle * 180 / Math.PI) + 90 + wobble;

        const el = duckDivsRef.current[i];
        if (el) {
          el.style.left = `${px}px`;
          el.style.top = `${py + bob}px`;
          el.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
        }
      }

      // Update bubble position via ref (not state — state is stale in this closure)
      if (bubbleRef.current && bubbleDuckIdx.current >= 0) {
        const dEl = duckDivsRef.current[bubbleDuckIdx.current];
        if (dEl) {
          bubbleRef.current.style.left = dEl.style.left;
          bubbleRef.current.style.top = `${parseFloat(dEl.style.top) - 32}px`;
        }
      }
    };
    animRef.current = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      clearTimeout(quoteTimer);
    };
  }, []);

  return (
    <Wrapper ref={wrapRef}>
      <TrackCanvas ref={trackCanvasRef} />
      {[0, 1, 2].map(i => (
        <DuckDiv key={i} ref={el => { duckDivsRef.current[i] = el; }}>
          <DuckSvg mallard={i === 1} paddleX={paddleX} />
        </DuckDiv>
      ))}
      {bubble && (
        <Bubble $vis={true} ref={bubbleRef}>
          <BubbleInner>{bubble.text}</BubbleInner>
        </Bubble>
      )}
    </Wrapper>
  );
}
