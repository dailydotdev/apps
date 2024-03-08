import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';
import { PublicProfile } from '../../lib/user';
import { ShareIcon, SettingsIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { ProfilePicture } from '../ProfilePicture';
import { largeNumberFormat } from '../../lib/numberFormat';
import { addTrackingQueryParams } from '../../lib/share';

export type HeaderProps = {
  user: PublicProfile;
  isSameUser: boolean;
  sticky?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Header({
  user,
  isSameUser,
  sticky,
  className,
  style,
}: HeaderProps): ReactElement {
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    text: `Check out ${user.name}'s profile on daily.dev`,
    link: addTrackingQueryParams({
      link: user.permalink,
      userId: user.id,
      cid: 'share_profile',
    }),
    trackObject: () => ({ event_name: 'share profile', target_id: user.id }),
  });

  return (
    <header
      className={classNames('flex h-12 items-center px-4', className)}
      style={style}
    >
      {sticky ? (
        <>
          <ProfilePicture user={user} nativeLazyLoading size="medium" />
          <div className="ml-2 flex flex-col typo-footnote">
            <p className="font-bold">{user.name}</p>
            <p className="text-theme-label-tertiary">
              {largeNumberFormat(user.reputation)} Reputation
            </p>
          </div>
        </>
      ) : (
        <h2 className="font-bold typo-body">Profile</h2>
      )}
      {isSameUser && (
        <Button
          className="ml-auto mr-2 hidden tablet:flex"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          tag="a"
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}account/profile`}
        >
          Edit profile
        </Button>
      )}
      <Button
        className={classNames('ml-auto', isSameUser && 'tablet:ml-0')}
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<ShareIcon />}
        onClick={() => onShareOrCopyLink()}
      />
      {isSameUser && (
        <Button
          className="ml-2 tablet:hidden"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<SettingsIcon />}
          tag="a"
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}account/profile`}
          aria-label="Edit profile"
        />
      )}
    </header>
  );
}
