import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { gridVariants } from '../styles';

const Wrap = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-flow: row dense;
  }
  @media (min-width: 1024px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (min-width: 1280px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
`;

export function Grid({ children }) {
  return (
    <Wrap
      variants={gridVariants}
      initial="hidden"
      animate="show"
      whileInView="show"
      viewport={{ once: true }}
    >
      {children}
    </Wrap>
  );
}
