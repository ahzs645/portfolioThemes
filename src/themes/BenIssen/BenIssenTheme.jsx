import { useEffect, useMemo, useRef, useState } from 'react';
import { useCV } from '../../contexts/ConfigContext';
import {
  GlobalStyle,
  Wrap,
  Stage,
  Card,
  Grain,
  Inset,
  LeftCol,
  RightCol,
  HeaderRow,
  Avatar,
  NameBlock,
  ToolsRow,
  TabsScroll,
  Tab,
  SearchBtn,
  ListWrap,
  ItemBtn,
  Empty,
  RightScroll,
} from './styles';
import {
  C,
  COLORS,
  FONT_HREF,
  useFontLink,
  statusFor,
  getInitials,
} from './helpers';
import { DrawingCanvas, CanvasToolbar } from './DrawingCanvas';
import {
  ExperienceDetail,
  ProjectDetail,
  ArticleDetail,
  ContactDetail,
  MoreDetail,
  BioView,
  buildMoreSections,
} from './detail';

const SearchIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="15" height="15">
    <path
      d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"
      fill="currentColor"
    />
  </svg>
);

const TABS = [
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'articles', label: 'Articles' },
  { id: 'contact', label: 'Contact' },
  { id: 'more', label: 'More' },
];

export function BenIssenTheme() {
  const cv = useCV();
  const [tab, setTab] = useState('experience');
  const [selectedKey, setSelectedKey] = useState(null);
  const [showBio, setShowBio] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brush, setBrush] = useState(3);
  const [clearKey, setClearKey] = useState(0);
  const [toolsOpen, setToolsOpen] = useState(false);
  const rightScrollRef = useRef(null);

  useFontLink(FONT_HREF);

  useEffect(() => {
    document.body.classList.add('benissen-locked');
    return () => document.body.classList.remove('benissen-locked');
  }, []);

  const initials = useMemo(() => getInitials(cv?.name || 'A'), [cv?.name]);

  const projects = useMemo(
    () => (cv?.sectionsRaw?.projects || []).filter((p) => p?.name),
    [cv?.sectionsRaw?.projects]
  );

  const experience = useMemo(() => cv?.experience || [], [cv?.experience]);

  const articles = useMemo(() => {
    const out = [];
    (cv?.publications || []).forEach((p, i) => {
      if (p?.title || p?.name) {
        out.push({
          key: `pub-${i}`,
          kind: 'publication',
          title: p.title || p.name,
          sub: p.journal || p.publisher || (Array.isArray(p.authors) ? p.authors.slice(0, 3).join(', ') : null),
          raw: p,
        });
      }
    });
    (cv?.presentations || []).forEach((p, i) => {
      if (p?.title || p?.name) {
        out.push({
          key: `pre-${i}`,
          kind: 'presentation',
          title: p.title || p.name,
          sub: p.summary || p.venue || p.event,
          raw: p,
        });
      }
    });
    return out;
  }, [cv?.publications, cv?.presentations]);

  const contacts = useMemo(() => {
    const out = [];
    if (cv?.email) out.push({ key: 'email', title: 'Email', sub: cv.email, url: `mailto:${cv.email}` });
    (cv?.socialRaw || []).forEach((s, i) => {
      if (s?.url) out.push({ key: `s-${i}`, title: s.network, sub: s.username || s.url.replace(/^https?:\/\//, ''), url: s.url });
    });
    if (cv?.website) out.push({ key: 'web', title: 'Website', sub: cv.website.replace(/^https?:\/\//, ''), url: cv.website });
    if (cv?.phone) out.push({ key: 'phone', title: 'Phone', sub: cv.phone, url: `tel:${cv.phone}` });
    return out;
  }, [cv]);

  const moreSections = useMemo(() => (cv ? buildMoreSections(cv) : []), [cv]);

  const bioParagraphs = useMemo(() => {
    if (!cv?.about) return [];
    return cv.about.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  }, [cv?.about]);

  useEffect(() => {
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = 0;
  }, [selectedKey, showBio, tab]);

  if (!cv) {
    return (
      <Wrap className="benissen-theme">
        <GlobalStyle />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: C.textMuted }}>
          Loading…
        </div>
      </Wrap>
    );
  }

  let listItems = [];
  if (tab === 'experience') {
    listItems = experience.map((e, i) => ({
      key: `e-${i}`,
      title: e.title,
      badge: e.isCurrent ? 'Current' : null,
      desc: e.company,
      raw: e,
      type: 'experience',
    }));
  } else if (tab === 'work') {
    listItems = projects.map((p, i) => ({
      key: `p-${i}`,
      title: p.name,
      badge: statusFor(p),
      desc: p.description,
      raw: p,
      type: 'project',
    }));
  } else if (tab === 'articles') {
    listItems = articles.map((a) => ({
      key: a.key,
      title: a.title,
      desc: a.sub,
      kind: a.kind,
      raw: a.raw,
      type: 'article',
    }));
  } else if (tab === 'contact') {
    listItems = contacts.map((c) => ({
      key: c.key,
      title: c.title,
      desc: c.sub,
      raw: c,
      type: 'contact',
    }));
  } else {
    listItems = moreSections.map((s) => ({
      key: s.key,
      title: s.title,
      desc: s.subtitle,
      raw: s,
      type: 'more',
    }));
  }

  const effectiveKey =
    listItems.find((it) => it.key === selectedKey)?.key ?? listItems[0]?.key ?? null;
  const selected = !showBio && effectiveKey
    ? listItems.find((it) => it.key === effectiveKey)
    : null;

  const onTabChange = (id) => {
    setTab(id);
    setShowBio(false);
    setSelectedKey(null);
  };

  const onBack = () => setShowBio(true);

  const renderRight = () => {
    if (!selected) return <BioView cv={cv} bioParagraphs={bioParagraphs} />;
    if (selected.type === 'experience') return <ExperienceDetail item={selected.raw} onBack={onBack} />;
    if (selected.type === 'project') return <ProjectDetail item={selected.raw} onBack={onBack} />;
    if (selected.type === 'article') return <ArticleDetail item={selected} onBack={onBack} />;
    if (selected.type === 'contact') return <ContactDetail item={selected} onBack={onBack} />;
    if (selected.type === 'more') return <MoreDetail item={selected} onBack={onBack} />;
    return null;
  };

  return (
    <>
      <GlobalStyle />
      <Wrap className="benissen-theme">
        <DrawingCanvas color={color} size={brush} clearKey={clearKey} />

        <Stage>
          <Card>
            <Grain />
            <Inset>
              <LeftCol>
                <HeaderRow onClick={() => setShowBio(true)} title="Show bio">
                  <Avatar>
                    {cv.avatar ? <img src={cv.avatar} alt="" /> : initials}
                  </Avatar>
                  <NameBlock>
                    <div className="n">{cv.name}</div>
                    <div className="t">{cv.currentJobTitle || 'I design and build things people love'}</div>
                  </NameBlock>
                </HeaderRow>

                <ToolsRow>
                  <TabsScroll>
                    {TABS.map((t) => (
                      <Tab
                        key={t.id}
                        $active={tab === t.id}
                        onClick={() => onTabChange(t.id)}
                      >
                        {t.label}
                      </Tab>
                    ))}
                  </TabsScroll>
                  <SearchBtn aria-label="Search" title="Search (visual only)">
                    {SearchIcon}
                  </SearchBtn>
                </ToolsRow>

                <ListWrap>
                  {listItems.length ? (
                    listItems.map((it) => (
                      <ItemBtn
                        key={it.key}
                        $active={!showBio && effectiveKey === it.key}
                        onClick={() => { setSelectedKey(it.key); setShowBio(false); }}
                      >
                        <div className="title-row">
                          <div className="title">{it.title}</div>
                          {it.badge && <div className="badge">{it.badge}</div>}
                        </div>
                        {it.desc && <div className="desc">{it.desc}</div>}
                      </ItemBtn>
                    ))
                  ) : (
                    <Empty>Nothing here yet.</Empty>
                  )}
                </ListWrap>
              </LeftCol>

              <RightCol>
                <RightScroll ref={rightScrollRef}>
                  {renderRight()}
                </RightScroll>
              </RightCol>
            </Inset>
          </Card>
        </Stage>

        <CanvasToolbar
          color={color}
          setColor={setColor}
          brush={brush}
          setBrush={setBrush}
          clear={() => setClearKey((k) => k + 1)}
          open={toolsOpen}
          setOpen={setToolsOpen}
        />
      </Wrap>
    </>
  );
}
