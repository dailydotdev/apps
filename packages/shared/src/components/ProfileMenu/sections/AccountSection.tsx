import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import {
  CreditCardIcon,
  InviteIcon,
  OrganizationIcon,
  SettingsIcon,
} from '../../icons';
import { settingsUrl } from '../../../lib/constants';

export const AccountSection = (): ReactElement => {
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
          title: 'Organizations',
          href: `${settingsUrl}/organization`,
          icon: OrganizationIcon,
        },
        {
          title: 'Invite friends',
          href: `${settingsUrl}/invite`,
          icon: InviteIcon,
        },
      ]}
    />
  );
};
