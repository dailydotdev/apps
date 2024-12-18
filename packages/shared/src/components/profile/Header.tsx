import React, { CSSProperties, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { PublicProfile } from '../../lib/user';
import { SettingsIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { largeNumberFormat, ReferralCampaignKey } from '../../lib';
import { ProfileSettingsMenu } from './ProfileSettingsMenu';
import { RootPortal } from '../tooltips/Portal';
import { GoBackButton } from '../post/GoBackHeaderMobile';
import { useViewSize, ViewSize } from '../../hooks';
import { FollowButton } from '../contentPreference/FollowButton';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../lib/log';
import CustomFeedOptionsMenu from '../CustomFeedOptionsMenu';

export interface HeaderProps {
  user: PublicProfile;
  isSameUser: boolean;
  sticky?: boolean;
  className?: string;
  style?: CSSProperties;
  isPlus?: boolean;
}

export function Header({
  user,
  isSameUser,
  sticky,
  className,
  style,
}: HeaderProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isPlus } = usePlusSubscription();

  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user?.id,
    entity: ContentPreferenceType.User,
  });

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
            <div className="ml-2 mr-auto flex flex-col typo-footnote">
              <p className="font-bold">{user.name}</p>
              <p className="text-text-tertiary">
                {largeNumberFormat(user.reputation)} Reputation
              </p>
            </div>
          </>
        ) : (
          <h2 className="mr-auto font-bold typo-body">Profile</h2>
        )}
      </>
      <div className="flex flex-row gap-2">
        {isSameUser && (
          <Button
            className="hidden laptop:flex"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            tag="a"
            href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}account/profile`}
          >
            Edit profile
          </Button>
        )}
        {isSameUser && !isPlus && (
          <UpgradeToPlus
            className="max-w-fit laptop:hidden"
            size={ButtonSize.Small}
            target={TargetId.MyProfile}
          />
        )}
        <FollowButton
          entityId={user.id}
          type={ContentPreferenceType.User}
          status={contentPreference?.status}
          entityName={`@${user.username}`}
          className="flex-row-reverse"
        />
        {!isSameUser && (
          <CustomFeedOptionsMenu
            shareProps={{
              text: `Check out ${user.name}'s profile on daily.dev`,
              link: user.permalink,
              cid: ReferralCampaignKey.ShareProfile,
              logObject: () => ({
                event_name: LogEvent.ShareProfile,
                target_id: user.id,
              }),
            }}
          />
        )}
      </div>
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
