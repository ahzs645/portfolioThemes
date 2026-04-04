import React, { memo } from 'react';
import styled from 'styled-components';

/* ── Sub-page header ───────────────────────────────────── */
export function SubPageHeaderBlock({ theme, title, subtitle, onBack }) {
  return (
    <Header>
      <BackRow>
        <BackButton onClick={onBack} $theme={theme}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
        </BackButton>
      </BackRow>
      <Title $theme={theme}>{title}</Title>
      {subtitle && <Subtitle $theme={theme}>{subtitle}</Subtitle>}
    </Header>
  );
}

/* ── Work page ─────────────────────────────────────────── */
export const WorkPage = memo(function WorkPage({ theme, experience }) {
  return (
    <Content>
      {experience.map((item, i) => (
        <Row key={`${item.company}-${i}`}>
          <Company href={item.url || '#'} target="_blank" rel="noreferrer" $theme={theme}>
            <Icon $theme={theme}>{item.company?.charAt(0) || '?'}</Icon>
            <CompanyName $theme={theme}>{item.company}</CompanyName>
          </Company>
          <Role $theme={theme}>{item.title}</Role>
        </Row>
      ))}
      <Footer $theme={theme}>Made with care</Footer>
    </Content>
  );
});

/* ── Projects page ─────────────────────────────────────── */
export const ProjectsPage = memo(function ProjectsPage({ theme, projects }) {
  return (
    <Content>
      {projects.map((project, i) => (
        <Row key={`${project.name}-${i}`}>
          <Company href={project.url || '#'} target="_blank" rel="noreferrer" $theme={theme}>
            <Icon $theme={theme}>{project.name?.charAt(0)}</Icon>
            <CompanyName $theme={theme}>{project.name}</CompanyName>
          </Company>
          <Role $theme={theme}>{project.summary || project.date || ''}</Role>
        </Row>
      ))}
      <Footer $theme={theme}>Made with care</Footer>
    </Content>
  );
});

/* ── Connect page ──────────────────────────────────────── */
export const ConnectPage = memo(function ConnectPage({ theme, cv }) {
  return (
    <Content>
      {cv.email && (
        <Row>
          <Company href={`mailto:${cv.email}`} $theme={theme}>
            <Icon $theme={theme}>@</Icon>
            <CompanyName $theme={theme}>{cv.email}</CompanyName>
          </Company>
          <Role $theme={theme}>Email</Role>
        </Row>
      )}
      {cv.socialRaw?.map((entry, i) => (
        <Row key={`${entry.network}-${i}`}>
          <Company href={entry.url} target="_blank" rel="noreferrer" $theme={theme}>
            <Icon $theme={theme}>{entry.network?.charAt(0)}</Icon>
            <CompanyName $theme={theme}>{entry.network}</CompanyName>
          </Company>
          <Role $theme={theme}>{entry.username || 'Profile'}</Role>
        </Row>
      ))}
      <Footer $theme={theme}>Made with care</Footer>
    </Content>
  );
});

/* ── Styled Components ─────────────────────────────────── */

const Header = styled.div`
  margin-bottom: 24px;
`;

const BackRow = styled.div`
  margin-bottom: 16px;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  margin-left: -8px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: ${({ $theme }) => $theme.muted};
  font-family: 'Instrument Sans', sans-serif;
  font-size: 14px;
  transition: background-color 200ms ease, color 200ms ease;
  &:hover {
    background-color: rgba(20, 27, 20, 0.08);
    color: ${({ $theme }) => $theme.text};
  }
`;

const Title = styled.h1`
  margin: 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: ${({ $theme }) => $theme.text};
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 15px;
  line-height: 24px;
  color: ${({ $theme }) => $theme.muted};
`;

const Content = styled.div`
  padding-bottom: 128px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const Company = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-left: -8px;
  border-radius: 8px;
  color: inherit;
  transition: background-color 200ms ease;
  &:hover {
    background-color: rgba(20, 27, 20, 0.08);
  }
`;

const Icon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  background: ${({ $theme }) => $theme.soft};
  color: ${({ $theme }) => $theme.muted};
  box-shadow: 0px 0px 0px 0.5px rgba(0, 0, 0, 0.16);
`;

const CompanyName = styled.span`
  font-family: 'Instrument Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: ${({ $theme }) => $theme.text};
  text-decoration: underline;
  text-decoration-color: ${({ $theme }) => $theme.underline};
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-skip-ink: none;
`;

const Role = styled.span`
  font-family: 'Instrument Sans', sans-serif;
  font-size: 15px;
  color: ${({ $theme }) => $theme.muted};
  flex-shrink: 0;
  text-align: right;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Footer = styled.div`
  text-align: center;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: ${({ $theme }) => $theme.muted};
  margin-top: 96px;
`;
