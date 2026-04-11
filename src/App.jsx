import { useState, useMemo, useEffect, useRef, useCallback, Component } from 'react';
import { createPortal } from 'react-dom';
import styled, { StyleSheetManager } from 'styled-components';
import { useConfig } from './contexts/ConfigContext';
import { PORTFOLIO_THEMES, getPortfolioTheme } from './themes';
import { resolveThemeIdForPath, resolveThemePath, showThemeBar, hideInitialsSetting } from './config/themeSelection';

class PreviewErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.themeId !== this.props.themeId) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#1a1a1a', color: '#737373', fontSize: '13px',
          flexDirection: 'column', gap: '6px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Preview unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

function IsolatedPreview({ children, width, height }) {
  const iframeRef = useRef(null);
  const [iframeState, setIframeState] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.documentElement.style.height = '100%';
      doc.body.style.margin = '0';
      doc.body.style.height = '100%';
      doc.body.style.display = 'flex';
      doc.body.style.overflow = 'hidden';
      let mountEl = doc.getElementById('preview-root');
      if (!mountEl) {
        mountEl = doc.createElement('div');
        mountEl.id = 'preview-root';
        doc.body.appendChild(mountEl);
      }
      mountEl.style.width = '100%';
      mountEl.style.height = '100%';
      mountEl.style.display = 'flex';
      mountEl.style.flex = '1';
      mountEl.style.flexDirection = 'column';
      setIframeState({ mountEl, head: doc.head });
    };
    iframe.addEventListener('load', handleLoad);
    // Trigger for srcDoc
    if (iframe.contentDocument?.readyState === 'complete') handleLoad();
    return () => iframe.removeEventListener('load', handleLoad);
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        srcDoc="<!DOCTYPE html><html><head></head><body></body></html>"
        style={{ width, height, border: 'none', display: 'block' }}
        title="Theme preview"
      />
      {iframeState && createPortal(
        <StyleSheetManager target={iframeState.head}>
          {children}
        </StyleSheetManager>,
        iframeState.mountEl
      )}
    </>
  );
}


const getInitialDarkMode = () => {
  try {
    const stored = localStorage.getItem('portfolioThemes-darkMode');
    if (stored !== null) return stored === 'true';
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
};


const getInitialThemeId = () => {
  return resolveThemeIdForPath(window.location.pathname);
};

export default function App() {
  const { loading, error, uploadCV, resetCV, isCustomCV } = useConfig();
  const [currentThemeId, setCurrentThemeId] = useState(getInitialThemeId);
  const [showCatalog, setShowCatalog] = useState(false);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const hideInitials = hideInitialsSetting;
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const [hoveredThemeId, setHoveredThemeId] = useState(null);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });
  const previewTimeoutRef = useRef(null);
  const tableContainerRef = useRef(null);
  const rafRef = useRef(null);

  const updatePreviewPos = useCallback((clientX, clientY) => {
    const previewW = 480;
    const previewH = 324;
    const gap = 16;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = clientX + gap;
    if (left + previewW > viewportW - 12) {
      left = clientX - previewW - gap;
    }
    let top = clientY - 40;
    top = Math.max(8, Math.min(top, viewportH - previewH - 8));

    setPreviewPos({ top, left });
  }, []);

  const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches;

  const handleRowMouseEnter = useCallback((e, themeId) => {
    if (!canHover) return;
    clearTimeout(previewTimeoutRef.current);
    updatePreviewPos(e.clientX, e.clientY);
    setHoveredThemeId(themeId);
  }, [updatePreviewPos, canHover]);

  const handleRowMouseMove = useCallback((e) => {
    if (!canHover) return;
    if (rafRef.current) return;
    const { clientX, clientY } = e;
    rafRef.current = requestAnimationFrame(() => {
      updatePreviewPos(clientX, clientY);
      rafRef.current = null;
    });
  }, [updatePreviewPos, canHover]);

  const handleRowMouseLeave = useCallback(() => {
    previewTimeoutRef.current = setTimeout(() => setHoveredThemeId(null), 80);
  }, []);

  // Cleanup timeout and rAF on unmount
  useEffect(() => {
    return () => {
      clearTimeout(previewTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Keyboard navigation in catalog
  useEffect(() => {
    if (!showCatalog) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'Escape') {
        setShowCatalog(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCatalog]);

  useEffect(() => {
    try {
      localStorage.setItem('portfolioThemes-darkMode', darkMode);
    } catch {}
  }, [darkMode]);


  // Update URL when theme changes
  useEffect(() => {
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

  const processFile = (file) => {
    if (!file) return;

    // Check file extension
    const validExtensions = ['.yaml', '.yml'];
    const hasValidExtension = validExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      alert('Please upload a .yaml or .yml file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const result = uploadCV(content);
        if (!result.success) {
          alert(`Error parsing CV: ${result.error}`);
        }
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    processFile(file);
    // Reset input so same file can be uploaded again
    event.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return PORTFOLIO_THEMES;
    const q = searchQuery.toLowerCase();
    return PORTFOLIO_THEMES.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const currentTheme = useMemo(() => getPortfolioTheme(currentThemeId), [currentThemeId]);

  const currentThemeIndex = useMemo(() =>
    PORTFOLIO_THEMES.findIndex(t => t.id === currentThemeId),
    [currentThemeId]
  );

  const goToPrevTheme = () => {
    const prevIndex = currentThemeIndex <= 0 ? PORTFOLIO_THEMES.length - 1 : currentThemeIndex - 1;
    setCurrentThemeId(PORTFOLIO_THEMES[prevIndex].id);
  };

  const goToNextTheme = () => {
    const nextIndex = currentThemeIndex >= PORTFOLIO_THEMES.length - 1 ? 0 : currentThemeIndex + 1;
    setCurrentThemeId(PORTFOLIO_THEMES[nextIndex].id);
  };

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

  if (showThemeBar && showCatalog) {
    const HoveredComponent = hoveredThemeId ? getPortfolioTheme(hoveredThemeId)?.Component : null;

    return (
      <CatalogView $darkMode={darkMode}>
        <CatalogHeader>
          <CatalogTitleRow>
            <h1>Resume Themes</h1>
            <ThemeCount $darkMode={darkMode}>{filteredThemes.length} themes</ThemeCount>
          </CatalogTitleRow>
          <HeaderActions>
            <SearchBar $darkMode={darkMode}>
              <SearchIcon width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </SearchIcon>
              <SearchInput
                ref={searchInputRef}
                $darkMode={darkMode}
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <SearchClear $darkMode={darkMode} onClick={() => setSearchQuery('')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </SearchClear>
              )}
            </SearchBar>
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
            <CloseButton $darkMode={darkMode} onClick={() => { setHoveredThemeId(null); setShowCatalog(false); }}>Close</CloseButton>
          </HeaderActions>
        </CatalogHeader>
        <TableContainer ref={tableContainerRef} $darkMode={darkMode}>
          <ThemeTable $darkMode={darkMode}>
            <thead>
              <tr>
                <Th $darkMode={darkMode} $width="48px" $hideOnMobile>#</Th>
                <Th $darkMode={darkMode} $width="200px">Name</Th>
                <Th $darkMode={darkMode}>Description</Th>
                <Th $darkMode={darkMode} $width="160px" $hideOnMobile>Source</Th>
                <Th $darkMode={darkMode} $width="80px" $align="center" $hideOnMobile>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filteredThemes.map((theme) => {
                const globalIndex = PORTFOLIO_THEMES.indexOf(theme);
                return (
                  <TableRow
                    key={theme.id}
                    $active={theme.id === currentThemeId}
                    $darkMode={darkMode}
                    onClick={() => {
                      setCurrentThemeId(theme.id);
                      setHoveredThemeId(null);
                      setShowCatalog(false);
                    }}
                    onMouseEnter={(e) => handleRowMouseEnter(e, theme.id)}
                    onMouseMove={handleRowMouseMove}
                    onMouseLeave={handleRowMouseLeave}
                  >
                    <Td $darkMode={darkMode} $muted $hideOnMobile>{globalIndex + 1}</Td>
                    <Td $darkMode={darkMode} $bold>{theme.name}</Td>
                    <Td $darkMode={darkMode} $muted $truncate>{theme.description}</Td>
                    <Td $darkMode={darkMode} $hideOnMobile>
                      {theme.source ? (
                        <SourceLink
                          $darkMode={darkMode}
                          href={theme.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {new URL(theme.source).hostname.replace('www.', '')}
                        </SourceLink>
                      ) : (
                        <MutedText $darkMode={darkMode}>Original</MutedText>
                      )}
                    </Td>
                    <Td $darkMode={darkMode} $align="center" $hideOnMobile>
                      {theme.id === currentThemeId && (
                        <ActiveBadge $darkMode={darkMode}>Active</ActiveBadge>
                      )}
                    </Td>
                  </TableRow>
                );
              })}
            </tbody>
          </ThemeTable>
        </TableContainer>

        <MobileCardList $darkMode={darkMode}>
          {filteredThemes.map((theme, index) => {
            const globalIndex = PORTFOLIO_THEMES.indexOf(theme);
            return (
              <MobileCard
                key={theme.id}
                $active={theme.id === currentThemeId}
                $darkMode={darkMode}
                onClick={() => {
                  setCurrentThemeId(theme.id);
                  setHoveredThemeId(null);
                  setShowCatalog(false);
                }}
              >
                <CardInfo>
                  <CardHeader>
                    <CardNameRow>
                      <CardIndex $darkMode={darkMode}>{globalIndex + 1}</CardIndex>
                      <CardName $darkMode={darkMode}>{theme.name}</CardName>
                    </CardNameRow>
                    {theme.id === currentThemeId && (
                      <ActiveBadge $darkMode={darkMode}>Active</ActiveBadge>
                    )}
                  </CardHeader>
                  {theme.description && (
                    <CardDescription $darkMode={darkMode}>{theme.description}</CardDescription>
                  )}
                </CardInfo>
              </MobileCard>
            );
          })}
        </MobileCardList>

        {hoveredThemeId && HoveredComponent && (
          <PreviewFloater
            style={{ top: previewPos.top, left: previewPos.left }}
          >
            <PreviewLabel $darkMode={darkMode}>
              {getPortfolioTheme(hoveredThemeId)?.name}
            </PreviewLabel>
            <PreviewViewport>
              <IsolatedPreview width="1440px" height="900px">
                <PreviewErrorBoundary themeId={hoveredThemeId}>
                  <HoveredComponent darkMode={darkMode} />
                </PreviewErrorBoundary>
              </IsolatedPreview>
            </PreviewViewport>
          </PreviewFloater>
        )}
      </CatalogView>
    );
  }

  const ThemeComponent = currentTheme?.Component;

  return (
    <AppContainer
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {showThemeBar && (
        <TopBar $darkMode={darkMode}>
          <ThemeInfo>
            <ThemeLabel $darkMode={darkMode}>Theme:</ThemeLabel>
            <CurrentThemeName $darkMode={darkMode}>{currentTheme?.name}</CurrentThemeName>
          </ThemeInfo>
          <TopBarActions>
            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept=".yaml,.yml"
              onChange={handleFileUpload}
            />
            {isCustomCV ? (
              <ClearButton
                $darkMode={darkMode}
                onClick={resetCV}
                title="Clear uploaded CV"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <ClearText>Clear CV</ClearText>
              </ClearButton>
            ) : (
              <UploadButton
                $darkMode={darkMode}
                onClick={() => fileInputRef.current?.click()}
                title="Upload CV.yaml"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <UploadText>Upload CV</UploadText>
              </UploadButton>
            )}
            <Separator $darkMode={darkMode} />
            <ThemeNavGroup>
              <NavArrowButton $darkMode={darkMode} onClick={goToPrevTheme} title="Previous theme">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </NavArrowButton>
              <NavArrowButton $darkMode={darkMode} onClick={goToNextTheme} title="Next theme">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </NavArrowButton>
            </ThemeNavGroup>
            <Separator $darkMode={darkMode} />
            <SwitcherButton $darkMode={darkMode} onClick={() => { setSearchQuery(''); setShowCatalog(true); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <BrowseText>Browse Themes</BrowseText>
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
      )}
      <ThemeContainer $hasTopBar={showThemeBar} $hideInitials={hideInitials}>
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

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;
  }
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

const ThemeNavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NavArrowButton = styled.button`
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

const Separator = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  margin: 0 4px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 6px;
  }
`;

const SwitcherButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    padding: 0;
  }

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

const BrowseText = styled.span`
  @media (max-width: 640px) {
    display: none;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    padding: 0;
  }

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

const UploadText = styled.span`
  @media (max-width: 640px) {
    display: none;
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${({ $darkMode }) => ($darkMode ? '#7f1d1d' : '#fef2f2')};
  color: ${({ $darkMode }) => ($darkMode ? '#fca5a5' : '#dc2626')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#991b1b' : '#fecaca')};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    padding: 0;
  }

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#991b1b' : '#fee2e2')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#b91c1c' : '#fca5a5')};
  }
`;

const ClearText = styled.span`
  @media (max-width: 640px) {
    display: none;
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
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: auto;
  --app-top-offset: ${({ $hasTopBar }) => $hasTopBar ? '61px' : '0px'};
  --initial-display: ${({ $hideInitials }) => $hideInitials ? 'none' : 'flex'};
`;

const CatalogView = styled.div`
  height: 100%;
  background: ${({ $darkMode }) => ($darkMode ? '#0b0b0b' : '#f9fafb')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.2s, color 0.2s;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  *, *::before, *::after {
    font-family: inherit;
  }
`;

const CatalogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  flex-shrink: 0;

  h1 {
    font-size: 18px;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 14px;
  }
`;

const CatalogTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const ThemeCount = styled.span`
  font-size: 13px;
  color: ${({ $darkMode }) => ($darkMode ? '#6b7280' : '#9ca3af')};
  font-weight: 400;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModeToggle = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#a3a3a3' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#262626' : '#f3f4f6')};
  }
`;

const CloseButton = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#a3a3a3' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#262626' : '#f3f4f6')};
  }
`;

const SearchBar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 220px;

  @media (max-width: 640px) {
    width: 140px;
  }
`;

const SearchIcon = styled.svg`
  position: absolute;
  left: 10px;
  color: ${({ stroke }) => stroke};
  opacity: 0.4;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 30px 0 32px;
  border-radius: 6px;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
  background: ${({ $darkMode }) => ($darkMode ? '#141414' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;

  &::placeholder {
    color: ${({ $darkMode }) => ($darkMode ? '#525252' : '#9ca3af')};
  }

  &:focus {
    border-color: ${({ $darkMode }) => ($darkMode ? '#404040' : '#93c5fd')};
  }
`;

const SearchClear = styled.button`
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  color: ${({ $darkMode }) => ($darkMode ? '#525252' : '#9ca3af')};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? '#a3a3a3' : '#374151')};
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  margin: 0 20px 20px;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#e5e7eb')};
  border-radius: 8px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ThemeTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;

  @media (max-width: 640px) {
    table-layout: auto;
  }
`;

const Th = styled.th`
  text-align: ${({ $align }) => $align || 'left'};
  padding: 9px 14px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ $darkMode }) => ($darkMode ? '#525252' : '#6b7280')};
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#e5e7eb')};
  position: sticky;
  top: 0;
  background: ${({ $darkMode }) => ($darkMode ? '#111111' : '#f3f4f6')};
  z-index: 2;
  ${({ $width }) => $width && `width: ${$width};`}

  &:not(:last-child) {
    border-right: 1px solid ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#e5e7eb')};
  }

  @media (max-width: 640px) {
    ${({ $hideOnMobile }) => $hideOnMobile && 'display: none;'}
  }
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: background 0.1s;
  background: ${({ $active, $darkMode }) => {
    if ($active) return $darkMode ? '#162032' : '#eff6ff';
    return 'transparent';
  }};

  &:hover {
    background: ${({ $active, $darkMode }) => {
      if ($darkMode) return $active ? '#1a2840' : '#161616';
      return $active ? '#e8f1fd' : '#f8f9fa';
    }};
  }

  &:not(:last-child) td {
    border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#f0f0f0')};
  }
`;

const Td = styled.td`
  padding: 9px 14px;
  color: ${({ $darkMode, $muted }) => {
    if ($muted) return $darkMode ? '#737373' : '#9ca3af';
    return $darkMode ? '#e5e5e5' : '#111827';
  }};
  font-weight: ${({ $bold }) => ($bold ? '500' : '400')};
  text-align: ${({ $align }) => $align || 'left'};
  ${({ $truncate }) => $truncate && `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}

  &:not(:last-child) {
    border-right: 1px solid ${({ $darkMode }) => ($darkMode ? '#131313' : '#f5f5f5')};
  }

  @media (max-width: 640px) {
    ${({ $hideOnMobile }) => $hideOnMobile && 'display: none;'}
  }
`;

const SourceLink = styled.a`
  font-size: 12px;
  color: ${({ $darkMode }) => ($darkMode ? '#60a5fa' : '#3b82f6')};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const MutedText = styled.span`
  font-size: 12px;
  color: ${({ $darkMode }) => ($darkMode ? '#404040' : '#d1d5db')};
`;

const ActiveBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  background: ${({ $darkMode }) => ($darkMode ? '#1e3a5f' : '#dbeafe')};
  color: ${({ $darkMode }) => ($darkMode ? '#60a5fa' : '#2563eb')};
`;

const PreviewFloater = styled.div`
  position: fixed;
  z-index: 9999;
  width: 480px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
  pointer-events: none;
  animation: previewFadeIn 0.15s ease-out;
  will-change: top, left;

  @keyframes previewFadeIn {
    from { opacity: 0; transform: scale(0.96) translateY(4px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

const PreviewLabel = styled.div`
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#a3a3a3' : '#6b7280')};
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#262626' : '#e5e7eb')};
`;

const PreviewViewport = styled.div`
  width: 480px;
  height: 300px;
  overflow: hidden;
  position: relative;
  background: #0b0b0b;

  iframe {
    transform: scale(${480 / 1440});
    transform-origin: top left;
    pointer-events: none;
  }
`;

const MobileCardList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 12px 12px;
    overflow: auto;
    flex: 1;
  }
`;

const MobileCard = styled.div`
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#e5e7eb')};
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  background: ${({ $active, $darkMode }) => {
    if ($active) return $darkMode ? '#162032' : '#eff6ff';
    return $darkMode ? '#141414' : '#ffffff';
  }};
  transition: background 0.15s;

  &:active {
    background: ${({ $active, $darkMode }) => {
      if ($darkMode) return $active ? '#1a2840' : '#1a1a1a';
      return $active ? '#e8f1fd' : '#f3f4f6';
    }};
  }
`;

const CardInfo = styled.div`
  padding: 14px 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardIndex = styled.span`
  font-size: 12px;
  color: ${({ $darkMode }) => ($darkMode ? '#525252' : '#9ca3af')};
  min-width: 20px;
`;

const CardName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
`;

const CardDescription = styled.p`
  font-size: 13px;
  color: ${({ $darkMode }) => ($darkMode ? '#737373' : '#9ca3af')};
  margin: 0;
  line-height: 1.5;
`;
