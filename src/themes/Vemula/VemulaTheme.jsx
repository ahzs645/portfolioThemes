import React, { useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
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

const CardsContainer = styled.div`
  position: fixed;
  bottom: -10%;
  left: 20px;
  right: 20px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  z-index: 5;
  pointer-events: none;
  --card-overlap: -70px;

  @media (min-width: 768px) {
    left: 30px;
    right: 30px;
    --card-overlap: -110px;
  }
  @media (min-width: 1024px) {
    left: 47px;
    right: 47px;
    bottom: -8%;
    --card-overlap: -200px;
  }
`;

const Card = styled.a`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  width: 100px;
  height: 130px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  text-decoration: none;
  background: linear-gradient(155deg, var(--card-from), var(--card-to));
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease;
  will-change: transform;
  pointer-events: auto;

  @media (min-width: 768px) { width: 160px; height: 215px; }
  @media (min-width: 1024px) { width: 300px; height: 400px; border-radius: 20px; }

  &:hover {
    transform: translateY(-32px) rotate(-1deg);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  }
  @media (min-width: 768px) {
    &:hover { transform: translateY(-56px) rotate(-1deg); }
  }
  @media (min-width: 1024px) {
    &:hover { transform: translateY(-90px) rotate(-1deg); }
  }

  ${CardsContainer.toString()}:hover &:not(:hover) {
    transform: translateY(0) rotate(0);
  }

  /* Wave: neighbors lift slightly when a card is hovered */
  &:hover ~ &:first-child { transform: translateY(-14px) rotate(0.4deg); }
  &:hover ~ &:nth-child(2) { transform: translateY(-10px) rotate(0.4deg); }
  &:hover ~ &:nth-child(3) { transform: translateY(-6px); }
  &:not(:first-child):hover + & { transform: translateY(-16px) rotate(0.5deg); }
  &:not(:first-child):hover + & + & { transform: translateY(-10px) rotate(0.5deg); }
  &:not(:first-child):hover + & + & + & { transform: translateY(-6px); }
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

export function VemulaTheme() {
  const cv = useCV();

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

        <CardsContainer>
          {cards.map((card, i) => {
            const isLast = i === cards.length - 1;
            return (
              <Card
                key={card.key}
                href={card.url || '#'}
                target={card.url ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{
                  '--card-from': card.palette.from,
                  '--card-to': card.palette.to,
                  '--card-label': card.palette.label,
                  zIndex: 10 + i,
                  marginRight: isLast ? 0 : 'var(--card-overlap)',
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
