import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';

export default function Footer({ cv, theme }) {
  const year = new Date().getFullYear();
  const name = cv.name || 'Portfolio';

  return (
    <Wrap $theme={theme}>
      &copy; {year} {name}. All rights reserved.
    </Wrap>
  );
}

const Wrap = styled.footer`
  text-align: center;
  padding: 20px 0 100px;
  color: ${p => p.$theme.muted};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;
