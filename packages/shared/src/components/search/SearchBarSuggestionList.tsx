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

const lengthToClass = {
  '1': 'max-w-full',
  '2': 'max-w-[50%]',
};

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

  const gridClass =
    lengthToClass[suggestions.length.toString()] ?? 'max-w-[33%]';

  return (
    <div
      className={classNames(
        'flex flex-row w-full shrink gap-4',
        gridClass,
        className,
      )}
    >
      {suggestions.map((suggestion, i) => (
        <SearchBarSuggestion
          tag="a"
          origin={origin}
          className={classNames(
            i >= 2 && 'tablet:hidden laptop:flex',
            lengthToClass,
          )}
          suggestion={suggestion}
          key={suggestion.prompt}
          href={getSearchUrl({
            id: suggestion.id,
            question: suggestion.prompt,
          })}
        >
          {suggestion.prompt}
        </SearchBarSuggestion>
      ))}
    </div>
  );
}
