import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { DiscoverSection } from './DiscoverSection';
import { RecentSection } from './RecentSection';
import { MegaphoneIcon } from '../../icons';
import type { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';

// Explore tab panel: the discovery hub sections (reused from DiscoverSection)
// with Happening Now slotted between Explore and Tags and Hot Takes at the end,
// followed by the user's recently visited pages.
export const ExploreSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
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
        itemsAfterExplore={itemsAfterExplore}
      />
      <RecentSection {...defaultRenderSectionProps} isItemsButton={false} />
    </>
  );
};
