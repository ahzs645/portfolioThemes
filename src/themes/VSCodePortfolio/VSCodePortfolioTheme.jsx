import React, { useState, useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDateRange } from '../../utils/cvHelpers';

/* ── Atom One Dark palette ─────────────────────────────────── */
const C = {
  bgDark:      '#21252b',
  bgMid:       '#282c34',
  bgLight:     '#333842',
  bgHover:     '#2c313a',
  textWhite:   '#f3f3f3',
  textMid:     '#c2c2c2',
  textDark:    '#909295',
  textBlue:    '#636d83',
  textLightBl: '#abb2bf',
  green:       '#98c379',
  red:         '#e06c75',
  cyan:        '#56b6c2',
  blue:        '#42a5f5',
  orange:      '#d19a66',
  jsOrange:    '#ffca28',
  purple:      '#c678dd',
  pink:        '#e13e76',
  darkOrange:  '#e44d26',
};

const FONT_SANS = "'Ubuntu', 'Segoe UI', sans-serif";
const FONT_MONO = "'Ubuntu Mono', 'Fira Mono', 'Consolas', monospace";

/* ── All possible tabs ─────────────────────────────────────── */
const ALL_TABS = [
  { key: 'about',        label: 'about.md',              color: C.blue,      dataKey: null },
  { key: 'experience',   label: 'experience.json',       color: C.jsOrange,  dataKey: 'experience' },
  { key: 'projects',     label: 'projects.config',       color: C.green,     dataKey: 'projects' },
  { key: 'skills',       label: 'skills.js',             color: C.jsOrange,  dataKey: 'skills' },
  { key: 'education',    label: '.educationrc',          color: C.orange,    dataKey: 'education' },
  { key: 'volunteer',    label: 'volunteer.yml',         color: C.cyan,      dataKey: 'volunteer' },
  { key: 'awards',       label: 'awards.json',           color: C.purple,    dataKey: 'awards' },
  { key: 'publications', label: 'publications.bib',      color: C.red,       dataKey: 'publications' },
  { key: 'presentations',label: 'talks.md',              color: C.pink,      dataKey: 'presentations' },
  { key: 'certifications',label: 'certificates.sass',    color: C.pink,      dataKey: 'certifications' },
  { key: 'profDev',      label: 'professional-dev.ts',   color: C.blue,      dataKey: 'professionalDevelopment' },
  { key: 'languages',    label: 'languages.json',        color: C.green,     dataKey: 'languages' },
];

/* ── Inline SVG icons ──────────────────────────────────────── */
const Icons = {
  home:     (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 22V12h6v10"/></svg>,
  briefcase:(c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  code:     (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  star:     (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  book:     (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  heart:    (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  award:    (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  fileText: (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  mic:      (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  badge:    (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><path d="M12 15l-2 5 1-3h2l1 3-2-5z"/><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="12" x2="13" y2="12"/></svg>,
  trending: (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  messageCircle:(c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  github:   (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill={c}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>,
  linkedin: (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill={c}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  mail:     (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>,
  globe:    (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  branch:   (c) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={c} strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>,
  smile:    (c) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  x:        (c) => <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  cog:      (c) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
};

/* sidebar icon mapping per tab key */
const SIDEBAR_ICON_MAP = {
  about:          Icons.home,
  experience:     Icons.briefcase,
  projects:       Icons.code,
  skills:         Icons.star,
  education:      Icons.book,
  volunteer:      Icons.heart,
  awards:         Icons.award,
  publications:   Icons.fileText,
  presentations:  Icons.mic,
  certifications: Icons.badge,
  profDev:        Icons.trending,
  languages:      Icons.messageCircle,
};

/* ── File-type icon (colored dot before tab name) ──────────── */
function FileIcon({ color }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" style={{ marginRight: 6, flexShrink: 0, verticalAlign: 'middle' }}>
      <circle cx="8" cy="8" r="5" fill={color} />
    </svg>
  );
}

/* ── Scoped global styles ──────────────────────────────────── */
const ScopedReset = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&family=Ubuntu+Mono:wght@400;700&display=swap');
`;

/* ── Styled-components ─────────────────────────────────────── */
const Shell = styled.div`
  position: fixed;
  top: var(--app-top-offset, 0px);
  left: 0; right: 0; bottom: 0;
  display: flex; flex-direction: column;
  background: ${C.bgMid};
  font-family: ${FONT_MONO};
  font-size: 14px;
  color: ${C.textLightBl};
  overflow: hidden;
  * { box-sizing: border-box; margin: 0; padding: 0; }
  a { color: ${C.textLightBl}; text-decoration: none; transition: color .3s; }
  a:hover { color: ${C.textWhite}; }
`;

const Body = styled.div`
  flex: 1; display: flex; overflow: hidden;
`;

/* ── Left sidebar ──────────────────────────────────────────── */
const LeftBar = styled.nav`
  width: 50px; flex-shrink: 0;
  background: ${C.bgLight};
  display: flex; flex-direction: column;
  align-items: center; justify-content: space-between;
  padding: 10px 0;
  overflow-y: auto; overflow-x: hidden;
  &::-webkit-scrollbar { width: 0; }
  @media (max-width: 640px) { display: none; }
`;

const SBIconWrap = styled.button`
  position: relative;
  width: 50px; height: 42px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer;
  border-left: 2px solid transparent;
  transition: background .2s, border-color .2s;
  ${({ $active }) => $active && `
    border-left-color: ${C.textWhite};
    background: ${C.bgMid};
  `}
  &:hover { background: ${C.bgHover}; }
`;

const SBDivider = styled.span`
  width: 80%; height: 1px; flex-shrink: 0;
  background: rgba(255,255,255,0.08);
  margin: 6px 0;
`;

const SBBottom = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 4px;
`;

/* ── Header / Tabs ─────────────────────────────────────────── */
const Header = styled.header`
  height: 40px; flex-shrink: 0;
  background: ${C.bgDark};
  display: flex; align-items: stretch;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  display: inline-flex; align-items: center;
  padding: 0 14px;
  background: ${({ $active }) => $active ? C.bgMid : C.bgDark};
  border: none;
  border-top: 3px solid ${({ $active }) => $active ? '#568af2' : 'transparent'};
  border-right: 1px solid rgba(0,0,0,0.25);
  color: ${({ $active }) => $active ? C.textWhite : C.textDark};
  font-family: ${FONT_SANS};
  font-size: 12px; letter-spacing: 0.3px;
  cursor: pointer; white-space: nowrap;
  transition: background .2s, color .2s;
  &:hover { background: ${C.bgHover}; color: ${C.textMid}; }
  @media (max-width: 640px) {
    padding: 0 8px;
    .tab-label { display: none; }
  }
`;

const CloseBtn = styled.span`
  margin-left: 10px; display: flex; align-items: center;
  opacity: 0; transition: opacity .15s;
  ${Tab}:hover &, ${Tab}[data-active="true"] & { opacity: 1; }
  &:hover svg { stroke: ${C.textWhite}; }
`;

/* ── Main content ──────────────────────────────────────────── */
const Main = styled.main`
  flex: 1; display: flex; flex-direction: column;
  min-width: 0;
`;

const ContentScroll = styled.div`
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 32px 40px 60px;
  max-width: 900px;
  @media (max-width: 640px) { padding: 20px 16px 60px; }
`;

/* ── Status bar ────────────────────────────────────────────── */
const StatusBar = styled.footer`
  height: 22px; flex-shrink: 0;
  background: ${C.bgDark};
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 10px;
  font-family: ${FONT_SANS};
  font-size: 11px;
  color: ${C.textLightBl};
  z-index: 10;
`;

const StatusItem = styled.span`
  display: inline-flex; align-items: center; gap: 4px;
  padding: 0 6px;
  &:hover { background: ${C.bgMid}; cursor: pointer; }
`;

/* ── Content sections ──────────────────────────────────────── */
const HeroWrap = styled.section`
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: calc(100vh - 40px - 22px - 64px);
  text-align: center;
  font-family: ${FONT_SANS};
`;

const HeroName = styled.h1`
  font-size: 36px; font-weight: 400;
  color: ${C.textMid}; letter-spacing: 2px;
  text-shadow: 4px 4px ${C.bgDark};
  margin-bottom: 8px;
  @media (max-width: 640px) { font-size: 26px; }
`;

const HeroTitle = styled.p`
  font-size: 22px; font-weight: 300;
  color: ${C.textDark};
  margin-bottom: 24px;
  @media (max-width: 640px) { font-size: 17px; }
`;

const HeroAbout = styled.p`
  max-width: 560px;
  color: ${C.textBlue};
  line-height: 1.7;
  font-size: 14px;
  margin-bottom: 32px;
`;

const HeroBtns = styled.div`
  display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
`;

const HeroBtn = styled.a`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 4px;
  font-family: ${FONT_SANS}; font-size: 13px;
  background: ${C.bgLight};
  color: ${C.textLightBl} !important;
  border: 1px solid rgba(255,255,255,0.06);
  transition: background .2s, color .2s;
  &:hover { background: ${C.bgHover}; color: ${C.textWhite} !important; }
`;

/* Section styles */
const SectionTitle = styled.h2`
  font-family: ${FONT_SANS};
  font-size: 16px; font-weight: 500;
  color: ${C.textMid};
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
`;

const Comment = styled.p`
  color: ${C.textBlue};
  margin-bottom: 20px;
  &::before { content: '// '; color: ${C.green}; }
`;

/* Reusable card */
const Card = styled.div`
  margin-bottom: 24px;
  padding: 16px 20px;
  background: ${C.bgDark};
  border-radius: 4px;
  border-left: 3px solid ${({ $accent }) => $accent || C.cyan};
`;

const CardHeader = styled.div`
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px;
  margin-bottom: 6px;
`;

const CardTitle = styled.span`
  font-weight: 500; color: ${C.textWhite};
`;

const CardDate = styled.span`
  font-size: 12px; color: ${C.orange};
  font-family: ${FONT_MONO};
`;

const CardSub = styled.span`
  font-size: 13px; color: ${({ $color }) => $color || C.purple};
  display: block; margin-bottom: 8px;
`;

const CardBody = styled.p`
  font-size: 13px; color: ${C.textLightBl}; line-height: 1.6;
`;

const Highlight = styled.li`
  color: ${C.textLightBl};
  font-size: 13px; line-height: 1.6;
  margin-left: 16px;
  &::marker { color: ${C.green}; }
`;

/* Projects */
const ProjGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
`;

const ProjCard = styled.a`
  display: block;
  padding: 16px 18px;
  background: ${C.bgDark};
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.04);
  transition: border-color .2s, transform .15s;
  &:hover { border-color: ${C.cyan}; transform: translateY(-2px); }
`;

const ProjName = styled.h3`
  font-size: 14px; font-weight: 500;
  color: ${C.textWhite}; margin-bottom: 6px;
  display: flex; align-items: center; gap: 6px;
  &::before { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${C.green}; }
`;

const ProjDesc = styled.p`
  font-size: 12px; color: ${C.textDark}; line-height: 1.5;
`;

/* Skills */
const SkillGroup = styled.div`
  margin-bottom: 20px;
`;

const SkillGroupName = styled.h3`
  font-size: 13px; font-weight: 500;
  color: ${C.orange}; margin-bottom: 8px;
  text-transform: uppercase; letter-spacing: 0.5px;
`;

const SkillPills = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
`;

const SkillPill = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: ${C.bgDark};
  border-radius: 3px;
  font-size: 12px;
  color: ${C.cyan};
  border: 1px solid rgba(255,255,255,0.04);
`;

/* Languages */
const LangBar = styled.div`
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 12px;
`;

const LangName = styled.span`
  width: 100px; flex-shrink: 0;
  font-size: 13px; color: ${C.textWhite};
`;

const LangLevel = styled.span`
  font-size: 12px; color: ${C.textDark};
  font-family: ${FONT_MONO};
`;

const LangTrack = styled.div`
  flex: 1; height: 6px;
  background: ${C.bgDark}; border-radius: 3px;
  overflow: hidden;
`;

const LangFill = styled.div`
  height: 100%; border-radius: 3px;
  background: ${({ $color }) => $color};
  width: ${({ $pct }) => $pct}%;
`;

const FLUENCY_PCT = { native: 100, fluent: 90, advanced: 75, intermediate: 55, beginner: 30, basic: 20 };
const LANG_COLORS = [C.cyan, C.green, C.purple, C.orange, C.blue, C.pink, C.red];

/* ══════════════════════════════════════════════════════════════
   Theme component
   ══════════════════════════════════════════════════════════════ */
export function VSCodePortfolioTheme({ darkMode }) {
  const cv = useCV();
  const [activeTab, setActiveTab] = useState('about');

  /* Build visible tabs based on available data */
  const visibleTabs = useMemo(() => {
    if (!cv) return [];
    return ALL_TABS.filter(({ dataKey }) => {
      if (!dataKey) return true; // about always shows
      const data = cv[dataKey];
      return data && (Array.isArray(data) ? data.length > 0 : !!data);
    });
  }, [cv]);

  const socialLinks = useMemo(() => {
    if (!cv) return [];
    const links = [];
    if (cv.socialLinks?.github)   links.push({ icon: Icons.github,   url: cv.socialLinks.github,   tip: 'GitHub' });
    if (cv.socialLinks?.linkedin) links.push({ icon: Icons.linkedin,  url: cv.socialLinks.linkedin, tip: 'LinkedIn' });
    if (cv.socialLinks?.email)    links.push({ icon: Icons.mail,      url: `mailto:${cv.socialLinks.email}`, tip: 'Email' });
    if (cv.socialLinks?.website)  links.push({ icon: Icons.globe,     url: cv.socialLinks.website,  tip: 'Website' });
    return links;
  }, [cv]);

  if (!cv) return null;

  /* ── Content renderer ─── */
  function renderContent() {
    switch (activeTab) {

      case 'about':
        return (
          <HeroWrap>
            <HeroName>Hi! I'm {cv.name}.</HeroName>
            <HeroTitle>{cv.currentJobTitle}</HeroTitle>
            {cv.about && <HeroAbout>{cv.about}</HeroAbout>}
            <HeroBtns>
              {cv.socialLinks?.github && (
                <HeroBtn href={cv.socialLinks.github} target="_blank" rel="noopener noreferrer">
                  {Icons.github(C.textLightBl)} GitHub
                </HeroBtn>
              )}
              {cv.socialLinks?.linkedin && (
                <HeroBtn href={cv.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  {Icons.linkedin(C.textLightBl)} LinkedIn
                </HeroBtn>
              )}
              {cv.socialLinks?.email && (
                <HeroBtn href={`mailto:${cv.socialLinks.email}`}>
                  {Icons.mail(C.textLightBl)} Contact Me
                </HeroBtn>
              )}
            </HeroBtns>
          </HeroWrap>
        );

      case 'experience':
        return (
          <>
            <SectionTitle>Experience</SectionTitle>
            <Comment>Work history &amp; roles</Comment>
            {cv.experience.map((exp, i) => (
              <Card key={i} $accent={C.cyan}>
                <CardHeader>
                  <CardTitle>{exp.title}</CardTitle>
                  <CardDate>{formatDateRange(exp.startDate, exp.endDate)}</CardDate>
                </CardHeader>
                <CardSub>{exp.company}{exp.location ? ` \u2014 ${exp.location}` : ''}</CardSub>
                {exp.highlights?.length > 0 && (
                  <ul style={{ listStyle: 'disc' }}>
                    {exp.highlights.map((h, j) => <Highlight key={j}>{h}</Highlight>)}
                  </ul>
                )}
              </Card>
            ))}
          </>
        );

      case 'projects':
        return (
          <>
            <SectionTitle>Projects</SectionTitle>
            <Comment>Things I've built</Comment>
            <ProjGrid>
              {cv.projects.map((proj, i) => (
                <ProjCard
                  key={i}
                  href={proj.url || undefined}
                  target={proj.url ? '_blank' : undefined}
                  rel={proj.url ? 'noopener noreferrer' : undefined}
                  as={proj.url ? 'a' : 'div'}
                >
                  <ProjName>{proj.name}</ProjName>
                  <ProjDesc>{proj.summary}</ProjDesc>
                </ProjCard>
              ))}
            </ProjGrid>
          </>
        );

      case 'skills':
        return (
          <>
            <SectionTitle>Skills</SectionTitle>
            <Comment>Technologies &amp; tools</Comment>
            {cv.skills.map((group, i) => (
              <SkillGroup key={i}>
                <SkillGroupName>{group.name}</SkillGroupName>
                <SkillPills>
                  {group.keywords?.map((kw, j) => <SkillPill key={j}>{kw}</SkillPill>)}
                </SkillPills>
              </SkillGroup>
            ))}
          </>
        );

      case 'education':
        return (
          <>
            <SectionTitle>Education</SectionTitle>
            <Comment>Academic background</Comment>
            {cv.education.map((edu, i) => (
              <Card key={i} $accent={C.purple}>
                <CardTitle>{edu.degree}{edu.area ? ` in ${edu.area}` : ''}</CardTitle>
                <CardSub $color={C.cyan}>{edu.institution}</CardSub>
                <CardDate>{formatDateRange(edu.start_date, edu.end_date)}</CardDate>
              </Card>
            ))}
          </>
        );

      case 'volunteer':
        return (
          <>
            <SectionTitle>Volunteer</SectionTitle>
            <Comment>Community &amp; open-source work</Comment>
            {cv.volunteer.map((vol, i) => (
              <Card key={i} $accent={C.red}>
                <CardHeader>
                  <CardTitle>{vol.title}</CardTitle>
                  <CardDate>{formatDateRange(vol.startDate, vol.endDate)}</CardDate>
                </CardHeader>
                <CardSub>{vol.company}{vol.location ? ` \u2014 ${vol.location}` : ''}</CardSub>
                {vol.highlights?.length > 0 && (
                  <ul style={{ listStyle: 'disc' }}>
                    {vol.highlights.map((h, j) => <Highlight key={j}>{h}</Highlight>)}
                  </ul>
                )}
              </Card>
            ))}
          </>
        );

      case 'awards':
        return (
          <>
            <SectionTitle>Awards</SectionTitle>
            <Comment>Honors &amp; recognition</Comment>
            {cv.awards.map((aw, i) => (
              <Card key={i} $accent={C.jsOrange}>
                <CardHeader>
                  <CardTitle>{aw.name || aw.title}</CardTitle>
                  {aw.date && <CardDate>{aw.date}</CardDate>}
                </CardHeader>
                {aw.awarder && <CardSub $color={C.jsOrange}>{aw.awarder}</CardSub>}
                {aw.summary && <CardBody>{aw.summary}</CardBody>}
              </Card>
            ))}
          </>
        );

      case 'publications':
        return (
          <>
            <SectionTitle>Publications</SectionTitle>
            <Comment>Papers &amp; articles</Comment>
            {cv.publications.map((pub, i) => (
              <Card key={i} $accent={C.red}>
                <CardHeader>
                  <CardTitle>
                    {pub.url
                      ? <a href={pub.url} target="_blank" rel="noopener noreferrer" style={{ color: C.textWhite }}>{pub.name || pub.title}</a>
                      : (pub.name || pub.title)
                    }
                  </CardTitle>
                  {pub.date && <CardDate>{pub.date}</CardDate>}
                </CardHeader>
                {pub.journal && <CardSub $color={C.red}>{pub.journal}</CardSub>}
                {pub.publisher && !pub.journal && <CardSub $color={C.red}>{pub.publisher}</CardSub>}
                {pub.summary && <CardBody>{pub.summary}</CardBody>}
              </Card>
            ))}
          </>
        );

      case 'presentations':
        return (
          <>
            <SectionTitle>Presentations</SectionTitle>
            <Comment>Talks &amp; conferences</Comment>
            {cv.presentations.map((talk, i) => (
              <Card key={i} $accent={C.pink}>
                <CardHeader>
                  <CardTitle>
                    {talk.url
                      ? <a href={talk.url} target="_blank" rel="noopener noreferrer" style={{ color: C.textWhite }}>{talk.name || talk.title}</a>
                      : (talk.name || talk.title)
                    }
                  </CardTitle>
                  {talk.date && <CardDate>{talk.date}</CardDate>}
                </CardHeader>
                {talk.location && <CardSub $color={C.pink}>{talk.location}</CardSub>}
                {talk.summary && <CardBody>{talk.summary}</CardBody>}
              </Card>
            ))}
          </>
        );

      case 'certifications':
        return (
          <>
            <SectionTitle>Certifications</SectionTitle>
            <Comment>Professional credentials</Comment>
            {cv.certifications.map((cert, i) => (
              <Card key={i} $accent={C.green}>
                <CardHeader>
                  <CardTitle>
                    {cert.url
                      ? <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ color: C.textWhite }}>{cert.name || cert.title}</a>
                      : (cert.name || cert.title)
                    }
                  </CardTitle>
                  {cert.date && <CardDate>{cert.date}</CardDate>}
                </CardHeader>
                {cert.issuer && <CardSub $color={C.green}>{cert.issuer}</CardSub>}
                {cert.summary && <CardBody>{cert.summary}</CardBody>}
              </Card>
            ))}
          </>
        );

      case 'profDev':
        return (
          <>
            <SectionTitle>Professional Development</SectionTitle>
            <Comment>Courses &amp; continued learning</Comment>
            {cv.professionalDevelopment.map((pd, i) => (
              <Card key={i} $accent={C.blue}>
                <CardHeader>
                  <CardTitle>
                    {pd.url
                      ? <a href={pd.url} target="_blank" rel="noopener noreferrer" style={{ color: C.textWhite }}>{pd.name || pd.title}</a>
                      : (pd.name || pd.title)
                    }
                  </CardTitle>
                  {pd.date && <CardDate>{pd.date}</CardDate>}
                </CardHeader>
                {pd.institution && <CardSub $color={C.blue}>{pd.institution}</CardSub>}
                {pd.summary && <CardBody>{pd.summary}</CardBody>}
              </Card>
            ))}
          </>
        );

      case 'languages':
        return (
          <>
            <SectionTitle>Languages</SectionTitle>
            <Comment>Spoken &amp; written languages</Comment>
            {cv.languages.map((lang, i) => {
              const pct = FLUENCY_PCT[(lang.fluency || '').toLowerCase()] || 50;
              return (
                <LangBar key={i}>
                  <LangName>{lang.language}</LangName>
                  <LangTrack>
                    <LangFill $pct={pct} $color={LANG_COLORS[i % LANG_COLORS.length]} />
                  </LangTrack>
                  <LangLevel>{lang.fluency}</LangLevel>
                </LangBar>
              );
            })}
          </>
        );

      default:
        return null;
    }
  }

  return (
    <>
      <ScopedReset />
      <Shell>
        <Body>
          {/* ── Left sidebar ── */}
          <LeftBar>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {visibleTabs.map(({ key }) => {
                const icon = SIDEBAR_ICON_MAP[key];
                if (!icon) return null;
                return (
                  <SBIconWrap
                    key={key}
                    $active={activeTab === key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    onClick={() => setActiveTab(key)}
                  >
                    {icon(activeTab === key ? C.textWhite : C.textDark)}
                  </SBIconWrap>
                );
              })}

              {socialLinks.length > 0 && <SBDivider />}

              {socialLinks.map(({ icon, url, tip }) => (
                <SBIconWrap
                  key={tip}
                  as="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={tip}
                >
                  {icon(C.textDark)}
                </SBIconWrap>
              ))}
            </div>

            <SBBottom>
              <SBIconWrap as="span" title="Settings" style={{ cursor: 'default' }}>
                {Icons.cog(C.textDark)}
              </SBIconWrap>
            </SBBottom>
          </LeftBar>

          {/* ── Main content area ── */}
          <Main>
            {/* Tab bar */}
            <Header>
              {visibleTabs.map(({ key, label, color }) => (
                <Tab
                  key={key}
                  $active={activeTab === key}
                  data-active={activeTab === key}
                  onClick={() => setActiveTab(key)}
                >
                  <FileIcon color={color} />
                  <span className="tab-label">{label}</span>
                  <CloseBtn onClick={(e) => { e.stopPropagation(); setActiveTab('about'); }}>
                    {Icons.x(C.textDark)}
                  </CloseBtn>
                </Tab>
              ))}
            </Header>

            {/* Content */}
            <ContentScroll>
              {renderContent()}
            </ContentScroll>
          </Main>
        </Body>

        {/* ── Status bar ── */}
        <StatusBar>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {cv.socialLinks?.github && (
              <StatusItem
                as="a"
                href={cv.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                {Icons.branch(C.textLightBl)}
                <span>main</span>
              </StatusItem>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <StatusItem>{Icons.smile(C.textLightBl)}</StatusItem>
          </div>
        </StatusBar>
      </Shell>
    </>
  );
}
