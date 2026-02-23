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

export const DiscoverSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { completeAction } = useActions();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const menuItems: SidebarMenuItem[] = useMemo(() => {
    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HotIcon secondary={active} />} />
        ),
        title: 'Hot Takes',
        requiresLogin: true,
        path: `${webappUrl}?openModal=hottakes`,
        action: () => {
          logEvent({ event_name: LogEvent.OpenHotAndCold });
        },
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
        ),
        title: 'Tags',
        path: `${webappUrl}tags`,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EarthIcon secondary={active} />} />
        ),
        title: 'Sources',
        path: `${webappUrl}sources`,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SquadIcon secondary={active} />} />
        ),
        title: 'Leaderboard',
        path: `${webappUrl}users`,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <DiscussIcon secondary={active} />} />
        ),
        title: 'Discussions',
        path: `${webappUrl}discussed`,
        action: () => {
          if (user) {
            completeAction(ActionType.CommentFeed);
          }
        },
      },
    ].filter(Boolean);
  }, [completeAction, user, logEvent]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={false}
      flag={SidebarSettingsFlags.OtherExpanded}
    />
  );
};
