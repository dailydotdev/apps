import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useFeatureTheme } from '@dailydotdev/shared/src/hooks/utils/useFeatureTheme';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import { ProfileMenuHeader } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenuHeader';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  AddUserIcon,
  AppIcon,
  BellIcon,
  BlockIcon,
  CardIcon,
  CoinIcon,
  DevCardIcon,
  DocsIcon,
  EditIcon,
  EmbedIcon,
  ExitIcon,
  FeedbackIcon,
  HashtagIcon,
  HotIcon,
  InviteIcon,
  MagicIcon,
  MailIcon,
  MegaphoneIcon,
  NewTabIcon,
  PhoneIcon,
  PrivacyIcon,
  ReputationLightningIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { LogoutReason } from '@dailydotdev/shared/src/lib/user';

import {
  appsUrl,
  businessWebsiteUrl,
  docs,
  feedback,
  reputation,
  walletUrl,
} from '@dailydotdev/shared/src/lib/constants';
import type { ProfileSectionItemProps } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSectionItem';
import { ProfileSection } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSection';

type MenuItems = Record<
  string,
  {
    title: string | null;
    items: Record<string, ProfileSectionItemProps>;
  }
>;

// TODO: make the links actually work
const menuItems: MenuItems = {
  main: {
    title: null,
    items: {
      profile: {
        title: 'Profile Details',
        icon: <UserIcon />,
        href: '/account/profile',
      },
      account: {
        title: 'Account',
        icon: <MailIcon />,
        href: '/account/security',
      },
      appearance: {
        title: 'Appearance',
        icon: <NewTabIcon />,
      },
      notifications: {
        title: 'Notifications',
        icon: <BellIcon />,
        href: '/account/notifications',
      },
      invite: {
        title: 'Invite Friends',
        icon: <InviteIcon />,
        href: '/account/invite',
      },
    },
  },
  billing: {
    title: 'Billing and Monetization',
    items: {
      subscription: {
        title: 'Subscriptions',
        icon: <CardIcon />,
        href: '/account/subscription',
      },
      coreWallet: {
        title: 'Core Wallet',
        icon: <CoinIcon />,
        href: walletUrl,
        showExternalIcon: true,
      },
    },
  },
  feed: {
    title: 'Feed Settings',
    items: {
      general: {
        title: 'General',
        icon: <EditIcon />,
      },
      tags: {
        title: 'Tags',
        icon: <HashtagIcon />,
      },
      sources: {
        title: 'Content sources',
        icon: <AddUserIcon />,
      },
      preferences: {
        title: 'Content preferences',
        icon: <AppIcon />,
      },
      ai: {
        title: 'AI superpowers',
        icon: <MagicIcon />,
      },
      blocked: {
        title: 'Blocked content',
        icon: <BlockIcon />,
      },
    },
  },
  customization: {
    title: 'Customization',
    items: {
      streaks: {
        title: 'Streaks',
        icon: <HotIcon />,
      },
      devcard: {
        title: 'Devcard',
        icon: <DevCardIcon />,
      },
      integrations: {
        title: 'Integrations',
        icon: <EmbedIcon />,
        href: '/account/integrations',
      },
    },
  },
  help: {
    title: 'Help center',
    items: {
      privacy: {
        title: 'Privacy',
        icon: <PrivacyIcon />,
        href: '/account/privacy',
      },
      reputation: {
        title: 'Reputation',
        icon: <ReputationLightningIcon />,
        href: reputation,
        external: true,
      },
      advertise: {
        title: 'Advertise',
        icon: <MegaphoneIcon />,
        href: businessWebsiteUrl,
        external: true,
      },
      apps: {
        title: 'Apps',
        icon: <PhoneIcon />,
        href: appsUrl,
        external: true,
      },
      docs: {
        title: 'Docs',
        icon: <DocsIcon />,
        href: docs,
        external: true,
      },
      support: {
        title: 'Support',
        icon: <FeedbackIcon />,
        href: feedback,
        external: true,
      },
    },
  },
};

function SidebarNav(): ReactElement {
  const { user, logout } = useAuthContext();
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

      <nav className="flex flex-col gap-2">
        {Object.entries(menuItems).map(([key, menuItem]) => (
          <ProfileSection
            key={key}
            withSeparator
            title={menuItem.title}
            items={Object.entries(menuItem.items).map(([, item]) => item)}
          />
        ))}

        <ProfileSection
          items={[
            {
              title: 'Logout',
              icon: <ExitIcon />,
              onClick: () => logout(LogoutReason.ManualLogout),
            },
          ]}
        />
      </nav>
    </aside>
  );
}

export default SidebarNav;
