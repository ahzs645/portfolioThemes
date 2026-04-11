import React, { useMemo, useEffect, useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;700;900&display=swap');

  .vemula-theme ::selection { background-color: #FFC000; color: #000; }
  .vemula-theme ::-moz-selection { background-color: #FFC000; color: #000; }
`;

const PALETTE = [
  { from: '#1A1A1A', to: '#3B3B3B', label: '#FFFFFF' },
  { from: '#00BDE9', to: '#007D95', label: '#FFFFFF' },
  { from: '#FFC700', to: '#E6A100', label: '#202020' },
  { from: '#FF6B35', to: '#C03A0C', label: '#FFFFFF' },
  { from: '#7B61FF', to: '#3D1FB3', label: '#FFFFFF' },
  { from: '#10B981', to: '#065F46', label: '#FFFFFF' },
  { from: '#EC4899', to: '#9D174D', label: '#FFFFFF' },
  { from: '#0EA5E9', to: '#0C4A6E', label: '#FFFFFF' },
  { from: '#F4F4F4', to: '#C0C0C0', label: '#4E4E4E' },
  { from: '#202020', to: '#000000', label: '#FFC700' },
  { from: '#A855F7', to: '#581C87', label: '#FFFFFF' },
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

const Card = styled.a`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  width: 150px;
  height: 200px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  text-decoration: none;
  background: linear-gradient(155deg, var(--card-from), var(--card-to));
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease,
    opacity 0.3s ease;
  will-change: transform, opacity;
  pointer-events: auto;

  @media (min-width: 768px) { width: 180px; height: 240px; }
  @media (min-width: 1024px) { width: 300px; height: 400px; border-radius: 20px; }

  /* Initial hidden state — applied until JS marks ".vemula-enter" */
  &.vemula-hidden {
    transform: translateY(150px);
    opacity: 0;
    pointer-events: none;
    @media (min-width: 768px) { transform: translateY(180px); }
    @media (min-width: 1024px) { transform: translateY(200px); }
  }

  /* Entering: play the rise-up keyframe with stagger */
  &.vemula-entering {
    animation: ${riseUpMobile} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--enter-delay, 0ms) both;
    @media (min-width: 768px) {
      animation-name: ${riseUpTablet};
    }
    @media (min-width: 1024px) {
      animation-name: ${riseUpDesktop};
    }
  }

  /* Once entered, hover lift takes over */
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

  /* When any sibling is hovered, sit back down */
  ${CardsContainer.toString()}:hover &.vemula-entered:not(:hover) {
    transform: translateY(0) rotate(0);
  }

  /* Wave: prior siblings rise slightly when later card is hovered */
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

const CardTitle = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  font-family: 'Fraunces', Georgia, serif;
  font-variation-settings: 'opsz' 144;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: var(--card-label);
  word-break: break-word;

  @media (min-width: 768px) { bottom: 18px; left: 18px; right: 18px; font-size: 1.4rem; }
  @media (min-width: 1024px) { bottom: 26px; left: 26px; right: 26px; font-size: 2rem; }
`;

const CardSubtitle = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-weight: 400;
  font-size: 0.55rem;
  color: var(--card-label);
  opacity: 0.8;
  margin-top: 6px;
  line-height: 1.25;

  @media (min-width: 768px) { font-size: 0.7rem; margin-top: 8px; }
  @media (min-width: 1024px) { font-size: 0.85rem; margin-top: 10px; }
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

export function VemulaTheme() {
  const cv = useCV();
  const containerRef = useRef(null);
  const [overlap, setOverlap] = useState(180);
  const [enterState, setEnterState] = useState('hidden');

  const cards = useMemo(() => {
    if (!cv) return [];
    const out = [];
    const experience = cv.experience || [];
    const projects = cv.projects || [];
    const social = cv.socialLinks || {};

    experience.slice(0, 4).forEach((exp, i) => {
      if (!exp?.company) return;
      out.push({
        key: `exp-${i}`,
        label: exp.isCurrent ? 'CURRENT' : 'WORK',
        title: exp.company,
        subtitle: exp.title,
        url: exp.url || null,
      });
    });

    projects.slice(0, 2).forEach((p, i) => {
      if (!p?.name) return;
      out.push({
        key: `proj-${i}`,
        label: 'PROJECT',
        title: p.name,
        subtitle: null,
        url: p.url || null,
      });
    });

    const socialOrder = ['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube'];
    socialOrder.forEach((k) => {
      if (social[k]) {
        out.push({
          key: `social-${k}`,
          label: 'SOCIAL',
          title: k.toUpperCase(),
          subtitle: null,
          url: social[k],
        });
      }
    });

    if (cv.email) {
      out.push({
        key: 'email',
        label: 'CONTACT',
        title: 'EMAIL',
        subtitle: null,
        url: `mailto:${cv.email}`,
      });
    }

    if (cv.website) {
      out.push({
        key: 'website',
        label: 'LINK',
        title: 'WEBSITE',
        subtitle: null,
        url: cv.website,
      });
    }

    return out
      .slice(0, 11)
      .map((c, i) => ({ ...c, palette: PALETTE[i % PALETTE.length] }));
  }, [cv]);

  useEffect(() => {
    if (!cards.length) return;
    function recalc() {
      const node = containerRef.current;
      if (!node) return;
      const cardWidth = getCardWidth(window.innerWidth);
      const next = computeOverlap(node.offsetWidth, cards.length, cardWidth);
      setOverlap(next);
    }
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [cards.length]);

  useEffect(() => {
    if (!cards.length) return undefined;
    setEnterState('hidden');
    const startTimer = setTimeout(() => setEnterState('entering'), 80);
    const perCard = 100;
    const animDuration = 600;
    const total = (cards.length - 1) * perCard + animDuration + 80;
    const doneTimer = setTimeout(() => setEnterState('entered'), total);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(doneTimer);
    };
  }, [cards.length]);

  if (!cv) return null;

  const name = cv.name || 'Your Name';
  const firstName = name.split(' ')[0];
  const role = (cv.currentTitle || 'designer').toLowerCase();
  const avatar = cv.avatar;
  const experience = cv.experience || [];
  const current = experience.find((e) => e?.isCurrent) || experience[0] || null;

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
          {cards.map((card, i) => {
            const isLast = i === cards.length - 1;
            const stateClass =
              enterState === 'hidden'
                ? 'vemula-hidden'
                : enterState === 'entering'
                ? 'vemula-entering'
                : 'vemula-entered';
            return (
              <Card
                key={card.key}
                className={stateClass}
                href={card.url || '#'}
                target={card.url ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{
                  '--card-from': card.palette.from,
                  '--card-to': card.palette.to,
                  '--card-label': card.palette.label,
                  '--enter-delay': `${i * 100}ms`,
                  zIndex: 10 + i,
                  marginRight: isLast ? 0 : `-${overlap}px`,
                }}
              >
                <CardLabel>{card.label}</CardLabel>
                <CardTitle>
                  {card.title}
                  {card.subtitle && <CardSubtitle>{card.subtitle}</CardSubtitle>}
                </CardTitle>
              </Card>
            );
          })}
        </CardsContainer>
      </Page>
    </>
  );
}
