import { parseOtb } from './otb';

/*
 * Builds a glyph atlas from the Bm437_ATI_9x16 bitmap font and pre-tints it into
 * N gradient buckets (+ white + dark) so the renderer can blit crisp, coloured
 * pixel glyphs with a single nearest-neighbour drawImage per cell — the same
 * "sample atlas, multiply by colour" approach the WebGPU source uses.
 */

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export async function loadBitmapFont(url, chars, gradFn, buckets = 32) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font ${url}`);
  const font = parseOtb(await res.arrayBuffer());

  const charIndex = new Map();
  const unique = [];
  for (const ch of chars) {
    if (charIndex.has(ch)) continue;
    charIndex.set(ch, unique.length);
    unique.push(ch);
  }

  // Read every glyph bitmap; size the tile to the actual glyph cell (left/top
  // aligned, tight monospace) rather than the font's ppem box.
  const glyphs = unique.map((ch) => {
    try {
      return font.readCodePoint(ch.codePointAt(0));
    } catch {
      return null;
    }
  });
  const cellW = Math.max(1, ...glyphs.map((g) => g?.width || 0));
  const cellH = Math.max(1, ...glyphs.map((g) => g?.height || 0));

  // Base atlas: one row of white glyphs (alpha = bitmap), transparent elsewhere.
  const atlasW = unique.length * cellW;
  const base = makeCanvas(atlasW, cellH);
  const bctx = base.getContext('2d');
  const img = bctx.createImageData(atlasW, cellH);
  glyphs.forEach((bmp, col) => {
    if (!bmp) return;
    for (let y = 0; y < bmp.height && y < cellH; y += 1) {
      for (let x = 0; x < bmp.width && x < cellW; x += 1) {
        const a = bmp.pixels[y * bmp.width + x];
        if (!a) continue;
        const px = col * cellW + x;
        const i = (y * atlasW + px) * 4;
        img.data[i] = 255;
        img.data[i + 1] = 255;
        img.data[i + 2] = 255;
        img.data[i + 3] = a;
      }
    }
  });
  bctx.putImageData(img, 0, 0);

  // Pre-tinted variants: gradient buckets, then white, then dark.
  const WHITE = buckets;
  const DARK = buckets + 1;
  const tints = [];
  const tint = (color) => {
    const c = makeCanvas(atlasW, cellH);
    const cx = c.getContext('2d');
    cx.fillStyle = color;
    cx.fillRect(0, 0, atlasW, cellH);
    cx.globalCompositeOperation = 'destination-in';
    cx.drawImage(base, 0, 0);
    return c;
  };
  for (let i = 0; i < buckets; i += 1) {
    const c = gradFn(i / buckets);
    tints.push(tint(`rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`));
  }
  tints.push(tint('#ffffff'));
  tints.push(tint('#03060d'));

  return {
    cellW,
    cellH,
    buckets,
    WHITE,
    DARK,
    has: (ch) => charIndex.has(ch),
    // blit one glyph from a tinted atlas into a destination rect
    draw(ctx, ch, bucketIdx, dx, dy, dw, dh) {
      const col = charIndex.get(ch);
      if (col === undefined) return;
      const src = tints[bucketIdx] || tints[WHITE];
      ctx.drawImage(src, col * cellW, 0, cellW, cellH, dx, dy, dw, dh);
    },
  };
}
