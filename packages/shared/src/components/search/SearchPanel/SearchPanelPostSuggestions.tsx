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
          className="typo-subhead [&>strong]:text-theme-label-primary"
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
  const searchPanel = useContext(SearchPanelContext);
  const { search } = useSearchProvider();

  const { suggestions } = useSearchProviderSuggestions({
    provider: SearchProviderEnum.Posts,
    query: searchPanel.query,
  });

  const onSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.id) {
      router.push(`/posts/${suggestion.id}`);

      return;
    }

    const searchQuery = suggestion.title.replace(sanitizeSearchTitleMatch, '');

    search({ provider: SearchProviderEnum.Posts, query: searchQuery });
  };

  if (!suggestions?.hits?.length) {
    return null;
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className="relative my-2 flex items-center justify-start gap-2">
        <hr className="w-2 border-theme-divider-tertiary" />
        <span className="relative inline-flex font-bold typo-footnote">
          {title}
        </span>
        <hr className="flex-1 border-theme-divider-tertiary" />
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
