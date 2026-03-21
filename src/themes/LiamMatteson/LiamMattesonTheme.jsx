import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDateRange, formatMonthYear } from '../../utils/cvHelpers';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Cormorant+Garamond:wght@500;600&display=swap');
`;

const revealUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
    filter: blur(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`;

const galleryImages = [
  '/liam-matteson/home.jpg',
  '/liam-matteson/antimetal-dashboard.jpg',
  '/liam-matteson/copilot-intelligence.jpg',
  '/liam-matteson/cashflow.jpg',
  '/liam-matteson/apple-card.jpg',
  '/liam-matteson/onboarding.jpg',
];

function firstSentence(text = '') {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  const match = normalized.match(/^.*?[.!?](?:\s|$)/);
  return (match ? match[0] : normalized).trim();
}

export function LiamMattesonTheme({ darkMode }) {
  const cv = useCV();

  if (!cv) return null;

  const theme = darkMode
    ? {
        bg: '#171b17',
        surface: '#1d241d',
        text: '#e8ece5',
        muted: '#9aa394',
        soft: '#2a322a',
        underline: '#313a31',
        border: 'rgba(232, 236, 229, 0.1)',
      }
    : {
        bg: '#f7f7f2',
        surface: '#ffffff',
        text: '#123727',
        muted: '#6b7467',
        soft: '#eceee7',
        underline: '#e8ebe3',
        border: 'rgba(18, 55, 39, 0.09)',
      };

  const intro = firstSentence(cv.about) || 'Software designed with creativity and care through relentless iteration and meticulous detail.';
  const introWords = intro.split(' ');
  const featuredExperience = cv.experience.slice(0, 4);
  const featuredProjects = cv.projects.slice(0, 6);
  const featuredEducation = cv.education.slice(0, 2);
  const featuredVolunteer = cv.volunteer.slice(0, 3);
  const currentRole = featuredExperience[0];
  const heroLinks = [
    { label: 'Work', href: '#work' },
    { label: 'Projects', href: '#projects' },
    { label: 'Education', href: '#education' },
    { label: 'Connect', href: '#connect' },
  ];

  return (
    <Page $theme={theme}>
      <FontLoader />
      <Shell>
        <Header>
          <MarkLink href={cv.website || '#'} target="_blank" rel="noreferrer" aria-label={cv.name}>
            <IconMark viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M19.444 14.284c.307 0 .556.249.556.556v2.936A2.222 2.222 0 0 1 17.778 20H7.699a.556.556 0 0 1-.556-.557V14.84c0-.307.249-.556.556-.556h11.745Z" fill="currentColor" />
              <path d="M7.696 12.856a.556.556 0 0 1-.556-.555V.556C7.14.249 7.39 0 7.696 0h2.936a2.222 2.222 0 0 1 2.222 2.222V12.3a.556.556 0 0 1-.555.556H7.696Z" fill="currentColor" />
              <path d="M14.84 12.856a.556.556 0 0 1-.556-.555V.556c0-.307.25-.556.556-.556h2.937A2.222 2.222 0 0 1 20 2.222V12.3a.556.556 0 0 1-.556.556H14.84Z" fill="currentColor" />
              <path d="M0 2.222A2.222 2.222 0 0 1 2.222 0h2.936c.307 0 .556.249.556.556v18.887a.556.556 0 0 1-.556.557H2.222A2.222 2.222 0 0 1 0 17.776V2.222Z" fill="currentColor" />
            </IconMark>
          </MarkLink>
          <Spacer />
          <RightMeta $theme={theme}>{cv.location}</RightMeta>
        </Header>

        <IntroBlock>
          <Name>{cv.name}</Name>
          <RoleLine $theme={theme}>
            {currentRole ? (
              <>
                <span>{currentRole.title}</span>
                <span>at</span>
                <InlineLink href={cv.website || cv.socialLinks.linkedin || '#'} target="_blank" rel="noreferrer">
                  {currentRole.company}
                </InlineLink>
                <span>in {cv.location}</span>
              </>
            ) : (
              <span>{cv.location}</span>
            )}
          </RoleLine>

          <Statement $theme={theme}>
            {introWords.map((word, index) => (
              <StatementWord key={`${word}-${index}`} style={{ animationDelay: `${index * 35}ms` }}>
                {word}
              </StatementWord>
            ))}
          </Statement>

          <NavRow aria-label="Theme sections">
            {heroLinks.map((link) => (
              <NavLink key={link.href} href={link.href} $theme={theme}>
                {link.label}
              </NavLink>
            ))}
          </NavRow>
        </IntroBlock>

        <HeroImage href={featuredProjects[0]?.url || cv.website || '#'} target="_blank" rel="noreferrer">
          <ImageFrame>
            <img src={galleryImages[0]} alt={featuredProjects[0]?.name || `${cv.name} featured work`} />
          </ImageFrame>
        </HeroImage>

        <Section id="work">
          <SectionHeader>
            <SectionTitle>Work</SectionTitle>
            <SectionNote $theme={theme}>Selected experience</SectionNote>
          </SectionHeader>
          <ExperienceGrid>
            {featuredExperience.map((item, index) => (
              <ExperienceCard key={`${item.company}-${item.title}-${index}`} $theme={theme}>
                <ExperienceTop>
                  <div>
                    <CardTitle>{item.company}</CardTitle>
                    <CardSubtitle $theme={theme}>{item.title}</CardSubtitle>
                  </div>
                  <CardDate $theme={theme}>{formatDateRange(item.startDate, item.endDate)}</CardDate>
                </ExperienceTop>
                {item.highlights?.[0] && <CardBody>{item.highlights[0]}</CardBody>}
              </ExperienceCard>
            ))}
          </ExperienceGrid>
        </Section>

        <Section id="projects">
          <SectionHeader>
            <SectionTitle>Projects</SectionTitle>
            <SectionNote $theme={theme}>Image-led project panels inspired by liam.cv</SectionNote>
          </SectionHeader>
          <ProjectGrid>
            {featuredProjects.map((project, index) => (
              <ProjectCard
                key={`${project.name}-${index}`}
                href={project.url || cv.website || '#'}
                target="_blank"
                rel="noreferrer"
                $theme={theme}
              >
                <ProjectImageWrap>
                  <img src={galleryImages[index % galleryImages.length]} alt={project.name} />
                </ProjectImageWrap>
                <ProjectMeta>
                  <ProjectTitle>{project.name}</ProjectTitle>
                  <ProjectDate $theme={theme}>{project.date || 'Selected work'}</ProjectDate>
                </ProjectMeta>
                <ProjectSummary $theme={theme}>{project.summary}</ProjectSummary>
              </ProjectCard>
            ))}
          </ProjectGrid>
        </Section>

        <Columns>
          <Section id="education">
            <SectionHeader>
              <SectionTitle>Education</SectionTitle>
            </SectionHeader>
            <Stack>
              {featuredEducation.map((item, index) => (
                <CompactCard key={`${item.institution}-${index}`} $theme={theme}>
                  <CardTitle>{item.institution}</CardTitle>
                  <CardSubtitle $theme={theme}>{item.degree} in {item.area}</CardSubtitle>
                  <CardDate $theme={theme}>{formatDateRange(item.start_date, item.end_date)}</CardDate>
                </CompactCard>
              ))}
            </Stack>
          </Section>

          <Section id="connect">
            <SectionHeader>
              <SectionTitle>Connect</SectionTitle>
            </SectionHeader>
            <ConnectCard $theme={theme}>
              {cv.email && <ConnectLink href={`mailto:${cv.email}`} $theme={theme}>{cv.email}</ConnectLink>}
              {cv.socialRaw?.map((entry, index) => (
                <ConnectLink key={`${entry.network}-${index}`} href={entry.url} target="_blank" rel="noreferrer" $theme={theme}>
                  {entry.network}
                </ConnectLink>
              ))}
            </ConnectCard>
          </Section>
        </Columns>

        {featuredVolunteer.length > 0 && (
          <Section>
            <SectionHeader>
              <SectionTitle>Community</SectionTitle>
              <SectionNote $theme={theme}>Volunteer and leadership work</SectionNote>
            </SectionHeader>
            <VolunteerList>
              {featuredVolunteer.map((item, index) => (
                <VolunteerRow key={`${item.company}-${index}`} $theme={theme}>
                  <div>
                    <CardTitle>{item.company}</CardTitle>
                    <CardSubtitle $theme={theme}>{item.title}</CardSubtitle>
                  </div>
                  <VolunteerDate $theme={theme}>{formatMonthYear(item.startDate)} to {String(item.endDate).toLowerCase() === 'present' ? 'Present' : formatMonthYear(item.endDate)}</VolunteerDate>
                </VolunteerRow>
              ))}
            </VolunteerList>
          </Section>
        )}
      </Shell>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(142, 160, 137, 0.15), transparent 28%),
    radial-gradient(circle at bottom right, rgba(211, 220, 204, 0.22), transparent 32%),
    ${({ $theme }) => $theme.bg};
  color: ${({ $theme }) => $theme.text};
  transition: background-color 300ms ease, color 300ms ease;
`;

const Shell = styled.main`
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: 40px 24px 96px;

  @media (max-width: 700px) {
    padding: 28px 18px 72px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: 56px;
  margin-bottom: 24px;
`;

const MarkLink = styled.a`
  color: inherit;
  display: inline-flex;
  align-items: center;
`;

const IconMark = styled.svg`
  width: 20px;
  height: 20px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const RightMeta = styled.div`
  font-family: 'Instrument Sans', sans-serif;
  font-size: 14px;
  color: ${({ $theme }) => $theme.muted};
`;

const IntroBlock = styled.section`
  max-width: 720px;
  padding-top: 8px;
`;

const Name = styled.h1`
  margin: 0 0 8px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.3;
`;

const RoleLine = styled.p`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: ${({ $theme }) => $theme.muted};
`;

const InlineLink = styled.a`
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-color: currentColor;

  &:hover {
    opacity: 0.72;
  }
`;

const Statement = styled.p`
  margin: 44px 0 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.26em;
  max-width: 620px;
  color: ${({ $theme }) => $theme.muted};
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(34px, 5vw, 54px);
  line-height: 1.1;
  letter-spacing: -0.03em;
`;

const StatementWord = styled.span`
  display: inline-block;
  opacity: 0;
  animation: ${revealUp} 700ms cubic-bezier(0.2, 0.65, 0.2, 1) forwards;
`;

const NavRow = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-bottom: 56px;
`;

const NavLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 2px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 16px;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-color: ${({ $theme }) => $theme.underline};
  transition: opacity 180ms ease, text-decoration-color 180ms ease;

  &:hover {
    opacity: 0.72;
  }
`;

const HeroImage = styled.a`
  display: block;
  margin-bottom: 88px;
  color: inherit;
`;

const ImageFrame = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 5 / 3;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transform: scale(1.01);
    transition: transform 300ms ease;
  }

  ${HeroImage}:hover & img {
    transform: scale(1.03);
  }
`;

const Section = styled.section`
  margin-bottom: 72px;
  scroll-margin-top: 28px;
`;

const SectionHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px 16px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.35;
`;

const SectionNote = styled.p`
  margin: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 13px;
  color: ${({ $theme }) => $theme.muted};
`;

const ExperienceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const ExperienceCard = styled.article`
  padding: 20px;
  border-radius: 20px;
  background: ${({ $theme }) => $theme.surface};
  border: 1px solid ${({ $theme }) => $theme.border};
  box-shadow: 0 24px 60px rgba(18, 55, 39, 0.06);
`;

const ExperienceTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
`;

const CardSubtitle = styled.p`
  margin: 4px 0 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 14px;
  line-height: 1.55;
  color: ${({ $theme }) => $theme.muted};
`;

const CardDate = styled.div`
  flex-shrink: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 13px;
  line-height: 1.4;
  color: ${({ $theme }) => $theme.muted};
`;

const CardBody = styled.p`
  margin: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 14px;
  line-height: 1.7;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled.a`
  color: inherit;
  display: block;
  padding: 18px;
  border-radius: 24px;
  background: ${({ $theme }) => $theme.surface};
  border: 1px solid ${({ $theme }) => $theme.border};
  box-shadow: 0 24px 60px rgba(18, 55, 39, 0.06);
  transition: transform 220ms ease, box-shadow 220ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 30px 70px rgba(18, 55, 39, 0.1);
  }
`;

const ProjectImageWrap = styled.div`
  overflow: hidden;
  border-radius: 16px;
  aspect-ratio: 16 / 10;
  margin-bottom: 14px;
  background: #eef1eb;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`;

const ProjectTitle = styled.h3`
  margin: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.35;
`;

const ProjectDate = styled.div`
  flex-shrink: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 13px;
  color: ${({ $theme }) => $theme.muted};
`;

const ProjectSummary = styled.p`
  margin: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 14px;
  line-height: 1.65;
  color: ${({ $theme }) => $theme.muted};
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 14px;
`;

const CompactCard = styled.article`
  padding: 18px 20px;
  border-radius: 18px;
  background: ${({ $theme }) => $theme.surface};
  border: 1px solid ${({ $theme }) => $theme.border};
`;

const ConnectCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 18px;
  border-radius: 18px;
  background: ${({ $theme }) => $theme.surface};
  border: 1px solid ${({ $theme }) => $theme.border};
`;

const ConnectLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  background: ${({ $theme }) => $theme.soft};
  font-family: 'Instrument Sans', sans-serif;
  font-size: 14px;
  line-height: 1;
  color: inherit;
  transition: opacity 180ms ease, transform 180ms ease;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
`;

const VolunteerList = styled.div`
  display: grid;
  gap: 10px;
`;

const VolunteerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid ${({ $theme }) => $theme.border};

  &:last-child {
    border-bottom: 1px solid ${({ $theme }) => $theme.border};
  }

  @media (max-width: 700px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const VolunteerDate = styled.div`
  flex-shrink: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 13px;
  color: ${({ $theme }) => $theme.muted};
`;
