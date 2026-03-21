import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import BorderFrame from './components/BorderFrame';
import BiographySection from './components/BiographySection';
import ResumeSection from './components/ResumeSection';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond&family=Space+Mono:wght@400;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Unica+One&display=swap');
`;

const Page = styled.div`
  --th-bg: #f6f5f1;
  --th-text: #000;
  --th-line-red: #bb5e5e;
  --th-line-green: #1d8341;
  --th-line-blue: #3d60dc;

  min-height: 100vh;
  width: 100vw;
  background: var(--th-bg);
  color: var(--th-text);
  overflow: auto;

  *::-webkit-scrollbar { display: none; }
  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const Grid = styled.div`
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: 100vh;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

export function TahaHossainTheme() {
  const cv = useCV();
  if (!cv) return null;

  return (
    <Page>
      <GlobalStyles />
      <BorderFrame />
      <Grid>
        <BiographySection cv={cv} />
        <ResumeSection cv={cv} />
      </Grid>
    </Page>
  );
}
