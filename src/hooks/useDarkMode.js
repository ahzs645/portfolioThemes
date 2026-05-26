import { useState, useEffect } from 'react';

const STORAGE_KEY = 'portfolioThemes-darkMode';

const getInitialDarkMode = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
};

// Dark-mode flag persisted to localStorage, defaulting to the OS preference.
export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, darkMode);
    } catch {}
  }, [darkMode]);

  return [darkMode, setDarkMode];
}
