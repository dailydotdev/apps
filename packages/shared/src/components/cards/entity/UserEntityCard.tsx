import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import type { UserShortProfile } from '../../../lib/user';
import EntityCard from './EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { BlockIcon, DevPlusIcon, FlagIcon, GiftIcon } from '../../icons';
import { VerifiedCompanyUserBadge } from '../../VerifiedCompanyUserBadge';
import { ProfileImageSize } from '../../ProfilePicture';
import { ReputationUserBadge } from '../../ReputationUserBadge';
import { IconSize } from '../../Icon';
import JoinedDate from '../../profile/JoinedDate';
import { FollowButton } from '../../contentPreference/FollowButton';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';
import type { MenuItemProps } from '../../fields/ContextMenu';
import { useContentPreferenceStatusQuery } from '../../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import { LazyModal } from '../../modals/common/types';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../../lib/log';
import { ReferralCampaignKey } from '../../../lib/referral';
import CustomFeedOptionsMenu from '../../CustomFeedOptionsMenu';
import AuthContext from '../../../contexts/AuthContext';
import { ButtonVariant } from '../../buttons/Button';

type Props = {
  user: UserShortProfile;
};

const UserEntityCard = ({ user }: Props) => {
  const router = useRouter();
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === user.id;
  const { follow, unfollow } = useContentPreference();
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user?.id,
    entity: ContentPreferenceType.User,
  });
  const { unblock, block } = useContentPreference();
  const blocked = contentPreference?.status === ContentPreferenceStatus.Blocked;
  const { openModal } = useLazyModal();
  const { logSubscriptionEvent } = usePlusSubscription();
  const onReportUser = React.useCallback(
    (defaultBlocked = false) => {
      openModal({
        type: LazyModal.ReportUser,
        props: {
          offendingUser: {
            id: user.id,
            username: user.username,
          },
          defaultBlockUser: defaultBlocked,
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const options: MenuItemProps[] = [
    {
      icon: <BlockIcon />,
      label: `${blocked ? 'Unblock' : 'Block'} ${user.username}`,
      action: () =>
        blocked
          ? unblock({
              id: user.id,
              entity: ContentPreferenceType.User,
              entityName: user.username,
            })
          : block({
              id: user.id,
              entity: ContentPreferenceType.User,
              entityName: user.username,
            }),
    },
    {
      icon: <FlagIcon />,
      label: 'Report',
      action: () => onReportUser(),
    },
  ];

  if (!blocked && !user.isPlus && !isSameUser) {
    options.push({
      icon: <GiftIcon />,
      label: 'Gift daily.dev Plus',
      action: () => {
        logSubscriptionEvent({
          event_name: LogEvent.GiftSubscription,
          target_id: TargetId.ProfilePage,
        });
        openModal({
          type: LazyModal.GiftPlus,
          props: { preselected: user as UserShortProfile },
        });
      },
    });
  }

  return (
    <EntityCard
      image={user.image}
      type="user"
      className={{
        image: 'size-16 rounded-20',
      }}
      entityName={user.username}
      actionButtons={
        !isSameUser && (
          <>
            <CustomFeedOptionsMenu
              className={{
                button: 'bg-background-popover',
                menu: 'z-[9999]',
              }}
              onAdd={(feedId) =>
                follow({
                  id: user.id,
                  entity: ContentPreferenceType.User,
                  entityName: user.username,
                  feedId,
                })
              }
              onUndo={(feedId) =>
                unfollow({
                  id: user.id,
                  entity: ContentPreferenceType.User,
                  entityName: user.username,
                  feedId,
                })
              }
              onCreateNewFeed={() =>
                router.push(
                  `/feeds/new?entityId=${user.id}&entityType=${ContentPreferenceType.User}`,
                )
              }
              shareProps={{
                text: `Check out ${user.name}'s profile on daily.dev`,
                link: user.permalink,
                cid: ReferralCampaignKey.ShareProfile,
                logObject: () => ({
                  event_name: LogEvent.ShareProfile,
                  target_id: user.id,
                }),
              }}
              additionalOptions={options}
            />
            <FollowButton
              variant={ButtonVariant.Primary}
              entityId={user.id}
              status={contentPreference?.status}
              showSubscribe={false}
              type={ContentPreferenceType.User}
              entityName={user.username}
            />
          </>
        )
      }
    >
      <div className="mt-2 flex w-full flex-col gap-3">
        <Typography
          className="flex"
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          {user.name ?? user.username}
          {user.isPlus && (
            <DevPlusIcon className="ml-1 text-action-plus-default" />
          )}
        </Typography>
        <div className="flex items-center gap-1">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            @{user.username}
          </Typography>
          <JoinedDate
            className="text-text-quaternary typo-footnote"
            date={new Date(user.createdAt)}
            dateFormat="MMM d. yyyy"
          />
        </div>
        <div className="flex gap-2 truncate">
          <div className="rounded-8 border border-border-subtlest-tertiary px-2">
            <ReputationUserBadge
              iconProps={{
                size: IconSize.Small,
                className: 'text-accent-onion-default',
              }}
              user={user}
            />
          </div>
          <VerifiedCompanyUserBadge
            size={ProfileImageSize.Small}
            user={user}
            showCompanyName
            showVerified
          />
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {user.bio}
        </Typography>
      </div>
    </EntityCard>
  );
};

export default UserEntityCard;
