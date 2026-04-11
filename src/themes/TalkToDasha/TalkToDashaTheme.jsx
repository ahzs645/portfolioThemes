import React, { useMemo } from 'react';
import { useCV } from '../../contexts/ConfigContext';
import { FontLoader, Page, Container, Footer } from './styles';
import { Hero } from './components/Hero';
import { CurrentStatus } from './components/CurrentStatus';
import { AboutCard } from './components/AboutCard';
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
      socialLinks.twitter && { label: 'Twitter', url: socialLinks.twitter },
      socialLinks.youtube && { label: 'YouTube', url: socialLinks.youtube },
      socialLinks.website && { label: 'Website', url: socialLinks.website },
    ].filter(Boolean);

    return {
      name: cv.name || 'Your Name',
      title: cv.currentJobTitle || 'Strategist & Builder',
      location: cv.location,
      email: cv.email,
      about: cv.about,
      currentJobs: experience.filter((e) => e.isCurrent),
      pastJobs: experience.filter((e) => !e.isCurrent),
      projects: cv.projects || [],
      awards: cv.awards || [],
      certifications: cv.certifications || [],
      socials,
    };
  }, [cv]);

  if (!data) return null;

  return (
    <>
      <FontLoader />
      <Page>
        <Container>
          <Hero name={data.name} title={data.title} location={data.location} />
          <CurrentStatus jobs={data.currentJobs} />
          <AboutCard text={data.about} />
          <ProjectsSection projects={data.projects} />
          <PastCollabsSection jobs={data.pastJobs} />
          <FounderSection
            awards={data.awards}
            certifications={data.certifications}
          />
          <SocialSection socials={data.socials} />
          <ContactSection email={data.email} />
          <Footer>© {new Date().getFullYear()} {data.name}</Footer>
        </Container>
      </Page>
    </>
  );
}
