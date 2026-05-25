import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { formatDateRange } from '../../../utils/cvHelpers';

export default function LogsSection({ cv, $dark = false }) {
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
        <SectionLabel $dark={$dark} data-log>LOGS</SectionLabel>
        <Subtitle $dark={$dark} data-log>Work experience, roles, and career timeline.</Subtitle>

        <ExpList>
          {cv.experience.map((item, i) => (
            <ExpCard $dark={$dark} key={i} data-log>
              <ExpHeader>
                <ExpCompany $dark={$dark}>{item.company}</ExpCompany>
                <ExpDate $dark={$dark}>{formatDateRange(item.startDate || item.start_date, item.endDate || item.end_date)}</ExpDate>
              </ExpHeader>
              <ExpTitle $dark={$dark}>{item.title}</ExpTitle>
              {item.summary && <ExpSummary $dark={$dark}>{item.summary}</ExpSummary>}
              {item.highlights && item.highlights.length > 0 && (
                <HighlightList $dark={$dark}>
                  {item.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </HighlightList>
              )}
            </ExpCard>
          ))}
        </ExpList>
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
    padding: 60px 24px 120px;
  }
`;

const SectionLabel = styled.h2`
  margin: 0 0 8px;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: ${p => p.$dark ? 'rgb(140, 130, 115)' : 'rgb(119, 111, 100)'};
  text-transform: uppercase;
`;

const Subtitle = styled.p`
  margin: 0 0 40px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 28px;
  color: ${p => p.$dark ? 'rgb(140, 175, 220)' : 'rgb(41, 72, 110)'};
  letter-spacing: -0.02em;

  @media (max-width: 809px) {
    font-size: 22px;
  }
`;

const ExpList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 720px;
`;

const ExpCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 24px;
  border: 1px solid ${p => p.$dark ? 'rgba(140, 175, 220, 0.1)' : 'rgba(41, 73, 111, 0.08)'};
  border-radius: 2px;
  background: ${p => p.$dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.3)'};
  backdrop-filter: blur(4px);
`;

const ExpHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
`;

const ExpCompany = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 20px;
  font-weight: 500;
  color: ${p => p.$dark ? 'rgb(140, 175, 220)' : 'rgb(41, 72, 110)'};
  letter-spacing: -0.02em;
`;

const ExpDate = styled.span`
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: ${p => p.$dark ? 'rgb(100, 115, 135)' : 'rgb(175, 184, 196)'};
  white-space: nowrap;
  flex-shrink: 0;
`;

const ExpTitle = styled.span`
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: ${p => p.$dark ? 'rgb(110, 125, 148)' : 'rgb(115, 131, 153)'};
  letter-spacing: -0.01em;
`;

const ExpSummary = styled.p`
  margin: 4px 0 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 15px;
  line-height: 1.6;
  color: ${p => p.$dark ? 'rgb(110, 125, 148)' : 'rgb(146, 159, 176)'};
`;

const HighlightList = styled.ul`
  margin: 4px 0 0;
  padding-left: 1.2rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 14px;
  line-height: 1.7;
  color: ${p => p.$dark ? 'rgb(110, 125, 148)' : 'rgb(146, 159, 176)'};

  li {
    margin-bottom: 2px;
  }
`;
