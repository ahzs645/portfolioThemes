import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useConfig } from './contexts/ConfigContext';
import { showThemeBar } from './config/themeSelection';
import { useDarkMode } from './hooks/useDarkMode';
import { useThemeRouting } from './hooks/useThemeRouting';
import { ThemeLoading } from './features/preview/ThemeLoading';
import { CatalogView } from './features/catalog/CatalogView';
import { ThemeViewer } from './features/viewer/ThemeViewer';

export default function App() {
  const { loading, error } = useConfig();
  const [darkMode, setDarkMode] = useDarkMode();
  const { currentThemeId, themeRoutingLoading, setCurrentThemeId, currentTheme, goToPrevTheme, goToNextTheme } = useThemeRouting();
  const [showCatalog, setShowCatalog] = useState(false);

  const selectTheme = useCallback((themeId) => {
    setCurrentThemeId(themeId);
    setShowCatalog(false);
  }, [setCurrentThemeId]);

  if (loading || themeRoutingLoading) {
    return <ThemeLoading label="Loading resume data..." />;
  }

  if (error) {
    return (
      <ErrorScreen>
        <h2>Error loading resume</h2>
        <p>{error}</p>
        <p>Make sure CV.yaml is in the public folder.</p>
      </ErrorScreen>
    );
  }

  if (showThemeBar && showCatalog) {
    return (
      <CatalogView
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentThemeId={currentThemeId}
        onSelectTheme={selectTheme}
        onClose={() => setShowCatalog(false)}
      />
    );
  }

  return (
    <ThemeViewer
      currentTheme={currentTheme}
      currentThemeId={currentThemeId}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      onPrev={goToPrevTheme}
      onNext={goToNextTheme}
      onOpenCatalog={() => setShowCatalog(true)}
    />
  );
}

const ErrorScreen = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  background: #0b0b0b;
  color: #f5f5f5;
  text-align: center;
  padding: 24px;

  h2 {
    color: #ef4444;
    margin-bottom: 8px;
  }

  p {
    color: #a3a3a3;
    margin-bottom: 4px;
  }
`;
