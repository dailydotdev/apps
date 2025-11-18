import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

export type AnonymousUser = {
  id: string;
  profileImage: string;
  anonId: string;
  description: string;
  openToWork: boolean;
  seniority: string;
  location: string;
  company: {
    name: string;
    favicon?: string;
  };
  lastActivity: Date;
};

const columnHelper = createColumnHelper<AnonymousUser>();

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'now';
  }
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} min ago`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  }
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const columns = [
  columnHelper.display({
    id: 'profileImage',
    header: 'Preview 20',
    cell: (info) => {
      const user = info.row.original;
      return (
        <div className="relative size-10 flex-shrink-0 overflow-hidden rounded-12">
          <img
            src={user.profileImage}
            alt={user.anonId}
            className="size-full object-cover blur-sm"
          />
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
    cell: (info) => (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {info.getValue()}
      </Typography>
    ),
  }),
  columnHelper.accessor('location', {
    header: 'Location',
    cell: (info) => (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {info.getValue()}
      </Typography>
    ),
  }),
  columnHelper.accessor('company', {
    header: 'Company',
    cell: (info) => {
      const company = info.getValue();
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
      const relativeTime = getRelativeTime(info.getValue());
      const isNow = relativeTime === 'now';

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

export type AnonymousUserTableProps = {
  data?: AnonymousUser[];
};

export const AnonymousUserTable = ({
  data: propData,
}: AnonymousUserTableProps) => {
  const defaultData = useMemo<AnonymousUser[]>(
    () => [
      {
        id: '1',
        profileImage: 'https://i.pravatar.cc/150?img=1',
        anonId: 'Anon #1002',
        description: 'Senior engineer with 8+ years in React and Node.js',
        openToWork: true,
        seniority: 'Senior',
        location: 'San Francisco, CA',
        company: {
          name: 'TechCorp',
          favicon: 'https://www.google.com/s2/favicons?domain=techcrunch.com',
        },
        lastActivity: new Date(),
      },
      {
        id: '2',
        profileImage: 'https://i.pravatar.cc/150?img=5',
        anonId: 'Anon #1045',
        description: 'Full-stack developer specializing in TypeScript',
        openToWork: true,
        seniority: 'Mid-level',
        location: 'New York, NY',
        company: {
          name: 'StartupXYZ',
          favicon: 'https://www.google.com/s2/favicons?domain=github.com',
        },
        lastActivity: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      },
      {
        id: '3',
        profileImage: 'https://i.pravatar.cc/150?img=8',
        anonId: 'Anon #1078',
        description: 'Frontend expert passionate about UI/UX design',
        openToWork: false,
        seniority: 'Senior',
        location: 'Austin, TX',
        company: {
          name: 'DesignHub',
          favicon: 'https://www.google.com/s2/favicons?domain=figma.com',
        },
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      },
    ],
    [],
  );

  const data = propData ?? defaultData;

  const table = useReactTable({
    data,
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
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const visibleCells = row.getVisibleCells();
            return (
              <React.Fragment key={row.id}>
                <tr>
                  {visibleCells.map((cell, index) => (
                    <td
                      key={cell.id}
                      className={classNames(
                        'px-4 pt-3',
                        index === 0 &&
                          'border-b border-border-subtlest-tertiary p-3',
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
                <tr>
                  <td
                    colSpan={visibleCells.length - 1}
                    className="border-b border-border-subtlest-tertiary px-4 pb-3 pt-1"
                  >
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {row.original.description}
                    </Typography>
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
