import styled, { createGlobalStyle } from 'styled-components';
import { ACCENT, ASSETS } from './constants';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Alpha Lyrae';
    src: url('${ASSETS.alphaLyraeWoff2}') format('woff2');
    font-style: normal;
    font-weight: 500;
    font-display: swap;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    overflow: hidden;
    background: #000;
  }
`;

export const Page = styled.main`
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 34%, rgba(28, 28, 28, 0.95) 0%, #050505 34%, #000 70%),
    #000;
  color: ${ACCENT};
  font-family: 'Alpha Lyrae', sans-serif;
`;

export const AmbientGlowOne = styled.div`
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(64vw, 760px);
  height: 260px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(38, 38, 38, 0.9), rgba(0, 0, 0, 0));
  filter: blur(36px);
  opacity: 0.62;
`;

export const AmbientGlowTwo = styled.div`
  position: absolute;
  top: 54%;
  left: 50%;
  width: min(40vw, 520px);
  height: 240px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(120, 255, 223, 0.08), rgba(0, 0, 0, 0));
  filter: blur(60px);
  opacity: 0.88;
`;

export const BottomFade = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  height: 132px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000 100%);
`;

export const CenterColumn = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 100vh;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 32px 20px 40px;

  @media (max-width: 809.98px) {
    gap: 22px;
    padding-top: 28px;
  }
`;
