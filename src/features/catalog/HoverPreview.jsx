import { Suspense } from 'react';
import { getPortfolioTheme } from '../../themes';
import { IsolatedPreview } from '../preview/IsolatedPreview';
import { PreviewErrorBoundary } from '../preview/PreviewErrorBoundary';
import { ThemeLoading } from '../preview/ThemeLoading';
import { PreviewFloater, PreviewLabel, PreviewViewport } from './styles';

// Desktop hover floater: a scaled-down live render of the hovered row's theme,
// positioned near the cursor by useHoverPreview.
export function HoverPreview({ themeId, position, darkMode }) {
  const theme = getPortfolioTheme(themeId);
  const Component = theme?.Component;
  if (!Component) return null;

  return (
    <PreviewFloater style={{ top: position.top, left: position.left }}>
      <PreviewLabel $darkMode={darkMode}>{theme?.name}</PreviewLabel>
      <PreviewViewport>
        <IsolatedPreview width="1440px" height="900px">
          <PreviewErrorBoundary themeId={themeId}>
            <Suspense fallback={<ThemeLoading label="Loading preview..." />}>
              <Component darkMode={darkMode} />
            </Suspense>
          </PreviewErrorBoundary>
        </IsolatedPreview>
      </PreviewViewport>
    </PreviewFloater>
  );
}
