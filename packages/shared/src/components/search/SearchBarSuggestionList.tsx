import React, { useContext } from 'react';
import classNames from 'classnames';
import { SearchBarSuggestion } from './SearchBarSuggestion';
import AuthContext from '../../contexts/AuthContext';
import FeedbackIcon from '../icons/Feedback';
import { getSearchIdUrl, SearchSession } from '../../graphql/search';

interface SearchBarSuggestionListProps {
  className?: string;
  suggestions?: SearchSession[];
}

export function SearchBarSuggestionList({
  className,
  suggestions,
}: SearchBarSuggestionListProps): React.ReactElement {
  const { user, showLogin } = useContext(AuthContext);

  if (!user) {
    return (
      <SearchBarSuggestion onClick={() => showLogin('search bar suggestion')}>
        Sign up and read your first post to get search recommendations
      </SearchBarSuggestion>
    );
  }

  if (!suggestions?.length) {
    return (
      <span className="flex flex-row items-center text-theme-label-quaternary">
        <FeedbackIcon />
        <span className="ml-2 typo-footnote">
          Start getting search recommendations by upvoting several posts
        </span>
      </span>
    );
  }

  return (
    <div className={classNames('flex flex-wrap gap-4', className)}>
      {suggestions.map(({ id, prompt }) => (
        <SearchBarSuggestion key={prompt} tag="a" href={getSearchIdUrl(id)}>
          {prompt}
        </SearchBarSuggestion>
      ))}
    </div>
  );
}
