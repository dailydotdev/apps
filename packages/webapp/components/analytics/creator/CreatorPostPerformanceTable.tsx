import type { ReactElement, ReactNode } from 'react';
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
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
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
import { getPostPath } from '@dailydotdev/shared/src/lib/links';
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
  /** Shorter label for the stacked mobile row, where four metrics share a line. */
  shortLabel?: string;
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
    shortLabel: 'Visits',
    numeric: true,
  },
];

const [publishedColumn, ...metricColumns] = columns;

const cellClassName = 'px-2 laptop:py-3 laptop:align-middle';

const columnLabel = (key: CreatorPostSortBy): string =>
  columns.find((column) => column.key === key)?.label ?? '';

const getNextSort = (
  sort: CreatorPostSort,
  sortBy: CreatorPostSortBy,
): CreatorPostSort => ({
  sortBy,
  // Re-picking the active column flips it; a new column starts descending,
  // which is what "best first" means for every metric here, publication date
  // included.
  order:
    sort.sortBy === sortBy && sort.order === CreatorPostSortOrder.Desc
      ? CreatorPostSortOrder.Asc
      : CreatorPostSortOrder.Desc,
});

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
  prefix,
}: {
  column: Column;
  sort: CreatorPostSort;
  onSortChange: (sort: CreatorPostSort) => void;
  prefix?: ReactNode;
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
      {prefix}
      <button
        type="button"
        onClick={() => onSortChange(getNextSort(sort, column.key))}
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

// Below laptop the header row is hidden and each row stacks, so every metric
// carries its own label.
const MetricCellLabel = ({ column }: { column: Column }): ReactElement => (
  <Typography
    type={TypographyType.Caption2}
    color={TypographyColor.Tertiary}
    tag={TypographyTag.Span}
    className="block truncate laptop:hidden"
    aria-hidden
  >
    {column.shortLabel ?? column.label}
  </Typography>
);

const metricCellClassName = classNames(
  cellClassName,
  'min-w-0 pb-3 laptop:text-right',
);

const MetricCell = ({
  column,
  value,
  unknownReason,
}: {
  column: Column;
  value: number | null;
  unknownReason: string;
}): ReactElement => (
  <td className={metricCellClassName}>
    <MetricCellLabel column={column} />
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

// Column headers sort the table on laptop; the stacked rows below that have
// no header row, so the same sorting lives in a dropdown.
const SortSelect = ({
  sort,
  onSortChange,
}: {
  sort: CreatorPostSort;
  onSortChange: (sort: CreatorPostSort) => void;
}): ReactElement => {
  const label = columnLabel(sort.sortBy);
  const isDescending = sort.order === CreatorPostSortOrder.Desc;

  return (
    <div className="flex justify-end laptop:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            aria-label={`Sorted by ${label}, ${
              isDescending ? 'descending' : 'ascending'
            }. Change sort.`}
            icon={
              <ArrowIcon
                size={IconSize.XSmall}
                className={classNames(!isDescending && 'rotate-180')}
              />
            }
            iconPosition={ButtonIconPosition.Right}
          >
            {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {columns.map((column) => (
            <DropdownMenuItem
              key={column.key}
              onClick={() => onSortChange(getNextSort(sort, column.key))}
              aria-current={column.key === sort.sortBy}
            >
              {column.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const SkeletonRows = (): ReactElement => (
  <>
    {Array.from({ length: 5 }, (_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <tr key={index} className="block laptop:table-row">
        <td
          className={classNames(cellClassName, 'block py-2 laptop:table-cell')}
          colSpan={columns.length}
        >
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
    <SortSelect sort={sort} onSortChange={onSortChange} />
    <div>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Your posts and how they performed in the selected period, sortable by
          column.
        </caption>
        <thead className="hidden laptop:table-header-group">
          <tr className="border-b border-border-subtlest-tertiary">
            {/* The publish date sits under each title, so the post column
                sorts by it rather than spending a column of its own. */}
            <SortableHeader
              column={publishedColumn}
              sort={sort}
              onSortChange={onSortChange}
              prefix={
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  tag={TypographyTag.Span}
                  className="mr-2"
                >
                  Post ·
                </Typography>
              }
            />
            {metricColumns.map((column) => (
              <SortableHeader
                key={column.key}
                column={column}
                sort={sort}
                onSortChange={onSortChange}
              />
            ))}
          </tr>
        </thead>
        <tbody className="block laptop:table-row-group">
          {isPending && <SkeletonRows />}
          {!isPending &&
            posts.map((row) => {
              const title = getCreatorPostDisplayTitle(row.post);

              return (
                <tr
                  key={row.id}
                  className="grid grid-cols-4 border-b border-border-subtlest-tertiary last:border-b-0 laptop:table-row"
                >
                  {/* `max-w-0` with `w-full` lets the title column take the
                      spare width and wrap, instead of a long title
                      pushing the metrics out of view. */}
                  <td
                    className={classNames(
                      cellClassName,
                      'col-span-4 min-w-0 pb-2 pt-3 laptop:w-full laptop:max-w-0',
                    )}
                  >
                    <Link href={`${webappUrl}posts/${row.post.id}/analytics`}>
                      <a className="focus-outline group flex min-w-0 items-center gap-3">
                        <LazyImage
                          imgSrc={getCreatorPostImage(row.post)}
                          imgAlt=""
                          ratio="52%"
                          className="h-10 w-16 flex-shrink-0 rounded-8 object-cover"
                          fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <Typography
                            type={TypographyType.Callout}
                            color={TypographyColor.Primary}
                            className="line-clamp-2 break-words group-hover:underline"
                            tag={TypographyTag.Span}
                          >
                            {title}
                          </Typography>
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
                        </span>
                      </a>
                    </Link>
                  </td>
                  <MetricCell
                    column={metricColumns[0]}
                    value={row.impressions}
                    unknownReason="This post predates daily impressions history, so its impressions for this period are unknown."
                  />
                  <MetricCell
                    column={metricColumns[1]}
                    value={row.upvotes}
                    unknownReason="Unknown for this period."
                  />
                  <td className={metricCellClassName}>
                    <MetricCellLabel column={metricColumns[2]} />
                    {/* The comment count is the way into the discussion, so it
                        is the link rather than sitting next to one. */}
                    <Link href={getPostPath(row.post)}>
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
                    column={metricColumns[3]}
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
