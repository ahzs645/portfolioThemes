import React, { useMemo, useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function formatYear(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Present';
  const yearMatch = String(dateStr).match(/\d{4}/);
  return yearMatch ? yearMatch[0] : dateStr;
}

export function DmythroTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const fullName = cv?.name || 'Your Name';
  const avatarUrl = cv?.avatar || null;
  const location = cv?.location || null;
  const email = cv?.email || null;
  const phone = cv?.phone || null;

  const socials = cv?.social || [];
  const aboutText = getAboutContent()?.markdown || '';

  // Current position
  const currentPosition = useMemo(() => {
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));
    if (experiences.length > 0) {
      const first = experiences[0];
      if (Array.isArray(first.positions) && first.positions.length > 0) {
        return first.positions[0]?.title || first.positions[0]?.position || '';
      }
      return first.position || '';
    }
    return '';
  }, [cv]);

  // Experience items for timeline - with nesting support
  const experienceItems = useMemo(() => {
    const items = [];
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));

    for (const exp of experiences) {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        // Company with nested positions
        items.push({
          type: 'company',
          company: exp.company,
          url: exp.url,
          location: exp.location,
          positions: exp.positions.map(pos => ({
            title: pos.title || pos.position,
            startDate: formatYear(pos.start_date),
            endDate: formatYear(pos.end_date),
            summary: pos.summary,
            isHighlighted: pos.highlighted,
          })),
        });
      } else {
        // Single position
        items.push({
          type: 'single',
          company: exp.company,
          title: exp.position,
          startDate: formatYear(exp.start_date),
          endDate: formatYear(exp.end_date),
          summary: exp.summary,
          url: exp.url,
          location: exp.location,
          isHighlighted: exp.highlighted,
        });
      }
    }

    return items.slice(0, 10);
  }, [cv]);

  // Volunteer items
  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  // Education items
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  // Publication items
  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  // Awards items
  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e));
  }, [cv]);

  // Presentations items
  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e));
  }, [cv]);

  // Professional Development items
  const professionalDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e));
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 6);
  }, [cv]);

  // Skills
  const skills = useMemo(() => {
    return (cv?.sections?.skills || []).filter(e => !isArchived(e));
  }, [cv]);

  // Accordion state
  const [openSections, setOpenSections] = useState(['experience']);

  const toggleSection = (sectionId) => {
    setOpenSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggleDarkMode = () => setIsDark(prev => !prev);

  const theme = { isDark };

  // Timeline block renderer
  const renderTimelineBlock = (item, idx) => {
    if (item.type === 'company') {
      // Nested positions under company
      return (
        <TimelineBlock key={`exp-${idx}`}>
          <TimelineBlockContent>
            <TimelineChip>
              {item.positions[0]?.startDate && item.positions[item.positions.length - 1]?.endDate ? (
                <TimelineChipContent>
                  <span>{item.positions[item.positions.length - 1]?.startDate || item.positions[0]?.startDate}</span>
                  <TimelineArrow>&rarr;</TimelineArrow>
                  <span>{item.positions[0]?.endDate}</span>
                </TimelineChipContent>
              ) : (
                item.positions[0]?.startDate || item.positions[0]?.endDate
              )}
            </TimelineChip>
            <TimelineDetails>
              <TimelineCompany>
                {item.url ? (
                  <TimelineCompanyLink href={item.url} target="_blank" rel="noopener">
                    {item.company}
                  </TimelineCompanyLink>
                ) : item.company}
                {item.location && <TimelineLocation> &ndash; {item.location}</TimelineLocation>}
              </TimelineCompany>
              {item.positions.map((pos, posIdx) => (
                <NestedPosition key={posIdx}>
                  <NestedPositionHeader>
                    <NestedPositionTitle $isHighlighted={pos.isHighlighted}>
                      {pos.title}
                    </NestedPositionTitle>
                    <NestedPositionDates>
                      {pos.startDate} - {pos.endDate}
                    </NestedPositionDates>
                  </NestedPositionHeader>
                  {pos.summary && (
                    <TimelineDescription>{pos.summary}</TimelineDescription>
                  )}
                </NestedPosition>
              ))}
            </TimelineDetails>
          </TimelineBlockContent>
        </TimelineBlock>
      );
    }

    // Single position
    return (
      <TimelineBlock key={`exp-${idx}`}>
        <TimelineBlockContent>
          <TimelineChip>
            {item.startDate && item.endDate ? (
              <TimelineChipContent>
                <span>{item.startDate}</span>
                <TimelineArrow>&rarr;</TimelineArrow>
                <span>{item.endDate}</span>
              </TimelineChipContent>
            ) : (
              item.startDate || item.endDate
            )}
          </TimelineChip>
          <TimelineDetails>
            <TimelineTitle $isHighlighted={item.isHighlighted}>
              {item.title}
            </TimelineTitle>
            <TimelineSubtitle>
              {item.url ? (
                <TimelineCompanyLink href={item.url} target="_blank" rel="noopener">
                  {item.company}
                </TimelineCompanyLink>
              ) : item.company}
              {item.location && <TimelineLocation> &ndash; {item.location}</TimelineLocation>}
            </TimelineSubtitle>
            {item.summary && (
              <TimelineDescription>{item.summary}</TimelineDescription>
            )}
          </TimelineDetails>
        </TimelineBlockContent>
      </TimelineBlock>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        {/* Header */}
        <Header>
          <HeaderContent>
            <HeaderName href="#">{fullName}</HeaderName>
            <NavGroup>
              <Nav>
                <NavLink href="#experience">Experience</NavLink>
                <NavLink href="#projects">Projects</NavLink>
                <NavLink href="#links">Links</NavLink>
              </Nav>
              <ThemeToggle onClick={toggleDarkMode} aria-label="Toggle dark mode">
                {isDark ? <SunIcon /> : <MoonIcon />}
              </ThemeToggle>
            </NavGroup>
          </HeaderContent>
        </Header>

      <MainLayout>
        <ContentColumn>
          {/* About Section - Always visible */}
          {aboutText && (
            <AboutSection>
              <AboutText>{aboutText}</AboutText>
            </AboutSection>
          )}

          {/* Experience Accordion */}
          <AccordionSection id="experience">
            <AccordionHeader
              onClick={() => toggleSection('experience')}
              $isOpen={openSections.includes('experience')}
            >
              <AccordionIcon>
                <BriefcaseIcon />
              </AccordionIcon>
              <AccordionTitleGroup>
                <AccordionTitle>Experience</AccordionTitle>
                <AccordionSubtitle>Career timeline and work history</AccordionSubtitle>
              </AccordionTitleGroup>
              <AccordionArrow $isOpen={openSections.includes('experience')}>
                <ChevronIcon />
              </AccordionArrow>
            </AccordionHeader>

            {openSections.includes('experience') && experienceItems.length > 0 && (
              <AccordionContent>
                {skills.length > 0 && (
                  <SkillsSection>
                    <SkillsTitle>Skills</SkillsTitle>
                    <SkillsGrid>
                      {skills.map((skill, idx) => (
                        <SkillChip key={idx}>{skill.name || skill}</SkillChip>
                      ))}
                    </SkillsGrid>
                  </SkillsSection>
                )}

                <TimelineSection>
                  <TimelineSectionTitle>Career Timeline</TimelineSectionTitle>
                  <Timeline>
                    {experienceItems.map((item, idx) =>
                      renderTimelineBlock(item, idx)
                    )}
                  </Timeline>
                </TimelineSection>
              </AccordionContent>
            )}
          </AccordionSection>

          {/* Volunteer Accordion */}
          {volunteerItems.length > 0 && (
            <AccordionSection id="volunteer">
              <AccordionHeader
                onClick={() => toggleSection('volunteer')}
                $isOpen={openSections.includes('volunteer')}
              >
                <AccordionIcon>
                  <HeartIcon />
                </AccordionIcon>
                <AccordionTitleGroup>
                  <AccordionTitle>Volunteer</AccordionTitle>
                  <AccordionSubtitle>Community involvement and giving back</AccordionSubtitle>
                </AccordionTitleGroup>
                <AccordionArrow $isOpen={openSections.includes('volunteer')}>
                  <ChevronIcon />
                </AccordionArrow>
              </AccordionHeader>

              {openSections.includes('volunteer') && (
                <AccordionContent>
                  <Timeline>
                    {volunteerItems.map((vol, idx) => (
                      <TimelineBlock key={`vol-${idx}`}>
                        <TimelineBlockContent>
                          <TimelineChip>
                            {formatYear(vol.start_date) && formatYear(vol.end_date) ? (
                              <TimelineChipContent>
                                <span>{formatYear(vol.start_date)}</span>
                                <TimelineArrow>&rarr;</TimelineArrow>
                                <span>{formatYear(vol.end_date)}</span>
                              </TimelineChipContent>
                            ) : (
                              formatYear(vol.start_date) || formatYear(vol.end_date)
                            )}
                          </TimelineChip>
                          <TimelineDetails>
                            <TimelineTitle>{vol.position || vol.role}</TimelineTitle>
                            <TimelineSubtitle>
                              {vol.url ? (
                                <TimelineCompanyLink href={vol.url} target="_blank" rel="noopener">
                                  {vol.organization}
                                </TimelineCompanyLink>
                              ) : vol.organization}
                            </TimelineSubtitle>
                            {vol.summary && (
                              <TimelineDescription>{vol.summary}</TimelineDescription>
                            )}
                          </TimelineDetails>
                        </TimelineBlockContent>
                      </TimelineBlock>
                    ))}
                  </Timeline>
                </AccordionContent>
              )}
            </AccordionSection>
          )}

          {/* Education Accordion */}
          {educationItems.length > 0 && (
            <AccordionSection id="education">
              <AccordionHeader
                onClick={() => toggleSection('education')}
                $isOpen={openSections.includes('education')}
              >
                <AccordionIcon>
                  <GraduationIcon />
                </AccordionIcon>
                <AccordionTitleGroup>
                  <AccordionTitle>Education</AccordionTitle>
                  <AccordionSubtitle>Academic background and certifications</AccordionSubtitle>
                </AccordionTitleGroup>
                <AccordionArrow $isOpen={openSections.includes('education')}>
                  <ChevronIcon />
                </AccordionArrow>
              </AccordionHeader>

              {openSections.includes('education') && (
                <AccordionContent>
                  <Timeline>
                    {educationItems.map((edu, idx) => (
                      <TimelineBlock key={`edu-${idx}`}>
                        <TimelineBlockContent>
                          <TimelineChip>
                            {formatYear(edu.start_date) && formatYear(edu.end_date) ? (
                              <TimelineChipContent>
                                <span>{formatYear(edu.start_date)}</span>
                                <TimelineArrow>&rarr;</TimelineArrow>
                                <span>{formatYear(edu.end_date)}</span>
                              </TimelineChipContent>
                            ) : (
                              formatYear(edu.start_date) || formatYear(edu.end_date) || formatYear(edu.graduation_date)
                            )}
                          </TimelineChip>
                          <TimelineDetails>
                            <TimelineTitle>{edu.degree || edu.area}</TimelineTitle>
                            <TimelineSubtitle>
                              {edu.url ? (
                                <TimelineCompanyLink href={edu.url} target="_blank" rel="noopener">
                                  {edu.institution}
                                </TimelineCompanyLink>
                              ) : edu.institution}
                              {edu.location && <TimelineLocation> &ndash; {edu.location}</TimelineLocation>}
                            </TimelineSubtitle>
                            {edu.summary && (
                              <TimelineDescription>{edu.summary}</TimelineDescription>
                            )}
                          </TimelineDetails>
                        </TimelineBlockContent>
                      </TimelineBlock>
                    ))}
                  </Timeline>
                </AccordionContent>
              )}
            </AccordionSection>
          )}

          {/* Publications Accordion */}
          {publicationItems.length > 0 && (
            <AccordionSection id="publications">
              <AccordionHeader
                onClick={() => toggleSection('publications')}
                $isOpen={openSections.includes('publications')}
              >
                <AccordionIcon>
                  <BookIcon />
                </AccordionIcon>
                <AccordionTitleGroup>
                  <AccordionTitle>Publications</AccordionTitle>
                  <AccordionSubtitle>Articles, papers, and written work</AccordionSubtitle>
                </AccordionTitleGroup>
                <AccordionArrow $isOpen={openSections.includes('publications')}>
                  <ChevronIcon />
                </AccordionArrow>
              </AccordionHeader>

              {openSections.includes('publications') && (
                <AccordionContent>
                  <Timeline>
                    {publicationItems.map((pub, idx) => (
                      <TimelineBlock key={`pub-${idx}`}>
                        <TimelineBlockContent>
                          <TimelineChip>
                            {formatYear(pub.date || pub.releaseDate)}
                          </TimelineChip>
                          <TimelineDetails>
                            <TimelineTitle>
                              {pub.url || pub.doi ? (
                                <TimelineCompanyLink href={pub.url || `https://doi.org/${pub.doi}`} target="_blank" rel="noopener">
                                  {pub.name || pub.title}
                                </TimelineCompanyLink>
                              ) : (pub.name || pub.title)}
                            </TimelineTitle>
                            {(pub.publisher || pub.journal) && (
                              <TimelineSubtitle>{pub.publisher || pub.journal}</TimelineSubtitle>
                            )}
                            {pub.summary && (
                              <TimelineDescription>{pub.summary}</TimelineDescription>
                            )}
                          </TimelineDetails>
                        </TimelineBlockContent>
                      </TimelineBlock>
                    ))}
                  </Timeline>
                </AccordionContent>
              )}
            </AccordionSection>
          )}

          {/* Awards Accordion */}
          {awardItems.length > 0 && (
            <AccordionSection id="awards">
              <AccordionHeader
                onClick={() => toggleSection('awards')}
                $isOpen={openSections.includes('awards')}
              >
                <AccordionIcon>
                  <TrophyIcon />
                </AccordionIcon>
                <AccordionTitleGroup>
                  <AccordionTitle>Awards</AccordionTitle>
                  <AccordionSubtitle>Recognition and achievements</AccordionSubtitle>
                </AccordionTitleGroup>
                <AccordionArrow $isOpen={openSections.includes('awards')}>
                  <ChevronIcon />
                </AccordionArrow>
              </AccordionHeader>

              {openSections.includes('awards') && (
                <AccordionContent>
                  <Timeline>
                    {awardItems.map((award, idx) => (
                      <TimelineBlock key={`award-${idx}`}>
                        <TimelineBlockContent>
                          <TimelineChip>
                            {formatYear(award.date)}
                          </TimelineChip>
                          <TimelineDetails>
                            <TimelineTitle>{award.name}</TimelineTitle>
                            {award.summary && (
                              <TimelineDescription>{award.summary}</TimelineDescription>
                            )}
                          </TimelineDetails>
                        </TimelineBlockContent>
                      </TimelineBlock>
                    ))}
                  </Timeline>
                </AccordionContent>
              )}
            </AccordionSection>
          )}

          {/* Presentations Accordion */}
          {presentationItems.length > 0 && (
            <AccordionSection id="presentations">
              <AccordionHeader
                onClick={() => toggleSection('presentations')}
                $isOpen={openSections.includes('presentations')}
              >
                <AccordionIcon>
                  <MicIcon />
                </AccordionIcon>
                <AccordionTitleGroup>
                  <AccordionTitle>Presentations</AccordionTitle>
                  <AccordionSubtitle>Talks and speaking engagements</AccordionSubtitle>
                </AccordionTitleGroup>
                <AccordionArrow $isOpen={openSections.includes('presentations')}>
                  <ChevronIcon />
                </AccordionArrow>
              </AccordionHeader>

              {openSections.includes('presentations') && (
                <AccordionContent>
                  <Timeline>
                    {presentationItems.map((pres, idx) => (
                      <TimelineBlock key={`pres-${idx}`}>
                        <TimelineBlockContent>
                          <TimelineChip>
                            {formatYear(pres.date)}
                          </TimelineChip>
                          <TimelineDetails>
                            <TimelineTitle>{pres.name}</TimelineTitle>
                            {pres.location && (
                              <TimelineSubtitle>{pres.location}</TimelineSubtitle>
                            )}
                            {pres.summary && (
                              <TimelineDescription>{pres.summary}</TimelineDescription>
                            )}
                          </TimelineDetails>
                        </TimelineBlockContent>
                      </TimelineBlock>
                    ))}
                  </Timeline>
                </AccordionContent>
              )}
            </AccordionSection>
          )}

          {/* Professional Development Accordion */}
          {professionalDevItems.length > 0 && (
            <AccordionSection id="professional-development">
              <AccordionHeader
                onClick={() => toggleSection('professional-development')}
                $isOpen={openSections.includes('professional-development')}
              >
                <AccordionIcon>
                  <StarIcon />
                </AccordionIcon>
                <AccordionTitleGroup>
                  <AccordionTitle>Professional Development</AccordionTitle>
                  <AccordionSubtitle>Courses, workshops, and training</AccordionSubtitle>
                </AccordionTitleGroup>
                <AccordionArrow $isOpen={openSections.includes('professional-development')}>
                  <ChevronIcon />
                </AccordionArrow>
              </AccordionHeader>

              {openSections.includes('professional-development') && (
                <AccordionContent>
                  <Timeline>
                    {professionalDevItems.map((item, idx) => (
                      <TimelineBlock key={`profdev-${idx}`}>
                        <TimelineBlockContent>
                          <TimelineChip>
                            {formatYear(item.date)}
                          </TimelineChip>
                          <TimelineDetails>
                            <TimelineTitle>{item.name}</TimelineTitle>
                            {item.location && (
                              <TimelineSubtitle>{item.location}</TimelineSubtitle>
                            )}
                            {item.summary && (
                              <TimelineDescription>{item.summary}</TimelineDescription>
                            )}
                          </TimelineDetails>
                        </TimelineBlockContent>
                      </TimelineBlock>
                    ))}
                  </Timeline>
                </AccordionContent>
              )}
            </AccordionSection>
          )}

          {/* Projects Accordion */}
          {projectItems.length > 0 && (
            <AccordionSection id="projects">
              <AccordionHeader
                onClick={() => toggleSection('projects')}
                $isOpen={openSections.includes('projects')}
              >
                <AccordionIcon>
                  <CodeIcon />
                </AccordionIcon>
                <AccordionTitleGroup>
                  <AccordionTitle>Projects</AccordionTitle>
                  <AccordionSubtitle>Personal and open source work</AccordionSubtitle>
                </AccordionTitleGroup>
                <AccordionArrow $isOpen={openSections.includes('projects')}>
                  <ChevronIcon />
                </AccordionArrow>
              </AccordionHeader>

              {openSections.includes('projects') && (
                <AccordionContent>
                  <ProjectsGrid>
                    {projectItems.map((project, idx) => (
                      <ProjectCard key={idx}>
                        <ProjectName>
                          {project.url ? (
                            <ProjectLink href={project.url} target="_blank" rel="noopener">
                              {project.name}
                            </ProjectLink>
                          ) : (
                            project.name
                          )}
                        </ProjectName>
                        {project.summary && (
                          <ProjectDescription>{project.summary}</ProjectDescription>
                        )}
                      </ProjectCard>
                    ))}
                  </ProjectsGrid>
                </AccordionContent>
              )}
            </AccordionSection>
          )}

          {/* Links Accordion */}
          {socials.length > 0 && (
            <AccordionSection id="links">
              <AccordionHeader
                onClick={() => toggleSection('links')}
                $isOpen={openSections.includes('links')}
              >
                <AccordionIcon>
                  <LinkIcon />
                </AccordionIcon>
                <AccordionTitleGroup>
                  <AccordionTitle>Links</AccordionTitle>
                  <AccordionSubtitle>Social profiles and contact</AccordionSubtitle>
                </AccordionTitleGroup>
                <AccordionArrow $isOpen={openSections.includes('links')}>
                  <ChevronIcon />
                </AccordionArrow>
              </AccordionHeader>

              {openSections.includes('links') && (
                <AccordionContent>
                  <LinksGrid>
                    {socials.map((social, idx) => (
                      <SocialButton
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener"
                      >
                        {social.network}
                      </SocialButton>
                    ))}
                    {email && (
                      <SocialButton href={`mailto:${email}`}>
                        Email
                      </SocialButton>
                    )}
                    {phone && (
                      <SocialButton href={`tel:${phone}`}>
                        Phone
                      </SocialButton>
                    )}
                  </LinksGrid>
                </AccordionContent>
              )}
            </AccordionSection>
          )}
        </ContentColumn>

        <SidebarColumn>
          <StickyContainer>
            <PhotoCard>
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={fullName} />
              ) : (
                <AvatarPlaceholder>
                  {fullName.charAt(0)}
                </AvatarPlaceholder>
              )}
              <PhotoCaption>
                <PhotoName>{fullName}</PhotoName>
                {currentPosition && <PhotoTitle>{currentPosition}</PhotoTitle>}
                {location && <PhotoLocation>{location}</PhotoLocation>}
              </PhotoCaption>
            </PhotoCard>
          </StickyContainer>
        </SidebarColumn>
      </MainLayout>
      </Container>
    </ThemeProvider>
  );
}

// Icons
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
  </svg>
);

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
  </svg>
);

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${props => props.theme.isDark ? '#000000' : '#ffffff'};
  color: ${props => props.theme.isDark ? '#ecedee' : '#11181c'};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.2s, color 0.2s;
`;

const Header = styled.header`
  border-bottom: 1px solid ${props => props.theme.isDark ? 'rgba(39, 39, 42, 0.5)' : 'rgba(228, 228, 231, 0.5)'};
  background: ${props => props.theme.isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.2s, border-color 0.2s;
`;

const HeaderContent = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: 640px) {
    padding: 1rem 1.5rem;
  }
`;

const HeaderName = styled.a`
  font-weight: 600;
  font-size: 1.125rem;
  color: ${props => props.theme.isDark ? '#ecedee' : '#11181c'};
  text-decoration: none;

  &:hover {
    color: ${props => props.theme.isDark ? '#22d3ee' : '#06b6d4'};
  }
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled.a`
  font-size: 0.875rem;
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
  text-decoration: none;

  &:hover {
    color: ${props => props.theme.isDark ? '#22d3ee' : '#06b6d4'};
  }
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 0.5rem;
  background: ${props => props.theme.isDark ? '#27272a' : '#f4f4f5'};
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: ${props => props.theme.isDark ? '#3f3f46' : '#e4e4e7'};
    color: ${props => props.theme.isDark ? '#22d3ee' : '#06b6d4'};
  }
`;

const MainLayout = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column-reverse;
  gap: 1.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    padding: 1.5rem;
  }
`;

const ContentColumn = styled.div`
  flex: 1;
  min-width: 0;

  @media (min-width: 640px) {
    flex-basis: 58.333333%;
  }
`;

const SidebarColumn = styled.div`
  @media (min-width: 640px) {
    flex-basis: 41.666667%;
  }
`;

const StickyContainer = styled.div`
  @media (min-width: 640px) {
    position: sticky;
    top: 5rem;
    align-self: flex-start;
  }
`;

const PhotoCard = styled.div`
  background: ${props => props.theme.isDark ? '#18181b' : '#f4f4f5'};
  border-radius: 1rem;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: #06b6d4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
  font-weight: 600;
  color: white;
`;

const PhotoCaption = styled.div`
  padding: 1rem;
`;

const PhotoName = styled.h1`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: ${props => props.theme.isDark ? '#ecedee' : '#11181c'};
`;

const PhotoTitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
  margin: 0.25rem 0 0;
`;

const PhotoLocation = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.isDark ? '#71717a' : '#a1a1aa'};
  margin: 0.25rem 0 0;
`;

const AboutSection = styled.section`
  margin-bottom: 1.5rem;
`;

const AboutText = styled.p`
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#52525b'};
  line-height: 1.75;
`;

const AccordionSection = styled.div`
  border: 1px solid ${props => props.theme.isDark ? '#27272a' : '#e4e4e7'};
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${props => props.$isOpen
    ? (props.theme.isDark ? '#18181b' : '#f4f4f5')
    : 'transparent'};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.isDark ? '#18181b' : '#f4f4f5'};
  }
`;

const AccordionIcon = styled.div`
  flex-shrink: 0;
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
`;

const AccordionTitleGroup = styled.div`
  flex: 1;
  min-width: 0;
`;

const AccordionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: ${props => props.theme.isDark ? '#ecedee' : '#11181c'};
`;

const AccordionSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
  margin: 0;
`;

const AccordionArrow = styled.div`
  flex-shrink: 0;
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.2s;
`;

const AccordionContent = styled.div`
  padding: 0 1rem 1rem;
`;

const SkillsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SkillsTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SkillsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SkillChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: ${props => props.theme.isDark ? '#27272a' : '#f4f4f5'};
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#52525b'};
  font-size: 0.875rem;
  border-radius: 9999px;
`;

const TimelineSection = styled.div``;

const TimelineSectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  color: ${props => props.theme.isDark ? '#ecedee' : '#11181c'};
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 1rem;

  /* Main timeline line */
  &::before {
    content: '';
    position: absolute;
    left: 0.25rem;
    top: 0.5rem;
    bottom: 0.5rem;
    width: 2px;
    background: ${props => props.theme.isDark ? '#3f3f46' : '#d4d4d8'};
  }

  @media (min-width: 640px) {
    padding-left: 7rem;

    &::before {
      left: 6.25rem;
    }
  }
`;

const TimelineBlock = styled.div`
  position: relative;
  padding: 1rem 0 1rem 1.5rem;

  /* Timeline dot */
  &::before {
    content: '';
    position: absolute;
    left: -0.75rem;
    top: 1.25rem;
    width: 0.5rem;
    height: 0.5rem;
    background: #06b6d4;
    border: 3px solid ${props => props.theme.isDark ? '#000000' : '#ffffff'};
    border-radius: 50%;
    box-sizing: content-box;
    transform: translateX(-50%);
    z-index: 1;
  }

  @media (min-width: 640px) {
    padding-left: 1.5rem;

    &::before {
      left: -0.75rem;
    }
  }
`;

const TimelineBlockContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const TimelineChip = styled.time`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  color: #16a34a;
  border: 1px solid #16a34a;
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
  margin-bottom: 0.75rem;
  white-space: nowrap;

  @media (min-width: 640px) {
    position: absolute;
    left: -7.5rem;
    min-width: 5rem;
    margin-bottom: 0;
    border-radius: 0.5rem;
  }
`;

const TimelineChipContent = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  line-height: 1.2;
`;

const TimelineArrow = styled.span``;

const TimelineDetails = styled.div`
  flex: 1;
`;

const TimelineCompany = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.isDark ? '#ecedee' : '#11181c'};
  margin: 0 0 0.5rem;
`;

const TimelineCompanyLink = styled.a`
  color: ${props => props.theme.isDark ? '#22d3ee' : '#06b6d4'};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const TimelineTitle = styled.h2`
  font-size: 1.125rem;
  color: ${props => props.theme.isDark ? '#22d3ee' : '#06b6d4'};
  margin: 0 0 0.25rem;
  font-weight: ${props => props.$isHighlighted ? '700' : '500'};
`;

const TimelineSubtitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme.isDark ? '#ecedee' : '#11181c'};
  margin: 0.25rem 0;
`;

const TimelineLocation = styled.span`
  font-weight: 300;
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
`;

const TimelineDescription = styled.p`
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
`;

const NestedPosition = styled.div`
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.theme.isDark ? '#27272a' : '#e4e4e7'};

  &:last-child {
    border-bottom: none;
  }
`;

const NestedPositionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NestedPositionTitle = styled.h3`
  font-size: 1rem;
  color: ${props => props.theme.isDark ? '#22d3ee' : '#06b6d4'};
  margin: 0;
  font-weight: ${props => props.$isHighlighted ? '700' : '500'};
`;

const NestedPositionDates = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
  white-space: nowrap;
`;

const ProjectsGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const ProjectCard = styled.div`
  padding: 1rem;
  background: ${props => props.theme.isDark ? '#18181b' : '#f4f4f5'};
  border-radius: 0.75rem;
`;

const ProjectName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: ${props => props.theme.isDark ? '#ecedee' : '#11181c'};
`;

const ProjectLink = styled.a`
  color: ${props => props.theme.isDark ? '#22d3ee' : '#06b6d4'};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ProjectDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.isDark ? '#a1a1aa' : '#71717a'};
  margin: 0.5rem 0 0;
`;

const LinksGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SocialButton = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #9333ea 0%, #06b6d4 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.75rem;
  text-decoration: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;
