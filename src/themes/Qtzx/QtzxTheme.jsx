import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useCV } from '../../contexts/ConfigContext';
import { formatDateRange } from '../../utils/cvHelpers';
import { getBioText } from '../../utils/bioText';
import {
  DarkModeProvider,
  useDarkMode,
  getProjectUrl,
  getProjectLiveUrl,
  getProjectMedia,
  getProjectIcon,
  getSummary,
  getTech,
  getInitials,
} from './qtzxShared';
import {
  AsciiText,
  CardSwap,
  GlassSurface,
  HeroParticles,
  LoaderSphere,
  NameType,
  ShapeBlur,
  SwapCard,
  TargetCursor,
  TypeAnimation,
} from './QtzxEffects';

/* ----------------------------------------------------------------------------
 * Inline icons (kept local to avoid lucide version drift)
 * -------------------------------------------------------------------------- */
const HomeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);
const SunIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </svg>
);
const MoonIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);
const MailIcon = (props) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" {...props}>
    <path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5.3 22H2.2l7.6-8.7L1.7 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.1 3.8H5.2L17.7 20Z" />
  </svg>
);
const GitHubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" {...props}>
    <path d="M12 .5A11.5 11.5 0 0 0 8.4 23c.58.1.78-.25.78-.56v-2.1c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.54-.29-5.21-1.27-5.21-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.16 1.17a10.9 10.9 0 0 1 5.75 0c2.2-1.48 3.16-1.17 3.16-1.17.62 1.58.23 2.74.11 3.03.73.8 1.18 1.82 1.18 3.07 0 4.4-2.67 5.36-5.22 5.65.41.35.77 1.04.77 2.1v3.12c0 .31.2.67.79.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);
const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.61 0 4.27 2.38 4.27 5.47v6.27ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.54V9H7.1v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" />
  </svg>
);
const YouTubeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" {...props}>
    <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.8 12 4.8 12 4.8s-5.9 0-7.6.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.2V8.8l5.5 3.2L10 15.2Z" />
  </svg>
);
const ArrowIcon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const NAV_ITEMS = [
  { title: 'home', href: '#home' },
  { title: 'about', href: '#about' },
  { title: 'portfolio', href: '#portfolio' },
  { title: 'contact', href: '#contact' },
];

function isVideoSrc(src) {
  return typeof src === 'string' && /\.(mp4|webm|mov)$/i.test(src);
}
function isImageSrc(src) {
  return typeof src === 'string' && /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(src);
}

function smoothScrollTo(hash) {
  const id = hash.replace('#', '');
  const target = document.getElementById(id);
  const container = document.querySelector('.qtzx-scroll');
  if (!target || !container) return;
  const marginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const top = id === 'home' ? 0 : target.offsetTop - marginTop;
  container.scrollTo({ top, behavior: 'smooth' });
}

/* ----------------------------------------------------------------------------
 * Theme toggle (circular view-transition reveal)
 * -------------------------------------------------------------------------- */
function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const ref = useRef(null);

  const onToggle = useCallback(async () => {
    if (!ref.current || !document.startViewTransition) {
      toggleDarkMode();
      return;
    }
    await document.startViewTransition(() => {
      flushSync(() => toggleDarkMode());
    }).ready;

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 400, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
    );
  }, [toggleDarkMode]);

  return (
    <ToggleButton ref={ref} type="button" onClick={onToggle} className="cursor-target" aria-label="Toggle theme">
      {isDarkMode ? <MoonIcon /> : <SunIcon />}
    </ToggleButton>
  );
}

/* ----------------------------------------------------------------------------
 * Nav
 * -------------------------------------------------------------------------- */
function Nav({ active, projectsExist }) {
  const { palette } = useDarkMode();
  const items = projectsExist ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.title !== 'portfolio');

  const onClick = (event, href) => {
    event.preventDefault();
    smoothScrollTo(href);
  };

  return (
    <NavShell $active={active}>
      <GlassSurface
        height="auto"
        width="auto"
        borderRadius={50}
        backgroundOpacity={0.35}
        saturation={1}
        borderWidth={0.07}
        brightness={45}
        opacity={0.93}
        blur={11}
        displace={1.5}
        distortionScale={-180}
        redOffset={0}
        greenOffset={10}
        blueOffset={20}
      >
        <NavInner>
          {items.map((item) => (
            <span key={item.title} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {item.title === 'home' ? (
                <>
                  <a className="cursor-target" href={item.href} onClick={(e) => onClick(e, item.href)} aria-label="home">
                    <HomeIcon />
                  </a>
                  <NavDivider />
                </>
              ) : (
                <a className="cursor-target" href={item.href} onClick={(e) => onClick(e, item.href)}>
                  {item.title}
                </a>
              )}
            </span>
          ))}
          <NavDivider />
          <ThemeToggle />
        </NavInner>
      </GlassSurface>
    </NavShell>
  );
}

/* ----------------------------------------------------------------------------
 * Hero
 * -------------------------------------------------------------------------- */
function Hero({ cv, started, progress }) {
  const { palette } = useDarkMode();
  const name = (cv?.name || 'Your Name').trim();
  const parts = name.split(/\s+/);
  const first = (parts[0] || name).toUpperCase();
  const last = parts.slice(1).join(' ').toUpperCase();
  const typed = last ? `${first}\n${last}` : first;

  const role = cv?.currentJobTitle || cv?.label || cv?.headline || 'builder & researcher';
  const lead = cv?.experience?.[0];
  const tagline = lead?.company ? `${lead.title || 'building'} @ ${lead.company}` : role;
  const website = cv?.website || cv?.socialLinks?.website || null;

  // Closing frame: bars grow from edges as the hero scrolls away.
  const barH = `${15 + progress * 35}%`;
  const barW = `${10 + progress * 40}%`;
  const contentScale = Math.max(0.1, 1 - progress * 0.9);
  const contentY = `${progress * -20}%`;

  return (
    <HeroSection id="home">
      <HeroCanvas>
        <HeroParticles />
      </HeroCanvas>

      <HeroFrame aria-hidden="true" $palette={palette}>
        <span className="bar top" style={{ height: barH }} />
        <span className="bar bottom" style={{ height: barH }} />
        <span className="bar left" style={{ width: barW }} />
        <span className="bar right" style={{ width: barW }} />
      </HeroFrame>

      <HeroContent style={{ transform: `translateY(${contentY}) scale(${contentScale})` }}>
        <HeroInner>
          <HeroName>
            {started ? (
              <NameType text={typed} active={started} />
            ) : (
              <span>{typed}</span>
            )}
          </HeroName>

          {website ? (
            <HeroTag as="a" href={website} target="_blank" rel="noreferrer" className="cursor-target" $started={started}>
              {tagline}
            </HeroTag>
          ) : (
            <HeroTag as="span" $started={started}>{tagline}</HeroTag>
          )}

          <HeroMeta $started={started}>
            {cv?.location && <span>{cv.location}</span>}
            {cv?.location && <span className="dot">·</span>}
            <span className="mono">
              {(cv?.projects?.length || 0)} projects · {(cv?.experience?.length || 0)} roles
            </span>
          </HeroMeta>
        </HeroInner>
      </HeroContent>
    </HeroSection>
  );
}

/* ----------------------------------------------------------------------------
 * About
 * -------------------------------------------------------------------------- */
const GREETINGS = ['hello, world...', 2000, 'hello, friend...', 2000, 'hello, there...', 2000, 'hello, stranger...', 2000];

function About({ cv }) {
  const { palette } = useDarkMode();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30% 0px -30% 0px' });

  const firstName = (cv?.name || 'there').split(/\s+/)[0]?.toLowerCase() || 'there';
  const bio = cv?.about || getBioText(cv, { type: 'profile' }) || '';
  const paragraphs = String(bio).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const experience = (cv?.experience || []).slice(0, 4);

  const imagePool = useMemo(() => {
    const fromProjects = (cv?.projects || []).map((p) => getProjectMedia(p)).filter((m) => isImageSrc(m));
    return [cv?.avatar, ...fromProjects].filter(Boolean).slice(0, 4);
  }, [cv]);

  const mainMedia = imagePool[0] || null;

  return (
    <AboutSection id="about" $palette={palette} ref={ref}>
      <AboutGrid as={motion.div} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
        <AboutCopy>
          <AboutHeading $palette={palette}>
            {inView ? (
              <TypeAnimation sequence={GREETINGS} as="h2" className="greeting" />
            ) : (
              <h2 className="greeting">hello, world...</h2>
            )}
          </AboutHeading>
          <p className="lead" style={{ color: palette.muted }}>hey, i&apos;m {firstName}.</p>
          {paragraphs.map((paragraph, index) => (
            <p key={index} style={{ color: palette.muted }}>
              {paragraph}
            </p>
          ))}
          {experience.length > 0 && (
            <Timeline $palette={palette}>
              {experience.map((item, index) => (
                <li key={`${item.company}-${item.title}-${index}`}>
                  <span className="date">
                    {formatDateRange(item.startDate, item.endDate) || 'now'}
                  </span>
                  <span className="role">
                    <strong>{item.title || 'Contributor'}</strong>
                    {item.company ? ` · ${item.company}` : ''}
                  </span>
                </li>
              ))}
            </Timeline>
          )}
          <p style={{ color: palette.muted }}>
            if you&apos;re building something interesting or just want to say hi, feel free to{' '}
            <a className="reach cursor-target" onClick={() => smoothScrollTo('#contact')} style={{ color: palette.heading }}>
              reach out
            </a>
            !
          </p>
        </AboutCopy>

        <AboutMediaWrap>
          <AboutMediaSquare $palette={palette}>
            {mainMedia ? (
              <img src={mainMedia} alt="" aria-hidden="true" />
            ) : (
              <div className="placeholder" aria-hidden="true">
                {getInitials(cv?.name)}
              </div>
            )}
            <ShapeOverlay aria-hidden="true">
              <ShapeBlur
                variation={0}
                pixelRatioProp={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                shapeSize={2}
                roundness={-1}
                borderSize={0.2}
                circleSize={0.04}
                circleEdge={0.9}
                color={palette.shapeColor}
              />
            </ShapeOverlay>
            {imagePool.length >= 2 && (
              <SwapWrap aria-hidden="true">
                <CardSwap width={150} height={150} cardDistance={28} verticalDistance={28} delay={4200} skewAmount={3} easing="smooth">
                  {imagePool.slice(0, 3).map((src, index) => (
                    <SwapCard key={index}>
                      <img src={src} alt="" />
                    </SwapCard>
                  ))}
                </CardSwap>
              </SwapWrap>
            )}
          </AboutMediaSquare>
        </AboutMediaWrap>
      </AboutGrid>
    </AboutSection>
  );
}

/* ----------------------------------------------------------------------------
 * Portfolio
 * -------------------------------------------------------------------------- */
const WORK_TITLES = ['selected works', 3000, 'things i shipped', 2500];

function ProjectCard({ project, index, mirrored }) {
  const { palette } = useDarkMode();
  const title = project.name || project.title || 'Untitled project';
  const summary = getSummary(project);
  const tech = getTech(project);
  const media = getProjectMedia(project);
  const icon = getProjectIcon(project);
  const codeUrl = getProjectUrl(project);
  const liveUrl = getProjectLiveUrl(project);
  const firstLetter = title.trim()[0]?.toUpperCase() || String(index + 1);
  const dateLabel = project.date || formatDateRange(project.startDate, project.endDate);

  return (
    <ProjectRow $mirrored={mirrored} $palette={palette}>
      <IconColumn $palette={palette}>
        <div className="icon-box">
          {icon ? <img src={icon} alt="" aria-hidden="true" /> : <span>{firstLetter}</span>}
        </div>
      </IconColumn>

      <ProjectCardFrame
        as={codeUrl ? 'a' : 'article'}
        href={codeUrl || undefined}
        target={codeUrl ? '_blank' : undefined}
        rel={codeUrl ? 'noreferrer' : undefined}
        className="cursor-target"
        $palette={palette}
      >
        <Corner className="tl" /><Corner className="tr" /><Corner className="bl" /><Corner className="br" />
        <ProjectMedia $palette={palette} $index={index}>
          {isVideoSrc(media) ? (
            <video src={media} muted loop playsInline autoPlay />
          ) : media ? (
            <img src={media} alt="" aria-hidden="true" />
          ) : (
            <span className="glyph">{firstLetter}</span>
          )}
        </ProjectMedia>
        <ProjectBody $palette={palette}>
          <div className="top">
            <h3>{title}</h3>
            {dateLabel && <span className="date">{dateLabel}</span>}
          </div>
          {summary && <p style={{ color: palette.subtle }}>{summary}</p>}
          {tech.length > 0 && (
            <div className="tech">
              {tech.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          )}
          {(codeUrl || liveUrl) && (
            <div className="links">
              {codeUrl && <span className="pill">view code</span>}
              {liveUrl && liveUrl !== codeUrl && <span className="pill alt">live demo <ArrowIcon /></span>}
            </div>
          )}
        </ProjectBody>
      </ProjectCardFrame>
    </ProjectRow>
  );
}

function Portfolio({ cv }) {
  const { palette } = useDarkMode();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' });

  const projects = cv?.projects || [];
  const left = projects.filter((_, i) => i % 2 === 0);
  const right = projects.filter((_, i) => i % 2 === 1);

  return (
    <PortfolioSection id="portfolio" $palette={palette} ref={ref}>
      <PortfolioHeader as={motion.div} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <PortfolioTitle $palette={palette}>
          {inView ? <TypeAnimation sequence={WORK_TITLES} as="h2" /> : <h2>selected works</h2>}
        </PortfolioTitle>
        <p style={{ color: palette.subtle }}>
          selected works, mostly built late at night. every one of them started as the same question.
        </p>
        <WhatIf>
          <AsciiText text='"what if?"' />
        </WhatIf>
      </PortfolioHeader>

      <ProjectColumns>
        <div className="col">
          {left.map((project, index) => (
            <ProjectCard key={`${project.name || index}-l`} project={project} index={index * 2} mirrored={false} />
          ))}
        </div>
        <div className="col offset">
          {right.map((project, index) => (
            <ProjectCard key={`${project.name || index}-r`} project={project} index={index * 2 + 1} mirrored />
          ))}
        </div>
      </ProjectColumns>
    </PortfolioSection>
  );
}

/* ----------------------------------------------------------------------------
 * Contact
 * -------------------------------------------------------------------------- */
const CONTACT_TITLES = ['get in touch...', 2000, 'reach out...', 2000, 'say hi...', 2000, "let's talk...", 2000, 'connect...', 2000];

function Contact({ cv }) {
  const { palette } = useDarkMode();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30% 0px -30% 0px' });
  const socials = cv?.socialLinks || {};
  const email = cv?.email || socials.email;

  const links = [
    { href: socials.twitter, label: 'Twitter / X', icon: <XIcon /> },
    { href: socials.youtube, label: 'YouTube', icon: <YouTubeIcon /> },
    { href: socials.github, label: 'GitHub', icon: <GitHubIcon /> },
    { href: socials.linkedin, label: 'LinkedIn', icon: <LinkedInIcon /> },
  ].filter((item) => item.href);

  return (
    <ContactSection id="contact" $palette={palette} ref={ref}>
      <ContactInner as={motion.div} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1 }}>
        <ContactHeading $palette={palette}>
          {inView ? <TypeAnimation sequence={CONTACT_TITLES} as="h2" /> : <h2>get in touch...</h2>}
        </ContactHeading>
        <p style={{ color: palette.muted }}>
          i love connecting with fellow builders, researchers, and curious minds!{' '}
          {email && (
            <>
              reach me anytime at{' '}
              <a href={`mailto:${email}`} className="cursor-target" style={{ color: palette.heading }}>
                {email}
              </a>
              .
            </>
          )}
        </p>

        <SocialRow $palette={palette}>
          {links.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="cursor-target">
              {item.icon}
            </a>
          ))}
          {email && (
            <a href={`mailto:${email}`} aria-label="Email" className="cursor-target">
              <MailIcon />
            </a>
          )}
        </SocialRow>

        {cv?.avatar && (
          <ContactImage $palette={palette}>
            <img src={cv.avatar} alt="" aria-hidden="true" />
            <ShapeOverlay aria-hidden="true">
              <ShapeBlur
                variation={0}
                pixelRatioProp={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                shapeSize={2}
                roundness={-1}
                borderSize={0.2}
                circleSize={0.04}
                circleEdge={0.9}
                color={palette.shapeColor}
              />
            </ShapeOverlay>
          </ContactImage>
        )}
      </ContactInner>
    </ContactSection>
  );
}

/* ----------------------------------------------------------------------------
 * Loader + shell
 * -------------------------------------------------------------------------- */
function Loader({ visible }) {
  const [present, setPresent] = useState(visible);

  useEffect(() => {
    if (visible) {
      setPresent(true);
      return undefined;
    }
    const id = window.setTimeout(() => setPresent(false), 700);
    return () => window.clearTimeout(id);
  }, [visible]);

  if (!present) return null;

  return (
    <LoaderOverlay $visible={visible} aria-hidden={!visible}>
      <LoaderSphereBox>
        <LoaderSphere />
      </LoaderSphereBox>
    </LoaderOverlay>
  );
}

function QtzxInner() {
  const cv = useCV();
  const { palette } = useDarkMode();
  const [showLoader, setShowLoader] = useState(true);
  const [started, setStarted] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);

  useEffect(() => {
    const t1 = window.setTimeout(() => setShowLoader(false), 1500);
    const t2 = window.setTimeout(() => setStarted(true), 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const onScroll = useCallback((event) => {
    const top = event.currentTarget.scrollTop;
    const height = event.currentTarget.clientHeight || 1;
    setHeroProgress(Math.min(1, Math.max(0, top / height)));
  }, []);

  const projectsExist = (cv?.projects?.length || 0) > 0;

  return (
    <Root $palette={palette}>
      <GlobalStyles />
      <Loader visible={showLoader} />
      <Nav active={!showLoader} projectsExist={projectsExist} />

      <ScrollContainer className="qtzx-scroll" onScroll={onScroll}>
        <Hero cv={cv} started={started} progress={heroProgress} />
        <About cv={cv} />
        {projectsExist && <Portfolio cv={cv} />}
        <Contact cv={cv} />
      </ScrollContainer>

      <TargetCursor targetSelector=".cursor-target" spinDuration={2} isVisible={started} />
    </Root>
  );
}

export function QtzxTheme({ darkMode = true }) {
  return (
    <DarkModeProvider initialDark={darkMode}>
      <QtzxInner />
    </DarkModeProvider>
  );
}

/* ----------------------------------------------------------------------------
 * Styles
 * -------------------------------------------------------------------------- */
const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Yeseva+One&family=Geist:wght@100..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .qtzx-scroll::-webkit-scrollbar { display: none; }

  .target-cursor-wrapper {
    position: fixed; top: 0; left: 0; width: 0; height: 0;
    pointer-events: none; z-index: 9999; mix-blend-mode: difference;
    transform: translate(-50%, -50%); will-change: transform;
  }
  .target-cursor-dot { position: absolute; left: -2px; top: -2px; width: 4px; height: 4px; background: #fff; border-radius: 50%; }
  .target-cursor-corner { position: absolute; width: 12px; height: 12px; border: 3px solid #fff; }
  .target-cursor-corner.corner-tl { transform: translate(-18px, -18px); border-right: 0; border-bottom: 0; }
  .target-cursor-corner.corner-tr { transform: translate(6px, -18px); border-left: 0; border-bottom: 0; }
  .target-cursor-corner.corner-br { transform: translate(6px, 6px); border-left: 0; border-top: 0; }
  .target-cursor-corner.corner-bl { transform: translate(-18px, 6px); border-right: 0; border-top: 0; }

  .glass-surface {
    position: relative; display: flex; align-items: center; justify-content: center;
    overflow: hidden; transition: opacity .26s ease-out; isolation: auto; color-scheme: light dark;
  }
  .glass-surface__filter { width: 100%; height: 100%; pointer-events: none; position: absolute; inset: 0; opacity: 0; z-index: -1; }
  .glass-surface__content { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: .4rem; border-radius: inherit; position: relative; isolation: auto; }
  .glass-surface--svg {
    background: light-dark(hsl(0 0% 100% / var(--glass-frost, 0)), hsl(0 0% 0% / var(--glass-frost, 0)));
    isolation: auto;
    box-shadow:
      0 0 2px 1px light-dark(color-mix(in oklch,black,transparent 85%),color-mix(in oklch,white,transparent 65%)) inset,
      0 0 10px 4px light-dark(color-mix(in oklch,black,transparent 90%),color-mix(in oklch,white,transparent 85%)) inset,
      0 4px 16px #11111a0d, 0 8px 24px #11111a0d, 0 16px 56px #11111a0d,
      0 4px 16px #11111a0d inset, 0 8px 24px #11111a0d inset, 0 16px 56px #11111a0d inset;
  }
  @supports (backdrop-filter: url(#test)) {
    .glass-surface--svg {
      -webkit-backdrop-filter: var(--filter-id, url(#glass-filter)) saturate(var(--glass-saturation, 1));
      backdrop-filter: var(--filter-id, url(#glass-filter)) saturate(var(--glass-saturation, 1));
    }
  }
  @supports not (backdrop-filter: url(#test)) {
    .glass-surface--svg {
      backdrop-filter: blur(12px) saturate(var(--glass-saturation, 1));
      -webkit-backdrop-filter: blur(12px) saturate(var(--glass-saturation, 1));
    }
  }

  .qtzx-swap-card {
    position: absolute; top: 50%; left: 50%;
    border-radius: 12px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.18);
    box-shadow: 0 18px 50px rgba(0,0,0,0.4);
    backface-visibility: hidden;
  }
  .qtzx-swap-card img { width: 100%; height: 100%; object-fit: cover; display: block; }

  @keyframes qtzxBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
  .qtzx-type-cursor { display: inline-block; margin-left: 1px; animation: qtzxBlink 1s step-end infinite; font-weight: 400; }
`;

const Root = styled.div`
  position: relative;
  min-height: 100vh;
  background: ${({ $palette }) => $palette.bg};
  color: ${({ $palette }) => $palette.text};
  font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow: hidden;
`;

const ScrollContainer = styled.div`
  height: calc(100vh - var(--app-top-offset, 0px));
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
`;

const NavShell = styled.header`
  position: fixed;
  top: calc(var(--app-top-offset, 0px) + 24px);
  left: 50%;
  z-index: 60;
  transform: translateX(-50%) translateY(${({ $active }) => ($active ? '0' : '-12px')}) scale(${({ $active }) => ($active ? 1 : 0.92)});
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const NavInner = styled.nav`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  color: #fff;
  isolation: auto;
  mix-blend-mode: difference;

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 14px;
    border-radius: 999px;
    color: #fff;
    font-family: 'Geist', system-ui, sans-serif;
    font-weight: 200;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }
  a:hover { opacity: 0.6; }
`;

const NavDivider = styled.span`
  width: 1px;
  height: 22px;
  margin: 0 6px;
  background: #fff;
`;

const ToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #fff;
  cursor: pointer;
`;

/* Hero */
const HeroSection = styled.section`
  position: relative;
  height: calc(100vh - var(--app-top-offset, 0px));
  width: 100%;
  overflow: hidden;
  scroll-margin-top: 0;
`;

const HeroCanvas = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #000;
`;

const HeroFrame = styled.div`
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;

  .bar { position: absolute; background: ${({ $palette }) => $palette.bg}; transition: background-color 0.3s ease; }
  .bar.top { top: 0; left: 0; right: 0; }
  .bar.bottom { bottom: 0; left: 0; right: 0; }
  .bar.left { top: 0; bottom: 0; left: 0; }
  .bar.right { top: 0; bottom: 0; right: 0; }
`;

const HeroContent = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6vw;
  pointer-events: none;
  transform-origin: center;
  color: #fff;

  a { pointer-events: auto; }
`;

const HeroInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
`;

const HeroName = styled.h1`
  margin: 0;
  font-family: 'Yeseva One', Georgia, serif;
  font-weight: 700;
  text-transform: uppercase;
  white-space: pre-line;
  text-align: left;
  line-height: 0.92;
  font-size: clamp(54px, 12vw, 150px);

  span { min-height: 1.8em; display: inline-block; }
`;

const HeroTag = styled(motion.span)`
  margin-top: 18px;
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: clamp(12px, 1.3vw, 15px);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  opacity: ${({ $started }) => ($started ? 1 : 0)};
  transform: translateY(${({ $started }) => ($started ? '0' : '12px')});
  transition: opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s;

  &:hover { opacity: 0.7; }
`;

const HeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-top: 14px;
  font-size: clamp(12px, 1.2vw, 15px);
  color: rgba(255, 255, 255, 0.75);
  opacity: ${({ $started }) => ($started ? 1 : 0)};
  transition: opacity 0.8s ease 0.9s;

  .mono { font-family: 'IBM Plex Mono', monospace; }
  .dot { opacity: 0.5; }
`;

/* About */
const AboutSection = styled.section`
  position: relative;
  min-height: calc(100vh - var(--app-top-offset, 0px));
  display: flex;
  align-items: center;
  padding: 96px 8vw;
  scroll-margin-top: 96px;
  background: ${({ $palette }) => $palette.bg};
  transition: background-color 0.3s ease;
`;

const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  width: 100%;
  align-items: center;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const AboutCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;

  p { margin: 0; font-size: clamp(15px, 1.2vw, 18px); line-height: 1.7; }
  p.lead { margin-top: 4px; }
  a.reach { font-weight: 700; cursor: pointer; text-decoration: none; }
  a.reach:hover { text-decoration: underline; text-underline-offset: 4px; }
`;

const Timeline = styled.ul`
  list-style: none;
  margin: 8px 0;
  padding: 0;

  li {
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 16px;
    padding: 12px 0;
    border-top: 1px solid ${({ $palette }) => $palette.faint};
    font-size: 14px;
  }
  li:last-child { border-bottom: 1px solid ${({ $palette }) => $palette.faint}; }

  .date { font-family: 'IBM Plex Mono', monospace; font-size: 12px; opacity: 0.55; }
  .role { color: ${({ $palette }) => $palette.muted}; }
  .role strong { font-weight: 700; color: ${({ $palette }) => $palette.heading}; }
`;

const AboutHeading = styled.div`
  height: 64px;
  margin-bottom: 6px;
  .greeting {
    margin: 0;
    font-family: 'Yeseva One', Georgia, serif;
    font-weight: 700;
    font-size: clamp(34px, 4vw, 48px);
    color: ${({ $palette }) => $palette.heading};
  }
`;

const AboutMediaWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
`;

const AboutMediaSquare = styled.div`
  position: relative;
  width: min(440px, 100%);
  aspect-ratio: 1;
  overflow: visible;

  > img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(0.2) contrast(1.05);
  }
  .placeholder {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-family: 'Yeseva One', Georgia, serif;
    font-size: clamp(80px, 12vw, 150px);
    color: ${({ $palette }) => $palette.faint};
    background:
      radial-gradient(circle at 50% 38%, rgba(127,127,127,0.18), transparent 60%),
      ${({ $palette }) => $palette.cardBg};
  }
`;

const ShapeOverlay = styled.div`
  position: absolute;
  inset: -28px;
  z-index: 20;
  pointer-events: none;
`;

const SwapWrap = styled.div`
  position: absolute;
  right: 8px;
  bottom: -6px;
  z-index: 25;
  width: 150px;
  height: 150px;

  @media (max-width: 520px) { display: none; }
`;

/* Portfolio */
const PortfolioSection = styled.section`
  position: relative;
  padding: 96px 6vw;
  scroll-margin-top: 80px;
  background: ${({ $palette }) => $palette.bg};
  transition: background-color 0.3s ease;
`;

const PortfolioHeader = styled.div`
  max-width: 720px;
  margin: 0 auto 8px;
  text-align: center;

  p { margin: 8px auto 0; max-width: 560px; font-size: clamp(13px, 1.1vw, 16px); line-height: 1.6; }
`;

const PortfolioTitle = styled.div`
  height: 56px;
  h2 {
    margin: 0;
    font-family: 'Yeseva One', Georgia, serif;
    font-weight: 700;
    font-size: clamp(30px, 3.4vw, 44px);
    color: ${({ $palette }) => $palette.heading};
  }
`;

const WhatIf = styled.div`
  position: relative;
  width: 100%;
  height: clamp(110px, 16vw, 160px);
  margin-top: 12px;
`;

const ProjectColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  max-width: 1200px;
  margin: 32px auto 0;
  align-items: start;

  .col { display: flex; flex-direction: column; gap: 56px; }
  .col.offset { transform: translateY(54px); }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 56px;
    .col.offset { transform: none; }
  }
`;

const ProjectRow = styled.div`
  display: flex;
  flex-direction: ${({ $mirrored }) => ($mirrored ? 'row-reverse' : 'row')};
  gap: 18px;
  align-items: flex-start;
`;

const IconColumn = styled.div`
  position: sticky;
  top: 110px;
  flex-shrink: 0;

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: ${({ $palette }) => $palette.iconBox};
    border: 2px solid ${({ $palette }) => ($palette.bg === '#1a1a1a' ? '#4a4a4a' : '#e0e0e0')};
    font-family: 'Yeseva One', Georgia, serif;
    font-size: 20px;
    color: ${({ $palette }) => $palette.muted};
  }
  .icon-box img { width: 85%; height: 85%; object-fit: contain; }

  @media (max-width: 480px) {
    .icon-box { width: 36px; height: 36px; border-radius: 10px; font-size: 16px; }
  }
`;

const Corner = styled.span`
  position: absolute;
  width: 14px;
  height: 14px;
  z-index: 2;
  pointer-events: none;
  border-color: currentColor;
  opacity: 0.35;
  &.tl { top: 8px; left: 8px; border-top: 1px solid; border-left: 1px solid; }
  &.tr { top: 8px; right: 8px; border-top: 1px solid; border-right: 1px solid; }
  &.bl { bottom: 8px; left: 8px; border-bottom: 1px solid; border-left: 1px solid; }
  &.br { bottom: 8px; right: 8px; border-bottom: 1px solid; border-right: 1px solid; }
`;

const ProjectCardFrame = styled.article`
  position: relative;
  flex: 1;
  display: block;
  padding: 18px;
  border-radius: 6px;
  text-decoration: none;
  color: ${({ $palette }) => $palette.text};
  background: ${({ $palette }) => $palette.cardBg};
  border: 1px solid ${({ $palette }) => $palette.faint};
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-6px);
    border-color: ${({ $palette }) => $palette.hair};
    box-shadow: 0 26px 70px rgba(0, 0, 0, 0.26);
  }
`;

const ProjectMedia = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 4px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at ${({ $index }) => 30 + ($index % 4) * 12}% 32%, rgba(127,127,127,0.18), transparent 40%),
    ${({ $palette }) => $palette.iconBox};
  box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.35);

  img, video { width: 100%; height: 100%; object-fit: cover; }
  .glyph {
    font-family: 'Yeseva One', Georgia, serif;
    font-size: clamp(48px, 7vw, 84px);
    opacity: 0.3;
    color: ${({ $palette }) => $palette.muted};
  }
`;

const ProjectBody = styled.div`
  padding-top: 16px;

  .top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
  h3 { margin: 0; font-family: 'Yeseva One', Georgia, serif; font-size: clamp(18px, 1.6vw, 22px); }
  .date { font-family: 'IBM Plex Mono', monospace; font-size: 11px; opacity: 0.55; white-space: nowrap; }
  p { margin: 0 0 14px; font-size: 13px; line-height: 1.6; }

  .tech { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
  .tech span {
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 600;
    border: 1px solid currentColor;
    opacity: 0.55;
  }

  .links { display: flex; flex-wrap: wrap; gap: 8px; }
  .pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 999px;
    font-size: 11px;
    background: ${({ $palette }) => $palette.chipBg};
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.18);
  }
`;

/* Contact */
const ContactSection = styled.section`
  position: relative;
  min-height: calc(100vh - var(--app-top-offset, 0px));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 96px 8vw;
  scroll-margin-top: 90px;
  background: ${({ $palette }) => $palette.bg};
  transition: background-color 0.3s ease;
`;

const ContactInner = styled.div`
  max-width: 720px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;

  p { margin: 0; max-width: 520px; font-size: clamp(15px, 1.3vw, 18px); line-height: 1.7; }
  a { text-decoration: none; }
  a:hover { opacity: 0.7; }
`;

const ContactHeading = styled.div`
  height: 64px;
  margin-bottom: 8px;
  h2 {
    margin: 0;
    font-family: 'Yeseva One', Georgia, serif;
    font-weight: 700;
    font-size: clamp(34px, 4vw, 48px);
    color: ${({ $palette }) => $palette.heading};
  }
`;

const SocialRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 28px;
  margin-top: 36px;

  a { color: ${({ $palette }) => $palette.heading}; transition: opacity 0.3s ease; }
`;

const ContactImage = styled.div`
  position: relative;
  width: min(380px, 86%);
  aspect-ratio: 1;
  margin-top: 56px;

  img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; filter: grayscale(0.15); }
`;

/* Loader */
const LoaderOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: #000;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 0.5s ease 0.1s;
`;

const LoaderSphereBox = styled.div`
  width: 18rem;
  height: 18rem;

  @media (max-width: 640px) {
    width: 12rem;
    height: 12rem;
  }
`;
