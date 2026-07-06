import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import figlet from 'figlet';
import rectanglesFont from 'figlet/importable-fonts/Rectangles.js';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, formatDate, parseDateParts, isPresent } from '../../utils/cvHelpers';
import { nameToHangul, nameToKatakana } from '../../utils/transliterate';

// The source wordmark is figlet's "Rectangles" font; registering it here lets
// us typeset the CV owner's name in the exact same letterforms at runtime.
figlet.parseFont('Rectangles', rectanglesFont);

/**
 * YongseokTheme — a faithful CV-driven remake of yongseok.me.
 *
 * The source is a three-page blog. The HOME page is nothing but a top bar
 * (centered "장용석 블로그" wordmark; KO | EN | JA switch, ticking clock, and
 * "/ blog / about" links on the right) over a full-viewport dark panel — the
 * source's `home-cover-element`, ported verbatim from its recovered script:
 * a 60×200 DOM text grid of "/helloWorld <ECMAScript spec>" sentences pushed
 * through a spiral distortion each frame, an ASCII "Enter the Blog" wordmark
 * stamped into the centre row-by-row (each row garbled before settling),
 * radial "barcode" speed-lines on hover, an RGB-split textShadow glitch, and
 * a click that enters the blog. The BLOG page is a sidebar of
 * categories (#tag counts) and series beside a year-grouped post list of
 * titles + summaries. The ABOUT page opens "Hi! 👋 My name is … and I am a
 * … Based in …" and stacks Work Experience, Education, dated contribution
 * entries with [link] bullets, Presentations, and a "Let's Connect" footer.
 * All content is synthesized from CV.yaml: publications, presentations,
 * projects, and awards become the dated posts; experience and education
 * fill the about page.
 */

const light = {
  bg: '#fafafa',
  panel: '#ffffff',
  ink: '#18181b',
  muted: '#71717a',
  line: '#e4e4e7',
  barBg: 'rgba(250,250,250,0.85)',
  accent: '#4f46e5',
};

const dark = {
  bg: '#0b0b0f',
  panel: '#141419',
  ink: '#f4f4f5',
  muted: '#a1a1aa',
  line: '#26262c',
  barBg: 'rgba(11,11,15,0.85)',
  accent: '#a5b4fc',
};

// The hero panel is dark in both modes; rgb(9,3,44) is the source's :host bg.
const HERO_BG = 'rgb(9, 3, 44)';

const GlobalStyle = createGlobalStyle`
  body { background: ${(props) => props.theme.bg}; }
`;

const LOCALES = {
  EN: {
    brand: (name) => `${name}'s blog`,
    enter: 'Enter the Blog',
    blog: 'blog',
    about: 'about',
    top: 'back to top',
    all: 'all',
    categories: 'categories',
    series: 'series',
  },
  KO: {
    brand: (name) => `${name} 블로그`,
    enter: 'Enter the Blog',
    blog: 'blog',
    about: 'about',
    top: '위로 올라가요',
    all: '전체',
    categories: '카테고리',
    series: '시리즈',
  },
  JA: {
    brand: (name) => `${name}のブログ`,
    enter: 'Enter the Blog',
    blog: 'blog',
    about: 'about',
    top: '上に戻る',
    all: 'すべて',
    categories: 'カテゴリー',
    series: 'シリーズ',
  },
};

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString('en-GB', { hour12: false });
}

// Sortable integer for a CV date string; "present" floats to the top.
function dateSortKey(value) {
  const parts = parseDateParts(value);
  if (!parts) return -1;
  if (parts.present) return Number.MAX_SAFE_INTEGER;
  return parts.year * 100 + (parts.month || 0);
}

function yearOf(value) {
  const parts = parseDateParts(value);
  return parts?.present ? new Date().getFullYear() : parts?.year || null;
}

// "Jun2021" — the about page's compact date stamp.
function stampDate(value) {
  const text = formatDate(value, { month: 'short', fallback: '' });
  return text.replace(' ', '');
}

function stampRange(start, end, isCurrent) {
  const s = stampDate(start);
  const e = end == null || end === '' ? (isCurrent ? '' : '') : isPresent(end) ? '' : stampDate(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return `${s} -`;
  return e;
}

// ---------------------------------------------------------------------------
// home-cover-element, ported verbatim from the source's recovered
// index.astro script (a Lit component). Same grid, sentences, distortions,
// overlay timing, garble charset, barcode speed-lines, and glitch styling.
// ---------------------------------------------------------------------------

// Distortion library from the source; only 'spiral' is active (the element is
// mounted without a transforms attribute, so it keeps its default).
const TRANSFORMS = {
  spiral: ({ x, y, cx, cy, time }) => {
    const a = x - cx;
    const o = y - cy;
    const s = Math.sqrt(a ** 2 + o ** 2);
    const c = Math.atan2(o, a) - Math.sqrt(s) * time * 0.5;
    return [cx + Math.cos(c) * s, cy + Math.sin(c) * s];
  },
  wave: ({ x, y, time }) => [x, y + Math.sin(x * 10 + time * 2) * 0.05],
  zoom: ({ x, y, cx, cy, time }) => {
    const a = Math.sin(time) * 0.5 + 1;
    const o = x - cx;
    const s = y - cy;
    return [cx + o * a, cy + s * a];
  },
  shake: ({ x, y, time }) => [x + Math.sin(time * 10) * 0.1, y],
  rotate: ({ x, y, cx, cy, time }) => {
    const a = time * 0.1;
    const o = x - cx;
    const s = y - cy;
    return [cx + o * Math.cos(a) - s * Math.sin(a), cy + o * Math.sin(a) + s * Math.cos(a)];
  },
  hurricane: ({ x, y, cx, cy, time }) => {
    const a = time * 0.5;
    const o = x - cx;
    const s = y - cy;
    const c = Math.sqrt(o ** 2 + s ** 2);
    return [
      cx + o * Math.cos(a) - s * Math.sin(a) * c * 0.01,
      cy + o * Math.sin(a) + s * Math.cos(a) * c * 0.01,
    ];
  },
  celestialOrbit: ({ x, y, cx, cy, time }) => {
    const a = x - cx;
    const o = y - cy;
    const s = Math.sqrt(a ** 2 + o ** 2);
    const c = Math.atan2(o, a);
    const tau = 2 * Math.PI;
    const f = c + ((time * 1) % tau);
    return [cx + Math.cos(f) * s, cy + Math.sin(f) * (s * 0.6)];
  },
  fractalMotion: ({ x, y, cx, cy, time }) => {
    const a = x - cx;
    const o = y - cy;
    const s = Math.sqrt(a ** 2 + o ** 2);
    const c = Math.atan2(o, a);
    const l = Math.sin(time) * 0.5 + 1.5;
    const u = c + Math.sin(time * 0.5) * 2 * Math.PI;
    return [cx + Math.cos(u) * s * l, cy + Math.sin(u) * s * l];
  },
};

const ACTIVE_TRANSFORMS = ['spiral'];

// The source's ASCII "Enter the Blog" wordmark, verbatim — kept as the
// fallback if figlet can't typeset the CV name.
const OVERLAY_FALLBACK = [
  ' _____     _              _   _          _   _         ',
  '|   __|___| |_ ___ ___   | |_| |_ ___   | |_| |___ ___ ',
  '|   __|   |  _| -_|  _|  |  _|   | -_|  | . | | . | . |',
  '|_____|_|_|_| |___|_|    |_| |_|_|___|  |___|_|___|_  |',
  '                                                  |___|',
];

// Typeset text as an ASCII wordmark in the source's Rectangles figlet font.
function asciiWordmark(text) {
  try {
    const lines = figlet.textSync(text, { font: 'Rectangles' }).split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    if (lines.length) return lines;
  } catch {
    // Non-Latin or otherwise untypesettable names fall back to the source art.
  }
  return OVERLAY_FALLBACK;
}

// The source fills the field with "/helloWorld <ECMAScript spec overview>"
// lines — kept verbatim so the warping wall of text reads the same.
const FIELD_TEXT = `
/helloWorld This section contains a non-normative overview of the ECMAScript language.
/helloWorld ECMAScript is an object-oriented programming language for performing computations and manipulating computational objects within a host environment.
/helloWorld ECMAScript as defined here is not intended to be computationally self-sufficient; indeed, there are no provisions in this specification for input of external data or output of computed results.
/helloWorld Instead, it is expected that the computational environment of an ECMAScript program will provide not only the objects and other facilities described in this specification but also certain environment-specific objects, whose description and behaviour are beyond the scope of this specification except to indicate that they may provide certain properties that can be accessed and certain functions that can be called from an ECMAScript program.
/helloWorld ECMAScript was originally designed to be used as a scripting language, but has become widely used as a general-purpose programming language.
/helloWorld A scripting language is a programming language that is used to manipulate, customize, and automate the facilities of an existing system.
/helloWorld In such systems, useful functionality is already available through a user interface, and the scripting language is a mechanism for exposing that functionality to program control.
/helloWorld In this way, the existing system is said to provide a host environment of objects and facilities, which completes the capabilities of the scripting language.
/helloWorld A scripting language is intended for use by both professional and non-professional programmers.
/helloWorld ECMAScript was originally designed to be a Web scripting language, providing a mechanism to enliven Web pages in browsers and to perform server computation as part of a Web-based client-server architecture.
/helloWorld ECMAScript is now used to provide core scripting capabilities for a variety of host environments.
/helloWorld Therefore the core language is specified in this document apart from any particular host environment.
/helloWorld ECMAScript usage has moved beyond simple scripting and it is now used for the full spectrum of programming tasks in many different environments and scales.
/helloWorld As the usage of ECMAScript has expanded, so have the features and facilities it provides.
/helloWorld ECMAScript is now a fully featured general-purpose programming language.
`;

const COVER_ROWS = 60;
const COVER_COLS = 200;
const OVERLAY_DELAY = 4.5; // scaled seconds before the wordmark starts stamping
const OVERLAY_ROW_INTERVAL = 0.25; // one wordmark row lands every quarter second
const OVERLAY_GARBLE_WINDOW = 0.15; // each row shows garbage this long first
const GARBLE_CHARS = '|_-/\\[]{}#@$%&*!?~^+=<>';
const SPEEDLINE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * The warping text-grid hero. Renders COVER_ROWS plain-text row divs and
 * mutates their textContent directly each animation frame (like the source's
 * per-frame Lit re-render, without React reconciliation in the hot path).
 */
function HomeCover({ overlayArt, barcodeText, onEnter }) {
  const gridRef = useRef(null);
  const stateRef = useRef({ time: 0, hovering: false });

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    const state = stateRef.current;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const sentences = FIELD_TEXT.split(/[\n\r]/)
      .filter((l) => l.length > 0)
      .map((l) => `${l} `);

    const getCharAt = (x, y) => {
      const s = sentences[y % sentences.length];
      return s[Math.min(x, s.length - 1)] || ' ';
    };

    // 8-bit barcode of the site host, e.g. "yongseok.me" in the source.
    const barcode = [];
    for (const ch of barcodeText) {
      const n = ch.charCodeAt(0);
      for (let b = 7; b >= 0; b -= 1) barcode.push(!!((n >> b) & 1));
    }

    const rowEls = [];
    for (let r = 0; r < COVER_ROWS; r += 1) {
      const div = document.createElement('div');
      div.className = 'row';
      grid.appendChild(div);
      rowEls.push(div);
    }

    const transformer = (input) =>
      ACTIVE_TRANSFORMS.reduce(
        (acc, key) => TRANSFORMS[key]({ ...input, x: acc[0], y: acc[1] }),
        [input.x, input.y],
      );

    const overlayWidth = Math.max(...overlayArt.map((l) => l.length));
    const overlayHeight = overlayArt.length;

    function applyOverlay(cells, time) {
      const t = time - OVERLAY_DELAY;
      const left = Math.floor((COVER_COLS - overlayWidth) / 2);
      const top = Math.floor((COVER_ROWS - overlayHeight) / 2);
      for (let r = 0; r < overlayHeight; r += 1) {
        const rowStart = r * OVERLAY_ROW_INTERVAL;
        if (t < rowStart) break;
        const garbled = t - rowStart < OVERLAY_GARBLE_WINDOW;
        const line = overlayArt[r];
        for (let cIdx = 0; cIdx < line.length; cIdx += 1) {
          const ch = line[cIdx];
          const x = left + cIdx;
          const y = top + r;
          if (x < 0 || x >= COVER_COLS || y < 0 || y >= COVER_ROWS) continue;
          if (ch === ' ') cells[y][x] = ' ';
          else if (garbled) cells[y][x] = GARBLE_CHARS[Math.floor(Math.random() * GARBLE_CHARS.length)];
          else cells[y][x] = ch;
        }
      }
    }

    // Rotating radial sunburst whose spokes follow the barcode's 1-bits.
    function applySpeedLines(cells, time) {
      const cx = COVER_COLS / 2;
      const cy = COVER_ROWS / 2;
      const len = barcode.length;
      const spin = time * 0.15;
      for (let y = 0; y < COVER_ROWS; y += 1) {
        for (let x = 0; x < COVER_COLS; x += 1) {
          const dx = x - cx;
          const dy = (y - cy) * 1.7;
          if (dx === 0 && dy === 0) continue;
          const pos =
            ((((Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2)) + spin) / (Math.PI * 2)) * len;
          const idx = ((Math.floor(pos) % len) + len) % len;
          if (barcode[idx]) {
            const c =
              Math.abs(Math.floor(Math.sin(x * 0.3 + y * 0.7 + time) * 52)) % 52;
            cells[y][x] = SPEEDLINE_CHARS[c];
          }
        }
      }
    }

    function draw(time) {
      const cells = Array.from({ length: COVER_ROWS }, () => Array(COVER_COLS).fill(' '));
      for (let y = 0; y < COVER_ROWS; y += 1) {
        for (let x = 0; x < COVER_COLS; x += 1) {
          const [nx, ny] = transformer({
            x: x / COVER_COLS,
            y: y / COVER_ROWS,
            cx: 0.5,
            cy: 0.5,
            time,
          });
          const tx = Math.floor(nx * COVER_COLS);
          const ty = Math.floor(ny * COVER_ROWS);
          if (tx >= 0 && tx < COVER_COLS && ty >= 0 && ty < COVER_ROWS) {
            cells[ty][tx] = getCharAt(x, y);
          }
        }
      }
      if (time >= OVERLAY_DELAY) {
        if (state.hovering) applySpeedLines(cells, time);
        applyOverlay(cells, time);
      }
      for (let r = 0; r < COVER_ROWS; r += 1) {
        rowEls[r].textContent = cells[r].join('');
      }
    }

    let raf = 0;
    let begin = null;
    function frame(now) {
      if (begin === null) begin = now;
      // The source runs its clock at 1.5× real time.
      const time = ((now - begin) / 1000) * 1.5;
      state.time = time;
      draw(time);
      raf = requestAnimationFrame(frame);
    }

    if (reduce) {
      // One static frame with the wordmark fully stamped.
      state.time = OVERLAY_DELAY + overlayHeight * OVERLAY_ROW_INTERVAL + 1;
      draw(state.time);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      rowEls.forEach((el) => el.remove());
    };
  }, [overlayArt, barcodeText]);

  // Hover only counts inside the wordmark's padded bounding box, like the source.
  const handleMouseMove = (e) => {
    const state = stateRef.current;
    if (state.time < OVERLAY_DELAY) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const w = Math.max(...overlayArt.map((l) => l.length));
    const h = overlayArt.length;
    const pad = 0.03;
    const left = (COVER_COLS - w) / 2 / COVER_COLS - pad;
    const right = left + w / COVER_COLS + pad * 2;
    const top = (COVER_ROWS - h) / 2 / COVER_ROWS - pad;
    const bottom = top + h / COVER_ROWS + pad * 2;
    stateRef.current.hovering = nx >= left && nx <= right && ny >= top && ny <= bottom;
    e.currentTarget.style.cursor = stateRef.current.hovering ? 'pointer' : '';
  };

  const handleMouseLeave = (e) => {
    stateRef.current.hovering = false;
    e.currentTarget.style.cursor = '';
  };

  const handleClick = () => {
    if (stateRef.current.time >= OVERLAY_DELAY) onEnter();
  };

  return (
    <CoverHost>
      <CoverGrid
        ref={gridRef}
        role="button"
        tabIndex={0}
        aria-label="Enter the blog"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
      >
        <div className="glass" aria-hidden="true" />
      </CoverGrid>
    </CoverHost>
  );
}

export function YongseokTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? dark : light;
  const [locale, setLocale] = useState('KO');
  const [page, setPage] = useState('home');
  const t = LOCALES[locale];
  const clock = useClock();
  const scrollRef = useRef(null);

  const name = cv.name || 'Your Name';
  const role = cv.currentJobTitle || cv.headline || '';
  const email = cv.email || null;
  const socials = cv.social || [];

  const experience = cv.experience || [];
  const education = cv.education || [];
  const projects = cv.projects || [];
  const publications = cv.publications || [];
  const presentations = cv.presentations || [];
  const awards = cv.awards || [];

  const goTo = (target) => (e) => {
    e.preventDefault();
    setPage(target);
    scrollRef.current?.scrollTo?.({ top: 0 });
  };

  // The cover wordmark is the CV owner's name, typeset in the source's
  // Rectangles figlet font (like In Orbit, the hero is name-driven).
  const overlayArt = useMemo(() => asciiWordmark(name), [name]);

  // The brand follows the locale like the source's "장용석 블로그": the name
  // itself is transliterated — Hangul for KO, katakana for JA.
  const localizedName = useMemo(
    () => ({
      EN: name,
      KO: nameToHangul(name) || name,
      JA: nameToKatakana(name) || name,
    }),
    [name],
  );
  const brand = t.brand(localizedName[locale]);

  // --- Blog page data ---------------------------------------------------------
  // The CV has no blog posts, so publications, presentations, projects, and
  // awards become the dated entries, tagged like the source's #categories.
  const posts = useMemo(() => {
    const items = [];
    publications.forEach((p, i) => {
      const title = p.title || p.name;
      if (!title) return;
      items.push({
        key: `pub-${i}`,
        tag: 'paper',
        title,
        summary: [p.journal, p.date].filter(Boolean).join(', '),
        url: p.doi ? `https://doi.org/${p.doi}` : p.url || null,
        sort: dateSortKey(p.date),
        year: yearOf(p.date),
      });
    });
    presentations.forEach((p, i) => {
      if (!p?.name) return;
      items.push({
        key: `pres-${i}`,
        tag: 'talk',
        title: p.name,
        summary: [p.summary, p.location].filter(Boolean).join(' — '),
        url: p.url || null,
        sort: dateSortKey(p.date),
        year: yearOf(p.date),
      });
    });
    projects.forEach((p, i) => {
      if (!p?.name) return;
      items.push({
        key: `proj-${i}`,
        tag: 'project',
        title: p.name,
        summary: p.summary || '',
        url: p.url || null,
        sort: dateSortKey(p.date),
        year: yearOf(p.date),
      });
    });
    awards.forEach((a, i) => {
      if (!a?.name) return;
      items.push({
        key: `award-${i}`,
        tag: 'award',
        title: a.name,
        summary: a.summary || '',
        url: null,
        sort: dateSortKey(a.date),
        year: yearOf(a.date),
      });
    });
    return items.filter((p) => p.year).sort((a, b) => b.sort - a.sort);
  }, [publications, presentations, projects, awards]);

  const [activeTag, setActiveTag] = useState(null);

  const tagCounts = useMemo(() => {
    const counts = new Map();
    posts.forEach((p) => counts.set(p.tag, (counts.get(p.tag) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  // Series — companies with several positions, like the source's post series.
  const series = useMemo(() => {
    const byCompany = new Map();
    experience.forEach((e) => {
      if (!e.company) return;
      if (!byCompany.has(e.company)) byCompany.set(e.company, []);
      byCompany.get(e.company).push(e.title);
    });
    return [...byCompany.entries()].filter(([, titles]) => titles.length > 1);
  }, [experience]);

  const visiblePosts = activeTag ? posts.filter((p) => p.tag === activeTag) : posts;

  const postYears = useMemo(() => {
    const years = [];
    visiblePosts.forEach((p) => {
      if (!years.includes(p.year)) years.push(p.year);
    });
    return years;
  }, [visiblePosts]);

  const scrollTop = () => {
    scrollRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const footer = (
    <Footer>
      <button type="button" className="top" onClick={scrollTop}>
        ▲ {t.top}
      </button>
      <button type="button" className="mode" onClick={() => onDarkModeChange?.(!darkMode)}>
        {darkMode ? '☀' : '☾'}
      </button>
      <span className="copy">
        © {new Date().getFullYear()} |{' '}
        {locale === 'EN' ? t.brand(name.toLowerCase()) : brand}
      </span>
    </Footer>
  );

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page ref={scrollRef}>
        <Bar>
          <span />
          <BrandLink href="#home" onClick={goTo('home')}>
            {brand}
          </BrandLink>
          <BarRight>
            <Langs>
              {['KO', 'EN', 'JA'].map((l, i) => (
                <React.Fragment key={l}>
                  {i > 0 && <span className="sep">|</span>}
                  <button
                    type="button"
                    className={l === locale ? 'active' : ''}
                    onClick={() => setLocale(l)}
                  >
                    {l}
                  </button>
                </React.Fragment>
              ))}
            </Langs>
            <Clock>{clock}</Clock>
            <NavLinks>
              <a href="#blog" onClick={goTo('blog')}>/ {t.blog}</a>
              <a href="#about" onClick={goTo('about')}>/ {t.about}</a>
            </NavLinks>
          </BarRight>
        </Bar>

        {page === 'home' && (
          <>
            <Hero>
              <HomeCover
                overlayArt={overlayArt}
                barcodeText={
                  (cv.website || '').replace(/^https?:\/\//i, '').replace(/\/.*$/, '') ||
                  name.toLowerCase().replace(/\s+/g, '')
                }
                onEnter={() => {
                  setPage('blog');
                  scrollRef.current?.scrollTo?.({ top: 0 });
                }}
              />
            </Hero>
            <HomeFooter>{footer}</HomeFooter>
          </>
        )}

        {page === 'blog' && (
          <BlogLayout>
            <Sidebar>
              <SideGroup>
                <SideLabel>{t.categories}</SideLabel>
                <SideList>
                  <li>
                    <button
                      type="button"
                      className={activeTag === null ? 'active' : ''}
                      onClick={() => setActiveTag(null)}
                    >
                      {t.all}
                    </button>
                  </li>
                  {tagCounts.map(([tag, count]) => (
                    <li key={tag}>
                      <button
                        type="button"
                        className={activeTag === tag ? 'active' : ''}
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      >
                        #{tag} <em>{count}</em>
                      </button>
                    </li>
                  ))}
                </SideList>
              </SideGroup>

              {series.length > 0 && (
                <SideGroup>
                  <SideLabel>{t.series}</SideLabel>
                  {series.map(([company, titles]) => (
                    <SeriesBlock key={company}>
                      <strong>
                        {company} ({titles.length})
                      </strong>
                      <ul>
                        {titles.map((title, i) => (
                          <li key={`${company}-${i}`}>{title}</li>
                        ))}
                      </ul>
                    </SeriesBlock>
                  ))}
                </SideGroup>
              )}
            </Sidebar>

            <PostColumn>
              {postYears.map((year) => (
                <React.Fragment key={year}>
                  <YearHeading>{year}</YearHeading>
                  {visiblePosts
                    .filter((p) => p.year === year)
                    .map((p) => (
                      <Post key={p.key}>
                        {p.url ? (
                          <PostTitle as="a" href={p.url} target="_blank" rel="noopener noreferrer">
                            {p.title}
                          </PostTitle>
                        ) : (
                          <PostTitle>{p.title}</PostTitle>
                        )}
                        {p.summary && <PostSummary>{p.summary}</PostSummary>}
                        <PostTag>#{p.tag}</PostTag>
                      </Post>
                    ))}
                </React.Fragment>
              ))}
              {footer}
            </PostColumn>
          </BlogLayout>
        )}

        {page === 'about' && (
          <AboutColumn>
            <Para>
              Hi! 👋 My name is <strong>{name}</strong>
              {role ? ` and I am a ${role.toLowerCase()}` : ''}.
              {cv.location ? ` Based in ${cv.location}.` : ''}
            </Para>

            {experience.length > 0 && (
              <AboutSection>
                <AboutHeading>Work Experience</AboutHeading>
                {experience.map((e, i) => (
                  <StampRow key={`e-${i}`}>
                    <Stamp>{stampRange(e.startDate, e.endDate, e.isCurrent)}</Stamp>
                    <div>
                      <strong>{e.company}</strong>
                      <RowMeta>{e.title}</RowMeta>
                    </div>
                  </StampRow>
                ))}
              </AboutSection>
            )}

            {education.length > 0 && (
              <AboutSection>
                <AboutHeading>Education</AboutHeading>
                {education.map((edu, i) => (
                  <StampRow key={`edu-${i}`}>
                    <Stamp>
                      {stampRange(edu.start_date, edu.end_date, isPresent(edu.end_date))}
                    </Stamp>
                    <div>
                      <strong>{edu.institution}</strong>
                      <RowMeta>
                        {[edu.degree, edu.area].filter(Boolean).join(', ')}
                      </RowMeta>
                    </div>
                  </StampRow>
                ))}
              </AboutSection>
            )}

            {projects.length > 0 && (
              <AboutSection>
                <AboutHeading>Projects</AboutHeading>
                {projects.map((p, i) => (
                  <StampRow key={`p-${i}`} $top>
                    <Stamp>{p.date}</Stamp>
                    <div>
                      <strong>
                        {p.name}
                        {p.url && (
                          <>
                            {' '}
                            <a href={p.url} target="_blank" rel="noopener noreferrer">
                              [link]
                            </a>
                          </>
                        )}
                      </strong>
                      <Bullets>
                        {p.summary && <li>{p.summary}</li>}
                        {(p.highlights || []).map((h, j) => (
                          <li key={j}>{h}</li>
                        ))}
                      </Bullets>
                    </div>
                  </StampRow>
                ))}
              </AboutSection>
            )}

            {presentations.length > 0 && (
              <AboutSection>
                <AboutHeading>Presentations</AboutHeading>
                {presentations.map((p, i) => (
                  <StampRow key={`pr-${i}`} $top>
                    <Stamp>{p.date}</Stamp>
                    <div>
                      <strong>{p.name}</strong>
                      <RowMeta>
                        {[p.summary, p.location].filter(Boolean).join(' — ')}
                      </RowMeta>
                    </div>
                  </StampRow>
                ))}
              </AboutSection>
            )}

            {(email || socials.length > 0) && (
              <AboutSection>
                <AboutHeading>Let&apos;s Connect</AboutHeading>
                <Para>
                  If you want to talk about research, tooling, or anything else,
                  reach out any time.
                </Para>
                <ConnectList>
                  {email && (
                    <li>
                      <a href={`mailto:${email}`}>{email}</a>
                    </li>
                  )}
                  {socials
                    .filter((s) => s?.url)
                    .map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {String(s.network || 'link').toLowerCase()}
                        </a>
                      </li>
                    ))}
                </ConnectList>
              </AboutSection>
            )}

            {footer}
          </AboutColumn>
        )}
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  height: 100%;
  overflow-y: auto;
  background: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.ink};
  font-family: 'Atkinson Hyperlegible', 'Inter', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
`;

// Source top bar: empty left, the wordmark dead-centre, controls right.
// The Page is its own scroll container (it already starts below the app
// bar), so the bar sticks to the very top — no app offset, which would
// double-count and float the bar mid-page.
const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: ${(props) => props.theme.barBg};
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${(props) => props.theme.line};
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;

  @media (max-width: 640px) {
    grid-template-columns: auto 1fr;
    & > span:first-child {
      display: none;
    }
  }
`;

const BrandLink = styled.a`
  color: ${(props) => props.theme.ink};
  text-decoration: none;
  font-weight: 500;
  justify-self: center;

  @media (max-width: 640px) {
    justify-self: start;
  }
`;

const BarRight = styled.div`
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Langs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${(props) => props.theme.muted};

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: ${(props) => props.theme.muted};
    font: inherit;
    &.active {
      color: ${(props) => props.theme.ink};
      font-weight: 700;
    }
  }
  .sep {
    opacity: 0.5;
  }
`;

const Clock = styled.span`
  color: ${(props) => props.theme.muted};
  font-variant-numeric: tabular-nums;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 0.75rem;
  a {
    color: ${(props) => props.theme.ink};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

// The home page is nothing but the cover panel (minus bar and footer).
const Hero = styled.div`
  position: relative;
  height: calc(100dvh - var(--app-top-offset, 0px) - 8.75rem);
  min-height: 320px;
  margin: 1rem 1.25rem 0;
  border-radius: 0.5rem;
  background: ${HERO_BG};
  overflow: hidden;
`;

// The source's :host styles: centered JetBrains Mono grid on deep navy.
const CoverHost = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-optical-sizing: auto;
  background-color: ${HERO_BG};
  color: rgb(96, 124, 198);
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

// The source's RGB-split glitch, keyframe values copied verbatim.
const textShadowGlitch = keyframes`
  0% { text-shadow: 0.4389924193300864px 0 1px rgba(0,30,255,0.5), -0.4389924193300864px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  5% { text-shadow: 2.7928974010788217px 0 1px rgba(0,30,255,0.5), -2.7928974010788217px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  10% { text-shadow: 0.02956275843481219px 0 1px rgba(0,30,255,0.5), -0.02956275843481219px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  15% { text-shadow: 0.40218538552878136px 0 1px rgba(0,30,255,0.5), -0.40218538552878136px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  20% { text-shadow: 3.4794037899852017px 0 1px rgba(0,30,255,0.5), -3.4794037899852017px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  25% { text-shadow: 1.6125630401149584px 0 1px rgba(0,30,255,0.5), -1.6125630401149584px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  30% { text-shadow: 0.7015590085143956px 0 1px rgba(0,30,255,0.5), -0.7015590085143956px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  35% { text-shadow: 3.896914047650351px 0 1px rgba(0,30,255,0.5), -3.896914047650351px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  40% { text-shadow: 3.870905614848819px 0 1px rgba(0,30,255,0.5), -3.870905614848819px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  45% { text-shadow: 2.231056963361899px 0 1px rgba(0,30,255,0.5), -2.231056963361899px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  50% { text-shadow: 0.08084290417898504px 0 1px rgba(0,30,255,0.5), -0.08084290417898504px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  55% { text-shadow: 2.3758461067427543px 0 1px rgba(0,30,255,0.5), -2.3758461067427543px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  60% { text-shadow: 2.202193051050636px 0 1px rgba(0,30,255,0.5), -2.202193051050636px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  65% { text-shadow: 2.8638780614874975px 0 1px rgba(0,30,255,0.5), -2.8638780614874975px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  70% { text-shadow: 0.48874025155497314px 0 1px rgba(0,30,255,0.5), -0.48874025155497314px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  75% { text-shadow: 1.8948491305757957px 0 1px rgba(0,30,255,0.5), -1.8948491305757957px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  80% { text-shadow: 0.0833037308038857px 0 1px rgba(0,30,255,0.5), -0.0833037308038857px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  85% { text-shadow: 0.09769827255241735px 0 1px rgba(0,30,255,0.5), -0.09769827255241735px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  90% { text-shadow: 3.443339761481782px 0 1px rgba(0,30,255,0.5), -3.443339761481782px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  95% { text-shadow: 2.1841838852799786px 0 1px rgba(0,30,255,0.5), -2.1841838852799786px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  100% { text-shadow: 2.6208764473832513px 0 1px rgba(0,30,255,0.5), -2.6208764473832513px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
`;

// #text-grid + .glass + .row from the source component.
const CoverGrid = styled.div`
  font-size: 20px;
  transform: translate(0);
  display: flex;
  flex-direction: column;
  animation: ${textShadowGlitch} 1s infinite;
  outline: none;

  @media (max-width: 768px) {
    zoom: 0.6;
  }

  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 0.5rem;
    padding: 1rem;
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    opacity: 0.3;
  }

  .row {
    line-height: 20px;
    display: inline-block;
    white-space: pre;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const HomeFooter = styled.div`
  max-width: none;
  margin: 0 1.25rem;
  padding: 0.75rem 0 1.25rem;
`;

// --- Blog page ---------------------------------------------------------------
const BlogLayout = styled.div`
  display: grid;
  grid-template-columns: 15rem 1fr;
  gap: 3rem;
  max-width: 64rem;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Sidebar = styled.aside`
  font-size: 0.9rem;
`;

const SideGroup = styled.div`
  margin-bottom: 2rem;
`;

const SideLabel = styled.h2`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: ${(props) => props.theme.muted};
  margin: 0 0 0.75rem;
`;

const SideList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    margin: 0.2rem 0;
  }

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
    color: ${(props) => props.theme.ink};

    em {
      font-style: normal;
      color: ${(props) => props.theme.muted};
    }

    &:hover,
    &.active {
      color: ${(props) => props.theme.accent};
    }
  }
`;

const SeriesBlock = styled.div`
  margin-bottom: 1rem;

  strong {
    font-weight: 600;
  }

  ul {
    list-style: none;
    margin: 0.3rem 0 0;
    padding-left: 0.9rem;
    border-left: 2px solid ${(props) => props.theme.line};
    color: ${(props) => props.theme.muted};
  }

  li {
    margin: 0.2rem 0;
    font-size: 0.85rem;
  }
`;

const PostColumn = styled.div`
  min-width: 0;
`;

const YearHeading = styled.h2`
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.muted};
  margin: 0 0 0.5rem;

  ${PostColumn} &:not(:first-child) {
    margin-top: 2.5rem;
  }
`;

const Post = styled.article`
  padding: 0.9rem 0;
  border-top: 1px solid ${(props) => props.theme.line};
`;

const PostTitle = styled.h3`
  margin: 0 0 0.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${(props) => props.theme.ink};
  text-decoration: none;
  display: block;

  &[href]:hover {
    color: ${(props) => props.theme.accent};
    text-decoration: underline;
  }
`;

const PostSummary = styled.p`
  margin: 0 0 0.35rem;
  color: ${(props) => props.theme.muted};
  font-size: 0.95rem;
`;

const PostTag = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: ${(props) => props.theme.accent};
`;

// --- About page ----------------------------------------------------------------
const AboutColumn = styled.main`
  max-width: 46rem;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
`;

const Para = styled.p`
  margin: 0 0 1.5rem;
`;

const AboutSection = styled.section`
  margin-bottom: 2.5rem;
`;

const AboutHeading = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 1rem;
`;

const StampRow = styled.div`
  display: grid;
  grid-template-columns: 8.5rem 1fr;
  gap: 1rem;
  padding: 0.55rem 0;
  align-items: ${(props) => (props.$top ? 'start' : 'baseline')};

  strong {
    font-weight: 600;
  }

  a {
    color: ${(props) => props.theme.accent};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.1rem;
  }
`;

const Stamp = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: ${(props) => props.theme.muted};
  white-space: nowrap;
`;

const RowMeta = styled.div`
  color: ${(props) => props.theme.muted};
  font-size: 0.95rem;
`;

const Bullets = styled.ul`
  list-style: none;
  margin: 0.25rem 0 0;
  padding: 0;
  color: ${(props) => props.theme.muted};
  font-size: 0.95rem;

  li {
    margin: 0.15rem 0;
    padding-left: 1rem;
    text-indent: -1rem;

    &::before {
      content: '• ';
    }
  }
`;

const ConnectList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    margin: 0.25rem 0;
  }

  a {
    color: ${(props) => props.theme.accent};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${(props) => props.theme.line};
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: ${(props) => props.theme.muted};

  button {
    background: none;
    border: 1px solid ${(props) => props.theme.line};
    border-radius: 6px;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    color: ${(props) => props.theme.ink};
    font: inherit;
    &:hover {
      border-color: ${(props) => props.theme.accent};
      color: ${(props) => props.theme.accent};
    }
  }
  .copy {
    margin-left: auto;
  }
`;
