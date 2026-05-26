import { forwardRef } from 'react';
import { ScrollingThemeName } from './ScrollingThemeName';
import {
  TopBar as TopBarRoot,
  ThemeInfo,
  ThemeLabel,
  ThemeNavGroup,
  NavArrowButton,
  Separator,
  TopBarActions,
  UploadError,
  SwitcherButton,
  BrowseText,
  HiddenFileInput,
  UploadButton,
  UploadText,
  ClearButton,
  ClearText,
  ModeToggleSmall,
} from './styles';

// The persistent bar above the active theme: shows the current theme name, CV
// upload/clear, prev/next navigation, the "Browse Themes" catalog launcher, and
// the dark-mode toggle. Forwards its ref so the viewer can measure its height.
export const TopBar = forwardRef(function TopBar({
  darkMode,
  onToggleDarkMode,
  themeName,
  onPrev,
  onNext,
  onOpenCatalog,
  browseButtonRef,
  cv,
}, ref) {
  const { fileInputRef, uploadErrors, isCustomCV, resetCV, handleFileUpload } = cv;

  return (
    <TopBarRoot ref={ref} $darkMode={darkMode}>
      <ThemeInfo>
        <ThemeLabel $darkMode={darkMode}>Theme:</ThemeLabel>
        <ScrollingThemeName name={themeName || ''} darkMode={darkMode} />
      </ThemeInfo>
      <TopBarActions>
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          onChange={handleFileUpload}
        />
        {uploadErrors.length > 0 && (
          <UploadError $darkMode={darkMode} role="status">
            {uploadErrors.slice(0, 3).map((message) => (
              <div key={message}>{message}</div>
            ))}
            {uploadErrors.length > 3 && <div>{uploadErrors.length - 3} more issues.</div>}
          </UploadError>
        )}
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
          <NavArrowButton $darkMode={darkMode} onClick={onPrev} title="Previous theme">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </NavArrowButton>
          <NavArrowButton $darkMode={darkMode} onClick={onNext} title="Next theme">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </NavArrowButton>
        </ThemeNavGroup>
        <Separator $darkMode={darkMode} />
        <SwitcherButton
          ref={browseButtonRef}
          $darkMode={darkMode}
          onClick={onOpenCatalog}
        >
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
          onClick={onToggleDarkMode}
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
    </TopBarRoot>
  );
});
