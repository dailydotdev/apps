import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';

import classed from '@dailydotdev/shared/src/lib/classed';

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
  'font-bold typo-title3 py-[15px] px-6 border-b border-border-subtlest-tertiary w-full flex flex-row items-center',
);

export const CommonTextField = classed(TextField, { container: 'max-w-sm' });
export const AccountTextField = classed(CommonTextField, { container: 'mt-6' });
export const AccountSidebarPagesSection = classed(
  'div',
  'flex flex-col py-4 px-5 gap-3 mt-10 w-full rounded-16 border border-border-subtlest-tertiary',
);
