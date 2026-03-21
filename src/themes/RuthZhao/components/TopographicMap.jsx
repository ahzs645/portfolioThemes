import React from 'react';
import styled from 'styled-components';
import { MAP_BACKGROUND_IMAGE } from '../themeData';

function Coordinates() {
  const topTicks = Array.from({ length: 10 }, (_, index) => index * 100);
  const sideTicks = Array.from({ length: 9 }, (_, index) => index * 100);

  return (
    <>
      <TopScale>
        {topTicks.map((value) => (
          <span key={value}>{value.toFixed(2)}</span>
        ))}
      </TopScale>
      <SideScale>
        {sideTicks.map((value) => (
          <span key={value}>{value.toFixed(2)}</span>
        ))}
      </SideScale>
    </>
  );
}

function PlusMarker({ x, y, active, onClick }) {
  return (
    <MarkerButton style={{ left: `${x}%`, top: `${y}%` }} $active={active} onClick={onClick} type="button">
      +
    </MarkerButton>
  );
}

export function TopographicMap({
  regions,
  activeId,
  onSelect,
  onHoverRegion,
  onLeaveRegion,
  mapRef,
  caseStudyProjects = [],
  activeProjectId,
  onHoverProject,
  onLeaveProject,
  onSelectProject,
}) {
  return (
    <MapWrap ref={mapRef}>
      <Coordinates />
      <MapFrame>
        <BackgroundImage src={MAP_BACKGROUND_IMAGE} alt="" aria-hidden="true" />
        <GridSvg viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id="tickPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 0 L60 0" stroke="#cfd4d7" strokeWidth="1" />
            </pattern>
          </defs>

          <rect x="0" y="0" width="1000" height="700" fill="transparent" stroke="#9aa0a4" strokeWidth="1.5" />

          <path d="M0 74 L62 40 L122 0" stroke="#ccd1d4" fill="none" />
          <path d="M0 220 L24 138 L120 118 L220 0" stroke="#ccd1d4" fill="none" />
          <path d="M0 580 L32 470 L148 426 L212 368 L258 240 L320 180 L376 0" stroke="#ccd1d4" fill="none" />
          <path d="M372 700 L320 492 L390 450 L440 510 L420 700" stroke="#ccd1d4" fill="none" />
          <path d="M438 0 L416 54 L436 152 L490 232 L492 332 L444 402 L338 456" stroke="#ccd1d4" fill="none" />
          <path d="M502 0 L496 70 L544 142 L614 212 L706 208 L752 160 L748 0" stroke="#ccd1d4" fill="none" />
          <path d="M620 700 L650 590 L686 510 L712 356 L720 116 L720 0" stroke="#ccd1d4" fill="none" />
          <path d="M694 700 L656 596 L688 528 L706 418 L718 0" stroke="#ccd1d4" fill="none" />
          <path d="M778 0 L782 56 L832 112 L910 106 L972 92 L1000 124" stroke="#ccd1d4" fill="none" />
          <path d="M1000 232 L916 170 L838 182 L734 242 L726 390 L706 562 L660 700" stroke="#ccd1d4" fill="none" />
          <path d="M1000 420 L926 314 L862 266 L810 286 L782 404 L796 520 L764 700" stroke="#ccd1d4" fill="none" strokeDasharray="5 5" />

          {regions.map((region) => (
            <g key={region.id}>
              <RegionPath
                d={region.shape}
                $tone={region.tone}
                $active={region.id === activeId}
                onClick={() => onSelect(region.id)}
                onMouseEnter={() => onHoverRegion?.(region.id)}
                onMouseLeave={() => onLeaveRegion?.()}
              />
              <InnerPath
                d={region.innerShape}
                $tone={region.tone}
                $active={region.id === activeId}
              />
              <text
                x={`${region.x * 10}`}
                y={`${region.y * 7}`}
                fill={region.tone === 'accent' ? '#f77c11' : '#8a8e90'}
                fontFamily="'IBM Plex Mono', monospace"
                fontSize="16"
                textAnchor="middle"
                letterSpacing="1.5"
              >
                {region.label.toUpperCase()}
              </text>
            </g>
          ))}
        </GridSvg>

        {regions.map((region) => (
          <PlusMarker
            key={region.id}
            x={region.x}
            y={region.y - 6}
            active={region.id === activeId}
            onClick={() => onSelect(region.id)}
            onMouseEnter={() => onHoverRegion?.(region.id)}
            onMouseLeave={() => onLeaveRegion?.()}
          />
        ))}

        {caseStudyProjects.map((project) => (
          <ProjectLock
            key={project.id}
            style={{ left: `${project.anchor.x}%`, top: `${project.anchor.y}%` }}
            $active={project.id === activeProjectId}
            type="button"
            onMouseEnter={() => onHoverProject?.(project.id)}
            onMouseLeave={() => onLeaveProject?.()}
            onClick={() => onSelectProject?.(project.id)}
            title={project.previewTitle}
          >
            <span />
          </ProjectLock>
        ))}
      </MapFrame>
    </MapWrap>
  );
}

const MapWrap = styled.div`
  position: relative;
  padding: 24px 0 0 72px;
  min-width: 0;

  @media (max-width: 820px) {
    padding-left: 46px;
  }
`;

const TopScale = styled.div`
  position: absolute;
  top: 0;
  left: 72px;
  right: 0;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  color: #8a8e90;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;

  span:first-child {
    color: #f77c11;
  }
`;

const SideScale = styled.div`
  position: absolute;
  top: 24px;
  left: 0;
  bottom: 0;
  display: grid;
  grid-template-rows: repeat(9, 1fr);
  align-items: start;
  color: #8a8e90;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;

  span:first-child {
    color: #f77c11;
  }
`;

const MapFrame = styled.div`
  position: relative;
  aspect-ratio: 1000 / 700;
  width: 100%;
  min-height: 520px;
`;

const BackgroundImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.92;
  pointer-events: none;
`;

const GridSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
`;

const RegionPath = styled.path`
  fill: ${(p) => (p.$tone === 'accent' ? 'rgba(247, 124, 17, 0.04)' : 'rgba(255,255,255,0)')};
  stroke: ${(p) => (p.$tone === 'accent' ? '#f77c11' : '#ccd1d4')};
  stroke-width: ${(p) => (p.$active ? 2.2 : 1.4)};
  cursor: pointer;
  transition: stroke 160ms ease, fill 160ms ease, opacity 160ms ease;
`;

const InnerPath = styled.path`
  fill: none;
  stroke: ${(p) => (p.$tone === 'accent' ? '#f77c11' : '#ccd1d4')};
  stroke-width: 1.2;
  stroke-dasharray: 5 5;
  opacity: ${(p) => (p.$active ? 1 : 0.9)};
`;

const MarkerButton = styled.button`
  position: absolute;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: -14px 0 0 -14px;
  border: 0;
  background: ${(p) => (p.$active ? '#f77c11' : '#7f7f7f')};
  color: white;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
`;

const ProjectLock = styled.button`
  position: absolute;
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  border: 1px solid ${(p) => (p.$active ? '#f77c11' : '#9aa0a4')};
  background: rgba(255, 255, 255, 0.95);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;

  span {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: ${(p) => (p.$active ? '#f77c11' : '#9aa0a4')};
  }
`;
