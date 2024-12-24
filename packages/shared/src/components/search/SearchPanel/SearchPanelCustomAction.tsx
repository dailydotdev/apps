import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { SearchPanelItemProps } from './SearchPanelItem';
import { SearchPanelItem } from './SearchPanelItem';
import { useSearchPanelAction } from './useSearchPanelAction';
import type { SearchProviderEnum } from '../../../graphql/search';

export type SearchPanelCustomActionProps = {
  provider: SearchProviderEnum;
  children: ReactNode;
} & Omit<
  SearchPanelItemProps,
  'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur'
>;

export const SearchPanelCustomAction = ({
  provider,
  children,
  ...rest
}: SearchPanelCustomActionProps): ReactElement => {
  const itemProps = useSearchPanelAction({ provider });

  return (
    <SearchPanelItem {...rest} {...itemProps}>
      {children}
    </SearchPanelItem>
  );
};
