import React from 'react';
import type { ReactElement } from 'react';

import type { ProfileSectionItemProps } from '../ProfileSectionItem';
import { ProfileSectionItem } from '../ProfileSectionItem';
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
import { OpportunityEntryButton } from '../../opportunity/OpportunityEntryButton';

export const MainSection = (): ReactElement => {
  const hasAccessToCores = useHasAccessToCores();
  const { user } = useAuthContext();

  const profileItem: ProfileSectionItemProps = {
    title: 'Your profile',
    href: `${webappUrl}${user?.username}`,
    icon: UserIcon,
  };

  const items: ProfileSectionItemProps[] = [
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

  return (
    <section className="flex flex-col">
      <ProfileSectionItem {...profileItem} />
      <OpportunityEntryButton variant="profileMenu" />
      {items.map((item) => (
        <ProfileSectionItem
          {...item}
          key={`${item.title.trim().toLowerCase().replace(' ', '-')}`}
        />
      ))}
    </section>
  );
};
