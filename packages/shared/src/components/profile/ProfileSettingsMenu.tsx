import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  AddUserIcon,
  BellIcon,
  EditIcon,
  DevCardIcon,
  EmbedIcon,
  DocsIcon,
  FeedbackIcon,
  AppIcon,
  PrivacyIcon,
  MegaphoneIcon,
  UserIcon,
  BlockIcon,
  CoinIcon,
  CreditCardIcon,
  HashtagIcon,
  HotIcon,
  InviteIcon,
  MagicIcon,
  MailIcon,
  EyeIcon,
  NewTabIcon,
  PhoneIcon,
  ReputationLightningIcon,
  ExitIcon,
  OrganizationIcon,
  TrendingIcon,
  JobIcon,
  TerminalIcon,
  TourIcon,
  FeatherIcon,
  JoystickIcon,
} from '../icons';
import { NavDrawer } from '../drawers/NavDrawer';
import {
  appsUrl,
  businessWebsiteUrl,
  docs,
  reputation,
  settingsUrl,
  walletUrl,
  webappUrl,
} from '../../lib/constants';

import type {
  ProfileSectionItemProps,
  ProfileSectionItemPropsWithoutHref,
} from '../ProfileMenu/ProfileSectionItem';
import { ProfileSection } from '../ProfileMenu/ProfileSection';
import { LogoutReason } from '../../lib/user';
import { logout, useAuthContext } from '../../contexts/AuthContext';
import type { WithClassNameProps } from '../utilities';
import { HorizontalSeparator } from '../utilities';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { ProfileMenuHeader } from '../ProfileMenu/ProfileMenuHeader';
import { ProfileImageSize } from '../ProfilePicture';
import { useViewSize, ViewSize } from '../../hooks';
import { TypographyColor, TypographyType } from '../typography/Typography';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetId } from '../../lib/log';
import { VolunteeringIcon } from '../icons/Volunteering';
import { GraduationIcon } from '../icons/Graduation';
import { MedalBadgeIcon } from '../icons/MedalBadge';
import { MedalIcon } from '../icons/Medal';
import { questsFeature } from '../../lib/featureManagement';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';

type MenuItems = Record<
  string,
  {
    title: string | null;
    items: Record<string, ProfileSectionItemProps>;
  }
>;

const defineMenuItems = <T extends MenuItems>(items: T): T => items;

const useAccountPageItems = ({ onClose }: { onClose?: () => void } = {}) => {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();

  const { value: isQuestsFeatureEnabled } = useConditionalFeature({
    feature: questsFeature,
    shouldEvaluate: !!user,
  });

  const items = useMemo(
    () =>
      defineMenuItems({
        main: {
          title: null,
          items: {
            profile: {
              title: 'Profile details',
              icon: UserIcon,
              href: `${settingsUrl}/profile`,
            },
            account: {
              title: 'Account & Security',
              icon: MailIcon,
              href: `${settingsUrl}/security`,
            },
            notifications: {
              title: 'Notifications',
              icon: BellIcon,
              href: `${settingsUrl}/notifications`,
            },
            'job-preferences': {
              title: 'Job preferences',
              icon: JobIcon,
              href: `${settingsUrl}/job-preferences`,
              onClick: () => {
                logEvent({
                  event_name: LogEvent.ClickCandidatePreferences,
                  target_id: TargetId.ProfileSettingsMenu,
                });
              },
            },
            appearance: {
              title: 'Appearance',
              icon: NewTabIcon,
              href: `${settingsUrl}/appearance`,
            },
            composition: {
              title: 'Posting',
              icon: FeatherIcon,
              href: `${settingsUrl}/composition`,
            },
            invite: {
              title: 'Invite Friends',
              icon: InviteIcon,
              href: `${settingsUrl}/invite`,
            },
            // TODO: Re-enable when ready
            // coupons: {
            //   title: 'Coupons',
            //   icon: GiftIcon,
            //   href: `${settingsUrl}/coupons`,
            // },
          },
        },
        feed: {
          title: 'Feed settings',
          items: {
            general: {
              title: 'General',
              icon: EditIcon,
              href: `${settingsUrl}/feed/general`,
            },
            tags: {
              title: 'Tags',
              icon: HashtagIcon,
              href: `${settingsUrl}/feed/tags`,
            },
            sources: {
              title: 'Content sources',
              icon: AddUserIcon,
              href: `${settingsUrl}/feed/sources`,
            },
            preferences: {
              title: 'Content preferences',
              icon: AppIcon,
              href: `${settingsUrl}/feed/preferences`,
            },
            ai: {
              title: 'AI superpowers',
              icon: MagicIcon,
              href: `${settingsUrl}/feed/ai`,
            },
            blocked: {
              title: 'Blocked content',
              icon: BlockIcon,
              href: `${settingsUrl}/feed/blocked`,
            },
          },
        },
        career: {
          title: 'Career',
          items: {
            work: {
              title: 'Work Experience',
              icon: JobIcon,
              href: `${settingsUrl}/profile/experience/work`,
            },
            education: {
              title: 'Education',
              icon: GraduationIcon,
              href: `${settingsUrl}/profile/experience/education`,
            },
            certification: {
              title: 'Certifications',
              icon: MedalIcon,
              href: `${settingsUrl}/profile/experience/certification`,
            },
            openSource: {
              title: 'Open Source',
              icon: TerminalIcon,
              href: `${settingsUrl}/profile/experience/opensource`,
            },
            project: {
              title: 'Projects & Publications',
              icon: TourIcon,
              href: `${settingsUrl}/profile/experience/project`,
            },
            volunteering: {
              title: 'Volunteering',
              icon: VolunteeringIcon,
              href: `${settingsUrl}/profile/experience/volunteering`,
            },
          },
        },
        playground: {
          title: 'Gamification',
          items: {
            gameCenter: {
              title: 'Game Center',
              icon: JoystickIcon,
              href: `${webappUrl}game-center`,
              external: true,
            },
            gamification: {
              title: 'Feature visibility',
              icon: EyeIcon,
              href: `${settingsUrl}/customization/gamification`,
            },
            streaks: {
              title: 'Streaks',
              icon: HotIcon,
              href: `${settingsUrl}/customization/streaks`,
            },
            achievements: {
              title: 'Achievements',
              icon: MedalBadgeIcon,
              href: `${webappUrl}${user?.username}/achievements`,
              external: true,
            },
            hotTakes: {
              title: 'Hot Takes',
              icon: HotIcon,
              href: `${webappUrl}?openModal=hottakes`,
              external: true,
              onClick: () => {
                logEvent({ event_name: LogEvent.OpenHotAndCold });
                onClose?.();
              },
            },
            devcard: {
              title: 'DevCard',
              icon: DevCardIcon,
              href: `${settingsUrl}/customization/devcard`,
            },
          },
        },
        customization: {
          title: 'Developers',
          items: {
            api: {
              title: 'API Access',
              icon: TerminalIcon,
              href: `${settingsUrl}/api`,
            },
            integrations: {
              title: 'Integrations',
              icon: EmbedIcon,
              href: `${settingsUrl}/customization/integrations`,
            },
          },
        },
        billing: {
          title: 'Billing and Monetization',
          items: {
            subscription: {
              title: 'Subscriptions',
              icon: CreditCardIcon,
              href: `${settingsUrl}/subscription`,
            },
            organization: {
              title: 'Organizations',
              icon: OrganizationIcon,
              href: `${settingsUrl}/organization`,
            },
            coreWallet: {
              title: 'Core Wallet',
              icon: CoinIcon,
              href: walletUrl,
              external: true,
            },
            adsDashboard: {
              title: 'Ads dashboard',
              icon: TrendingIcon,
              onClick: () => openModal({ type: LazyModal.AdsDashboard }),
            } as ProfileSectionItemPropsWithoutHref,
          },
        },
        help: {
          title: 'Help center',
          items: {
            feedback: {
              title: 'Your Feedback',
              icon: FeedbackIcon,
              href: `${settingsUrl}/feedback`,
            },
            privacy: {
              title: 'Privacy',
              icon: PrivacyIcon,
              href: `${settingsUrl}/privacy`,
            },
            reputation: {
              title: 'Reputation',
              icon: ReputationLightningIcon,
              href: reputation,
              external: true,
            },
            advertise: {
              title: 'Advertise',
              icon: MegaphoneIcon,
              href: businessWebsiteUrl,
              external: true,
            },
            apps: {
              title: 'Apps',
              icon: PhoneIcon,
              href: appsUrl,
              external: true,
            },
            docs: {
              title: 'Docs',
              icon: DocsIcon,
              href: docs,
              external: true,
            },
          },
        },
        logout: {
          title: null,
          items: {
            logout: {
              title: 'Log out',
              icon: ExitIcon,
              onClick: () => logout(LogoutReason.ManualLogout),
            },
          },
        },
      }),
    [logEvent, onClose, openModal, user?.username],
  );

  return { items, isQuestsFeatureEnabled };
};

interface ProfileSettingsMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  shouldKeepOpen?: boolean;
}

export const InnerProfileSettingsMenu = ({
  className,
  onClose,
}: WithClassNameProps & { onClose?: () => void }) => {
  const { asPath } = useRouter();
  const isMobile = useViewSize(ViewSize.MobileL);
  const hasAccessToCores = useHasAccessToCores();
  const { items: accountPageItems, isQuestsFeatureEnabled } =
    useAccountPageItems({ onClose });

  return (
    <nav className={classNames('flex flex-col gap-2', className)}>
      {Object.entries(accountPageItems).map(([key, menuItem], index, arr) => {
        const lastItem = index === arr.length - 1;

        return (
          <ProfileSection
            key={key}
            withSeparator={!lastItem}
            title={menuItem.title ?? undefined}
            items={Object.entries(menuItem.items)
              .filter(([itemKey, item]) => {
                if (item.href === walletUrl && !hasAccessToCores) {
                  return false;
                }

                if (
                  itemKey === 'gamification' &&
                  isQuestsFeatureEnabled !== true
                ) {
                  return false;
                }

                if (
                  itemKey === 'gameCenter' &&
                  isQuestsFeatureEnabled !== true
                ) {
                  return false;
                }

                return true;
              })
              .map(([, item]: [string, ProfileSectionItemProps]) => {
                return {
                  ...item,
                  isActive: asPath === item.href,
                  ...(isMobile && {
                    typography: {
                      type: TypographyType.Body,
                      color: TypographyColor.Secondary,
                    },
                  }),
                };
              })}
          />
        );
      })}
    </nav>
  );
};

export function ProfileSettingsMenuMobile({
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
        onClose: onClose ?? (() => {}),
      }}
    >
      <InnerProfileSettingsMenu className="p-4" onClose={onClose} />
    </NavDrawer>
  );
}

export function ProfileSettingsMenuDesktop(): ReactElement | null {
  const { user } = useAuthContext();
  const featureTheme = useFeatureTheme();

  if (!user) {
    return null;
  }

  return (
    <aside
      className={classNames(
        'ml-auto flex min-h-full flex-col gap-2 self-start rounded-16 border border-border-subtlest-tertiary p-2 tablet:w-64',
        featureTheme ? 'bg-transparent' : undefined,
      )}
    >
      <ProfileMenuHeader
        className="rounded-10 px-1 hover:bg-theme-active"
        shouldOpenProfile
        profileImageSize={ProfileImageSize.Medium}
      />

      <HorizontalSeparator />

      <InnerProfileSettingsMenu />
    </aside>
  );
}
