import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import {
  CreditCardIcon,
  EditIcon,
  InviteIcon,
  SettingsIcon,
} from '../../icons';
import { webappUrl } from '../../../lib/constants';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';

export const AccountSection = (): ReactElement => {
  const { openModal } = useLazyModal();

  return (
    <ProfileSection
      items={[
        {
          title: 'Account details',
          href: `${webappUrl}account/profile`,
          icon: EditIcon,
        },
        {
          title: 'Customize',
          onClick: () => openModal({ type: LazyModal.UserSettings }),
          icon: SettingsIcon,
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
