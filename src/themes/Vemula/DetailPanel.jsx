import React from 'react';
import {
  DetailOverlay,
  DetailInner,
  DetailHeader,
  DetailLabel,
  DetailTitle,
  DetailItem,
  ItemTitle,
  ItemSubtitle,
  ItemMeta,
  ItemBody,
  ItemHighlights,
  Tags,
  Tag,
  LinkRow,
  BackButton,
} from './styles';

function DetailContent({ section }) {
  return (
    <>
      {section.items.map((item, idx) => {
        if (item.links) {
          return (
            <DetailItem key={idx}>
              {item.links.map((link, j) =>
                link.url ? (
                  <LinkRow
                    key={j}
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    <span className="label">{link.label}</span>
                    <span className="value">{link.value}</span>
                  </LinkRow>
                ) : (
                  <LinkRow as="div" key={j}>
                    <span className="label">{link.label}</span>
                    <span className="value">{link.value}</span>
                  </LinkRow>
                )
              )}
            </DetailItem>
          );
        }
        if (item.tags) {
          return (
            <DetailItem key={idx}>
              <Tags>
                {item.tags.map((tag, j) => (
                  <Tag key={j}>{tag}</Tag>
                ))}
              </Tags>
            </DetailItem>
          );
        }
        return (
          <DetailItem key={idx}>
            {item.title && <ItemTitle>{item.title}</ItemTitle>}
            {item.subtitle && <ItemSubtitle>{item.subtitle}</ItemSubtitle>}
            {(item.dates || item.location) && (
              <ItemMeta>
                {[item.dates, item.location].filter(Boolean).join(' · ')}
              </ItemMeta>
            )}
            {item.body && <ItemBody>{item.body}</ItemBody>}
            {item.highlights && item.highlights.length > 0 && (
              <ItemHighlights>
                {item.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ItemHighlights>
            )}
          </DetailItem>
        );
      })}
    </>
  );
}

export function DetailPanel({ section, onClose }) {
  if (!section) return null;
  return (
    <DetailOverlay
      role="dialog"
      aria-modal="true"
      aria-label={section.title}
      style={{
        '--detail-bg': section.palette.from,
        '--detail-fg': section.palette.label,
      }}
    >
      <DetailInner>
        <DetailHeader>
          <div>
            <DetailLabel>{section.label}</DetailLabel>
            <DetailTitle>{section.title}</DetailTitle>
          </div>
          <BackButton type="button" onClick={onClose}>
            ← Back
          </BackButton>
        </DetailHeader>
        <DetailContent section={section} />
      </DetailInner>
    </DetailOverlay>
  );
}
