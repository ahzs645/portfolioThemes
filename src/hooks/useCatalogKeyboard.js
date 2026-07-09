import { useState, useEffect, useCallback, useRef } from 'react';

// Keyboard navigation for the catalog: arrow keys move the focused row, Enter
// selects it, Escape closes the inspect popup (if open) or the catalog. Also
// keeps the focused row scrolled into view and resets focus when the query
// changes. Returns the focused index plus the keydown handler to bind to the
// search input (the window-level listener ignores typing in inputs).
export function useCatalogKeyboard({
  filteredThemes,
  searchQuery,
  currentThemeId,
  inspectThemeId,
  setInspectThemeId,
  tableContainerRef,
  onSelect,
  onClose,
  onClearHover,
}) {
  // Open focused on the active theme so the catalog reveals where you already
  // are in the (long) list instead of always starting at the top.
  const [focusedThemeIndex, setFocusedThemeIndex] = useState(() => {
    const activeIndex = filteredThemes.findIndex((t) => t.id === currentThemeId);
    return activeIndex >= 0 ? activeIndex : 0;
  });
  // Tracks the last query we reset focus for, so the reset effect can tell a real
  // search change from its initial run (where focus must stay on the active
  // theme). Comparing values — not a "mounted yet?" flag — keeps it correct under
  // StrictMode's double-invoked effects.
  const lastResetQueryRef = useRef(searchQuery);
  // Center (vs. nudge) only the first auto-scroll, so opening the catalog lands
  // the active theme in the middle of view.
  const didFirstScrollRef = useRef(false);

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

  // Reset to the top when the query changes — but not on the initial mount,
  // where focus should stay on the active theme resolved above.
  useEffect(() => {
    if (lastResetQueryRef.current === searchQuery) return;
    lastResetQueryRef.current = searchQuery;
    setFocusedThemeIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const row = tableContainerRef.current?.querySelector(`[data-theme-index="${focusedThemeIndex}"]`);
    row?.scrollIntoView({ block: didFirstScrollRef.current ? 'nearest' : 'center' });
    didFirstScrollRef.current = true;
  }, [focusedThemeIndex, tableContainerRef]);

  return { focusedThemeIndex, setFocusedThemeIndex, handleCatalogKeyDown };
}
