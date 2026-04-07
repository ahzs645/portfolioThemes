import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { crtVertexShader, crtFragmentShader } from './shaders';

const BASE = '/retro-computer';

/* ─── value mapping (clamped) — direct from original ─── */
function valMap(x, from, to) {
  const y = ((x - from[0]) / (from[1] - from[0])) * (to[1] - to[0]) + to[0];
  if (to[0] < to[1]) {
    if (y < to[0]) return to[0];
    if (y > to[1]) return to[1];
  } else {
    if (y > to[0]) return to[0];
    if (y < to[1]) return to[1];
  }
  return y;
}

/* ─── render terminal lines to offscreen canvas ─── */
const CANVAS_W = 768;
const CANVAS_H = 576;

function renderTerminalToCanvas(ctx, lines, promptText, inputValue, scrollOffset) {
  const orange = '#f99021';
  const beige = '#f6d4b1';
  const red = '#ff6b6b';
  const bg = '#100c04';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const fontSize = 16;
  const lineH = 22;
  const pad = 14;
  const maxChars = Math.floor((CANVAS_W - pad * 2) / (fontSize * 0.6));

  const rows = [];
  for (const line of lines) {
    const text = line.text || '';
    for (const w of wrapText(text, maxChars)) {
      rows.push({ ...line, text: w });
    }
  }
  rows.push({ type: 'input', text: promptText + inputValue });

  const visibleLines = Math.floor((CANVAS_H - pad * 2) / lineH);
  const start = Math.max(0, rows.length - visibleLines - scrollOffset);
  const visible = rows.slice(start, start + visibleLines);

  let y = pad + lineH;
  for (const row of visible) {
    switch (row.type) {
      case 'h1':
        ctx.font = 'bold 20px "Press Start 2P", monospace';
        ctx.fillStyle = beige;
        ctx.fillText(row.text, pad, y);
        y += lineH + 6;
        continue;
      case 'h2':
        ctx.font = 'bold 16px "Press Start 2P", monospace';
        ctx.fillStyle = beige;
        ctx.fillText(row.text, pad, y);
        y += lineH + 2;
        continue;
      case 'h3':
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = beige;
        ctx.fillText(row.text, pad, y);
        break;
      case 'system':
        ctx.font = `${fontSize}px "VT323", "Courier New", monospace`;
        ctx.fillStyle = beige;
        ctx.globalAlpha = 0.65;
        ctx.fillText(row.text, pad, y);
        ctx.globalAlpha = 1;
        break;
      case 'error':
        ctx.font = `${fontSize}px "VT323", "Courier New", monospace`;
        ctx.fillStyle = red;
        ctx.fillText(row.text, pad, y);
        break;
      case 'prompt':
        ctx.font = `${fontSize}px "VT323", "Courier New", monospace`;
        ctx.fillStyle = orange;
        ctx.globalAlpha = 0.85;
        ctx.fillText(row.text, pad, y);
        ctx.globalAlpha = 1;
        break;
      case 'md':
        ctx.font = 'bold 18px "Press Start 2P", monospace';
        ctx.fillStyle = beige;
        ctx.fillText(row.text, pad, y);
        y += lineH + 4;
        continue;
      case 'input': {
        ctx.font = `${fontSize}px "VT323", "Courier New", monospace`;
        ctx.fillStyle = orange;
        ctx.fillText(row.text, pad, y);
        const cursorX = pad + ctx.measureText(row.text).width + 2;
        if (Math.floor(Date.now() / 530) % 2 === 0) {
          ctx.fillRect(cursorX, y - fontSize + 2, fontSize * 0.55, fontSize);
        }
        break;
      }
      default:
        ctx.font = `${fontSize}px "VT323", "Courier New", monospace`;
        ctx.fillStyle = orange;
        ctx.fillText(row.text, pad, y);
        break;
    }
    y += lineH;
  }
}

function wrapText(text, maxChars) {
  if (!text || text.length <= maxChars) return [text || ''];
  const result = [];
  let remaining = text;
  while (remaining.length > maxChars) {
    let breakAt = remaining.lastIndexOf(' ', maxChars);
    if (breakAt <= 0) breakAt = maxChars;
    result.push(remaining.slice(0, breakAt));
    remaining = remaining.slice(breakAt).trimStart();
  }
  if (remaining) result.push(remaining);
  return result;
}

/* ─────────────────────────────────────────────────────────
   Computer Model — follows the original's approach exactly:
   load GLTF, find meshes by name, swap materials, render
   with <primitive> to preserve the full scene graph
   ───────────────────────────────────────────────────────── */

function ComputerModel({ terminalLines, promptText, inputValue, scrollOffset, scrollRef }) {
  const gltf = useGLTF(`${BASE}/models/Commodore710_33.5.glb`);

  // Load textures with TextureLoader (like the original loader.ts)
  const bakeTexture = useLoader(THREE.TextureLoader, `${BASE}/textures/bake-quality-5.jpg`);
  const floorTexture = useLoader(THREE.TextureLoader, `${BASE}/textures/bake_floor-quality-3.jpg`);

  // Load environment map cubetexture (like the original)
  const envMap = useLoader(THREE.CubeTextureLoader, '', (loader) => {
    loader.setPath(`${BASE}/textures/environmentMap/`);
  }, undefined, undefined) || null;

  // Actually load the cube texture properly
  const cubeTexture = useMemo(() => {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath(`${BASE}/textures/environmentMap/`);
    try {
      return loader.load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
    } catch {
      return null;
    }
  }, []);

  // Create offscreen canvas + texture for terminal
  const canvasEl = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = CANVAS_W;
    c.height = CANVAS_H;
    return c;
  }, []);

  const canvasTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvasEl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [canvasEl]);

  // CRT shader material for the screen mesh
  const crtMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uDiffuse: { value: canvasTexture },
        uTime: { value: 0 },
        uProgress: { value: 1.2 },
      },
      vertexShader: crtVertexShader,
      fragmentShader: crtFragmentShader,
    });
  }, [canvasTexture]);

  // Screen material from original: MeshStandardMaterial with envMap + screen texture
  // We use the CRT shader output as the map
  const screenMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial();
    mat.metalness = 0;
    mat.roughness = 0.125;
    if (cubeTexture) {
      cubeTexture.colorSpace = THREE.SRGBColorSpace;
      mat.envMap = cubeTexture;
      mat.envMapIntensity = 0.7;
    }
    return mat;
  }, [cubeTexture]);

  // Configure textures and swap materials on the GLTF meshes (like original loader.ts + index.ts)
  const meshRefs = useRef({});
  useEffect(() => {
    // Configure baked textures exactly like the original
    bakeTexture.flipY = false;
    bakeTexture.colorSpace = THREE.SRGBColorSpace;
    bakeTexture.needsUpdate = true;

    floorTexture.flipY = false;
    floorTexture.colorSpace = THREE.SRGBColorSpace;
    floorTexture.needsUpdate = true;

    const computerMaterial = new THREE.MeshBasicMaterial({ map: bakeTexture });
    const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });

    // Find meshes by name (exactly like original loader.ts)
    const scene = gltf.scene;
    const screenMesh = scene.getObjectByName('Screen');
    const computerMesh = scene.getObjectByName('Computer');
    const crtMesh = scene.getObjectByName('CRT');
    const keyboardMesh = scene.getObjectByName('Keyboard');
    const shadowPlaneMesh = scene.getObjectByName('ShadowPlane');

    // Swap materials (exactly like original webgl/index.ts)
    if (screenMesh) {
      screenMesh.material = crtMaterial;
      meshRefs.current.screen = screenMesh;
    }
    if (computerMesh) {
      computerMesh.material = computerMaterial;
    }
    if (crtMesh) {
      crtMesh.material = computerMaterial;
      meshRefs.current.crt = crtMesh;
    }
    if (keyboardMesh) {
      keyboardMesh.material = computerMaterial;
    }
    if (shadowPlaneMesh) {
      shadowPlaneMesh.material = floorMaterial;
    }
  }, [gltf, bakeTexture, floorTexture, crtMaterial]);

  // Animation loop: update terminal canvas, CRT shader uniforms, morph targets
  const progressRef = useRef(1.2);

  useFrame((state, delta) => {
    // Render terminal text to canvas
    const ctx = canvasEl.getContext('2d');
    renderTerminalToCanvas(ctx, terminalLines, promptText, inputValue, scrollOffset);
    canvasTexture.needsUpdate = true;

    // Update CRT shader
    crtMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    progressRef.current -= delta * 0.2;
    if (progressRef.current < 0) progressRef.current = 1.2;
    crtMaterial.uniforms.uProgress.value = progressRef.current;

    // CRT morph targets (open/close animation from original)
    const crt = meshRefs.current.crt;
    if (crt?.morphTargetInfluences) {
      const scroll = scrollRef.current;
      const zoomFac = valMap(scroll, [0, 1], [0, 1]);
      crt.morphTargetInfluences[0] = valMap(zoomFac, [0, 0.1], [0.5, 0]);
    }
  });

  // Render the GLTF scene directly — preserves all transforms, hierarchy, morph targets
  return <primitive object={gltf.scene} />;
}

/* ─── Camera Controller — from original webgl/index.ts ─── */

function CameraController({ scrollRef, parallaxRef }) {
  const { camera } = useThree();
  const portraitOffset = useRef(0);

  useEffect(() => {
    const update = () => {
      portraitOffset.current = valMap(
        window.innerHeight / document.documentElement.clientWidth,
        [0.75, 1.75],
        [0, 2],
      );
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  useFrame(() => {
    const scroll = scrollRef.current;
    const po = portraitOffset.current;
    const px = parallaxRef.current;

    // Camera zoom with scroll — from original
    camera.position.z = valMap(scroll, [0, 1], [-2.5 - po, -10 - po]);

    // Parallax — smoothed like original (0.1 new + 0.9 old)
    camera.position.x =
      px.x * valMap(scroll, [0, 1], [0.2, 5]) * 0.1 + camera.position.x * 0.9;
    camera.position.y =
      px.y * valMap(scroll, [0, 1], [0.2, 1.5]) * 0.1 + camera.position.y * 0.9;

    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Animated Computer Group — scroll-driven from original ─── */

function AnimatedComputerGroup({ children, scrollRef }) {
  const groupRef = useRef();
  const portraitOffset = useRef(0);

  useEffect(() => {
    const update = () => {
      portraitOffset.current = valMap(
        window.innerHeight / document.documentElement.clientWidth,
        [0.8, 1.8],
        [0, 2.5],
      );
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const scroll = scrollRef.current;
    const zoomFac = valMap(scroll, [0, 1], [0, 1]);

    // From original: computerHorizontal=0.5, computerHeight=1.5, computerAngle=PI*0.2
    groupRef.current.position.x = 0.5 * zoomFac;
    groupRef.current.position.y = valMap(scroll, [0, 1], [0, 1.5]);
    groupRef.current.rotation.y = Math.PI * 0.2 * zoomFac;

    // Portrait mode rotation from original
    if (portraitOffset.current > 0.5) {
      groupRef.current.rotation.z = valMap(scroll, [0, 1], [-Math.PI / 2, 0]);
    } else {
      groupRef.current.rotation.z = 0;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ─── Exported Scene ─── */

export default function RetroScene({
  terminalLines,
  promptText,
  inputValue,
  scrollRef,
  parallaxRef,
  canvasOpacity,
  terminalScrollOffset,
}) {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 'var(--app-top-offset, 0px)',
        left: 0,
        width: '100%',
        height: 'calc(100vh - var(--app-top-offset, 0px))',
        zIndex: 1,
        opacity: canvasOpacity,
        transition: 'opacity 0.1s',
        cursor: 'grab',
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      dpr={2}
      camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, -2.5] }}
    >
      <color attach="background" args={['#f6d4b1']} />
      <ambientLight intensity={0.55} />

      <CameraController scrollRef={scrollRef} parallaxRef={parallaxRef} />

      <AnimatedComputerGroup scrollRef={scrollRef}>
        <ComputerModel
          terminalLines={terminalLines}
          promptText={promptText}
          inputValue={inputValue}
          scrollOffset={terminalScrollOffset}
          scrollRef={scrollRef}
        />
      </AnimatedComputerGroup>
    </Canvas>
  );
}

useGLTF.preload(`${BASE}/models/Commodore710_33.5.glb`);
