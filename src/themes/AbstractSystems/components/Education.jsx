import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { formatRange } from '../utils/helpers';
import { filterActive } from '../../../utils/cvHelpers';

export default function Education({ cv, theme }) {
  const items = filterActive(cv.education || []).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <Section>
      <Header>
        <Label $theme={theme}>Education</Label>
      </Header>

      <List className="blur-hover-group">
        {items.map((entry, i) => (
          <Entry key={i} className="blur-hover" $theme={theme}>
            <EntryLeft>
              <LogoCircle $theme={theme}>
                {(entry.institution || '?')[0].toUpperCase()}
              </LogoCircle>
              <EntryInfo>
                <Institution $theme={theme}>{entry.institution}</Institution>
                <Degree $theme={theme}>
                  {[entry.degree, entry.area].filter(Boolean).join(' — ')}
                </Degree>
              </EntryInfo>
            </EntryLeft>
            <DateLabel $theme={theme}>
              {formatRange(entry.start_date, entry.end_date)}
            </DateLabel>
          </Entry>
        ))}
      </List>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 0 0 12px;
`;

const Label = styled.h2`
  font-family: ${FONT.sans};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
  color: ${p => p.$theme.muted};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Entry = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px dotted ${p => p.$theme.border};
  transition: opacity 0.15s ease, transform 0.15s ease;
  cursor: default;

  @media (hover: hover) {
    &:hover {
      transform: translateX(2px);
    }
  }
`;

const EntryLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const LogoCircle = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: ${p => p.$theme.pillBg};
  border: 1px solid ${p => p.$theme.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${FONT.sans};
  font-size: 14px;
  font-weight: 600;
  color: ${p => p.$theme.heading};
  flex-shrink: 0;
`;

const EntryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const Institution = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: ${p => p.$theme.heading};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Degree = styled.span`
  font-family: ${FONT.sans};
  font-size: 13px;
  line-height: 18px;
  color: ${p => p.$theme.muted};
`;

const DateLabel = styled.span`
  font-family: ${FONT.mono};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.02em;
  color: ${p => p.$theme.muted};
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: 12px;
`;
