import React, { useMemo, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

const lightTheme = {
  background: '#ffffff',
  sidebar: '#f5f5f5',
  foreground: '#1c1c1c',
  muted: '#737373',
  accent: '#e2a727',
  border: '#e0e0e0',
  hover: '#e8e8e8',
  selected: '#e2a72730',
  selectedBorder: '#e2a727',
  search: '#ffffff',
  searchBorder: '#d0d0d0',
};

const darkTheme = {
  background: '#1c1c1c',
  sidebar: '#252525',
  foreground: '#fafafa',
  muted: '#999999',
  accent: '#e2a727',
  border: '#3a3a3a',
  hover: '#333333',
  selected: '#e2a72725',
  selectedBorder: '#e2a727',
  search: '#333333',
  searchBorder: '#444444',
};

export function AlanaGoyalTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [isDark, setIsDark] = useState(true);
  const [activeNote, setActiveNote] = useState('about');
  const [searchQuery, setSearchQuery] = useState('');

  const fullName = cv?.name || 'your name';
  const email = cv?.email || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  // Experience items
  const experienceItems = useMemo(() => {
    const items = [];
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));

    for (const exp of experiences) {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        for (const pos of exp.positions) {
          items.push({
            title: pos.title || pos.position,
            company: exp.company,
            summary: pos.summary || '',
            current: !pos.end_date || isPresent(pos.end_date),
          });
        }
      } else {
        items.push({
          title: exp.position,
          company: exp.company,
          summary: exp.summary || '',
          current: !exp.end_date || isPresent(exp.end_date),
        });
      }
    }
    return items;
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 10);
  }, [cv]);

  // Volunteer items
  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || []).filter(e => !isArchived(e)).slice(0, 8);
  }, [cv]);

  // Education items
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  // Skills items
  const skillItems = useMemo(() => {
    return cv?.sections?.skills || [];
  }, [cv]);

  // Awards items
  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e));
  }, [cv]);

  // Presentations items
  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e));
  }, [cv]);

  // Publications items
  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  // Professional Development items
  const professionalDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e));
  }, [cv]);

  // Phone
  const phone = cv?.phone || null;

  const theme = isDark ? darkTheme : lightTheme;

  // Current position
  const currentPosition = useMemo(() => {
    const current = experienceItems.find(e => e.current);
    if (current) {
      return `${current.title} at ${current.company}`;
    }
    return null;
  }, [experienceItems]);

  // Helper to generate fake dates for demo
  const getDateForCategory = (category) => {
    const now = new Date();
    switch (category) {
      case 'today':
        return now;
      case 'yesterday':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7':
        return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      case '30':
        return new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
    }
  };

  const formatNoteDate = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Build all notes with previews
  const allNotes = useMemo(() => {
    const notes = [];

    // About - pinned
    const aboutDate = getDateForCategory('today');
    notes.push({
      id: 'about',
      emoji: '📍',
      title: 'about me',
      preview: aboutText ? aboutText.substring(0, 60) : `Based in ${location || 'somewhere'}`,
      pinned: true,
      category: 'today',
      date: aboutDate,
      dateStr: formatNoteDate(aboutDate),
      fullDate: formatFullDate(aboutDate),
    });

    // Quick links - pinned
    const linksDate = getDateForCategory('today');
    notes.push({
      id: 'links',
      emoji: '📎',
      title: 'quick links',
      preview: 'email, twitter, github, linkedin',
      pinned: true,
      category: 'today',
      date: linksDate,
      dateStr: formatNoteDate(linksDate),
      fullDate: formatFullDate(linksDate),
    });

    // Experience
    if (experienceItems.length > 0) {
      const currentExp = experienceItems.find(e => e.current);
      const expDate = getDateForCategory('today');
      notes.push({
        id: 'experience',
        emoji: '💼',
        title: 'experience',
        preview: currentExp ? `${currentExp.title.toLowerCase()} at ${currentExp.company.toLowerCase()}` : 'Work history and positions',
        pinned: false,
        category: 'today',
        date: expDate,
        dateStr: formatNoteDate(expDate),
        fullDate: formatFullDate(expDate),
      });
    }

    // Projects
    if (projectItems.length > 0) {
      const projDate = getDateForCategory('yesterday');
      notes.push({
        id: 'projects',
        emoji: '🚀',
        title: 'projects',
        preview: projectItems.slice(0, 2).map(p => p.name.toLowerCase()).join(', '),
        pinned: false,
        category: 'yesterday',
        date: projDate,
        dateStr: formatNoteDate(projDate),
        fullDate: formatFullDate(projDate),
      });
    }

    // Volunteer
    if (volunteerItems.length > 0) {
      const volDate = getDateForCategory('7');
      notes.push({
        id: 'volunteer',
        emoji: '🤝',
        title: 'volunteer',
        preview: volunteerItems[0] ? `${(volunteerItems[0].position || volunteerItems[0].role || '').toLowerCase()} at ${(volunteerItems[0].organization || volunteerItems[0].company || '').toLowerCase()}` : 'Volunteer work',
        pinned: false,
        category: '7',
        date: volDate,
        dateStr: formatNoteDate(volDate),
        fullDate: formatFullDate(volDate),
      });
    }

    // Education
    if (educationItems.length > 0) {
      const eduDate = getDateForCategory('7');
      notes.push({
        id: 'education',
        emoji: '📚',
        title: 'education',
        preview: educationItems[0] ? `${educationItems[0].area?.toLowerCase()} at ${educationItems[0].institution?.toLowerCase()}` : 'Academic background',
        pinned: false,
        category: '7',
        date: eduDate,
        dateStr: formatNoteDate(eduDate),
        fullDate: formatFullDate(eduDate),
      });
    }

    // Skills
    if (skillItems.length > 0) {
      const skillDate = getDateForCategory('30');
      notes.push({
        id: 'skills',
        emoji: '⚡',
        title: 'skills',
        preview: skillItems.slice(0, 3).map(s => s.name?.toLowerCase()).join(', '),
        pinned: false,
        category: '30',
        date: skillDate,
        dateStr: formatNoteDate(skillDate),
        fullDate: formatFullDate(skillDate),
      });
    }

    // Awards
    if (awardItems.length > 0) {
      const awardDate = getDateForCategory('7');
      notes.push({
        id: 'awards',
        emoji: '🏆',
        title: 'awards',
        preview: awardItems.slice(0, 2).map(a => a.name?.toLowerCase()).join(', '),
        pinned: false,
        category: '7',
        date: awardDate,
        dateStr: formatNoteDate(awardDate),
        fullDate: formatFullDate(awardDate),
      });
    }

    // Presentations
    if (presentationItems.length > 0) {
      const presDate = getDateForCategory('30');
      notes.push({
        id: 'presentations',
        emoji: '🎤',
        title: 'presentations',
        preview: presentationItems.slice(0, 2).map(p => p.name?.toLowerCase()).join(', '),
        pinned: false,
        category: '30',
        date: presDate,
        dateStr: formatNoteDate(presDate),
        fullDate: formatFullDate(presDate),
      });
    }

    // Publications
    if (publicationItems.length > 0) {
      const pubDate = getDateForCategory('30');
      notes.push({
        id: 'publications',
        emoji: '📄',
        title: 'publications',
        preview: publicationItems.slice(0, 2).map(p => (p.title || p.name)?.toLowerCase()).join(', '),
        pinned: false,
        category: '30',
        date: pubDate,
        dateStr: formatNoteDate(pubDate),
        fullDate: formatFullDate(pubDate),
      });
    }

    // Professional Development
    if (professionalDevItems.length > 0) {
      const profDevDate = getDateForCategory('older');
      notes.push({
        id: 'professional-development',
        emoji: '📈',
        title: 'professional development',
        preview: professionalDevItems.slice(0, 2).map(p => p.name?.toLowerCase()).join(', '),
        pinned: false,
        category: 'older',
        date: profDevDate,
        dateStr: formatNoteDate(profDevDate),
        fullDate: formatFullDate(profDevDate),
      });
    }

    return notes;
  }, [aboutText, location, experienceItems, projectItems, volunteerItems, educationItems, skillItems, awardItems, presentationItems, publicationItems, professionalDevItems]);

  // Filter notes by search
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return allNotes;
    const query = searchQuery.toLowerCase();
    return allNotes.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.preview.toLowerCase().includes(query)
    );
  }, [allNotes, searchQuery]);

  // Separate pinned and unpinned
  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  // Group unpinned by category
  const groupedNotes = useMemo(() => {
    const groups = {};
    for (const note of unpinnedNotes) {
      if (!groups[note.category]) {
        groups[note.category] = [];
      }
      groups[note.category].push(note);
    }
    return groups;
  }, [unpinnedNotes]);

  const categoryLabels = {
    'today': 'Today',
    'yesterday': 'Yesterday',
    '7': 'Previous 7 Days',
    '30': 'Previous 30 Days',
    'older': 'Older',
  };

  const renderContent = () => {
    switch (activeNote) {
      case 'about':
        return (
          <NoteContent>
            {aboutText && <Paragraph>{aboutText}</Paragraph>}
            {location && <Paragraph>based in {location.toLowerCase()}.</Paragraph>}
            {currentPosition && <Paragraph>currently {currentPosition.toLowerCase()}.</Paragraph>}
          </NoteContent>
        );

      case 'experience':
        return (
          <NoteContent>
            <ContentSection>
              <SectionTitle>currently</SectionTitle>
              <List>
                {experienceItems.filter(e => e.current).map((exp, idx) => (
                  <li key={`current-${idx}`}>
                    {exp.title.toLowerCase()} at <Accent href="#">{exp.company.toLowerCase()}</Accent>
                    {exp.summary && <Muted> - {exp.summary}</Muted>}
                  </li>
                ))}
              </List>
            </ContentSection>
            {experienceItems.filter(e => !e.current).length > 0 && (
              <ContentSection>
                <SectionTitle>previously</SectionTitle>
                <List>
                  {experienceItems.filter(e => !e.current).map((exp, idx) => (
                    <li key={`prev-${idx}`}>
                      {exp.title.toLowerCase()} at <Accent href="#">{exp.company.toLowerCase()}</Accent>
                      {exp.summary && <Muted> - {exp.summary}</Muted>}
                    </li>
                  ))}
                </List>
              </ContentSection>
            )}
          </NoteContent>
        );

      case 'projects':
        return (
          <NoteContent>
            <List>
              {projectItems.map((project, idx) => (
                <li key={`proj-${idx}`}>
                  {project.url ? (
                    <Accent href={project.url} target="_blank" rel="noopener">
                      {project.name.toLowerCase()}
                    </Accent>
                  ) : (
                    <span>{project.name.toLowerCase()}</span>
                  )}
                  {project.summary && <Muted> - {project.summary}</Muted>}
                </li>
              ))}
            </List>
          </NoteContent>
        );

      case 'volunteer':
        return (
          <NoteContent>
            <List>
              {volunteerItems.map((vol, idx) => (
                <li key={`vol-${idx}`}>
                  {(vol.position || vol.role || '').toLowerCase()} at{' '}
                  <Accent href="#">{(vol.organization || vol.company || '').toLowerCase()}</Accent>
                  {vol.summary && <Muted> - {vol.summary}</Muted>}
                </li>
              ))}
            </List>
          </NoteContent>
        );

      case 'education':
        return (
          <NoteContent>
            <List>
              {educationItems.map((edu, idx) => (
                <li key={`edu-${idx}`}>
                  studied {edu.area?.toLowerCase()} at{' '}
                  <Accent href="#">{edu.institution?.toLowerCase()}</Accent>
                  {edu.degree && <Muted> ({edu.degree})</Muted>}
                </li>
              ))}
            </List>
          </NoteContent>
        );

      case 'skills':
        return (
          <NoteContent>
            <List>
              {skillItems.map((skill, idx) => (
                <li key={`skill-${idx}`}>{skill.name?.toLowerCase()}</li>
              ))}
            </List>
          </NoteContent>
        );

      case 'links':
        return (
          <NoteContent>
            <List>
              {email && (
                <li>
                  <Accent href={`mailto:${email}`}>email</Accent>
                  <Muted> - inbox zero, i respond to every email</Muted>
                </li>
              )}
              {phone && (
                <li>
                  <Accent href={`tel:${phone}`}>phone</Accent>
                  <Muted> - {phone}</Muted>
                </li>
              )}
              {twitterUrl && (
                <li>
                  <Accent href={twitterUrl} target="_blank" rel="noopener">twitter</Accent>
                  <Muted> - sporadic thoughts, responsive to dms</Muted>
                </li>
              )}
              {githubUrl && (
                <li>
                  <Accent href={githubUrl} target="_blank" rel="noopener">github</Accent>
                  <Muted> - open source projects</Muted>
                </li>
              )}
              {linkedinUrl && (
                <li>
                  <Accent href={linkedinUrl} target="_blank" rel="noopener">linkedin</Accent>
                  <Muted> - professional profile</Muted>
                </li>
              )}
            </List>
          </NoteContent>
        );

      case 'awards':
        return (
          <NoteContent>
            <List>
              {awardItems.map((award, idx) => (
                <li key={`award-${idx}`}>
                  <span>{award.name?.toLowerCase()}</span>
                  {award.date && <Muted> ({award.date})</Muted>}
                  {award.summary && <Muted> - {award.summary}</Muted>}
                </li>
              ))}
            </List>
          </NoteContent>
        );

      case 'presentations':
        return (
          <NoteContent>
            <List>
              {presentationItems.map((pres, idx) => (
                <li key={`pres-${idx}`}>
                  <span>{pres.name?.toLowerCase()}</span>
                  {pres.location && <Muted> @ {pres.location}</Muted>}
                  {pres.date && <Muted> ({pres.date})</Muted>}
                  {pres.summary && <Muted> - {pres.summary}</Muted>}
                </li>
              ))}
            </List>
          </NoteContent>
        );

      case 'publications':
        return (
          <NoteContent>
            <List>
              {publicationItems.map((pub, idx) => (
                <li key={`pub-${idx}`}>
                  {pub.doi ? (
                    <Accent href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener">
                      {(pub.title || pub.name)?.toLowerCase()}
                    </Accent>
                  ) : (
                    <span>{(pub.title || pub.name)?.toLowerCase()}</span>
                  )}
                  {pub.journal && <Muted> - {pub.journal}</Muted>}
                  {pub.date && <Muted> ({pub.date})</Muted>}
                </li>
              ))}
            </List>
          </NoteContent>
        );

      case 'professional-development':
        return (
          <NoteContent>
            <List>
              {professionalDevItems.map((item, idx) => (
                <li key={`profdev-${idx}`}>
                  <span>{item.name?.toLowerCase()}</span>
                  {item.summary && <Muted> - {item.summary}</Muted>}
                  {item.location && <Muted> @ {item.location}</Muted>}
                  {item.date && <Muted> ({item.date})</Muted>}
                </li>
              ))}
            </List>
          </NoteContent>
        );

      default:
        return null;
    }
  };

  const activeNoteData = allNotes.find(n => n.id === activeNote);

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Sidebar>
          <WindowControls>
            <TrafficLight $color="#FF5F57" />
            <TrafficLight $color="#FEBC2E" />
            <TrafficLight $color="#28C840" />
          </WindowControls>

          <SidebarHeader>
            <SidebarTitle>{fullName.toLowerCase()}</SidebarTitle>
            <ThemeToggle onClick={() => setIsDark(!isDark)} title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </ThemeToggle>
          </SidebarHeader>

          <SearchWrapper>
            <SearchIcon>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrapper>

          <NotesListWrapper>
            {pinnedNotes.length > 0 && (
              <NotesGroup>
                <GroupHeader>
                  <PinIcon>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/>
                    </svg>
                  </PinIcon>
                  <GroupTitle>Pinned</GroupTitle>
                </GroupHeader>
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    $active={activeNote === note.id}
                    onClick={() => setActiveNote(note.id)}
                  >
                    <NoteCardHeader>
                      <NoteCardTitleRow>
                        <NoteCardEmoji>{note.emoji}</NoteCardEmoji>
                        <NoteCardTitle>{note.title}</NoteCardTitle>
                      </NoteCardTitleRow>
                    </NoteCardHeader>
                    <NoteCardPreviewRow>
                      <NoteCardDate>{note.dateStr}</NoteCardDate>
                      <NoteCardPreview>{note.preview}</NoteCardPreview>
                    </NoteCardPreviewRow>
                  </NoteCard>
                ))}
              </NotesGroup>
            )}

            {Object.entries(groupedNotes).map(([category, notes]) => (
              <NotesGroup key={category}>
                <GroupHeader>
                  <GroupTitle>{categoryLabels[category] || category}</GroupTitle>
                </GroupHeader>
                {notes.map(note => (
                  <NoteCard
                    key={note.id}
                    $active={activeNote === note.id}
                    onClick={() => setActiveNote(note.id)}
                  >
                    <NoteCardHeader>
                      <NoteCardTitleRow>
                        <NoteCardEmoji>{note.emoji}</NoteCardEmoji>
                        <NoteCardTitle>{note.title}</NoteCardTitle>
                      </NoteCardTitleRow>
                    </NoteCardHeader>
                    <NoteCardPreviewRow>
                      <NoteCardDate>{note.dateStr}</NoteCardDate>
                      <NoteCardPreview>{note.preview}</NoteCardPreview>
                    </NoteCardPreviewRow>
                  </NoteCard>
                ))}
              </NotesGroup>
            ))}
          </NotesListWrapper>
        </Sidebar>

        <Main>
          <MainDateTime>{activeNoteData?.fullDate}</MainDateTime>
          <MainHeader>
            <MainHeaderEmoji>{activeNoteData?.emoji}</MainHeaderEmoji>
            <MainHeaderTitle>{activeNoteData?.title}</MainHeaderTitle>
          </MainHeader>
          {renderContent()}
        </Main>
      </Container>
    </ThemeProvider>
  );
}

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.foreground};
  font-family: -apple-system, SF Pro, SF Pro Display, SF Pro Text, ui-sans-serif, system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 320px;
  min-width: 320px;
  height: 100%;
  background-color: ${props => props.theme.sidebar};
  border-right: 1px solid ${props => props.theme.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 280px;
    min-width: 280px;
  }
`;

const WindowControls = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
`;

const TrafficLight = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.$color};
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 12px;
`;

const SidebarTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const ThemeToggle = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.muted};
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    color: ${props => props.theme.foreground};
    background-color: ${props => props.theme.hover};
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  margin: 0 12px 12px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.muted};
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid ${props => props.theme.searchBorder};
  border-radius: 8px;
  background-color: ${props => props.theme.search};
  color: ${props => props.theme.foreground};
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${props => props.theme.muted};
  }

  &:focus {
    border-color: ${props => props.theme.accent};
  }
`;

const NotesListWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 16px;
`;

const NotesGroup = styled.div`
  margin-bottom: 16px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 8px 4px;
`;

const PinIcon = styled.span`
  color: ${props => props.theme.muted};
  display: flex;
  align-items: center;
`;

const GroupTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NoteCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 10px 12px;
  background-color: ${props => props.$active ? props.theme.selected : 'transparent'};
  border: 1px solid ${props => props.$active ? props.theme.selectedBorder : 'transparent'};
  border-radius: 8px;
  text-align: left;
  color: ${props => props.theme.foreground};
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 4px;

  &:hover {
    background-color: ${props => props.$active ? props.theme.selected : props.theme.hover};
  }
`;

const NoteCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const NoteCardTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const NoteCardEmoji = styled.span`
  font-size: 16px;
  flex-shrink: 0;
`;

const NoteCardTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoteCardPreviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const NoteCardDate = styled.span`
  font-size: 12px;
  color: ${props => props.theme.muted};
  flex-shrink: 0;
`;

const NoteCardPreview = styled.span`
  font-size: 12px;
  color: ${props => props.theme.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const Main = styled.main`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: 24px 48px;

  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

const MainDateTime = styled.div`
  font-size: 13px;
  color: ${props => props.theme.muted};
  text-align: center;
  margin-bottom: 16px;
`;

const MainHeader = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 24px;
  font-size: 1.75rem;
  font-weight: 700;
`;

const MainHeaderEmoji = styled.span`
  font-size: 1.75rem;
  line-height: 1;
`;

const MainHeaderTitle = styled.span``;

const NoteContent = styled.div`
  max-width: 720px;
`;

const ContentSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.muted};
  margin: 0 0 12px;
  text-transform: lowercase;
`;

const Paragraph = styled.p`
  margin: 0 0 16px;
  line-height: 1.7;
`;

const List = styled.ul`
  list-style: disc;
  padding-left: 20px;
  margin: 0;

  li {
    margin-bottom: 8px;
    line-height: 1.6;
  }
`;

const Accent = styled.a`
  color: ${props => props.theme.accent};
  text-decoration: underline;
  text-decoration-color: ${props => props.theme.accent}40;
  transition: text-decoration-color 0.15s ease;

  &:hover {
    text-decoration-color: ${props => props.theme.accent};
  }
`;

const Muted = styled.span`
  color: ${props => props.theme.muted};
`;
