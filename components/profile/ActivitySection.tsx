import React, { Fragment, ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import { size1, size10, size3, size4 } from '../../styles/sizes';
import { typoDouble, typoLil1 } from '../../styles/typography';
import { colorWater50 } from '../../styles/colors';
import { focusOutline } from '../../styles/helpers';
import { InfiniteQueryResult } from 'react-query/types/core/types';
import { Connection } from '../../graphql/common';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  margin-top: ${size10};
`;

const SectionTitle = styled.h2`
  display: flex;
  margin: 0 0 ${size4};
  color: var(--theme-primary);
  ${typoDouble}

  span {
    color: var(--theme-secondary);
    font-weight: normal;
    margin-left: ${size1};
  }
`;

const LoadMore = styled.button`
  margin-top: ${size3};
  align-self: flex-start;
  padding: 0;
  background: none;
  border: none;
  color: ${colorWater50};
  cursor: pointer;
  ${typoLil1}
  ${focusOutline}

  &:hover,
  &:active {
    color: ${colorWater50};
  }
`;

export interface ActivitySectionProps<TElement, TError> {
  title: string;
  count?: number;
  query: InfiniteQueryResult<{ page: Connection<TElement> }, TError>;
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
    !query.isFetchingMore &&
    !query.isLoading &&
    !query.data?.[0]?.page?.edges.length;
  const showLoadMore =
    !showEmptyScreen &&
    !query.isLoading &&
    !query.isFetchingMore &&
    query.canFetchMore;

  return (
    <Section>
      <SectionTitle>
        {title}
        {count >= 0 && <span>({count})</span>}
      </SectionTitle>
      {showEmptyScreen && emptyScreen}
      {query.data?.map((page) => (
        <Fragment key={page.page.pageInfo.endCursor}>
          {page.page.edges.map(({ node }) => elementToNode(node))}
        </Fragment>
      ))}
      {showLoadMore && (
        <LoadMore onClick={() => query.fetchMore()}>Load more ▸</LoadMore>
      )}
    </Section>
  );
}
