import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  InviteIcon,
  UserIcon,
  DevCardIcon,
  SettingsIcon,
  ExitIcon,
  CoinIcon,
  CreditCardIcon,
} from '../icons';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { ButtonSize } from '../buttons/Button';
import { walletUrl, webappUrl } from '../../lib/constants';
import { LogoutReason } from '../../lib/user';
import { TargetId } from '../../lib/log';

import { ProfileMenuFooter } from './ProfileMenuFooter';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { ProfileMenuHeader } from './ProfileMenuHeader';
import { HorizontalSeparator } from '../utilities';

import { ProfileSection } from './ProfileSection';
import { ExtensionSection } from './sections/ExtensionSection';
import { ResourceSection } from './sections/ResourceSection';

interface ProfileMenuProps {
  onClose: () => void;
}

export default function ProfileMenu({
  onClose,
}: ProfileMenuProps): ReactElement {
  const { user, logout } = useAuthContext();

  if (!user) {
    return <></>;
  }

  return (
    <InteractivePopup
      onClose={onClose}
      closeOutsideClick
      position={InteractivePopupPosition.ProfileMenu}
      className="flex w-full max-w-64 flex-col gap-3 !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
    >
      <ProfileMenuHeader />

      <UpgradeToPlus
        target={TargetId.ProfileDropdown}
        size={ButtonSize.Small}
        className="flex-initial"
      />

      <HorizontalSeparator />

      <nav className="flex flex-col gap-2">
        <ProfileSection
          items={[
            {
              title: 'Your profile',
              href: `${webappUrl}${user.username}`,
              icon: <UserIcon />,
            },
            { title: 'Core wallet', href: walletUrl, icon: <CoinIcon /> },
            {
              title: 'DevCard',
              href: `${webappUrl}devcard`,
              icon: <DevCardIcon />,
            },
          ]}
        />

        <HorizontalSeparator />

        <p>THEME</p>

        <HorizontalSeparator />

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
              external: true,
            },
            {
              title: 'Invite friends',
              href: `${webappUrl}account/invite`,
              icon: <InviteIcon />,
              external: true,
            },
          ]}
        />

        <ExtensionSection />

        <HorizontalSeparator />

        <ResourceSection />

        <HorizontalSeparator />

        <ProfileSection
          items={[
            {
              title: 'Logout',
              icon: <ExitIcon />,
              onClick: () => logout(LogoutReason.ManualLogout),
            },
          ]}
        />
      </nav>

      <ProfileMenuFooter />
    </InteractivePopup>
  );
}
