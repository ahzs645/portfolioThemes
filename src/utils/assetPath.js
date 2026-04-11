// Vite's BASE_URL should end with a trailing slash, but when the raw
// `base` config is passed without one (e.g. from GitHub's configure-pages
// output "/fletch"), the injected BASE_URL can leak through without it.
// Normalize defensively so every consumer gets a predictable value.
const RAW_BASE_URL = import.meta.env.BASE_URL || '/';
const BASE_URL = RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL : `${RAW_BASE_URL}/`;

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
