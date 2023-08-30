import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SearchBarInput, SearchBarInputProps } from './SearchBarInput';
import { SearchBarSuggestionList } from './SearchBarSuggestionList';
import Alert, { AlertType } from '../widgets/Alert';
import { useSearchSuggestions } from '../../hooks/search';
import { labels } from '../../lib';

export type SearchBarProps = Pick<
  SearchBarInputProps,
  'className' | 'valueChanged' | 'onSubmit' | 'showProgress' | 'chunk'
> & {
  isLoading?: boolean;
};

export function SearchBar({
  className,
  chunk,
  isLoading,
  ...props
}: SearchBarProps): ReactElement {
  const suggestionsProps = useSearchSuggestions();

  return (
    <div className={classNames('w-full', className?.container)}>
      <SearchBarInput
        {...props}
        chunk={chunk}
        shouldShowPopup
        inputProps={{ id: 'search' }}
        className={{
          container: 'max-w-[48rem] w-full',
          field: className?.field,
        }}
        suggestionsProps={suggestionsProps}
      />
      {!isLoading && chunk?.error?.code !== null && (
        <Alert
          className="my-4"
          type={AlertType.Error}
          title={chunk?.error?.message || labels.error.generic}
        />
      )}
      {(!chunk || chunk?.error?.message) && (
        <SearchBarSuggestionList
          {...suggestionsProps}
          className={classNames(
            !chunk?.error?.message && 'mt-4',
            'hidden tablet:flex',
          )}
        />
      )}
    </div>
  );
}
