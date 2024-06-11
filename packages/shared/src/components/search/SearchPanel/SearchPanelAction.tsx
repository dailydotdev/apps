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
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

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
  const { logEvent } = useLogContext();

  return (
    <SearchPanelItem
      icon={<Icon className="rounded-6 p-0.5" size={IconSize.Small} />}
      onClick={() => {
        logEvent({
          event_name: LogEvent.SubmitSearch,
          extra: JSON.stringify({ query: searchPanel.query, provider }),
        });

        search({ provider, query: searchPanel.query });
      }}
      className={classNames(isDefaultActive && 'bg-surface-float')}
      data-search-panel-item={!isDefaultProvider}
      tabIndex={isDefaultProvider ? -1 : undefined}
      {...itemProps}
    >
      <span className="flex-shrink overflow-hidden overflow-ellipsis whitespace-nowrap typo-callout">
        {searchPanel.query}{' '}
        <span className="text-text-quaternary typo-footnote">
          {providerToLabelTextMap[provider]}
        </span>
      </span>
    </SearchPanelItem>
  );
};
