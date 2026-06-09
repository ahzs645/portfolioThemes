/*
 * Minimal OpenType-Bitmap (.otb) reader — ported from vibe-coded.com's own
 * loader so we render the exact Bm437_ATI_9x16 oldschool PC font it uses.
 * Parses the sfnt table directory, a format-4 cmap, and the EBLC/EBDT embedded
 * bitmap strike to return per-glyph 1-bpp bitmaps.
 *
 * Bitmap fonts © VileR — The Ultimate Oldschool PC Font Pack (CC BY-SA 4.0):
 * https://int10h.org/oldschool-pc-fonts/
 */

function tag(view, off) {
  return String.fromCharCode(
    view.getUint8(off),
    view.getUint8(off + 1),
    view.getUint8(off + 2),
    view.getUint8(off + 3),
  );
}

function readTableDirectory(view) {
  const num = view.getUint16(4);
  const tables = new Map();
  for (let i = 0; i < num; i += 1) {
    const rec = 12 + i * 16;
    tables.set(tag(view, rec), {
      offset: view.getUint32(rec + 8),
      length: view.getUint32(rec + 12),
    });
  }
  return tables;
}

function requireTable(tables, name) {
  const t = tables.get(name);
  if (!t) throw new Error(`Missing required font table "${name}"`);
  return t;
}

// Parse a format-4 cmap subtable into its segment list.
function parseCmap(view, cmapOffset) {
  const numSub = view.getUint16(cmapOffset + 2);
  let sub = -1;
  for (let i = 0; i < numSub; i += 1) {
    const rec = cmapOffset + 4 + i * 8;
    const platform = view.getUint16(rec);
    const encoding = view.getUint16(rec + 2);
    const off = cmapOffset + view.getUint32(rec + 4);
    if (view.getUint16(off) === 4) {
      if (platform === 3 && encoding === 1) {
        sub = off;
        break;
      }
      if (sub < 0) sub = off;
    }
  }
  if (sub < 0) throw new Error('Font does not contain a usable format 4 cmap');
  const segCountX2 = view.getUint16(sub + 6);
  const segCount = segCountX2 / 2;
  const endBase = sub + 14;
  const startBase = endBase + segCount * 2 + 2;
  const deltaBase = startBase + segCount * 2;
  const rangeBase = deltaBase + segCount * 2;
  const segments = [];
  for (let i = 0; i < segCount; i += 1) {
    segments.push({
      endCode: view.getUint16(endBase + i * 2),
      startCode: view.getUint16(startBase + i * 2),
      idDelta: view.getInt16(deltaBase + i * 2),
      idRangeOffset: view.getUint16(rangeBase + i * 2),
      idRangeOffsetAddress: rangeBase + i * 2,
    });
  }
  return segments;
}

function codeToGlyph(view, segments, code) {
  if (code > 65535) return 0;
  for (const s of segments) {
    if (code < s.startCode || code > s.endCode) continue;
    if (s.idRangeOffset === 0) return (code + s.idDelta) & 65535;
    const addr = s.idRangeOffsetAddress + s.idRangeOffset + (code - s.startCode) * 2;
    const g = view.getUint16(addr);
    return g === 0 ? 0 : (g + s.idDelta) & 65535;
  }
  return 0;
}

function smallMetrics(view, off) {
  return {
    height: view.getUint8(off),
    width: view.getUint8(off + 1),
    horiBearingX: view.getInt8(off + 2),
    horiBearingY: view.getInt8(off + 3),
    horiAdvance: view.getUint8(off + 4),
  };
}
function bigMetrics(view, off) {
  return {
    height: view.getUint8(off),
    width: view.getUint8(off + 1),
    horiBearingX: view.getInt8(off + 2),
    horiBearingY: view.getInt8(off + 3),
    horiAdvance: view.getUint8(off + 4),
  };
}

// Continuous bit stream (bit-aligned) -> 0/255 per pixel.
function bitAligned(bytes, off, w, h) {
  const out = new Uint8Array(w * h);
  for (let n = 0; n < w * h; n += 1) {
    const byte = bytes[off + (n >> 3)] ?? 0;
    const mask = 128 >> (n & 7);
    out[n] = (byte & mask) !== 0 ? 255 : 0;
  }
  return out;
}
// Row-aligned (each row padded to a byte) -> 0/255 per pixel.
function byteAligned(bytes, off, w, h) {
  const out = new Uint8Array(w * h);
  const rowBytes = Math.ceil(w / 8);
  for (let y = 0; y < h; y += 1) {
    const rowOff = off + y * rowBytes;
    for (let x = 0; x < w; x += 1) {
      const byte = bytes[rowOff + (x >> 3)] ?? 0;
      const mask = 128 >> (x & 7);
      out[y * w + x] = (byte & mask) !== 0 ? 255 : 0;
    }
  }
  return out;
}

function readBitmap(bytes, off, imageFormat, shared) {
  let metrics;
  let dataOff = off;
  let rowAligned = false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  switch (imageFormat) {
    case 1:
      metrics = smallMetrics(view, off);
      dataOff += 5;
      rowAligned = true;
      break;
    case 2:
      metrics = smallMetrics(view, off);
      dataOff += 5;
      break;
    case 5:
      if (!shared) throw new Error('Image format 5 requires shared glyph metrics');
      metrics = shared;
      break;
    case 6:
      metrics = bigMetrics(view, off);
      dataOff += 8;
      rowAligned = true;
      break;
    case 7:
      metrics = bigMetrics(view, off);
      dataOff += 8;
      break;
    default:
      throw new Error(`Unsupported embedded bitmap image format ${imageFormat}`);
  }
  if (metrics.width === 0 || metrics.height === 0) return null;
  const pixels = rowAligned
    ? byteAligned(bytes, dataOff, metrics.width, metrics.height)
    : bitAligned(bytes, dataOff, metrics.width, metrics.height);
  return { width: metrics.width, height: metrics.height, pixels };
}

// Parse EBLC: pick the strike with the most glyph coverage.
function parseStrike(view, eblcOffset, ebdtOffset) {
  const numSizes = view.getUint32(eblcOffset + 4);
  let best = null;
  let bestArea = -1;
  for (let i = 0; i < numSizes; i += 1) {
    const sizeRec = eblcOffset + 8 + i * 48;
    const arrayOffset = view.getUint32(sizeRec);
    const numSubTables = view.getUint32(sizeRec + 8);
    const ppemX = view.getUint8(sizeRec + 44);
    const ppemY = view.getUint8(sizeRec + 45);
    const arrayBase = eblcOffset + arrayOffset;
    const subtables = [];
    for (let s = 0; s < numSubTables; s += 1) {
      const entry = arrayBase + s * 8;
      const firstGlyph = view.getUint16(entry);
      const lastGlyph = view.getUint16(entry + 2);
      const addOffset = view.getUint32(entry + 4);
      const header = arrayBase + addOffset;
      const indexFormat = view.getUint16(header);
      const imageFormat = view.getUint16(header + 2);
      const imageDataOffset = view.getUint32(header + 4);
      if (indexFormat === 1) {
        const count = lastGlyph - firstGlyph + 2;
        const offsets = [];
        for (let k = 0; k < count; k += 1) offsets.push(view.getUint32(header + 8 + k * 4));
        subtables.push({
          kind: 'offset-array',
          firstGlyph,
          lastGlyph,
          imageFormat,
          imageDataOffset: ebdtOffset + imageDataOffset,
          offsets,
        });
      } else if (indexFormat === 2) {
        const imageSize = view.getUint32(header + 8);
        const metrics = bigMetrics(view, header + 12);
        subtables.push({
          kind: 'fixed-size',
          firstGlyph,
          lastGlyph,
          imageFormat,
          imageDataOffset: ebdtOffset + imageDataOffset,
          imageSize,
          metrics,
        });
      } else {
        throw new Error(`Unsupported embedded bitmap index format ${indexFormat}`);
      }
    }
    const area = ppemX * ppemY;
    if (area > bestArea) {
      bestArea = area;
      best = { cellWidth: Math.max(1, ppemX), cellHeight: Math.max(1, ppemY), subtables };
    }
  }
  if (!best) throw new Error('Font does not contain a usable embedded bitmap strike');
  return best;
}

function readGlyphBitmap(bytes, strike, glyphId) {
  for (const s of strike.subtables) {
    if (glyphId < s.firstGlyph || glyphId > s.lastGlyph) continue;
    if (s.kind === 'fixed-size') {
      const addr = s.imageDataOffset + (glyphId - s.firstGlyph) * s.imageSize;
      return readBitmap(bytes, addr, s.imageFormat, s.metrics);
    }
    const idx = glyphId - s.firstGlyph;
    const off = s.imageDataOffset + s.offsets[idx];
    if (s.imageDataOffset + s.offsets[idx + 1] <= off) return null;
    return readBitmap(bytes, off, s.imageFormat);
  }
  return null;
}

export function parseOtb(buffer) {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const tables = readTableDirectory(view);
  const segments = parseCmap(view, requireTable(tables, 'cmap').offset);
  const strike = parseStrike(view, requireTable(tables, 'EBLC').offset, requireTable(tables, 'EBDT').offset);
  return {
    cellWidth: strike.cellWidth,
    cellHeight: strike.cellHeight,
    readCodePoint(codePoint) {
      const g = codeToGlyph(view, segments, codePoint);
      return g === 0 ? null : readGlyphBitmap(bytes, strike, g);
    },
  };
}
