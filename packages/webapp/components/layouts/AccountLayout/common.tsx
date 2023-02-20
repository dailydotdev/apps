import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import LockIcon from '@dailydotdev/shared/src/components/icons/Lock';
import SettingsIcon from '@dailydotdev/shared/src/components/icons/Settings';
import { ProfilePicture } from '@dailydotdev/shared/src/components/ProfilePicture';
import { pageBorders } from '@dailydotdev/shared/src/components/utilities';
import classed from '@dailydotdev/shared/src/lib/classed';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import React, { ReactNode } from 'react';
import {
  faq,
  privacyPolicy,
  reportIssue,
  requestFeature,
  termsOfService,
} from '@dailydotdev/shared/src/lib/constants';
import BellIcon from '@dailydotdev/shared/src/components/icons/Bell';

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
  OtherSettings = 'others',
}

export enum AccountSecurityDisplay {
  Default = 'default',
  ChangePassword = 'change_password',
  ChangeEmail = 'change_email',
  ConnectEmail = 'connect_email',
}

interface AccountSidebarPage {
  title: string;
  href: string;
  target: string;
}
export const accountSidebarPages: AccountSidebarPage[] = [
  {
    title: 'FAQ',
    href: faq,
    target: '_blank',
  },
  {
    title: 'Request a feature',
    href: requestFeature,
    target: '_blank',
  },
  {
    title: 'Report an issue',
    href: reportIssue,
    target: '_blank',
  },
  {
    title: 'Privacy policy',
    href: privacyPolicy,
    target: '_blank',
  },
  {
    title: 'Terms of service',
    href: termsOfService,
    target: '_blank',
  },
];

export const accountPage: Record<AccountPage, AccountPageProps> = {
  profile: {
    title: 'Profile',
    href: '/profile',
    getIcon: ({ user }) =>
      user && <ProfilePicture user={user} size="xsmall" rounded="full" />,
  },
  security: {
    title: 'Security',
    href: '/security',
    getIcon: ({ isActive }) => (
      <LockIcon
        secondary={isActive}
        className={!isActive && 'text-theme-label-secondary'}
      />
    ),
  },
  notifications: {
    title: 'Notifications',
    href: '/notifications',
    getIcon: ({ isActive }) => <BellIcon secondary={isActive} />,
  },
  others: {
    title: 'Other Settings',
    href: '/others',
    getIcon: ({ isActive }) => (
      <SettingsIcon
        secondary={isActive}
        className={!isActive && 'text-theme-label-secondary'}
      />
    ),
  },
};

export const AccountPageContent = classed(
  'div',
  pageBorders,
  'flex flex-col w-full laptop:max-w-[calc(100vw-19.75rem)] laptop:max-w-[calc(100vw-36rem)] laptopL:max-w-[40rem] tablet:border-l mr-auto',
);
export const AccountPageSection = classed(
  'section',
  'flex flex-col p-6 w-full overflow-x-hidden',
);
export const AccountPageHeading = classed(
  'h1',
  'font-bold typo-title3 py-4 px-6 border-b border-theme-divider-tertiary w-full flex flex-row items-center',
);

export const CommonTextField = classed(TextField, { container: 'max-w-sm' });
export const AccountTextField = classed(CommonTextField, { container: 'mt-6' });
export const AccountSidebarPagesSection = classed(
  'div',
  'flex flex-col py-4 px-5 gap-3 mt-10 w-full rounded-16 border border-theme-divider-tertiary',
);
