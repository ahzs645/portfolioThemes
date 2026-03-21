import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import gsap from 'gsap';
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

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

export function KellyChongTheme() {
  const cv = useCV();
  const [activeTab, setActiveTab] = useState('home');
  const contentRef = useRef(null);

  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;

    const content = contentRef.current;
    if (!content) {
      setActiveTab(tab);
      return;
    }

    // Animate out current content
    gsap.to(content, {
      opacity: 0,
      y: -12,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(tab);
        // Animate in new content
        gsap.fromTo(
          content,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      },
    });
  }, [activeTab]);

  // Animate first load
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, []);

  if (!cv) return null;

  const currentRole = cv.experience[0];

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HeroSection
            name={cv.name}
            title={currentRole?.title}
            company={currentRole?.company}
            summary={cv.about}
            email={cv.email}
            location={cv.location}
            website={cv.website}
          />
        );
      case 'info':
        return <InfoSection cv={cv} />;
      case 'projects':
        return <ProjectsSection cv={cv} />;
      case 'logs':
        return <LogsSection cv={cv} />;
      case 'credits':
        return <CreditsSection cv={cv} />;
      default:
        return null;
    }
  };

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
        <TopBar activeTab={activeTab} onTabChange={handleTabChange} />
        <BottomBar location={cv.location} />

        {/* Tab content - single viewport, no scroll */}
        <ContentLayer ref={contentRef}>
          {renderTab()}
        </ContentLayer>
      </Page>
    </>
  );
}

const Page = styled.main`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgb(93, 95, 207) -6%,
    rgb(180, 217, 250) 15%,
    rgb(242, 246, 250) 36%,
    rgb(242, 246, 250) 100%
  );
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
`;
