import type { ReactNode, RefObject } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { shellCoverScrim } from '../../styles/custom';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon, EditIcon, LinkIcon } from '../icons';
import type { PublicProfile } from '../../lib/user';
import type { UserStatsProps } from './UserStats';
import { UserStats } from './UserStats';
import JoinedDate from './JoinedDate';
import { Separator } from '../cards/common/common';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { webappUrl } from '../../lib/constants';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize } from '../ProfilePicture';
import { VerifiedCompanyUserBadge } from '../VerifiedCompanyUserBadge';
import { locationToString } from '../../lib/utils';
import { IconSize } from '../Icon';
import { fallbackImages } from '../../lib/config';
import { ProfileDesktopPwaBackButton } from './ProfileBackButton';
import { Tooltip } from '../tooltip/Tooltip';
import { useCopyLink } from '../../hooks/useCopy';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { ReferralCampaignKey } from '../../lib/referral';

import { ElementPlaceholder } from '../ElementPlaceholder';

const ProfileActionsSkeleton = () => (
  <div className="flex items-center gap-2 tablet:h-12">
    <ElementPlaceholder className="h-10 flex-1 rounded-12 tablet:h-12 tablet:w-18 tablet:flex-none tablet:rounded-16" />
    <ElementPlaceholder className="h-10 flex-1 rounded-12 tablet:h-12 tablet:w-18 tablet:flex-none tablet:rounded-16" />
  </div>
);

const ProfileActions = dynamic(
  () =>
    import(
      /* webpackChunkName: "profileActions" */
      './ProfileActions'
    ),
  {
    ssr: false,
    loading: ProfileActionsSkeleton,
  },
);

type ProfileHeaderProps = {
  user: PublicProfile;
  /** Optional for the same reason the profile's static props are: the counts
      arrive with the user, and there is no user on the not-found path. */
  userStats?: Omit<UserStatsProps['stats'], 'reputation'>;
  isSameUser?: boolean;
  isPreviewMode?: boolean;
  /** Rendered in the top row, left of the edit button. */
  actions?: ReactNode;
  /**
   * On a phone, when the cover is the first thing on the page, it runs up
   * behind the top block. The refs let the page tell the block when the
   * cover and the name have scrolled behind it.
   */
  coversBlock?: boolean;
  coverRef?: RefObject<HTMLDivElement>;
  nameRef?: RefObject<HTMLDivElement>;
};

const ProfileHeader = ({
  user,
  userStats,
  isSameUser: propIsSameUser,
  isPreviewMode,
  actions,
  coversBlock = false,
  coverRef,
  nameRef,
}: ProfileHeaderProps) => {
  const { name, username, bio, image, cover, isPlus } = user;
  const { user: loggedUser } = useAuthContext();
  const isSameUser = propIsSameUser ?? loggedUser?.id === user.id;
  const { logEvent } = useLogContext();
  const [isCopying, copyLink] = useCopyLink();
  const { getTrackedUrl } = useGetShortUrl();

  const onCopyLink = () => {
    logEvent({
      event_name: LogEvent.ShareProfile,
      target_type: TargetType.ProfilePage,
      target_id: user.id,
      extra: JSON.stringify({
        provider: ShareProvider.CopyLink,
        origin: Origin.ProfileHeader,
      }),
    });
    copyLink({
      link: getTrackedUrl(user.permalink, ReferralCampaignKey.ShareProfile),
      shorten: true,
    });
  };

  return (
    <div
      className={classNames(
        'relative -mt-[var(--cover-lift)] w-full overflow-hidden [--cover-lift:0px] laptop:rounded-t-16',
        coversBlock &&
          '[--cover-lift:var(--shell-top,var(--shell-top-rest,0px))] tablet:[--cover-lift:0px]',
      )}
    >
      <ProfileDesktopPwaBackButton className="absolute left-4 top-4 z-1" />
      <div
        ref={coverRef}
        className={classNames(
          'shell-cover relative overflow-hidden',
          coversBlock ? 'h-[10.5rem] tablet:h-36' : 'h-36',
        )}
      >
        <Image src={cover} alt="Cover" className="h-full w-full object-cover" />
        {coversBlock && (
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-24 tablet:hidden"
            style={{ background: shellCoverScrim }}
          />
        )}
      </div>
      <Image
        src={image}
        fallbackSrc={fallbackImages.avatar}
        alt="Avatar"
        className={classNames(
          'absolute left-4 size-20 rounded-16 object-cover ring-4 ring-background-default tablet:left-6 tablet:size-[7.5rem] tablet:ring-0',
          coversBlock ? 'top-[8.5rem] tablet:top-16' : 'top-28 tablet:top-16',
        )}
      />
      <div className="flex flex-col gap-1 px-4 tablet:gap-3 tablet:px-6">
        {/* Edit leads and `actions` trails, because edit is only hidden, not
            removed: it holds its width so the row keeps its height for a
            visitor. Trailing, that reserved width sat between the actions and
            the right edge and left them looking short of it; leading, it falls
            on the inside and whatever trails stays flush either way. */}
        <div className="mb-3 ml-auto mt-2 flex items-center gap-2 tablet:mb-4">
          <Link passHref href={`${webappUrl}settings/profile`}>
            <Button
              className={classNames(
                'text-text-secondary',
                !isSameUser && 'invisible',
              )}
              tag="a"
              disabled={!isSameUser}
              variant={ButtonVariant.Float}
              icon={<EditIcon />}
              aria-label="Edit profile"
            />
          </Link>
          <Tooltip content={isCopying ? 'Copied!' : 'Copy link'}>
            <Button
              aria-label="Copy link"
              icon={<CopyStateIcon copied={isCopying} icon={LinkIcon} />}
              onClick={onCopyLink}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Float}
            />
          </Tooltip>
          {actions}
        </div>
        <div ref={nameRef} className="flex items-center gap-1">
          <Typography type={TypographyType.Title2} bold>
            {name}
          </Typography>
          {isPlus && (
            <DevPlusIcon
              className="text-action-plus-default"
              size={IconSize.Size16}
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          {bio && (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
            >
              {bio}
            </Typography>
          )}
          <div className="flex items-center">
            {!!user?.companies?.length && (
              <VerifiedCompanyUserBadge
                size={ProfileImageSize.XSmall}
                user={user}
                showCompanyName
                showVerified={false}
                companyNameTypography={{
                  type: TypographyType.Subhead,
                }}
              />
            )}
            {!!user?.companies?.length && user?.location && (
              <Separator className="text-text-secondary" />
            )}
            {user?.location && (
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Secondary}
              >
                {locationToString(user.location)}
              </Typography>
            )}
          </div>
          <div className="flex items-center">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Secondary}
              translate="no"
            >
              @{username}
            </Typography>
            <Separator className="text-text-secondary" />
            <JoinedDate
              className="text-text-secondary typo-subhead"
              date={new Date(user.createdAt)}
              dateFormat="MMM d. yyyy"
            />
          </div>
          {!isSameUser && (
            <div className="order-last mt-2 tablet:order-none tablet:mt-0">
              <ProfileActions user={user} isPreviewMode={isPreviewMode} />
            </div>
          )}
          <UserStats
            className="mt-2 border-t border-border-subtlest-tertiary pt-4 tablet:mt-0 tablet:w-fit tablet:border-0 tablet:pt-0"
            userId={user.id}
            // The zeros are what UserStats already rendered for a missing
            // count (`stat?.amount || 0`), stated here instead of implied.
            stats={{
              upvotes: 0,
              numFollowers: 0,
              numFollowing: 0,
              ...userStats,
              reputation: user.reputation,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
