import React from 'react';
import { useReveal } from '../hooks/useReveal';

export function GraphicFrame({ caption, children, className = '', minHeight }) {
  const [ref, revealed] = useReveal();
  return (
    <figure ref={ref} className={`jl-graphic-outer ${revealed ? 'is-revealed' : ''} ${className}`}>
      <div className="jl-graphic" style={minHeight ? { minHeight } : undefined}>
        <span className="jl-graphic-lr" aria-hidden="true" />
        <span className="jl-graphic-tb" aria-hidden="true" />
        <div className="jl-graphic-inner">{children}</div>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
