import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { colors, fonts } from './utils/tokens';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';

const SECTION_KEYS = ['home', 'experience', 'projects', 'skills'];

function clamp(min, value, max) {
  return Math.min(Math.max(min, value), max);
}

export function WallenartTUITheme() {
  const cv = useCV();

  const [sectionIndex, setSectionIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const contentRef = useRef(null);

  const sectionItemCounts = cv
    ? [
        0,
        cv.experience.length,
        cv.projects.length,
        cv.skills.length,
      ]
    : [0, 0, 0, 0];

  const goToSection = useCallback(
    (si, ii = 0) => {
      const newSi = clamp(0, si, SECTION_KEYS.length - 1);
      const maxItem = Math.max(0, sectionItemCounts[newSi] - 1);
      setSectionIndex(newSi);
      setItemIndex(clamp(0, ii, maxItem));
      setMenuOpen(false);
    },
    [sectionItemCounts]
  );

  const goToItem = useCallback(
    (ii) => {
      const maxItem = Math.max(0, sectionItemCounts[sectionIndex] - 1);
      setItemIndex(clamp(0, ii, maxItem));
    },
    [sectionIndex, sectionItemCounts]
  );

  useEffect(() => {
    function handleKeyDown(e) {
      const { key, code, ctrlKey } = e;

      // Scroll content
      if (key === 'PageDown' || (ctrlKey && key === 'd')) {
        e.preventDefault();
        contentRef.current
          ?.querySelector('[data-scroll-content]')
          ?.scrollBy({ top: 300 });
        return;
      }
      if (key === 'PageUp' || (ctrlKey && key === 'u')) {
        e.preventDefault();
        contentRef.current
          ?.querySelector('[data-scroll-content]')
          ?.scrollBy({ top: -300 });
        return;
      }

      // Vim/arrow navigation
      if (key === 'ArrowUp' || key === 'k') {
        e.preventDefault();
        if (sectionIndex > 0) goToItem(itemIndex - 1);
        return;
      }
      if (key === 'ArrowDown' || key === 'j') {
        e.preventDefault();
        if (sectionIndex > 0) goToItem(itemIndex + 1);
        return;
      }
      if (key === 'ArrowLeft' || key === 'h') {
        e.preventDefault();
        goToSection(sectionIndex - 1);
        return;
      }
      if (key === 'ArrowRight' || key === 'l') {
        e.preventDefault();
        goToSection(sectionIndex + 1);
        return;
      }

      // Number keys jump to section
      if (code.startsWith('Digit')) {
        const num = parseInt(key) - 1;
        if (num >= 0 && num < SECTION_KEYS.length) {
          e.preventDefault();
          goToSection(num);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sectionIndex, itemIndex, goToSection, goToItem]);

  useEffect(() => {
    const id = 'wallenart-tui-font';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  if (!cv) return null;

  return (
    <ThemeRoot>
        <MobileNav
          name={cv.name}
          menuOpen={menuOpen}
          onToggle={() => setMenuOpen((o) => !o)}
        />
        <MainContainer>
          <SectionContainer>
            <Sidebar
              cv={cv}
              sectionIndex={sectionIndex}
              itemIndex={itemIndex}
              menuOpen={menuOpen}
              onSelectSection={(si) => goToSection(si)}
              onSelectItem={(si, ii) => goToSection(si, ii)}
            />
            <div ref={contentRef} style={{ display: 'contents' }}>
              <ContentArea
                cv={cv}
                sectionIndex={sectionIndex}
                itemIndex={itemIndex}
              />
            </div>
          </SectionContainer>
          <Footer cv={cv} />
        </MainContainer>
      </ThemeRoot>
  );
}

const ThemeRoot = styled.div`
  font-family: ${fonts.mono};
  background-color: ${colors.primaryBg};
  color: ${colors.primaryText};
  height: 100vh;
  padding: 1rem;
  overflow: hidden;
  cursor: default;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  a {
    cursor: pointer;
  }

  @media (max-width: 768px) {
    padding: 2vw;
    padding-top: calc(var(--app-top-offset, 0px) + 70px);
    overflow-y: auto;
    overflow-x: hidden;
    height: auto;
    min-height: 100vh;
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 0.4rem;

  @media (max-width: 768px) {
    height: auto;
    flex: none;
  }
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 0.4rem;
  flex: 1;
  min-height: 0;
  padding-top: 14px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;
