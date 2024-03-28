import React, { useContext } from 'react';
import classNames from 'classnames';
import { SearchBarSuggestion, SuggestionOrigin } from './SearchBarSuggestion';
import AuthContext from '../../contexts/AuthContext';
import { AiIcon, FeedbackIcon } from '../icons';
import {
  getSearchUrl,
  SearchProviderEnum,
  SearchQuestion,
} from '../../graphql/search';
import { Pill } from '../utilities/loaders';
import { AuthTriggers } from '../../lib/auth';
import { Button, ButtonVariant } from '../buttons/Button';

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
    return <Pill className={classNames('!h-10 w-1/2', className)} />;
  }

  if (!user) {
    return (
      <Button
        icon={<AiIcon />}
        variant={ButtonVariant.Subtle}
        className={className}
        onClick={() => showLogin({ trigger: AuthTriggers.SearchSuggestion })}
      >
        <span className="tablet:line-clamp-1">
          Sign up and read your first post to get search recommendations
        </span>
      </Button>
    );
  }

  if (!suggestions?.length) {
    return (
      <span
        className={classNames(
          'flex h-10 flex-row items-center text-text-quaternary',
          className,
        )}
      >
        <FeedbackIcon />
        <span className="ml-2 flex flex-1 typo-footnote">
          Start getting search recommendations by upvoting several posts
        </span>
      </span>
    );
  }

  return (
    <div
      className={classNames(
        'flex w-full flex-1 flex-wrap gap-4 overflow-hidden tablet:h-10',
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
            query: suggestion.question,
            provider: SearchProviderEnum.Chat,
          })}
        >
          {suggestion.question}
        </SearchBarSuggestion>
      ))}
    </div>
  );
}
