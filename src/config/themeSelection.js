import { getPortfolioTheme, getThemeIdFromPath, PORTFOLIO_THEMES } from '../themes';

const THEME_SELECTION_MODES = {
  FIXED: 'fixed',
  RANDOM: 'random',
};

function normalizeThemeSelectionMode(value) {
  return value === THEME_SELECTION_MODES.RANDOM
    ? THEME_SELECTION_MODES.RANDOM
    : THEME_SELECTION_MODES.FIXED;
}

function normalizePath(pathname = '/') {
  const trimmedPath = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  return trimmedPath ? `/${trimmedPath}` : '/';
}

export const themeSelectionMode = normalizeThemeSelectionMode(
  import.meta.env.VITE_THEME_SELECTION_MODE
);

export const defaultThemeId = getPortfolioTheme(import.meta.env.VITE_DEFAULT_THEME_ID).id;

export function pickRandomThemeId() {
  const randomIndex = Math.floor(Math.random() * PORTFOLIO_THEMES.length);
  return PORTFOLIO_THEMES[randomIndex].id;
}

export function resolveThemeIdForPath(pathname) {
  const themeIdFromPath = getThemeIdFromPath(pathname);
  if (themeIdFromPath) return themeIdFromPath;

  if (themeSelectionMode === THEME_SELECTION_MODES.RANDOM) {
    return pickRandomThemeId();
  }

  return defaultThemeId;
}

export function resolveThemePath(themeId, pathname) {
  const normalizedPath = normalizePath(pathname);
  const themeIdFromPath = getThemeIdFromPath(pathname);

  if (
    themeSelectionMode === THEME_SELECTION_MODES.RANDOM &&
    normalizedPath === '/' &&
    !themeIdFromPath
  ) {
    return '/';
  }

  if (themeIdFromPath === themeId) {
    return normalizedPath;
  }

  const theme = getPortfolioTheme(themeId);
  return theme.slug === 'minimal' ? '/' : `/${theme.slug}`;
}
