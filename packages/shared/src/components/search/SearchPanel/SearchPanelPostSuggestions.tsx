import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import { useRouter } from 'next/router';
import { SearchIcon } from '../../icons';
import { SearchPanelItem, SearchPanelItemProps } from './SearchPanelItem';
import {
  SearchProviderEnum,
  SearchSuggestion,
  sanitizeSearchTitleMatch,
} from '../../../graphql/search';
import {
  useSearchProvider,
  useSearchProviderSuggestions,
} from '../../../hooks/search';
import { SearchPanelContext } from './SearchPanelContext';
import { useDomPurify } from '../../../hooks/useDomPurify';
import { useSearchPanelAction } from './useSearchPanelAction';
import { webappUrl } from '../../../lib/constants';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import LogContext from '../../../contexts/LogContext';

export type SearchPanelPostSuggestionsProps = {
  className?: string;
  title: string;
};

const PanelItem = ({
  suggestion,
  ...rest
}: Omit<SearchPanelItemProps, 'icon'> & { suggestion: SearchSuggestion }) => {
  const itemProps = useSearchPanelAction({
    provider: SearchProviderEnum.Posts,
    text: suggestion.title,
  });
  const purify = useDomPurify();
  const purifySanitize = purify?.sanitize;

  return (
    <SearchPanelItem {...rest} icon={<SearchIcon />} {...itemProps}>
      {!!purifySanitize && (
        <span
          className="flex-shrink overflow-hidden overflow-ellipsis whitespace-nowrap typo-subhead [&>strong]:text-text-primary"
          dangerouslySetInnerHTML={{
            __html: purifySanitize(suggestion.title),
          }}
        />
      )}
    </SearchPanelItem>
  );
};

export const SearchPanelPostSuggestions = ({
  className,
  title,
}: SearchPanelPostSuggestionsProps): ReactElement => {
  const router = useRouter();
  const { logEvent } = useContext(LogContext);
  const searchPanel = useContext(SearchPanelContext);
  const { search } = useSearchProvider();

  const { suggestions } = useSearchProviderSuggestions({
    provider: SearchProviderEnum.Posts,
    query: searchPanel.query,
  });

  const onSuggestionClick = (suggestion: SearchSuggestion) => {
    const searchQuery = suggestion.title.replace(sanitizeSearchTitleMatch, '');

    if (suggestion.id) {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.SearchRecommendation,
        target_id: suggestion.id,
        feed_item_title: searchQuery,
        extra: JSON.stringify({
          origin: Origin.HomePage,
          provider: SearchProviderEnum.Posts,
        }),
      });
      router.push(`${webappUrl}posts/${suggestion.id}`);

      return;
    }

    search({ provider: SearchProviderEnum.Posts, query: searchQuery });
  };

  if (!suggestions?.hits?.length) {
    return null;
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className="relative my-2 flex items-center justify-start gap-2">
        <hr className="w-2 border-border-subtlest-tertiary" />
        <span className="relative inline-flex font-bold typo-footnote">
          {title}
        </span>
        <hr className="flex-1 border-border-subtlest-tertiary" />
      </div>
      {suggestions?.hits?.map((suggestion) => {
        return (
          <PanelItem
            key={suggestion.title}
            suggestion={suggestion}
            onClick={() => {
              onSuggestionClick(suggestion);
            }}
          />
        );
      })}
    </div>
  );
};
