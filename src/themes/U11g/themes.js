export const THEME_NAMES = ['default', 'protos', 'deus', 'grid', 'nexus'];

export const THEME_PALETTES = {
  default: {
    appBg: '#27272a',
    surface: '#0a0a0a',
    surfaceHover: '#18181b',
    primary: '#ffffff',
    secondary: '#a1a1aa',
    passive: '#333333',
  },
  protos: {
    appBg: '#4c1d95',
    surface: '#0f0518',
    surfaceHover: '#2e1065',
    primary: '#e0e7ff',
    secondary: '#a78bfa',
    passive: '#3b0764',
  },
  deus: {
    appBg: '#064e3b',
    surface: '#020617',
    surfaceHover: '#052e16',
    primary: '#4ade80',
    secondary: '#22c55e',
    passive: '#064e3b',
  },
  grid: {
    appBg: '#831843',
    surface: '#2a0a18',
    surfaceHover: '#500724',
    primary: '#fbcfe8',
    secondary: '#f472b6',
    passive: '#4c0519',
  },
  nexus: {
    appBg: '#bbf7d0',
    surface: '#ffffff',
    surfaceHover: '#f0fdf4',
    primary: '#15803d',
    secondary: '#166534',
    passive: '#86efac',
  },
};

export function paletteToCssVars(palette) {
  return {
    '--u11g-app-bg': palette.appBg,
    '--u11g-surface': palette.surface,
    '--u11g-surface-hover': palette.surfaceHover,
    '--u11g-primary': palette.primary,
    '--u11g-secondary': palette.secondary,
    '--u11g-passive': palette.passive,
  };
}

export const STORAGE_KEY = 'u11g-theme';
