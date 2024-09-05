import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { useSearchQuestionRecommendations } from '../../hooks/search';
import { labels } from '../../lib';
import { isNullOrUndefined } from '../../lib/func';
import { Origin } from '../../lib/log';
import Alert, { AlertType } from '../widgets/Alert';
import { SearchBarInputProps } from './common';
import { SearchBarSuggestionList } from './SearchBarSuggestionList';
import { SearchProgressBar } from './SearchProgressBar';

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
