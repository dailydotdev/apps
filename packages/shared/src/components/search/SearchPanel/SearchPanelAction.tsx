import { useRouter } from 'next/router';
import React, { FunctionComponent, ReactElement, useContext } from 'react';
import { SearchProviderEnum, getSearchUrl } from '../../../graphql/search';
import { IconProps } from '../../Icon';
import { AiIcon } from '../../icons';
import SearchIcon from '../../icons/Search';
import { SearchPanelContext } from './SearchPanelContext';
import { SearchPanelItem } from './SearchPanelItem';

export type SearchPanelActionProps = {
  provider: SearchProviderEnum;
};

const iconToProviderMap: Record<
  SearchProviderEnum,
  FunctionComponent<IconProps>
> = {
  [SearchProviderEnum.Posts]: SearchIcon,
  [SearchProviderEnum.Chat]: AiIcon,
};

export const SearchPanelAction = ({
  provider,
}: SearchPanelActionProps): ReactElement => {
  const router = useRouter();
  const searchPanel = useContext(SearchPanelContext);
  const Icon = iconToProviderMap[provider];

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
    >
      <span className="text-theme-label-tertiary typo-callout">{provider}</span>
    </SearchPanelItem>
  );
};
