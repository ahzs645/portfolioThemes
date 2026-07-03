import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Fluid } from './fluid';
import { loadBitmapFont } from './bitmapFont';
import { withBase } from '../../utils/assetPath';

const VOID = '#02050b';
const FONT_URL = 'fonts/oldschool/Bm437_ATI_9x16.otb';
const BUCKETS = 32;
const WHITE = BUCKETS;
const DARK = BUCKETS + 1;
const CURSOR_GLYPH = '▒';
const DENSITY_GAIN = 0.5;
const MAX_INPUT = 256;

const RAMPS = {
  ascii: [' ', '·', '°', '○', '◙', '•'],
  block: [' ', '.', '░', '▒', '▓', '█'],
};

const GRADIENTS = {
  vga: [
    [85, 255, 85],
    [85, 255, 255],
    [85, 85, 255],
    [255, 85, 255],
    [255, 85, 85],
    [255, 255, 85],
  ],
  amber: [
    [255, 255, 190],
    [255, 213, 74],
    [255, 137, 34],
    [255, 67, 77],
    [190, 79, 255],
    [74, 197, 255],
  ],
  synth: [
    [113, 128, 255],
    [160, 143, 230],
    [228, 166, 74],
    [243, 154, 22],
    [255, 87, 200],
    [159, 33, 255],
  ],
};

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

function smoothstep(e0, e1, x) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function hash2(x, y) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
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

function wrapText(text, width) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function truncate(text, width) {
  const value = String(text || '');
  return value.length <= width ? value : `${value.slice(0, Math.max(0, width - 1))}…`;
}

function makeCanvas(w = 1, h = 1) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function gradientFactory(name) {
  const stops = GRADIENTS[name] || GRADIENTS.vga;
  return (p) => {
    const f = frac(p) * stops.length;
    const i = Math.floor(f);
    const t = f - i;
    const a = stops[i % stops.length];
    const b = stops[(i + 1) % stops.length];
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  };
}

function bucketOf(param) {
  return ((Math.floor(frac(param) * BUCKETS) % BUCKETS) + BUCKETS) % BUCKETS;
}

function bucketColor(bucket, gradientName) {
  if (bucket === WHITE) return [255, 255, 255];
  if (bucket === DARK) return [3, 6, 13];
  return gradientFactory(gradientName)(bucket / BUCKETS);
}

function makeFaceTexture(label, bg, fg) {
  const c = makeCanvas(256, 256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 10;
  ctx.strokeRect(16, 16, 224, 224);
  ctx.fillStyle = fg;
  ctx.font = 'bold 136px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 134);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

export class VibeCodedRuntime {
  constructor(mount, data) {
    this.mount = mount;
    this.data = data;

    this.renderer = null;
    this.composer = null;
    this.scene = null;
    this.camera = null;
    this.diceScene = null;
    this.diceCamera = null;
    this.dice = null;
    this.asciiTexture = null;
    this.asciiCanvas = makeCanvas();
    this.asciiCtx = this.asciiCanvas.getContext('2d', { alpha: false });
    this.font = null;
    this.fontGradient = 'vga';

    this.cssW = 1;
    this.cssH = 1;
    this.cellW = 18;
    this.cellH = 32;
    this.cols = 1;
    this.rows = 1;
    this.fluid = null;
    this.layout = null;
    this.raf = 0;
    this.start = 0;
    this.last = 0;
    this.disposed = false;
    this.resizeObserver = null;

    this.state = {
      appMode: 'overlay',
      view: 'contact',
      hover: null,
      inputValue: '',
      inputFocused: false,
      copiedSeconds: 0,
      puv: { x: 0.5, y: 0.5 },
      plast: { x: 0.5, y: 0.5 },
      pvel: { x: 0, y: 0 },
      pactive: false,
      displayScale: 2,
      textScale: 2,
      glyphMode: 'ascii',
      colorMode: 'vga-gradient',
      gradientName: 'vga',
      interactionMode: 'noise-mouse',
      invertGradient: true,
      bloomStrength: 0.7,
      ball: { x: 0.25, y: 0.35, dx: 0.34, dy: 0.21, t: 0 },
      sprite: { x: 0.5, y: 0.5, vx: 0, vy: 0, t: 0 },
      vortexT: 0,
      flameT: 0,
      diceT: 0,
      diceRoll: 0,
    };

    this.onResize = this.resize.bind(this);
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerLeave = this.handlePointerLeave.bind(this);
    this.onPointerDown = this.handlePointerDown.bind(this);
    this.onKey = this.handleKey.bind(this);
  }

  async init() {
    this.mount.innerHTML = '';
    this.mount.classList.add('vibe-coded-runtime');
    await this.createRenderer();
    if (this.disposed) return;
    this.createScenes();
    if (this.disposed) return;

    this.font = await loadBitmapFont(
      withBase(FONT_URL),
      CHARS,
      gradientFactory(this.state.gradientName),
      BUCKETS,
    ).catch(() => null);
    if (this.disposed) return;

    this.resize();
    this.mount.addEventListener('pointermove', this.onPointerMove);
    this.mount.addEventListener('pointerleave', this.onPointerLeave);
    this.mount.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('resize', this.onResize);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.mount);
    }
    this.raf = requestAnimationFrame((now) => this.frame(now));
  }

  async createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(VOID, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'vibe-coded-three';
    this.mount.append(this.renderer.domElement);
  }

  createScenes() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    this.camera.position.z = 1;

    this.asciiTexture = new THREE.CanvasTexture(this.asciiCanvas);
    this.asciiTexture.colorSpace = THREE.SRGBColorSpace;
    this.asciiTexture.magFilter = THREE.NearestFilter;
    this.asciiTexture.minFilter = THREE.NearestFilter;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uAscii: { value: this.asciiTexture },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uAscii;
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
          vec2 uv = vUv;
          vec3 col = texture2D(uAscii, uv).rgb;
          float scan = 0.88 + 0.12 * sin((uv.y * uResolution.y) * 3.14159);
          vec2 centered = uv - 0.5;
          float vignette = smoothstep(0.86, 0.22, dot(centered, centered));
          float flicker = 0.992 + 0.008 * sin(uTime * 7.0);
          float grainPhase = floor(uTime * 2.0);
          float grain = (hash(floor(uv * uResolution.xy * 0.75) + grainPhase) - 0.5) * 0.026;
          col = col * scan * vignette * flicker + grain;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    this.asciiMaterial = material;
    this.scene.add(plane);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), this.state.bloomStrength, 0, 0);
    this.composer.addPass(this.bloomPass);

    this.diceScene = new THREE.Scene();
    this.diceCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.diceCamera.position.set(0, 0, 5);
    const light = new THREE.DirectionalLight(0xffffff, 2.4);
    light.position.set(3, 4, 5);
    this.diceScene.add(light);
    this.diceScene.add(new THREE.AmbientLight(0x80bfff, 1.1));
    const materials = ['1', '2', '3', '4', '5', '6'].map((n, i) => {
      const color = i % 2 === 0 ? '#ffdf47' : '#52fff2';
      return new THREE.MeshStandardMaterial({
        map: makeFaceTexture(n, '#050811', color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.12,
        roughness: 0.42,
        metalness: 0.08,
      });
    });
    this.dice = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.85, 1.85), materials);
    this.dice.visible = false;
    this.diceScene.add(this.dice);
  }

  updateData(data) {
    this.data = data;
  }

  resize() {
    const rect = this.mount.getBoundingClientRect();
    this.cssW = Math.max(320, rect.width || window.innerWidth);
    this.cssH = Math.max(320, rect.height || window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.cssW, this.cssH, false);
    this.composer.setSize(this.cssW, this.cssH);
    this.bloomPass.setSize(this.cssW, this.cssH);
    this.asciiMaterial.uniforms.uResolution.value.set(this.cssW * dpr, this.cssH * dpr);
    this.diceCamera.aspect = this.cssW / this.cssH;
    this.diceCamera.updateProjectionMatrix();

    // Narrow screens need smaller cells so the overlay box keeps enough
    // text columns; 9px matches the bitmap font's native glyph width.
    const minCell = this.cssW < 640 ? 9 : 14;
    this.cellW = Math.max(minCell, Math.min(24, (this.cssW / 86) * (this.state.displayScale / 2)));
    this.cellH = (this.cellW * 16) / 9;
    this.cols = Math.max(1, Math.ceil(this.cssW / this.cellW));
    this.rows = Math.max(1, Math.ceil(this.cssH / this.cellH));
    this.asciiCanvas.width = Math.floor(this.cssW * dpr);
    this.asciiCanvas.height = Math.floor(this.cssH * dpr);
    this.asciiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!this.fluid || this.fluid.w !== this.cols || this.fluid.h !== this.rows) {
      this.fluid = new Fluid(this.cols, this.rows);
    }
  }

  computeLayout() {
    const d = this.data;
    const s = this.state;
    // On narrow grids give the box nearly the full width and wrap the
    // headline instead of letting text spill past the frame.
    const margin = this.cols < 52 ? 2 : 6;
    const lines =
      s.view === 'contact'
        ? [d.headline, d.email || '', d.xHandle ? `x: ${d.xHandle}` : '']
        : d.projects.map((p) => `> ${p.label}`);
    const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
    const innerW = Math.max(longest + 8, 44);
    const boxW = Math.max(24, Math.min(this.cols - margin, innerW));
    const headlineLines = s.view === 'contact' ? wrapText(d.headline, boxW - 6) : [];
    const boxH =
      s.view === 'contact'
        ? Math.min(this.rows - 4, Math.max(14, 9 + headlineLines.length + (d.email ? 2 : 0) + (d.xHandle ? 2 : 0)))
        : Math.min(this.rows - 4, Math.max(14, d.projects.length * 3 + 7));
    const x0 = Math.floor((this.cols - boxW) / 2);
    const y0 = Math.floor((this.rows - boxH) / 2);
    const dividerX = x0 + Math.floor(boxW / 2);
    const cx = x0 + Math.floor(boxW / 2);

    const links = [
      { kind: 'tab-contact', x: x0 + 1, y: y0 + 1, w: dividerX - x0 - 1, h: 1 },
      { kind: 'tab-projects', x: dividerX + 1, y: y0 + 1, w: x0 + boxW - dividerX - 2, h: 1 },
    ];
    const content = [];

    if (s.view === 'contact') {
      let y = y0 + 4;
      for (const line of headlineLines) {
        content.push({ type: 'center', text: line, cx, y });
        y += 1;
      }
      y += 1;
      if (d.email) {
        const emailText = truncate(s.copiedSeconds > 0 ? 'copied' : d.email, boxW - 4);
        const linkW = Math.min(d.email.length, boxW - 4);
        content.push({ type: 'center', kind: 'email', text: emailText, cx, y });
        links.push({ kind: 'email', x: cx - Math.ceil(linkW / 2), y, w: linkW, h: 1, url: `mailto:${d.email}` });
        y += 2;
      }
      if (d.xHandle) {
        const xt = truncate(`x: ${d.xHandle}`, boxW - 4);
        content.push({ type: 'center', kind: 'x', url: d.xUrl || undefined, text: xt, cx, y });
        if (d.xUrl) links.push({ kind: 'x', x: cx - Math.ceil(xt.length / 2), y, w: xt.length, h: 1, url: d.xUrl });
        y += 2;
      }
      content.push({ type: 'prompt', x: x0 + 3, y: y0 + boxH - 3 });
      links.push({ kind: 'input', x: x0 + 1, y: y0 + boxH - 3, w: boxW - 2, h: 1 });
    } else {
      const list = d.projects.slice(0, Math.floor((boxH - 6) / 3));
      list.forEach((p, i) => {
        const y = y0 + 4 + i * 3;
        const label = `> ${p.label}`;
        content.push({ type: 'button', kind: `proj-${i}`, text: label, x: x0 + 3, y, w: Math.min(boxW - 6, label.length + 4), h: 2, url: p.url });
        if (p.url) links.push({ kind: `proj-${i}`, x: x0 + 3, y, w: Math.min(boxW - 6, label.length + 4), h: 2, url: p.url });
      });
    }

    return { x0, y0, boxW, boxH, dividerX, links, content };
  }

  stepFluid(dt, t) {
    const s = this.state;
    const { vx, vy, d: D } = this.fluid;
    const useNoise = ['noise', 'noise-mouse', 'sprite', 'flame', 'vortex'].includes(s.interactionMode);
    if (useNoise) {
      const ns = 0.09;
      const ts = t * 0.045;
      for (let gy = 0; gy < this.rows; gy += 1) {
        for (let gx = 0; gx < this.cols; gx += 1) {
          const i = gx + gy * this.cols;
          const a = vnoise((gx + 1.3) * ns + ts, gy * ns - ts);
          const b = vnoise((gx - 1.3) * ns + ts, gy * ns - ts);
          const c = vnoise(gx * ns + ts, (gy + 1.3) * ns - ts);
          const dn = vnoise(gx * ns + ts, (gy - 1.3) * ns - ts);
          vx[i] += (c - dn) * 0.1 * dt;
          vy[i] -= (a - b) * 0.1 * dt;
          const n = vnoise(gx * ns * 1.6 - ts, gy * ns * 1.6 + ts * 0.8);
          D[i] += smoothstep(0.58, 0.86, n) * 0.01 * dt;
          vy[i] -= D[i] * 0.005 * dt;
        }
      }
    }

    if ((s.interactionMode === 'mouse' || s.interactionMode === 'noise-mouse') && s.pactive) {
      const speed = Math.hypot(s.pvel.x, s.pvel.y);
      if (speed > 0.0006) {
        const strength = Math.min(1, speed * 26);
        this.fluid.splat(
          s.puv.x * this.cols,
          s.puv.y * this.rows,
          s.pvel.x * this.cols * 10,
          s.pvel.y * this.rows * 10,
          0.32 + strength * 0.7,
          3.2,
        );
      }
    } else if (s.interactionMode === 'ball') {
      this.updateBall(dt);
    } else if (s.interactionMode === 'sprite') {
      this.updateSprite(dt, t);
    } else if (s.interactionMode === 'flame') {
      this.updateFlame(dt, t);
    } else if (s.interactionMode === 'vortex') {
      this.updateVortex(dt, t);
    }

    s.pvel.x *= Math.exp(-dt * 12);
    s.pvel.y *= Math.exp(-dt * 12);
    this.fluid.step(Math.min(0.34, dt * 6), 0.22);
  }

  updateBall(dt) {
    const b = this.state.ball;
    b.t += dt;
    b.x += b.dx * dt * 0.26;
    b.y += b.dy * dt * 0.26;
    if (b.x < 0.03 || b.x > 0.97) b.dx *= -1;
    if (b.y < 0.05 || b.y > 0.95) b.dy *= -1;
    b.x = Math.min(0.97, Math.max(0.03, b.x));
    b.y = Math.min(0.95, Math.max(0.05, b.y));
    this.fluid.splat(b.x * this.cols, b.y * this.rows, -b.dy * 8, b.dx * 8, 1.3, 5.5);
  }

  updateSprite(dt, t) {
    const sp = this.state.sprite;
    const targetX = this.state.pactive ? this.state.puv.x : 0.5 + Math.cos(t * 0.4) * 0.18;
    const targetY = this.state.pactive ? this.state.puv.y : 0.5 + Math.sin(t * 0.33) * 0.12;
    sp.vx += (targetX - sp.x) * dt * 6 + Math.cos(t * 2.3) * dt * 0.4;
    sp.vy += (targetY - sp.y) * dt * 6 + Math.sin(t * 1.9) * dt * 0.4;
    sp.vx *= Math.exp(-dt * 4);
    sp.vy *= Math.exp(-dt * 4);
    sp.x = Math.min(0.97, Math.max(0.03, sp.x + sp.vx * dt));
    sp.y = Math.min(0.97, Math.max(0.03, sp.y + sp.vy * dt));
    this.fluid.splat(sp.x * this.cols, sp.y * this.rows, sp.vx * this.cols, sp.vy * this.rows, 1.1, 4.8);
  }

  updateFlame(dt, t) {
    const center = this.state.pactive ? this.state.puv.x : 0.5;
    for (let i = 0; i < 10; i += 1) {
      const p = i / 9;
      const x = center + (p - 0.5) * 0.28 + Math.sin(t * 3 + i) * 0.01;
      const y = 0.94 - Math.random() * 0.05;
      this.fluid.splat(x * this.cols, y * this.rows, Math.sin(t + i) * 3, -16, 0.9, 4.2);
    }
    this.state.flameT += dt;
  }

  updateVortex(dt, t) {
    this.state.vortexT += dt;
    const center = this.getOverlayCenter();
    for (let i = 0; i < 14; i += 1) {
      const a = (i / 14) * Math.PI * 2 + t * 0.9;
      const x = center.x + Math.cos(a) * center.rx;
      const y = center.y + Math.sin(a) * center.ry;
      this.fluid.splat(x * this.cols, y * this.rows, -Math.sin(a) * 6, Math.cos(a) * 6, 0.55, 3.5);
    }
  }

  getOverlayCenter() {
    if (!this.layout) return { x: 0.5, y: 0.5, rx: 0.18, ry: 0.12 };
    return {
      x: (this.layout.x0 + this.layout.boxW * 0.5) / this.cols,
      y: (this.layout.y0 + this.layout.boxH * 0.5) / this.rows,
      rx: Math.min(0.24, Math.max(0.1, this.layout.boxW / this.cols * 0.7)),
      ry: Math.min(0.18, Math.max(0.08, this.layout.boxH / this.rows * 0.8)),
    };
  }

  drawGlyphFrame(t) {
    const ctx = this.asciiCtx;
    const s = this.state;
    const D = this.fluid.d;
    const ramp = RAMPS[s.glyphMode] || RAMPS.ascii;
    this.layout = this.computeLayout();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = VOID;
    ctx.fillRect(0, 0, this.cssW, this.cssH);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = `${Math.round(this.cellH * 0.82)}px ui-monospace, monospace`;

    const blit = (gx, gy, ch, bucket, alpha = 1) => {
      if (ch === ' ' || gx < 0 || gy < 0 || gx >= this.cols || gy >= this.rows) return;
      if (this.font) {
        ctx.globalAlpha = alpha;
        this.font.draw(ctx, ch, bucket, gx * this.cellW, gy * this.cellH, this.cellW, this.cellH);
      } else {
        const c = bucketColor(bucket, s.gradientName);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
        ctx.fillText(ch, gx * this.cellW, gy * this.cellH);
      }
    };

    const bucketAt = (gx, gy) => {
      const x = Math.min(this.cols - 1, Math.max(0, gx));
      const y = Math.min(this.rows - 1, Math.max(0, gy));
      const density = Math.min(1, D[x + y * this.cols] * DENSITY_GAIN);
      const spin = s.colorMode === 'rainbow' ? t * 0.075 : t * 0.014;
      return bucketOf(density * 1.85 + spin);
    };

    for (let gy = 0; gy < this.rows; gy += 1) {
      for (let gx = 0; gx < this.cols; gx += 1) {
        const k = Math.min(1, D[gx + gy * this.cols] * DENSITY_GAIN);
        if (k < 0.075) continue;
        const ch = ramp[Math.min(ramp.length - 1, 1 + Math.floor(k * (ramp.length - 1)))];
        blit(gx, gy, ch, bucketOf(k * 1.85 + t * 0.018), 0.34 + k * 0.52);
      }
    }

    this.drawOverlay(blit, bucketAt, t);
    ctx.globalAlpha = 1;
    this.asciiTexture.needsUpdate = true;
  }

  drawOverlay(blit, bucketAt, t) {
    if (this.state.appMode !== 'overlay') return;
    const ctx = this.asciiCtx;
    const s = this.state;
    const { x0, y0, boxW, boxH, dividerX, content } = this.layout;
    const ix = x0 * this.cellW;
    const iy = y0 * this.cellH;
    const iw = boxW * this.cellW;
    const ih = boxH * this.cellH;
    const bg = ctx.createRadialGradient(ix + iw / 2, iy + ih / 2, 0, ix + iw / 2, iy + ih / 2, Math.max(iw, ih) * 0.8);
    bg.addColorStop(0, 'rgba(7,12,22,0.93)');
    bg.addColorStop(1, 'rgba(2,5,11,0.99)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = bg;
    ctx.fillRect(ix, iy, iw, ih);

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

    const drawTab = (label, reg, active) => {
      if (active) {
        const g = ctx.createLinearGradient(reg.x * this.cellW, 0, (reg.x + reg.w) * this.cellW, 0);
        g.addColorStop(0, 'rgba(245,224,74,0.58)');
        g.addColorStop(0.72, 'rgba(245,224,74,0.96)');
        g.addColorStop(1, 'rgba(255,255,255,0.98)');
        ctx.fillStyle = g;
        ctx.fillRect(reg.x * this.cellW, (y0 + 1) * this.cellH, reg.w * this.cellW, this.cellH);
      }
      const tx = reg.x + Math.floor((reg.w - label.length) / 2);
      for (let i = 0; i < label.length; i += 1) blit(tx + i, y0 + 1, label[i], active ? DARK : bucketAt(tx + i, y0 + 1), 1);
    };

    drawTab('CONTACT', { x: x0 + 1, w: dividerX - x0 - 1 }, s.view === 'contact');
    drawTab('PROJECTS', { x: dividerX + 1, w: x0 + boxW - dividerX - 2 }, s.view === 'projects');

    for (const item of content) {
      const hovered = s.hover && item.kind && s.hover.kind === item.kind;
      if (item.type === 'button') {
        const w = item.w;
        const h = item.h;
        if (hovered) {
          const g = ctx.createLinearGradient(item.x * this.cellW, 0, (item.x + w) * this.cellW, 0);
          g.addColorStop(0, 'rgba(245,224,74,0.58)');
          g.addColorStop(0.72, 'rgba(245,224,74,0.96)');
          g.addColorStop(1, 'rgba(255,255,255,0.98)');
          ctx.fillStyle = g;
          ctx.fillRect((item.x + 1) * this.cellW, item.y * this.cellH, Math.max(0, w - 2) * this.cellW, (h + 1) * this.cellH);
        }
        for (let x = item.x; x < item.x + w; x += 1) {
          blit(x, item.y, x === item.x ? '┌' : x === item.x + w - 1 ? '┐' : '─', hovered ? DARK : bucketAt(x, item.y), 1);
          blit(x, item.y + h, x === item.x ? '└' : x === item.x + w - 1 ? '┘' : '─', hovered ? DARK : bucketAt(x, item.y + h), 1);
        }
        blit(item.x, item.y + 1, '│', hovered ? DARK : bucketAt(item.x, item.y + 1), 1);
        blit(item.x + w - 1, item.y + 1, '│', hovered ? DARK : bucketAt(item.x + w - 1, item.y + 1), 1);
        for (let i = 0; i < item.text.length && i < w - 4; i += 1) {
          blit(item.x + 2 + i, item.y + 1, item.text[i], hovered ? DARK : bucketAt(item.x + 2 + i, item.y + 1), 1);
        }
      } else if (item.type === 'center') {
        const start = item.cx - Math.ceil(item.text.length / 2);
        for (let i = 0; i < item.text.length; i += 1) {
          blit(start + i, item.y, item.text[i], hovered ? WHITE : bucketAt(start + i, item.y), 1);
        }
      } else if (item.type === 'prompt') {
        const prompt = `$ ${s.inputValue}`;
        for (let i = 0; i < prompt.length; i += 1) blit(item.x + i, item.y, prompt[i], bucketAt(item.x + i, item.y), 1);
        if ((s.inputFocused || Math.floor(t * 2) % 2 === 0) && prompt.length < boxW - 5) {
          blit(item.x + prompt.length + 1, item.y, s.inputFocused ? '█' : CURSOR_GLYPH, WHITE, s.inputFocused ? 1 : 0.62);
        }
      }
    }
  }

  pickLink(px, py) {
    if (!this.layout || this.state.appMode !== 'overlay') return null;
    const gx = px / this.cellW;
    const gy = py / this.cellH;
    // Pad hit areas by a bit less than half a cell so one-row links stay
    // tappable on touch screens without overlapping their neighbors.
    const pad = 0.4;
    return this.layout.links.find(
      (l) => gx >= l.x - pad && gx < l.x + l.w + pad && gy >= l.y - pad && gy < l.y + l.h + pad,
    ) || null;
  }

  handlePointerMove(event) {
    const rect = this.mount.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const ux = px / rect.width;
    const uy = py / rect.height;
    if (this.state.pactive) {
      this.state.pvel.x = ux - this.state.plast.x;
      this.state.pvel.y = uy - this.state.plast.y;
    }
    this.state.puv.x = ux;
    this.state.puv.y = uy;
    this.state.plast.x = ux;
    this.state.plast.y = uy;
    this.state.pactive = true;
    this.state.hover = this.pickLink(px, py);
    this.mount.style.cursor = this.state.hover
      ? this.state.hover.kind === 'input'
        ? 'text'
        : 'pointer'
      : 'default';
  }

  handlePointerLeave() {
    this.state.pactive = false;
    this.mount.style.cursor = 'default';
  }

  handlePointerDown(event) {
    const rect = this.mount.getBoundingClientRect();
    const link = this.pickLink(event.clientX - rect.left, event.clientY - rect.top);
    if (!link) {
      this.state.inputFocused = false;
      return;
    }
    if (link.kind === 'tab-contact') this.state.view = 'contact';
    else if (link.kind === 'tab-projects') this.state.view = 'projects';
    else if (link.kind === 'input') this.state.inputFocused = true;
    else if (link.kind === 'email' && this.data.email) this.copyEmail(this.data.email);
    else if (link.url) window.open(link.url, '_blank', 'noopener');
  }

  async copyEmail(email) {
    try {
      await navigator.clipboard.writeText(email);
      this.state.copiedSeconds = 1;
    } catch {
      window.open(`mailto:${email}`, '_blank', 'noopener');
    }
  }

  handleKey(event) {
    if (!this.state.inputFocused) return;
    if (event.key === 'Backspace') {
      this.state.inputValue = this.state.inputValue.slice(0, -1);
      event.preventDefault();
    } else if (event.key === 'Enter') {
      const value = this.state.inputValue.trim().toLowerCase();
      if (value === '/dice') this.enterDiceMode();
      if (value === '/overlay') this.exitDiceMode();
      this.state.inputValue = '';
      event.preventDefault();
    } else if (event.key.length === 1 && this.state.inputValue.length < MAX_INPUT) {
      this.state.inputValue += event.key;
      event.preventDefault();
    }
  }

  enterDiceMode() {
    this.state.appMode = 'dice';
    this.state.inputFocused = false;
    this.state.diceRoll = 1.4;
    this.dice.visible = true;
  }

  exitDiceMode() {
    this.state.appMode = 'overlay';
    this.dice.visible = false;
  }

  frame(now) {
    if (this.disposed) return;
    if (!this.start) {
      this.start = now;
      this.last = now;
    }
    const elapsed = (now - this.start) / 1000;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.state.copiedSeconds = Math.max(0, this.state.copiedSeconds - dt);

    this.stepFluid(Math.max(dt, 1 / 60), elapsed);
    this.drawGlyphFrame(elapsed);
    this.asciiMaterial.uniforms.uTime.value = elapsed;
    this.bloomPass.strength = this.state.bloomStrength;
    this.renderer.autoClear = true;
    this.composer.render();

    if (this.state.appMode === 'dice') {
      this.updateDice(dt, elapsed);
      this.renderer.autoClear = false;
      this.renderer.clearDepth();
      this.renderer.render(this.diceScene, this.diceCamera);
      this.renderer.autoClear = true;
    }

    this.raf = requestAnimationFrame((time) => this.frame(time));
  }

  updateDice(dt, elapsed) {
    this.state.diceT += dt;
    if (this.state.diceRoll > 0) {
      this.state.diceRoll = Math.max(0, this.state.diceRoll - dt);
      this.dice.rotation.x += dt * 7.8;
      this.dice.rotation.y += dt * 10.4;
      this.dice.rotation.z += dt * 5.2;
    } else {
      this.dice.rotation.x = lerp(this.dice.rotation.x, Math.sin(elapsed * 0.7) * 0.18 + 0.45, 0.06);
      this.dice.rotation.y = lerp(this.dice.rotation.y, Math.cos(elapsed * 0.6) * 0.18 + 0.72, 0.06);
      this.dice.rotation.z = lerp(this.dice.rotation.z, Math.sin(elapsed * 0.5) * 0.08, 0.06);
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKey);
    this.mount.removeEventListener('pointermove', this.onPointerMove);
    this.mount.removeEventListener('pointerleave', this.onPointerLeave);
    this.mount.removeEventListener('pointerdown', this.onPointerDown);
    this.composer?.dispose();
    this.renderer?.dispose();
    this.asciiTexture?.dispose();
    this.mount.innerHTML = '';
  }
}
