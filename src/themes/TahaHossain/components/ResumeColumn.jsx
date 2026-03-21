import React from 'react';
import styled from 'styled-components';
import TechnicalDetails from './TechnicalDetails';

const Column = styled.div`
  flex: 1;
  min-width: 280px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    z-index: 0;
    width: 0.5px;
    height: calc(100% + 48px);
    top: -24px;
    left: 0;
    background: var(--th-line-green);
  }
`;

const BlockWrapper = styled.div`
  padding: 24px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    z-index: 0;
    height: 0.5px;
    width: 100%;
    bottom: 0;
    left: 0;
    background: var(--th-line-blue);
  }
`;

const SectionTitle = styled.div`
  font-family: 'Unica One', sans-serif;
  font-size: 11px;
  letter-spacing: 0.1px;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ItemRow = styled.div`
  display: flex;
  gap: ${p => p.$wide ? '24px' : '12px'};
`;

const NumberBubble = styled.div`
  width: 12px;
  height: 12px;
  border: 1px solid var(--th-text);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 8px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const DateLabel = styled.div`
  font-family: 'Unica One', sans-serif;
  font-size: 11px;
  letter-spacing: 0.1px;
  text-transform: uppercase;
  flex-shrink: 0;
  min-width: 60px;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemTitle = styled.div`
  font-family: 'Unica One', sans-serif;
  font-size: 11px;
  letter-spacing: 0.1px;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const ItemSubtitle = styled.div`
  font-family: 'EB Garamond', serif;
  font-size: 13px;
  line-height: 17px;
  color: var(--th-text);
  opacity: 0.8;
`;

const ItemBody = styled.div`
  font-family: 'EB Garamond', serif;
  font-size: 13px;
  line-height: 17px;
  color: var(--th-text);
  margin-top: 4px;
`;

function formatDate(item) {
  const start = item.startDate || item.date || '';
  const end = item.endDate || '';
  if (start && end) return `${start} — ${end}`;
  return start || '';
}

function Block({ title, items, contentIndex, contentLabel, numbered, wide }) {
  return (
    <BlockWrapper>
      <SectionTitle>{title}</SectionTitle>
      <ItemsContainer>
        {items.map((item, i) => (
          <ItemRow key={i} $wide={wide}>
            {numbered && (
              <NumberBubble>{i + 1}</NumberBubble>
            )}
            {wide && (
              <DateLabel>{formatDate(item)}</DateLabel>
            )}
            <ItemInfo>
              <ItemTitle>
                {item.company || item.organization || item.title || item.institution}
                {!wide && formatDate(item) ? `   ,   ${formatDate(item)}` : ''}
              </ItemTitle>
              {(item.position || item.role || item.degree) && (
                <ItemSubtitle>{item.position || item.role || item.degree}</ItemSubtitle>
              )}
              {(item.summary || item.description) && (
                <ItemBody>{item.summary || item.description}</ItemBody>
              )}
            </ItemInfo>
          </ItemRow>
        ))}
      </ItemsContainer>
      <TechnicalDetails
        index={contentIndex}
        label={contentLabel}
        color="var(--th-line-blue)"
      />
    </BlockWrapper>
  );
}

function ResumeColumn({ children }) {
  return <Column>{children}</Column>;
}

ResumeColumn.Block = Block;

export default ResumeColumn;
