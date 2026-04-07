import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { useTerminal } from './useTerminal';
import createScene from './createScene';
import ContentSection from './ContentSection';

const C = { beige: '#f6d4b1', dark: '#525252', orange: '#f99021' };

/* ─── styled components ─── */

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${C.beige};
  font-family: 'chill', 'Segoe UI', sans-serif;
  font-size: 18px;
  color: ${C.dark};
  overflow-x: hidden;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  background-color: ${C.dark};
  color: ${C.beige};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 10vw;
  transition: opacity 0.4s;
  opacity: ${(p) => (p.$done ? 0 : 1)};
  pointer-events: ${(p) => (p.$done ? 'none' : 'auto')};

  h2 {
    font-family: 'public-pixel', monospace;
    font-size: clamp(14px, 3vw, 24px);
    margin: 0;
    text-align: left;
  }
`;

const LoadingBar = styled.div`
  position: relative;
  width: 100%;
  height: 64px;
  border: dashed 2px ${C.beige};
  box-shadow: 2px 2px 0px ${C.dark}, 6px 6px 0px rgba(246, 212, 177, 0.7);
`;

const LoadingProgress = styled.div`
  position: absolute;
  top: 2px; bottom: 2px; left: 2px; right: 2px;
  background-color: ${C.beige};
  transform-origin: left;
  transform: scaleX(${(p) => p.$progress});
  transition: transform 0.2s ease-out;
`;

const LoadingText = styled.div`
  height: 32px;
  overflow: hidden;
  font-family: 'chill', sans-serif;
  font-size: 14px;
`;

const CanvasWrap = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 1;
`;

const WebGLCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  outline: none;
  &:active { cursor: grabbing; }
`;

const HeroSpacer = styled.div`
  height: 100vh;
  pointer-events: none;
`;

const ScrollHint = styled.div`
  position: sticky;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'chill', sans-serif;
  font-size: 14px;
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.75);
  background-color: ${C.dark};
  color: ${C.beige};
  padding: 4px 24px;
  border: ${C.beige} solid 1px;
  pointer-events: none;
  z-index: 5;
  transition: opacity 0.3s;
  opacity: ${(p) => (p.$visible ? 1 : 0)};

  @media (orientation: landscape) {
    display: none;
  }
`;

const NavBar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  padding: 16px 20px;
  justify-content: space-between;
  align-items: center;
  background: ${C.beige};
  gap: 8px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const NavBtn = styled.button`
  font-family: 'chill', sans-serif;
  font-size: 14px;
  box-shadow: 4px 4px 0px rgba(82, 82, 82, 0.25);
  background-color: ${C.dark};
  color: ${C.beige};
  fill: ${C.beige};
  cursor: pointer;
  transition: all 0.3s;
  padding: 6px 16px;
  border: ${C.beige} solid 1px;
  &:hover { transform: scale(1.05); box-shadow: 6px 6px 4px rgba(82, 82, 82, 0.25); }
  &:active { transform: scale(0.95); }
`;

const SocialNav = styled.div`
  display: flex;
  gap: 4px;
`;

const HiddenInput = styled.input`
  position: fixed;
  top: 0; right: 0;
  opacity: 0;
  z-index: -1;
  pointer-events: none;
`;

/* ─── main component ─── */

export function RetroComputerTheme({ darkMode }) {
  const cv = useCV();
  const { lines, cwd, execute, getPrompt, booted } = useTerminal(cv);

  const [input, setInput] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [terminalScrollOffset, setTerminalScrollOffset] = useState(0);
  const [selectionPos, setSelectionPos] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading assets...');

  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const sceneRef = useRef(null);

  // Inject fonts
  useEffect(() => {
    const id = 'retro-computer-fonts';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @font-face {
          font-family: 'public-pixel';
          src: url('/retro-computer/fonts/public-pixel.woff') format('woff');
          font-display: swap;
        }

        @font-face {
          font-family: 'chill';
          src: url('/retro-computer/fonts/chill.woff') format('woff');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Create Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    // Find the scroll container (App's ThemeContainer with overflow:auto)
    const scrollContainer = wrapperRef.current.parentElement || window;

    sceneRef.current = createScene(canvasRef.current, {
      onLoaded: () => {
        setLoadProgress(1);
        setLoaded(true);
      },
      onProgress: ({ url, itemsLoaded, itemsTotal }) => {
        setLoadProgress(itemsTotal > 0 ? itemsLoaded / itemsTotal : 0);
        setLoadingText(`${itemsLoaded} of ${itemsTotal} files loaded: ${url}`);
      },
      scrollContainer,
    });

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
    };
  }, []);

  // Update terminal data in the Three.js scene
  const promptText = booted ? getPrompt(cwd) : '';
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateTerminal(lines, promptText, input, terminalScrollOffset, selectionPos);
    }
  }, [lines, promptText, input, terminalScrollOffset, selectionPos]);

  // Focus hidden input on click when in hero area
  useEffect(() => {
    const onClick = () => {
      const s = wrapperRef.current?.parentElement;
      if (!s) return;
      if (s.scrollTop / s.clientHeight < 1) inputRef.current?.focus();
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  // Terminal keyboard input
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        execute(input);
        setInput('');
        setTerminalScrollOffset(0);
        setSelectionPos(0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setTerminalScrollOffset((prev) => prev + 3);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setTerminalScrollOffset((prev) => Math.max(0, prev - 3));
      }
    },
    [execute, input],
  );

  if (!cv) return null;

  const sl = cv.socialLinks || {};

  return (
    <Wrapper ref={wrapperRef}>
      {/* Loading screen — from original */}
      {!loaded && (
        <LoadingOverlay $done={false}>
          <h2>Booting...</h2>
          <LoadingBar>
            <LoadingProgress $progress={loadProgress} />
          </LoadingBar>
          <LoadingText>{loadingText}</LoadingText>
        </LoadingOverlay>
      )}

      {/* Hidden input for terminal */}
      <HiddenInput
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setSelectionPos(e.target.selectionStart ?? e.target.value.length);
        }}
        onSelect={(e) => setSelectionPos(e.target.selectionStart ?? e.target.value.length)}
        onKeyUp={(e) => setSelectionPos(e.currentTarget.selectionStart ?? e.currentTarget.value.length)}
        onClick={(e) => setSelectionPos(e.currentTarget.selectionStart ?? e.currentTarget.value.length)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Three.js canvas in a sticky container so scroll works inside ThemeContainer */}
      <CanvasWrap>
        <WebGLCanvas ref={canvasRef} />
      </CanvasWrap>

      {/* Spacer: canvas is 100vh sticky + 100vh spacer = 200vh before content */}
      <HeroSpacer />

      {/* Nav */}
      <NavBar>
        <NavLinks>
          <NavBtn onClick={() => { const s = wrapperRef.current?.parentElement; if (s) s.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</NavBtn>
          <NavBtn onClick={() => document.getElementById('retro-about')?.scrollIntoView({ behavior: 'smooth' })}>About</NavBtn>
          <NavBtn onClick={() => document.getElementById('retro-projects')?.scrollIntoView({ behavior: 'smooth' })}>Projects</NavBtn>
          <NavBtn onClick={() => document.getElementById('retro-contact')?.scrollIntoView({ behavior: 'smooth' })}>Contact</NavBtn>
        </NavLinks>
        <SocialNav>
          {sl.github && (
            <NavBtn as="a" href={sl.github} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.6,12.9c0-1-0.3-1.6-0.7-2c2.4-0.3,4.9-1.1,4.9-5.2c0-1.1-0.4-2.1-1.1-2.9c0.1-0.3,0.5-1.3-0.1-2.8c0,0-0.9-0.3-3,1.1c-1.7-0.5-3.6-0.5-5.4,0c-2-1.4-3-1.1-3-1.1C1.6,1.4,2,2.5,2.1,2.8C1.4,3.5,1,4.6,1,5.6c0,4.1,2.5,5,4.9,5.3c-0.4,0.4-0.6,0.9-0.7,1.4c-0.6,0.3-2.2,0.7-3.1-0.9c0,0-0.6-1-1.6-1.1c0,0-1.1,0-0.1,0.7c0,0,0.7,0.3,1.1,1.6c0,0,0.6,2.1,3.6,1.5c0,0.9,0,1.8,0,1.8h5.3C10.6,15.9,10.6,14.4,10.6,12.9z" />
              </svg>
            </NavBtn>
          )}
          {sl.linkedin && (
            <NavBtn as="a" href={sl.linkedin} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0.1,2c0-1,0.8-1.8,1.9-1.8c1,0,1.8,0.9,1.8,1.8c0,1-0.8,1.9-1.8,1.9C0.9,3.9,0.1,3.1,0.1,2z M0.1,5h3.7v9.8H0.1V5z" />
                <path d="M15.9,8.5v6.2h-3.5V9.4c0-0.9-0.6-1.6-1.5-1.6c-0.8,0-1.4,0.6-1.4,1.5v5.5H5.8V5h3.7v1c0.6-0.7,1.6-1.2,2.8-1.2C14.4,4.7,15.9,6.3,15.9,8.5z" />
              </svg>
            </NavBtn>
          )}
        </SocialNav>
      </NavBar>

      {/* Portfolio content */}
      <ContentSection cv={cv} />
    </Wrapper>
  );
}
