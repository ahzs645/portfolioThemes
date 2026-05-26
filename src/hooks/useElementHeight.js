import { useState, useLayoutEffect } from 'react';

// Tracks a referenced element's offsetHeight, staying current via ResizeObserver.
// Returns null until the element is mounted and first measured.
export function useElementHeight(ref) {
  const [height, setHeight] = useState(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}
