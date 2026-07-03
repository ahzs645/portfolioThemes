import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDate, formatDateRange, normalizeHighlights } from '../../utils/cvHelpers';

/* ──────────────────────────────────────────────────────────────
   Terishim — "in orbit"
   Faithful CV-driven port of www.terishim.com: an orbital-diagram
   hero (dashed elliptical orbits, traveling planets with comet
   trails, chromatic cursor glints) over a Bayer-dithered pixel
   overlay, a mouse-driven metallic shimmer title, a typewriter nav
   log, a rotating "about" fun-fact line, work/orgs/funsies tabs,
   draggable tinkering cards, and a business-card contact modal.
   ────────────────────────────────────────────────────────────── */

const INK = '#18181c';
const GRAY = '#5a5a62';
const FAINT = '#717175';
const MUTED = '#636369';
const BORDER = 'rgba(24,24,28,0.08)';
const HAIR = 'rgba(24,24,28,0.06)';

// fractal-noise the source paints across every glass panel
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

// orbit tilt: cos(0.22) / sin(0.22)
const COS = 0.9758974493306055;
const SIN = 0.21822962308086932;
const ORBITERS = [
  { r: 3.2, speed: 0.00068, phase: 0.9 },
  { r: 5.2, speed: 0.00042, phase: 2.5 },
  { r: 2.8, speed: 0.00085, phase: 5 },
  { r: 6.8, speed: 0.00026, phase: 1.8 },
];
const RADII = [110, 175, 250, 330];

/* ───── helpers ───── */

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '··';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function firstNameOf(name = '') {
  return name.trim().split(/\s+/)[0] || 'this designer';
}
function roleWord(title = '') {
  const t = String(title || '').toLowerCase().replace(/[(),]/g, '');
  if (!t) return 'maker';
  const stop = new Set(['intern', 'senior', 'junior', 'lead', 'staff', 'principal', 'of', 'and', 'the', '&', 'a']);
  const words = t.split(/\s+/).filter((w) => w && !stop.has(w));
  return words[words.length - 1] || 'maker';
}
function yearOf(v) {
  // Bare year, with '' for "present"/unparseable values.
  return formatDate(v, { month: 'none', presentLabel: '', fallback: '' });
}
function articleFor(word = '') {
  return /^[aeiou]/i.test(word.trim()) ? 'an' : 'a';
}

/* ───── english → hangul transliterator (phonetic, approximate) ───── */
const H_CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']; // eslint-disable-line no-unused-vars
const H_CHO_R = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const H_JUNG_R = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const H_JONG_R = ['', 'k', 'kk', '', 'n', '', '', 't', 'l', '', '', '', '', '', '', '', 'm', 'p', '', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 'h'];
const H_ONSET = { b: 7, c: 15, d: 3, f: 17, g: 0, h: 18, j: 12, k: 15, l: 5, m: 6, n: 2, p: 17, q: 15, r: 5, s: 9, t: 16, v: 7, z: 12 };
const H_ONSET2 = { ch: 14, sh: 9, th: 9, ph: 17, gh: 0, ck: 15, kh: 15, wh: 18, zh: 12 };
const H_FINAL = { n: 4, m: 16, l: 8, r: 8 };
const H_VOWELS = {
  yae: 3, yeo: 6, eau: 8, ee: 20, ea: 20, oo: 13, ou: 8, ow: 8, oa: 8, oe: 11, au: 8, aw: 8, ai: 1, ay: 5, ei: 5, ey: 5,
  ie: 20, ue: 13, ui: 16, eu: 18, ew: 17, oy: 8, ya: 2, ye: 7, yo: 12, yu: 17, yi: 20, wa: 9, wo: 14, wi: 16, we: 15, wu: 13,
  a: 0, e: 5, i: 20, o: 8, u: 13, y: 20, w: 13,
};
function hVowelIdx(g) {
  if (H_VOWELS[g] !== undefined) return H_VOWELS[g];
  if (g.length > 1 && g.endsWith('y') && H_VOWELS[g.slice(0, -1)] !== undefined) return H_VOWELS[g.slice(0, -1)];
  const base = g.replace(/[^aeiou]/g, '');
  for (let n = base.length; n >= 1; n -= 1) if (H_VOWELS[base.slice(0, n)] !== undefined) return H_VOWELS[base.slice(0, n)];
  return 18;
}
const hCompose = (c, j, k) => String.fromCharCode(0xac00 + (c * 21 + j) * 28 + k);
function krSize(hangul, scale = 1) {
  const n = (hangul || '').length || 1;
  const px = n <= 2 ? 64 : n === 3 ? 52 : n === 4 ? 44 : n === 5 ? 36 : 30;
  return Math.round(px * scale);
}
function hSplitCons(cluster) {
  const list = [];
  let i = 0;
  while (i < cluster.length) {
    const two = cluster.substr(i, 2);
    if (H_ONSET2[two] !== undefined) {
      list.push({ idx: H_ONSET2[two], ch: two });
      i += 2;
    } else if (H_ONSET[cluster[i]] !== undefined) {
      list.push({ idx: H_ONSET[cluster[i]], ch: cluster[i] });
      i += 1;
    } else i += 1;
  }
  return list;
}
function toHangul(token = '') {
  let s = token.toLowerCase().replace(/qu/g, 'kw').replace(/x/g, 'ks').replace(/[^a-z]/g, '');
  s = s.replace(/([bcdfghjkpqstvwz])\1+/g, '$1');
  if (!s) return { hangul: '', roman: '' };
  const parts = [];
  const re = /([yw]?[aeiou]+y?|y)/g;
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push({ t: 'c', v: s.slice(last, m.index) });
    parts.push({ t: 'v', v: m[0] });
    last = re.lastIndex;
  }
  if (last < s.length) parts.push({ t: 'c', v: s.slice(last) });
  const syl = [];
  const distribute = (cons) =>
    cons.forEach((c, idx) => {
      if (idx === 0 && syl.length && syl[syl.length - 1].k === 0 && H_FINAL[c.ch] !== undefined) {
        syl[syl.length - 1].k = H_FINAL[c.ch];
      } else {
        syl.push({ c: c.idx, j: 18, k: 0 });
      }
    });
  for (let p = 0; p < parts.length; p += 1) {
    if (parts[p].t !== 'v') continue;
    const prev = p > 0 && parts[p - 1].t === 'c' ? hSplitCons(parts[p - 1].v) : [];
    const onset = prev.length ? prev[prev.length - 1] : null;
    distribute(prev.slice(0, -1));
    syl.push({ c: onset ? onset.idx : 11, j: hVowelIdx(parts[p].v), k: 0 });
  }
  if (parts.length && parts[parts.length - 1].t === 'c') distribute(hSplitCons(parts[parts.length - 1].v));
  return {
    hangul: syl.map((x) => hCompose(x.c, x.j, x.k)).join(''),
    roman: syl.map((x) => `${H_CHO_R[x.c]}${H_JUNG_R[x.j]}${H_JONG_R[x.k]}`).join(' · '),
  };
}

function useTypewriter(text, speed = 28) {
  const [out, setOut] = useState('');
  useEffect(() => {
    let i = 0;
    setOut('');
    if (!text) return undefined;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

function ExternalLink({ href, children, className }) {
  if (!href) return <span className={className}>{children}</span>;
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/* ───── orbit canvas (the signature hero scene) ───── */

function OrbitCanvas({ centerRef }) {
  const canvasRef = useRef(null);
  const parallaxY = useRef(0.5); // mouseY / innerHeight
  const mx = useRef(0.5); // pointer x ratio over canvas
  const my = useRef(0.5); // pointer y ratio over canvas
  const smooth = useRef(0.5);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      parallaxY.current = e.clientY / window.innerHeight;
      const b = canvas.getBoundingClientRect();
      mx.current = (e.clientX - b.left) / canvas.width;
      my.current = (e.clientY - b.top) / canvas.height;
    };
    window.addEventListener('mousemove', onMove);

    const frame = (t) => {
      const W = canvas.width;
      const H = canvas.height;

      let cx;
      let cy;
      let hw;
      let hh;
      if (centerRef?.current) {
        const cb = centerRef.current.getBoundingClientRect();
        const rb = canvas.getBoundingClientRect();
        cx = cb.left + cb.width / 2 - rb.left;
        cy = cb.top + cb.height / 2 - rb.top;
        hw = cb.width / 2;
        hh = cb.height / 2;
      } else {
        cx = W / 2;
        cy = H / 2;
        hw = 120;
        hh = 30;
      }

      smooth.current += (parallaxY.current - smooth.current) * 0.06;
      ctx.clearRect(0, 0, W, H);
      const parallax = (0.5 - smooth.current) * 60;
      const pointerX = mx.current * W;
      const pointerY = my.current * H;

      RADII.forEach((extra, i) => {
        const rx = (hw + extra) * 0.58;
        const ry = hh + extra * 0.24;
        const oy = cy + Math.sin(t * 0.0004 + i * 0.6) * 6 - Math.max(0, parallax) * (1 - extra / 330);

        // dashed orbit
        ctx.save();
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.ellipse(cx, oy, rx, ry, -0.22, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(30,28,26,0.18)';
        ctx.lineWidth = 0.45;
        ctx.stroke();
        ctx.restore();

        const orb = ORBITERS[i];
        const ang = t * orb.speed + orb.phase;
        const px = cx + Math.cos(ang) * rx * COS + Math.sin(ang) * ry * SIN;
        const py = oy - Math.cos(ang) * rx * SIN + Math.sin(ang) * ry * COS;

        // comet trail
        ctx.beginPath();
        for (let k = 0; k < 28; k += 1) {
          const a2 = ang - k * 0.018;
          const tx = cx + Math.cos(a2) * rx * COS + Math.sin(a2) * ry * SIN;
          const ty = oy - Math.cos(a2) * rx * SIN + Math.sin(a2) * ry * COS;
          if (k === 0) ctx.moveTo(tx, ty);
          else ctx.lineTo(tx, ty);
        }
        ctx.strokeStyle = 'rgba(30,28,26,0.22)';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // planet
        const pr = orb.r * 0.7;
        const grad = ctx.createRadialGradient(px - pr * 0.28, py - pr * 0.28, pr * 0.05, px, py, pr);
        grad.addColorStop(0, 'rgb(168,168,168)');
        grad.addColorStop(0.65, 'rgb(150,150,150)');
        grad.addColorStop(1, 'rgb(132,132,132)');
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // chromatic cursor glint along the nearest orbit arc
        const ck = Math.atan2(pointerY - oy, pointerX - cx);
        const gx = cx + Math.cos(ck) * rx * COS + Math.sin(ck) * ry * SIN;
        const gy = oy - Math.cos(ck) * rx * SIN + Math.sin(ck) * ry * COS;
        const w = Math.max(0, 1 - Math.hypot(pointerX - gx, pointerY - gy) / (rx * 0.85)) * 0.18;
        if (w > 0.001) {
          [
            [-0.018, '180,120,120'],
            [0, '160,160,160'],
            [0.018, '120,130,180'],
          ].forEach(([dr, rgb]) => {
            ctx.save();
            ctx.beginPath();
            let first = true;
            for (let a3 = ck - 0.2; a3 <= ck + 0.2; a3 += 0.02) {
              const aa = a3 + dr;
              const ex = cx + Math.cos(aa) * rx * COS + Math.sin(aa) * ry * SIN;
              const ey = oy - Math.cos(aa) * rx * SIN + Math.sin(aa) * ry * COS;
              if (first) {
                ctx.moveTo(ex, ey);
                first = false;
              } else ctx.lineTo(ex, ey);
            }
            ctx.strokeStyle = `rgba(${rgb},${w})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
          });
        }
      });

      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [centerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ───── dithered pixel overlay ───── */

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function DitherCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const render = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (!W || !H) return;
      canvas.width = W;
      canvas.height = H;
      const img = ctx.createImageData(W, H);
      const data = img.data;
      for (let y = 0; y < H; y += 1) {
        for (let x = 0; x < W; x += 1) {
          const nx = x / W - 0.5;
          const ny = y / H - 0.5;
          const v = Math.min(
            1,
            Math.max(0, Math.sqrt(nx * nx + ny * ny) - 0.18) / 0.5 +
              Math.max(0, (-nx - 0.1) * 0.3 + (ny + 0.2) * 0.2) * 0.4
          );
          if (v > BAYER[y % 4][x % 4] / 16) {
            const idx = (y * W + x) * 4;
            data[idx] = 30;
            data[idx + 1] = 28;
            data[idx + 2] = 26;
            data[idx + 3] = Math.round(v * 16);
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    };
    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, []);
  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 4,
        imageRendering: 'pixelated',
        pointerEvents: 'none',
      }}
    />
  );
}

/* ───── small inline icons (from the source) ───── */

const Sparkle = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 8, marginBottom: 2 }}>
    <path d="M6.5 1.5l1.1 3.4h3.5l-2.8 2 1.1 3.4L6.5 8.5l-2.8 1.8 1.1-3.4-2.8-2h3.5z" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
  </svg>
);
const PlanetIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <circle cx="5.5" cy="5.5" r="3.4" fill="rgba(30,28,26,0.2)" />
    <ellipse cx="5.5" cy="5.5" rx="5" ry="1.6" stroke="rgba(30,28,26,0.28)" strokeWidth="0.65" fill="none" />
  </svg>
);
const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M5.5 1.2c1.9 0 3.3 1.4 3.3 3.2 0 2.2-3.3 5.4-3.3 5.4S2.2 6.6 2.2 4.4c0-1.8 1.4-3.2 3.3-3.2z" stroke="currentColor" strokeWidth="0.9" />
    <circle cx="5.5" cy="4.4" r="1.1" stroke="currentColor" strokeWidth="0.9" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <rect x="1.5" y="3.5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="0.9" />
    <path d="M4 3.5V2.5h3v1" stroke="currentColor" strokeWidth="0.9" />
  </svg>
);
const CapIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M5.5 2L10 4.2 5.5 6.4 1 4.2z" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
    <path d="M3 5.2v2.3c0 .6 1.1 1.3 2.5 1.3S8 8.1 8 7.5V5.2" stroke="currentColor" strokeWidth="0.9" />
  </svg>
);

const TAB_ICONS = {
  work: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="7" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M7 7V5.5A1.5 1.5 0 018.5 4h5A1.5 1.5 0 0115 5.5V7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M3 12h16" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  ),
  orgs: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="16.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1" />
      <circle cx="5.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  funsies: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3.5l1.8 5.4h5.7l-4.6 3.3 1.8 5.4L11 14.3l-4.7 3.3 1.8-5.4L3.5 8.9h5.7z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  ),
};

/* ───── views ───── */

function HomeView({ cv, work, titleRef, glowRef, shimmerRef, parallaxRef }) {
  const meta = useTypewriter(
    cv.about
      ? cv.about.split(/[.\n]/)[0].trim().toLowerCase()
      : `designing for emergence — where small things combine into something larger`,
    32
  );
  return (
    <>
      <Hero id="hero">
        <OrbitCanvas centerRef={titleRef} />
        <DitherCanvas />
        <div className="sh-body in">
          <div className="sh-float">
            <div ref={parallaxRef} style={{ position: 'relative' }}>
              <h1 className="sh-title" ref={titleRef}>
                {firstNameOf(cv.name)} is {articleFor(cv.currentJobTitle || roleWord(cv.currentJobTitle))}{' '}
                {cv.currentJobTitle || roleWord(cv.currentJobTitle)}
                <br />
                <em ref={shimmerRef}>in orbit</em>
              </h1>
              <div
                ref={glowRef}
                style={{ position: 'absolute', inset: '-32px -48px', pointerEvents: 'none', mixBlendMode: 'screen', borderRadius: 8 }}
              />
            </div>
          </div>
        </div>
        <p className="sh-meta in">
          {meta}
          <span className="sh-cursor">_</span>
        </p>
      </Hero>

      <Reel>
        {work.map((item, i) => (
          <WorkEntry key={i}>
            <div className="row">
              <div className="text">
                <p className="kicker">
                  {item.year} · {item.role}
                </p>
                <span className="title-wrap">
                  <h2>{item.title}</h2>
                  <span className="underline" />
                </span>
                <p className="summary">{item.summary}</p>
              </div>
              <div className="arrows">
                <span className="ghost">→</span>
                <span className="main">→</span>
              </div>
            </div>
          </WorkEntry>
        ))}
      </Reel>
    </>
  );
}

const FUN_FALLBACK = 'orbiting around interesting problems';

function EntryRows({ items }) {
  return (
    <div className="entries">
      {items.map((it, i) => (
        <div key={i} className="entry" style={{ transitionDelay: `${i * 40}ms` }}>
          <p className="when">{it.when}</p>
          <div className="meta">
            <div className="line">
              {it.href ? (
                <a className="name link" href={it.href} target="_blank" rel="noopener noreferrer">
                  {it.name}
                </a>
              ) : (
                <span className="name">{it.name}</span>
              )}
              {it.role && <span className="role">{it.role}</span>}
            </div>
            {it.desc && <p className="desc">{it.desc}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AboutView({ cv, facts, origins, tabs, sections }) {
  const [factIndex, setFactIndex] = useState(0);
  const [tab, setTab] = useState(tabs[0]?.id || 'work');
  useEffect(() => {
    if (facts.length < 2) return undefined;
    const id = setInterval(() => setFactIndex((v) => (v + 1) % facts.length), 2600);
    return () => clearInterval(id);
  }, [facts.length]);
  const active = tabs.find((t) => t.id === tab) || tabs[0];

  return (
    <ApRoot>
      <div className="ap-inner">
        <div className="ap-head">
          <h1>
            hello, my name is {firstNameOf(cv.name).toLowerCase()}
            <span style={{ color: INK }}>
              <Sparkle />
            </span>
          </h1>
          <div className="ap-fact">
            <span className="ic">
              <PlanetIcon />
            </span>
            <p>{facts[factIndex] || FUN_FALLBACK}</p>
          </div>
        </div>

        <div className="ap-two-col">
          <div className="ap-bio">
            {cv.lead && <p className="lead">{cv.lead}</p>}
            {cv.paragraphs.map((p, i) => (
              <p key={i} className="body">{p}</p>
            ))}
            <div className="origins">
              {origins.map((o, i) => (
                <div key={i} className="origin">
                  <span className="ic">{o.icon}</span>
                  <p>{o.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="ap-aside">
            <div className="badge">
              <span className="badge-noise" />
              <span className="kr-tag">KR</span>
              <span className="mono" style={{ fontSize: krSize(cv.kr.hangul, 1.15) }}>{cv.kr.hangul || initialsOf(cv.name)}</span>
              <span className="cap">{cv.kr.roman || cv.location || 'somewhere'}</span>
            </div>
          </div>
        </div>

        <hr className="ap-divider" />

        <div className="ap-exp">
          <p className="eyebrow">experience</p>
          <div className="tabs">
            {tabs.map((t) => {
              const Icon = TAB_ICONS[t.id] || TAB_ICONS.work;
              const on = t.id === tab;
              return (
                <button key={t.id} type="button" className={on ? 'on' : ''} onClick={() => setTab(t.id)} aria-label={t.id}>
                  <span className="ico">
                    <Icon />
                  </span>
                  <span className="dot" />
                </button>
              );
            })}
          </div>
          <p className="eyebrow group">{active?.id}</p>
          <EntryRows items={active?.items || []} />
        </div>

        {sections.map((sec) => (
          <div key={sec.title} className="ap-section">
            <hr className="ap-divider thin" />
            <p className="eyebrow">{sec.title}</p>
            <EntryRows items={sec.items} />
          </div>
        ))}
      </div>
    </ApRoot>
  );
}

function TkCard({ it, idx, dragging, onDown, onOpen, style }) {
  const [hover, setHover] = useState(false);
  const turbRef = useRef(null);
  const dispRef = useRef(null);
  const raf = useRef(0);
  const cur = useRef(0);
  const fid = `tk-wrinkle-${idx}`;

  useEffect(() => {
    const targetV = hover ? 1 : 0;
    const step = () => {
      const d = targetV - cur.current;
      if (Math.abs(d) < 0.005) cur.current = targetV;
      else cur.current += d * 0.55;
      const v = cur.current;
      if (turbRef.current) {
        turbRef.current.setAttribute('baseFrequency', `${(0.008 + v * 0.03).toFixed(4)} ${(0.006 + v * 0.024).toFixed(4)}`);
      }
      if (dispRef.current) dispRef.current.setAttribute('scale', (v * 7).toFixed(2));
      if (Math.abs(d) >= 0.005) raf.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [hover]);

  return (
    <div
      className={`tk-card${dragging ? ' dragging' : ''}${hover ? ' hover' : ''}`}
      style={style}
      onPointerDown={(e) => onDown(e, idx)}
      onClick={() => onOpen(it)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <filter id={fid} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={turbRef} type="turbulence" baseFrequency="0.008 0.006" numOctaves="4" seed="7" result="noise" />
            <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <span className="thumb">
        <span className="thumb-fx" style={{ filter: `url(#${fid})` }}>
          <span className="thumb-noise" />
          <span className="mono">{initialsOf(it.name || it.title)}</span>
        </span>
        <span className="yr">{yearOf(it.date || it.end_date || it.start_date) || 'PROJ'}</span>
      </span>
      <span className="label">{it.name || it.title}</span>
    </div>
  );
}

function TkModal({ item, onClose }) {
  const href = item.url || item.link || null;
  const tech = normalizeHighlights(item.highlights)
    .map((h) => {
      const m = String(h).match(/technolog(?:y|ies)\s*[-:–]\s*(.+)/i);
      return m ? m[1] : null;
    })
    .filter(Boolean)
    .flatMap((s) => s.split(/,\s*/))
    .map((s) => s.trim())
    .filter(Boolean);
  const otherHighlights = normalizeHighlights(item.highlights).filter((h) => !/technolog/i.test(h));

  return (
    <ModalOverlay onClick={onClose}>
      <TkModalCard role="dialog" aria-label={item.name || item.title} onClick={(e) => e.stopPropagation()}>
        <div className="head">
          <span className="dot" />
          <span className="head-label">{yearOf(item.date || item.end_date || item.start_date) || 'project'}</span>
          <button type="button" className="x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="cover">
          <span className="cover-noise" />
          <span className="cover-mono">{initialsOf(item.name || item.title)}</span>
        </div>
        <div className="body">
          <h3>{item.name || item.title}</h3>
          {(item.summary || item.description) && <p className="summary">{item.summary || item.description}</p>}
          {otherHighlights.length > 0 && (
            <ul className="highlights">
              {otherHighlights.slice(0, 4).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
          {tech.length > 0 && (
            <div className="tags">
              {tech.slice(0, 8).map((t, i) => (
                <span key={i} className="tag">{t}</span>
              ))}
            </div>
          )}
          {href && (
            <a className="visit" href={href} target="_blank" rel="noopener noreferrer">
              View project ↗
            </a>
          )}
        </div>
      </TkModalCard>
    </ModalOverlay>
  );
}

function TinkeringView({ projects }) {
  const items = useMemo(
    () =>
      projects.map((p, i) => {
        // deterministic scatter
        const col = i % 3;
        const rowi = Math.floor(i / 3);
        const jx = ((i * 53) % 11) - 5;
        const jy = ((i * 37) % 11) - 5;
        const rot = ((i * 29) % 13) - 6;
        return {
          ...p,
          left: 8 + col * 30 + jx,
          top: 6 + rowi * 30 + jy,
          rot,
        };
      }),
    [projects]
  );
  const [pos, setPos] = useState(() => items.map((it) => ({ x: it.left, y: it.top, rot: it.rot })));
  const [activeIdx, setActiveIdx] = useState(-1);
  const [modal, setModal] = useState(null);
  const containerRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    setPos(items.map((it) => ({ x: it.left, y: it.top, rot: it.rot })));
  }, [items]);

  const onDown = (e, idx) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    setActiveIdx(idx);
    drag.current = {
      idx,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
      offX: ((e.clientX - rect.left) / rect.width) * 100 - pos[idx].x,
      offY: ((e.clientY - rect.top) / rect.height) * 100 - pos[idx].y,
    };
  };
  const onMove = (e) => {
    if (!drag.current) return;
    if (Math.abs(e.clientX - drag.current.sx) > 4 || Math.abs(e.clientY - drag.current.sy) > 4) drag.current.moved = true;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100 - drag.current.offX;
    const y = ((e.clientY - rect.top) / rect.height) * 100 - drag.current.offY;
    setPos((prev) => prev.map((p, i) => (i === drag.current.idx ? { ...p, x: Math.max(0, Math.min(84, x)), y: Math.max(0, Math.min(88, y)) } : p)));
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <TkRoot>
      <div className="tk-head">
        <h1>the many things i do</h1>
        <p className="hint">drag to group · drag out to ungroup · click to open</p>
      </div>
      <div className="tk-canvas" ref={containerRef} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        {items.map((it, i) => {
          const p = pos[i] || { x: it.left, y: it.top, rot: it.rot };
          return (
            <TkCard
              key={i}
              it={it}
              idx={i}
              dragging={activeIdx === i && drag.current?.moved}
              onDown={onDown}
              onOpen={(item) => {
                if (!drag.current || !drag.current.moved) setModal(item);
              }}
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.rot}deg)`, zIndex: activeIdx === i ? 50 : 1 }}
            />
          );
        })}
      </div>
      {modal && <TkModal item={modal} onClose={() => setModal(null)} />}
    </TkRoot>
  );
}

function ContactPopover({ cv, socials, open, onClose }) {
  const linkedin = socials.find((s) => /linked/i.test(s.network || ''));
  const kr = toHangul(firstNameOf(cv.name));
  const roman = kr.roman ? kr.roman.charAt(0).toUpperCase() + kr.roman.slice(1) : '';
  return (
    <>
      {open && <ClickCatcher onClick={onClose} aria-hidden="true" />}
      <PopoverHost className={open ? 'open' : ''}>
      <Card3d role="dialog" aria-label="Contact card">
        <div className="head">
          <span className="dot" />
          <span className="head-label">{cv.name}</span>
          <button type="button" className="x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="face">
          <span className="kr-tag">KR</span>
          <span className="monogram" style={{ fontSize: krSize(kr.hangul) }}>{kr.hangul || initialsOf(cv.name)}</span>
          {roman && <span className="sub">{roman}</span>}
        </div>
        <dl>
          <div>
            <dt>Born name</dt>
            <dd>{cv.name}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{cv.currentJobTitle || 'Designer'}</dd>
          </div>
          {cv.email && (
            <div>
              <dt>Email</dt>
              <dd><a href={`mailto:${cv.email}`}>{cv.email}</a></dd>
            </div>
          )}
          {linkedin && (
            <div>
              <dt>Li</dt>
              <dd><ExternalLink href={linkedin.url}>{(linkedin.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '')}</ExternalLink></dd>
            </div>
          )}
          {cv.website && (
            <div>
              <dt>CV</dt>
              <dd><ExternalLink href={cv.website}>résumé ↗</ExternalLink></dd>
            </div>
          )}
        </dl>
        {cv.location && <div className="based">Based in {cv.location}</div>}
      </Card3d>
      </PopoverHost>
    </>
  );
}

/* ───── theme root ───── */

export function TerishimTheme() {
  const cv = useCV();
  const [view, setView] = useState('home');
  const [contactOpen, setContactOpen] = useState(false);

  // hero parallax + shimmer refs
  const titleRef = useRef(null);
  const glowRef = useRef(null);
  const shimmerRef = useRef(null);
  const parallaxRef = useRef(null);
  const target = useRef({ x: 0.5, y: 0.5 });
  const smooth = useRef({ x: 0.5, y: 0.5 });

  const data = useMemo(() => {
    const safe = cv || {};
    const experience = (safe.experience || []).filter(Boolean);
    const volunteer = (safe.volunteer || []).filter(Boolean);
    const projects = (safe.projects || []).filter(Boolean);
    const education = (safe.education || []).filter(Boolean);
    const socials = (safe.socialRaw || []).filter((s) => s && s.url);

    const work = experience.slice(0, 4).map((j) => ({
      year: yearOf(j.endDate) || yearOf(j.startDate),
      role: j.title || 'Role',
      title: j.company,
      summary: j.highlights?.[0] || '',
    }));

    const aboutText = (safe.about || '').trim();
    const paragraphs = aboutText ? aboutText.split(/\n{2,}|\n/).map((s) => s.trim()).filter(Boolean) : [];

    // rotating fun-facts derived from CV (form mirrors the source)
    const facts = [
      experience[0] && `building things at ${experience[0].company.toLowerCase()}`,
      safe.location && `transmitting from ${safe.location.toLowerCase()}`,
      education[0] && `studying ${(education[0].area || education[0].degree || '').toLowerCase()}`,
      Array.isArray(safe.skills) && safe.skills[0] && `tinkering with ${String(typeof safe.skills[0] === 'string' ? safe.skills[0] : safe.skills[0].name || '').toLowerCase()}`,
    ].filter(Boolean);

    const origins = [
      safe.location && { icon: <PinIcon />, text: `Based in ${safe.location}` },
      safe.currentJobTitle && { icon: <BriefcaseIcon />, text: `Currently ${safe.currentJobTitle}` },
      education[0] && { icon: <CapIcon />, text: `${education[0].degree || education[0].area} — ${education[0].institution || education[0].school || ''}` },
    ].filter(Boolean);

    const expItems = experience.map((j) => ({
      when: formatDateRange(j.startDate, j.endDate),
      name: j.company,
      role: j.title,
      desc: j.highlights?.[0] || '',
    }));
    const orgItems = volunteer.map((j) => ({
      when: formatDateRange(j.startDate, j.endDate),
      name: j.company,
      role: j.title,
      desc: j.highlights?.[0] || '',
    }));
    const funItems = projects.map((p) => ({
      when: yearOf(p.date || p.end_date || p.start_date),
      name: p.name || p.title,
      role: '',
      desc: p.summary || p.description || normalizeHighlights(p.highlights)[0] || '',
    }));

    const tabs = [
      expItems.length && { id: 'work', items: expItems },
      orgItems.length && { id: 'orgs', items: orgItems },
      funItems.length && { id: 'funsies', items: funItems },
    ].filter(Boolean);

    // every remaining CV.yaml section, templated in the same entry style
    const awards = (safe.awards || []).filter(Boolean);
    const publications = (safe.publications || []).filter(Boolean);
    const presentations = (safe.presentations || []).filter(Boolean);
    const profDev = (safe.professionalDevelopment || []).filter(Boolean);
    const certSkills = (safe.certificationsSkills || []).filter(Boolean);

    const sections = [
      education.length && {
        title: 'education',
        items: education.map((e) => ({
          when: formatDateRange(e.start_date, e.end_date),
          name: e.institution || e.school || e.name,
          role: [e.degree, e.area].filter(Boolean).join(', '),
          desc: normalizeHighlights(e.highlights)[0] || e.location || '',
        })),
      },
      awards.length && {
        title: 'awards',
        items: awards.map((a) => ({
          when: yearOf(a.date),
          name: a.name || a.title,
          role: a.summary || '',
          desc: normalizeHighlights(a.highlights)[0] || '',
        })),
      },
      publications.length && {
        title: 'publications',
        items: publications.map((p) => {
          const authors = Array.isArray(p.authors) ? p.authors : p.authors ? [p.authors] : [];
          const auth = authors.length > 3 ? `${authors.slice(0, 3).join(', ')}, et al.` : authors.join(', ');
          return {
            when: yearOf(p.date),
            name: p.title || p.name,
            role: auth,
            desc: [p.journal, p.doi].filter(Boolean).join(' · '),
            href: p.doi ? `https://doi.org/${p.doi}` : p.url || null,
          };
        }),
      },
      presentations.length && {
        title: 'presentations',
        items: presentations.map((p) => ({
          when: yearOf(p.date),
          name: p.name || p.title,
          role: p.summary || '',
          desc: p.location || '',
        })),
      },
      profDev.length && {
        title: 'professional development',
        items: profDev.map((p) => ({
          when: yearOf(p.date),
          name: p.name || p.title,
          role: p.summary || '',
          desc: p.location || '',
        })),
      },
      certSkills.length && {
        title: 'certifications & skills',
        items: certSkills.map((c) => ({
          when: c.label || '',
          name: '',
          role: '',
          desc: c.details || '',
        })),
      },
    ].filter(Boolean);

    return {
      cv: {
        name: safe.name || 'Your Name',
        email: safe.email,
        website: safe.website,
        location: safe.location,
        about: aboutText,
        currentJobTitle: safe.currentJobTitle,
        kr: toHangul(firstNameOf(safe.name || 'Your Name')),
        lead: paragraphs[0] || (safe.currentJobTitle ? `${safe.currentJobTitle.toLowerCase()}, building things that matter.` : ''),
        paragraphs: paragraphs.slice(1),
      },
      work,
      facts,
      origins,
      tabs,
      sections,
      projects: projects.slice(0, 12),
      socials,
    };
  }, [cv]);

  // hero parallax / shimmer rAF
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      smooth.current.x += (target.current.x - smooth.current.x) * 0.07;
      smooth.current.y += (target.current.y - smooth.current.y) * 0.07;
      const dx = (smooth.current.x - 0.5) * 16;
      const dy = (smooth.current.y - 0.5) * 10;
      if (parallaxRef.current) parallaxRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      if (glowRef.current) {
        const gx = smooth.current.x * 100;
        const gy = smooth.current.y * 100;
        glowRef.current.style.background = `radial-gradient(ellipse 60% 55% at ${gx}% ${gy}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`;
      }
      if (shimmerRef.current) {
        const s = smooth.current.x * 140 - 20;
        shimmerRef.current.style.background = `linear-gradient(105deg, rgba(24,24,28,0.28) ${s - 40}%, rgba(190,188,200,0.85) ${s - 8}%, rgba(255,255,255,1.0) ${s + 2}%, rgba(210,208,220,0.75) ${s + 14}%, rgba(160,158,172,0.5) ${s + 26}%, rgba(24,24,28,0.28) ${s + 55}%)`;
        shimmerRef.current.style.webkitBackgroundClip = 'text';
        shimmerRef.current.style.backgroundClip = 'text';
        shimmerRef.current.style.webkitTextFillColor = 'transparent';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [view]);

  const onHeroMove = useCallback((e) => {
    const b = e.currentTarget.getBoundingClientRect();
    target.current = { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height };
  }, []);
  const onHeroLeave = useCallback(() => {
    target.current = { x: 0.5, y: 0.5 };
  }, []);

  const log = useTypewriter(
    view === 'home'
      ? `you're at the start of your journey, dear astronaut`
      : view === 'about'
      ? `about — ${firstNameOf(data.cv.name).toLowerCase()}, in their own words`
      : `tinkering — the many things i do`,
    26
  );

  return (
    <>
      <GlobalStyle />
      <Frame onMouseMove={view === 'home' ? onHeroMove : undefined} onMouseLeave={view === 'home' ? onHeroLeave : undefined}>
        <TopBar>
          <div className="log">
            {log}
            <span className="sh-cursor">_</span>
          </div>
          <div className="links">
            <button type="button" className={`navbtn${view === 'home' ? ' on' : ''}`} onClick={() => setView('home')}>
              <span>Index</span>
            </button>
            <button type="button" className={`navbtn${view === 'about' ? ' on' : ''}`} onClick={() => setView('about')}>
              <span>About</span>
            </button>
            <button type="button" className={`navbtn${view === 'work' ? ' on' : ''}`} onClick={() => setView('work')}>
              <span>Tinkering</span>
            </button>
          </div>
          <div className="contact">
            <button
              type="button"
              className={`navbtn${contactOpen ? ' on' : ''}`}
              onClick={() => setContactOpen((v) => !v)}
              aria-expanded={contactOpen}
            >
              <PlanetIcon />
              <span>Contact</span>
            </button>
            <ContactPopover cv={data.cv} socials={data.socials} open={contactOpen} onClose={() => setContactOpen(false)} />
          </div>
        </TopBar>

        <Scroll>
          {view === 'home' && (
            <HomeView
              cv={data.cv}
              work={data.work}
              titleRef={titleRef}
              glowRef={glowRef}
              shimmerRef={shimmerRef}
              parallaxRef={parallaxRef}
            />
          )}
          {view === 'about' && <AboutView cv={data.cv} facts={data.facts} origins={data.origins} tabs={data.tabs} sections={data.sections} />}
          {view === 'work' && <TinkeringView projects={data.projects} />}
        </Scroll>
      </Frame>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   styles
   ────────────────────────────────────────────────────────────── */

const floatHero = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}`;
const blink = keyframes`0%,100%{opacity:1}50%{opacity:0}`;
const fadeUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

const GlobalStyle = createGlobalStyle`
  body { background: #e8e8ec; }
`;

const Frame = styled.div`
  position: fixed;
  inset: var(--app-top-offset, 0px) 0 0 0;
  overflow: hidden;
  background: radial-gradient(120% 90% at 50% -10%, #f3f3f6 0%, #e8e8ec 48%, #dedee4 100%);
  color: ${INK};
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;

  *, *::before, *::after { box-sizing: border-box; }
  ::selection { background: ${INK}; color: #f2f2f5; }

  .sh-cursor { display: inline-block; animation: ${blink} 1s step-end infinite; margin-left: 1px; }
`;

const TopBar = styled.header`
  position: absolute;
  top: 16px;
  left: 24px;
  right: 24px;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;

  .log {
    position: absolute;
    left: 0;
    max-width: 320px;
    white-space: pre-line;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 300;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${MUTED};
    line-height: 1.5;
    @media (max-width: 720px) { display: none; }
  }
  .links { display: flex; gap: 8px; }
  .contact { position: absolute; right: 0; }

  .navbtn {
    background: transparent;
    border: 1px solid ${BORDER};
    cursor: pointer;
    padding: 5px 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: border-color 0.18s, background 0.18s;
    text-decoration: none;
    color: ${GRAY};
  }
  .navbtn:hover { border-color: rgba(30,28,26,0.38); }
  .navbtn.on { background: rgba(30,28,26,0.05); border-color: rgba(30,28,26,0.38); }
  .navbtn span {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${GRAY};
  }
`;

const Scroll = styled.div`
  position: absolute;
  inset: 0;
  overflow-y: auto;
  z-index: 10;
`;

/* ── hero ── */

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: calc(100dvh - var(--app-top-offset, 0px));
  min-height: 600px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .sh-body {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 32px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 1.1s cubic-bezier(.16,1,.3,1), transform 1.1s cubic-bezier(.16,1,.3,1);
  }
  .sh-body.in { opacity: 1; transform: translateY(0); }
  .sh-float { animation: ${floatHero} 12s ease-in-out infinite; }

  .sh-title {
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    font-size: clamp(22px, 3.4vw, 48px);
    line-height: 1.12;
    letter-spacing: -0.02em;
    color: ${INK};
    margin: 0;
    position: relative;
  }
  .sh-title em { font-style: italic; font-weight: 200; }

  .sh-meta {
    position: absolute;
    bottom: 52px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    text-align: center;
    white-space: pre-line;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    font-style: italic;
    font-size: clamp(11px, 1.1vw, 15px);
    letter-spacing: 0.01em;
    color: ${GRAY};
    line-height: 1.6;
    opacity: 0;
    transition: opacity 1.4s cubic-bezier(.16,1,.3,1) 0.3s;
    max-width: 80vw;
  }
  .sh-meta.in { opacity: 1; }
`;

/* ── home work reel ── */

const Reel = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 120px;
`;

const WorkEntry = styled.div`
  margin-bottom: 40px;

  .row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    border-top: 1px solid ${HAIR};
    padding-top: 16px;
    margin-top: 8px;
    cursor: pointer;
  }
  .text { flex: 1; }
  .kicker {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${FAINT};
    margin: 0 0 8px;
    opacity: 0.7;
    transition: opacity 0.35s, transform 0.35s cubic-bezier(.16,1,.3,1);
  }
  .title-wrap { position: relative; display: inline-block; margin-bottom: 8px; }
  h2 {
    font-family: 'DM Sans', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: ${INK};
    letter-spacing: -0.02em;
    line-height: 1.3;
    margin: 0;
  }
  .underline { position: absolute; bottom: -1px; left: 0; height: 1px; width: 0%; background: rgba(24,24,28,0.2); transition: width 0.4s cubic-bezier(.16,1,.3,1); }
  .summary {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-style: italic;
    color: ${GRAY};
    line-height: 1.65;
    margin: 0;
    opacity: 0.75;
  }
  .arrows { flex-shrink: 0; margin-top: 6px; position: relative; width: 24px; height: 20px; }
  .arrows span { position: absolute; left: 0; top: 0; font-size: 18px; color: ${INK}; }
  .arrows .ghost { opacity: 0; transition: transform 0.35s cubic-bezier(.16,1,.3,1), opacity 0.35s; }
  .arrows .main { transition: transform 0.28s cubic-bezier(.16,1,.3,1); }

  &:hover .kicker { opacity: 1; transform: translateY(-2px); }
  &:hover .underline { width: 100%; }
  &:hover .arrows .ghost { opacity: 0.15; transform: translateX(14px); }
  &:hover .arrows .main { transform: translateX(8px); }
`;

/* ── about ── */

const ApRoot = styled.div`
  min-height: calc(100dvh - var(--app-top-offset, 0px));

  .ap-inner { max-width: 860px; margin: 0 auto; padding: 110px 32px 120px; }

  .ap-head { margin-bottom: 64px; animation: ${fadeUp} 0.6s cubic-bezier(.16,1,.3,1) both; }
  .ap-head h1 {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(32px, 4.5vw, 60px);
    font-weight: 300;
    color: ${INK};
    letter-spacing: -0.025em;
    line-height: 1.1;
    margin: 0 0 16px;
  }
  .ap-fact { display: flex; align-items: center; gap: 8px; min-height: 20px; }
  .ap-fact .ic { color: ${FAINT}; display: flex; flex-shrink: 0; }
  .ap-fact p {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${FAINT};
    margin: 0;
  }

  .ap-two-col { display: grid; grid-template-columns: 1.5fr 1fr; gap: 48px; }
  @media (max-width: 680px) { .ap-two-col { grid-template-columns: 1fr; gap: 28px; } }

  .ap-bio .lead {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(13px, 1.4vw, 17px);
    font-weight: 300;
    font-style: italic;
    color: ${GRAY};
    letter-spacing: -0.005em;
    margin: 0 0 20px;
  }
  .ap-bio .body {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: ${GRAY};
    line-height: 1.8;
    margin: 0 0 18px;
  }
  .origins { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
  .origin { display: flex; align-items: flex-start; gap: 8px; }
  .origin .ic { color: ${FAINT}; flex-shrink: 0; margin-top: 4px; }
  .origin p { font-family: 'DM Sans', sans-serif; font-size: 15px; color: ${GRAY}; line-height: 1.8; margin: 0; }

  .ap-aside { display: flex; justify-content: center; }
  .badge {
    position: relative;
    width: 100%;
    max-width: 240px;
    aspect-ratio: 3 / 4;
    border-radius: 4px;
    border: 1px solid ${HAIR};
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: linear-gradient(150deg, #d8dae2 0%, #c7cad3 100%);
  }
  .badge-noise { position: absolute; inset: 0; background-image: ${NOISE}; background-size: 200px; background-blend-mode: soft-light; opacity: 0.5; }
  .badge .kr-tag { position: absolute; top: 10px; right: 12px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.12em; color: rgba(30,28,26,0.42); border: 1px solid rgba(30,28,26,0.22); padding: 1px 5px; border-radius: 2px; }
  .badge .mono { position: relative; font-family: 'Noto Serif KR', 'DM Sans', serif; font-weight: 200; color: rgba(30,28,26,0.6); line-height: 1; text-align: center; white-space: nowrap; }
  .badge .cap { position: relative; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(30,28,26,0.4); }

  .ap-divider { border: 0; border-top: 1px solid ${HAIR}; margin: 80px 0; }
  .ap-divider.thin { margin: 56px 0; }
  .ap-section .eyebrow { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${FAINT}; margin: 0 0 28px; }

  .ap-exp .eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${FAINT};
    margin: 0 0 28px;
  }
  .ap-exp .eyebrow.group { margin: 0 0 24px; animation: ${fadeUp} 0.25s ease both; }

  .tabs { display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; }
  .tabs button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: ${FAINT};
    transition: transform 0.24s cubic-bezier(.16,1,.3,1), color 0.18s, filter 0.24s;
  }
  .tabs button .ico { display: flex; }
  .tabs button .dot { width: 28px; height: 5px; border-radius: 50%; background: rgba(30,28,26,0.18); filter: blur(4px); opacity: 0; transform: scaleX(0.3); transition: opacity 0.24s, transform 0.24s; margin-top: -2px; }
  .tabs button.on { color: ${INK}; transform: translateY(-8px) rotate(12deg); filter: drop-shadow(0 6px 8px rgba(30,28,26,0.12)); }
  .tabs button.on .dot { opacity: 1; transform: scaleX(1); }

  .entries { display: flex; flex-direction: column; gap: 24px; }
  .entry { display: grid; grid-template-columns: 110px 1fr; gap: 0 32px; padding-bottom: 24px; border-bottom: 1px solid ${HAIR}; animation: ${fadeUp} 0.45s cubic-bezier(.16,1,.3,1) both; }
  @media (max-width: 520px) { .entry { grid-template-columns: 1fr; gap: 4px; } }
  .entry .when { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.14em; color: ${FAINT}; padding-top: 2px; line-height: 1.6; margin: 0; }
  .entry .meta { display: flex; flex-direction: column; gap: 4px; }
  .entry .line { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  .entry .name { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: ${INK}; }
  .entry .name.link { text-decoration: none; border-bottom: 1px solid ${BORDER}; }
  .entry .name.link:hover { border-color: rgba(24,24,28,0.4); }
  .entry .role { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${FAINT}; }
  .entry .desc { font-family: 'DM Sans', sans-serif; font-size: 12px; font-style: italic; color: ${GRAY}; line-height: 1.7; margin: 0; }
`;

/* ── tinkering ── */

const TkRoot = styled.div`
  min-height: calc(100dvh - var(--app-top-offset, 0px));
  display: flex;
  flex-direction: column;

  .tk-head { text-align: center; padding: 110px 24px 8px; }
  .tk-head h1 { font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: clamp(26px, 3.4vw, 44px); letter-spacing: -0.02em; color: ${INK}; margin: 0 0 12px; }
  .tk-head .hint { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${FAINT}; margin: 0; }

  .tk-canvas { position: relative; flex: 1; margin: 24px; touch-action: none; }

  .tk-card {
    position: absolute;
    width: 150px;
    cursor: grab;
    user-select: none;
    transition: transform 0.24s cubic-bezier(.16,1,.3,1);
  }
  .tk-card.dragging { cursor: grabbing; }
  .tk-card .thumb {
    position: relative;
    display: grid;
    place-items: center;
    aspect-ratio: 4 / 3;
    border: 1px solid ${BORDER};
    border-radius: 4px;
    overflow: hidden;
    background: linear-gradient(150deg, #d6d8e0 0%, #c6c9d2 100%);
    box-shadow: 0 8px 18px rgba(60,64,80,0.12);
    transition: box-shadow 0.18s, border-color 0.18s;
  }
  .tk-card.hover .thumb { box-shadow: 0 18px 30px rgba(60,64,80,0.2); border-color: rgba(24,24,28,0.2); }
  .tk-card .thumb-fx { position: absolute; inset: 0; display: grid; place-items: center; }
  .tk-card .thumb-noise { position: absolute; inset: -10%; background-image: ${NOISE}; background-size: 180px; background-blend-mode: soft-light; opacity: 0.55; }
  .tk-card .mono { position: relative; font-family: 'Noto Serif KR', 'DM Sans', serif; font-weight: 200; font-size: 38px; color: rgba(30,28,26,0.45); }
  .tk-card .yr { position: absolute; top: 6px; right: 7px; z-index: 2; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(30,28,26,0.32); border: 1px solid rgba(30,28,26,0.2); padding: 1px 4px; border-radius: 2px; }
  .tk-card .label { display: block; margin-top: 8px; text-align: center; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${FAINT}; transition: color 0.18s; }
  .tk-card.hover .label { color: ${INK}; }
`;

/* ── tinkering item modal ── */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(232,232,236,0.55);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  animation: ${fadeUp} 0.2s ease both;
`;

const TkModalCard = styled.div`
  width: 420px;
  max-width: 100%;
  max-height: calc(100dvh - 80px);
  overflow-y: auto;
  background: #e6e6ea;
  border: 1px solid ${BORDER};
  box-shadow: 0 30px 60px rgba(40,40,55,0.26);

  .head { display: flex; align-items: center; gap: 8px; padding: 11px 16px; border-bottom: 1px solid ${HAIR}; font-family: 'DM Mono', monospace; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(24,24,28,0.2); }
  .head-label { flex: 1; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: ${GRAY}; }
  .x { background: none; border: none; cursor: pointer; color: ${FAINT}; font-size: 12px; line-height: 1; padding: 2px; }

  .cover {
    position: relative;
    aspect-ratio: 16 / 9;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-bottom: 1px solid ${HAIR};
    background: linear-gradient(150deg, #d6d8e0 0%, #c6c9d2 100%);
  }
  .cover-noise { position: absolute; inset: 0; background-image: ${NOISE}; background-size: 220px; background-blend-mode: soft-light; opacity: 0.5; }
  .cover-mono { position: relative; font-family: 'Noto Serif KR', 'DM Sans', serif; font-weight: 200; font-size: 72px; color: rgba(30,28,26,0.5); }

  .body { padding: 22px 22px 24px; }
  .body h3 { font-family: 'DM Sans', sans-serif; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; color: ${INK}; margin: 0 0 10px; }
  .body .summary { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.7; color: ${GRAY}; margin: 0 0 16px; }
  .highlights { margin: 0 0 16px; padding: 0; list-style: none; }
  .highlights li { position: relative; padding-left: 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.6; color: ${GRAY}; margin-bottom: 7px; }
  .highlights li::before { content: '·'; position: absolute; left: 4px; color: ${FAINT}; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
  .tag { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: ${GRAY}; border: 1px solid ${BORDER}; padding: 3px 7px; border-radius: 2px; }
  .visit { display: inline-block; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: ${INK}; text-decoration: none; border: 1px solid rgba(24,24,28,0.22); padding: 8px 14px; transition: background 0.18s, border-color 0.18s; }
  .visit:hover { background: rgba(30,28,26,0.05); border-color: rgba(30,28,26,0.4); }
`;

/* ── contact modal / card ── */

const ClickCatcher = styled.div`
  position: fixed;
  inset: 0;
  z-index: 119;
`;

const PopoverHost = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 121;
  width: 288px;
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
  transform-origin: top right;
  pointer-events: none;
  transition: opacity 0.26s cubic-bezier(.16,1,.3,1), transform 0.26s cubic-bezier(.16,1,.3,1);

  &.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
`;

const Card3d = styled.div`
  width: 100%;
  background: #e2e2e6;
  border: 1px solid ${BORDER};
  box-shadow: 0 26px 50px rgba(40,40,55,0.22);
  overflow: hidden;
  font-family: 'DM Mono', monospace;

  .head { display: flex; align-items: center; gap: 8px; padding: 10px 14px 9px; border-bottom: 1px solid ${HAIR}; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(24,24,28,0.2); }
  .head-label { flex: 1; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${GRAY}; }
  .x { background: none; border: none; cursor: pointer; color: ${FAINT}; font-size: 11px; line-height: 1; padding: 2px; }

  .face {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 26px 14px 18px;
    border-bottom: 1px dashed ${HAIR};
    background-image: ${NOISE};
    background-size: 180px;
    background-blend-mode: soft-light;
  }
  .monogram { font-family: 'Noto Serif KR', 'DM Sans', serif; font-weight: 200; font-size: 68px; line-height: 1; color: rgba(30,28,26,0.65); letter-spacing: -0.01em; white-space: nowrap; }
  .face .sub { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(30,28,26,0.4); }
  .face .kr-tag { position: absolute; top: 9px; right: 11px; font-size: 9px; letter-spacing: 0.12em; color: rgba(30,28,26,0.4); border: 1px solid rgba(30,28,26,0.22); padding: 1px 5px; border-radius: 2px; }

  dl { margin: 0; padding: 4px 0; }
  dl > div { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 7px 14px; }
  dt { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${FAINT}; min-width: 40px; }
  dd { margin: 0; font-size: 11px; letter-spacing: 0.04em; color: ${GRAY}; text-align: right; }
  dd a { color: ${GRAY}; text-decoration: none; border-bottom: 1px solid ${HAIR}; }
  dd a:hover { color: ${INK}; border-color: rgba(24,24,28,0.3); }

  .based { border-top: 1px solid ${HAIR}; padding: 8px 14px; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${FAINT}; }
`;
