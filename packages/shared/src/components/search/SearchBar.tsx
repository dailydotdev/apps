import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SearchBarInput, SearchBarInputProps } from './SearchBarInput';
import { SearchBarSuggestionList } from './SearchBarSuggestionList';
import Alert, { AlertType } from '../widgets/Alert';
import { useSearchSuggestions } from '../../hooks/search';
import { Origin } from '../../lib/analytics';

export type SearchBarProps = Pick<
  SearchBarInputProps,
  'className' | 'valueChanged' | 'onSubmit' | 'showProgress' | 'chunk'
>;

export function SearchBar({
  className,
  chunk,
  ...props
}: SearchBarProps): ReactElement {
  const suggestionsProps = useSearchSuggestions({ origin: Origin.HomePage });

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
      {chunk?.error?.message && (
        <Alert
          className="my-4"
          type={AlertType.Error}
          title={chunk?.error?.message}
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
