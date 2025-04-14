import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  InviteIcon,
  UserIcon,
  DevCardIcon,
  SettingsIcon,
  ReputationLightningIcon,
  ExitIcon,
  PlayIcon,
  PauseIcon,
  EditIcon,
  DevPlusIcon,
  PrivacyIcon,
} from '../icons';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import type { AllowedTags, ButtonProps } from '../buttons/Button';
import { Button } from '../buttons/Button';
import { reputation, webappUrl } from '../../lib/constants';
import { UserMetadata } from '../profile/UserMetadata';
import { anchorDefaultRel } from '../../lib/strings';
import { LogoutReason } from '../../lib/user';
import { useLazyModal } from '../../hooks/useLazyModal';
import { checkIsExtension, isIOSNative } from '../../lib/func';
import { useDndContext } from '../../contexts/DndContext';
import { LazyModal } from '../modals/common/types';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../lib/log';
import { featurePlusCtaCopy } from '../../lib/featureManagement';
import { GiftIcon } from '../icons/gift';
import { useConditionalFeature } from '../../hooks';
import { SubscriptionProvider } from '../../lib/plus';
import { postWebKitMessage, WebKitMessageHandlers } from '../../lib/ios';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { PlusUser } from '../PlusUser';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { ProfileMenuFooter } from './ProfileMenuFooter';

interface ListItem {
  title: string;
  buttonProps?: ButtonProps<AllowedTags>;
  rightEmoji?: string;
}

interface ProfileMenuProps {
  onClose: () => void;
}

export default function ProfileMenu({
  onClose,
}: ProfileMenuProps): ReactElement {
  const { openModal } = useLazyModal();
  const { user, logout, isValidRegion: isPlusAvailable } = useAuthContext();
  const { isActive: isDndActive, setShowDnd } = useDndContext();
  const { isPlus, logSubscriptionEvent, plusHref, plusProvider } =
    usePlusSubscription();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });

  const items: ListItem[] = useMemo(() => {
    const list: ListItem[] = [
      {
        title: 'Profile',
        buttonProps: {
          tag: 'a',
          href: user.permalink,
          icon: <UserIcon />,
        },
      },
    ];

    list.push({
      title: isPlus ? 'Manage plus' : plusCta,
      buttonProps: {
        tag: 'a',
        icon: <DevPlusIcon />,
        href: plusHref,
        className: isPlus ? undefined : 'text-action-plus-default',
        target:
          isPlus && plusProvider === SubscriptionProvider.Paddle
            ? '_blank'
            : undefined,
        onClick: () => {
          if (
            isPlus &&
            isIOSNative() &&
            plusProvider === SubscriptionProvider.AppleStoreKit
          ) {
            postWebKitMessage(
              WebKitMessageHandlers.IAPSubscriptionManage,
              null,
            );
          }

          logSubscriptionEvent({
            event_name: isPlus
              ? LogEvent.ManageSubscription
              : LogEvent.UpgradeSubscription,
            target_id: TargetId.ProfileDropdown,
          });
        },
      },
    });

    list.push(
      {
        title: 'Account details',
        buttonProps: {
          tag: 'a',
          icon: <EditIcon />,
          href: `${webappUrl}account/profile`,
        },
      },
      {
        title: 'Reputation',
        buttonProps: {
          tag: 'a',
          icon: <ReputationLightningIcon />,
          href: reputation,
          target: '_blank',
          rel: anchorDefaultRel,
        },
      },
      {
        title: 'Devcard',
        buttonProps: {
          tag: 'a',
          icon: <DevCardIcon />,
          href: `${webappUrl}devcard`,
        },
      },
      {
        title: 'Invite friends',
        buttonProps: {
          tag: 'a',
          icon: <InviteIcon />,
          href: `${webappUrl}account/invite`,
        },
      },
    );

    if (checkIsExtension()) {
      const DndIcon = isDndActive ? PlayIcon : PauseIcon;
      list.push({
        title: 'Pause new tab',
        buttonProps: {
          icon: <DndIcon />,
          onClick: () => setShowDnd(true),
        },
      });
    }

    list.push(
      {
        title: 'Customize',
        buttonProps: {
          icon: <SettingsIcon />,
          onClick: () => openModal({ type: LazyModal.UserSettings }),
        },
      },
      {
        title: 'Privacy',
        buttonProps: {
          tag: 'a',
          icon: <PrivacyIcon />,
          href: `${webappUrl}account/privacy`,
        },
      },
    );

    if (isPlusAvailable) {
      list.push({
        title: 'Gift daily.dev Plus',
        buttonProps: {
          icon: <GiftIcon />,
          onClick: () => {
            logSubscriptionEvent({
              event_name: LogEvent.GiftSubscription,
              target_id: TargetId.ProfileDropdown,
            });
            openModal({ type: LazyModal.GiftPlus });
          },
        },
      });
    }

    list.push({
      title: 'Logout',
      buttonProps: {
        icon: <ExitIcon />,
        onClick: () => logout(LogoutReason.ManualLogout),
      },
    });

    return list.filter(Boolean);
  }, [
    user.permalink,
    isPlus,
    plusCta,
    plusHref,
    plusProvider,
    isPlusAvailable,
    logSubscriptionEvent,
    isDndActive,
    setShowDnd,
    openModal,
    logout,
  ]);

  if (!user) {
    return <></>;
  }

  return (
    <InteractivePopup
      onClose={onClose}
      closeOutsideClick
      position={InteractivePopupPosition.ProfileMenu}
      className="flex w-full max-w-64 flex-col gap-3 !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
    >
      <div className="flex gap-2">
        <ProfilePicture
          user={user}
          nativeLazyLoading
          eager
          size={ProfileImageSize.Large}
          className="!rounded-10 border-background-default"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Primary}
              bold
              truncate
              className="min-w-0"
            >
              {user.name}
              {user.name}
            </Typography>
            {isPlus && <PlusUser withText={false} />}
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            truncate
          >
            @{user.username}
          </Typography>
        </div>
      </div>
      <UserMetadata
        username={user.username}
        name={user.name}
        createdAt={user.createdAt}
        reputation={user.reputation}
        isPlus={isPlus}
        className="gap-2 p-4"
      />
      <div className="flex flex-col border-t border-border-subtlest-tertiary py-2">
        {items.map(({ title, buttonProps, rightEmoji }) => (
          <Button
            key={title}
            {...buttonProps}
            className={classNames(
              'btn-tertiary w-full !justify-start !px-5 font-normal',
              buttonProps?.className,
            )}
          >
            {title}

            {rightEmoji && <span className="ml-auto">{rightEmoji}</span>}
          </Button>
        ))}
      </div>

      <ProfileMenuFooter />
    </InteractivePopup>
  );
}
