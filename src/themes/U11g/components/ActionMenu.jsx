import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { THEME_NAMES } from '../themes';

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
};

function LinkedInIcon() {
  return (
    <svg {...iconProps}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle fill="currentColor" stroke="none" cx="4" cy="4" r="2" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg {...iconProps}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2.67-5-2.67" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function ThemeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function ActionMenu({
  socials,
  email,
  resumeUrl,
  onCommandPalette,
  theme,
  onCycleTheme,
}) {
  const [view, setView] = useState('main');
  const [themeFeedback, setThemeFeedback] = useState(false);

  const { github, linkedin, twitter } = socials || {};

  useEffect(() => {
    if (!themeFeedback) return;
    const t = setTimeout(() => setThemeFeedback(false), 1200);
    return () => clearTimeout(t);
  }, [themeFeedback, theme]);

  const handleThemeClick = () => {
    onCycleTheme?.();
    setThemeFeedback(true);
  };

  return (
    <Root>
      {view === 'main' ? (
        <MainGrid>
          {linkedin && (
            <IconCell href={linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" style={{ gridArea: '1 / 1' }}>
              <LinkedInIcon />
            </IconCell>
          )}
          {twitter && (
            <IconCell href={twitter} target="_blank" rel="noopener" aria-label="X" style={{ gridArea: '1 / 2' }}>
              <XIcon />
            </IconCell>
          )}
          {github && (
            <IconCell href={github} target="_blank" rel="noopener" aria-label="GitHub" style={{ gridArea: '2 / 1' }}>
              <GithubIcon />
            </IconCell>
          )}
          <CmdCell
            as="button"
            onClick={onCommandPalette}
            aria-label="Search"
            style={{ gridArea: '2 / 2' }}
          >
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </CmdCell>
          <MoreCell as="button" onClick={() => setView('overlay')} style={{ gridArea: '3 / 1 / span 1 / span 2' }}>
            MORE
          </MoreCell>
        </MainGrid>
      ) : (
        <OverlayGrid>
          {email && (
            <OverlayCell href={`mailto:${email}`}>
              <MailIcon />
              <span>Email</span>
            </OverlayCell>
          )}
          {github && (
            <OverlayCell href={github} target="_blank" rel="noopener">
              <GithubIcon />
              <span>GitHub</span>
            </OverlayCell>
          )}
          {linkedin && (
            <OverlayCell href={linkedin} target="_blank" rel="noopener">
              <LinkedInIcon />
              <span>LinkedIn</span>
            </OverlayCell>
          )}
          {twitter && (
            <OverlayCell href={twitter} target="_blank" rel="noopener">
              <XIcon />
              <span>X</span>
            </OverlayCell>
          )}
          {resumeUrl && (
            <OverlayCell href={resumeUrl} target="_blank" rel="noopener">
              <FileIcon />
              <span>Resume</span>
            </OverlayCell>
          )}
          <OverlayCell as="button" onClick={onCommandPalette}>
            <SearchIcon />
            <span>Search</span>
          </OverlayCell>
          <OverlayCell as="button" onClick={handleThemeClick}>
            {themeFeedback ? (
              <ThemeFeedback>
                <ThemeName>{theme?.toUpperCase()}</ThemeName>
                <ThemeDots>
                  {THEME_NAMES.map((name) => (
                    <ThemeDot key={name} $active={name === theme} />
                  ))}
                </ThemeDots>
              </ThemeFeedback>
            ) : (
              <>
                <ThemeIcon />
                <span>Theme</span>
              </>
            )}
          </OverlayCell>
          <BackCell as="button" onClick={() => setView('main')}>
            BACK
          </BackCell>
        </OverlayGrid>
      )}
    </Root>
  );
}

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--u11g-app-bg);
  overflow: hidden;
`;

const MainGrid = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 1px;
  background: var(--u11g-app-bg);
`;

const cellBase = `
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--u11g-surface);
  color: var(--u11g-secondary);
  border: none;
  text-decoration: none;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.2s;

  &:hover {
    background: var(--u11g-surface-hover);
    color: var(--u11g-primary);
  }
`;

const IconCell = styled.a`
  ${cellBase}
`;

const CmdCell = styled.a`
  ${cellBase}
  gap: 4px;

  kbd {
    font-family: inherit;
    font-size: 11px;
    padding: 2px 6px;
    background: var(--u11g-app-bg);
    border: 1px solid var(--u11g-passive);
    border-radius: 3px;
    color: inherit;
  }
`;

const MoreCell = styled.a`
  ${cellBase}
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const OverlayGrid = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(4, 1fr);
  gap: 1px;
  background: var(--u11g-app-bg);
`;

const OverlayCell = styled.a`
  ${cellBase}
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  text-align: center;
  position: relative;

  span {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1;
  }
`;

const BackCell = styled.a`
  ${cellBase}
  background: var(--u11g-surface-hover);
  color: var(--u11g-primary);
  font-size: 11px;
  grid-column: 1 / -1;

  &:hover {
    background: var(--u11g-app-bg);
  }
`;

const ThemeFeedback = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const ThemeName = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--u11g-primary);
`;

const ThemeDots = styled.div`
  display: flex;
  gap: 4px;
`;

const ThemeDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? 'var(--u11g-primary)' : 'var(--u11g-passive)')};
  transition: background 0.2s;
`;
