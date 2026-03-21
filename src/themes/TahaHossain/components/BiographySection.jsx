import React from 'react';
import styled from 'styled-components';
import SocialLinks from './SocialLinks';
import TechnicalDetails from './TechnicalDetails';

const Container = styled.div`
  flex: 1;
  min-width: 350px;
  display: flex;
  flex-direction: column;
  padding: 44px 24px 24px;
  position: relative;
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
  font-size: 24px;
  line-height: 31px;
  color: var(--th-text);

  @media (max-width: 767px) {
    font-size: 18px;
    line-height: 25px;
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
