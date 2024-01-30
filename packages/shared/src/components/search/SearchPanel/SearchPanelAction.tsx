import React, { ReactElement, useContext } from 'react';
import { SearchProviderEnum } from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { SearchPanelItem } from './SearchPanelItem';
import { useSearchProvider } from '../../../hooks/search';
import { useSearchPanelAction } from './useSearchPanelAction';
import { providerToIconMap, providerToLabelTextMap } from './common';
import { IconSize } from '../../Icon';

export type SearchPanelActionProps = {
  provider: SearchProviderEnum;
};

export const SearchPanelAction = ({
  provider,
}: SearchPanelActionProps): ReactElement => {
  const searchPanel = useContext(SearchPanelContext);
  const Icon = providerToIconMap[provider];
  const { search } = useSearchProvider();
  const itemProps = useSearchPanelAction({ provider });

  return (
    <SearchPanelItem
      icon={<Icon className="rounded-6 p-0.5" size={IconSize.Small} />}
      onClick={() => {
        search({ provider, query: searchPanel.query });
      }}
      {...itemProps}
    >
      <span className="typo-callout">
        {searchPanel.query}{' '}
        <span className="text-theme-label-quaternary typo-footnote">
          {providerToLabelTextMap[provider]}
        </span>
      </span>
    </SearchPanelItem>
  );
};
