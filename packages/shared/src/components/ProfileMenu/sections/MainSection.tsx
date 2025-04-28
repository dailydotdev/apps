import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import { CoinIcon, DevCardIcon, UserIcon } from '../../icons';
import { walletUrl, webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';

export const MainSection = (): ReactElement => {
  const { user } = useAuthContext();

  return (
    <ProfileSection
      items={[
        {
          title: 'Your profile',
          href: `${webappUrl}${user.username}`,
          icon: UserIcon,
        },
        { title: 'Core wallet', href: walletUrl, icon: CoinIcon },
        {
          title: 'DevCard',
          href: `${webappUrl}devcard`,
          icon: DevCardIcon,
        },
      ]}
    />
  );
};
