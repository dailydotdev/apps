import type { CSSProperties, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type {
  LoggedUser,
  PublicProfile,
  UserShortProfile,
} from '../../lib/user';
import { BlockIcon, FlagIcon, GiftIcon, SettingsIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import {
  getPathnameWithQuery,
  largeNumberFormat,
  ReferralCampaignKey,
} from '../../lib';
import { ProfileSettingsMenuMobile } from './ProfileSettingsMenu';
import { RootPortal } from '../tooltips/Portal';
import { GoBackButton } from '../post/GoBackHeaderMobile';
import { useViewSize, ViewSize } from '../../hooks';
import { FollowButton } from '../contentPreference/FollowButton';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, Origin, TargetId } from '../../lib/log';
import CustomFeedOptionsMenu from '../CustomFeedOptionsMenu';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { MenuIcon } from '../MenuIcon';
import type { MenuItemProps } from '../fields/ContextMenu';
import { AwardButton } from '../award/AwardButton';
import { BuyCreditsButton } from '../credit/BuyCreditsButton';
import { webappUrl } from '../../lib/constants';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  useCanAwardUser,
  useCanPurchaseCores,
  useHasAccessToCores,
} from '../../hooks/useCoresFeature';
import Link from '../utilities/Link';

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
  const { user: loggedUser } = useAuthContext();
  const { openModal } = useLazyModal();
  const isMobile = useViewSize(ViewSize.MobileL);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { follow, unfollow } = useContentPreference();
  const router = useRouter();
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user?.id,
    entity: ContentPreferenceType.User,
  });
  const { unblock, block } = useContentPreference();
  const { logSubscriptionEvent } = usePlusSubscription();
  const canAward = useCanAwardUser({
    sendingUser: loggedUser,
    receivingUser: user as LoggedUser,
  });
  const hasCoresAccess = useHasAccessToCores();
  const canPurchaseCores = useCanPurchaseCores();

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

  const blocked = contentPreference?.status === ContentPreferenceStatus.Blocked;

  const options: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={BlockIcon} />,
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
      icon: <MenuIcon Icon={FlagIcon} />,
      label: 'Report',
      action: () => onReportUser(),
    },
  ];

  if (!blocked && !user.isPlus) {
    options.push({
      icon: <MenuIcon Icon={GiftIcon} />,
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
          <Link href={`${webappUrl}account/profile`}>
            <Button
              tag="a"
              className="hidden laptop:flex"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
            >
              Edit profile
            </Button>
          </Link>
        )}
        {!blocked && (
          <FollowButton
            entityId={user.id}
            type={ContentPreferenceType.User}
            status={contentPreference?.status}
            entityName={`@${user.username}`}
            className="flex-row-reverse"
          />
        )}
        {isSameUser && hasCoresAccess && (
          <BuyCreditsButton
            className="laptop:hidden"
            hideBuyButton={!canPurchaseCores}
            onPlusClick={() => {
              router.push(
                getPathnameWithQuery(
                  `${webappUrl}cores`,
                  new URLSearchParams({
                    origin: Origin.Profile,
                  }),
                ),
              );
            }}
          />
        )}
        {canAward && (
          <AwardButton
            type="USER"
            entity={{
              id: user.id,
              receiver: user,
            }}
            variant={ButtonVariant.Float}
          />
        )}
        {!isSameUser && (
          <CustomFeedOptionsMenu
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
            <ProfileSettingsMenuMobile
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
            />
          </RootPortal>
        </>
      )}
    </header>
  );
}
