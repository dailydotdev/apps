import React, { useContext } from 'react';
import classNames from 'classnames';
import {
  SearchBarSuggestion,
  SearchBarSuggestionProps,
} from './SearchBarSuggestion';
import AuthContext from '../../contexts/AuthContext';
import FeedbackIcon from '../icons/Feedback';

interface SearchBarSuggestionListProps {
  className?: string;
}

export function SearchBarSuggestionList({
  className,
}: SearchBarSuggestionListProps): React.ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const suggestions: SearchBarSuggestionProps[] = [];

  if (!user) {
    suggestions.push({
      suggestion:
        'Sign up and read your first post to get search recommendations',
      onClick: () => showLogin('search bar suggestion'),
    });
  } else if (suggestions?.length === 0) {
    return (
      <span className="flex flex-row items-center text-theme-label-quaternary">
        <FeedbackIcon />
        <span className="ml-2 typo-footnote">
          Read and upvote your first post to get search recommendations
        </span>
      </span>
    );
  }

  return (
    <div className={classNames('flex flex-wrap gap-4', className)}>
      {suggestions.map((suggestion) => (
        <SearchBarSuggestion
          key={suggestion.suggestion}
          suggestion={suggestion.suggestion}
          onClick={suggestion.onClick}
        />
      ))}
    </div>
  );
}
