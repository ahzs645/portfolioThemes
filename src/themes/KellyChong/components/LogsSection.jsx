import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { formatDateRange, formatMonthYear } from '../../../utils/cvHelpers';

export default function LogsSection({ cv }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll('[data-log]');
    gsap.fromTo(
      items,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  return (
    <TabPage ref={ref}>
      <Inner>
        <SectionLabel data-log>LOGS</SectionLabel>
        <Subtitle data-log>Field notes, diaries, and other documentation.</Subtitle>

        <Grid>
          {cv.education.length > 0 && (
            <Column>
              <GroupLabel data-log>PERSONAL</GroupLabel>
              <LogList>
                {cv.education.slice(0, 4).map((item, i) => (
                  <LogItem key={i} data-log>
                    <LogTitle>{item.institution}</LogTitle>
                    <LogMeta>
                      {item.degree} {item.area ? `in ${item.area}` : ''}
                      {(item.start_date || item.end_date) && ` \u00B7 ${formatDateRange(item.start_date, item.end_date)}`}
                    </LogMeta>
                  </LogItem>
                ))}
              </LogList>
            </Column>
          )}

          {cv.projects.length > 0 && (
            <Column>
              <GroupLabel data-log>SELECT WRITING</GroupLabel>
              <LogList>
                {cv.projects.slice(0, 6).map((item, i) => (
                  <LogItem key={i} data-log>
                    {item.url ? (
                      <LogLink href={item.url} target="_blank" rel="noreferrer" data-cursor-hover>{item.name}</LogLink>
                    ) : (
                      <LogTitle>{item.name}</LogTitle>
                    )}
                    <LogMeta>
                      {item.summary}
                      {item.date && ` \u00B7 ${formatMonthYear(String(item.date).includes('-') ? item.date : `${item.date}-01`)}`}
                    </LogMeta>
                  </LogItem>
                ))}
              </LogList>
            </Column>
          )}
        </Grid>
      </Inner>
    </TabPage>
  );
}

const TabPage = styled.div`
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

const Inner = styled.div`
  padding: 80px 64px 120px;
  min-height: 100%;

  @media (max-width: 809px) {
    padding: 70px 24px 120px;
  }
`;

const SectionLabel = styled.h2`
  margin: 0 0 8px;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: rgb(119, 111, 100);
  text-transform: uppercase;
`;

const Subtitle = styled.p`
  margin: 0 0 40px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 28px;
  color: rgb(41, 72, 110);
  letter-spacing: -0.02em;

  @media (max-width: 809px) {
    font-size: 22px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;

  @media (max-width: 809px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GroupLabel = styled.h3`
  margin: 0;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: rgb(119, 111, 100);
`;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LogItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LogTitle = styled.strong`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 17px;
  font-weight: 500;
  color: rgb(41, 72, 110);
`;

const LogLink = styled.a`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 17px;
  font-weight: 500;
  color: rgb(41, 72, 110);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;

  &:hover {
    color: rgb(74, 88, 189);
  }
`;

const LogMeta = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 15px;
  color: rgb(146, 159, 176);
  line-height: 1.6;
`;
