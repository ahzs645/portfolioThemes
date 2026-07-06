/**
 * Phonetic, approximate transliterators for Latin-alphabet tokens.
 *
 * toHangul was extracted from the Terishim (In Orbit) theme so other themes
 * can localize the CV owner's name the same way; toKatakana follows the same
 * spirit for Japanese. Both are letter-sound heuristics, not dictionaries —
 * "Ahmad Jalil" → "아흐마드 자릴" / "アフマド・ジャリル".
 */

/* ───── english → hangul transliterator (phonetic, approximate) ───── */
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

export function toHangul(token = '') {
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

/* ───── english → katakana transliterator (phonetic, approximate) ───── */
const K_VOWEL_POS = { a: 0, i: 1, u: 2, e: 3, o: 4 };
const K_TABLE = {
  '': ['ア', 'イ', 'ウ', 'エ', 'オ'],
  k: ['カ', 'キ', 'ク', 'ケ', 'コ'],
  g: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'],
  s: ['サ', 'シ', 'ス', 'セ', 'ソ'],
  sh: ['シャ', 'シ', 'シュ', 'シェ', 'ショ'],
  z: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'],
  j: ['ジャ', 'ジ', 'ジュ', 'ジェ', 'ジョ'],
  t: ['タ', 'ティ', 'トゥ', 'テ', 'ト'],
  ch: ['チャ', 'チ', 'チュ', 'チェ', 'チョ'],
  ts: ['ツァ', 'ツィ', 'ツ', 'ツェ', 'ツォ'],
  d: ['ダ', 'ディ', 'ドゥ', 'デ', 'ド'],
  n: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
  h: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
  f: ['ファ', 'フィ', 'フ', 'フェ', 'フォ'],
  b: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
  p: ['パ', 'ピ', 'プ', 'ペ', 'ポ'],
  m: ['マ', 'ミ', 'ム', 'メ', 'モ'],
  y: ['ヤ', 'イ', 'ユ', 'イェ', 'ヨ'],
  r: ['ラ', 'リ', 'ル', 'レ', 'ロ'],
  l: ['ラ', 'リ', 'ル', 'レ', 'ロ'],
  w: ['ワ', 'ウィ', 'ウ', 'ウェ', 'ウォ'],
  v: ['ヴァ', 'ヴィ', 'ヴ', 'ヴェ', 'ヴォ'],
  th: ['サ', 'シ', 'ス', 'セ', 'ソ'],
  ph: ['ファ', 'フィ', 'フ', 'フェ', 'フォ'],
};
const K_DIGRAPHS = ['ch', 'sh', 'ts', 'th', 'ph'];
const K_VOWELS = 'aeiou';

// Kana for a consonant with no following vowel — t/d prefer the o column
// (ト/ド), everything else the u column (ク, ス, ム, …).
function kCoda(cons) {
  const row = K_TABLE[cons];
  if (!row) return '';
  return cons === 't' || cons === 'd' ? row[4] : row[2];
}

export function toKatakana(token = '') {
  let s = String(token).toLowerCase().replace(/x/g, 'ks').replace(/q/g, 'k').replace(/[^a-z]/g, '');
  if (!s) return '';
  // Geminate consonants read as sokuon: "matteo" → マッテオ.
  s = s.replace(/([kstpbdgfjz])\1/g, 'Q$1').replace(/([hlmnrvwy])\1+/g, '$1');
  let out = '';
  let prevVowel = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === 'Q') {
      out += 'ッ';
      i += 1;
      continue;
    }
    if (K_VOWELS.includes(ch)) {
      // Repeated vowel sound stretches with a chōonpu: "aa" → アー.
      if (ch === prevVowel) out += 'ー';
      else out += K_TABLE[''][K_VOWEL_POS[ch]];
      prevVowel = ch;
      i += 1;
      continue;
    }
    prevVowel = '';
    const digraph = K_DIGRAPHS.includes(s.substr(i, 2)) ? s.substr(i, 2) : null;
    const cons = digraph || (K_TABLE[ch] ? ch : null);
    if (!cons) {
      i += 1;
      continue;
    }
    const next = s[i + cons.length] || '';
    if (next && K_VOWELS.includes(next)) {
      out += K_TABLE[cons][K_VOWEL_POS[next]];
      prevVowel = next;
      i += cons.length + 1;
    } else if (cons === 'n' || (cons === 'm' && next && 'bpm'.includes(next))) {
      out += 'ン';
      i += cons.length;
    } else {
      out += kCoda(cons);
      i += cons.length;
    }
  }
  return out;
}

// "Ahmad Jalil" → "아흐마드 자릴" — word-per-word Hangul, spaces preserved.
export function nameToHangul(name = '') {
  return String(name)
    .split(/\s+/)
    .map((w) => toHangul(w).hangul)
    .filter(Boolean)
    .join(' ');
}

// "Ahmad Jalil" → "アフマド・ジャリル" — words joined with the nakaguro
// separator conventionally used for Western names.
export function nameToKatakana(name = '') {
  return String(name)
    .split(/\s+/)
    .map((w) => toKatakana(w))
    .filter(Boolean)
    .join('・');
}
