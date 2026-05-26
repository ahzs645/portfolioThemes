// Short, human-readable host for a theme's source URL (e.g. "ansub.com").
export function sourceDomain(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
