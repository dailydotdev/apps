import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import {
  AddUserIcon,
  BellIcon,
  CardIcon,
  EditIcon,
  LockIcon,
  DevCardIcon,
  ExitIcon,
  EmbedIcon,
  DocsIcon,
  TerminalIcon,
  FeedbackIcon,
  AppIcon,
  DevPlusIcon,
  PrivacyIcon,
  MegaphoneIcon,
} from '../icons';
import { NavDrawer } from '../drawers/NavDrawer';
import { businessWebsiteUrl, docs, feedback } from '../../lib/constants';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { anchorDefaultRel } from '../../lib/strings';
import type { NavItemProps } from '../drawers/NavDrawerItem';
import { LogoutReason } from '../../lib/user';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePrompt } from '../../hooks/usePrompt';
import { ButtonColor } from '../buttons/Button';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../lib/log';
import { GooglePlayIcon } from '../icons/Google/Play';
import { checkIsBrowser, isIOSNative, UserAgent } from '../../lib/func';
import { useConditionalFeature } from '../../hooks';
import {
  featureOnboardingAndroid,
  featurePlusCtaCopy,
} from '../../lib/featureManagement';
import { SubscriptionProvider } from '../../lib/plus';
import { postWebKitMessage, WebKitMessageHandlers } from '../../lib/ios';

const useMenuItems = (): NavItemProps[] => {
  const { logout, isAndroidApp, user } = useAuthContext();
  const { openModal } = useLazyModal();
  const { showPrompt } = usePrompt();
  const { isPlus, plusProvider, logSubscriptionEvent, plusHref } =
    usePlusSubscription();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });
  const { value: appExperiment } = useConditionalFeature({
    feature: featureOnboardingAndroid,
    shouldEvaluate: checkIsBrowser(UserAgent.Android) && !isAndroidApp,
  });

  const onLogout = useCallback(async () => {
    const shouldLogout = await showPrompt({
      title: 'Are you sure?',
      className: { buttons: 'mt-5 flex-col-reverse' },
      okButton: { title: 'Logout', color: ButtonColor.Ketchup },
    });

    if (shouldLogout) {
      logout(LogoutReason.ManualLogout);
    }
  }, [logout, showPrompt]);

  return useMemo(() => {
    const downloadAndroidApp = appExperiment
      ? {
          label: 'Download mobile app',
          icon: <GooglePlayIcon />,
          href: process.env.NEXT_PUBLIC_ANDROID_APP,
          target: '_blank',
          rel: anchorDefaultRel,
        }
      : undefined;

    const items: NavItemProps[] = [
      {
        label: 'Profile',
        isHeader: true,
      },
      { label: 'Edit profile', icon: <EditIcon />, href: '/account/profile' },
    ];

    if (
      !isIOSNative() ||
      (isIOSNative() && user.isTeamMember)
      // iOSSupportsPlusPurchase()
    ) {
      items.push({
        label: isPlus ? 'Manage plus' : plusCta,
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
      });
    }

    return [
      ...items,
      {
        label: 'Invite friends',
        icon: <AddUserIcon />,
        href: '/account/invite',
      },
      { label: 'Devcard', icon: <DevCardIcon />, href: '/devcard' },
      { label: 'Privacy', icon: <PrivacyIcon />, href: '/account/privacy' },
      {
        label: 'Logout',
        icon: <ExitIcon />,
        onClick: onLogout,
      },
      {
        label: 'Manage',
        isHeader: true,
      },
      {
        label: 'Customize',
        icon: <CardIcon />,
        onClick: () => openModal({ type: LazyModal.UserSettings }),
      },
      { label: 'Security', icon: <LockIcon />, href: '/account/security' },
      {
        label: 'Notifications',
        icon: <BellIcon />,
        href: '/account/notifications',
      },
      {
        label: 'Integrations',
        icon: <AppIcon />,
        href: '/account/integrations',
      },
      {
        label: 'Contribute',
        isHeader: true,
      },
      {
        label: 'Community picks',
        icon: <DocsIcon />,
        onClick: () => openModal({ type: LazyModal.SubmitArticle }),
      },
      {
        label: 'Suggest new source',
        icon: <EmbedIcon />,
        onClick: () => openModal({ type: LazyModal.NewSource }),
      },
      {
        label: 'Support',
        isHeader: true,
      },
      {
        label: 'Advertise',
        href: businessWebsiteUrl,
        icon: <MegaphoneIcon />,
        target: '_blank',
        rel: anchorDefaultRel,
      },
      downloadAndroidApp,
      {
        label: 'Docs',
        icon: <DocsIcon />,
        href: docs,
        target: '_blank',
        rel: anchorDefaultRel,
      },
      {
        label: 'Changelog',
        icon: <TerminalIcon />,
        href: '/sources/daily_updates',
      },
      {
        label: 'Feedback',
        icon: <FeedbackIcon />,
        href: feedback,
        target: '_blank',
        rel: anchorDefaultRel,
      },
    ].filter(Boolean);
  }, [
    appExperiment,
    isPlus,
    logSubscriptionEvent,
    onLogout,
    openModal,
    plusCta,
    plusHref,
    plusProvider,
    user.isTeamMember,
  ]);
};

interface ProfileSettingsMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  shouldKeepOpen?: boolean;
}

export function ProfileSettingsMenu({
  isOpen,
  onClose,
  shouldKeepOpen,
}: ProfileSettingsMenuProps): ReactElement {
  return (
    <NavDrawer
      header="Settings"
      shouldKeepOpen={shouldKeepOpen}
      drawerProps={{
        isOpen,
        onClose,
      }}
      items={useMenuItems()}
    />
  );
}

export default ProfileSettingsMenu;
