import styled from 'styled-components';

export const CatalogView = styled.div`
  height: 100%;
  background: ${({ $darkMode }) => ($darkMode ? '#0b0b0b' : '#f9fafb')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.2s, color 0.2s;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  *, *::before, *::after {
    font-family: inherit;
  }
`;

export const CatalogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  flex-shrink: 0;

  h1 {
    font-size: 18px;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 14px;
  }
`;

export const CatalogTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

export const ThemeCount = styled.span`
  font-size: 13px;
  color: ${({ $darkMode }) => ($darkMode ? '#6b7280' : '#9ca3af')};
  font-weight: 400;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ModeToggle = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#a3a3a3' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#262626' : '#f3f4f6')};
  }
`;

export const CloseButton = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#a3a3a3' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#262626' : '#f3f4f6')};
  }
`;

export const SearchBar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 220px;

  @media (max-width: 640px) {
    width: 140px;
  }
`;

export const SearchIcon = styled.svg`
  position: absolute;
  left: 10px;
  color: ${({ stroke }) => stroke};
  opacity: 0.4;
  pointer-events: none;
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 30px 0 32px;
  border-radius: 6px;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
  background: ${({ $darkMode }) => ($darkMode ? '#141414' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;

  &::placeholder {
    color: ${({ $darkMode }) => ($darkMode ? '#525252' : '#9ca3af')};
  }

  &:focus {
    border-color: ${({ $darkMode }) => ($darkMode ? '#404040' : '#93c5fd')};
  }

  @media (max-width: 768px), (pointer: coarse) {
    font-size: 16px;
  }
`;

export const SearchClear = styled.button`
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  color: ${({ $darkMode }) => ($darkMode ? '#525252' : '#9ca3af')};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? '#a3a3a3' : '#374151')};
  }
`;

export const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  margin: 0 20px 20px;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#e5e7eb')};
  border-radius: 8px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const ThemeTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;

  @media (max-width: 640px) {
    table-layout: auto;
  }
`;

export const Th = styled.th`
  text-align: ${({ $align }) => $align || 'left'};
  padding: 9px 14px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ $darkMode }) => ($darkMode ? '#525252' : '#6b7280')};
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#e5e7eb')};
  position: sticky;
  top: 0;
  background: ${({ $darkMode }) => ($darkMode ? '#111111' : '#f3f4f6')};
  z-index: 2;
  ${({ $width }) => $width && `width: ${$width};`}

  &:not(:last-child) {
    border-right: 1px solid ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#e5e7eb')};
  }

  @media (max-width: 640px) {
    ${({ $hideOnMobile }) => $hideOnMobile && 'display: none;'}
  }
`;

export const TableRow = styled.tr`
  cursor: pointer;
  transition: background 0.1s;
  outline: ${({ $focused, $darkMode }) => (
    $focused ? `2px solid ${$darkMode ? '#525252' : '#93c5fd'}` : 'none'
  )};
  outline-offset: -2px;
  background: ${({ $active, $darkMode }) => {
    if ($active) return $darkMode ? '#162032' : '#eff6ff';
    return 'transparent';
  }};

  &:hover {
    background: ${({ $active, $darkMode }) => {
      if ($darkMode) return $active ? '#1a2840' : '#161616';
      return $active ? '#e8f1fd' : '#f8f9fa';
    }};
  }

  &:not(:last-child) td {
    border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#f0f0f0')};
  }
`;

export const Td = styled.td`
  padding: 9px 14px;
  color: ${({ $darkMode, $muted }) => {
    if ($muted) return $darkMode ? '#737373' : '#9ca3af';
    return $darkMode ? '#e5e5e5' : '#111827';
  }};
  font-weight: ${({ $bold }) => ($bold ? '500' : '400')};
  text-align: ${({ $align }) => $align || 'left'};
  ${({ $truncate }) => $truncate && `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}

  &:not(:last-child) {
    border-right: 1px solid ${({ $darkMode }) => ($darkMode ? '#131313' : '#f5f5f5')};
  }

  @media (max-width: 640px) {
    ${({ $hideOnMobile }) => $hideOnMobile && 'display: none;'}
  }
`;

export const EmptyCell = styled.td`
  padding: 40px 16px;
  text-align: center;
  color: ${({ $darkMode }) => ($darkMode ? '#737373' : '#6b7280')};
  background: ${({ $darkMode }) => ($darkMode ? '#101010' : '#ffffff')};
`;

export const SourceLink = styled.a`
  font-size: 12px;
  color: ${({ $darkMode }) => ($darkMode ? '#60a5fa' : '#3b82f6')};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const MutedText = styled.span`
  font-size: 12px;
  color: ${({ $darkMode }) => ($darkMode ? '#404040' : '#d1d5db')};
`;

export const ActiveBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  background: ${({ $darkMode }) => ($darkMode ? '#1e3a5f' : '#dbeafe')};
  color: ${({ $darkMode }) => ($darkMode ? '#60a5fa' : '#2563eb')};
`;

export const PreviewFloater = styled.div`
  position: fixed;
  z-index: 9999;
  width: 480px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
  pointer-events: none;
  animation: previewFadeIn 0.15s ease-out;
  will-change: top, left;

  @keyframes previewFadeIn {
    from { opacity: 0; transform: scale(0.96) translateY(4px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

export const PreviewLabel = styled.div`
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#a3a3a3' : '#6b7280')};
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#262626' : '#e5e7eb')};
`;

export const PreviewViewport = styled.div`
  width: 480px;
  height: 300px;
  overflow: hidden;
  position: relative;
  background: #0b0b0b;

  iframe {
    transform: scale(${480 / 1440});
    transform-origin: top left;
    pointer-events: none;
  }
`;

export const MobileCardList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 12px 12px;
    overflow: auto;
    flex: 1;
    align-content: start;
  }
`;

export const MobileCard = styled.div`
  position: relative;
  border: 1px solid ${({ $active, $darkMode }) => {
    if ($active) return $darkMode ? '#1e3a5f' : '#bfdbfe';
    return $darkMode ? '#1f1f1f' : '#e5e7eb';
  }};
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  min-height: 60px;
  padding: 12px 14px;
  background: ${({ $active, $darkMode }) => {
    if ($active) return $darkMode ? '#162032' : '#eff6ff';
    return $darkMode ? '#141414' : '#ffffff';
  }};
  transition: background 0.15s, border-color 0.15s;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  &:active {
    background: ${({ $active, $darkMode }) => {
      if ($darkMode) return $active ? '#1a2840' : '#1a1a1a';
      return $active ? '#e8f1fd' : '#f3f4f6';
    }};
  }
`;

export const EmptyMobileState = styled.div`
  grid-column: 1 / -1;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#e5e7eb')};
  border-radius: 10px;
  padding: 28px 16px;
  text-align: center;
  color: ${({ $darkMode }) => ($darkMode ? '#737373' : '#6b7280')};
  background: ${({ $darkMode }) => ($darkMode ? '#141414' : '#ffffff')};
`;

export const CardName = styled.span`
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.25;
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
`;

export const CardSource = styled.span`
  font-size: 12px;
  color: ${({ $darkMode }) => ($darkMode ? '#737373' : '#9ca3af')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardActiveBadge = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $darkMode }) => ($darkMode ? '#1e3a5f' : '#dbeafe')};
  color: ${({ $darkMode }) => ($darkMode ? '#60a5fa' : '#2563eb')};
`;

export const MobileInspectOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  animation: inspectFade 0.15s ease-out;

  @keyframes inspectFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const MobileInspectCard = styled.div`
  width: 100%;
  max-width: 360px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  background: ${({ $darkMode }) => ($darkMode ? '#141414' : '#ffffff')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#262626' : '#e5e7eb')};
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
  animation: inspectPop 0.18s ease-out;

  @keyframes inspectPop {
    from { opacity: 0; transform: scale(0.94) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

export const InspectHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  flex-shrink: 0;
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f0f0f0')};
`;

export const InspectName = styled.span`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const InspectCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#e5e7eb')};
  cursor: pointer;

  &:active { opacity: 0.8; }
`;

export const InspectPreview = styled.div`
  position: relative;
  width: 100%;
  height: 260px;
  flex-shrink: 0;
  overflow: hidden;
  cursor: pointer;
  background: ${({ $darkMode }) => ($darkMode ? '#000' : '#fff')};
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f0f0f0')};

  iframe {
    pointer-events: none;
  }
`;

export const InspectTapHint = styled.div`
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.92)')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#e5e7eb')};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

export const InspectBody = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
`;

export const InspectDescription = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: ${({ $darkMode }) => ($darkMode ? '#a3a3a3' : '#4b5563')};
`;

export const InspectSourceLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  color: ${({ $darkMode }) => ($darkMode ? '#60a5fa' : '#2563eb')};

  svg { flex-shrink: 0; }
  &:active { opacity: 0.8; }
`;
