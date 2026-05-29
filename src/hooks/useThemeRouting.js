import { useState, useEffect, useMemo, useCallback } from 'react';
import { PORTFOLIO_THEMES, getPortfolioTheme } from '../themes';
import { resolveThemeIdForPath, resolveThemePath, lockRoute } from '../config/themeSelection';

const getInitialThemeId = () => resolveThemeIdForPath(window.location.pathname);

// Owns the active theme and keeps it in sync with the URL (pushState on change,
// popstate for back/forward). Exposes prev/next navigation over the registry.
export function useThemeRouting() {
  const [currentThemeId, setCurrentThemeId] = useState(getInitialThemeId);

  // Update URL when theme changes. Skipped in locked-route mode so the URL
  // stays pinned at the root and no theme slug ever appears in the path.
  useEffect(() => {
    if (lockRoute) return;
    const newPath = resolveThemePath(currentThemeId, window.location.pathname);
    if (window.location.pathname !== newPath) {
      window.history.pushState({ themeId: currentThemeId }, '', newPath);
    }
  }, [currentThemeId]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.themeId) {
        setCurrentThemeId(event.state.themeId);
      } else {
        setCurrentThemeId(resolveThemeIdForPath(window.location.pathname));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const currentTheme = useMemo(() => getPortfolioTheme(currentThemeId), [currentThemeId]);

  const currentThemeIndex = useMemo(
    () => PORTFOLIO_THEMES.findIndex(t => t.id === currentThemeId),
    [currentThemeId]
  );

  const goToPrevTheme = useCallback(() => {
    const prevIndex = currentThemeIndex <= 0 ? PORTFOLIO_THEMES.length - 1 : currentThemeIndex - 1;
    setCurrentThemeId(PORTFOLIO_THEMES[prevIndex].id);
  }, [currentThemeIndex]);

  const goToNextTheme = useCallback(() => {
    const nextIndex = currentThemeIndex >= PORTFOLIO_THEMES.length - 1 ? 0 : currentThemeIndex + 1;
    setCurrentThemeId(PORTFOLIO_THEMES[nextIndex].id);
  }, [currentThemeIndex]);

  return {
    currentThemeId,
    setCurrentThemeId,
    currentTheme,
    goToPrevTheme,
    goToNextTheme,
  };
}
