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
import { webappUrl } from '../../lib/constants';

interface ExploreHeaderProps {
  // The tag currently being viewed (topic page) or undefined on the lobby.
  activeTag?: string;
  // Related / recommended tag names to surface after the followed ones.
  recommendedTags?: string[];
  className?: string;
}

const exploreUrl = `${webappUrl}tags`;

// The Explore page header, built with the same tabbed page-header strip as the
// Squad directory (pageHeaderClassName + SquadDirectoryNavbar). An "Explore"
// tab returns to the lobby, followed by the user's tags and recommendations;
// the current topic is the active tab. Shared by the lobby and topic pages.
export function ExploreHeader({
  activeTag,
  recommendedTags = [],
  className,
}: ExploreHeaderProps): ReactElement {
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
    return Array.from(new Set([...ordered, ...rec]));
  }, [feedSettings?.includeTags, recommendedTags, activeTag]);

  return (
    <header
      className={classNames(pageHeaderClassName, 'gap-4 !py-0', className)}
    >
      <SquadDirectoryNavbar
        aria-label="Explore navigation"
        className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
      >
        <SquadDirectoryNavbarItem
          buttonSize={ButtonSize.Small}
          isActive={!activeTag}
          label="Explore"
          path={exploreUrl}
          ariaLabel="Explore topics"
        />
        {tags.map((tag) => (
          <SquadDirectoryNavbarItem
            key={tag}
            buttonSize={ButtonSize.Small}
            isActive={tag === activeTag}
            label={`#${tag}`}
            path={getTagPageLink(tag)}
            ariaLabel={`#${tag}`}
          />
        ))}
      </SquadDirectoryNavbar>
    </header>
  );
}
