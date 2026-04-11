import React from 'react';
import { FolderCard } from './FolderCard';
import { FileTabStack, FileTab } from './FileTab';

export function SocialSection({ socials }) {
  if (!socials || socials.length === 0) return null;
  const items = socials.slice(0, 3);

  return (
    <FolderCard tone="sage" label="Social Media">
      <FileTabStack>
        {items.map((s, i) => (
          <FileTab
            key={s.label}
            index={i}
            total={items.length}
            label={s.label}
            sub={items.length - 1 === i ? s.url?.replace(/^https?:\/\//, '') : null}
          />
        ))}
      </FileTabStack>
    </FolderCard>
  );
}
