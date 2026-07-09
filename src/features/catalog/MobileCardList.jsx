import { useEffect, useRef } from 'react';
import { sourceDomain } from '../../utils/sourceDomain';
import {
  MobileCardList as MobileCardListRoot,
  MobileCard,
  EmptyMobileState,
  CardName,
  CardSource,
  CardActiveBadge,
} from './styles';

// Mobile catalog layout: a 2-column card grid. A tap selects; a long press opens
// the inspect modal (press handling lives in the parent). Shown under 768px.
export function MobileCardList({
  filteredThemes,
  searchQuery,
  currentThemeId,
  darkMode,
  onCardClick,
  onPressStart,
  onPressEnd,
  onSelect,
}) {
  const listRef = useRef(null);

  // On open, bring the active theme's card into view so the catalog reveals
  // where you already are in the list instead of starting at the top.
  useEffect(() => {
    const card = listRef.current?.querySelector(`[data-theme-id="${currentThemeId}"]`);
    card?.scrollIntoView({ block: 'center' });
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MobileCardListRoot ref={listRef} $darkMode={darkMode}>
      {filteredThemes.length === 0 ? (
        <EmptyMobileState $darkMode={darkMode}>
          No themes found for "{searchQuery}".
        </EmptyMobileState>
      ) : filteredThemes.map((theme) => (
        <MobileCard
          key={theme.id}
          data-theme-id={theme.id}
          $active={theme.id === currentThemeId}
          $darkMode={darkMode}
          role="button"
          tabIndex={0}
          aria-label={`Use ${theme.name} theme. Long-press to preview.`}
          aria-current={theme.id === currentThemeId ? 'true' : undefined}
          onClick={() => onCardClick(theme.id)}
          onTouchStart={() => onPressStart(theme.id)}
          onTouchEnd={onPressEnd}
          onTouchMove={onPressEnd}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(theme.id);
            }
          }}
        >
          <CardName $darkMode={darkMode}>{theme.name}</CardName>
          {sourceDomain(theme.source) && (
            <CardSource $darkMode={darkMode}>{sourceDomain(theme.source)}</CardSource>
          )}
          {theme.id === currentThemeId && (
            <CardActiveBadge $darkMode={darkMode}>Active</CardActiveBadge>
          )}
        </MobileCard>
      ))}
    </MobileCardListRoot>
  );
}
