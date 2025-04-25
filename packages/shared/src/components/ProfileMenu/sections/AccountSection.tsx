import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import { CreditCardIcon, EditIcon, InviteIcon } from '../../icons';
import { webappUrl } from '../../../lib/constants';

export const AccountSection = (): ReactElement => {
  return (
    <ProfileSection
      items={[
        {
          title: 'Account details',
          href: `${webappUrl}account/profile`,
          icon: EditIcon,
        },
        {
          title: 'Subscriptions',
          href: `${webappUrl}account/subscription`,
          icon: CreditCardIcon,
        },
        {
          title: 'Invite friends',
          href: `${webappUrl}account/invite`,
          icon: InviteIcon,
        },
      ]}
    />
  );
};
