import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Education from './components/Education';
import Languages from './components/Languages';
import Contact from './components/Contact';
import Footer from './components/Footer';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
`;

const GlobalReset = createGlobalStyle`
  html {
    scroll-behavior: smooth;
  }
`;

export function FaizRaeimTheme() {
  const cv = useCV();
  if (!cv) return null;

  return (
    <Page>
      <FontLoader />
      <GlobalReset />
      <Navigation />
      <Hero cv={cv} />
      <About cv={cv} />
      <Experience cv={cv} />
      <Skills cv={cv} />
      <Projects cv={cv} />
      <Education cv={cv} />
      <Languages cv={cv} />
      <Contact cv={cv} />
      <Footer cv={cv} />
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background: #18181b;
  color: #f4f4f5;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Figtree', 'Inter', system-ui, sans-serif;
  }
`;
