import React, { useEffect, useMemo, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { filterActive, pickSocialUrl } from '../../utils/cvHelpers';
import { VibeCodedRuntime } from './VibeCodedRuntime';

function articleFor(text) {
  return /^[aeiou]/i.test(String(text || '').trim()) ? 'an' : 'a';
}

export function VibeCodedTheme() {
  const cv = useCV();
  const mountRef = useRef(null);
  const runtimeRef = useRef(null);

  const data = useMemo(() => {
    const safe = cv || {};
    const projects = filterActive(safe.projects || [])
      .map((p) => ({
        label: String(p.name || p.title || 'project').toUpperCase(),
        url: p.url || p.website || p.link || null,
      }))
      .filter((p) => p.label);
    const socials = (safe.socialRaw || []).filter((s) => s && s.url);
    const xUrl = pickSocialUrl(socials, ['x', 'twitter']);
    const xHandle = (() => {
      const social = socials.find((item) =>
        ['x', 'twitter'].includes(String(item.network || '').toLowerCase()),
      );
      const handle = social?.username || (xUrl ? xUrl.split('/').filter(Boolean).pop() : null);
      return handle ? `@${String(handle).replace(/^@/, '')}` : null;
    })();
    const fallbackHeadline =
      safe.currentJobTitle && safe.location
        ? `I'm ${articleFor(safe.currentJobTitle)} ${safe.currentJobTitle} based in ${safe.location}.`
        : safe.currentJobTitle
          ? `I'm ${articleFor(safe.currentJobTitle)} ${safe.currentJobTitle}.`
          : 'Portfolio and selected work.';

    return {
      name: safe.name || 'your name',
      headline: safe.headline || safe.tagline || safe.label || fallbackHeadline,
      email: safe.email || null,
      xHandle,
      xUrl,
      website: safe.website || null,
      projects,
      socials,
    };
  }, [cv]);

  useEffect(() => {
    if (!mountRef.current) return undefined;
    const runtime = new VibeCodedRuntime(mountRef.current, data);
    runtimeRef.current = runtime;
    runtime.init().catch((error) => {
      console.error(error);
      if (mountRef.current) {
        mountRef.current.innerHTML = '<div class="vibe-coded-fallback">Failed to initialize the Three ASCII renderer.</div>';
      }
    });
    return () => {
      runtime.dispose();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    runtimeRef.current?.updateData(data);
  }, [data]);

  return (
    <>
      <GlobalStyle />
      <Wrap ref={mountRef} />
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    background:
      radial-gradient(circle at top, rgba(22, 37, 72, 0.45), transparent 45%),
      #02050b;
  }
`;

const Wrap = styled.main`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #02050b;
  color: #d6ffdf;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  touch-action: none;
  overscroll-behavior: none;

  .vibe-coded-three {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  .vibe-coded-fallback {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 24px;
    color: #d6ffdf;
    text-align: center;
  }

`;

export default VibeCodedTheme;
