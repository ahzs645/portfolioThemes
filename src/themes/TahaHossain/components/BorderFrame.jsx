import styled from 'styled-components';

const Frame = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 100;
`;

const Border = styled.div`
  position: absolute;
  background: ${p => p.$color};
`;

const BorderTop = styled(Border)`
  top: 24px;
  left: 0;
  width: 100vw;
  height: 0.5px;
`;

const BorderBottom = styled(Border)`
  bottom: 24px;
  left: 0;
  width: 100vw;
  height: 0.5px;
`;

const BorderLeft = styled(Border)`
  top: 0;
  left: 24px;
  width: 0.5px;
  height: 100vh;
`;

const BorderRight = styled(Border)`
  top: 0;
  right: 24px;
  width: 0.5px;
  height: 100vh;
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
