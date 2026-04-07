import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { isPresent, isArchived } from '../../utils/cvHelpers';

/* ─── Font ─────────────────────────────────────────── */
const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap');
`;

/* ─── 7 Color Themes (from p.cv) ───────────────────── */
const THEMES = [
  { bg: '#FFFFFF', fg: '#33333A' },
  { bg: '#CCCCCF', fg: '#36363E' },
  { bg: '#95ABC0', fg: '#2B303B' },
  { bg: '#44444A', fg: '#B4B4B7' },
  { bg: '#0044FF', fg: '#FFFFFF' },
  { bg: '#11111A', fg: '#DDDDDD' },
  { bg: '#11111A', fg: '#6ACAC9' },
];

/* ─── Flame helpers ────────────────────────────────── */
const FLAME = '...::/\\/\\/\\+=*abcdef01XYZ#';
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const mapRange = (v, a, b, c, d) => (v - a) * (d - c) / (b - a) + c;
const mix = (a, b, t) => a * (1 - t) + b * t;
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const rndi = (a, b = 0) => {
  if (a > b) [a, b] = [b, a];
  return Math.floor(a + Math.random() * (b - a + 1));
};

function createValueNoise() {
  const N = 256;
  const r = Array.from({ length: N }, () => Math.random());
  const perm = Array.from({ length: N }, (_, i) => i);
  for (let k = 0; k < N; k++) {
    const i = Math.floor(Math.random() * N);
    [perm[k], perm[i]] = [perm[i], perm[k]];
  }
  const p = [...perm, ...perm];
  return (px, py) => {
    const xi = Math.floor(px), yi = Math.floor(py);
    const tx = px - xi, ty = py - yi;
    const rx0 = xi % N, rx1 = (rx0 + 1) % N;
    const ry0 = yi % N, ry1 = (ry0 + 1) % N;
    const c00 = r[p[p[rx0] + ry0]], c10 = r[p[p[rx1] + ry0]];
    const c01 = r[p[p[rx0] + ry1]], c11 = r[p[p[rx1] + ry1]];
    const sx = smoothstep(0, 1, tx), sy = smoothstep(0, 1, ty);
    return mix(mix(c00, c10, sx), mix(c01, c11, sx), sy);
  };
}

/* ─── ASCII Flame sub-component ────────────────────── */
function AsciiFlame({ fg }) {
  const wrapRef = useRef(null);
  const preRef = useRef(null);
  const st = useRef({ data: [], cols: 0, rows: 0, pressed: false, time: 0 });
  const noise = useMemo(() => createValueNoise(), []);
  const [hint, setHint] = useState('');

  useEffect(() => {
    const wrap = wrapRef.current;
    const pre = preRef.current;
    if (!wrap || !pre) return;

    const cw = 9.6, ch = 24; // monospace cell at 16px

    const recalc = () => {
      const s = st.current;
      const nc = Math.floor(wrap.offsetWidth / cw);
      const nr = Math.floor(wrap.offsetHeight / ch);
      if (nc !== s.cols || nr !== s.rows) {
        s.cols = nc;
        s.rows = nr;
        s.data = new Array(nc * nr).fill(0);
      }
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(wrap);

    let last = 0;
    const interval = 1000 / 32;
    let raf;

    const tick = (ts) => {
      if (ts - last >= interval) {
        last = ts;
        const s = st.current;
        s.time++;
        const { data, cols, rows, pressed } = s;
        if (cols > 0 && rows > 0) {
          if (pressed) {
            const t = s.time * 0.05;
            const bottom = cols * (rows - 1);
            for (let i = 0; i < cols; i++) {
              const val = Math.floor(mapRange(noise(i * 0.05, t), 0, 1, 5, 40));
              data[bottom + i] = Math.min(val, data[bottom + i] + 2);
            }
          }
          for (let i = 0; i < data.length; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const dest = row * cols + clamp(col + rndi(-1, 1), 0, cols - 1);
            const src = Math.min(rows - 1, row + 1) * cols + col;
            data[dest] = Math.max(0, data[src] - rndi(0, 2));
          }
          let out = '';
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const u = data[r * cols + c];
              out += u === 0 ? ' ' : FLAME[clamp(u, 0, FLAME.length - 1)];
            }
            if (r < rows - 1) out += '\n';
          }
          pre.textContent = out;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [noise]);

  const down = useCallback(() => { setHint('[*]'); st.current.pressed = true; }, []);
  const up = useCallback(() => { setHint('[ ]'); st.current.pressed = false; }, []);
  const enter = useCallback(() => setHint('[ ]'), []);
  const leave = useCallback(() => { setHint(''); st.current.pressed = false; }, []);

  return (
    <AsciiWrap ref={wrapRef}>
      <AsciiPre ref={preRef} style={{ color: fg }} />
      {hint && <AsciiHint style={{ color: fg }}>{hint}</AsciiHint>}
      <AsciiClick
        onMouseEnter={enter}
        onMouseLeave={leave}
        onMouseDown={down}
        onMouseUp={up}
        onTouchStart={down}
        onTouchEnd={up}
      />
    </AsciiWrap>
  );
}

/* ─── Main Theme ───────────────────────────────────── */
export function PCVTheme({ darkMode }) {
  const cv = useCV();
  const [themeIdx, setThemeIdx] = useState(() => (darkMode ? 5 : 0));
  const [copyHint, setCopyHint] = useState(' [+]');

  const experience = useMemo(() => {
    if (!cv) return [];
    const raw = cv.sectionsRaw?.experience || [];
    return raw.filter(e => !isArchived(e)).slice(0, 5).map(entry => {
      let startDate = entry.start_date;
      let endDate = entry.end_date;
      // Derive dates from nested positions when not set at company level
      if (Array.isArray(entry.positions) && entry.positions.length > 0) {
        if (!startDate) {
          const starts = entry.positions.map(p => p.start_date).filter(Boolean);
          startDate = starts.sort()[0];
        }
        if (!endDate) {
          if (entry.positions.some(p => isPresent(p.end_date))) {
            endDate = 'present';
          } else {
            const ends = entry.positions.map(p => p.end_date).filter(Boolean).sort();
            endDate = ends[ends.length - 1];
          }
        }
      }
      const sy = startDate ? String(startDate).split('-')[0] : '';
      const ey = isPresent(endDate) ? '\u00b7\u00b7\u00b7\u00b7'
        : endDate ? String(endDate).split('-')[0] : '\u00b7\u00b7\u00b7\u00b7';
      return { company: entry.company || '', dates: `${sy}\u00a0\u2192\u00a0${ey}`, url: entry.url || null };
    });
  }, [cv]);

  const { contactLinks, socialEntries } = useMemo(() => {
    if (!cv) return { contactLinks: [], socialEntries: [] };
    const contact = [];
    const social = [];
    if (cv.website || cv.socialLinks?.website)
      contact.push({ label: 'Portfolio', url: cv.website || cv.socialLinks.website });
    for (const s of (cv.socialRaw || [])) {
      const net = String(s.network || '').toLowerCase();
      if (['website', 'personal'].includes(net)) continue;
      social.push({ label: s.network, url: s.url });
    }
    return { contactLinks: contact, socialEntries: social };
  }, [cv]);

  const copyEmail = useCallback(() => {
    if (!cv?.email) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cv.email).then(() => {
        setCopyHint(' [COPIED]');
        setTimeout(() => setCopyHint(' [+]'), 2000);
      }).catch(() => { window.location.href = `mailto:${cv.email}`; });
    } else {
      window.location.href = `mailto:${cv.email}`;
    }
  }, [cv?.email]);

  if (!cv) return null;

  const theme = THEMES[themeIdx];
  const initial = (cv.name || 'U').charAt(0).toUpperCase();

  return (
    <>
      <FontLoader />
      <Outer style={{ '--pcv-bg': theme.bg, '--pcv-fg': theme.fg, '--pcv-copy': `"${copyHint}"` }}>
        <Inner>
          <Content>
            <Row className="desktop-only"><Label>{initial}.CV</Label></Row>
            <Spacer className="desktop-only" />
            <Row><Label>{cv.name}</Label></Row>
            <Row><Label>{cv.currentJobTitle || ''}</Label></Row>
            <Spacer />

            {experience.map((e, i) => (
              <Row key={`e${i}`}>
                <NoLink>
                  <span>{e.company}</span>
                  <Dates>{e.dates}</Dates>
                  <MobileSym>[-]</MobileSym>
                </NoLink>
              </Row>
            ))}

            <Spacer />

            {contactLinks.map((link, i) => (
              <Row key={`c${i}`}>
                <LinkBtn onClick={() => window.open(link.url, '_blank')}>
                  <BtnLabel>{link.label}</BtnLabel>
                  <MobileSym>[↗]</MobileSym>
                </LinkBtn>
              </Row>
            ))}

            {cv.email && (
              <Row>
                <CopyBtn onClick={copyEmail} style={{ '--pcv-copy': `"${copyHint}"` }}>
                  <BtnLabel>Email</BtnLabel>
                  <MobileSym>{copyHint.trim()}</MobileSym>
                </CopyBtn>
              </Row>
            )}

            <Spacer />

            {socialEntries.map((link, i) => (
              <Row key={`s${i}`}>
                <LinkBtn onClick={() => window.open(link.url, '_blank')}>
                  <BtnLabel>{link.label}</BtnLabel>
                  <MobileSym>[↗]</MobileSym>
                </LinkBtn>
              </Row>
            ))}

            <BottomRow>
              <SwitchBtn onClick={() => setThemeIdx(i => (i + 1) % THEMES.length)}>
                <BtnLabel className="desktop-only">Theme</BtnLabel>
                <MobileSym>[⬏]</MobileSym>
              </SwitchBtn>
            </BottomRow>
          </Content>

          <AsciiFlame fg={theme.fg} />
        </Inner>
      </Outer>
    </>
  );
}

/* ─── Shared button base ───────────────────────────── */
const btnBase = `
  border: none;
  padding: 0 0 0 3px;
  margin: 0;
  background: none;
  font-family: inherit;
  font-size: 16px;
  line-height: 24px;
  text-transform: uppercase;
  border-radius: 2px;
  color: var(--pcv-fg);
  cursor: default;

  &:focus-visible {
    color: var(--pcv-bg);
    background: var(--pcv-fg);
    outline: none;
  }
  &:active {
    background: var(--pcv-fg);
    color: var(--pcv-bg);
  }

  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 32px;
    width: 100%;
    display: flex;
    padding: 0 0 0 3px;
  }
`;

/* ─── Styled components ────────────────────────────── */
const Outer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: grid;
  align-items: center;
  justify-content: center;
  background: var(--pcv-bg);
  color: var(--pcv-fg);
  font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 16px;
  line-height: 24px;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  min-height: 608px;

  * { box-sizing: border-box; }

  @media (max-width: 768px) {
    display: block;
    padding: 32px 24px;
    padding-left: 21px;
    font-size: 18px;
    line-height: 32px;
    overflow-y: auto;
    min-height: unset;
    min-width: 320px;
  }
`;

const Inner = styled.div`
  position: relative;
  width: calc(100vw - 74px);
  height: calc(100vh - 80px - var(--app-top-offset, 0px));
  min-height: 456px;

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    min-height: unset;
  }
`;

const Content = styled.div`
  position: relative;
  width: 36%;
  height: 100%;

  @media (max-width: 768px) {
    width: 100%;
    position: static;
  }
`;

const Row = styled.div`
  min-height: 24px;
  text-transform: uppercase;
  user-select: none;
  width: 100%;

  &.desktop-only {
    display: block;
  }

  @media (max-width: 768px) {
    min-height: 32px;
    &.desktop-only { display: none; }
  }
`;

const Spacer = styled.div`
  height: 24px;
  &.desktop-only { display: block; }
  @media (max-width: 768px) {
    height: 32px;
    &.desktop-only { display: none; }
  }
`;

const Label = styled.p`
  display: inline-block;
  border-radius: 2px;
  padding-left: 3px;
  cursor: default;
  margin: 0;
`;

const BtnLabel = styled.span`
  @media (max-width: 768px) {
    flex-grow: 1;
    text-align: left;
  }
`;

const MobileSym = styled.span`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const BottomRow = styled.div`
  position: absolute;
  bottom: 0;
  height: 24px;
  text-transform: uppercase;
  user-select: none;

  @media (max-width: 768px) {
    position: static;
    height: 32px;
    margin-top: 32px;
  }
`;

/* ─── Button variants ──────────────────────────────── */
const LinkBtn = styled.button`
  ${btnBase}
  &:hover::after, &:focus-visible::after, &:active::after {
    display: inline;
    content: " [↗]";
  }
  @media (max-width: 768px) {
    &:hover::after, &:focus-visible::after, &:active::after { content: ""; }
  }
`;

const CopyBtn = styled.button`
  ${btnBase}
  &:hover::after, &:focus-visible::after, &:active::after {
    display: inline;
    content: var(--pcv-copy, " [+]");
  }
  @media (max-width: 768px) {
    &:hover::after, &:focus-visible::after, &:active::after { content: ""; }
  }
`;

const SwitchBtn = styled.button`
  ${btnBase}
  &:hover::after, &:focus-visible::after, &:active::after {
    display: inline;
    content: " [⬏]";
  }
  @media (max-width: 768px) {
    &:hover::after, &:focus-visible::after, &:active::after { content: ""; }
    width: auto;
    padding-right: 3px;
  }
`;

const Dates = styled.span`
  position: relative;
  margin-left: auto;
  white-space: nowrap;
  padding-left: 1em;
  flex-shrink: 0;
  align-self: flex-start;
`;

const NoLink = styled.div`
  ${btnBase}
  display: flex;
  width: 100%;

  & > span:first-child {
    min-width: 0;
    white-space: normal;
    word-break: break-word;
  }
  &:hover ${Dates}::after, &:focus-visible ${Dates}::after {
    content: "[-]";
    position: absolute;
    left: calc(100% + 0.5em);
    top: 0;
  }
  @media (max-width: 768px) {
    &:hover ${Dates}::after, &:focus-visible ${Dates}::after { content: none; }
  }
`;

/* ─── ASCII flame styled ──────────────────────────── */
const AsciiWrap = styled.div`
  position: absolute;
  width: 64%;
  height: 100%;
  right: 3px;
  top: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const AsciiPre = styled.pre`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: inherit;
  text-align: right;
  user-select: none;
  overflow: hidden;
`;

const AsciiHint = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: var(--pcv-bg);
  pointer-events: none;
  user-select: none;
  font-family: inherit;
  font-size: 16px;
  line-height: 24px;
  text-transform: uppercase;
`;

const AsciiClick = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: default;
`;
