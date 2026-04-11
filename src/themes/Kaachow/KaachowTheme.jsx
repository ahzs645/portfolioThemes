import React, { useEffect, useMemo, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { withBase } from '../../utils/assetPath';

const MATTER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&family=JetBrains+Mono:wght@300;400&display=swap');

  body.kaachow-cursor-active {
    cursor: none !important;
  }
  @media (hover: hover) and (pointer: fine) {
    body.kaachow-cursor-active #kaachow-hit:hover {
      cursor: grab !important;
    }
    body.kaachow-cursor-active #kaachow-hit:active,
    body.kaachow-cursor-active.kaachow-grabbing,
    body.kaachow-cursor-active.kaachow-grabbing #kaachow-hit {
      cursor: grabbing !important;
    }
  }
`;

const Page = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  background: #f5f5f5;
  color: #2a2a2e;
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
`;

const Hero = styled.header`
  position: absolute;
  top: clamp(58px, 14vh, 144px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 45.818px;
  width: min(100%, 460px);
  padding: 0 16px;
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  color: #464646;
  pointer-events: none;
`;

const Eyebrow = styled.p`
  font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace;
  font-weight: 300;
  font-size: 18px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
  @media (max-width: 560px) {
    font-size: clamp(11.2px, 3.8vw, 18px);
  }
`;

const Heading = styled.h1`
  font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
  font-variation-settings: 'opsz' 144;
  font-weight: 300;
  font-size: 52px;
  line-height: 1.08;
  max-width: 420px;
  letter-spacing: -0.015em;
  margin: 0;
  @media (max-width: 560px) {
    font-size: clamp(28px, 9.5vw, 44px);
    line-height: 1.1;
  }
`;

const IconRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 24px;
`;

const IconItem = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8.068px;
  border-radius: 8.068px;
  background: #dfdfdf;
  line-height: 0;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #d2d2d2;
  }
  &:focus-visible {
    outline: 2px solid #464646;
    outline-offset: 2.4px;
  }

  img {
    width: 26.894px;
    height: 26.894px;
    display: block;
  }
`;

const IconLabel = styled.span`
  font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace;
  font-weight: 300;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #464646;
  white-space: nowrap;
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.22s ease;

  ${IconItem}:hover & {
    opacity: 1;
  }
`;

const Stage = styled.div`
  position: absolute;
  inset: 0;
  touch-action: none;
  overflow: visible;
  z-index: 10;
  pointer-events: none;

  img.can-back,
  img.can-front {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    will-change: transform;
    user-select: none;
  }
  img.can-back {
    z-index: 1;
  }
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
    z-index: 2;
  }
  img.can-front {
    z-index: 3;
  }
  #kaachow-hit {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 4;
    pointer-events: auto;
  }
`;

const Cursor = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99990;
  pointer-events: none;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  color: #464646;
  opacity: 0;
  transition: opacity 0.2s ease;
  will-change: transform;

  &.is-visible {
    opacity: 1;
  }
  &.is-suppressed {
    opacity: 0 !important;
  }

  .cursor-mark {
    display: block;
    width: 11.2px;
    height: 11.2px;
    border-radius: 50%;
    border: 1.2px solid #464646;
    background: rgba(245, 245, 245, 0.9);
    box-sizing: border-box;
    flex-shrink: 0;
    transition:
      width 0.24s cubic-bezier(0.25, 0.1, 0.25, 1),
      height 0.24s cubic-bezier(0.25, 0.1, 0.25, 1),
      border-width 0.24s ease,
      background 0.2s ease,
      opacity 0.2s ease;
  }

  .cursor-text {
    font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace;
    font-weight: 300;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #464646;
    white-space: nowrap;
    opacity: 0;
    max-width: 0;
    overflow: hidden;
    transition: opacity 0.22s ease, max-width 0.32s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  &.is-pill {
    padding: 6.4px 14px;
    border-radius: 999px;
    border: 1.2px solid #464646;
    background: rgba(245, 245, 245, 0.92);
  }
  &.is-pill .cursor-mark {
    width: 0;
    height: 0;
    opacity: 0;
    border-width: 0;
  }
  &.is-pill .cursor-text {
    opacity: 1;
    max-width: 280px;
  }
`;

function loadMatterJs() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.Matter) return Promise.resolve(window.Matter);
  if (window.__kaachowMatterPromise) return window.__kaachowMatterPromise;
  window.__kaachowMatterPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[data-kaachow-matter]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Matter));
      return;
    }
    const script = document.createElement('script');
    script.src = MATTER_CDN;
    script.async = true;
    script.dataset.kaachowMatter = 'true';
    script.addEventListener('load', () => resolve(window.Matter));
    script.addEventListener('error', () => resolve(null));
    document.head.appendChild(script);
  });
  return window.__kaachowMatterPromise;
}

function firstName(fullName) {
  if (!fullName) return 'there';
  return String(fullName).trim().split(/\s+/)[0];
}

function buildIcons(cv) {
  const s = cv?.socialLinks || {};
  const icons = [];
  if (s.twitter) {
    icons.push({
      key: 'x',
      label: 'X',
      href: s.twitter,
      src: withBase('kaachow/icon-x.svg'),
      alt: 'X profile',
    });
  }
  if (s.linkedin) {
    icons.push({
      key: 'linkedin',
      label: 'LinkedIn',
      href: s.linkedin,
      src: withBase('kaachow/icon-linkedin.svg'),
      alt: 'LinkedIn profile',
    });
  }
  const resumeHref = cv?.website || s.website || s.github;
  if (resumeHref) {
    icons.push({
      key: 'resume',
      label: 'Resume',
      href: resumeHref,
      src: withBase('kaachow/icon-resume.svg'),
      alt: 'Resume / website',
    });
  }
  return icons;
}

export function KaachowTheme() {
  const cv = useCV();

  const { eyebrow, heading, icons } = useMemo(() => {
    const name = firstName(cv?.name);
    return {
      eyebrow: `HEY I'M ${name.toUpperCase()}`,
      heading: 'I threw my portfolio away...',
      icons: buildIcons(cv),
    };
  }, [cv]);

  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const canBackRef = useRef(null);
  const canFrontRef = useRef(null);
  const hitRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    let rafId = 0;
    let disposed = false;
    let cleanupFns = [];

    loadMatterJs().then((Matter) => {
      if (disposed || !Matter) return;
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      const canBack = canBackRef.current;
      const canFront = canFrontRef.current;
      const hitArea = hitRef.current;
      if (!stage || !canvas || !canBack || !canFront || !hitArea) return;

      const { Engine, World, Bodies, Body } = Matter;
      const ctx = canvas.getContext('2d');

      const CAN_W = 384;
      const CAN_BACK_H = Math.round(CAN_W * (1993 / 1481));
      const CAN_FRONT_H = Math.round(CAN_W * (1803 / 1481));
      const CAN_DH = CAN_BACK_H - CAN_FRONT_H;

      const MAX_STEP_PX = 18;
      const MAX_STEP_RAD = 0.04;
      const FAST_THRESH = 12;
      const NORMAL_SUBS = 2;
      const FAST_SUBS = 5;
      const FAST_TILT_K = 0.5;

      const WALL_DEFS = [
        { lx: 0, ly: 16, la: 0, w: 352, h: 38 },
        { lx: -180, ly: -77, la: -0.05, w: 38, h: 253 },
        { lx: 180, ly: -77, la: 0.05, w: 38, h: 253 },
      ];
      const WALL_PHYS = {
        isStatic: true,
        friction: 0.92,
        frictionStatic: 1,
        restitution: 0.02,
      };
      const PAPER_OPTS = {
        friction: 0.65,
        frictionStatic: 0.75,
        restitution: 0.04,
        density: 0.003,
        frictionAir: 0.03,
      };
      const PAPER_COUNT = 10;
      const PAPER_SIZE_MULTIPLIER = 1.3;

      const TILT_SENSITIVITY = 0.004;
      const TILT_MAX_PER_FRAME = 0.15;
      const TILT_MAX_ANGLE = 1.2;
      const TILT_RETURN_FACTOR = 0.93;

      const engine = Engine.create({ enableSleeping: false });
      engine.world.gravity.y = 1;
      engine.positionIterations = 14;
      engine.velocityIterations = 10;
      const world = engine.world;

      let scale = 1;
      let currentLayout = { w: 600, h: 600 };
      let wallBodies = [];
      let paperBodies = [];
      let paperImg = null;
      const can = { x: 0, y: 0, angle: 0 };
      const canTarget = { x: 0, y: 0, angle: 0 };
      const drag = { active: false, offset: null, lastPos: null };

      const img = new Image();
      img.onload = () => {
        paperImg = img;
      };
      img.src = withBase('kaachow/paper.png');

      const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

      function rotLocal(lx, ly, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return { x: lx * c - ly * s, y: lx * s + ly * c };
      }

      function syncWalls() {
        for (let i = 0; i < WALL_DEFS.length; i++) {
          const d = WALL_DEFS[i];
          const rot = rotLocal(d.lx * scale, d.ly * scale, can.angle);
          Body.setPosition(wallBodies[i], {
            x: can.x + rot.x,
            y: can.y + rot.y,
          });
          Body.setAngle(wallBodies[i], can.angle + d.la);
        }
      }

      function createWalls() {
        wallBodies = [];
        for (const d of WALL_DEFS) {
          const body = Bodies.rectangle(0, 0, d.w * scale, d.h * scale, WALL_PHYS);
          wallBodies.push(body);
        }
        World.add(world, wallBodies);
        syncWalls();
      }

      function layoutSize() {
        const r = stage.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(r.width * dpr);
        canvas.height = Math.floor(r.height * dpr);
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        scale = Math.min(r.width / 500, r.height / 520, 1.15);
        return { w: r.width, h: r.height };
      }

      function halfCanBackPx() {
        return CAN_BACK_H * scale * 0.5;
      }

      const CAN_SPAWN_BOTTOM_OFFSET_PX = -300;
      function canYFromSpawnOffset(L) {
        return L.h - halfCanBackPx() - CAN_SPAWN_BOTTOM_OFFSET_PX;
      }

      function rebuildWorld(L) {
        currentLayout = L;
        World.clear(world, false);
        wallBodies = [];
        paperBodies = [];

        can.x = L.w * 0.5;
        can.y = canYFromSpawnOffset(L);
        can.angle = 0;
        canTarget.x = can.x;
        canTarget.y = can.y;
        canTarget.angle = 0;

        const floor = Bodies.rectangle(L.w / 2, L.h + 40, L.w * 3, 80, {
          isStatic: true,
          friction: 0.9,
          restitution: 0.02,
        });
        const leftB = Bodies.rectangle(-30, L.h / 2, 60, L.h * 3, { isStatic: true });
        const rightB = Bodies.rectangle(L.w + 30, L.h / 2, 60, L.h * 3, { isStatic: true });
        World.add(world, [floor, leftB, rightB]);

        createWalls();

        for (let i = 0; i < PAPER_COUNT; i++) {
          const spriteSize = (96 + (i % 5) * 13) * scale * PAPER_SIZE_MULTIPLIER;
          const physW = spriteSize * 0.55;
          const physH = spriteSize * 0.45;
          const localX = (Math.random() - 0.5) * 64 * scale;
          const localY = (-96 + Math.random() * 80) * scale;
          const body = Bodies.rectangle(
            can.x + localX,
            can.y + localY,
            physW,
            physH,
            Object.assign({}, PAPER_OPTS, {
              angle: (Math.random() - 0.5) * 1.5,
            })
          );
          body._spriteSize = spriteSize;
          paperBodies.push(body);
        }
        World.add(world, paperBodies);
      }

      function syncCanVisuals() {
        const deg = (can.angle * 180) / Math.PI;
        const w = CAN_W * scale;
        const bh = CAN_BACK_H * scale;
        const fh = CAN_FRONT_H * scale;
        const dh = CAN_DH * scale;

        canBack.style.width = w + 'px';
        canBack.style.height = bh + 'px';
        canBack.style.transformOrigin = '0 0';
        canBack.style.transform =
          'translate(' + can.x + 'px,' + can.y + 'px) ' +
          'rotate(' + deg + 'deg) ' +
          'translate(' + (-w / 2) + 'px,' + (-bh / 2) + 'px)';

        canFront.style.width = w + 'px';
        canFront.style.height = fh + 'px';
        canFront.style.transformOrigin = '0 0';
        canFront.style.transform =
          'translate(' + can.x + 'px,' + can.y + 'px) ' +
          'rotate(' + deg + 'deg) ' +
          'translate(' + (-w / 2) + 'px,' + (-bh / 2 + dh) + 'px)';

        const hitW = w * 0.92;
        const hitH = bh * 0.95;
        hitArea.style.width = hitW + 'px';
        hitArea.style.height = hitH + 'px';
        hitArea.style.transformOrigin = '0 0';
        hitArea.style.transform =
          'translate(' + can.x + 'px,' + can.y + 'px) ' +
          'rotate(' + deg + 'deg) ' +
          'translate(' + (-hitW / 2) + 'px,' + (-hitH / 2) + 'px)';
      }

      function drawPapers() {
        if (!paperImg || !paperImg.complete) return;
        for (const b of paperBodies) {
          const sz = b._spriteSize || 40;
          ctx.save();
          ctx.translate(b.position.x, b.position.y);
          ctx.rotate(b.angle);
          ctx.drawImage(paperImg, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        }
      }

      function loop() {
        if (!drag.active && Math.abs(can.angle) > 0.002) {
          canTarget.angle = can.angle * TILT_RETURN_FACTOR;
        }
        if (!drag.active) {
          canTarget.x = can.x;
          canTarget.y = can.y;
        }

        const totalDx = canTarget.x - can.x;
        const totalDy = canTarget.y - can.y;
        const totalDa = canTarget.angle - can.angle;
        const posDist = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
        const angDist = Math.abs(totalDa);

        const isFast = posDist > FAST_THRESH * scale || angDist > MAX_STEP_RAD * 3;
        let subs = isFast ? FAST_SUBS : NORMAL_SUBS;
        const neededPos = Math.ceil(posDist / MAX_STEP_PX);
        const neededAng = Math.ceil(angDist / MAX_STEP_RAD);
        subs = Math.max(subs, neededPos, neededAng);
        subs = Math.min(subs, 8);

        const dt = 1000 / 60 / subs;

        for (let step = 0; step < subs; step++) {
          const remX = canTarget.x - can.x;
          const remY = canTarget.y - can.y;
          const remA = canTarget.angle - can.angle;

          const frac = 1 / Math.max(1, subs - step);
          const ix = clamp(remX * frac, -MAX_STEP_PX, MAX_STEP_PX);
          const iy = clamp(remY * frac, -MAX_STEP_PX, MAX_STEP_PX);
          const ia = clamp(remA * frac, -MAX_STEP_RAD, MAX_STEP_RAD);

          can.x += ix;
          can.y += iy;
          can.angle += ia;
          can.angle = clamp(can.angle, -TILT_MAX_ANGLE, TILT_MAX_ANGLE);

          syncWalls();
          Engine.update(engine, dt);
        }

        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        drawPapers();
        syncCanVisuals();
        rafId = requestAnimationFrame(loop);
      }

      function clientToWorld(cx, cy) {
        const r = stage.getBoundingClientRect();
        return { x: cx - r.left, y: cy - r.top };
      }

      function onDown(e) {
        const p = e.touches ? e.touches[0] : e;
        const w = clientToWorld(p.clientX, p.clientY);
        drag.active = true;
        document.body.classList.add('kaachow-grabbing');
        drag.offset = { x: w.x - can.x, y: w.y - can.y };
        drag.lastPos = { x: w.x, y: w.y };
        canTarget.x = can.x;
        canTarget.y = can.y;
        canTarget.angle = can.angle;
        e.preventDefault();
      }

      function onMove(e) {
        if (!drag.active) return;
        const p = e.touches ? e.touches[0] : e;
        const w = clientToWorld(p.clientX, p.clientY);

        const margin = 80 * scale;
        canTarget.x = clamp(w.x - drag.offset.x, margin, currentLayout.w - margin);
        canTarget.y = w.y - drag.offset.y;

        const dx = w.x - drag.lastPos.x;
        drag.lastPos = { x: w.x, y: w.y };
        const speed = Math.abs(dx);
        const k = speed > FAST_THRESH ? TILT_SENSITIVITY * FAST_TILT_K : TILT_SENSITIVITY;
        const tilt = clamp(dx * k, -TILT_MAX_PER_FRAME, TILT_MAX_PER_FRAME);
        canTarget.angle = clamp(canTarget.angle + tilt, -TILT_MAX_ANGLE, TILT_MAX_ANGLE);

        e.preventDefault();
      }

      function onUp() {
        drag.active = false;
        document.body.classList.remove('kaachow-grabbing');
      }

      hitArea.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      hitArea.addEventListener('touchstart', onDown, { passive: false });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);

      let resizeTimer = null;
      function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => rebuildWorld(layoutSize()), 100);
      }
      window.addEventListener('resize', onResize);

      rebuildWorld(layoutSize());
      rafId = requestAnimationFrame(loop);

      cleanupFns.push(() => {
        cancelAnimationFrame(rafId);
        hitArea.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        hitArea.removeEventListener('touchstart', onDown);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
        window.removeEventListener('resize', onResize);
        clearTimeout(resizeTimer);
        World.clear(world, false);
        Engine.clear(engine);
        document.body.classList.remove('kaachow-grabbing');
      });
    });

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    document.body.classList.add('kaachow-cursor-active');
    const el = cursorRef.current;
    const hitArea = hitRef.current;
    if (!el || !hitArea) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    const lerp = 0.22;
    let hasSample = false;
    let rafId = 0;

    function resolveState(target) {
      if (document.body.classList.contains('kaachow-grabbing')) return 'drag';
      if (target && target.closest && target.closest('[data-kaachow-btn]')) return 'btn';
      if (target && target.closest && target.closest('#kaachow-hit')) return 'can';
      return 'default';
    }

    function syncFromTarget(target) {
      const state = resolveState(target);
      const hand = state === 'can' || state === 'drag';
      el.classList.toggle('is-suppressed', hand);
      if (hand) return;
      el.classList.toggle('is-pill', state === 'btn');
    }

    function onMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasSample) {
        hasSample = true;
        curX = targetX;
        curY = targetY;
      }
      el.classList.add('is-visible');
      el.style.transform = 'translate(-50%, -50%)';
      syncFromTarget(e.target);
    }

    function onMouseUp() {
      requestAnimationFrame(() => {
        const node = document.elementFromPoint(targetX, targetY);
        if (node) syncFromTarget(node);
        else {
          el.classList.remove('is-suppressed');
          el.classList.remove('is-pill');
        }
      });
    }

    function onBlur() {
      el.classList.remove('is-visible');
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onBlur);

    function tick() {
      if (el.classList.contains('is-visible')) {
        curX += (targetX - curX) * lerp;
        curY += (targetY - curY) * lerp;
        el.style.left = curX + 'px';
        el.style.top = curY + 'px';
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onBlur);
      document.body.classList.remove('kaachow-cursor-active');
    };
  }, []);

  return (
    <>
      <FontLoader />
      <Page>
        <Hero aria-label="Introduction">
          <HeroCopy>
            <Eyebrow>{eyebrow}</Eyebrow>
            <Heading>{heading}</Heading>
          </HeroCopy>
          <IconRow aria-label="Links">
            {icons.map((icon) => (
              <IconItem key={icon.key}>
                <IconButton
                  data-kaachow-btn
                  href={icon.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={icon.alt}
                >
                  <img src={icon.src} alt="" width="27" height="27" />
                </IconButton>
                <IconLabel>{icon.label}</IconLabel>
              </IconItem>
            ))}
          </IconRow>
        </Hero>

        <Stage ref={stageRef}>
          <img
            ref={canBackRef}
            className="can-back"
            src={withBase('kaachow/can-back.png')}
            alt=""
          />
          <canvas ref={canvasRef} aria-hidden="true" />
          <img
            ref={canFrontRef}
            className="can-front"
            src={withBase('kaachow/can-front.png')}
            alt=""
          />
          <div ref={hitRef} id="kaachow-hit" aria-label="Drag to move the trash can" />
        </Stage>

        <Cursor ref={cursorRef} aria-hidden="true">
          <span className="cursor-mark" aria-hidden="true" />
          <span className="cursor-text">Find me here instead</span>
        </Cursor>
      </Page>
    </>
  );
}
