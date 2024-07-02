import React, { CSSProperties, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { PublicProfile } from '../../lib/user';
import { ShareIcon, SettingsIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { largeNumberFormat, ReferralCampaignKey } from '../../lib';
import { ProfileSettingsMenu } from './ProfileSettingsMenu';
import { RootPortal } from '../tooltips/Portal';
import { GoBackButton } from '../post/GoBackHeaderMobile';
import { ViewSize, useViewSize } from '../../hooks';

export interface HeaderProps {
  user: PublicProfile;
  isSameUser: boolean;
  sticky?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Header({
  user,
  isSameUser,
  sticky,
  className,
  style,
}: HeaderProps): ReactElement {
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    text: `Check out ${user.name}'s profile on daily.dev`,
    link: user.permalink,
    cid: ReferralCampaignKey.ShareProfile,
    logObject: () => ({ event_name: 'share profile', target_id: user.id }),
  });
  const isMobile = useViewSize(ViewSize.MobileL);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className={classNames('flex h-12 items-center px-4', className)}
      style={style}
    >
      <>
        {isMobile && (
          <GoBackButton showLogo={false} className={!sticky && 'mr-3'} />
        )}
        {sticky ? (
          <>
            <ProfilePicture
              user={user}
              nativeLazyLoading
              size={ProfileImageSize.Medium}
            />
            <div className="ml-2 flex flex-col typo-footnote">
              <p className="font-bold">{user.name}</p>
              <p className="text-text-tertiary">
                {largeNumberFormat(user.reputation)} Reputation
              </p>
            </div>
          </>
        ) : (
          <h2 className="font-bold typo-body">Profile</h2>
        )}
      </>
      {isSameUser && (
        <Button
          className="ml-auto mr-2 hidden laptop:flex"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          tag="a"
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}account/profile`}
        >
          Edit profile
        </Button>
      )}
      <Button
        className={classNames('ml-auto', isSameUser && 'laptop:ml-0')}
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<ShareIcon />}
        onClick={() => onShareOrCopyLink()}
      />
      {isSameUser && (
        <>
          <Button
            className="ml-2 laptop:hidden"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<SettingsIcon />}
            onClick={() => setIsMenuOpen(true)}
            aria-label="Edit profile"
          />
          <RootPortal>
            <ProfileSettingsMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
            />
          </RootPortal>
        </>
      )}
    </header>
  );
}
