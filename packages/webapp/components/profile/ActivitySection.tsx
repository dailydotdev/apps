import React, { Fragment, ReactElement, ReactNode } from 'react';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { typoBody, typoCallout } from '../../styles/typography';
import { focusOutline } from '../../styles/helpers';
import { Connection } from '../../graphql/common';
import { InfiniteQueryObserverBaseResult } from 'react-query';

export const ActivityContainer = styled.section`
  display: flex;
  flex-direction: column;
  margin-top: ${sizeN(10)};
`;

export const ActivitySectionTitle = styled.h2`
  display: flex;
  align-items: center;
  margin: 0 0 ${sizeN(4)};
  color: var(--theme-label-primary);
  font-weight: bold;
  ${typoBody}

  span {
    color: var(--theme-label-secondary);
    font-weight: normal;
    margin-left: ${sizeN(1)};
  }
`;

const LoadMore = styled.button`
  margin-top: ${sizeN(3)};
  align-self: flex-start;
  padding: 0;
  background: none;
  border: none;
  color: var(--theme-label-link);
  cursor: pointer;
  ${typoCallout}
  ${focusOutline}
`;

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
        {count >= 0 && <span>({count})</span>}
      </ActivitySectionTitle>
      {showEmptyScreen && emptyScreen}
      {query.data?.pages?.map((page) => (
        <Fragment key={page.page.pageInfo.endCursor}>
          {page.page.edges.map(({ node }) => elementToNode(node))}
        </Fragment>
      ))}
      {query.hasNextPage && (
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
