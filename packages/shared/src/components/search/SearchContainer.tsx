import React, { ReactNode } from 'react';
import { SearchBar } from './SearchBar';
import { SearchFeedback } from './SearchFeedback';
import { SearchBarInputProps } from './SearchBarInput';
import { Pill } from '../utilities/loaders';
import { PageWidgets } from '../utilities';

interface SearchContainerProps extends Pick<SearchBarInputProps, 'chunk'> {
  children: ReactNode;
  isLoading?: boolean;
  onSubmit(event: React.MouseEvent, value: string): void;
}

export function SearchContainer({
  children,
  onSubmit,
  isLoading,
  chunk,
}: SearchContainerProps): React.ReactElement {
  return (
    <main className="m-auto w-full">
      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-y-6 py-8 m-auto w-full max-w-screen-laptopL">
        <main className="flex flex-col flex-1 col-span-2 px-4 laptop:px-8">
          {isLoading ? (
            <>
              <Pill className="!h-16" />
              <Pill className="mt-3 !h-2" />
            </>
          ) : (
            <SearchBar
              onSubmit={onSubmit}
              chunk={chunk}
              showProgress
              isLoading={isLoading}
            />
          )}
        </main>
        <PageWidgets
          tablet={false}
          className="flex flex-col order-last laptop:order-2 gap-6 items-center"
        >
          <SearchFeedback />
        </PageWidgets>
        {children}
      </div>
    </main>
  );
}
