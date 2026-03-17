/**
 * GitHub API helpers with localStorage caching
 * Unauthenticated API — 60 req/hour per IP
 */

const GITHUB_API = 'https://api.github.com';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ── Cache helpers ──────────────────────────────────────────────

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function cacheSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Storage full or unavailable — silently continue
  }
}

// ── Username extraction ────────────────────────────────────────

/**
 * Extract GitHub username from a profile URL or raw username string
 */
export function extractUsername(githubUrl) {
  if (!githubUrl) return null;
  try {
    const url = new URL(githubUrl);
    return url.pathname.split('/').filter(Boolean)[0] || null;
  } catch {
    // Not a URL — treat as raw username
    return githubUrl;
  }
}

// ── API fetchers ───────────────────────────────────────────────

async function apiFetch(path) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) {
    const msg = res.status === 403
      ? 'GitHub API rate limit reached'
      : `GitHub API error: ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Fetch user profile
 */
export async function fetchProfile(username) {
  const key = `gh_profile_${username}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const raw = await apiFetch(`/users/${username}`);
  const profile = {
    login: raw.login,
    name: raw.name,
    avatarUrl: raw.avatar_url,
    bio: raw.bio,
    company: raw.company,
    location: raw.location,
    blog: raw.blog,
    publicRepos: raw.public_repos,
    publicGists: raw.public_gists,
    followers: raw.followers,
    following: raw.following,
    createdAt: raw.created_at,
  };

  cacheSet(key, profile);
  return profile;
}

/**
 * Fetch public repos (sorted by most recently updated)
 */
export async function fetchRepos(username, perPage = 30) {
  const key = `gh_repos_${username}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const raw = await apiFetch(
    `/users/${username}/repos?sort=updated&per_page=${perPage}&type=owner`
  );

  const repos = raw.map((r) => ({
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    url: r.html_url,
    homepage: r.homepage,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.watchers_count,
    openIssues: r.open_issues_count,
    isFork: r.fork,
    isArchived: r.archived,
    topics: r.topics || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at,
  }));

  cacheSet(key, repos);
  return repos;
}

/**
 * Fetch recent public events (pushes, PRs, issues, etc.)
 * Paginates up to 3 pages of 100 events each (max ~300, GitHub's hard limit)
 */
export async function fetchEvents(username, maxPages = 3) {
  const key = `gh_events_${username}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const allRaw = [];
  for (let page = 1; page <= maxPages; page++) {
    const raw = await apiFetch(
      `/users/${username}/events/public?per_page=100&page=${page}`
    );
    allRaw.push(...raw);
    // Stop if we got fewer than a full page (no more data)
    if (raw.length < 100) break;
  }

  const events = allRaw.map((e) => ({
    id: e.id,
    type: e.type,
    repo: e.repo?.name,
    repoUrl: e.repo?.url
      ? `https://github.com/${e.repo.name}`
      : null,
    createdAt: e.created_at,
    // Pull key details per event type
    ...normalizeEventPayload(e),
  }));

  cacheSet(key, events);
  return events;
}

/**
 * Pull the most useful details out of each event type
 */
function normalizeEventPayload(event) {
  const p = event.payload || {};

  switch (event.type) {
    case 'PushEvent':
      return {
        action: 'pushed',
        commits: (p.commits || []).map((c) => ({
          sha: c.sha?.slice(0, 7),
          message: c.message?.split('\n')[0],
        })),
        branch: p.ref?.replace('refs/heads/', ''),
      };

    case 'PullRequestEvent':
      return {
        action: p.action,
        prTitle: p.pull_request?.title,
        prNumber: p.pull_request?.number,
        prUrl: p.pull_request?.html_url,
      };

    case 'IssuesEvent':
      return {
        action: p.action,
        issueTitle: p.issue?.title,
        issueNumber: p.issue?.number,
        issueUrl: p.issue?.html_url,
      };

    case 'CreateEvent':
      return {
        action: 'created',
        refType: p.ref_type,
        ref: p.ref,
      };

    case 'DeleteEvent':
      return {
        action: 'deleted',
        refType: p.ref_type,
        ref: p.ref,
      };

    case 'WatchEvent':
      return { action: 'starred' };

    case 'ForkEvent':
      return {
        action: 'forked',
        forkName: p.forkee?.full_name,
        forkUrl: p.forkee?.html_url,
      };

    case 'ReleaseEvent':
      return {
        action: p.action,
        releaseName: p.release?.name || p.release?.tag_name,
        releaseUrl: p.release?.html_url,
      };

    case 'IssueCommentEvent':
      return {
        action: 'commented',
        issueTitle: p.issue?.title,
        issueNumber: p.issue?.number,
        commentUrl: p.comment?.html_url,
      };

    default:
      return { action: event.type?.replace('Event', '').toLowerCase() };
  }
}

/**
 * Fetch all GitHub data for a username in parallel
 */
export async function fetchAllGitHubData(username) {
  const [profile, repos, events] = await Promise.all([
    fetchProfile(username),
    fetchRepos(username),
    fetchEvents(username),
  ]);

  return { profile, repos, events };
}

/**
 * Aggregate language stats across repos
 */
export function aggregateLanguages(repos = []) {
  const counts = {};
  for (const repo of repos) {
    if (repo.language && !repo.isFork) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([language, count]) => ({ language, count }));
}

/**
 * Clear all GitHub cache entries
 */
export function clearGitHubCache(username) {
  const keys = [`gh_profile_${username}`, `gh_repos_${username}`, `gh_events_${username}`];
  keys.forEach((k) => localStorage.removeItem(k));
}
