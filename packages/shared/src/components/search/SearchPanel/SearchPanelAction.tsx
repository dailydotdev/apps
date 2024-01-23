import { useRouter } from 'next/router';
import React, { FunctionComponent, ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum, getSearchUrl } from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { SearchPanelItem } from './SearchPanelItem';
import { IconProps } from '../../Icon';
import { MagicIcon } from '../../icons';
import SearchIcon from '../../icons/Search';
import { defaultSearchProvider } from './common';

export type SearchPanelActionProps = {
  provider: SearchProviderEnum;
};

const iconToProviderMap: Record<
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

export const SearchPanelAction = ({
  provider,
}: SearchPanelActionProps): ReactElement => {
  const router = useRouter();
  const searchPanel = useContext(SearchPanelContext);
  const Icon = iconToProviderMap[provider];

  const onActive = () => {
    searchPanel.setProvider(provider);
  };

  const onInactive = () => {
    searchPanel.setProvider(defaultSearchProvider);
  };

  return (
    <SearchPanelItem
      icon={<Icon />}
      onClick={() => {
        router.push(
          getSearchUrl({
            provider,
            query: searchPanel.query,
          }),
          undefined,
          {
            shallow: true,
          },
        );
      }}
      onMouseEnter={onActive}
      onMouseLeave={onInactive}
      onFocus={onActive}
      onBlur={onInactive}
    >
      <span className="text-theme-label-tertiary typo-callout">{provider}</span>
    </SearchPanelItem>
  );
};
