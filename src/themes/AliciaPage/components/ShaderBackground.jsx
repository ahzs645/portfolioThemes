import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERTEX_SHADER = `void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAGMENT_SHADER = `
#define cloud

precision mediump float;
uniform vec3 iResolution;
uniform float iTime;
uniform float uLightMode;

float hash21(vec2 p) {
  float h = dot(p, vec2(127.1, 311.7));
  return -1.0 + 2.0 * fract(sin(h) * 43758.5453123);
}

vec2 hash22(vec2 p) {
  p = p * mat2(127.1, 311.7, 269.5, 183.3);
  p = -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  return sin(p * 6.283 + iTime);
}

float perlin_noise(vec2 p) {
  vec2 pi = floor(p);
  vec2 pf = p - pi;
  vec2 w = pf * pf * (3.0 - 2.0 * pf);

  float f00 = dot(hash22(pi + vec2(0.0, 0.0)), pf - vec2(0.0, 0.0));
  float f01 = dot(hash22(pi + vec2(0.0, 1.0)), pf - vec2(0.0, 1.0));
  float f10 = dot(hash22(pi + vec2(1.0, 0.0)), pf - vec2(1.0, 0.0));
  float f11 = dot(hash22(pi + vec2(1.0, 1.0)), pf - vec2(1.0, 1.0));

  float xm1 = mix(f00, f10, w.x);
  float xm2 = mix(f01, f11, w.x);
  return mix(xm1, xm2, w.y);
}

float noise_sum(vec2 p) {
  p *= 4.0;
  float a = 1.0, r = 0.0, s = 0.0;
  for (int i = 0; i < 5; i++) {
    r += a * perlin_noise(p);
    s += a;
    p *= 2.0;
    a *= 0.5;
  }
  return r / s;
}

float noise(vec2 p) {
  return noise_sum(p);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  uv *= vec2(iResolution.x / iResolution.y, 1.0);

  vec2 zoomCenter = vec2(0.5, 0.5);
  float zoomAmount = 0.2;
  vec2 zoomedUV = (uv - zoomCenter) * zoomAmount + zoomCenter;

  float f = noise(zoomedUV);
  f += 0.2 * hash21(uv * 2.0);

  if (uLightMode > 0.5) {
    f = f * 0.6 + 0.85;
  } else {
    f = f * 0.6 + 0.03;
  }

  vec3 color = vec3(f);
  gl_FragColor = vec4(color, 1.0);
}
`;

export default function ShaderBackground({ isDark }) {
  const containerRef = useRef(null);
  const uniformsRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Update light mode when darkMode changes
  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.uLightMode.value = isDark ? 0 : 1;
    }
  }, [isDark]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(width, height, 1) },
      uLightMode: { value: isDark ? 0 : 1 },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      uniforms,
      fragmentShader: FRAGMENT_SHADER,
      vertexShader: VERTEX_SHADER,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      uniforms.iResolution.value.set(w, h, 1);
      renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);

    function animate() {
      uniforms.iTime.value = 0.001 * (Date.now() - startTimeRef.current);
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
