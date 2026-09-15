import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AddUserIcon,
  ArrowIcon,
  BellIcon,
  JobIcon,
  CalendarIcon,
  DiscussIcon,
  HashtagIcon,
  LinkIcon,
  MenuIcon,
  OpenLinkIcon,
  PinIcon,
  PlusIcon,
  SettingsIcon,
  SlackIcon,
  TerminalIcon,
  TrendingIcon,
  UpvoteIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Entry, TeamMember } from './data';
import {
  formatCount,
  formatSince,
  jobs,
  pinnedEntry,
  squad,
  stack,
  team,
} from './data';
import { Avatar, Facepile, Logo, VerifiedMark, Viewer } from './kit';

// Round two vocabulary. The WHOOP rule this round is built on: a page is a
// set of tiles the owner orders by priority, and each tile is a doorway, not
// a destination. No banner and no overlapping avatar (that is the Facebook
// silhouette); brand comes from an ambient glow pulled off the cover, and the
// identity is one row.

const kit2Css = `
/* Cover as light. Blurred far enough that it reads as colour, not as image. */
.sq2-ambient {
  position: absolute;
  left: -10%;
  right: -10%;
  top: -14rem;
  height: 28rem;
  background-size: cover;
  background-position: center;
  filter: blur(90px) saturate(1.4);
  opacity: var(--sq2-ambient, 0.28);
  pointer-events: none;
  -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
}
.sq2-tile {
  transition: border-color 160ms cubic-bezier(0.16, 1, 0.3, 1), transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
}
.sq2-tile:hover { border-color: var(--theme-border-subtlest-secondary); }
.sq2-handle { opacity: 0; transition: opacity 120ms; }
.sq2-tile:hover .sq2-handle { opacity: 1; }
.sq2-shelf { scrollbar-width: none; }
.sq2-shelf::-webkit-scrollbar { display: none; }
.sq2-shelf-fade {
  -webkit-mask-image: linear-gradient(to right, black calc(100% - 4rem), transparent);
  mask-image: linear-gradient(to right, black calc(100% - 4rem), transparent);
}
.sq2-sticky-bar {
  position: sticky;
  top: 0;
  z-index: 2;
  backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--theme-background-default) 82%, transparent);
}
.sq2-rank { font-variant-numeric: tabular-nums; }
`;

export const Kit2Styles = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: kit2Css }} />
);

export const Ambient = ({
  intensity = 0.28,
}: {
  intensity?: number;
}): ReactElement => (
  <div
    aria-hidden
    className="sq2-ambient"
    style={
      {
        backgroundImage: `url(${squad.headerImage})`,
        '--sq2-ambient': intensity,
      } as React.CSSProperties
    }
  />
);

/* --------------------------------------------------------------- identity */

/**
 * One row. Logo, name, meta, the primary action. The facepile is the proof;
 * the numbers live in a tile, not in the header.
 */
export const IdentityRow = ({
  viewer = Viewer.Visitor,
  size = 'md',
  className,
}: {
  viewer?: Viewer;
  size?: 'sm' | 'md';
  className?: string;
}): ReactElement => (
  <div className={classNames('relative flex items-center gap-4', className)}>
    <Logo size={size === 'sm' ? 2.75 : 4} ring={false} />
    <div className="flex min-w-0 flex-1 flex-col">
      <h1
        className={classNames(
          'flex items-center gap-2 font-bold text-text-primary',
          size === 'sm' ? 'typo-title3' : 'typo-title2',
        )}
      >
        {squad.name}
        <VerifiedMark label={false} />
      </h1>
      <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
        <span>@{squad.handle}</span>
        <span className="text-text-quaternary">·</span>
        <span className="text-text-link">{squad.category}</span>
        <span className="text-text-quaternary">·</span>
        <Facepile size={1.125} max={4} count={squad.membersCount} />
      </div>
    </div>
    <PrimaryActions viewer={viewer} size={size} />
  </div>
);

export const PrimaryActions = ({
  viewer = Viewer.Visitor,
  size = 'md',
}: {
  viewer?: Viewer;
  size?: 'sm' | 'md';
}): ReactElement => {
  const buttonSize = size === 'sm' ? ButtonSize.Small : ButtonSize.Medium;

  return (
    <div className="flex items-center gap-2">
      {viewer === Viewer.Visitor ? (
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={buttonSize}
        >
          Join
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.Primary}
          size={buttonSize}
          icon={<PlusIcon />}
        >
          Post
        </Button>
      )}
      {viewer === Viewer.Admin && (
        <Button
          variant={ButtonVariant.Float}
          size={buttonSize}
          icon={<AddUserIcon />}
        >
          Invite
        </Button>
      )}
      {viewer !== Viewer.Visitor && (
        <Button
          variant={ButtonVariant.Float}
          size={buttonSize}
          icon={<BellIcon />}
          aria-label="Notifications"
        />
      )}
      <Button
        variant={ButtonVariant.Float}
        size={buttonSize}
        icon={<MenuIcon />}
        aria-label="More"
      />
    </div>
  );
};

/* ------------------------------------------------------------------ tiles */

/**
 * The module. Header is an icon and a title; the body is at most three rows;
 * the whole tile opens the full view. Admins see the drag handle on hover.
 */
export const Tile = ({
  icon,
  title,
  meta,
  children,
  admin = false,
  flat = false,
  className,
  bodyClassName,
  style,
}: {
  icon?: ReactNode;
  title?: string;
  meta?: ReactNode;
  children: ReactNode;
  admin?: boolean;
  /** Hairline section rather than a card. */
  flat?: boolean;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
}): ReactElement => (
  <section
    style={style}
    className={classNames(
      'sq2-tile relative flex flex-col gap-3 overflow-hidden',
      flat
        ? 'border-t border-border-subtlest-tertiary py-4 first:border-t-0 first:pt-0'
        : 'rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
      className,
    )}
  >
    {title && (
      <header className="flex items-center gap-2">
        {icon && <span className="flex text-text-tertiary">{icon}</span>}
        <h3 className="font-bold text-text-primary typo-footnote">{title}</h3>
        <span className="ml-auto flex items-center gap-1 text-text-quaternary typo-caption1">
          {meta}
          {admin ? (
            <span
              className="sq2-handle cursor-grab select-none px-1 text-text-quaternary"
              title="Drag to reorder"
            >
              ⋮⋮
            </span>
          ) : (
            <ArrowIcon
              size={IconSize.XSmall}
              className="rotate-90 text-text-quaternary"
            />
          )}
        </span>
      </header>
    )}
    <div className={classNames('flex flex-col gap-2', bodyClassName)}>
      {children}
    </div>
  </section>
);

export const AddTile = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <button
    type="button"
    className={classNames(
      'flex flex-col items-start gap-2 rounded-16 border border-dashed border-border-subtlest-secondary p-4 text-left text-text-tertiary transition-colors hover:border-border-subtlest-primary hover:text-text-primary',
      className,
    )}
  >
    <span className="flex items-center gap-2 font-bold typo-footnote">
      <PlusIcon size={IconSize.XSmall} />
      Add a module
    </span>
    <span className="text-text-quaternary typo-caption1">
      Leaderboard · Events · Poll · Newsletter · Slack · Roles · Custom link
    </span>
  </button>
);

/* ---------------------------------------------------------- tile contents */

export const PinnedBody = ({
  entry = pinnedEntry,
}: {
  entry?: Entry;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <span className="line-clamp-2 font-bold text-text-primary typo-callout">
      {entry.title}
    </span>
    <span className="text-text-tertiary typo-footnote">
      {entry.author.name} · {formatSince(entry.createdAt)}
    </span>
  </div>
);

export const AboutBody = (): ReactElement => (
  <div className="flex flex-col gap-2">
    <p className="text-text-secondary typo-footnote">{squad.tagline}</p>
    <span className="text-text-quaternary typo-caption1">
      {squad.company.location} · {squad.company.size} · Since{' '}
      {formatSince(squad.createdAt)}
    </span>
  </div>
);

export const TeamBody = ({
  rows = 3,
  more = true,
}: {
  rows?: number;
  more?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-2.5">
    {team.slice(0, rows).map((member) => (
      <div key={member.id} className="flex items-center gap-2.5">
        <Avatar member={member} size={1.75} />
        <span className="truncate text-text-primary typo-footnote">
          {member.name}
        </span>
        <span className="ml-auto text-text-quaternary typo-caption1">
          {member.role}
        </span>
      </div>
    ))}
    {more && team.length > rows && (
      <span className="text-text-quaternary typo-caption1">
        and {team.length - rows} more
      </span>
    )}
  </div>
);

export const TeamFaces = (): ReactElement => (
  <div className="flex flex-col gap-2">
    <Facepile members={team} max={6} size={1.75} />
    <span className="text-text-tertiary typo-footnote">
      {team.length} admins and moderators
    </span>
  </div>
);

export const StackBody = ({ max = 6 }: { max?: number }): ReactElement => (
  <div className="flex flex-wrap gap-1.5">
    {stack.slice(0, max).map((item) => (
      <span
        key={item.name}
        className="flex items-center gap-1.5 rounded-8 bg-background-default py-1 pl-1.5 pr-2 text-text-secondary typo-caption1"
      >
        <img src={item.image} alt="" className="h-3.5 w-3.5 rounded-4" />
        {item.name}
      </span>
    ))}
  </div>
);

export const RolesBody = (): ReactElement => (
  <div className="flex flex-col gap-2">
    {jobs.map((job) => (
      <div key={job.title} className="flex flex-col">
        <span className="font-bold text-text-primary typo-footnote">
          {job.title}
        </span>
        <span className="text-text-quaternary typo-caption1">
          {job.location} · {job.type}
        </span>
      </div>
    ))}
  </div>
);

export const LinksBody = (): ReactElement => (
  <div className="flex flex-col gap-1.5">
    {squad.links.map((link) => (
      <a
        key={link.href}
        href={link.href}
        className="flex items-center gap-2 text-text-secondary typo-footnote hover:text-text-primary"
      >
        <OpenLinkIcon size={IconSize.XSmall} className="text-text-quaternary" />
        {link.label}
      </a>
    ))}
  </div>
);

/* Real-ish weekly post counts for the last twelve weeks. */
const pulse = [2, 3, 1, 4, 2, 5, 3, 6, 4, 3, 5, 4];

export const Sparkline = ({
  values = pulse,
  height = 36,
  className,
}: {
  values?: number[];
  height?: number;
  className?: string;
}): ReactElement => {
  const width = 160;
  const max = Math.max(...values);
  const step = width / (values.length - 1);
  const points = values.map(
    (value, index) =>
      `${index * step},${height - (value / max) * (height - 4) - 2}`,
  );
  const line = points.join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={classNames('h-9 w-full', className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sq2-pulse" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0"
            stopColor="var(--theme-accent-cabbage-default)"
            stopOpacity="0.35"
          />
          <stop
            offset="1"
            stopColor="var(--theme-accent-cabbage-default)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${line} ${width},${height}`}
        fill="url(#sq2-pulse)"
      />
      <polyline
        points={line}
        fill="none"
        stroke="var(--theme-accent-cabbage-default)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export const PulseBody = ({
  big = false,
  trend = true,
}: {
  big?: boolean;
  trend?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <div className="flex items-baseline gap-2">
      <span
        className={classNames(
          'sq-nums font-bold text-text-primary',
          big ? 'typo-mega3' : 'typo-title2',
        )}
      >
        12
      </span>
      <span className="text-text-tertiary typo-footnote">posts this month</span>
      {trend && (
        <span className="ml-auto flex items-center gap-0.5 text-status-success typo-caption1">
          <TrendingIcon size={IconSize.XSmall} />
          +33%
        </span>
      )}
    </div>
    <Sparkline />
  </div>
);

/* Top contributors this week. Reputation gained inside the squad. */
const leaderboard: { member: TeamMember; points: number }[] = [
  { member: team[3], points: 412 },
  { member: team[1], points: 338 },
  { member: team[4], points: 290 },
  { member: team[6], points: 154 },
  { member: team[2], points: 96 },
];

export const LeaderboardBody = ({
  rows = 3,
  highlight = false,
}: {
  rows?: number;
  highlight?: boolean;
}): ReactElement => (
  <ol className="flex flex-col gap-2">
    {leaderboard.slice(0, rows).map((row, index) => (
      <li key={row.member.id} className="flex items-center gap-2.5">
        <span
          className={classNames(
            'sq2-rank w-4 text-right font-bold typo-caption1',
            index === 0 && highlight
              ? 'text-accent-cabbage-default'
              : 'text-text-quaternary',
          )}
        >
          {index + 1}
        </span>
        <Avatar member={row.member} size={1.5} />
        <span className="truncate text-text-primary typo-footnote">
          {row.member.name}
        </span>
        <span className="sq-nums ml-auto flex items-center gap-1 text-text-tertiary typo-caption1">
          <UpvoteIcon size={IconSize.XSmall} />
          {row.points}
        </span>
      </li>
    ))}
  </ol>
);

export const StatBig = ({
  value,
  label,
  extra,
  size = 'md',
}: {
  value: number;
  label: string;
  extra?: ReactNode;
  size?: 'md' | 'lg';
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <span
      className={classNames(
        'sq-nums font-bold leading-none text-text-primary',
        size === 'lg' ? 'typo-mega2' : 'typo-mega3',
      )}
    >
      {formatCount(value)}
    </span>
    <span className="text-text-tertiary typo-footnote">{label}</span>
    {extra}
  </div>
);

/* ---------------------------------------------------------------- feed bits */

/** The share bar the squad page already has, in the X "what's happening" seat. */
export const Composer = ({
  member = team[2],
  className,
}: {
  member?: TeamMember;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-3',
      className,
    )}
  >
    <Avatar member={member} size={2} />
    <span className="flex-1 text-text-quaternary typo-callout">
      Share a link or write something for the squad
    </span>
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      icon={<LinkIcon />}
    >
      Link
    </Button>
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<PlusIcon />}
    >
      Post
    </Button>
  </div>
);

export const SortChips = ({
  options = ['Latest', 'Top', 'Discussed'],
  active = 'Latest',
  className,
}: {
  options?: string[];
  active?: string;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-1', className)}>
    {options.map((option) => (
      <button
        type="button"
        key={option}
        className={classNames(
          'rounded-10 px-3 py-1.5 typo-callout',
          option === active
            ? 'bg-surface-float font-bold text-text-primary'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {option}
      </button>
    ))}
  </div>
);

/** For the customize state: what a tile is, in the admin's words. */
export const CustomizeBar = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-center gap-2 text-text-quaternary typo-caption1',
      className,
    )}
  >
    <SettingsIcon size={IconSize.XSmall} />
    Drag tiles to reorder. Hidden tiles stay in the menu.
  </div>
);

export const tileIcons = {
  pinned: <PinIcon size={IconSize.XSmall} />,
  about: <HashtagIcon size={IconSize.XSmall} />,
  team: <UserIcon size={IconSize.XSmall} />,
  leaderboard: <TrendingIcon size={IconSize.XSmall} />,
  stack: <TerminalIcon size={IconSize.XSmall} />,
  roles: <JobIcon size={IconSize.XSmall} />,
  links: <LinkIcon size={IconSize.XSmall} />,
  events: <CalendarIcon size={IconSize.XSmall} />,
  discuss: <DiscussIcon size={IconSize.XSmall} />,
};
