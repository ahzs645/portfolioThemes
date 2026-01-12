import React, { useState } from 'react';
import styled from 'styled-components';
import { PORTFOLIO_THEMES } from '../portfolioThemes';
import { useConfig } from '../../contexts/ConfigContext';

function setSearchParams(next) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(next)) {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
      continue;
    }
    url.searchParams.set(key, value);
  }
  window.location.assign(url.toString());
}

export function PortfolioThemeCatalog() {
  const { cvData } = useConfig();
  const fullName = cvData?.cv?.name || 'User';

  const themes = PORTFOLIO_THEMES;
  const [selectedThemeId, setSelectedThemeId] = useState(themes[0]?.id || 'xp');

  const selected = themes.find((t) => t.id === selectedThemeId) || themes[0];

  return (
    <Page>
      <Header>
        <Title>Portfolio Themes</Title>
        <Subtitle>Loaded from CV.yaml for {fullName}</Subtitle>
      </Header>

      <Grid>
        <ThemeList>
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              $active={theme.id === selectedThemeId}
              onClick={() => setSelectedThemeId(theme.id)}
              type="button"
            >
              <ThemeName>{theme.name}</ThemeName>
              <ThemeDescription>{theme.description}</ThemeDescription>
              <ThemeActions>
                <SmallButton
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchParams({ theme: theme.id, catalog: null });
                  }}
                >
                  Open
                </SmallButton>
              </ThemeActions>
            </ThemeCard>
          ))}
        </ThemeList>

        <Preview>
          <PreviewHeader>
            <PreviewTitle>{selected?.name} preview</PreviewTitle>
            <SmallButton type="button" onClick={() => setSearchParams({ theme: selected?.id, catalog: null })}>
              Open full page
            </SmallButton>
          </PreviewHeader>

          <PreviewBody>
            {selected?.id === 'xp' ? (
              <PreviewHint>
                The Windows XP theme is interactive and best viewed full-screen.
              </PreviewHint>
            ) : selected?.Component ? (
              <PreviewFrame>
                <selected.Component />
              </PreviewFrame>
            ) : (
              <PreviewHint>No preview available.</PreviewHint>
            )}
          </PreviewBody>
        </Preview>
      </Grid>
    </Page>
  );
}

const Page = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: 24px;
  background: #0b0b0b;
  color: #f5f5f5;
`;

const Header = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 12px;
  color: #a3a3a3;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ThemeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ThemeCard = styled.button`
  text-align: left;
  background: ${({ $active }) => ($active ? '#111827' : '#0f172a')};
  border: 1px solid ${({ $active }) => ($active ? '#374151' : '#1f2937')};
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
`;

const ThemeName = styled.div`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const ThemeDescription = styled.div`
  font-size: 12px;
  color: #a3a3a3;
  line-height: 1.35;
`;

const ThemeActions = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button`
  appearance: none;
  border: 1px solid #334155;
  background: #111827;
  color: #f5f5f5;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #0b1220;
  }
`;

const Preview = styled.div`
  border: 1px solid #1f2937;
  border-radius: 10px;
  overflow: hidden;
  background: #050505;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #1f2937;
`;

const PreviewTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
`;

const PreviewBody = styled.div`
  height: min(720px, calc(100vh - 140px));
  overflow: hidden;
`;

const PreviewFrame = styled.div`
  height: 100%;
  width: 100%;
`;

const PreviewHint = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  color: #a3a3a3;
  font-size: 12px;
  padding: 24px;
  text-align: center;
`;
