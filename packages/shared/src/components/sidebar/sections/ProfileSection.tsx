import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import {
  AnalyticsIcon,
  CoinIcon,
  DevCardIcon,
  JobIcon,
  MedalBadgeIcon,
  UserIcon,
} from '../../icons';
import { Section } from '../Section';
import type { SidebarSectionProps } from './common';
import { settingsUrl, walletUrl, webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useHasAccessToCores } from '../../../hooks/useCoresFeature';
import { useAlertsContext } from '../../../contexts/AlertContext';
import { useLogOpportunityNudgeClick } from '../../../hooks/log/useLogOpportunityNudgeClick';

export const ProfileSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement | null => {
  const hasAccessToCores = useHasAccessToCores();
  const { user } = useAuthContext();
  const { alerts } = useAlertsContext();
  const logOpportunityNudgeClick = useLogOpportunityNudgeClick();

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    if (!user?.username) {
      return [];
    }

    return [
      {
        title: 'Your profile',
        path: `${webappUrl}${user.username}`,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <UserIcon secondary={active} />} />
        ),
      },
      {
        title: 'Jobs',
        path: `${webappUrl}jobs/${alerts.opportunityId ?? ''}`,
        action: logOpportunityNudgeClick,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <JobIcon secondary={active} />} />
        ),
      },
      ...(hasAccessToCores
        ? [
            {
              title: 'Core wallet',
              path: walletUrl,
              icon: (active: boolean) => (
                <ListIcon Icon={() => <CoinIcon secondary={active} />} />
              ),
            },
          ]
        : []),
      {
        title: 'Achievements',
        path: `${webappUrl}${user.username}/achievements`,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <MedalBadgeIcon secondary={active} />} />
        ),
      },
      {
        title: 'DevCard',
        path: `${settingsUrl}/customization/devcard`,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <DevCardIcon secondary={active} />} />
        ),
      },
      {
        title: 'Analytics',
        path: `${webappUrl}analytics`,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <AnalyticsIcon secondary={active} />} />
        ),
      },
    ];
  }, [alerts.opportunityId, hasAccessToCores, logOpportunityNudgeClick, user]);

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
    />
  );
};
