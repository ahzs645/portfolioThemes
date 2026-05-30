import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import gsap from 'gsap';
import { useCV } from '../../contexts/ConfigContext';
import { getBioText } from '../../utils/bioText';
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

// Dark equivalents — richer, deeper versions of each hue
const TAB_BACKGROUNDS_DARK = {
  home: 'linear-gradient(180deg, rgb(40, 42, 110) -6%, rgb(28, 38, 68) 30%, rgb(15, 17, 26) 55%, rgb(15, 17, 26) 100%)',
  info: 'linear-gradient(180deg, rgb(110, 65, 30) -6%, rgb(50, 35, 20) 30%, rgb(18, 14, 10) 55%, rgb(18, 14, 10) 100%)',
  projects: 'linear-gradient(180deg, rgb(30, 72, 110) -6%, rgb(18, 40, 60) 30%, rgb(10, 18, 26) 55%, rgb(10, 18, 26) 100%)',
  logs: 'linear-gradient(180deg, rgb(28, 72, 38) -6%, rgb(16, 44, 24) 30%, rgb(10, 20, 12) 55%, rgb(10, 20, 12) 100%)',
  credits: 'linear-gradient(180deg, rgb(68, 38, 90) -6%, rgb(36, 22, 52) 30%, rgb(16, 10, 22) 55%, rgb(16, 10, 22) 100%)',
};

export function KellyChongTheme({ darkMode = false }) {
  const cv = useCV();
  const [activeTab, setActiveTab] = useState('home');
  const contentRef = useRef(null);
  const bgFrontRef = useRef(null);
  const bgBackRef = useRef(null);

  const backgrounds = darkMode ? TAB_BACKGROUNDS_DARK : TAB_BACKGROUNDS;
  const hasInfo = Boolean(cv?.about || cv?.location || cv?.currentJobTitle || (cv?.education || []).length || (cv?.volunteer || []).length || cv?.email || (cv?.socialRaw || []).length);
  const hasProjects = (cv?.projects || []).length > 0;
  const hasLogs = (cv?.experience || []).length > 0;
  const hasCredits = Boolean(cv?.website || cv?.email || (cv?.socialRaw || []).length);
  const topNavItems = useMemo(() => [
    { id: 'home', label: 'HOME' },
    hasInfo ? { id: 'info', label: 'INFO' } : null,
    hasProjects ? { id: 'projects', label: 'PROJECTS' } : null,
    hasLogs ? { id: 'logs', label: 'LOGS' } : null,
  ].filter(Boolean), [hasInfo, hasLogs, hasProjects]);
  const availableTabs = useMemo(() => [
    ...topNavItems.map((item) => item.id),
    hasCredits ? 'credits' : null,
  ].filter(Boolean), [hasCredits, topNavItems]);

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
      front.style.background = backgrounds[tab];
      gsap.fromTo(front, { opacity: 0 }, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          // Once visible, copy to back layer and reset front
          back.style.background = backgrounds[tab];
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

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab('home');
    }
  }, [activeTab, availableTabs]);

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
            summary={getBioText(cv, { type: 'creative' })}
            email={cv.email}
            location={cv.location}
            website={cv.website}
            $dark={darkMode}
          />
        );
      case 'info':
        return <InfoSection cv={cv} $dark={darkMode} />;
      case 'projects':
        return <ProjectsSection cv={cv} $dark={darkMode} />;
      case 'logs':
        return <LogsSection cv={cv} $dark={darkMode} />;
      case 'credits':
        return <CreditsSection cv={cv} $dark={darkMode} />;
      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyles />
      <Page $dark={darkMode}>
        {/* Crossfade background: back = current, front = incoming */}
        <BgLayer ref={bgBackRef} style={{ background: backgrounds[activeTab] }} />
        <BgLayer ref={bgFrontRef} style={{ opacity: 0 }} />

        {/* Texture layers */}
        <DitherOverlay />
        <NoiseCanvas opacity={40} blendMode="multiply" />

        {/* Custom cursor */}
        <CustomCursor />

        {/* Fixed UI */}
        <TopBar activeTab={activeTab} onTabChange={handleTabChange} items={topNavItems} showCredits={hasCredits} $dark={darkMode} />
        <BottomBar location={cv.location} $dark={darkMode} />

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
  color: ${p => p.$dark ? '#d8d6d0' : 'inherit'};
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
