import React, { useContext } from 'react';
import classNames from 'classnames';
import { SearchBarSuggestion, SuggestionOrigin } from './SearchBarSuggestion';
import AuthContext from '../../contexts/AuthContext';
import FeedbackIcon from '../icons/Feedback';
import { getSearchUrl, SearchSession } from '../../graphql/search';
import { Pill } from '../utilities/loaders';
import { LoginTrigger } from '../../lib/analytics';

export interface SearchBarSuggestionListProps {
  className?: string;
  isLoading?: boolean;
  suggestions?: Partial<SearchSession>[];
  origin: SuggestionOrigin;
}

export function SearchBarSuggestionList({
  className,
  isLoading,
  suggestions,
  origin,
}: SearchBarSuggestionListProps): React.ReactElement {
  const { user, showLogin } = useContext(AuthContext);

  if (isLoading) return <Pill className={className} />;

  if (!user) {
    return (
      <SearchBarSuggestion
        className={className}
        onClick={() => showLogin(LoginTrigger.SearchSuggestion)}
      >
        Sign up and read your first post to get search recommendations
      </SearchBarSuggestion>
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
          suggestion={suggestion}
          key={suggestion.prompt}
          href={getSearchUrl({
            question: suggestion.prompt,
          })}
        >
          {suggestion.prompt}
        </SearchBarSuggestion>
      ))}
    </div>
  );
}
