#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULT_PORT = 4175;

async function readThemes() {
  const server = await createServer({
    configFile: false,
    root: ROOT,
    logLevel: 'silent',
    server: { middlewareMode: true },
  });

  try {
    const mod = await server.ssrLoadModule('/src/themes/index.js');
    return mod.PORTFOLIO_THEMES
      .map(({ Component: _Component, ...theme }) => theme)
      .filter((theme) => theme.id && theme.slug);
  } finally {
    await server.close();
  }
}

function parseArgs() {
  const args = new Map();
  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    if (!arg.startsWith('--')) continue;
    const [key, inlineValue] = arg.slice(2).split('=');
    const value = inlineValue ?? process.argv[i + 1];
    args.set(key, value);
    if (inlineValue === undefined) i += 1;
  }
  return args;
}

function startServer(port) {
  return new Promise((resolveServer, reject) => {
    const child = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['vite', '--host', '127.0.0.1', '--port', String(port)],
      {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          VITE_ENABLE_REACT_GRAB: 'false',
        },
      }
    );
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        child.kill();
        reject(new Error('Timed out waiting for Vite dev server.'));
      }
    }, 20000);

    const onData = (buffer) => {
      const output = buffer.toString();
      if (!settled && /Local:\s+http:\/\/127\.0\.0\.1:/.test(output)) {
        settled = true;
        clearTimeout(timeout);
        resolveServer(child);
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code) => {
      if (!settled) {
        clearTimeout(timeout);
        reject(new Error(`Vite exited before startup with code ${code}.`));
      }
    });
  });
}

// Sandboxed/CI environments often route outbound HTTPS through a local
// proxy with its own CA, or block external hosts entirely. Without these
// escape hatches every route fails on external font/CDN requests and
// drowns out real regressions:
// - QA_PROXY / HTTPS_PROXY: route browser traffic through the proxy.
// - QA_CHROMIUM: path to a pre-installed Chromium executable.
// - QA_IGNORE_EXTERNAL=1: report only failures for same-origin resources.
const PROXY_SERVER = process.env.QA_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || null;
const IGNORE_EXTERNAL = process.env.QA_IGNORE_EXTERNAL === '1';
const launchOptions = {
  ...(PROXY_SERVER ? { proxy: { server: PROXY_SERVER, bypass: 'localhost,127.0.0.1' } } : {}),
  ...(process.env.QA_CHROMIUM ? { executablePath: process.env.QA_CHROMIUM } : {}),
};
const pageOptions = PROXY_SERVER ? { ignoreHTTPSErrors: true } : {};

function isExternalIssue(issue) {
  const match = issue.match(/https?:\/\/[^\s"')]+/);
  return Boolean(match && !match[0].includes('127.0.0.1') && !match[0].includes('localhost'));
}

function filterIssues(issues) {
  return IGNORE_EXTERNAL ? issues.filter((issue) => !isExternalIssue(issue)) : issues;
}

async function checkRoute(browser, baseUrl, theme, viewport) {
  // Every theme resolves at its explicit slug route (the root "/" belongs to
  // whichever theme is configured as default; the app-shell check covers it).
  const path = `/${theme.slug}`;
  const page = await browser.newPage({
    ...pageOptions,
    viewport,
    reducedMotion: 'reduce',
  });
  const issues = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      const url = message.location()?.url || '';
      issues.push(`console error: ${message.text()}${url ? ` (${url})` : ''}`);
    }
  });
  page.on('pageerror', (error) => {
    issues.push(`page error: ${error.message}`);
  });
  page.on('requestfailed', (request) => {
    issues.push(`request failed: ${request.url()} ${request.failure()?.errorText || ''}`.trim());
  });

  try {
    await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(400);

    const metrics = await page.evaluate(() => {
      const body = document.body;
      const doc = document.documentElement;
      const text = body.innerText.replace(/\s+/g, ' ').trim();
      const canvases = [...document.querySelectorAll('canvas')].map((canvas) => ({
        width: canvas.width,
        height: canvas.height,
        rect: canvas.getBoundingClientRect().toJSON(),
      }));
      return {
        textLength: text.length,
        hasVisibleContent: Boolean(text.length || document.querySelector('canvas, img, svg')),
        horizontalOverflow: Math.ceil(Math.max(body.scrollWidth, doc.scrollWidth) - window.innerWidth),
        canvases,
      };
    });

    if (!metrics.hasVisibleContent || metrics.textLength < 12) {
      issues.push('first viewport appears blank or nearly empty');
    }
    if (metrics.horizontalOverflow > 8) {
      issues.push(`horizontal overflow: ${metrics.horizontalOverflow}px`);
    }
    for (const canvas of metrics.canvases) {
      if (canvas.rect.width > 20 && canvas.rect.height > 20 && (canvas.width === 0 || canvas.height === 0)) {
        issues.push('visible canvas has zero backing-store size');
      }
    }
  } catch (error) {
    issues.push(`navigation failed: ${error.message}`);
  } finally {
    await page.close();
  }

  return { theme, viewport, issues: filterIssues(issues) };
}

async function checkAppShell(browser, baseUrl) {
  const page = await browser.newPage({
    ...pageOptions,
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  });
  const issues = [];
  const tmp = mkdtempSync(resolve(tmpdir(), 'portfolio-themes-'));
  const invalidPath = resolve(tmp, 'invalid.yaml');
  const validPath = resolve(tmp, 'valid.yaml');

  page.on('console', (message) => {
    if (message.type() === 'error') {
      const url = message.location()?.url || '';
      issues.push(`console error: ${message.text()}${url ? ` (${url})` : ''}`);
    }
  });
  page.on('pageerror', (error) => {
    issues.push(`page error: ${error.message}`);
  });

  try {
    writeFileSync(invalidPath, 'cv:\n  sections: []\n', 'utf8');
    writeFileSync(validPath, [
      'cv:',
      '  name: QA Upload',
      '  email: qa@example.com',
      '  sections:',
      '    about: Uploaded CV smoke test.',
      '    projects: []',
      '    experience: []',
      '',
    ].join('\n'), 'utf8');

    await page.goto(new URL('/brutalist', baseUrl).href, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => localStorage.removeItem('portfolioThemes-customCV'));
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });

    await page.getByRole('button', { name: /Browse Themes/i }).click();
    const search = page.getByPlaceholder('Search name, slug, source...');
    await search.waitFor({ state: 'visible', timeout: 5000 });
    await search.fill('__definitely_missing_theme__');
    await page.getByRole('cell', { name: /No themes found/ }).waitFor({ state: 'visible', timeout: 5000 });
    await search.fill('terminal');
    await search.press('ArrowDown');
    await search.press('Enter');
    await page.waitForURL(/terminal-master/, { timeout: 5000 });

    await page.getByRole('button', { name: /Previous theme/i }).click();
    await page.waitForURL(/terminal$/, { timeout: 5000 });
    await page.goBack({ waitUntil: 'networkidle', timeout: 10000 });
    if (!page.url().includes('/terminal-master')) {
      issues.push('browser back did not restore previous theme route');
    }

    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('input[type="file"]').setInputFiles(invalidPath);
    await page.getByText(/cv\.name: is required/).waitFor({ state: 'visible', timeout: 5000 });
    await page.goto(new URL('/brutalist', baseUrl).href, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('input[type="file"]').setInputFiles(validPath);
    await page.waitForFunction(() => document.body.innerText.includes('QA Upload'), null, { timeout: 10000 });
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForFunction(() => document.body.innerText.includes('QA Upload'), null, { timeout: 10000 });
    await page.getByRole('button', { name: /Clear CV/i }).click();
  } catch (error) {
    issues.push(`app shell check failed: ${error.message}`);
  } finally {
    await page.evaluate(() => localStorage.removeItem('portfolioThemes-customCV')).catch(() => {});
    await page.close();
    rmSync(tmp, { recursive: true, force: true });
  }

  return { issues: filterIssues(issues) };
}

async function main() {
  const args = parseArgs();
  const port = Number(args.get('port') || DEFAULT_PORT);
  const limit = Number(args.get('limit') || 0);
  const baseUrl = args.get('base-url') || `http://127.0.0.1:${port}`;
  const shouldStartServer = args.get('start-server') !== 'false' && !args.has('base-url');
  const themes = (await readThemes()).slice(0, limit || undefined);
  const viewports = [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ];
  let server;

  if (shouldStartServer) {
    server = await startServer(port);
  }

  const browser = await chromium.launch(launchOptions);
  const results = [];
  try {
    // Warm up Vite's dep optimizer so the first measured route doesn't race
    // its re-bundling ("504 Outdated Optimize Dep" flakes).
    const warmup = await browser.newPage(pageOptions);
    await warmup.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await warmup.close();
    for (const theme of themes) {
      for (const viewport of viewports) {
        const result = await checkRoute(browser, baseUrl, theme, viewport);
        results.push(result);
        const label = `${theme.slug} ${viewport.width}x${viewport.height}`;
        if (result.issues.length) {
          console.log(`FAIL ${label}`);
          result.issues.forEach((issue) => console.log(`  - ${issue}`));
        } else {
          console.log(`PASS ${label}`);
        }
      }
    }
    const appShell = await checkAppShell(browser, baseUrl);
    if (appShell.issues.length) {
      console.log('FAIL app-shell');
      appShell.issues.forEach((issue) => console.log(`  - ${issue}`));
      results.push({ theme: { slug: 'app-shell' }, viewport: { width: 1280, height: 900 }, issues: appShell.issues });
    } else {
      console.log('PASS app-shell');
    }
  } finally {
    await browser.close();
    server?.kill();
  }

  const failures = results.filter((result) => result.issues.length > 0);
  if (failures.length) {
    console.error(`\nTheme smoke test failed: ${failures.length} route/viewport checks reported issues.`);
    process.exit(1);
  }
  console.log('\nTheme smoke test passed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
