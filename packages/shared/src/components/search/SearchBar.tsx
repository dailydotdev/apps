import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SearchBarSuggestionList } from './SearchBarSuggestionList';
import Alert, { AlertType } from '../widgets/Alert';
import { useSearchQuestionRecommendations } from '../../hooks/search';
import { Origin } from '../../lib/log';
import { labels } from '../../lib';
import { isNullOrUndefined } from '../../lib/func';
import { SearchProgressBar } from './SearchProgressBar';
import { SearchBarInputProps } from './common';

export type SearchBarProps = Pick<
  SearchBarInputProps,
  'className' | 'showProgress' | 'chunk'
> & {
  isLoading?: boolean;
};

export function SearchBar({
  className,
  showProgress,
  chunk,
}: SearchBarProps): ReactElement {
  const suggestionsProps = useSearchQuestionRecommendations({
    origin: Origin.SearchPage,
  });

  return (
    <div className={classNames('w-full', className?.container)}>
      {showProgress && (
        <div className="mb-4">
          <SearchProgressBar max={chunk?.steps} progress={chunk?.progress} />
          {!!chunk?.status && (
            <div className="mt-2 text-text-tertiary typo-callout">
              {chunk?.status}
            </div>
          )}
        </div>
      )}
      {!isNullOrUndefined(chunk?.error?.code) && (
        <Alert
          className="mb-4"
          type={AlertType.Error}
          title={chunk?.error?.message || labels.error.generic}
        />
      )}
      {(!chunk || chunk?.error?.message) && (
        <SearchBarSuggestionList
          {...suggestionsProps}
          className={classNames('hidden tablet:flex')}
        />
      )}
    </div>
  );
}
