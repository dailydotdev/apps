import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import classNames from 'classnames';
import { format } from 'date-fns';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { getLastActivityDateFormat } from '../../lib/dateFormat';
import { MiniCloseIcon } from '../icons';
import { Chip } from '../cards/common/PostTags';
import { useOpportunityPreviewContext } from '../../features/opportunity/context/OpportunityPreviewContext';
import type { OpportunityPreviewUser } from '../../features/opportunity/types';
import { cloudinarySquadsImageFallback } from '../../lib/image';
import { getExperienceLevelLabel } from '../../lib/user';

const columnHelper = createColumnHelper<OpportunityPreviewUser>();

const columns = [
  columnHelper.display({
    id: 'profileImage',
    header: 'Preview',
    cell: (info) => {
      const user = info.row.original;
      return (
        <div className="relative size-10 flex-shrink-0 overflow-hidden rounded-12">
          {user.profileImage && (
            <img
              src={user.profileImage}
              alt={user.anonId}
              className="size-full object-cover blur-sm"
            />
          )}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'preview',
    header: () => null,
    cell: (info) => {
      const user = info.row.original;
      return (
        <Typography type={TypographyType.Callout} bold>
          {user.anonId}
        </Typography>
      );
    },
  }),
  columnHelper.accessor('openToWork', {
    header: 'Open to work',
    cell: (info) => (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {info.getValue() ? 'Yes' : 'No'}
      </Typography>
    ),
  }),
  columnHelper.accessor('seniority', {
    header: 'Seniority',
    cell: (info) => {
      const value = info.getValue();
      return (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {getExperienceLevelLabel(value) ?? '-'}
        </Typography>
      );
    },
  }),
  columnHelper.accessor('location', {
    header: 'Location',
    cell: (info) => (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {info.getValue() || '-'}
      </Typography>
    ),
  }),
  columnHelper.accessor('company', {
    header: 'Company',
    cell: (info) => {
      const company = info.getValue();
      if (!company) {
        return (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            -
          </Typography>
        );
      }
      return (
        <div className="flex items-center gap-2">
          {company.favicon && (
            <img
              src={company.favicon}
              alt={company.name}
              className="size-4 rounded-2"
            />
          )}
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {company.name}
          </Typography>
        </div>
      );
    },
  }),
  columnHelper.accessor('lastActivity', {
    header: 'Last activity',
    cell: (info) => {
      const value = info.getValue();
      if (!value) {
        return (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            -
          </Typography>
        );
      }

      const relativeTime = getLastActivityDateFormat(value);
      const isNow = relativeTime === 'Now';

      if (isNow) {
        return (
          <div className="inline-flex items-center rounded-6 bg-action-upvote-float p-1">
            <Typography type={TypographyType.Footnote}>Active now</Typography>
          </div>
        );
      }

      return (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {relativeTime}
        </Typography>
      );
    },
  }),
];

const ChipSection = ({
  label,
  items,
}: {
  label: string;
  items: ReactElement[];
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <Typography
        type={TypographyType.Footnote}
        tag={TypographyTag.P}
        bold
        color={TypographyColor.Tertiary}
      >
        {label}
      </Typography>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Chip key={`chip-${index}`} className="!my-0 !h-auto py-1">
            {item}
          </Chip>
        ))}
      </div>
    </div>
  );
};

export const AnonymousUserTable = () => {
  const contextData = useOpportunityPreviewContext();
  const [showInfoBar, setShowInfoBar] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Extract users from context data
  const tableData = useMemo<OpportunityPreviewUser[]>(() => {
    if (!contextData?.edges) {
      return [];
    }
    return contextData.edges.map((edge) => edge.node);
  }, [contextData]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead>
          <tr>
            {table.getHeaderGroups()[0].headers.map((header, index) => {
              // Skip the second header (username column) as it will be covered by the first
              if (index === 1) {
                return null;
              }

              return (
                <th
                  key={header.id}
                  colSpan={index === 0 ? 2 : 1}
                  className="border-b border-border-subtlest-tertiary p-4 text-left"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              );
            })}
          </tr>
        </thead>
        {showInfoBar && (
          <tbody>
            <tr>
              <td colSpan={table.getAllColumns().length}>
                <div className="flex items-center justify-between border-b border-border-subtlest-tertiary bg-background-subtle px-4 py-3">
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    Chosen from daily.dev&apos;s active network using engagement
                    and intent signals.
                  </Typography>
                  <button
                    type="button"
                    onClick={() => setShowInfoBar(false)}
                    className="flex items-center justify-center text-text-tertiary hover:text-text-primary"
                    aria-label="Dismiss"
                  >
                    <MiniCloseIcon />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        )}
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const visibleCells = row.getVisibleCells();
            const isExpanded = expandedRows.has(row.id);
            const user = row.original;
            const isHovered = hoveredRow === row.id;

            return (
              <React.Fragment key={row.id}>
                <tr
                  onClick={() => toggleRow(row.id)}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={classNames(
                    'cursor-pointer',
                    isHovered && 'bg-surface-hover',
                  )}
                >
                  {visibleCells.map((cell, index) => (
                    <td
                      key={cell.id}
                      className={classNames(
                        'px-4 pt-3',
                        index === 0 &&
                          'border-b border-border-subtlest-tertiary p-3 align-top',
                      )}
                      rowSpan={index === 0 ? 2 : 1}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
                <tr
                  onClick={() => toggleRow(row.id)}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={classNames(
                    'cursor-pointer',
                    isHovered && 'bg-surface-hover',
                  )}
                >
                  <td
                    colSpan={visibleCells.length - 1}
                    className="border-b border-border-subtlest-tertiary px-4 pb-3 pt-1"
                  >
                    <div className="flex flex-col gap-2">
                      {user.description && (
                        <Typography
                          type={TypographyType.Footnote}
                          color={TypographyColor.Tertiary}
                          className={classNames(!isExpanded && 'line-clamp-1')}
                        >
                          {user.description}
                        </Typography>
                      )}

                      {isExpanded && (
                        <>
                          <ChipSection
                            label="Top tags"
                            items={user.topTags.map((tag) => (
                              <div key={tag}>#{tag}</div>
                            ))}
                          />
                          <ChipSection
                            label="Recently read"
                            items={user.recentlyRead?.map((badge) => {
                              const formattedDate = format(
                                new Date(badge.issuedAt),
                                'MMM yyyy',
                              );
                              return (
                                <div
                                  key={badge.keyword.value}
                                >{`${badge.keyword.value} - ${formattedDate}`}</div>
                              );
                            })}
                          />
                          <ChipSection
                            label="Active squads"
                            items={user.activeSquads.map((squad) => (
                              <div className="flex gap-2" key={squad.handle}>
                                <img
                                  src={cloudinarySquadsImageFallback}
                                  className="size-4 rounded-full"
                                  alt={squad.image}
                                />
                                <Typography
                                  type={TypographyType.Footnote}
                                  color={TypographyColor.Tertiary}
                                >
                                  {squad.handle}
                                </Typography>
                              </div>
                            ))}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
