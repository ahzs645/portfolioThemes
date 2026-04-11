import {
  DetailBody,
  BackBtn,
  DetailTitleRow,
  DetailTitle,
  StatusBadge,
  MetaRow,
  Tagline,
  Authors,
  BioText,
  Highlights,
  VisitLink,
  TagWrap,
  Tag,
  SubList,
  SubItem,
  BioBody,
  Loc,
  BigName,
  Divider,
  Newsletter,
  Empty,
} from './styles';
import { fmtRange, safeFmt, statusFor, flatSkills, C } from './helpers';

function BackArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ExternalArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" /><polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export function ExperienceDetail({ item, onBack }) {
  const e = item;
  return (
    <DetailBody>
      <BackBtn onClick={onBack}><BackArrow />Bio</BackBtn>
      <DetailTitleRow>
        <DetailTitle>{e.title}</DetailTitle>
        {e.isCurrent && <StatusBadge>Current</StatusBadge>}
      </DetailTitleRow>
      {e.company && <Tagline>{e.company}</Tagline>}
      <MetaRow>
        {(e.startDate || e.endDate) && <span>{fmtRange(e.startDate, e.endDate)}</span>}
        {e.location && <span>· {e.location}</span>}
      </MetaRow>
      {Array.isArray(e.highlights) && e.highlights.length > 0 && (
        <Highlights>
          {e.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </Highlights>
      )}
    </DetailBody>
  );
}

export function ProjectDetail({ item, onBack }) {
  const p = item;
  return (
    <DetailBody>
      <BackBtn onClick={onBack}><BackArrow />Bio</BackBtn>
      <DetailTitleRow>
        <DetailTitle>{p.name}</DetailTitle>
        <StatusBadge>{statusFor(p)}</StatusBadge>
      </DetailTitleRow>
      {(p.start_date || p.end_date) && (
        <MetaRow><span>{fmtRange(p.start_date, p.end_date)}</span></MetaRow>
      )}
      {p.description && <BioText><p>{p.description}</p></BioText>}
      {Array.isArray(p.highlights) && p.highlights.length > 0 && (
        <Highlights>
          {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </Highlights>
      )}
      {p.url && (
        <VisitLink href={p.url} target="_blank" rel="noreferrer">
          Visit project<ExternalArrow />
        </VisitLink>
      )}
    </DetailBody>
  );
}

export function ArticleDetail({ item, onBack }) {
  const a = item.raw;
  const isPub = item.kind === 'publication';
  const title = a.title || a.name;
  const authors = Array.isArray(a.authors) ? a.authors.join(', ') : null;
  const venue = a.journal || a.summary || a.venue || a.event;
  const link = a.url || (a.doi ? `https://doi.org/${a.doi}` : null);

  return (
    <DetailBody>
      <BackBtn onClick={onBack}><BackArrow />Bio</BackBtn>
      <DetailTitleRow>
        <DetailTitle>{title}</DetailTitle>
        {isPub && <StatusBadge>Publication</StatusBadge>}
        {!isPub && <StatusBadge>Talk</StatusBadge>}
      </DetailTitleRow>
      {venue && <Tagline>{venue}</Tagline>}
      {authors && <Authors>{authors}</Authors>}
      <MetaRow>
        {a.date && <span>{safeFmt(a.date)}</span>}
        {a.location && <span>· {a.location}</span>}
        {a.doi && <span>· DOI: {a.doi}</span>}
      </MetaRow>
      {a.abstract && <BioText><p>{a.abstract}</p></BioText>}
      {link && (
        <VisitLink href={link} target="_blank" rel="noreferrer">
          {isPub ? 'Read paper' : 'View details'}<ExternalArrow />
        </VisitLink>
      )}
    </DetailBody>
  );
}

export function ContactDetail({ item, onBack }) {
  const c = item.raw;
  return (
    <DetailBody>
      <BackBtn onClick={onBack}><BackArrow />Bio</BackBtn>
      <DetailTitle>{c.title}</DetailTitle>
      <Tagline>{c.sub}</Tagline>
      {c.url && (
        <VisitLink href={c.url} target={c.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          Open<ExternalArrow />
        </VisitLink>
      )}
    </DetailBody>
  );
}

export function MoreDetail({ item, onBack }) {
  const m = item.raw;
  return (
    <DetailBody>
      <BackBtn onClick={onBack}><BackArrow />Bio</BackBtn>
      <DetailTitle>{m.title}</DetailTitle>
      {m.subtitle && <Tagline>{m.subtitle}</Tagline>}
      {m.render()}
    </DetailBody>
  );
}

export function buildMoreSections(cv) {
  const out = [];

  if (cv.education?.length) {
    out.push({
      key: 'education',
      title: 'Education',
      subtitle: `${cv.education.length} ${cv.education.length === 1 ? 'degree' : 'degrees'}`,
      render: () => (
        <SubList>
          {cv.education.map((e, i) => (
            <SubItem key={i}>
              <div className="head">
                <div className="title">{e.institution || e.school}</div>
                <div className="meta">{fmtRange(e.start_date, e.end_date)}</div>
              </div>
              {(e.degree || e.area) && (
                <div className="sub">{[e.degree, e.area].filter(Boolean).join(' · ')}</div>
              )}
              {e.location && <div className="sub">{e.location}</div>}
              {Array.isArray(e.highlights) && e.highlights.length > 0 && (
                <Highlights>
                  {e.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </Highlights>
              )}
            </SubItem>
          ))}
        </SubList>
      ),
    });
  }

  const skillTags = flatSkills([
    ...(cv.skills || []),
    ...(cv.certificationsSkills || cv.sectionsRaw?.certifications_skills || []),
  ]);
  if (skillTags.length) {
    out.push({
      key: 'skills',
      title: 'Skills',
      subtitle: `${skillTags.length} tools & abilities`,
      render: () => (
        <TagWrap>
          {skillTags.map((s, i) => <Tag key={i}>{s}</Tag>)}
        </TagWrap>
      ),
    });
  }

  if (cv.languages?.length) {
    out.push({
      key: 'languages',
      title: 'Languages',
      subtitle: `${cv.languages.length} ${cv.languages.length === 1 ? 'language' : 'languages'}`,
      render: () => (
        <TagWrap>
          {cv.languages.map((l, i) => (
            <Tag key={i}>{typeof l === 'string' ? l : l.language || l.name}{l.fluency ? ` · ${l.fluency}` : ''}</Tag>
          ))}
        </TagWrap>
      ),
    });
  }

  if (cv.awards?.length) {
    out.push({
      key: 'awards',
      title: 'Awards',
      subtitle: `${cv.awards.length} ${cv.awards.length === 1 ? 'award' : 'awards'}`,
      render: () => (
        <SubList>
          {cv.awards.map((a, i) => (
            <SubItem key={i}>
              <div className="head">
                <div className="title">{a.name || a.title}</div>
                <div className="meta">{safeFmt(a.date)}</div>
              </div>
              {a.summary && <div className="sub">{a.summary}</div>}
              {Array.isArray(a.highlights) && a.highlights.length > 0 && (
                <div className="body">{a.highlights[0]}</div>
              )}
            </SubItem>
          ))}
        </SubList>
      ),
    });
  }

  if (cv.volunteer?.length) {
    out.push({
      key: 'volunteer',
      title: 'Volunteer',
      subtitle: `${cv.volunteer.length} ${cv.volunteer.length === 1 ? 'role' : 'roles'}`,
      render: () => (
        <SubList>
          {cv.volunteer.map((v, i) => (
            <SubItem key={i}>
              <div className="head">
                <div className="title">{v.title}{v.company ? ` · ${v.company}` : ''}</div>
                <div className="meta">{fmtRange(v.startDate, v.endDate)}</div>
              </div>
              {v.location && <div className="sub">{v.location}</div>}
              {Array.isArray(v.highlights) && v.highlights.length > 0 && (
                <Highlights>
                  {v.highlights.slice(0, 3).map((h, i) => <li key={i}>{h}</li>)}
                </Highlights>
              )}
            </SubItem>
          ))}
        </SubList>
      ),
    });
  }

  if (cv.certifications?.length) {
    out.push({
      key: 'certifications',
      title: 'Certifications',
      subtitle: `${cv.certifications.length} earned`,
      render: () => (
        <SubList>
          {cv.certifications.map((c, i) => (
            <SubItem key={i}>
              <div className="head">
                <div className="title">{c.name || c.title}</div>
                <div className="meta">{safeFmt(c.date)}</div>
              </div>
              {(c.issuer || c.summary) && <div className="sub">{c.issuer || c.summary}</div>}
            </SubItem>
          ))}
        </SubList>
      ),
    });
  }

  if (cv.professionalDevelopment?.length) {
    out.push({
      key: 'pd',
      title: 'Professional Development',
      subtitle: `${cv.professionalDevelopment.length} courses`,
      render: () => (
        <SubList>
          {cv.professionalDevelopment.map((p, i) => (
            <SubItem key={i}>
              <div className="head">
                <div className="title">{p.name || p.title}</div>
                <div className="meta">{safeFmt(p.date)}</div>
              </div>
              {(p.summary || p.location) && (
                <div className="sub">{[p.summary, p.location].filter(Boolean).join(' · ')}</div>
              )}
            </SubItem>
          ))}
        </SubList>
      ),
    });
  }

  return out;
}

export function BioView({ cv, bioParagraphs }) {
  return (
    <BioBody>
      {cv.location && (
        <Loc>
          <div className="dot-wrap"><div className="dot" /></div>
          <div className="text">{cv.location}</div>
        </Loc>
      )}

      <BigName>{cv.name}</BigName>

      {bioParagraphs.length ? (
        <BioText>
          {bioParagraphs.map((p, i) => <p key={i}>{p}</p>)}
        </BioText>
      ) : (
        <BioText>
          <p>{cv.currentJobTitle || 'Designer and builder.'}</p>
        </BioText>
      )}

      <Divider />

      <Tagline>Doodle on the background while you read. Then say hi:</Tagline>

      <Newsletter
        onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.elements.email.value;
          if (cv.email && email) {
            window.location.href = `mailto:${cv.email}?subject=Hi%20${encodeURIComponent(cv.name)}&body=From%20${encodeURIComponent(email)}`;
          }
        }}
      >
        <input type="email" name="email" placeholder="Your email" required />
        <button type="submit">Say hi</button>
      </Newsletter>
    </BioBody>
  );
}
