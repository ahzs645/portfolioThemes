import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatMonthYear, isPresent, isArchived } from '../../utils/cvHelpers';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body.benissen-locked { overflow: hidden; background: rgb(28, 28, 28); }
  .benissen-theme ::selection { background: rgba(255,255,255,0.18); color: #fff; }
`;

const C = {
  bg: 'rgb(28, 28, 28)',
  card: 'rgb(54, 54, 54)',
  inset: 'rgb(46, 46, 46)',
  inset2: 'rgb(38, 38, 38)',
  tabActive: 'rgb(71, 71, 71)',
  border: 'rgba(117, 117, 117, 0.5)',
  borderHard: 'rgb(97, 97, 97)',
  borderSoft: 'rgb(82, 82, 82)',
  text: 'rgb(224, 224, 224)',
  textMid: 'rgb(189, 189, 189)',
  textMuted: 'rgb(153, 153, 153)',
  pulse: 'rgb(255, 51, 51)',
  white: '#ffffff',
};

const COLORS = ['#FFFFFF', '#FF5D0D', '#7A64FF'];

const pulse = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1.0); opacity: 0.85; }
  50%      { transform: translate(-50%, -50%) scale(1.6); opacity: 0.0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const detailIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrap = styled.div`
  position: fixed;
  inset: 0;
  background: ${C.bg};
  color: ${C.text};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  letter-spacing: -0.01em;
  overflow: hidden;
`;

const CanvasEl = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
  z-index: 0;
`;

const ToolbarDock = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  z-index: 30;
`;

const ToolbarStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transform: ${(p) => (p.$open ? 'translateY(0)' : 'translateY(calc(100% + 8px))')};
  transition: transform 0.3s ease;
`;

const GrabHandle = styled.button`
  width: 65px;
  height: 4px;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: grab;
  transition: background-color 0.2s ease;
  border: none;
  padding: 0;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 8px;

  &:hover { background-color: rgba(255, 255, 255, 0.85); }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 12px;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? 'auto' : 'none')};
  transition: opacity 0.3s ease;

  .swatch {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: transform 140ms ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  .swatch:hover { transform: scale(1.1); }
  .swatch.active { border-color: #fff; }

  .range {
    width: 45px;
    height: 4px;
    appearance: none;
    -webkit-appearance: none;
    background: rgba(255,255,255,0.3);
    border-radius: 10px;
    outline: none;
    cursor: pointer;
  }
  .range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    border: none;
  }

  .clear {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: rgb(105, 105, 105);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: color 140ms ease, transform 140ms ease;
    padding: 0;
  }
  .clear:hover { color: #fff; transform: scale(1.1); }
`;

const Stage = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 28px 20px 100px;
  z-index: 10;
  pointer-events: none;
  overflow-y: auto;

  @media (max-width: 900px) {
    padding: 18px 14px 110px;
    align-items: start;
  }
`;

const Card = styled.div`
  position: relative;
  background: ${C.card};
  border-radius: 30px;
  padding: 10px;
  width: min(960px, 100%);
  pointer-events: auto;
  box-shadow:
    rgba(0,0,0,0.53) 0px 0.7px 0.95px -1.25px,
    rgba(0,0,0,0.48) 0px 2.05px 2.87px -2.5px,
    rgba(0,0,0,0.37) 0px 5.4px 7.6px -3.75px,
    rgba(140,140,140,1) 0px 0px 0px 0.5px,
    rgba(0,0,0,0.25) 0px 4px 8px 0px,
    rgba(0,0,0,0.19) 0px 16px 73px -1px;
  animation: ${fadeIn} 480ms cubic-bezier(0.5,0,0.88,0.77) both;
`;

const Grain = styled.div`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0.05;
  pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 256px 256px;
`;

const Inset = styled.div`
  position: relative;
  background: ${C.inset};
  border: 0.5px solid ${C.border};
  border-radius: 22px;
  box-shadow: rgba(0,0,0,0.16) 0px 1px 2px 2px inset;
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 540px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 0.5px solid rgba(117,117,117,0.25);
  min-height: 0;

  @media (max-width: 900px) {
    border-right: none;
    border-bottom: 0.5px solid rgba(117,117,117,0.25);
  }
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
`;

const HeaderRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 12px;
  background: transparent;
  border: none;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: 14px;
  margin: 4px;
  transition: background 140ms ease;

  &:hover { background: rgba(255,255,255,0.025); }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6e6e6e, #2a2a2a);
  flex-shrink: 0;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  border: 0.5px solid rgba(255,255,255,0.08);

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;

  .n { font-size: 16px; font-weight: 600; color: ${C.text}; line-height: 1.2; }
  .t { font-size: 13px; color: ${C.textMid}; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${C.inset2};
  margin: 0 10px;
  padding: 5px;
  border-radius: 16px;
  box-shadow: 0 1px 0 0 rgba(0,0,0,0.25) inset;
`;

const Tab = styled.button`
  flex: 1;
  min-width: 0;
  background: ${(p) => (p.$active ? C.tabActive : 'transparent')};
  border: 0.5px solid ${(p) => (p.$active ? C.borderHard : 'transparent')};
  color: ${C.text};
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.015em;
  padding: 7px 6px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, opacity 140ms ease;
  opacity: ${(p) => (p.$active ? 1 : 0.8)};
  box-shadow: ${(p) => (p.$active ? '0 2px 4px rgba(0,0,0,0.25)' : 'none')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover { opacity: 1; }
`;

const ListWrap = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 6px 14px 14px;
  scrollbar-width: thin;
  scrollbar-color: #444 transparent;
  min-height: 0;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }

  @media (max-width: 900px) {
    max-height: 300px;
  }
`;

const ItemBtn = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: ${(p) => (p.$active ? 'rgba(255,255,255,0.05)' : 'transparent')};
  border: none;
  padding: 12px 10px;
  color: inherit;
  font-family: inherit;
  cursor: pointer;
  border-bottom: 0.5px solid rgba(117,117,117,0.18);
  border-radius: 8px;
  transition: background 140ms ease, padding 140ms ease;
  position: relative;

  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255,255,255,0.04); padding-left: 14px; }

  .title-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
  }

  .title {
    font-size: 14px;
    font-weight: 500;
    color: ${C.text};
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .badge {
    font-size: 12px;
    color: ${C.textMuted};
    line-height: 1.5;
    letter-spacing: -0.01em;
  }

  .desc {
    font-size: 13px;
    color: ${C.textMid};
    line-height: 1.4;
    letter-spacing: -0.01em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

const Empty = styled.div`
  padding: 32px 6px;
  text-align: center;
  color: ${C.textMuted};
  font-size: 13px;
`;

const RightScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #444 transparent;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
`;

const BioBody = styled.div`
  padding: 22px 26px 26px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  animation: ${detailIn} 280ms ease both;
`;

const DetailBody = styled.div`
  padding: 22px 26px 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${detailIn} 280ms ease both;
`;

const BackBtn = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 0.5px solid rgba(117,117,117,0.4);
  color: ${C.textMid};
  font-family: inherit;
  font-size: 12px;
  padding: 6px 12px 6px 8px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;

  &:hover {
    background: rgba(255,255,255,0.04);
    color: ${C.text};
    border-color: ${C.borderHard};
  }
`;

const Loc = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .dot-wrap {
    position: relative;
    width: 16px;
    height: 16px;
  }
  .dot {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    background: ${C.pulse};
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .dot::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100%;
    height: 100%;
    background: ${C.pulse};
    border-radius: 50%;
    animation: ${pulse} 1.6s ease-out infinite;
  }

  .text {
    font-size: 13px;
    color: ${C.textMid};
    letter-spacing: -0.01em;
  }
`;

const BigName = styled.h1`
  margin: 0;
  font-size: clamp(34px, 5vw, 48px);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.05;
  color: ${C.text};
`;

const DetailTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
`;

const DetailTitle = styled.h2`
  margin: 0;
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: ${C.text};
`;

const StatusBadge = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${C.textMuted};
  border: 0.5px solid rgba(117,117,117,0.5);
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: -0.01em;
  text-transform: capitalize;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12.5px;
  color: ${C.textMuted};

  span { display: inline-flex; gap: 5px; align-items: center; }
`;

const BioText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: ${C.textMid};
    letter-spacing: -0.01em;
  }
`;

const Highlights = styled.ul`
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    position: relative;
    padding-left: 18px;
    font-size: 13.5px;
    color: ${C.textMid};
    line-height: 1.55;
    letter-spacing: -0.01em;
  }
  li::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 9px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${C.borderHard};
  }
`;

const Divider = styled.div`
  height: 0.5px;
  background: ${C.borderSoft};
  margin: 4px 0;
`;

const Tagline = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${C.textMid};
  line-height: 1.4;
  letter-spacing: -0.01em;
`;

const VisitLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 10px 16px;
  background: ${C.white};
  color: #000;
  border-radius: 32px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  align-self: flex-start;
  transition: background 140ms ease;

  &:hover { background: #e6e6e6; }
`;

const Newsletter = styled.form`
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;

  input[type='email'] {
    flex: 1;
    background: ${C.inset2};
    color: #fff;
    border: 1px solid rgba(237,237,237,0);
    border-radius: 32px;
    padding: 11px 16px;
    outline: none;
    font-family: inherit;
    font-size: 13px;
    letter-spacing: -0.01em;
    min-width: 0;

    &::placeholder { color: ${C.textMuted}; }
    &:focus { border-color: rgba(237,237,237,0.3); }
  }

  button {
    background: ${C.white};
    color: #000;
    border: none;
    border-radius: 32px;
    padding: 11px 22px;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.01em;
    transition: background 140ms ease;
    white-space: nowrap;

    &:hover { background: #e6e6e6; }
  }
`;

function statusFor(item) {
  if (isArchived(item)) return 'Archived';
  if (item?.end_date && isPresent(item.end_date)) return 'Live';
  if (!item?.end_date) return 'Live';
  return 'Past';
}

function fmtRange(start, end) {
  const s = formatMonthYear(start);
  const e = formatMonthYear(end);
  if (!s && !e) return '';
  if (!e) return s;
  return `${s} — ${e}`;
}

function getInitials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || 'A'
  );
}

function DrawingCanvas({ color, size, clearKey }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const colorRef = useRef(color);
  const sizeRef = useRef(size);

  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const prev = document.createElement('canvas');
      prev.width = canvas.width;
      prev.height = canvas.height;
      const pctx = prev.getContext('2d');
      if (pctx && canvas.width > 0) pctx.drawImage(canvas, 0, 0);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (prev.width > 0) {
        ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, w, h);
      }
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [clearKey]);

  const point = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }, []);

  const start = useCallback((e) => {
    if (e.target !== ref.current) return;
    drawing.current = true;
    last.current = point(e);
    e.preventDefault();
  }, [point]);

  const move = useCallback((e) => {
    if (!drawing.current) return;
    const ctx = ref.current.getContext('2d');
    const p = point(e);
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = sizeRef.current;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    e.preventDefault();
  }, [point]);

  const end = useCallback(() => { drawing.current = false; }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    c.addEventListener('touchstart', start, { passive: false });
    c.addEventListener('touchmove', move, { passive: false });
    c.addEventListener('touchend', end);
    return () => {
      c.removeEventListener('mousedown', start);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      c.removeEventListener('touchstart', start);
      c.removeEventListener('touchmove', move);
      c.removeEventListener('touchend', end);
    };
  }, [start, move, end]);

  return <CanvasEl ref={ref} />;
}

export function BenIssenTheme() {
  const cv = useCV();
  const [tab, setTab] = useState('experience');
  const [selectedKey, setSelectedKey] = useState(null);
  const [showBio, setShowBio] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brush, setBrush] = useState(3);
  const [clearKey, setClearKey] = useState(0);
  const [toolsOpen, setToolsOpen] = useState(false);
  const rightScrollRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('benissen-locked');
    return () => document.body.classList.remove('benissen-locked');
  }, []);

  const initials = useMemo(() => getInitials(cv?.name || 'A'), [cv?.name]);

  const projects = useMemo(
    () => (cv?.sectionsRaw?.projects || []).filter((p) => p?.name),
    [cv?.sectionsRaw?.projects]
  );

  const experience = useMemo(() => cv?.experience || [], [cv?.experience]);

  const articles = useMemo(() => {
    const out = [];
    (cv?.publications || []).forEach((p, i) => {
      if (p?.title) out.push({ title: p.title, sub: p.publisher || p.venue, url: p.url, date: p.date, _i: `pub-${i}` });
    });
    (cv?.presentations || []).forEach((p, i) => {
      if (p?.title) out.push({ title: p.title, sub: p.venue || p.event, url: p.url, date: p.date, _i: `pre-${i}` });
    });
    return out;
  }, [cv?.publications, cv?.presentations]);

  const contacts = useMemo(() => {
    const out = [];
    if (cv?.email) out.push({ key: 'email', title: 'Email', sub: cv.email, url: `mailto:${cv.email}` });
    (cv?.socialRaw || []).forEach((s, i) => {
      if (s?.url) out.push({ key: `s-${i}`, title: s.network, sub: s.username || s.url.replace(/^https?:\/\//, ''), url: s.url });
    });
    if (cv?.website) out.push({ key: 'web', title: 'Website', sub: cv.website.replace(/^https?:\/\//, ''), url: cv.website });
    if (cv?.phone) out.push({ key: 'phone', title: 'Phone', sub: cv.phone, url: `tel:${cv.phone}` });
    return out;
  }, [cv]);

  const bioParagraphs = useMemo(() => {
    if (!cv?.about) return [];
    return cv.about.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  }, [cv?.about]);

  useEffect(() => {
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = 0;
  }, [selectedKey, showBio]);

  if (!cv) {
    return (
      <Wrap className="benissen-theme">
        <GlobalStyle />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: C.textMuted }}>
          Loading…
        </div>
      </Wrap>
    );
  }

  let listItems = [];
  if (tab === 'experience') {
    listItems = experience.map((e, i) => ({
      key: `e-${i}`,
      title: e.title,
      badge: e.isCurrent ? 'Current' : null,
      desc: e.company,
      raw: e,
      type: 'experience',
    }));
  } else if (tab === 'work') {
    listItems = projects.map((p, i) => ({
      key: `p-${i}`,
      title: p.name,
      badge: statusFor(p),
      desc: p.description,
      raw: p,
      type: 'project',
    }));
  } else if (tab === 'articles') {
    listItems = articles.map((a) => ({
      key: a._i,
      title: a.title,
      desc: a.sub,
      raw: a,
      type: 'article',
    }));
  } else {
    listItems = contacts.map((c) => ({
      key: c.key,
      title: c.title,
      desc: c.sub,
      raw: c,
      type: 'contact',
    }));
  }

  const effectiveKey =
    listItems.find((it) => it.key === selectedKey)?.key ?? listItems[0]?.key ?? null;
  const selected = !showBio && effectiveKey
    ? listItems.find((it) => it.key === effectiveKey)
    : null;

  const renderDetail = () => {
    if (!selected) return null;

    if (selected.type === 'experience') {
      const e = selected.raw;
      return (
        <DetailBody>
          <BackBtn onClick={() => setShowBio(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Bio
          </BackBtn>
          <DetailTitleRow>
            <DetailTitle>{e.title}</DetailTitle>
            {e.isCurrent && <StatusBadge>Current</StatusBadge>}
          </DetailTitleRow>
          {e.company && <Tagline>{e.company}</Tagline>}
          <MetaRow>
            {(e.startDate || e.endDate) && <span>{fmtRange(e.startDate, e.endDate)}</span>}
            {e.location && <span>· {e.location}</span>}
          </MetaRow>
          {Array.isArray(e.highlights) && e.highlights.length > 0 && (
            <Highlights>
              {e.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </Highlights>
          )}
        </DetailBody>
      );
    }

    if (selected.type === 'project') {
      const p = selected.raw;
      return (
        <DetailBody>
          <BackBtn onClick={() => setShowBio(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </BackBtn>
          <DetailTitleRow>
            <DetailTitle>{p.name}</DetailTitle>
            <StatusBadge>{statusFor(p)}</StatusBadge>
          </DetailTitleRow>
          {(p.start_date || p.end_date) && (
            <MetaRow>
              <span>{fmtRange(p.start_date, p.end_date)}</span>
            </MetaRow>
          )}
          {p.description && (
            <BioText><p>{p.description}</p></BioText>
          )}
          {Array.isArray(p.highlights) && p.highlights.length > 0 && (
            <Highlights>
              {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </Highlights>
          )}
          {p.url && (
            <VisitLink href={p.url} target="_blank" rel="noreferrer">
              Visit project
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </VisitLink>
          )}
        </DetailBody>
      );
    }

    if (selected.type === 'article') {
      const a = selected.raw;
      return (
        <DetailBody>
          <BackBtn onClick={() => setShowBio(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </BackBtn>
          <DetailTitle>{a.title}</DetailTitle>
          {a.sub && <Tagline>{a.sub}</Tagline>}
          {a.date && <MetaRow><span>{formatMonthYear(a.date)}</span></MetaRow>}
          {a.url && (
            <VisitLink href={a.url} target="_blank" rel="noreferrer">
              Read article
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </VisitLink>
          )}
        </DetailBody>
      );
    }

    const c = selected.raw;
    return (
      <DetailBody>
        <BackBtn onClick={() => setSelectedKey(null)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </BackBtn>
        <DetailTitle>{c.title}</DetailTitle>
        <Tagline>{c.sub}</Tagline>
        {c.url && (
          <VisitLink href={c.url} target={c.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
            Open
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7" /><polyline points="7 7 17 7 17 17" />
            </svg>
          </VisitLink>
        )}
      </DetailBody>
    );
  };

  const renderBio = () => (
    <BioBody>
      {cv.location && (
        <Loc>
          <div className="dot-wrap"><div className="dot" /></div>
          <div className="text">{cv.location}</div>
        </Loc>
      )}

      <BigName>{cv.name}</BigName>

      {bioParagraphs.length ? (
        <BioText>
          {bioParagraphs.map((p, i) => <p key={i}>{p}</p>)}
        </BioText>
      ) : (
        <BioText>
          <p>{cv.currentJobTitle || 'Designer and builder.'}</p>
        </BioText>
      )}

      <Divider />

      <Tagline>
        Doodle on the background while you read. Then say hi:
      </Tagline>

      <Newsletter
        onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.elements.email.value;
          if (cv.email && email) {
            window.location.href = `mailto:${cv.email}?subject=Hi%20${encodeURIComponent(cv.name)}&body=From%20${encodeURIComponent(email)}`;
          }
        }}
      >
        <input
          type="email"
          name="email"
          placeholder="Your email"
          required
        />
        <button type="submit">Say hi</button>
      </Newsletter>
    </BioBody>
  );

  return (
    <>
      <GlobalStyle />
      <Wrap className="benissen-theme">
        <DrawingCanvas color={color} size={brush} clearKey={clearKey} />

        <Stage>
          <Card>
            <Grain />
            <Inset>
              <LeftCol>
                <HeaderRow onClick={() => setShowBio(true)} title="Show bio">
                  <Avatar>
                    {cv.avatar ? <img src={cv.avatar} alt="" /> : initials}
                  </Avatar>
                  <NameBlock>
                    <div className="n">{cv.name}</div>
                    <div className="t">{cv.currentJobTitle || 'I design and build things people love'}</div>
                  </NameBlock>
                </HeaderRow>

                <Tools>
                  <Tab $active={tab === 'experience'} onClick={() => { setTab('experience'); setShowBio(false); setSelectedKey(null); }}>Experience</Tab>
                  <Tab $active={tab === 'work'} onClick={() => { setTab('work'); setShowBio(false); setSelectedKey(null); }}>Work</Tab>
                  <Tab $active={tab === 'articles'} onClick={() => { setTab('articles'); setShowBio(false); setSelectedKey(null); }}>Articles</Tab>
                  <Tab $active={tab === 'contact'} onClick={() => { setTab('contact'); setShowBio(false); setSelectedKey(null); }}>Contact</Tab>
                </Tools>

                <ListWrap>
                  {listItems.length ? (
                    listItems.map((it) => (
                      <ItemBtn
                        key={it.key}
                        $active={!showBio && effectiveKey === it.key}
                        onClick={() => { setSelectedKey(it.key); setShowBio(false); }}
                      >
                        <div className="title-row">
                          <div className="title">{it.title}</div>
                          {it.badge && <div className="badge">{it.badge}</div>}
                        </div>
                        {it.desc && <div className="desc">{it.desc}</div>}
                      </ItemBtn>
                    ))
                  ) : (
                    <Empty>Nothing here yet.</Empty>
                  )}
                </ListWrap>
              </LeftCol>

              <RightCol>
                <RightScroll ref={rightScrollRef}>
                  {selected ? renderDetail() : renderBio()}
                </RightScroll>
              </RightCol>
            </Inset>
          </Card>
        </Stage>

        <ToolbarDock>
          <ToolbarStack $open={toolsOpen}>
            <GrabHandle
              aria-label={toolsOpen ? 'Hide drawing tools' : 'Show drawing tools'}
              onClick={() => setToolsOpen((v) => !v)}
            />
            <Toolbar $open={toolsOpen}>
              {COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  aria-label={`Pick ${col}`}
                  className={`swatch ${color === col ? 'active' : ''}`}
                  style={{ background: col }}
                  onClick={() => setColor(col)}
                />
              ))}
              <input
                type="range"
                min="1"
                max="60"
                value={brush}
                aria-label="Brush size"
                className="range"
                onChange={(e) => setBrush(Number(e.target.value))}
              />
              <button
                type="button"
                className="clear"
                aria-label="Clear canvas"
                onClick={() => setClearKey((k) => k + 1)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </Toolbar>
          </ToolbarStack>
        </ToolbarDock>
      </Wrap>
    </>
  );
}
