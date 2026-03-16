import React, { useMemo, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { isPresent } from '../../utils/cvHelpers';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
`;

const palettes = {
  light: {
    background: '#f4f3ef',
    backgroundAccent: '#ffffff',
    surface: 'rgba(255, 255, 255, 0.9)',
    surfaceStrong: '#ffffff',
    sectionTint: '#eceae4',
    text: '#171717',
    muted: 'rgba(23, 23, 23, 0.62)',
    border: 'rgba(23, 23, 23, 0.08)',
    accent: '#2a29ff',
    accentSoft: 'rgba(42, 41, 255, 0.1)',
    lime: '#9ef34a',
    darkSurface: '#151515',
    darkSurfaceRaised: '#1c1c1f',
    darkText: '#f6f6f3',
    darkMuted: 'rgba(246, 246, 243, 0.68)',
    field: '#f1f0eb',
    shadow: '0 24px 70px rgba(10, 10, 10, 0.12)',
  },
  dark: {
    background: '#0c0c10',
    backgroundAccent: '#17171b',
    surface: 'rgba(20, 20, 24, 0.84)',
    surfaceStrong: '#141418',
    sectionTint: '#101014',
    text: '#f5f3ee',
    muted: 'rgba(245, 243, 238, 0.66)',
    border: 'rgba(255, 255, 255, 0.08)',
    accent: '#6f72ff',
    accentSoft: 'rgba(111, 114, 255, 0.18)',
    lime: '#baf56d',
    darkSurface: '#17171b',
    darkSurfaceRaised: '#222228',
    darkText: '#fbfaf7',
    darkMuted: 'rgba(251, 250, 247, 0.7)',
    field: '#101015',
    shadow: '0 28px 80px rgba(0, 0, 0, 0.34)',
  },
};

const floatCard = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-4deg); }
  50% { transform: translateY(-10px) rotate(-2deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.12); opacity: 0.76; }
`;

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PT';
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
}

function getFirstSentence(text = '') {
  const cleaned = String(text || '').trim();
  if (!cleaned) return '';
  const match = cleaned.match(/.*?[.!?](\s|$)/);
  return (match?.[0] || cleaned).trim();
}

function getSkillLabel(skill) {
  if (typeof skill === 'string') return skill;
  if (typeof skill?.name === 'string') return skill.name;
  if (typeof skill?.keyword === 'string') return skill.keyword;
  if (typeof skill?.label === 'string') return skill.label;
  return '';
}

function uniqueCompanies(experience = []) {
  return Array.from(
    new Set(
      experience
        .map(item => String(item?.company || '').trim())
        .filter(Boolean)
    )
  );
}

function joinList(items = []) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function stripPrefix(text = '') {
  return String(text)
    .replace(/^technologies\s*-\s*/i, '')
    .replace(/^tools\s*-\s*/i, '')
    .trim();
}

function trimText(text = '', maxLength = 132) {
  const clean = String(text || '').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}...`;
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return '';
  if (isPresent(dateValue)) return 'Present';

  const stringValue = String(dateValue);
  if (/^\d{4}$/.test(stringValue)) return stringValue;

  const [year, month] = stringValue.split('-');
  if (!month) return year || stringValue;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = months[Number(month) - 1];
  return monthLabel ? `${monthLabel} ${year}` : stringValue;
}

function formatDisplayRange(startDate, endDate) {
  const start = formatDisplayDate(startDate);
  const end = formatDisplayDate(endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
}

function getDisplayUrl(url) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return String(url).replace(/^https?:\/\//, '');
  }
}

function buildTopicLine(skills = []) {
  const labels = skills
    .map(getSkillLabel)
    .map(label => label.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (labels.length > 0) {
    return labels.join(' + ');
  }

  return 'research + engineering + product';
}

function buildHeroCopy(cv) {
  if (cv?.about) return cv.about;

  const companies = uniqueCompanies(cv?.experience || []).slice(0, 3);
  const companySentence = companies.length
    ? `Experience across ${joinList(companies)}.`
    : '';
  const roleSentence = cv?.currentJobTitle
    ? `Current focus: ${cv.currentJobTitle}.`
    : '';
  const locationSentence = cv?.location
    ? `Based in ${cv.location}.`
    : '';

  return [companySentence, roleSentence, locationSentence].filter(Boolean).join(' ');
}

function buildHighlightCards(cv) {
  const accentPairs = [
    ['#2a29ff', '#edf0ff'],
    ['#9ef34a', '#effbdc'],
    ['#0f172a', '#eef2f6'],
    ['#ff8660', '#fff0ea'],
  ];

  if (Array.isArray(cv?.projects) && cv.projects.length > 0) {
    return cv.projects.slice(0, 4).map((project, index) => ({
      id: `project-${index}`,
      title: project.name || 'Selected Project',
      body: trimText(project.summary || stripPrefix(project.highlights?.[0] || 'Selected work from the portfolio data.')),
      meta: project.date ? String(project.date) : 'Featured',
      detail: stripPrefix(project.highlights?.[0] || 'Project'),
      href: project.url || null,
      accent: accentPairs[index % accentPairs.length][0],
      tint: accentPairs[index % accentPairs.length][1],
    }));
  }

  return (cv?.experience || []).slice(0, 4).map((item, index) => ({
    id: `experience-${index}`,
    title: item.company || 'Selected Work',
    body: trimText(item.highlights?.[0] || item.title || 'Experience entry'),
    meta: item.isCurrent ? 'Current' : 'Experience',
    detail: formatDisplayRange(item.startDate, item.endDate) || item.title || 'Role',
    href: null,
    accent: accentPairs[index % accentPairs.length][0],
    tint: accentPairs[index % accentPairs.length][1],
  }));
}

function buildTrajectory(cv) {
  const experienceEntries = (cv?.experience || []).slice(0, 4).map((item, index) => ({
    id: `trajectory-exp-${index}`,
    eyebrow: formatDisplayRange(item.startDate, item.endDate) || 'Selected role',
    title: item.title || item.company || 'Experience',
    label: item.company || 'Company',
    summary: trimText(item.highlights?.[0] || 'Built and shipped meaningful work.', 150),
  }));

  if (experienceEntries.length >= 3) return experienceEntries;

  const educationEntries = (cv?.education || []).slice(0, 2).map((item, index) => ({
    id: `trajectory-edu-${index}`,
    eyebrow: formatDisplayRange(item.start_date, item.end_date) || 'Education',
    title: item.degree || 'Education',
    label: item.institution || item.area || 'Institution',
    summary: trimText(item.highlights?.[0] || item.area || 'Academic milestone', 150),
  }));

  return [...experienceEntries, ...educationEntries].slice(0, 4);
}

function buildContactLinks(cv) {
  const website = cv?.website || cv?.socialLinks?.website;

  return [
    cv?.email ? { label: 'Email', href: `mailto:${cv.email}` } : null,
    website ? { label: 'Website', href: website } : null,
    cv?.socialLinks?.linkedin ? { label: 'LinkedIn', href: cv.socialLinks.linkedin } : null,
    cv?.socialLinks?.github ? { label: 'GitHub', href: cv.socialLinks.github } : null,
    cv?.socialLinks?.twitter ? { label: 'X', href: cv.socialLinks.twitter } : null,
  ].filter(Boolean);
}

export function AysarTheme({ darkMode }) {
  const cv = useCV();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });

  const theme = darkMode ? palettes.dark : palettes.light;

  const heroCopy = useMemo(() => buildHeroCopy(cv), [cv]);
  const highlightCards = useMemo(() => buildHighlightCards(cv), [cv]);
  const trajectoryItems = useMemo(() => buildTrajectory(cv), [cv]);
  const contactLinks = useMemo(() => buildContactLinks(cv), [cv]);

  if (!cv) return null;

  const initials = getInitials(cv.name);
  const topicLine = buildTopicLine(cv.skills);
  const currentCompany = cv.experience?.[0]?.company || '';
  const heroHeadline = getFirstSentence(cv.about) || 'I build systems that move work forward.';
  const detailHeadline = currentCompany
    ? `Current work spans ${currentCompany} and adjacent high-context problems.`
    : 'A founder-style landing page tuned to the repo CV schema.';
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!cv.email) return;

    const subject = formState.name
      ? `Portfolio inquiry from ${formState.name}`
      : 'Portfolio inquiry';

    const bodyLines = [
      formState.name ? `Name: ${formState.name}` : '',
      formState.email ? `Email: ${formState.email}` : '',
      '',
      formState.message || 'Hi, I would like to connect about your work.',
    ].filter(Boolean);

    window.location.href = `mailto:${cv.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  };

  return (
    <Page $theme={theme}>
      <FontLoader />
      <Backdrop $theme={theme}>
        <GlowA $theme={theme} />
        <GlowB $theme={theme} />
      </Backdrop>

      <Shell>
        <HeaderPill $theme={theme}>
          <BrandMark $theme={theme} aria-hidden="true" />
          <HeaderLinks>
            <HeaderLink $theme={theme} href="#highlights">Highlights</HeaderLink>
            <HeaderLink $theme={theme} href="#trajectory">Trajectory</HeaderLink>
            <HeaderLink $theme={theme} href="#contact">Contact</HeaderLink>
          </HeaderLinks>
          <HeaderCTA $theme={theme} href="#contact">Reach out</HeaderCTA>
        </HeaderPill>

        <HeroSection>
          <BadgeWrap>
            <BadgeShadow $theme={theme} />
            <BrowserTop $theme={theme}>
              <BrowserStripe />
              <BrowserWindow />
              <BrowserEdge />
            </BrowserTop>

            <BadgeCard $theme={theme}>
              <CardPunch $theme={theme} />
              <BadgeSurface $theme={theme}>
                <BadgeRow>
                  <Identity>
                    <Avatar $theme={theme}>{initials}</Avatar>
                    <IdentityText>
                      <IdentityName $theme={theme}>{cv.name || 'Your Name'}</IdentityName>
                      <IdentityRole $theme={theme}>{cv.currentJobTitle || 'Portfolio Theme'}</IdentityRole>
                    </IdentityText>
                  </Identity>

                  <SocialRow>
                    {contactLinks.slice(0, 3).map((link) => (
                      <SocialPill
                        key={link.label}
                        $theme={theme}
                        href={link.href}
                        target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                      >
                        {link.label}
                      </SocialPill>
                    ))}
                  </SocialRow>
                </BadgeRow>

                <Availability $theme={theme}>
                  <AvailabilityDot $theme={theme} />
                  <div>
                    <AvailabilityTitle $theme={theme}>
                      {cv.location ? `Based in ${cv.location}` : 'Available worldwide'}
                    </AvailabilityTitle>
                    <AvailabilityMeta $theme={theme}>
                      {detailHeadline}
                    </AvailabilityMeta>
                  </div>
                </Availability>
              </BadgeSurface>
            </BadgeCard>
          </BadgeWrap>

          <HeroCopyBlock>
            <TopicPill $theme={theme}>{topicLine}</TopicPill>
            <HeroHeadline $theme={theme}>{heroHeadline}</HeroHeadline>
            <HeroBody $theme={theme}>{heroCopy}</HeroBody>

            <ActionRow>
              <PrimaryButton $theme={theme} href="#contact">
                Contact
                <ArrowBadge $theme={theme} aria-hidden="true">↗</ArrowBadge>
              </PrimaryButton>
              {(cv.website || cv.socialLinks?.linkedin || cv.socialLinks?.github) && (
                <SecondaryButton
                  $theme={theme}
                  href={cv.website || cv.socialLinks?.linkedin || cv.socialLinks?.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit {getDisplayUrl(cv.website || cv.socialLinks?.linkedin || cv.socialLinks?.github)}
                </SecondaryButton>
              )}
            </ActionRow>

            <LocationLine $theme={theme}>
              {cv.location
                ? `Currently based in ${cv.location}.`
                : 'Remote-friendly and available across time zones.'}
            </LocationLine>
          </HeroCopyBlock>
        </HeroSection>

        <Section id="highlights">
          <SectionHeader>
            <SectionEyebrow $theme={theme}>Highlights</SectionEyebrow>
            <SectionTitle $theme={theme}>A compact deck of notable work.</SectionTitle>
            <SectionBody $theme={theme}>
              This section reinterprets your portfolio entries into the card-heavy layout from the Aysar reference.
            </SectionBody>
          </SectionHeader>

          <HighlightGrid>
            {highlightCards.map((card) => (
              <HighlightCard
                key={card.id}
                $theme={theme}
                $tint={card.tint}
                as={card.href ? 'a' : 'div'}
                href={card.href || undefined}
                target={card.href ? '_blank' : undefined}
                rel={card.href ? 'noreferrer' : undefined}
              >
                <HighlightMeta>
                  <HighlightStatus style={{ color: card.accent }}>{card.meta}</HighlightStatus>
                  {card.href ? <HighlightArrow $theme={theme}>Open</HighlightArrow> : null}
                </HighlightMeta>
                <HighlightTitle $theme={theme}>{card.title}</HighlightTitle>
                <HighlightBody $theme={theme}>{card.body}</HighlightBody>
                <HighlightFooter $theme={theme}>{card.detail}</HighlightFooter>
              </HighlightCard>
            ))}
          </HighlightGrid>
        </Section>

        <DarkSection id="trajectory" $theme={theme}>
          <DarkGrid>
            <DarkIntro>
              <SectionEyebrow $theme={theme}>Trajectory</SectionEyebrow>
              <DarkTitle $theme={theme}>0-1 pedigree, rebuilt for CV.yaml.</DarkTitle>
              <DarkBody $theme={theme}>
                {cv.about
                  ? trimText(cv.about, 220)
                  : 'A dark, rounded section that turns your experience history into a concise reel of roles, milestones, and execution depth.'}
              </DarkBody>

              <PortraitCard $theme={theme}>
                <PortraitOrb $theme={theme}>
                  <PortraitInitials>{initials}</PortraitInitials>
                </PortraitOrb>
                <PortraitText>
                  <PortraitName $theme={theme}>{cv.name || 'Your Name'}</PortraitName>
                  <PortraitRole $theme={theme}>{cv.currentJobTitle || 'Professional Summary'}</PortraitRole>
                </PortraitText>
              </PortraitCard>
            </DarkIntro>

            <Timeline>
              {trajectoryItems.map((item) => (
                <TimelineItem key={item.id} $theme={theme}>
                  <TimelineEyebrow $theme={theme}>{item.eyebrow}</TimelineEyebrow>
                  <TimelineTitle $theme={theme}>{item.title}</TimelineTitle>
                  <TimelineLabel $theme={theme}>{item.label}</TimelineLabel>
                  <TimelineBody $theme={theme}>{item.summary}</TimelineBody>
                </TimelineItem>
              ))}
            </Timeline>
          </DarkGrid>
        </DarkSection>

        <ContactSection id="contact" $theme={theme}>
          <ContactPanel $theme={theme}>
            <ContactIntro>
              <SectionEyebrow $theme={theme}>Contact</SectionEyebrow>
              <ContactTitle $theme={theme}>Fill out the form, or reach out directly.</ContactTitle>
              <ContactBody $theme={theme}>
                {cv.email
                  ? `Messages route to ${cv.email}.`
                  : 'No email is present in the current CV, so direct links are shown instead.'}
              </ContactBody>
              <DirectLinks>
                {contactLinks.map((link) => (
                  <DirectLink
                    key={link.label}
                    $theme={theme}
                    href={link.href}
                    target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  >
                    {link.label}
                  </DirectLink>
                ))}
              </DirectLinks>
            </ContactIntro>

            {cv.email ? (
              <ContactForm $theme={theme} onSubmit={handleFormSubmit}>
                <Field
                  $theme={theme}
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formState.name}
                  onChange={handleFormChange}
                />
                <Field
                  $theme={theme}
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formState.email}
                  onChange={handleFormChange}
                />
                <MessageField
                  $theme={theme}
                  name="message"
                  placeholder="Message"
                  value={formState.message}
                  onChange={handleFormChange}
                />
                <SubmitButton $theme={theme} type="submit">Send message</SubmitButton>
              </ContactForm>
            ) : (
              <FallbackNote $theme={theme}>
                Add `cv.email` to `public/CV.yaml` to enable the mail composer.
              </FallbackNote>
            )}
          </ContactPanel>
        </ContactSection>
      </Shell>
    </Page>
  );
}

const Page = styled.div`
  position: relative;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, ${props => props.$theme.accentSoft}, transparent 35%),
    linear-gradient(180deg, ${props => props.$theme.backgroundAccent} 0%, ${props => props.$theme.background} 100%);
  color: ${props => props.$theme.text};
  overflow: hidden;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const GlowA = styled.div`
  position: absolute;
  top: 120px;
  right: -120px;
  width: 360px;
  height: 360px;
  border-radius: 999px;
  background: ${props => props.$theme.accentSoft};
  filter: blur(24px);
`;

const GlowB = styled.div`
  position: absolute;
  left: -100px;
  bottom: 240px;
  width: 300px;
  height: 300px;
  border-radius: 999px;
  background: rgba(158, 243, 74, 0.12);
  filter: blur(28px);
`;

const Shell = styled.div`
  position: relative;
  max-width: 1160px;
  margin: 0 auto;
  padding: 28px 20px 72px;

  @media (max-width: 768px) {
    padding: 20px 14px 56px;
  }
`;

const HeaderPill = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 14px;
  border: 1px solid ${props => props.$theme.border};
  border-radius: 999px;
  background: ${props => props.$theme.surface};
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.$theme.shadow};
  margin-bottom: 54px;

  @media (max-width: 700px) {
    flex-wrap: wrap;
    border-radius: 28px;
  }
`;

const BrandMark = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: ${props => props.$theme.accent};
  box-shadow: 0 0 0 4px ${props => props.$theme.accentSoft};
  flex-shrink: 0;
`;

const HeaderLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  flex: 1;
  min-width: 240px;

  @media (max-width: 700px) {
    order: 3;
    justify-content: flex-start;
    width: 100%;
    flex-wrap: wrap;
  }
`;

const HeaderLink = styled.a`
  color: ${props => props.$theme.muted};
  text-decoration: none;
  font: 600 13px/1 'Manrope', sans-serif;
  letter-spacing: -0.03em;

  &:hover {
    color: ${props => props.$theme.text};
  }
`;

const HeaderCTA = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  background: ${props => props.$theme.surfaceStrong};
  color: ${props => props.$theme.text};
  text-decoration: none;
  font: 700 14px/1 'Manrope', sans-serif;
  box-shadow: inset 0 0 0 1px ${props => props.$theme.border};
`;

const HeroSection = styled.section`
  display: grid;
  grid-template-columns: minmax(280px, 400px) minmax(0, 1fr);
  align-items: center;
  gap: 56px;
  margin-bottom: 72px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`;

const BadgeWrap = styled.div`
  position: relative;
  padding-top: 40px;
`;

const BadgeShadow = styled.div`
  position: absolute;
  inset: 70px 18px 10px;
  border-radius: 42px;
  background: ${props => props.$theme.accentSoft};
  filter: blur(26px);
`;

const BrowserTop = styled.div`
  position: absolute;
  top: 0;
  left: 46%;
  width: 110px;
  height: 62px;
  transform: translateX(-50%) rotate(-5deg);
  animation: ${floatCard} 5s ease-in-out infinite;
`;

const BrowserStripe = styled.div`
  position: absolute;
  top: 0;
  left: 10px;
  right: 10px;
  height: 8px;
  border-radius: 999px;
  background: #2a29ff;
`;

const BrowserWindow = styled.div`
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  height: 16px;
  border-radius: 6px;
  background: #151515;
`;

const BrowserEdge = styled.div`
  position: absolute;
  top: 22px;
  left: 8px;
  right: 8px;
  bottom: 0;
  border-radius: 4px;
  background: linear-gradient(180deg, #080808 0%, #2d2d2d 100%);
`;

const BadgeCard = styled.div`
  position: relative;
  padding: 16px;
  border-radius: 38px;
  background: ${props => props.$theme.surfaceStrong};
  box-shadow: ${props => props.$theme.shadow};
  border: 1px solid ${props => props.$theme.border};
`;

const CardPunch = styled.div`
  position: absolute;
  top: 14px;
  left: 50%;
  width: 18px;
  height: 18px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: ${props => props.$theme.sectionTint};
  box-shadow: inset 0 0 0 1px ${props => props.$theme.border};
`;

const BadgeSurface = styled.div`
  padding: 34px 22px 22px;
  border-radius: 30px;
  background:
    radial-gradient(circle at top right, rgba(158, 243, 74, 0.2), transparent 35%),
    ${props => props.$theme.surfaceStrong};
  box-shadow: inset 0 0 0 1px ${props => props.$theme.border};
`;

const BadgeRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Avatar = styled.div`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, ${props => props.$theme.accent} 0%, ${props => props.$theme.lime} 100%);
  color: #ffffff;
  font: 800 20px/1 'Manrope', sans-serif;
  letter-spacing: -0.06em;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
`;

const IdentityText = styled.div`
  min-width: 0;
`;

const IdentityName = styled.div`
  color: ${props => props.$theme.text};
  font: 800 clamp(22px, 3vw, 28px)/1.05 'Manrope', sans-serif;
  letter-spacing: -0.06em;
`;

const IdentityRole = styled.div`
  margin-top: 6px;
  color: ${props => props.$theme.muted};
  font: 600 14px/1.4 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const SocialRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SocialPill = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: ${props => props.$theme.backgroundAccent};
  color: ${props => props.$theme.muted};
  text-decoration: none;
  font: 700 12px/1 'Manrope', sans-serif;
  letter-spacing: -0.03em;
  box-shadow: inset 0 0 0 1px ${props => props.$theme.border};
`;

const Availability = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 24px;
  background: ${props => props.$theme.sectionTint};
  box-shadow: inset 0 0 0 1px ${props => props.$theme.border};
`;

const AvailabilityDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex-shrink: 0;
  margin-top: 5px;
  background: ${props => props.$theme.lime};
  animation: ${pulse} 2.8s ease-in-out infinite;
`;

const AvailabilityTitle = styled.div`
  color: ${props => props.$theme.text};
  font: 700 15px/1.2 'Manrope', sans-serif;
  letter-spacing: -0.04em;
`;

const AvailabilityMeta = styled.div`
  margin-top: 4px;
  color: ${props => props.$theme.muted};
  font: 600 13px/1.45 'Manrope', sans-serif;
`;

const HeroCopyBlock = styled.div`
  max-width: 670px;
`;

const TopicPill = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: ${props => props.$theme.surface};
  color: ${props => props.$theme.text};
  border: 1px solid ${props => props.$theme.border};
  font: 700 13px/1 'Manrope', sans-serif;
  letter-spacing: -0.04em;
  text-transform: lowercase;
  box-shadow: ${props => props.$theme.shadow};
`;

const HeroHeadline = styled.h1`
  margin: 18px 0 16px;
  color: ${props => props.$theme.text};
  font: 800 clamp(44px, 7vw, 78px)/0.96 'Manrope', sans-serif;
  letter-spacing: -0.08em;
`;

const HeroBody = styled.p`
  max-width: 640px;
  margin: 0;
  color: ${props => props.$theme.muted};
  font: 600 clamp(17px, 2.3vw, 20px)/1.6 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
`;

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 0 10px 0 22px;
  border-radius: 999px;
  background: ${props => props.$theme.accent};
  color: #ffffff;
  text-decoration: none;
  font: 700 16px/1 'Manrope', sans-serif;
  letter-spacing: -0.04em;
`;

const ArrowBadge = styled.span`
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
`;

const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  padding: 0 22px;
  border-radius: 999px;
  background: ${props => props.$theme.surface};
  color: ${props => props.$theme.text};
  text-decoration: none;
  font: 700 16px/1 'Manrope', sans-serif;
  letter-spacing: -0.04em;
  box-shadow: inset 0 0 0 1px ${props => props.$theme.border};
`;

const LocationLine = styled.p`
  margin: 20px 0 0;
  color: ${props => props.$theme.muted};
  font: 600 14px/1.5 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const Section = styled.section`
  margin-bottom: 72px;
`;

const SectionHeader = styled.div`
  max-width: 640px;
  margin-bottom: 26px;
`;

const SectionEyebrow = styled.div`
  color: ${props => props.$theme.accent};
  font: 800 13px/1 'Manrope', sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const SectionTitle = styled.h2`
  margin: 14px 0 12px;
  color: ${props => props.$theme.text};
  font: 800 clamp(30px, 4vw, 46px)/1.02 'Manrope', sans-serif;
  letter-spacing: -0.07em;
`;

const SectionBody = styled.p`
  margin: 0;
  color: ${props => props.$theme.muted};
  font: 600 16px/1.6 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const HighlightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightCard = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 240px;
  padding: 22px;
  border-radius: 30px;
  background: linear-gradient(180deg, ${props => props.$tint} 0%, ${props => props.$theme.surfaceStrong} 100%);
  box-shadow: ${props => props.$theme.shadow};
  border: 1px solid ${props => props.$theme.border};
  text-decoration: none;
`;

const HighlightMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const HighlightStatus = styled.div`
  font: 800 12px/1 'Manrope', sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const HighlightArrow = styled.div`
  color: ${props => props.$theme.muted};
  font: 700 12px/1 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const HighlightTitle = styled.h3`
  margin: 18px 0 12px;
  color: ${props => props.$theme.text};
  font: 800 28px/1.02 'Manrope', sans-serif;
  letter-spacing: -0.07em;
`;

const HighlightBody = styled.p`
  margin: 0;
  color: ${props => props.$theme.muted};
  font: 600 15px/1.55 'Manrope', sans-serif;
  letter-spacing: -0.03em;
  flex: 1;
`;

const HighlightFooter = styled.div`
  margin-top: 20px;
  color: ${props => props.$theme.text};
  font: 700 13px/1.4 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const DarkSection = styled.section`
  margin-bottom: 72px;
  padding: 26px;
  border-radius: 42px;
  background:
    radial-gradient(circle at top right, rgba(111, 114, 255, 0.24), transparent 32%),
    linear-gradient(180deg, ${props => props.$theme.darkSurfaceRaised} 0%, ${props => props.$theme.darkSurface} 100%);
  border: 1px solid ${props => props.$theme.border};
  box-shadow: ${props => props.$theme.shadow};

  @media (max-width: 768px) {
    padding: 18px;
    border-radius: 30px;
  }
`;

const DarkGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
  gap: 22px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const DarkIntro = styled.div`
  padding: 18px;
`;

const DarkTitle = styled.h2`
  margin: 14px 0 12px;
  color: ${props => props.$theme.darkText};
  font: 800 clamp(32px, 4vw, 50px)/1.02 'Manrope', sans-serif;
  letter-spacing: -0.07em;
`;

const DarkBody = styled.p`
  margin: 0;
  color: ${props => props.$theme.darkMuted};
  font: 600 16px/1.65 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const PortraitCard = styled.div`
  margin-top: 24px;
  padding: 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
`;

const PortraitOrb = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.18), transparent 28%),
    linear-gradient(135deg, ${props => props.$theme.accent} 0%, rgba(158, 243, 74, 0.8) 100%);
`;

const PortraitInitials = styled.div`
  color: #ffffff;
  font: 800 clamp(36px, 9vw, 68px)/1 'Manrope', sans-serif;
  letter-spacing: -0.1em;
`;

const PortraitText = styled.div`
  margin-top: 16px;
`;

const PortraitName = styled.div`
  color: ${props => props.$theme.darkText};
  font: 800 24px/1.04 'Manrope', sans-serif;
  letter-spacing: -0.06em;
`;

const PortraitRole = styled.div`
  margin-top: 6px;
  color: ${props => props.$theme.darkMuted};
  font: 600 14px/1.5 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const Timeline = styled.div`
  display: grid;
  gap: 14px;
`;

const TimelineItem = styled.div`
  padding: 22px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
`;

const TimelineEyebrow = styled.div`
  color: ${props => props.$theme.lime};
  font: 800 12px/1 'Manrope', sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const TimelineTitle = styled.h3`
  margin: 14px 0 6px;
  color: ${props => props.$theme.darkText};
  font: 800 26px/1.02 'Manrope', sans-serif;
  letter-spacing: -0.07em;
`;

const TimelineLabel = styled.div`
  color: ${props => props.$theme.darkMuted};
  font: 700 14px/1.4 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const TimelineBody = styled.p`
  margin: 14px 0 0;
  color: ${props => props.$theme.darkMuted};
  font: 600 15px/1.6 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const ContactSection = styled.section`
  margin-bottom: 24px;
`;

const ContactPanel = styled.div`
  display: grid;
  grid-template-columns: minmax(250px, 380px) minmax(0, 1fr);
  gap: 24px;
  padding: 24px;
  border-radius: 38px;
  background: ${props => props.$theme.sectionTint};
  box-shadow: ${props => props.$theme.shadow};
  border: 1px solid ${props => props.$theme.border};

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    padding: 18px;
    border-radius: 28px;
  }
`;

const ContactIntro = styled.div`
  padding: 10px 6px;
`;

const ContactTitle = styled.h2`
  margin: 14px 0 10px;
  color: ${props => props.$theme.text};
  font: 800 clamp(28px, 3.6vw, 42px)/1.04 'Manrope', sans-serif;
  letter-spacing: -0.07em;
`;

const ContactBody = styled.p`
  margin: 0;
  color: ${props => props.$theme.muted};
  font: 600 16px/1.6 'Manrope', sans-serif;
  letter-spacing: -0.03em;
`;

const DirectLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
`;

const DirectLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  background: ${props => props.$theme.surfaceStrong};
  color: ${props => props.$theme.text};
  text-decoration: none;
  font: 700 13px/1 'Manrope', sans-serif;
  box-shadow: inset 0 0 0 1px ${props => props.$theme.border};
`;

const ContactForm = styled.form`
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 30px;
  background: ${props => props.$theme.surfaceStrong};
  box-shadow: inset 0 0 0 1px ${props => props.$theme.border};
`;

const Field = styled.input`
  width: 100%;
  min-height: 54px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.$theme.field};
  color: ${props => props.$theme.text};
  font: 600 15px/1 'Manrope', sans-serif;
  letter-spacing: -0.03em;
  outline: none;

  &::placeholder {
    color: ${props => props.$theme.muted};
  }
`;

const MessageField = styled.textarea`
  width: 100%;
  min-height: 170px;
  padding: 18px;
  border: 0;
  border-radius: 26px;
  background: ${props => props.$theme.field};
  color: ${props => props.$theme.text};
  font: 600 15px/1.6 'Manrope', sans-serif;
  letter-spacing: -0.03em;
  resize: vertical;
  outline: none;

  &::placeholder {
    color: ${props => props.$theme.muted};
  }
`;

const SubmitButton = styled.button`
  min-height: 58px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.$theme.accent};
  color: #ffffff;
  font: 700 16px/1 'Manrope', sans-serif;
  letter-spacing: -0.04em;
  cursor: pointer;
`;

const FallbackNote = styled.div`
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: 24px;
  border-radius: 30px;
  background: ${props => props.$theme.surfaceStrong};
  color: ${props => props.$theme.muted};
  font: 600 15px/1.6 'Manrope', sans-serif;
  letter-spacing: -0.03em;
  text-align: center;
  box-shadow: inset 0 0 0 1px ${props => props.$theme.border};
`;
