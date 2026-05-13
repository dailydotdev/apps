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

import { UpgradeToPlus } from '../UpgradeToPlus';
import { ProfileMenuHeader } from './ProfileMenuHeader';
import { ProfileMenuStats } from './ProfileMenuStats';
import { HorizontalSeparator } from '../utilities';

import { ProfileSection } from './ProfileSection';
import { FeedbackButtonSection } from './sections/FeedbackButtonSection';
import { useCustomizeNewTabMenuItem } from './sections/ExtensionSection';

const ExtensionSection = dynamic(() =>
  import(
    /* webpackChunkName: "extensionSection" */ './sections/ExtensionSection'
  ).then((mod) => mod.ExtensionSection),
);

interface ProfileMenuProps {
  onClose: () => void;
  position?: InteractivePopupPosition;
}

export default function ProfileMenu({
  onClose,
  position = InteractivePopupPosition.ProfileMenu,
}: ProfileMenuProps): ReactElement | null {
  const { events } = useRouter();
  const { user, logout } = useAuthContext();
  const customizeMenuItem = useCustomizeNewTabMenuItem(onClose);

  useEffect(() => {
    events.on('routeChangeStart', onClose);

    return () => {
      events.off('routeChangeStart', onClose);
    };
  }, [events, onClose]);

  if (!user) {
    return null;
  }

  const logoutItem = {
    title: 'Log out',
    icon: ExitIcon,
    onClick: () => logout(LogoutReason.ManualLogout),
  };

  return (
    <InteractivePopup
      onClose={onClose}
      closeOutsideClick
      position={position}
      className="flex max-h-[calc(100vh-4rem)] w-full max-w-80 flex-col gap-3 overflow-y-auto !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
    >
      <ProfileMenuHeader />
      <ProfileMenuStats />

      <UpgradeToPlus
        target={TargetId.ProfileDropdown}
        size={ButtonSize.Small}
        className="flex-initial"
      />

      <HorizontalSeparator />

      <nav className="flex flex-col gap-2">
        {checkIsExtension() && (
          <>
            {customizeMenuItem && (
              <ProfileSection items={[customizeMenuItem]} />
            )}
            <ExtensionSection />
            <HorizontalSeparator />
          </>
        )}

        <FeedbackButtonSection className="px-1" />

        <HorizontalSeparator />

        <ProfileSection items={[logoutItem]} />
      </nav>
    </InteractivePopup>
  );
}
