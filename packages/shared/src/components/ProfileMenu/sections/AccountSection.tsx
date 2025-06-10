import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import {
  CreditCardIcon,
  InviteIcon,
  SettingsIcon,
  TrendingIcon,
} from '../../icons';
import { settingsUrl } from '../../../lib/constants';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';

export const AccountSection = (): ReactElement => {
  const { openModal } = useLazyModal();

  return (
    <ProfileSection
      items={[
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
          title: 'Invite friends',
          href: `${settingsUrl}/invite`,
          icon: InviteIcon,
        },
        {
          title: 'Ads dashboard',
          icon: TrendingIcon,
          onClick() {
            openModal({ type: LazyModal.AdsDashboard });
          },
        },
      ]}
    />
  );
};
