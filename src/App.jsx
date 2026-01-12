import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useConfig } from './contexts/ConfigContext';
import { PORTFOLIO_THEMES, getPortfolioTheme } from './themes';

export default function App() {
  const { loading, error } = useConfig();
  const [currentThemeId, setCurrentThemeId] = useState('ansub-minimal');
  const [showCatalog, setShowCatalog] = useState(false);

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
      <CatalogView>
        <CatalogHeader>
          <h1>Resume Themes</h1>
          <CloseButton onClick={() => setShowCatalog(false)}>Close</CloseButton>
        </CatalogHeader>
        <ThemeGrid>
          {PORTFOLIO_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              $active={theme.id === currentThemeId}
              onClick={() => {
                setCurrentThemeId(theme.id);
                setShowCatalog(false);
              }}
            >
              <ThemeName>{theme.name}</ThemeName>
              <ThemeDescription>{theme.description}</ThemeDescription>
            </ThemeCard>
          ))}
        </ThemeGrid>
      </CatalogView>
    );
  }

  const ThemeComponent = currentTheme?.Component;

  return (
    <AppContainer>
      <ThemeSwitcher>
        <SwitcherButton onClick={() => setShowCatalog(true)}>
          Switch Theme ({currentTheme?.name})
        </SwitcherButton>
      </ThemeSwitcher>
      <ThemeContainer>
        {ThemeComponent ? <ThemeComponent /> : <div>No theme selected</div>}
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

const ThemeSwitcher = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
`;

const SwitcherButton = styled.button`
  background: rgba(0, 0, 0, 0.8);
  color: #f5f5f5;
  border: 1px solid #333;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: #555;
  }
`;

const ThemeContainer = styled.div`
  flex: 1;
  overflow: auto;
`;

const CatalogView = styled.div`
  height: 100%;
  background: #0b0b0b;
  color: #f5f5f5;
  padding: 24px;
  overflow: auto;
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

const CloseButton = styled.button`
  background: #1f2937;
  color: #f5f5f5;
  border: 1px solid #374151;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #374151;
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const ThemeCard = styled.button`
  text-align: left;
  background: ${({ $active }) => ($active ? '#1f2937' : '#111827')};
  border: 2px solid ${({ $active }) => ($active ? '#3b82f6' : '#1f2937')};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ $active }) => ($active ? '#3b82f6' : '#374151')};
  }
`;

const ThemeName = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ThemeDescription = styled.div`
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.4;
`;
