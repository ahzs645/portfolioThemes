import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { filterActive, pickSocialUrl } from '../../utils/cvHelpers';
import { withBase } from '../../utils/assetPath';
import { Fluid } from './fluid';
import { loadBitmapFont } from './bitmapFont';

/*
 * A faithful reproduction of vibe-coded.com — a WebGPU ASCII-shader scene driven
 * by a real fluid simulation and rendered through the actual Bm437_ATI_9x16
 * oldschool PC bitmap font. The pointer injects velocity + dye (you stir it),
 * drifting "ball" emitters keep it alive, and the density field is quantized
 * into crisp pixel-glyph cells coloured from a shared gradient, behind a thin
 * window with CONTACT / PROJECTS tabs, a gradient headline, contact lines, a
 * "$ " prompt, a Tweakpane-style Shader Controls panel and a /dice easter egg.
 * The original is a ~1.1MB bespoke WebGPU engine; this is a 2D-canvas
 * reimplementation of the same look, rendering and behaviour, driven by CV.yaml.
 */

const VOID = '#02050b';
const FONT_URL = 'fonts/oldschool/Bm437_ATI_9x16.otb';
const RAMPS = {
  ascii: [' ', '·', '°', '○', '◙', '•'],
  block: [' ', '.', '░', '▒', '▓', '█'],
};
const CURSOR_GLYPH = '▒';
const BUCKETS = 32;
const WHITE = BUCKETS;
const DARK = BUCKETS + 1;
const DENSITY_GAIN = 0.5;

// Shared colour gradient (green -> teal -> cyan -> blue -> violet -> magenta).
const GRAD = [
  [44, 255, 130],
  [42, 232, 198],
  [66, 196, 255],
  [120, 132, 255],
  [180, 92, 255],
  [255, 72, 214],
];
const ACCENT = '#74f0ff';
const TEXT_DIM = '#5f8f7e';

// Every glyph the scene can draw, so the atlas covers them.
const CHARS = (() => {
  let s = ' ';
  for (let c = 33; c < 127; c += 1) s += String.fromCharCode(c);
  s += '·°○◙•░▒▓█┌┐└┘─│├┤┬┴‾…↗';
  return s;
})();

function frac(n) {
  return n - Math.floor(n);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function grad(p) {
  const f = frac(p) * GRAD.length;
  const i = Math.floor(f);
  const t = f - i;
  const a = GRAD[i % GRAD.length];
  const b = GRAD[(i + 1) % GRAD.length];
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function bucketColor(b) {
  if (b === WHITE) return [255, 255, 255];
  if (b === DARK) return [3, 6, 13];
  return grad(b / BUCKETS);
}
function bucketOf(param) {
  return ((Math.floor(frac(param) * BUCKETS) % BUCKETS) + BUCKETS) % BUCKETS;
}
function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function smoothstep(e0, e1, x) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function VibeCodedTheme() {
  const cv = useCV();
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const fontRef = useRef(null);

  const [glyphMode, setGlyphMode] = useState('ascii');
  const [gradientName, setGradientName] = useState('Vibe');
  const [panelOpen, setPanelOpen] = useState(true);

  const data = useMemo(() => {
    const safe = cv || {};
    const projects = filterActive(safe.projects || [])
      .map((p) => ({
        label: String(p.name || p.title || 'project').toUpperCase(),
        url: p.url || p.website || p.link || null,
      }))
      .filter((p) => p.label);
    const socials = (safe.socialRaw || []).filter((s) => s && s.url);
    const xUrl = pickSocialUrl(socials, ['x', 'twitter']);
    const xHandle = (() => {
      const s = socials.find((it) =>
        ['x', 'twitter'].includes(String(it.network || '').toLowerCase()),
      );
      const h = s?.username || (xUrl ? xUrl.split('/').filter(Boolean).pop() : null);
      return h ? `@${String(h).replace(/^@/, '')}` : null;
    })();
    return {
      name: safe.name || 'your name',
      headline: safe.headline || safe.tagline || safe.label || 'I build things on the web.',
      email: safe.email || null,
      xHandle,
      xUrl,
      website: safe.website || null,
      projects,
      socials,
    };
  }, [cv]);

  const stateRef = useRef({
    view: 'contact',
    glyphMode,
    ramp: RAMPS[glyphMode],
    hover: null,
    inputValue: '',
    inputFocused: false,
    diceMsg: false,
    puv: { x: 0.5, y: 0.5 },
    plast: { x: 0.5, y: 0.5 },
    pvel: { x: 0, y: 0 },
    pactive: false,
  });
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    stateRef.current.glyphMode = glyphMode;
    stateRef.current.ramp = RAMPS[glyphMode];
  }, [glyphMode]);

  // Load the bitmap font atlas once.
  useEffect(() => {
    let alive = true;
    loadBitmapFont(withBase(FONT_URL), CHARS, grad, BUCKETS)
      .then((f) => {
        if (alive) fontRef.current = f;
      })
      .catch(() => {
        if (alive) fontRef.current = null;
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    const ctx = canvas.getContext('2d', { alpha: false });
    const bloom = document.createElement('canvas');
    const bctx = bloom.getContext('2d');

    let raf = 0;
    let start = 0;
    let last = 0;
    let cssW = 0;
    let cssH = 0;
    let cellW = 11;
    let cellH = 20;
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let layout = null;
    let fluid = null;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      cssW = Math.max(320, rect.width);
      cssH = Math.max(320, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      bloom.width = canvas.width;
      bloom.height = canvas.height;
      cellW = Math.max(9, Math.min(13, cssW / 150));
      cellH = (cellW * 16) / 9; // match the 9x16 bitmap cell aspect
      cols = Math.ceil(cssW / cellW);
      rows = Math.ceil(cssH / cellH);
      if (!fluid || fluid.w !== cols || fluid.h !== rows) fluid = new Fluid(cols, rows);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function computeLayout() {
      const d = dataRef.current;
      const s = stateRef.current;
      const lines =
        s.view === 'contact'
          ? [d.headline, d.email || '', d.xHandle ? `x: ${d.xHandle}` : '']
          : d.projects.map((p) => `> ${p.label}`);
      const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
      const innerW = Math.max(longest + 8, 44);
      const boxW = Math.min(cols - 6, innerW);
      const boxH =
        s.view === 'contact'
          ? Math.min(rows - 6, 20)
          : Math.min(rows - 6, Math.max(14, d.projects.length + 7));
      const x0 = Math.floor((cols - boxW) / 2);
      const y0 = Math.floor((rows - boxH) / 2);
      const dividerX = x0 + Math.floor(boxW / 2);
      const cx = x0 + Math.floor(boxW / 2);

      const links = [];
      links.push({ kind: 'tab-contact', x: x0 + 1, y: y0 + 1, w: dividerX - x0 - 1, h: 1 });
      links.push({ kind: 'tab-projects', x: dividerX + 1, y: y0 + 1, w: x0 + boxW - dividerX - 2, h: 1 });

      const content = [];
      if (s.view === 'contact') {
        const top = y0 + 4;
        const mid = y0 + Math.floor(boxH * 0.42);
        const low = y0 + Math.floor(boxH * 0.62);
        content.push({ type: 'center', text: d.headline, cx, y: top });
        if (d.email) {
          content.push({ type: 'center', kind: 'email', url: `mailto:${d.email}`, text: d.email, cx, y: mid });
          links.push({ kind: 'email', x: cx - Math.ceil(d.email.length / 2), y: mid, w: d.email.length, h: 1, url: `mailto:${d.email}` });
        }
        if (d.xHandle) {
          const xt = `x: ${d.xHandle}`;
          content.push({ type: 'center', kind: 'x', url: d.xUrl || undefined, text: xt, cx, y: low });
          if (d.xUrl) links.push({ kind: 'x', x: cx - Math.ceil(xt.length / 2), y: low, w: xt.length, h: 1, url: d.xUrl });
        }
        content.push({ type: 'prompt', x: x0 + 3, y: y0 + boxH - 3 });
        links.push({ kind: 'input', x: x0 + 1, y: y0 + boxH - 3, w: boxW - 2, h: 1 });
      } else {
        const list = dataRef.current.projects.slice(0, boxH - 6);
        list.forEach((p, i) => {
          const y = y0 + 4 + i;
          content.push({ type: 'left', kind: `proj-${i}`, text: `> ${p.label}`, x: x0 + 4, y, url: p.url });
          if (p.url) links.push({ kind: `proj-${i}`, x: x0 + 4, y, w: p.label.length + 2, h: 1, url: p.url });
        });
      }
      return { x0, y0, boxW, boxH, dividerX, links, content };
    }

    function stepFluid(t) {
      const s = stateRef.current;
      const vx = fluid.vx;
      const vy = fluid.vy;
      const D = fluid.d;
      // Procedural curl-noise (default "noise-mouse" behaviour): inject dye in
      // evolving organic patches and a rotational velocity following the noise,
      // plus upward buoyancy so the dye rises and curls like smoke.
      const ns = 0.09;
      const ts = t * 0.16;
      const e = 1.3;
      const F = 0.5;
      const DY = 0.05;
      const UP = 0.5;
      for (let gy = 0; gy < rows; gy += 1) {
        for (let gx = 0; gx < cols; gx += 1) {
          const i = gx + gy * cols;
          const a = vnoise((gx + e) * ns + ts, gy * ns - ts);
          const b = vnoise((gx - e) * ns + ts, gy * ns - ts);
          const c = vnoise(gx * ns + ts, (gy + e) * ns - ts);
          const dn = vnoise(gx * ns + ts, (gy - e) * ns - ts);
          vx[i] += (c - dn) * F; // curl of the noise potential
          vy[i] -= (a - b) * F;
          const n = vnoise(gx * ns * 1.6 - ts, gy * ns * 1.6 + ts * 0.8);
          D[i] += smoothstep(0.52, 0.82, n) * DY;
          vy[i] -= D[i] * UP * 0.04; // buoyancy: dye rises
        }
      }
      // pointer splat — inject force + dye scaled by pointer speed
      const speed = Math.hypot(s.pvel.x, s.pvel.y);
      if (s.pactive && speed > 0.0006) {
        const strength = Math.min(1, speed * 26);
        fluid.splat(
          s.puv.x * cols,
          s.puv.y * rows,
          s.pvel.x * cols * 36,
          s.pvel.y * rows * 36,
          0.85 + strength * 2.4,
          4.5,
        );
      }
      s.pvel.x *= 0.86;
      s.pvel.y *= 0.86;
      fluid.step(1, 0.9); // curl strength (vorticity confinement)
    }

    function draw(now) {
      if (!start) start = now;
      if (now - last < 30) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = now;
      const t = (now - start) / 1000;
      const s = stateRef.current;
      const font = fontRef.current;
      const ramp = s.ramp;
      layout = computeLayout();
      const blink = Math.floor(t * 1.6) % 2 === 0;

      stepFluid(t);
      const D = fluid.d;

      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = VOID;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      if (!font) {
        ctx.font = `${Math.round(cellH * 0.92)}px ui-monospace, monospace`;
      }

      // Blit one glyph, from the bitmap atlas (crisp) or a monospace fallback.
      const blit = (gx, gy, ch, bucket, alpha) => {
        if (ch === ' ') return;
        if (font) {
          ctx.globalAlpha = alpha;
          font.draw(ctx, ch, bucket, gx * cellW, gy * cellH, cellW, cellH);
        } else {
          const c = bucketColor(bucket);
          ctx.globalAlpha = 1;
          ctx.fillStyle = `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${alpha})`;
          ctx.fillText(ch, gx * cellW, gy * cellH);
        }
      };
      ctx.globalAlpha = 1;

      const densityAt = (gx, gy) => {
        const x = gx < 0 ? 0 : gx >= cols ? cols - 1 : gx;
        const y = gy < 0 ? 0 : gy >= rows ? rows - 1 : gy;
        return D[x + y * cols] * DENSITY_GAIN;
      };
      const bucketAt = (gx, gy) => bucketOf(Math.min(1, densityAt(gx, gy)) * 1.85 + t * 0.04);

      // --- fluid dye field ---
      for (let gy = 0; gy < rows; gy += 1) {
        for (let gx = 0; gx < cols; gx += 1) {
          const k = Math.min(1, D[gx + gy * cols] * DENSITY_GAIN);
          if (k < 0.09) continue;
          const ch = ramp[Math.min(ramp.length - 1, 1 + Math.floor(k * (ramp.length - 1)))];
          if (ch === ' ') continue;
          blit(gx, gy, ch, bucketOf(k * 1.85 + t * 0.04), 0.4 + k * 0.55);
        }
      }
      ctx.globalAlpha = 1;

      // --- window interior ---
      const { x0, y0, boxW, boxH, dividerX, content } = layout;
      const ix = x0 * cellW;
      const iy = y0 * cellH;
      const iw = boxW * cellW;
      const ih = boxH * cellH;
      const vg = ctx.createRadialGradient(ix + iw / 2, iy + ih / 2, 0, ix + iw / 2, iy + ih / 2, Math.max(iw, ih) * 0.7);
      vg.addColorStop(0, 'rgba(6,10,18,0.9)');
      vg.addColorStop(1, 'rgba(2,5,11,0.98)');
      ctx.fillStyle = vg;
      ctx.fillRect(ix, iy, iw, ih);

      // --- thin border ---
      for (let gx = x0; gx < x0 + boxW; gx += 1) {
        blit(gx, y0, gx === x0 ? '┌' : gx === x0 + boxW - 1 ? '┐' : gx === dividerX ? '┬' : '─', bucketAt(gx, y0), 1);
        blit(gx, y0 + 2, gx === x0 ? '├' : gx === x0 + boxW - 1 ? '┤' : gx === dividerX ? '┴' : '─', bucketAt(gx, y0 + 2), 1);
        blit(gx, y0 + boxH - 1, gx === x0 ? '└' : gx === x0 + boxW - 1 ? '┘' : '─', bucketAt(gx, y0 + boxH - 1), 1);
      }
      for (let gy = y0 + 1; gy < y0 + boxH - 1; gy += 1) {
        blit(x0, gy, '│', bucketAt(x0, gy), 1);
        blit(x0 + boxW - 1, gy, '│', bucketAt(x0 + boxW - 1, gy), 1);
        if (gy === y0 + 1) blit(dividerX, gy, '│', bucketAt(dividerX, gy), 1);
      }
      ctx.globalAlpha = 1;

      // --- tabs ---
      const contactActive = s.view === 'contact';
      const projActive = s.view === 'projects';
      const cReg = { x: x0 + 1, w: dividerX - x0 - 1 };
      const pReg = { x: dividerX + 1, w: x0 + boxW - dividerX - 2 };
      const drawTabBar = (reg) => {
        const g = ctx.createLinearGradient(reg.x * cellW, 0, (reg.x + reg.w) * cellW, 0);
        g.addColorStop(0, 'rgba(245,224,74,0.5)');
        g.addColorStop(0.7, 'rgba(245,224,74,0.95)');
        g.addColorStop(1, 'rgba(255,255,255,0.95)');
        ctx.fillStyle = g;
        ctx.fillRect(reg.x * cellW, (y0 + 1) * cellH, reg.w * cellW, cellH);
      };
      const drawTabText = (label, reg, active) => {
        const tx = reg.x + Math.floor((reg.w - label.length) / 2);
        for (let i = 0; i < label.length; i += 1) {
          blit(tx + i, y0 + 1, label[i], active ? DARK : bucketAt(tx + i, y0 + 1), 1);
        }
      };
      if (contactActive) drawTabBar(cReg);
      if (projActive) drawTabBar(pReg);
      drawTabText('CONTACT', cReg, contactActive);
      drawTabText('PROJECTS', pReg, projActive);
      ctx.globalAlpha = 1;

      // --- content ---
      content.forEach((c) => {
        const hovered = s.hover && c.kind && s.hover.kind === c.kind;
        if (c.type === 'center' || c.type === 'left') {
          const startX = c.type === 'center' ? c.cx - Math.ceil(c.text.length / 2) : c.x;
          for (let i = 0; i < c.text.length; i += 1) {
            const ch = c.text[i];
            if (ch === ' ') continue;
            blit(startX + i, c.y, ch, hovered ? WHITE : bucketAt(startX + i, c.y), 1);
          }
          if (hovered && c.url) {
            for (let i = 0; i < c.text.length; i += 1) blit(startX + i, c.y + 1, '─', WHITE, 0.8);
          }
        } else if (c.type === 'prompt') {
          const base = s.diceMsg ? '$ rolling the dice…' : `$ ${s.inputValue}`;
          for (let i = 0; i < base.length; i += 1) blit(c.x + i, c.y, base[i], 0, 1);
          if (s.inputFocused && blink && !s.diceMsg) blit(c.x + base.length + 1, c.y, CURSOR_GLYPH, WHITE, 1);
        }
      });
      ctx.globalAlpha = 1;

      // --- bloom ---
      bctx.clearRect(0, 0, bloom.width, bloom.height);
      bctx.drawImage(canvas, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.42;
      ctx.filter = 'blur(2.5px)';
      ctx.drawImage(bloom, 0, 0, cssW, cssH);
      ctx.globalAlpha = 0.22;
      ctx.filter = 'blur(7px)';
      ctx.drawImage(bloom, 0, 0, cssW, cssH);
      ctx.restore();
      ctx.filter = 'none';

      // scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      for (let gy = 0; gy < rows; gy += 1) ctx.fillRect(0, gy * cellH + cellH - 1, cssW, 1);

      raf = requestAnimationFrame(draw);
    }

    function pickLink(px, py) {
      if (!layout) return null;
      const gx = px / cellW;
      const gy = py / cellH;
      for (const l of layout.links) {
        if (gx >= l.x && gx < l.x + l.w && gy >= l.y && gy < l.y + l.h) return l;
      }
      return null;
    }
    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const s = stateRef.current;
      const ux = px / rect.width;
      const uy = py / rect.height;
      if (s.pactive) {
        s.pvel.x = ux - s.plast.x;
        s.pvel.y = uy - s.plast.y;
      }
      s.puv.x = ux;
      s.puv.y = uy;
      s.plast.x = ux;
      s.plast.y = uy;
      s.pactive = true;
      const link = pickLink(px, py);
      s.hover = link;
      canvas.style.cursor = link
        ? link.kind === 'input'
          ? 'text'
          : link.url || link.kind.startsWith('tab')
            ? 'pointer'
            : 'default'
        : 'default';
    }
    function onLeave() {
      stateRef.current.pactive = false;
    }
    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const link = pickLink(e.clientX - rect.left, e.clientY - rect.top);
      const s = stateRef.current;
      if (!link) {
        s.inputFocused = false;
        return;
      }
      if (link.kind === 'tab-contact') s.view = 'contact';
      else if (link.kind === 'tab-projects') s.view = 'projects';
      else if (link.kind === 'input') s.inputFocused = true;
      else if (link.url) window.open(link.url, '_blank', 'noopener');
    }
    function onKey(e) {
      const s = stateRef.current;
      if (!s.inputFocused) return;
      if (e.key === 'Backspace') {
        s.inputValue = s.inputValue.slice(0, -1);
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (s.inputValue.trim().toLowerCase() === '/dice') {
          s.diceMsg = true;
          setTimeout(() => {
            s.diceMsg = false;
          }, 1600);
        }
        s.inputValue = '';
        e.preventDefault();
      } else if (e.key.length === 1 && s.inputValue.length < 64) {
        s.inputValue += e.key;
        e.preventDefault();
      }
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const setView = (view) => {
    stateRef.current.view = view;
  };

  return (
    <>
      <GlobalStyle />
      <Wrap ref={wrapRef}>
        <Canvas ref={canvasRef} />

        <Pane data-open={panelOpen ? '' : undefined}>
          <PaneHead onClick={() => setPanelOpen((v) => !v)}>
            <span>Shader Controls</span>
            <span>{panelOpen ? '▾' : '▸'}</span>
          </PaneHead>
          {panelOpen && (
            <PaneBody>
              <PaneRow>
                <label>glyphMode</label>
                <select value={glyphMode} onChange={(e) => setGlyphMode(e.target.value)}>
                  <option value="ascii">ASCII</option>
                  <option value="block">Block</option>
                </select>
              </PaneRow>
              <PaneRow>
                <label>gradient</label>
                <select value={gradientName} onChange={(e) => setGradientName(e.target.value)}>
                  <option>Vibe</option>
                  <option>DOS Warm</option>
                  <option>VGA Cool</option>
                </select>
              </PaneRow>
              <PaneRow>
                <label>view</label>
                <Seg>
                  <button type="button" onClick={() => setView('contact')}>contact</button>
                  <button type="button" onClick={() => setView('projects')}>projects</button>
                </Seg>
              </PaneRow>
            </PaneBody>
          )}
        </Pane>

        <Hint aria-hidden="true">move to stir · type <b>/dice</b> ↘</Hint>
      </Wrap>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  body { background: ${VOID}; }
`;

const Wrap = styled.main`
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100%;
  overflow: hidden;
  background: ${VOID};
  font-family: ui-monospace, monospace;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  image-rendering: pixelated;
`;

const Pane = styled.aside`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 176px;
  font-size: 11px;
  color: #cfffe0;
  background: rgba(8, 12, 22, 0.9);
  border: 1px solid rgba(116, 240, 255, 0.25);
  border-radius: 6px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  user-select: none;
  font-family: ui-monospace, monospace;

  @media (max-width: 600px) { display: none; }
`;

const PaneHead = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  background: rgba(116, 240, 255, 0.08);
  border: none;
  border-bottom: 1px solid rgba(116, 240, 255, 0.18);
  border-radius: 6px 6px 0 0;
  color: ${ACCENT};
  font: inherit;
  letter-spacing: 0.04em;
  cursor: pointer;
`;

const PaneBody = styled.div`
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const PaneRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  label { color: ${TEXT_DIM}; }

  select {
    flex: 1;
    max-width: 92px;
    background: rgba(0, 0, 0, 0.4);
    color: #cfffe0;
    border: 1px solid rgba(116, 240, 255, 0.25);
    border-radius: 3px;
    font: inherit;
    padding: 2px 4px;
  }
`;

const Seg = styled.div`
  display: flex;
  gap: 4px;

  button {
    flex: 1;
    background: rgba(0, 0, 0, 0.4);
    color: #cfffe0;
    border: 1px solid rgba(116, 240, 255, 0.25);
    border-radius: 3px;
    font: inherit;
    font-size: 10px;
    padding: 2px 0;
    cursor: pointer;
  }
  button:hover { border-color: ${ACCENT}; color: ${ACCENT}; }
`;

const Hint = styled.div`
  position: absolute;
  left: 14px;
  bottom: 12px;
  z-index: 10;
  font-size: 11px;
  color: ${TEXT_DIM};
  letter-spacing: 0.03em;
  font-family: ui-monospace, monospace;

  b { color: ${ACCENT}; }

  @media (max-width: 600px) { display: none; }
`;

export default VibeCodedTheme;
