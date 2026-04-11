import { useEffect, useRef, useCallback } from 'react';
import {
  CanvasEl,
  ToolbarDock,
  ToolbarStack,
  GrabHandle,
  Toolbar,
} from './styles';
import { COLORS } from './helpers';

export function DrawingCanvas({ color, size, clearKey }) {
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

export function CanvasToolbar({ color, setColor, brush, setBrush, clear, open, setOpen }) {
  return (
    <ToolbarDock>
      <ToolbarStack $open={open}>
        <GrabHandle
          aria-label={open ? 'Hide drawing tools' : 'Show drawing tools'}
          onClick={() => setOpen((v) => !v)}
        />
        <Toolbar $open={open}>
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
            onClick={clear}
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
  );
}
