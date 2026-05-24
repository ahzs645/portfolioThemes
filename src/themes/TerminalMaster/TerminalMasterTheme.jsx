import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { generateBanner } from './banner';
import { buildCommands } from './commands';

const MOBILE_QUERY = '(max-width: 640px)';
const scriptPromises = new Map();

const TerminalGlobalStyles = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/npm/jquery.terminal/css/jquery.terminal.min.css');

  :root {
    --size: 1;
    --color: ${(p) => (p.$light ? '#1f6f2a' : '#71ee79')};
    --glow: ${(p) => (p.$light ? '0' : '0.5')};
    --background: ${(p) => (p.$light ? 'rgb(244, 243, 238)' : 'rgb(0, 0, 0)')};
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    background: ${(p) => (p.$light ? 'rgb(244, 243, 238)' : 'rgb(0, 0, 0)')};
  }

  @media ${MOBILE_QUERY.replace('(', 'screen and (')} {
    .terminal, .cmd {
      padding: 8px !important;
    }
  }
`;

const toggleButtonStyle = (light) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  zIndex: 10,
  background: 'transparent',
  border: `1px solid ${light ? '#1f6f2a' : '#71ee79'}`,
  color: light ? '#1f6f2a' : '#71ee79',
  fontFamily: 'monospace',
  fontSize: '12px',
  padding: '4px 8px',
  cursor: 'pointer',
  borderRadius: '2px',
});

function loadScript(src) {
  if (scriptPromises.has(src)) return scriptPromises.get(src);

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing?.dataset.loaded === 'true') {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  scriptPromises.set(src, promise);
  return promise;
}

function waitForTerminalPlugin() {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const tick = () => {
      if (window.jQuery?.fn?.terminal) {
        resolve();
        return;
      }
      if (Date.now() - startedAt > 5000) {
        reject(new Error('Terminal plugin did not initialize.'));
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

function loadCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export function TerminalMasterTheme() {
  const cv = useCV();
  const containerRef = useRef(null);
  const terminalRef = useRef(null);
  const [dependencyError, setDependencyError] = useState('');
  const [light, setLight] = useState(false);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(MOBILE_QUERY).matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const username = useMemo(() => {
    if (!cv?.name) return 'portfolio';
    return cv.name.toLowerCase().replace(/\s+/g, '');
  }, [cv?.name]);

  const bannerText = useMemo(() => {
    if (!cv) return '';
    return generateBanner(cv, { compact: isMobile });
  }, [cv, isMobile]);

  const commands = useMemo(() => {
    if (!cv) return {};
    return buildCommands(cv, { compact: isMobile });
  }, [cv, isMobile]);

  const initTerminal = useCallback(() => {
    if (!containerRef.current || !window.jQuery?.fn?.terminal || !cv) return;

    // Clean up previous terminal
    if (terminalRef.current) {
      terminalRef.current.destroy();
      terminalRef.current = null;
    }

    const $ = window.jQuery;
    const $el = $(containerRef.current);
    $el.empty();

    const guestColor = light ? 'rgba(31, 111, 42, 1)' : 'rgba(168, 218, 141, 1)';
    const userColor = light ? 'rgba(150, 110, 20, 1)' : 'rgba(250, 251, 180, 1)';

    const term = $el.terminal(
      commands,
      {
        prompt: `[[b;${guestColor};;]guest]@[[b;${userColor};;]${username}]$ ~ `,
        greetings: bannerText,
      }
    );

    terminalRef.current = term;
  }, [commands, username, bannerText, cv, light]);

  useEffect(() => {
    loadCSS('https://cdn.jsdelivr.net/npm/jquery.terminal/css/jquery.terminal.min.css');

    loadScript('https://code.jquery.com/jquery-3.3.1.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/jquery.terminal/js/jquery.terminal.min.js'))
      .then(() => waitForTerminalPlugin())
      .then(() => {
        setDependencyError('');
        initTerminal();
      })
      .catch((err) => {
        setDependencyError(err.message || 'Failed to load terminal dependencies.');
      });

    return () => {
      if (terminalRef.current) {
        terminalRef.current.destroy();
        terminalRef.current = null;
      }
    };
  }, [initTerminal]);

  if (!cv) return null;

  return (
    <>
      <TerminalGlobalStyles $light={light} />
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <button
          type="button"
          onClick={() => setLight((v) => !v)}
          style={toggleButtonStyle(light)}
          aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {light ? '[DARK]' : '[LIGHT]'}
        </button>
        {dependencyError ? (
          <div style={{ padding: 24, color: light ? '#1f6f2a' : '#71ee79', background: light ? 'rgb(244, 243, 238)' : '#000', minHeight: '100%' }}>
            Terminal unavailable. {dependencyError}
          </div>
        ) : (
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        )}
      </div>
    </>
  );
}
