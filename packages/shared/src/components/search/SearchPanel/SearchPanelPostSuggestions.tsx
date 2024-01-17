import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import SearchIcon from '../../icons/Search';
import { SearchPanelItem } from './SearchPanelItem';
import { SearchProviderEnum, getSearchUrl } from '../../../graphql/search';

export type SearchPanelPostSuggestionsProps = {
  className?: string;
  title: string;
};

export const SearchPanelPostSuggestions = ({
  className,
  title,
}: SearchPanelPostSuggestionsProps): ReactElement => {
  const router = useRouter();

  // TODO AS-3-search-merge replace with useSearchProvider hook
  const suggestions = [
    {
      title: 'Opinion: How to be a better developer?',
    },
    {
      title: 'How to learn Java script?',
    },
    {
      title: 'How to build React applications faster with Bun',
    },
  ];

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

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className="relative my-2">
        <hr className="absolute top-[50%] w-full translate-y-[-50%] border-theme-divider-tertiary" />
        <span className="relative mx-2 inline-flex w-auto flex-1 bg-theme-bg-secondary px-3 font-bold typo-footnote">
          {title}
        </span>
      </div>
      {suggestions.map((suggestion) => {
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
