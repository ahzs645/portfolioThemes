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
import { pickSocialUrl } from '../../utils/cvHelpers';
import { canUseWebGL, usePrefersReducedMotion } from '../../utils/rendering';
// Vite hashes + base-path-resolves these imports; do NOT wrap in withBase.
import giraffeUrl from './assets/giraffe.glb';
import dotUrl from './assets/dot.jpg';
import ibmPlexSansUrl from './assets/fonts/ibm-plex-sans-latin.woff2';
import inknutAntiquaUrl from './assets/fonts/inknut-antiqua-latin.woff2';

/**
 * AidanNelsonTheme — a CV-driven remake of aidanjnelson.com.
 *
 * Aidan Nelson's site is a quiet Hugo/Bootstrap reader on warm white: a
 * shadowed Inknut Antiqua name, IBM Plex Sans prose, magenta body links, a
 * dotted WebGL giraffe backdrop, and off-white project cards with source
 * thumbnails, black hairlines, and understated hover shadows. We rebuild that
 * voice from CV.yaml.
 */

const SOURCE_SANS =
  "'Aidan IBM Plex Sans', 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const SOURCE_HEADING =
  "'Aidan Inknut Antiqua', 'Inknut Antiqua', Georgia, 'Times New Roman', Times, serif";
const SERIF =
  "Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Times New Roman', Times, serif";
const MONO =
  "'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

const lightTheme = {
  background: '#fffffa',
  text: '#262626',
  heading: '#262626',
  name: '#262626',
  muted: '#333333',
  link: '#b90386',
  linkHover: '#7f005c',
  rule: '#000000',
  subtleRule: 'rgba(0, 0, 0, 0.25)',
  cardBackground: '#fffffaaa',
  cardHoverBackground: '#fffffa',
  cardBorder: 'rgba(0, 0, 0, 0.20)',
  cardHoverBorder: '#000000',
  cardShadow: '3px 3px 3px rgba(132, 132, 132, 0.22)',
  thumbBorder: 'transparent',
  toggleBorder: 'rgba(0, 0, 0, 0.18)',
  nameShadow: '2px 0 4px rgba(255, 0, 144, 0.31)',
  code: '#d63384',
  bodyFont: SOURCE_SANS,
  headingFont: SOURCE_HEADING,
  contentFontSize: '18px',
  projectTitleColor: '#000000',
  dark: false,
};

const darkTheme = {
  background: '#181712',
  text: '#e6e3da',
  heading: '#f4f1ea',
  name: '#f4f1ea',
  muted: '#b6b2a7',
  link: '#ff7bd4',
  linkHover: '#ffb3e7',
  rule: 'rgba(255, 255, 255, 0.16)',
  subtleRule: 'rgba(255, 255, 255, 0.16)',
  cardBackground: 'rgba(24, 23, 18, 0.84)',
  cardHoverBackground: 'rgba(33, 31, 24, 0.94)',
  cardBorder: 'rgba(255, 255, 255, 0.16)',
  cardHoverBorder: 'rgba(255, 255, 255, 0.34)',
  cardShadow: '3px 3px 12px rgba(0, 0, 0, 0.28)',
  thumbBorder: 'rgba(255, 255, 255, 0.14)',
  toggleBorder: 'rgba(255, 255, 255, 0.24)',
  nameShadow: 'none',
  code: '#f0a6d8',
  bodyFont: SOURCE_SANS,
  headingFont: SOURCE_HEADING,
  contentFontSize: '18px',
  projectTitleColor: '#f4f1ea',
  dark: true,
};

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Aidan IBM Plex Sans';
    src: url(${ibmPlexSansUrl}) format('woff2');
    font-weight: 400 600;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Aidan Inknut Antiqua';
    src: url(${inknutAntiquaUrl}) format('woff2');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }

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
      {darkMode ? (
        <meshLambertMaterial map={texture} color="#6c6a61" />
      ) : (
        <meshBasicMaterial map={texture} color="#ffffff" toneMapped={false} />
      )}
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
          <hemisphereLight args={[0xffffff, 0xffffff, 0.6]} position={[0, 50, 0]} />
          <directionalLight
            intensity={0.5}
            position={[30, 52, 30]}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.5}
            shadow-camera-far={500}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
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

export function AidanNelsonTheme({ darkMode = false }) {
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
                  <ProjectCard
                    key={`${project.name}-${index}`}
                    as={project.url ? 'a' : 'div'}
                    href={project.url || undefined}
                    target={project.url ? '_blank' : undefined}
                    rel={project.url ? 'noopener noreferrer' : undefined}
                  >
                    <ProjectInfo>
                      <ProjectTitleText>{project.name}</ProjectTitleText>
                      <ProjectTitleRule aria-hidden="true" />
                      {project.summary && <ProjectDesc>{project.summary}</ProjectDesc>}
                    </ProjectInfo>
                  </ProjectCard>
                ))}
              </ProjectList>
            </>
          )}
        </Reader>
        {showBackdrop && (
          <Hint aria-hidden="true">↓ click here ↓</Hint>
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
  font-family: ${(props) => props.theme.bodyFont};
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  overflow-x: hidden;
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
  right: 8vw;
  top: calc(var(--app-top-offset, 0px) + 4.5rem);
  z-index: 2;
  margin: 0;
  padding: 0;
  font-family: ${(props) => props.theme.headingFont};
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0;
  white-space: nowrap;
  color: ${(props) => props.theme.muted};
  opacity: 1;
  pointer-events: none;
  user-select: none;

  @media (max-width: 991.98px) {
    display: none;
  }
`;

const Reader = styled.main`
  width: 100%;
  max-width: 56rem;
  min-height: 100%;
  padding: 1px 5% 15px;
  box-sizing: border-box;
  z-index: 2;
`;

const TopRow = styled.div`
  margin: 0;
`;

const NameLine = styled.div`
  font-family: ${(props) => props.theme.headingFont};
  font-weight: 600;
  font-size: 1.2em;
  line-height: 1.2;
  padding-top: 2em;
  padding-bottom: 1em;
  color: ${(props) => props.theme.name};
  text-shadow: ${(props) => props.theme.nameShadow};
`;

const Greeting = styled.h1`
  font-family: ${(props) => props.theme.headingFont};
  font-weight: 500;
  font-size: clamp(1.8rem, 3vw, 2rem);
  line-height: 1.2;
  letter-spacing: 0;
  margin: 0;
  padding-top: 1em;
  padding-bottom: 1em;
  color: ${(props) => props.theme.heading};
`;

const Bio = styled.p`
  font-family: ${(props) => props.theme.bodyFont};
  font-size: ${(props) => props.theme.contentFontSize};
  line-height: 1.5;
  margin: 0 0 1rem;
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
  font-size: 0.875em;
  color: ${(props) => props.theme.code};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${(props) => props.theme.code};
    text-decoration: none;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 2px;
  }
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background-color: currentColor;
  color: inherit;
  opacity: 0.25;
  margin: 1rem 0;
`;

const ProjectsHeading = styled.h2`
  font-family: ${(props) => props.theme.headingFont};
  font-weight: 500;
  font-size: clamp(1.55rem, 2.8vw, 1.75rem);
  line-height: 1.2;
  margin: 0;
  padding-top: 1em;
  padding-bottom: 1em;
  color: ${(props) => props.theme.heading};
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProjectCard = styled.a`
  display: block;
  margin-bottom: 2em;
  padding: 1em 0;
  border: 1px solid ${(props) => props.theme.cardBorder};
  border-radius: 5px;
  background-color: ${(props) => props.theme.cardBackground};
  color: inherit;
  text-decoration: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;

  &:hover,
  &:focus-visible {
    border-color: ${(props) => props.theme.cardHoverBorder};
    background-color: ${(props) => props.theme.cardHoverBackground};
    box-shadow: ${(props) => props.theme.cardShadow};
    color: inherit;
    text-decoration: none;
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.link};
    outline-offset: 3px;
  }

  @media (max-width: 767.98px) {
    border-color: ${(props) => (props.theme.dark ? props.theme.cardBorder : '#000')};
    background-color: ${(props) => props.theme.cardHoverBackground};
    margin-top: 6em;
    margin-bottom: 6em;
    padding: 1em;
  }
`;

const ProjectInfo = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  padding: 0 1rem;

  @media (min-width: 768px) {
    padding-left: 1.5em;
    padding-right: 1.5em;
  }
`;

const ProjectTitleText = styled.h5`
  margin: 0;
  padding-top: 0.2em;
  padding-bottom: 0.2em;
  font-family: ${(props) => props.theme.bodyFont};
  font-size: 1em;
  font-weight: 600;
  line-height: 1.2;
  color: ${(props) => props.theme.projectTitleColor};
`;

const ProjectTitleRule = styled.hr`
  width: 50%;
  height: 1px;
  border: 0;
  margin: 1rem 0;
  background-color: ${(props) => props.theme.rule};
  opacity: 1;
`;

const ProjectDesc = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: ${(props) => props.theme.muted};
  text-shadow: ${(props) => (props.theme.dark ? 'none' : '5px 5px 15px rgba(51, 51, 51, 0.2)')};
`;
