import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import {
  DiscussIcon,
  EarthIcon,
  HashtagIcon,
  HotIcon,
  SquadIcon,
  TourIcon,
} from '../../icons';
import { Section } from '../Section';
import type { SidebarSectionProps } from './common';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { webappUrl } from '../../../lib/constants';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { OtherFeedPage } from '../../../lib/query';
import { useLayoutVariant } from '../../../hooks/layout/useLayoutVariant';

interface DiscoverSectionProps extends SidebarSectionProps {
  onNavTabClick?: (tab: string) => void;
  // Hot Takes is a modal launcher rather than a hub section; the v2 Explore
  // panel opts out of it. Defaults on so the v1 sidebar is unchanged.
  showHotTakes?: boolean;
}

export const DiscoverSection = ({
  isItemsButton,
  onNavTabClick,
  showHotTakes = true,
  ...defaultRenderSectionProps
}: DiscoverSectionProps): ReactElement => {
  const { completeAction } = useActions();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isV2 } = useLayoutVariant();
  const HotTakesIcon = isV2 ? TourIcon : HotIcon;
  const menuItems: SidebarMenuItem[] = useMemo(() => {
    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HotIcon secondary={active} />} />
        ),
        title: 'Explore',
        // Bare path (not webappUrl) so it active-matches the in-place Explore
        // feed on the extension new tab; `onNavTabClick` switches the feed
        // client-side, so this must render as a button, not a link.
        path: '/posts',
        action: () => onNavTabClick?.(OtherFeedPage.Explore),
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
        ),
        title: 'Tags',
        path: `${webappUrl}tags`,
        isForcedLink: true,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EarthIcon secondary={active} />} />
        ),
        title: 'Sources',
        path: `${webappUrl}sources`,
        isForcedLink: true,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SquadIcon secondary={active} />} />
        ),
        title: 'Leaderboard',
        path: `${webappUrl}users`,
        isForcedLink: true,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <DiscussIcon secondary={active} />} />
        ),
        title: 'Discussions',
        path: `${webappUrl}discussed`,
        isForcedLink: true,
        action: () => {
          if (user) {
            completeAction(ActionType.CommentFeed);
          }
        },
      },
      showHotTakes && {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HotTakesIcon secondary={active} />} />
        ),
        title: 'Hot Takes',
        requiresLogin: true,
        path: `${webappUrl}?openModal=hottakes`,
        isForcedLink: true,
        action: () => {
          logEvent({ event_name: LogEvent.OpenHotAndCold });
        },
      },
    ].filter(Boolean) as SidebarMenuItem[];
  }, [
    completeAction,
    user,
    logEvent,
    onNavTabClick,
    HotTakesIcon,
    showHotTakes,
  ]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.OtherExpanded}
    />
  );
};
