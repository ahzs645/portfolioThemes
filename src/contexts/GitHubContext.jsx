import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  extractUsername,
  fetchAllGitHubData,
  fetchContributions,
  aggregateLanguages,
  clearGitHubCache,
} from '../utils/githubHelpers';
import { useCV } from './ConfigContext';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const ENABLE_LIVE_GITHUB = import.meta.env.VITE_ENABLE_GITHUB_LIVE === 'true';
const ENABLE_GITHUB_CONTRIBUTIONS = import.meta.env.VITE_ENABLE_GITHUB_CONTRIBUTIONS !== 'false';

const GitHubContext = createContext(null);

export function GitHubProvider({ children }) {
  const cv = useCV();
  const enableContributions = cv?.features?.gitContributionGraph ?? ENABLE_GITHUB_CONTRIBUTIONS;
  const username = useMemo(
    () => extractUsername(cv?.socialLinks?.github),
    [cv?.socialLinks?.github]
  );

  const [data, setData] = useState(null);     // { profile, repos, events }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    if (!username) {
      setLoading(false);
      setError('No GitHub username found in CV');
      return;
    }

    try {
      setError(null);
      const result = ENABLE_LIVE_GITHUB
        ? await fetchAllGitHubData(username, { includeContributions: enableContributions })
        : {
          profile: null,
          repos: [],
          events: [],
          contributions: enableContributions ? await fetchContributions() : null,
        };
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username, enableContributions]);

  // Initial load + 30-minute refresh
  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    load();
    if (ENABLE_LIVE_GITHUB) {
      intervalRef.current = setInterval(() => {
        clearGitHubCache(username);
        load();
      }, REFRESH_INTERVAL);
    }

    return () => clearInterval(intervalRef.current);
  }, [username, load]);

  // Derived data — computed once when raw data changes
  const github = useMemo(() => {
    if (!data) return null;

    return {
      // Profile
      ...(data.profile || {}),

      // Repos
      repos: data.repos,
      repoCount: data.profile?.publicRepos ?? data.repos.length,

      // Non-fork, non-archived repos
      ownRepos: data.repos.filter((r) => !r.isFork && !r.isArchived),

      // Language breakdown
      languages: aggregateLanguages(data.repos),

      // Activity
      events: data.events,

      // Convenience: most recent push events
      recentPushes: data.events
        .filter((e) => e.type === 'PushEvent')
        .slice(0, 10),

      // Contribution calendar (from build-time fetch)
      contributions: data.contributions,

      // Username
      username,
    };
  }, [data, username]);

  const value = {
    github,
    loading,
    error,
    refresh: () => {
      if (username) {
        clearGitHubCache(username);
        setLoading(true);
        load();
      }
    },
  };

  return <GitHubContext.Provider value={value}>{children}</GitHubContext.Provider>;
}

/**
 * Full context hook — returns { github, loading, error, refresh }
 */
export function useGitHubContext() {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHubContext must be used within a GitHubProvider');
  }
  return context;
}

/**
 * Convenience hook — returns the normalized github data object (or null while loading)
 */
export function useGitHub() {
  const { github } = useGitHubContext();
  return github;
}
