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
    let observer = null;
    let cancelled = false;

    const stopWatching = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };

    const attemptScroll = () => {
      if (cancelled || !window.location.hash) {
        stopWatching();
        return;
      }

      const target = findHashTarget();
      if (!target) return;

      target.scrollIntoView({ block: 'start' });
      stopWatching();
    };

    const scrollWhenReady = () => {
      stopWatching();
      frameId = window.requestAnimationFrame(attemptScroll);

      if (!window.location.hash || !document.body) return;

      observer = new MutationObserver(attemptScroll);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id'],
      });

      window.setTimeout(() => {
        if (!cancelled) attemptScroll();
      }, 0);
    };

    scrollWhenReady();
    window.addEventListener('hashchange', scrollWhenReady);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      stopWatching();
      window.removeEventListener('hashchange', scrollWhenReady);
    };
  }, [dependency]);
}
