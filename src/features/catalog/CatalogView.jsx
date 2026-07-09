import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { PORTFOLIO_THEMES } from '../../themes';
import { useHoverPreview } from '../../hooks/useHoverPreview';
import { useCatalogKeyboard } from '../../hooks/useCatalogKeyboard';
import { DesktopThemeTable } from './DesktopThemeTable';
import { MobileCardList } from './MobileCardList';
import { MobileInspectModal } from './MobileInspectModal';
import { HoverPreview } from './HoverPreview';
import {
  CatalogView as CatalogViewRoot,
  CatalogHeader,
  CatalogTitleRow,
  ThemeCount,
  HeaderActions,
  ModeToggle,
  CloseButton,
  SearchBar,
  SearchIcon,
  SearchInput,
  SearchClear,
} from './styles';

// The full-screen theme browser. Self-contained: owns its search, focus, hover,
// and inspect state, and reports the chosen theme back via onSelectTheme.
export function CatalogView({ darkMode, setDarkMode, currentThemeId, onSelectTheme, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectThemeId, setInspectThemeId] = useState(null);
  const searchInputRef = useRef(null);
  const tableContainerRef = useRef(null);
  const pressTimerRef = useRef(null);
  const didLongPressRef = useRef(false);

  const hover = useHoverPreview(tableContainerRef);
  const toggleDarkMode = useCallback(() => setDarkMode((value) => !value), [setDarkMode]);
  const clearSearch = useCallback(() => setSearchQuery(''), []);
  const handleSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);
  const closeCatalog = useCallback(() => {
    hover.clearHover();
    onClose();
  }, [hover, onClose]);
  const closeInspect = useCallback(() => setInspectThemeId(null), []);

  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return PORTFOLIO_THEMES;
    const q = searchQuery.toLowerCase();
    return PORTFOLIO_THEMES.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      (t.source && t.source.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const { focusedThemeIndex, setFocusedThemeIndex, handleCatalogKeyDown } = useCatalogKeyboard({
    filteredThemes,
    searchQuery,
    currentThemeId,
    inspectThemeId,
    setInspectThemeId,
    tableContainerRef,
    onSelect: onSelectTheme,
    onClose,
    onClearHover: hover.clearHover,
  });

  // Focus the search box on desktop only. Mobile Safari zooms the viewport when
  // small text inputs receive focus, so opening the catalog should not jump in.
  useEffect(() => {
    if (window.matchMedia('(max-width: 768px), (pointer: coarse)').matches) {
      return;
    }

    searchInputRef.current?.focus();
  }, []);

  // Mobile cards: a quick tap selects the theme; a long press (~450ms) opens an
  // inspect popup with a live preview. didLongPressRef stops the trailing click
  // (fired on touch release) from also selecting the theme.
  const startCardPress = useCallback((themeId) => {
    didLongPressRef.current = false;
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      setInspectThemeId(themeId);
    }, 450);
  }, []);

  const cancelCardPress = useCallback(() => {
    clearTimeout(pressTimerRef.current);
  }, []);

  const handleCardClick = useCallback((themeId) => {
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    onSelectTheme(themeId);
  }, [onSelectTheme]);

  useEffect(() => () => clearTimeout(pressTimerRef.current), []);

  return (
    <CatalogViewRoot $darkMode={darkMode}>
      <CatalogHeader>
        <CatalogTitleRow>
          <h1>Resume Themes</h1>
          {searchQuery && <ThemeCount $darkMode={darkMode}>Filtered results</ThemeCount>}
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
              placeholder="Search name, slug, source..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleCatalogKeyDown}
            />
            {searchQuery && (
              <SearchClear $darkMode={darkMode} onClick={clearSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </SearchClear>
            )}
          </SearchBar>
          <ModeToggle
            $darkMode={darkMode}
            onClick={toggleDarkMode}
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
          <CloseButton $darkMode={darkMode} onClick={closeCatalog}>Close</CloseButton>
        </HeaderActions>
      </CatalogHeader>

      <DesktopThemeTable
        filteredThemes={filteredThemes}
        searchQuery={searchQuery}
        currentThemeId={currentThemeId}
        focusedThemeIndex={focusedThemeIndex}
        darkMode={darkMode}
        tableContainerRef={tableContainerRef}
        onSelect={onSelectTheme}
        onFocusIndex={setFocusedThemeIndex}
        hover={hover}
      />

      <MobileCardList
        filteredThemes={filteredThemes}
        searchQuery={searchQuery}
        currentThemeId={currentThemeId}
        darkMode={darkMode}
        onCardClick={handleCardClick}
        onPressStart={startCardPress}
        onPressEnd={cancelCardPress}
        onSelect={onSelectTheme}
      />

      {inspectThemeId && (
        <MobileInspectModal
          inspectThemeId={inspectThemeId}
          currentThemeId={currentThemeId}
          darkMode={darkMode}
          onClose={closeInspect}
          onSelect={onSelectTheme}
        />
      )}

      {hover.hoveredThemeId && (
        <HoverPreview
          themeId={hover.hoveredThemeId}
          position={hover.previewPos}
          darkMode={darkMode}
        />
      )}
    </CatalogViewRoot>
  );
}
