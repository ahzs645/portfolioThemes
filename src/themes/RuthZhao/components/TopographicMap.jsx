import React, { useState } from 'react';
import styled from 'styled-components';
import { ImageWithCrosshair } from './ImageWithCrosshair';
import { ProjectMarker } from './ProjectMarker';
import { MAP_BACKGROUND_IMAGE } from '../themeData';

function CoordinateScale({ axis }) {
  if (axis === 'left') {
    const values = [0, 100, 200, 300, 400, 500, 600, 700, 800];
    return (
      <LeftIndex>
        {values.map((v, i) => (
          <ScaleLabel key={v} $first={i === 0}>
            {v.toFixed(2)}
          </ScaleLabel>
        ))}
      </LeftIndex>
    );
  }

  const values = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  return (
    <TopIndex>
      {values.map((v, i) => (
        <ScaleLabel key={v} $first={i === 0}>
          {v.toFixed(2)}
        </ScaleLabel>
      ))}
    </TopIndex>
  );
}

export function TopographicMap({ projects = [], mapRef, onSelectProject }) {
  const [lockedPos, setLockedPos] = useState(null);

  return (
    <MapWrap ref={mapRef}>
      <CoordinateScale axis="left" />
      <MapArea>
        <CoordinateScale axis="top" />
        <MapContainer>
          <ImageWithCrosshair
            image={MAP_BACKGROUND_IMAGE}
            focalX={30}
            focalY={50}
            lockedPos={lockedPos}
          />

          {projects.map((project) => (
            <ProjectMarker
              key={project.id}
              label={project.label}
              accent={project.accent}
              style={{ left: `${project.x}%`, top: `${project.y}%` }}
              onHover={() => setLockedPos({ x: project.x, y: project.y })}
              onLeave={() => setLockedPos(null)}
              onClick={() => onSelectProject?.(project)}
            />
          ))}
        </MapContainer>
      </MapArea>
    </MapWrap>
  );
}

const MapWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  flex: 1 0 0px;
  gap: 25px;
  height: 100%;
  overflow: visible;
`;

const LeftIndex = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 25px 0 0 0;
  align-items: flex-end;
`;

const TopIndex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const ScaleLabel = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: ${(p) => (p.$first ? '#f77c11' : 'rgba(0, 0, 0, 0.5)')};
  white-space: pre;
`;

const MapArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 0 0px;
  gap: 10px;
  height: 100%;
  justify-content: center;
  overflow: visible;
`;

const MapContainer = styled.div`
  position: relative;
  flex: 1 0 0px;
  width: 100%;
  height: 1px;
`;
