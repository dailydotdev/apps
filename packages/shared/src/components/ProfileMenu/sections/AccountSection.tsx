import React from 'react';
import type { ReactElement } from 'react';
import { ProfileSection } from '../ProfileSection';
import {
  CreditCardIcon,
  InviteIcon,
  SettingsIcon,
  TrendingIcon,
  OrganizationIcon,
} from '../../icons';
import { boostManagerUrl, settingsUrl } from '../../../lib/constants';
import { useCanPurchaseCores } from '../../../hooks/useCoresFeature';
import type { ProfileSectionItemProps } from '../ProfileSectionItem';

export const AccountSection = (): ReactElement => {
  const canBuy = useCanPurchaseCores();

  const items: ProfileSectionItemProps[] = [
    {
      title: 'Settings',
      href: `${settingsUrl}/profile`,
      icon: SettingsIcon,
    },
    {
      title: 'Payment & Subscription',
      href: `${settingsUrl}/subscription`,
      icon: CreditCardIcon,
    },
    {
      title: 'Organizations',
      href: `${settingsUrl}/organization`,
      icon: OrganizationIcon,
    },
    {
      title: 'Invite friends',
      href: `${settingsUrl}/invite`,
      icon: InviteIcon,
    },
  ];

  if (canBuy) {
    items.push({
      title: 'Boost manager',
      icon: TrendingIcon,
      href: boostManagerUrl,
    });
  }

  return <ProfileSection items={items} />;
};
