import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { isPresent } from '../../utils/cvHelpers';
import { createFluidParticles } from './fluidParticles';

/**
 * WinTongtaweeTheme — a faithful CV-driven remake of wintongtawee.dev.
 *
 * A pitch-dark, monospace (Geist Mono) single column capped at 480px: a round
 * avatar that swaps on hover, a name + role, a couple of bio lines, a row of
 * social glyphs, then quiet `year | label` lists for experience and education,
 * and a project list that floats a preview card by the cursor on hover.
 * Everything is lowercased in the source aesthetic, so we mirror that here.
 */

// Source greyscale ramp (gray-1 darkest → gray-10 white).
const C = {
  g1: '#0d0d0d',
  g2: '#1b1b1b',
  g4: '#525252',
  g5: '#6f6f6f',
  g6: '#868686',
  g7: '#a8a8a8',
  g8: '#d4d4d4',
  g9: '#ebebeb',
  g10: '#ffffff',
};

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap');
`;

function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function yearOf(value) {
  const m = String(value || '').match(/\d{4}/);
  return m ? m[0] : '';
}

// "2025", "2023–25", or "present" — matching the source's compact date column.
function displayYear({ startDate, endDate, isCurrent } = {}) {
  if (isCurrent || isPresent(endDate)) return 'present';
  const startY = yearOf(startDate);
  const endY = yearOf(endDate);
  if (startY && endY && startY !== endY) return `${startY}–${endY.slice(2)}`;
  return endY || startY || '';
}

function firstParagraphs(about = '') {
  return String(about)
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 3);
}

// Map a social network name to one of the bundled glyphs below.
function iconFor(network = '') {
  const n = network.toLowerCase();
  if (/x|twitter/.test(n)) return 'x';
  if (/github/.test(n)) return 'github';
  if (/instagram/.test(n)) return 'instagram';
  if (/linkedin/.test(n)) return 'linkedin';
  if (/facebook/.test(n)) return 'facebook';
  if (/youtube/.test(n)) return 'youtube';
  return 'link';
}

const ICONS = {
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  github:
    'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  youtube:
    'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  link: 'M3.9 12a5 5 0 015-5h3v1.9h-3a3.1 3.1 0 100 6.2h3V17h-3a5 5 0 01-5-5zm6.1-1h4v2h-4v-2zm5-4h3a5 5 0 010 10h-3v-1.9h3a3.1 3.1 0 000-6.2h-3V7z',
};

function SocialIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={ICONS[name] || ICONS.link} />
    </svg>
  );
}

function Row({ year, children, note }) {
  return (
    <RowEl>
      <span className="year">{year}</span>
      <span className="label">
        {children}
        {note ? <span className="note"> — {note}</span> : null}
      </span>
    </RowEl>
  );
}

// Cursor-driven WebGL fluid whose monochrome dye lights up a grid of points,
// dampened over the content card. See ./fluidParticles. Honors reduced motion.
function FluidBackground({ contentRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    let destroy;
    try {
      destroy = createFluidParticles(canvas, {
        getContentRect: () => contentRef.current?.getBoundingClientRect() || null,
      });
    } catch {
      destroy = undefined;
    }
    return () => destroy?.();
  }, [contentRef]);

  return <Canvas ref={canvasRef} aria-hidden="true" />;
}

export function WinTongtaweeTheme() {
  const cv = useCV();
  const [preview, setPreview] = useState(null); // { project, x, y } | null
  const listRef = useRef(null);
  const columnRef = useRef(null);

  const experience = useMemo(
    () => (cv.experience || []).filter(Boolean),
    [cv.experience],
  );
  const education = useMemo(
    () => (cv.education || []).filter(Boolean),
    [cv.education],
  );
  const projects = useMemo(
    () => (cv.projects || []).filter((p) => p && p.name),
    [cv.projects],
  );
  const volunteer = useMemo(
    () => (cv.volunteer || []).filter(Boolean),
    [cv.volunteer],
  );
  const awards = useMemo(() => (cv.awards || []).filter((a) => a && a.name), [cv.awards]);
  const presentations = useMemo(
    () => (cv.presentations || []).filter((p) => p && p.name),
    [cv.presentations],
  );
  const publications = useMemo(
    () => (cv.publications || []).filter((p) => p && p.title),
    [cv.publications],
  );
  const profDev = useMemo(
    () => (cv.professionalDevelopment || []).filter((p) => p && p.name),
    [cv.professionalDevelopment],
  );
  const certSkills = useMemo(
    () => (cv.certificationsSkills || []).filter((c) => c && (c.label || c.details)),
    [cv.certificationsSkills],
  );

  // Socials in the source's visual order, de-duplicated by glyph, plus website.
  const socials = useMemo(() => {
    const out = [];
    const seen = new Set();
    for (const s of cv.socialRaw || []) {
      if (!s || !s.url) continue;
      const icon = iconFor(s.network);
      if (seen.has(icon)) continue;
      seen.add(icon);
      out.push({ icon, url: s.url, label: s.network || icon });
    }
    if (cv.website && !seen.has('link')) {
      out.push({ icon: 'link', url: cv.website, label: 'website' });
    }
    return out;
  }, [cv.socialRaw, cv.website]);

  const bio = useMemo(() => {
    const paras = firstParagraphs(cv.about);
    if (paras.length) return paras;
    // Fallback that reads like the source's two short lines.
    const lines = [];
    if (cv.currentJobTitle) lines.push(`${cv.currentJobTitle}.`);
    const lastEdu = education[education.length - 1] || education[0];
    if (lastEdu) {
      const field = lastEdu.area || lastEdu.degree;
      lines.push(`previously ${field ? `${field} ` : ''}at ${lastEdu.institution}.`);
    }
    return lines;
  }, [cv.about, cv.currentJobTitle, education]);

  const eduLabel = (ed) => {
    const head = [ed.degree, ed.area].filter(Boolean).join(' ');
    return ed.institution ? `${head} — ${ed.institution}` : head;
  };

  const handleMove = (project) => (e) => {
    const bounds = listRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setPreview({
      project,
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
  };

  return (
    <Page>
      <GlobalStyle />
      <Vignette aria-hidden="true" />
      <FluidBackground contentRef={columnRef} />
      <Column ref={columnRef}>
        <Avatar
          className="avatar"
          $hasImage={Boolean(cv.avatar)}
          aria-label={cv.name}
        >
          {cv.avatar ? (
            <img src={cv.avatar} alt={cv.name} />
          ) : (
            <span>{initialsOf(cv.name) || '·'}</span>
          )}
        </Avatar>

        <Name>{cv.name}</Name>
        {cv.currentJobTitle && <Role>{cv.currentJobTitle}</Role>}

        {bio.length > 0 && (
          <Bio>
            {bio.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </Bio>
        )}

        {socials.length > 0 && (
          <Socials>
            {socials.map((s) => (
              <a
                key={s.icon + s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
              >
                <SocialIcon name={s.icon} />
              </a>
            ))}
          </Socials>
        )}

        {experience.length > 0 && (
          <>
            <Divider />
            <Section>
              <h2>experience</h2>
              {experience.map((job, i) => (
                <Row key={i} year={displayYear(job)}>
                  {[job.title, job.company].filter(Boolean).join(' @ ')}
                </Row>
              ))}
            </Section>
          </>
        )}

        {volunteer.length > 0 && (
          <>
            <Divider />
            <Section>
              <h2>volunteer</h2>
              {volunteer.map((job, i) => (
                <Row key={i} year={displayYear(job)}>
                  {[job.title, job.company].filter(Boolean).join(' @ ')}
                </Row>
              ))}
            </Section>
          </>
        )}

        {education.length > 0 && (
          <>
            <Divider />
            <Section>
              <h2>education</h2>
              {education.map((ed, i) => (
                <Row key={i} year={displayYear(ed)}>
                  {eduLabel(ed)}
                </Row>
              ))}
            </Section>
          </>
        )}

        {projects.length > 0 && (
          <>
            <Divider />
            <Section>
              <h2>projects</h2>
              <ProjectList ref={listRef} onMouseLeave={() => setPreview(null)}>
                {projects.map((p, i) => {
                  const inner = (
                    <>
                      <span className="title">{p.name}</span>
                      <span className="meta">
                        {p.summary || yearOf(p.date)} ↗
                      </span>
                    </>
                  );
                  return p.url ? (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project"
                      onMouseEnter={handleMove(p)}
                      onMouseMove={handleMove(p)}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div
                      key={i}
                      className="project"
                      onMouseEnter={handleMove(p)}
                      onMouseMove={handleMove(p)}
                    >
                      {inner}
                    </div>
                  );
                })}

                {preview && (
                  <Preview style={{ left: preview.x + 20, top: preview.y + 16 }}>
                    {preview.project.image ? (
                      <img src={preview.project.image} alt="" />
                    ) : (
                      <div className="placeholder">
                        <span>{preview.project.name}</span>
                      </div>
                    )}
                    {preview.project.summary && (
                      <p>{preview.project.summary}</p>
                    )}
                  </Preview>
                )}
              </ProjectList>
            </Section>
          </>
        )}

        {awards.length > 0 && (
          <>
            <Divider />
            <Section>
              <h2>awards</h2>
              {awards.map((a, i) => (
                <Row key={i} year={yearOf(a.date)} note={a.summary || undefined}>
                  {a.name}
                </Row>
              ))}
            </Section>
          </>
        )}

        {presentations.length > 0 && (
          <>
            <Divider />
            <Section>
              <h2>presentations</h2>
              {presentations.map((p, i) => (
                <Row key={i} year={yearOf(p.date)} note={p.summary || p.location || undefined}>
                  {p.name}
                </Row>
              ))}
            </Section>
          </>
        )}

        {publications.length > 0 && (
          <>
            <Divider />
            <Section>
              <h2>publications</h2>
              {publications.map((p, i) => (
                <Row key={i} year={yearOf(p.date)} note={p.journal || undefined}>
                  {p.title}
                </Row>
              ))}
            </Section>
          </>
        )}

        {profDev.length > 0 && (
          <>
            <Divider />
            <Section>
              <h2>professional development</h2>
              {profDev.map((p, i) => (
                <Row key={i} year={yearOf(p.date)} note={p.summary || undefined}>
                  {p.name}
                </Row>
              ))}
            </Section>
          </>
        )}

        {certSkills.length > 0 && (
          <>
            <Divider />
            <Section>
              <h2>skills &amp; certifications</h2>
              {certSkills.map((c, i) => (
                <CertRow key={i}>
                  <span className="cert-label">{c.label}</span>
                  <span className="cert-details">{c.details}</span>
                </CertRow>
              ))}
            </Section>
          </>
        )}

        <Footer />
      </Column>
    </Page>
  );
}

const Page = styled.div`
  position: relative;
  min-height: 100%;
  background: ${C.g1};
  color: ${C.g9};
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo,
    Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  text-transform: lowercase;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: clamp(80px, 12vh, 160px);
  padding-bottom: calc(8rem + env(safe-area-inset-bottom));
  padding-left: max(1.25rem, env(safe-area-inset-left));
  padding-right: max(1.25rem, env(safe-area-inset-right));

  *::selection {
    background: ${C.g8};
    color: ${C.g1};
  }
`;

const Vignette = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    120% 80% at 50% 0%,
    rgba(255, 255, 255, 0.03),
    transparent 60%
  );
`;

const Canvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

const Column = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
`;

const Avatar = styled.div`
  height: 64px;
  width: 64px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${C.g2};
  color: ${C.g7};
  font-size: 18px;
  font-weight: 500;
  text-transform: uppercase;
  transition: background 0.3s ease, color 0.3s ease, transform 0.3s ease;

  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    filter: grayscale(1);
    transition: filter 0.3s ease;
  }

  &:hover {
    transform: scale(1.04);
    background: ${(p) => (p.$hasImage ? C.g2 : C.g9)};
    color: ${(p) => (p.$hasImage ? C.g7 : C.g1)};
  }
  &:hover img {
    filter: grayscale(0);
  }
`;

const Name = styled.p`
  margin: 16px 0 0;
  color: ${C.g10};
  font-size: 16px;
  font-weight: 500;
`;

const Role = styled.p`
  margin: 2px 0 0;
  color: ${C.g5};
  font-size: 14px;
`;

const Bio = styled.div`
  margin-top: 24px;
  p {
    margin: 0;
    color: ${C.g6};
    font-size: 13px;
    line-height: 1.8;
  }
  p + p {
    margin-top: 12px;
  }
`;

const Socials = styled.div`
  margin-top: 32px;
  display: flex;
  align-items: center;
  gap: 16px;

  a {
    color: ${C.g4};
    display: inline-flex;
    transition: color 0.15s ease;
  }
  a:hover {
    color: ${C.g7};
  }
  svg {
    height: 20px;
    width: 20px;
  }
`;

const Divider = styled.div`
  margin-top: 32px;
  border-top: 1px solid ${C.g2};
`;

const Section = styled.section`
  margin-top: 20px;

  h2 {
    margin: 0 0 16px;
    color: ${C.g8};
    font-size: 13px;
    font-weight: 400;
  }
`;

const RowEl = styled.div`
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 4px 0;

  .year {
    flex: none;
    min-width: 55px;
    color: ${C.g5};
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  .label {
    flex: 1;
    color: ${C.g7};
    font-size: 12px;
  }
  .note {
    color: ${C.g5};
    font-size: 10px;
  }
`;

const CertRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 4px 0;

  .cert-label {
    flex: none;
    min-width: 90px;
    color: ${C.g8};
    font-size: 12px;
  }
  .cert-details {
    flex: 1;
    color: ${C.g6};
    font-size: 12px;
    line-height: 1.7;
  }
`;

const ProjectList = styled.div`
  position: relative;

  .project {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 0;
    border-bottom: 1px solid ${C.g2};
    cursor: pointer;
    text-decoration: none;
  }
  .project .title {
    color: ${C.g7};
    font-size: 11px;
    transition: color 0.15s ease;
  }
  .project .meta {
    color: ${C.g5};
    font-size: 10px;
    text-align: right;
    transition: color 0.15s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60%;
  }
  .project:hover .title {
    color: ${C.g9};
  }
  .project:hover .meta {
    color: ${C.g7};
  }
`;

const Preview = styled.div`
  position: absolute;
  z-index: 5;
  width: 220px;
  pointer-events: none;
  border: 1px solid ${C.g2};
  border-radius: 6px;
  overflow: hidden;
  background: ${C.g1};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);

  img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }
  .placeholder {
    aspect-ratio: 16 / 9;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    background: linear-gradient(135deg, ${C.g2}, ${C.g1});
  }
  .placeholder span {
    color: ${C.g7};
    font-size: 11px;
    text-align: center;
  }
  p {
    margin: 0;
    padding: 8px 10px;
    color: ${C.g6};
    font-size: 10px;
    line-height: 1.5;
  }

  @media (max-width: 1023px) {
    display: none;
  }
`;

const Footer = styled.div`
  height: 35vh;
`;

export default WinTongtaweeTheme;
