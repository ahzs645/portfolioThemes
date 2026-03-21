import styled from 'styled-components';

export default function DitherOverlay() {
  return <Overlay />;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: soft-light;
  background-image: url('https://framerusercontent.com/images/Mxi9YSipT71uRFajaxUuSp2Zo.png?width=1920&height=1080');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
`;
