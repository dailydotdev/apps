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
import { PlusIcon } from '../icons';
import { IconSize } from '../Icon';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
import type { RowItem } from './ShellRow';
import { Segments, SheetChoice, ShellRow } from './ShellRow';

const highlightsUrl = `${webappUrl}highlights`;

const happeningNowKey = 'happening-now';

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
  const pathname = withoutLayoutVariantPrefix(router.pathname);
  const path = (router.asPath ?? router.pathname ?? '').split('?')[0];
  const forYouHref = isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl;
  const isHighlights = pathname.startsWith('/highlights');

  const items: RowItem[] = [];

  if (user) {
    items.push({
      key: 'for-you',
      label: 'For you',
      href: forYouHref,
      active: pathname === '/' || pathname === '/my-feed',
      replace: true,
    });
  }

  items.push({
    key: happeningNowKey,
    label: 'Happening now',
    href: highlightsUrl,
    active: isHighlights,
    replace: true,
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
        onClick: () =>
          logEvent({
            event_name: LogEvent.ClickFeedTagChip,
            target_id: feed.id,
            extra: JSON.stringify({ origin: feed.flags?.origin }),
          }),
      });
    });

    items.push({
      key: 'new-feed',
      label: <PlusIcon size={IconSize.XSmall} />,
      ariaLabel: 'New custom feed',
      href: `${webappUrl}feeds/new`,
      active: pathname === '/feeds/new',
    });
  }

  return (
    <>
      <ShellRow>
        <Segments
          items={items}
          menu={happeningNowKey}
          onMenu={() => setIsChannelsOpen(true)}
        />
      </ShellRow>
      <HappeningNowSheet
        isOpen={isChannelsOpen}
        onClose={() => setIsChannelsOpen(false)}
      />
    </>
  );
}
