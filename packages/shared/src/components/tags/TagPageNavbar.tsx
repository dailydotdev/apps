import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { ButtonSize } from '../buttons/Button';
import { pageHeaderClassName } from '../layout/PageHeader';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../squads/layout/SquadDirectoryNavbar';
import { getTagPageLink } from '../../lib/links';
import { webappUrl } from '../../lib/constants';
import { tagTitlesQueryOptions } from '../../graphql/keywords';

interface TagPageNavbarProps {
  // The tag currently being viewed; rendered as the active tab.
  activeTag?: string;
  // Tags related to the active one, surfaced as relevant per-page links.
  recommendedTags?: string[];
  className?: string;
}

const tagsUrl = `${webappUrl}tags`;
// Keep the strip short — show a handful of relevant tabs rather than a long
// horizontally-scrolling list.
const MAX_TAGS = 5;

// Tabbed strip above the tag page, built with the same page-header navbar as the
// Squad directory. A leading tab returns to the tags directory, then the current
// tag (active) followed by tags recommended for it — keeping the strip relevant
// to the page being viewed (and its links crawlable for SEO).
export function TagPageNavbar({
  activeTag,
  recommendedTags = [],
  className,
}: TagPageNavbarProps): ReactElement {
  const { data: tagTitles = {} } = useQuery(tagTitlesQueryOptions());
  const tags = useMemo(() => {
    const rec = recommendedTags.filter((tag) => tag && tag !== activeTag);
    const ordered = activeTag ? [activeTag, ...rec] : rec;
    return Array.from(new Set(ordered)).slice(0, MAX_TAGS);
  }, [recommendedTags, activeTag]);

  return (
    <header
      className={classNames(pageHeaderClassName, 'gap-4 !py-0', className)}
    >
      <SquadDirectoryNavbar
        aria-label="Tags navigation"
        className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
      >
        <SquadDirectoryNavbarItem
          buttonSize={ButtonSize.Small}
          isActive={!activeTag}
          label="All tags"
          path={tagsUrl}
          ariaLabel="All tags"
        />
        {tags.map((tag) => (
          <SquadDirectoryNavbarItem
            key={tag}
            buttonSize={ButtonSize.Small}
            isActive={tag === activeTag}
            label={tagTitles[tag] || tag}
            path={getTagPageLink(tag)}
            ariaLabel={tagTitles[tag] || tag}
          />
        ))}
      </SquadDirectoryNavbar>
    </header>
  );
}
