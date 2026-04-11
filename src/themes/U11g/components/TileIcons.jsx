import React from 'react';

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  width: 28,
  height: 28,
};

export function TileIcon({ id }) {
  switch (id) {
    case 'projects':
      return (
        <svg {...base}>
          <path d="M2 4h14v2H2V4zm0 4h10v2H2V8zm0 4h6v2H2v-2zm12 6h8v2h-8v-2zm4-4h4v2h-4v-2z" />
        </svg>
      );
    case 'work':
      return (
        <svg {...base}>
          <path d="M8 4h8v2H8V4zm-4 4h16v12H4V8zm2 2v8h12v-8H6z" />
        </svg>
      );
    case 'skills':
      return (
        <svg {...base}>
          <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
        </svg>
      );
    case 'about':
      return (
        <svg {...base}>
          <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm-7 18v-2a7 7 0 0 1 14 0v2H5z" />
        </svg>
      );
    case 'education':
      return (
        <svg {...base}>
          <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
        </svg>
      );
    case 'awards':
      return (
        <svg {...base}>
          <path d="M12 2l2.39 4.84L20 8l-4 3.9.94 5.5L12 14.77 7.06 17.4 8 11.9 4 8l5.61-1.16L12 2z" />
        </svg>
      );
    case 'more':
      return (
        <svg {...base}>
          <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
        </svg>
      );
    case 'contact':
      return (
        <svg {...base}>
          <path d="M2 4h20v16H2V4zm2 2v.5l8 5 8-5V6H4zm0 2.5V18h16V8.5l-8 5-8-5z" />
        </svg>
      );
    default:
      return null;
  }
}
