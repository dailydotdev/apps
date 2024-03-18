import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import { SearchPanelContext } from './SearchPanelContext';
import { SearchPanelItem } from './SearchPanelItem';
import { useSearchProvider } from '../../../hooks/search';
import { useSearchPanelAction } from './useSearchPanelAction';
import {
  defaultSearchProvider,
  providerToIconMap,
  providerToLabelTextMap,
} from './common';
import { IconSize } from '../../Icon';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../../lib/analytics';

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
  const isDefaultProvider = provider === defaultSearchProvider;
  const isDefaultActive = !searchPanel.provider && isDefaultProvider;
  const { trackEvent } = useAnalyticsContext();

  return (
    <SearchPanelItem
      icon={<Icon className="rounded-6 p-0.5" size={IconSize.Small} />}
      onClick={() => {
        trackEvent({
          event_name: AnalyticsEvent.SubmitSearch,
          extra: JSON.stringify({ query: searchPanel.query, provider }),
        });

        search({ provider, query: searchPanel.query });
      }}
      className={classNames(isDefaultActive && 'bg-theme-float')}
      data-search-panel-item={!isDefaultProvider}
      tabIndex={isDefaultProvider ? -1 : undefined}
      {...itemProps}
    >
      <span className="flex-shrink overflow-hidden overflow-ellipsis whitespace-nowrap typo-callout">
        {searchPanel.query}{' '}
        <span className="text-theme-label-quaternary typo-footnote">
          {providerToLabelTextMap[provider]}
        </span>
      </span>
    </SearchPanelItem>
  );
};
