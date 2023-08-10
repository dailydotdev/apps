import React, { ReactElement } from 'react';
import classNames from 'classnames';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { SearchBarInput, SearchBarInputProps } from './SearchBarInput';
import { SearchBarSuggestionList } from './SearchBarSuggestionList';

export type SearchBarProps = Pick<
  SearchBarInputProps,
  'className' | 'valueChanged' | 'onSubmit' | 'showProgress'
>;

export function SearchBar({
  className,
  ...props
}: SearchBarProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();

  return (
    <div className={classNames('w-full', className?.container)}>
      <SearchBarInput
        {...props}
        inputProps={{ id: 'search' }}
        className={{ container: 'max-w-2xl', field: className?.field }}
        completedTime="12:12"
      />
      {sidebarRendered && <SearchBarSuggestionList />}
    </div>
  );
}
