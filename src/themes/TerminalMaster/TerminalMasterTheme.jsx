import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { generateBanner } from './banner';
import { buildCommands } from './commands';

const TerminalGlobalStyles = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/npm/jquery.terminal/css/jquery.terminal.min.css');

  :root {
    --size: 1;
    --color: #71ee79;
    --glow: 0.5;
    --background: rgb(0, 0, 0);
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    background: rgb(0, 0, 0);
  }
`;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
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

  const username = useMemo(() => {
    if (!cv?.name) return 'portfolio';
    return cv.name.toLowerCase().replace(/\s+/g, '');
  }, [cv?.name]);

  const bannerText = useMemo(() => {
    if (!cv) return '';
    return generateBanner(cv);
  }, [cv]);

  const commands = useMemo(() => {
    if (!cv) return {};
    return buildCommands(cv);
  }, [cv]);

  const initTerminal = useCallback(() => {
    if (!containerRef.current || !window.jQuery || !cv) return;

    // Clean up previous terminal
    if (terminalRef.current) {
      terminalRef.current.destroy();
      terminalRef.current = null;
    }

    const $ = window.jQuery;
    const $el = $(containerRef.current);
    $el.empty();

    const term = $el.terminal(
      commands,
      {
        prompt: `[[b;rgba(168, 218, 141, 1);;]guest]@[[b;rgba(250, 251, 180, 1);;]${username}]$ ~ `,
        greetings: bannerText,
      }
    );

    terminalRef.current = term;
  }, [commands, username, bannerText, cv]);

  useEffect(() => {
    loadCSS('https://cdn.jsdelivr.net/npm/jquery.terminal/css/jquery.terminal.min.css');

    loadScript('https://code.jquery.com/jquery-3.3.1.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/jquery.terminal/js/jquery.terminal.min.js'))
      .then(() => {
        initTerminal();
      })
      .catch((err) => {
        console.error('Failed to load terminal dependencies:', err);
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
      <TerminalGlobalStyles />
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
    </>
  );
}
