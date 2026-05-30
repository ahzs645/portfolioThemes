import { useState, useRef, useCallback, useEffect } from 'react';

// Drives the desktop hover-to-preview floater: tracks which row is hovered and
// keeps the floater positioned near the cursor (rAF-throttled), clamped to the
// viewport. No-ops on touch/coarse-pointer devices.
export function useHoverPreview(containerRef) {
  const [hoveredThemeId, setHoveredThemeId] = useState(null);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });
  const previewTimeoutRef = useRef(null);
  const rafRef = useRef(null);
  const lastPointerRef = useRef(null);

  const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches;

  const updatePreviewPos = useCallback((clientX, clientY) => {
    const previewW = 480;
    const previewH = 324;
    const gap = 16;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = clientX + gap;
    if (left + previewW > viewportW - 12) {
      left = clientX - previewW - gap;
    }
    let top = clientY - 40;
    top = Math.max(8, Math.min(top, viewportH - previewH - 8));

    setPreviewPos({ top, left });
  }, []);

  const handleRowMouseEnter = useCallback((e, themeId) => {
    if (!canHover) return;
    clearTimeout(previewTimeoutRef.current);
    lastPointerRef.current = { clientX: e.clientX, clientY: e.clientY };
    updatePreviewPos(e.clientX, e.clientY);
    setHoveredThemeId(themeId);
  }, [updatePreviewPos, canHover]);

  const handleRowMouseMove = useCallback((e) => {
    if (!canHover) return;
    if (rafRef.current) return;
    const { clientX, clientY } = e;
    lastPointerRef.current = { clientX, clientY };
    rafRef.current = requestAnimationFrame(() => {
      updatePreviewPos(clientX, clientY);
      rafRef.current = null;
    });
  }, [updatePreviewPos, canHover]);

  const handleRowMouseLeave = useCallback(() => {
    previewTimeoutRef.current = setTimeout(() => setHoveredThemeId(null), 80);
  }, []);

  const clearHover = useCallback(() => {
    lastPointerRef.current = null;
    setHoveredThemeId(null);
  }, []);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container || !canHover) return undefined;

    const syncHoverFromPointer = () => {
      if (rafRef.current || !lastPointerRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const { clientX, clientY } = lastPointerRef.current || {};
        if (clientX == null || clientY == null) {
          rafRef.current = null;
          return;
        }

        updatePreviewPos(clientX, clientY);

        const row = document
          .elementFromPoint(clientX, clientY)
          ?.closest?.('[data-theme-id]');

        if (row && container.contains(row)) {
          clearTimeout(previewTimeoutRef.current);
          setHoveredThemeId(row.dataset.themeId);
        } else {
          setHoveredThemeId(null);
        }

        rafRef.current = null;
      });
    };

    container.addEventListener('scroll', syncHoverFromPointer, { passive: true });
    return () => container.removeEventListener('scroll', syncHoverFromPointer);
  }, [containerRef, updatePreviewPos, canHover]);

  // Cleanup timeout and rAF on unmount
  useEffect(() => {
    return () => {
      clearTimeout(previewTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    hoveredThemeId,
    previewPos,
    handleRowMouseEnter,
    handleRowMouseMove,
    handleRowMouseLeave,
    clearHover,
  };
}
