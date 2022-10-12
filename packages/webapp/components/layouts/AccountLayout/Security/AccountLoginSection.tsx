import { Provider } from '@dailydotdev/shared/src/components/auth/common';
import ProviderButton from '@dailydotdev/shared/src/components/auth/ProviderButton';
import React, { ReactElement, ReactNode } from 'react';
import AccountContentSection from '../AccountContentSection';
import {
  ManageSocialProviderTypes,
  ManageSocialProvidersProps,
} from '../common';

interface AccountLoginSectionProps {
  providers: Provider[];
  title: string;
  description: string;
  providerActionType: ManageSocialProviderTypes;
  providerAction: (props: ManageSocialProvidersProps) => void;
  children?: ReactNode;
}

const providerLabel = {
  link: 'Connect with',
  unlink: 'Remove',
};

function AccountLoginSection({
  providers,
  title,
  description,
  providerActionType,
  providerAction,
  children,
}: AccountLoginSectionProps): ReactElement {
  if (!providers?.length) {
    return null;
  }

  return (
    <AccountContentSection title={title} description={description}>
      <div className="grid grid-cols-1 gap-4 mt-6 w-64">
        {providers.map(({ provider, ...rest }) => (
          <ProviderButton
            key={provider}
            onClick={() =>
              providerAction({
                type: providerActionType,
                provider: provider.toLowerCase(),
              })
            }
            label={providerLabel[providerActionType]}
            provider={provider}
            {...rest}
          />
        ))}
        {children}
      </div>
    </AccountContentSection>
  );
}

export default AccountLoginSection;
