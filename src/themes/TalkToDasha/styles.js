import styled, { createGlobalStyle } from 'styled-components';

export const palette = {
  bg: '#FEFEFC',
  text: '#797979',
  textDark: '#2b2b2b',
  white: '#FFFFFF',
  live: '#2A600F',
  liveBg: '#E5F2DB',
};

export const cards = {
  lavender: { bg: '#A787E4', ink: '#452483', shadow: 'rgba(69, 36, 131, 0.25)' },
  mustard: { bg: '#E6C15C', ink: '#754912', shadow: 'rgba(117, 73, 18, 0.22)' },
  sage: { bg: '#A7DB74', ink: '#2A600F', shadow: 'rgba(42, 96, 15, 0.22)' },
  terracotta: { bg: '#EC785D', ink: '#801C1C', shadow: 'rgba(128, 28, 28, 0.22)' },
  sky: { bg: '#9ECCF4', ink: '#0B3C66', shadow: 'rgba(11, 60, 102, 0.22)' },
};

export const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&display=swap');
`;

export const Page = styled.div`
  min-height: 100vh;
  background: ${palette.bg};
  color: ${palette.text};
  font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  padding: 80px 24px 120px;
`;

export const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 72px;
  text-align: center;
`;

export const Footer = styled.footer`
  font-size: 13px;
  color: ${palette.text};
  margin-top: 8px;
`;
