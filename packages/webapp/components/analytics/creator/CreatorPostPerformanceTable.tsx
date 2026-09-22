import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib';
import { getPostTitle } from '@dailydotdev/shared/src/graphql/posts';
import {
  TimeFormatType,
  formatDate,
} from '@dailydotdev/shared/src/lib/dateFormat';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import type { CreatorPostPerformance } from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import {
  CreatorPostSortBy,
  CreatorPostSortOrder,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import { unknownValueLabel } from './common';

export interface CreatorPostSort {
  sortBy: CreatorPostSortBy;
  order: CreatorPostSortOrder;
}

interface CreatorPostPerformanceTableProps {
  posts: CreatorPostPerformance[];
  sort: CreatorPostSort;
  onSortChange: (sort: CreatorPostSort) => void;
  isPending: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

type Column = {
  key: CreatorPostSortBy;
  label: string;
  /** Screen-reader description of what sorting this column means. */
  numeric: boolean;
};

const columns: Column[] = [
  { key: CreatorPostSortBy.PublishedAt, label: 'Published', numeric: false },
  { key: CreatorPostSortBy.Impressions, label: 'Impressions', numeric: true },
  { key: CreatorPostSortBy.Upvotes, label: 'Upvotes', numeric: true },
  { key: CreatorPostSortBy.Comments, label: 'Comments', numeric: true },
  {
    key: CreatorPostSortBy.OutboundVisits,
    label: 'Outbound visits',
    numeric: true,
  },
];

const cellClassName = 'px-2 py-3 align-middle';

const getCreatorPostImage = ({
  image,
  sharedPost,
}: CreatorPostPerformance['post']): string =>
  sharedPost?.image || image || cloudinaryPostImageCoverPlaceholder;

const getCreatorPostDisplayTitle = (
  post: CreatorPostPerformance['post'],
): string => getPostTitle(post) || 'Untitled';

const sortState = (
  isActive: boolean,
  isDescending: boolean,
): 'descending' | 'ascending' | 'none' => {
  if (!isActive) {
    return 'none';
  }

  return isDescending ? 'descending' : 'ascending';
};

const SortableHeader = ({
  column,
  sort,
  onSortChange,
}: {
  column: Column;
  sort: CreatorPostSort;
  onSortChange: (sort: CreatorPostSort) => void;
}): ReactElement => {
  const isActive = sort.sortBy === column.key;
  const isDescending = sort.order === CreatorPostSortOrder.Desc;

  return (
    <th
      scope="col"
      // `aria-sort` belongs on the header cell, so a screen reader announces
      // the current ordering when it reaches the column rather than only when
      // the button is focused.
      aria-sort={sortState(isActive, isDescending)}
      className={classNames(
        cellClassName,
        'whitespace-nowrap font-normal',
        column.numeric ? 'text-right' : 'text-left',
      )}
    >
      <button
        type="button"
        onClick={() =>
          onSortChange({
            sortBy: column.key,
            // Re-picking the active column flips it; a new column starts
            // descending, which is what "best first" means for every metric
            // here, publication date included.
            order:
              isActive && isDescending
                ? CreatorPostSortOrder.Asc
                : CreatorPostSortOrder.Desc,
          })
        }
        className={classNames(
          'focus-outline inline-flex items-center gap-1 rounded-8 px-1 py-0.5 hover:text-text-primary',
          column.numeric && 'flex-row-reverse',
          isActive ? 'text-text-primary' : 'text-text-tertiary',
        )}
      >
        <Typography
          type={TypographyType.Footnote}
          tag={TypographyTag.Span}
          bold={isActive}
        >
          {column.label}
        </Typography>
        {isActive && (
          <ArrowIcon
            size={IconSize.XXSmall}
            className={classNames(!isDescending && 'rotate-180')}
            aria-hidden
          />
        )}
      </button>
    </th>
  );
};

const MetricCell = ({
  value,
  unknownReason,
}: {
  value: number | null;
  unknownReason: string;
}): ReactElement => (
  <td className={classNames(cellClassName, 'text-right')}>
    {value === null ? (
      <Tooltip content={unknownReason}>
        <span className="text-text-tertiary" aria-label={unknownReason}>
          {unknownValueLabel}
        </span>
      </Tooltip>
    ) : (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        tag={TypographyTag.Span}
      >
        {largeNumberFormat(value)}
      </Typography>
    )}
  </td>
);

const SkeletonRows = (): ReactElement => (
  <>
    {Array.from({ length: 5 }, (_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <tr key={index}>
        <td className={cellClassName} colSpan={columns.length + 1}>
          <ElementPlaceholder className="h-10 w-full rounded-8" />
        </td>
      </tr>
    ))}
  </>
);

export const CreatorPostPerformanceTable = ({
  posts,
  sort,
  onSortChange,
  isPending,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: CreatorPostPerformanceTableProps): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse text-left">
        <caption className="sr-only">
          Your posts and how they performed in the selected period, sortable by
          column.
        </caption>
        <thead>
          <tr className="border-b border-border-subtlest-tertiary">
            <th
              scope="col"
              className={classNames(cellClassName, 'font-normal')}
            >
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                tag={TypographyTag.Span}
              >
                Post
              </Typography>
            </th>
            {columns.map((column) => (
              <SortableHeader
                key={column.key}
                column={column}
                sort={sort}
                onSortChange={onSortChange}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {isPending && <SkeletonRows />}
          {!isPending &&
            posts.map((row) => {
              const title = getCreatorPostDisplayTitle(row.post);

              return (
                <tr
                  key={row.id}
                  className="border-b border-border-subtlest-tertiary last:border-b-0"
                >
                  <td className={classNames(cellClassName, 'min-w-0')}>
                    <Link href={`${webappUrl}posts/${row.post.id}/analytics`}>
                      <a className="focus-outline flex min-w-0 items-center gap-3 hover:underline">
                        <LazyImage
                          imgSrc={getCreatorPostImage(row.post)}
                          imgAlt=""
                          ratio="52%"
                          className="h-10 w-16 flex-shrink-0 rounded-8 object-cover"
                          fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                        />
                        <Typography
                          type={TypographyType.Callout}
                          color={TypographyColor.Primary}
                          className="min-w-0 flex-1"
                          tag={TypographyTag.Span}
                          truncate
                        >
                          {title}
                        </Typography>
                      </a>
                    </Link>
                  </td>
                  <td
                    className={classNames(cellClassName, 'whitespace-nowrap')}
                  >
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      tag={TypographyTag.Span}
                    >
                      {formatDate({
                        value: row.post.createdAt,
                        type: TimeFormatType.Post,
                      })}
                    </Typography>
                  </td>
                  <MetricCell
                    value={row.impressions}
                    unknownReason="This post predates daily impressions history, so its impressions for this period are unknown."
                  />
                  <MetricCell
                    value={row.upvotes}
                    unknownReason="Unknown for this period."
                  />
                  <td className={classNames(cellClassName, 'text-right')}>
                    {/* The comment count is the way into the discussion, so it
                        is the link rather than sitting next to one. */}
                    <Link href={row.post.commentsPermalink}>
                      <a
                        className="focus-outline rounded-8 hover:underline"
                        aria-label={`Open the discussion on ${title}`}
                      >
                        <Typography
                          type={TypographyType.Callout}
                          color={TypographyColor.Primary}
                          tag={TypographyTag.Span}
                        >
                          {largeNumberFormat(row.comments)}
                        </Typography>
                      </a>
                    </Link>
                  </td>
                  <MetricCell
                    value={row.outboundVisits}
                    unknownReason="Unknown for this post."
                  />
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
    {hasNextPage && (
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        onClick={() => fetchNextPage()}
        loading={isFetchingNextPage}
        className="mx-auto"
      >
        Load more
      </Button>
    )}
  </div>
);
