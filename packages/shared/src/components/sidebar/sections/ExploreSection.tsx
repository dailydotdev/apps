import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { DiscoverSection } from './DiscoverSection';
import { RecentSection } from './RecentSection';
import { HomeIcon, MegaphoneIcon } from '../../icons';
import type { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';
import { useMyFeedNav } from '../../../hooks/feed/useMyFeedNav';

// Home tab panel: your feed up top, then the discovery hub sections (reused
// from DiscoverSection) with Happening Now slotted between Explore and Tags,
// and the pages you visited recently at the bottom.
export const ExploreSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { path: myFeedPath, navTab: myFeedNavTab } = useMyFeedNav();

  const itemsBeforeExplore: SidebarMenuItem[] = useMemo(
    () => [
      {
        title: 'Your feed',
        // Bare path (not webappUrl) so it active-matches the in-place feed on
        // the extension new tab, where `onNavTabClick` swaps it client-side.
        path: myFeedPath,
        action: () => onNavTabClick?.(myFeedNavTab),
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HomeIcon secondary={active} />} />
        ),
      },
    ],
    [myFeedNavTab, myFeedPath, onNavTabClick],
  );

  const itemsAfterExplore: SidebarMenuItem[] = useMemo(
    () => [
      {
        title: 'Happening Now',
        path: `${webappUrl}highlights`,
        isForcedLink: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <MegaphoneIcon secondary={active} />} />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <DiscoverSection
        {...defaultRenderSectionProps}
        onNavTabClick={onNavTabClick}
        isItemsButton={isItemsButton}
        itemsBeforeExplore={itemsBeforeExplore}
        itemsAfterExplore={itemsAfterExplore}
      />
      <RecentSection {...defaultRenderSectionProps} isItemsButton={false} />
    </>
  );
};
