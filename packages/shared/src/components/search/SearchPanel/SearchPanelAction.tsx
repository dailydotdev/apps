import React, { FunctionComponent, ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { SearchPanelItem } from './SearchPanelItem';
import { IconProps } from '../../Icon';
import { MagicIcon } from '../../icons';
import SearchIcon from '../../icons/Search';
import { useSearchProvider } from '../../../hooks/search';
import { useSearchPanelAction } from './useSearchPanelAction';

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
        'rounded-6 bg-gradient-to-t from-theme-color-onion to-theme-color-cabbage p-0.5 text-white',
      )}
      secondary
      {...rest}
    />
  ),
};

export const SearchPanelAction = ({
  provider,
}: SearchPanelActionProps): ReactElement => {
  const searchPanel = useContext(SearchPanelContext);
  const Icon = iconToProviderMap[provider];
  const { search } = useSearchProvider();
  const itemProps = useSearchPanelAction({ provider });

  return (
    <SearchPanelItem
      icon={<Icon />}
      onClick={() => {
        search({ provider, query: searchPanel.query });
      }}
      {...itemProps}
    >
      <span className="text-theme-label-tertiary typo-callout">
        {searchPanel.query}
      </span>
    </SearchPanelItem>
  );
};
