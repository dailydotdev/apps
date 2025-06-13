import React from 'react';
import type { ReactNode } from 'react';

import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';

import classed from '@dailydotdev/shared/src/lib/classed';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';

export interface ManageSocialProvidersProps {
  type: ManageSocialProviderTypes;
  provider: string;
}

export type ManageSocialProviderTypes = 'link' | 'unlink';

export enum AccountSecurityDisplay {
  Default = 'default',
  ChangePassword = 'change_password',
  ChangeEmail = 'change_email',
  VerifyEmail = 'verify_email',
  ConnectEmail = 'connect_email',
}

export const AccountPageContent = classed(
  'main',
  'flex flex-col tablet:border border-border-subtlest-tertiary flex-1 rounded-16 h-fit',
);
export const AccountPageSection = classed(
  'section',
  'flex flex-col p-6 w-full overflow-x-hidden',
);
export const AccountPageHeading = classed(
  'h1',
  'flex h-14 w-full flex-row items-center border-b border-border-subtlest-tertiary px-4 font-bold typo-body tablet:px-6 tablet:typo-title3',
);

export const CommonTextField = classed(TextField, { container: 'max-w-sm' });
export const AccountTextField = classed(CommonTextField, { container: 'mt-6' });

type SettingsSwitchProps = {
  name?: string;
  children: ReactNode;
  checked: boolean;
  onToggle: () => void;
};

export const SettingsSwitch = ({
  name,
  children,
  ...props
}: SettingsSwitchProps) => {
  return (
    <div className="flex justify-between gap-4">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="flex-1"
      >
        {children}
      </Typography>
      <Switch
        inputId={`${name}-switch`}
        name={name}
        compact={false}
        {...props}
      />
    </div>
  );
};
