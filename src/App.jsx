import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useConfig } from './contexts/ConfigContext';
import { PORTFOLIO_THEMES, getPortfolioTheme } from './themes';
import { envConfig } from './config/envConfig';

const getInitialDarkMode = () => {
  // First check localStorage
  try {
    const stored = localStorage.getItem('portfolioThemes-darkMode');
    if (stored !== null) return stored === 'true';
  } catch {}

  // Then check env config default
  if (envConfig.defaultDarkMode !== null) {
    return envConfig.defaultDarkMode;
  }

  // Finally fall back to system preference
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
};

export default function App() {
  const { loading, error } = useConfig();

  // Initialize state from environment configuration
  const [currentThemeId, setCurrentThemeId] = useState(envConfig.themeId);
  const [showCatalog, setShowCatalog] = useState(envConfig.isGalleryMode);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  // Determine if we should show the top bar
  // In gallery mode, always show catalog header instead
  // In theme mode, respect the showTopBar config
  const shouldShowTopBar = envConfig.isThemeMode && envConfig.showTopBar;

  useEffect(() => {
    try {
      localStorage.setItem('portfolioThemes-darkMode', darkMode);
    } catch {}
  }, [darkMode]);

  const currentTheme = useMemo(() => getPortfolioTheme(currentThemeId), [currentThemeId]);

  if (loading) {
    return (
      <LoadingScreen>
        <span>Loading resume data...</span>
      </LoadingScreen>
    );
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

  if (showCatalog) {
    return (
      <CatalogView $darkMode={darkMode}>
        <CatalogHeader>
          <h1>Resume Themes</h1>
          <HeaderActions>
            <ModeToggle
              $darkMode={darkMode}
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </ModeToggle>
            <CloseButton $darkMode={darkMode} onClick={() => setShowCatalog(false)}>Close</CloseButton>
          </HeaderActions>
        </CatalogHeader>
        <ThemeGrid>
          {PORTFOLIO_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              $active={theme.id === currentThemeId}
              $darkMode={darkMode}
              onClick={() => {
                setCurrentThemeId(theme.id);
                setShowCatalog(false);
              }}
            >
              <ThemeName $darkMode={darkMode}>{theme.name}</ThemeName>
              <ThemeDescription $darkMode={darkMode}>{theme.description}</ThemeDescription>
            </ThemeCard>
          ))}
        </ThemeGrid>
      </CatalogView>
    );
  }

  const ThemeComponent = currentTheme?.Component;

  // When in theme mode without top bar, render just the theme
  if (!shouldShowTopBar && !showCatalog) {
    return (
      <AppContainer>
        <ThemeContainerFullHeight>
          {ThemeComponent ? <ThemeComponent darkMode={darkMode} /> : <div>No theme selected</div>}
        </ThemeContainerFullHeight>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <TopBar $darkMode={darkMode}>
        <ThemeInfo>
          <ThemeLabel $darkMode={darkMode}>Theme:</ThemeLabel>
          <CurrentThemeName $darkMode={darkMode}>{currentTheme?.name}</CurrentThemeName>
        </ThemeInfo>
        <TopBarActions>
          <SwitcherButton $darkMode={darkMode} onClick={() => setShowCatalog(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Browse Themes
          </SwitcherButton>
          <ModeToggleSmall
            $darkMode={darkMode}
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </ModeToggleSmall>
        </TopBarActions>
      </TopBar>
      <ThemeContainer>
        {ThemeComponent ? <ThemeComponent darkMode={darkMode} /> : <div>No theme selected</div>}
      </ThemeContainer>
    </AppContainer>
  );
}

const LoadingScreen = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  background: #0b0b0b;
  color: #f5f5f5;
  font-size: 14px;
`;

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

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: ${({ $darkMode }) => ($darkMode ? '#0f0f0f' : '#ffffff')};
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#262626' : '#e5e7eb')};
  z-index: 1000;
  flex-shrink: 0;
`;

const ThemeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ThemeLabel = styled.span`
  font-size: 13px;
  color: ${({ $darkMode }) => ($darkMode ? '#737373' : '#6b7280')};
`;

const CurrentThemeName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SwitcherButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

const ModeToggleSmall = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

const ThemeContainer = styled.div`
  flex: 1;
  overflow: auto;
`;

const ThemeContainerFullHeight = styled.div`
  height: 100%;
  overflow: auto;
`;

const CatalogView = styled.div`
  height: 100%;
  background: ${({ $darkMode }) => ($darkMode ? '#0b0b0b' : '#f9fafb')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
  padding: 24px;
  overflow: auto;
  transition: background 0.2s, color 0.2s;
`;

const CatalogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 600;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModeToggle = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#1f2937' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#374151' : '#d1d5db')};
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#374151' : '#f3f4f6')};
  }
`;

const CloseButton = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#1f2937' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#374151' : '#d1d5db')};
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#374151' : '#f3f4f6')};
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const ThemeCard = styled.button`
  text-align: left;
  background: ${({ $active, $darkMode }) => {
    if ($darkMode) return $active ? '#1f2937' : '#111827';
    return $active ? '#e0e7ff' : '#ffffff';
  }};
  border: 2px solid ${({ $active, $darkMode }) => {
    if ($darkMode) return $active ? '#3b82f6' : '#1f2937';
    return $active ? '#3b82f6' : '#e5e7eb';
  }};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ $active, $darkMode }) => {
      if ($darkMode) return $active ? '#3b82f6' : '#374151';
      return $active ? '#3b82f6' : '#9ca3af';
    }};
  }
`;

const ThemeName = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
`;

const ThemeDescription = styled.div`
  font-size: 13px;
  color: ${({ $darkMode }) => ($darkMode ? '#9ca3af' : '#6b7280')};
  line-height: 1.4;
`;
