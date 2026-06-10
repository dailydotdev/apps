import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '../buttons/Button';
import { pageHeaderClassName } from '../layout/PageHeader';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../squads/layout/SquadDirectoryNavbar';
import useFeedSettings from '../../hooks/useFeedSettings';
import { getTagPageLink } from '../../lib/links';
import { formatKeyword } from '../../lib/strings';
import { webappUrl } from '../../lib/constants';

interface TagPageNavbarProps {
  // The tag currently being viewed; rendered as the active tab.
  activeTag?: string;
  // Related / recommended tag names surfaced after the followed ones.
  recommendedTags?: string[];
  className?: string;
}

const tagsUrl = `${webappUrl}tags`;
// Keep the strip short — show a handful of relevant tabs rather than a long
// horizontally-scrolling list.
const MAX_TAGS = 5;

// Tabbed strip above the tag page, built with the same page-header navbar as the
// Squad directory. A leading tab returns to the tags directory, followed by the
// user's followed tags and recommendations, with the current tag active.
export function TagPageNavbar({
  activeTag,
  recommendedTags = [],
  className,
}: TagPageNavbarProps): ReactElement {
  const { feedSettings } = useFeedSettings();

  const tags = useMemo(() => {
    const followed = feedSettings?.includeTags ?? [];
    const followedSet = new Set(followed);
    const ordered =
      activeTag && !followedSet.has(activeTag)
        ? [activeTag, ...followed]
        : followed;
    const rec = recommendedTags.filter(
      (tag) => tag && !followedSet.has(tag) && tag !== activeTag,
    );
    return Array.from(new Set([...ordered, ...rec])).slice(0, MAX_TAGS);
  }, [feedSettings?.includeTags, recommendedTags, activeTag]);

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
          label="Explore"
          path={tagsUrl}
          ariaLabel="Explore tags"
        />
        {tags.map((tag) => (
          <SquadDirectoryNavbarItem
            key={tag}
            buttonSize={ButtonSize.Small}
            isActive={tag === activeTag}
            label={formatKeyword(tag)}
            path={getTagPageLink(tag)}
            ariaLabel={formatKeyword(tag)}
          />
        ))}
      </SquadDirectoryNavbar>
    </header>
  );
}
