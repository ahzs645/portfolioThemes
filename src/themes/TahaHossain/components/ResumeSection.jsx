import React from 'react';
import styled from 'styled-components';
import ResumeColumn from './ResumeColumn';

const Container = styled.div`
  flex: 1;
  min-width: 350px;
  display: flex;
  flex-wrap: wrap;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    z-index: 0;
    height: 0.5px;
    width: 100%;
    top: -24.5px;
    left: 0;
    background: var(--th-line-red);
  }
`;

export default function ResumeSection({ cv }) {
  const experience = cv.experience || [];
  const current = experience.filter(e => e.isCurrent);
  const past = experience.filter(e => !e.isCurrent);

  const education = cv.education || [];
  const presentations = cv.presentations || [];
  const volunteer = cv.volunteer || [];

  return (
    <Container>
      <ResumeColumn>
        <ResumeColumn.Block
          title="Current Practice"
          items={current}
          contentIndex="02"
          contentLabel="The Practice"
          numbered
        />
        <ResumeColumn.Block
          title="Past Places"
          items={past}
          contentIndex="04"
          contentLabel="The History"
          numbered
        />
      </ResumeColumn>
      <ResumeColumn>
        <ResumeColumn.Block
          title="Community"
          items={volunteer}
          contentIndex="03"
          contentLabel="The Fieldwork"
          wide
        />
        <ResumeColumn.Block
          title={presentations.length > 0 ? 'Speaking' : 'Education'}
          items={presentations.length > 0 ? presentations : education}
          contentIndex="05"
          contentLabel={presentations.length > 0 ? 'The Lectures' : 'The Studies'}
          wide
        />
      </ResumeColumn>
    </Container>
  );
}
