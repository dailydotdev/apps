import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import { IconProps } from '../../Icon';
import { MagicIcon, SearchIcon } from '../../icons';

export const defaultSearchProvider = SearchProviderEnum.Posts;

export const providerToLabelTextMap: Record<SearchProviderEnum, string> = {
  [SearchProviderEnum.Posts]: 'Search posts',
  [SearchProviderEnum.Chat]: 'Ask daily.dev AI',
};

export const providerToIconMap: Record<
  SearchProviderEnum,
  FunctionComponent<IconProps>
> = {
  [SearchProviderEnum.Posts]: SearchIcon,
  [SearchProviderEnum.Chat]: ({ className, ...rest }: IconProps) => (
    <MagicIcon
      className={classNames(
        className,
        'bg-gradient-to-t from-theme-color-onion to-theme-color-cabbage text-white',
      )}
      secondary
      {...rest}
    />
  ),
};
