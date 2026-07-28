import styled, { css, keyframes } from 'styled-components';

/**
 * Styles transcribed from the imsaud.me stylesheet.
 *
 * The source designs against a fixed 2560px-wide body and scales the whole
 * document to the viewport (`transform: scale(innerWidth / 2560)`). This theme
 * keeps that trick but scales a <Stage> inside the theme container instead of
 * the document, so it never touches the app shell.
 *
 * Sizes that the source expressed in rem are written in px here: the stage is a
 * fixed-width pixel canvas, so a reader's root font-size must not move it.
 */

/* ---------- palette ---------- */

const SILVER = 'linear-gradient(135deg, #c4c4c4, #757575, #303030 80%, #151515)';

export function ps2Palette(darkMode) {
  return {
    dark: darkMode,
    // The BIOS menu is black on a CRT. Light mode borrows the silver of the
    // console's own disc/save browser rather than inventing a palette.
    screenBg: darkMode ? '#000' : SILVER,
    browserBg: SILVER,
    cyan: 'rgb(40, 200, 255)',
    yellow: '#dddd55',
    gray: 'rgb(130, 130, 130)',
    ink: '#dcdcdc',
    orbBlend: darkMode ? 'screen' : 'normal',
    stroke: `2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000,
             2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000`,
    strokeLg: `3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000,
               3px 0 0 #000, -3px 0 0 #000, 0 3px 0 #000, 0 -3px 0 #000`,
    blur: '1.35px',
  };
}

const HELVETICA = `'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif`;

/* ---------- keyframes ---------- */

const tumble = keyframes`
  from { transform: translateZ(var(--tumble-tz)) scale(2.2) rotateX(0) rotateY(0) rotate(0); }
  to   { transform: translateZ(var(--tumble-tz)) scale(2.2) rotateX(var(--tumble-rx)) rotateY(var(--tumble-ry)) rotate(var(--tumble-rz)); }
`;

const faceBreathe = keyframes`
  0%, 100% { background: rgba(46,109,180,.3); box-shadow: inset 0 0 15px rgba(46,109,180,.5); border-color: rgba(46,109,180,.6); }
  25%      { background: rgba(0,172,159,.3);  box-shadow: inset 0 0 15px rgba(0,172,159,.5);  border-color: rgba(0,172,159,.6); }
  50%      { background: rgba(46,109,180,.3); box-shadow: inset 0 0 15px rgba(46,109,180,.5); border-color: rgba(46,109,180,.6); }
  75%      { background: rgba(75,0,130,.3);   box-shadow: inset 0 0 15px rgba(75,0,130,.5);   border-color: rgba(75,0,130,.6); }
`;

const flicker = keyframes`
  0%, 20%, 40%, 50%, 60%, 70%, 80%, 100% { opacity: .02; }
  5%, 35%, 55%  { opacity: .05; }
  15%, 45%, 85% { opacity: .06; }
  25%, 65%, 95% { opacity: .04; }
`;

const glowBreathe = keyframes`
  0%, 100% { opacity: .75; }
  50%      { opacity: 1; }
`;

const itemScaleIn = keyframes`
  from { transform: scale(0); }
  to   { transform: scale(1); }
`;

const spinCenter = keyframes`
  from { transform: rotateY(0); }
  to   { transform: rotateY(-360deg); }
`;

const geniePop = keyframes`
  from { transform: translateY(40%) scale(0); }
  to   { transform: translateY(0) scale(1); }
`;

const hoverFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(8px); }
`;

const floatSpin = keyframes`
  0%   { transform: scale(.533) rotateY(0)      rotateX(10deg) translateY(0); }
  50%  { transform: scale(.533) rotateY(180deg) rotateX(10deg) translateY(-30px); }
  100% { transform: scale(.533) rotateY(360deg) rotateX(10deg) translateY(0); }
`;

const rgbFlow = keyframes`
  from { background-position: -240px -360px; }
  to   { background-position: 0 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

/* ---------- shared text treatments ---------- */

// The source runs a sub-pixel blur over every label: it is standing in for the
// softness of a composite video signal, and without it the type looks too crisp
// to read as a console UI.
const crtText = css`
  filter: blur(${(p) => p.theme.blur});
  transform: translateZ(0);
`;

const promptText = css`
  ${crtText};
  color: ${(p) => p.theme.gray};
  text-shadow: ${(p) => p.theme.stroke}, 0 0 2px rgba(130, 130, 130, .5);
  opacity: .8;
  font-size: 55px;
  font-family: ${HELVETICA};
  letter-spacing: 3px;
  white-space: nowrap;
`;

/* ---------- shell ---------- */

export const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${(p) => (p.theme.dark ? '#000' : '#1a1a1a')};
  color: #fff;
  font-family: ${HELVETICA};
  contain: layout paint;
  -webkit-tap-highlight-color: transparent;

  * {
    box-sizing: border-box;
  }
`;

export const Stage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  user-select: none;
`;

export const CrtOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 900;
  pointer-events: none;
  background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, .4));

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, .25) 50%),
      linear-gradient(90deg, rgba(255, 0, 0, .06), rgba(0, 255, 0, .02), rgba(0, 0, 255, .06));
    background-size: 100% ${(p) => (p.$compact ? '8px' : '4px')}, ${(p) => (p.$compact ? '12px' : '6px')} 100%;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(18, 16, 16, .1);
    opacity: .03;
    animation: ${flicker} .15s infinite step-end;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after { animation: none; }
  }
`;

export const Screen = styled.div`
  position: absolute;
  inset: 0;
  display: ${(p) => (p.$visible ? 'flex' : 'none')};
  flex-direction: column;
  opacity: ${(p) => p.$opacity};
  transition: opacity ${(p) => p.$duration}ms ease;
  pointer-events: ${(p) => (p.$opacity > 0.5 ? 'auto' : 'none')};
`;

/* ---------- main menu ---------- */

export const MenuScreen = styled(Screen)`
  background: ${(p) => p.theme.screenBg};
`;

export const Ps2Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 60px;
  position: relative;
  transform-style: preserve-3d;

  ${(p) => p.$stack && css`
    flex-direction: column;
    justify-content: center;
    gap: 70px;
  `}
`;

export const Ps2Scene = styled.div`
  perspective: 800px;
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  position: relative;
  top: 20px;
  overflow: visible;
  transition: transform .5s ease;
  transform: ${(p) => {
    if (p.$stack) return p.$about ? 'translate(20px, 90px) scale(1.15)' : 'scale(1.1)';
    return p.$about ? 'translate(-160px, 20px)' : 'none';
  }};
`;

export const ClockSystemEl = styled.div`
  position: relative;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  transform: scale(1.8);
  will-change: transform;
`;

export const Orb = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  top: -4px;
  left: -4px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px 4px #fff, 0 0 20px 10px #0cf, 0 0 40px 15px #05f;
  mix-blend-mode: ${(p) => p.theme.orbBlend};
  will-change: transform;
`;

export const CubeField = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  transform: translateZ(120px) scale(${(p) => p.$scale});
  z-index: 10;
  display: ${(p) => (p.$visible ? 'block' : 'none')};
`;

export const Cube = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  transform-style: preserve-3d;
  animation: ${tumble} var(--tumble-dur, 14s) infinite linear;
  animation-delay: var(--tumble-delay, 0s);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: translateZ(var(--tumble-tz)) scale(2.2) rotateX(20deg) rotateY(-25deg);
  }
`;

export const CubeFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${(p) => (p.$active ? 'rgba(0, 5, 80, .8)' : 'rgba(11, 24, 203, .4)')};
  border: 1px solid ${(p) => (p.$active ? 'rgba(40, 80, 200, .9)' : 'rgba(130, 153, 255, .605)')};
  box-shadow: inset 0 0 ${(p) => (p.$active ? '25px rgba(20, 50, 150, .8)' : '15px rgba(255, 255, 255, .3)')};
  transition: all .2s;
  backface-visibility: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, .1);
  }
`;

export const ShapeField = styled.div`
  --hex-width: 20px;
  --hex-length: 205px;
  --hex-z: calc(var(--hex-width) * .866);
  --hex-cap-w: calc(var(--hex-width) * 2);
  --hex-cap-h: calc(var(--hex-width) * 1.732);
  --hex-margin-x: calc(var(--hex-width) * -.5);
  --hex-margin-y: calc(var(--hex-length) * -.5);
  --hex-cap-offset: calc(var(--hex-cap-h) * -.5);
  position: absolute;
  width: 0;
  height: 0;
  transform-origin: 50% 50%;
  transform-style: preserve-3d;
  display: ${(p) => (p.$visible ? 'block' : 'none')};
  will-change: transform;
`;

export const HexFace = styled.div`
  position: absolute;
  backface-visibility: hidden;
  background: rgba(40, 80, 220, .4);
  border: 1px solid rgba(150, 200, 255, .6);
  box-shadow: inset 0 0 15px rgba(255, 255, 255, .3);
  animation: ${faceBreathe} 25.1s infinite linear;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, .1);
  }

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const HexSide = styled(HexFace)`
  height: var(--hex-length);
  width: var(--hex-width);
  transform: rotateY(${(p) => p.$index * 60}deg) translateZ(var(--hex-z));
`;

export const HexCap = styled(HexFace)`
  width: var(--hex-cap-w);
  height: var(--hex-cap-h);
  left: var(--hex-margin-x);
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  ${(p) => (p.$top
    ? css`top: var(--hex-cap-offset); transform: rotateX(90deg);`
    : css`bottom: var(--hex-cap-offset); transform: rotateX(-90deg);`)}
`;

// The hour highlight is driven by a data attribute so the animation loop can
// move it without a React re-render every hour boundary.
export const Hex = styled.div`
  position: absolute;
  width: var(--hex-width);
  height: var(--hex-length);
  margin-left: var(--hex-margin-x);
  margin-top: var(--hex-margin-y);
  transform-style: preserve-3d;
  transform: rotate(${(p) => p.$angle}deg) translateY(-240px);

  &[data-hour='true'] ${HexFace} {
    animation: none;
    background: linear-gradient(
      to top,
      rgba(0, 255, 255, .9) var(--fill, 50%),
      rgba(10, 22, 18, .6) var(--fill, 50%)
    );
    box-shadow: inset 0 0 20px rgba(0, 255, 255, .7);
    border-color: rgba(0, 255, 255, .9);
  }

  &[data-hour='true'] ${HexCap} {
    background: rgba(0, 255, 255, .9);
  }

  &[data-hour='true'] ${HexCap}[data-cap='top'] {
    background: rgba(10, 22, 18, .6);
  }
`;

export const Ps2Nav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  text-align: center;
  font-size: 64px;
  letter-spacing: 3px;
  width: 420px;
  flex-shrink: 0;
  line-height: 1.1;
  transform: ${(p) => (p.$stack ? 'none' : 'translate(250px)')};
  margin-top: ${(p) => (p.$stack ? '90px' : '0')};
  visibility: ${(p) => (p.$hidden ? 'hidden' : 'visible')};
  opacity: ${(p) => (p.$hidden ? 0 : 1)};
  transition: opacity .4s ease;
`;

export const Ps2Item = styled.div`
  ${crtText};
  color: ${(p) => (p.$active ? p.theme.cyan : p.theme.gray)};
  text-shadow: ${(p) => (p.$active
    ? css`${p.theme.stroke}, 3px 3px 2px #000, 0 0 8px rgba(40, 200, 255, .6)`
    : css`${p.theme.stroke}, 0 0 2px rgba(130, 130, 130, .5)`)};
  opacity: ${(p) => (p.$active ? 1 : 0.8)};
  cursor: pointer;
`;

/* about panel that replaces the nav list when a cube is selected */

export const AboutPanel = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity .6s ease;
  display: ${(p) => (p.$visible ? 'block' : 'none')};
`;

export const AboutPanelInner = styled.div`
  position: absolute;
  top: ${(p) => (p.$stack ? 'auto' : '50%')};
  bottom: ${(p) => (p.$stack ? '18%' : 'auto')};
  right: ${(p) => (p.$stack ? '50%' : '10%')};
  transform: ${(p) => (p.$stack ? 'translateX(50%)' : 'translateY(-50%)')};
  width: ${(p) => (p.$stack ? '92%' : '1150px')};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 15px;
`;

export const AboutTitle = styled.div`
  ${crtText};
  color: ${(p) => p.theme.yellow};
  text-shadow: ${(p) => p.theme.stroke}, 3px 3px 2px #000, 0 0 8px rgba(221, 221, 85, .6);
  font-size: 63px;
`;

export const AboutText = styled.div`
  ${crtText};
  color: ${(p) => p.theme.cyan};
  text-shadow: 2.5px 2.5px 0 #000, -2.5px -2.5px 0 #000, 2.5px -2.5px 0 #000, -2.5px 2.5px 0 #000, 0 0 8px rgba(40, 200, 255, .6);
  font-size: 55px;
  line-height: 1.4;
`;

export const AboutDots = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 10px;
`;

export const AboutDot = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? p.theme.cyan : 'rgba(130, 130, 130, .5)')};
  box-shadow: ${(p) => (p.$active ? '0 0 10px rgba(40, 200, 255, .8)' : 'none')};
`;

/* ---------- footer prompt rows ---------- */

export const PromptRow = styled.div`
  position: absolute;
  bottom: 80px;
  display: flex;
  align-items: center;
  height: 60px;
  z-index: 100;

  span { ${promptText}; }
`;

export const SelectPrompt = styled(PromptRow)`
  left: ${(p) => (p.$stack ? '50%' : 'calc(50% - 375px)')};
  transform: translateX(-50%);
  bottom: ${(p) => (p.$stack ? '270px' : '80px')};
`;

export const SysPrompt = styled(PromptRow)`
  left: 50%;
  transform: translateX(-50%);
  bottom: ${(p) => (p.$stack ? '165px' : '80px')};
`;

export const NavPrompt = styled(PromptRow)`
  right: ${(p) => (p.$stack ? '50%' : '100px')};
  transform: ${(p) => (p.$stack ? 'translateX(50%)' : 'none')};
  bottom: ${(p) => (p.$stack ? '60px' : '80px')};
`;

export const ScreenFooter = styled.div`
  position: absolute;
  bottom: ${(p) => (p.$stack ? '40px' : '80px')};
  left: 0;
  width: 100%;
  height: ${(p) => (p.$stack ? 'auto' : '60px')};
  padding: ${(p) => (p.$stack ? '0' : '0 100px')};
  z-index: 100;

  ${(p) => p.$stack && css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  `}
`;

export const FooterCenter = styled.div`
  position: ${(p) => (p.$stack ? 'static' : 'absolute')};
  left: 50%;
  transform: ${(p) => (p.$stack ? 'none' : 'translateX(-50%)')};
  display: flex;
  align-items: center;
  gap: 40px;

  span { ${promptText}; }
`;

export const FooterRight = styled.div`
  position: ${(p) => (p.$stack ? 'static' : 'absolute')};
  right: 100px;
  display: flex;
  align-items: center;

  span { ${promptText}; }
`;

export const PromptButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: 0;
  padding: 10px 0;
  margin: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${(p) => p.theme.cyan};
    outline-offset: 6px;
  }
`;

/* ---------- controller / keyboard glyphs ---------- */

export const KeyCap = styled.div`
  background: #151515;
  border-radius: 6px;
  padding: 2px 2px 4px;
  border: 1px solid #000;
  box-shadow: 0 0 0 .8px #000, 0 4px 8px rgba(0, 0, 0, .8), inset 0 1px 1px rgba(255, 255, 255, .1);
  margin: 0 20px 0 15px;
  transform: scale(1.1);
  filter: blur(calc(${(p) => p.theme.blur} / 1.8));
  flex-shrink: 0;
`;

export const KeySurface = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #3a3a3a, #2a2a2a);
  border-radius: 4px;
  padding: 6px 14px;
  box-shadow: inset 0 2px 2px rgba(255, 255, 255, .15), inset 0 -2px 4px rgba(0, 0, 0, .6);
  color: #d8cd9b;
  font-family: Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 3px rgba(0, 0, 0, .9);
`;

export const ArrowKeys = styled.div`
  display: flex;
  flex-direction: ${(p) => (p.$row ? 'row' : 'column')};
  align-items: center;
  transform: scale(1.1);
  margin: 0 25px 0 15px;
  filter: blur(calc(${(p) => p.theme.blur} / 1.8));
`;

export const ArrowRow = styled.div`
  display: flex;
  justify-content: center;
`;

export const SquareKey = styled.div`
  background: #151515;
  border-radius: 6px;
  padding: 2px 2px 4px;
  border: 1px solid #000;
  box-shadow: 0 0 0 .8px #000, 0 4px 8px rgba(0, 0, 0, .8), inset 0 1px 1px rgba(255, 255, 255, .1);
  margin: 2px;
`;

export const SquareSurface = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #3a3a3a, #2a2a2a);
  border-radius: 4px;
  width: 24px;
  height: 24px;
  box-shadow: inset 0 2px 2px rgba(255, 255, 255, .15), inset 0 -2px 4px rgba(0, 0, 0, .6);
  color: #d4d422;
  font-family: Arial, sans-serif;
  font-size: 14px;
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 3px rgba(0, 0, 0, .9);
`;

export const PadButton = styled.div`
  width: 34px;
  height: 34px;
  background: #2b2b2b;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 0 1.1px #000, inset 1px 1px 3px rgba(255, 255, 255, .2),
    inset -2px -2px 4px rgba(0, 0, 0, .8), 2px 2px 4px rgba(0, 0, 0, .6);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1.8);
  margin: 0 25px 0 15px;
  flex-shrink: 0;
  filter: blur(calc(${(p) => p.theme.blur} / 1.8));
`;

export const CrossGlyph = styled.div`
  position: relative;
  width: 18px;
  height: 18px;
  filter: drop-shadow(0 -1px 0 rgba(0, 0, 0, .5)) drop-shadow(0 1px 0 rgba(255, 255, 255, .15));

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 4px;
    background: #7ca0e6;
    top: 7px;
    left: 0;
    border-radius: .5px;
  }

  &::before { transform: rotate(45deg); }
  &::after  { transform: rotate(-45deg); }
`;

export const CircleGlyph = styled.div`
  position: relative;
  width: 18px;
  height: 18px;
  filter: drop-shadow(0 -1px 0 rgba(0, 0, 0, .5)) drop-shadow(0 1px 0 rgba(255, 255, 255, .15));

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 36px;
    height: 36px;
    border: 4px solid #f65e5e;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(.5);
  }
`;

export const DPad = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, .5)) blur(calc(${(p) => p.theme.blur} / 1.8));
  transform: scale(1.8);
  margin: 0 25px 0 15px;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: -1.5px;
    left: 10.5px;
    width: 17px;
    height: 41px;
    background: #000;
    border-radius: 1.5px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 10.5px;
    left: -1.5px;
    width: 41px;
    height: 17px;
    background: #000;
    border-radius: 1.5px;
  }
`;

export const DPadDir = styled.div`
  position: absolute;
  z-index: 1;
  background: ${(p) => (p.$active ? '#255bb1' : '#2b2b2b')};
  box-shadow: ${(p) => (p.$active
    ? 'inset 1px 1px 2px rgba(255,255,255,.5), inset -1px -1px 3px rgba(0,0,0,.6)'
    : 'inset 1px 1px 2px rgba(255,255,255,.3), inset -1px -1px 3px rgba(0,0,0,.8)')};

  ${(p) => p.$dir === 'up' && css`
    left: 12px; top: 0; width: 14px; height: 18px;
    clip-path: polygon(0 0, 100% 0, 100% 65%, 50% 100%, 0 65%);
  `}
  ${(p) => p.$dir === 'down' && css`
    left: 12px; bottom: 0; width: 14px; height: 18px;
    clip-path: polygon(50% 0, 100% 35%, 100% 100%, 0 100%, 0 35%);
  `}
  ${(p) => p.$dir === 'left' && css`
    top: 12px; left: 0; width: 18px; height: 14px;
    clip-path: polygon(0 0, 65% 0, 100% 50%, 65% 100%, 0 100%);
  `}
  ${(p) => p.$dir === 'right' && css`
    top: 12px; right: 0; width: 18px; height: 14px;
    clip-path: polygon(35% 0, 100% 0, 100% 100%, 35% 100%, 0 50%);
  `}
`;

/* ---------- save browser ---------- */

export const BrowserScreenEl = styled(Screen)`
  background: ${(p) => p.theme.browserBg};
  color: #e0e0e0;
  overflow: hidden;
`;

export const BrowserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  padding: 65px 50px;
  font-size: 64px;
  font-weight: 700;
  color: #dcdcdc;
  background: linear-gradient(180deg, rgba(0, 0, 0, .6), transparent);
  text-shadow: ${(p) => p.theme.strokeLg}, 0 0 8px rgba(0, 0, 0, .6);

  small { font-size: 44px; }
`;

export const BrowserTitle = styled.span`
  ${crtText};
  color: ${(p) => p.theme.yellow};
  text-align: right;
  text-shadow: ${(p) => p.theme.strokeLg}, 0 0 8px rgba(0, 0, 0, .6);
  letter-spacing: 2px;
`;

export const BrowserGridWrap = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 5%;
`;

export const BrowserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$columns}, 150px);
  gap: 60px;
  justify-content: center;
  transform: scale(${(p) => (p.$stack ? 2.1 : 1.6)});
`;

export const BrowserItem = styled.div`
  position: relative;
  justify-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: ${(p) => (p.$shown ? 'scale(1)' : 'scale(0)')};
  animation: ${(p) => (p.$shown ? css`${itemScaleIn} .3s ease-out` : 'none')};

  &::after {
    content: '';
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 20px 10px #fff, 0 0 50px 25px rgba(255, 255, 255, .9), 0 0 90px 40px rgba(200, 230, 255, .6);
    opacity: ${(p) => (p.$active ? 1 : 0)};
    animation: ${(p) => (p.$active ? css`${glowBreathe} 2.5s ease-in-out infinite` : 'none')};
    pointer-events: none;
    z-index: 2;
  }
`;

export const BrowserLoading = styled.div`
  ${crtText};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 112px;
  color: #b5b5b5;
  text-shadow: ${(p) => p.theme.strokeLg}, 0 0 12px rgba(181, 181, 181, .6);
  z-index: 10;
`;

export const DetailOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: ${(p) => (p.$stack ? 'column' : 'row')};
  align-items: center;
  justify-content: center;
  padding: ${(p) => (p.$stack ? '6% 6%' : '0 10%')};
  background: ${(p) => p.$tint};
  animation: ${fadeIn} .3s ease-out;
`;

export const DetailCardWrap = styled.div`
  flex: ${(p) => (p.$stack ? '0 0 auto' : '1')};
  display: flex;
  justify-content: center;
  perspective: 1600px;
  margin-bottom: ${(p) => (p.$stack ? '60px' : '0')};
`;

// Two back-to-back faces, as on the source, so the card never vanishes
// edge-on while it spins.
export const DetailCard = styled.div`
  position: relative;
  transform-style: preserve-3d;
  animation: ${spinCenter} 4s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  > *:first-child { transform: translateZ(1px); }

  > *:last-child {
    position: absolute;
    inset: 0;
    transform: rotateY(180deg) translateZ(1px);
  }
`;

export const DetailInfo = styled.div`
  flex: ${(p) => (p.$stack ? '0 0 auto' : '1')};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: ${geniePop} .4s ease-out;
  width: 100%;
`;

export const DetailTitle = styled.div`
  ${crtText};
  color: ${(p) => p.theme.yellow};
  text-shadow: ${(p) => p.theme.stroke}, 3px 3px 2px #000, 0 0 8px rgba(221, 221, 85, .6);
  font-size: 63px;
`;

export const DetailMeta = styled.div`
  color: #dcdcdc;
  text-shadow: ${(p) => p.theme.strokeLg}, 0 0 8px rgba(0, 0, 0, .6);
  font-size: 40px;
  line-height: 1.4;
  white-space: pre-line;
`;

export const DetailDesc = styled.div`
  color: rgb(200, 200, 200);
  text-shadow: 2px 2px 0 #000;
  font-size: 26px;
  text-align: left;
  margin: 25px auto 0;
  white-space: pre-line;
  line-height: 1.5;
  width: 82%;
  max-height: 400px;
  overflow: hidden;
`;

export const DetailActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  align-items: center;
  margin-top: 40px;
`;

export const DetailAction = styled.div`
  ${crtText};
  font-size: 55px;
  cursor: pointer;
  color: ${(p) => (p.$active ? '#28c8ff' : '#828282')};
  text-shadow: ${(p) => (p.$active
    ? css`${p.theme.stroke}, 3px 3px 2px #000, 0 0 8px rgba(40, 200, 255, .6)`
    : css`${p.theme.stroke}, 3px 3px 2px #000, 0 0 8px rgba(130, 130, 130, .6)`)};
`;

/* ---------- save icon (drawn, never an image) ---------- */

export const SaveIcon = styled.div`
  position: relative;
  width: ${(p) => p.$width}px;
  height: ${(p) => Math.round(p.$width * 0.72)}px;
  transform: ${(p) => (p.$flat ? 'none' : 'perspective(300px) rotateX(-30deg)')};
  backface-visibility: hidden;
  filter: brightness(${(p) => (p.$active ? 1.1 : 0.55)});
  transition: filter .15s ease;
  background:
    radial-gradient(120% 140% at 30% 0%, rgba(80, 150, 255, .55), transparent 60%),
    linear-gradient(160deg, #14224e, #060b1c 70%);
  border: 2px solid rgba(255, 255, 255, .15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${(p) => Math.round(p.$width * 0.03)}px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(120, 190, 255, .16) 1px, transparent 1px),
      linear-gradient(90deg, rgba(120, 190, 255, .16) 1px, transparent 1px);
    background-size: ${(p) => Math.round(p.$width * 0.1)}px ${(p) => Math.round(p.$width * 0.1)}px;
  }
`;

export const SaveIconInitials = styled.div`
  position: relative;
  font-size: ${(p) => Math.round(p.$width * 0.3)}px;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(190, 235, 255, .95);
  text-shadow: 0 0 ${(p) => Math.round(p.$width * 0.08)}px rgba(40, 200, 255, .8), 2px 2px 0 #000;
`;

export const SaveIconLabel = styled.div`
  position: relative;
  font-size: ${(p) => Math.max(7, Math.round(p.$width * 0.062))}px;
  letter-spacing: ${(p) => Math.max(1, Math.round(p.$width * 0.012))}px;
  color: rgba(200, 220, 255, .7);
  text-transform: uppercase;
  text-shadow: 1px 1px 0 #000;
  padding: 0 6%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

/* ---------- FAQ ---------- */

export const FaqScreenEl = styled(Screen)`
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: ${(p) => p.theme.screenBg};
`;

export const FaqGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: ${(p) => (p.$stack ? '600px' : '1400px')};
  align-items: flex-start;
  justify-content: center;
  gap: 60px 20px;
  transform: ${(p) => (p.$stack ? `scale(1.5) translateY(${p.$offset}px)` : 'none')};
  transition: transform .35s cubic-bezier(.25, 1, .5, 1);
`;

export const FaqItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 280px;
  position: relative;
  perspective: 800px;
  cursor: pointer;
`;

export const FaqQuestion = styled.div`
  ${crtText};
  color: ${(p) => p.theme.yellow};
  font-size: 35px;
  text-shadow: ${(p) => p.theme.strokeLg}, 4px 4px 3px #000, 0 0 8px rgba(221, 221, 85, .6);
  text-align: center;
  height: 100px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  top: -32px;
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transition: opacity .3s;
  animation: ${hoverFloat} 1.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const FaqTriangle = styled.div`
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 20px solid ${(p) => p.theme.yellow};
  filter: blur(1px) drop-shadow(2px 2px 0 #000) drop-shadow(-2px -2px 0 #000) drop-shadow(4px 4px 3px #000);
  margin-bottom: 20px;
  position: relative;
  top: -20px;
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transition: opacity .3s;
  animation: ${hoverFloat} 1.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const FaqAnswer = styled.div`
  ${crtText};
  font-family: ${HELVETICA};
  font-size: 22px;
  color: ${(p) => p.theme.cyan};
  text-shadow: ${(p) => p.theme.stroke}, 3px 3px 2px #000, 0 0 8px rgba(40, 200, 255, .6);
  line-height: 1.5;
  text-align: center;
  margin-top: 10px;
  height: 140px;
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transition: opacity .3s;
`;

/* ---------- memory card (CSS, no bitmap) ---------- */

export const MemCard = styled.div`
  width: 240px;
  height: 360px;
  position: relative;
  transform-style: preserve-3d;
  transform: scale(.533) rotateY(-20deg) rotateX(10deg);
  transition: transform .3s;
  margin: ${(p) => (p.$bare ? '0' : '-80px 0')};
  opacity: ${(p) => (p.$covered ? 0.12 : 1)};

  ${(p) => p.$spin && css`
    animation: ${floatSpin} 6s infinite linear;

    @media (prefers-reduced-motion: reduce) { animation: none; }
  `}
`;

const memFace = css`
  position: absolute;
  background: #191919;
  border: 1px solid rgba(100, 100, 100, .3);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, .8);
  filter: brightness(${(p) => (p.$active ? 1.1 : 0.4)});
  transition: filter .3s;
  overflow: hidden;

  ${(p) => p.$rainbow && css`
    background-image: linear-gradient(135deg, #ff004c, #ff7a00, #ffe600, #00ff85, #00d4ff, #4d6bff, #b14bff, #ff004c, #ff7a00, #ffe600, #00ff85, #00d4ff, #4d6bff, #b14bff, #ff004c);
    background-size: 600px 600px;
    border-color: rgba(255, 255, 255, .55);
    filter: brightness(1.12) saturate(1.35);
    animation: ${rgbFlow} 6s linear infinite;

    @media (prefers-reduced-motion: reduce) { animation: none; }
  `}
`;

export const MemFaceFront = styled.div`
  ${memFace};
  width: 240px;
  height: 360px;
  transform: translateZ(30px);
`;

export const MemFaceBack = styled.div`
  ${memFace};
  width: 240px;
  height: 360px;
  transform: rotateY(180deg) translateZ(30px);
`;

export const MemFaceSide = styled.div`
  ${memFace};
  width: 60px;
  height: 360px;
  left: 90px;
  top: 0;
  transform: rotateY(${(p) => (p.$left ? '-90deg' : '90deg')}) translateZ(120px);
`;

export const MemFaceCap = styled.div`
  ${memFace};
  width: 240px;
  height: 60px;
  left: 0;
  top: 150px;
  transform: rotateX(${(p) => (p.$top ? '90deg' : '-90deg')}) translateZ(180px);
`;

// The plastic shell of a PS2 memory card, drawn rather than photographed:
// a moulded body, the connector notch, two screw dimples and an embossed label.
export const MemCardArt = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(155deg, #43464e 0%, #23262d 42%, #15171c 100%);
  display: ${(p) => (p.$rainbow ? 'none' : 'block')};

  &::before {
    content: '';
    position: absolute;
    top: 4%;
    left: 32%;
    width: 36%;
    height: 6%;
    background: rgba(0, 0, 0, .45);
    clip-path: polygon(0 100%, 22% 0, 78% 0, 100% 100%);
  }

  &::after {
    content: '';
    position: absolute;
    left: 6%;
    right: 6%;
    top: 48%;
    bottom: 8%;
    border-radius: 6px;
    background: rgba(255, 255, 255, .03);
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, .07), inset 0 -1px 2px rgba(0, 0, 0, .5);
  }
`;

export const MemCardScrew = styled.span`
  position: absolute;
  top: 6%;
  ${(p) => (p.$right ? 'right: 8%;' : 'left: 8%;')}
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, .35);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, .12);
`;

export const MemCardStamp = styled.div`
  position: absolute;
  top: 24%;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(150, 155, 165, .85);
  font-family: ${HELVETICA};
  text-shadow: 0 1px 0 rgba(0, 0, 0, .8), 0 -1px 0 rgba(255, 255, 255, .06);

  strong {
    display: block;
    font-size: 54px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  em {
    display: block;
    font-style: normal;
    font-size: 26px;
    letter-spacing: 3px;
  }
`;

/* ---------- "Little Secrets" ---------- */

export const GemCorner = styled.div`
  position: absolute;
  top: 60px;
  right: 80px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const GemLabel = styled.div`
  ${crtText};
  color: ${(p) => p.theme.yellow};
  font-size: 35px;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  position: relative;
  z-index: 2;
  margin-bottom: -30px;
  text-shadow: ${(p) => p.theme.strokeLg}, 4px 4px 3px #000, 0 0 8px rgba(221, 221, 85, .6);
  animation: ${hoverFloat} 1.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const GemButton = styled.button`
  perspective: 800px;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  outline: none;

  &:hover,
  &:focus-visible {
    filter: drop-shadow(0 0 14px rgba(255, 255, 255, .55));
  }
`;

export const SecretsOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, .78);
  padding: 4% 4%;
`;

export const SecretsBox = styled.div`
  width: 1340px;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  background: rgba(10, 12, 22, .96);
  border: 2px solid rgba(120, 150, 220, .35);
  box-shadow: 0 0 40px rgba(0, 0, 0, .8), inset 0 0 40px rgba(20, 40, 120, .35);
  padding: 50px 60px 60px;
`;

export const SecretsTitle = styled.div`
  ${crtText};
  color: ${(p) => p.theme.yellow};
  font-size: 55px;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: ${(p) => p.theme.stroke}, 0 0 8px rgba(221, 221, 85, .6);
`;

export const SecretItem = styled.div`
  border-top: 1px solid rgba(120, 150, 220, .25);
  padding: 18px 0;
`;

export const SecretHead = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: ${(p) => (p.$open ? p.theme.cyan : p.theme.ink)};
  font-family: ${HELVETICA};
  font-size: 36px;
  text-shadow: 2px 2px 0 #000;

  span:first-child {
    transform: rotate(${(p) => (p.$open ? '90deg' : '0')});
    transition: transform .2s ease;
  }
`;

export const SecretBody = styled.p`
  color: rgba(200, 215, 235, .9);
  font-size: 28px;
  line-height: 1.55;
  margin: 14px 0 0;
  text-shadow: 1px 1px 0 #000;
`;

/* ---------- contact ---------- */

export const ContactScreenEl = styled(Screen)`
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: ${(p) => p.theme.screenBg};
`;

export const ContactInner = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${(p) => (p.$stack ? '0' : '-10%')};
`;

export const ContactTitle = styled.h1`
  ${crtText};
  color: ${(p) => p.theme.yellow};
  font-size: 72px;
  font-family: ${HELVETICA};
  font-weight: 400;
  margin: 0 0 50px;
  text-shadow: ${(p) => p.theme.stroke}, 3px 3px 2px #000, 0 0 8px rgba(221, 221, 85, .6);
  letter-spacing: 3px;
`;

export const ContactSocials = styled.div`
  display: flex;
  gap: 80px;
  margin-bottom: 50px;
`;

export const SocialIcon = styled.a`
  ${crtText};
  color: ${(p) => (p.$active ? p.theme.cyan : p.theme.gray)};
  text-shadow: ${(p) => (p.$active
    ? css`${p.theme.stroke}, 3px 3px 2px #000, 0 0 8px rgba(40, 200, 255, .6)`
    : css`${p.theme.stroke}, 0 0 2px rgba(130, 130, 130, .5)`)};
  opacity: ${(p) => (p.$active ? 1 : 0.8)};
  width: 80px;
  height: 80px;
  display: block;
  cursor: pointer;
  text-decoration: none;
  transition: color .2s, opacity .2s;

  &:focus-visible { outline: none; }
`;

export const ContactDivider = styled.div`
  width: 100%;
  height: 2px;
  background: rgba(130, 130, 130, .5);
  margin-bottom: 50px;
  box-shadow: 0 0 5px rgba(0, 0, 0, .8);
`;

export const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
`;

const contactField = css`
  ${crtText};
  background: rgba(0, 0, 0, .4);
  border: 2px solid ${(p) => (p.$active ? p.theme.cyan : 'rgba(130, 130, 130, .5)')};
  color: ${(p) => (p.$active ? p.theme.cyan : p.theme.gray)};
  text-shadow: ${(p) => p.theme.stroke}, 0 0 2px rgba(130, 130, 130, .5);
  font-family: ${HELVETICA};
  font-size: 40px;
  letter-spacing: 2px;
  padding: 15px 20px;
  outline: none;
  width: 100%;
  box-shadow: ${(p) => (p.$active ? 'inset 0 0 10px rgba(40,200,255,.2), 0 0 10px rgba(40,200,255,.4)' : 'none')};
  transition: border-color .2s, color .2s, box-shadow .2s;

  &::placeholder {
    color: ${(p) => p.theme.gray};
    opacity: .5;
    text-shadow: none;
  }
`;

export const ContactInput = styled.input`${contactField}`;

export const ContactTextarea = styled.textarea`
  ${contactField};
  height: 300px;
  resize: none;
`;

export const ContactSubmit = styled.button`
  ${crtText};
  background: transparent;
  border: none;
  color: ${(p) => (p.$active ? p.theme.cyan : p.theme.gray)};
  text-shadow: ${(p) => (p.$active
    ? css`${p.theme.stroke}, 3px 3px 2px #000, 0 0 8px rgba(40, 200, 255, .6)`
    : css`${p.theme.stroke}, 0 0 2px rgba(130, 130, 130, .5)`)};
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${HELVETICA};
  font-size: 40px;
  letter-spacing: 2px;
  cursor: pointer;
  padding: 10px;
  margin-top: 10px;
  outline: none;
  transition: color .2s;
`;

export const ContactNote = styled.p`
  ${crtText};
  color: ${(p) => p.theme.gray};
  font-size: 26px;
  letter-spacing: 1px;
  margin: 18px 0 0;
  text-align: center;
  text-shadow: ${(p) => p.theme.stroke};
`;
