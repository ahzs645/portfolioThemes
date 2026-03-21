import React, { useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCV } from '../../contexts/ConfigContext';
import NoiseCanvas from './components/NoiseCanvas';
import DitherOverlay from './components/DitherOverlay';
import TopBar from './components/TopBar';
import CustomCursor from './components/CustomCursor';
import HeroSection from './components/HeroSection';
import InfoSection from './components/InfoSection';
import ProjectsSection from './components/ProjectsSection';
import LogsSection from './components/LogsSection';
import CreditsSection from './components/CreditsSection';
import BottomBar from './components/BottomBar';

gsap.registerPlugin(ScrollTrigger);

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=IBM+Plex+Mono:wght@400;500&display=swap');

  html {
    scroll-behavior: smooth;
  }
`;

export function KellyChongTheme() {
  const cv = useCV();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (!cv) return;

    const sections = ['home', 'info', 'projects', 'logs', 'credits'];
    const triggers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSection(id),
        onEnterBack: () => setActiveSection(id),
      });
    });

    return () => triggers.forEach((t) => t?.kill());
  }, [cv]);

  const handleNavigate = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (!cv) return null;

  const currentRole = cv.experience[0];

  return (
    <>
      <GlobalStyles />
      <Page>
        {/* Background layers */}
        <DitherOverlay />
        <NoiseCanvas opacity={40} blendMode="multiply" />

        {/* Custom cursor */}
        <CustomCursor />

        {/* Fixed UI */}
        <TopBar activeSection={activeSection} onNavigate={handleNavigate} />
        <BottomBar location={cv.location} />

        {/* Content */}
        <ContentLayer>
          <HeroSection
            name={cv.name}
            title={currentRole?.title}
            company={currentRole?.company}
            summary={cv.about}
            email={cv.email}
            location={cv.location}
            website={cv.website}
          />
          <InfoSection cv={cv} />
          <ProjectsSection cv={cv} />
          <LogsSection cv={cv} />
          <CreditsSection cv={cv} />
        </ContentLayer>
      </Page>
    </>
  );
}

const Page = styled.main`
  position: relative;
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    rgb(93, 95, 207) -6%,
    rgb(180, 217, 250) 15%,
    rgb(242, 246, 250) 36%,
    rgb(242, 246, 250) 100%
  );
  overflow-x: hidden;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 3;
`;
