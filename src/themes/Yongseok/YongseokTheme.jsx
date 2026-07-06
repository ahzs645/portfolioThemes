import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, formatDate, parseDateParts, isPresent } from '../../utils/cvHelpers';

/**
 * YongseokTheme — a faithful CV-driven remake of yongseok.me.
 *
 * The source is a three-page blog. The HOME page is nothing but a top bar
 * (centered "장용석 블로그" wordmark; KO | EN | JA switch, ticking clock, and
 * "/ blog / about" links on the right) over a full-viewport dark panel of
 * warping monospace glyphs with a boxed ASCII "Enter the Blog" wordmark at
 * its centre — clicking it enters the blog. The BLOG page is a sidebar of
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

// The hero panel is dark in both modes (like the source), so its palette is fixed.
const HERO_BG = '#0c1024';

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

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌ0123456789<>[]{}/\\=+*-abcdef';

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

/**
 * Geometric distortions ported from the source's index.astro script. Each takes
 * a NORMALIZED (0..1) coordinate and a centre (cx,cy) and returns a displaced
 * normalized coordinate. The hero passes every glyph's grid position through the
 * active distortion each frame, so the whole field ripples and swirls.
 */
const DISTORTIONS = [
  // wave — a vertical ripple travelling across the field
  (x, y, cx, cy, time) => [x, y + Math.sin(x * 10 + time * 2) * 0.05],
  // spiral — rotate each point about the centre by an angle that grows with radius
  (x, y, cx, cy, time) => {
    const a = x - cx;
    const o = y - cy;
    const s = Math.sqrt(a * a + o * o);
    const c = Math.atan2(o, a) - Math.sqrt(s) * time * 0.5;
    return [cx + Math.cos(c) * s, cy + Math.sin(c) * s];
  },
  // zoom — a pulsing scale in and out from the centre
  (x, y, cx, cy, time) => {
    const a = Math.sin(time) * 0.5 + 1;
    const o = x - cx;
    const s = y - cy;
    return [cx + o * a, cy + s * a];
  },
  // hurricane — a swirling shear whose strength grows with distance
  (x, y, cx, cy, time) => {
    const a = time * 0.5;
    const o = x - cx;
    const s = y - cy;
    const c = Math.sqrt(o * o + s * s);
    return [
      cx + o * Math.cos(a) - s * Math.sin(a) * c * 0.01,
      cy + o * Math.sin(a) + s * Math.cos(a) * c * 0.01,
    ];
  },
];

const CYCLE_SEC = 7; // hold each distortion this long before cross-fading
const BLEND_SEC = 1.4; // cross-fade into the next distortion over this long
const BRIGHT_COLOR = 'rgba(214,226,255,0.98)';

/**
 * A warping field of monospace glyphs confined to the hero canvas. A grid of
 * mono cells fills the panel; every frame each cell's base position is pushed
 * through the active distortion and the glyph is drawn at the displaced spot —
 * the field undulates and swirls instead of falling.
 */
function AsciiWarp({ name }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const fontSize = 15;
    const cellW = fontSize * 0.62; // monospace advance width
    const cellH = fontSize * 1.15; // line height

    let raf = 0;
    let cols = 0;
    let rows = 0;
    let glyphs = [];
    let colors = [];
    let mark = [];
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    // Seed the grid as a SPARSE, faint field: a stream of readable-ish text
    // (name + role + charset) flows through the cells but most cells are left
    // blank, so the panel reads as scattered warping fragments rather than a
    // solid wall — matching the source's airy look. The boxed "Enter the Blog"
    // overlay (rendered above the canvas) is the real centrepiece.
    function build() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      cols = Math.max(1, Math.floor(w / cellW));
      rows = Math.max(1, Math.floor(h / cellH));
      const total = cols * rows;
      glyphs = new Array(total);
      colors = new Array(total);
      mark = new Array(total);

      const stream = `${name} ${name} making things ${GLYPHS}`.toLowerCase().replace(/\s+/g, ' ');
      let s = 0;
      for (let k = 0; k < total; k += 1) {
        mark[k] = false;
        // Leave most cells empty for a sparse, breathing field.
        if (Math.random() < 0.58) {
          glyphs[k] = ' ';
          colors[k] = 'rgba(0,0,0,0)';
          continue;
        }
        let ch = Math.random() < 0.45 ? stream[s % stream.length] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        s += 1;
        if (ch === ' ') ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        glyphs[k] = ch;
        colors[k] = `rgba(150,175,255,${(0.12 + Math.random() * 0.26).toFixed(2)})`;
      }
    }

    function resize() {
      const parent = canvas.parentElement;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      build();
    }

    // Render one frame at animation time `t` (seconds).
    function draw(t) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = HERO_BG;
      ctx.fillRect(0, 0, w, h);

      // Pick the active distortion and cross-fade into the next near the end.
      const n = DISTORTIONS.length;
      const pos = t / CYCLE_SEC;
      const idx = Math.floor(pos) % n;
      const distA = DISTORTIONS[idx];
      const distB = DISTORTIONS[(idx + 1) % n];
      const frac = pos - Math.floor(pos);
      const blendStart = 1 - BLEND_SEC / CYCLE_SEC;
      const mix = frac > blendStart ? (frac - blendStart) / (BLEND_SEC / CYCLE_SEC) : 0;

      const cx = 0.5;
      const cy = 0.5;
      for (let j = 0; j < rows; j += 1) {
        for (let i = 0; i < cols; i += 1) {
          const k = j * cols + i;
          if (glyphs[k] === ' ') continue;
          const bx = (i + 0.5) / cols;
          const by = (j + 0.5) / rows;
          const p = distA(bx, by, cx, cy, t);
          let nx = p[0];
          let ny = p[1];
          if (mix > 0) {
            const q = distB(bx, by, cx, cy, t);
            nx += (q[0] - nx) * mix;
            ny += (q[1] - ny) * mix;
          }
          ctx.fillStyle = !mark[k] && Math.random() > 0.994 ? BRIGHT_COLOR : colors[k];
          ctx.fillText(glyphs[k], nx * w, ny * h);
        }
      }
    }

    function frame() {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const t = (now - start) / 1000;
      // A little flicker: mutate a handful of non-wordmark glyphs each frame.
      for (let m = 0; m < cols; m += 1) {
        const k = (Math.random() * glyphs.length) | 0;
        if (glyphs[k] !== ' ') glyphs[k] = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      draw(t);
      raf = requestAnimationFrame(frame);
    }

    resize();
    if (reduce) {
      draw(0.8); // a single, gently distorted static frame
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0.8);
    });
    ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [name]);

  return <Canvas ref={canvasRef} aria-hidden="true" />;
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
        © {new Date().getFullYear()} | {t.brand(name.toLowerCase())}
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
            {t.brand(name)}
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
              <AsciiWarp name={name} />
              <HeroInner>
                <EnterBlog type="button" onClick={goTo('blog')}>
                  {t.enter}
                </EnterBlog>
              </HeroInner>
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
const Bar = styled.header`
  position: sticky;
  top: var(--app-top-offset, 0px);
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

// The home page is nothing but the rain panel (minus bar and footer).
const Hero = styled.div`
  position: relative;
  height: calc(100dvh - var(--app-top-offset, 0px) - 8.5rem);
  min-height: 320px;
  margin: 1rem 1.25rem 0;
  border-radius: 10px;
  background: ${HERO_BG};
  overflow: hidden;
`;

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
`;

// The clickable stand-in for the source's ASCII "Enter the Blog" wordmark.
const EnterBlog = styled.button`
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: clamp(1.4rem, 5vw, 3rem);
  letter-spacing: 0.08em;
  padding: 0.6em 1.1em;
  color: #d6e2ff;
  background: rgba(12, 16, 36, 0.35);
  border: 3px double rgba(150, 175, 255, 0.75);
  cursor: pointer;
  text-shadow: 0 0 24px rgba(129, 161, 255, 0.8);
  transition: color 0.2s ease, border-color 0.2s ease, text-shadow 0.2s ease;

  &:hover {
    color: #ffffff;
    border-color: rgba(214, 226, 255, 0.95);
    text-shadow: 0 0 34px rgba(170, 195, 255, 1);
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
