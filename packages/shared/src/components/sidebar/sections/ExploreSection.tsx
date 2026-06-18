import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { Section } from '../Section';
import { RecentSection } from './RecentSection';
import {
  CalendarIcon,
  DiscussIcon,
  HotIcon,
  MedalBadgeIcon,
  MegaphoneIcon,
  UpvoteIcon,
} from '../../icons';
import type { SidebarSectionProps } from './common';
import type { OtherFeedPage } from '../../../lib/query';
import { webappUrl } from '../../../lib/constants';
import {
  ExploreTabs,
  tabToUrl,
  tabsToFeedMap,
} from '../../header/FeedExploreHeader';

// Reuse the single source of truth for Explore tab → URL (FeedExploreHeader)
// so the rail panel never drifts from the feed header.
const exploreTabIcons: Record<ExploreTabs, (active: boolean) => ReactElement> =
  {
    [ExploreTabs.Popular]: (active) => (
      <ListIcon Icon={() => <HotIcon secondary={active} />} />
    ),
    [ExploreTabs.MostUpvoted]: (active) => (
      <ListIcon Icon={() => <UpvoteIcon secondary={active} />} />
    ),
    [ExploreTabs.BestDiscussions]: (active) => (
      <ListIcon Icon={() => <DiscussIcon secondary={active} />} />
    ),
    [ExploreTabs.ByDate]: (active) => (
      <ListIcon Icon={() => <CalendarIcon secondary={active} />} />
    ),
    [ExploreTabs.BestOf]: (active) => (
      <ListIcon Icon={() => <MedalBadgeIcon secondary={active} />} />
    ),
  };

// The feed page each Explore tab maps to, for the extension's feed-switch
// callback. Best of has no dedicated feed enum, so it relies on the link path.
const exploreTabFeedPage: Partial<Record<ExploreTabs, OtherFeedPage>> =
  Object.entries(tabsToFeedMap).reduce(
    (result, [feed, tab]) => ({ ...result, [tab]: feed as OtherFeedPage }),
    {},
  );

// Explore tab panel: the /posts sub-tabs (Popular, By upvotes, By comments,
// By date, Best of) followed by the user's recently visited pages.
export const ExploreSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const menuItems: SidebarMenuItem[] = useMemo(
    () => [
      ...(Object.values(ExploreTabs) as ExploreTabs[]).map((tab) => {
        const feedPage = exploreTabFeedPage[tab];
        return {
          title: tab,
          path: tabToUrl[tab],
          icon: exploreTabIcons[tab],
          action: feedPage ? () => onNavTabClick?.(feedPage) : undefined,
        };
      }),
      {
        title: 'Happening Now',
        path: `${webappUrl}highlights`,
        isForcedLink: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <MegaphoneIcon secondary={active} />} />
        ),
      },
    ],
    [onNavTabClick],
  );

  return (
    <>
      <Section
        {...defaultRenderSectionProps}
        items={menuItems}
        isItemsButton={isItemsButton}
        className="!mt-0"
      />
      <RecentSection {...defaultRenderSectionProps} isItemsButton={false} />
    </>
  );
};
