import React, { useMemo } from 'react';
import { useCV } from '../../contexts/ConfigContext';
import { Page, Container, FolderGrid, Footer } from './styles';
import { Hero } from './components/Hero';
import { CurrentStatus } from './components/CurrentStatus';
import { ProjectsSection } from './components/ProjectsSection';
import { PastCollabsSection } from './components/PastCollabsSection';
import { FounderSection } from './components/FounderSection';
import { SocialSection } from './components/SocialSection';
import { ContactSection } from './components/ContactSection';

export function TalkToDashaTheme() {
  const cv = useCV();

  const data = useMemo(() => {
    if (!cv) return null;
    const experience = cv.experience || [];
    const socialLinks = cv.socialLinks || {};
    const socials = [
      socialLinks.linkedin && { label: 'LinkedIn', url: socialLinks.linkedin },
      socialLinks.github && { label: 'GitHub', url: socialLinks.github },
    ].filter(Boolean);

    return {
      name: cv.name || 'Your Name',
      title: cv.currentJobTitle || 'Strategist & Builder',
      location: cv.location,
      email: cv.email,
      currentJobs: experience.filter((e) => e.isCurrent),
      pastJobs: experience.filter((e) => !e.isCurrent),
      projects: cv.projects || [],
      education: cv.education || [],
      professionalDevelopment: cv.professionalDevelopment || [],
      socials,
    };
  }, [cv]);

  if (!data) return null;

  return (
    <>
      <Page>
        <Container>
          <Hero name={data.name} title={data.title} location={data.location} />
          <CurrentStatus jobs={data.currentJobs} />
          <FolderGrid>
            <ProjectsSection projects={data.projects} />
            <PastCollabsSection jobs={data.pastJobs} />
            <FounderSection
              education={data.education}
              professionalDevelopment={data.professionalDevelopment}
            />
            <SocialSection socials={data.socials} />
          </FolderGrid>
          <FolderGrid>
            <ContactSection email={data.email} />
          </FolderGrid>
          <Footer>© {new Date().getFullYear()} {data.name}</Footer>
        </Container>
      </Page>
    </>
  );
}
