import { useState, useEffect, useCallback } from 'react';

// Keyboard navigation for the catalog: arrow keys move the focused row, Enter
// selects it, Escape closes the inspect popup (if open) or the catalog. Also
// keeps the focused row scrolled into view and resets focus when the query
// changes. Returns the focused index plus the keydown handler to bind to the
// search input (the window-level listener ignores typing in inputs).
export function useCatalogKeyboard({
  filteredThemes,
  searchQuery,
  inspectThemeId,
  setInspectThemeId,
  tableContainerRef,
  onSelect,
  onClose,
  onClearHover,
}) {
  const [focusedThemeIndex, setFocusedThemeIndex] = useState(0);

  const focusThemeByDelta = useCallback((delta) => {
    setFocusedThemeIndex((index) => {
      if (filteredThemes.length === 0) return 0;
      return Math.max(0, Math.min(index + delta, filteredThemes.length - 1));
    });
  }, [filteredThemes.length]);

  const handleCatalogKeyDown = useCallback((e) => {
    if (inspectThemeId) {
      if (e.key === 'Escape') setInspectThemeId(null);
      return;
    }
    if (e.key === 'Escape') {
      onClearHover();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusThemeByDelta(1);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusThemeByDelta(-1);
    }
    if (e.key === 'Enter' && filteredThemes[focusedThemeIndex]) {
      e.preventDefault();
      onSelect(filteredThemes[focusedThemeIndex].id);
    }
  }, [filteredThemes, focusedThemeIndex, focusThemeByDelta, onSelect, onClose, onClearHover, inspectThemeId, setInspectThemeId]);

  // Window-level navigation, ignoring keystrokes aimed at the search input.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      handleCatalogKeyDown(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCatalogKeyDown]);

  useEffect(() => {
    setFocusedThemeIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const row = tableContainerRef.current?.querySelector(`[data-theme-index="${focusedThemeIndex}"]`);
    row?.scrollIntoView({ block: 'nearest' });
  }, [focusedThemeIndex, tableContainerRef]);

  return { focusedThemeIndex, setFocusedThemeIndex, handleCatalogKeyDown };
}
