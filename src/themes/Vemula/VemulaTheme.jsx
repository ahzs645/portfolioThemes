import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { useCV } from '../../contexts/ConfigContext';
import {
  buildSections,
  computeOverlap,
  computeStackTransforms,
  getCardWidth,
} from './data';
import {
  FontLoader,
  Page,
  Title,
  Subtitle,
  CardsContainer,
  Card,
  StackContainer,
  StackCard,
  CardLabel,
  CardCount,
  CardTitle,
} from './styles';
import { DetailPanel } from './DetailPanel';

function Sparkle() {
  return (
    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M30 0 C31 18 42 29 60 30 C42 31 31 42 30 60 C29 42 18 31 0 30 C18 29 29 18 30 0 Z"
        fill="#FFC700"
      />
    </svg>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

const SWIPE_THRESHOLD = 70;
const TAP_THRESHOLD = 6;

export function VemulaTheme() {
  const cv = useCV();
  const containerRef = useRef(null);
  const [overlap, setOverlap] = useState(180);
  const [enterState, setEnterState] = useState('hidden');
  const [openKey, setOpenKey] = useState(null);
  const isMobile = useIsMobile();
  const [order, setOrder] = useState([]);
  const [drag, setDrag] = useState(null);
  const wasDragRef = useRef(false);

  const sections = useMemo(() => {
    if (!cv) return [];
    const seed = Math.floor(Math.random() * 100000);
    return buildSections(cv, seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cv]);

  const stackTransforms = useMemo(() => computeStackTransforms(sections), [sections]);

  useEffect(() => {
    if (isMobile || !sections.length) return undefined;
    function recalc() {
      const node = containerRef.current;
      if (!node) return;
      const cardWidth = getCardWidth(window.innerWidth);
      const next = computeOverlap(node.offsetWidth, sections.length, cardWidth);
      setOverlap(next);
    }
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [sections.length, isMobile]);

  useEffect(() => {
    if (!sections.length) return undefined;
    setEnterState('hidden');
    const startTimer = setTimeout(() => setEnterState('entering'), 80);
    const total = (sections.length - 1) * 100 + 700 + 80;
    const doneTimer = setTimeout(() => setEnterState('entered'), total);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(doneTimer);
    };
  }, [sections.length]);

  const closeDetail = useCallback(() => setOpenKey(null), []);

  useEffect(() => {
    if (!openKey) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') closeDetail();
    }
    document.addEventListener('keydown', onKey);
    document.body.classList.add('vemula-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('vemula-locked');
    };
  }, [openKey, closeDetail]);

  if (!cv) return null;

  const name = cv.name || 'Your Name';
  const firstName = name.split(' ')[0];
  const role = (cv.currentTitle || 'designer').toLowerCase();
  const avatar = cv.avatar;
  const experience = cv.experience || [];
  const current = experience.find((e) => e?.isCurrent) || experience[0] || null;
  const openSection = sections.find((s) => s.key === openKey) || null;

  const rowStateClass =
    enterState === 'hidden'
      ? 'vemula-hidden'
      : enterState === 'entering'
      ? 'vemula-entering'
      : 'vemula-entered';
  const stackStateClass = enterState === 'hidden' ? 'vemula-hidden' : 'vemula-entered';

  return (
    <>
      <FontLoader />
      <Page className="vemula-theme">
        <div>
          <Title>
            Hey there, I am {firstName}
            {avatar && (
              <img className="avatar" src={avatar} alt={`${firstName}'s profile`} />
            )}
            , a {role} polishing ideas until they shine
            <span className="sparkle">
              <Sparkle />
            </span>
          </Title>
          <Subtitle>
            <span className="dot" aria-hidden="true" />
            {current ? (
              <span>
                Currently at{' '}
                {current.url ? (
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="accent"
                  >
                    {current.company.toUpperCase()}
                  </a>
                ) : (
                  <span className="accent">{current.company.toUpperCase()}</span>
                )}
              </span>
            ) : (
              <span>Available for new work</span>
            )}
          </Subtitle>
        </div>

        {!isMobile && (
          <CardsContainer ref={containerRef}>
            {sections.map((section, i) => {
              const isLast = i === sections.length - 1;
              return (
                <Card
                  key={section.key}
                  type="button"
                  className={rowStateClass}
                  onClick={() => setOpenKey(section.key)}
                  aria-label={`Open ${section.title}`}
                  style={{
                    '--card-from': section.palette.from,
                    '--card-to': section.palette.to,
                    '--card-label': section.palette.label,
                    '--enter-delay': `${i * 100}ms`,
                    zIndex: 10 + i,
                    marginRight: isLast ? 0 : `-${overlap}px`,
                  }}
                >
                  <CardLabel>{section.label}</CardLabel>
                  {section.items.length > 1 && (
                    <CardCount>{String(section.items.length).padStart(2, '0')}</CardCount>
                  )}
                  <CardTitle>{section.title}</CardTitle>
                </Card>
              );
            })}
          </CardsContainer>
        )}

        {isMobile && (
          <StackContainer>
            {sections.map((section, i) => {
              const t = stackTransforms[i];
              return (
                <StackCard
                  key={section.key}
                  type="button"
                  className={stackStateClass}
                  onClick={() => setOpenKey(section.key)}
                  aria-label={`Open ${section.title}`}
                  style={{
                    '--card-from': section.palette.from,
                    '--card-to': section.palette.to,
                    '--card-label': section.palette.label,
                    '--card-scale': t.scale,
                    '--card-rot': `${t.rotation}deg`,
                    '--enter-delay': `${i * 80}ms`,
                    zIndex: t.zIndex,
                  }}
                >
                  <CardLabel>{section.label}</CardLabel>
                  {section.items.length > 1 && (
                    <CardCount>{String(section.items.length).padStart(2, '0')}</CardCount>
                  )}
                  <CardTitle>{section.title}</CardTitle>
                </StackCard>
              );
            })}
          </StackContainer>
        )}
      </Page>

      <DetailPanel section={openSection} onClose={closeDetail} />
    </>
  );
}
