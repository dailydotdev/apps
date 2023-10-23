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
  onSubmit(event: React.MouseEvent, value: string): void;
}

export function SearchContainer({
  children,
  onSubmit,
  isLoading,
  chunk,
}: SearchContainerProps): React.ReactElement {
  const content = chunk?.response || '';

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
        {!!content && (
          <SearchSourceList
            className={classNames(
              'order-1 laptop:order-1',
              chunk?.status && 'laptop:mt-6 laptop:pt-0.5',
            )}
            sources={chunk?.sources}
            isLoading={isLoading}
          />
        )}
        <SearchReferralBanner className="order-last" />
      </PageWidgets>
    </div>
  );
}
