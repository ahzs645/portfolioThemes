import React, { useEffect } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { Tag } from './Tag';
import { colors, fonts } from '../styles';

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  @media (min-width: 640px) {
    align-items: center;
    padding: 2rem;
  }
`;

const Panel = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 720px;
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid ${colors.border};
  border-radius: 0.75rem;
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.04),
    0 20px 25px -5px rgba(0, 0, 0, 0.12),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);

  @media (min-width: 640px) {
    max-height: 85vh;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1rem 0.5rem 1.25rem;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: ${colors.text400};
`;

const Category = styled.span`
  display: inline-block;
  padding: 0.375rem 0;
`;

const CloseButton = styled.button`
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: ${colors.text400};
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;

  &:hover, &:focus-visible {
    background: ${colors.bg50};
    color: ${colors.text900};
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 0 0 rgba(0, 0, 0, 0.1);
    outline: none;
  }
`;

const Body = styled.div`
  overflow-y: auto;
  padding: 0.25rem 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (min-width: 640px) {
    padding: 0.5rem 2.5rem 2.5rem;
  }

  &::-webkit-scrollbar { width: 10px; }
  &::-webkit-scrollbar-thumb {
    background: ${colors.bg200};
    border-radius: 9999px;
    border: 3px solid #ffffff;
  }
`;

const Heading = styled.h2`
  margin: 0;
  font-family: ${fonts.serif};
  font-variation-settings: "opsz" 144, "SOFT" 50;
  font-weight: 300;
  font-size: 2rem;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: ${colors.text900};

  @media (min-width: 640px) { font-size: 3rem; }
`;

const Subheading = styled.p`
  margin: 0;
  font-size: 1rem;
  letter-spacing: -0.025em;
  color: ${colors.text500};
  font-weight: 400;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: ${colors.text400};

  span + span::before {
    content: '·';
    margin-right: 0.75rem;
    color: ${colors.text200};
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const HighlightList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HighlightItem = styled.li`
  position: relative;
  padding-left: 1.25rem;
  font-size: 0.95rem;
  line-height: 1.625;
  letter-spacing: -0.015em;
  color: ${colors.text700};
  font-weight: 300;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.75rem;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    background: ${colors.bg200};
  }
`;

const ExternalLink = styled.a`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 9999px;
  background: ${colors.text900};
  color: #ffffff;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  cursor: alias;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 1px 0 0 rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-1px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      0 6px 12px -6px rgba(0, 0, 0, 0.4);
  }
`;

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden>
    <path
      fillRule="evenodd"
      d="M4.28 4.22a.75.75 0 011.06 0L10 8.94l4.66-4.72a.75.75 0 111.06 1.06L11.06 10l4.66 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.66 4.72a.75.75 0 01-1.06-1.06L8.94 10 4.28 5.28a.75.75 0 010-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden>
    <path
      fillRule="evenodd"
      d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
      clipRule="evenodd"
    />
  </svg>
);

export function Modal({ card, onClose }) {
  useEffect(() => {
    if (!card) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [card, onClose]);

  return (
    <AnimatePresence>
      {card && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={card.details?.heading || card.category}
        >
          <Panel
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
          >
            <Header>
              <Category>
                {card.category}
                {card.label ? ` · ${card.label}` : ''}
              </Category>
              <CloseButton type="button" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </CloseButton>
            </Header>
            <Body>
              {card.details?.heading && <Heading>{card.details.heading}</Heading>}
              {card.details?.subheading && <Subheading>{card.details.subheading}</Subheading>}
              {card.details?.meta && card.details.meta.length > 0 && (
                <MetaRow>
                  {card.details.meta.map((item, index) => (
                    <span key={`${item}-${index}`}>{item}</span>
                  ))}
                </MetaRow>
              )}
              {card.details?.tags && card.details.tags.length > 0 && (
                <TagRow>
                  {card.details.tags.map((tag, index) => (
                    <Tag key={`${tag.label}-${index}`} label={tag.label} color={tag.color} />
                  ))}
                </TagRow>
              )}
              {card.details?.highlights && card.details.highlights.length > 0 && (
                <HighlightList>
                  {card.details.highlights.map((item, index) => (
                    <HighlightItem key={index}>{item}</HighlightItem>
                  ))}
                </HighlightList>
              )}
              {card.details?.link && (
                <ExternalLink
                  href={card.details.link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {card.details.link.label || 'Open'}
                  <ArrowIcon />
                </ExternalLink>
              )}
            </Body>
          </Panel>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}
