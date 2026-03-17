import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { light, dark, BREAKPOINT, FONT } from './utils/tokens';
import Header from './components/Header';
import Hero from './components/Hero';
import Work from './components/Work';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700&display=swap');
`;

export function AysarTheme({ darkMode }) {
  const cv = useCV();
  const theme = darkMode ? dark : light;

  if (!cv) return null;

  return (
    <Page $theme={theme}>
      <FontLoader />
      <Header theme={theme} cv={cv} />
      <Main>
        <Hero cv={cv} theme={theme} />
        <Work cv={cv} theme={theme} />
        <Copyright $theme={theme}>
          &copy; {new Date().getFullYear()} {cv.name || 'Portfolio'}. All rights reserved.
        </Copyright>
      </Main>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background: ${p => p.$theme.background};
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
`;

const Main = styled.main`
  width: 100%;
  max-width: 680px;
  padding: 0 20px 100px;

  @media (max-width: ${BREAKPOINT}px) {
    padding: 50px 16px 80px;
  }
`;

const Copyright = styled.footer`
  text-align: center;
  padding: 40px 0 0;
  color: ${p => p.$theme.muted};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;
