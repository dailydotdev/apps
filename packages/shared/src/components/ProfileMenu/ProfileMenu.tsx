import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { ExitIcon } from '../icons';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { ButtonSize } from '../buttons/Button';
import { checkIsExtension } from '../../lib/func';
import { LogoutReason } from '../../lib/user';
import { TargetId } from '../../lib/log';

import { ProfileMenuFooter } from './ProfileMenuFooter';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { ProfileMenuHeader } from './ProfileMenuHeader';
import { HorizontalSeparator } from '../utilities';

import { ProfileSection } from './ProfileSection';
import { ResourceSection } from './sections/ResourceSection';
import { AccountSection } from './sections/AccountSection';
import { MainSection } from './sections/MainSection';
import { ThemeSection } from './sections/ThemeSection';

const ExtensionSection = dynamic(() =>
  import(
    /* webpackChunkName: "extensionSection" */ './sections/ExtensionSection'
  ).then((mod) => mod.ExtensionSection),
);

interface ProfileMenuProps {
  onClose: () => void;
}

export default function ProfileMenu({
  onClose,
}: ProfileMenuProps): ReactElement {
  const { events } = useRouter();
  const { user, logout } = useAuthContext();

  useEffect(() => {
    events.on('routeChangeStart', onClose);

    return () => {
      events.off('routeChangeStart', onClose);
    };
  }, [events, onClose]);

  if (!user) {
    return null;
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
        <MainSection />

        <HorizontalSeparator />

        <ThemeSection className="px-1" />

        <HorizontalSeparator />

        <AccountSection />

        {checkIsExtension() && <ExtensionSection />}

        <HorizontalSeparator />

        <ResourceSection />

        <HorizontalSeparator />

        <ProfileSection
          items={[
            {
              title: 'Log out',
              icon: ExitIcon,
              onClick: () => logout(LogoutReason.ManualLogout),
            },
          ]}
        />
      </nav>

      <ProfileMenuFooter />
    </InteractivePopup>
  );
}
