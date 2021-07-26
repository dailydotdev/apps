import React, { Fragment, ReactElement, ReactNode } from 'react';
import { InfiniteQueryObserverBaseResult } from 'react-query';
import { Connection } from '../../graphql/common';
import classed from '../../lib/classed';

export const ActivityContainer = classed('section', 'flex flex-col mt-10');

export const ActivitySectionTitle = classed(
  'h2',
  'flex items-center mb-4 text-theme-label-primary font-bold typo-body',
);
export const ActivitySectionTitleStat = classed(
  'span',
  'ml-1 text-theme-label-secondary font-normal',
);

export const LoadMore = classed(
  'button',
  'mt-3 self-start p-0 bg-none border-none text-theme-label-link cursor-pointer typo-callout font-outline',
);

export interface ActivitySectionProps<TElement, TError> {
  title: string;
  count?: number;
  query: InfiniteQueryObserverBaseResult<
    { page: Connection<TElement> },
    TError
  >;
  emptyScreen: ReactNode;
  elementToNode: (element: TElement) => ReactNode;
}

export default function ActivitySection<TElement, TError>({
  title,
  count,
  query,
  emptyScreen,
  elementToNode,
}: ActivitySectionProps<TElement, TError>): ReactElement {
  const showEmptyScreen =
    !query.isFetchingNextPage &&
    !query.isLoading &&
    !query?.data?.pages?.[0]?.page?.edges.length;
  const showLoadMore =
    !query.isLoading && !query.isFetchingNextPage && query.hasNextPage;

  return (
    <ActivityContainer>
      <ActivitySectionTitle>
        {title}
        {count >= 0 && (
          <ActivitySectionTitleStat>({count})</ActivitySectionTitleStat>
        )}
      </ActivitySectionTitle>
      {showEmptyScreen && emptyScreen}
      {!showEmptyScreen &&
        query.data?.pages?.map((page) => (
          <Fragment key={page.page.pageInfo.endCursor}>
            {page.page.edges.map(({ node }) => elementToNode(node))}
          </Fragment>
        ))}
      {!showEmptyScreen && query.hasNextPage && (
        <LoadMore
          onClick={() => query.fetchNextPage()}
          style={{ visibility: showLoadMore ? 'unset' : 'hidden' }}
        >
          Load more ▸
        </LoadMore>
      )}
    </ActivityContainer>
  );
}
