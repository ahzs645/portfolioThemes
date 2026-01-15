import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function isActiveJob(entry) {
  // Job is active if end_date is "Present" or null/undefined
  if (!entry.end_date || isPresent(entry.end_date)) return true;
  // Also check positions array for any active position
  if (Array.isArray(entry.positions)) {
    return entry.positions.some(pos => !pos.end_date || isPresent(pos.end_date));
  }
  return false;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Present';
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const parts = dateStr.split('-');
  const year = parts[0] || '';
  const month = parts[1] ? months[parseInt(parts[1], 10) - 1] : '';
  if (month && year) return `${month} ${year}`;
  return year;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

// Timeline component for reuse
function TimelineList({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <Timeline>
      {items.map((item, idx) => {
        // Company header for grouped positions
        if (item.isHeader) {
          return (
            <TimelineItem key={`item-${idx}`}>
              <TimelineDot />
              <TimelineCard $featured={item.featured}>
                <CompanyHeader>{item.title}</CompanyHeader>
              </TimelineCard>
            </TimelineItem>
          );
        }

        // Nested position under a company
        if (item.isNested) {
          return (
            <TimelineItem key={`item-${idx}`} $nested>
              <TimelineDot $small />
              <TimelineCard $featured={item.featured} $nested>
                <TimelineHeader>
                  <TimelineTitle>{item.title}</TimelineTitle>
                  {(item.date || item.endDate) && (
                    <TimelineDate>
                      {item.date}{item.date && item.endDate && ' - '}{item.endDate}
                    </TimelineDate>
                  )}
                </TimelineHeader>
                {item.description && (
                  <TimelineDesc>{item.description}</TimelineDesc>
                )}
              </TimelineCard>
            </TimelineItem>
          );
        }

        // Regular item (job or project)
        return (
          <TimelineItem key={`item-${idx}`}>
            <TimelineDot />
            <TimelineCard $featured={item.featured}>
              <TimelineHeader>
                <TimelineTitle>
                  {item.url ? (
                    <TimelineTitleLink href={item.url} target="_blank" rel="noreferrer">
                      {item.title}
                    </TimelineTitleLink>
                  ) : (
                    item.title
                  )}
                </TimelineTitle>
                {(item.date || item.endDate) && (
                  <TimelineDate>
                    {item.date}{item.date && item.endDate && ' - '}{item.endDate}
                  </TimelineDate>
                )}
              </TimelineHeader>
              {item.description && (
                <TimelineDesc>{item.description}</TimelineDesc>
              )}
            </TimelineCard>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

export function PiTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const phone = cv?.phone || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  // Experience items - handle nested positions
  const experienceItems = useMemo(() => {
    const items = [];
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));

    for (const exp of experiences) {
      const active = isActiveJob(exp);

      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        // Has nested positions - show company as header then positions
        items.push({
          type: 'company',
          title: exp.company,
          description: '',
          date: '',
          url: null,
          featured: active,
          isHeader: true,
        });

        for (const pos of exp.positions) {
          const posActive = !pos.end_date || isPresent(pos.end_date);
          items.push({
            type: 'position',
            title: pos.title || pos.position,
            description: pos.summary || '',
            date: formatDate(pos.start_date),
            endDate: formatDate(pos.end_date),
            url: null,
            featured: posActive,
            isNested: true,
          });
        }
      } else {
        // Single position
        items.push({
          type: 'job',
          title: `${exp.position} at ${exp.company}`,
          description: exp.summary || '',
          date: formatDate(exp.start_date),
          endDate: formatDate(exp.end_date),
          url: null,
          featured: active,
        });
      }
    }

    return items.slice(0, 15);
  }, [cv]);

  // Volunteer items
  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || [])
      .filter(e => !isArchived(e))
      .slice(0, 10)
      .map(vol => {
        const role = vol.position || vol.role || 'Volunteer';
        const org = vol.organization || vol.company || '';
        const title = org ? `${role} at ${org}` : role;
        return {
          title,
          description: vol.summary || '',
          date: formatDate(vol.start_date),
          url: vol.url || null,
        };
      });
  }, [cv]);

  // Project items - no featuring
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || [])
      .filter(e => !isArchived(e))
      .slice(0, 10)
      .map(proj => ({
        title: proj.name,
        description: proj.summary || '',
        date: formatDate(proj.start_date),
        url: proj.url || null,
        featured: false, // Never feature projects
      }));
  }, [cv]);

  // Education items
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  // Skills items
  const skillItems = useMemo(() => {
    return cv?.sections?.skills || [];
  }, [cv]);

  // Award items
  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e));
  }, [cv]);

  // Presentation items
  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e));
  }, [cv]);

  // Publication items
  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  // Professional development items
  const professionalDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e));
  }, [cv]);

  return (
    <Container>
      <ContentWrapper>
        <Header>
          <Logo>{fullName}</Logo>
          <Nav>
            <NavLink href="#about" $active>Home</NavLink>
            {experienceItems.length > 0 && <NavLink href="#experience">Experience</NavLink>}
            {projectItems.length > 0 && <NavLink href="#projects">Projects</NavLink>}
            {email && <NavLink href={`mailto:${email}`}>Contact</NavLink>}
          </Nav>
        </Header>

        <AboutSection id="about">
          <AboutText>{aboutText || `${fullName} is a software developer and builder.`}</AboutText>
          {location && <AboutText>Based in {location}.</AboutText>}
        </AboutSection>

        {experienceItems.length > 0 && (
          <Section id="experience">
            <SectionTitle>Experience</SectionTitle>
            <TimelineWrapper>
              <TimelineList items={experienceItems} />
            </TimelineWrapper>
          </Section>
        )}

        {volunteerItems.length > 0 && (
          <Section id="volunteer">
            <SectionTitle>Volunteer</SectionTitle>
            <TimelineWrapper>
              <TimelineList items={volunteerItems} />
            </TimelineWrapper>
          </Section>
        )}

        {projectItems.length > 0 && (
          <Section id="projects">
            <SectionTitle>Projects</SectionTitle>
            <TimelineWrapper>
              <TimelineList items={projectItems} />
            </TimelineWrapper>
          </Section>
        )}

        {educationItems.length > 0 && (
          <Section id="education">
            <SectionTitle>Education</SectionTitle>
            <Grid>
              {educationItems.map((edu, idx) => (
                <GridItem key={`edu-${idx}`}>
                  {edu.degree} in {edu.area}, {edu.institution}
                </GridItem>
              ))}
            </Grid>
          </Section>
        )}

        {skillItems.length > 0 && (
          <Section id="skills">
            <SectionTitle>Skills</SectionTitle>
            <Grid $cols={3}>
              {skillItems.map((skill, idx) => (
                <GridItem key={`skill-${idx}`}>{skill.name}</GridItem>
              ))}
            </Grid>
          </Section>
        )}

        {awardItems.length > 0 && (
          <Section id="awards">
            <SectionTitle>Awards</SectionTitle>
            <TimelineWrapper>
              <TimelineList items={awardItems.map(award => ({
                title: award.name,
                description: award.summary || '',
                date: formatDate(award.date),
              }))} />
            </TimelineWrapper>
          </Section>
        )}

        {presentationItems.length > 0 && (
          <Section id="presentations">
            <SectionTitle>Presentations</SectionTitle>
            <TimelineWrapper>
              <TimelineList items={presentationItems.map(pres => ({
                title: pres.name,
                description: pres.location || pres.summary || '',
                date: formatDate(pres.date),
              }))} />
            </TimelineWrapper>
          </Section>
        )}

        {publicationItems.length > 0 && (
          <Section id="publications">
            <SectionTitle>Publications</SectionTitle>
            <TimelineWrapper>
              <TimelineList items={publicationItems.map(pub => ({
                title: pub.title || pub.name,
                description: pub.journal || pub.authors?.join(', ') || '',
                date: formatDate(pub.date || pub.releaseDate),
                url: pub.doi ? `https://doi.org/${pub.doi}` : pub.url,
              }))} />
            </TimelineWrapper>
          </Section>
        )}

        {professionalDevItems.length > 0 && (
          <Section id="professional-development">
            <SectionTitle>Professional Development</SectionTitle>
            <TimelineWrapper>
              <TimelineList items={professionalDevItems.map(item => ({
                title: item.name,
                description: item.location || item.summary || '',
                date: formatDate(item.date),
              }))} />
            </TimelineWrapper>
          </Section>
        )}

        <ContactText>
          {email && (
            <>
              If you'd like to get in touch, please{' '}
              <ContactLink href={`mailto:${email}`}>email me</ContactLink>
              {phone && (
                <> or <ContactLink href={`tel:${phone}`}>call me</ContactLink></>
              )}
              .
            </>
          )}
        </ContactText>

        {(twitterUrl || githubUrl || linkedinUrl) && (
          <ContactText>
            You can find me on{' '}
            {twitterUrl && <ContactLink href={twitterUrl} target="_blank" rel="noreferrer">Twitter</ContactLink>}
            {twitterUrl && githubUrl && ', '}
            {githubUrl && <ContactLink href={githubUrl} target="_blank" rel="noreferrer">GitHub</ContactLink>}
            {(twitterUrl || githubUrl) && linkedinUrl && ', and '}
            {linkedinUrl && <ContactLink href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</ContactLink>}
            .
          </ContactText>
        )}

        <Footer>
          <FooterBrand>{fullName}</FooterBrand>
        </Footer>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: #f5f4ef;
  color: #000;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 36rem;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 3rem;
  }
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Logo = styled.a`
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.875rem;
  color: inherit;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NavLink = styled.a`
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 8px;
  text-decoration-thickness: ${props => props.$active ? '2px' : '1px'};
  transition: text-decoration-thickness 0.2s ease;

  &:hover {
    text-decoration-thickness: 2px;
  }
`;

const AboutSection = styled.section`
  margin: 2rem 0;
`;

const AboutText = styled.p`
  margin: 0 0 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Section = styled.section`
  margin: 2rem 0;
`;

const SectionTitle = styled.h2`
  font-weight: 700;
  font-size: 14px;
  margin: 0 0 0.5rem;
`;

const TimelineWrapper = styled.div`
  padding-left: 0.5rem;
`;

const Timeline = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-left: 1px solid #d1d5db;
  padding: 1rem 0;

  &::before {
    content: '';
    position: absolute;
    left: -1px;
    top: 0;
    height: 1.5rem;
    width: 1px;
    background: linear-gradient(to bottom, #f5f4ef, transparent);
  }

  &::after {
    content: '';
    position: absolute;
    left: -1px;
    bottom: 0;
    height: 1.5rem;
    width: 1px;
    background: linear-gradient(to top, #f5f4ef, transparent);
  }
`;

const TimelineItem = styled.div`
  position: relative;
  margin-left: ${props => props.$nested ? '2.5rem' : '1.5rem'};
`;

const TimelineDot = styled.div`
  position: absolute;
  left: ${props => props.$small ? '-1.5rem' : '-2rem'};
  top: 0.5rem;
  width: ${props => props.$small ? '5px' : '7px'};
  height: ${props => props.$small ? '5px' : '7px'};
  background-color: ${props => props.$small ? '#686868' : '#111'};
  border-radius: 2px;
  outline: 2px solid #f5f4ef;
`;

const TimelineCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: ${props => props.$nested ? '0.5rem 0.75rem' : '0.75rem'};
  background-color: ${props => props.$featured ? '#fff' : 'transparent'};
  border: ${props => props.$featured ? '1px solid #000' : 'none'};
  box-shadow: ${props => props.$featured ? '3px 3px 0px #000' : 'none'};
  transition: box-shadow 0.2s ease, background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.$featured ? '#fff' : 'rgba(0, 0, 0, 0.02)'};
    box-shadow: ${props => props.$featured ? '5px 5px 0px #000' : 'none'};
  }
`;

const CompanyHeader = styled.div`
  font-size: 12px;
  font-weight: 700;
`;

const TimelineHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }
`;

const TimelineTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
`;

const TimelineTitleLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const TimelineDate = styled.span`
  font-size: 12px;
  color: #686868;
  white-space: nowrap;
  flex-shrink: 0;
`;

const TimelineDesc = styled.p`
  font-size: 12px;
  color: #686868;
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$cols || 2}, 1fr);
  gap: 0.25rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(${props => props.$cols || 3}, 1fr);
  }
`;

const GridItem = styled.div`
  font-size: 14px;
`;

const ContactText = styled.p`
  margin: 1rem 0;
`;

const ContactLink = styled.a`
  color: inherit;
  text-decoration: underline;

  &:hover {
    text-decoration-thickness: 2px;
  }
`;

const Footer = styled.footer`
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const FooterBrand = styled.p`
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.125rem;
  margin: 0;
`;
