import { Provider } from '@dailydotdev/shared/src/components/auth/common';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
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
  buttonVariant: ButtonVariant;
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
  buttonVariant = ButtonVariant.Primary,
}: AccountLoginSectionProps): ReactElement {
  if (!providers?.length) {
    return null;
  }

  return (
    <AccountContentSection title={title} description={description}>
      <div
        className={classNames(
          'mt-6 grid w-64 grid-cols-1 gap-4',
          className?.container,
        )}
      >
        {providers.map(({ label, value, icon }) => (
          <Button
            key={value}
            icon={icon}
            className={className?.button}
            variant={buttonVariant}
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
