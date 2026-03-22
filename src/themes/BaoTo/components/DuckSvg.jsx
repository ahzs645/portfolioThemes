/**
 * Duck SVG — Exact paths from baothiento.com source (module 73442)
 * White duck + mallard variant, paddling feet animation
 */

import React from 'react';

export function DuckSvg({ mallard = false, paddleX = 21.5 }) {
  const bodyFill = mallard ? 'url(#mb)' : 'url(#wb)';
  const headFill = mallard ? 'url(#mh)' : 'url(#wh)';
  const beakFill = mallard ? 'url(#mbk)' : 'url(#wbk)';
  const wingFill = mallard ? '#726B64' : '#E8E2D8';

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ds" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5"/></filter>
        <radialGradient id="wb" cx="0.48" cy="0.38" r="0.55"><stop offset="0%" stopColor="#FAF7F2"/><stop offset="60%" stopColor="#F0EBE3"/><stop offset="100%" stopColor="#DDD6CA"/></radialGradient>
        <radialGradient id="mb" cx="0.48" cy="0.38" r="0.55"><stop offset="0%" stopColor="#A8A098"/><stop offset="60%" stopColor="#8E8680"/><stop offset="100%" stopColor="#726B64"/></radialGradient>
        <radialGradient id="wh" cx="0.46" cy="0.38" r="0.55"><stop offset="0%" stopColor="white"/><stop offset="50%" stopColor="#F5F1EB"/><stop offset="100%" stopColor="#E4DED4"/></radialGradient>
        <radialGradient id="mh" cx="0.46" cy="0.38" r="0.55"><stop offset="0%" stopColor="#2D6B4A"/><stop offset="50%" stopColor="#1B5E3A"/><stop offset="100%" stopColor="#0F4028"/></radialGradient>
        <linearGradient id="wbk" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#F0B848"/><stop offset="100%" stopColor="#D89028"/></linearGradient>
        <linearGradient id="mbk" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#C8A830"/><stop offset="100%" stopColor="#A08020"/></linearGradient>
      </defs>
      <ellipse cx="24" cy="27" rx="10" ry="7.5" fill="none" stroke="#1a4a65" strokeWidth="0.4" opacity="0.06"/>
      <ellipse cx="24" cy="27" rx="11.5" ry="8.5" fill="none" stroke="#1a4a65" strokeWidth="0.25" opacity="0.04"/>
      <ellipse cx="24.5" cy="28" rx="7.5" ry="6" fill="#1a4a65" opacity="0.08" filter="url(#ds)"/>
      <g opacity="0.35">
        <line x1={paddleX + 0.5} y1="33" x2={paddleX + 0.5} y2="36" stroke="#E8A030" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        <g transform={`translate(${paddleX},35.5)`}>
          <path d="M-0.8 0 L-1.5 2 L-0.3 1.5 L0.5 2.5 L1.3 1.5 L2.5 2 L1.8 0Z" fill="#E8A030"/>
          <path d="M-0.8 0 L-1.5 2 L-0.3 1.5 L0.5 2.5 L1.3 1.5 L2.5 2 L1.8 0Z" fill="none" stroke="#C07820" strokeWidth="0.2" opacity="0.5"/>
        </g>
      </g>
      <path d="M22 34 Q24 38,26 34" fill="#E0D8CC"/><path d="M23 34 Q24 36.5,25 34" fill="#E8E2D8"/>
      <ellipse cx="24" cy="26" rx="7" ry="8.5" fill={bodyFill}/>
      <path d="M17.5 28 Q20 34,24 35 Q28 34,30.5 28" fill="#C8C0B0" opacity="0.35"/>
      <path d="M17.2 22 Q16.8 27,17.8 32" fill="none" stroke="#C4BAA8" strokeWidth="2" opacity="0.12"/>
      <path d="M30.8 22 Q31.2 27,30.2 32" fill="none" stroke="#C4BAA8" strokeWidth="2" opacity="0.12"/>
      <ellipse cx="23" cy="23" rx="2.5" ry="3" fill="white" opacity="0.2"/>
      <path d="M30 22 Q31 26,30 30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.08"/>
      <ellipse cx="24" cy="26" rx="7" ry="8.5" fill="none" stroke="#B8B0A0" strokeWidth="0.35" opacity="0.18"/>
      <path d="M17.5 22 Q16 26.5,17.5 32 Q19.5 27.5,17.5 22Z" fill={wingFill} opacity="0.15"/>
      <path d="M17 21 Q15.5 26.5,17 32.5 Q19.5 27,17 21Z" fill={wingFill}/>
      <path d="M17.2 21.5 Q19 21,19.2 22" fill="none" stroke="white" strokeWidth="0.4" opacity="0.15"/>
      <path d="M17.8 23 Q17 26.5,17.8 30" fill="none" stroke="#CCC4B4" strokeWidth="0.4" opacity="0.3"/>
      <path d="M17 21 Q15.5 26.5,17 32.5" fill="none" stroke="#B8B0A0" strokeWidth="0.35" opacity="0.25"/>
      <path d="M30.5 22 Q32 26.5,30.5 32 Q28.5 27.5,30.5 22Z" fill={wingFill} opacity="0.15"/>
      <path d="M31 21 Q32.5 26.5,31 32.5 Q28.5 27,31 21Z" fill={wingFill}/>
      <path d="M30.8 21.5 Q29 21,28.8 22" fill="none" stroke="white" strokeWidth="0.4" opacity="0.15"/>
      <path d="M30.2 23 Q31 26.5,30.2 30" fill="none" stroke="#CCC4B4" strokeWidth="0.4" opacity="0.3"/>
      <path d="M31 21 Q32.5 26.5,31 32.5" fill="none" stroke="#B8B0A0" strokeWidth="0.35" opacity="0.25"/>
      <ellipse cx="24" cy="19.5" rx="3" ry="1.2" fill="#C4BAA8" opacity="0.2"/>
      <ellipse cx="24" cy="18.5" rx="2.3" ry="1.5" fill="#EDE8E0"/>
      <ellipse cx="24" cy="17.5" rx="2.8" ry="0.8" fill="#C8C0B2" opacity="0.15"/>
      <circle cx="24" cy="15.2" r="3.2" fill={headFill}/>
      <circle cx="23" cy="14" r="1.2" fill="white" opacity="0.25"/>
      <path d="M21 13.5 Q20.7 15.2,21.3 16.5" fill="none" stroke="#C8C0B2" strokeWidth="0.8" opacity="0.2"/>
      <path d="M27 13.5 Q27.3 15.2,26.7 16.5" fill="none" stroke="#C8C0B2" strokeWidth="0.8" opacity="0.2"/>
      <circle cx="24" cy="15.2" r="3.2" fill="none" stroke="#B8B0A2" strokeWidth="0.3" opacity="0.2"/>
      <circle cx="21.3" cy="15" r="0.6" fill="#1a1a1a"/><circle cx="26.7" cy="15" r="0.6" fill="#1a1a1a"/>
      <circle cx="21.5" cy="14.8" r="0.2" fill="white" opacity="0.6"/><circle cx="26.9" cy="14.8" r="0.2" fill="white" opacity="0.6"/>
      <path d="M21 13.2 Q24 14,27 13.2" fill="#C4BAA8" opacity="0.15"/>
      <path d="M20.8 13.5 Q20.2 11.5,21.5 10 Q24 8.5,26.5 10 Q27.8 11.5,27.2 13.5" fill={beakFill}/>
      <path d="M22.5 10.5 Q24 9.5,25.5 10.5" fill="white" opacity="0.15"/>
      <path d="M20.8 13.5 Q20.2 11.5,21.5 10 Q24 8.5,26.5 10 Q27.8 11.5,27.2 13.5" fill="none" stroke="#B07020" strokeWidth="0.35" opacity="0.35"/>
      <ellipse cx="23" cy="11" rx="0.4" ry="0.2" fill="#B07020" opacity="0.3"/>
      <ellipse cx="25" cy="11" rx="0.4" ry="0.2" fill="#B07020" opacity="0.3"/>
      <path d="M23 9.8 Q24 8.9,25 9.8" fill="#B07020" opacity="0.25"/>
      <ellipse cx="22" cy="22" rx="4" ry="5" fill="white" opacity="0.06"/>
    </svg>
  );
}
