import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { BlendMode, Screen, globalDebugInfo, resetGlobalDebugInfo } from './engine.js';
import { BrowserProgram, DebuggerProgram, PainterProgram, TextEditProgram } from './programs.js';
import { defaultGlyphSet } from './glyphs.js';

const CELL_SIZE = 8;
const WINDOW_CHROME_HEIGHT = 11;
const TASKBAR_HEIGHT = 10;

const vertexShaderSource = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_gridSize;
uniform sampler2D u_screenTex;
uniform vec4 u_fillEnabled;
uniform vec4 u_fillDisabled;
uniform vec4 u_strokeEnabled;
uniform vec4 u_strokeDisabled;

void main() {
  vec2 uv = vec2(
    gl_FragCoord.x / u_resolution.x,
    1.0 - (gl_FragCoord.y / u_resolution.y)
  );

  ivec2 cell = ivec2(floor(uv * u_gridSize));
  if (cell.x < 0 || cell.x >= int(u_gridSize.x) ||
      cell.y < 0 || cell.y >= int(u_gridSize.y)) {
    gl_FragColor = u_fillDisabled;
    return;
  }

  vec2 texUV = (vec2(cell) + 0.5) / u_gridSize;
  float fade = texture2D(u_screenTex, texUV).r;

  vec4 fillColor = mix(u_fillDisabled, u_fillEnabled, fade);
  vec4 strokeColor = mix(u_strokeDisabled, u_strokeEnabled, fade);

  vec2 cellUV = uv * u_gridSize - vec2(cell);
  vec2 pxInCell = cellUV * u_resolution / u_gridSize;
  float strokeWidth = 1.0;

  bool isStroke =
    pxInCell.x < strokeWidth ||
    pxInCell.y < strokeWidth ||
    pxInCell.x > (u_resolution.x / u_gridSize.x) - strokeWidth ||
    pxInCell.y > (u_resolution.y / u_gridSize.y) - strokeWidth;

  gl_FragColor = isStroke ? strokeColor : fillColor;
}
`;

const palette = {
  stroke: {
    disabled: [188 / 255, 218 / 255, 189 / 255, 1],
    enabled: [57 / 255, 56 / 255, 29 / 255, 1],
  },
  fill: {
    enabled: [77 / 255, 76 / 255, 49 / 255, 1],
    disabled: [208 / 255, 238 / 255, 209 / 255, 1],
  },
};

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function formatTime(date) {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function getProjectSummary(project) {
  const parts = [project.summary, ...(project.highlights || [])].filter(Boolean);
  return parts.join(' ');
}

function createBrowserPages(cv) {
  const experience = (cv?.sectionsRaw?.experience || []).filter((item) => !isArchived(item));
  const volunteer = (cv?.sectionsRaw?.volunteer || []).filter((item) => !isArchived(item));
  const awards = (cv?.sectionsRaw?.awards || []).filter((item) => !isArchived(item));
  const education = cv?.education || [];
  const projects = cv?.projects || [];
  const socialLinks = cv?.socialLinks || {};

  const intro = [
    `# ${cv?.name || 'Portfolio OS'}`,
    '',
    cv?.about || 'A WebGL desktop driven by resume data.',
    '',
    cv?.currentJobTitle ? `Current role: ${cv.currentJobTitle}` : null,
    cv?.location ? `Location: ${cv.location}` : null,
    cv?.email ? `Email: ${cv.email}` : null,
    '',
    '[Open experience](/experience.md)',
    '[Open projects](/projects.md)',
    '[Open contact](/contact.md)',
  ].filter(Boolean).join('\n');

  const experienceBody = experience.map((entry) => {
    const positions = Array.isArray(entry.positions) && entry.positions.length > 0
      ? entry.positions.map((pos) => `- ${pos.title} (${pos.start_date || ''} to ${pos.end_date || 'present'})`).join('\n')
      : `- ${entry.position || ''} (${entry.start_date || ''} to ${entry.end_date || 'present'})`;
    return `## ${entry.company}\n${positions}`;
  }).join('\n\n');

  const projectBody = projects.map((project) => {
    const summary = getProjectSummary(project);
    const link = project.url ? `\n${project.url}` : '';
    return `## ${project.name}\n${summary || ''}${link}`;
  }).join('\n\n');

  const contactLines = [
    '# Contact',
    '',
    cv?.email ? `Email: ${cv.email}` : null,
    cv?.phone ? `Phone: ${cv.phone}` : null,
    cv?.website ? `Website: ${cv.website}` : null,
    socialLinks.github ? `GitHub: ${socialLinks.github}` : null,
    socialLinks.linkedin ? `LinkedIn: ${socialLinks.linkedin}` : null,
    socialLinks.twitter ? `Twitter: ${socialLinks.twitter}` : null,
    '',
    '[Back to intro](/intro.md)',
  ].filter(Boolean).join('\n');

  const aboutLines = [
    '# About',
    '',
    cv?.about || '',
    '',
    education[0] ? `Education: ${education[0].degree} in ${education[0].area} at ${education[0].institution}` : null,
    volunteer[0] ? `Volunteer: ${volunteer[0].title} at ${volunteer[0].company}` : null,
    awards[0] ? `Award: ${awards[0].name}` : null,
  ].filter(Boolean).join('\n');

  return {
    '/intro.md': intro,
    '/about.md': aboutLines,
    '/experience.md': `# Experience\n\n${experienceBody || 'No experience loaded yet.'}`,
    '/projects.md': `# Projects\n\n${projectBody || 'No projects loaded yet.'}`,
    '/contact.md': contactLines,
  };
}

function createTextBuffer(title, body, width = 100, height = 72) {
  const program = new TextEditProgram(defaultGlyphSet);
  program.systemData.title = title;
  program.setSize(width, height);
  program.lines = body.split('\n');
  return program;
}

function createApps(cv, pages) {
  return [
    {
      name: 'Browser',
      create: () => new BrowserProgram(defaultGlyphSet, pages),
    },
    {
      name: 'About.txt',
      create: () => createTextBuffer(
        'About.txt',
        [
          cv?.name || 'Unknown',
          cv?.currentJobTitle || '',
          cv?.location || '',
          '',
          cv?.about || '',
        ].filter(Boolean).join('\n'),
        104,
        74,
      ),
    },
    {
      name: 'Projects.txt',
      create: () => createTextBuffer(
        'Projects.txt',
        (cv?.projects || [])
          .slice(0, 8)
          .map((project) => `${project.name}\n${getProjectSummary(project) || ''}\n`)
          .join('\n') || 'No projects loaded.',
        120,
        80,
      ),
    },
    {
      name: 'Painter',
      create: () => new PainterProgram(defaultGlyphSet),
    },
    {
      name: 'Debugger',
      create: () => new DebuggerProgram(defaultGlyphSet),
    },
  ];
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(error || 'Failed to compile shader');
  }

  return shader;
}

export function HenryLangTheme() {
  const canvasRef = useRef(null);
  const cv = useCV();
  const pages = useMemo(() => createBrowserPages(cv), [cv]);
  const apps = useMemo(() => createApps(cv, pages), [cv, pages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cv) return undefined;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return undefined;

    const dpr = window.devicePixelRatio || 1;
    const screenState = {
      gridW: 0,
      gridH: 0,
      screen: null,
      textureData: null,
      texture: null,
    };

    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Failed to link shader program');
    }

    gl.useProgram(program);

    const quad = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      gridSize: gl.getUniformLocation(program, 'u_gridSize'),
      screenTex: gl.getUniformLocation(program, 'u_screenTex'),
      fillEnabled: gl.getUniformLocation(program, 'u_fillEnabled'),
      fillDisabled: gl.getUniformLocation(program, 'u_fillDisabled'),
      strokeEnabled: gl.getUniformLocation(program, 'u_strokeEnabled'),
      strokeDisabled: gl.getUniformLocation(program, 'u_strokeDisabled'),
    };

    gl.uniform4fv(uniforms.fillEnabled, palette.fill.enabled);
    gl.uniform4fv(uniforms.fillDisabled, palette.fill.disabled);
    gl.uniform4fv(uniforms.strokeEnabled, palette.stroke.enabled);
    gl.uniform4fv(uniforms.strokeDisabled, palette.stroke.disabled);
    gl.uniform1i(uniforms.screenTex, 0);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    let animationFrame = 0;
    let mouseX = null;
    let mouseY = null;
    let menuOpen = false;
    let hoveredMenuIndex = -1;
    let dragTarget = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let isDragging = false;
    let resizeTarget = null;
    let isResizing = false;
    let resizeStartWidth = 0;
    let resizeStartHeight = 0;
    let resizeStartCol = 0;
    let resizeStartRow = 0;
    let lastFrameTime = -1;

    const runningPrograms = [];
    const context = {
      spawn: (newProgram) => {
        newProgram.initialize?.(context);
        runningPrograms.push(newProgram);
      },
    };

    const createInitialBrowser = () => {
      const browser = new BrowserProgram(defaultGlyphSet, pages);
      browser.initialize(context);
      runningPrograms.push(browser);
    };

    function setupScreen() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width * dpr));
      const height = Math.max(240, Math.floor(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;

      screenState.gridW = Math.max(40, Math.floor(width / CELL_SIZE));
      screenState.gridH = Math.max(30, Math.floor(height / CELL_SIZE));
      screenState.screen = new Screen(screenState.gridH, screenState.gridW, 10, defaultGlyphSet);
      screenState.textureData = new Uint8Array(screenState.gridW * screenState.gridH);
      screenState.texture = gl.createTexture();

      gl.viewport(0, 0, width, height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, screenState.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.LUMINANCE,
        screenState.gridW,
        screenState.gridH,
        0,
        gl.LUMINANCE,
        gl.UNSIGNED_BYTE,
        screenState.textureData,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform2f(uniforms.gridSize, screenState.gridW, screenState.gridH);
    }

    function getLocalCoords(activeProgram, col, row) {
      return {
        x: col - activeProgram.systemData.x - 1,
        y: row - activeProgram.systemData.y - WINDOW_CHROME_HEIGHT,
      };
    }

    function isInsideProgram(activeProgram, col, row) {
      const data = activeProgram.systemData;
      return (
        col >= data.x + 1 &&
        col <= data.x + data.width &&
        row >= data.y + WINDOW_CHROME_HEIGHT &&
        row <= data.y + data.height + WINDOW_CHROME_HEIGHT
      );
    }

    function clampWindow(programInstance) {
      const data = programInstance.systemData;
      data.x = Math.max(0, Math.min(data.x, screenState.gridW - data.width - 2));
      data.y = Math.max(TASKBAR_HEIGHT - 1, Math.min(data.y, screenState.gridH - data.height - WINDOW_CHROME_HEIGHT - 1));
    }

    function spawnApp(index) {
      const descriptor = apps[index];
      if (!descriptor) return;
      const app = descriptor.create();
      app.systemData.x = 20 + runningPrograms.length * 4;
      app.systemData.y = 20 + runningPrograms.length * 3;
      clampWindow(app);
      app.initialize?.(context);
      runningPrograms.push(app);
    }

    function drawWindowChrome(screen, data) {
      screen.drawRect(data.y + 1, data.x + 1, 9, data.width, false);
      screen.drawLine(data.y, data.x, data.y + data.height + WINDOW_CHROME_HEIGHT, data.x);
      screen.drawLine(data.y, data.x + data.width + 1, data.y + data.height + WINDOW_CHROME_HEIGHT, data.x + data.width + 1);
      screen.drawLine(data.y + data.height + WINDOW_CHROME_HEIGHT, data.x, data.y + data.height + WINDOW_CHROME_HEIGHT, data.x + data.width + 1);
      screen.drawLine(data.y + WINDOW_CHROME_HEIGHT - 1, data.x, data.y + WINDOW_CHROME_HEIGHT - 1, data.x + data.width + 1);
      screen.drawLine(data.y, data.x, data.y, data.x + data.width + 1);
      screen.drawLine(data.y, data.x + data.width - 9, data.y + 10, data.x + data.width - 9);
      screen.drawText(data.title, data.y + 2, data.x + 2);
      screen.drawGlyph(1, data.y + 2, data.x + data.width - 7);
    }

    function renderFrame() {
      const frameStart = performance.now();
      const screen = screenState.screen;
      if (!screen) return;

      screen.clear(false);

      for (let i = 0; i < runningPrograms.length; i++) {
        const activeProgram = runningPrograms[i];
        const data = activeProgram.systemData;
        clampWindow(activeProgram);
        drawWindowChrome(screen, data);
        const surface = activeProgram.frame();
        screen.blitSurface(surface, data.y + WINDOW_CHROME_HEIGHT, data.x + 1, BlendMode.OVERWRITE);
      }

      screen.drawLine(TASKBAR_HEIGHT - 1, 0, TASKBAR_HEIGHT - 1, screenState.gridW);
      screen.drawRect(0, 0, TASKBAR_HEIGHT - 1, screenState.gridW);
      screen.drawRect(0, 0, TASKBAR_HEIGHT - 1, 29, menuOpen);
      screen.drawText('Apps', 1, 3, 1, BlendMode.ADD, !menuOpen);

      if (menuOpen) {
        const startRow = 2;
        const startCol = 1;
        screen.drawRect(10, 0, startRow + apps.length * 9 + 8, 72);

        for (let i = 0; i < apps.length; i++) {
          const y = startRow + i * 9 + 8;
          const isHovered = i === hoveredMenuIndex;
          if (isHovered) {
            screen.drawRect(y, startCol, 9, 72, true);
          }
          screen.drawText(apps[i].name, y + 1, startCol + 2, 1, BlendMode.ADD, !isHovered);
        }
      }

      const now = new Date();
      const currentTime = formatTime(now);
      screen.drawText(currentTime, 1, screenState.gridW - 6 * currentTime.length - 2);

      if (mouseX !== null && mouseY !== null) {
        const row = Math.floor(mouseY / CELL_SIZE);
        const col = Math.floor(mouseX / CELL_SIZE);
        screen.drawGlyph(0, row, col, BlendMode.OVERWRITE);
      }

      screen.tickFade();
      const fade = screen.getFadeBuffer();
      for (let i = 0; i < fade.length; i++) {
        screenState.textureData[i] = Math.round(fade[i] * 255);
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, screenState.texture);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        screenState.gridW,
        screenState.gridH,
        gl.LUMINANCE,
        gl.UNSIGNED_BYTE,
        screenState.textureData,
      );

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      lastFrameTime = Math.round(performance.now() - frameStart);
      const debugProgram = runningPrograms.find((item) => typeof item.processDebugInfo === 'function');
      if (debugProgram) {
        debugProgram.processDebugInfo({ frameTime: lastFrameTime, ...globalDebugInfo });
      }
      resetGlobalDebugInfo();
      animationFrame = window.requestAnimationFrame(renderFrame);
    }

    function getPointerPosition(event) {
      const rect = canvas.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) * dpr;
      mouseY = (event.clientY - rect.top) * dpr;
      return {
        row: Math.floor(mouseY / CELL_SIZE),
        col: Math.floor(mouseX / CELL_SIZE),
      };
    }

    function handleMouseMove(event) {
      const { row, col } = getPointerPosition(event);

      if (menuOpen) {
        const menuStart = 10;
        const itemHeight = 9;
        if (row >= menuStart) {
          const index = Math.floor((row - menuStart) / itemHeight);
          hoveredMenuIndex = index >= 0 && index < apps.length ? index : -1;
        } else {
          hoveredMenuIndex = -1;
        }
      }

      if (isResizing && resizeTarget) {
        const data = resizeTarget.systemData;
        const dCol = col - resizeStartCol;
        const dRow = row - resizeStartRow;
        data.width = Math.max(40, resizeStartWidth + dCol);
        data.height = Math.max(30, resizeStartHeight + dRow);
        clampWindow(resizeTarget);
        return;
      }

      if (isDragging && dragTarget) {
        dragTarget.systemData.x = col - dragOffsetX;
        dragTarget.systemData.y = row - dragOffsetY;
        clampWindow(dragTarget);
        return;
      }

      const top = runningPrograms[runningPrograms.length - 1];
      if (top && isInsideProgram(top, col, row)) {
        const local = getLocalCoords(top, col, row);
        top.onMouseMove?.(local.x, local.y);
      }
    }

    function handleMouseDown(event) {
      const { row, col } = getPointerPosition(event);

      if (row >= 1 && row <= 7 && col >= 3 && col < 27) {
        menuOpen = !menuOpen;
        return;
      }

      if (menuOpen) {
        const startRow = 2;
        const startCol = 1;
        const itemHeight = 9;
        const itemWidth = 72;
        let clickedIndex = -1;

        for (let i = 0; i < apps.length; i++) {
          const yTop = startRow + i * itemHeight + 8;
          if (row >= yTop && row < yTop + itemHeight && col >= startCol && col < startCol + itemWidth) {
            clickedIndex = i;
            break;
          }
        }

        if (clickedIndex !== -1) {
          spawnApp(clickedIndex);
        }

        menuOpen = false;
        hoveredMenuIndex = -1;
        return;
      }

      for (let i = runningPrograms.length - 1; i >= 0; i--) {
        const data = runningPrograms[i].systemData;
        const closeLeft = data.x + data.width - 9;
        const closeRight = data.x + data.width + 1;
        const closeTop = data.y;
        const closeBottom = data.y + 10;

        if (col >= closeLeft && col <= closeRight && row >= closeTop && row <= closeBottom) {
          runningPrograms.splice(i, 1);
          return;
        }
      }

      for (let i = runningPrograms.length - 1; i >= 0; i--) {
        const data = runningPrograms[i].systemData;
        const handleCol = data.x + data.width + 1;
        const handleRow = data.y + data.height + WINDOW_CHROME_HEIGHT;

        if (col === handleCol && row === handleRow) {
          resizeTarget = runningPrograms[i];
          isResizing = true;
          resizeStartWidth = data.width;
          resizeStartHeight = data.height;
          resizeStartCol = col;
          resizeStartRow = row;
          const front = runningPrograms.splice(i, 1)[0];
          runningPrograms.push(front);
          return;
        }
      }

      for (let i = runningPrograms.length - 1; i >= 0; i--) {
        const data = runningPrograms[i].systemData;
        if (row >= data.y && row <= data.y + 10 && col >= data.x && col <= data.x + data.width + 1) {
          dragTarget = runningPrograms[i];
          isDragging = true;
          dragOffsetX = col - data.x;
          dragOffsetY = row - data.y;
          const front = runningPrograms.splice(i, 1)[0];
          runningPrograms.push(front);
          return;
        }
      }

      for (let i = runningPrograms.length - 1; i >= 0; i--) {
        const activeProgram = runningPrograms[i];
        if (!isInsideProgram(activeProgram, col, row)) continue;
        const local = getLocalCoords(activeProgram, col, row);
        if (activeProgram.onMouseDown(local.x, local.y)) {
          const front = runningPrograms.splice(i, 1)[0];
          runningPrograms.push(front);
          return;
        }
      }
    }

    function handleMouseUp(event) {
      if (isResizing && resizeTarget) {
        resizeTarget.setSize(resizeTarget.systemData.width, resizeTarget.systemData.height);
      }

      isResizing = false;
      resizeTarget = null;
      isDragging = false;
      dragTarget = null;

      if (!runningPrograms.length) return;
      const top = runningPrograms[runningPrograms.length - 1];
      const { row, col } = getPointerPosition(event);
      if (isInsideProgram(top, col, row)) {
        const local = getLocalCoords(top, col, row);
        top.onMouseUp?.(local.x, local.y);
      }
    }

    function handleKeyDown(event) {
      const top = runningPrograms[runningPrograms.length - 1];
      if (top?.onKeyDown?.(event)) {
        event.preventDefault();
      }
    }

    function handleKeyUp(event) {
      const top = runningPrograms[runningPrograms.length - 1];
      if (top?.onKeyUp?.(event)) {
        event.preventDefault();
      }
    }

    function handleWheel(event) {
      const top = runningPrograms[runningPrograms.length - 1];
      if (!top) return;
      const { row, col } = getPointerPosition(event);
      if (isInsideProgram(top, col, row)) {
        top.onScroll?.(event.deltaY);
      }
    }

    function handleResize() {
      if (screenState.texture) {
        gl.deleteTexture(screenState.texture);
      }
      setupScreen();
    }

    setupScreen();
    createInitialBrowser();
    animationFrame = window.requestAnimationFrame(renderFrame);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (screenState.texture) gl.deleteTexture(screenState.texture);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    };
  }, [apps, cv, pages]);

  if (!cv) return null;

  return (
    <Frame>
      <Canvas ref={canvasRef} />
      <Hint>Drag windows, open Apps, scroll in Browser.</Hint>
    </Frame>
  );
}

const Frame = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #c4e0c8;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100vh;
  image-rendering: pixelated;
  cursor: none;
`;

const Hint = styled.div`
  position: absolute;
  right: 16px;
  bottom: 16px;
  padding: 6px 10px;
  background: rgba(208, 238, 209, 0.9);
  border: 1px solid rgba(57, 56, 29, 0.45);
  color: #39381d;
  font: 12px/1.2 monospace;
  letter-spacing: 0.02em;
  pointer-events: none;
`;
