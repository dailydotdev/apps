import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { SearchBar } from './SearchBar';
import { SearchFeedback } from './SearchFeedback';
import { SearchBarInputProps } from './SearchBarInput';
import { Pill } from '../utilities/loaders';
import { PageWidgets } from '../utilities';
import { SearchReferralBanner } from './SearchReferralBanner';
import { SearchSourceList } from './SearchSourceList';

interface SearchContainerProps extends Pick<SearchBarInputProps, 'chunk'> {
  children: ReactNode;
  isLoading?: boolean;
  isInProgress?: boolean;
  onSubmit(event: React.MouseEvent, value: string): void;
}

export function SearchContainer({
  children,
  onSubmit,
  isLoading,
  isInProgress,
  chunk,
}: SearchContainerProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 laptop:grid-cols-3 gap-y-6 py-8 m-auto w-full max-w-screen-laptopL">
      <main className="flex flex-col col-span-2 px-4 laptop:px-8">
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
        {children}
      </main>
      <PageWidgets tablet={false} className="gap-6 items-center !px-0">
        <SearchFeedback className="order-2 laptop:order-1 max-w-widget" />
        {!!chunk && (
          <SearchSourceList
            className={classNames(
              'order-1 laptop:order-1 laptop:pt-0.5',
              chunk?.status ? 'laptop:mt-10' : 'laptop:mt-4',
            )}
            sources={chunk?.sources}
            isLoading={isInProgress}
          />
        )}
        <SearchReferralBanner className="order-last" />
      </PageWidgets>
    </div>
  );
}
