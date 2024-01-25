import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import { useRouter } from 'next/router';
import SearchIcon from '../../icons/Search';
import { SearchPanelItem } from './SearchPanelItem';
import { SearchProviderEnum, getSearchUrl } from '../../../graphql/search';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import { SearchPanelContext } from './SearchPanelContext';

export type SearchPanelPostSuggestionsProps = {
  className?: string;
  title: string;
};

export const SearchPanelPostSuggestions = ({
  className,
  title,
}: SearchPanelPostSuggestionsProps): ReactElement => {
  const router = useRouter();
  const searchPanel = useContext(SearchPanelContext);

  const { suggestions } = useSearchProviderSuggestions({
    provider: SearchProviderEnum.Posts,
    query: searchPanel.query,
  });

  const onSuggestionClick = (suggestion: { title: string }) => {
    router.push(
      getSearchUrl({
        provider: SearchProviderEnum.Posts,
        query: suggestion.title,
      }),
      undefined,
      {
        shallow: true,
      },
    );
  };

  if (!suggestions?.hits?.length) {
    return null;
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className="relative my-2 flex items-center justify-start gap-2">
        <hr className="w-2 border-theme-divider-tertiary" />
        <span className="w-autofont-bold relative inline-flex font-bold typo-footnote">
          {title}
        </span>
        <hr className="flex-1 border-theme-divider-tertiary" />
      </div>
      {suggestions?.hits?.map((suggestion) => {
        return (
          <SearchPanelItem
            key={suggestion.title}
            icon={<SearchIcon />}
            onClick={() => {
              onSuggestionClick(suggestion);
            }}
          >
            <span className="text-theme-label-tertiary typo-subhead">
              {suggestion.title}
            </span>
          </SearchPanelItem>
        );
      })}
    </div>
  );
};
