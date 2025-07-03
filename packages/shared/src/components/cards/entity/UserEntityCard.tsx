import React, { useContext } from 'react';
import Link from '../../utilities/Link';
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
import CustomFeedOptionsMenu from '../../CustomFeedOptionsMenu';
import AuthContext from '../../../contexts/AuthContext';
import { ButtonVariant } from '../../buttons/Button';
import EntityDescription from './EntityDescription';
import useUserMenuProps from '../../../hooks/useUserMenuProps';

type Props = {
  user: UserShortProfile;
  className?: {
    container?: string;
  };
};

const UserEntityCard = ({ user, className }: Props) => {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === user.id;
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user?.id,
    entity: ContentPreferenceType.User,
  });
  const { unblock, block } = useContentPreference();
  const blocked = contentPreference?.status === ContentPreferenceStatus.Blocked;
  const { openModal } = useLazyModal();
  const { logSubscriptionEvent } = usePlusSubscription();
  const menuProps = useUserMenuProps({ user });
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
    [user, openModal],
  );
  const { username, bio, name, image, isPlus, createdAt, id, permalink } = user;
  const options: MenuItemProps[] = [
    {
      icon: <BlockIcon />,
      label: `${blocked ? 'Unblock' : 'Block'} ${username}`,
      action: () =>
        blocked
          ? unblock({
              id,
              entity: ContentPreferenceType.User,
              entityName: username,
            })
          : block({
              id,
              entity: ContentPreferenceType.User,
              entityName: username,
            }),
    },
    {
      icon: <FlagIcon />,
      label: 'Report',
      action: () => onReportUser(),
    },
  ];

  if (!blocked && !isPlus && !isSameUser) {
    options.push({
      icon: <GiftIcon />,
      label: 'Gift daily.dev Plus',
      action: () => {
        logSubscriptionEvent({
          event_name: LogEvent.GiftSubscription,
          target_id: TargetId.Cards,
        });
        openModal({
          type: LazyModal.GiftPlus,
          props: { preselected: user },
        });
      },
    });
  }

  return (
    <EntityCard
      permalink={permalink}
      image={image}
      type="user"
      className={{
        image: 'size-16 rounded-20',
        container: className?.container,
      }}
      entityName={username}
      actionButtons={
        !isSameUser && (
          <>
            <CustomFeedOptionsMenu
              buttonVariant={ButtonVariant.Option}
              className={{
                menu: 'z-[9999]',
                button: 'invisible group-hover/menu:visible',
              }}
              {...menuProps}
              additionalOptions={options}
            />
            <FollowButton
              variant={ButtonVariant.Primary}
              entityId={id}
              status={contentPreference?.status}
              showSubscribe={false}
              type={ContentPreferenceType.User}
              entityName={username}
            />
          </>
        )
      }
    >
      <div className="mt-2 flex w-full flex-col gap-3">
        <Link href={permalink}>
          <Typography
            className="flex"
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
          >
            {name ?? username}
            {isPlus && (
              <DevPlusIcon className="ml-1 text-action-plus-default" />
            )}
          </Typography>
        </Link>
        <div className="flex items-center gap-1">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            @{username}
          </Typography>
          <JoinedDate
            className="text-text-quaternary typo-footnote"
            date={new Date(createdAt)}
            dateFormat="MMM d. yyyy"
          />
        </div>
        <div className="flex gap-2 truncate">
          {!!user.reputation && (
            <div className="rounded-8 border border-border-subtlest-tertiary px-2">
              <ReputationUserBadge
                iconProps={{
                  size: IconSize.Small,
                  className: 'text-accent-onion-default',
                }}
                user={user}
              />
            </div>
          )}
          <VerifiedCompanyUserBadge
            size={ProfileImageSize.Small}
            user={user}
            showCompanyName
            showVerified
          />
        </div>
        {bio && <EntityDescription copy={bio} length={100} />}
      </div>
    </EntityCard>
  );
};

export default UserEntityCard;
