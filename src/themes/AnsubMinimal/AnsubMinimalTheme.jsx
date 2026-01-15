import React, { useEffect, useMemo } from 'react';
import { useCV, useConfig } from '../../contexts/ConfigContext';
import { ShadowRoot } from '../../ui/ShadowRoot';
import { isArchived, isPresent } from '../../utils/cvHelpers';

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

// Process experience with nesting support
function processExperienceWithNesting(rawExperience = []) {
  const items = [];

  for (const entry of rawExperience) {
    if (!entry || isArchived(entry)) continue;

    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      // Nested positions under same company
      items.push({
        type: 'nested',
        company: entry.company,
        url: entry.url,
        positions: entry.positions.map(pos => ({
          title: pos.title || pos.position || entry.position,
          startDate: pos.start_date,
          endDate: pos.end_date,
          isCurrent: isPresent(pos.end_date),
          summary: pos.summary,
        })),
      });
    } else {
      // Single position
      items.push({
        type: 'single',
        company: entry.company,
        title: entry.position,
        startDate: entry.start_date,
        endDate: entry.end_date,
        isCurrent: isPresent(entry.end_date),
        url: entry.url,
        summary: entry.summary,
      });
    }
  }

  return items;
}

// Process volunteer with nesting support
function processVolunteerWithNesting(rawVolunteer = []) {
  const items = [];

  for (const entry of rawVolunteer) {
    if (!entry || isArchived(entry)) continue;

    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      items.push({
        type: 'nested',
        organization: entry.organization,
        url: entry.url,
        positions: entry.positions.map(pos => ({
          title: pos.title || pos.position || pos.role || entry.position || entry.role,
          startDate: pos.start_date,
          endDate: pos.end_date,
          isCurrent: isPresent(pos.end_date),
          summary: pos.summary,
        })),
      });
    } else {
      items.push({
        type: 'single',
        organization: entry.organization,
        title: entry.position || entry.role,
        startDate: entry.start_date,
        endDate: entry.end_date,
        isCurrent: isPresent(entry.end_date),
        url: entry.url,
        summary: entry.summary,
      });
    }
  }

  return items;
}

export function AnsubMinimalTheme({ darkMode }) {
  const cv = useCV();
  const { cvData } = useConfig();

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

  // Process experience with nesting from raw data
  const experienceItems = useMemo(() => {
    const raw = cvData?.cv?.sections?.experience || [];
    return processExperienceWithNesting(raw).slice(0, 6);
  }, [cvData]);

  // Process education
  const educationItems = useMemo(() => {
    const raw = cvData?.cv?.sections?.education || [];
    return raw.filter(e => e && !isArchived(e)).slice(0, 4);
  }, [cvData]);

  // Process volunteer with nesting
  const volunteerItems = useMemo(() => {
    const raw = cvData?.cv?.sections?.volunteer || [];
    return processVolunteerWithNesting(raw).slice(0, 4);
  }, [cvData]);

  if (!cv) return null;

  // Use normalized data from context
  const {
    name: fullName,
    about: aboutText,
    currentJobTitle: headline,
    socialLinks,
    projects,
    email,
    phone,
    location,
    website,
    awards,
    presentations,
    publications,
    professionalDevelopment,
  } = cv;

  // Use darkMode prop from App instead of local state
  const isDark = darkMode;

  // Apply limits for display
  const projectItems = projects.slice(0, 4);

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto', overscrollBehavior: 'none', background: isDark ? '#171717' : '#fafafa' }}>
      <ShadowRoot styleText={THEME_STYLE_TEXT}>
        <div className={`__variable_0a61d1 __variable_606a66 font-paragraph ${isDark ? 'dark' : ''}`}>
          <main className="flex items-center justify-between w-full flex-col p-8 min-h-screen" style={{ background: isDark ? '#171717' : '#fafafa' }}>
            <div className="w-full max-w-3xl">
              <div className="mb-12 mt-2">
                <a
                  href={website || '#'}
                  target={website ? '_blank' : undefined}
                  rel={website ? 'noreferrer' : undefined}
                >
                  <h1 className="font-medium text-gray-900 dark:text-gray-100 text-2xl font-heading">
                    {fullName || 'User'}
                  </h1>
                </a>
                <p className="text-gray-500 dark:text-gray-400 uppercase text-xs">{headline || 'Engineer & Designer'}</p>

                <div className="flex flex-row justify-between items-center mt-4">
                  <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row gap-x-3 text-xs tracking-tighter" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
                      {socialLinks.twitter ? (
                        <>
                          <a target="_blank" rel="noreferrer" href={socialLinks.twitter}>
                            X
                          </a>
                          <span className="mx-1">/</span>
                        </>
                      ) : null}

                      {socialLinks.github ? (
                        <>
                          <a target="_blank" rel="noreferrer" href={socialLinks.github}>
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

                      {socialLinks.linkedin ? (
                        <a target="_blank" rel="noreferrer" href={socialLinks.linkedin}>
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
                      {experienceItems.map((item, idx) => (
                        <li key={`exp-${idx}`} className="mb-10 ms-4">
                          <div
                            className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5"
                            style={{
                              backgroundColor: (item.type === 'nested' ? item.positions[0]?.isCurrent : item.isCurrent)
                                ? (isDark ? '#9ca3af' : '#4b5563')
                                : (isDark ? '#4b5563' : '#e5e7eb'),
                              border: isDark ? 'none' : '1px solid #e5e7eb'
                            }}
                          ></div>
                          {item.type === 'nested' ? (
                            <>
                              <div className="mb-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                {item.company}
                              </div>
                              <div className="flex flex-col gap-3 ml-2" style={{ borderLeft: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`, paddingLeft: '12px' }}>
                                {item.positions.map((pos, posIdx) => (
                                  <div key={`pos-${posIdx}`}>
                                    <div className="flex flex-row items-center gap-2">
                                      <div className="text-md font-medium text-gray-900 dark:text-gray-300 tracking-tighter">
                                        {pos.title || 'Role'}
                                        {pos.isCurrent ? (
                                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 uppercase">
                                            Current
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex flex-row items-center gap-2">
                                <div className="text-md font-medium text-gray-900 dark:text-gray-300 tracking-tighter">
                                  {item.title || 'Role'}
                                  {item.isCurrent ? (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 uppercase">
                                      Current
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <div className="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                                {item.company || 'Company'}
                              </div>
                            </>
                          )}
                        </li>
                      ))}
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

                {educationItems.length > 0 ? (
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>Education</div>
                    <ol className="relative border-s" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      {educationItems.map((item, idx) => (
                        <li key={`edu-${idx}`} className="mb-10 ms-4">
                          <div
                            className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5"
                            style={{
                              backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                              border: isDark ? 'none' : '1px solid #e5e7eb'
                            }}
                          ></div>
                          <div className="flex flex-row items-center gap-2">
                            <div className="text-md font-medium text-gray-900 dark:text-gray-300 tracking-tighter">
                              {item.degree || item.area || 'Degree'}
                            </div>
                          </div>
                          <div className="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                            {item.institution || 'Institution'}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {volunteerItems.length > 0 ? (
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>Volunteer</div>
                    <ol className="relative border-s" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      {volunteerItems.map((item, idx) => (
                        <li key={`vol-${idx}`} className="mb-10 ms-4">
                          <div
                            className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5"
                            style={{
                              backgroundColor: (item.type === 'nested' ? item.positions[0]?.isCurrent : item.isCurrent)
                                ? (isDark ? '#9ca3af' : '#4b5563')
                                : (isDark ? '#4b5563' : '#e5e7eb'),
                              border: isDark ? 'none' : '1px solid #e5e7eb'
                            }}
                          ></div>
                          {item.type === 'nested' ? (
                            <>
                              <div className="mb-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                {item.organization}
                              </div>
                              <div className="flex flex-col gap-3 ml-2" style={{ borderLeft: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`, paddingLeft: '12px' }}>
                                {item.positions.map((pos, posIdx) => (
                                  <div key={`vpos-${posIdx}`}>
                                    <div className="flex flex-row items-center gap-2">
                                      <div className="text-md font-medium text-gray-900 dark:text-gray-300 tracking-tighter">
                                        {pos.title || 'Role'}
                                        {pos.isCurrent ? (
                                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 uppercase">
                                            Current
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex flex-row items-center gap-2">
                                <div className="text-md font-medium text-gray-900 dark:text-gray-300 tracking-tighter">
                                  {item.title || 'Role'}
                                  {item.isCurrent ? (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 uppercase">
                                      Current
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <div className="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                                {item.organization || 'Organization'}
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {/* Awards Section */}
                {awards?.length > 0 ? (
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>Awards</div>
                    <ol className="relative border-s" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      {awards.map((award, idx) => (
                        <li key={`award-${idx}`} className="mb-10 ms-4">
                          <div
                            className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5"
                            style={{
                              backgroundColor: isDark ? '#fbbf24' : '#f59e0b',
                              border: isDark ? 'none' : '1px solid #e5e7eb'
                            }}
                          ></div>
                          <div className="flex flex-row items-center gap-2">
                            <div className="text-md font-medium text-gray-900 dark:text-gray-300 tracking-tighter">
                              {award.name}
                            </div>
                          </div>
                          <div className="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                            {award.summary} {award.date && `(${award.date})`}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {/* Presentations Section */}
                {presentations?.length > 0 ? (
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>Presentations</div>
                    <ol className="relative border-s" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      {presentations.map((pres, idx) => (
                        <li key={`pres-${idx}`} className="mb-10 ms-4">
                          <div
                            className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5"
                            style={{
                              backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                              border: isDark ? 'none' : '1px solid #e5e7eb'
                            }}
                          ></div>
                          <div className="flex flex-row items-center gap-2">
                            <div className="text-md font-medium text-gray-900 dark:text-gray-300 tracking-tighter">
                              {pres.name}
                            </div>
                          </div>
                          <div className="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                            {pres.summary} {pres.location && `@ ${pres.location}`} {pres.date && `(${pres.date})`}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {/* Publications Section */}
                {publications?.length > 0 ? (
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>Publications</div>
                    <div className="flex flex-col gap-y-5">
                      {publications.map((pub, idx) => (
                        <div key={`pub-${idx}`}>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={pub.doi ? `https://doi.org/${pub.doi}` : '#'}
                          >
                            <div className="text-sm mb-1 tracking-tight" style={{ color: isDark ? '#e5e7eb' : '#1a1a1a' }}>
                              {pub.title || pub.name}
                            </div>
                            <div className="text-sm font-normal text-gray-500 tracking-tighter">
                              {pub.journal} {pub.date && `(${pub.date})`}
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Professional Development Section */}
                {professionalDevelopment?.length > 0 ? (
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>Professional Development</div>
                    <ol className="relative border-s" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      {professionalDevelopment.map((item, idx) => (
                        <li key={`profdev-${idx}`} className="mb-10 ms-4">
                          <div
                            className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5"
                            style={{
                              backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                              border: isDark ? 'none' : '1px solid #e5e7eb'
                            }}
                          ></div>
                          <div className="flex flex-row items-center gap-2">
                            <div className="text-md font-medium text-gray-900 dark:text-gray-300 tracking-tighter">
                              {item.name}
                            </div>
                          </div>
                          <div className="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                            {item.summary} {item.location && `@ ${item.location}`} {item.date && `(${item.date})`}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                <div className="flex flex-col">
                  <div>
                    <div className="font-medium mb-4 text-lg" style={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}>
                      Contact
                    </div>
                    <div className="text-sm font-normal text-gray-500 tracking-tighter">
                      {location ? <div>{location}</div> : null}
                      {email ? <div>{email}</div> : null}
                      {phone ? <div>{phone}</div> : null}
                      {website ? (
                        <div>
                          <a target="_blank" rel="noreferrer" href={website}>
                            {website}
                          </a>
                        </div>
                      ) : null}
                    </div>
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
