import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { FadeIn, SectionHeader, LabelRow, Label, BlinkCursor } from './SectionShared';

export default function CertsSkills({ cv, theme, baseDelay = 1180 }) {
  const items = cv.certificationsSkills || [];

  if (items.length === 0) return null;

  return (
    <Section>
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Certifications & Skills</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
        </SectionHeader>
      </FadeIn>

      <List>
        {items.map((item, i) => (
          <FadeIn key={i} $delay={baseDelay + 50 + i * 50}>
            <Entry $theme={theme}>
              <EntryLabel $theme={theme}>{item.label}</EntryLabel>
              <EntryDetails $theme={theme}>{item.details}</EntryDetails>
            </Entry>
          </FadeIn>
        ))}
      </List>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

const Entry = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px dotted ${p => p.$theme.border};
`;

const EntryLabel = styled.span`
  font-family: ${FONT.sans};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
  color: ${p => p.$theme.muted};
`;

const EntryDetails = styled.p`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 22px;
  color: ${p => p.$theme.body};
  margin: 0;
`;
