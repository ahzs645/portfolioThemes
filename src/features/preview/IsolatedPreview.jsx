import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { StyleSheetManager } from 'styled-components';
import { GOOGLE_FONTS_URL } from '../../config/fonts';

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
      // The iframe doesn't inherit index.html's stylesheets, so load the
      // shared font bundle here — themes no longer @import fonts themselves.
      if (!doc.getElementById('preview-fonts')) {
        const fonts = doc.createElement('link');
        fonts.id = 'preview-fonts';
        fonts.rel = 'stylesheet';
        fonts.href = GOOGLE_FONTS_URL;
        doc.head.appendChild(fonts);
      }
      doc.documentElement.style.height = '100%';
      doc.body.style.margin = '0';
      doc.body.style.height = '100%';
      doc.body.style.display = 'flex';
      doc.body.style.overflow = 'hidden';
      doc.documentElement.style.userSelect = 'none';
      doc.documentElement.style.webkitUserSelect = 'none';
      doc.body.style.userSelect = 'none';
      doc.body.style.webkitUserSelect = 'none';
      doc.body.style.webkitTouchCallout = 'none';
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
      mountEl.style.userSelect = 'none';
      mountEl.style.webkitUserSelect = 'none';
      mountEl.style.webkitTouchCallout = 'none';
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
