#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const ROOT = resolve(import.meta.dirname, '..');
const INDEX_FILE = resolve(ROOT, 'src/themes/index.js');
const DEFAULT_PORT = 4175;

function readThemes() {
  const source = readFileSync(INDEX_FILE, 'utf8');
  const blocks = source.match(/\{\n\s+id: '[^']+'[\s\S]*?\n\s+\},/g) || [];

  return blocks.map((block) => {
    const id = block.match(/id: '([^']+)'/)?.[1];
    const slug = block.match(/slug: '([^']+)'/)?.[1];
    const name = block.match(/name: '([^']+)'/)?.[1];
    return { id, slug, name };
  }).filter((theme) => theme.id && theme.slug);
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
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }
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

async function checkRoute(browser, baseUrl, theme, viewport) {
  const path = theme.slug === 'minimal' ? '/' : `/${theme.slug}`;
  const page = await browser.newPage({
    viewport,
    reducedMotion: 'reduce',
  });
  const issues = [];

  page.on('console', (message) => {
    if (message.type() === 'error') issues.push(`console error: ${message.text()}`);
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

  return { theme, viewport, issues };
}

async function main() {
  const args = parseArgs();
  const port = Number(args.get('port') || DEFAULT_PORT);
  const limit = Number(args.get('limit') || 0);
  const baseUrl = args.get('base-url') || `http://127.0.0.1:${port}`;
  const shouldStartServer = args.get('start-server') !== 'false' && !args.has('base-url');
  const themes = readThemes().slice(0, limit || undefined);
  const viewports = [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ];
  let server;

  if (shouldStartServer) {
    server = await startServer(port);
  }

  const browser = await chromium.launch();
  const results = [];
  try {
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
