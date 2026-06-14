import {
  Children,
  cloneElement,
  createRef,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { Canvas, createPortal, extend, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';

/* ============================================================================
 * Hero: FBO curl-noise particle cloud (ported from qtzx.dev's GPGPU sim)
 * ========================================================================== */

const SIM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CURL_NOISE = /* glsl */ `
  vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  vec3 snoiseVec3(vec3 x){
    float s  = snoise(vec3(x));
    float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
    float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
    return vec3(s, s1, s2);
  }
  vec3 curlNoise(vec3 p){
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    vec3 p_x0 = snoiseVec3(p - dx);
    vec3 p_x1 = snoiseVec3(p + dx);
    vec3 p_y0 = snoiseVec3(p - dy);
    vec3 p_y1 = snoiseVec3(p + dy);
    vec3 p_z0 = snoiseVec3(p - dz);
    vec3 p_z1 = snoiseVec3(p + dz);
    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
    const float divisor = 1.0 / (2.0 * e);
    return normalize(vec3(x, y, z) * divisor);
  }
`;

const SIM_FRAGMENT = /* glsl */ `
  uniform sampler2D positions;
  uniform float uTime;
  uniform float uFrequency;
  varying vec2 vUv;
  ${CURL_NOISE}
  void main() {
    vec3 pos = texture2D(positions, vUv).rgb;
    vec3 curlPos = texture2D(positions, vUv).rgb;
    pos = curlNoise(pos * uFrequency + uTime * 0.1);
    curlPos = curlNoise(curlPos * uFrequency + uTime * 0.1);
    curlPos += curlNoise(curlPos * uFrequency * 2.0) * 0.5;
    gl_FragColor = vec4(mix(pos, curlPos, sin(uTime)), 1.0);
  }
`;

const RENDER_VERTEX = /* glsl */ `
  uniform sampler2D uPositions;
  void main() {
    vec3 pos = texture2D(uPositions, position.xy).xyz;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = 3.0;
    gl_PointSize *= step(1.0 - (1.0 / 64.0), position.x) + 0.5;
  }
`;

const RENDER_FRAGMENT = /* glsl */ `
  void main() {
    vec3 color = vec3(0.34, 0.53, 0.96);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function buildSpherePositions(count, radius) {
  const data = new Float32Array(4 * count);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i += 1) {
    let x;
    let y;
    let z;
    let lenSq;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
      lenSq = x * x + y * y + z * z;
    } while (lenSq > 1 || lenSq === 0);
    v.set(x, y, z).normalize().multiplyScalar(radius);
    data[i * 4 + 0] = v.x;
    data[i * 4 + 1] = v.y;
    data[i * 4 + 2] = v.z;
    data[i * 4 + 3] = 1;
  }
  return data;
}

class SimulationMaterial extends THREE.ShaderMaterial {
  constructor(size = 138) {
    const positionsTexture = new THREE.DataTexture(
      buildSpherePositions(size * size, 128),
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    positionsTexture.needsUpdate = true;

    super({
      uniforms: {
        positions: { value: positionsTexture },
        uTime: { value: 0 },
        uFrequency: { value: 0.25 },
      },
      vertexShader: SIM_VERTEX,
      fragmentShader: SIM_FRAGMENT,
    });
  }
}

extend({ SimulationMaterial });

function FBOParticles({ size = 138 }) {
  const simRef = useRef(null);
  const pointsRef = useRef(null);

  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / 2 ** 53, 1),
    []
  );

  const positions = useMemo(
    () => new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]),
    []
  );
  const uvs = useMemo(
    () => new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]),
    []
  );

  const renderTarget = useMemo(
    () =>
      new THREE.WebGLRenderTarget(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
      }),
    [size]
  );

  const particlesPosition = useMemo(() => {
    const length = size * size;
    const data = new Float32Array(length * 3);
    for (let i = 0; i < length; i += 1) {
      data[i * 3 + 0] = (i % size) / size;
      data[i * 3 + 1] = Math.floor(i / size) / size;
      data[i * 3 + 2] = 0;
    }
    return data;
  }, [size]);

  const uniforms = useMemo(() => ({ uPositions: { value: null } }), []);

  useEffect(() => () => renderTarget.dispose(), [renderTarget]);

  useFrame((state) => {
    const { gl, clock } = state;
    if (simRef.current) simRef.current.uniforms.uTime.value = clock.elapsedTime;
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    if (pointsRef.current) {
      pointsRef.current.material.uniforms.uPositions.value = renderTarget.texture;
    }
  });

  return (
    <>
      {createPortal(
        <mesh>
          <simulationMaterial ref={simRef} args={[size]} />
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-uv" args={[uvs, 2]} />
          </bufferGeometry>
        </mesh>,
        scene
      )}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlesPosition, 3]} />
        </bufferGeometry>
        <shaderMaterial
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fragmentShader={RENDER_FRAGMENT}
          vertexShader={RENDER_VERTEX}
          uniforms={uniforms}
        />
      </points>
    </>
  );
}

export function HeroParticles({ interactive = true }) {
  const [hasWebGL] = useState(() => {
    if (typeof document === 'undefined') return true;
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  if (!hasWebGL) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 45%, #171717 0%, #050505 68%)',
        }}
      />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 1.4] }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      style={{ background: 'black', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <FBOParticles />
      {interactive && <OrbitControls enableZoom={false} enablePan={false} enableDamping />}
    </Canvas>
  );
}

/* ============================================================================
 * ShapeBlur: SDF rounded-rect border with a mouse-follow reveal
 * (ported from qtzx.dev — frames media so its edges dissolve into the bg)
 * ========================================================================== */

const SHAPE_VERTEX = /* glsl */ `
  varying vec2 v_texcoord;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_texcoord = uv;
  }
`;

const SHAPE_FRAGMENT = /* glsl */ `
  varying vec2 v_texcoord;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_pixelRatio;
  uniform float u_shapeSize;
  uniform float u_roundness;
  uniform float u_borderSize;
  uniform float u_circleSize;
  uniform float u_circleEdge;
  uniform vec3 u_color;

  #ifndef PI
  #define PI 3.1415926535897932384626433832795
  #endif
  #ifndef TWO_PI
  #define TWO_PI 6.2831853071795864769252867665590
  #endif
  #ifndef VAR
  #define VAR 0
  #endif

  vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    if (u_resolution.x > u_resolution.y) {
      p.x *= u_resolution.x / u_resolution.y;
      p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
      p.y *= u_resolution.y / u_resolution.x;
      p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    p -= 0.5;
    p *= vec2(-1.0, 1.0);
    return p;
  }

  #define st0 coord(gl_FragCoord.xy)
  #define mx coord(u_mouse * u_pixelRatio)

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
  }
  float sdCircle(in vec2 st, in vec2 center) { return length(st - center) * 2.0; }
  float sdPoly(in vec2 p, in float w, in int sides) {
    float a = atan(p.x, p.y) + PI;
    float r = TWO_PI / float(sides);
    float d = cos(floor(0.5 + a / r) * r - a) * length(max(abs(p) * 1.0, 0.0));
    return d * 2.0 - w;
  }
  float aastep(float threshold, float value) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
  }
  float fill(in float x) { return 1.0 - aastep(0.0, x); }
  float fill(float x, float size, float edge) { return 1.0 - smoothstep(size - edge, size + edge, x); }
  float strokeAA(float x, float size, float w, float edge) {
    float afwidth = length(vec2(dFdx(x), dFdy(x))) * 0.70710678;
    float d = smoothstep(size - edge - afwidth, size + edge + afwidth, x + w * 0.5)
            - smoothstep(size - edge - afwidth, size + edge + afwidth, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
  }

  void main() {
    vec2 st = st0 + 0.5;
    vec2 posMouse = mx * vec2(1.0, -1.0) + 0.5;
    float size = u_shapeSize;
    float roundness = u_roundness;
    float borderSize = u_borderSize;
    float circleSize = u_circleSize;
    float circleEdge = u_circleEdge;
    float sdfCircle = fill(sdCircle(st, posMouse), circleSize, circleEdge);
    float sdf;
    if (VAR == 0) {
      sdf = sdRoundRect(st, vec2(size), roundness);
      sdf = strokeAA(sdf, 0.0, borderSize, sdfCircle) * 4.0;
    } else if (VAR == 1) {
      sdf = sdCircle(st, vec2(0.5));
      sdf = fill(sdf, 0.6, sdfCircle) * 1.2;
    } else if (VAR == 2) {
      sdf = sdCircle(st, vec2(0.5));
      sdf = strokeAA(sdf, 0.58, 0.02, sdfCircle) * 4.0;
    } else {
      sdf = sdPoly(st - vec2(0.5, 0.45), 0.3, 3);
      sdf = fill(sdf, 0.05, sdfCircle) * 1.4;
    }
    gl_FragColor = vec4(u_color, sdf);
  }
`;

export function ShapeBlur({
  className = '',
  variation = 0,
  pixelRatioProp = 2,
  shapeSize = 1.2,
  roundness = 0.4,
  borderSize = 0.05,
  circleSize = 0.3,
  circleEdge = 0.5,
  color = [1, 1, 1],
}) {
  const mountRef = useRef(null);
  const colorKey = color.join(',');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const vMouse = new THREE.Vector2();
    const vMouseDamp = new THREE.Vector2();
    const vResolution = new THREE.Vector2();
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera();
    camera.position.z = 1;

    const test = document.createElement('canvas');
    if (!test.getContext('webgl') && !test.getContext('experimental-webgl')) {
      mount.style.background = 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)';
      return () => {
        mount.style.background = '';
      };
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true });
    } catch {
      mount.style.background = 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)';
      return () => {
        mount.style.background = '';
      };
    }
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader: SHAPE_VERTEX,
      fragmentShader: SHAPE_FRAGMENT,
      uniforms: {
        u_mouse: { value: vMouseDamp },
        u_resolution: { value: vResolution },
        u_pixelRatio: { value: pixelRatioProp },
        u_shapeSize: { value: shapeSize },
        u_roundness: { value: roundness },
        u_borderSize: { value: borderSize },
        u_circleSize: { value: circleSize },
        u_circleEdge: { value: circleEdge },
        u_color: { value: new THREE.Color(color[0], color[1], color[2]) },
      },
      defines: { VAR: variation },
      transparent: true,
    });
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    const onMove = (event) => {
      const rect = mount.getBoundingClientRect();
      vMouse.set(event.clientX - rect.left, event.clientY - rect.top);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('pointermove', onMove);

    const resize = () => {
      const el = mountRef.current;
      if (!el) return;
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      const pr = Math.min(window.devicePixelRatio, 2);
      renderer.setSize(w, h);
      renderer.setPixelRatio(pr);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      quad.scale.set(w, h, 1);
      vResolution.set(w, h).multiplyScalar(pr);
      material.uniforms.u_pixelRatio.value = pr;
    };
    resize();
    window.addEventListener('resize', resize);
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    let last = performance.now() * 0.001;
    const animate = () => {
      const now = performance.now() * 0.001;
      const dt = now - last;
      last = now;
      vMouseDamp.x = THREE.MathUtils.damp(vMouseDamp.x, vMouse.x, 8, dt);
      vMouseDamp.y = THREE.MathUtils.damp(vMouseDamp.y, vMouse.y, 8, dt);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ro.disconnect();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointermove', onMove);
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variation, pixelRatioProp, shapeSize, roundness, borderSize, circleSize, circleEdge, colorKey]);

  return <div className={className} ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}

/* ============================================================================
 * AsciiText: the "what if?" wavy ASCII panel (canvas, grayscale)
 * ========================================================================== */

export function AsciiText({ text = '"what if?"' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let frame = 0;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const ramp = ' .:-=+*#%@';
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      ctx.font = '600 12px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cols = Math.max(28, Math.floor(width / 10));
      const rows = Math.max(8, Math.floor(height / 13));
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const dx = x / cols - 0.5;
          const dy = y / rows - 0.5;
          const wave = Math.sin(dx * 18 + frame * 0.035) + Math.cos(dy * 16 - frame * 0.028);
          const mask = Math.exp(-(dx * dx * 6 + dy * dy * 10));
          const idx = Math.max(
            0,
            Math.min(ramp.length - 1, Math.floor((wave * 0.5 + mask) * 4.2))
          );
          const shade = 70 + Math.floor(mask * 150);
          ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${0.08 + mask * 0.4})`;
          ctx.fillText(ramp[idx], (x + 0.5) * (width / cols), (y + 0.5) * (height / rows));
        }
      }

      const fontSize = Math.min(140, width / 5);
      ctx.font = `700 ${fontSize}px "Yeseva One", Georgia, serif`;
      const gradient = ctx.createLinearGradient(
        width / 2 - fontSize,
        height / 2 - fontSize / 2,
        width / 2 + fontSize,
        height / 2 + fontSize / 2
      );
      gradient.addColorStop(0, 'rgba(64,64,64,0.55)');
      gradient.addColorStop(0.5, 'rgba(160,160,160,0.5)');
      gradient.addColorStop(1, 'rgba(210,210,210,0.55)');
      ctx.fillStyle = gradient;
      ctx.fillText(text, width / 2, height / 2);

      frame += 1;
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'grayscale(1)' }}
    />
  );
}

/* ============================================================================
 * CardSwap: GSAP 3D card stack (ported from qtzx.dev about section)
 * ========================================================================== */

export const SwapCard = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`qtzx-swap-card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
SwapCard.displayName = 'SwapCard';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

export function CardSwap({
  width = 290,
  height = 290,
  cardDistance = 40,
  verticalDistance = 40,
  delay = 5000,
  skewAmount = 3,
  easing = 'smooth',
  children,
}) {
  const config =
    easing === 'elastic'
      ? { ease: 'elastic.out(0.6,0.9)', durDrop: 2, durMove: 2, durReturn: 2, promoteOverlap: 0.9, returnDelay: 0.05 }
      : { ease: 'power1.inOut', durDrop: 0.8, durMove: 0.8, durReturn: 0.8, promoteOverlap: 0.45, returnDelay: 0.2 };

  const childArray = useMemo(() => Children.toArray(children), [children]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refs = useMemo(() => childArray.map(() => createRef()), [childArray.length]);
  const order = useRef(Array.from({ length: childArray.length }, (_, i) => i));
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const total = refs.length;
    if (total === 0) return undefined;

    refs.forEach((node, i) => {
      if (node.current) placeNow(node.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
    });

    const swap = () => {
      if (order.current.length < 2) return;
      const [front, ...rest] = order.current;
      const frontEl = refs[front].current;
      if (!frontEl) return;

      const tl = gsap.timeline();
      timelineRef.current = tl;
      tl.to(frontEl, { y: '+=500', duration: config.durDrop, ease: config.ease });
      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${i * 0.15}`);
      });
      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(() => gsap.set(frontEl, { zIndex: backSlot.zIndex }), undefined, 'return');
      tl.to(frontEl, { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease }, 'return');
      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timelineRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, skewAmount, easing, refs]);

  return (
    <div
      ref={containerRef}
      className="qtzx-card-swap"
      style={{ width, height, perspective: '900px', position: 'relative' }}
    >
      {childArray.map((child, i) =>
        isValidElement(child)
          ? cloneElement(child, {
              key: i,
              ref: refs[i],
              style: { width, height, ...(child.props.style ?? {}) },
            })
          : child
      )}
    </div>
  );
}

/* ============================================================================
 * TargetCursor: GSAP spinning corner-bracket cursor (ported from qtzx.dev)
 * ========================================================================== */

export function TargetCursor({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
  isVisible = false,
}) {
  const wrapperRef = useRef(null);
  const spinRef = useRef(null);
  const visibleRef = useRef(isVisible);

  const isTouch = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const coarse = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return coarse && window.innerWidth <= 768;
  }, []);

  useEffect(() => {
    if (isTouch || !wrapperRef.current) return undefined;
    const wrapper = wrapperRef.current;
    const corners = wrapper.querySelectorAll('.target-cursor-corner');
    const cornerSize = 12;
    const borderWidth = 3;
    const previousCursor = document.body.style.cursor;
    let activeTarget = null;
    let leaveHandler = null;

    gsap.set(wrapper, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const startSpin = () => {
      spinRef.current?.kill();
      spinRef.current = gsap
        .timeline({ repeat: -1 })
        .to(wrapper, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };
    startSpin();

    const moveCursor = (event) => {
      if (!visibleRef.current) return;
      gsap.to(wrapper, { x: event.clientX, y: event.clientY, duration: 0.1, ease: 'power3.out' });
    };
    window.addEventListener('mousemove', moveCursor, { passive: true });

    const onMouseOver = (event) => {
      if (!visibleRef.current) return;
      let el = event.target;
      let target = null;
      while (el && el !== document.body) {
        if (el.matches?.(targetSelector)) {
          target = el;
          break;
        }
        el = el.parentElement;
      }
      if (!target || target === activeTarget) return;

      activeTarget = target;
      gsap.killTweensOf(wrapper, 'rotation');
      spinRef.current?.pause();
      gsap.set(wrapper, { rotation: 0 });

      const rect = target.getBoundingClientRect();
      const cx = gsap.getProperty(wrapper, 'x');
      const cy = gsap.getProperty(wrapper, 'y');
      const offsets = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize },
      ];
      corners.forEach((corner, i) => {
        gsap.to(corner, { x: offsets[i].x - cx, y: offsets[i].y - cy, duration: 0.2, ease: 'power2.out' });
      });

      leaveHandler = () => {
        activeTarget = null;
        const reset = [
          { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: cornerSize * 0.5 },
          { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
        ];
        corners.forEach((corner, i) => {
          gsap.to(corner, { x: reset[i].x, y: reset[i].y, duration: 0.3, ease: 'power3.out' });
        });
        startSpin();
        target.removeEventListener('mouseleave', leaveHandler);
      };
      target.addEventListener('mouseleave', leaveHandler);
    };
    window.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', onMouseOver);
      if (activeTarget && leaveHandler) activeTarget.removeEventListener('mouseleave', leaveHandler);
      spinRef.current?.kill();
      document.body.style.cursor = previousCursor;
    };
  }, [targetSelector, spinDuration, isTouch]);

  useEffect(() => {
    visibleRef.current = isVisible;
    if (isTouch || !wrapperRef.current) return;
    gsap.to(wrapperRef.current, { opacity: isVisible ? 1 : 0, duration: 0.3, ease: 'power2.out' });
    if (hideDefaultCursor) document.body.style.cursor = isVisible ? 'none' : 'auto';
  }, [isVisible, isTouch, hideDefaultCursor]);

  if (isTouch) return null;

  return (
    <div ref={wrapperRef} className="target-cursor-wrapper" style={{ opacity: 0 }} aria-hidden="true">
      <div className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
}

/* ============================================================================
 * Loader: rotating blue particle sphere (ported from qtzx.dev's loading screen)
 * ========================================================================== */

const SNOISE_GLSL = /* glsl */ `
  vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+10.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

export function LoaderSphere({ color = 0x101a88 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const fallback = () => {
      mount.style.background =
        'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 38%, transparent 70%)';
      mount.style.borderRadius = '9999px';
    };

    const test = document.createElement('canvas');
    if (!test.getContext('webgl') && !test.getContext('experimental-webgl')) {
      fallback();
      return () => {
        mount.style.background = '';
      };
    }

    const isMobile = window.innerWidth < 640;
    const radius = isMobile ? 0.6 : 0.8;
    const detail = 40;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      fallback();
      return () => {
        mount.style.background = '';
      };
    }
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const makeDot = (size = 32, fill = '#ffffff') => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const path = new Path2D();
      path.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill(path);
      return new THREE.CanvasTexture(canvas);
    };

    const geometry = new THREE.IcosahedronGeometry(1, detail);
    const material = new THREE.PointsMaterial({
      map: makeDot(),
      blending: THREE.AdditiveBlending,
      color,
      depthTest: false,
      transparent: true,
    });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      shader.uniforms.radius = { value: radius };
      shader.uniforms.particleSizeMin = { value: 0.01 };
      shader.uniforms.particleSizeMax = { value: 0.08 };
      shader.vertexShader = `
        uniform float particleSizeMax;
        uniform float particleSizeMin;
        uniform float radius;
        uniform float time;
        ${SNOISE_GLSL}
        ${shader.vertexShader}
      `;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        vec3 p = position;
        float n = snoise( vec3( p.x*.6 + time*0.2, p.y*0.4 + time*0.3, p.z*.2 + time*0.2) );
        p += n * 0.4;
        float l = radius / length(p);
        p *= l;
        float s = mix(particleSizeMin, particleSizeMax, n);
        vec3 transformed = vec3( p.x, p.y, p.z );
      `
      );
      shader.vertexShader = shader.vertexShader.replace('gl_PointSize = size;', 'gl_PointSize = s;');
      material.userData.shader = shader;
    };

    const mesh = new THREE.Points(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      mesh.rotation.set(0, t * 0.2, 0);
      if (material.userData.shader) material.userData.shader.uniforms.time.value = t;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [color]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} aria-hidden="true" />;
}

/* ============================================================================
 * GlassSurface: SVG-displacement liquid glass (ported from qtzx.dev nav)
 * ========================================================================== */

export function GlassSurface({
  children,
  width = 'auto',
  height = 'auto',
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  className = '',
  style = {},
}) {
  const uid = useId().replace(/:/g, '-');
  const filterId = `glass-filter-${uid}`;
  const redId = `red-grad-${uid}`;
  const blueId = `blue-grad-${uid}`;

  const containerRef = useRef(null);
  const feImageRef = useRef(null);
  const redRef = useRef(null);
  const greenRef = useRef(null);
  const blueRef = useRef(null);
  const gaussianRef = useRef(null);

  useEffect(() => {
    const buildMap = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const w = rect?.width || 400;
      const h = rect?.height || 200;
      const edge = Math.min(w, h) * (borderWidth * 0.5);
      const svg = `
        <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${redId}" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="red"/>
            </linearGradient>
            <linearGradient id="${blueId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="blue"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${w}" height="${h}" fill="black"></rect>
          <rect x="0" y="0" width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${redId})" />
          <rect x="0" y="0" width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${blueId})" style="mix-blend-mode: ${mixBlendMode}" />
          <rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
        </svg>`;
      feImageRef.current?.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(svg)}`);
      [
        [redRef, redOffset],
        [greenRef, greenOffset],
        [blueRef, blueOffset],
      ].forEach(([ref, offset]) => {
        if (ref.current) {
          ref.current.setAttribute('scale', (distortionScale + offset).toString());
          ref.current.setAttribute('xChannelSelector', xChannel);
          ref.current.setAttribute('yChannelSelector', yChannel);
        }
      });
      gaussianRef.current?.setAttribute('stdDeviation', displace.toString());
    };

    buildMap();
    let raf = requestAnimationFrame(buildMap);
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(buildMap);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
    redId,
    blueId,
  ]);

  const containerStyle = {
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    '--glass-frost': backgroundOpacity,
    '--glass-saturation': saturation,
    '--filter-id': `url(#${filterId})`,
  };

  return (
    <div ref={containerRef} className={`glass-surface glass-surface--svg ${className}`.trim()} style={containerStyle}>
      <svg className="glass-surface__filter" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            <feDisplacementMap ref={redRef} in="SourceGraphic" in2="map" result="dispRed" />
            <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
            <feDisplacementMap ref={greenRef} in="SourceGraphic" in2="map" result="dispGreen" />
            <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
            <feDisplacementMap ref={blueRef} in="SourceGraphic" in2="map" result="dispBlue" />
            <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>
      <div className="glass-surface__content">{children}</div>
    </div>
  );
}

/* ============================================================================
 * Typewriters
 * ========================================================================== */

// Cycling typewriter: sequence = [text, pauseMs, text, pauseMs, ...]
export function TypeAnimation({ sequence = [], as: Wrapper = 'span', className, cursor = true, speed = 40 }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const strings = sequence.filter((item) => typeof item === 'string');
    const pauses = sequence.filter((item) => typeof item === 'number');
    if (strings.length === 0) return undefined;

    let cancelled = false;
    let timer = null;
    const typeDelay = Math.max(12, 110 - speed);

    const run = async () => {
      let index = 0;
      const wait = (ms) =>
        new Promise((resolve) => {
          timer = window.setTimeout(resolve, ms);
        });

      while (!cancelled) {
        const target = strings[index % strings.length];
        const hold = pauses[index % Math.max(1, pauses.length)] || 1600;

        for (let i = 1; i <= target.length && !cancelled; i += 1) {
          setValue(target.slice(0, i));
          await wait(typeDelay);
        }
        await wait(hold);
        for (let i = target.length; i >= 0 && !cancelled; i -= 1) {
          setValue(target.slice(0, i));
          await wait(typeDelay * 0.6);
        }
        index += 1;
      }
    };
    run();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sequence, speed]);

  return (
    <Wrapper className={className}>
      {value}
      {cursor && <span className="qtzx-type-cursor">|</span>}
    </Wrapper>
  );
}

// One-shot multiline typewriter for the hero name (types "FIRST\nLAST").
export function NameType({ text, active, className }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!active) {
      setValue('');
      return undefined;
    }
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setValue(text.slice(0, index));
      if (index >= text.length) window.clearInterval(id);
    }, 32);
    return () => window.clearInterval(id);
  }, [active, text]);

  return <span className={className}>{value}</span>;
}
