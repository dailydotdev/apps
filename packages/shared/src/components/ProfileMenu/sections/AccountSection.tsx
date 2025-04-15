import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import { CreditCardIcon, InviteIcon, SettingsIcon } from '../../icons';
import { webappUrl } from '../../../lib/constants';

export const AccountSection = (): ReactElement => {
  return (
    <ProfileSection
      items={[
        {
          title: 'Settings',
          href: `${webappUrl}account/profile`,
          icon: <SettingsIcon />,
        },
        {
          title: 'Subscriptions',
          href: `${webappUrl}account/subscription`,
          icon: <CreditCardIcon />,
        },
        {
          title: 'Invite friends',
          href: `${webappUrl}account/invite`,
          icon: <InviteIcon />,
        },
      ]}
    />
  );
};
