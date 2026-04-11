import React from 'react';
import styled from 'styled-components';
import { Globe, Languages as LanguagesIcon } from 'lucide-react';
import { Block, SectionGrid } from './Block';

export default function Languages({ cv }) {
  const languages = cv.languages || [];
  if (!languages.length) return null;

  return (
    <Section>
      <SectionGrid>
        {/* Header */}
        <HeaderBlock>
          <Globe size={28} color="#a1a1aa" style={{ marginBottom: 16 }} />
          <SectionTitle>
            Languages.{' '}
            <Muted>Multilingual communication abilities.</Muted>
          </SectionTitle>
        </HeaderBlock>

        {/* Language cards */}
        {languages.map((lang, i) => (
          <LangCard key={i} whileHover={{ rotate: i % 2 === 0 ? '2.5deg' : '-2.5deg', scale: 1.05 }}>
            <LangCenter>
              <LanguagesIcon size={28} color="#a1a1aa" style={{ marginBottom: 12 }} />
              <LangName>{lang.language}</LangName>
              <LangLevel>{lang.fluency || lang.proficiency || ''}</LangLevel>
            </LangCenter>
          </LangCard>
        ))}

        {/* About block */}
        <Block style={{ gridColumn: 'span 12' }}>
          <Statement>
            Multilingual communication.{' '}
            <Muted>
              Connecting with diverse teams and communities, bringing cultural understanding and effective communication to every project.
            </Muted>
          </Statement>
        </Block>
      </SectionGrid>
    </Section>
  );
}

const Section = styled.div`
  background: #18181b;
  padding: 80px 16px;
  color: #fafafa;
`;

const HeaderBlock = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) {
    grid-column: span 6;
    grid-row: span 2;
  }
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

const LangCard = styled(Block)`
  grid-column: span 6;
  @media (min-width: 768px) { grid-column: span 3; }
`;

const LangCenter = styled.div`
  display: grid;
  height: 100%;
  place-content: center;
  text-align: center;
`;

const LangName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #f4f4f5;
  margin: 0;
`;

const LangLevel = styled.p`
  color: #a1a1aa;
  margin: 4px 0 0;
  font-size: 14px;
`;

const Statement = styled.p`
  font-size: 1.875rem;
  line-height: 1.3;
  margin: 0;
`;
