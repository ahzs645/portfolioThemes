import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
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

/* ── Three.js particle background ── */
function Particles({ isDark }) {
  const meshRef = useRef(null);
  const positions = useMemo(() => {
    const count = 2000;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  const color = isDark ? '#a5ff3f' : '#333333';

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2000}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={color} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

function ThreeBackground({ isDark }) {
  return (
    <BgCanvas>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Particles isDark={isDark} />
      </Canvas>
    </BgCanvas>
  );
}

/* ── Main Theme ── */
export function AliciaPageTheme({ darkMode }) {
  const cv = useCV();
  const theme = darkMode ? dark : light;
  // Pages: 'home', 'projects', 'experience', 'education', 'about'
  const [page, setPage] = useState('home');
  const [activeSection, setActiveSection] = useState(null);

  const handleNavigate = useCallback((id) => {
    if (id === 'top' || id === 'home') {
      setPage('home');
      setActiveSection(null);
      return;
    }
    // Navigate to sub-page
    setPage(id);
    setActiveSection(id);
  }, []);

  if (!cv) return null;

  return (
    <Page $theme={theme}>
      <GlobalStyles />
      <ThreeBackground isDark={darkMode} />
      <Header theme={theme} activeSection={activeSection} onNavigate={handleNavigate} />
      <Main>
        <Container>
          {page === 'home' && (
            <>
              <Hero cv={cv} theme={theme} onNavigate={handleNavigate} />
              <RecentSection>
                <ListContainer>
                  <ListTitle $theme={theme}>
                    <SectionHeader>
                      <SectionLabel>recent projects</SectionLabel>
                      <ViewAll onClick={() => handleNavigate('projects')} $theme={theme}>
                        View all
                      </ViewAll>
                    </SectionHeader>
                  </ListTitle>
                  <ListContent $theme={theme}>
                    <ListWrapper>
                      {(cv?.projects || []).slice(0, 4).map((project, i) => (
                        <ProjectRow key={i} $theme={theme}>
                          <ProjectGrid>
                            <ProjectName
                              href={project.url || project.link || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              $theme={theme}
                            >
                              {project.name || project.title}
                            </ProjectName>
                            <ProjectDate $theme={theme}>
                              {project.startDate || ''}
                            </ProjectDate>
                          </ProjectGrid>
                        </ProjectRow>
                      ))}
                    </ListWrapper>
                  </ListContent>
                </ListContainer>
              </RecentSection>
            </>
          )}
          {page === 'projects' && (
            <SubPage>
              <SubPageTitle $theme={theme}>Stuff I've Built</SubPageTitle>
              <Projects cv={cv} theme={theme} />
            </SubPage>
          )}
          {page === 'experience' && (
            <SubPage>
              <SubPageTitle $theme={theme}>Experience</SubPageTitle>
              <Experience cv={cv} theme={theme} />
            </SubPage>
          )}
          {page === 'education' && (
            <SubPage>
              <SubPageTitle $theme={theme}>Education</SubPageTitle>
              <Education cv={cv} theme={theme} />
            </SubPage>
          )}
          {page === 'about' && (
            <SubPage>
              <SubPageTitle $theme={theme}>More About Me</SubPageTitle>
              <Skills cv={cv} theme={theme} />
            </SubPage>
          )}
        </Container>
      </Main>
      <Footer cv={cv} theme={theme} />
    </Page>
  );
}

/* ── Styled Components ── */

const BgCanvas = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
`;

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${p => p.$theme.bg};
  color: ${p => p.$theme.primary};
  font-family: ${FONT.sans};
  -webkit-font-smoothing: antialiased;
  transition: background 0.3s, color 0.3s;
  z-index: 1;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
`;

const Container = styled.div`
  max-width: 948px;
  width: 100%;
  padding: 0 16px 96px;
  @media (min-width: 768px) { padding: 0 32px 96px; }
  @media (min-width: 1024px) { padding: 0 48px 96px; }
`;

const SubPage = styled.div`
  padding-top: 32px;
  @media (min-width: 768px) { padding-top: 48px; }
`;

const SubPageTitle = styled.h1`
  font-weight: 700;
  font-size: 1.875rem;
  margin: 0 0 32px;
  color: ${p => p.$theme.primary};
  padding: 0 8px;
`;

/* ── Home page recent projects section ── */

const RecentSection = styled.section``;

const ListContainer = styled.dl`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
  row-gap: 0.5rem;
  margin-bottom: 3rem;
  @media (min-width: 768px) {
    margin-bottom: 4rem;
    row-gap: 1rem;
  }
`;

const ListTitle = styled.dt`
  grid-column: span 12;
  border-top: 1px solid rgba(115, 115, 115, 0.1);
  padding: 16px 8px 0;
  @media (min-width: 768px) { grid-column: span 4; }
`;

const ListContent = styled.dd`
  grid-column: span 12;
  border-top: 1px solid rgba(115, 115, 115, 0.1);
  padding: 16px 0 0;
  @media (min-width: 768px) { grid-column: span 8; }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (min-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const SectionLabel = styled.h2`
  font-weight: 700;
  font-size: 1rem;
  margin: 0;
`;

const ViewAll = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: ${FONT.sans};
  font-size: 12px;
  color: ${p => p.$theme.gray100};
  padding: 0;
  position: relative;
  transition: color 0.3s;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: currentColor;
    transform: scaleX(0);
    transform-origin: 100% 100%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  &:hover {
    color: ${p => p.$theme.blue};
    &::after {
      transform: scaleX(1);
      transform-origin: 0 100%;
    }
  }
`;

const ListWrapper = styled.div``;

const ProjectRow = styled.div`
  padding: 0 8px 16px;
  font-size: 15px;
  transition: color 0.3s ease-linear;
  &:hover { color: ${p => p.$theme.blue}; }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: center;
  @media (min-width: 768px) { grid-template-columns: 4fr 1fr; }
`;

const ProjectName = styled.a`
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProjectDate = styled.span`
  text-align: right;
  font-size: 13px;
  color: ${p => p.$theme.gray100};
`;
