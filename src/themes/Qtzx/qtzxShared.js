import { createContext, createElement, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Monochrome palettes faithful to qtzx.dev (no accent colour — pure dark/light).
export const PALETTES = {
  dark: {
    bg: '#1a1a1a',
    heading: '#f2f2f2',
    text: '#e5e5e5',
    muted: '#b3b3b3',
    subtle: '#a8a8a8',
    faint: 'rgba(255, 255, 255, 0.16)',
    hair: 'rgba(255, 255, 255, 0.18)',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    chipBg: 'rgba(255, 255, 255, 0.16)',
    iconBox: '#101010',
    shapeColor: [0.102, 0.102, 0.102],
  },
  light: {
    bg: '#ffffff',
    heading: '#000000',
    text: '#111111',
    muted: '#666666',
    subtle: '#888888',
    faint: 'rgba(0, 0, 0, 0.08)',
    hair: 'rgba(0, 0, 0, 0.18)',
    cardBg: 'rgba(0, 0, 0, 0.04)',
    chipBg: 'rgba(0, 0, 0, 0.04)',
    iconBox: '#f4f4f4',
    shapeColor: [1, 1, 1],
  },
};

const DarkModeContext = createContext(null);

export function DarkModeProvider({ initialDark = true, onDarkModeChange, children }) {
  const [isDarkMode, setIsDarkMode] = useState(initialDark);

  // Follow external dark-mode changes (e.g. the shell's top-bar toggle).
  useEffect(() => {
    setIsDarkMode(initialDark);
  }, [initialDark]);

  const toggleDarkMode = useCallback(() => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    // Keep the shell in sync with the in-theme toggle.
    onDarkModeChange?.(next);
  }, [isDarkMode, onDarkModeChange]);

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
      palette: isDarkMode ? PALETTES.dark : PALETTES.light,
    }),
    [isDarkMode, toggleDarkMode]
  );

  return createElement(DarkModeContext.Provider, { value }, children);
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used within a DarkModeProvider');
  return ctx;
}

// ---- CV-driven project helpers (mirror qtzx.dev project card shape) ----

export function getProjectUrl(project) {
  return (
    project?.url ||
    project?.github ||
    project?.githubLink ||
    project?.liveLink ||
    project?.link ||
    null
  );
}

export function getProjectLiveUrl(project) {
  return project?.liveLink || project?.live || project?.demo || project?.website || null;
}

export function getProjectMedia(project) {
  return (
    project?.video ||
    project?.image ||
    project?.media ||
    project?.thumbnail ||
    project?.screenshot ||
    null
  );
}

export function getProjectIcon(project) {
  return project?.icon || project?.logo || null;
}

export function getSummary(project) {
  const value = project?.summary || project?.subtitle || project?.description;
  if (Array.isArray(value)) return value.filter(Boolean).join(' ');
  if (typeof value === 'string') return value;
  return '';
}

// Tech chips: prefer explicit arrays, otherwise parse "Technologies - a, b, c" highlights.
export function getTech(project) {
  const fromArrays = [
    ...(Array.isArray(project?.keywords) ? project.keywords : []),
    ...(Array.isArray(project?.techStack) ? project.techStack : []),
    ...(Array.isArray(project?.technologies) ? project.technologies : []),
    ...(Array.isArray(project?.tools) ? project.tools : []),
  ];

  const fromHighlights = [];
  if (Array.isArray(project?.highlights)) {
    project.highlights.forEach((entry) => {
      const match = /^\s*(?:technolog(?:y|ies)|tech|stack|tools)\s*[-:–—]\s*(.+)$/i.exec(
        String(entry)
      );
      if (match) {
        match[1]
          .split(/[,/•|]/)
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => fromHighlights.push(item));
      }
    });
  }

  const seen = new Set();
  return [...fromArrays, ...fromHighlights]
    .filter(Boolean)
    .filter((item) => {
      const key = String(item).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

export function getInitials(name) {
  return (name || 'AJ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
