import React, { useEffect, useMemo, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { filterActive, formatDateRange } from '../../utils/cvHelpers';

const BLUE = '#1700c7';

function getEntryTitle(entry) {
  return entry?.name || entry?.title || entry?.project || entry?.organization || entry?.company || '';
}

function getEntryUrl(entry) {
  return entry?.url || entry?.website || entry?.link || null;
}

function getEntrySummary(entry) {
  if (entry?.summary) return entry.summary;
  if (entry?.description) return entry.description;
  if (Array.isArray(entry?.highlights) && entry.highlights.length > 0) return entry.highlights[0];
  return '';
}

function getYear(value) {
  if (!value) return '';
  const match = String(value).match(/\d{4}/);
  return match ? match[0] : String(value);
}

function getSocialLabel(item) {
  return item?.network || item?.name || item?.label || 'Link';
}

function getSocialUrl(item) {
  return item?.url || item?.href || null;
}

function SectionList({ title, items, compact = false, renderItem }) {
  if (!items.length) return null;

  return (
    <ContentSection>
      <h2>{title}</h2>
      <hr />
      <article>
        <ul className={compact ? 'tight' : undefined}>
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{renderItem(item, index)}</li>
          ))}
        </ul>
      </article>
    </ContentSection>
  );
}

function ExternalLink({ href, children }) {
  if (!href) return <>{children}</>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function FoldContent({ cv, headline, socials, projects, moreProjects, experience, education, skills, extras }) {
  return (
    <Face>
      <header>
        <h1>
          {cv.name.split(/\s+/).map((part, index) => (
            <React.Fragment key={`${part}-${index}`}>
              {index > 0 && ' '}
              <span>{part}</span>
            </React.Fragment>
          ))}
        </h1>
      </header>

      <Intro>
        <ul>
          {headline && <li>{headline}</li>}
          {cv.location && <li>{cv.location}</li>}
          {cv.email && (
            <li>
              <a href={`mailto:${cv.email}`}>{cv.email}</a>
            </li>
          )}
          {cv.website && (
            <li>
              <ExternalLink href={cv.website}>{cv.website.replace(/^https?:\/\//, '')}</ExternalLink>
            </li>
          )}
          {socials.map((social) => (
            <li key={`${getSocialLabel(social)}-${getSocialUrl(social)}`}>
              <ExternalLink href={getSocialUrl(social)}>{getSocialLabel(social)}</ExternalLink>
            </li>
          ))}
        </ul>
      </Intro>

      {cv.about && (
        <ContentSection>
          <h2>About</h2>
          <hr />
          <article>
            <p>{cv.about}</p>
          </article>
        </ContentSection>
      )}

      <SectionList
        title="Project Shortlist"
        items={projects}
        renderItem={(project) => {
          const title = getEntryTitle(project);
          const summary = getEntrySummary(project);
          return (
            <>
              <ExternalLink href={getEntryUrl(project)}>{title}</ExternalLink>
              {summary && <> &mdash; {summary}</>}
            </>
          );
        }}
      />

      <SectionList
        title="Work Experience"
        items={experience}
        compact
        renderItem={(job) => {
          const dates = formatDateRange(job.startDate, job.endDate);
          return (
            <>
              {dates && <sup>{dates}</sup>}
              {job.company}
              {job.title && <> &mdash; <i>{job.title}</i></>}
            </>
          );
        }}
      />

      <SectionList
        title="More Projects"
        items={moreProjects}
        renderItem={(project) => {
          const title = getEntryTitle(project);
          const summary = getEntrySummary(project);
          const year = getYear(project?.date || project?.start_date || project?.end_date);
          return (
            <>
              {year && <sup>{year}</sup>}
              <ExternalLink href={getEntryUrl(project)}>{title}</ExternalLink>
              {summary && <> &mdash; {summary}</>}
            </>
          );
        }}
      />

      <SectionList
        title="Education"
        items={education}
        compact
        renderItem={(school) => (
          <>
            {getYear(school.end_date || school.start_date) && <sup>{getYear(school.end_date || school.start_date)}</sup>}
            <strong>{school.institution || school.school || school.name}</strong>
            {(school.area || school.degree || school.study_type) && (
              <> &mdash; <i>{school.area || school.degree || school.study_type}</i></>
            )}
          </>
        )}
      />

      <SectionList
        title="Things I Know"
        items={skills}
        renderItem={(skill) => {
          if (typeof skill === 'string') return skill;
          const name = skill.name || skill.category || skill.label;
          const keywords = Array.isArray(skill.keywords) ? skill.keywords.join(', ') : skill.keywords;
          return (
            <>
              <strong>{name}</strong>
              {keywords && <> &mdash; {keywords}</>}
            </>
          );
        }}
      />

      <SectionList
        title="More"
        items={extras}
        renderItem={(entry) => {
          const title = getEntryTitle(entry);
          const summary = getEntrySummary(entry);
          const year = getYear(entry?.date || entry?.start_date || entry?.end_date);
          return (
            <>
              {year && <sup>{year}</sup>}
              <ExternalLink href={getEntryUrl(entry)}>{title}</ExternalLink>
              {summary && <> &mdash; {summary}</>}
            </>
          );
        }}
      />

      <footer>
        <p>*</p>
        <p>Happy to chat, reach out.</p>
        <ul>
          {cv.email && (
            <li>
              <a href={`mailto:${cv.email}`}>Email</a>
            </li>
          )}
          {socials.slice(0, 4).map((social) => (
            <li key={`footer-${getSocialLabel(social)}-${getSocialUrl(social)}`}>
              <ExternalLink href={getSocialUrl(social)}>{getSocialLabel(social)}</ExternalLink>
            </li>
          ))}
        </ul>
      </footer>
    </Face>
  );
}

export function SharonZhengTheme() {
  const cv = useCV();
  const centerContentRef = useRef(null);
  const centerFoldRef = useRef(null);
  const topContentRef = useRef(null);
  const bottomContentRef = useRef(null);

  const data = useMemo(() => {
    const safeCv = cv || {};
    const projects = filterActive(safeCv.projects || []);
    const extras = [
      ...(safeCv.publications || []),
      ...(safeCv.presentations || []),
      ...(safeCv.awards || []),
      ...(safeCv.volunteer || []),
      ...(safeCv.professionalDevelopment || []),
      ...(safeCv.certifications || []),
    ].filter(Boolean);

    return {
      cv: {
        name: safeCv.name || 'Your Name',
        email: safeCv.email,
        website: safeCv.website,
        location: safeCv.location,
        about: safeCv.about,
      },
      headline: safeCv.currentJobTitle || 'Creative Technologist',
      socials: safeCv.socialRaw || [],
      projects: projects.slice(0, 5),
      moreProjects: projects.slice(5, 12),
      experience: (safeCv.experience || []).slice(0, 8),
      education: (safeCv.education || []).slice(0, 4),
      skills: Array.isArray(safeCv.skills) ? safeCv.skills.slice(0, 8) : [],
      extras: extras.slice(0, 8),
    };
  }, [cv]);

  useEffect(() => {
    const centerContent = centerContentRef.current;
    const centerFold = centerFoldRef.current;
    const foldsContent = [
      topContentRef.current,
      centerContentRef.current,
      bottomContentRef.current,
    ].filter(Boolean);

    if (!centerContent || !centerFold || foldsContent.length === 0) {
      return undefined;
    }

    const doc = centerContent.ownerDocument;
    const win = doc.defaultView || window;
    const viewport = win.visualViewport;
    const originalHtmlHeight = doc.documentElement.style.height;
    const originalHtmlOverflow = doc.documentElement.style.overflow;
    const originalBodyHeight = doc.body.style.height;
    const originalBodyOverflow = doc.body.style.overflow;
    let rafId = 0;
    let resizeObserver;

    const clearFoldTransforms = () => {
      foldsContent.forEach((content) => {
        content.style.transform = '';
      });
    };

    const updateBodyHeight = () => {
      const overflowHeight = Math.max(0, centerContent.clientHeight - centerFold.clientHeight);
      const viewportHeight = viewport?.height || win.innerHeight;
      const scrollHeight = `${overflowHeight + viewportHeight}px`;
      doc.documentElement.style.height = scrollHeight;
      doc.documentElement.style.overflow = 'auto';
      doc.body.style.height = scrollHeight;
      doc.body.style.overflow = 'auto';
    };

    const tick = () => {
      const scroll = -(win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0);
      foldsContent.forEach((content) => {
        content.style.transform = `translate3d(0, ${scroll}px, 0)`;
      });
      rafId = win.requestAnimationFrame(tick);
    };

    win.scrollTo(0, 0);
    win.addEventListener('resize', updateBodyHeight);
    viewport?.addEventListener('resize', updateBodyHeight);
    viewport?.addEventListener('scroll', updateBodyHeight);
    if ('ResizeObserver' in win) {
      resizeObserver = new win.ResizeObserver(updateBodyHeight);
      resizeObserver.observe(centerContent);
      resizeObserver.observe(centerFold);
    }
    updateBodyHeight();
    tick();

    return () => {
      win.removeEventListener('resize', updateBodyHeight);
      viewport?.removeEventListener('resize', updateBodyHeight);
      viewport?.removeEventListener('scroll', updateBodyHeight);
      resizeObserver?.disconnect();
      win.cancelAnimationFrame(rafId);
      clearFoldTransforms();
      doc.documentElement.style.height = originalHtmlHeight;
      doc.documentElement.style.overflow = originalHtmlOverflow;
      doc.body.style.height = originalBodyHeight;
      doc.body.style.overflow = originalBodyOverflow;
    };
  }, [data]);

  return (
    <>
      <GlobalStyle />
      <Stage>
        <Wrapper3d>
          <Fold className="fold-top">
            <FoldAlign>
              <div data-sharon-fold-content ref={topContentRef}>
                <FoldContent {...data} />
              </div>
            </FoldAlign>
          </Fold>
          <Fold ref={centerFoldRef}>
            <FoldAlign>
              <div data-sharon-fold-content ref={centerContentRef}>
                <FoldContent {...data} />
              </div>
            </FoldAlign>
          </Fold>
          <Fold className="fold-bottom">
            <FoldAlign>
              <div data-sharon-fold-content ref={bottomContentRef}>
                <FoldContent {...data} />
              </div>
            </FoldAlign>
          </Fold>
        </Wrapper3d>
      </Stage>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    background: ${BLUE};
  }
`;

const Stage = styled.div`
  position: fixed;
  top: var(--app-top-offset, 0px);
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: calc(100dvh - var(--app-top-offset, 0px));
  background: ${BLUE};
  color: #fff;
  font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif;
  font-size: clamp(1.35rem, 2vw, 2rem);
  line-height: 1.15;
`;

const Wrapper3d = styled.div`
  position: relative;
  perspective: 20vw;
  transform-style: preserve-3d;
`;

const Fold = styled.div`
  overflow: hidden;
  width: min(80vw, calc(100vw - 40px));
  height: min(80vh, calc(100dvh - var(--app-top-offset, 0px) - 48px));
  background: ${BLUE};

  &.fold-top {
    transform-origin: bottom center;
    transform: rotateX(-90deg);
  }

  &.fold-bottom {
    transform-origin: top center;
    transform: rotateX(90deg);
  }

  @media (max-width: 767px) {
    width: min(80vw, calc(100vw - 40px));
    height: min(80vh, calc(100dvh - var(--app-top-offset, 0px) - 48px));
  }
`;

const FoldAlign = styled.div`
  width: 100%;
  height: 100%;

  ${Fold}.fold-top & {
    transform: translateY(100%);
  }

  ${Fold}.fold-bottom & {
    transform: translateY(-100%);
  }
`;

const Face = styled.main`
  position: relative;
  min-height: 100%;
  padding: 30px;
  box-sizing: border-box;
  color: #fff;

  * {
    box-sizing: border-box;
  }

  ::selection {
    background: #fff;
    color: ${BLUE};
  }

  header {
    position: relative;
    height: min(88vh, calc(80vh - 60px));
    margin-bottom: 50px;
  }

  h1,
  h2,
  h3,
  h4,
  p {
    margin: 0;
  }

  h1 {
    position: absolute;
    bottom: 0;
    left: 0;
    max-width: 12ch;
    color: #fff;
    font-size: inherit;
    font-weight: 700;
    letter-spacing: 1px;
    line-height: 1.18;
    text-transform: uppercase;
    word-spacing: 28px;
  }

  h1 span {
    border-bottom: 5px solid #fff;
    padding-bottom: 2px;
  }

  h2 {
    margin-top: 120px;
    font-size: inherit;
    font-weight: 700;
  }

  hr {
    border: 0;
    border-top: 1px solid #fff;
    margin: 10px 0;
  }

  a {
    color: #fff;
    text-decoration: none;
    background-image: linear-gradient(#fff, #fff);
    background-position: 0 100%;
    background-repeat: no-repeat;
    background-size: 100% 2px;
    padding-bottom: 1px;
  }

  a[href^='http']::after {
    content: " ->";
    font-size: 0.7em;
    vertical-align: 0.08em;
  }

  ul {
    list-style-type: square;
    margin: 0;
    padding: 0 0 0 1rem;
  }

  li {
    margin: 5px 0 5px -15px;
  }

  section li {
    margin-bottom: 20px;
  }

  .tight li {
    margin-bottom: 10px;
  }

  sup {
    display: inline-block;
    min-width: 3.6em;
    margin-right: 8px;
    font-size: 0.6em;
    line-height: 0;
    vertical-align: super;
  }

  footer {
    margin: 100px 0 200px;
    padding-bottom: 300px;
  }
`;

const Intro = styled.article`
  margin-bottom: 50px;
`;

const ContentSection = styled.section`
  margin-bottom: 50px;
`;
