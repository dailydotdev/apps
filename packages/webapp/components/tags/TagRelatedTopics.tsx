import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getTagPageLink } from '@dailydotdev/shared/src/lib/links';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TagModule } from './TagModule';

interface TagRelatedTopicsProps {
  relatedTags: { name?: string }[];
}

/**
 * Related topics as a compact, uniform chip cloud inside a hub module — a
 * scannable, dense discovery surface (replacing the oversized constellation).
 */
export function TagRelatedTopics({
  relatedTags,
}: TagRelatedTopicsProps): ReactElement | null {
  const names = relatedTags
    .map((related) => related.name)
    .filter((name): name is string => !!name)
    .slice(0, 16);

  if (names.length === 0) {
    return null;
  }

  return (
    <TagModule
      title="Related topics"
      icon={<HashtagIcon size={IconSize.Small} secondary />}
    >
      <ul className="flex flex-wrap gap-2">
        {names.map((name) => (
          <li key={name}>
            <Link href={getTagPageLink(name)} passHref prefetch={false}>
              <a className="flex h-8 items-center rounded-10 bg-background-default px-3 text-text-secondary transition-colors typo-footnote hover:text-text-primary">
                #{name}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </TagModule>
  );
}
