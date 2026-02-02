import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import type { SidebarMenuItem } from '../common';
import { HashtagIcon, StarIcon } from '../../icons';
import { Section } from '../Section';
import { webappUrl } from '../../../lib/constants';
import { useFeeds } from '../../../hooks';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import type { SidebarSectionProps } from './common';
import useCustomDefaultFeed from '../../../hooks/feed/useCustomDefaultFeed';
import { isExtension } from '../../../lib/func';
import { useSortedFeeds } from '../../../hooks/feed/useSortedFeeds';

export const CustomFeedSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const router = useRouter();
  const { feeds } = useFeeds();
  const { defaultFeedId } = useCustomDefaultFeed();
  const sortedFeeds = useSortedFeeds({ edges: feeds?.edges });

  const handleAddFeed = useCallback(() => {
    router.push(`${webappUrl}feeds/new`);
  }, [router]);

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const customFeeds =
      sortedFeeds.map((feed) => {
        const isDefaultFeed = defaultFeedId === feed.node.id;

        if (isDefaultFeed) {
          const isCustomFeedPageActive = [
            `${webappUrl}feeds/${feed.node.id}`,
            '/',
          ].includes(defaultRenderSectionProps.activePage);

          return {
            title: feed.node.flags.name || `Feed ${feed.node.id}`,
            // on extension we don't use router so no need for a path
            // onNavTabClick takes care of the navigation
            path: isExtension ? undefined : '/',
            action: isExtension ? () => onNavTabClick?.('default') : undefined,
            icon: feed.node.flags.icon || (
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
          title: feed.node.flags.name || `Feed ${feed.node.id}`,
          path: feedPath,
          icon: feed.node.flags.icon || (
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

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.CustomFeedsExpanded}
      onAdd={handleAddFeed}
    />
  );
};
