import { PORTFOLIO_THEMES } from '../../themes';
import {
  TableContainer,
  ThemeTable,
  Th,
  TableRow,
  Td,
  EmptyCell,
  SourceLink,
  MutedText,
  ActiveBadge,
} from './styles';

// Desktop catalog layout: a sortable-looking table of every theme. Hidden under
// 768px in favour of MobileCardList.
export function DesktopThemeTable({
  filteredThemes,
  searchQuery,
  currentThemeId,
  focusedThemeIndex,
  darkMode,
  tableContainerRef,
  onSelect,
  onFocusIndex,
  hover,
}) {
  return (
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
          {filteredThemes.length === 0 ? (
            <tr>
              <EmptyCell $darkMode={darkMode} colSpan={5}>
                No themes found for "{searchQuery}".
              </EmptyCell>
            </tr>
          ) : filteredThemes.map((theme, index) => {
            const globalIndex = PORTFOLIO_THEMES.indexOf(theme);
            return (
              <TableRow
                key={theme.id}
                data-theme-index={index}
                $active={theme.id === currentThemeId}
                $focused={index === focusedThemeIndex}
                $darkMode={darkMode}
                role="button"
                tabIndex={0}
                aria-current={theme.id === currentThemeId ? 'true' : undefined}
                onClick={() => onSelect(theme.id)}
                onFocus={() => onFocusIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(theme.id);
                  }
                }}
                onMouseEnter={(e) => hover.handleRowMouseEnter(e, theme.id)}
                onMouseMove={hover.handleRowMouseMove}
                onMouseLeave={hover.handleRowMouseLeave}
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
  );
}
