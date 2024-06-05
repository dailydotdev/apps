import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { SearchFeedback } from './SearchFeedback';
import { Pill } from '../utilities/loaders';
import { PageWidgets } from '../utilities';
import { SearchSourceList } from './SearchSourceList';
import { SearchBar } from './SearchBar';
import { SearchBarInputProps } from './common';

interface SearchContainerProps extends Pick<SearchBarInputProps, 'chunk'> {
  children: ReactNode;
  isLoading?: boolean;
  isInProgress?: boolean;
}

export function SearchContainer({
  children,
  isLoading,
  isInProgress,
  chunk,
}: SearchContainerProps): React.ReactElement {
  return (
    <div className="m-auto mt-14 grid w-full max-w-screen-laptopL grid-cols-1 gap-y-6 py-8 laptop:mt-auto laptop:grid-cols-3">
      <main className="col-span-2 flex flex-col px-4 laptop:px-8">
        {isLoading ? (
          <>
            <Pill className="!h-16" />
            <Pill className="mt-3 !h-2" />
          </>
        ) : (
          <SearchBar
            chunk={chunk}
            showProgress={!!chunk?.steps}
            isLoading={isLoading}
          />
        )}
        {children}
      </main>
      <PageWidgets className="items-center gap-6 !px-0">
        <SearchFeedback className="order-2 max-w-widget laptop:order-1" />
        {!!chunk && (
          <SearchSourceList
            className={classNames(
              'order-1 laptop:order-1',
              chunk?.status
                ? 'laptop:mt-10 laptop:pt-1.5'
                : 'laptop:mt-4 laptop:pt-0.5',
            )}
            sources={chunk?.sources}
            isLoading={isInProgress}
          />
        )}
      </PageWidgets>
    </div>
  );
}
