import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useFeeds } from '../../hooks/feed/useFeeds';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useSortedFeeds } from '../../hooks/feed/useSortedFeeds';
import { highlightsPageQueryOptions } from '../../graphql/highlights';
import { webappUrl } from '../../lib/constants';
import { withoutLayoutVariantPrefix } from '../../lib/layoutVariant';
import { LogEvent } from '../../lib/log';
import { useActiveFeedNameContext } from '../../contexts';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useFeedName } from '../../hooks/feed/useFeedName';
import usePersistentContext from '../../hooks/usePersistentContext';
import type { AllFeedPages } from '../../lib/query';
import { FeedSettingsMenu } from '../feeds/FeedSettings/types';
import { FilterIcon, PlusIcon } from '../icons';
import { IconSize } from '../Icon';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
import Link from '../utilities/Link';
import {
  algorithmsList,
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
} from '../layout/common';
import type { RowItem } from './ShellRow';
import { Segments, SheetChoice, ShellRow } from './ShellRow';

const highlightsUrl = `${webappUrl}highlights`;

interface OpenFeed {
  title: string;
  editHref: string;
}

const FeedSheet = ({
  feed,
  onClose,
}: {
  feed: OpenFeed | null;
  onClose: () => void;
}): ReactElement => {
  const { feedName } = useActiveFeedNameContext();
  const { isSortableFeed } = useFeedName({
    feedName: feedName as AllFeedPages,
  });
  const { sortingEnabled } = useSettingsContext();
  const [selectedAlgo, setSelectedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );
  const canSort = sortingEnabled && isSortableFeed;

  return (
    <RootPortal>
      <Drawer
        isOpen={!!feed}
        onClose={onClose}
        title={feed?.title}
        className={{ drawer: 'py-1' }}
      >
        {canSort && (
          <>
            <h3 className="px-4 pb-1 pt-2 text-text-tertiary typo-footnote">
              Order
            </h3>
            <SheetChoice
              items={algorithmsList.map((label, index) => ({
                key: label,
                label,
                active: index === selectedAlgo,
                onClick: () => {
                  setSelectedAlgo(index);
                  onClose();
                },
              }))}
            />
          </>
        )}
        {feed && (
          <div
            className={
              canSort ? 'border-t border-border-subtlest-tertiary' : undefined
            }
          >
            <SheetChoice
              items={[
                {
                  key: 'settings',
                  label: (
                    <span className="flex items-center gap-3">
                      <span className="flex text-text-secondary">
                        <FilterIcon size={IconSize.Medium} />
                      </span>
                      Feed settings
                    </span>
                  ),
                  href: feed.editHref,
                  onClick: onClose,
                },
              ]}
            />
          </div>
        )}
      </Drawer>
    </RootPortal>
  );
};

const HappeningNowSheet = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}): ReactElement => {
  const router = useRouter();
  const { data } = useQuery({
    ...highlightsPageQueryOptions(),
    enabled: isOpen,
  });
  const channels = data?.channelConfigurations ?? [];
  const path = (router.asPath ?? router.pathname ?? '').split('?')[0];

  const items: RowItem[] = [
    {
      key: 'headlines',
      label: 'Headlines',
      href: highlightsUrl,
      active: path === '/highlights',
      replace: true,
      onClick: onClose,
    },
    {
      key: 'all',
      label: 'All',
      href: `${highlightsUrl}/all`,
      active: path === '/highlights/all',
      replace: true,
      onClick: onClose,
    },
    ...channels.map((channel) => ({
      key: channel.channel,
      label: channel.displayName,
      href: `${highlightsUrl}/${channel.channel}`,
      active: path === `/highlights/${channel.channel}`,
      replace: true,
      onClick: onClose,
    })),
  ];

  return (
    <RootPortal>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Happening now"
        className={{ drawer: 'py-1' }}
      >
        <SheetChoice items={items} />
      </Drawer>
    </RootPortal>
  );
};

export function HomeSegments(): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { feeds } = useFeeds();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const sortedFeeds = useSortedFeeds({ edges: feeds?.edges });
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [openFeed, setOpenFeed] = useState<OpenFeed | null>(null);
  const pathname = withoutLayoutVariantPrefix(router.pathname);
  const path = (router.asPath ?? router.pathname ?? '').split('?')[0];
  const forYouHref = isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl;
  const isHighlights = pathname.startsWith('/highlights');

  const items: RowItem[] = [];

  const feedMenu = (title: string, editHref: string): RowItem['menu'] => ({
    ariaLabel: `${title}, feed options`,
    onOpen: () => setOpenFeed({ title, editHref }),
  });

  if (user) {
    const isDefaultCustom = isCustomDefaultFeed && pathname === '/';
    items.push({
      key: 'for-you',
      label: 'For you',
      href: forYouHref,
      active: pathname === '/' || pathname === '/my-feed',
      replace: true,
      menu: feedMenu(
        'For you',
        isDefaultCustom
          ? `${webappUrl}feeds/${defaultFeedId}/edit`
          : `${webappUrl}feeds/${user.id}/edit?dview=${FeedSettingsMenu.Tags}`,
      ),
    });
  }

  items.push({
    key: 'happening-now',
    label: 'Happening now',
    href: highlightsUrl,
    active: isHighlights,
    replace: true,
    menu: {
      ariaLabel: 'Happening now, choose a channel',
      onOpen: () => setIsChannelsOpen(true),
    },
  });

  if (user) {
    items.push({
      key: 'following',
      label: 'Following',
      href: `${webappUrl}following`,
      active: pathname === '/following',
      replace: true,
    });

    sortedFeeds.forEach(({ node: feed }) => {
      const isDefault = isCustomDefaultFeed && feed.id === defaultFeedId;
      const href = isDefault ? webappUrl : `${webappUrl}feeds/${feed.id}`;
      items.push({
        key: `feed-${feed.id}`,
        label: feed.flags?.name || `Feed ${feed.id}`,
        href,
        active: isDefault
          ? pathname === '/'
          : path === `/feeds/${feed.id}` || path === `/feeds/${feed.id}/edit`,
        replace: true,
        menu: feedMenu(
          feed.flags?.name || `Feed ${feed.id}`,
          `${webappUrl}feeds/${feed.id}/edit`,
        ),
        onClick: () =>
          logEvent({
            event_name: LogEvent.ClickFeedTagChip,
            target_id: feed.id,
            extra: JSON.stringify({ origin: feed.flags?.origin }),
          }),
      });
    });
  }

  return (
    <>
      <div className="flex w-full items-center">
        <div className="min-w-0 flex-1 [mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)]">
          <ShellRow>
            <Segments items={items} />
          </ShellRow>
        </div>
        {user && (
          <div className="flex h-12 shrink-0 items-center border-b border-border-subtlest-tertiary px-2">
            <Link href={`${webappUrl}feeds/new`} passHref>
              <a
                aria-label="New custom feed"
                aria-current={pathname === '/feeds/new' ? 'page' : undefined}
                className="shell-press shell-hit relative flex size-[2.375rem] items-center justify-center rounded-14 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <PlusIcon size={IconSize.Small} />
              </a>
            </Link>
          </div>
        )}
      </div>
      <HappeningNowSheet
        isOpen={isChannelsOpen}
        onClose={() => setIsChannelsOpen(false)}
      />
      <FeedSheet feed={openFeed} onClose={() => setOpenFeed(null)} />
    </>
  );
}
