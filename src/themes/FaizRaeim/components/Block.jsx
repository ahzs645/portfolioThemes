import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const blockVariants = {
  initial: { scale: 0.5, y: 50, opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1 },
};

const blockTransition = {
  type: 'spring',
  mass: 3,
  stiffness: 400,
  damping: 50,
};

const StyledBlock = styled(motion.div)`
  grid-column: span 4;
  border-radius: 8px;
  border: 1px solid #3f3f46;
  background: #27272a;
  padding: 24px;
`;

export function Block({ children, style, whileHover, className, ...rest }) {
  return (
    <StyledBlock
      variants={blockVariants}
      transition={blockTransition}
      whileHover={whileHover}
      style={style}
      {...rest}
    >
      {children}
    </StyledBlock>
  );
}

export function SectionGrid({ children, id }) {
  return (
    <GridContainer
      id={id}
      initial="initial"
      animate="animate"
      transition={{ staggerChildren: 0.05 }}
    >
      {children}
    </GridContainer>
  );
}

const GridContainer = styled(motion.div)`
  margin: 0 auto;
  display: grid;
  max-width: 896px;
  grid-auto-flow: dense;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
`;
