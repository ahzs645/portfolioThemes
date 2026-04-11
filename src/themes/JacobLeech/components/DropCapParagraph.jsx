import React from 'react';

export function DropCapParagraph({ text, suffix, className = '' }) {
  if (!text) return null;
  const trimmed = text.trim();
  const first = trimmed.charAt(0).toUpperCase();
  const rest = trimmed.slice(1);
  return (
    <p className={`jl-feature ${className}`}>
      <span className="jl-drop-cap">{first}</span>
      {rest}
      {suffix ? <> {suffix}</> : null}
    </p>
  );
}
