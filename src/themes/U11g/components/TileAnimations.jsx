import React, { useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

const AnimLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.7s ease-out;
  pointer-events: none;
  overflow: hidden;

  ${(p) =>
    p.$active &&
    css`
      opacity: 1;
    `}
`;

// ---------- MATRIX RAIN (orange) ----------
export function MatrixRain({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    const resize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = '01';
    const fontSize = 14;
    let columns = Math.ceil(canvas.width / fontSize);
    let drops = new Array(columns).fill(1).map(() => -Math.random() * canvas.height);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff6b00';
      ctx.font = `${fontSize}px monospace`;
      const cols = Math.ceil(canvas.width / fontSize);
      if (cols !== columns) {
        columns = cols;
        drops = new Array(columns).fill(1).map(() => -Math.random() * canvas.height);
      }
      for (let i = 0; i < drops.length; i++) {
        const char = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const id = setInterval(draw, 33);
    return () => {
      clearInterval(id);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  return (
    <AnimLayer $active={active}>
      <FullCanvas ref={canvasRef} $opacity={0.2} />
    </AnimLayer>
  );
}

// ---------- INFO LOGS ----------
const pulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;
const widthPulse = keyframes`
  0%, 100% { width: 10%; opacity: 0.3; }
  50% { width: 90%; opacity: 0.7; }
`;

export function InfoLogs({ active, color = '#eab308' }) {
  const rows = Array.from({ length: 12 }, (_, i) => ({
    delay: (i * 0.1).toFixed(2),
    labelDelay: (Math.random() * 1).toFixed(2),
  }));
  return (
    <AnimLayer $active={active}>
      <LogStack style={{ color }}>
        {rows.map((r, i) => (
          <LogRow key={i}>
            <LogLabel style={{ animationDelay: `${r.labelDelay}s` }}>INFO</LogLabel>
            <LogBar $color={color} style={{ animationDelay: `${r.delay}s` }} />
          </LogRow>
        ))}
      </LogStack>
    </AnimLayer>
  );
}

// ---------- TYPING TERMINAL ----------
const typing = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
`;

export function TypingTerminal({ active, color = '#22c55e', lines }) {
  const defaultLines = [
    '> INIT_SEQUENCE',
    '> LOADING_MODULES...',
    '> CONNECTING_TO_CORE...',
    '> ACCESS_GRANTED',
    '> SUBJECT: PORTFOLIO',
    '> STATUS: READY',
    '> ...',
    '> EOF',
  ];
  const content = lines || defaultLines;
  return (
    <AnimLayer $active={active}>
      <TerminalWrap style={{ color }}>
        <TerminalInner>
          {content.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </TerminalInner>
      </TerminalWrap>
    </AnimLayer>
  );
}

// ---------- EQUALIZER ----------
const equalizer = keyframes`
  0%, 100% { height: 15%; }
  50% { height: 95%; }
`;

export function Equalizer({ active, color = '#a855f7' }) {
  const delays = [0, 0.2, 0.4, 0.1, 0.3, 0.5, 0.25, 0.45];
  return (
    <AnimLayer $active={active}>
      <EqWrap>
        {delays.map((d, i) => (
          <EqBar key={i} $color={color} style={{ animationDelay: `${d}s` }} />
        ))}
      </EqWrap>
    </AnimLayer>
  );
}

// ---------- SPINNING GEOMETRY ----------
const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export function SpinningGeometry({ active, color = '#06b6d4' }) {
  return (
    <AnimLayer $active={active}>
      <GeoWrap>
        <GeoShape>
          <GeoRect $color={color} style={{ transform: 'rotate(45deg)' }} />
          <GeoRect $color={color} style={{ transform: 'rotate(-45deg)' }} />
          <GeoCircle $color={color} />
          <GeoRect
            $color={color}
            style={{ inset: '32px', transform: 'rotate(12deg)' }}
          />
        </GeoShape>
      </GeoWrap>
    </AnimLayer>
  );
}

// ---------- CELLULAR AUTOMATON ----------
export function CellularAutomaton({ active, color = '#3b82f6' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    let width = 0;
    let height = 0;
    const cellSize = 10;
    let cols = 0;
    let rows = 0;
    let cells = [];

    const resize = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / cellSize);
      rows = Math.ceil(height / cellSize);
      cells = new Array(cols * rows).fill(0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, width, height);
      const next = [...cells];
      for (let i = 0; i < cells.length; i++) {
        if (cells[i] > 0) next[i] *= 0.9;
        if (next[i] < 0.01) next[i] = 0;
        if (Math.random() > 0.999) next[i] = 1;
        if (cells[i] > 0.5) {
          const neighbors = [i - 1, i + 1, i - cols, i + cols];
          const target = neighbors[Math.floor(Math.random() * neighbors.length)];
          if (target >= 0 && target < cells.length && Math.random() > 0.8) next[target] = 1;
        }
      }
      cells = next;
      ctx.fillStyle = color;
      for (let i = 0; i < cells.length; i++) {
        if (cells[i] > 0.05) {
          ctx.globalAlpha = cells[i];
          const x = (i % cols) * cellSize;
          const y = Math.floor(i / cols) * cellSize;
          ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
        }
      }
      ctx.globalAlpha = 1;
    };

    const id = setInterval(draw, 50);
    return () => {
      clearInterval(id);
      window.removeEventListener('resize', resize);
    };
  }, [active, color]);

  return (
    <AnimLayer $active={active}>
      <FullCanvas ref={canvasRef} $opacity={0.3} />
    </AnimLayer>
  );
}

// ---------- FLOW DIAGRAM ----------
const dash = keyframes`
  to { stroke-dashoffset: 0; }
`;

export function FlowDiagram({ active, color = '#22c55e' }) {
  return (
    <AnimLayer $active={active}>
      <FlowSvg viewBox="0 0 100 100" preserveAspectRatio="none" $color={color}>
        <path d="M10,10 L30,10 L30,30" fill="none" strokeWidth="0.5" className="dashPath" />
        <path d="M50,10 L50,40 L70,40" fill="none" strokeWidth="0.5" className="dashPath d2" />
        <path d="M90,10 L90,80 L60,80" fill="none" strokeWidth="0.5" className="dashPath d3" />
        <circle cx="30" cy="30" r="1" className="pulseDot" />
        <circle cx="70" cy="40" r="1" className="pulseDot d2" />
        <circle cx="60" cy="80" r="1" className="pulseDot d3" />
      </FlowSvg>
    </AnimLayer>
  );
}

// ---------- SYSTEM LOAD (CPU/MEM/NET) ----------
const load = keyframes`
  0%, 100% { transform: scaleX(0.8); }
  50% { transform: scaleX(1); }
`;

export function SystemLoad({ active, color = '#ec4899' }) {
  return (
    <AnimLayer $active={active}>
      <LoadWrap style={{ color }}>
        <LoadRow>
          <span>CPU</span>
          <LoadTrack>
            <LoadBar $color={color} style={{ width: '45%', animationDuration: '2s' }} />
          </LoadTrack>
        </LoadRow>
        <LoadRow>
          <span>MEM</span>
          <LoadTrack>
            <LoadBar
              $color={color}
              style={{ width: '70%', animationDuration: '3s', animationDirection: 'reverse' }}
            />
          </LoadTrack>
        </LoadRow>
        <LoadRow>
          <span>NET</span>
          <LoadTrack>
            <LoadBar
              $color={color}
              style={{ width: '20%', animationDuration: '1.5s', animationTimingFunction: 'linear' }}
            />
          </LoadTrack>
        </LoadRow>
      </LoadWrap>
    </AnimLayer>
  );
}

/* ---------- shared styled pieces ---------- */

const FullCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: ${(p) => p.$opacity ?? 0.25};
`;

const LogStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  width: 100%;
  height: 100%;
  opacity: 0.25;
`;
const LogRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 8px;
  font-family: 'JetBrains Mono', monospace;
`;
const LogLabel = styled.span`
  animation: ${pulse} 1s ease-in-out infinite;
`;
const LogBar = styled.span`
  display: inline-block;
  height: 4px;
  background: ${(p) => p.$color};
  border-radius: 2px;
  animation: ${widthPulse} 2s ease-in-out infinite;
`;

const TerminalWrap = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  line-height: 1.4;
  opacity: 0.35;
  padding: 16px;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;
const TerminalInner = styled.div`
  animation: ${typing} 4s steps(20, end) infinite;
`;

const EqWrap = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 60%;
  height: 60%;
  padding: 16px;
  display: flex;
  gap: 4px;
  align-items: flex-end;
  justify-content: flex-end;
  opacity: 0.35;
`;
const EqBar = styled.div`
  flex: 1;
  min-height: 10%;
  background: ${(p) => p.$color};
  border-radius: 2px 2px 0 0;
  animation: ${equalizer} 0.8s ease-in-out infinite;
`;

const GeoWrap = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.25;
`;
const GeoShape = styled.div`
  position: relative;
  width: 128px;
  height: 128px;
  animation: ${spin} 10s linear infinite;
`;
const GeoRect = styled.div`
  position: absolute;
  inset: 0;
  border: 1px solid ${(p) => p.$color};
`;
const GeoCircle = styled.div`
  position: absolute;
  inset: 8px;
  border: 1px solid ${(p) => p.$color};
  border-radius: 50%;
`;

const FlowSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 16px;
  opacity: 0.35;
  color: ${(p) => p.$color};

  .dashPath {
    stroke: currentColor;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: ${dash} 3s linear infinite;
  }
  .dashPath.d2 { animation-delay: 0.3s; }
  .dashPath.d3 { animation-delay: 0.6s; }

  .pulseDot {
    fill: currentColor;
    animation: ${pulse} 1.2s ease-in-out infinite;
  }
  .pulseDot.d2 { animation-delay: 0.3s; }
  .pulseDot.d3 { animation-delay: 0.6s; }
`;

const LoadWrap = styled.div`
  position: absolute;
  inset: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  opacity: 0.3;
`;
const LoadRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;
const LoadTrack = styled.div`
  width: 64px;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
`;
const LoadBar = styled.div`
  height: 100%;
  background: ${(p) => p.$color};
  transform-origin: left;
  animation: ${load} 2s ease-in-out infinite;
`;
