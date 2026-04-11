import styled, { createGlobalStyle, keyframes } from 'styled-components';

export const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;700;900&display=swap');

  .vemula-theme ::selection { background-color: #FFC000; color: #000; }
  .vemula-theme ::-moz-selection { background-color: #FFC000; color: #000; }
  body.vemula-locked { overflow: hidden; }
`;

export const Page = styled.div`
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

export const Title = styled.h1`
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

export const Subtitle = styled.div`
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

export const CardsContainer = styled.div`
  position: fixed;
  bottom: -5%;
  left: 20px;
  right: 20px;
  display: none;
  flex-wrap: nowrap;
  justify-content: center;
  z-index: 5;
  pointer-events: none;

  @media (min-width: 768px) {
    display: flex;
    left: 30px;
    right: 30px;
  }
  @media (min-width: 1024px) {
    left: 47px;
    right: 47px;
  }
`;

export const Card = styled.button`
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

export const StackContainer = styled.div`
  position: fixed;
  top: 62%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(76vw, 273px);
  aspect-ratio: 273 / 362.7;
  perspective: 600px;
  z-index: 5;
  pointer-events: none;

  @media (min-width: 768px) { display: none; }
`;

export const StackCard = styled.button`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(155deg, var(--card-from), var(--card-to));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  transform-origin: 90% 90%;
  transform: scale(var(--card-scale)) rotateZ(var(--card-rot));
  transition:
    transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease,
    opacity 0.4s ease;
  transition-delay: var(--enter-delay, 0ms);
  will-change: transform, opacity;

  &.vemula-hidden {
    transform: scale(0) rotateZ(0deg);
    opacity: 0;
    pointer-events: none;
  }
  &.vemula-entered:active {
    transform: scale(calc(var(--card-scale) * 0.97)) rotateZ(var(--card-rot));
  }
`;

export const CardLabel = styled.div`
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

export const CardCount = styled.div`
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

export const CardTitle = styled.div`
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

export const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: var(--detail-bg, #ffffff);
  color: var(--detail-fg, #202020);
  overflow-y: auto;
  animation: ${detailFadeIn} 0.35s ease both;
`;

export const DetailInner = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 80px;
  animation: ${detailSlideUp} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;

  @media (min-width: 768px) { padding: 36px 40px 100px; }
  @media (min-width: 1024px) { padding: 56px 64px 120px; }
`;

export const BackButton = styled.button`
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

export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid currentColor;
  margin-bottom: 32px;

  @media (min-width: 768px) { padding-bottom: 32px; margin-bottom: 48px; }
`;

export const DetailLabel = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 8px;
`;

export const DetailTitle = styled.h2`
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

export const DetailItem = styled.article`
  padding: 24px 0;
  border-bottom: 1px solid currentColor;

  &:last-child { border-bottom: none; }

  @media (min-width: 768px) { padding: 32px 0; }
`;

export const ItemTitle = styled.h3`
  font-family: 'Fraunces', Georgia, serif;
  font-variation-settings: 'opsz' 144;
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.1;
  margin: 0 0 6px;

  @media (min-width: 768px) { font-size: 2rem; }
`;

export const ItemSubtitle = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  font-weight: 400;
  opacity: 0.8;
  margin-bottom: 4px;

  @media (min-width: 768px) { font-size: 1.05rem; }
`;

export const ItemMeta = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.65;
  margin-bottom: 16px;
`;

export const ItemBody = styled.p`
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.1rem;
  line-height: 1.55;
  margin: 12px 0;
  max-width: 70ch;
`;

export const ItemHighlights = styled.ul`
  margin: 12px 0 0;
  padding: 0 0 0 20px;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.05rem;
  line-height: 1.55;
  max-width: 70ch;

  li { margin-bottom: 8px; }
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
`;

export const Tag = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 8px 14px;
  border: 1px solid currentColor;
  border-radius: 999px;
`;

export const LinkRow = styled.a`
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
