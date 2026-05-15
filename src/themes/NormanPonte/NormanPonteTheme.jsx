import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { withBase } from '../../utils/assetPath';
import { canUseWebGL, usePrefersReducedMotion } from '../../utils/rendering';

const MESHES = ['tie', 'folder', 'cup', 'backpack', 'keyboard'];

const vertexShader = `
  attribute float scale;
  uniform float uTime;
  varying float vPulse;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float twinkle = sin(uTime * 1.8 + position.x * 0.015 + position.y * 0.01) * 0.5 + 0.5;
    vPulse = twinkle;
    gl_PointSize = scale * (0.65 + twinkle * 0.55) * (420.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vPulse;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    float alpha = smoothstep(0.5, 0.04, dist);
    vec3 color = mix(vec3(0.58, 0.68, 1.0), vec3(1.0), vPulse);
    gl_FragColor = vec4(color, alpha);
  }
`;

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
    radius: 480 * (index + 1),
    rotationSpeed: 0.004 + index * 0.0015,
    orbitSpeed: 0.045 + index * 0.018,
    offset: index * 1.38,
    inclination: 0.22 + index * 0.12,
  };
}

function Planet({ name, index }) {
  const { scene } = useGLTF(withBase(`norman-ponte/meshes/${name}.glb`));
  const ref = useRef();
  const profile = useMemo(() => orbitalProfile(index), [index]);
  const object = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = false;
      child.receiveShadow = false;
      child.material = new THREE.MeshStandardMaterial({
        color: '#eef2ff',
        roughness: 0.52,
        metalness: 0.08,
        emissive: '#18224c',
        emissiveIntensity: 0.18,
      });
    });
    return clone;
  }, [scene]);

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

  return <primitive ref={ref} object={object} scale={66} />;
}

function Stars({ count = 14000 }) {
  const materialRef = useRef();
  const { positions, scales } = useMemo(() => {
    const nextPositions = [];
    const nextScales = [];

    for (let i = 0; i < count; i += 1) {
      const radius = 4200;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      nextPositions.push(
        radius * Math.cos(theta) * Math.sin(phi) + (-2400 + Math.random() * 4800),
        radius * Math.sin(theta) * Math.sin(phi) + (-2400 + Math.random() * 4800),
        radius * Math.cos(phi) + (-1200 + Math.random() * 2400)
      );
      nextScales.push(2.4 + Math.random() * 5.2);
    }

    return {
      positions: new Float32Array(nextPositions),
      scales: new Float32Array(nextScales),
    };
  }, [count]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-scale" count={scales.length} array={scales} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SpaceScene() {
  const cameraPosition = useMemo(() => [2350, 1640, 2740], []);

  return (
    <SceneLayer aria-hidden="true">
      <Canvas camera={{ position: cameraPosition, near: 0.1, far: 100000 }} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.58} />
        <directionalLight position={[800, 1200, 600]} intensity={1.25} />
        <pointLight position={[-1200, 700, 1100]} intensity={1.5} color="#9fb7ff" />
        <fog attach="fog" args={['#000000', 1800, 7600]} />
        <OrbitControls target={[0, 0, 0]} enablePan={false} maxDistance={4200} minDistance={700} autoRotate autoRotateSpeed={0.18} />
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

export function NormanPonteTheme() {
  const cv = useCV();
  const reducedMotion = usePrefersReducedMotion();
  const [webglAvailable] = React.useState(() => canUseWebGL());
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

  return (
    <>
      <GlobalStyles />
      <Page>
        {showSpaceScene ? <SpaceScene /> : <StaticSceneLayer aria-hidden="true" />}
        <Navigation>
          <Brand href="#top">{cv.name || 'Portfolio'}</Brand>
          <NavLinks aria-label="Theme sections">
            <a href="#about">About</a>
            {projects.length > 0 && <a href="#projects">Projects</a>}
            {experience.length > 0 && <a href="#experience">Experience</a>}
            <a href="#contact">Contact</a>
          </NavLinks>
        </Navigation>

        <Main id="top">
          <Hero>
            <Eyebrow>{[cv.currentJobTitle, cv.location].filter(Boolean).join(' / ') || 'Personal orbit'}</Eyebrow>
            <h1>{cv.name}</h1>
            <HeroCopy>{cv.about || `A portfolio system for ${cv.name}, rendered as a quiet field of orbiting artifacts and career notes.`}</HeroCopy>
            <HeroLinks>
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </HeroLinks>
          </Hero>

          <Panel>
            <Section id="about" title="About">
              <Lead>{cv.about || `${cv.name} is ${cv.currentJobTitle || 'building across research, systems, and applied technology'}.`}</Lead>
              <StatsGrid>
                <Stat><span>{experience.length}</span><small>roles</small></Stat>
                <Stat><span>{projects.length}</span><small>projects</small></Stat>
                <Stat><span>{cv.location || 'Remote'}</span><small>base</small></Stat>
              </StatsGrid>
            </Section>

            {projects.length > 0 && (
              <Section id="projects" title="Projects">
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

            {extras.length > 0 && (
              <Section id="archive" title="Archive">
                <Entries>
                  {extras.map((item, index) => (
                    <Entry key={`${item.name || item.institution || item.title}-${index}`} item={item} fallbackTitle="Item" />
                  ))}
                </Entries>
              </Section>
            )}

            <Section id="contact" title="Contact">
              <ContactGrid>
                {socialLinks.map((link) => (
                  <a key={link.label} href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
                    {link.label}
                  </a>
                ))}
              </ContactGrid>
            </Section>
          </Panel>
        </Main>
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
  inset: var(--app-top-offset, 0px) 0 0;
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
  top: var(--app-top-offset, 0px);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 54px;
  padding: 0.5rem 1rem;

  a {
    color: #ecedff;
    text-decoration: none;
    background: rgba(0, 0, 0, 0.82);
    border: 1px solid rgba(236, 237, 255, 0.16);
    border-radius: 4px;
    padding: 0.38rem 0.58rem;
    transition: border-color 160ms ease, background 160ms ease;
  }

  a:hover {
    border-color: rgba(236, 237, 255, 0.48);
    background: rgba(0, 0, 0, 0.94);
  }

  @media (max-width: 680px) {
    align-items: flex-start;
    flex-direction: column;
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
  gap: 0.34rem;
  font-size: 0.82rem;
`;

const Main = styled.main`
  position: relative;
  z-index: 2;
  width: min(100%, 760px);
  min-height: calc(100vh - var(--app-top-offset, 0px));
  margin: 0 auto;
  padding: 14vh 1rem 4rem;
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
