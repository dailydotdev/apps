import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import {
  Button,
  ButtonIconPosition,
  ButtonVariant,
} from '../../buttons/ButtonV2';
import { providerToIconMap } from './common';
import { useSearchProvider } from '../../../hooks/search';

export type SearchProviderButtonProps = {
  className?: string;
  provider: SearchProviderEnum;
  query: string;
  children: ReactNode;
};

export const SearchProviderButton = ({
  className,
  provider,
  query,
  children,
}: SearchProviderButtonProps): ReactElement => {
  const { search } = useSearchProvider();
  const Icon = providerToIconMap[provider];

  return (
    <Button
      className={classNames(
        className,
        'border-theme-divider-tertiary text-theme-label-tertiary typo-subhead',
      )}
      icon={<Icon className="mr-2" />}
      iconPosition={ButtonIconPosition.Left}
      type={ButtonVariant.Secondary}
      onClick={() => {
        search({ provider, query });
      }}
    >
      {children}
    </Button>
  );
};
