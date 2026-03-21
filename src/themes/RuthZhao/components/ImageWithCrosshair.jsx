import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';

export const ImageWithCrosshair = forwardRef(function ImageWithCrosshair({ image, focalX = 30, focalY = 50, lockedPos }, ref) {
  const containerRef = useRef(null);
  const [targetPos, setTargetPos] = useState(null);
  const [displayPos, setDisplayPos] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const lerpFactor = 0.15;

  useImperativeHandle(ref, () => ({
    getRect: () => containerRef.current?.getBoundingClientRect(),
  }));

  const handleMove = (e) => {
    if (lockedPos) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleLeave = () => {
    setIsHovering(false);
    if (!lockedPos) {
      setTargetPos(null);
      setDisplayPos(null);
    }
  };

  // When locked to a project marker, snap crosshair there
  useEffect(() => {
    if (lockedPos && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (lockedPos.x / 100) * rect.width;
      const y = (lockedPos.y / 100) * rect.height;
      setTargetPos({ x, y });
      setIsHovering(true);
    }
  }, [lockedPos]);

  useEffect(() => {
    let frame;
    const animate = () => {
      if (targetPos) {
        setDisplayPos((prev) =>
          prev
            ? {
                x: prev.x + (targetPos.x - prev.x) * lerpFactor,
                y: prev.y + (targetPos.y - prev.y) * lerpFactor,
              }
            : targetPos
        );
      } else {
        setDisplayPos(null);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [targetPos]);

  const topTicks = 16;
  const leftTicks = 14;
  const topTickPositions = Array.from({ length: topTicks }, (_, i) => (i + 1) / (topTicks + 1));
  const leftTickPositions = Array.from({ length: leftTicks }, (_, i) => (i + 1) / (leftTicks + 1));

  return (
    <Container
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <MapImage src={image} alt="" style={{ objectPosition: `${focalX}% ${focalY}%` }} />

      {displayPos && (
        <>
          <CrosshairV style={{ left: displayPos.x, opacity: isHovering ? 1 : 0 }} />
          <CrosshairH style={{ top: displayPos.y, opacity: isHovering ? 1 : 0 }} />
          <CoordLabel style={{ left: displayPos.x + 20, top: displayPos.y - 40 }}>
            [{Math.round(displayPos.x)}, {Math.round(displayPos.y)}]
          </CoordLabel>
        </>
      )}

      {topTickPositions.map((pos, i) => (
        <TopTick key={`top-${i}`} style={{ left: `${pos * 100}%` }} />
      ))}
      {leftTickPositions.map((pos, i) => (
        <LeftTick key={`left-${i}`} style={{ top: `${pos * 100}%` }} />
      ))}
    </Container>
  );
});

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border: 1px solid #898d90;
  box-sizing: border-box;
  cursor: crosshair;
`;

const MapImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
  pointer-events: none;
`;

const CrosshairV = styled.div`
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: #898d90;
  transition: opacity 0.25s ease;
  pointer-events: none;
`;

const CrosshairH = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: #898d90;
  transition: opacity 0.25s ease;
  pointer-events: none;
`;

const CoordLabel = styled.div`
  position: absolute;
  padding: 4px 8px;
  background: #e9f0f0;
  color: #8f9090;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
`;

const TopTick = styled.div`
  position: absolute;
  top: 0;
  width: 1px;
  height: 10px;
  background: #898d90;
  pointer-events: none;
`;

const LeftTick = styled.div`
  position: absolute;
  left: 0;
  width: 10px;
  height: 1px;
  background: #898d90;
  pointer-events: none;
`;
