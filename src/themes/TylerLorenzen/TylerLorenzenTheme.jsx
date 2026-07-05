import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, getInitials, isPresent, pickSocialUrl } from '../../utils/cvHelpers';
import { withBase } from '../../utils/assetPath';

/**
 * TylerLorenzenTheme — a CV-driven remake of tylerlorenzen.tech's design.
 *
 * The source is a music-streaming-inspired (Spotify-like) personal site: a
 * near-black charcoal ground, a vibrant green accent, rounded elevated cards,
 * a streaming-playlist treatment for work history, and a fun "now playing"
 * player bar pinned to the bottom. We rebuild that language from CV.yaml
 * (Ahmad Jalil) rather than reusing Tyler's content.
 */

const SPOTIFY_GREEN = '#1db954';
const SPOTIFY_GREEN_HOVER = '#1ed760';

const darkTheme = {
  bg: '#121212',
  bgHeader: 'rgba(18, 18, 18, 0.82)',
  elevated: '#181818',
  card: '#1f1f1f',
  cardHover: '#282828',
  tile: '#232323',
  text: '#ffffff',
  muted: '#b3b3b3',
  faint: '#727272',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  accent: SPOTIFY_GREEN,
  accentHover: SPOTIFY_GREEN_HOVER,
  accentText: '#000000',
  onAccentGlow: 'rgba(29, 185, 84, 0.35)',
};

const lightTheme = {
  bg: '#f6f7f8',
  bgHeader: 'rgba(246, 247, 248, 0.85)',
  elevated: '#ffffff',
  card: '#ffffff',
  cardHover: '#f0f1f2',
  tile: '#f0f1f2',
  text: '#0b0b0b',
  muted: '#4b5157',
  faint: '#8a9199',
  border: 'rgba(0, 0, 0, 0.08)',
  borderStrong: 'rgba(0, 0, 0, 0.14)',
  accent: '#159c43',
  accentHover: '#12873a',
  accentText: '#ffffff',
  onAccentGlow: 'rgba(21, 156, 67, 0.25)',
};

const GlobalStyle = createGlobalStyle`
  body { background-color: ${(p) => p.theme.bg}; }
`;

// Tools worth calling out as little logo tiles. Each maps a skill keyword to a
// glyph; anything unmatched falls back to a two-letter monogram tile.
const TOOL_GLYPHS = [
  { match: /power\s*bi/i, glyph: '📊' },
  { match: /\bgis\b/i, glyph: '🗺️' },
  { match: /r\s*studio/i, glyph: '📈' },
  { match: /adobe/i, glyph: '🎨' },
  { match: /spss/i, glyph: '🧮' },
  { match: /excel/i, glyph: '📗' },
  { match: /prism/i, glyph: '🔬' },
  { match: /python/i, glyph: '🐍' },
  { match: /\bcad\b/i, glyph: '📐' },
  { match: /research/i, glyph: '🔎' },
  { match: /grant/i, glyph: '📝' },
  { match: /logistic/i, glyph: '📦' },
  { match: /brand/i, glyph: '🧭' },
];

function glyphFor(label = '') {
  const found = TOOL_GLYPHS.find((t) => t.match.test(label));
  return found ? found.glyph : null;
}

function resolveAvatar(avatar) {
  if (!avatar) return null;
  return /^https?:\/\//i.test(avatar) ? avatar : withBase(avatar);
}

// cv.about is empty for this CV — synthesize a short, source-agnostic bio from
// role + field + place so every section still reads as the person's own voice.
function synthesizeBio(cv) {
  const name = (cv.name || '').split(/\s+/)[0] || cv.name || 'I';
  const place = cv.location || null;
  const topEdu = (cv.education || [])[0] || null;
  const degree = topEdu?.degree || null;

  // "Focus on air quality and environmental health" -> "air quality and
  // environmental health"
  const focusHi = (topEdu?.highlights || []).find((h) => /focus/i.test(h)) || '';
  const field = focusHi.replace(/^.*focus\s*(on)?\s*/i, '').replace(/\.$/, '').trim()
    || 'environmental health';

  const roleLead = degree
    ? `a ${degree} researcher in ${field}`
    : `a researcher in ${field}`;

  return `${name} is ${roleLead}${place ? `, based in ${place}` : ''}. `
    + `The work moves between the lab, the field, and the data — turning environmental `
    + `samples into clear signals that inform public and environmental health.`;
}

function heroRole(cv) {
  if (cv.headline || cv.label || cv.tagline) return cv.headline || cv.label || cv.tagline;
  const topEdu = (cv.education || [])[0];
  const focusHi = (topEdu?.highlights || []).find((h) => /focus/i.test(h)) || '';
  const field = focusHi.replace(/^.*focus\s*(on)?\s*/i, '').replace(/\.$/, '').trim();
  const degree = topEdu?.degree;
  if (degree && field) {
    const titled = field.replace(/\b\w/g, (c) => c.toUpperCase());
    return `${degree} Researcher · ${titled}`;
  }
  return cv.currentJobTitle || 'Researcher';
}

/* ---------- icons ---------- */

const PlayGlyph = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.79-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
  </svg>
);
const PauseGlyph = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);
const PrevGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 6a1 1 0 0 1 2 0v5l8.4-5.6A1 1 0 0 1 19 6.2v11.6a1 1 0 0 1-1.6.8L9 13v5a1 1 0 0 1-2 0z" />
  </svg>
);
const NextGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 6a1 1 0 0 0-2 0v5L6.6 5.4A1 1 0 0 0 5 6.2v11.6a1 1 0 0 0 1.6.8L15 13v5a1 1 0 0 0 2 0z" />
  </svg>
);
const ShuffleGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" />
  </svg>
);
const RepeatGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);
const SunGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const MoonGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const SOCIAL_ICONS = {
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.4 8.65 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.32-2.02-3.32-2.02 0-2.33 1.58-2.33 3.21V21H9z" /></svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.95.68 1.92v2.85c0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" /></svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.9 3.78-3.9 1.1 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" /></svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
  ),
};

function Equalizer({ playing }) {
  return (
    <EqWrap aria-hidden="true">
      <span data-b="1" data-play={playing ? 'on' : 'off'} />
      <span data-b="2" data-play={playing ? 'on' : 'off'} />
      <span data-b="3" data-play={playing ? 'on' : 'off'} />
    </EqWrap>
  );
}

export function TylerLorenzenTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const initials = getInitials(name, 2, '♪');
  const avatarSrc = resolveAvatar(cv.avatar);
  const role = useMemo(() => heroRole(cv), [cv]);
  const bio = useMemo(() => synthesizeBio(cv), [cv]);
  const email = cv.email || null;

  const socials = cv.social || [];
  const socialLinks = useMemo(() => {
    const order = ['linkedin', 'github', 'facebook', 'instagram'];
    return order
      .map((net) => ({ net, url: pickSocialUrl(socials, [net]) }))
      .filter((s) => s.url);
  }, [socials]);

  const skillList = useMemo(() => {
    const entry = (cv.certificationsSkills || []).find((e) => /skill/i.test(e.label || ''));
    if (!entry?.details) return [];
    return entry.details.split(';').map((s) => s.trim()).filter(Boolean);
  }, [cv]);

  const certList = useMemo(() => {
    const entry = (cv.certificationsSkills || []).find((e) => /cert/i.test(e.label || ''));
    if (!entry?.details) return [];
    return entry.details.split(';').map((s) => s.trim()).filter(Boolean);
  }, [cv]);

  const tools = useMemo(() => {
    const withG = skillList.map((label) => ({ label, glyph: glyphFor(label) }));
    const matched = withG.filter((t) => t.glyph);
    const source = matched.length >= 4 ? matched : withG;
    return source.slice(0, 8);
  }, [skillList]);

  const experience = cv.experience || [];
  const education = cv.education || [];
  const awards = cv.awards || [];
  const projects = cv.projects || [];

  const defaultTrack = useMemo(() => {
    const idx = experience.findIndex((e) => e.isCurrent || isPresent(e.endDate));
    return idx >= 0 ? idx : 0;
  }, [experience]);

  const [trackIdx, setTrackIdx] = useState(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    setTrackIdx(defaultTrack);
  }, [defaultTrack]);

  // Fake transport: nudge the progress bar while "playing", loop at the end.
  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.5));
    }, 120);
    return () => clearInterval(id);
  }, [isPlaying]);

  const trackCount = experience.length;
  const current = experience[trackIdx] || null;

  const nowTitle = current?.title || role || name;
  const nowSubtitle = current?.company || cv.location || name;

  const selectTrack = useCallback((i) => {
    setTrackIdx(i);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const gotoDelta = useCallback((delta) => {
    if (!trackCount) return;
    setTrackIdx((i) => (i + delta + trackCount) % trackCount);
    setProgress(0);
    setIsPlaying(true);
  }, [trackCount]);

  const onRowClick = useCallback((i) => {
    setOpenIdx((prev) => (prev === i ? null : i));
    if (openIdx !== i) selectTrack(i);
  }, [openIdx, selectTrack]);

  // Section anchors for the nav (Portfolio / Activity / Radio).
  const portfolioRef = useRef(null);
  const activityRef = useRef(null);
  const radioRef = useRef(null);
  const scrollTo = useCallback((ref) => (e) => {
    e.preventDefault();
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const isDark = darkMode;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Header>
          <HeaderInner>
            <Brand>
              <BrandAvatar>
                {avatarSrc
                  ? <img src={avatarSrc} alt={name} />
                  : <span>{initials}</span>}
              </BrandAvatar>
              <BrandName>{name}</BrandName>
            </Brand>

            <Nav>
              <a href="#portfolio" onClick={scrollTo(portfolioRef)}>Portfolio</a>
              <a href="#activity" onClick={scrollTo(activityRef)}>Activity</a>
              <a href="#radio" onClick={scrollTo(radioRef)}>Radio</a>
            </Nav>

            <Actions>
              <SocialRow>
                {socialLinks.map((s) => (
                  <IconLink key={s.net} href={s.url} target="_blank" rel="noopener noreferrer" title={s.net}>
                    {SOCIAL_ICONS[s.net] || <span>{s.net[0]}</span>}
                  </IconLink>
                ))}
              </SocialRow>
              <ToggleBtn
                type="button"
                onClick={() => onDarkModeChange?.(!isDark)}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle color mode"
              >
                {isDark ? <SunGlyph /> : <MoonGlyph />}
              </ToggleBtn>
              {email && (
                <ConnectBtn href={`mailto:${email}`}>Connect</ConnectBtn>
              )}
            </Actions>
          </HeaderInner>
        </Header>

        <Main>
          {/* Hero */}
          <Hero>
            <HeroArt data-play={isPlaying ? 'on' : 'off'}>
              {avatarSrc
                ? <img src={avatarSrc} alt={name} />
                : <HeroInitials>{initials}</HeroInitials>}
              <ArtRing />
            </HeroArt>
            <HeroBody>
              <Eyebrow>Profile</Eyebrow>
              <HeroName>{name}</HeroName>
              <HeroRole>{role}</HeroRole>
              <HeroBio>{bio}</HeroBio>
              <HeroCtaRow>
                <PlayCta type="button" onClick={togglePlay}>
                  {isPlaying ? <PauseGlyph size={20} /> : <PlayGlyph size={20} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </PlayCta>
                {cv.website && (
                  <GhostCta href={cv.website} target="_blank" rel="noopener noreferrer">
                    Visit site
                  </GhostCta>
                )}
                {cv.location && <Locale>◍ {cv.location}</Locale>}
              </HeroCtaRow>
            </HeroBody>
          </Hero>

          {/* Skills */}
          {skillList.length > 0 && (
            <Section>
              <SectionHead><h2>Skills</h2></SectionHead>
              <ChipRow>
                {skillList.map((s) => <Chip key={s}>{s}</Chip>)}
              </ChipRow>
            </Section>
          )}

          {/* Tools Used */}
          {tools.length > 0 && (
            <Section>
              <SectionHead><h2>Tools Used</h2></SectionHead>
              <ToolGrid>
                {tools.map((t) => (
                  <ToolTile key={t.label} title={t.label}>
                    <ToolBadge $glyph={!!t.glyph}>
                      {t.glyph || getInitials(t.label, 2, '·')}
                    </ToolBadge>
                    <span>{t.label}</span>
                  </ToolTile>
                ))}
              </ToolGrid>
            </Section>
          )}

          {/* Work Experience — streaming playlist */}
          {experience.length > 0 && (
            <Section ref={activityRef} id="activity">
              <SectionHead>
                <h2>Work Experience</h2>
                <SectionMeta>{experience.length} tracks</SectionMeta>
              </SectionHead>
              <Playlist>
                <PlaylistHeadRow>
                  <span>#</span>
                  <span>Title</span>
                  <span className="date">Dates</span>
                  <span className="ctl" aria-hidden="true" />
                </PlaylistHeadRow>
                {experience.map((exp, i) => {
                  const active = i === trackIdx;
                  const open = openIdx === i;
                  return (
                    <TrackWrap key={`${exp.company}-${exp.title}-${i}`} $active={active}>
                      <TrackRow
                        type="button"
                        onClick={() => onRowClick(i)}
                        $active={active}
                        aria-expanded={open}
                      >
                        <TrackIndex>
                          {active && isPlaying
                            ? <Equalizer playing />
                            : <span className="num">{i + 1}</span>}
                          <span className="hoverplay"><PlayGlyph size={14} /></span>
                        </TrackIndex>
                        <TrackMain>
                          <span className="title">{exp.title}</span>
                          <span className="company">{exp.company}</span>
                        </TrackMain>
                        <TrackDate>
                          {formatRange(exp.startDate, exp.endDate, { month: 'short', year: 'full', presentLabel: 'Present' })}
                        </TrackDate>
                        <TrackChevron $open={open} aria-hidden="true">▾</TrackChevron>
                      </TrackRow>
                      {open && (exp.highlights || []).length > 0 && (
                        <TrackDetail>
                          <ul>
                            {exp.highlights.map((h, hi) => <li key={hi}>{h}</li>)}
                          </ul>
                        </TrackDetail>
                      )}
                    </TrackWrap>
                  );
                })}
              </Playlist>
            </Section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <Section ref={radioRef} id="radio">
              <SectionHead>
                <h2>Education</h2>
                <SectionMeta>Radio</SectionMeta>
              </SectionHead>
              <CardGrid>
                {education.map((edu, i) => (
                  <InfoCard key={`edu-${i}`}>
                    <CardKicker>
                      {formatRange(edu.start_date, edu.end_date, { month: 'none', year: 'full', presentLabel: 'Present' })}
                    </CardKicker>
                    <CardTitle>{edu.degree}{edu.area ? ` · ${edu.area}` : ''}</CardTitle>
                    <CardSub>{edu.institution}</CardSub>
                    {(edu.highlights || []).length > 0 && (
                      <CardNote>{edu.highlights[0]}</CardNote>
                    )}
                  </InfoCard>
                ))}
              </CardGrid>
            </Section>
          )}

          {/* Awards & Certifications */}
          {(awards.length > 0 || certList.length > 0) && (
            <Section>
              <SectionHead><h2>Awards &amp; Certifications</h2></SectionHead>
              {awards.length > 0 && (
                <CardGrid>
                  {awards.map((a, i) => (
                    <InfoCard key={`award-${i}`}>
                      <CardKicker>
                        <AwardDot aria-hidden="true">★</AwardDot>
                        {formatRange(a.date, null, { month: 'short', year: 'full' })}
                      </CardKicker>
                      <CardTitle>{a.name}</CardTitle>
                      {a.summary && <CardSub>{a.summary}</CardSub>}
                    </InfoCard>
                  ))}
                </CardGrid>
              )}
              {certList.length > 0 && (
                <CertRow>
                  {certList.map((c) => <CertChip key={c}>✓ {c}</CertChip>)}
                </CertRow>
              )}
            </Section>
          )}

          {/* Projects / Case Studies */}
          {projects.length > 0 && (
            <Section ref={portfolioRef} id="portfolio">
              <SectionHead>
                <h2>Case Studies</h2>
                <SectionMeta>Portfolio</SectionMeta>
              </SectionHead>
              <CardGrid>
                {projects.map((p, i) => {
                  const tech = (p.highlights || []).find((h) => /^technolog/i.test(h));
                  const techList = tech
                    ? tech.replace(/^technolog(y|ies)\s*[-–:]\s*/i, '').split(',').map((t) => t.trim()).filter(Boolean)
                    : [];
                  const linkProps = p.url
                    ? { as: 'a', href: p.url, target: '_blank', rel: 'noopener noreferrer' }
                    : {};
                  return (
                    <ProjectCard key={`proj-${i}`} {...linkProps}>
                      <ProjectCover aria-hidden="true">
                        <span>{getInitials(p.name, 2, '♪')}</span>
                        {p.url && <ProjectPlay><PlayGlyph size={18} /></ProjectPlay>}
                      </ProjectCover>
                      <ProjectBody>
                        <CardKicker>{p.date || 'Project'}</CardKicker>
                        <CardTitle className="proj">{p.name}</CardTitle>
                        {p.summary && <CardSub>{p.summary}</CardSub>}
                        {techList.length > 0 && (
                          <TechRow>
                            {techList.map((t) => <TechChip key={t}>{t}</TechChip>)}
                          </TechRow>
                        )}
                      </ProjectBody>
                    </ProjectCard>
                  );
                })}
              </CardGrid>
            </Section>
          )}

          <PageFootnote>
            <span>{name}</span>
            <span>·</span>
            <span>Rebuilt in a music-streaming style · &copy; {new Date().getFullYear()}</span>
          </PageFootnote>
        </Main>

        {/* Now-playing player bar */}
        <Player>
          <PlayerInner>
            <NowPlaying>
              <NowArt data-play={isPlaying ? 'on' : 'off'}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="" />
                  : <span>{initials}</span>}
              </NowArt>
              <NowMeta>
                <span className="t">{nowTitle}</span>
                <span className="s">
                  {isPlaying ? 'Now playing' : 'Paused'} · {nowSubtitle}
                </span>
              </NowMeta>
            </NowPlaying>

            <PlayerCenter>
              <Transport>
                <TIcon type="button" aria-label="Shuffle" className="ghost"><ShuffleGlyph /></TIcon>
                <TIcon type="button" aria-label="Previous" onClick={() => gotoDelta(-1)}><PrevGlyph /></TIcon>
                <PlayCircle type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? <PauseGlyph size={20} /> : <PlayGlyph size={20} />}
                </PlayCircle>
                <TIcon type="button" aria-label="Next" onClick={() => gotoDelta(1)}><NextGlyph /></TIcon>
                <TIcon type="button" aria-label="Repeat" className="ghost"><RepeatGlyph /></TIcon>
              </Transport>
              <ProgressWrap>
                <span className="time">{isPlaying || progress > 0 ? '♪' : '0:00'}</span>
                <ProgressTrack>
                  <ProgressFill style={{ width: `${progress}%` }} />
                </ProgressTrack>
                <span className="time">{current?.isCurrent || isPresent(current?.endDate) ? '∞' : '—'}</span>
              </ProgressWrap>
            </PlayerCenter>

            <PlayerRight>
              {email && <MiniConnect href={`mailto:${email}`}>Connect</MiniConnect>}
            </PlayerRight>
          </PlayerInner>
        </Player>
      </Page>
    </ThemeProvider>
  );
}

/* ---------- animations ---------- */

const eq = keyframes`
  0% { height: 20%; }
  50% { height: 100%; }
  100% { height: 30%; }
`;
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

/* ---------- layout ---------- */

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background: ${(p) => p.theme.bg};
  color: ${(p) => p.theme.text};
  font-family: 'Inter', 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  *, *::before, *::after { box-sizing: border-box; }
`;

const Header = styled.header`
  position: sticky;
  top: var(--app-top-offset, 0px);
  z-index: 30;
  background: ${(p) => p.theme.bgHeader};
  backdrop-filter: saturate(160%) blur(14px);
  border-bottom: 1px solid ${(p) => p.theme.border};
`;

const HeaderInner = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  padding: 0.7rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 480px) {
    padding: 0.6rem 0.9rem;
    gap: 0.6rem;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
`;

const BrandAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  flex: 0 0 auto;
  background: ${(p) => p.theme.accent};
  color: ${(p) => p.theme.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const BrandName = styled.span`
  font-weight: 700;
  font-size: 0.98rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 520px) { display: none; }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.4rem;
  margin: 0 auto;

  a {
    color: ${(p) => p.theme.muted};
    text-decoration: none;
    font-size: 0.92rem;
    font-weight: 600;
    transition: color 0.18s ease;
  }
  a:hover { color: ${(p) => p.theme.text}; }

  @media (max-width: 760px) { display: none; }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
`;

const SocialRow = styled.div`
  display: flex;
  gap: 0.15rem;

  @media (max-width: 400px) { display: none; }
`;

const IconLink = styled.a`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.theme.muted};
  transition: color 0.18s ease, background 0.18s ease, transform 0.18s ease;

  &:hover {
    color: ${(p) => p.theme.text};
    background: ${(p) => p.theme.cardHover};
    transform: translateY(-1px);
  }
`;

const ToggleBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: transparent;
  color: ${(p) => p.theme.muted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.18s ease, background 0.18s ease;

  &:hover { color: ${(p) => p.theme.text}; background: ${(p) => p.theme.cardHover}; }
`;

const ConnectBtn = styled.a`
  background: ${(p) => p.theme.text};
  color: ${(p) => p.theme.bg};
  text-decoration: none;
  font-weight: 700;
  font-size: 0.88rem;
  padding: 0.5rem 1.05rem;
  border-radius: 999px;
  transition: transform 0.18s ease, opacity 0.18s ease;
  white-space: nowrap;

  &:hover { transform: scale(1.04); }

  @media (max-width: 400px) { display: none; }
`;

const Main = styled.main`
  flex: 1 0 auto;
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 1.75rem 1.25rem 2rem;

  @media (max-width: 480px) { padding: 1.25rem 0.9rem 1.5rem; }
`;

/* ---------- hero ---------- */

const Hero = styled.section`
  display: flex;
  align-items: flex-end;
  gap: 1.6rem;
  padding: 1.5rem 0 2.25rem;
  background:
    radial-gradient(120% 140% at 0% 0%, ${(p) => p.theme.onAccentGlow} 0%, transparent 55%);
  border-radius: 18px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.1rem;
    padding: 0.5rem 0 1.5rem;
  }
`;

const HeroArt = styled.div`
  position: relative;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  flex: 0 0 auto;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  background: ${(p) => p.theme.card};

  img { width: 100%; height: 100%; object-fit: cover; }

  &[data-play='on'] img { animation: ${spin} 22s linear infinite; }

  @media (max-width: 640px) { width: 130px; height: 130px; }
`;

const ArtRing = styled.span`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid ${(p) => p.theme.accent};
  opacity: 0.55;
  pointer-events: none;
`;

const HeroInitials = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.4rem;
  font-weight: 800;
  color: ${(p) => p.theme.accentText};
  background: linear-gradient(135deg, ${(p) => p.theme.accent}, ${(p) => p.theme.accentHover});
`;

const HeroBody = styled.div`
  min-width: 0;
  padding-bottom: 0.25rem;
`;

const Eyebrow = styled.div`
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${(p) => p.theme.muted};
  margin-bottom: 0.4rem;
`;

const HeroName = styled.h1`
  margin: 0;
  font-size: clamp(2.4rem, 8vw, 4.6rem);
  line-height: 1.02;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const HeroRole = styled.div`
  margin-top: 0.7rem;
  font-size: clamp(1rem, 2.4vw, 1.25rem);
  font-weight: 700;
  color: ${(p) => p.theme.accent};
`;

const HeroBio = styled.p`
  margin: 0.85rem 0 0;
  max-width: 46ch;
  color: ${(p) => p.theme.muted};
  font-size: 1rem;
  line-height: 1.6;
`;

const HeroCtaRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.35rem;
`;

const PlayCta = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  background: ${(p) => p.theme.accent};
  color: ${(p) => p.theme.accentText};
  font-weight: 800;
  font-size: 1rem;
  padding: 0.7rem 1.5rem 0.7rem 1.2rem;
  border-radius: 999px;
  box-shadow: 0 8px 24px ${(p) => p.theme.onAccentGlow};
  transition: transform 0.16s ease, background 0.16s ease;

  &:hover { transform: scale(1.045); background: ${(p) => p.theme.accentHover}; }
`;

const GhostCta = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  color: ${(p) => p.theme.text};
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  border: 1px solid ${(p) => p.theme.borderStrong};
  transition: border-color 0.16s ease, transform 0.16s ease;

  &:hover { border-color: ${(p) => p.theme.text}; transform: scale(1.03); }
`;

const Locale = styled.span`
  color: ${(p) => p.theme.faint};
  font-size: 0.9rem;
  font-weight: 600;
`;

/* ---------- generic section ---------- */

const Section = styled.section`
  padding: 1.75rem 0 0.5rem;
  scroll-margin-top: calc(var(--app-top-offset, 0px) + 72px);
`;

const SectionHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.1rem;

  h2 {
    margin: 0;
    font-size: clamp(1.35rem, 4vw, 1.75rem);
    font-weight: 800;
    letter-spacing: -0.01em;
  }
`;

const SectionMeta = styled.span`
  color: ${(p) => p.theme.faint};
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

/* ---------- skills ---------- */

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const Chip = styled.span`
  background: ${(p) => p.theme.card};
  border: 1px solid ${(p) => p.theme.border};
  color: ${(p) => p.theme.text};
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 600;
  transition: border-color 0.16s ease, background 0.16s ease;

  &:hover { border-color: ${(p) => p.theme.accent}; background: ${(p) => p.theme.cardHover}; }
`;

/* ---------- tools ---------- */

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.55rem;
  }
`;

const ToolTile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: ${(p) => p.theme.card};
  border: 1px solid ${(p) => p.theme.border};
  border-radius: 12px;
  padding: 0.7rem 0.85rem;
  transition: background 0.16s ease, transform 0.16s ease;

  span:last-child {
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover { background: ${(p) => p.theme.cardHover}; transform: translateY(-2px); }
`;

const ToolBadge = styled.div`
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(p) => (p.$glyph ? '1.2rem' : '0.85rem')};
  font-weight: 800;
  background: ${(p) => (p.$glyph ? p.theme.tile : p.theme.accent)};
  color: ${(p) => (p.$glyph ? p.theme.text : p.theme.accentText)};
`;

/* ---------- playlist ---------- */

const Playlist = styled.div`
  background: ${(p) => p.theme.elevated};
  border: 1px solid ${(p) => p.theme.border};
  border-radius: 14px;
  padding: 0.35rem 0.35rem 0.5rem;
`;

const PlaylistHeadRow = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr auto 26px;
  gap: 0.75rem;
  align-items: center;
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid ${(p) => p.theme.border};
  color: ${(p) => p.theme.faint};
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  .date { text-align: right; }

  @media (max-width: 520px) {
    grid-template-columns: 32px 1fr 26px;
    .date { display: none; }
  }
`;

const TrackWrap = styled.div`
  border-radius: 8px;
  background: ${(p) => (p.$active ? p.theme.cardHover : 'transparent')};
  margin-top: 2px;
`;

const TrackRow = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 44px 1fr auto 26px;
  gap: 0.75rem;
  align-items: center;
  padding: 0.6rem 0.85rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  color: ${(p) => p.theme.text};
  border-radius: 8px;
  transition: background 0.14s ease;

  &:hover { background: ${(p) => p.theme.cardHover}; }
  &:hover .num { display: none; }
  &:hover .hoverplay { display: inline-flex; }

  @media (max-width: 520px) {
    grid-template-columns: 32px 1fr 26px;
    gap: 0.5rem;
  }
`;

const TrackIndex = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.theme.faint};
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;

  .hoverplay { display: none; color: ${(p) => p.theme.text}; }
`;

const TrackMain = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;

  .title {
    font-weight: 700;
    font-size: 0.98rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .company {
    font-size: 0.83rem;
    color: ${(p) => p.theme.muted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const TrackDate = styled.div`
  text-align: right;
  color: ${(p) => p.theme.muted};
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  @media (max-width: 520px) { display: none; }
`;

const TrackChevron = styled.span`
  color: ${(p) => p.theme.faint};
  transition: transform 0.18s ease, color 0.18s ease;
  transform: rotate(${(p) => (p.$open ? '180deg' : '0deg')});
  text-align: center;
`;

const TrackDetail = styled.div`
  padding: 0 0.85rem 0.85rem 3.35rem;

  ul {
    margin: 0.2rem 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  li {
    position: relative;
    padding-left: 1.1rem;
    color: ${(p) => p.theme.muted};
    font-size: 0.9rem;
    line-height: 1.5;
  }
  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(p) => p.theme.accent};
  }

  @media (max-width: 520px) { padding-left: 2.4rem; }
`;

/* ---------- equalizer ---------- */

const EqWrap = styled.span`
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;

  span {
    width: 3px;
    height: 40%;
    background: ${(p) => p.theme.accent};
    border-radius: 2px;
  }
  span[data-play='on'] { animation: ${eq} 0.9s ease-in-out infinite; }
  span[data-b='2'] { animation-delay: 0.25s; }
  span[data-b='3'] { animation-delay: 0.5s; }

  @media (prefers-reduced-motion: reduce) {
    span { animation: none !important; height: 70%; }
  }
`;

/* ---------- cards ---------- */

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.9rem;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const InfoCard = styled.div`
  background: ${(p) => p.theme.card};
  border: 1px solid ${(p) => p.theme.border};
  border-radius: 12px;
  padding: 1.05rem 1.1rem;
  transition: background 0.16s ease, transform 0.16s ease;

  &:hover { background: ${(p) => p.theme.cardHover}; transform: translateY(-2px); }
`;

const CardKicker = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${(p) => p.theme.faint};
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
`;

const AwardDot = styled.span`
  color: ${(p) => p.theme.accent};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.3;

  &.proj { font-size: 1.08rem; }
`;

const CardSub = styled.div`
  margin-top: 0.4rem;
  color: ${(p) => p.theme.muted};
  font-size: 0.9rem;
  line-height: 1.5;
`;

const CardNote = styled.div`
  margin-top: 0.55rem;
  color: ${(p) => p.theme.accent};
  font-size: 0.82rem;
  font-weight: 600;
`;

const CertRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.9rem;
`;

const CertChip = styled.span`
  background: transparent;
  border: 1px solid ${(p) => p.theme.borderStrong};
  color: ${(p) => p.theme.muted};
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.83rem;
  font-weight: 600;
`;

/* ---------- projects ---------- */

const ProjectCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${(p) => p.theme.card};
  border: 1px solid ${(p) => p.theme.border};
  border-radius: 14px;
  overflow: hidden;
  transition: background 0.16s ease, transform 0.16s ease;
  text-decoration: none;
  color: inherit;

  &:hover { background: ${(p) => p.theme.cardHover}; transform: translateY(-3px); }
`;

const ProjectCover = styled.div`
  position: relative;
  height: 118px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${(p) => p.theme.tile}, ${(p) => p.theme.cardHover});

  > span {
    font-size: 2.1rem;
    font-weight: 800;
    color: ${(p) => p.theme.faint};
    letter-spacing: 0.02em;
  }
`;

const ProjectPlay = styled.span`
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${(p) => p.theme.accent};
  color: ${(p) => p.theme.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px ${(p) => p.theme.onAccentGlow};
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.18s ease, transform 0.18s ease;

  ${ProjectCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ProjectBody = styled.div`
  padding: 0.95rem 1.05rem 1.1rem;
`;

const TechRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
`;

const TechChip = styled.span`
  background: ${(p) => p.theme.tile};
  color: ${(p) => p.theme.muted};
  padding: 0.28rem 0.6rem;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 600;
`;

const PageFootnote = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${(p) => p.theme.border};
  color: ${(p) => p.theme.faint};
  font-size: 0.82rem;
`;

/* ---------- player bar ---------- */

const Player = styled.footer`
  position: sticky;
  bottom: 0;
  z-index: 25;
  background: ${(p) => p.theme.elevated};
  border-top: 1px solid ${(p) => p.theme.border};
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.25);
`;

const PlayerInner = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  padding: 0.6rem 1.25rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr auto;
    padding: 0.55rem 0.9rem;
  }
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
`;

const NowArt = styled.div`
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  border-radius: 8px;
  overflow: hidden;
  background: ${(p) => p.theme.accent};
  color: ${(p) => p.theme.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;

  img { width: 100%; height: 100%; object-fit: cover; }
  &[data-play='on'] { box-shadow: 0 0 0 2px ${(p) => p.theme.accent}, 0 0 18px ${(p) => p.theme.onAccentGlow}; }
`;

const NowMeta = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;

  .t {
    font-weight: 700;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .s {
    color: ${(p) => p.theme.muted};
    font-size: 0.78rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const PlayerCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  max-width: 420px;

  @media (max-width: 640px) {
    grid-row: 1;
    grid-column: 2;
    max-width: none;
  }
`;

const Transport = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const TIcon = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  color: ${(p) => p.theme.muted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.16s ease, background 0.16s ease;

  &:hover { color: ${(p) => p.theme.text}; background: ${(p) => p.theme.cardHover}; }

  &.ghost {
    @media (max-width: 640px) { display: none; }
  }
`;

const PlayCircle = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: ${(p) => p.theme.text};
  color: ${(p) => p.theme.bg};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.16s ease;

  &:hover { transform: scale(1.08); }
`;

const ProgressWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;

  .time {
    color: ${(p) => p.theme.faint};
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    width: 1.4rem;
    text-align: center;
    flex: 0 0 auto;
  }

  @media (max-width: 640px) { display: none; }
`;

const ProgressTrack = styled.div`
  flex: 1 1 auto;
  height: 4px;
  border-radius: 3px;
  background: ${(p) => p.theme.borderStrong};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${(p) => p.theme.accent};
  border-radius: 3px;
  transition: width 0.12s linear;
`;

const PlayerRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 640px) { display: none; }
`;

const MiniConnect = styled.a`
  border: 1px solid ${(p) => p.theme.borderStrong};
  color: ${(p) => p.theme.text};
  text-decoration: none;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0.4rem 0.95rem;
  border-radius: 999px;
  transition: border-color 0.16s ease;

  &:hover { border-color: ${(p) => p.theme.text}; }
`;
