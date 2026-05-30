import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { FileText } from 'lucide-react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { getBioText } from '../../utils/bioText';
import { withBase } from '../../utils/assetPath';
import { canUseWebGL, usePrefersReducedMotion } from '../../utils/rendering';

const MESHES = ['tie', 'folder', 'cup', 'backpack', 'keyboard'];
const PLANET_GAP = 500;

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'Norman Radar';
    src: url('${withBase('norman-ponte/fonts/Radar-Seminegra.otf')}') format('opentype');
    font-weight: 600;
    font-style: normal;
    font-display: swap;
  }
`;

function orbitalProfile(index) {
  return {
    radius: PLANET_GAP * (index + 1),
    rotationSpeed: Math.random() * 0.01,
    orbitSpeed: Math.random() * 0.2,
    offset: Math.random() * 2 * Math.PI,
    inclination: Math.random() * Math.PI / 3,
  };
}

function Planet({ name, index }) {
  const { nodes } = useGLTF(withBase(`norman-ponte/meshes/${name}.glb`));
  const ref = useRef();
  const profile = useMemo(() => orbitalProfile(index), [index]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x += profile.rotationSpeed * 0.72;
    ref.current.rotation.y += profile.rotationSpeed;
    ref.current.rotation.z += profile.rotationSpeed * 0.45;
    ref.current.position.set(
      Math.cos(t * profile.orbitSpeed + profile.offset) * profile.radius,
      Math.sin(t * profile.orbitSpeed + profile.offset) * profile.radius * Math.sin(profile.inclination),
      Math.sin(t * profile.orbitSpeed + profile.offset) * profile.radius * Math.cos(profile.inclination)
    );
  });

  return (
    <mesh ref={ref} scale={70} geometry={nodes.item.geometry}>
      <meshBasicMaterial color="white" />
    </mesh>
  );
}

function Stars({ count = 20000 }) {
  const positions = useMemo(() => {
    const nextPositions = [];

    for (let i = 0; i < count; i += 1) {
      const radius = 4000;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      nextPositions.push(
        radius * Math.cos(theta) * Math.sin(phi) + (-2500 + Math.random() * 5000),
        radius * Math.sin(theta) * Math.sin(phi) + (-2500 + Math.random() * 5000),
        radius * Math.cos(phi) + (-1000 + Math.random() * 2000)
      );
    }

    return new Float32Array(nextPositions);
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={8} sizeAttenuation color="white" />
    </points>
  );
}

function CameraScroller({ scrollDepth }) {
  useFrame(({ camera }) => {
    camera.position.z += (scrollDepth - camera.position.z) * 0.035;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function SpaceScene({ scrollProgress = 0 }) {
  const cameraPosition = useMemo(() => [
    1000 + Math.random() * 3000,
    1000 + Math.random() * 3000,
    1000 + Math.random() * 3000,
  ], []);

  return (
    <SceneLayer aria-hidden="true">
      <Canvas camera={{ position: cameraPosition, near: 0.1, far: 100000 }}>
        <OrbitControls target={[0, 0, 0]} maxDistance={4000} minDistance={1} />
        <CameraScroller scrollDepth={cameraPosition[2] - scrollProgress * 3200} />
        <Stars />
        {MESHES.map((mesh, index) => (
          <Suspense key={mesh} fallback={null}>
            <Planet name={mesh} index={index} />
          </Suspense>
        ))}
      </Canvas>
    </SceneLayer>
  );
}

function formatDateRange(item) {
  const start = item.startDate || item.start_date;
  const end = item.endDate || item.end_date;
  return [start, end].filter(Boolean).join(' - ');
}

function Section({ id, title, children }) {
  return (
    <ContentSection id={id}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </ContentSection>
  );
}

function Entry({ item, fallbackTitle }) {
  const title = item.title || item.position || item.name || fallbackTitle;
  const subtitle = [item.company, item.location].filter(Boolean).join(' / ');
  const summary = item.summary || item.description;
  const highlights = item.highlights || [];

  return (
    <EntryCard>
      <EntryMeta>{formatDateRange(item) || item.date || item.publisher || 'Selected'}</EntryMeta>
      <EntryTitle>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">{title}</a> : title}</EntryTitle>
      {subtitle && <EntrySubtitle>{subtitle}</EntrySubtitle>}
      {summary && <p>{summary}</p>}
      {highlights.length > 0 && (
        <EntryList>
          {highlights.slice(0, 3).map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </EntryList>
      )}
    </EntryCard>
  );
}

function GitHubMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 1.27a11 11 0 0 0-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 0 1 .64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 0 1 0-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 0 1 0 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0 0 12 1.27"
      />
    </svg>
  );
}

export function NormanPonteTheme() {
  const cv = useCV();
  const reducedMotion = usePrefersReducedMotion();
  const [webglAvailable] = React.useState(() => canUseWebGL());
  const [activeView, setActiveView] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
    };

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  if (!cv) return null;
  const showSpaceScene = webglAvailable && !reducedMotion;

  const socials = cv.socialLinks || {};
  const socialLinks = [
    socials.github && { label: 'GitHub', href: socials.github },
    socials.linkedin && { label: 'LinkedIn', href: socials.linkedin },
    socials.twitter && { label: 'Twitter', href: socials.twitter },
    cv.website && { label: 'Website', href: cv.website },
    cv.email && { label: 'Email', href: `mailto:${cv.email}` },
  ].filter(Boolean);
  const projects = (cv.projects || []).slice(0, 6);
  const experience = (cv.experience || []).slice(0, 6);
  const extras = [
    ...(cv.education || []).slice(0, 2),
    ...(cv.publications || []).slice(0, 2),
    ...(cv.awards || []).slice(0, 2),
  ];
  const openView = (event, view) => {
    event.preventDefault();
    setActiveView(view);
    if (view === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <GlobalStyles />
      <Page>
        {showSpaceScene ? <SpaceScene scrollProgress={activeView ? 0 : scrollProgress} /> : <StaticSceneLayer aria-hidden="true" />}
        <Navigation>
          <Brand href="#start" onClick={(event) => openView(event, null)}>{cv.name || 'Portfolio'}</Brand>
          <NavLinks aria-label="Theme sections">
            <a href="#about" data-active={activeView === 'about'} onClick={(event) => openView(event, 'about')}>About</a>
            <a href="#notes" data-active={activeView === 'notes'} onClick={(event) => openView(event, 'notes')}>Notes</a>
            <a href="#reviews" data-active={activeView === 'reviews'} onClick={(event) => openView(event, 'reviews')}>Reviews</a>
          </NavLinks>
        </Navigation>

        {!activeView && <StartScreen id="start" aria-label="Orbital start screen" />}

        {activeView && (
          <Main id={activeView}>
            {activeView === 'about' && (
              <AboutPaper>
                <p>{cv.location ? `Typing in ${cv.location}.` : 'Typing in Manhattan.'}</p>
                <p>{getBioText(cv, { type: 'profile' })}</p>
                <p>Below are the best ways to reach me.</p>
                <IconStack>
                  {socials.github && (
                    <IconLink href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                      <GitHubMark />
                    </IconLink>
                  )}
                  <IconLink href={cv.website || '#'} target={cv.website ? '_blank' : undefined} rel="noreferrer" aria-label="CV">
                    <FileText size={23} strokeWidth={1.8} />
                  </IconLink>
                </IconStack>
              </AboutPaper>
            )}

            {activeView === 'notes' && (
              <Panel>
                {projects.length > 0 && (
                  <Section id="projects" title="Notes">
                    <Entries>
                      {projects.map((project, index) => (
                        <Entry key={`${project.name}-${index}`} item={project} fallbackTitle="Project" />
                      ))}
                    </Entries>
                  </Section>
                )}
                {experience.length > 0 && (
                  <Section id="experience" title="Experience">
                    <Entries>
                      {experience.map((item, index) => (
                        <Entry key={`${item.company}-${item.title}-${index}`} item={item} fallbackTitle="Role" />
                      ))}
                    </Entries>
                  </Section>
                )}
              </Panel>
            )}

            {activeView === 'reviews' && extras.length > 0 && (
              <Panel>
                <Section id="archive" title="Reviews">
                  <Entries>
                    {extras.map((item, index) => (
                      <Entry key={`${item.name || item.institution || item.title}-${index}`} item={item} fallbackTitle="Item" />
                    ))}
                  </Entries>
                </Section>
              </Panel>
            )}
          </Main>
        )}
      </Page>
    </>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background: #000;
  color: #ecedff;
  font-family: Oxygen, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  overflow-x: hidden;
`;

const SceneLayer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: #000;
`;

const StaticSceneLayer = styled(SceneLayer)`
  background:
    radial-gradient(circle at 18% 20%, rgba(159, 183, 255, 0.28), transparent 16%),
    radial-gradient(circle at 84% 34%, rgba(236, 237, 255, 0.2), transparent 12%),
    radial-gradient(circle at 46% 78%, rgba(92, 111, 210, 0.2), transparent 18%),
    #000;
`;

const Navigation = styled.nav`
  position: sticky;
  top: 0;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  padding: 0 1rem;

  a {
    color: #ecedff;
    text-decoration: none;
    background: rgba(0, 0, 0, 0.82);
    border-radius: 4px;
    padding: 4px 8px;
    transition: background 160ms ease, color 160ms ease;
  }

  a[data-active='true'] {
    color: #fff;
    font-weight: 700;
  }

  a:hover {
    background: rgba(0, 0, 0, 0.94);
  }

  @media (max-width: 680px) {
    align-items: center;
    flex-direction: row;
  }
`;

const Brand = styled.a`
  font-family: 'Norman Radar', Oxygen, monospace;
  font-size: 0.86rem;
  letter-spacing: 0;
  text-transform: uppercase;
`;

const NavLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  font-size: 0.82rem;

  a + a {
    margin-left: 16px;
  }
`;

const StartScreen = styled.div`
  position: relative;
  z-index: 1;
  min-height: calc(160vh - var(--app-top-offset, 0px));
`;

const Main = styled.main`
  position: relative;
  z-index: 2;
  width: min(100%, 680px);
  min-height: calc(100vh - var(--app-top-offset, 0px));
  margin: 0 auto;
  padding: 0 0 4rem;
`;

const Hero = styled.header`
  min-height: 58vh;
  display: flex;
  flex-direction: column;
  justify-content: center;

  h1 {
    max-width: 10ch;
    margin: 0;
    color: #fff;
    font-family: 'Norman Radar', Oxygen, monospace;
    font-size: clamp(3rem, 13vw, 8.5rem);
    line-height: 0.9;
    letter-spacing: 0;
    text-transform: uppercase;
    text-shadow: 0 0 28px rgba(112, 138, 255, 0.36);
  }
`;

const Eyebrow = styled.p`
  width: fit-content;
  margin: 0 0 1rem;
  padding: 0.34rem 0.5rem;
  color: #cfd6ff;
  background: rgba(0, 0, 0, 0.78);
  border: 1px solid rgba(236, 237, 255, 0.14);
  border-radius: 4px;
  font-size: 0.78rem;
`;

const HeroCopy = styled.p`
  max-width: 620px;
  margin: 1.2rem 0 0;
  color: #d7dcff;
  font-size: clamp(1.05rem, 2.4vw, 1.35rem);
  line-height: 1.55;
  text-wrap: balance;
`;

const HeroLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.4rem;

  a {
    color: #fff;
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.55);
  }
`;

const Panel = styled.div`
  display: grid;
  gap: 1rem;
`;

const AboutPaper = styled.article`
  padding: 1rem;
  margin: 0.5rem;
  color: #fff;
  background: rgb(18, 18, 18);
  border-radius: 4px;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.14), 0 1px 3px rgba(0, 0, 0, 0.12);
  font-size: 1rem;

  p {
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }
`;

const IconStack = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconLink = styled.a`
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  color: inherit;
  border-radius: 50%;
  text-decoration: none;
  transition: background 140ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ContentSection = styled.section`
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 76px);
  padding: 1rem;
  color: #f6f7ff;
  background: rgba(0, 0, 0, 0.84);
  border: 1px solid rgba(236, 237, 255, 0.16);
  border-radius: 6px;
  box-shadow: 0 24px 90px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(12px);
`;

const SectionTitle = styled.h2`
  margin: 0 0 1rem;
  color: #fff;
  font-family: 'Norman Radar', Oxygen, monospace;
  font-size: 1.05rem;
  letter-spacing: 0;
  text-transform: uppercase;
`;

const Lead = styled.p`
  margin: 0;
  color: #d9ddff;
  font-size: 1.02rem;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  min-width: 0;
  padding: 0.8rem;
  border: 1px solid rgba(236, 237, 255, 0.14);
  border-radius: 4px;

  span,
  small {
    display: block;
    overflow-wrap: anywhere;
  }

  span {
    color: #fff;
    font-size: 1rem;
  }

  small {
    margin-top: 0.22rem;
    color: #9ba5dd;
    font-size: 0.72rem;
    text-transform: uppercase;
  }
`;

const Entries = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const EntryCard = styled.article`
  padding: 0.9rem 0;
  border-top: 1px solid rgba(236, 237, 255, 0.14);

  &:first-child {
    border-top: 0;
    padding-top: 0;
  }

  p {
    margin: 0.55rem 0 0;
    color: #d7dcff;
    line-height: 1.5;
  }

  a {
    color: inherit;
    text-decoration-color: rgba(255, 255, 255, 0.42);
    text-underline-offset: 3px;
  }
`;

const EntryMeta = styled.div`
  color: #9ba5dd;
  font-size: 0.72rem;
  text-transform: uppercase;
`;

const EntryTitle = styled.h3`
  margin: 0.22rem 0 0;
  color: #fff;
  font-size: 1rem;
`;

const EntrySubtitle = styled.div`
  margin-top: 0.18rem;
  color: #b8c1f2;
  font-size: 0.86rem;
`;

const EntryList = styled.ul`
  margin: 0.55rem 0 0;
  padding-left: 1.1rem;
  color: #d7dcff;
  line-height: 1.45;
`;

const ContactGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  a {
    color: #fff;
    text-decoration: none;
    border: 1px solid rgba(236, 237, 255, 0.18);
    border-radius: 4px;
    padding: 0.5rem 0.65rem;
  }
`;

export default NormanPonteTheme;
