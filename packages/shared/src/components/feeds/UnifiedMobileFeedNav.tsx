import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { PlusIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useFeeds } from '../../hooks';
import { useSortedFeeds } from '../../hooks/feed/useSortedFeeds';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useFeedTagsList } from '../../hooks/useFeedTagsList';
import { webappUrl } from '../../lib/constants';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { buildPersonalizedCategories } from './exploreCategories';

type ChipGroup = 'forYou' | 'categories' | 'rest';

interface ChipItem {
  id: string;
  label: ReactNode;
  href: string;
  matchPaths?: string[];
  group: ChipGroup;
  isIconOnly?: boolean;
  tag?: string;
}

const GROUP_ORDER: ChipGroup[] = ['forYou', 'categories', 'rest'];

const chipBaseClass =
  'shrink-0 rounded-10 border px-2.5 py-1.5 font-bold transition-colors typo-callout';
const chipActiveClass =
  'border-border-subtlest-tertiary bg-surface-float text-text-primary hover:bg-surface-hover';
const chipInactiveClass =
  'border-transparent text-text-tertiary hover:text-text-primary';

function UnifiedMobileFeedNav(): ReactElement {
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  const { optOutAchievements, optOutLevelSystem, optOutQuestSystem } =
    useSettingsContext();
  const shouldHideGameCenter =
    optOutAchievements && optOutLevelSystem && optOutQuestSystem;
  const { feeds } = useFeeds();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const sortedFeeds = useSortedFeeds({ edges: feeds?.edges });
  const { tags: personalizedTags } = useFeedTagsList();
  const { logEvent } = useLogContext();

  const items: ChipItem[] = useMemo(() => {
    const list: ChipItem[] = [];

    const myFeedHref = isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl;
    list.push({
      id: 'foryou',
      label: isLoggedIn ? 'For you' : 'Home',
      href: myFeedHref,
      // Always match the homepage so "For you" stays highlighted even when the
      // default custom feed (also at `/`) would otherwise win.
      matchPaths: [myFeedHref, webappUrl, `${webappUrl}my-feed`],
      group: 'forYou',
    });

    if (isLoggedIn) {
      buildPersonalizedCategories(personalizedTags).forEach((category) => {
        list.push({
          id: `category-${category.id}`,
          label: category.label,
          href: category.path,
          group: 'categories',
          tag: category.tag,
        });
      });
    }

    sortedFeeds.forEach(({ node: feed }) => {
      const isEditingFeed =
        router.query.slugOrId === feed.id && router.pathname.endsWith('/edit');
      let feedPath = `${webappUrl}feeds/${feed.id}`;
      if (!isEditingFeed && isCustomDefaultFeed && feed.id === defaultFeedId) {
        feedPath = `${webappUrl}`;
      }
      const href = `${feedPath}${isEditingFeed ? '/edit' : ''}`;
      list.push({
        id: `feed-${feed.id}`,
        label: feed.flags?.name || `Feed ${feed.id}`,
        href,
        group: 'rest',
      });
    });
    if (isLoggedIn) {
      list.push({
        id: 'newfeed',
        label: (
          <span className="flex size-5 items-center justify-center">
            <PlusIcon />
          </span>
        ),
        href: `${webappUrl}feeds/new`,
        group: 'rest',
        isIconOnly: true,
      });
    }

    if (isLoggedIn) {
      list.push({
        id: 'bookmarks',
        label: 'Bookmarks',
        href: `${webappUrl}bookmarks`,
        group: 'rest',
      });
      list.push({
        id: 'history',
        label: 'History',
        href: `${webappUrl}history`,
        group: 'rest',
      });
      list.push({
        id: 'following',
        label: 'Following',
        href: `${webappUrl}following`,
        group: 'rest',
      });
    }

    list.push(
      {
        id: 'popular',
        label: 'Popular',
        href: `${webappUrl}posts`,
        group: 'rest',
      },
      {
        id: 'discussed',
        label: 'Discussions',
        href: `${webappUrl}discussed`,
        group: 'rest',
      },
      {
        id: 'tags',
        label: 'Tags',
        href: `${webappUrl}tags`,
        group: 'rest',
      },
      {
        id: 'sources',
        label: 'Sources',
        href: `${webappUrl}sources`,
        group: 'rest',
      },
      {
        id: 'leaderboard',
        label: 'Leaderboard',
        href: `${webappUrl}users`,
        group: 'rest',
      },
      {
        id: 'squads',
        label: 'Squads',
        href: `${webappUrl}squads`,
        group: 'rest',
      },
    );

    if (isLoggedIn) {
      list.push(
        {
          id: 'happeningnow',
          label: 'Happening Now',
          href: `${webappUrl}highlights`,
          group: 'rest',
        },
        {
          id: 'hottakes',
          label: 'Hot Takes',
          href: `${webappUrl}?openModal=hottakes`,
          group: 'rest',
        },
      );
      if (!shouldHideGameCenter) {
        list.push({
          id: 'gamecenter',
          label: 'Game Center',
          href: `${webappUrl}game-center`,
          group: 'rest',
        });
      }
    }

    return list;
  }, [
    isLoggedIn,
    isCustomDefaultFeed,
    sortedFeeds,
    router.query.slugOrId,
    router.pathname,
    defaultFeedId,
    personalizedTags,
    shouldHideGameCenter,
  ]);

  const activeId = useMemo(() => {
    const normalize = (p: string): string => {
      const noQuery = p?.split('?')?.[0];
      if (!noQuery || noQuery === '/') {
        return '/';
      }
      return noQuery.replace(/\/$/, '');
    };
    const path = normalize(router.asPath);
    const matches = items.filter((item) => {
      const candidates = item.matchPaths ?? [item.href];
      return candidates.some((candidate) => normalize(candidate) === path);
    });
    if (!matches.length) {
      return null;
    }
    // Prefer the For You match when multiple chips share the same path
    // (e.g. user's default custom feed also lives at `/`).
    const forYouMatch = matches.find((item) => item.id === 'foryou');
    return forYouMatch ? forYouMatch.id : matches[matches.length - 1].id;
  }, [items, router.asPath]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = scrollRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    if (typeof active?.scrollIntoView !== 'function') {
      return;
    }
    active.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [activeId, items]);

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto border-b border-border-subtlest-tertiary px-3 py-4"
    >
      {GROUP_ORDER.map((group) => {
        const groupItems = items.filter((item) => item.group === group);
        if (!groupItems.length) {
          return null;
        }
        // Only the boundary into the catch-all `rest` group gets a divider;
        // the For You + categories blocks read as one continuous strip.
        const showDivider = group === 'rest';
        return (
          <React.Fragment key={group}>
            {showDivider && (
              <div
                aria-hidden
                className="mx-1 h-4 w-px shrink-0 bg-border-subtlest-tertiary"
              />
            )}
            {groupItems.map((item) => {
              const isActive = item.id === activeId;
              return (
                <Link key={item.id} href={item.href}>
                  <a
                    href={item.href}
                    onClick={() => {
                      if (!item.tag) {
                        return;
                      }

                      logEvent({
                        event_name: LogEvent.ClickFeedTagChip,
                        target_id: item.tag,
                      });
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    data-active={isActive ? 'true' : undefined}
                    className={classNames(
                      chipBaseClass,
                      isActive ? chipActiveClass : chipInactiveClass,
                      item.isIconOnly && 'px-2',
                    )}
                  >
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default UnifiedMobileFeedNav;
