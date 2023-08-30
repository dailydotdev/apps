import React, { useContext } from 'react';
import classNames from 'classnames';
import { SearchBarSuggestion } from './SearchBarSuggestion';
import AuthContext from '../../contexts/AuthContext';
import FeedbackIcon from '../icons/Feedback';
import { getSearchUrl, SearchSession } from '../../graphql/search';
import { Pill } from '../utilities/loaders';
import { LoginTrigger } from '../../lib/analytics';

export interface SearchBarSuggestionListProps {
  className?: string;
  isLoading?: boolean;
  suggestions?: Partial<SearchSession>[];
}

export function SearchBarSuggestionList({
  className,
  isLoading,
  suggestions,
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
        'flex max-w-full overflow-scroll gap-4 p-2 pl-0',
        className,
      )}
    >
      {suggestions.map(({ id, prompt }) => (
        <SearchBarSuggestion
          tag="a"
          key={prompt}
          href={getSearchUrl({ id, question: prompt })}
        >
          {prompt}
        </SearchBarSuggestion>
      ))}
    </div>
  );
}
