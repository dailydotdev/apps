import type { ReactElement } from 'react';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';
import { ButtonIconPosition, ButtonVariant } from '../buttons/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfilePictureWithIndicator } from '../profile/ProfilePictureWithIndicator';
import HeaderLogo from '../layout/HeaderLogo';
import { LogoPosition } from '../Logo';
import { webappUrl } from '../../lib/constants';
import { Button } from '../buttons/Button';
import { SettingsIcon } from '../icons';
import { RootPortal } from '../tooltips/Portal';
import { QuestHeaderButton } from '../header/QuestHeaderButton';
import { useMobileAppHeader } from '../../features/getApp/hooks/useMobileAppHeader';
import { MobileAppActions } from '../../features/getApp/components/MobileAppActions';

const ProfileSettingsMenuMobile = dynamic(
  () =>
    import(
      /* webpackChunkName: "profileSettingsMenuMobile" */ '../profile/ProfileSettingsMenu'
    ).then((mod) => mod.ProfileSettingsMenuMobile),
  { ssr: false },
);

// The logged-out row is pinned to this height so FeedNav slides it away by
// exactly that much; change both together.
const loggedOutRowHeight = 'h-10';
export const hideLoggedOutRowClassName = '-translate-y-10';

export function MobileFeedActions(): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobileAppHeader = useMobileAppHeader();

  return (
    <div
      className={classNames(
        'flex flex-row justify-between px-4 py-1',
        isMobileAppHeader && loggedOutRowHeight,
      )}
    >
      <HeaderLogo
        position={LogoPosition.Relative}
        onLogoClick={() => router.push('/')}
      />
      <span className="flex flex-row items-center gap-1">
        {isStreaksEnabled && streak && (
          <ReadingStreakButton
            isLoading={isLoading}
            streak={streak}
            compact
            iconPosition={ButtonIconPosition.Right}
          />
        )}
        <QuestHeaderButton compact />
        {isMobileAppHeader && <MobileAppActions />}
        {user && (
          <>
            <Button
              icon={<SettingsIcon />}
              variant={ButtonVariant.Tertiary}
              className="shell-press"
              onClick={() => setIsMenuOpen(true)}
            />
            <RootPortal>
              <ProfileSettingsMenuMobile
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
              />
            </RootPortal>
            <Link href={`${webappUrl}${user.username}`} passHref>
              <a className="shell-press">
                <ProfilePictureWithIndicator user={user} />
              </a>
            </Link>
          </>
        )}
      </span>
    </div>
  );
}
