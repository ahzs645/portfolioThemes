import { createGlobalStyle } from 'styled-components';

export const colors = {
  text900: 'var(--ch-text900, rgb(23 23 23))',
  text700: 'var(--ch-text700, rgb(64 64 64))',
  text500: 'var(--ch-text500, rgb(115 115 115))',
  text400: 'var(--ch-text400, rgb(163 163 163))',
  text200: 'var(--ch-text200, rgb(229 229 229))',
  bg: 'var(--ch-bg, #ffffff)',
  bg50: 'var(--ch-bg50, rgb(250 250 250))',
  bg100: 'var(--ch-bg100, rgb(245 245 245))',
  bg200: 'var(--ch-bg200, rgb(229 229 229))',
  border: 'var(--ch-border, rgb(229 229 229))',
};

export const CHESTER_LIGHT_VARS = {
  '--ch-text900': 'rgb(23 23 23)',
  '--ch-text700': 'rgb(64 64 64)',
  '--ch-text500': 'rgb(115 115 115)',
  '--ch-text400': 'rgb(163 163 163)',
  '--ch-text200': 'rgb(229 229 229)',
  '--ch-bg': '#ffffff',
  '--ch-bg50': 'rgb(250 250 250)',
  '--ch-bg100': 'rgb(245 245 245)',
  '--ch-bg200': 'rgb(229 229 229)',
  '--ch-border': 'rgb(229 229 229)',
  '--ch-nav-bg': 'hsla(0, 0%, 100%, 0.7)',
  '--ch-arrow-hover-bg': '#ffffff',
  '--ch-tag-shadow': 'rgba(0, 0, 0, 0.1)',
};

export const CHESTER_DARK_VARS = {
  '--ch-text900': 'rgb(236 236 236)',
  '--ch-text700': 'rgb(196 196 196)',
  '--ch-text500': 'rgb(148 148 148)',
  '--ch-text400': 'rgb(110 110 110)',
  '--ch-text200': 'rgb(55 55 55)',
  '--ch-bg': '#111214',
  '--ch-bg50': 'rgb(22 24 27)',
  '--ch-bg100': 'rgb(30 33 36)',
  '--ch-bg200': 'rgb(48 52 56)',
  '--ch-border': 'rgb(48 52 56)',
  '--ch-nav-bg': 'hsla(220, 13%, 12%, 0.85)',
  '--ch-arrow-hover-bg': 'rgb(30 33 36)',
  '--ch-tag-text': 'rgb(246 246 246)',
  '--ch-tag-shadow': 'rgba(255, 255, 255, 0.16)',
};

export const fonts = {
  serif: "'Fraunces', ui-serif, Georgia, 'Times New Roman', serif",
  sans: "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};

export const TAG_PALETTE = {
  orange: { bg: 'rgba(251, 146, 60, 0.4)', text: 'rgb(124 45 18)', decoration: '#fb923c' },
  amber:  { bg: 'rgba(251, 191, 36, 0.4)', text: 'rgb(120 53 15)', decoration: '#fbbf24' },
  lime:   { bg: 'rgba(163, 230, 53, 0.4)', text: 'rgb(54 83 20)',  decoration: '#a3e635' },
  green:  { bg: 'rgba(74, 222, 128, 0.4)', text: 'rgb(20 83 45)',  decoration: '#4ade80' },
  teal:   { bg: 'rgba(45, 212, 191, 0.4)', text: 'rgb(19 78 74)',  decoration: '#2dd4bf' },
  sky:    { bg: 'rgba(56, 189, 248, 0.4)', text: 'rgb(12 74 110)', decoration: '#38bdf8' },
  indigo: { bg: 'rgba(129, 140, 248, 0.4)', text: 'rgb(49 46 129)', decoration: '#818cf8' },
  purple: { bg: 'rgba(192, 132, 252, 0.4)', text: 'rgb(88 28 135)', decoration: '#c084fc' },
  fuchsia:{ bg: 'rgba(232, 121, 249, 0.4)', text: 'rgb(112 26 117)', decoration: '#e879f9' },
  rose:   { bg: 'rgba(251, 113, 133, 0.4)', text: 'rgb(136 19 55)',  decoration: '#fb7185' },
};

export const TAG_COLOR_KEYS = Object.keys(TAG_PALETTE);

export const cardVariants = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' } },
};

export const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

export const FRAUNCES_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,200;9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@300;400;500;600&display=swap';

export const GlobalReset = createGlobalStyle`
  .chester-how-main, .chester-how-main *, .chester-how-main *::before, .chester-how-main *::after {
    box-sizing: border-box;
  }
  .chester-how-main {
    min-height: 100%;
  }
  .chester-how-main a { color: inherit; text-decoration: none; }
`;
