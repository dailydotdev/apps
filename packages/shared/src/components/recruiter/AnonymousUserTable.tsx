import React, { useMemo, useState } from 'react';
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
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { getLastActivityDateFormat } from '../../lib/dateFormat';
import { MiniCloseIcon } from '../icons';
import { Chip } from '../cards/common/PostTags';

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
  topTags?: string[];
  recentlyRead?: string[];
  activeSquads?: string[];
};

const columnHelper = createColumnHelper<AnonymousUser>();

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
      const relativeTime = getLastActivityDateFormat(info.getValue());
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

export type AnonymousUserTableProps = {
  data?: AnonymousUser[];
};

const ChipSection = ({ label, items }: { label: string; items: string[] }) => {
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
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip key={item} className="!my-0">
            {item}
          </Chip>
        ))}
      </div>
    </div>
  );
};

export const AnonymousUserTable = ({
  data: propData,
}: AnonymousUserTableProps) => {
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

  const defaultData = useMemo<AnonymousUser[]>(
    () => [
      {
        id: '1',
        profileImage: 'https://i.pravatar.cc/150?img=1',
        anonId: 'Anon #1002',
        description:
          'A web developer with a strong focus on modern web technologies, performance optimization, and efficient development workflows. They are particularly interested in JavaScript/TypeScript runtimes (Bun), front-end frameworks (React, Vue.js, TanStack Start, Docusaurus, Astro), and UI component libraries (Reka UI), prioritizing accessibility and customization. Their curiosity extends to alternative programming languages like SmallJS and the critical analysis of web architecture, including HTML and the DOM. On the backend, they follow Node.js application servers (Watt 3) and are interested in Rust-based runtimes.',
        openToWork: true,
        seniority: 'Senior',
        location: 'San Francisco, CA',
        company: {
          name: 'TechCorp',
          favicon: 'https://www.google.com/s2/favicons?domain=techcrunch.com',
        },
        lastActivity: new Date(),
        topTags: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Bun'],
        recentlyRead: [
          'Modern Web Development',
          'Performance Optimization',
          'Accessibility Best Practices',
        ],
        activeSquads: ['Frontend Developers', 'TypeScript Community', 'React'],
      },
      {
        id: '2',
        profileImage: 'https://i.pravatar.cc/150?img=5',
        anonId: 'Anon #1045',
        description:
          'An experienced full-stack engineer passionate about building scalable applications and exploring cutting-edge technologies. They have deep expertise in cloud infrastructure, microservices architecture, and DevOps practices. Their interests span across backend systems (Go, Python, Rust), container orchestration (Kubernetes, Docker), and serverless architectures. They actively contribute to open-source projects and enjoy mentoring junior developers.',
        openToWork: true,
        seniority: 'Mid-level',
        location: 'New York, NY',
        company: {
          name: 'StartupXYZ',
          favicon: 'https://www.google.com/s2/favicons?domain=github.com',
        },
        lastActivity: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        topTags: ['Go', 'Kubernetes', 'Python', 'AWS', 'Docker'],
        recentlyRead: [
          'Microservices Architecture',
          'Cloud Native Development',
          'DevOps',
        ],
        activeSquads: ['Backend Engineering', 'Cloud Native', 'DevOps'],
      },
      {
        id: '3',
        profileImage: 'https://i.pravatar.cc/150?img=8',
        anonId: 'Anon #1078',
        description:
          'A creative frontend specialist with a keen eye for design and user experience. They excel at building beautiful, accessible, and performant user interfaces using modern frameworks and design systems. Their expertise includes advanced CSS techniques, animation libraries, and responsive design patterns. They are passionate about creating inclusive web experiences and staying current with the latest design trends and best practices.',
        openToWork: false,
        seniority: 'Senior',
        location: 'Austin, TX',
        company: {
          name: 'DesignHub',
          favicon: 'https://www.google.com/s2/favicons?domain=figma.com',
        },
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        topTags: ['CSS', 'UI/UX', 'Figma', 'Animation', 'Accessibility'],
        recentlyRead: ['Design Systems', 'CSS Architecture', 'Web Animations'],
        activeSquads: ['UI/UX Designers', 'Frontend', 'Design Systems'],
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
                      <Typography
                        type={TypographyType.Footnote}
                        color={TypographyColor.Tertiary}
                        className={classNames(!isExpanded && 'line-clamp-1')}
                      >
                        {user.description}
                      </Typography>

                      {isExpanded && (
                        <>
                          <ChipSection label="Top tags" items={user.topTags} />
                          <ChipSection
                            label="Recently read"
                            items={user.recentlyRead}
                          />
                          <ChipSection
                            label="Active squads"
                            items={user.activeSquads}
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
