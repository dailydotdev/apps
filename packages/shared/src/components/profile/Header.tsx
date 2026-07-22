import type { CSSProperties, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type {
  LoggedUser,
  PublicProfile,
  UserShortProfile,
} from '../../lib/user';
import { BlockIcon, FlagIcon, GiftIcon, JobIcon, SettingsIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import {
  getPathnameWithQuery,
  largeNumberFormat,
  ReferralCampaignKey,
} from '../../lib';
import { ProfileSettingsMenuMobile } from './ProfileSettingsMenu';
import { RootPortal } from '../tooltips/Portal';
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
import { AwardButton } from '../award/AwardButton';
import { BuyCreditsButton } from '../credit/BuyCreditsButton';
import { webappUrl } from '../../lib/constants';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAlertsContext } from '../../contexts/AlertContext';
import { useLogOpportunityNudgeClick } from '../../hooks/log/useLogOpportunityNudgeClick';
import { Bubble } from '../tooltips/utils';
import {
  useCanAwardUser,
  useCanPurchaseCores,
  useHasAccessToCores,
} from '../../hooks/useCoresFeature';
import Link from '../utilities/Link';
import type { MenuItemProps } from '../dropdown/common';
import { ProfileMobileBackButton } from './ProfileBackButton';
import { ProfileShareButton } from './ProfileShareButton';
import { useShareProfileEnabled } from '../../hooks/profile/useShareProfileEnabled';

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
  const { alerts } = useAlertsContext();
  const logOpportunityNudgeClick = useLogOpportunityNudgeClick(
    TargetId.ProfilePage,
  );
  const { openModal } = useLazyModal();
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
  const isShareEnabled = useShareProfileEnabled();

  const onReportUser = React.useCallback(
    (defaultBlocked = false) => {
      openModal({
        type: LazyModal.ReportUser,
        props: {
          offendingUser: {
            id: user.id,
            username: user.username || '',
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
              entityName: user.username || '',
            })
          : block({
              id: user.id,
              entity: ContentPreferenceType.User,
              entityName: user.username || '',
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
        <ProfileMobileBackButton className={!sticky ? 'mr-3' : undefined} />
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
            alwaysShow
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
        {/* Only while pinned: unpinned, the profile card right below owns the
            share control, and two identical copy buttons on one screen read as
            a mistake. `ml-1` keeps this utility icon out of the Follow group. */}
        {isShareEnabled && sticky && (
          <ProfileShareButton
            user={user}
            isSameUser={isSameUser}
            buttonSize={ButtonSize.Small}
            className="ml-1"
          />
        )}
        {!isSameUser && (
          <CustomFeedOptionsMenu
            onAdd={(feedId) =>
              follow({
                id: user.id,
                entity: ContentPreferenceType.User,
                entityName: user.username || '',
                feedId,
              })
            }
            onUndo={(feedId) =>
              unfollow({
                id: user.id,
                entity: ContentPreferenceType.User,
                entityName: user.username || '',
                feedId,
              })
            }
            onCreateNewFeed={() =>
              router.push(
                `/feeds/new?entityId=${user.id}&entityType=${ContentPreferenceType.User}`,
              )
            }
            // Promoted out of the menu into a dedicated control when the
            // share-profile experiment is on.
            shareProps={
              isShareEnabled
                ? undefined
                : {
                    text: `Check out ${user.name}'s profile on daily.dev`,
                    link: user.permalink,
                    cid: ReferralCampaignKey.ShareProfile,
                    logObject: () => ({
                      event_name: LogEvent.ShareProfile,
                      target_id: user.id,
                    }),
                  }
            }
            additionalOptions={options}
          />
        )}
      </div>
      {isSameUser && (
        <>
          <Link
            href={
              alerts?.opportunityId
                ? `${webappUrl}jobs/${alerts.opportunityId}`
                : `${webappUrl}jobs`
            }
            passHref
          >
            <Button
              tag="a"
              className="ml-2 tablet:hidden"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={
                <span className="relative">
                  <JobIcon />
                  {!!alerts?.opportunityId && (
                    <Bubble className="-right-1.5 -top-0.5 !min-h-4 !min-w-4 !rounded-full !bg-accent-bacon-default px-1 !typo-caption2">
                      1
                    </Bubble>
                  )}
                </span>
              }
              onClick={logOpportunityNudgeClick}
              aria-label="Jobs"
            />
          </Link>
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
