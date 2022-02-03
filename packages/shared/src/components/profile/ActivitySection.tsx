import React, { Fragment, ReactElement, ReactNode } from 'react';
import { InfiniteQueryObserverBaseResult } from 'react-query';
import { Connection } from '../../graphql/common';
import classed from '../../lib/classed';
import { ClickableText } from '../buttons/ClickableText';

export const ActivityContainer = classed('section', 'flex flex-col mt-10');

export const ActivitySectionTitle = classed(
  'h2',
  'flex items-center mb-4 text-theme-label-primary font-bold typo-body',
);

export const ActivitySectionSubTitle = classed(
  'span',
  'flex flex-row mt-1 text-theme-label-tertiary typo-callout font-normal',
);

export const ActivitySectionTitleStat = classed(
  'span',
  'ml-1 text-theme-label-secondary font-normal',
);

interface ActivitySectionHeaderProps {
  title: string;
  subtitle: string;
  clickableTitle: string;
  link: string;
  children?: ReactNode;
}

export const ActivitySectionHeader = ({
  title,
  subtitle,
  clickableTitle,
  link,
  children,
}: ActivitySectionHeaderProps): ReactElement => {
  return (
    <ActivitySectionTitle>
      <span className="flex flex-col">
        {title}
        <ActivitySectionSubTitle>
          {subtitle}
          <ClickableText tag="a" target="_blank" className="ml-1" href={link}>
            {clickableTitle}
          </ClickableText>
        </ActivitySectionSubTitle>
      </span>
      {children}
    </ActivitySectionTitle>
  );
};

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
