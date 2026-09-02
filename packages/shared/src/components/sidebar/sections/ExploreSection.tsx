import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { DiscoverSection } from './DiscoverSection';
import { RecentSection } from './RecentSection';
import { BriefIcon, MegaphoneIcon } from '../../icons';
import type { SidebarSectionProps } from './common';
import { briefingUrl, webappUrl } from '../../../lib/constants';
import { briefUIFeature } from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';

// Explore tab panel: the discovery hub sections (reused from DiscoverSection),
// then the pages you visited recently at the bottom.
export const ExploreSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const briefUIFeatureValue = useFeature(briefUIFeature);
  const itemsAfterExplore: SidebarMenuItem[] = useMemo(
    () =>
      [
        {
          title: 'Happening Now',
          path: `${webappUrl}highlights`,
          isForcedLink: true,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <MegaphoneIcon secondary={active} />} />
          ),
        },
        briefUIFeatureValue && {
          title: 'Presidential briefings',
          path: briefingUrl,
          isForcedLink: true,
          requiresLogin: true,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <BriefIcon secondary={active} />} />
          ),
        },
      ].filter(Boolean) as SidebarMenuItem[],
    [briefUIFeatureValue],
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
