import styled from 'styled-components';

export const LoadingScreen = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  background: #0b0b0b;
  color: #f5f5f5;
  font-size: 14px;
`;

export function ThemeLoading({ label = 'Loading theme...' }) {
  return (
    <LoadingScreen>
      <span>{label}</span>
    </LoadingScreen>
  );
}
