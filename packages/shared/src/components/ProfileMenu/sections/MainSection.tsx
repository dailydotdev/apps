import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import type { ProfileSectionItemProps } from '../ProfileSectionItem';
import {
  AnalyticsIcon,
  CoinIcon,
  DevCardIcon,
  MedalBadgeIcon,
  UserIcon,
} from '../../icons';
import { settingsUrl, walletUrl, webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useHasAccessToCores } from '../../../hooks/useCoresFeature';

export const MainSection = (): ReactElement => {
  const hasAccessToCores = useHasAccessToCores();
  const { user } = useAuthContext();

  const items: ProfileSectionItemProps[] = [
    {
      title: 'Your profile',
      href: `${webappUrl}${user?.username}`,
      icon: UserIcon,
    },
    ...(hasAccessToCores
      ? [
          {
            title: 'Core wallet',
            href: walletUrl,
            icon: CoinIcon,
          } satisfies ProfileSectionItemProps,
        ]
      : []),
    {
      title: 'Achievements',
      href: `${webappUrl}${user?.username}/achievements`,
      icon: MedalBadgeIcon,
    },
    {
      title: 'DevCard',
      href: `${settingsUrl}/customization/devcard`,
      icon: DevCardIcon,
    },
    {
      title: 'Analytics',
      href: `${webappUrl}analytics`,
      icon: AnalyticsIcon,
    },
  ];

  return <ProfileSection items={items} />;
  return (
    <ProfileSection
      items={[
        {
          title: 'Your profile',
          href: `${webappUrl}${user.username}`,
          icon: UserIcon,
        },
        hasAccessToCores && {
          title: 'Core wallet',
          href: walletUrl,
          icon: CoinIcon,
        },
        {
          title: 'DevCard',
          href: `${settingsUrl}/customization/devcard`,
          icon: DevCardIcon,
        },
        // TODO: Re-enable when ready
        // {
        //   title: 'Coupons',
        //   href: `${settingsUrl}/coupons`,
        //   icon: GiftIcon,
        // },
      ].filter(Boolean)}
    />
  );
};
