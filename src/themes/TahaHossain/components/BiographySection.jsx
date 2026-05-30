import React from 'react';
import styled from 'styled-components';
import SocialLinks from './SocialLinks';
import TechnicalDetails from './TechnicalDetails';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: clamp(28px, 4vh, 44px) clamp(12px, 2vw, 24px) clamp(12px, 2vw, 24px);
  position: relative;
  box-sizing: border-box;
`;

const MainContent = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-family: 'Unica One', sans-serif;
  font-size: 11px;
  letter-spacing: 0.1px;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

const BodyText = styled.div`
  font-family: 'EB Garamond', serif;
  font-size: clamp(18px, 1.75vw, 24px);
  line-height: 1.3;
  color: var(--th-text);

  @media (max-width: 767px) {
    font-size: 18px;
  }

  @media (max-height: 720px) and (min-width: 901px) {
    font-size: clamp(16px, 1.45vw, 20px);
  }
`;

export default function BiographySection({ cv }) {
  const about = cv.about || '';

  return (
    <Container>
      <MainContent>
        <Name>{cv.name}</Name>
        <BodyText>
          {about.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < about.split('\n').length - 1 && <><br /><br /></>}
            </React.Fragment>
          ))}
        </BodyText>
      </MainContent>
      <SocialLinks cv={cv} />
      <TechnicalDetails index="01" label="The Biography" showHeight />
    </Container>
  );
}
