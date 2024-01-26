import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import { IconProps } from '../../Icon';
import { MagicIcon } from '../../icons';
import SearchIcon from '../../icons/Search';

export const searchPanelGradientQueryKey = ['search-panel-active-gradient'];

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
        'rounded-6 bg-gradient-to-t from-onion-40 to-cabbage-40 p-0.5 text-white',
      )}
      secondary
      {...rest}
    />
  ),
};
