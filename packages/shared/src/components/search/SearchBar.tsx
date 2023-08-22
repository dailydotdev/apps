import React, { ReactElement } from 'react';
import classNames from 'classnames';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { SearchBarInput, SearchBarInputProps } from './SearchBarInput';
import { SearchBarSuggestionList } from './SearchBarSuggestionList';
import Alert, { AlertType } from '../widgets/Alert';

export type SearchBarProps = Pick<
  SearchBarInputProps,
  'className' | 'valueChanged' | 'onSubmit' | 'showProgress' | 'chunk'
>;

export function SearchBar({
  className,
  chunk,
  ...props
}: SearchBarProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();

  return (
    <div className={classNames('w-full', className?.container)}>
      <SearchBarInput
        {...props}
        chunk={chunk}
        inputProps={{ id: 'search' }}
        className={{ container: 'max-w-2xl', field: className?.field }}
      />
      {chunk?.error?.message && (
        <Alert
          className="my-4"
          type={AlertType.Error}
          title={chunk?.error?.message}
        />
      )}
      {sidebarRendered && (!chunk || chunk?.error?.message) && (
        <SearchBarSuggestionList className={!chunk?.error?.message && 'mt-4'} />
      )}
    </div>
  );
}
