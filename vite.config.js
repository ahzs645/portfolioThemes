import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, readFileSync } from 'fs';

// Plugin to copy index.html to 404.html for GitHub Pages SPA routing
const spa404Plugin = () => ({
  name: 'spa-404',
  closeBundle() {
    const indexPath = 'dist/index.html';
    const notFoundPath = 'dist/404.html';
    const indexContent = readFileSync(indexPath, 'utf-8');
    writeFileSync(notFoundPath, indexContent);
    console.log('Created 404.html for SPA routing');
  }
});

// GitHub's configure-pages action emits base_path without a trailing
// slash (e.g. "/fletch"), but Vite's BASE_URL substitution uses the
// raw string. Normalize so it always ends with "/" — otherwise
// `${BASE_URL}CV.yaml` becomes "/fletchCV.yaml".
const rawBase = process.env.VITE_BASE_PATH || '/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default defineConfig({
  plugins: [react(), spa404Plugin()],
  assetsInclude: ['**/*.yaml', '**/*.yml'],
  base,
});
