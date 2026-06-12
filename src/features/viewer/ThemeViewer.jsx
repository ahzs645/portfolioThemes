import { Suspense, useRef } from 'react';
import { showThemeBar, hideInitialsSetting } from '../../config/themeSelection';
import { useCvUpload } from '../../hooks/useCvUpload';
import { useElementHeight } from '../../hooks/useElementHeight';
import { useHashAnchorScroll } from '../../hooks/useHashAnchorScroll';
import { TopBar } from '../topbar/TopBar';
import { PreviewErrorBoundary } from '../preview/PreviewErrorBoundary';
import { ThemeLoading } from '../preview/ThemeLoading';
import { AppContainer, ThemeContainer } from './styles';

const enableReactGrab = import.meta.env.VITE_ENABLE_REACT_GRAB === 'true';

// The primary screen: renders the active theme below the TopBar and wires up
// CV drag-and-drop across the whole surface.
export function ThemeViewer({
  currentTheme,
  currentThemeId,
  darkMode,
  setDarkMode,
  onPrev,
  onNext,
  onOpenCatalog,
}) {
  const cv = useCvUpload();
  const topBarRef = useRef(null);
  const browseButtonRef = useRef(null);
  const topBarHeight = useElementHeight(topBarRef);
  useHashAnchorScroll(currentThemeId);

  const ThemeComponent = currentTheme?.Component;
  const hideInitials = hideInitialsSetting;
  const enableThemeReactGrab = enableReactGrab && currentTheme?.features?.reactGrab;

  return (
    <AppContainer
      onDragOver={cv.handleDragOver}
      onDrop={cv.handleDrop}
    >
      {showThemeBar && (
        <TopBar
          ref={topBarRef}
          browseButtonRef={browseButtonRef}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          themeName={currentTheme?.name}
          onPrev={onPrev}
          onNext={onNext}
          onOpenCatalog={onOpenCatalog}
          cv={cv}
        />
      )}
      <ThemeContainer
        $hasTopBar={showThemeBar}
        $hideInitials={hideInitials}
        style={showThemeBar && topBarHeight != null ? { '--app-top-offset': `${topBarHeight}px` } : undefined}
      >
        {ThemeComponent ? (
          <PreviewErrorBoundary themeId={currentThemeId} label="Theme unavailable">
            <Suspense fallback={<ThemeLoading />}>
              <ThemeComponent
                key={currentThemeId}
                darkMode={darkMode}
                onDarkModeChange={setDarkMode}
                enableReactGrab={enableThemeReactGrab}
              />
            </Suspense>
          </PreviewErrorBoundary>
        ) : (
          <div>No theme selected</div>
        )}
      </ThemeContainer>
    </AppContainer>
  );
}
