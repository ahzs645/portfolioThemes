// Vite's BASE_URL always ends with a trailing slash (e.g. "/" or "/fletch/").
const BASE_URL = import.meta.env.BASE_URL || '/';

// Prepend the Vite base to a root-relative public asset path.
// Accepts "/foo" or "foo" and returns e.g. "/fletch/foo" when deployed at /fletch/.
export function withBase(path = '') {
  const trimmed = String(path).replace(/^\/+/, '');
  return `${BASE_URL}${trimmed}`;
}

// BASE_URL without the trailing slash — useful for building route paths
// (e.g. `${BASE_PREFIX}/modern-blue` → "/fletch/modern-blue").
export const BASE_PREFIX = BASE_URL.replace(/\/$/, '');

// Strip the base prefix from a pathname so route matching can compare
// against theme slugs. Returns a path that always starts with "/".
export function stripBase(pathname = '/') {
  if (!BASE_PREFIX) return pathname || '/';
  if (pathname === BASE_PREFIX) return '/';
  if (pathname.startsWith(`${BASE_PREFIX}/`)) {
    return pathname.slice(BASE_PREFIX.length) || '/';
  }
  return pathname || '/';
}
