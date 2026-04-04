import React, { useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';
import {
  filterActive,
  flattenExperience,
  formatMonthYear,
  isPresent,
  normalizeSocialLinks,
} from '../../utils/cvHelpers';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'WashingtonText';
    src: url('/sinister-suns/fonts/WashingtonText.ttf') format('truetype');
    font-display: swap;
  }
`;

const ASSET_BASE = '/sinister-suns/images';

function formatRange(start, end) {
  const startText = formatMonthYear(start);
  const endText = isPresent(end) ? 'Present' : formatMonthYear(end);

  if (!startText && !endText) return '';
  if (!endText) return startText;
  if (!startText) return endText;
  return `${startText} - ${endText}`;
}

function getHighlights(item) {
  if (!item) return [];
  if (Array.isArray(item.highlights) && item.highlights.length > 0) return item.highlights;
  if (item.summary) return [item.summary];
  return [];
}

export function SinisterSunsTheme() {
  const { cvData } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [hasEntered, setHasEntered] = useState(false);

  const experienceItems = useMemo(
    () => flattenExperience(cv?.sections?.experience || [], { excludeArchived: true }),
    [cv]
  );
  const projectItems = useMemo(
    () => filterActive(cv?.sections?.projects || []),
    [cv]
  );
  const educationItems = useMemo(
    () => filterActive(cv?.sections?.education || []),
    [cv]
  );
  const volunteerItems = useMemo(
    () => filterActive(cv?.sections?.volunteer || []),
    [cv]
  );
  const professionalDevelopmentItems = useMemo(
    () => filterActive(cv?.sections?.professional_development || []),
    [cv]
  );
  const socialLinks = useMemo(
    () => normalizeSocialLinks(cv?.social || [], cv?.email || null),
    [cv]
  );

  return (
    <>
      <GlobalStyle />
      <Scene $entered={hasEntered}>
        <AmbientOverlay $entered={hasEntered} />
        <ScreenLines />
        {hasEntered ? (
          <>
            <BorderTop aria-hidden="true">
              <img src={`${ASSET_BASE}/backgrounds/mushrooms.png`} alt="" />
              <img src={`${ASSET_BASE}/backgrounds/mushrooms.png`} alt="" />
              <img src={`${ASSET_BASE}/backgrounds/mushrooms.png`} alt="" />
            </BorderTop>
            <BorderBottom aria-hidden="true">
              <img src={`${ASSET_BASE}/backgrounds/mushrooms.png`} alt="" />
              <img src={`${ASSET_BASE}/backgrounds/mushrooms.png`} alt="" />
              <img src={`${ASSET_BASE}/backgrounds/mushrooms.png`} alt="" />
            </BorderBottom>
            <CornerVines $flip={false} aria-hidden="true" />
            <CornerVines $flip aria-hidden="true" />

            <Page>
              <Banner>
                <BannerShade>
                  <BannerArt src={`${ASSET_BASE.replace('/images', '')}/images/moonrest2.png`} alt="Moonrest" />
                </BannerShade>
              </Banner>

              <MainFrame>
                <Sidebar>
                  <NavSection>
                    <NavTitle>The Halls</NavTitle>
                    <NavLink href="#tavern">Tavern</NavLink>
                    <NavLink href="#records">Records</NavLink>
                    <NavLink href="#workshop">Workshop</NavLink>
                    <NavLink href="#sanctum">Sanctum</NavLink>
                  </NavSection>

                  <PortraitCard>
                    <Portrait src={`${ASSET_BASE}/assets/tavern.gif`} alt="" />
                    <PortraitCaption>Moonrest ledger for {cv?.name || 'the resident scholar'}</PortraitCaption>
                  </PortraitCard>

                  <NavSection>
                    <NavTitle>Waystones</NavTitle>
                    {cv?.website && <ExternalLink href={cv.website}>Website</ExternalLink>}
                    {socialLinks.github && <ExternalLink href={socialLinks.github}>GitHub</ExternalLink>}
                    {socialLinks.linkedin && <ExternalLink href={socialLinks.linkedin}>LinkedIn</ExternalLink>}
                    {socialLinks.email && <ExternalLink href={`mailto:${socialLinks.email}`}>Send Word</ExternalLink>}
                  </NavSection>
                </Sidebar>

                <ContentColumn>
                  <Panel id="tavern">
                    <Divider src={`${ASSET_BASE}/assets/div6.png`} alt="" />
                    <PanelTitle>Moonrest Tavern</PanelTitle>
                    <Lead>
                      {cv?.name || 'Unnamed traveler'}
                      {cv?.location ? ` of ${cv.location}` : ''}
                    </Lead>
                    <MetaGrid>
                      {cv?.email && <MetaItem><span>Email</span><a href={`mailto:${cv.email}`}>{cv.email}</a></MetaItem>}
                      {cv?.phone && <MetaItem><span>Phone</span><strong>{cv.phone}</strong></MetaItem>}
                      {cv?.website && <MetaItem><span>Website</span><a href={cv.website}>{cv.website}</a></MetaItem>}
                    </MetaGrid>
                  </Panel>

                  <Panel id="records">
                    <Divider src={`${ASSET_BASE}/assets/div6.png`} alt="" />
                    <PanelTitle>Library Records</PanelTitle>
                    <SectionBlock>
                      <SectionHeading>Experience</SectionHeading>
                      <EntryList>
                        {experienceItems.map((item, index) => (
                          <EntryCard key={`${item.company}-${item.title}-${index}`}>
                            <EntryHeader>
                              <div>
                                <EntryTitle>{item.title}</EntryTitle>
                                <EntryMeta>{item.company}</EntryMeta>
                              </div>
                              <EntryDate>{formatRange(item.startDate, item.endDate)}</EntryDate>
                            </EntryHeader>
                            <BulletList>
                              {getHighlights(item).slice(0, 4).map((highlight, highlightIndex) => (
                                <li key={highlightIndex}>{highlight}</li>
                              ))}
                            </BulletList>
                          </EntryCard>
                        ))}
                      </EntryList>
                    </SectionBlock>

                    <SectionBlock>
                      <SectionHeading>Education</SectionHeading>
                      <EntryList>
                        {educationItems.map((item, index) => (
                          <EntryCard key={`${item.institution}-${index}`}>
                            <EntryHeader>
                              <div>
                                <EntryTitle>{item.degree} in {item.area}</EntryTitle>
                                <EntryMeta>{item.institution}</EntryMeta>
                              </div>
                              <EntryDate>{formatRange(item.start_date, item.end_date)}</EntryDate>
                            </EntryHeader>
                            {item.highlights?.length > 0 && (
                              <BulletList>
                                {item.highlights.slice(0, 3).map((highlight, highlightIndex) => (
                                  <li key={highlightIndex}>{highlight}</li>
                                ))}
                              </BulletList>
                            )}
                          </EntryCard>
                        ))}
                      </EntryList>
                    </SectionBlock>
                  </Panel>

                  <Panel id="workshop">
                    <Divider src={`${ASSET_BASE}/assets/div6.png`} alt="" />
                    <PanelTitle>Workshop Ledger</PanelTitle>
                    <CardGrid>
                      {projectItems.map((project, index) => (
                        <SmallCard key={`${project.name}-${index}`}>
                          <SmallTitle>
                            {project.url ? <a href={project.url}>{project.name}</a> : project.name}
                          </SmallTitle>
                          {project.date && <SmallMeta>{project.date}</SmallMeta>}
                          {project.summary && <BodyText>{project.summary}</BodyText>}
                          {project.highlights?.length > 0 && (
                            <BulletList>
                              {project.highlights.slice(0, 2).map((highlight, highlightIndex) => (
                                <li key={highlightIndex}>{highlight}</li>
                              ))}
                            </BulletList>
                          )}
                        </SmallCard>
                      ))}
                    </CardGrid>
                  </Panel>

                  <Panel id="sanctum">
                    <Divider src={`${ASSET_BASE}/assets/div6.png`} alt="" />
                    <PanelTitle>Sanctum Annex</PanelTitle>
                    <TwoColumnGrid>
                      <SectionBlock>
                        <SectionHeading>Volunteer</SectionHeading>
                        <EntryList>
                          {volunteerItems.map((item, index) => (
                            <EntryCard key={`${item.company}-${item.position}-${index}`}>
                              <EntryTitle>{item.position}</EntryTitle>
                              <EntryMeta>{item.company}</EntryMeta>
                              <EntryDate>{formatRange(item.start_date, item.end_date)}</EntryDate>
                            </EntryCard>
                          ))}
                        </EntryList>
                      </SectionBlock>

                      <SectionBlock>
                        <SectionHeading>Professional Development</SectionHeading>
                        <EntryList>
                          {professionalDevelopmentItems.map((item, index) => (
                            <EntryCard key={`${item.name}-${index}`}>
                              <EntryTitle>{item.name}</EntryTitle>
                              <EntryMeta>{item.summary || item.location}</EntryMeta>
                              <EntryDate>{formatMonthYear(item.date)}</EntryDate>
                            </EntryCard>
                          ))}
                        </EntryList>
                      </SectionBlock>
                    </TwoColumnGrid>
                  </Panel>
                </ContentColumn>
              </MainFrame>
            </Page>
          </>
        ) : (
          <>
            <LandingBorder src={`${ASSET_BASE}/backgrounds/leafborder.png`} alt="" aria-hidden="true" />
            <ForestFrame>
              <LandingScene>
                <LandingLink type="button" onClick={() => setHasEntered(true)} aria-label="Enter Moonrest">
                  <LandingArt src={`${ASSET_BASE.replace('/images', '')}/images/moonrest.png`} alt="Moonrest" className="default" />
                  <LandingArt src={`${ASSET_BASE.replace('/images', '')}/images/moonrestd2.png`} alt="" aria-hidden="true" className="hover" />
                </LandingLink>
                <ForestBackground src={`${ASSET_BASE}/backgrounds/forest6.jpg`} alt="" aria-hidden="true" />
                <ForestPath src={`${ASSET_BASE}/backgrounds/path.png`} alt="" aria-hidden="true" />
                <Fireflies src={`${ASSET_BASE}/assets/fireflies.gif`} alt="" aria-hidden="true" $variant="left" />
                <Fireflies src={`${ASSET_BASE}/assets/fireflies.gif`} alt="" aria-hidden="true" $variant="right" />
                <LandingPrompt>Enter the tavern</LandingPrompt>
              </LandingScene>
            </ForestFrame>
          </>
        )}
      </Scene>
    </>
  );
}

const Scene = styled.div`
  position: relative;
  min-height: 100%;
  overflow-x: hidden;
  overflow-y: ${({ $entered }) => ($entered ? 'auto' : 'hidden')};
  background: ${({ $entered }) => ($entered
    ? `linear-gradient(rgba(5, 8, 9, 0.3), rgba(5, 8, 9, 0.7)),
    url('${ASSET_BASE}/backgrounds/interior.jpg') center / cover fixed no-repeat`
    : '#0e1a1e')};
  color: #bab7a6;
  font-family: 'WashingtonText', Georgia, serif;

  * {
    box-sizing: border-box;
  }

  a {
    color: #ded0a1;
    text-decoration: none;
  }
`;

const AmbientOverlay = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  background: ${({ $entered }) => ($entered
    ? `radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.68) 100%),
    url('${ASSET_BASE}/backgrounds/poster3.jpg') center / cover no-repeat`
    : 'radial-gradient(circle at center, transparent 38%, rgba(0, 0, 0, 0.5) 100%)')};
  opacity: ${({ $entered }) => ($entered ? 0.22 : 1)};
`;

const ScreenLines = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  background: url('${ASSET_BASE}/backgrounds/scanlines2.png') repeat;
  background-size: 480px;
  opacity: 0.35;
`;

const edgeStrip = `
  pointer-events: none;
  position: fixed;
  left: 0;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 72px;

  img {
    width: 33.333%;
    object-fit: cover;
  }
`;

const BorderTop = styled.div`
  ${edgeStrip}
  top: var(--app-top-offset, 0px);
  transform: rotateX(180deg);
`;

const BorderBottom = styled.div`
  ${edgeStrip}
  bottom: 0;
  justify-content: flex-end;
`;

const CornerVines = styled.div`
  pointer-events: none;
  position: fixed;
  ${({ $flip }) => ($flip ? 'left: 0; bottom: 0;' : 'right: 0; top: 0;')}
  width: min(40vw, 520px);
  height: min(40vh, 400px);
  z-index: 1;
  background: url('${ASSET_BASE}/backgrounds/ivyborder.png') center / contain no-repeat;
  opacity: 0.82;
  transform: ${({ $flip }) => ($flip ? 'rotate(180deg)' : 'none')};
`;

const Page = styled.div`
  position: relative;
  z-index: 2;
  padding: 28px 20px 96px;
`;

const LandingBorder = styled.img`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  pointer-events: none;
`;

const ForestFrame = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
`;

const LandingScene = styled.main`
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
`;

const ForestBackground = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -10;
  object-fit: cover;
  object-position: center center;
  filter: opacity(0.75);
  background-color: black;
`;

const ForestPath = styled.img`
  position: absolute;
  width: clamp(180px, 18vw, 360px);
  bottom: 0;
  left: 40%;
  z-index: -5;

  @media (max-width: 900px) {
    width: clamp(150px, 24vw, 280px);
    left: 36%;
  }

  @media (max-width: 640px) {
    width: clamp(140px, 30vw, 220px);
    left: 30%;
  }
`;

const LandingLink = styled.button`
  position: absolute;
  bottom: clamp(170px, 20vh, 280px);
  left: 50%;
  display: block;
  width: clamp(360px, 48vw, 760px);
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(-10px 10px 10px black);
  clip-path: polygon(0% 45.88%, 22% 0%, 49.88% 0%, 60.71% 23.82%, 100% 21.36%, 100% 100%, 0% 100%);
  transform: translateX(-38%);
  transition: transform 180ms ease;

  &:hover,
  &:focus-visible {
    transform: translateX(-38%) translateY(-4px);
  }

  &:focus-visible {
    outline: 2px solid #d9cfa5;
    outline-offset: 8px;
  }

  .default {
    opacity: 1;
  }

  .hover {
    opacity: 0;
  }

  &:hover .default,
  &:focus-visible .default {
    opacity: 0;
  }

  &:hover .hover,
  &:focus-visible .hover {
    opacity: 1;
  }

  @media (max-width: 900px) {
    width: clamp(300px, 60vw, 560px);
    bottom: clamp(160px, 22vh, 230px);
    transform: translateX(-42%);

    &:hover,
    &:focus-visible {
      transform: translateX(-42%) translateY(-4px);
    }
  }

  @media (max-width: 640px) {
    width: min(86vw, 460px);
    bottom: clamp(180px, 24vh, 240px);
    transform: translateX(-46%);

    &:hover,
    &:focus-visible {
      transform: translateX(-46%) translateY(-4px);
    }
  }
`;

const LandingArt = styled.img`
  display: block;
  width: 100%;
  transition: opacity 140ms ease;

  &.hover {
    position: absolute;
    inset: 0;
  }
`;

const Fireflies = styled.img`
  position: absolute;
  ${({ $variant }) => ($variant === 'left'
    ? 'left: 19%; bottom: 58%; width: clamp(140px, 20vw, 280px);'
    : 'right: 20%; bottom: 18%; width: clamp(140px, 18vw, 260px); z-index: 10;')}
  pointer-events: none;

  @media (max-width: 900px) {
    ${({ $variant }) => ($variant === 'left'
      ? 'left: 10%; bottom: 60%; width: clamp(120px, 24vw, 220px);'
      : 'right: 10%; bottom: 24%; width: clamp(120px, 22vw, 220px);')}
  }

  @media (max-width: 640px) {
    ${({ $variant }) => ($variant === 'left'
      ? 'left: 4%; bottom: 64%; width: clamp(110px, 28vw, 180px);'
      : 'right: 4%; bottom: 28%; width: clamp(110px, 26vw, 180px);')}
  }
`;

const LandingPrompt = styled.p`
  position: absolute;
  left: 50%;
  bottom: clamp(92px, 11vh, 150px);
  margin: 0;
  z-index: 1;
  color: #ddd4aa;
  font-size: clamp(1.05rem, 2vw, 1.55rem);
  letter-spacing: 0.08em;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
  transform: translateX(-92%);

  @media (max-width: 900px) {
    transform: translateX(-86%);
  }

  @media (max-width: 640px) {
    bottom: clamp(110px, 13vh, 150px);
    transform: translateX(-82%);
  }
`;

const Banner = styled.header`
  width: min(980px, calc(100% - 24px));
  min-height: 190px;
  margin: 0 auto 18px;
  border-left: 6px double rgb(50 50 10);
  border-right: 6px double rgb(50 50 10);
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.02) 60%, rgba(0, 0, 0, 0.92) 100%),
    url('${ASSET_BASE}/backgrounds/banner2.jpg') center / cover no-repeat;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.85), inset 0 0 20px rgba(0, 0, 0, 0.75);
`;

const BannerShade = styled.div`
  display: flex;
  align-items: end;
  justify-content: center;
  min-height: 190px;
  padding: 20px;
`;

const BannerArt = styled.img`
  width: min(460px, 90%);
  image-rendering: auto;
`;

const MainFrame = styled.main`
  width: min(1120px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  gap: 18px;
  align-items: start;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const framePanel = `
  border: 20px solid transparent;
  border-image: url('${ASSET_BASE}/border3.png') 30 round;
  background:
    linear-gradient(rgba(8, 16, 18, 0.92), rgba(8, 16, 18, 0.96)),
    radial-gradient(circle at top, rgba(107, 92, 54, 0.15), transparent 50%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
`;

const Sidebar = styled.aside`
  ${framePanel}
  position: sticky;
  top: 22px;
  padding: 18px;
  display: grid;
  gap: 18px;

  @media (max-width: 920px) {
    position: static;
  }
`;

const NavSection = styled.section`
  display: grid;
  gap: 10px;
  border-right: 6px double rgb(50 50 10);
  padding-right: 12px;

  @media (max-width: 920px) {
    border-right: 0;
    border-bottom: 6px double rgb(50 50 10);
    padding-right: 0;
    padding-bottom: 12px;
  }
`;

const NavTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  text-decoration: underline;
  color: #d9cfa5;
`;

const linkStyle = `
  position: relative;
  display: inline-block;
  width: fit-content;
  padding-right: 18px;
  font-size: 1.1rem;
  color: #bab7a6;
  text-shadow: 2px 2px 0 rgb(10 10 10);

  &:hover::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0;
    width: 12px;
    height: 12px;
    background: url('${ASSET_BASE.replace('/images', '')}/images/sword.png') center / contain no-repeat;
    transform: translateY(-50%);
  }
`;

const NavLink = styled.a`
  ${linkStyle}
`;

const ExternalLink = styled.a`
  ${linkStyle}
`;

const PortraitCard = styled.div`
  display: grid;
  gap: 10px;
`;

const Portrait = styled.img`
  width: 100%;
  border: 3px double #d7c391;
  background: #0e1a1e;
`;

const PortraitCaption = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.45;
`;

const ContentColumn = styled.div`
  display: grid;
  gap: 18px;
`;

const Panel = styled.section`
  ${framePanel}
  padding: 24px;
`;

const Divider = styled.img`
  display: block;
  width: min(220px, 100%);
  margin: 0 auto 12px;
  opacity: 0.92;
`;

const PanelTitle = styled.h1`
  margin: 0 0 12px;
  text-align: center;
  color: #d9cfa5;
  text-decoration: underline;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
`;

const Lead = styled.p`
  margin: 0 0 10px;
  font-size: 1.2rem;
  text-align: center;
  color: #ded7bc;
`;

const BodyText = styled.p`
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const MetaItem = styled.div`
  padding: 12px;
  border: 3px double rgb(77 70 39);
  background: rgba(0, 0, 0, 0.18);

  span {
    display: block;
    margin-bottom: 6px;
    color: #d9cfa5;
    font-size: 0.95rem;
  }

  strong,
  a {
    font-size: 1rem;
  }
`;

const SectionBlock = styled.section`
  display: grid;
  gap: 12px;

  & + & {
    margin-top: 20px;
  }
`;

const SectionHeading = styled.h2`
  margin: 0;
  color: #d9cfa5;
  font-size: 1.35rem;
`;

const EntryList = styled.div`
  display: grid;
  gap: 12px;
`;

const EntryCard = styled.article`
  padding: 14px;
  border: 4px double rgb(77 70 39);
  background: rgba(0, 0, 0, 0.16);
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const EntryTitle = styled.h3`
  margin: 0;
  color: #ede1af;
  font-size: 1.15rem;
`;

const EntryMeta = styled.p`
  margin: 4px 0 0;
  color: #d6ceb3;
  font-size: 0.98rem;
`;

const EntryDate = styled.p`
  margin: 0;
  white-space: nowrap;
  color: #cdbd87;
  font-size: 0.96rem;
`;

const BulletList = styled.ul`
  margin: 12px 0 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
  line-height: 1.5;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const SmallCard = styled.article`
  padding: 14px;
  min-height: 100%;
  border: 4px double rgb(77 70 39);
  background: rgba(0, 0, 0, 0.16);
`;

const SmallTitle = styled.h3`
  margin: 0 0 4px;
  color: #ede1af;
  font-size: 1.15rem;
`;

const SmallMeta = styled.p`
  margin: 0 0 10px;
  color: #cdbd87;
  font-size: 0.95rem;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;
