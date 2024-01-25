import React, { FunctionComponent, ReactElement, useContext } from 'react';
import { SearchProviderEnum } from '../../../graphql/search';
import { IconProps } from '../../Icon';
import { AiIcon } from '../../icons';
import SearchIcon from '../../icons/Search';
import { SearchPanelContext } from './SearchPanelContext';
import { SearchPanelItem } from './SearchPanelItem';
import { useSearchProvider } from '../../../hooks/search';

export type SearchPanelActionProps = {
  provider: SearchProviderEnum;
};

const iconToProviderMap: Record<
  SearchProviderEnum,
  FunctionComponent<IconProps>
> = {
  [SearchProviderEnum.Posts]: SearchIcon,
  // TODO AS-3-search-merge replace with correct icon
  [SearchProviderEnum.Chat]: AiIcon,
};

export const SearchPanelAction = ({
  provider,
}: SearchPanelActionProps): ReactElement => {
  const searchPanel = useContext(SearchPanelContext);
  const Icon = iconToProviderMap[provider];
  const { search } = useSearchProvider();

  return (
    <SearchPanelItem
      icon={<Icon />}
      onClick={() => {
        search({ provider, query: searchPanel.query });
      }}
    >
      <span className="text-theme-label-tertiary typo-callout">
        {searchPanel.query}
      </span>
    </SearchPanelItem>
  );
};
