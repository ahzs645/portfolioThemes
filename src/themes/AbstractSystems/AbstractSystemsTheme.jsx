import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { light, dark, FONT, BREAKPOINT } from './utils/tokens';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Education from './components/Education';
import Projects from './components/Projects';
import Awards from './components/Awards';
import Activity from './components/Activity';
import Connect from './components/Connect';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
`;

export function AbstractSystemsTheme({ darkMode }) {
  const cv = useCV();
  const theme = darkMode ? dark : light;

  if (!cv) return null;

  return (
    <Page $theme={theme}>
      <FontLoader />
      <Nav theme={theme} />
      <ScrollContainer id="as-scroll-container">
        <Content>
          <Hero cv={cv} theme={theme} />
          <Spacer />
          <Experience cv={cv} theme={theme} />
          <Spacer />
          <Activity theme={theme} />
          <Spacer />
          <Education cv={cv} theme={theme} />
          <Spacer />
          <Projects cv={cv} theme={theme} />
          <Spacer />
          <Awards cv={cv} theme={theme} />
          <Spacer />
          <Connect cv={cv} theme={theme} />
          <Footer $theme={theme}>
            <FooterDate $theme={theme}>
              {new Date().toISOString().slice(0, 10).replace(/-/g, '')}
            </FooterDate>
          </Footer>
        </Content>
        <TopMask $theme={theme} />
        <BottomMask $theme={theme} />
      </ScrollContainer>
    </Page>
  );
}

const Page = styled.div`
  height: 100%;
  width: 100%;
  background: ${p => p.$theme.bg};
  color: ${p => p.$theme.body};
  font-family: ${FONT.sans};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
`;

const ScrollContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow-y: auto;
  position: relative;
`;

const Content = styled.main`
  max-width: 492px;
  margin: 0 auto;
  padding: 130px 24px 80px;

  @media (max-width: ${BREAKPOINT}px) {
    padding: 130px 20px 60px;
  }
`;

const Spacer = styled.div`
  height: 40px;
`;

const TopMask = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, ${p => p.$theme.bg}, ${p => p.$theme.bg}00);
  pointer-events: none;
  z-index: 40;

  @media (max-width: ${BREAKPOINT}px) {
    height: 40px;
  }
`;

const BottomMask = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, ${p => p.$theme.bg}, ${p => p.$theme.bg}00);
  pointer-events: none;
  z-index: 40;

  @media (max-width: ${BREAKPOINT}px) {
    height: 40px;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 40px 0 0;
`;

const FooterDate = styled.span`
  font-family: ${FONT.mono};
  font-size: 11px;
  letter-spacing: 0.04em;
  color: ${p => p.$theme.muted};
`;
