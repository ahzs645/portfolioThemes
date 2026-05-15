import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { withBase } from '../../utils/assetPath';

const GlobalStyle = createGlobalStyle`
  .hey-chris-theme,
  .hey-chris-theme * {
    box-sizing: border-box;
  }

  .hey-chris-theme {
    --background: #ffffff;
    --text: #000000;
    --subtitle: #666666;
    --card: #eaf2f8;
    --selected: #aaaaaa;
    --border: #999999;
    --shadow: #cccccc;
    --green: #19a034;
    --blue: #160ae9;
    --lightblue: #dae3e9;
    --body: #dae3e9;
    --separator-border: #66666666;
    position: relative;
    min-height: 100vh;
    padding-top: 20px;
    background: var(--body);
    color: var(--text);
    font-family: "Atkinson Hyperlegible Next", Atkinson, Arial, sans-serif;
    line-height: 1.75;
    overflow-x: hidden;
  }

  .hey-chris-theme.is-dark {
    --background: #000000;
    --text: #ffffff;
    --subtitle: #999999;
    --card: #333333;
    --selected: #666666;
    --border: #999999;
    --shadow: #333333;
    --green: #1dca3f;
    --blue: #72bfff;
    --lightblue: #dae3e9;
    --body: #2b3237;
  }

  .hey-chris-theme a {
    color: var(--blue);
    text-decoration: none;
  }

  .hey-chris-theme a:hover {
    text-decoration: underline;
  }

  .hey-chris-theme p {
    margin: 10px 0;
    text-indent: 40px;
  }

  .hey-chris-theme ul {
    margin: 0 0 10px 16px;
    padding: 0;
    list-style-type: "⤷ ";
  }

  .hey-chris-theme code {
    color: #ff0000;
    background: #eeeeee;
    padding: 0 4px;
    border-radius: 8px;
  }
`;

const ASSET_ROOT = 'heythisischris';

const iconMap = [
  ['42', '42macro.png'],
  ['macro', '42macro.png'],
  ['street', 'streetbeats.png'],
  ['wall street', 'streetbeats.png'],
  ['longbow', 'longbow.png'],
  ['options', 'optionsinsight.png'],
  ['teckpert', 'teckpert.png'],
  ['finequities', 'finequities.jpg'],
  ['corkage', 'corkagefee.png'],
  ['realdash', 'realdash.png'],
  ['swifty', 'swiftynote.png'],
  ['equalify', 'equalify.png'],
  ['knife', 'knife.jpg'],
  ['place4pals', 'place4pals.svg'],
];

const articles = [
  {
    source: 'Hacker News',
    title: 'SQLite on the edge, tiny tools, and why boring software keeps winning',
    description: 'A running ticker inspired by the original site bookmark feed.',
  },
  {
    source: 'Reddit',
    title: 'CSS-only interface experiments that still feel usable',
    description: 'Interface notes, saved links, and compact reading material.',
  },
  {
    source: 'Google News',
    title: 'AI-assisted product engineering keeps moving into normal workflows',
    description: 'A lightweight replacement for the captured remote feed.',
  },
];

function asset(name) {
  return withBase(`${ASSET_ROOT}/${name}`);
}

function getLink(item) {
  return item?.url || item?.website || item?.link || item?.href || null;
}

function getIconFor(name = '') {
  const normalized = name.toLowerCase();
  const match = iconMap.find(([needle]) => normalized.includes(needle));
  return match ? asset(match[1]) : null;
}

function normalizeLinks(links) {
  if (Array.isArray(links)) return links;
  if (links && typeof links === 'object') return Object.values(links).filter(Boolean);
  return [];
}

function linkLabel(link) {
  return link?.username || link?.label || link?.name || link?.url?.replace(/^https?:\/\//, '') || '';
}

function formatRange(item) {
  return item?.date || item?.dates || item?.period || item?.range || [item?.startDate, item?.endDate || (item?.isCurrent ? 'Present' : null)].filter(Boolean).join(' - ');
}

function SquaresCanvas({
  direction = 'left',
  speed = 0.15,
  borderColor = '#ffffff',
  squareSize = 20,
  hoverFillColor = '#ffffff',
  darkMode = false,
}) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(canvas.offsetWidth * ratio);
      canvas.height = Math.floor(canvas.offsetHeight * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);
      const startX = Math.floor(offsetRef.current.x / squareSize) * squareSize;
      const startY = Math.floor(offsetRef.current.y / squareSize) * squareSize;

      for (let x = startX; x < width + squareSize; x += squareSize) {
        for (let y = startY; y < height + squareSize; y += squareSize) {
          const drawX = x - (offsetRef.current.x % squareSize);
          const drawY = y - (offsetRef.current.y % squareSize);
          const gridX = Math.floor((x - startX) / squareSize);
          const gridY = Math.floor((y - startY) / squareSize);

          if (hoveredRef.current?.x === gridX && hoveredRef.current?.y === gridY) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(drawX, drawY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(drawX, drawY, squareSize, squareSize);
        }
      }

      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, radius);
      gradient.addColorStop(0, darkMode ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, darkMode ? '#060010' : '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const tick = () => {
      const step = Math.max(speed, 0.1);
      if (direction === 'right') offsetRef.current.x = (offsetRef.current.x - step + squareSize) % squareSize;
      if (direction === 'left') offsetRef.current.x = (offsetRef.current.x + step + squareSize) % squareSize;
      if (direction === 'up') offsetRef.current.y = (offsetRef.current.y + step + squareSize) % squareSize;
      if (direction === 'down') offsetRef.current.y = (offsetRef.current.y - step + squareSize) % squareSize;
      if (direction === 'diagonal') {
        offsetRef.current.x = (offsetRef.current.x - step + squareSize) % squareSize;
        offsetRef.current.y = (offsetRef.current.y - step + squareSize) % squareSize;
      }
      draw();
      frameRef.current = requestAnimationFrame(tick);
    };

    const handleMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const startX = Math.floor(offsetRef.current.x / squareSize) * squareSize;
      const startY = Math.floor(offsetRef.current.y / squareSize) * squareSize;
      hoveredRef.current = {
        x: Math.floor((mouseX + offsetRef.current.x - startX) / squareSize),
        y: Math.floor((mouseY + offsetRef.current.y - startY) / squareSize),
      };
    };

    const handleLeave = () => {
      hoveredRef.current = null;
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [borderColor, darkMode, direction, hoverFillColor, speed, squareSize]);

  return <canvas ref={canvasRef} className="hc-grid-canvas" aria-hidden="true" />;
}

function Section({ title, children, delay = 0 }) {
  return (
    <motion.section
      className="hc-section"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      <div className="hc-section-header">{title}</div>
      <div className="hc-section-inner">{children}</div>
    </motion.section>
  );
}

function InlineIcon({ name }) {
  const icon = getIconFor(name);
  if (!icon) return null;
  return <img className="hc-inline-icon" src={icon} alt="" />;
}

function LinkText({ item, children }) {
  const url = getLink(item);
  if (!url) return children;
  return (
    <a className="hc-link" href={url} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function ResumeView({ cv }) {
  const skills = Array.isArray(cv.skills) ? cv.skills : [];
  const socialLinks = normalizeLinks(cv.socialLinks);

  return (
    <div className="hc-content-grid">
      <div className="hc-main-column">
        <motion.div className="hc-person-row" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <div className="hc-person-name">{cv.name || 'Portfolio'}</div>
            <div className="hc-person-title">{cv.currentJobTitle || 'Designer / Developer'}</div>
          </div>
          {cv.location && <div className="hc-person-location">{cv.location}</div>}
        </motion.div>

        <Section title="Introduction" delay={0.1}>
          {(cv.about || '').split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Section>

        {cv.education?.length > 0 && (
          <Section title="Education" delay={0.2}>
            {cv.education.map((item, index) => (
              <div className="hc-entry" key={`${item.institution || item.name}-${index}`}>
                <div className="hc-date">{formatRange(item)}</div>
                <div><b>{item.institution || item.school || item.name}</b>{item.location ? ` - ${item.location}` : ''}</div>
                <div>{item.degree || item.area || item.summary}</div>
              </div>
            ))}
          </Section>
        )}

        {cv.experience?.length > 0 && (
          <Section title="Experience" delay={0.3}>
            {cv.experience.map((item, index) => (
              <div className="hc-entry" key={`${item.company || item.title}-${index}`}>
                <div className="hc-date">{formatRange(item)}</div>
                <div>
                  <b>{item.title || item.position}</b>
                  {item.company && (
                    <>
                      <span> - </span>
                      <LinkText item={item}>
                        <InlineIcon name={item.company} />
                        {item.company}
                      </LinkText>
                    </>
                  )}
                  {item.location ? <span>, {item.location}</span> : null}
                </div>
                {item.summary && <div>{item.summary}</div>}
                {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                  <ul>
                    {item.highlights.slice(0, 4).map((highlight, i) => <li key={i}>{highlight}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {cv.projects?.length > 0 && (
          <Section title="Personal Projects" delay={0.4}>
            {cv.projects.map((item, index) => (
              <div className="hc-entry" key={`${item.name}-${index}`}>
                <div className="hc-date">{formatRange(item)}</div>
                <div>
                  <LinkText item={item}>
                    <InlineIcon name={item.name} />
                    <b>{item.name}</b>
                  </LinkText>
                  {item.description ? ` - ${item.description}` : ''}
                </div>
              </div>
            ))}
          </Section>
        )}

        {skills.length > 0 && (
          <Section title="Skills" delay={0.5}>
            {skills.map((skill, index) => (
              <div key={index}>
                <b>{skill.name || skill.category || `Skill ${index + 1}`}:</b>{' '}
                {Array.isArray(skill.keywords) ? skill.keywords.join(', ') : skill.value || skill.summary || ''}
              </div>
            ))}
          </Section>
        )}
      </div>

      <aside className="hc-side-column">
        <div className="hc-side-title">Contact</div>
        <div className="hc-stack">
          {cv.email && (
            <a className="hc-testimonial" href={`mailto:${cv.email}`}>
              <div className="hc-testimonial-head">
                <div className="hc-avatar-mini">@</div>
                <div>
                  <div>Email</div>
                  <div className="hc-muted">{cv.email}</div>
                </div>
              </div>
            </a>
          )}
          {socialLinks.map((link, index) => (
            <a className="hc-testimonial" href={link.url || '#'} target={link.url ? '_blank' : undefined} rel={link.url ? 'noreferrer' : undefined} key={`${link.network}-${index}`}>
              <div className="hc-testimonial-head">
                <div className="hc-avatar-mini">{(link.network || '?').slice(0, 1)}</div>
                <div>
                  <div>{link.network || link.name || 'Link'}</div>
                  <div className="hc-muted">{linkLabel(link)}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}

function PortfolioView({ projects }) {
  return (
    <div className="hc-card-grid">
      {projects.map((project, index) => (
        <motion.article
          className="hc-project-card"
          key={`${project.name}-${index}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: index * 0.04 }}
        >
          <div className="hc-section-header">
            <InlineIcon name={project.name} />
            {project.name}
          </div>
          <div className="hc-section-inner">
            {project.description && <p>{project.description}</p>}
            {project.highlights?.length > 0 && (
              <ul>
                {project.highlights.slice(0, 4).map((highlight, i) => <li key={i}>{highlight}</li>)}
              </ul>
            )}
            {getLink(project) && (
              <a className="hc-button-link" href={getLink(project)} target="_blank" rel="noreferrer">
                Open project
              </a>
            )}
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function ArticlesView({ cv }) {
  const items = [
    ...(cv.publications || []).map((item) => ({ title: item.title || item.name, description: item.summary || item.journal || item.publisher, link: getLink(item) })),
    ...(cv.presentations || []).map((item) => ({ title: item.title || item.name, description: item.summary || item.venue || item.event, link: getLink(item) })),
  ];
  const display = items.length ? items : articles;

  return (
    <div className="hc-list-page">
      {display.map((item, index) => (
        <Section title={item.source || `Article ${index + 1}`} delay={index * 0.05} key={`${item.title}-${index}`}>
          {item.link ? (
            <a href={item.link} target="_blank" rel="noreferrer"><b>{item.title}</b></a>
          ) : (
            <b>{item.title}</b>
          )}
          {item.description && <p>{item.description}</p>}
        </Section>
      ))}
    </div>
  );
}

function ContactView({ cv }) {
  const socialLinks = normalizeLinks(cv.socialLinks);

  return (
    <div className="hc-list-page">
      <Section title="Contact">
        {cv.email && <div><b>Email:</b> <a href={`mailto:${cv.email}`}>{cv.email}</a></div>}
        {cv.phone && <div><b>Phone:</b> <a href={`tel:${cv.phone}`}>{cv.phone}</a></div>}
        {cv.website && <div><b>Website:</b> <a href={cv.website} target="_blank" rel="noreferrer">{cv.website.replace(/^https?:\/\//, '')}</a></div>}
        {socialLinks.map((link, index) => (
          <div key={`${link.network}-${index}`}>
            <b>{link.network || link.name || 'Link'}:</b>{' '}
            {link.url ? (
              <a href={link.url} target="_blank" rel="noreferrer">{linkLabel(link)}</a>
            ) : (
              <span>{linkLabel(link)}</span>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
}

function Ticker() {
  const repeated = [...articles, ...articles];
  return (
    <div className="hc-ticker" title="Recent articles and bookmarks">
      <div className="hc-ticker-track">
        {repeated.map((item, index) => (
          <span key={`${item.title}-${index}`}>
            <b>{item.source}:</b> {item.title}<span className="hc-ticker-sep">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function HeyThisIsChrisTheme() {
  const cv = useCV();
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState('articles');
  const socialLinks = normalizeLinks(cv?.socialLinks);
  const githubLink = socialLinks.find((link) => link?.url && /github/i.test(link.network || link.url || ''));

  const tabs = useMemo(() => [
    { id: 'articles', label: 'Articles' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'resume', label: 'Resume' },
    { id: 'contact', label: 'Contact' },
  ], []);

  if (!cv) {
    return (
      <>
        <GlobalStyle />
        <div className="hey-chris-theme">
          <div className="hc-shell">Loading...</div>
        </div>
      </>
    );
  }

  const title = cv.name ? `hey, this is ${cv.name.split(/\s+/)[0].toLowerCase()}` : 'hey, this is chris';
  const avatar = cv.avatar || asset('logo.jpg');

  return (
    <>
      <GlobalStyle />
      <div className={`hey-chris-theme ${darkMode ? 'is-dark' : ''}`}>
        <div className="hc-grid-bg">
          <SquaresCanvas
            speed={0.15}
            squareSize={20}
            direction="left"
            borderColor={darkMode ? '#000000' : '#ffffff'}
            hoverFillColor="#ffffff"
            darkMode={darkMode}
          />
        </div>
        <Ticker />
        <main className="hc-shell">
          <motion.header className="hc-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button className="hc-logo-button" type="button" onClick={() => setView('articles')}>
              <img src={avatar} alt="" />
            </button>
            <div className="hc-heading">
              <div className="hc-title-row">
                <button className="hc-title" type="button" onClick={() => setView('articles')}>{title}</button>
                <button
                  className="hc-toggle"
                  type="button"
                  title={darkMode ? 'Turn on the lights' : 'Turn off the lights'}
                  onClick={() => setDarkMode((value) => !value)}
                >
                  <img src={asset(darkMode ? 'off.png' : 'on.png')} alt="" />
                </button>
              </div>
              <nav className="hc-nav" aria-label="Theme sections">
                {tabs.map((tab) => (
                  <button
                    className={`hc-nav-button ${view === tab.id ? 'is-active' : ''}`}
                    type="button"
                    onClick={() => setView(tab.id)}
                    key={tab.id}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            {githubLink && (
              <a
                className="hc-github-strip"
                href={githubLink.url}
                target="_blank"
                rel="noreferrer"
              >
                <span>github contributions</span>
              </a>
            )}
          </motion.header>

          {view === 'resume' && <ResumeView cv={cv} />}
          {view === 'portfolio' && <PortfolioView projects={cv.projects || []} />}
          {view === 'articles' && <ArticlesView cv={cv} />}
          {view === 'contact' && <ContactView cv={cv} />}
        </main>

        <style>{`
          .hc-grid-bg {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: auto;
          }

          .hc-grid-canvas {
            display: block;
            width: 100%;
            height: 100%;
            border: 0;
          }

          .hc-ticker {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 2;
            height: 20px;
            overflow: hidden;
            border-bottom: 1px solid var(--border);
            background: var(--card);
            color: var(--text);
            font-size: 12px;
            line-height: 20px;
            white-space: nowrap;
          }

          .hc-ticker-track {
            display: inline-flex;
            gap: 8px;
            min-width: max-content;
            animation: hc-marquee 38s linear infinite;
          }

          .hc-ticker:hover .hc-ticker-track {
            animation-play-state: paused;
          }

          .hc-ticker-sep {
            color: var(--subtitle);
            margin: 0 14px;
          }

          @keyframes hc-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }

          .hc-shell {
            position: relative;
            z-index: 1;
            width: min(1024px, 100%);
            min-height: calc(100vh - 20px);
            margin: 0 auto;
            padding-bottom: 48px;
            background: var(--background);
            border-left: 1px solid var(--border);
            border-right: 1px solid var(--border);
          }

          .hc-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
          }

          .hc-logo-button,
          .hc-title,
          .hc-toggle,
          .hc-nav-button {
            appearance: none;
            border: 0;
            background: transparent;
            color: inherit;
            font: inherit;
          }

          .hc-logo-button {
            flex: 0 0 auto;
            padding: 0;
          }

          .hc-logo-button img {
            width: 80px;
            aspect-ratio: 1;
            object-fit: cover;
            border: 1px solid var(--border);
            border-radius: 8px;
          }

          .hc-heading {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: min(350px, 100%);
          }

          .hc-title-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .hc-title {
            min-width: 0;
            padding: 0;
            color: var(--text);
            font-size: 36px;
            line-height: 1.08;
            text-align: left;
          }

          .hc-toggle {
            flex: 0 0 auto;
            width: 22px;
            height: 22px;
            padding: 0;
            margin-left: auto;
            border: 1px solid var(--border);
            box-shadow: 2px 2px 0 1px var(--shadow);
            cursor: pointer;
          }

          .hc-toggle img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .hc-nav {
            display: flex;
            justify-content: space-between;
            gap: 8px;
          }

          .hc-nav-button,
          .hc-button-link {
            padding: 2px 8px;
            border: 1px solid var(--border);
            border-radius: 0;
            box-shadow: 2px 2px 0 1px var(--shadow);
            color: var(--subtitle);
            cursor: pointer;
            text-decoration: none;
          }

          .hc-nav-button.is-active {
            background: var(--lightblue);
            color: #000000;
          }

          .hc-github-strip {
            display: flex;
            align-items: center;
            justify-content: center;
            width: min(530px, 42%);
            min-height: 42px;
            margin-left: auto;
            border: 1px dashed var(--border);
            color: var(--subtitle);
            font-size: 12px;
            text-transform: lowercase;
          }

          .hc-content-grid {
            display: flex;
            gap: 16px;
            justify-content: center;
            width: 100%;
            padding: 0 16px;
            font-size: 15px;
          }

          .hc-main-column {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: calc(66% - 8px);
          }

          .hc-side-column {
            width: calc(34% - 8px);
          }

          .hc-person-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 8px;
          }

          .hc-person-name {
            display: inline;
            margin-right: 8px;
            font-size: 18px;
            font-weight: 700;
          }

          .hc-person-title,
          .hc-person-location,
          .hc-muted {
            color: var(--subtitle);
          }

          .hc-section,
          .hc-project-card,
          .hc-testimonial {
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border);
            border-radius: 0;
            box-shadow: 2px 2px 0 1px var(--shadow);
            background: var(--background);
            color: var(--text);
          }

          .hc-section-header {
            display: flex;
            align-items: center;
            gap: 5px;
            min-height: 34px;
            padding: 4px 8px;
            border-bottom: 1px solid var(--border);
            background: var(--card);
            font-weight: 700;
          }

          .hc-section-inner {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
          }

          .hc-entry {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin: 4px 0 10px;
          }

          .hc-date {
            color: var(--subtitle);
            font-weight: 700;
          }

          .hc-link {
            text-decoration: underline;
          }

          .hc-inline-icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 3px;
            margin-top: -2px;
            border-radius: 4px;
            vertical-align: middle;
            object-fit: cover;
          }

          .hc-side-title {
            margin-bottom: 16px;
            font-size: 20px;
            font-weight: 700;
          }

          .hc-stack {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .hc-testimonial {
            text-decoration: none;
          }

          .hc-testimonial:hover {
            text-decoration: none;
            opacity: 0.8;
          }

          .hc-testimonial-head {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            border-bottom: 1px solid var(--border);
            background: var(--card);
          }

          .hc-avatar-mini {
            display: grid;
            place-items: center;
            width: 48px;
            height: 48px;
            background: var(--background);
            border: 1px solid var(--border);
            color: var(--subtitle);
            font-weight: 700;
            text-transform: uppercase;
          }

          .hc-card-grid,
          .hc-list-page {
            display: grid;
            gap: 16px;
            padding: 0 16px;
          }

          .hc-card-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hc-button-link {
            width: fit-content;
            margin-top: 6px;
          }

          @media (max-width: 820px) {
            .hc-shell {
              border-left: 0;
              border-right: 0;
            }

            .hc-header,
            .hc-content-grid {
              flex-direction: column;
              align-items: stretch;
            }

            .hc-logo-button {
              display: none;
            }

            .hc-heading,
            .hc-main-column,
            .hc-side-column {
              width: 100%;
            }

            .hc-title {
              font-size: 30px;
            }

            .hc-github-strip {
              display: none;
            }

            .hc-card-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 520px) {
            .hey-chris-theme {
              padding-top: 20px;
            }

            .hc-header,
            .hc-card-grid,
            .hc-list-page,
            .hc-content-grid {
              padding-left: 10px;
              padding-right: 10px;
            }

            .hc-title {
              font-size: 26px;
            }

            .hc-nav {
              gap: 5px;
            }

            .hc-nav-button {
              flex: 1 1 0;
              padding-left: 3px;
              padding-right: 3px;
              font-size: 13px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
