import React from 'react';
import styled from 'styled-components';
import { Code2, Sparkles, MapPin, Zap, Briefcase, User } from 'lucide-react';
import { Block, SectionGrid } from './Block';

export default function About({ cv }) {
  const featureBlocks = [
    { icon: Code2, title: 'What I Do', content: 'Build. Solve. Ship Code.' },
    { icon: Sparkles, title: 'About Me', content: 'Driven. Curious. Purposeful.' },
    { icon: MapPin, title: 'Where From', content: cv.location || 'Somewhere on Earth.' },
  ];

  const philosophyBlocks = [
    { icon: Zap, title: 'My Code Philosophy', content: 'Clean. Efficient. Scalable.' },
    { icon: Briefcase, title: 'Beyond Code', content: 'Learning. Exploring. Growing.' },
  ];

  return (
    <Section id="fr-about">
      <SectionGrid>
        {/* Header */}
        <Block style={{ gridColumn: 'span 12' }}>
          <Icon><User size={28} color="#a1a1aa" /></Icon>
          <SectionTitle>
            About Me.{' '}
            <Muted>Crafting meaningful experiences through code and design.</Muted>
          </SectionTitle>
        </Block>

        {/* Feature blocks */}
        {featureBlocks.map((block, i) => (
          <FeatureBlock key={i} whileHover={{ rotate: '2deg', scale: 1.02 }}>
            <block.icon size={24} color="#a1a1aa" style={{ marginBottom: 12 }} />
            <Label>{block.title}</Label>
            <BoldText>{block.content}</BoldText>
          </FeatureBlock>
        ))}

        {/* Philosophy blocks */}
        {philosophyBlocks.map((block, i) => (
          <PhilosophyBlock key={i} whileHover={{ rotate: '-1.5deg', scale: 1.02 }}>
            <block.icon size={24} color="#a1a1aa" style={{ marginBottom: 12 }} />
            <Label>{block.title}</Label>
            <BoldText>{block.content}</BoldText>
          </PhilosophyBlock>
        ))}

        {/* About text */}
        {cv.about && (
          <Block style={{ gridColumn: 'span 12' }}>
            <SubTitle>My Story</SubTitle>
            <AboutText>
              {cv.about.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </AboutText>
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

const Icon = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 16px;
`;

const Muted = styled.span`
  color: #a1a1aa;
`;

const Label = styled.h3`
  font-size: 12px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
`;

const BoldText = styled.p`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;

const SubTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
`;

const AboutText = styled.div`
  font-size: 14px;
  color: #a1a1aa;
  line-height: 1.6;
  & p { margin: 0 0 16px; }
  & p:last-child { margin-bottom: 0; }
`;

const FeatureBlock = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) { grid-column: span 4; }
`;

const PhilosophyBlock = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) { grid-column: span 6; }
`;
