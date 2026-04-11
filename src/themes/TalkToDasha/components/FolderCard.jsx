import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { cards, FOLDER_PATH, FOLDER_VIEWBOX } from '../styles';

const STACK_TOPS = [18, 54, 90];
const STACK_ROTATIONS = [-3.5, 3.5, -4];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getItemTransform(index, activeIndex) {
  if (activeIndex == null) {
    return {
      rotate: 0,
      translateY: 0,
      opacity: 0.72 + index * 0.14,
      zIndex: 20 + index,
    };
  }

  if (index === activeIndex) {
    return {
      rotate: STACK_ROTATIONS[index] ?? 0,
      translateY: -6,
      opacity: 1,
      zIndex: 60,
    };
  }

  return {
    rotate: index < activeIndex ? -1.5 : 1.5,
    translateY: index < activeIndex ? -2 : 4,
    opacity: 0.58 + index * 0.1,
    zIndex: 20 + index,
  };
}

export function FolderCard({ tone = 'lavender', label, items = [] }) {
  const color = cards[tone] || cards.lavender;
  const shadowId = `shadow-${tone}`;
  const rootRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [bubble, setBubble] = useState({ x: 48, y: 48 });

  const activeItem = activeIndex == null ? null : items[activeIndex];

  const visibleItems = useMemo(() => items.slice(0, 3), [items]);

  const updateBubblePosition = (event) => {
    const bounds = rootRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const maxX = Math.max(bounds.width - 190, 28);
    setBubble({
      x: clamp(event.clientX - bounds.left + 14, 28, maxX),
      y: clamp(event.clientY - bounds.top - 22, 28, 132),
    });
  };

  return (
    <Wrap
      ref={rootRef}
      onMouseLeave={() => setActiveIndex(null)}
    >
      <CardBase $bg={color.bg} />

      <ItemsLayer>
        {visibleItems.map((item, index) => {
          const state = getItemTransform(index, activeIndex);
          const isActive = index === activeIndex;
          const href = item.href || undefined;

          return (
            <ItemCard
              key={`${item.label}-${index}`}
              as={href ? 'a' : 'button'}
              href={href}
              type={href ? undefined : 'button'}
              target={href ? '_blank' : undefined}
              rel={href ? 'noreferrer noopener' : undefined}
              $top={STACK_TOPS[index] ?? STACK_TOPS[STACK_TOPS.length - 1]}
              $zIndex={state.zIndex}
              initial={false}
              animate={{
                rotate: state.rotate,
                y: state.translateY,
                opacity: state.opacity,
              }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseMove={updateBubblePosition}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
            >
              <ItemTitle>{item.label}</ItemTitle>
              {item.meta && (
                <ItemMeta
                  animate={{ opacity: isActive ? 1 : 0.55, y: isActive ? 0 : 1 }}
                  transition={{ duration: 0.18 }}
                >
                  {item.meta}
                </ItemMeta>
              )}
            </ItemCard>
          );
        })}
      </ItemsLayer>

      <FolderFace
        viewBox={FOLDER_VIEWBOX}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={shadowId} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="12"
              floodColor="#000"
              floodOpacity="0.08"
            />
          </filter>
        </defs>
        <path
          d={FOLDER_PATH}
          fill={color.bg}
          filter={`url(${`#${shadowId}`})`}
        />
      </FolderFace>

      <FooterRow>
        {label && <Label $ink={color.ink}>{label}</Label>}
      </FooterRow>

      <AnimatePresence>
        {activeItem?.detail && (
          <FloatingBubble
            key={`${activeItem.label}-${activeIndex}`}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, x: bubble.x, y: bubble.y }}
            exit={{ opacity: 0, scale: 0.92, y: bubble.y + 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            {activeItem.detail}
          </FloatingBubble>
        )}
      </AnimatePresence>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  min-height: 248px;
  height: clamp(248px, 34vw, 286px);
  border-radius: 24px;
  overflow: hidden;
  isolation: isolate;
`;

const CardBase = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: ${(p) => p.$bg};
`;

const ItemsLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
`;

const ItemCard = styled(motion.button)`
  position: absolute;
  left: 18px;
  right: 18px;
  top: ${(p) => `${p.$top}px`};
  height: 108px;
  padding: 16px 14px;
  border: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  z-index: ${(p) => p.$zIndex};
  text-align: left;
  outline: none;

  &:focus-visible {
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.95),
      0 0 0 5px rgba(0, 0, 0, 0.15),
      0 -4px 20px rgba(0, 0, 0, 0.14);
  }
`;

const ItemTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
  color: #1e1e1e;
  max-width: calc(100% - 84px);
`;

const ItemMeta = styled(motion.div)`
  position: absolute;
  top: 14px;
  right: 12px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.48);
  white-space: nowrap;
`;

const FolderFace = styled.svg`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120px;
  width: 100%;
  z-index: 1;
  display: block;
`;

const FooterRow = styled.div`
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  min-height: 32px;
  z-index: 3;
  display: flex;
  align-items: center;
`;

const Label = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: ${(p) => p.$ink};
  letter-spacing: -0.02em;
`;

const FloatingBubble = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  max-width: min(180px, calc(100% - 40px));
  padding: 9px 12px;
  border-radius: 12px;
  background: #111111;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  pointer-events: none;
  z-index: 8;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
`;
