import { Suspense } from 'react';
import { getPortfolioTheme } from '../../themes';
import { sourceDomain } from '../../utils/sourceDomain';
import { IsolatedPreview } from '../preview/IsolatedPreview';
import { PreviewErrorBoundary } from '../preview/PreviewErrorBoundary';
import { ThemeLoading } from '../preview/ThemeLoading';
import {
  MobileInspectOverlay,
  MobileInspectCard,
  InspectHeader,
  InspectName,
  ActiveBadge,
  InspectCloseButton,
  InspectPreview,
  InspectTapHint,
  InspectBody,
  InspectDescription,
  InspectSourceLink,
} from './styles';

// Long-press preview popup on mobile: shows a live, isolated theme render with a
// tap-to-use affordance, description, and source link.
export function MobileInspectModal({ inspectThemeId, currentThemeId, darkMode, onClose, onSelect }) {
  const inspectTheme = getPortfolioTheme(inspectThemeId);
  const InspectComponent = inspectTheme?.Component;
  const domain = sourceDomain(inspectTheme?.source);
  const isActive = inspectThemeId === currentThemeId;

  return (
    <MobileInspectOverlay
      $darkMode={darkMode}
      role="dialog"
      aria-modal="true"
      aria-label={`${inspectTheme?.name} preview`}
      onClick={onClose}
    >
      <MobileInspectCard $darkMode={darkMode} onClick={(e) => e.stopPropagation()}>
        <InspectHeader $darkMode={darkMode}>
          <InspectName $darkMode={darkMode}>{inspectTheme?.name}</InspectName>
          {isActive && <ActiveBadge $darkMode={darkMode}>Active</ActiveBadge>}
          <InspectCloseButton
            $darkMode={darkMode}
            onClick={onClose}
            aria-label="Close preview"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </InspectCloseButton>
        </InspectHeader>
        <InspectPreview
          $darkMode={darkMode}
          role="button"
          aria-label={`Use ${inspectTheme?.name} theme`}
          onClick={() => onSelect(inspectThemeId)}
        >
          <IsolatedPreview width="100%" height="100%">
            <PreviewErrorBoundary themeId={inspectThemeId}>
              <Suspense fallback={<ThemeLoading label="Loading preview..." />}>
                {InspectComponent && <InspectComponent darkMode={darkMode} />}
              </Suspense>
            </PreviewErrorBoundary>
          </IsolatedPreview>
          <InspectTapHint $darkMode={darkMode}>
            {isActive ? 'Current theme — tap to keep' : 'Tap preview to use this theme'}
          </InspectTapHint>
        </InspectPreview>
        <InspectBody>
          {inspectTheme?.description && (
            <InspectDescription $darkMode={darkMode}>{inspectTheme.description}</InspectDescription>
          )}
          {domain && (
            <InspectSourceLink
              $darkMode={darkMode}
              href={inspectTheme.source}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {domain}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </InspectSourceLink>
          )}
        </InspectBody>
      </MobileInspectCard>
    </MobileInspectOverlay>
  );
}
