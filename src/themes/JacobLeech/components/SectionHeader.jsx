import React from 'react';
import { useReveal } from '../hooks/useReveal';

export function SectionHeader({ title, aside, align = 'left' }) {
  const [ref, revealed] = useReveal();
  return (
    <div
      ref={ref}
      className={`jl-section-header jl-reveal ${revealed ? 'is-revealed' : ''} ${
        align === 'right' ? 'jl-section-header-right' : ''
      }`}
    >
      <h2>{title}</h2>
      {aside ? <span className="jl-aside">{aside}</span> : null}
    </div>
  );
}
