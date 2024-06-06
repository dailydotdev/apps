import React, { Fragment, ReactElement, ReactNode } from 'react';
import { InfiniteQueryObserverBaseResult } from '@tanstack/react-query';
import { Connection } from '../../graphql/common';
import classed from '../../lib/classed';
import { ClickableText } from '../buttons/ClickableText';
import { IconSize } from '../Icon';

export const ActivityContainer = classed('section', 'flex flex-col');

export const ActivitySectionTitle = classed(
  'h2',
  'flex items-center mb-4 text-text-primary font-bold typo-body',
);

export const ActivitySectionSubTitle = classed(
  'span',
  'flex flex-row mt-1 text-text-tertiary typo-callout font-normal',
);

export const ActivitySectionTitleStat = classed(
  'span',
  'ml-1 text-text-secondary font-normal',
);

interface ActivitySectionHeaderProps {
  title: string;
  subtitle?: string;
  clickableTitle?: string;
  link?: string;
  children?: ReactNode;
  Icon?: React.ElementType;
}

export const ActivitySectionHeader = ({
  title,
  subtitle,
  clickableTitle,
  link,
  children,
  Icon,
}: ActivitySectionHeaderProps): ReactElement => {
  return (
    <ActivitySectionTitle>
      <span className="flex flex-col">
        <span className="flex align-middle">
          {Icon && <Icon size={IconSize.Small} secondary className="mr-2" />}
          {title}
        </span>
        {subtitle && (
          <ActivitySectionSubTitle>
            {subtitle}
            {clickableTitle && (
              <ClickableText
                tag="a"
                target="_blank"
                className="ml-1"
                href={link}
              >
                {clickableTitle}
              </ClickableText>
            )}
          </ActivitySectionSubTitle>
        )}
      </span>
      {children}
    </ActivitySectionTitle>
  );
};

export const LoadMore = classed(
  'button',
  'mt-3 self-start p-0 bg-none border-none text-text-link cursor-pointer typo-callout font-outline',
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
