import React, { useState, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { light, dark, FONT } from './utils/tokens';
import Header from './components/Header';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Education from './components/Education';
import Skills from './components/Skills';
import Footer from './components/Footer';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

export function AliciaPageTheme({ darkMode }) {
  const cv = useCV();
  const theme = darkMode ? dark : light;
  const [activeSection, setActiveSection] = useState(null);

  const handleNavigate = useCallback((id) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
  }, []);

  if (!cv) return null;

  return (
    <Page $theme={theme}>
      <GlobalStyles />
      <Header theme={theme} activeSection={activeSection} onNavigate={handleNavigate} />
      <Main>
        <Container>
          <Hero cv={cv} theme={theme} />
          <Experience cv={cv} theme={theme} />
          <Projects cv={cv} theme={theme} />
          <Education cv={cv} theme={theme} />
          <Skills cv={cv} theme={theme} />
        </Container>
      </Main>
      <Footer cv={cv} theme={theme} />
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${p => p.$theme.bg};
  color: ${p => p.$theme.primary};
  font-family: ${FONT.sans};
  -webkit-font-smoothing: antialiased;
  transition: background 0.3s, color 0.3s;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  max-width: 948px;
  width: 100%;
  padding: 0 16px 96px;
  @media (min-width: 768px) { padding: 0 32px 96px; }
  @media (min-width: 1024px) { padding: 0 48px 96px; }
`;
