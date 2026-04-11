import React from 'react';
import styled from 'styled-components';
import { Mail, MapPin, ArrowRight } from 'lucide-react';
import { GithubIcon as Github, LinkedinIcon as Linkedin } from './Icons';
import { Block, SectionGrid } from './Block';

export default function Contact({ cv }) {
  const { name, email, avatar, socialLinks, location } = cv;

  return (
    <Section id="fr-contact">
      <SectionGrid>
        {/* Header with avatar */}
        <HeaderBlock>
          {avatar && <Avatar src={avatar} alt="avatar" />}
          <SectionTitle>
            Let's Connect.{' '}
            <Muted>Always open to new opportunities and collaborations.</Muted>
          </SectionTitle>
          {email && (
            <EmailLink href={`mailto:${email}`}>
              Email me <ArrowRight size={18} />
            </EmailLink>
          )}
        </HeaderBlock>

        {/* Contact method blocks */}
        {email && (
          <MethodBlock
            whileHover={{ rotate: '2.5deg', scale: 1.1 }}
            style={{ background: '#ef4444' }}
          >
            <MethodLink href={`mailto:${email}`}>
              <Mail size={28} />
            </MethodLink>
          </MethodBlock>
        )}

        {socialLinks?.linkedin && (
          <MethodBlock
            whileHover={{ rotate: '-2.5deg', scale: 1.1 }}
            style={{ background: '#2563eb' }}
          >
            <MethodLink href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin size={28} />
            </MethodLink>
          </MethodBlock>
        )}

        {socialLinks?.github && (
          <MethodBlock
            whileHover={{ rotate: '-2.5deg', scale: 1.1 }}
            style={{ background: '#fafafa', borderColor: '#e4e4e7' }}
          >
            <MethodLink href={socialLinks.github} target="_blank" rel="noopener noreferrer" style={{ color: '#000' }}>
              <Github size={28} />
            </MethodLink>
          </MethodBlock>
        )}

        {/* Placeholder for 4th method if no WhatsApp */}
        <MethodBlock
          whileHover={{ rotate: '2.5deg', scale: 1.1 }}
          style={{ background: '#16a34a' }}
        >
          <MethodLink href={`mailto:${email || ''}`}>
            <Mail size={28} />
          </MethodLink>
        </MethodBlock>

        {/* About block */}
        <Block style={{ gridColumn: 'span 12' }}>
          <Statement>
            Always looking for new challenges and opportunities.{' '}
            <Muted>
              Whether you need a dedicated developer or someone who can bridge technical and business needs, let's build something great together!
            </Muted>
          </Statement>
        </Block>

        {/* Location */}
        {location && (
          <Block style={{ gridColumn: 'span 12' }}>
            <LocationCenter>
              <MapPin size={28} />
              <LocationText>{location}</LocationText>
            </LocationCenter>
          </Block>
        )}
      </SectionGrid>
    </Section>
  );
}

const Section = styled.div`
  min-height: 100vh;
  background: #18181b;
  padding: 48px 16px;
  color: #fafafa;
`;

const HeaderBlock = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) {
    grid-column: span 6;
    grid-row: span 2;
  }
`;

const Avatar = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 48px;
`;

const Muted = styled.span`
  color: #a1a1aa;
`;

const EmailLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fca5a5;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const MethodBlock = styled(Block)`
  grid-column: span 6;
  @media (min-width: 768px) { grid-column: span 3; }
`;

const MethodLink = styled.a`
  display: grid;
  height: 100%;
  place-content: center;
  color: #fff;
  text-decoration: none;
  font-size: 28px;
`;

const Statement = styled.p`
  font-size: 1.875rem;
  line-height: 1.3;
  margin: 0;
`;

const LocationCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LocationText = styled.p`
  text-align: center;
  font-size: 18px;
  color: #a1a1aa;
  margin: 0;
`;
