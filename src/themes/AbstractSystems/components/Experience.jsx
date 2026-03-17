import React from 'react';
import styled from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';
import { getCompanyExperience, formatRange } from '../utils/helpers';

export default function Experience({ cv, theme }) {
  const entries = getCompanyExperience(cv.experience || []).slice(0, 6);

  if (entries.length === 0) return null;

  return (
    <Section id="as-experience">
      <Header>
        <Label $theme={theme}>Experience</Label>
      </Header>

      <List className="blur-hover-group">
        {entries.map((entry, i) => (
          <Entry key={i} className="blur-hover" $theme={theme}>
            <EntryLeft>
              <LogoCircle $theme={theme}>
                {(entry.company || '?')[0].toUpperCase()}
              </LogoCircle>
              <EntryInfo>
                <Company $theme={theme}>{entry.company}</Company>
                <Role $theme={theme}>{entry.title}</Role>
              </EntryInfo>
            </EntryLeft>
            <DateLabel $theme={theme}>
              {formatRange(entry.startDate, entry.endDate)}
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const Company = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: ${p => p.$theme.heading};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Role = styled.span`
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
