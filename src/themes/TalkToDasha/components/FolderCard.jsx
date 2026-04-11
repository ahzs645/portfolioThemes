import React, { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { cards, FOLDER_PATH, FOLDER_VIEWBOX } from '../styles';

const CARD_VARIANTS = {
  past: {
    shadow: 'rgba(69, 36, 131, 0.2)',
    footerBottom: 13,
    face: { bottom: 0, height: 120 },
    baseItems: [
      { top: 18, bottom: 45, opacity: 0.7 },
      { top: 53, bottom: 10, opacity: 0.8 },
      { top: 88, bottom: -25, opacity: 1 },
    ],
    states: {
      0: {
        items: [
          { top: 12, bottom: 45, rotate: -3, opacity: 0.7 },
          { top: 53, bottom: 10, opacity: 0.8 },
          { top: 88, bottom: -25, opacity: 1 },
        ],
        badge: { top: 21, right: -2, rotate: -7 },
      },
      1: {
        items: [
          { top: 18, bottom: 45, opacity: 0.7 },
          { top: 48, bottom: 15, rotate: 4, opacity: 0.8 },
          { top: 88, bottom: -25, opacity: 1 },
        ],
        badge: { top: 7, right: 28, rotate: 4 },
      },
      2: {
        items: [
          { top: 18, bottom: 45, opacity: 0.7 },
          { top: 53, bottom: 10, opacity: 0.8 },
          { top: 84, bottom: -21, rotate: -4, opacity: 1 },
        ],
        badge: { top: 13, right: 3, rotate: -7 },
      },
    },
  },
  founder: {
    shadow: 'rgba(117, 19, 19, 0.1)',
    footerBottom: 13,
    face: { bottom: 0, height: 120 },
    baseItems: [
      { top: 18, bottom: 45, opacity: 0.7, blur: 6 },
      { top: 53, bottom: 10, opacity: 0.8 },
      { top: 88, bottom: -25, opacity: 0.9 },
    ],
    states: {
      0: {
        items: [
          { top: 9, bottom: 54, rotate: -2, opacity: 0.7, blur: 6 },
          { top: 61, bottom: 2, opacity: 0.8 },
          { top: 96, bottom: -33, opacity: 0.9 },
        ],
        badge: { top: 10, right: 8, rotate: 1 },
      },
      1: {
        items: [
          { top: 18, bottom: 45, opacity: 0.7, blur: 6 },
          { top: 40, bottom: 23, rotate: 2, opacity: 0.8 },
          { top: 88, bottom: -25, opacity: 0.9 },
        ],
        badge: { top: 10, right: 8, rotate: 1 },
      },
      2: {
        items: [
          { top: 18, bottom: 45, opacity: 0.7, blur: 6 },
          { top: 53, bottom: 10, opacity: 0.8 },
          { top: 80, bottom: -17, right: 17, rotate: -4, opacity: 0.9 },
        ],
        badge: { top: 10, right: 8, rotate: 1 },
        leaveDelay: 200,
      },
    },
  },
  social: {
    shadow: 'rgba(42, 96, 15, 0.2)',
    footerBottom: 16,
    face: { top: 128, height: 120 },
    baseItems: [
      { top: 18, bottom: 45, opacity: 0.7 },
      { top: 53, bottom: 10, opacity: 0.9 },
      { top: 88, bottom: -25, opacity: 1 },
    ],
    states: {
      0: {
        items: [
          { top: 15, bottom: 45, rotate: 6, opacity: 0.7 },
          { top: 53, bottom: 10, opacity: 0.9 },
          { top: 88, bottom: -25, opacity: 1 },
        ],
      },
      1: {
        items: [
          { top: 18, bottom: 45, opacity: 0.7 },
          { top: 46, bottom: 17, rotate: -7, opacity: 0.9 },
          { top: 88, bottom: -25, opacity: 1 },
        ],
      },
      2: {
        items: [
          { top: 18, bottom: 45, opacity: 0.7 },
          { top: 53, bottom: 10, opacity: 0.9 },
          { top: 82, bottom: -19, rotate: 5, opacity: 1 },
        ],
      },
    },
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function FolderCard({ tone = 'lavender', label, items = [], variant = 'past' }) {
  const color = cards[tone] || cards.lavender;
  const config = CARD_VARIANTS[variant] || CARD_VARIANTS.past;
  const shadowId = `shadow-${tone}-${variant}`;
  const [activeIndex, setActiveIndex] = useState(null);
  const [marker, setMarker] = useState({ x: 0, y: 0 });
  const visibleItems = useMemo(() => items.slice(0, 3), [items]);

  const updateMarker = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;
    setMarker({
      x: clamp(localX - bounds.width * 0.5, -18, 18),
      y: clamp(localY - bounds.height * 0.5, -10, 10),
    });
  };

  const itemSpecs = activeIndex == null
    ? config.baseItems
    : (config.states[activeIndex]?.items || config.baseItems);

  const clearActive = (index) => {
    const delay = config.states[index]?.leaveDelay ?? 0;
    if (delay > 0) {
      window.setTimeout(() => {
        setActiveIndex((current) => (current === index ? null : current));
      }, delay);
      return;
    }
    setActiveIndex((current) => (current === index ? null : current));
  };

  return (
    <Wrap>
      <ClipLayer>
        <CardBase $bg={color.bg} />

        <ItemsLayer>
          {visibleItems.map((item, index) => {
            const spec = itemSpecs[index] || itemSpecs[itemSpecs.length - 1];
            const href = item.href || undefined;
            const badge = activeIndex === index ? config.states[index]?.badge : null;
            const cardProps = {
              $shadow: config.shadow,
              $left: spec.left,
              $right: spec.right,
              initial: false,
              animate: {
                top: spec.top,
                bottom: spec.bottom,
                rotate: spec.rotate || 0,
                opacity: spec.opacity,
              },
              transition: { type: 'spring', stiffness: 400, damping: 30 },
              onMouseEnter: () => setActiveIndex(index),
              onMouseMove: updateMarker,
              onMouseLeave: () => clearActive(index),
              onFocus: () => setActiveIndex(index),
              onBlur: () => clearActive(index),
            };

            if (href) {
              return (
                <ItemLinkCard
                  key={`${item.label}-${index}`}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  {...cardProps}
                >
                  <ItemTitle $top={spec.titleTop} $blur={spec.blur}>
                    {item.label}
                  </ItemTitle>
                  {badge && item.detail ? (
                    <Badge
                      initial={{ opacity: 0, scale: 0.96, rotate: badge.rotate }}
                      animate={{ opacity: 1, scale: 1, rotate: badge.rotate }}
                      exit={{ opacity: 0, scale: 0.96, rotate: badge.rotate }}
                      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                      $top={badge.top}
                      $right={badge.right}
                    >
                      <BadgeMarker
                        animate={{ x: marker.x, y: marker.y }}
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                      <BadgeText>{item.detail}</BadgeText>
                    </Badge>
                  ) : null}
                </ItemLinkCard>
              );
            }

            return (
              <ItemButtonCard
                key={`${item.label}-${index}`}
                type="button"
                {...cardProps}
              >
                <ItemTitle $top={spec.titleTop} $blur={spec.blur}>
                  {item.label}
                </ItemTitle>
                {badge && item.detail ? (
                  <Badge
                    initial={{ opacity: 0, scale: 0.96, rotate: badge.rotate }}
                    animate={{ opacity: 1, scale: 1, rotate: badge.rotate }}
                    exit={{ opacity: 0, scale: 0.96, rotate: badge.rotate }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    $top={badge.top}
                    $right={badge.right}
                  >
                    <BadgeMarker
                      animate={{ x: marker.x, y: marker.y }}
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                    <BadgeText>{item.detail}</BadgeText>
                  </Badge>
                ) : null}
              </ItemButtonCard>
            );
          })}
        </ItemsLayer>

        <FolderFace
          viewBox={FOLDER_VIEWBOX}
          preserveAspectRatio="none"
          aria-hidden="true"
          $top={config.face.top}
          $bottom={config.face.bottom}
          $height={config.face.height}
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
          <path d={FOLDER_PATH} fill={color.bg} filter={`url(#${shadowId})`} />
        </FolderFace>

        <FooterRow $bottom={config.footerBottom}>
          {label && <Label $ink={color.ink}>{label}</Label>}
        </FooterRow>
      </ClipLayer>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  width: min(230px, 100%);
  aspect-ratio: 230 / 248;
  justify-self: center;
  overflow: visible;
  isolation: isolate;
`;

const ClipLayer = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 24px;
  overflow: hidden;
`;

const CardBase = styled.div`
  position: absolute;
  inset: 0;
  background: ${(p) => p.$bg};
  border-radius: 24px;
`;

const ItemsLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`;

const itemCardStyles = css`
  position: absolute;
  left: ${(p) => `${p.$left ?? 18}px`};
  right: ${(p) => `${p.$right ?? 18}px`};
  border: 0;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 -4px 20px 0 ${(p) => p.$shadow};
  color: inherit;
  cursor: pointer;
  overflow: hidden;
  text-align: left;
  text-decoration: none;
  outline: none;
`;

const ItemButtonCard = styled(motion.button)`
  ${itemCardStyles}
`;

const ItemLinkCard = styled(motion.a)`
  ${itemCardStyles}
`;

const ItemTitle = styled.div`
  position: absolute;
  top: ${(p) => `${p.$top ?? 9}px`};
  left: 11px;
  right: 11px;
  font-size: 14px;
  font-weight: 500;
  color: #1e1e1e;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  filter: ${(p) => (p.$blur ? `blur(${p.$blur}px)` : 'none')};
`;

const FolderFace = styled.svg`
  position: absolute;
  left: 0;
  right: 0;
  ${(p) => (p.$top != null ? `top: ${p.$top}px;` : '')}
  ${(p) => (p.$bottom != null ? `bottom: ${p.$bottom}px;` : '')}
  ${(p) => (p.$height != null ? `height: ${p.$height}px;` : '')}
  width: 100%;
  z-index: 2;
  display: block;
  pointer-events: none;
`;

const FooterRow = styled.div`
  position: absolute;
  left: 11px;
  width: 208px;
  bottom: ${(p) => `${p.$bottom}px`};
  display: flex;
  align-items: center;
  z-index: 3;
`;

const Label = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: ${(p) => p.$ink};
`;

const Badge = styled(motion.div)`
  position: absolute;
  top: ${(p) => `${p.$top}px`};
  right: ${(p) => `${p.$right}px`};
  padding: 9px 12px 9px 31px;
  border-radius: 10px;
  background: #000;
  color: #fff;
  z-index: 10;
  pointer-events: none;
  overflow: hidden;
`;

const BadgeMarker = styled(motion.span)`
  position: absolute;
  left: 12px;
  top: calc(50% - 5px);
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #fff;
  opacity: 0.9;
`;

const BadgeText = styled.div`
  position: relative;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.1;
  text-align: center;
  white-space: pre-line;
`;
