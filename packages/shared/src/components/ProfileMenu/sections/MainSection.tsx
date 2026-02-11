import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import { CoinIcon, DevCardIcon, GiftIcon, UserIcon } from '../../icons';
import { settingsUrl, walletUrl, webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useHasAccessToCores } from '../../../hooks/useCoresFeature';

export const MainSection = (): ReactElement => {
  const hasAccessToCores = useHasAccessToCores();
  const { user } = useAuthContext();

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
