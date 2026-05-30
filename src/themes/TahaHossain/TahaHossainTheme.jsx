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
  --th-bg: ${p => p.$dark ? '#15181d' : '#f6f5f1'};
  --th-text: ${p => p.$dark ? '#d4d0c8' : '#000'};
  --th-line-red: ${p => p.$dark ? '#9b4e4e' : '#bb5e5e'};
  --th-line-green: ${p => p.$dark ? '#1a6e37' : '#1d8341'};
  --th-line-blue: ${p => p.$dark ? '#3250b8' : '#3d60dc'};

  min-height: 100%;
  width: 100%;
  background: var(--th-bg);
  color: var(--th-text);
  overflow: auto;
  box-sizing: border-box;

  *::-webkit-scrollbar { display: none; }
  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(12px, 2vw, 24px);
  padding: clamp(12px, 2vw, 24px);
  min-height: calc(100dvh - var(--app-top-offset, 0px));
  box-sizing: border-box;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export function TahaHossainTheme({ darkMode = false }) {
  const cv = useCV();
  if (!cv) return null;

  return (
    <Page $dark={darkMode}>
      <GlobalStyles />
      <BorderFrame />
      <Grid>
        <BiographySection cv={cv} />
        <ResumeSection cv={cv} />
      </Grid>
    </Page>
  );
}
