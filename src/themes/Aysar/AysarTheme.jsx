import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { light, dark, BREAKPOINT, FONT } from './utils/tokens';
import Header from './components/Header';
import Hero from './components/Hero';
import Work from './components/Work';
import Contact from './components/Contact';
import Footer from './components/Footer';

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
      <Header theme={theme} />
      <Main>
        <Hero cv={cv} theme={theme} />
        <Work cv={cv} theme={theme} />
        <Contact cv={cv} theme={theme} />
        <Footer cv={cv} theme={theme} />
      </Main>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background: ${p => p.$theme.background};
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
`;

const Main = styled.main`
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 20px;
  padding-bottom: 0;

  @media (max-width: ${BREAKPOINT}px) {
    padding: 60px 16px 0;
  }
`;
