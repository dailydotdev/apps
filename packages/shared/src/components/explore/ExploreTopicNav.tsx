import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { HashtagIcon } from '../icons';
import { IconSize } from '../Icon';
import useFeedSettings from '../../hooks/useFeedSettings';
import { getTagPageLink } from '../../lib/links';
import { webappUrl } from '../../lib/constants';
import { useChipBarNavigation } from './useChipBarNavigation';

interface ExploreTopicNavProps {
  // The tag currently being viewed (topic page) or undefined on the lobby.
  activeTag?: string;
  // Related / recommended tag names to surface after the followed ones.
  recommendedTags?: string[];
  className?: string;
}

// The discovery surface is branded "Explore" but canonically lives at /tags
// (the standalone /explore feed is a different page), so the lobby URL is /tags.
const exploreUrl = `${webappUrl}tags`;

// The shared top navigation for every Explore surface: an "Explore" entry that
// returns to the lobby, followed by the user's selected tags and then
// recommended tags — so the bar stays consistent across the lobby and each
// topic page (Medium's topic-bar pattern, in our design system).
export function ExploreTopicNav({
  activeTag,
  recommendedTags = [],
  className,
}: ExploreTopicNavProps): ReactElement {
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

  const isLobby = !activeTag;

  return (
    <div className={classNames('relative w-full', className)}>
      <nav aria-label="Explore navigation">
        <div
          ref={ref}
          onKeyDown={onKeyDown}
          role="toolbar"
          aria-orientation="horizontal"
          className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12"
        >
          <Link href={exploreUrl} legacyBehavior>
            <Button
              tag="a"
              href={exploreUrl}
              aria-current={isLobby ? 'page' : undefined}
              pressed={isLobby}
              size={ButtonSize.Small}
              variant={isLobby ? ButtonVariant.Float : ButtonVariant.Tertiary}
              icon={<HashtagIcon size={IconSize.Small} />}
            >
              Explore
            </Button>
          </Link>
          {tags.length > 0 && (
            <span
              role="separator"
              aria-hidden
              className="mx-1 h-5 w-px shrink-0 bg-border-subtlest-tertiary"
            />
          )}
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
