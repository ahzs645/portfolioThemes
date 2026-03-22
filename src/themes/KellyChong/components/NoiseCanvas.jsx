import { useRef, useEffect } from 'react';
import styled from 'styled-components';

export default function NoiseCanvas({ opacity = 40, blendMode = 'multiply' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    let timeoutId;
    const draw = () => {
      const imageData = ctx.createImageData(size, size);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = opacity;
      }
      ctx.putImageData(imageData, 0, 0);
      timeoutId = setTimeout(draw, 120);
    };
    draw();
    return () => clearTimeout(timeoutId);
  }, [opacity]);

  return <Canvas ref={canvasRef} $blendMode={blendMode} />;
}

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  image-rendering: pixelated;
  mix-blend-mode: ${(p) => p.$blendMode};
  z-index: 2;
`;
