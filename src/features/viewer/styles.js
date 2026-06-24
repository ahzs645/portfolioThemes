import styled from 'styled-components';

export const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const ThemeContainer = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: auto;
  box-sizing: border-box;
  /* The TopBar is in normal flow, so the theme already starts below it — no
     padding needed here. --app-top-offset is still published for themes that
     position their own fixed/sticky elements relative to the bar; it's set
     precisely from the measured bar height (inline style) with these fallbacks. */
  --app-top-offset: ${({ $hasTopBar }) => $hasTopBar ? '61px' : '0px'};
  --initial-display: ${({ $hideInitials }) => $hideInitials ? 'none' : 'flex'};

  > * {
    flex-shrink: 0;
    width: 100%;
  }

  @media (max-width: 640px) {
    --app-top-offset: ${({ $hasTopBar }) => $hasTopBar ? '57px' : '0px'};
  }
`;
