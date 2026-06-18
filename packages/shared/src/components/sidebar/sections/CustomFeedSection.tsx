import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { createSidebarAddItem, SIDEBAR_ADD_TOP_THRESHOLD } from '../common';
import { HashtagIcon, StarIcon } from '../../icons';
import { Section } from '../Section';
import { webappUrl } from '../../../lib/constants';
import { useFeeds } from '../../../hooks';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import type { SidebarSectionProps } from './common';
import useCustomDefaultFeed from '../../../hooks/feed/useCustomDefaultFeed';
import { isExtension } from '../../../lib/func';
import { useSortedFeeds } from '../../../hooks/feed/useSortedFeeds';
import { FeedOrigin } from '../../../graphql/feed';

export const CustomFeedSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { feeds } = useFeeds();
  const { defaultFeedId } = useCustomDefaultFeed();
  const sortedFeeds = useSortedFeeds({ edges: feeds?.edges });

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const customFeeds =
      sortedFeeds
        .filter((feed) => feed.node.flags?.origin !== FeedOrigin.TagChip)
        .map((feed) => {
          const isDefaultFeed = defaultFeedId === feed.node.id;

          if (isDefaultFeed) {
            const isCustomFeedPageActive = [
              `${webappUrl}feeds/${feed.node.id}`,
              '/',
            ].includes(defaultRenderSectionProps.activePage);

            return {
              title: feed.node.flags?.name || `Feed ${feed.node.id}`,
              // on extension we don't use router so no need for a path
              // onNavTabClick takes care of the navigation
              path: isExtension ? undefined : '/',
              action: isExtension
                ? () => onNavTabClick?.('default')
                : undefined,
              icon: feed.node.flags?.icon || (
                <HashtagIcon secondary={isCustomFeedPageActive} />
              ),
              rightIcon: () => (
                <StarIcon secondary className="text-surface-disabled" />
              ),
              active: isCustomFeedPageActive,
            };
          }

          const feedPath = `${webappUrl}feeds/${feed.node.id}`;

          return {
            title: feed.node.flags?.name || `Feed ${feed.node.id}`,
            path: feedPath,
            icon: feed.node.flags?.icon || (
              <HashtagIcon
                secondary={defaultRenderSectionProps.activePage === feedPath}
              />
            ),
          };
        }) ?? [];

    return customFeeds.filter(Boolean);
  }, [
    defaultRenderSectionProps.activePage,
    sortedFeeds,
    defaultFeedId,
    onNavTabClick,
  ]);

  // v2 rail panels (`compact`) get a Slack-style "New feed" row at the bottom;
  // the header "+" only stays once the list grows past a few entries.
  const { compact } = defaultRenderSectionProps;
  const addHref = `${webappUrl}feeds/new`;
  const showTopAdd = !compact || menuItems.length > SIDEBAR_ADD_TOP_THRESHOLD;
  const items = compact
    ? [...menuItems, createSidebarAddItem('New feed', { href: addHref })]
    : menuItems;

  return (
    <Section
      {...defaultRenderSectionProps}
      items={items}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.CustomFeedsExpanded}
      addHref={showTopAdd ? addHref : undefined}
    />
  );
};
