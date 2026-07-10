import styled from 'styled-components';
import { MotionConfig, motion } from 'framer-motion';
import { useCV } from '../../contexts/ConfigContext';
import { formatRange, getInitials } from '../../utils/cvHelpers';
import mekLandscapeMountain from './assets/mek-landscape-mountain.png';
import mekLandscapeStone from './assets/mek-landscape-stone.png';
import mekPortrait from './assets/mek-pixel-portrait.gif';
import mekSans from './assets/MEKSans-Regular.woff2';
import mekZantine from './assets/MEKZANTINE-Regular.woff2';

const EMPTY = [];

export function MekGalleryTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const name = cv.name || 'Your Name';
  const role = cv.currentJobTitle || cv.label || 'visual researcher and developer';
  const projects = cv.projects || EMPTY;
  const experience = cv.experience || EMPTY;
  const featured = projects[0];
  const secondary = projects[1];
  const recentItems = Array.from({ length: 5 }, (_, index) => {
    const project = projects[index];
    const job = experience[index - projects.length];
    return {
      meta: `${project?.date || job?.startDate || 'NOW'} / ${['DEV', 'PIXEL', 'DESIGN'][index % 3]}`,
      title: project?.name || job?.company || role,
    };
  });

  return (
    <MotionConfig reducedMotion="user">
      <Page $dark={darkMode}>
        <Toolbar>
        <PixelMark aria-label={`${name} home`} href="#top">
          <span>×+×</span><span>+×+</span><span>×+×</span>
        </PixelMark>
        <Tabs aria-label="Sections">
          <a href="#about">About</a>
          <a href="#work">Pixel</a>
          <a href="#work">Design</a>
          <a href="#index">Dev</a>
        </Tabs>
        <Wordmark>{getInitials(name, 3, 'CV')}.TXT</Wordmark>
        <ModeButton type="button" onClick={() => onDarkModeChange?.(!darkMode)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
          {darkMode ? '☀' : '◐'}
        </ModeButton>
      </Toolbar>

      <IntroStrip id="about">
        <PixelPortrait aria-hidden="true">
          <img src={mekPortrait} alt="" />
        </PixelPortrait>
        <Bio>
          <strong>{name}, also known as {getInitials(name, 3, 'YN')}.txt</strong>
          <span>{cv.about || `is a ${role.toLowerCase()} based in ${cv.location || 'the world'}.`}</span>
        </Bio>
        <ArrowCell><small>Recent</small><span>→</span></ArrowCell>
        {recentItems.map((item, index) => (
          <TickerCell key={`${item.title}-${index}`}><small>{item.meta}</small><strong>{item.title}</strong></TickerCell>
        ))}
      </IntroStrip>

      <FeatureHeader id="work">
        <FeatureLead>
          <FeatureDate>{featured?.date || 'Current'} / Pixel</FeatureDate>
          <FeatureTitle initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {featured?.name || 'Selected explorations'}
          </FeatureTitle>
        </FeatureLead>
        <FeatureDescription><span>{featured?.summary || 'A collection of projects, systems, and ongoing experiments.'}</span></FeatureDescription>
        <FeatureLead>
          <FeatureDate>{secondary?.date || 'Archive'} / Design</FeatureDate>
          <FeatureTitle initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            {secondary?.name || role}
          </FeatureTitle>
        </FeatureLead>
        <FeatureDescription><span>{secondary?.summary || `Selected work by ${name}.`}</span></FeatureDescription>
      </FeatureHeader>

      <ColorField aria-hidden="true">
        <FieldOne>
          <PixelLandscape src={mekLandscapeMountain} alt="" draggable="false" />
        </FieldOne>
        <FieldTwo>
          <PixelLandscape src={mekLandscapeStone} alt="" draggable="false" />
        </FieldTwo>
      </ColorField>

      <ProjectSection>
        <SectionBar><span>PROJECT INDEX</span><span>{String(projects.length).padStart(2, '0')} ITEMS</span></SectionBar>
        <ProjectGrid>
          {projects.slice(0, 8).map((project, index) => (
            <ProjectCell
              key={`${project.name}-${index}`}
              href={project.url || undefined}
              target={project.url ? '_blank' : undefined}
              rel={project.url ? 'noopener noreferrer' : undefined}
              $tone={index % 4}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: Math.min(index, 4) * 0.04 }}
              whileHover={{ filter: 'brightness(1.1)', boxShadow: '8px 8px 0 rgba(0,0,0,.25)', zIndex: 2 }}
              whileTap={{ scale: 0.99 }}
            >
              <ProjectMeta><span>{project.date || 'Archive'}</span><span>{index % 2 ? 'DESIGN' : 'DEV'}</span></ProjectMeta>
              <h2>{project.name || 'Untitled project'}</h2>
              <p>{project.summary || 'Selected work from the portfolio archive.'}</p>
              <ProjectNumber>{String(index + 1).padStart(2, '0')} ↗</ProjectNumber>
            </ProjectCell>
          ))}
        </ProjectGrid>
      </ProjectSection>

      <IndexSection id="index">
        <SectionBar><span>EXPERIENCE RECORDS</span><span>{String(experience.length).padStart(2, '0')} ROWS</span></SectionBar>
        {experience.slice(0, 8).map((item, index) => (
          <ExperienceRow key={`${item.company}-${item.title}-${index}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{item.title}</h3>
            <strong>{item.company}</strong>
            <p>{item.highlights?.[0]}</p>
            <time>{formatRange(item.startDate, item.endDate, { month: 'none', ongoingWhenNoEnd: true, presentLabel: 'NOW' })}</time>
          </ExperienceRow>
        ))}
      </IndexSection>

      <Footer id="contact">
        <FooterTitle>LET’S MAKE<br />SOMETHING.</FooterTitle>
        <FooterLinks>
          {cv.email && <a href={`mailto:${cv.email}`}>{cv.email} ↗</a>}
          {cv.website && <a href={cv.website} target="_blank" rel="noopener noreferrer">Website ↗</a>}
          {(cv.social || EMPTY).slice(0, 4).map((item) => <a key={item.network} href={item.url} target="_blank" rel="noopener noreferrer">{item.network} ↗</a>)}
        </FooterLinks>
        <FooterNote>© {new Date().getFullYear()} {name}<br />Built from CV.yaml</FooterNote>
      </Footer>
      </Page>
    </MotionConfig>
  );
}

const Page = styled.div`
  @font-face {
    font-family: "MEK Sans";
    src: url(${mekSans}) format("woff2");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }

  @font-face {
    font-family: "MEKZANTINE";
    src: url(${mekZantine}) format("woff2");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }

  --paper: ${({ $dark }) => $dark ? '#171714' : '#eee9dc'};
  --paper2: ${({ $dark }) => $dark ? '#22221e' : '#d9d2c1'};
  --ink: ${({ $dark }) => $dark ? '#e8e3d7' : '#45423e'};
  --muted: ${({ $dark }) => $dark ? '#9f9b92' : '#858077'};
  --line: ${({ $dark }) => $dark ? '#4b4942' : '#b6afa0'};
  --purple: ${({ $dark }) => $dark ? '#27243c' : '#232037'};
  --ochre: ${({ $dark }) => $dark ? '#8d5b32' : '#b87d40'};
  --sage: ${({ $dark }) => $dark ? '#465951' : '#708479'};
  --red: ${({ $dark }) => $dark ? '#71333d' : '#9f4450'};

  width: 100%;
  min-height: 100%;
  color: var(--ink);
  background: var(--paper);
  font-family: "MEK Sans", monospace;

  *, *::before, *::after { box-sizing: border-box; }
  a { color: inherit; }
`;

const Toolbar = styled.header`
  min-height: 42px;
  display: grid;
  grid-template-columns: 40px auto 1fr 42px;
  border-bottom: 1px solid var(--line);
  background: var(--paper2);
`;

const PixelMark = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--line);
  font: 400 8px/.62 "MEK Sans", monospace;
  text-decoration: none;
`;

const Tabs = styled.nav`
  min-width: 0;
  display: flex;
  overflow-x: auto;

  a { min-width: 78px; padding: 0 16px; display: grid; place-items: center; border-right: 1px solid var(--line); font: 400 14px/1 "MEK Sans", monospace; text-transform: uppercase; text-decoration: none; }
  a:hover { background: var(--paper); }

  @media (max-width: 600px) { a { min-width: auto; padding: 0 11px; } }
`;

const Wordmark = styled.div`
  align-self: center;
  justify-self: end;
  padding-right: 16px;
  color: var(--muted);
  font: 400 14px/1 "MEK Sans", monospace;

  @media (max-width: 690px) { display: none; }
`;

const ModeButton = styled.button`
  border: 0;
  border-left: 1px solid var(--line);
  color: var(--ink);
  background: transparent;
  cursor: pointer;
`;

const IntroStrip = styled.section`
  height: 112px;
  display: grid;
  grid-template-columns: 100px 294px 68px repeat(5, minmax(0, 1fr));
  border-bottom: 1px solid var(--line);
  background: var(--paper2);

  > * { border-right: 1px solid var(--line); }
  > *:last-child { border-right: 0; }

  @media (max-width: 1100px) {
    grid-template-columns: 100px minmax(260px, 1fr) 68px repeat(2, minmax(150px, .8fr));
    > *:nth-child(n + 6) { display: none; }
  }

  @media (max-width: 720px) {
    height: 112px;
    grid-template-columns: 88px 1fr 44px;
    > *:nth-child(n + 4) { display: none; }
  }
`;

const PixelPortrait = styled.div`
  margin: 6px;
  overflow: hidden;
  background: var(--ink);

  img { width: 100%; height: 100%; display: block; object-fit: cover; image-rendering: pixelated; }
`;

const Bio = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font: 400 14px/1.12 "MEK Sans", monospace;

  strong, span { max-width: 270px; }
  span { margin-top: 3px; color: var(--muted); }
`;

const ArrowCell = styled.div`
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  color: var(--muted);
  font: 400 18px/1 "MEK Sans", monospace;

  small { font-size: 12px; text-transform: uppercase; }
`;

const TickerCell = styled.div`
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  small { color: var(--muted); font: 400 12px/1 "MEK Sans", monospace; text-transform: uppercase; }
  strong { font: 400 14px/1.1 "MEK Sans", monospace; text-transform: uppercase; }
`;

const FeatureHeader = styled.section`
  height: 120px;
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr;
  border-bottom: 1px solid var(--line);

  > * { border-right: 1px solid var(--line); }
  > *:last-child { border-right: 0; }

  @media (max-width: 720px) {
    grid-template-columns: 1.2fr .8fr;
    > *:nth-child(n + 3) { display: none; }
  }
`;

const FeatureLead = styled.div`
  min-width: 0;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FeatureDate = styled.div`color: var(--muted); font: 400 12px/1 "MEK Sans", monospace; text-transform: uppercase;`;
const FeatureTitle = styled(motion.h1)`margin: 0; overflow: hidden; font: 400 clamp(22px, 2.3vw, 34px)/1 "MEKZANTINE", monospace; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap;`;
const FeatureDescription = styled.p`
  margin: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  color: var(--muted);
  font: 400 16px/1.12 "MEK Sans", monospace;

  span {
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    display: -webkit-box;
  }
`;

const ColorField = styled(motion.div)`
  height: calc(100dvh - var(--app-top-offset, 0px) - 274px);
  min-height: 420px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--line);

  @media (max-width: 620px) { height: 300px; }
`;

const FieldOne = styled.div`
  min-width: 0;
  position: relative;
  overflow: hidden;
  border-right: 1px solid var(--line);
  background-color: var(--purple);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--purple);
    mix-blend-mode: color;
    opacity: .46;
    pointer-events: none;
  }
`;

const FieldTwo = styled.div`
  min-width: 0;
  position: relative;
  overflow: hidden;
  background: var(--ochre);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--ochre);
    mix-blend-mode: color;
    opacity: .54;
    pointer-events: none;
  }
`;

const PixelLandscape = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  image-rendering: pixelated;
  filter: saturate(.82) contrast(1.08);
  transform: scale(1.002);
  transition: filter 180ms ease, transform 300ms ease;

  ${ColorField}:hover & {
    filter: saturate(1) contrast(1.12);
    transform: scale(1.012);
  }
`;

const ProjectSection = styled.section``;

const SectionBar = styled.header`
  min-height: 46px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  background: var(--paper2);
  font: 400 12px/1 "MEK Sans", monospace;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 650px) { grid-template-columns: 1fr; }
`;

const ProjectCell = styled(motion.a)`
  min-width: 0;
  min-height: 290px;
  padding: clamp(20px, 3vw, 34px);
  position: relative;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  color: #eee9dc;
  background: ${({ $tone }) => ['var(--purple)', 'var(--ochre)', 'var(--sage)', 'var(--red)'][$tone]};
  text-decoration: none;

  &:nth-child(even) { border-right: 0; }
  h2 { max-width: 600px; margin: auto 0 0; font: 400 clamp(28px, 4vw, 58px)/.95 "MEKZANTINE", monospace; text-transform: uppercase; }
  p { max-width: 560px; margin: 18px 0 0; opacity: .78; font: 400 16px/1.15 "MEK Sans", monospace; }
  @media (max-width: 650px) { min-height: 250px; border-right: 0; }
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font: 400 12px/1 "MEK Sans", monospace;
  text-transform: uppercase;
`;

const ProjectNumber = styled.span`
  position: absolute;
  right: 22px;
  bottom: 20px;
  font: 400 12px/1 "MEK Sans", monospace;
`;

const IndexSection = styled.section``;

const ExperienceRow = styled.article`
  min-height: 86px;
  padding: 16px;
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1.4fr 90px;
  gap: 18px;
  align-items: center;
  border-bottom: 1px solid var(--line);

  > span, time { color: var(--muted); font: 400 12px/1 "MEK Sans", monospace; }
  h3 { margin: 0; font: 400 16px/1.1 "MEK Sans", monospace; text-transform: uppercase; }
  strong { font: 400 14px/1.15 "MEK Sans", monospace; }
  p { margin: 0; color: var(--muted); font: 400 14px/1.15 "MEK Sans", monospace; }
  time { justify-self: end; }

  @media (max-width: 760px) {
    grid-template-columns: 30px 1fr auto;
    strong { grid-column: 2; }
    p { grid-column: 2 / -1; }
    time { grid-column: 3; grid-row: 1; }
  }
`;

const Footer = styled.footer`
  min-height: 340px;
  padding: clamp(28px, 5vw, 68px);
  display: grid;
  grid-template-columns: 1.4fr 1fr auto;
  gap: 40px;
  align-items: end;
  color: #eee9dc;
  background: var(--purple);

  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const FooterTitle = styled.div`
  font: 400 clamp(44px, 7vw, 100px)/.9 "MEKZANTINE", monospace;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;

  a { padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,.22); font: 400 14px/1 "MEK Sans", monospace; text-decoration: none; text-transform: uppercase; }
`;

const FooterNote = styled.div`opacity: .65; font: 400 12px/1.5 "MEK Sans", monospace; text-transform: uppercase;`;
