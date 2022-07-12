import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import ArrowIcon from '@dailydotdev/shared/src/components/icons/Arrow';
import LockIcon from '@dailydotdev/shared/src/components/icons/Lock';
import SettingsIcon from '@dailydotdev/shared/src/components/icons/Settings';
import { ProfilePicture } from '@dailydotdev/shared/src/components/ProfilePicture';
import { pageBorders } from '@dailydotdev/shared/src/components/utilities';
import classed from '@dailydotdev/shared/src/lib/classed';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import React, { ReactElement, ReactNode } from 'react';

interface AccountPageIconProps {
  isActive?: boolean;
  user?: LoggedUser;
}

interface AccountPageProps {
  title: string;
  href: string;
  getIcon: (props: AccountPageIconProps) => ReactNode;
}

export enum AccountPage {
  Profile = 'profile',
  Security = 'security',
  OtherSettings = 'others',
}

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
    getIcon: ({ isActive }) => <LockIcon secondary={isActive} />,
  },
  others: {
    title: 'Other Settings',
    href: '/others',
    getIcon: ({ isActive }) => <SettingsIcon secondary={isActive} />,
  },
};

export const AccountPageContent = classed(
  'div',
  pageBorders,
  'flex flex-col w-full max-w-[40rem] tablet:border-l min-h-screen mr-auto',
);
export const AccountPageSection = classed('section', 'flex flex-col p-6');
export const AccountPageHeading = classed(
  'h1',
  'font-bold typo-title3 py-4 px-6 border-b border-theme-divider-tertiary w-full flex flex-row items-center',
);

export const ContentHeading = classed('h2', 'font-bold typo-headline');
export const ContentText = classed(
  'p',
  'mt-1 typo-callout text-theme-label-tertiary',
);
export const AccountContentHeading = classed(ContentHeading, 'mt-10');
export const CommonTextField = classed(TextField, 'max-w-sm');
export const AccountTextField = classed(CommonTextField, 'mt-6');

interface ClassName {
  container?: string;
  heading?: string;
  section?: string;
}

interface AccountPageContainerProps {
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: ClassName;
  onBack?: () => void;
}

export const AccountPageContainer = ({
  title,
  actions,
  children,
  className = {},
  onBack,
}: AccountPageContainerProps): ReactElement => {
  return (
    <AccountPageContent className={className.container}>
      <AccountPageHeading className={className.heading}>
        {onBack && (
          <Button
            className="mr-2 btn-tertiary"
            icon={<ArrowIcon className="-rotate-90" />}
            onClick={onBack}
          />
        )}
        {title}
        {actions && <span className="flex flex-row ml-auto">{actions}</span>}
      </AccountPageHeading>
      <AccountPageSection className={className.section}>
        {children}
      </AccountPageSection>
    </AccountPageContent>
  );
};
