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
import { settingsUrl } from '../../../lib/constants';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useCanPurchaseCores } from '../../../hooks/useCoresFeature';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { ProfileSectionItemProps } from '../ProfileSectionItem';

export const AccountSection = (): ReactElement => {
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const canBuy = useCanPurchaseCores();

  const items: ProfileSectionItemProps[] = [
    {
      title: 'Settings',
      href: `${settingsUrl}/profile`,
      icon: SettingsIcon,
    },
    {
      title: 'Subscriptions',
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

  if (canBuy && user?.isTeamMember) {
    items.push({
      title: 'Ads dashboard',
      icon: TrendingIcon,
      onClick: () => {
        openModal({ type: LazyModal.AdsDashboard });
      },
    });
  }

  return <ProfileSection items={items} />;
};
