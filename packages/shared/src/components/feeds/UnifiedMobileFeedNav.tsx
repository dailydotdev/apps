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
import { webappUrl } from '../../lib/constants';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import {
  DailyPageVariant,
  featureDailyPage,
} from '../../lib/featureManagement';
import { DailySwitcher } from '../../features/daily/DailySwitcher';
import { NewStripCta } from './NewStripCta';
import { findActiveChipId } from './exploreCategories';

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

interface UnifiedMobileFeedNavProps {
  dailyActive?: boolean;
}

function UnifiedMobileFeedNav({
  dailyActive,
}: UnifiedMobileFeedNavProps): ReactElement {
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  const { optOutAchievements, optOutLevelSystem, optOutQuestSystem } =
    useSettingsContext();
  const shouldHideGameCenter =
    optOutAchievements && optOutLevelSystem && optOutQuestSystem;
  const { feeds } = useFeeds();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const sortedFeeds = useSortedFeeds({ edges: feeds?.edges });
  const { logEvent } = useLogContext();
  const { value: dailyVariant } = useConditionalFeature({
    feature: featureDailyPage,
    shouldEvaluate: isLoggedIn,
  });
  const showDailySwitcher =
    isLoggedIn && !!dailyVariant && dailyVariant !== DailyPageVariant.None;

  const items: ChipItem[] = useMemo(() => {
    const list: ChipItem[] = [];

    const myFeedHref = isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl;
    if (!showDailySwitcher) {
      list.push({
        id: 'foryou',
        label: isLoggedIn ? 'For you' : 'Home',
        href: myFeedHref,
        // When a custom feed is the default, `/` shows that feed (not "For you"
        // content) — so restrict matching to `/my-feed`. Without a custom
        // default `/` is MyFeed, so include both.
        matchPaths: isCustomDefaultFeed
          ? [`${webappUrl}my-feed`]
          : [myFeedHref, webappUrl, `${webappUrl}my-feed`],
        group: 'forYou',
      });
    }

    sortedFeeds.forEach(({ node: feed }) => {
      const isDefault = isCustomDefaultFeed && feed.id === defaultFeedId;
      const slugPath = `${webappUrl}feeds/${feed.slug}`;
      const idPath = `${webappUrl}feeds/${feed.id}`;
      const matchPaths = [
        slugPath,
        idPath,
        `${slugPath}/edit`,
        `${idPath}/edit`,
        ...(isDefault ? [webappUrl] : []),
      ];
      list.push({
        id: `feed-${feed.id}`,
        label: feed.flags?.name || `Feed ${feed.id}`,
        href: isDefault ? webappUrl : idPath,
        matchPaths,
        group: 'categories',
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
        group: 'categories',
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
          // Modal trigger, not a route — never mark this chip active by path.
          matchPaths: [],
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
    defaultFeedId,
    shouldHideGameCenter,
    showDailySwitcher,
  ]);

  const activeId = useMemo(
    () => findActiveChipId(items, router.asPath, { preferId: 'foryou' }),
    [items, router.asPath],
  );

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
      className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto border-b border-border-subtlest-tertiary bg-background-default px-3 py-4"
    >
      <NewStripCta className="rounded-10 px-2.5 py-1.5" />
      {showDailySwitcher && (
        <DailySwitcher reverse compact dailyActive={dailyActive} />
      )}
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
