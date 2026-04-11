import React from 'react';
import styled from 'styled-components';
import { Lightbulb, Heart } from 'lucide-react';
import { Block, SectionGrid } from './Block';

export default function Skills({ cv }) {
  const { skills } = cv;
  if (!skills || !skills.length) return null;

  const colors = ['#60a5fa', '#c084fc', '#fb923c', '#4ade80', '#f472b6', '#facc15'];

  return (
    <Section>
      <SectionGrid>
        {/* Header */}
        <Block style={{ gridColumn: 'span 12' }}>
          <Lightbulb size={28} color="#a1a1aa" style={{ marginBottom: 16 }} />
          <SectionTitle>
            Skills & Expertise.{' '}
            <Muted>Technical proficiency and professional capabilities.</Muted>
          </SectionTitle>
        </Block>

        {/* Skill pills grouped */}
        {skills.map((group, gi) => (
          <SkillGroupBlock key={gi} whileHover={{ rotate: gi % 2 === 0 ? '2deg' : '-2deg', scale: 1.02 }}>
            <GroupIcon color={colors[gi % colors.length]}>
              <Heart size={20} />
            </GroupIcon>
            <GroupTitle>{group.category || group.name || `Skills ${gi + 1}`}</GroupTitle>
            <SkillList>
              {(group.items || group.skills || []).map((skill, si) => {
                const skillName = typeof skill === 'string' ? skill : skill.name || skill;
                return (
                  <SkillPill key={si} $color={colors[gi % colors.length]}>
                    {skillName}
                  </SkillPill>
                );
              })}
            </SkillList>
          </SkillGroupBlock>
        ))}

        {/* Bottom statement */}
        <Block style={{ gridColumn: 'span 12' }}>
          <Statement>
            Professional capabilities matter.{' '}
            <Muted>
              Skills complement technical expertise, enabling effective collaboration and problem-solving in diverse team environments.
            </Muted>
          </Statement>
        </Block>
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

const SectionTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 16px;
`;

const Muted = styled.span`
  color: #a1a1aa;
`;

const SkillGroupBlock = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) { grid-column: span 6; }
`;

const GroupIcon = styled.div`
  color: ${(p) => p.color};
  margin-bottom: 12px;
`;

const GroupTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
`;

const SkillList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SkillPill = styled.span`
  padding: 4px 12px;
  background: #3f3f46;
  color: #d4d4d8;
  font-size: 13px;
  border-radius: 9999px;
  border: 1px solid ${(p) => p.$color}33;
`;

const Statement = styled.p`
  font-size: 1.875rem;
  line-height: 1.3;
  margin: 0;
`;
