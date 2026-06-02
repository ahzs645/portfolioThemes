#!/usr/bin/env node
/**
 * Fetches GitHub contribution data from the public profile page
 * and saves it as JSON for the portfolio Activity component.
 *
 * Usage: node scripts/fetch-contributions.js [username]
 * If no username is given, extracts it from public/CV.yaml
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }

  return null;
}

function getBuildMode() {
  const lifecycle = process.env.npm_lifecycle_event || '';
  if (lifecycle.includes('random-static')) return 'random-static';
  if (lifecycle.includes('random')) return 'random';
  if (lifecycle.includes('static')) return 'static';
  return process.env.MODE || process.env.NODE_ENV || 'production';
}

function loadViteEnv() {
  const env = {};
  const files = ['.env', `.env.${getBuildMode()}`];

  for (const file of files) {
    const path = resolve(ROOT, file);
    if (!existsSync(path)) continue;

    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      env[key] = rawValue.replace(/^['"]|['"]$/g, '');
    }
  }

  return { ...env, ...process.env };
}

function getCVConfig() {
  try {
    const text = readFileSync(resolve(ROOT, 'public/CV.yaml'), 'utf8');
    return yaml.load(text)?.cv || {};
  } catch {
    return {};
  }
}

function shouldFetchContributions(cv) {
  const env = loadViteEnv();
  const envFlag = parseBoolean(env.VITE_ENABLE_GITHUB_CONTRIBUTIONS);
  const features = cv.features || {};
  const cvFlag = parseBoolean(features.gitContributionGraph ?? features.git_contribution_graph);

  return cvFlag ?? envFlag ?? true;
}

// ── Extract username ───────────────────────────────────────

function getUsernameFromCV(cv) {
  const github = (cv.social || cv.social_networks || []).find((entry) => (
    String(entry?.network || '').toLowerCase() === 'github'
  ));
  if (github?.username) return github.username;
  if (github?.url) {
    const urlMatch = String(github.url).match(/github\.com\/([a-zA-Z0-9._-]+)/);
    if (urlMatch) return urlMatch[1];
  }

  try {
    const yaml = readFileSync(resolve(ROOT, 'public/CV.yaml'), 'utf8');

    // Match a GitHub URL like github.com/username
    const urlMatch = yaml.match(/github\.com\/([a-zA-Z0-9._-]+)/);
    if (urlMatch) return urlMatch[1];

    // Match a social entry with network: GitHub and username: <value>
    const socialMatch = yaml.match(/network:\s*GitHub\s*\n\s*username:\s*([a-zA-Z0-9._-]+)/i);
    if (socialMatch) return socialMatch[1];

    return null;
  } catch {
    return null;
  }
}

// ── Parse contributions HTML ───────────────────────────────

function parseContributions(html) {
  const days = [];

  // Extract all td elements with data-date and data-level
  const tdRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*data-level="(\d)"/g;
  const dateToId = {};
  let match;

  while ((match = tdRegex.exec(html)) !== null) {
    const [, date, id, level] = match;
    dateToId[id] = date;
    days.push({ date, level: parseInt(level), count: 0 });
  }

  // Extract counts from tool-tip elements
  const tipRegex = /for="(contribution-day-component-[^"]+)"[^>]*>(\d+)\s+contribution/g;
  const countMap = {};

  while ((match = tipRegex.exec(html)) !== null) {
    const [, id, count] = match;
    const date = dateToId[id];
    if (date) countMap[date] = parseInt(count);
  }

  // Merge counts into days
  for (const day of days) {
    if (countMap[day.date]) {
      day.count = countMap[day.date];
    }
  }

  // Extract total from heading
  let totalYear = 0;
  const totalMatch = html.match(/([\d,]+)\s*\n\s*contributions\s*\n\s*in the last year/);
  if (totalMatch) {
    totalYear = parseInt(totalMatch[1].replace(/,/g, ''));
  }

  return {
    days: days.sort((a, b) => a.date.localeCompare(b.date)),
    totalYear,
    fetchedAt: new Date().toISOString(),
  };
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  const cv = getCVConfig();

  if (!shouldFetchContributions(cv)) {
    console.log('GitHub contribution graph disabled; skipping contribution fetch.');
    process.exit(0);
  }

  const username = process.argv[2] || getUsernameFromCV(cv);

  if (!username) {
    console.log('Could not determine GitHub username. Pass it as an argument or add a GitHub URL to CV.yaml.');
    process.exit(0);
  }

  console.log(`Fetching contributions for ${username}...`);

  const res = await fetch(`https://github.com/users/${username}/contributions`);
  if (!res.ok) {
    console.error(`Failed to fetch contributions: ${res.status}`);
    process.exit(1);
  }

  const html = await res.text();
  const data = parseContributions(html);

  console.log(`  ${data.days.length} days, ${data.totalYear} contributions in the last year`);

  const outPath = resolve(ROOT, 'public/github-activity.json');
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`  Saved to public/github-activity.json`);
}

main().catch((err) => {
  console.error('Error fetching contributions:', err.message);
  // Don't fail the build — the Activity component handles missing data gracefully
  process.exit(0);
});
