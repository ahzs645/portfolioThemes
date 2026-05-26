import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { StyleSheetManager } from 'styled-components';

// Renders children inside a sandboxed <iframe> so a theme's global styles can't
// leak into (or be clobbered by) the surrounding catalog UI.
export function IsolatedPreview({ children, width, height }) {
  const iframeRef = useRef(null);
  const [iframeState, setIframeState] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.documentElement.style.height = '100%';
      doc.body.style.margin = '0';
      doc.body.style.height = '100%';
      doc.body.style.display = 'flex';
      doc.body.style.overflow = 'hidden';
      let mountEl = doc.getElementById('preview-root');
      if (!mountEl) {
        mountEl = doc.createElement('div');
        mountEl.id = 'preview-root';
        doc.body.appendChild(mountEl);
      }
      mountEl.style.width = '100%';
      mountEl.style.height = '100%';
      mountEl.style.display = 'flex';
      mountEl.style.flex = '1';
      mountEl.style.flexDirection = 'column';
      setIframeState({ mountEl, head: doc.head });
    };
    iframe.addEventListener('load', handleLoad);
    // Trigger for srcDoc
    if (iframe.contentDocument?.readyState === 'complete') handleLoad();
    return () => iframe.removeEventListener('load', handleLoad);
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        srcDoc="<!DOCTYPE html><html><head></head><body></body></html>"
        style={{ width, height, border: 'none', display: 'block' }}
        title="Theme preview"
      />
      {iframeState && createPortal(
        <StyleSheetManager target={iframeState.head}>
          {children}
        </StyleSheetManager>,
        iframeState.mountEl
      )}
    </>
  );
}
