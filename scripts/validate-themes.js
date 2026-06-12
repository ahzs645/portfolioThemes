#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';
import { createServer } from 'vite';

const ROOT = resolve(import.meta.dirname, '..');
const THEMES_DIR = resolve(ROOT, 'src/themes');
const IGNORED_THEME_DIRS = new Set([]);

function duplicates(items, field) {
  const seen = new Map();
  const found = [];

  for (const item of items) {
    const value = item[field];
    if (!value) continue;

    if (seen.has(value)) {
      found.push(`${field} "${value}" used by ${seen.get(value)} and ${item.id}`);
    } else {
      seen.set(value, item.id);
    }
  }

  return found;
}

async function loadThemes() {
  const server = await createServer({
    configFile: false,
    root: ROOT,
    logLevel: 'silent',
    server: { middlewareMode: true },
  });

  try {
    const mod = await server.ssrLoadModule('/src/themes/index.js');
    return mod.PORTFOLIO_THEMES.map(({ Component: _Component, ...theme }) => theme);
  } finally {
    await server.close();
  }
}

function listThemeComponentDirs() {
  return readdirSync(THEMES_DIR)
    .filter((entry) => {
      const fullPath = join(THEMES_DIR, entry);
      if (!statSync(fullPath).isDirectory()) return false;
      if (IGNORED_THEME_DIRS.has(entry)) return false;
      return readdirSync(fullPath).some((file) => file.endsWith('Theme.jsx'));
    })
    .sort();
}

function normalizeDirName(value) {
  return String(value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

async function main() {
  const themes = await loadThemes();
  const errors = [
    ...duplicates(themes, 'id'),
    ...duplicates(themes, 'slug'),
  ];
  const registeredNames = new Set(
    themes.map((theme) => normalizeDirName(theme.id))
      .concat(themes.map((theme) => normalizeDirName(theme.slug)))
      .concat(themes.map((theme) => normalizeDirName(theme.name))),
  );
  const orphanDirs = listThemeComponentDirs()
    .filter((dir) => !registeredNames.has(normalizeDirName(dir)));

  if (orphanDirs.length) {
    errors.push(`unregistered theme directories: ${orphanDirs.map((dir) => relative(ROOT, join(THEMES_DIR, dir))).join(', ')}`);
  }

  if (errors.length) {
    console.error('Theme registry validation failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log(`Theme registry validation passed (${themes.length} themes).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
