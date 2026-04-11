import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles';

const Bar = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  padding-right: 0.5rem;
  padding-left: 1rem;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: ${colors.text400};
`;

const Label = styled.span`
  padding: 0.375rem 0;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 0.5rem;
`;

const ArrowLink = styled.a`
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
  border-radius: 9999px;
  transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  color: inherit;
  cursor: ${(p) => (p.href ? 'alias' : 'default')};

  .group:hover &,
  .group:focus-within & {
    background: #ffffff;
    color: ${colors.text900};
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 0 0 rgba(0, 0, 0, 0.1);
  }
`;

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    width="16"
    height="16"
    aria-hidden
  >
    <path
      fillRule="evenodd"
      d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
      clipRule="evenodd"
    />
  </svg>
);

export function CardTopBar({ category, label, url }) {
  const handleArrowClick = (event) => {
    event.stopPropagation();
  };
  return (
    <Bar>
      <Label>
        {category}
        {label ? ` · ${label}` : ''}
      </Label>
      {url ? (
        <ArrowLink
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={handleArrowClick}
          aria-label={`Open ${label || category}`}
        >
          <ArrowIcon />
        </ArrowLink>
      ) : (
        <ArrowLink as="span" aria-hidden>
          <ArrowIcon />
        </ArrowLink>
      )}
    </Bar>
  );
}
