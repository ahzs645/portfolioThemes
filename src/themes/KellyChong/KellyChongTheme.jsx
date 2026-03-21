import React, { useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDateRange, formatMonthYear } from '../../utils/cvHelpers';

const Fonts = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

const drift = keyframes`
  from { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -14px, 0); }
  to { transform: translate3d(0, 0, 0); }
`;

function pickHighlight(items = [], fallback = []) {
  return items.filter(Boolean).slice(0, 8).length ? items.filter(Boolean).slice(0, 8) : fallback;
}

function getYearSpan(items = []) {
  const years = items
    .flatMap((item) => [item?.startDate || item?.start_date, item?.endDate || item?.end_date])
    .filter(Boolean)
    .map((value) => String(value).slice(0, 4))
    .filter((value) => /^\d{4}$/.test(value));

  if (!years.length) return 'Selected years';
  return `${Math.min(...years)} - ${Math.max(...years)}`;
}

function getLocationLabel(location) {
  if (!location) return 'ONLINE';
  const parts = String(location).split(',').map((part) => part.trim()).filter(Boolean);
  return (parts[0] || location).toUpperCase();
}

export function KellyChongTheme() {
  const cv = useCV();
  const [clock, setClock] = useState('');

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const updateClock = () => setClock(formatter.format(new Date()));
    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const sections = useMemo(() => {
    if (!cv) return null;

    const featuredProjects = pickHighlight(
      cv.projects.map((project) => ({
        label: project.name,
        href: project.url || cv.website || null,
        meta: project.date || 'Selected work',
      })),
      []
    );

    const experiments = pickHighlight(
      cv.skills.map((skill) => ({
        label: skill.name || skill,
        href: null,
        meta: Array.isArray(skill.keywords) ? skill.keywords.slice(0, 3).join(', ') : 'Practice',
      })),
      cv.projects.map((project) => ({
        label: project.name,
        href: project.url || null,
        meta: project.highlights?.[0] || project.summary || 'Experiment',
      }))
    );

    const notes = pickHighlight(
      cv.volunteer.map((item) => ({
        label: `${item.company}`,
        href: null,
        meta: item.title,
      })),
      cv.experience.map((item) => ({
        label: item.company,
        href: null,
        meta: item.title,
      }))
    );

    const credits = [
      cv.website && { label: 'website', href: cv.website, meta: 'main link' },
      cv.email && { label: cv.email, href: `mailto:${cv.email}`, meta: 'email' },
      ...(cv.socialRaw || []).slice(0, 6).map((entry) => ({
        label: entry.network || entry.url,
        href: entry.url || null,
        meta: entry.username || 'social',
      })),
    ].filter(Boolean);

    return {
      featuredProjects,
      experiments,
      notes,
      credits,
    };
  }, [cv]);

  if (!cv || !sections) return null;

  const currentRole = cv.experience[0];
  const locationLabel = getLocationLabel(cv.location);
  const currentYear = new Date().getFullYear();
  const infoBullets = [
    cv.currentJobTitle ? `Working as ${cv.currentJobTitle}` : null,
    cv.location ? `Based in ${cv.location}` : null,
    cv.education[0] ? `${cv.education[0].degree} in ${cv.education[0].area}` : null,
    cv.volunteer[0] ? `Also involved with ${cv.volunteer[0].company}` : null,
  ].filter(Boolean);
  const homeSummary = cv.about || `${cv.name} is building thoughtful systems and projects.`;

  return (
    <>
      <Fonts />
      <Page>
        <Backdrop aria-hidden="true" />
        <TopNav>
          <NavGroup>
            <NavItem href="#home">🏠 HOME</NavItem>
            <NavItem href="#info">💌 INFO</NavItem>
            <NavItem href="#projects">💻 PROJECTS</NavItem>
            <NavItem href="#logs">🍀 LOGS</NavItem>
          </NavGroup>
          <NavItem href="#credits">🎞 CREDITS</NavItem>
        </TopNav>

        <Content>
          <HeroSection id="home">
            <HeroEyebrow>{cv.name} is crafting experiences for work and possibilities.</HeroEyebrow>
            <HeroGrid>
              <HeroColumn>
                <HeroTitle>{cv.name}</HeroTitle>
                <HeroLead>
                  {currentRole ? (
                    <>
                      <span>{currentRole.title}</span>
                      <span>@</span>
                      <InlineLink href={cv.website || '#'} target="_blank" rel="noreferrer">
                        {currentRole.company}
                      </InlineLink>
                    </>
                  ) : (
                    <span>{cv.currentJobTitle || 'Building projects'}</span>
                  )}
                </HeroLead>
                <HeroCopy>{homeSummary}</HeroCopy>
              </HeroColumn>

              <AsideCard>
                <AsideLabel>Reach out</AsideLabel>
                <AsideCopy>
                  {cv.email ? (
                    <InlineLink href={`mailto:${cv.email}`}>{cv.email}</InlineLink>
                  ) : (
                    'Available for questions or collaborations.'
                  )}
                </AsideCopy>
                {cv.location && <AsideCopy>{cv.location}</AsideCopy>}
              </AsideCard>
            </HeroGrid>
          </HeroSection>

          <Section id="info">
            <SectionTitle>About</SectionTitle>
            <SectionGrid>
              <Column>
                <BodyCopy>{homeSummary}</BodyCopy>
                <BulletBlock>
                  <BlockLabel>Outside the main thread</BlockLabel>
                  <BulletList>
                    {infoBullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </BulletList>
                </BulletBlock>
              </Column>

              <Column>
                <BulletBlock>
                  <BlockLabel>Elsewhere on the web...</BlockLabel>
                  <LinkRows>
                    {(cv.socialRaw || []).slice(0, 8).map((entry) => (
                      <LinkRow key={`${entry.network}-${entry.url}`}>
                        <ExternalLink href={entry.url} target="_blank" rel="noreferrer">
                          {String(entry.network || entry.url).toLowerCase()}
                        </ExternalLink>
                        <span>{entry.username || 'profile'}</span>
                      </LinkRow>
                    ))}
                    {cv.email && (
                      <LinkRow>
                        <ExternalLink href={`mailto:${cv.email}`}>{cv.email}</ExternalLink>
                        <span>email</span>
                      </LinkRow>
                    )}
                  </LinkRows>
                </BulletBlock>
              </Column>
            </SectionGrid>
          </Section>

          <Section id="projects">
            <SectionTitle>Index</SectionTitle>
            <ProjectGrid>
              <ProjectColumn>
                <BlockHeader>
                  <BlockLabel>SELECT CLIENTS</BlockLabel>
                  <BlockMeta>{getYearSpan(cv.experience)}</BlockMeta>
                </BlockHeader>
                <LinkStack>
                  {cv.experience.slice(0, 8).map((item, index) => (
                    <ProjectLink
                      key={`${item.company}-${item.title}-${index}`}
                      href={cv.website || '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.company}
                    </ProjectLink>
                  ))}
                </LinkStack>
              </ProjectColumn>

              <ProjectColumn>
                <BlockHeader>
                  <BlockLabel>EXPERIMENTS</BlockLabel>
                  <BlockMeta>personal practice</BlockMeta>
                </BlockHeader>
                <LinkStack>
                  {sections.experiments.map((item) => (
                    <ProjectLink
                      key={`${item.label}-${item.meta}`}
                      href={item.href || '#projects'}
                      target={item.href ? '_blank' : undefined}
                      rel={item.href ? 'noreferrer' : undefined}
                    >
                      {item.label}
                    </ProjectLink>
                  ))}
                </LinkStack>
              </ProjectColumn>

              <ProjectColumn>
                <BlockHeader>
                  <BlockLabel>EVENTS / NOTES</BlockLabel>
                  <BlockMeta>community and making</BlockMeta>
                </BlockHeader>
                <LinkStack>
                  {sections.notes.map((item, index) => (
                    <ProjectText key={`${item.label}-${item.meta}-${index}`}>
                      {item.label}
                    </ProjectText>
                  ))}
                </LinkStack>
              </ProjectColumn>
            </ProjectGrid>
          </Section>

          <Section id="logs">
            <SectionTitle>Field notes, diaries, and other documentation.</SectionTitle>
            <LogsGrid>
              <LogColumn>
                <BlockLabel>PERSONAL</BlockLabel>
                <LogList>
                  {cv.education.slice(0, 4).map((item, index) => (
                    <li key={`${item.institution}-${item.area}-${item.degree}-${index}`}>
                      <strong>{item.institution}</strong>
                      <span>
                        {item.degree} {item.area ? `in ${item.area}` : ''}
                        {item.start_date || item.end_date ? ` · ${formatDateRange(item.start_date, item.end_date)}` : ''}
                      </span>
                    </li>
                  ))}
                </LogList>
              </LogColumn>

              <LogColumn>
                <BlockLabel>SELECT WRITING</BlockLabel>
                <LogList>
                  {cv.projects.slice(0, 6).map((item) => (
                    <li key={item.name}>
                      {item.url ? (
                        <ExternalLink href={item.url} target="_blank" rel="noreferrer">
                          {item.name}
                        </ExternalLink>
                      ) : (
                        <strong>{item.name}</strong>
                      )}
                      <span>{item.summary} {item.date ? `· ${formatMonthYear(String(item.date).includes('-') ? item.date : `${item.date}-01`)}` : ''}</span>
                    </li>
                  ))}
                </LogList>
              </LogColumn>
            </LogsGrid>
          </Section>

          <Section id="credits">
            <SectionTitle>Credits</SectionTitle>
            <CreditsPanel>
              <CreditsText>
                Built from CV.yaml data and restyled after kellychong.ca&apos;s paper-texture Framer portfolio.
              </CreditsText>
              <CreditsList>
                {sections.credits.map((item) => (
                  <li key={`${item.label}-${item.meta}`}>
                    {item.href ? (
                      <ExternalLink href={item.href} target={item.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
                        {item.label}
                      </ExternalLink>
                    ) : (
                      <span>{item.label}</span>
                    )}
                    <small>{item.meta}</small>
                  </li>
                ))}
              </CreditsList>
            </CreditsPanel>
          </Section>
        </Content>

        <FooterBar>
          <FooterMeta>
            <span>{clock}</span>
            <span>|</span>
            <span>{locationLabel}</span>
          </FooterMeta>
          <span>© {currentYear}</span>
        </FooterBar>
      </Page>
    </>
  );
}

const Page = styled.main`
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(99, 70, 42, 0.18), transparent 36%),
    linear-gradient(180deg, #544840 0, rgba(84, 72, 64, 0.35) 72px, transparent 160px),
    linear-gradient(180deg, #f8f3ec 0%, #f5efe8 58%, #eff2f8 100%);
  color: #213d69;
  overflow: hidden;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.55;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.88), transparent 36%),
    radial-gradient(circle at 72% 18%, rgba(97, 73, 47, 0.24), transparent 24%),
    repeating-linear-gradient(
      90deg,
      rgba(126, 110, 95, 0.04) 0,
      rgba(126, 110, 95, 0.04) 1px,
      transparent 1px,
      transparent 3px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(126, 110, 95, 0.035) 0,
      rgba(126, 110, 95, 0.035) 1px,
      transparent 1px,
      transparent 3px
    );
  filter: saturate(0.86);

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: auto 0 0 auto;
    width: 44vw;
    height: 24vh;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.62)),
      radial-gradient(circle, rgba(98, 78, 57, 0.22) 18%, transparent 20%) 0 0 / 10px 10px;
    mix-blend-mode: multiply;
    opacity: 0.3;
    animation: ${drift} 12s ease-in-out infinite;
  }

  &::after {
    top: 0;
    left: 18vw;
    right: auto;
    bottom: auto;
    width: 32vw;
    height: 18vh;
    opacity: 0.22;
    animation-duration: 16s;
  }
`;

const TopNav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 28px 10px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  color: #f6f2ea;
  background: linear-gradient(180deg, rgba(66, 55, 49, 0.92), rgba(66, 55, 49, 0.62));
  backdrop-filter: blur(8px);

  @media (max-width: 820px) {
    flex-direction: column-reverse;
    align-items: flex-start;
    padding: 12px 18px;
  }
`;

const NavGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
`;

const NavItem = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    color: #d7ff73;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1080px;
  padding: 44px 64px 120px;

  @media (max-width: 820px) {
    padding: 26px 20px 112px;
  }
`;

const HeroSection = styled.section`
  min-height: 58vh;
  display: grid;
  align-content: center;
  gap: 18px;
  padding: 24px 0 64px;
`;

const HeroEyebrow = styled.p`
  margin: 0;
  max-width: 34rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1rem;
  line-height: 1.8;
  color: #5a6170;
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 270px;
  gap: 36px;
  align-items: start;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const HeroColumn = styled.div`
  display: grid;
  gap: 10px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(4rem, 8vw, 5.8rem);
  line-height: 0.95;
  font-weight: 600;
  color: #6f4f33;
`;

const HeroLead = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
  font-family: 'IBM Plex Mono', monospace;
  color: #485a79;
`;

const HeroCopy = styled.p`
  margin: 0;
  max-width: 38rem;
  font-size: 1.2rem;
  line-height: 1.8;
  color: #243e68;
`;

const InlineLink = styled.a`
  color: #243e68;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;

  &:hover {
    color: #6f4f33;
  }
`;

const AsideCard = styled.aside`
  display: grid;
  gap: 8px;
  padding: 18px 18px 16px;
  border: 1px solid rgba(92, 76, 64, 0.18);
  background: rgba(255, 252, 247, 0.56);
  box-shadow: 0 12px 30px rgba(81, 63, 46, 0.06);
`;

const AsideLabel = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  color: #7d7269;
`;

const AsideCopy = styled.p`
  margin: 0;
  line-height: 1.7;
  color: #213d69;
`;

const Section = styled.section`
  padding: 38px 0 48px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 18px;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.4rem, 5vw, 3.4rem);
  font-weight: 600;
  color: #6f4f33;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: grid;
  gap: 22px;
`;

const BodyCopy = styled.p`
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.9;
`;

const BulletBlock = styled.div`
  display: grid;
  gap: 10px;
`;

const BlockLabel = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  color: #6f6a67;
`;

const BulletList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  line-height: 1.9;
`;

const LinkRows = styled.div`
  display: grid;
  gap: 10px;
`;

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: baseline;
  font-size: 1rem;

  span {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.83rem;
    color: #7b756f;
  }
`;

const ExternalLink = styled.a`
  color: #213d69;
  text-decoration: underline;
  text-underline-offset: 0.18em;

  &:hover {
    color: #6f4f33;
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 30px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectColumn = styled.div`
  display: grid;
  gap: 16px;
  align-content: start;
`;

const BlockHeader = styled.div`
  display: grid;
  gap: 4px;
`;

const BlockMeta = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  color: #8b8178;
`;

const LinkStack = styled.div`
  display: grid;
  gap: 10px;
`;

const ProjectLink = styled.a`
  color: #213d69;
  text-decoration: none;
  font-size: 1.1rem;
  line-height: 1.5;

  &:hover {
    color: #6f4f33;
    text-decoration: underline;
  }
`;

const ProjectText = styled.div`
  color: #213d69;
  font-size: 1.1rem;
  line-height: 1.5;
`;

const LogsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const LogColumn = styled.div`
  display: grid;
  gap: 14px;
`;

const LogList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;

  li {
    display: grid;
    gap: 4px;
  }

  strong,
  a {
    font-size: 1.05rem;
    font-weight: 500;
  }

  span {
    color: #6b6770;
    line-height: 1.7;
  }
`;

const CreditsPanel = styled.div`
  display: grid;
  gap: 18px;
  max-width: 760px;
`;

const CreditsText = styled.p`
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.8;
`;

const CreditsList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;

  li {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: baseline;
  }

  small {
    font-family: 'IBM Plex Mono', monospace;
    color: #8a8178;
  }
`;

const FooterBar = styled.footer`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 28px 16px;
  font-family: 'IBM Plex Mono', monospace;
  color: #213d69;
  background: linear-gradient(180deg, rgba(236, 240, 247, 0), rgba(226, 234, 245, 0.95));

  @media (max-width: 820px) {
    padding: 10px 18px 14px;
    font-size: 0.85rem;
  }
`;

const FooterMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;
