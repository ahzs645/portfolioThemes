import styled from 'styled-components';

const Frame = styled.div`
  position: fixed;
  top: var(--app-top-offset, 0px);
  left: 0;
  width: 100vw;
  height: calc(100vh - var(--app-top-offset, 0px));
  pointer-events: none;
  z-index: 100;
`;

const Border = styled.div`
  position: absolute;
  background: ${p => p.$color};
`;

const BorderTop = styled(Border)`
  top: clamp(12px, 2vw, 24px);
  left: 0;
  width: 100%;
  height: 0.5px;
`;

const BorderBottom = styled(Border)`
  bottom: clamp(12px, 2vw, 24px);
  left: 0;
  width: 100%;
  height: 0.5px;
`;

const BorderLeft = styled(Border)`
  top: 0;
  left: clamp(12px, 2vw, 24px);
  width: 0.5px;
  height: calc(100vh - var(--app-top-offset, 0px));
`;

const BorderRight = styled(Border)`
  top: 0;
  right: clamp(12px, 2vw, 24px);
  width: 0.5px;
  height: calc(100vh - var(--app-top-offset, 0px));
`;

export default function BorderFrame() {
  return (
    <Frame>
      <BorderLeft $color="var(--th-line-red)" />
      <BorderTop $color="var(--th-line-red)" />
      <BorderRight $color="var(--th-line-green)" />
      <BorderBottom $color="var(--th-line-blue)" />
    </Frame>
  );
}
