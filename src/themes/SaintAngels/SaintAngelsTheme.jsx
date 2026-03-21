import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background:
      radial-gradient(circle at top, rgba(255, 216, 222, 0.28), transparent 32%),
      #f6f3ee;
    color: #111;
    font-family: Verdana, Geneva, sans-serif;
  }

  a {
    color: #0047ff;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  a:hover {
    background: #dcdcdc;
  }
`;

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function formatLongDate(value) {
  if (!value) return '';
  if (isPresent(value)) return 'Present';

  const [year, month] = String(value).split('-');
  if (!year) return '';
  if (!month) return year;

  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date);
}

function formatRange(startDate, endDate) {
  const start = formatLongDate(startDate);
  const end = formatLongDate(endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
}

function pickHighlights(items = [], limit = 3) {
  return items.filter(Boolean).slice(0, limit);
}

function makeHomeBlurb(cv) {
  const parts = [];
  if (cv.currentJobTitle) {
    parts.push(`I'm ${cv.currentJobTitle.toLowerCase()}`);
  }
  if (cv.location) {
    parts.push(`based in ${cv.location}`);
  }
  if (!parts.length) {
    return `I'm ${cv.name || 'a builder'} with a mix of technical, research, and community work.`;
  }
  return `I'm ${cv.name || 'a builder'}, ${parts.join(' ')}.`;
}

function useWireCube(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let frameId = 0;
    let angle = 0;

    const vertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const rotate = ([x, y, z], ax, ay) => {
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);
      const cosY = Math.cos(ay);
      const sinY = Math.sin(ay);

      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      return [x2, y1, z2];
    };

    const resize = () => {
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 300;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawDuck = (cx, cy, scale) => {
      context.save();
      context.translate(cx, cy);
      context.scale(scale, scale);
      context.lineWidth = 2;
      context.strokeStyle = '#111';
      context.fillStyle = '#fffdf7';

      context.beginPath();
      context.ellipse(0, 12, 34, 24, 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      context.beginPath();
      context.arc(18, -6, 16, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      context.beginPath();
      context.moveTo(30, -5);
      context.lineTo(52, 2);
      context.lineTo(30, 9);
      context.closePath();
      context.fillStyle = '#ffb480';
      context.fill();
      context.stroke();

      context.fillStyle = '#111';
      context.beginPath();
      context.arc(23, -9, 2.5, 0, Math.PI * 2);
      context.fill();

      context.restore();
    };

    const render = () => {
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 300;
      context.clearRect(0, 0, width, height);

      const projected = vertices.map((vertex) => {
        const [x, y, z] = rotate(vertex, angle * 0.8, angle);
        const depth = z + 4;
        const scale = 110 / depth;
        return {
          x: x * scale + width / 2,
          y: y * scale + height / 2,
        };
      });

      context.strokeStyle = '#ff9baa';
      context.lineWidth = 1.2;
      edges.forEach(([from, to]) => {
        context.beginPath();
        context.moveTo(projected[from].x, projected[from].y);
        context.lineTo(projected[to].x, projected[to].y);
        context.stroke();
      });

      drawDuck(width / 2, height / 2 + 4, Math.min(width / 600, 1));
      angle += 0.01;
      frameId = window.requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}

function HomeSection({ cv, featuredProject, socialLinks }) {
  const infoLines = [
    cv.about,
    makeHomeBlurb(cv),
    'This theme borrows the spare structure of the original site and remaps it to resume content.',
  ].filter(Boolean);

  return (
    <>
      <CanvasWrap>
        <WireCubeCanvas />
      </CanvasWrap>
      {infoLines.map((line) => (
        <Paragraph key={line}>{line}</Paragraph>
      ))}
      {featuredProject && (
        <FeatureCard>
          <FeatureLabel>Latest project</FeatureLabel>
          <FeatureTitle>
            {featuredProject.url ? (
              <a href={featuredProject.url} target="_blank" rel="noopener noreferrer">
                {featuredProject.name}
              </a>
            ) : (
              featuredProject.name
            )}
          </FeatureTitle>
          {featuredProject.summary && <Paragraph>{featuredProject.summary}</Paragraph>}
          <Muted>{featuredProject.date || 'Recent work'}</Muted>
        </FeatureCard>
      )}
      {socialLinks.length > 0 && (
        <FooterLinks>
          {socialLinks.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </FooterLinks>
      )}
    </>
  );
}

function WritingSection({ items }) {
  return (
    <>
      <PageTitle>Notes</PageTitle>
      <Paragraph>
        A catch-all for research, talks, awards, and professional development. The original site used
        essays here; this version adapts that idea to the sections available in your CV.
      </Paragraph>
      <SquareList>
        {items.map((item) => (
          <li key={item.key}>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            ) : (
              item.title
            )}
            {item.date && <MutedInline>, {item.date}</MutedInline>}
            {item.meta && <MetaBlock>{item.meta}</MetaBlock>}
          </li>
        ))}
      </SquareList>
    </>
  );
}

function ProjectsSection({ items }) {
  return (
    <>
      <PageTitle>Projects</PageTitle>
      <SquareList>
        {items.map((project) => (
          <li key={project.name}>
            {project.url ? (
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.name}
              </a>
            ) : (
              project.name
            )}
            {project.date && <MutedInline>, {project.date}</MutedInline>}
            {project.summary && <MetaBlock>{project.summary}</MetaBlock>}
          </li>
        ))}
      </SquareList>
    </>
  );
}

function ExperienceSection({ experience, volunteer }) {
  return (
    <>
      <PageTitle>Experience</PageTitle>
      <EntryList>
        {experience.map((item) => (
          <Entry key={`${item.company}-${item.title}-${item.startDate || ''}`}>
            <EntryTitle>{item.title}</EntryTitle>
            <EntryMeta>
              {item.company}
              {itemRange(item) ? `, ${itemRange(item)}` : ''}
            </EntryMeta>
            {pickHighlights(item.highlights, 2).map((highlight) => (
              <Paragraph key={highlight}>{highlight}</Paragraph>
            ))}
          </Entry>
        ))}
      </EntryList>

      {volunteer.length > 0 && (
        <>
          <Subheading>Volunteer</Subheading>
          <EntryList>
            {volunteer.map((item) => (
              <Entry key={`${item.company}-${item.title}-${item.startDate || ''}`}>
                <EntryTitle>{item.title}</EntryTitle>
                <EntryMeta>
                  {item.company}
                  {itemRange(item) ? `, ${itemRange(item)}` : ''}
                </EntryMeta>
              </Entry>
            ))}
          </EntryList>
        </>
      )}
    </>
  );
}

function itemRange(item) {
  return formatRange(item.startDate, item.endDate);
}

function EducationSection({ education, skills, contact }) {
  return (
    <>
      <PageTitle>Education</PageTitle>
      <EntryList>
        {education.map((item) => (
          <Entry key={`${item.institution}-${item.degree}-${item.startDate || ''}`}>
            <EntryTitle>{item.degree}{item.area ? `, ${item.area}` : ''}</EntryTitle>
            <EntryMeta>
              {item.institution}
              {itemRange(item) ? `, ${itemRange(item)}` : ''}
            </EntryMeta>
            {pickHighlights(item.highlights, 1).map((highlight) => (
              <Paragraph key={highlight}>{highlight}</Paragraph>
            ))}
          </Entry>
        ))}
      </EntryList>

      {skills.length > 0 && (
        <>
          <Subheading>Skills</Subheading>
          <Paragraph>{skills.join(', ')}</Paragraph>
        </>
      )}

      {contact.length > 0 && (
        <>
          <Subheading>Links</Subheading>
          <FooterLinks>
            {contact.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </FooterLinks>
        </>
      )}
    </>
  );
}

function WireCubeCanvas() {
  const canvasRef = useRef(null);
  useWireCube(canvasRef);
  return <Canvas ref={canvasRef} aria-hidden="true" />;
}

export function SaintAngelsTheme() {
  const cv = useCV();
  const [page, setPage] = useState('home');

  const pages = useMemo(() => ([
    { id: 'home', label: 'Home' },
    { id: 'writing', label: 'Notes' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
  ]), []);

  const socialLinks = useMemo(() => {
    const items = [];
    if (cv?.website) items.push({ label: 'website', url: cv.website });
    if (cv?.socialLinks?.github) items.push({ label: 'github', url: cv.socialLinks.github });
    if (cv?.socialLinks?.linkedin) items.push({ label: 'linkedin', url: cv.socialLinks.linkedin });
    if (cv?.socialLinks?.twitter) items.push({ label: 'twitter', url: cv.socialLinks.twitter });
    if (cv?.email) items.push({ label: 'email', url: `mailto:${cv.email}` });
    return items;
  }, [cv]);

  const noteItems = useMemo(() => {
    if (!cv) return [];

    const publications = (cv.publications || []).map((item, index) => ({
      key: `publication-${index}`,
      title: item.name || item.title,
      url: item.url,
      date: item.date || formatRange(item.startDate, item.endDate),
      meta: item.publisher || item.summary || '',
    }));

    const presentations = (cv.presentations || []).map((item, index) => ({
      key: `presentation-${index}`,
      title: item.name || item.title,
      url: item.url,
      date: item.date || formatRange(item.startDate, item.endDate),
      meta: item.location || item.summary || '',
    }));

    const awards = (cv.awards || []).map((item, index) => ({
      key: `award-${index}`,
      title: item.name || item.title,
      url: item.url,
      date: item.date || formatRange(item.startDate, item.endDate),
      meta: item.awarder || item.summary || '',
    }));

    const development = (cv.professionalDevelopment || []).map((item, index) => ({
      key: `development-${index}`,
      title: item.name || item.title,
      url: item.url,
      date: item.date || formatRange(item.startDate, item.endDate),
      meta: item.location || item.summary || '',
    }));

    return [...publications, ...presentations, ...awards, ...development];
  }, [cv]);

  if (!cv) return null;

  const featuredProject = cv.projects?.[0];

  return (
    <>
      <GlobalStyle />
      <PageShell>
        <Layout>
          <SideNav aria-label="Theme navigation">
            {pages.map((item) => (
              <NavLink
                key={item.id}
                type="button"
                $active={page === item.id}
                onClick={() => setPage(item.id)}
              >
                {item.label}
              </NavLink>
            ))}
          </SideNav>

          <ContentWrap>
            <MainPanel>
              {page === 'home' && (
                <HomeSection cv={cv} featuredProject={featuredProject} socialLinks={socialLinks} />
              )}
              {page === 'writing' && <WritingSection items={noteItems} />}
              {page === 'projects' && <ProjectsSection items={cv.projects || []} />}
              {page === 'experience' && (
                <ExperienceSection
                  experience={cv.experience || []}
                  volunteer={cv.volunteer || []}
                />
              )}
              {page === 'education' && (
                <EducationSection
                  education={cv.education || []}
                  skills={cv.skills || []}
                  contact={socialLinks}
                />
              )}
            </MainPanel>

            <FooterPanel>
              <span>{cv.name}</span>
              {cv.currentJobTitle && <span>{cv.currentJobTitle}</span>}
            </FooterPanel>
          </ContentWrap>
        </Layout>
      </PageShell>
    </>
  );
}

const PageShell = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px 16px;
`;

const Layout = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const panelBorder = '1px solid rgba(0, 0, 0, 0.2)';

const SideNav = styled.nav`
  width: 112px;
  border: ${panelBorder};
  border-right: none;
  padding: 10px 0;
  background: rgba(255, 255, 255, 0.78);

  @media (max-width: 768px) {
    width: 100%;
    border-right: ${panelBorder};
    border-bottom: none;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
  }
`;

const NavLink = styled.button`
  display: block;
  width: 100%;
  border: none;
  background: ${(props) => (props.$active ? '#dcdcdc' : 'transparent')};
  color: #0047ff;
  text-align: left;
  font: inherit;
  font-family: Tahoma, Geneva, sans-serif;
  font-size: 1em;
  padding: 6px 0 6px 5px;
  text-transform: capitalize;
  cursor: pointer;

  &:hover {
    background: #dcdcdc;
  }

  @media (max-width: 768px) {
    width: auto;
    padding: 6px 10px;
  }
`;

const ContentWrap = styled.div`
  width: 100%;
  max-width: 600px;
`;

const MainPanel = styled.main`
  min-height: 600px;
  border: ${panelBorder};
  padding: 0 10px 40px;
  background: rgba(255, 255, 255, 0.82);

  @media (max-width: 768px) {
    min-height: auto;
    padding: 0 20px 40px;
  }
`;

const FooterPanel = styled.footer`
  margin-top: 10px;
  border: ${panelBorder};
  padding: 10px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.82);
`;

const CanvasWrap = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  margin: 0 auto;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const PageTitle = styled.h1`
  margin: 24px 0 18px;
  font-family: 'Times New Roman', Times, serif;
  font-size: 42px;
  font-weight: 400;
`;

const Subheading = styled.h2`
  margin: 28px 0 12px;
  font-family: 'Times New Roman', Times, serif;
  font-size: 26px;
  font-weight: 400;
`;

const Paragraph = styled.p`
  margin: 0 0 14px;
  line-height: 1.55;
`;

const Muted = styled.div`
  color: #999;
`;

const MutedInline = styled.span`
  color: #999;
`;

const SquareList = styled.ul`
  margin: 0;
  padding-left: 28px;
  list-style-type: square;

  li {
    margin-bottom: 10px;
  }
`;

const MetaBlock = styled.div`
  margin-top: 4px;
  color: #333;
`;

const EntryList = styled.div`
  display: grid;
  gap: 18px;
`;

const Entry = styled.article``;

const EntryTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
`;

const EntryMeta = styled.div`
  margin-bottom: 8px;
  color: #666;
`;

const FeatureCard = styled.section`
  margin-top: 20px;
  margin-bottom: 14px;
`;

const FeatureLabel = styled.div`
  margin-bottom: 6px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
`;

const FeatureTitle = styled.h2`
  margin: 0 0 8px;
  font-family: 'Times New Roman', Times, serif;
  font-size: 30px;
  font-weight: 400;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
`;
