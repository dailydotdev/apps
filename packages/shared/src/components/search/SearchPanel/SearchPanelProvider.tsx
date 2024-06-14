import React, { FunctionComponent, ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import { IconProps, IconSize } from '../../Icon';
import { SearchPanelContext } from './SearchPanelContext';
import { providerToIconMap } from './common';

export type SearchPanelProviderProps = {
  className?: string;
};

const providerToComponentMap: Record<
  SearchProviderEnum,
  FunctionComponent<IconProps> | undefined
> = {
  ...providerToIconMap,
  [SearchProviderEnum.Posts]: undefined,
};

export const SearchPanelProvider = ({
  className,
}: SearchPanelProviderProps): ReactElement => {
  const searchPanel = useContext(SearchPanelContext);

  if (searchPanel.providerIcon) {
    return searchPanel.providerIcon;
  }

  const Component = providerToComponentMap[searchPanel.provider];

  if (!Component) {
    return null;
  }

  return (
    <Component
      className={classNames(className, 'rounded-8 p-1')}
      size={IconSize.Large}
    />
  );
};
