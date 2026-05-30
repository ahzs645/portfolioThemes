import styled from 'styled-components';

export const TopBar = styled.div`
  position: relative;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: ${({ $darkMode }) => ($darkMode ? '#0f0f0f' : '#ffffff')};
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#262626' : '#e5e7eb')};
  flex-shrink: 0;

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;
  }
`;

export const ThemeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const ThemeLabel = styled.span`
  font-size: 13px;
  flex-shrink: 0;
  color: ${({ $darkMode }) => ($darkMode ? '#737373' : '#6b7280')};
`;

export const ThemeNavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const NavArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

export const Separator = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  margin: 0 4px;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 6px;
  }
`;

export const UploadError = styled.div`
  max-width: 240px;
  color: ${({ $darkMode }) => ($darkMode ? '#fca5a5' : '#b91c1c')};
  font-size: 12px;
  line-height: 1.3;

  @media (max-width: 640px) {
    width: 100%;
    order: 10;
  }
`;

export const SwitcherButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  height: 36px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    padding: 0;
  }

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

export const BrowseText = styled.span`
  @media (max-width: 640px) {
    display: none;
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  height: 36px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    padding: 0;
  }

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

export const UploadText = styled.span`
  @media (max-width: 640px) {
    display: none;
  }
`;

export const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  background: ${({ $darkMode }) => ($darkMode ? '#7f1d1d' : '#fef2f2')};
  color: ${({ $darkMode }) => ($darkMode ? '#fca5a5' : '#dc2626')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#991b1b' : '#fecaca')};
  height: 36px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    padding: 0;
  }

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#991b1b' : '#fee2e2')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#b91c1c' : '#fca5a5')};
  }
`;

export const ClearText = styled.span`
  @media (max-width: 640px) {
    display: none;
  }
`;

export const ModeToggleSmall = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;
