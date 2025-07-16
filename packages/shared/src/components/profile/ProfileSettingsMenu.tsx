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
  NewTabIcon,
  PhoneIcon,
  ReputationLightningIcon,
  ExitIcon,
  OrganizationIcon,
  TrendingIcon,
} from '../icons';
import { NavDrawer } from '../drawers/NavDrawer';
import {
  appsUrl,
  businessWebsiteUrl,
  docs,
  feedback,
  reputation,
  settingsUrl,
  walletUrl,
} from '../../lib/constants';

import type { ProfileSectionItemProps } from '../ProfileMenu/ProfileSectionItem';
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

type MenuItems = Record<
  string,
  {
    title: string | null;
    items: Record<string, ProfileSectionItemProps>;
  }
>;

const defineMenuItems = <T extends MenuItems>(items: T): T => items;

const useAccountPageItems = () => {
  const { openModal } = useLazyModal();

  return useMemo(
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
              title: 'Account',
              icon: MailIcon,
              href: `${settingsUrl}/security`,
            },
            appearance: {
              title: 'Appearance',
              icon: NewTabIcon,
              href: `${settingsUrl}/appearance`,
            },
            notifications: {
              title: 'Notifications',
              icon: BellIcon,
              href: `${settingsUrl}/notifications`,
            },
            invite: {
              title: 'Invite Friends',
              icon: InviteIcon,
              href: `${settingsUrl}/invite`,
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
              href: walletUrl,
              onClick: () => openModal({ type: LazyModal.AdsDashboard }),
            },
          },
        },
        feed: {
          title: 'Feed Settings',
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
        customization: {
          title: 'Customization',
          items: {
            streaks: {
              title: 'Streaks',
              icon: HotIcon,
              href: `${settingsUrl}/customization/streaks`,
            },
            devcard: {
              title: 'DevCard',
              icon: DevCardIcon,
              href: `${settingsUrl}/customization/devcard`,
            },
            integrations: {
              title: 'Integrations',
              icon: EmbedIcon,
              href: `${settingsUrl}/customization/integrations`,
            },
          },
        },
        help: {
          title: 'Help center',
          items: {
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
            support: {
              title: 'Support',
              icon: FeedbackIcon,
              href: feedback,
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
    [openModal],
  );
};

interface ProfileSettingsMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  shouldKeepOpen?: boolean;
}

export const InnerProfileSettingsMenu = ({ className }: WithClassNameProps) => {
  const { asPath } = useRouter();
  const isMobile = useViewSize(ViewSize.MobileL);
  const hasAccessToCores = useHasAccessToCores();
  const accountPageItems = useAccountPageItems();

  return (
    <nav className={classNames('flex flex-col gap-2', className)}>
      {Object.entries(accountPageItems).map(([key, menuItem], index, arr) => {
        const lastItem = index === arr.length - 1;

        return (
          <ProfileSection
            key={key}
            withSeparator={!lastItem}
            title={menuItem.title}
            items={Object.entries(menuItem.items)
              .filter(([, item]) => {
                if (item.href === walletUrl && !hasAccessToCores) {
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
        onClose,
      }}
    >
      <InnerProfileSettingsMenu className="p-4" />
    </NavDrawer>
  );
}

export function ProfileSettingsMenuDesktop(): ReactElement {
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
