import React from 'react';
import styled from 'styled-components';

export function FloatingPreview({ region, project, coords, previewRef }) {
  const source = project || region;

  return (
    <Card ref={previewRef} $accent={region.tone === 'accent'}>
      <ImageWrap>
        <PreviewImage src={source.previewImage} alt={source.previewTitle} />
        <CrosshairX />
        <CrosshairY />
        {coords ? <Readout>[{coords.x}, {coords.y}]</Readout> : null}
      </ImageWrap>
      <CardBody>
        <CardTitle>{source.previewTitle}</CardTitle>
        <CardMeta>{source.previewMeta}</CardMeta>
      </CardBody>
    </Card>
  );
}

const Card = styled.div`
  position: absolute;
  right: 28px;
  bottom: 42px;
  width: min(32vw, 320px);
  min-width: 240px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid ${(p) => (p.$accent ? '#f77c11' : '#d5dfeb')};
  box-shadow: 0 24px 55px rgba(31, 35, 40, 0.12);
  pointer-events: none;
  z-index: 4;
  transform: translate3d(0, 0, 0);

  @media (max-width: 900px) {
    position: relative;
    right: auto;
    bottom: auto;
    width: 100%;
    min-width: 0;
    margin-top: 16px;
  }
`;

const ImageWrap = styled.div`
  position: relative;
  aspect-ratio: 1.5;
  overflow: hidden;
  border-bottom: 1px solid #d5dfeb;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

const crosshairStyles = `
  position: absolute;
  background: rgba(137, 141, 144, 0.85);
`;

const CrosshairX = styled.div`
  ${crosshairStyles}
  left: 50%;
  top: 0;
  width: 1px;
  height: 100%;
`;

const CrosshairY = styled.div`
  ${crosshairStyles}
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
`;

const CardBody = styled.div`
  padding: 12px 14px 14px;
`;

const CardTitle = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.84rem;
  color: #1f2328;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const CardMeta = styled.div`
  margin-top: 6px;
  color: #8a8e90;
  font-size: 0.8rem;
`;

const Readout = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
  padding: 4px 8px;
  background: rgba(233, 240, 240, 0.92);
  color: #8a8e90;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
`;
