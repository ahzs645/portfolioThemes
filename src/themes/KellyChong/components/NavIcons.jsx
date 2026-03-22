import React from 'react';

export function HomeIcon({ color = 'currentColor', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 1.5L1.5 11.5H4.5V23.5H10.5V16.5H15.5V23.5H21.5V11.5H24.5L13 1.5Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InfoIcon({ color = 'currentColor', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="26" height="18" rx="1.5" stroke={color} strokeWidth="1.2" />
      <path d="M1 1.5L9 9.5L1 18.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M27 1.5L19 9.5L27 18.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path
        d="M14 15C12.5 13.8 11.3 12.7 10.4 11.8C9.5 10.8 8.8 9.9 8.4 9.1C8 8.3 7.8 7.5 7.8 6.7C7.8 5.7 8.1 4.9 8.7 4.3C9.3 3.7 10.1 3.3 11.1 3.3C11.7 3.3 12.3 3.5 12.8 3.7C13.3 4 13.7 4.4 14 4.9C14.3 4.4 14.7 4 15.2 3.7C15.7 3.5 16.3 3.3 16.9 3.3C17.9 3.3 18.7 3.7 19.3 4.3C19.9 4.9 20.2 5.7 20.2 6.7C20.2 7.5 20 8.3 19.6 9.1C19.2 9.9 18.5 10.8 17.6 11.8C16.7 12.7 15.5 13.8 14 15Z"
        fill={color}
      />
    </svg>
  );
}

export function ProjectsIcon({ color = 'currentColor', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="0.5" width="22" height="14" rx="1" stroke={color} strokeWidth="1.2" />
      <rect x="5.5" y="2.5" width="17" height="10" fill={color} opacity="0.3" />
      <path d="M0 19.5L3 14H25L28 19.5V21.5H0V19.5Z" stroke={color} strokeWidth="1" fill="none" />
      <line x1="0.5" y1="21" x2="27.5" y2="21" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

export function LogsIcon({ color = 'currentColor', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3V19H19" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="14" r="1.5" fill={color} />
      <circle cx="11" cy="10" r="1.5" fill={color} />
      <circle cx="15" cy="12" r="1.5" fill={color} />
      <circle cx="18" cy="6" r="1.5" fill={color} />
      <path d="M7 14L11 10L15 12L18 6" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CreditsIcon({ color = 'currentColor', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="22" height="16" rx="2" stroke={color} strokeWidth="1.2" />
      <path d="M1 5H23" stroke={color} strokeWidth="1" />
      <path d="M1 8H23" stroke={color} strokeWidth="0.6" />
      <rect x="3" y="11" width="8" height="4" rx="0.5" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}
