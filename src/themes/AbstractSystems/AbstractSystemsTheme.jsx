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
import Volunteer from './components/Volunteer';
import Publications from './components/Publications';
import Presentations from './components/Presentations';
import ProfDev from './components/ProfDev';
import CertsSkills from './components/CertsSkills';
import Connect from './components/Connect';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  /* blur-hover interaction — siblings dim when one is hovered */
  .blur-hover {
    transition: opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
                transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  @media (hover: hover) {
    .blur-hover-group:hover .blur-hover:not(:hover) {
      opacity: 0.4;
    }
    .blur-hover:hover {
      transform: translateX(2px);
    }
  }
`;

export function AbstractSystemsTheme({ darkMode }) {
  const cv = useCV();
  const theme = darkMode ? dark : light;

  if (!cv) return null;

  return (
    <Page $theme={theme}>
      <GlobalStyles />
      <Nav theme={theme} />
      <ScrollContainer id="as-scroll-container">
        <Content>
          <Hero cv={cv} theme={theme} />
          <Experience cv={cv} theme={theme} />
          <Activity theme={theme} />
          <Education cv={cv} theme={theme} />
          <Projects cv={cv} theme={theme} />
          <Awards cv={cv} theme={theme} />
          <Publications cv={cv} theme={theme} />
          <Presentations cv={cv} theme={theme} />
          <Volunteer cv={cv} theme={theme} />
          <ProfDev cv={cv} theme={theme} />
          <CertsSkills cv={cv} theme={theme} />
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

const TopMask = styled.div`
  position: fixed;
  top: var(--app-top-offset, 0px);
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
