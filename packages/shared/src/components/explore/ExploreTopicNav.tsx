import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import useFeedSettings from '../../hooks/useFeedSettings';
import { getTagPageLink } from '../../lib/links';
import { useChipBarNavigation } from './useChipBarNavigation';

interface ExploreTopicNavProps {
  // The tag currently being viewed.
  activeTag?: string;
  // Related / recommended tag names to surface after the followed ones.
  recommendedTags?: string[];
  className?: string;
}

// Secondary topic bar shown under the Explore hub header on a topic page: the
// user's followed tags plus related tags, with the current tag pinned active.
// (Returning to the lobby is handled by the hub header's "Topics" tab.)
export function ExploreTopicNav({
  activeTag,
  recommendedTags = [],
  className,
}: ExploreTopicNavProps): ReactElement | null {
  const { feedSettings } = useFeedSettings();
  const { ref, onKeyDown } = useChipBarNavigation();

  const tags = useMemo(() => {
    const followed = feedSettings?.includeTags ?? [];
    const followedSet = new Set(followed);
    // Pin the active tag first when it isn't already followed.
    const ordered =
      activeTag && !followedSet.has(activeTag)
        ? [activeTag, ...followed]
        : followed;
    const rec = recommendedTags.filter(
      (tag) => tag && !followedSet.has(tag) && tag !== activeTag,
    );
    return Array.from(new Set([...ordered, ...rec]));
  }, [feedSettings?.includeTags, recommendedTags, activeTag]);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={classNames('relative w-full', className)}>
      <nav aria-label="Related topics">
        <div
          ref={ref}
          onKeyDown={onKeyDown}
          role="toolbar"
          aria-orientation="horizontal"
          className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12"
        >
          {tags.map((tag) => {
            const isActive = tag === activeTag;
            const href = getTagPageLink(tag);
            return (
              <Link key={tag} href={href} legacyBehavior>
                <Button
                  tag="a"
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  pressed={isActive}
                  size={ButtonSize.Small}
                  variant={
                    isActive ? ButtonVariant.Float : ButtonVariant.Tertiary
                  }
                >
                  #{tag}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
      />
    </div>
  );
}
