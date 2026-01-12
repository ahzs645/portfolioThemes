import React, { useMemo, useEffect } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { ShadowRoot } from '../../ui/ShadowRoot';

import rawStyles from './ansubMinimal.css?raw';
import departureMonoWoffUrl from './assets/departure-mono.woff?url';
import fragmentGlareTtfUrl from './assets/fragment-glare.ttf?url';

const THEME_STYLE_TEXT = rawStyles
  .replaceAll('__DEPARTURE_MONO_WOFF__', departureMonoWoffUrl)
  .replaceAll('__FRAGMENT_GLARE_TTF__', fragmentGlareTtfUrl);

// Extract @font-face declarations to inject into document head
// (Shadow DOM doesn't support @font-face in most browsers)
const FONT_FACE_CSS = `
@font-face {
  font-family: __departureMono_0a61d1;
  src: url(${departureMonoWoffUrl}) format("woff");
  font-display: swap;
}
@font-face {
  font-family: __fragmentGlare_606a66;
  src: url(${fragmentGlareTtfUrl}) format("truetype");
  font-display: swap;
}
`;

function isPresent(value) {
  return String(value || '')
    .trim()
    .toLowerCase() === 'present';
}

function getPrimaryHeadline(cv, config) {
  const custom = config?.CUSTOM_PROFESSION;
  if (custom) return custom;

  const experience = cv?.sections?.experience || [];
  const currentJob =
    experience.find((exp) => {
      if (isPresent(exp?.end_date)) return true;
      if (Array.isArray(exp?.positions)) {
        return exp.positions.some((pos) => isPresent(pos?.end_date));
      }
      return false;
    }) || experience[0];

  if (!currentJob) return null;

  if (Array.isArray(currentJob.positions) && currentJob.positions.length > 0) {
    const currentPosition =
      currentJob.positions.find((pos) => isPresent(pos?.end_date)) || currentJob.positions[0];
    return currentPosition?.title || currentJob.position || null;
  }

  return currentJob.position || null;
}

function flattenExperience(experience = []) {
  const items = [];

  for (const entry of experience) {
    if (!entry) continue;

    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      for (const position of entry.positions) {
        items.push({
          company: entry.company,
          title: position?.title || entry.position,
          endDate: position?.end_date ?? entry.end_date ?? null,
        });
      }
      continue;
    }

    items.push({
      company: entry.company,
      title: entry.position,
      endDate: entry.end_date ?? null,
    });
  }

  return items;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

export function AnsubMinimalTheme() {
  const { config, cvData, getAboutContent } = useConfig();

  // Inject @font-face into document head (required for Shadow DOM font support)
  useEffect(() => {
    const styleId = 'ansub-minimal-fonts';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = FONT_FACE_CSS;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const fullName = cv?.name || 'User';

  const headline = getPrimaryHeadline(cv, config) || 'Engineer & Designer';
  const aboutText = getAboutContent()?.markdown || '';

  const socials = cv?.social || [];
  const xUrl = pickSocialUrl(socials, ['x', 'twitter']);
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const email = cv?.email || null;

  const isDark = useMemo(() => {
    let stored = null;
    try {
      stored = window.localStorage.getItem('theme');
    } catch {
      stored = null;
    }

    if (stored === 'dark') return true;
    if (stored === 'light') return false;

    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  const experienceItems = useMemo(() => {
    const list = flattenExperience(cv?.sections?.experience || []);
    return list.slice(0, 5);
  }, [cv]);

  const projectItems = useMemo(() => {
    const list = cv?.sections?.projects || [];
    return list.slice(0, 4);
  }, [cv]);

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto', overscrollBehavior: 'none', background: isDark ? '#171717' : '#fafafa' }}>
      <ShadowRoot styleText={THEME_STYLE_TEXT}>
        <div className={`__variable_0a61d1 __variable_606a66 font-paragraph ${isDark ? 'dark' : ''}`}>
          <main className="flex items-center justify-between w-full flex-col p-8 min-h-screen" style={{ background: isDark ? '#171717' : '#fafafa' }}>
            <div className="w-full max-w-3xl">
              <div className="mb-12 mt-2">
                <a
                  href={cv?.website || '#'}
                  target={cv?.website ? '_blank' : undefined}
                  rel={cv?.website ? 'noreferrer' : undefined}
                >
                  <h1 className="font-medium text-gray-900 dark:text-gray-100 text-2xl font-heading">
                    {fullName}
                  </h1>
                </a>
                <p className="text-gray-500 dark:text-gray-400 uppercase text-xs">{headline}</p>

                <div className="flex flex-row justify-between items-center mt-4">
                  <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row gap-x-3 text-xs tracking-tighter" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
                      {xUrl ? (
                        <>
                          <a target="_blank" rel="noreferrer" href={xUrl}>
                            X
                          </a>
                          <span className="mx-1">/</span>
                        </>
                      ) : null}

                      {githubUrl ? (
                        <>
                          <a target="_blank" rel="noreferrer" href={githubUrl}>
                            GH
                          </a>
                          <span className="mx-1">/</span>
                        </>
                      ) : null}

                      {email ? (
                        <>
                          <a target="_blank" rel="noreferrer" href={`mailto:${email}`}>
                            MAIL
                          </a>
                          <span className="mx-1">/</span>
                        </>
                      ) : null}

                      {linkedinUrl ? (
                        <a target="_blank" rel="noreferrer" href={linkedinUrl}>
                          LI
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-12">
                {aboutText ? (
                  <div>
                    <p className="text-gray-500 text-md font-[400] tracking-tighter">
                      {aboutText}
                    </p>
                  </div>
                ) : null}

                {experienceItems.length > 0 ? (
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>Experience</div>
                    <ol className="relative border-s" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      {experienceItems.map((item, idx) => {
                        const current = isPresent(item.endDate);
                        return (
                          <li key={`${item.company}-${item.title}-${idx}`} className="mb-10 ms-4">
                            <div
                              className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5"
                              style={{
                                backgroundColor: current
                                  ? (isDark ? '#9ca3af' : '#4b5563')
                                  : (isDark ? '#4b5563' : '#e5e7eb'),
                                border: isDark ? 'none' : '1px solid #e5e7eb'
                              }}
                            ></div>
                            <div className="flex flex-row items-center gap-2">
                              <div className="text-md font-medium text-gray-900 dark:text-gray-300 tracking-tighter">
                                {item.title || 'Role'}
                                {current ? (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 uppercase">
                                    Current
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div className="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                              {item.company || 'Company'}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ) : null}

                {projectItems.length > 0 ? (
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>
                      Projects
                    </div>
                    <div className="flex flex-col gap-y-5">
                      {projectItems.map((project, idx) => (
                        <div key={`${project.name || 'project'}-${idx}`}>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={project.url || '#'}
                          >
                            <div className="text-sm mb-1 tracking-tight" style={{ color: isDark ? '#e5e7eb' : '#1a1a1a' }}>
                              {project.name || 'Project'}
                            </div>
                            <div className="text-sm font-normal text-gray-500 tracking-tighter">
                              {project.summary || ''}
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col">
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>
                      Contact
                    </div>
                    <div className="text-sm font-normal text-gray-500 tracking-tighter">
                      {cv?.location ? <div>{cv.location}</div> : null}
                      {email ? <div>{email}</div> : null}
                      {cv?.website ? (
                        <div>
                          <a target="_blank" rel="noreferrer" href={cv.website}>
                            {cv.website}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>Newsletter</div>
                    <p className="text-gray-500 dark:text-gray-400 mt-4 tracking-tighter">
                      Monthly insights on web development and design, delivered to your inbox.
                    </p>
                    <form className="relative">
                      <input
                        className="border dark:border-gray-900 w-full mt-4 px-2 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter your email"
                        value=""
                        readOnly
                      />
                      <button
                        className="bg-gray-900 hover:bg-gray-700 inline-block top-6 text-xs right-1 text-white px-2 py-2 rounded-md absolute disabled:opacity-80"
                        type="button"
                        disabled
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ShadowRoot>
    </div>
  );
}
