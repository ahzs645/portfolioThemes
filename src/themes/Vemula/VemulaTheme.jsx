import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;700;900&display=swap');

  .vemula-theme ::selection { background-color: #FFC000; color: #000; }
  .vemula-theme ::-moz-selection { background-color: #FFC000; color: #000; }
  body.vemula-locked { overflow: hidden; }
`;

const PALETTE = [
  { from: '#1A1A1A', to: '#3B3B3B', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#00BDE9', to: '#007D95', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#FFC700', to: '#E6A100', label: '#202020', accent: '#1A1A1A' },
  { from: '#FF6B35', to: '#C03A0C', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#7B61FF', to: '#3D1FB3', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#10B981', to: '#065F46', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#EC4899', to: '#9D174D', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#0EA5E9', to: '#0C4A6E', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#F4F4F4', to: '#C0C0C0', label: '#4E4E4E', accent: '#00BDE9' },
  { from: '#202020', to: '#000000', label: '#FFC700', accent: '#FFC700' },
  { from: '#A855F7', to: '#581C87', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#F472B6', to: '#831843', label: '#FFFFFF', accent: '#FFE8B0' },
  { from: '#22D3EE', to: '#0E7490', label: '#FFFFFF', accent: '#FFC700' },
  { from: '#FB923C', to: '#9A3412', label: '#FFFFFF', accent: '#FFE8B0' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(d) {
  if (!d) return '';
  if (d === 'present' || d === 'Present') return 'Present';
  const [y, m] = String(d).split('-');
  if (!y) return '';
  if (!m) return y;
  const monthIdx = parseInt(m, 10) - 1;
  return Number.isFinite(monthIdx) && MONTHS[monthIdx] ? `${MONTHS[monthIdx]} ${y}` : y;
}

function fmtRange(item) {
  const start = fmtDate(item?.startDate);
  const end = fmtDate(item?.endDate);
  if (!start && !end) return '';
  if (start && end) return `${start} — ${end}`;
  return start || end;
}

function shuffle(array, seed) {
  const a = [...array];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SECTION_DEFS = [
  {
    key: 'about',
    label: 'ABOUT',
    title: 'About',
    build: (cv) => (cv.about ? [{ body: cv.about }] : null),
  },
  {
    key: 'experience',
    label: 'WORK',
    title: 'Experience',
    build: (cv) =>
      (cv.experience || [])
        .filter((e) => e?.company || e?.title)
        .map((e) => ({
          title: e.company,
          subtitle: e.title,
          dates: fmtRange(e),
          location: e.location,
          highlights: e.highlights || [],
          url: e.url,
        })),
  },
  {
    key: 'projects',
    label: 'PROJECTS',
    title: 'Projects',
    build: (cv) =>
      (cv.projects || [])
        .filter((p) => p?.name)
        .map((p) => ({
          title: p.name,
          dates: fmtRange(p),
          body: p.description,
          highlights: p.highlights || [],
          url: p.url,
        })),
  },
  {
    key: 'education',
    label: 'EDUCATION',
    title: 'Education',
    build: (cv) =>
      (cv.education || [])
        .filter((e) => e?.school || e?.degree)
        .map((e) => ({
          title: e.school,
          subtitle: e.degree,
          dates: fmtRange(e),
          highlights: e.highlights || [],
        })),
  },
  {
    key: 'skills',
    label: 'SKILLS',
    title: 'Skills',
    build: (cv) => ((cv.skills || []).length ? [{ tags: cv.skills }] : null),
  },
  {
    key: 'languages',
    label: 'LANGUAGES',
    title: 'Languages',
    build: (cv) => ((cv.languages || []).length ? [{ tags: cv.languages }] : null),
  },
  {
    key: 'awards',
    label: 'AWARDS',
    title: 'Awards',
    build: (cv) =>
      (cv.awards || [])
        .filter((a) => a?.title)
        .map((a) => ({
          title: a.title,
          subtitle: a.issuer,
          dates: fmtDate(a.date),
          body: a.description,
        })),
  },
  {
    key: 'publications',
    label: 'WRITING',
    title: 'Publications',
    build: (cv) =>
      (cv.publications || [])
        .filter((p) => p?.title || p?.name)
        .map((p) => ({
          title: p.title || p.name,
          subtitle: p.authors || p.publisher,
          dates: fmtDate(p.date),
          url: p.url,
        })),
  },
  {
    key: 'certifications',
    label: 'CERTS',
    title: 'Certifications',
    build: (cv) =>
      (cv.certifications || [])
        .filter((c) => c?.name || c?.title)
        .map((c) => ({
          title: c.name || c.title,
          subtitle: c.issuer,
          dates: fmtDate(c.date),
          url: c.url,
        })),
  },
  {
    key: 'volunteer',
    label: 'VOLUNTEER',
    title: 'Volunteer',
    build: (cv) =>
      (cv.volunteer || [])
        .filter((v) => v?.organization || v?.position)
        .map((v) => ({
          title: v.organization,
          subtitle: v.position,
          dates: fmtRange(v),
          highlights: v.highlights || [],
        })),
  },
  {
    key: 'contact',
    label: 'CONTACT',
    title: 'Get in touch',
    build: (cv) => {
      const links = [];
      if (cv.email) links.push({ label: 'EMAIL', value: cv.email, url: `mailto:${cv.email}` });
      if (cv.phone) links.push({ label: 'PHONE', value: cv.phone, url: `tel:${cv.phone}` });
      if (cv.website) links.push({ label: 'WEBSITE', value: cv.website, url: cv.website });
      if (cv.location) links.push({ label: 'LOCATION', value: cv.location });
      return links.length ? [{ links }] : null;
    },
  },
  {
    key: 'social',
    label: 'ELSEWHERE',
    title: 'Find me elsewhere',
    build: (cv) => {
      const social = cv.socialLinks || {};
      const order = ['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube', 'website'];
      const links = order
        .filter((k) => social[k])
        .map((k) => ({ label: k.toUpperCase(), value: social[k], url: social[k] }));
      return links.length ? [{ links }] : null;
    },
  },
];

const Page = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 20px 20px 50vh;
  background: #ffffff;
  color: #4E4E4E;
  font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 768px) { padding: 30px 30px 55vh; }
  @media (min-width: 1024px) { padding: 47px 47px 60vh; }
`;

const Title = styled.h1`
  color: #4E4E4E;
  font-family: 'Fraunces', Georgia, serif;
  font-variation-settings: 'opsz' 144;
  font-size: 2.5rem;
  font-weight: 600;
  line-height: 1.089;
  letter-spacing: -0.01em;
  margin: 0 0 20px 0;
  max-width: 100%;

  img.avatar {
    width: 30px;
    height: 30px;
    display: inline-block;
    margin: 0 6px;
    vertical-align: middle;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
  .sparkle {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin-left: 8px;
    vertical-align: middle;
  }

  @media (min-width: 768px) {
    font-size: 4.375rem;
    img.avatar { width: 60px; height: 60px; margin: 0 10px; }
    .sparkle { width: 36px; height: 36px; margin-left: 12px; }
  }
  @media (min-width: 1024px) {
    font-size: 6.25rem;
    margin-bottom: 0;
    img.avatar { width: 80px; height: 80px; margin: 0 14px; }
    .sparkle { width: 60px; height: 60px; margin-left: 16px; }
  }
`;

const Subtitle = styled.div`
  color: #878787;
  font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.089;
  display: flex;
  align-items: center;
  margin-top: 24px;
  gap: 10px;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #00C46A;
    box-shadow: 0 0 0 4px rgba(0, 196, 106, 0.18);
    flex-shrink: 0;
  }
  .accent {
    color: #00BDE9;
    font-weight: 900;
    text-decoration: none;
    letter-spacing: 0.02em;
  }
  .accent:hover { text-decoration: underline; text-underline-offset: 4px; }

  @media (min-width: 768px) { font-size: 1rem; gap: 14px; margin-top: 32px; }
  @media (min-width: 1024px) { font-size: 1.25rem; margin-top: 40px; }
`;

const riseUpMobile = keyframes`
  0%   { transform: translateY(150px); opacity: 0; }
  60%  { transform: translateY(-15px); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
`;

const riseUpTablet = keyframes`
  0%   { transform: translateY(180px); opacity: 0; }
  60%  { transform: translateY(-18px); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
`;

const riseUpDesktop = keyframes`
  0%   { transform: translateY(200px); opacity: 0; }
  60%  { transform: translateY(-20px); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
`;

const CardsContainer = styled.div`
  position: fixed;
  bottom: -5%;
  left: 20px;
  right: 20px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  z-index: 5;
  pointer-events: none;

  @media (min-width: 768px) {
    left: 30px;
    right: 30px;
  }
  @media (min-width: 1024px) {
    left: 47px;
    right: 47px;
  }
`;

const Card = styled.button`
  position: relative;
  border: none;
  padding: 0;
  border-radius: 16px;
  overflow: hidden;
  width: 150px;
  height: 200px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  text-align: left;
  background: linear-gradient(155deg, var(--card-from), var(--card-to));
  font: inherit;
  color: inherit;
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease,
    opacity 0.3s ease;
  will-change: transform, opacity;
  pointer-events: auto;

  @media (min-width: 768px) { width: 180px; height: 240px; }
  @media (min-width: 1024px) { width: 300px; height: 400px; border-radius: 20px; }

  &.vemula-hidden {
    transform: translateY(150px);
    opacity: 0;
    pointer-events: none;
    @media (min-width: 768px) { transform: translateY(180px); }
    @media (min-width: 1024px) { transform: translateY(200px); }
  }

  &.vemula-entering {
    animation: ${riseUpMobile} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--enter-delay, 0ms) both;
    @media (min-width: 768px) { animation-name: ${riseUpTablet}; }
    @media (min-width: 1024px) { animation-name: ${riseUpDesktop}; }
  }

  &.vemula-entered:hover {
    transform: translateY(-40px) rotate(-1deg);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  }
  @media (min-width: 768px) {
    &.vemula-entered:hover { transform: translateY(-60px) rotate(-1deg); }
  }
  @media (min-width: 1024px) {
    &.vemula-entered:hover { transform: translateY(-82px) rotate(-1deg); }
  }

  ${CardsContainer.toString()}:hover &.vemula-entered:not(:hover) {
    transform: translateY(0) rotate(0);
  }

  &.vemula-entered:not(:first-child):hover + &.vemula-entered {
    transform: translateY(-20px) rotate(0.5deg);
  }
  &.vemula-entered:not(:first-child):hover + &.vemula-entered + &.vemula-entered {
    transform: translateY(-14px);
  }
  &.vemula-entered:not(:first-child):hover + &.vemula-entered + &.vemula-entered + &.vemula-entered {
    transform: translateY(-7px);
  }

  @media (min-width: 1024px) {
    &.vemula-entered:not(:first-child):hover + &.vemula-entered {
      transform: translateY(-40px) rotate(0.5deg);
    }
    &.vemula-entered:not(:first-child):hover + &.vemula-entered + &.vemula-entered {
      transform: translateY(-25px);
    }
    &.vemula-entered:not(:first-child):hover + &.vemula-entered + &.vemula-entered + &.vemula-entered {
      transform: translateY(-12px);
    }
  }
`;

const CardLabel = styled.div`
  position: absolute;
  top: 10px;
  left: 12px;
  right: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--card-label);
  text-transform: uppercase;

  @media (min-width: 768px) { top: 16px; left: 18px; font-size: 0.78rem; }
  @media (min-width: 1024px) { top: 22px; left: 26px; font-size: 1rem; }
`;

const CardCount = styled.div`
  position: absolute;
  top: 10px;
  right: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.62rem;
  color: var(--card-label);
  opacity: 0.7;

  @media (min-width: 768px) { top: 16px; right: 18px; font-size: 0.78rem; }
  @media (min-width: 1024px) { top: 22px; right: 26px; font-size: 1rem; }
`;

const CardTitle = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  font-family: 'Fraunces', Georgia, serif;
  font-variation-settings: 'opsz' 144;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: var(--card-label);
  word-break: break-word;

  @media (min-width: 768px) { bottom: 18px; left: 18px; right: 18px; font-size: 1.5rem; }
  @media (min-width: 1024px) { bottom: 26px; left: 26px; right: 26px; font-size: 2rem; }
`;

const detailFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const detailSlideUp = keyframes`
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
`;

const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: var(--detail-bg, #ffffff);
  color: var(--detail-fg, #202020);
  overflow-y: auto;
  animation: ${detailFadeIn} 0.35s ease both;
`;

const DetailInner = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 80px;
  animation: ${detailSlideUp} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;

  @media (min-width: 768px) { padding: 36px 40px 100px; }
  @media (min-width: 1024px) { padding: 56px 64px 120px; }
`;

const BackButton = styled.button`
  appearance: none;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: currentColor;
    color: var(--detail-bg);
  }
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid currentColor;
  margin-bottom: 32px;

  @media (min-width: 768px) { padding-bottom: 32px; margin-bottom: 48px; }
`;

const DetailLabel = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 8px;
`;

const DetailTitle = styled.h2`
  font-family: 'Fraunces', Georgia, serif;
  font-variation-settings: 'opsz' 144;
  font-weight: 600;
  font-size: 2.5rem;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0;

  @media (min-width: 768px) { font-size: 4rem; }
  @media (min-width: 1024px) { font-size: 5rem; }
`;

const DetailItem = styled.article`
  padding: 24px 0;
  border-bottom: 1px solid currentColor;

  &:last-child { border-bottom: none; }

  @media (min-width: 768px) { padding: 32px 0; }
`;

const ItemTitle = styled.h3`
  font-family: 'Fraunces', Georgia, serif;
  font-variation-settings: 'opsz' 144;
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.1;
  margin: 0 0 6px;

  @media (min-width: 768px) { font-size: 2rem; }
`;

const ItemSubtitle = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  font-weight: 400;
  opacity: 0.8;
  margin-bottom: 4px;

  @media (min-width: 768px) { font-size: 1.05rem; }
`;

const ItemMeta = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.65;
  margin-bottom: 16px;
`;

const ItemBody = styled.p`
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.1rem;
  line-height: 1.55;
  margin: 12px 0;
  max-width: 70ch;
`;

const ItemHighlights = styled.ul`
  margin: 12px 0 0;
  padding: 0 0 0 20px;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.05rem;
  line-height: 1.55;
  max-width: 70ch;

  li { margin-bottom: 8px; }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
`;

const Tag = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 8px 14px;
  border: 1px solid currentColor;
  border-radius: 999px;
`;

const LinkRow = styled.a`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid currentColor;
  font-family: 'JetBrains Mono', monospace;
  text-decoration: none;
  color: inherit;
  transition: padding-left 0.2s ease;

  &:last-child { border-bottom: none; }
  &:hover { padding-left: 8px; }

  .label {
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .value {
    font-size: 0.95rem;
    opacity: 0.75;
    text-align: right;
    word-break: break-all;
  }
`;

function Sparkle() {
  return (
    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M30 0 C31 18 42 29 60 30 C42 31 31 42 30 60 C29 42 18 31 0 30 C18 29 29 18 30 0 Z"
        fill="#FFC700"
      />
    </svg>
  );
}

function getCardWidth(viewportWidth) {
  if (viewportWidth < 768) return 150;
  if (viewportWidth < 1024) return 180;
  return 300;
}

function computeOverlap(containerWidth, cardCount, cardWidth) {
  if (cardCount < 2) return 0;
  const minPeek = 0.25 * cardWidth;
  const squeeze = (cardCount * cardWidth - containerWidth) / (cardCount - 1);
  const cap = cardWidth - minPeek;
  return Math.max(0, Math.min(squeeze, cap));
}

function DetailContent({ section }) {
  return (
    <>
      {section.items.map((item, idx) => {
        if (item.links) {
          return (
            <DetailItem key={idx}>
              {item.links.map((link, j) =>
                link.url ? (
                  <LinkRow
                    key={j}
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    <span className="label">{link.label}</span>
                    <span className="value">{link.value}</span>
                  </LinkRow>
                ) : (
                  <LinkRow as="div" key={j}>
                    <span className="label">{link.label}</span>
                    <span className="value">{link.value}</span>
                  </LinkRow>
                )
              )}
            </DetailItem>
          );
        }
        if (item.tags) {
          return (
            <DetailItem key={idx}>
              <Tags>
                {item.tags.map((tag, j) => (
                  <Tag key={j}>{tag}</Tag>
                ))}
              </Tags>
            </DetailItem>
          );
        }
        return (
          <DetailItem key={idx}>
            {item.title && <ItemTitle>{item.title}</ItemTitle>}
            {item.subtitle && <ItemSubtitle>{item.subtitle}</ItemSubtitle>}
            {(item.dates || item.location) && (
              <ItemMeta>
                {[item.dates, item.location].filter(Boolean).join(' · ')}
              </ItemMeta>
            )}
            {item.body && <ItemBody>{item.body}</ItemBody>}
            {item.highlights && item.highlights.length > 0 && (
              <ItemHighlights>
                {item.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ItemHighlights>
            )}
          </DetailItem>
        );
      })}
    </>
  );
}

export function VemulaTheme() {
  const cv = useCV();
  const containerRef = useRef(null);
  const [overlap, setOverlap] = useState(180);
  const [enterState, setEnterState] = useState('hidden');
  const [openKey, setOpenKey] = useState(null);

  const sections = useMemo(() => {
    if (!cv) return [];
    const seed = Math.floor(Math.random() * 100000);
    const shuffled = shuffle(PALETTE, seed);
    return SECTION_DEFS
      .map((def) => {
        const items = def.build(cv);
        if (!items || items.length === 0) return null;
        return { ...def, items };
      })
      .filter(Boolean)
      .map((section, i) => ({
        ...section,
        palette: shuffled[i % shuffled.length],
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cv]);

  useEffect(() => {
    if (!sections.length) return;
    function recalc() {
      const node = containerRef.current;
      if (!node) return;
      const cardWidth = getCardWidth(window.innerWidth);
      const next = computeOverlap(node.offsetWidth, sections.length, cardWidth);
      setOverlap(next);
    }
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [sections.length]);

  useEffect(() => {
    if (!sections.length) return undefined;
    setEnterState('hidden');
    const startTimer = setTimeout(() => setEnterState('entering'), 80);
    const total = (sections.length - 1) * 100 + 600 + 80;
    const doneTimer = setTimeout(() => setEnterState('entered'), total);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(doneTimer);
    };
  }, [sections.length]);

  const closeDetail = useCallback(() => setOpenKey(null), []);

  useEffect(() => {
    if (!openKey) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') closeDetail();
    }
    document.addEventListener('keydown', onKey);
    document.body.classList.add('vemula-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('vemula-locked');
    };
  }, [openKey, closeDetail]);

  if (!cv) return null;

  const name = cv.name || 'Your Name';
  const firstName = name.split(' ')[0];
  const role = (cv.currentTitle || 'designer').toLowerCase();
  const avatar = cv.avatar;
  const experience = cv.experience || [];
  const current = experience.find((e) => e?.isCurrent) || experience[0] || null;
  const openSection = sections.find((s) => s.key === openKey) || null;

  return (
    <>
      <FontLoader />
      <Page className="vemula-theme">
        <div>
          <Title>
            Hey there, I am {firstName}
            {avatar && (
              <img className="avatar" src={avatar} alt={`${firstName}'s profile`} />
            )}
            , a {role} polishing ideas until they shine
            <span className="sparkle">
              <Sparkle />
            </span>
          </Title>
          <Subtitle>
            <span className="dot" aria-hidden="true" />
            {current ? (
              <span>
                Currently at{' '}
                {current.url ? (
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="accent"
                  >
                    {current.company.toUpperCase()}
                  </a>
                ) : (
                  <span className="accent">{current.company.toUpperCase()}</span>
                )}
              </span>
            ) : (
              <span>Available for new work</span>
            )}
          </Subtitle>
        </div>

        <CardsContainer ref={containerRef}>
          {sections.map((section, i) => {
            const stateClass =
              enterState === 'hidden'
                ? 'vemula-hidden'
                : enterState === 'entering'
                ? 'vemula-entering'
                : 'vemula-entered';
            const isLast = i === sections.length - 1;
            return (
              <Card
                key={section.key}
                type="button"
                className={stateClass}
                onClick={() => setOpenKey(section.key)}
                aria-label={`Open ${section.title}`}
                style={{
                  '--card-from': section.palette.from,
                  '--card-to': section.palette.to,
                  '--card-label': section.palette.label,
                  '--enter-delay': `${i * 100}ms`,
                  zIndex: 10 + i,
                  marginRight: isLast ? 0 : `-${overlap}px`,
                }}
              >
                <CardLabel>{section.label}</CardLabel>
                {section.items.length > 1 && (
                  <CardCount>{String(section.items.length).padStart(2, '0')}</CardCount>
                )}
                <CardTitle>{section.title}</CardTitle>
              </Card>
            );
          })}
        </CardsContainer>
      </Page>

      {openSection && (
        <DetailOverlay
          role="dialog"
          aria-modal="true"
          aria-label={openSection.title}
          style={{
            '--detail-bg': openSection.palette.from,
            '--detail-fg': openSection.palette.label,
          }}
        >
          <DetailInner>
            <DetailHeader>
              <div>
                <DetailLabel>{openSection.label}</DetailLabel>
                <DetailTitle>{openSection.title}</DetailTitle>
              </div>
              <BackButton type="button" onClick={closeDetail}>
                ← Back
              </BackButton>
            </DetailHeader>
            <DetailContent section={openSection} />
          </DetailInner>
        </DetailOverlay>
      )}
    </>
  );
}
