import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
  color: ${p => p.$color || 'var(--th-line-red)'};
`;

const Mono = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export default function TechnicalDetails({ index, label, showHeight, color }) {
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <Row $color={color}>
      <Mono>Content {index}</Mono>
      <Mono>&quot; {label} &quot;</Mono>
      <Mono>Width:{dims.w}px</Mono>
      {showHeight && <Mono>Height:{dims.h}px</Mono>}
      {showHeight && <Mono>Padding:24px</Mono>}
    </Row>
  );
}
