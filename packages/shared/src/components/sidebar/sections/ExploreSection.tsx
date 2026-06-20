import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { Section } from '../Section';
import { DiscoverSection } from './DiscoverSection';
import { RecentSection } from './RecentSection';
import { MegaphoneIcon, TourIcon } from '../../icons';
import type { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

// Explore tab panel: the discovery hub sections (Explore, Tags, Sources,
// Leaderboard, Discussions — reused from DiscoverSection), then Happening Now
// and the user's recently visited pages. The per-sort tabs (Popular, By
// upvotes, …) live in the in-page Explore header, not here.
export const ExploreSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { logEvent } = useLogContext();
  const extraItems: SidebarMenuItem[] = useMemo(
    () => [
      {
        title: 'Happening Now',
        path: `${webappUrl}highlights`,
        isForcedLink: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <MegaphoneIcon secondary={active} />} />
        ),
      },
      {
        title: 'Hot Takes',
        path: `${webappUrl}?openModal=hottakes`,
        isForcedLink: true,
        requiresLogin: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <TourIcon secondary={active} />} />
        ),
        action: () => logEvent({ event_name: LogEvent.OpenHotAndCold }),
      },
    ],
    [logEvent],
  );

  return (
    <>
      <DiscoverSection
        {...defaultRenderSectionProps}
        onNavTabClick={onNavTabClick}
        isItemsButton={isItemsButton}
        showHotTakes={false}
      />
      <Section
        {...defaultRenderSectionProps}
        items={extraItems}
        isItemsButton={false}
        className="!mt-0"
      />
      <RecentSection {...defaultRenderSectionProps} isItemsButton={false} />
    </>
  );
};
