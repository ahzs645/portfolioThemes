import styled from 'styled-components';

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

// Folder-tab SVG path from the reference HTML. This only draws the lower
// folder face; the card background sits behind it and the white stack floats
// above, matching the original Framer composition.
export const FOLDER_PATH =
  'M230 120H0V0L138.093 0C141.552 0 144.951 0.896735 147.959 2.60266L168.722 14.377C171.73 16.083 175.129 16.9797 178.588 16.9797H230V120Z';
export const FOLDER_VIEWBOX = '0 0 230 120';

// Inner white file-tab path. Shorter body so the tab flap is proportionally
// bigger — the label fits inside the tab area even at small render heights.
export const FILE_TAB_PATH =
  'M230 56H0V0L138.093 0C141.552 0 144.951 0.896735 147.959 2.60266L168.722 14.377C171.73 16.083 175.129 16.9797 178.588 16.9797H230V56Z';
export const FILE_TAB_VIEWBOX = '0 0 230 56';

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
