import mapLight from './assets/map.png';
import mapDark from './assets/map-dark.png';

export const MAP_BACKGROUND_IMAGE = mapLight;

// Dark-mode variant: the source PNG's contour lines are black at low alpha (invisible on a
// dark background), so this recolored version makes them white while keeping the orange accents.
export const MAP_BACKGROUND_IMAGE_DARK = mapDark;

// Project marker positions from source CSS (transform: translate(-50%, -50%))
// These are positioned absolutely on the map image
export const PROJECT_MARKERS = [
  {
    id: 'ramp',
    label: 'RAMP',
    meta: 'Case Study - 2025',
    x: 50,
    y: 53,
    accent: true,
  },
  {
    id: 'penn-labs',
    label: 'PENN LABS',
    meta: 'Case Study - 2025',
    x: 61,
    y: 57,
    accent: false,
  },
  {
    id: 'illustrated-poetry',
    label: 'ILLUSTRATED POETRY',
    meta: 'Art - 2024',
    x: 30,
    y: 73,
    accent: false,
  },
  {
    id: 'living-loom',
    label: 'LIVING-LOOM',
    meta: 'Research - 2024',
    x: 69,
    y: 29,
    accent: false,
  },
  {
    id: 'tarot-cards',
    label: 'TAROT CARDS',
    meta: 'Art - 2024',
    x: 34,
    y: 64,
    accent: false,
  },
  {
    id: 'e-textiles',
    label: 'E-TEXTILES',
    meta: 'Research - 2024',
    x: 59,
    y: 23,
    accent: false,
  },
];

// Mobile project cards (shown on phone breakpoint instead of the map)
export const MOBILE_PROJECTS = [
  { id: 'ramp', label: 'RAMP', meta: 'Case Study - 2025' },
  { id: 'penn-labs', label: 'PENN LABS', meta: 'Case Study - 2025' },
  { id: 'illustrated-poetry', label: 'ILLUSTRATED POETRY', meta: 'Art - 2024' },
  { id: 'living-loom', label: 'LIVING-LOOM', meta: 'Research - 2024' },
  { id: 'e-textiles', label: 'E-TEXTILES', meta: 'Research - 2024' },
];

export const FOOTER_LINKS = ['LinkedIn', 'GitHub', 'Email'];
