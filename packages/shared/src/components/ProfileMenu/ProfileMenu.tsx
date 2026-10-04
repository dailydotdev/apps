import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { ExitIcon } from '../icons';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { checkIsExtension } from '../../lib/func';
import { LogoutReason } from '../../lib/user';
import { TargetId } from '../../lib/log';
import { PlusMenuEntry } from '../plus/PlusMenuEntry';
import { PlusEntryRowSize } from '../plus/PlusEntryRow';

import { ProfileMenuFooter } from './ProfileMenuFooter';
import { ProfileMenuHeader } from './ProfileMenuHeader';
import { HorizontalSeparator } from '../utilities';

import { ProfileSection } from './ProfileSection';
import { ResourceSection } from './sections/ResourceSection';
import { AccountSection } from './sections/AccountSection';
import { MainSection } from './sections/MainSection';
import { ThemeSection } from './sections/ThemeSection';
import { FeedbackButtonSection } from './sections/FeedbackButtonSection';
import { ProfileCompletion } from '../../features/profile/components/ProfileWidgets/ProfileCompletion';
import { useProfileCompletionIndicator } from '../../hooks/profile/useProfileCompletionIndicator';
import { useReferralLadder } from '../../hooks/referral/useReferralLadder';

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
}: ProfileMenuProps): ReactElement | null {
  const { events } = useRouter();
  const { user, logout } = useAuthContext();
  const { showIndicator: showProfileCompletion } =
    useProfileCompletionIndicator();
  const { isEligible: isReferralLadderEligible, isCompleted } =
    useReferralLadder();

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
      showCloseButton={!isReferralLadderEligible || isCompleted}
      className="flex max-h-[calc(100vh-4rem)] w-full max-w-80 flex-col gap-3 overflow-y-auto !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
    >
      {showProfileCompletion && <ProfileCompletion />}
      <ProfileMenuHeader showReferralLadderGift compact />

      <PlusMenuEntry
        target={TargetId.ProfileDropdown}
        size={PlusEntryRowSize.Large}
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
        <FeedbackButtonSection className="px-1" />

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
