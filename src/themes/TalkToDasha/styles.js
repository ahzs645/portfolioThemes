import styled, { createGlobalStyle } from 'styled-components';

export const palette = {
  bg: '#FEFEFC',
  text: '#797979',
  textDark: '#2b2b2b',
  white: '#FFFFFF',
  live: '#2A600F',
  liveBg: '#E5F2DB',
};

// Folder background fills from the reference SVGs (colors used on the live site)
export const cards = {
  lavender: { bg: '#B799EE', ink: '#452483', soft: '#EADFF9' },
  mustard: { bg: '#FFE26C', ink: '#754912', soft: '#FFF4C2' },
  sage: { bg: '#BDEE8C', ink: '#2A600F', soft: '#E2F6CD' },
  terracotta: { bg: '#FF947C', ink: '#801C1C', soft: '#FFD5CB' },
};

// Folder-tab SVG path. Original reference viewBox is 0 0 230 120 with the
// tab defined on the top-left corner (rising ~17 y-units above the rest of
// the top edge). We extend the vertical so the card can be taller than the
// native shape.
export const FOLDER_PATH =
  'M230 260H0V0L138.093 0C141.552 0 144.951 0.896735 147.959 2.60266L168.722 14.377C171.73 16.083 175.129 16.9797 178.588 16.9797H230V260Z';
export const FOLDER_VIEWBOX = '0 0 230 260';

// Inner white file-tab path — uses the same tab geometry but a shorter body.
export const FILE_TAB_PATH =
  'M230 80H0V0L138.093 0C141.552 0 144.951 0.896735 147.959 2.60266L168.722 14.377C171.73 16.083 175.129 16.9797 178.588 16.9797H230V80Z';
export const FILE_TAB_VIEWBOX = '0 0 230 80';

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
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 72px;
  text-align: center;
`;

export const FolderGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 28px;
  }
`;

export const Footer = styled.footer`
  font-size: 13px;
  color: ${palette.text};
  margin-top: 8px;
`;
