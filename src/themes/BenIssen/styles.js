import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { C } from './helpers';

export const GlobalStyle = createGlobalStyle`
  body.benissen-locked { overflow: hidden; background: rgb(28, 28, 28); }
  .benissen-theme ::selection { background: rgba(255,255,255,0.18); color: #fff; }
`;

const pulseAnim = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1.0); opacity: 0.85; }
  50%      { transform: translate(-50%, -50%) scale(1.6); opacity: 0.0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const detailIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const Wrap = styled.div`
  position: fixed;
  inset: 0;
  background: ${C.bg};
  color: ${C.text};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  letter-spacing: -0.01em;
  overflow: hidden;
`;

export const CanvasEl = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
  z-index: 0;
`;

export const ToolbarDock = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  z-index: 30;
`;

export const ToolbarStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transform: ${(p) => (p.$open ? 'translateY(0)' : 'translateY(calc(100% + 8px))')};
  transition: transform 0.3s ease;
`;

export const GrabHandle = styled.button`
  width: 65px;
  height: 4px;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: grab;
  transition: background-color 0.2s ease;
  border: none;
  padding: 0;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 8px;

  &:hover { background-color: rgba(255, 255, 255, 0.85); }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 12px;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? 'auto' : 'none')};
  transition: opacity 0.3s ease;

  .swatch {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: transform 140ms ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  .swatch:hover { transform: scale(1.1); }
  .swatch.active { border-color: #fff; }

  .range {
    width: 45px;
    height: 4px;
    appearance: none;
    -webkit-appearance: none;
    background: rgba(255,255,255,0.3);
    border-radius: 10px;
    outline: none;
    cursor: pointer;
  }
  .range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    border: none;
  }

  .clear {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: rgb(105, 105, 105);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: color 140ms ease, transform 140ms ease;
    padding: 0;
  }
  .clear:hover { color: #fff; transform: scale(1.1); }
`;

export const Stage = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 28px 20px 100px;
  z-index: 10;
  pointer-events: none;
  overflow-y: auto;

  @media (max-width: 900px) {
    padding: 18px 14px 110px;
    align-items: start;
  }
`;

export const Card = styled.div`
  position: relative;
  background: ${C.card};
  border-radius: 30px;
  padding: 10px;
  width: min(960px, 100%);
  pointer-events: auto;
  box-shadow:
    rgba(0,0,0,0.53) 0px 0.7px 0.95px -1.25px,
    rgba(0,0,0,0.48) 0px 2.05px 2.87px -2.5px,
    rgba(0,0,0,0.37) 0px 5.4px 7.6px -3.75px,
    rgba(140,140,140,1) 0px 0px 0px 0.5px,
    rgba(0,0,0,0.25) 0px 4px 8px 0px,
    rgba(0,0,0,0.19) 0px 16px 73px -1px;
  animation: ${fadeIn} 480ms cubic-bezier(0.5,0,0.88,0.77) both;
`;

export const Grain = styled.div`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0.05;
  pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 256px 256px;
`;

export const Inset = styled.div`
  position: relative;
  background: ${C.inset};
  border: 0.5px solid ${C.border};
  border-radius: 22px;
  box-shadow: rgba(0,0,0,0.16) 0px 1px 2px 2px inset;
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 540px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

export const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 0.5px solid rgba(117,117,117,0.25);
  min-height: 0;

  @media (max-width: 900px) {
    border-right: none;
    border-bottom: 0.5px solid rgba(117,117,117,0.25);
  }
`;

export const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
`;

export const HeaderRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 12px;
  background: transparent;
  border: none;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: 14px;
  margin: 4px;
  transition: background 140ms ease;

  &:hover { background: rgba(255,255,255,0.025); }
`;

export const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6e6e6e, #2a2a2a);
  flex-shrink: 0;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  border: 0.5px solid rgba(255,255,255,0.08);

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

export const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;

  .n { font-size: 16px; font-weight: 600; color: ${C.text}; line-height: 1.2; }
  .t { font-size: 13px; color: ${C.textMid}; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

export const ToolsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 10px;
  padding: 5px;
  background: ${C.inset2};
  border-radius: 16px;
  box-shadow: 0 1px 0 0 rgba(0,0,0,0.25) inset;
`;

export const TabsScroll = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-width: 0;

  &::-webkit-scrollbar { display: none; }
`;

export const Tab = styled.button`
  flex: 0 0 auto;
  background: ${(p) => (p.$active ? C.tabActive : 'transparent')};
  border: 0.5px solid ${(p) => (p.$active ? C.borderHard : 'transparent')};
  color: ${C.text};
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.015em;
  padding: 7px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, opacity 140ms ease;
  opacity: ${(p) => (p.$active ? 1 : 0.8)};
  box-shadow: ${(p) => (p.$active ? '0 2px 4px rgba(0,0,0,0.25)' : 'none')};
  white-space: nowrap;

  &:hover { opacity: 1; }
`;

export const SearchBtn = styled.button`
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: rgb(227, 227, 227);
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 140ms ease;

  &:hover { opacity: 1; }
`;

export const ListWrap = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 6px 14px 14px;
  scrollbar-width: thin;
  scrollbar-color: #444 transparent;
  min-height: 0;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }

  @media (max-width: 900px) {
    max-height: 300px;
  }
`;

export const ItemBtn = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: ${(p) => (p.$active ? 'rgba(255,255,255,0.05)' : 'transparent')};
  border: none;
  padding: 12px 10px;
  color: inherit;
  font-family: inherit;
  cursor: pointer;
  border-bottom: 0.5px solid rgba(117,117,117,0.18);
  border-radius: 8px;
  transition: background 140ms ease, padding 140ms ease;
  position: relative;

  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255,255,255,0.04); padding-left: 14px; }

  .title-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
  }

  .title {
    font-size: 14px;
    font-weight: 500;
    color: ${C.text};
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .badge {
    font-size: 12px;
    color: ${C.textMuted};
    line-height: 1.5;
    letter-spacing: -0.01em;
  }

  .desc {
    font-size: 13px;
    color: ${C.textMid};
    line-height: 1.4;
    letter-spacing: -0.01em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

export const Empty = styled.div`
  padding: 32px 6px;
  text-align: center;
  color: ${C.textMuted};
  font-size: 13px;
`;

export const RightScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #444 transparent;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
`;

export const BioBody = styled.div`
  padding: 22px 26px 26px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  animation: ${detailIn} 280ms ease both;
`;

export const DetailBody = styled.div`
  padding: 22px 26px 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${detailIn} 280ms ease both;
`;

export const BackBtn = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 0.5px solid rgba(117,117,117,0.4);
  color: ${C.textMid};
  font-family: inherit;
  font-size: 12px;
  padding: 6px 12px 6px 8px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;

  &:hover {
    background: rgba(255,255,255,0.04);
    color: ${C.text};
    border-color: ${C.borderHard};
  }
`;

export const Loc = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .dot-wrap {
    position: relative;
    width: 16px;
    height: 16px;
  }
  .dot {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    background: ${C.pulse};
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .dot::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100%;
    height: 100%;
    background: ${C.pulse};
    border-radius: 50%;
    animation: ${pulseAnim} 1.6s ease-out infinite;
  }

  .text {
    font-size: 13px;
    color: ${C.textMid};
    letter-spacing: -0.01em;
  }
`;

export const BigName = styled.h1`
  margin: 0;
  font-size: clamp(34px, 5vw, 48px);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.05;
  color: ${C.text};
`;

export const DetailTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
`;

export const DetailTitle = styled.h2`
  margin: 0;
  font-size: clamp(24px, 3.4vw, 32px);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: ${C.text};
`;

export const StatusBadge = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${C.textMuted};
  border: 0.5px solid rgba(117,117,117,0.5);
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: -0.01em;
  text-transform: capitalize;
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12.5px;
  color: ${C.textMuted};

  span { display: inline-flex; gap: 5px; align-items: center; }
`;

export const BioText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: ${C.textMid};
    letter-spacing: -0.01em;
  }
`;

export const Highlights = styled.ul`
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    position: relative;
    padding-left: 18px;
    font-size: 13.5px;
    color: ${C.textMid};
    line-height: 1.55;
    letter-spacing: -0.01em;
  }
  li::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 9px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${C.borderHard};
  }
`;

export const Divider = styled.div`
  height: 0.5px;
  background: ${C.borderSoft};
  margin: 4px 0;
`;

export const Tagline = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${C.textMid};
  line-height: 1.5;
  letter-spacing: -0.01em;
`;

export const Authors = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${C.textMid};
  font-style: italic;
  line-height: 1.5;
  letter-spacing: -0.01em;
`;

export const VisitLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 10px 16px;
  background: ${C.white};
  color: #000;
  border-radius: 32px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  align-self: flex-start;
  transition: background 140ms ease;

  &:hover { background: #e6e6e6; }
`;

export const Newsletter = styled.form`
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;

  input[type='email'] {
    flex: 1;
    background: ${C.inset2};
    color: #fff;
    border: 1px solid rgba(237,237,237,0);
    border-radius: 32px;
    padding: 11px 16px;
    outline: none;
    font-family: inherit;
    font-size: 13px;
    letter-spacing: -0.01em;
    min-width: 0;

    &::placeholder { color: ${C.textMuted}; }
    &:focus { border-color: rgba(237,237,237,0.3); }
  }

  button {
    background: ${C.white};
    color: #000;
    border: none;
    border-radius: 32px;
    padding: 11px 22px;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.01em;
    transition: background 140ms ease;
    white-space: nowrap;

    &:hover { background: #e6e6e6; }
  }
`;

export const TagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Tag = styled.span`
  background: ${C.inset2};
  border: 0.5px solid rgba(117,117,117,0.4);
  color: ${C.textMid};
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: -0.01em;
`;

export const SubItem = styled.div`
  padding: 12px 14px;
  background: ${C.inset2};
  border: 0.5px solid rgba(117,117,117,0.3);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
    flex-wrap: wrap;
  }

  .title { font-weight: 600; font-size: 13.5px; color: ${C.text}; letter-spacing: -0.01em; }
  .meta  { font-size: 11.5px; color: ${C.textMuted}; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .sub   { font-size: 12.5px; color: ${C.textMid}; }
  .body  { font-size: 12.5px; color: ${C.textMid}; line-height: 1.55; margin-top: 4px; }
`;

export const SubList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
