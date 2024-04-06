import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import {
  Button,
  ButtonIconPosition,
  ButtonVariant,
} from '../../buttons/Button';
import { providerToIconMap } from './common';
import { useSearchProvider } from '../../../hooks/search';

export type SearchProviderButtonProps = {
  className?: string;
  provider: SearchProviderEnum;
  query: string;
  children: ReactNode;
} & Pick<HTMLAttributes<HTMLButtonElement>, 'onClick'>;

export const SearchProviderButton = ({
  className,
  provider,
  query,
  children,
  onClick,
}: SearchProviderButtonProps): ReactElement => {
  const { search } = useSearchProvider();
  const Icon = providerToIconMap[provider];

  return (
    <Button
      className={classNames(
        className,
        'border-border-subtlest-tertiary text-text-tertiary typo-subhead',
      )}
      icon={<Icon className="mr-2 rounded-6 p-0.5" />}
      iconPosition={ButtonIconPosition.Left}
      type={ButtonVariant.Secondary}
      onClick={(event) => {
        onClick?.(event);

        search({ provider, query });
      }}
    >
      {children}
    </Button>
  );
};
