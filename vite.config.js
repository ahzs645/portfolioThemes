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

export default defineConfig({
  plugins: [react(), spa404Plugin()],
  assetsInclude: ['**/*.yaml', '**/*.yml'],
  base: '/',
});
