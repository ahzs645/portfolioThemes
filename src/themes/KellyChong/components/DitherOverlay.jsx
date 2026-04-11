import styled from 'styled-components';
import { withBase } from '../../../utils/assetPath';

export default function DitherOverlay() {
  return <Overlay />;
}

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: soft-light;
  background-image: url('${withBase('kelly-chong/dither-overlay.png')}');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
`;
