import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function ShadowRoot({ children, styleText }) {
  const hostRef = useRef(null);
  const [shadowRoot, setShadowRoot] = useState(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const root = hostRef.current.shadowRoot || hostRef.current.attachShadow({ mode: 'open' });
    setShadowRoot(root);
  }, []);

  useEffect(() => {
    if (!shadowRoot) return;
    const styleEl = document.createElement('style');
    styleEl.textContent = styleText || '';
    shadowRoot.appendChild(styleEl);
    return () => {
      if (styleEl.parentNode === shadowRoot) {
        shadowRoot.removeChild(styleEl);
      }
    };
  }, [shadowRoot, styleText]);

  return <div ref={hostRef}>{shadowRoot ? createPortal(children, shadowRoot) : null}</div>;
}
