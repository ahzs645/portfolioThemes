import { useEffect } from 'react';

function readHashId() {
  if (typeof window === 'undefined') return '';
  const rawHash = window.location.hash.slice(1);
  if (!rawHash) return '';

  try {
    return decodeURIComponent(rawHash);
  } catch {
    return rawHash;
  }
}

function findHashTarget() {
  const id = readHashId();
  if (!id) return null;
  return document.getElementById(id);
}

// React themes often mount lazily or reveal sections after local state changes.
// Retry briefly so bookmarked hash URLs still land after the target exists.
export function useHashAnchorScroll(dependency) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frameId = 0;
    let timeoutId = 0;
    let cancelled = false;

    const scrollWhenReady = () => {
      const startedAt = Date.now();

      const attempt = () => {
        if (cancelled || !window.location.hash) return;

        const target = findHashTarget();
        if (target) {
          target.scrollIntoView({ block: 'start' });
          return;
        }

        if (Date.now() - startedAt < 1800) {
          timeoutId = window.setTimeout(attempt, 60);
        }
      };

      frameId = window.requestAnimationFrame(attempt);
    };

    scrollWhenReady();
    window.addEventListener('hashchange', scrollWhenReady);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      window.removeEventListener('hashchange', scrollWhenReady);
    };
  }, [dependency]);
}
