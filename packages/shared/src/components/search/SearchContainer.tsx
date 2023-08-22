import React, { ReactNode } from 'react';
import { SearchBar } from './SearchBar';
import { SearchFeedback } from './SearchFeedback';
import { SearchBarInputProps } from './SearchBarInput';

interface SearchContainerProps extends Pick<SearchBarInputProps, 'chunk'> {
  children: ReactNode;
  onSubmit(event: React.MouseEvent, value: string): void;
}

export function SearchContainer({
  children,
  onSubmit,
  chunk,
}: SearchContainerProps): React.ReactElement {
  return (
    <main className="m-auto w-full">
      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-y-6 pt-8 m-auto max-w-screen-laptop">
        <main className="flex flex-col flex-1 col-span-2 px-4 laptop:px-8">
          <SearchBar onSubmit={onSubmit} chunk={chunk} />
        </main>
        <SearchFeedback />
        {children}
      </div>
    </main>
  );
}
