import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Duck from './Duck';

export default function ThreeView({ scrollPercent, isScrolling }) {
  const canvasRef = useRef();
  const [fogDistance, setFogDistance] = useState(0);

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
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 0, 5]} intensity={2} />

        {/* Grid helper rotated 45 degrees */}
        <gridHelper
          args={[100, 100, '#444', '#444']}
          rotation={[0, Math.PI / 4, 0]}
        />

        {/* Fog effect */}
        <fog attach="fog" args={['#000', 0, fogDistance]} />

        <Suspense fallback={null}>
          <Duck
            scrollPercent={scrollPercent}
            isScrolling={isScrolling}
            setFogDistance={setFogDistance}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
