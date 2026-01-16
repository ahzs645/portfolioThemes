/**
 * Environment Configuration
 *
 * Reads environment variables from .env file and provides
 * typed configuration values for the portfolio application.
 *
 * Environment variables must be prefixed with VITE_ to be exposed
 * to the client-side code in Vite.
 */

// Valid section names that can be excluded
export const VALID_SECTIONS = [
  'about',
  'experience',
  'projects',
  'education',
  'skills',
  'languages',
  'awards',
  'publications',
  'presentations',
  'volunteer',
  'certifications',
  'professionalDevelopment',
  'socialLinks',
];

// Valid display modes
export const DISPLAY_MODES = {
  GALLERY: 'gallery',
  THEME: 'theme',
};

/**
 * Parse comma-separated string into array of trimmed values
 */
function parseCommaSeparated(value) {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parse boolean-like string value
 * Returns true for 'true', '1', 'yes'
 * Returns false for 'false', '0', 'no'
 * Returns defaultValue for undefined/empty or 'system'
 */
function parseBoolean(value, defaultValue = null) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const normalized = value.toLowerCase().trim();
  if (normalized === 'system') return defaultValue;
  if (['true', '1', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;
  return defaultValue;
}

/**
 * Get environment configuration
 * All values are read from import.meta.env (Vite's way of exposing env vars)
 */
export function getEnvConfig() {
  const env = import.meta.env || {};

  // Display mode: 'gallery' or 'theme'
  const displayMode = (env.VITE_DISPLAY_MODE || DISPLAY_MODES.GALLERY).toLowerCase();
  const isGalleryMode = displayMode !== DISPLAY_MODES.THEME;

  // Theme ID (only used when displayMode is 'theme')
  const themeId = env.VITE_THEME_ID || 'ansub-minimal';

  // Excluded sections
  const excludedSectionsRaw = parseCommaSeparated(env.VITE_EXCLUDED_SECTIONS);
  const excludedSections = excludedSectionsRaw.filter((section) =>
    VALID_SECTIONS.includes(section)
  );

  // Warn about invalid section names in development
  if (import.meta.env.DEV) {
    const invalidSections = excludedSectionsRaw.filter(
      (section) => !VALID_SECTIONS.includes(section)
    );
    if (invalidSections.length > 0) {
      console.warn(
        `[envConfig] Invalid section names in VITE_EXCLUDED_SECTIONS: ${invalidSections.join(', ')}. Valid sections: ${VALID_SECTIONS.join(', ')}`
      );
    }
  }

  // UI options
  const showTopBar = parseBoolean(env.VITE_SHOW_TOP_BAR, true);
  const defaultDarkMode = parseBoolean(env.VITE_DEFAULT_DARK_MODE, null); // null = system preference

  return {
    // Display mode
    displayMode: isGalleryMode ? DISPLAY_MODES.GALLERY : DISPLAY_MODES.THEME,
    isGalleryMode,
    isThemeMode: !isGalleryMode,

    // Theme
    themeId,

    // Section exclusions
    excludedSections,
    hasExcludedSections: excludedSections.length > 0,

    // UI options
    showTopBar,
    defaultDarkMode,

    // Helper to check if a section should be shown
    isSectionVisible: (sectionName) => !excludedSections.includes(sectionName),
  };
}

// Export singleton instance for convenience
export const envConfig = getEnvConfig();

export default envConfig;
