import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Duck from './Duck';

export default function ThreeView({ scrollPercent, isScrolling }) {
  const canvasRef = useRef();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <Canvas
        ref={canvasRef}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
        camera={{
          position: [0, 2, 4],
          rotation: [-Math.PI / 12, 0, 0],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
      >
        {/* Ambient light for overall brightness */}
        <ambientLight intensity={0.6} />

        {/* Main directional light from above-front-right for highlights */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.8}
          castShadow
        />

        {/* Secondary directional light from the left for fill */}
        <directionalLight
          position={[-5, 5, 3]}
          intensity={0.8}
        />

        {/* Point light for additional brightness on the duck */}
        <pointLight position={[10, 0, 5]} intensity={2} />

        {/* Top point light for extra highlights */}
        <pointLight position={[0, 10, 0]} intensity={1} />

        {/* Grid helper rotated 45 degrees */}
        <gridHelper
          args={[100, 100, '#444', '#444']}
          rotation={[0, Math.PI / 4, 0]}
        />

        {/* Fog effect */}
        <fog attach="fog" args={['#000', 0, 30]} />

        <Suspense fallback={null}>
          <Duck
            scrollPercent={scrollPercent}
            isScrolling={isScrolling}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
