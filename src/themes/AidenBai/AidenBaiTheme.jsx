import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { useCV } from '../../contexts/ConfigContext';
import { parseMarkdown } from '../../utils/parseMarkdown';
import { withBase } from '../../utils/assetPath';

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
}

function normalizeUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) return url;
  return `https://${url}`;
}

function getRole(job) {
  return firstNonEmpty(
    job.position,
    job.title,
    job.positions?.[0]?.title,
  );
}

function getJobDetail(job) {
  return firstNonEmpty(
    job.summary,
    job.highlights?.[0],
    job.positions?.[0]?.highlights?.[0],
  );
}

function joinSeries(items) {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function makeLore(cv, data) {
  const paragraphs = [];
  const [primaryWork] = data.experience;
  const education = (cv.education || [])[0];
  const publication = (cv.publications || []).find((item) => item.title || item.name);
  const presentation = (cv.presentations || []).find((item) => item.name || item.title);
  const award = (cv.awards || []).find((item) => item.name || item.title);
  const study = education
    ? firstNonEmpty(
      [education.studyType, education.area].filter(Boolean).join(' in '),
      education.area,
      education.studyType,
    )
    : '';
  const role = primaryWork ? getRole(primaryWork) : '';

  if (education?.institution || primaryWork?.company) {
    paragraphs.push(
      <>
        {education?.institution ? <>I studied{study ? ` ${study}` : ''} at <InlineLink href={education.url}>{education.institution}</InlineLink></> : 'I studied environmental research'}
        {primaryWork?.company ? <> and now work{role ? ` as ${role}` : ''} at <InlineLink href={primaryWork.url}>{primaryWork.company}</InlineLink></> : ''}.
      </>
    );
  }

  if (data.projects.length > 0) {
    const projectNames = data.projects.map((project) => project.name).filter(Boolean).slice(0, 3);
    paragraphs.push(<>I&apos;ve built {joinSeries(projectNames)}.</>);
  }

  if (publication || presentation) {
    paragraphs.push(<>My research work focuses on air quality, road dust, black carbon, and particulate matter.</>);
  }

  if (award) {
    paragraphs.push(
      <>
        Along the way, I&apos;ve received recognition including {award.name || award.title}.
      </>
    );
  }

  return paragraphs.slice(0, 3);
}

function InlineLink({ href, children }) {
  if (!href) return children;
  const isExternal = /^https?:\/\//i.test(href);
  return (
    <TextLink href={normalizeUrl(href)} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined}>
      {children}
      {isExternal && <SmallExternal aria-hidden="true" size={12} strokeWidth={2} />}
    </TextLink>
  );
}

function cleanupReactGrab() {
  document
    .querySelectorAll('#aiden-react-grab-script, #aiden-react-grab-visual-edit, script[data-aiden-react-grab="true"]')
    .forEach((node) => node.remove());

  document
    .querySelectorAll('[id*="react-grab" i], [class*="react-grab" i], [id*="visual-edit" i], [class*="visual-edit" i], [data-react-grab]')
    .forEach((node) => node.remove());

  ['__REACT_GRAB__', '__REACT_GRAB_MODULE__'].forEach((key) => {
    try {
      delete window[key];
    } catch {
      window[key] = undefined;
    }
  });
}

function SpeedHover() {
  const [hovered, setHovered] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [hue, setHue] = useState(0);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const intervalRef = useRef(null);

  const showSonic = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        left: rect.left + rect.width / 2,
        top: rect.top - 8,
      });
    }
    setHovered(true);
  };

  const hideSonic = () => {
    setHovered(false);
  };

  useEffect(() => {
    if (hovered) {
      intervalRef.current = window.setInterval(() => {
        setRotation((value) => value * 1.02 + 0.3);
        setScale((value) => value * 1.005);
        setHue((value) => (value + 2) % 360);
      }, 16);
    } else {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRotation(0);
      setScale(1);
      setHue(0);
    }

    return () => {
      window.clearInterval(intervalRef.current);
    };
  }, [hovered]);

  useEffect(() => {
    if (!hovered) return undefined;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          left: rect.left + rect.width / 2,
          top: rect.top - 8,
        });
      }
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [hovered]);

  return (
    <SpeedWrap
      ref={triggerRef}
      onMouseEnter={showSonic}
      onMouseLeave={hideSonic}
      onFocus={showSonic}
      onBlur={hideSonic}
      tabIndex={0}
      aria-label="speed"
    >
      <Shimmer>speed</Shimmer>
      {hovered && position && createPortal(
        <Sonic
          src={withBase('aiden-bai/sonic.webp')}
          alt=""
          aria-hidden="true"
          style={{
            left: position.left,
            top: position.top,
            transform: `translate(-50%, -100%) rotate(${rotation}deg) scale(${scale})`,
            filter: `hue-rotate(${hue}deg)`,
          }}
        />,
        document.body,
      )}
    </SpeedWrap>
  );
}

export function AidenBaiTheme({ darkMode }) {
  const cv = useCV();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    cleanupReactGrab();

    const scripts = [
      {
        id: 'aiden-react-grab-script',
        src: 'https://www.react-grab.com/script.js',
        crossOrigin: 'anonymous',
      },
      {
        id: 'aiden-react-grab-visual-edit',
        src: 'https://unpkg.com/@react-grab/visual-edit/dist/client.global.js',
      },
    ];

    const created = [];
    scripts.forEach(({ id, src, crossOrigin }) => {
      if (document.getElementById(id)) return;
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.dataset.aidenReactGrab = 'true';
      if (crossOrigin) script.crossOrigin = crossOrigin;
      document.head.appendChild(script);
      created.push(script);
    });

    return () => {
      cleanupReactGrab();
    };
  }, []);

  const data = useMemo(() => {
    if (!cv) return null;

    const projects = (cv.projects || []).slice(0, 5);
    const experience = (cv.experience || []).slice(0, 4);
    const socialItems = [
      cv.website && { label: 'site', href: cv.website },
      cv.socialLinks?.github && { label: 'github', href: cv.socialLinks.github },
      cv.socialLinks?.linkedin && { label: 'linkedin', href: cv.socialLinks.linkedin },
      cv.socialLinks?.twitter && { label: 'x', href: cv.socialLinks.twitter },
      cv.email && { label: 'email', href: `mailto:${cv.email}` },
    ].filter(Boolean);

    return { projects, experience, socialItems };
  }, [cv]);

  if (!cv || !data) return null;

  const primaryProject = data.projects[0];
  const primaryWork = data.experience[0];
  const primaryThing = primaryProject?.name || primaryWork?.company || cv.currentJobTitle || 'useful things';
  const locationText = cv.location ? ` based in ${cv.location}` : '';
  const roleText = cv.currentJobTitle || getRole(primaryWork) || 'builder';
  const lore = makeLore(cv, data);

  return (
    <Page $darkMode={darkMode}>
      <Main>
        <Fade style={{ '--delay': 0 }}>
          <Title>{cv.name || 'Your Name'}</Title>
        </Fade>

        <Fade style={{ '--delay': 1 }}>
          <Paragraph>
            I&apos;m building{' '}
            <InlineLink href={primaryProject?.url || primaryWork?.url}>{primaryThing}</InlineLink>
            {locationText}.
          </Paragraph>
        </Fade>

        <Fade style={{ '--delay': 2 }}>
          <Paragraph>
            I work as a <InlineEmphasis>{roleText}</InlineEmphasis>
            {primaryWork?.company && (
              <>
                {' '}at <InlineLink href={primaryWork.url}>{primaryWork.company}</InlineLink>
              </>
            )}
            . {cv.about ? parseMarkdown(cv.about) : 'Most of my work is about making technology feel direct, fast, and useful.'}
          </Paragraph>
        </Fade>

        {data.projects.length > 0 && (
          <Fade style={{ '--delay': 3 }}>
            <Paragraph>
              Recent projects include{' '}
              {data.projects.slice(0, 3).map((project, index, arr) => (
                <React.Fragment key={project.name || index}>
                  <InlineLink href={project.url}>{project.name}</InlineLink>
                  {index < arr.length - 2 ? ', ' : index === arr.length - 2 ? ', and ' : ''}
                </React.Fragment>
              ))}
              .
            </Paragraph>
          </Fade>
        )}

        <Fade style={{ '--delay': 4 }}>
          <Paragraph>
            I care a great deal about <SpeedHover />. Clear interfaces and fast feedback loops make good work easier to reach.
          </Paragraph>
        </Fade>

        <Fade style={{ '--delay': 5 }}>
          <Toggle type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            <span>lore</span>
            <Chevron $expanded={expanded} size={14} strokeWidth={2} aria-hidden="true" />
          </Toggle>
        </Fade>

        <Lore $expanded={expanded} aria-hidden={!expanded}>
          <LoreInner>
            {lore.map((item, index) => (
              <Paragraph key={index}>{item}</Paragraph>
            ))}
          </LoreInner>
        </Lore>

        <Fade style={{ '--delay': 6 }}>
          <Paragraph>
            Hit me up{' '}
            {data.socialItems.map((item, index) => (
              <React.Fragment key={item.label}>
                <InlineLink href={item.href}>{item.label}</InlineLink>
                {index < data.socialItems.length - 2 ? ', ' : index === data.socialItems.length - 2 ? ' or ' : ''}
              </React.Fragment>
            ))}
            .
          </Paragraph>
        </Fade>

        <Fade style={{ '--delay': 7 }}>
          <Rule />
        </Fade>
      </Main>
    </Page>
  );
}

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  background: ${({ $darkMode }) => ($darkMode ? '#0c0a09' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#e7e5e4' : '#1c1917')};
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 430;
  letter-spacing: 0;
  line-height: 1.625;
  transition: background 180ms ease, color 180ms ease;
`;

const Main = styled.main`
  width: 100%;
  max-width: 600px;
  padding: 64px 20px 160px;

  @media (min-width: 1024px) {
    padding-left: 40px;
    padding-right: 40px;
  }
`;

const Fade = styled.div`
  opacity: 0;
  animation: ${fadeUp} 480ms cubic-bezier(.32,.72,0,1) forwards;
  animation-delay: calc(var(--delay, 0) * 70ms);
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-family: Iowan Old Style, Georgia, Cambria, "Times New Roman", serif;
  font-size: 18px;
  line-height: 1.75;
  font-weight: 600;
`;

const Paragraph = styled.p`
  margin: 0 0 8px;
  font-size: 16px;
`;

const TextLink = styled.a`
  color: inherit;
  text-decoration-line: underline;
  text-decoration-color: ${({ theme }) => theme?.aidenLink || '#d6d3d1b3'};
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: text-decoration-color 150ms ease, color 150ms ease;

  &:hover {
    text-decoration-color: currentColor;
  }
`;

const SmallExternal = styled(ExternalLink)`
  display: inline-block;
  margin-left: 4px;
  vertical-align: -1px;
`;

const InlineEmphasis = styled.span`
  font-weight: 500;
`;

const Shimmer = styled.span`
  display: inline-block;
  font-weight: 500;
  color: currentColor;
  background: linear-gradient(90deg, currentColor 0% 40%, #a8a29e 50%, currentColor 60% 100%) 0 0 / 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
`;

const SpeedWrap = styled.span`
  position: relative;
  display: inline-block;
  cursor: pointer;
  outline: none;

  &:focus-visible {
    border-radius: 4px;
    box-shadow: 0 0 0 2px currentColor;
  }
`;

const Sonic = styled.img`
  position: fixed;
  z-index: 2147483647;
  width: 64px;
  height: auto;
  pointer-events: none;
  transform-origin: center;
  will-change: transform, filter;
`;

const Toggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 8px;
  padding: 0;
  color: #a6a09b;
  background: transparent;
  border: 0;
  cursor: pointer;
  font: inherit;
  letter-spacing: 0;
`;

const Chevron = styled(ChevronRight)`
  flex: 0 0 auto;
  transform: rotate(${({ $expanded }) => ($expanded ? 90 : 0)}deg);
  transition: transform 150ms ease;
`;

const Lore = styled.div`
  overflow: hidden;
  max-height: ${({ $expanded }) => ($expanded ? '1200px' : '0')};
  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  transition: max-height 250ms cubic-bezier(.32,.72,0,1), opacity 220ms ease;
`;

const LoreInner = styled.div`
  margin: 0 0 8px;
  padding: 4px 0 0 12px;
  border-left: 1px solid #e7e5e4;
`;

const Rule = styled.hr`
  width: 48px;
  margin: 8px 0 24px;
  border: 0;
  border-top: 1px solid #e7e5e4;
`;
