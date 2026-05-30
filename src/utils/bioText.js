const DEFAULT_BIO_TEXT = {
  // intro: concise hero introduction fallback.
  // profile: general about/profile fallback.
  // creative: looser fallback for expressive layouts.
  intro: 'Here is my portfolio.',
  profile: 'Here is my portfolio.',
  creative: 'Here is my portfolio.',
};

function readEnvString(key) {
  const value = import.meta.env?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export function getDefaultBioText(type = 'profile') {
  const normalizedType = String(type || 'profile').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  const typeOverride = normalizedType ? readEnvString(`VITE_PORTFOLIO_DEFAULT_BIO_${normalizedType}`) : '';
  const globalOverride = readEnvString('VITE_PORTFOLIO_DEFAULT_BIO');

  return typeOverride || globalOverride || DEFAULT_BIO_TEXT[type] || DEFAULT_BIO_TEXT.profile;
}

export function getBioText(cv, { type = 'profile' } = {}) {
  const about = typeof cv?.about === 'string' ? cv.about.trim() : '';
  return about || getDefaultBioText(type);
}
