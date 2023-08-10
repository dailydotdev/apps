import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import {
  SearchBarSuggestion,
  SearchBarSuggestionProps,
} from './SearchBarSuggestion';
import AuthContext from '../../contexts/AuthContext';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { SearchBarInput, SearchBarInputProps } from './SearchBarInput';

export type SearchBarProps = Pick<SearchBarInputProps, 'className'>;

export function SearchBar({ className }: SearchBarProps): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const { sidebarRendered } = useSidebarRendered();
  const suggestions: SearchBarSuggestionProps[] = [];

  if (!user) {
    suggestions.push(
      {
        suggestion:
          'Sign up and read your first post to get search recommendations',
        onClick: () => showLogin('search bar suggestion'),
      },
      {
        suggestion: 'Sign up and read your ',
        onClick: () => showLogin('search bar suggestion'),
      },
      {
        suggestion:
          'Sign up and read your first post to get search recommendations',
        onClick: () => showLogin('search bar suggestion'),
      },
    );
  }

  return (
    <div className={classNames('w-full', className?.container)}>
      <SearchBarInput
        inputProps={{ id: 'search' }}
        className={{ container: 'max-w-2xl', field: className?.field }}
        completedTime="12:12"
      />
      {sidebarRendered && suggestions && (
        <div className="flex flex-wrap gap-4 mt-6">
          {suggestions.map((suggestion) => (
            <SearchBarSuggestion
              key={suggestion.suggestion}
              suggestion={suggestion.suggestion}
              onClick={suggestion.onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
