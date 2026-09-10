import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
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
import { ProfileSnapshotButton } from '../../features/snapshot/ProfileSnapshotButton';
import { ProfileSnapshotCard } from '../../features/snapshot/ProfileSnapshotCard';
import {
  profileReadingHistoryQueryOptions,
  sumReadHistory,
} from '../../graphql/users';
import { Tooltip } from '../tooltip/Tooltip';
import { useCopyLink } from '../../hooks/useCopy';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { ReferralCampaignKey } from '../../lib/referral';

import { ElementPlaceholder } from '../ElementPlaceholder';

const ProfileActionsSkeleton = () => (
  <div className="flex h-12 items-center gap-2">
    <ElementPlaceholder className="h-12 w-18 rounded-16" />
    <ElementPlaceholder className="h-12 w-18 rounded-16" />
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

const ProfileCard = forwardRef<HTMLDivElement, { user: PublicProfile }>(
  function ProfileCard({ user }, ref): ReactElement {
    const { tokenRefreshed } = useAuthContext();
    // The widgets column already fetched this, so arming the card is a cache
    // read on the profile page.
    const { data: readingHistory } = useQuery(
      profileReadingHistoryQueryOptions({ user, enabled: tokenRefreshed }),
    );
    const handle = user.username ?? user.id;

    return (
      <ProfileSnapshotCard
        bio={user.bio}
        cover={user.cover}
        handle={`@${handle}`}
        image={user.image}
        joined={format(new Date(user.createdAt), 'MMMM y')}
        name={user.name}
        postsRead={
          readingHistory
            ? sumReadHistory(readingHistory.userReadHistory)
            : undefined
        }
        ref={ref}
        reputation={user.reputation}
        seed={handle}
      />
    );
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
};

const ProfileHeader = ({
  user,
  userStats,
  isSameUser: propIsSameUser,
  isPreviewMode,
  actions,
}: ProfileHeaderProps) => {
  const { name, username, bio, image, cover, isPlus } = user;
  const { user: loggedUser } = useAuthContext();
  const isSameUser = propIsSameUser ?? loggedUser?.id === user.id;
  const { logEvent } = useLogContext();
  const [isCopying, copyLink] = useCopyLink();

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
      link: user.permalink,
      shorten: true,
      cid: ReferralCampaignKey.ShareProfile,
    });
  };

  return (
    <div className="relative w-full overflow-hidden laptop:rounded-t-16">
      <ProfileDesktopPwaBackButton className="absolute left-4 top-4 z-1" />
      <div className="h-36">
        <Image src={cover} alt="Cover" className="h-full w-full object-cover" />
      </div>
      <Image
        src={image}
        fallbackSrc={fallbackImages.avatar}
        alt="Avatar"
        className="absolute left-6 top-16 h-[7.5rem] w-[7.5rem] rounded-16 object-cover"
      />
      <div className="flex flex-col gap-3 px-6">
        {/* Edit leads and `actions` trails, because edit is only hidden, not
            removed: it holds its width so the row keeps its height for a
            visitor. Trailing, that reserved width sat between the actions and
            the right edge and left them looking short of it; leading, it falls
            on the inside and whatever trails stays flush either way. */}
        <div className="mb-4 ml-auto mt-2 flex items-center gap-2">
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
          <ProfileSnapshotButton
            filename={`daily-profile-${username ?? user.id}`}
            origin={Origin.ProfileHeader}
            renderCard={(ref) => <ProfileCard ref={ref} user={user} />}
            // Matches the edit button beside it, which takes Button's default.
            size={ButtonSize.Medium}
            ownerId={user.id}
            variant={ButtonVariant.Float}
          />
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
        <div className="flex items-center gap-1">
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
          {bio && <Typography type={TypographyType.Body}>{bio}</Typography>}
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
            <ProfileActions user={user} isPreviewMode={isPreviewMode} />
          )}
          <UserStats
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
