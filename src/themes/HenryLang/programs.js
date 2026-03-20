import { Surface, BlendMode } from './engine.js';

class Program {
  constructor(systemData) {
    this.systemData = systemData || {
      x: 50, y: 50, z: 0, width: 80, height: 50, title: 'Program',
    };
  }
  setSize() {}
  initialize() {}
  frame() {}
  onMouseDown() { return false; }
  onMouseUp() { return false; }
  onMouseMove() { return false; }
  onKeyDown() { return false; }
  onKeyUp() { return false; }
  onScroll() {}
}

export class BrowserProgram extends Program {
  constructor(glyphSet, pages) {
    super();
    this.glyphSet = glyphSet;
    this.pages = pages; // { '/intro.md': '...', '/about.md': '...' }
    this.systemData = {
      x: 30, y: 25, z: 0, width: 200, height: 140, title: 'Browser',
    };
    this.surface = new Surface(this.systemData.height, this.systemData.width, glyphSet);
    this.url = '/intro.md';
    this.data = null;
    this.loading = false;
    this.offsetY = 0;
    this.linkRects = [];
    this.history = [];
    this.historyIndex = -1;
  }

  setSize(w, h) {
    this.systemData.width = w;
    this.systemData.height = h;
    this.surface = new Surface(h, w, this.glyphSet);
  }

  _fetch() {
    this.offsetY = 0;
    this.loading = true;
    const text = this.pages[this.url] || `Page not found: ${this.url}`;
    this.data = this._parseMarkdown(text);
    this.loading = false;
  }

  _navigateTo(newUrl) {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(newUrl);
    this.historyIndex = this.history.length - 1;
    this.url = newUrl;
    this._fetch();
  }

  _goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.url = this.history[this.historyIndex];
      this._fetch();
    }
  }

  _goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.url = this.history[this.historyIndex];
      this._fetch();
    }
  }

  initialize() {
    this._navigateTo(this.url);
  }

  frame() {
    this.surface.clear();
    this.linkRects = [];

    if (this.loading) {
      this.surface.drawText('Loading...', 20, 4);
    } else if (this.data) {
      const maxWidth = this.systemData.width - 4;
      let y = 14 - Math.floor(this.offsetY);

      for (const block of this.data) {
        const scale = block.scale;
        const lines = this._wrapText(block.text, maxWidth, scale);

        for (const line of lines) {
          const lineHeight = 8 * scale + 2;
          this.surface.drawText(line, y, 2, 1, BlendMode.ADD, true, scale);

          if (block.links.length > 0) {
            for (const link of block.links) {
              const before = line.substring(0, link.start);
              const linkText = link.text;
              const pxStart = 2 + this._textWidth(before, scale);
              const pxEnd = pxStart + this._textWidth(linkText, scale) - 2;
              const underlineY = y + (8 * scale) - 1;
              this.surface.drawLine(underlineY, pxStart, underlineY, pxEnd);
              this.linkRects.push({
                x1: pxStart, y1: y, x2: pxEnd, y2: y + 8 * scale, url: link.url,
              });
            }
          }
          y += lineHeight;
        }
        y += 4;
      }
    }

    // Navigation bar
    this.surface.drawRect(0, 0, 10, this.systemData.width, false);
    this.surface.drawLine(9, 0, 9, this.systemData.width);
    if (this.historyIndex > 0) this.surface.drawGlyph(3, 1, 1);
    if (this.historyIndex < this.history.length - 1) this.surface.drawGlyph(4, 1, 11);
    this.surface.drawGlyph(2, 0, 21);
    this.surface.drawLine(0, 9, 9, 9);
    this.surface.drawLine(0, 19, 9, 19);
    this.surface.drawLine(0, 29, 9, 29);
    this.surface.drawText(this.url, 1, 31);

    return this.surface;
  }

  _parseMarkdown(text) {
    const lines = text.split('\n');
    const blocks = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    for (let raw of lines) {
      let line = raw.trim();
      if (line.startsWith('# ')) {
        blocks.push({ type: 'header', scale: 2, text: line.substring(2), links: [] });
        continue;
      }
      let links = [];
      let clean = line;
      let match;
      while ((match = linkRegex.exec(line)) !== null) {
        links.push({
          text: match[1], url: match[2],
          start: clean.indexOf(match[1]) - 1,
        });
        clean = clean.replace(match[0], match[1]);
      }
      blocks.push({ type: 'text', scale: 1, text: clean, links });
    }
    return blocks;
  }

  _textWidth(str, scale = 1) {
    let total = 0;
    for (let i = 0; i < str.length; i++) {
      const g = this.surface.glyphSet.get(str.charCodeAt(i));
      if (!g) continue;
      total += (g[0].length * scale) + 1;
    }
    return total;
  }

  _wrapText(str, maxWidthPx, scale = 1) {
    const words = str.split(' ');
    const lines = [];
    let current = '';
    let currentWidth = 0;
    const spaceGlyph = this.surface.glyphSet.get(' '.charCodeAt(0));
    const spaceWidth = ((spaceGlyph ? spaceGlyph[0].length : 3) * scale) + 1;

    for (const w of words) {
      const wordWidth = this._textWidth(w, scale);
      if (currentWidth + wordWidth + (current ? spaceWidth : 0) <= maxWidthPx) {
        if (!current) { current = w; currentWidth = wordWidth; }
        else { current += ' ' + w; currentWidth += spaceWidth + wordWidth; }
      } else {
        if (current) lines.push(current);
        current = w;
        currentWidth = wordWidth;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  onMouseDown(x, y) {
    if (x >= 21 && x <= 31 && y >= 0 && y <= 10) { this._fetch(); return true; }
    if (x >= 0 && x <= 10 && y >= 0 && y <= 10) { this._goBack(); return true; }
    if (x >= 11 && x <= 20 && y >= 0 && y <= 10) { this._goForward(); return true; }
    for (const rect of this.linkRects) {
      if (x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2) {
        this._navigateTo(rect.url);
        return true;
      }
    }
    return true;
  }

  onScroll(deltaY) {
    this.offsetY += deltaY / 10;
    this.offsetY = Math.max(this.offsetY, 0);
  }
}

export class TextEditProgram extends Program {
  constructor(glyphSet) {
    super();
    this.glyphSet = glyphSet;
    this.systemData = {
      x: 20, y: 20, z: 0, width: 80, height: 50, title: 'Text Edit',
    };
    this.lines = [''];
    this.cursorX = 0;
    this.cursorY = 0;
    this.cursorBlink = 0;
    this.hasFocus = false;
    this.surface = new Surface(this.systemData.height, this.systemData.width, glyphSet);
  }

  setSize(w, h) {
    this.systemData.width = w;
    this.systemData.height = h;
    this.surface = new Surface(h, w, this.glyphSet);
  }

  onMouseDown(x, y) {
    const lineIdx = Math.floor(y / 8);
    this.cursorY = Math.max(0, Math.min(lineIdx, this.lines.length - 1));
    this.cursorX = Math.max(0, Math.min(x, (this.lines[this.cursorY] || '').length));
    this.hasFocus = true;
    return true;
  }

  onKeyDown(e) {
    if (!this.hasFocus) return false;
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const line = this.lines[this.cursorY];
      this.lines[this.cursorY] = line.slice(0, this.cursorX) + e.key + line.slice(this.cursorX);
      this.cursorX++;
      return true;
    }
    if (e.key === 'Backspace') {
      const line = this.lines[this.cursorY];
      if (this.cursorX > 0) {
        this.lines[this.cursorY] = line.slice(0, this.cursorX - 1) + line.slice(this.cursorX);
        this.cursorX--;
      } else if (this.cursorY > 0) {
        const prev = this.lines[this.cursorY - 1];
        this.cursorX = prev.length;
        this.lines[this.cursorY - 1] = prev + line;
        this.lines.splice(this.cursorY, 1);
        this.cursorY--;
      }
      return true;
    }
    if (e.key === 'Enter') {
      const line = this.lines[this.cursorY];
      this.lines[this.cursorY] = line.slice(0, this.cursorX);
      this.lines.splice(this.cursorY + 1, 0, line.slice(this.cursorX));
      this.cursorY++;
      this.cursorX = 0;
      return true;
    }
    if (e.key === 'ArrowLeft') { if (this.cursorX > 0) this.cursorX--; return true; }
    if (e.key === 'ArrowRight') { if (this.cursorX < (this.lines[this.cursorY] || '').length) this.cursorX++; return true; }
    if (e.key === 'ArrowUp') { if (this.cursorY > 0) { this.cursorY--; this.cursorX = Math.min(this.cursorX, this.lines[this.cursorY].length); } return true; }
    if (e.key === 'ArrowDown') { if (this.cursorY < this.lines.length - 1) { this.cursorY++; this.cursorX = Math.min(this.cursorX, this.lines[this.cursorY].length); } return true; }
    return false;
  }

  frame() {
    this.surface.clear();
    const viewH = this.systemData.height;
    for (let y = 0; y < viewH && y < this.lines.length; y++) {
      this.surface.drawText(this.lines[y], y * 8, 0);
    }
    this.cursorBlink += 0.05;
    if (this.hasFocus && Math.sin(this.cursorBlink * 6) > 0) {
      const cursorLine = this.lines[this.cursorY] || '';
      const offset = this._textWidth(cursorLine.slice(0, this.cursorX));
      if (this.cursorY < viewH) {
        this.surface.setPixel(this.cursorY * 8, offset, true);
        this.surface.setPixel(this.cursorY * 8 + 1, offset, true);
        this.surface.setPixel(this.cursorY * 8 + 2, offset, true);
        this.surface.setPixel(this.cursorY * 8 + 3, offset, true);
        this.surface.setPixel(this.cursorY * 8 + 4, offset, true);
        this.surface.setPixel(this.cursorY * 8 + 5, offset, true);
        this.surface.setPixel(this.cursorY * 8 + 6, offset, true);
      }
    }
    return this.surface;
  }

  _textWidth(str) {
    let total = 0;
    for (let i = 0; i < str.length; i++) {
      const g = this.surface.glyphSet.get(str.charCodeAt(i));
      if (!g) continue;
      total += g[0].length + 1;
    }
    return total;
  }
}

export class PainterProgram extends Program {
  constructor(glyphSet) {
    super();
    this.glyphSet = glyphSet;
    this.systemData = {
      x: 30, y: 30, z: 0, width: 100, height: 70, title: 'Painter',
    };
    this.tool = 'pencil';
    this.brushDown = false;
    this.lastBrushX = null;
    this.lastBrushY = null;
    this.eraserRadius = 3;
    this._createSurface();
  }

  _createSurface() {
    this.surface = new Surface(this.systemData.height, this.systemData.width, this.glyphSet);
    const h = this.systemData.height;
    const w = this.systemData.width;
    this.canvas = new Array(h).fill(null).map(() => new Array(w).fill(false));
  }

  setSize(w, h) {
    this.systemData.width = w;
    this.systemData.height = h;
    this._createSurface();
  }

  onMouseDown(x, y) {
    this.brushDown = true;
    if (y >= this.systemData.height - 10) {
      if (x >= 2 && x <= 10) this.tool = 'pencil';
      if (x >= 14 && x <= 22) this.tool = 'eraser';
      return true;
    }
    this._applyBrush(x, y);
    return true;
  }

  onMouseUp() { this.brushDown = false; this.lastBrushX = null; this.lastBrushY = null; }

  onMouseMove(x, y) {
    if (!this.brushDown) return false;
    if (y < this.systemData.height - 10) this._applyBrush(x, y);
    return true;
  }

  _applyBrush(x, y) {
    const H = this.systemData.height;
    const W = this.systemData.width;
    if (x < 0 || y < 0 || x >= W || y >= H - 10) return;

    const applyPoint = (px, py) => {
      if (px < 0 || py < 0 || px >= W || py >= H - 10) return;
      if (this.tool === 'pencil') {
        this.canvas[py][px] = true;
      } else {
        for (let dy = -this.eraserRadius; dy <= this.eraserRadius; dy++) {
          for (let dx = -this.eraserRadius; dx <= this.eraserRadius; dx++) {
            const nx = px + dx, ny = py + dy;
            if (nx >= 0 && ny >= 0 && nx < W && ny < H - 10 &&
                dx * dx + dy * dy <= this.eraserRadius * this.eraserRadius) {
              this.canvas[ny][nx] = false;
            }
          }
        }
      }
    };

    if (this.lastBrushX == null) {
      applyPoint(x, y);
    } else {
      const dx = x - this.lastBrushX;
      const dy = y - this.lastBrushY;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      if (steps === 0) { applyPoint(x, y); }
      else {
        const sx = dx / steps, sy = dy / steps;
        let cx = this.lastBrushX, cy = this.lastBrushY;
        for (let i = 0; i <= steps; i++) {
          applyPoint(Math.round(cx), Math.round(cy));
          cx += sx; cy += sy;
        }
      }
    }
    this.lastBrushX = x;
    this.lastBrushY = y;
  }

  frame() {
    this.surface.clear();
    const H = this.systemData.height;
    const W = this.systemData.width;
    for (let y = 0; y < H - 10; y++) {
      for (let x = 0; x < W; x++) {
        if (this.canvas[y] && this.canvas[y][x]) this.surface.setPixel(y, x, true);
      }
    }
    const TY = H - 10;
    this.surface.drawLine(TY, 0, TY, W);
    if (this.tool === 'pencil') {
      this.surface.drawRect(TY + 1, 1, 8, 12, true);
    } else {
      this.surface.drawRect(TY + 1, 13, 8, 12, true);
    }
    this.surface.drawText('P', TY + 2, 3);
    this.surface.drawText('E', TY + 2, 15);
    return this.surface;
  }
}

export class DebuggerProgram extends Program {
  constructor(glyphSet) {
    super();
    this.glyphSet = glyphSet;
    this.systemData = {
      x: 30, y: 25, z: 0, width: 120, height: 60, title: 'Debugger',
    };
    this.surface = new Surface(this.systemData.height, this.systemData.width, glyphSet);
    this.debugInfo = null;
  }

  setSize(w, h) {
    this.systemData.width = w;
    this.systemData.height = h;
    this.surface = new Surface(h, w, this.glyphSet);
  }

  frame() {
    this.surface.clear();
    if (this.debugInfo) {
      this.surface.drawText(`Frame time: ${this.debugInfo.frameTime}ms`, 1, 1);
      this.surface.drawText(`Glyphs rendered: ${this.debugInfo.glyphsRendered}`, 9, 1);
      this.surface.drawText(`Lines rendered: ${this.debugInfo.linesRendered}`, 18, 1);
      this.surface.drawText(`Rects rendered: ${this.debugInfo.rectsRendered}`, 27, 1);
      this.surface.drawText(`Surface blits: ${this.debugInfo.surfaceBlits}`, 36, 1);
    }
    return this.surface;
  }

  processDebugInfo(debugInfo) {
    this.debugInfo = debugInfo;
  }
}
