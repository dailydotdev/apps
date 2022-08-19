import { Provider } from '@dailydotdev/shared/src/components/auth/common';
import ProviderButton from '@dailydotdev/shared/src/components/auth/ProviderButton';
import React, { ReactElement, ReactNode } from 'react';
import AccountContentSection from '../AccountContentSection';

interface AccountLoginSectionProps {
  providers: Provider[];
  title: string;
  description: string;
  providerActionType: string;
  providerAction: (ManageSocialProvidersProps) => void;
  action?: ReactNode;
}

function AccountLoginSection({
  providers,
  title,
  description,
  providerActionType,
  providerAction,
  action,
}: AccountLoginSectionProps): ReactElement {
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
            label="Connect with"
            provider={provider}
            {...rest}
          />
        ))}
        {action}
      </div>
    </AccountContentSection>
  );
}

export default AccountLoginSection;
