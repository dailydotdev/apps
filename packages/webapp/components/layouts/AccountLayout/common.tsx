import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import {
  LockIcon,
  BellIcon,
  InviteIcon,
  AppIcon,
  PrivacyIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import classed from '@dailydotdev/shared/src/lib/classed';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { ReactNode } from 'react';
import React from 'react';

export interface ManageSocialProvidersProps {
  type: ManageSocialProviderTypes;
  provider: string;
}

interface AccountPageIconProps {
  isActive?: boolean;
  user?: LoggedUser;
}

interface AccountPageProps {
  title: string;
  href: string;
  getIcon: (props: AccountPageIconProps) => ReactNode;
}

export type ManageSocialProviderTypes = 'link' | 'unlink';

export enum AccountPage {
  Profile = 'profile',
  Security = 'security',
  Notifications = 'notifications',
  Integrations = 'integrations',
  InviteFriends = 'invite',
  Privacy = 'privacy',
}

export enum AccountSecurityDisplay {
  Default = 'default',
  ChangePassword = 'change_password',
  ChangeEmail = 'change_email',
  VerifyEmail = 'verify_email',
  ConnectEmail = 'connect_email',
}

export const accountPage: Record<AccountPage, AccountPageProps> = {
  profile: {
    title: 'Profile',
    href: '/profile',
    getIcon: ({ user }) =>
      user && (
        <ProfilePicture
          user={user}
          size={ProfileImageSize.XSmall}
          rounded="full"
        />
      ),
  },
  security: {
    title: 'Security',
    href: '/security',
    getIcon: ({ isActive }) => (
      <LockIcon
        secondary={isActive}
        className={!isActive && 'text-text-secondary'}
      />
    ),
  },
  notifications: {
    title: 'Notifications',
    href: '/notifications',
    getIcon: ({ isActive }) => (
      <BellIcon
        secondary={isActive}
        className={!isActive && 'text-text-secondary'}
      />
    ),
  },
  integrations: {
    title: 'Integrations',
    href: '/integrations',
    getIcon: ({ isActive }) => (
      <AppIcon
        secondary={isActive}
        className={!isActive && 'text-text-secondary'}
      />
    ),
  },
  invite: {
    title: 'Invite friends',
    href: '/invite',
    getIcon: ({ isActive }) => (
      <InviteIcon
        secondary={isActive}
        className={!isActive && 'text-text-secondary'}
      />
    ),
  },
  privacy: {
    title: 'Privacy',
    href: '/privacy',
    getIcon: ({ isActive }) => (
      <PrivacyIcon
        secondary={isActive}
        className={!isActive && 'text-text-secondary'}
      />
    ),
  },
};

export const AccountPageContent = classed(
  'main',
  'flex flex-col tablet:border border border-border-subtlest-tertiary flex-1 rounded-16 h-fit',
);
export const AccountPageSection = classed(
  'section',
  'flex flex-col p-6 w-full overflow-x-hidden',
);
export const AccountPageHeading = classed(
  'h1',
  'font-bold typo-title3 py-[15px] px-6 border-b border-border-subtlest-tertiary w-full flex flex-row items-center',
);

export const CommonTextField = classed(TextField, { container: 'max-w-sm' });
export const AccountTextField = classed(CommonTextField, { container: 'mt-6' });
export const AccountSidebarPagesSection = classed(
  'div',
  'flex flex-col py-4 px-5 gap-3 mt-10 w-full rounded-16 border border-border-subtlest-tertiary',
);
