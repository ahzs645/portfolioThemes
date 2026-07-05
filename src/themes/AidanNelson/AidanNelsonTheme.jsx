import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { useCV } from '../../contexts/ConfigContext';
import { getInitials, pickSocialUrl } from '../../utils/cvHelpers';
import { canUseWebGL, usePrefersReducedMotion } from '../../utils/rendering';
// Vite hashes + base-path-resolves these imports; do NOT wrap in withBase.
import giraffeUrl from './assets/giraffe.glb';
import dotUrl from './assets/dot.jpg';

/**
 * AidanNelsonTheme — a CV-driven remake of aidanjnelson.com.
 *
 * Aidan Nelson's site is a quiet editorial reader on warm white: a small plain
 * name at the very top, a big bold serif "Hello and welcome!" greeting, one or
 * two generous serif bio paragraphs, and a "Find me on … or write an
 * old-fashioned email to <mono>name at gmail dot com</mono>" line. A thin rule
 * separates that intro from a bold "Projects" heading and a list of projects —
 * each a small tile + a bold blue linked title + a one-line description, the
 * entries divided by hairline rules. We rebuild that voice from CV.yaml.
 *
 * Source type/colors: body font-family "IBM Plex Sans"; headings "Inknut
 * Antiqua, serif"; page background #fffffa; body text #262626; the tile accent
 * palette (#300032 purple, #4a4a4a gray, #3265c4 blue, #c43235 red) comes
 * straight from the source stylesheet. The reference render shows the reader in
 * a browser-default serif with classic blue underlined links and a monospace
 * email, which is the look this remake commits to.
 */

// Accent tiles cycle through the source stylesheet's own bg-* palette.
const TILE_COLORS = ['#300032', '#3265c4', '#c43235', '#4a4a4a'];

const SERIF =
  "Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Times New Roman', Times, serif";
const MONO =
  "'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

const lightTheme = {
  background: '#fffffa',
  text: '#262626',
  heading: '#151515',
  name: '#111111',
  muted: '#4a4a46',
  link: '#0b57d0',
  linkHover: '#083b86',
  rule: 'rgba(0, 0, 0, 0.14)',
  thumbBorder: 'rgba(0, 0, 0, 0.10)',
  toggleBorder: 'rgba(0, 0, 0, 0.18)',
};

const darkTheme = {
  background: '#181712',
  text: '#e6e3da',
  heading: '#f4f1ea',
  name: '#f4f1ea',
  muted: '#b6b2a7',
  link: '#8ab4f8',
  linkHover: '#adc8fb',
  rule: 'rgba(255, 255, 255, 0.16)',
  thumbBorder: 'rgba(255, 255, 255, 0.14)',
  toggleBorder: 'rgba(255, 255, 255, 0.24)',
};

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(props) => props.theme.background}; }
`;

// "me@ahmadjalil.com" -> "me at ahmadjalil dot com" — the source's
// old-fashioned, spam-averse spelling-out of the address.
function obfuscateEmail(email = '') {
  return String(email).replace('@', ' at ').replace(/\./g, ' dot ');
}

// ─────────────────────────────────────────────────────────────────────────
// Interactive WebGL backdrop — a faithful React-Three-Fiber remake of
// aidanjnelson.com's home-page sketch: a transparent canvas fixed behind the
// reader, a huge dotted ground plane receding to the horizon, soft-shadowed
// lighting, and a click-anywhere-to-drop-a-giraffe raycast. The canvas is
// pointer-events:none — spawning is driven by a window pointer listener that
// raycasts manually (mirroring the original's document.body handler), so page
// scrolling and text/link interaction are never captured by the canvas.
// ─────────────────────────────────────────────────────────────────────────

// Camera aim: just above the ground, looking toward the horizon.
const CAMERA_TARGET = new THREE.Vector3(0, 2, -14);
// Fine dotted grid: a large plane tiled many times so dots recede to a mist.
const GROUND_SIZE = 2000;
const GROUND_HALF = GROUND_SIZE / 2;
const DOT_REPEAT = 1400;

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(query).matches
      : false,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [query]);

  return matches;
}

// Keep a WebGL context-loss or asset-load failure from ever blanking the page:
// the serif reader lives outside this boundary and always renders.
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    /* swallow — the backdrop is purely decorative */
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function Ground({ darkMode }) {
  const texture = useTexture(dotUrl);

  useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(DOT_REPEAT, DOT_REPEAT);
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      {/* On dark backgrounds a mid-grey tint keeps the lit grid faint and the
          reader legible; on light it stays white (no tint). */}
      <meshLambertMaterial map={texture} color={darkMode ? '#6c6a61' : '#ffffff'} />
    </mesh>
  );
}

function Giraffe({ position, rotation }) {
  const { scene } = useGLTF(giraffeUrl);

  // Each drop is an independent clone that casts a shadow. The model's own
  // node transform already stands it upright at ~5 units tall.
  const object = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={object} position={position} rotation={[0, rotation, 0]} />;
}

function CameraRig({ drift }) {
  const { camera, invalidate } = useThree();

  useEffect(() => {
    camera.lookAt(CAMERA_TARGET);
    // In frameloop="demand" nothing re-renders on its own — nudge one frame so
    // the corrected camera orientation is what actually gets drawn.
    invalidate();
  }, [camera, invalidate]);

  useFrame(({ clock }) => {
    if (!drift) return;
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.06) * 7;
    camera.position.z = 34 + Math.cos(t * 0.05) * 3;
    camera.lookAt(CAMERA_TARGET);
  });

  return null;
}

// Manual raycaster: listens on the window (canvas is pointer-events:none) so a
// tap on empty space — or even behind the text — drops a giraffe, while drags
// (scroll / text-select) and taps on links & buttons are ignored.
function ClickSpawner({ onSpawn }) {
  const { camera, gl } = useThree();

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    let downX = 0;
    let downY = 0;

    const onDown = (event) => {
      downX = event.clientX;
      downY = event.clientY;
    };

    const onUp = (event) => {
      // Ignore drags: scrolling and text selection move the pointer.
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 10) return;
      // Ignore interactive targets so links/buttons behave normally.
      if (
        event.target?.closest?.('a, button, input, textarea, select, label')
      ) {
        return;
      }
      const rect = gl.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(ground, hit)) return;
      if (
        Number.isFinite(hit.x) &&
        Math.abs(hit.x) < GROUND_HALF &&
        Math.abs(hit.z) < GROUND_HALF
      ) {
        onSpawn({ x: hit.x, y: 0, z: hit.z });
      }
    };

    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [camera, gl, onSpawn]);

  return null;
}

function GiraffeBackdrop({ drift, cap, darkMode }) {
  const [giraffes, setGiraffes] = useState([]);
  const nextId = useRef(0);

  const handleSpawn = useCallback(
    (point) => {
      setGiraffes((prev) => {
        const next = prev.concat({
          id: nextId.current++,
          position: [point.x, point.y, point.z],
          rotation: Math.random() * Math.PI * 2,
        });
        // Recycle the oldest once the cap is reached — endless, bounded fun.
        if (next.length > cap) next.shift();
        return next;
      });
    },
    [cap],
  );

  return (
    <CanvasLayer aria-hidden="true">
      <CanvasErrorBoundary>
        <Canvas
          shadows
          dpr={[1, 2]}
          frameloop={drift ? 'always' : 'demand'}
          gl={{ alpha: true, antialias: true }}
          camera={{ fov: 25, near: 0.1, far: 2000, position: [0, 20, 34] }}
          style={{ pointerEvents: 'none' }}
        >
          <hemisphereLight args={[0xffffff, 0xffffff, 0.8]} position={[0, 50, 0]} />
          <directionalLight
            intensity={1}
            position={[30, 52, 30]}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.5}
            shadow-camera-far={500}
            shadow-camera-left={-120}
            shadow-camera-right={120}
            shadow-camera-top={120}
            shadow-camera-bottom={-120}
            shadow-bias={-0.0001}
          />
          <CameraRig drift={drift} />
          <Suspense fallback={null}>
            <Ground darkMode={darkMode} />
            {giraffes.map((g) => (
              <Giraffe key={g.id} position={g.position} rotation={g.rotation} />
            ))}
          </Suspense>
          <ClickSpawner onSpawn={handleSpawn} />
        </Canvas>
      </CanvasErrorBoundary>
    </CanvasLayer>
  );
}

// Warm the giraffe cache so the first drop is instant.
useGLTF.preload(giraffeUrl);

export function AidanNelsonTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  // Interactive backdrop gating: only mount WebGL where it's supported, drop
  // the idle drift for reduced-motion / small screens, and trim the giraffe
  // cap on phones. Click-to-spawn stays on in every case the canvas renders.
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery('(max-width: 760px)');
  const [webglAvailable] = useState(() => canUseWebGL());
  const showBackdrop = webglAvailable;
  const drift = showBackdrop && !reducedMotion && !isMobile;
  const spawnCap = isMobile ? 15 : 40;

  const name = cv.name || 'Your Name';
  const location = cv.location || null;
  const email = cv.email || null;
  const website = cv.website || null;

  const github = cv.socialLinks?.github || pickSocialUrl(cv.social || [], ['github']);
  const linkedin = cv.socialLinks?.linkedin || pickSocialUrl(cv.social || [], ['linkedin']);

  const current = useMemo(() => {
    const roles = Array.isArray(cv.experience) ? cv.experience : [];
    const active = roles.filter((r) => r && r.isCurrent);
    if (active.length > 0) {
      return [...active].sort((a, b) =>
        String(b.startDate || '').localeCompare(String(a.startDate || '')),
      )[0];
    }
    return roles[0] || null;
  }, [cv.experience]);

  const projects = useMemo(
    () => (Array.isArray(cv.projects) ? cv.projects.filter((p) => p && p.name) : []),
    [cv.projects],
  );

  const roleHref = website || linkedin || github || null;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {showBackdrop && (
        <GiraffeBackdrop drift={drift} cap={spawnCap} darkMode={darkMode} />
      )}
      <Page>
        <Reader>
          <TopRow>
            <NameLine>{name}</NameLine>
            <ToggleButton
              type="button"
              onClick={() => onDarkModeChange?.(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀' : '☾'}
            </ToggleButton>
          </TopRow>

          <Greeting>Hello and welcome!</Greeting>

          <Bio>
            I am a{location ? ` ${location}–based` : 'n'} air quality and
            environmental&#8209;health researcher
            {current?.title ? (
              <>
                {' '}and{' '}
                {roleHref ? (
                  <TextLink href={roleHref} target="_blank" rel="noopener noreferrer">
                    {current.title}
                  </TextLink>
                ) : (
                  <strong>{current.title}</strong>
                )}
                {current.company ? ` at ${current.company}` : ''}
              </>
            ) : null}
            .
          </Bio>

          <Bio>
            My work spans open&#8209;source tools and data pipelines for environmental
            monitoring and public health — from air&#8209;quality analysis to mapping and
            transcription — built to make these methods more accessible to fellow
            researchers and the communities they serve.
          </Bio>

          {(github || linkedin || email) && (
            <Bio>
              Find me on
              {github && (
                <>
                  {' '}
                  <TextLink href={github} target="_blank" rel="noopener noreferrer">
                    Github
                  </TextLink>
                </>
              )}
              {github && linkedin ? ',' : ''}
              {linkedin && (
                <>
                  {' '}
                  <TextLink href={linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </TextLink>
                </>
              )}
              {email && (
                <>
                  {' '}or write an old&#8209;fashioned email to{' '}
                  <MonoLink href={`mailto:${email}`}>{obfuscateEmail(email)}</MonoLink>
                </>
              )}
              .
            </Bio>
          )}

          {projects.length > 0 && (
            <>
              <Divider />
              <ProjectsHeading>Projects</ProjectsHeading>

              <ProjectList>
                {projects.map((project, index) => (
                  <React.Fragment key={`${project.name}-${index}`}>
                    {index > 0 && <Rule aria-hidden="true" />}
                    <ProjectRow>
                      <Thumb $bg={TILE_COLORS[index % TILE_COLORS.length]}>
                        {getInitials(project.name, 1, '•')}
                      </Thumb>
                      <ProjectInfo>
                        {project.url ? (
                          <ProjectTitle
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {project.name}
                          </ProjectTitle>
                        ) : (
                          <ProjectTitlePlain>{project.name}</ProjectTitlePlain>
                        )}
                        {project.summary && <ProjectDesc>{project.summary}</ProjectDesc>}
                      </ProjectInfo>
                    </ProjectRow>
                  </React.Fragment>
                ))}
              </ProjectList>
            </>
          )}
        </Reader>
        {showBackdrop && (
          <Hint aria-hidden="true">click anywhere&#8202;↝&#8202;drop a giraffe</Hint>
        )}
      </Page>
    </ThemeProvider>
  );
}

const Page = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100%;
  width: 100%;
  /* Transparent so the fixed WebGL backdrop shows through; the warm-white (or
     dark) page colour is supplied by the body via GlobalStyle, which also acts
     as the fallback whenever the canvas is absent. */
  background-color: transparent;
  color: ${(props) => props.theme.text};
  font-family: ${SERIF};
  box-sizing: border-box;
  display: flex;
  justify-content: center;
`;

// Full-bleed backdrop pinned behind the reader. pointer-events:none guarantees
// it never eats scroll/clicks — spawning is handled by ClickSpawner's window
// listener. Sized to the container height (never a raw 100vh).
const CanvasLayer = styled.div`
  position: fixed;
  top: var(--app-top-offset, 0px);
  left: 0;
  width: 100%;
  height: calc(100dvh - var(--app-top-offset, 0px));
  z-index: 0;
  pointer-events: none;
`;

const Hint = styled.p`
  position: fixed;
  left: 50%;
  bottom: max(0.9rem, env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  z-index: 2;
  margin: 0;
  padding: 0.3rem 0.7rem;
  font-family: ${MONO};
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  white-space: nowrap;
  color: ${(props) => props.theme.muted};
  opacity: 0.72;
  pointer-events: none;
  user-select: none;
`;

const Reader = styled.main`
  width: 100%;
  max-width: 48rem;
  padding: clamp(2rem, 6vw, 4rem) clamp(1.15rem, 5vw, 2.5rem) 5rem;
  box-sizing: border-box;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: clamp(1.75rem, 5vw, 3rem);
`;

const NameLine = styled.div`
  font-family: ${SERIF};
  font-weight: 600;
  font-size: 1rem;
  color: ${(props) => props.theme.name};
`;

const ToggleButton = styled.button`
  flex: none;
  width: 2.1rem;
  height: 2.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  border-radius: 999px;
  border: 1px solid ${(props) => props.theme.toggleBorder};
  background: transparent;
  color: ${(props) => props.theme.muted};
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;

  &:hover {
    color: ${(props) => props.theme.heading};
    border-color: ${(props) => props.theme.link};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const Greeting = styled.h1`
  font-family: ${SERIF};
  font-weight: 700;
  font-size: clamp(2rem, 5.5vw, 2.75rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin: 0 0 1.5rem;
  color: ${(props) => props.theme.heading};
`;

const Bio = styled.p`
  font-family: ${SERIF};
  font-size: clamp(1.05rem, 2.4vw, 1.18rem);
  line-height: 1.68;
  margin: 0 0 1.35rem;
  color: ${(props) => props.theme.text};

  strong {
    font-weight: 700;
    color: inherit;
  }
`;

const TextLink = styled.a`
  color: ${(props) => props.theme.link};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const MonoLink = styled.a`
  font-family: ${MONO};
  font-size: 0.9em;
  color: ${(props) => props.theme.muted};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${(props) => props.theme.heading};
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background: ${(props) => props.theme.rule};
  margin: clamp(2rem, 5vw, 2.75rem) 0;
`;

const ProjectsHeading = styled.h2`
  font-family: ${SERIF};
  font-weight: 700;
  font-size: clamp(1.4rem, 3.6vw, 1.75rem);
  margin: 0 0 1.5rem;
  color: ${(props) => props.theme.heading};
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Rule = styled.hr`
  border: 0;
  height: 1px;
  background: ${(props) => props.theme.rule};
  margin: 1.5rem 0;
`;

const ProjectRow = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(1rem, 3vw, 1.5rem);
`;

const Thumb = styled.div`
  flex: none;
  width: clamp(64px, 16vw, 104px);
  height: clamp(64px, 16vw, 104px);
  border-radius: 3px;
  border: 1px solid ${(props) => props.theme.thumbBorder};
  background: ${(props) => props.$bg || '#4a4a4a'};
  color: #fffffa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${SERIF};
  font-weight: 700;
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  line-height: 1;
  user-select: none;
`;

const ProjectInfo = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`;

const projectTitleStyles = `
  display: inline-block;
  font-weight: 700;
  font-size: clamp(1.02rem, 2.4vw, 1.15rem);
  line-height: 1.3;
  margin-bottom: 0.35rem;
`;

const ProjectTitle = styled.a`
  ${projectTitleStyles}
  color: ${(props) => props.theme.link};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${(props) => props.theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const ProjectTitlePlain = styled.span`
  ${projectTitleStyles}
  color: ${(props) => props.theme.heading};
`;

const ProjectDesc = styled.p`
  margin: 0;
  font-size: clamp(0.95rem, 2.2vw, 1.05rem);
  line-height: 1.5;
  color: ${(props) => props.theme.muted};
`;
