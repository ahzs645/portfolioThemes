import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { GlitchName } from './components/GlitchName';
import { DuckPond } from './components/DuckPond';
import { PaperOverlay } from './components/PaperOverlay';
import { MetallicTag } from './components/MetallicTag';
import { StonePond } from './components/StonePond';
import { BeachScene } from './components/BeachScene';
import { MiniPond } from './components/MiniPond';
import { DuckRace } from './components/DuckRace';

/* ── Constants ── */

const C = {
  bg: '#f5f1ec',
  text: '#2a2520',
  t90: 'rgba(42,37,32,0.90)',
  t80: 'rgba(42,37,32,0.80)',
  t60: 'rgba(42,37,32,0.60)',
  t55: 'rgba(42,37,32,0.55)',
  t50: 'rgba(42,37,32,0.50)',
  t40: 'rgba(42,37,32,0.40)',
  t35: 'rgba(42,37,32,0.35)',
  t20: 'rgba(42,37,32,0.20)',
  t10: 'rgba(42,37,32,0.10)',
  t04: 'rgba(42,37,32,0.04)',
  white: '#ffffff',
};

const ANIM = {
  DURATION: { FAST: 0.3, NORMAL: 0.6, SLOW: 0.7 },
  EASING: { SMOOTH: '0.22,1,0.36,1', STANDARD: '0.16,1,0.3,1' },
  STAGGER: { DEFAULT: 0.08, TAGS: 0.04 },
};

function FontLoader() {
  useEffect(() => {
    const id = 'baoto-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=DM+Mono:wght@300;400;500&display=swap';
      document.head.appendChild(link);
    }
  }, []);
  return null;
}

/* ── Animations ── */

const fadeBlurIn = keyframes`
  from { opacity: 0; filter: blur(10px); }
  to   { opacity: 1; filter: blur(0px); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const scrollBounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
`;

/* ── Root Layout ── */

const PageRoot = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: ${C.bg};
  color: ${C.text};
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex;
  position: relative;
`;

/* ── Sidebar ── */

const Sidebar = styled.nav`
  display: none;
  flex-direction: column;
  width: 240px;
  height: 100%;
  padding: 32px 24px;
  overflow-y: auto;
  border-right: 1px solid ${C.t10};
  flex-shrink: 0;
  z-index: 40;
  background: ${C.bg};
  transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);

  @media (min-width: 768px) {
    display: flex;
  }
`;

const MobileSidebarToggle = styled.button`
  all: unset;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 50;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${C.t50};
  transition: color 0.2s;
  &:hover { color: ${C.t80}; }

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 39;
  background: rgba(0,0,0,0.15);
  backdrop-filter: blur(2px);
  opacity: ${p => p.$open ? 1 : 0};
  pointer-events: ${p => p.$open ? 'auto' : 'none'};
  transition: opacity 0.3s;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileSidebar = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 260px;
  padding: 64px 24px 32px;
  background: ${C.bg};
  z-index: 41;
  overflow-y: auto;
  transform: translateX(${p => p.$open ? '0' : '-100%'});
  transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1);
  box-shadow: ${p => p.$open ? '8px 0 32px rgba(0,0,0,0.08)' : 'none'};

  @media (min-width: 768px) {
    display: none;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 28px;
`;

const SidebarLabel = styled.h3`
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${C.t35};
  margin: 0 0 12px;
  font-family: 'DM Mono', monospace;
`;

const NavItemBtn = styled.button`
  all: unset;
  display: block;
  width: 100%;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  padding: 5px 0;
  color: ${p => p.$active ? C.text : C.t20};
  transition: color 0.2s;
  &:hover { color: ${p => p.$active ? C.text : C.t40}; }
`;

const PageNavBtn = styled.button`
  all: unset;
  display: block;
  width: 100%;
  cursor: pointer;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  padding: 8px 0;
  color: ${p => p.$active ? C.t80 : C.t35};
  transition: color 0.2s;
  &:hover { color: ${p => p.$active ? C.t80 : C.t55}; }
`;

/* ── Main Content ── */

const Main = styled.main`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  position: relative;
`;

const ContentInner = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 64px;
  animation: ${fadeBlurIn} 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) both;

  @media (min-width: 768px) {
    padding: 48px 40px 80px;
  }
`;

/* ── Footer Nav ── */

const FooterNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 0 32px;
`;

const FooterLink = styled.button`
  all: unset;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: ${p => p.$active ? C.t80 : C.t35};
  transition: color 0.25s;
  &:hover { color: ${p => p.$active ? C.t80 : C.t55}; }
`;

/* ── Scroll Indicator ── */

const ScrollHint = styled.button`
  all: unset;
  cursor: pointer;
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: ${p => p.$vis ? 0.45 : 0};
  transition: opacity 0.4s;
  animation: ${scrollBounce} 2s ease-in-out infinite;
  &:hover { opacity: 0.8; }

  @media (min-width: 768px) {
    right: 32px;
    bottom: 32px;
  }
`;

/* ── Hero Section ── */

const HeroCell = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  animation: ${fadeBlurIn} 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) both;
`;

const HeroName = styled.h1`
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: ${C.t90};
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeroTagline = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${C.t50};
  margin: 0;
`;

/* ── Projects Grid ── */

const GridSection = styled.section`
  margin-bottom: 120px;
  animation: ${fadeUp} 0.7s ease ${p => 0.2 + (p.$i || 0) * 0.1}s both;
`;

const GridLabel = styled.h2`
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${C.t40};
  margin: 0 0 32px;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px 32px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 960px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

/* ── Project Card ── */

const Card = styled.div`
  cursor: ${p => p.$link ? 'pointer' : 'default'};
  display: flex;
  flex-direction: column;
  animation: ${fadeBlurIn} 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) both;
  animation-delay: ${p => 0.3 + (p.$i || 0) * 0.12}s;

  &:hover .card-arrow { opacity: 1; }
  &:hover .card-title { color: ${C.t60}; }
`;

const Thumb = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  background: ${C.t04};
  transition: box-shadow 0.3s;

  ${Card}:hover & {
    box-shadow: 0 8px 32px rgba(42,37,32,0.08);
  }
`;

const ThumbInner = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Mono', monospace;
  font-size: 24px;
  color: ${C.t10};
  font-weight: 300;
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 500;
  color: ${C.t90};
  margin: 0 0 4px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CardArrow = styled.span`
  opacity: 0;
  transition: opacity 0.2s;
  color: ${C.t35};
  display: inline-flex;
`;

const CardDesc = styled.p`
  font-size: 12px;
  line-height: 1.55;
  color: ${C.t50};
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const SimpleTag = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  background: ${C.t04};
  color: ${C.t40};
`;

/* ── About Page ── */

const AboutWrapper = styled.div`
  max-width: 900px;
  width: 88vw;
  margin: 0 auto;
  padding: 48px 8px 0;
  animation: ${fadeBlurIn} 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) both;

  @media (min-width: 640px) {
    width: 70vw;
  }
`;

const AboutLabel = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${C.t35};
`;

const AboutHeading = styled.h1`
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 500;
  color: ${C.t90};
  letter-spacing: -0.02em;
  margin: 8px 0 24px;
`;

const BioParagraph = styled.p`
  font-size: 14px;
  line-height: 1.75;
  color: ${C.t60};
  margin: 0 0 20px;
`;

const AboutSectionTitle = styled.h2`
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${C.t35};
  margin: 48px 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${C.t10};
`;

/* ── Experience ── */

const ExpItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${C.t04};
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$i || 0) * 0.06}s;

  &:last-child { border-bottom: none; }
`;

const ExpDate = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: ${C.t35};
  flex-shrink: 0;
  width: 90px;
  padding-top: 2px;

  @media (min-width: 768px) { width: 110px; }
`;

const ExpContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ExpPosition = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: ${C.t80};
  margin: 0 0 2px;
`;

const ExpCompany = styled.p`
  font-size: 12px;
  color: ${C.t55};
  margin: 0 0 6px;
`;

const ExpHighlights = styled.ul`
  margin: 0;
  padding-left: 14px;
  li {
    font-size: 12px;
    line-height: 1.6;
    color: ${C.t55};
    margin-bottom: 2px;
    &::marker { color: ${C.t20}; }
  }
`;

/* ── Contact ── */

const ContactRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ContactChip = styled.a`
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: ${C.t55};
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid ${C.t10};
  transition: all 0.25s;
  &:hover {
    color: ${C.t80};
    border-color: ${C.t20};
    background: ${C.white};
    box-shadow: 0 2px 8px rgba(42,37,32,0.05);
  }
`;

/* ── Education ── */

const EduItem = styled.div`
  padding: 12px 0;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$i || 0) * 0.06}s;
`;

const EduTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: ${C.t80};
  margin: 0 0 2px;
`;

const EduMeta = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: ${C.t35};
  margin: 0;
`;

/* ── Skills ── */

const SkillsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SkillChip = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: ${C.t40};
  padding: 3px 8px;
  border-radius: 3px;
  background: ${C.t04};
`;

const ProjectDetailWrap = styled.div`
  animation: ${fadeBlurIn} 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) both;
`;

/* ═══════════════════════ Theme Component ═══════════════════════ */

const PAGES = [
  { key: 'home', label: 'HOME' },
  { key: 'work', label: 'WORK' },
  { key: 'about', label: 'ABOUT' },
];

export function BaoToTheme() {
  const cv = useCV();
  const [page, setPage] = useState('home');
  const [mobileNav, setMobileNav] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const mainRef = useRef(null);

  const socialLinks = useMemo(() => {
    if (!cv?.socialLinks) return [];
    return Object.entries(cv.socialLinks)
      .filter(([k, v]) => v && k !== 'email')
      .map(([k, v]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), url: v }));
  }, [cv?.socialLinks]);

  // Scroll indicator
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const check = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setShowScroll(scrollHeight > clientHeight + 100 && scrollTop < scrollHeight - clientHeight - 200);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, [page, selectedProject]);

  const navigate = useCallback((p) => {
    setPage(p);
    setSelectedProject(null);
    setMobileNav(false);
    mainRef.current?.scrollTo({ top: 0 });
  }, []);

  if (!cv) return null;

  const {
    name, email, phone, location, about,
    currentJobTitle, projects, experience,
    education, skills, certificationsSkills,
    awards, publications, presentations,
    volunteer, professionalDevelopment,
  } = cv;

  function fmtDate(d) {
    if (!d) return '';
    if (String(d).toLowerCase().trim() === 'present') return 'Present';
    return d;
  }

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const sidebarContent = (
    <>
      <SidebarSection>
        {PAGES.map(p => (
          <PageNavBtn key={p.key} $active={page === p.key} onClick={() => navigate(p.key)}>
            {p.label}
          </PageNavBtn>
        ))}
      </SidebarSection>

      {page === 'home' && projects?.length > 0 && (
        <SidebarSection>
          <SidebarLabel>Projects</SidebarLabel>
          {projects.map((proj, i) => (
            <NavItemBtn
              key={`${proj.name}-${i}`}
              $active={selectedProject === i}
              onClick={() => {
                setSelectedProject(i);
                setMobileNav(false);
                mainRef.current?.scrollTo({ top: 0 });
              }}
            >
              <GlitchName text={proj.name} delay={0} />
            </NavItemBtn>
          ))}
        </SidebarSection>
      )}
    </>
  );

  return (
    <>
      <FontLoader />
      <PageRoot>
        {/* Paper texture overlay */}
        <PaperOverlay />

        {/* Mobile nav */}
        <MobileSidebarToggle onClick={() => setMobileNav(v => !v)} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {mobileNav
              ? <path d="M18 6L6 18M6 6l12 12" />
              : <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>}
          </svg>
        </MobileSidebarToggle>
        <MobileOverlay $open={mobileNav} onClick={() => setMobileNav(false)} />
        <MobileSidebar $open={mobileNav}>{sidebarContent}</MobileSidebar>

        {/* Desktop sidebar */}
        <Sidebar>{sidebarContent}</Sidebar>

        {/* Main content */}
        <Main ref={mainRef}>
          <ContentInner key={`${page}-${selectedProject}`}>

            {/* ═══ HOME ═══ */}
            {page === 'home' && !selectedProject && selectedProject !== 0 && (
              <>
                <GridSection $i={0}>
                  <ProjectGrid>
                    {/* Hero as first grid cell */}
                    <HeroCell>
                      <div>
                        <HeroName>
                          <GlitchName text={name || 'Your Name'} />
                        </HeroName>
                        <HeroTagline>
                          {currentJobTitle || 'Engineer'}
                          {location ? ` based in ${location}` : ''}
                        </HeroTagline>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 16 }}>
                        {socialLinks.map((l, i) => (
                          <MetallicTag key={i} href={l.url} label={l.label} />
                        ))}
                      </div>
                    </HeroCell>

                    {/* Featured projects */}
                    {projects?.slice(0, 8).map((proj, i) => (
                      <ProjectCard
                        key={`${proj.name}-${i}`}
                        project={proj}
                        index={i}
                        onClick={() => {
                          setSelectedProject(i);
                          mainRef.current?.scrollTo({ top: 0 });
                        }}
                      />
                    ))}
                  </ProjectGrid>
                </GridSection>

                {projects?.length > 8 && (
                  <GridSection $i={1}>
                    <GridLabel>More Projects</GridLabel>
                    <ProjectGrid>
                      {projects.slice(8).map((proj, i) => (
                        <ProjectCard
                          key={`${proj.name}-${i}`}
                          project={proj}
                          index={i}
                          onClick={() => {
                            setSelectedProject(i + 8);
                            mainRef.current?.scrollTo({ top: 0 });
                          }}
                        />
                      ))}
                    </ProjectGrid>
                  </GridSection>
                )}

                {experience?.length > 0 && (
                  <GridSection $i={2}>
                    <GridLabel>Experience</GridLabel>
                    {experience.slice(0, 4).map((exp, i) => (
                      <ExpItem key={`${exp.company}-${i}`} $i={i}>
                        <ExpDate>{fmtDate(exp.startDate)} — {fmtDate(exp.endDate)}</ExpDate>
                        <ExpContent>
                          <ExpPosition>{exp.position}</ExpPosition>
                          <ExpCompany>{exp.company}</ExpCompany>
                        </ExpContent>
                      </ExpItem>
                    ))}
                  </GridSection>
                )}
              </>
            )}

            {/* ═══ HOME: Selected Project ═══ */}
            {page === 'home' && (selectedProject != null) && (() => {
              const proj = projects?.[selectedProject];
              if (!proj) return null;
              return (
                <ProjectDetailWrap>
                  <button
                    onClick={() => setSelectedProject(null)}
                    style={{
                      all: 'unset', cursor: 'pointer', fontFamily: "'DM Mono', monospace",
                      fontSize: 11, color: C.t35, marginBottom: 24, display: 'flex',
                      alignItems: 'center', gap: 4,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    BACK
                  </button>

                  <h1 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 500, color: C.t90, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                    {proj.name}
                  </h1>

                  {proj.summary && (
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: C.t60, margin: '0 0 20px', maxWidth: 560 }}>
                      {proj.summary}
                    </p>
                  )}

                  <TagRow style={{ marginBottom: 24 }}>
                    {proj.technologies?.map((t, i) => <MetallicTag key={i} label={t} />)}
                    {!proj.technologies?.length && proj.keywords?.map((k, i) => <MetallicTag key={i} label={k} />)}
                  </TagRow>

                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.t55,
                        textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                        gap: 4, padding: '8px 16px', border: `1px solid ${C.t10}`,
                        borderRadius: 4, marginBottom: 32, transition: 'all 0.2s',
                      }}
                    >
                      Visit Project
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </a>
                  )}

                  {proj.highlights?.length > 0 && (
                    <>
                      <AboutSectionTitle>Highlights</AboutSectionTitle>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {proj.highlights.map((h, i) => (
                          <li key={i} style={{ fontSize: 13, lineHeight: 1.7, color: C.t60, marginBottom: 4 }}>{h}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </ProjectDetailWrap>
              );
            })()}

            {/* ═══ WORK ═══ */}
            {page === 'work' && (
              <>
                <GridLabel>All Projects</GridLabel>
                {projects?.map((proj, i) => (
                  <ExpItem key={`${proj.name}-${i}`} $i={i} style={{ cursor: 'pointer' }}
                    onClick={() => { setPage('home'); setSelectedProject(i); mainRef.current?.scrollTo({ top: 0 }); }}>
                    <ExpDate>
                      {proj.technologies?.slice(0, 2).join(', ') || ''}
                    </ExpDate>
                    <ExpContent>
                      <ExpPosition style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {proj.name}
                        {proj.url && (
                          <CardArrow className="card-arrow" style={{ opacity: 0.3 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                          </CardArrow>
                        )}
                      </ExpPosition>
                      {proj.summary && <ExpCompany>{proj.summary}</ExpCompany>}
                    </ExpContent>
                  </ExpItem>
                ))}

                {awards?.length > 0 && (
                  <>
                    <AboutSectionTitle>Awards</AboutSectionTitle>
                    {awards.map((a, i) => (
                      <ExpItem key={`aw-${i}`} $i={i}>
                        <ExpDate>{a.date || ''}</ExpDate>
                        <ExpContent>
                          <ExpPosition>{a.name}</ExpPosition>
                          {a.summary && <ExpCompany>{a.summary}</ExpCompany>}
                        </ExpContent>
                      </ExpItem>
                    ))}
                  </>
                )}

                {publications?.length > 0 && (
                  <>
                    <AboutSectionTitle>Publications</AboutSectionTitle>
                    {publications.map((p, i) => (
                      <ExpItem key={`pub-${i}`} $i={i}>
                        <ExpDate>{p.date || ''}</ExpDate>
                        <ExpContent>
                          <ExpPosition>{p.title}</ExpPosition>
                          {p.journal && <ExpCompany>{p.journal}</ExpCompany>}
                        </ExpContent>
                      </ExpItem>
                    ))}
                  </>
                )}

                {presentations?.length > 0 && (
                  <>
                    <AboutSectionTitle>Presentations</AboutSectionTitle>
                    {presentations.map((p, i) => (
                      <ExpItem key={`pres-${i}`} $i={i}>
                        <ExpDate>{p.date || ''}</ExpDate>
                        <ExpContent>
                          <ExpPosition>{p.name}</ExpPosition>
                          {p.summary && <ExpCompany>{p.summary}</ExpCompany>}
                        </ExpContent>
                      </ExpItem>
                    ))}
                  </>
                )}
              </>
            )}

            {/* ═══ ABOUT ═══ */}
            {page === 'about' && (
              <AboutWrapper>
                <AboutLabel>About Me</AboutLabel>
                <AboutHeading>
                  <GlitchName text={`Hi, I'm ${(name || 'Your Name').split(' ')[0]}!`} />
                </AboutHeading>

                <BioParagraph>
                  {about || `${name || 'Your Name'} is a ${currentJobTitle || 'professional'} based in ${location || 'Earth'}.`}
                </BioParagraph>

                {/* Stone Pond */}
                <div style={{ margin: '40px 0' }}>
                  <StonePond />
                </div>

                {/* Contact */}
                {(socialLinks.length > 0 || email || phone) && (
                  <>
                    <AboutSectionTitle>Connect</AboutSectionTitle>
                    <ContactRow>
                      {email && <ContactChip href={`mailto:${email}`}>{email}</ContactChip>}
                      {phone && <ContactChip href={`tel:${phone}`}>{phone}</ContactChip>}
                      {socialLinks.map((l, i) => (
                        <ContactChip key={i} href={l.url} target="_blank" rel="noreferrer">{l.label}</ContactChip>
                      ))}
                    </ContactRow>
                  </>
                )}

                {/* Skills */}
                {(certificationsSkills?.length > 0 || skills?.length > 0) && (
                  <>
                    <AboutSectionTitle>Skills</AboutSectionTitle>
                    <SkillsWrap>
                      {certificationsSkills?.map((s, i) => (
                        <SkillChip key={i}>{s.label}: {s.details}</SkillChip>
                      ))}
                      {skills?.map((s, i) => (
                        <SkillChip key={`sk-${i}`}>{s.name || s.label}{s.level ? ` — ${s.level}` : ''}</SkillChip>
                      ))}
                    </SkillsWrap>
                  </>
                )}

                {/* Experience */}
                {experience?.length > 0 && (
                  <>
                    <AboutSectionTitle>Experience</AboutSectionTitle>
                    {experience.map((exp, i) => (
                      <ExpItem key={`${exp.company}-${i}`} $i={i}>
                        <ExpDate>{fmtDate(exp.startDate)} — {fmtDate(exp.endDate)}</ExpDate>
                        <ExpContent>
                          <ExpPosition>{exp.position}</ExpPosition>
                          <ExpCompany>{exp.company}{exp.location ? `, ${exp.location}` : ''}</ExpCompany>
                          {exp.highlights?.length > 0 && (
                            <ExpHighlights>
                              {exp.highlights.map((h, j) => <li key={j}>{h}</li>)}
                            </ExpHighlights>
                          )}
                        </ExpContent>
                      </ExpItem>
                    ))}
                  </>
                )}

                {/* Education */}
                {education?.length > 0 && (
                  <>
                    <AboutSectionTitle>Education</AboutSectionTitle>
                    {education.map((edu, i) => (
                      <EduItem key={`edu-${i}`} $i={i}>
                        <EduTitle>{edu.degree}{edu.area ? ` in ${edu.area}` : ''}</EduTitle>
                        <EduMeta>
                          {edu.institution}{edu.start_date ? ` — ${edu.start_date}` : ''}
                          {edu.end_date ? ` to ${edu.end_date}` : ''}
                        </EduMeta>
                      </EduItem>
                    ))}
                  </>
                )}

                {/* Volunteer */}
                {volunteer?.length > 0 && (
                  <>
                    <AboutSectionTitle>Volunteer</AboutSectionTitle>
                    {volunteer.map((vol, i) => (
                      <ExpItem key={`vol-${i}`} $i={i}>
                        <ExpDate>{fmtDate(vol.startDate)} — {fmtDate(vol.endDate)}</ExpDate>
                        <ExpContent>
                          <ExpPosition>{vol.position}</ExpPosition>
                          <ExpCompany>{vol.company || vol.organization}</ExpCompany>
                        </ExpContent>
                      </ExpItem>
                    ))}
                  </>
                )}

                {/* Professional Development */}
                {professionalDevelopment?.length > 0 && (
                  <>
                    <AboutSectionTitle>Professional Development</AboutSectionTitle>
                    {professionalDevelopment.map((item, i) => (
                      <EduItem key={`pd-${i}`} $i={i}>
                        <EduTitle>{item.name}</EduTitle>
                        {item.summary && <EduMeta>{item.summary}</EduMeta>}
                      </EduItem>
                    ))}
                  </>
                )}

                {/* Mini Duck Pond (footer) */}
                <div style={{ margin: '48px 0 0' }}>
                  <MiniPond />
                </div>

                {/* Beach Scene */}
                <div style={{ margin: '32px 0 0' }}>
                  <BeachScene />
                </div>

                {/* Duck Race Track */}
                <DuckRace />
              </AboutWrapper>
            )}

          </ContentInner>

          {/* Footer */}
          <FooterNav>
            {PAGES.map(p => (
              <FooterLink key={p.key} $active={page === p.key} onClick={() => navigate(p.key)}>
                {p.label}
              </FooterLink>
            ))}
          </FooterNav>
        </Main>

        {/* Scroll indicator */}
        <ScrollHint $vis={showScroll} onClick={() => mainRef.current?.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={C.text} strokeWidth="1.5">
            <line x1="10" y1="2" x2="10" y2="18" />
            <polyline points="5 13 10 18 15 13" />
          </svg>
        </ScrollHint>
      </PageRoot>
    </>
  );
}

/* ── Inline ProjectCard ── */

function ProjectCard({ project, index, onClick }) {
  const initials = (project.name || '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card $i={index} $link={!!project.url || !!onClick} onClick={onClick}>
      <Thumb>
        <ThumbInner>{initials}</ThumbInner>
      </Thumb>
      <CardTitle className="card-title">
        {project.name}
        {project.url && (
          <CardArrow className="card-arrow">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </CardArrow>
        )}
      </CardTitle>
      {project.summary && <CardDesc>{project.summary}</CardDesc>}
      <TagRow>
        {(project.technologies || project.keywords || []).slice(0, 4).map((t, i) => (
          <SimpleTag key={i}>{t}</SimpleTag>
        ))}
      </TagRow>
    </Card>
  );
}
