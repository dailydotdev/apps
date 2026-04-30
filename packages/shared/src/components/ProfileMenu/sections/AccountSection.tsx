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
import type { ProfileSectionItemProps } from '../ProfileSectionItem';

type AccountSectionProps = {
  /**
   * Optional item rendered at the top of the section, above "Settings".
   * Used by ProfileMenu to surface the "Customize new tab" entry inline
   * so it sits inside the same visual block as Settings instead of in a
   * separate section.
   */
  prepended?: ProfileSectionItemProps | null;
};

export const AccountSection = ({
  prepended,
}: AccountSectionProps = {}): ReactElement => {
  const { openModal } = useLazyModal();
  const canBuy = useCanPurchaseCores();

  const items: ProfileSectionItemProps[] = [
    ...(prepended ? [prepended] : []),
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

  if (canBuy) {
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
