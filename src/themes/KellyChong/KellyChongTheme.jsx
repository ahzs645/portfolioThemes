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

// Each tab has its own background gradient, inspired by Kelly Chong's page transitions
const TAB_BACKGROUNDS = {
  home: 'linear-gradient(180deg, rgb(93, 95, 207) -6%, rgb(180, 217, 250) 15%, rgb(242, 246, 250) 36%, rgb(242, 246, 250) 100%)',
  info: 'linear-gradient(180deg, rgb(207, 147, 93) -6%, rgb(250, 225, 180) 15%, rgb(250, 246, 242) 36%, rgb(250, 246, 242) 100%)',
  projects: 'linear-gradient(180deg, rgb(95, 160, 207) -6%, rgb(180, 220, 250) 15%, rgb(242, 248, 250) 36%, rgb(242, 248, 250) 100%)',
  logs: 'linear-gradient(180deg, rgb(120, 180, 130) -6%, rgb(200, 235, 210) 15%, rgb(244, 250, 245) 36%, rgb(244, 250, 245) 100%)',
  credits: 'linear-gradient(180deg, rgb(160, 120, 190) -6%, rgb(215, 195, 240) 15%, rgb(248, 244, 250) 36%, rgb(248, 244, 250) 100%)',
};

export function KellyChongTheme() {
  const cv = useCV();
  const [activeTab, setActiveTab] = useState('home');
  const contentRef = useRef(null);
  const bgFrontRef = useRef(null);
  const bgBackRef = useRef(null);

  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;

    const content = contentRef.current;
    const front = bgFrontRef.current;
    const back = bgBackRef.current;

    if (!content) {
      setActiveTab(tab);
      return;
    }

    // Crossfade: set new gradient on the front layer (currently invisible),
    // then fade it in over the old one
    if (front && back) {
      front.style.background = TAB_BACKGROUNDS[tab];
      gsap.fromTo(front, { opacity: 0 }, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          // Once visible, copy to back layer and reset front
          back.style.background = TAB_BACKGROUNDS[tab];
          front.style.opacity = 0;
        },
      });
    }

    // Animate out current content
    gsap.to(content, {
      opacity: 0,
      y: -12,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(tab);
        gsap.fromTo(
          content,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      },
    });
  }, [activeTab]);

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
        {/* Crossfade background: back = current, front = incoming */}
        <BgLayer ref={bgBackRef} style={{ background: TAB_BACKGROUNDS[activeTab] }} />
        <BgLayer ref={bgFrontRef} style={{ opacity: 0 }} />

        {/* Texture layers */}
        <DitherOverlay />
        <NoiseCanvas opacity={40} blendMode="multiply" />

        {/* Custom cursor */}
        <CustomCursor />

        {/* Fixed UI */}
        <TopBar activeTab={activeTab} onTabChange={handleTabChange} />
        <BottomBar location={cv.location} />

        {/* Tab content */}
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
  height: 100%;
  overflow: hidden;
`;

const BgLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const ContentLayer = styled.div`
  position: absolute;
  top: 52px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;

  @media (max-width: 809px) {
    top: 0;
  }
`;
