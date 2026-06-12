import { useState, useEffect, useMemo, useCallback } from 'react';
import { PORTFOLIO_THEMES, THEME_INDEX_BY_ID, getPortfolioTheme } from '../themes';
import {
  isRandomThemeGatePath,
  resolveThemeIdForPath,
  resolveThemeIdForPathWithGate,
  resolveThemePath,
  lockRoute,
} from '../config/themeSelection';

const getInitialThemeId = () => resolveThemeIdForPath(window.location.pathname);

// Owns the active theme and keeps it in sync with the URL (pushState on change,
// popstate for back/forward). Exposes prev/next navigation over the registry.
export function useThemeRouting() {
  const [currentThemeId, setCurrentThemeId] = useState(getInitialThemeId);
  const [themeRoutingLoading, setThemeRoutingLoading] = useState(true);
  const [preserveCurrentPath, setPreserveCurrentPath] = useState(() => (
    isRandomThemeGatePath(window.location.pathname)
  ));

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialTheme() {
      const themeId = await resolveThemeIdForPathWithGate(window.location.pathname);
      if (!cancelled) {
        setCurrentThemeId(themeId);
        setPreserveCurrentPath(isRandomThemeGatePath(window.location.pathname));
        setThemeRoutingLoading(false);
      }
    }

    resolveInitialTheme();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update URL when theme changes. Skipped in locked-route mode so the URL
  // stays pinned at the root and no theme slug ever appears in the path.
  useEffect(() => {
    if (lockRoute || themeRoutingLoading || preserveCurrentPath) return;
    const newPath = resolveThemePath(currentThemeId, window.location.pathname);
    if (window.location.pathname !== newPath) {
      window.history.pushState({ themeId: currentThemeId }, '', newPath);
    }
  }, [currentThemeId, preserveCurrentPath, themeRoutingLoading]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.themeId) {
        setPreserveCurrentPath(false);
        setCurrentThemeId(event.state.themeId);
      } else {
        const shouldPreservePath = isRandomThemeGatePath(window.location.pathname);
        setPreserveCurrentPath(shouldPreservePath);
        resolveThemeIdForPathWithGate(window.location.pathname).then(setCurrentThemeId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const currentTheme = useMemo(() => getPortfolioTheme(currentThemeId), [currentThemeId]);

  const currentThemeIndex = THEME_INDEX_BY_ID.get(currentThemeId) ?? 0;

  const changeThemeId = useCallback((themeId) => {
    setPreserveCurrentPath(false);
    setCurrentThemeId(themeId);
  }, []);

  const goToPrevTheme = useCallback(() => {
    const prevIndex = currentThemeIndex <= 0 ? PORTFOLIO_THEMES.length - 1 : currentThemeIndex - 1;
    setPreserveCurrentPath(false);
    setCurrentThemeId(PORTFOLIO_THEMES[prevIndex].id);
  }, [currentThemeIndex]);

  const goToNextTheme = useCallback(() => {
    const nextIndex = currentThemeIndex >= PORTFOLIO_THEMES.length - 1 ? 0 : currentThemeIndex + 1;
    setPreserveCurrentPath(false);
    setCurrentThemeId(PORTFOLIO_THEMES[nextIndex].id);
  }, [currentThemeIndex]);

  return {
    currentThemeId,
    themeRoutingLoading,
    setCurrentThemeId: changeThemeId,
    currentTheme,
    goToPrevTheme,
    goToNextTheme,
  };
}
