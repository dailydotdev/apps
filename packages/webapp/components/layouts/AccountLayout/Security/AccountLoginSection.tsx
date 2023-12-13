import { Provider } from '@dailydotdev/shared/src/components/auth/common';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import AccountContentSection from '../AccountContentSection';
import {
  ManageSocialProviderTypes,
  ManageSocialProvidersProps,
} from '../common';

interface ClassName {
  container?: string;
  button?: string;
}

interface AccountLoginSectionProps {
  providers: Provider[];
  title: string;
  description: string;
  providerActionType: ManageSocialProviderTypes;
  providerAction: (props: ManageSocialProvidersProps) => void;
  children?: ReactNode;
  className?: ClassName;
  variant: ButtonVariant;
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
  className,
  variant = ButtonVariant.Primary,
}: AccountLoginSectionProps): ReactElement {
  if (!providers?.length) {
    return null;
  }

  return (
    <AccountContentSection title={title} description={description}>
      <div
        className={classNames(
          'grid grid-cols-1 gap-4 mt-6 w-64',
          className?.container,
        )}
      >
        {providers.map(({ label, value, icon }) => (
          <Button
            key={value}
            icon={icon}
            className={className?.button}
            variant={variant}
            onClick={() =>
              providerAction({
                type: providerActionType,
                provider: value,
              })
            }
          >
            {providerLabel[providerActionType]} {label}
          </Button>
        ))}
        {children}
      </div>
    </AccountContentSection>
  );
}

export default AccountLoginSection;
