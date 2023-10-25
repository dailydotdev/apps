import React, { useContext } from 'react';
import classNames from 'classnames';
import { SearchBarSuggestion, SuggestionOrigin } from './SearchBarSuggestion';
import { PlaceholderSearchSuggestion } from './PlaceholderSearchSuggestion';
import AuthContext from '../../contexts/AuthContext';
import FeedbackIcon from '../icons/Feedback';
import { getSearchUrl, SearchQuestion } from '../../graphql/search';
import { Pill } from '../utilities/loaders';
import { AuthTriggers } from '../../lib/auth';

export interface SearchBarSuggestionListProps {
  className?: string;
  isLoading?: boolean;
  suggestions?: Partial<SearchQuestion>[];
  origin: SuggestionOrigin;
}

export function SearchBarSuggestionList({
  className,
  isLoading,
  suggestions,
  origin,
}: SearchBarSuggestionListProps): React.ReactElement {
  const { user, showLogin } = useContext(AuthContext);

  if (isLoading) {
    return <Pill className={className} />;
  }

  if (!user) {
    return (
      <PlaceholderSearchSuggestion
        className={className}
        onClick={() => showLogin(AuthTriggers.SearchSuggestion)}
      >
        Sign up and read your first post to get search recommendations
      </PlaceholderSearchSuggestion>
    );
  }

  if (!suggestions?.length) {
    return (
      <span
        className={classNames(
          'flex flex-row items-center text-theme-label-quaternary',
          className,
        )}
      >
        <FeedbackIcon />
        <span className="flex flex-1 ml-2 typo-footnote">
          Start getting search recommendations by upvoting several posts
        </span>
      </span>
    );
  }

  return (
    <div
      className={classNames(
        'flex flex-wrap gap-4 w-full flex-1 tablet:h-10 overflow-hidden',
        className,
      )}
    >
      {suggestions.map((suggestion) => (
        <SearchBarSuggestion
          tag="a"
          origin={origin}
          id={suggestion.id}
          prompt={suggestion.question}
          key={suggestion.id}
          href={getSearchUrl({
            question: suggestion.question,
          })}
        >
          {suggestion.question}
        </SearchBarSuggestion>
      ))}
    </div>
  );
}
