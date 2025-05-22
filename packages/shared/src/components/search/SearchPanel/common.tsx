import type { FunctionComponent } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import type { IconProps } from '../../Icon';
import { GoogleIcon, SearchIcon } from '../../icons';

export const defaultSearchProvider = SearchProviderEnum.Posts;

export const providerToLabelTextMap: Record<SearchProviderEnum, string> = {
  [SearchProviderEnum.Posts]: 'Search posts',
  [SearchProviderEnum.Tags]: 'Search tags',
  [SearchProviderEnum.Google]: 'Search on Google',
  [SearchProviderEnum.Sources]: 'Search sources',
  [SearchProviderEnum.Users]: 'Search users',
};

export const providerToIconMap: Record<
  SearchProviderEnum,
  FunctionComponent<IconProps>
> = {
  [SearchProviderEnum.Posts]: SearchIcon,
  [SearchProviderEnum.Tags]: SearchIcon,
  [SearchProviderEnum.Google]: ({ className, ...rest }: IconProps) => (
    <GoogleIcon
      className={classNames(className, 'bg-white')}
      secondary
      {...rest}
    />
  ),
  [SearchProviderEnum.Sources]: SearchIcon,
  [SearchProviderEnum.Users]: SearchIcon,
};
