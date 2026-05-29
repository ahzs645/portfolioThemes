import { getPortfolioTheme, getThemeIdFromPath, PORTFOLIO_THEMES } from '../themes';
import { BASE_PREFIX, stripBase } from '../utils/assetPath';

const THEME_SELECTION_MODES = {
  FIXED: 'fixed',
  RANDOM: 'random',
};

function normalizeShowThemeBar(value) {
  if (value === 'false' || value === '0') return false;
  if (value === 'true' || value === '1') return true;
  // Default: show bar unless explicitly hidden
  return true;
}

function normalizeThemeSelectionMode(value) {
  return value === THEME_SELECTION_MODES.RANDOM
    ? THEME_SELECTION_MODES.RANDOM
    : THEME_SELECTION_MODES.FIXED;
}

function normalizePath(pathname = '/') {
  const stripped = stripBase(pathname);
  const trimmedPath = stripped.replace(/^\/+|\/+$/g, '').toLowerCase();
  const rel = trimmedPath ? `/${trimmedPath}` : '/';
  if (!BASE_PREFIX) return rel;
  return rel === '/' ? `${BASE_PREFIX}/` : `${BASE_PREFIX}${rel}`;
}

export const themeSelectionMode = normalizeThemeSelectionMode(
  import.meta.env.VITE_THEME_SELECTION_MODE
);

export const defaultThemeId = getPortfolioTheme(import.meta.env.VITE_DEFAULT_THEME_ID).id;

export const showThemeBar = normalizeShowThemeBar(import.meta.env.VITE_SHOW_THEME_BAR);

function normalizeHideInitials(value) {
  if (value === 'false' || value === '0') return false;
  if (value === 'true' || value === '1') return true;
  return true; // hidden by default
}

export const hideInitialsSetting = normalizeHideInitials(import.meta.env.VITE_HIDE_INITIALS);

function normalizeLockRoute(value) {
  if (value === 'true' || value === '1') return true;
  return false; // off by default: theme slugs are reflected in the URL
}

// When true, the app stays pinned at the root URL and never reflects the theme
// slug in the path (no sub-pages). In random mode this means every visit shows
// a random theme at "/" without navigating to "/<slug>".
export const lockRoute = normalizeLockRoute(import.meta.env.VITE_LOCK_ROUTE);

export function pickRandomThemeId() {
  const randomIndex = Math.floor(Math.random() * PORTFOLIO_THEMES.length);
  return PORTFOLIO_THEMES[randomIndex].id;
}

export function resolveThemeIdForPath(pathname) {
  // Locked-route mode ignores the path entirely: random mode always picks a new
  // random theme, fixed mode always uses the default. No slug-based sub-pages.
  if (lockRoute) {
    return themeSelectionMode === THEME_SELECTION_MODES.RANDOM
      ? pickRandomThemeId()
      : defaultThemeId;
  }

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

  if (themeIdFromPath === themeId) {
    return normalizedPath;
  }

  const theme = getPortfolioTheme(themeId);
  const rel = theme.slug === 'minimal' ? '/' : `/${theme.slug}`;
  if (!BASE_PREFIX) return rel;
  return rel === '/' ? `${BASE_PREFIX}/` : `${BASE_PREFIX}${rel}`;
}
