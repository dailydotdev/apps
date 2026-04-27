import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
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
import { useRightSidebarOffset } from '../../features/customizeNewTab/store/rightSidebar.store';

import { ProfileMenuFooter } from './ProfileMenuFooter';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { ProfileMenuHeader } from './ProfileMenuHeader';
import { HorizontalSeparator } from '../utilities';

import { ProfileSection } from './ProfileSection';
import { ResourceSection } from './sections/ResourceSection';
import { AccountSection } from './sections/AccountSection';
import { MainSection } from './sections/MainSection';
import { ThemeSection } from './sections/ThemeSection';
import { ProfileCompletion } from '../../features/profile/components/ProfileWidgets/ProfileCompletion';
import { useProfileCompletionIndicator } from '../../hooks/profile/useProfileCompletionIndicator';

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
  // The customize sidebar is `right-0` and the menu is `right-4` — without
  // shifting, the menu would render fully under the sidebar (z-modal beats
  // z-popup). Slide the menu left by the live sidebar width so the dropdown
  // remains visible and clickable while the panel is open.
  const rightSidebarOffset = useRightSidebarOffset();
  const popupStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!rightSidebarOffset) {
      return undefined;
    }
    return { right: `${rightSidebarOffset + 16}px` };
  }, [rightSidebarOffset]);

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
      className="flex max-h-[calc(100vh-4rem)] w-full max-w-80 flex-col gap-3 overflow-y-auto !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
      style={popupStyle}
    >
      {showProfileCompletion && <ProfileCompletion />}
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

        {/* "Customize new tab" sits directly above "Settings" so the two
            destination-style entries read as one grouped block — both are
            single taps that route the user somewhere (sidebar / settings
            page) rather than toggle state inline. The wrapping flex column
            collapses them into a single child of the parent `nav`, so its
            `gap-2` no longer inserts a stray 8px gutter between Customize
            new tab and Settings. */}
        <div className="flex flex-col">
          {checkIsExtension() && <ExtensionSection onClose={onClose} />}
          <AccountSection />
        </div>

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
