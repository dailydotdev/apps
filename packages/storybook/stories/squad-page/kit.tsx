import type { ReactElement, ReactNode } from 'react';
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
  DiscordIcon,
  DocsIcon,
  GitHubIcon,
  LinkedInIcon,
  TwitterIcon,
  YoutubeIcon,
  AnalyticsIcon,
  BellIcon,
  DiscussIcon,
  LinkIcon,
  MenuIcon,
  OpenLinkIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { FreeformGrid } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformGrid';
import { FreeformList } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformList';
import type { Entry, TeamMember } from './data';
import {
  formatCount,
  formatDay,
  formatSince,
  squad,
  team,
  toPost,
} from './data';

// Shared vocabulary for the squad page directions. Every layout is composed
// from these so the comparison is about structure, not about which one got
// the nicer button. Provider-light where possible; the production feed cards
// are the exception and need the story-level boot providers.

const kitCss = `
.sq-nums { font-variant-numeric: tabular-nums; }
.sq-ring { box-shadow: 0 0 0 4px var(--theme-background-default); }
.sq-elevated {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--theme-border-subtlest-primary), transparent 80%),
    0 2px 6px -2px rgb(0 0 0 / 0.35),
    0 16px 40px -12px rgb(0 0 0 / 0.45);
}
/* The cover never ends in a hard line: it dissolves into the page. */
.sq-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    var(--theme-background-default) 0%,
    color-mix(in srgb, var(--theme-background-default), transparent 55%) 38%,
    transparent 100%
  );
}
/* The publication direction uses the cover as light, not as a banner. */
.sq-backdrop {
  position: absolute;
  inset: -20% -10% auto -10%;
  height: 34rem;
  background-size: cover;
  background-position: center;
  filter: blur(70px) saturate(1.3);
  opacity: 0.35;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(to bottom, black 20%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 20%, transparent 100%);
}
.sq-sticky { position: sticky; top: 1rem; }
.sq-tab-active::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -1px;
  height: 2px;
  background: var(--theme-text-primary);
  border-radius: 2px;
}
.sq-timeline-rail::before {
  content: '';
  position: absolute;
  left: 8.125rem;
  top: 0; bottom: 0;
  width: 1px;
  background: var(--theme-border-subtlest-tertiary);
}
.sq-press { transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1); }
.sq-press:active { transform: scale(0.97); }
`;

export const KitStyles = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: kitCss }} />
);

/* ------------------------------------------------------------- app frame */

/** A 1280px desktop, with just enough app chrome to read the page in context. */
export const Frame = ({
  children,
  width = 1280,
  chrome = true,
  className,
}: {
  children: ReactNode;
  width?: number;
  chrome?: boolean;
  className?: string;
}): ReactElement => (
  <div
    style={{ width, maxWidth: '100%' }}
    className={classNames(
      'sq-elevated relative overflow-hidden rounded-16 bg-background-default text-text-primary',
      className,
    )}
  >
    <KitStyles />
    {chrome && (
      <div className="flex h-14 items-center gap-4 border-b border-border-subtlest-tertiary px-6">
        <span className="font-bold typo-callout">daily.dev</span>
        <div className="mx-auto flex h-9 w-[28rem] items-center gap-2 rounded-12 bg-surface-float px-3 text-text-quaternary typo-footnote">
          <SearchIcon size={IconSize.Small} />
          Search
        </div>
        <span className="h-8 w-8 rounded-full bg-surface-hover" />
      </div>
    )}
    {children}
  </div>
);

/* --------------------------------------------------------------- identity */

export const Cover = ({
  height = 14,
  className,
}: {
  /** rem */
  height?: number;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'sq-cover relative w-full overflow-hidden',
      className,
    )}
    style={{ height: `${height}rem` }}
  >
    <img
      src={squad.headerImage}
      alt=""
      className="h-full w-full object-cover"
    />
  </div>
);

export const Logo = ({
  size = 6,
  ring = true,
  className,
}: {
  /** rem */
  size?: number;
  ring?: boolean;
  className?: string;
}): ReactElement => (
  <img
    src={squad.image}
    alt={`${squad.handle}'s logo`}
    style={{ width: `${size}rem`, height: `${size}rem` }}
    className={classNames(
      'shrink-0 rounded-full bg-background-default object-cover',
      ring && 'sq-ring',
      className,
    )}
  />
);

/**
 * The verified seal: a scalloped badge with a check, the shape X, Instagram
 * and LinkedIn all use for verified. daily.dev has no glyph for it yet (the
 * profile's company badge is a text pill, the shields mean clickbait
 * shield, the medals mean awards), so it is drawn here on the 24 grid.
 */
export const linkIcon = (
  id: string,
  size: IconSize = IconSize.Small,
): ReactElement =>
  ({
    docs: <DocsIcon size={size} />,
    github: <GitHubIcon size={size} />,
    x: <TwitterIcon size={size} />,
    youtube: <YoutubeIcon size={size} />,
    linkedin: <LinkedInIcon size={size} />,
    discord: <DiscordIcon size={size} />,
  }[id] ?? <LinkIcon size={size} />);

export const VerifiedSeal = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={classNames('size-4 shrink-0', className)}
  >
    <path
      fill="currentColor"
      d="M21.60 12.00 Q22.82 14.90 20.31 16.80 Q19.92 19.92 16.80 20.31 Q14.90 22.82 12.00 21.60 Q9.10 22.82 7.20 20.31 Q4.08 19.92 3.69 16.80 Q1.18 14.90 2.40 12.00 Q1.18 9.10 3.69 7.20 Q4.08 4.08 7.20 3.69 Q9.10 1.18 12.00 2.40 Q14.90 1.18 16.80 3.69 Q19.92 4.08 20.31 7.20 Q22.82 9.10 21.60 12.00Z"
    />
    <path
      d="M7.6 12.3l3 3 5.8-6"
      fill="none"
      stroke="var(--theme-background-default)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const VerifiedMark = ({
  label = true,
  className,
}: {
  label?: boolean;
  className?: string;
}): ReactElement => (
  <span
    title="Verified company"
    className={classNames(
      'inline-flex shrink-0 items-center gap-1 text-accent-cabbage-default',
      label &&
        'rounded-8 bg-accent-cabbage-flat px-2 py-0.5 font-bold typo-caption1',
      className,
    )}
  >
    <VerifiedSeal />
    {label && 'Verified'}
  </span>
);

export const Name = ({
  size = 'title1',
  className,
}: {
  size?: 'title1' | 'title2' | 'mega3' | 'large';
  className?: string;
}): ReactElement => {
  const typo = {
    title1: 'typo-title1',
    title2: 'typo-title2',
    mega3: 'typo-mega3',
    large: 'typo-large-title',
  }[size];

  return (
    <h1
      className={classNames(
        'flex items-center gap-2 font-bold text-text-primary',
        typo,
        className,
      )}
    >
      {squad.name}
      {squad.verified && <VerifiedMark label={size === 'mega3'} />}
    </h1>
  );
};

export const MetaLine = ({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-wrap items-center gap-x-2 text-text-tertiary typo-footnote',
      className,
    )}
  >
    {items.map((item, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={index}>
        {index > 0 && <span className="text-text-quaternary">·</span>}
        <span>{item}</span>
      </React.Fragment>
    ))}
  </div>
);

export const defaultMeta = [
  `@${squad.handle}`,
  <span key="cat" className="text-text-link">
    {squad.category}
  </span>,
  `Since ${formatSince(squad.createdAt)}`,
];

/* ------------------------------------------------------------------ stats */

export const Stat = ({
  value,
  label,
  size = 'md',
  align = 'start',
}: {
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center';
}): ReactElement => (
  <div
    className={classNames(
      'flex',
      size === 'sm' ? 'flex-row items-baseline gap-1' : 'flex-col',
      align === 'center' && 'items-center',
    )}
  >
    <span
      className={classNames(
        'sq-nums font-bold text-text-primary',
        size === 'sm' && 'typo-callout',
        size === 'md' && 'typo-title3',
        size === 'lg' && 'typo-title1',
      )}
    >
      {formatCount(value)}
    </span>
    <span
      className={classNames(
        'text-text-tertiary',
        size === 'sm' ? 'typo-footnote' : 'typo-caption1',
      )}
    >
      {label}
    </span>
  </div>
);

export const stats = [
  { value: squad.membersCount, label: 'Members' },
  { value: squad.totalPosts, label: 'Posts' },
  { value: squad.totalViews, label: 'Views' },
  { value: squad.totalUpvotes, label: 'Upvotes' },
];

/* ----------------------------------------------------------------- people */

export const Avatar = ({
  member,
  size = 2.5,
  className,
}: {
  member: TeamMember;
  /** rem */
  size?: number;
  className?: string;
}): ReactElement => (
  <img
    src={member.image}
    alt={member.name}
    title={member.name}
    style={{ width: `${size}rem`, height: `${size}rem` }}
    className={classNames(
      'shrink-0 rounded-full bg-surface-hover object-cover',
      className,
    )}
  />
);

export const Facepile = ({
  members = team,
  max = 5,
  size = 1.75,
  count,
  label = 'members',
  className,
}: {
  members?: TeamMember[];
  max?: number;
  size?: number;
  count?: number;
  label?: string;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center', className)}>
    <div className="flex">
      {members.slice(0, max).map((member, index) => (
        <Avatar
          key={member.id}
          member={member}
          size={size}
          className={classNames('sq-ring', index > 0 && '-ml-2')}
        />
      ))}
    </div>
    {typeof count === 'number' && (
      <span className="ml-2 text-text-tertiary typo-footnote">
        <span className="sq-nums font-bold text-text-primary">
          {formatCount(count)}
        </span>{' '}
        {label}
      </span>
    )}
  </div>
);

export const TeamRow = ({
  member,
  compact = false,
}: {
  member: TeamMember;
  compact?: boolean;
}): ReactElement => (
  <div className="flex items-center gap-3">
    <Avatar member={member} size={compact ? 2 : 2.5} />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold text-text-primary typo-callout">
        {member.name}
      </span>
      <span className="truncate text-text-tertiary typo-footnote">
        {compact ? member.role : `${member.title} · ${member.role}`}
      </span>
    </div>
  </div>
);

/* ---------------------------------------------------------------- actions */

export enum Viewer {
  /** Logged out. Can read a public squad, cannot do anything else. */
  Anonymous = 'anonymous',
  /** Logged in, not a member. */
  Visitor = 'visitor',
  Member = 'member',
  /** A member who moderates: approves, removes, pins. */
  Moderator = 'moderator',
  Admin = 'admin',
  /** Removed by a moderator. Logged in, can read a public squad, cannot rejoin. */
  Blocked = 'blocked',
}

export const isLoggedIn = (viewer: Viewer): boolean =>
  viewer !== Viewer.Anonymous;
export const isJoined = (viewer: Viewer): boolean =>
  viewer === Viewer.Member ||
  viewer === Viewer.Moderator ||
  viewer === Viewer.Admin;
export const isStaff = (viewer: Viewer): boolean =>
  viewer === Viewer.Moderator || viewer === Viewer.Admin;
export const isAdmin = (viewer: Viewer): boolean => viewer === Viewer.Admin;
export const isBlocked = (viewer: Viewer): boolean => viewer === Viewer.Blocked;

/**
 * One primary action per viewer. Everything else is an icon, and the admin
 * tools never outrank Join for a visitor because a visitor never sees them.
 */
export const Actions = ({
  viewer = Viewer.Visitor,
  size = ButtonSize.Medium,
  className,
}: {
  viewer?: Viewer;
  size?: ButtonSize;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-2', className)}>
    {viewer === Viewer.Visitor && (
      <Button
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        size={size}
        className="sq-press"
      >
        Join squad
      </Button>
    )}
    {viewer !== Viewer.Visitor && (
      <Button
        variant={ButtonVariant.Primary}
        size={size}
        icon={<PlusIcon />}
        className="sq-press"
      >
        New post
      </Button>
    )}
    {viewer === Viewer.Admin && (
      <>
        <Button
          variant={ButtonVariant.Float}
          size={size}
          icon={<AddUserIcon />}
        >
          Invite
        </Button>
        <Button
          variant={ButtonVariant.Float}
          size={size}
          icon={<AnalyticsIcon />}
          aria-label="Analytics"
        />
        <Button
          variant={ButtonVariant.Float}
          size={size}
          icon={<SettingsIcon />}
          aria-label="Settings"
        />
      </>
    )}
    {viewer !== Viewer.Visitor && (
      <Button
        variant={ButtonVariant.Float}
        size={size}
        icon={<BellIcon />}
        aria-label="Notifications"
      />
    )}
    <Button
      variant={ButtonVariant.Float}
      size={size}
      icon={<LinkIcon />}
      aria-label="Copy link"
    />
    <Button
      variant={ButtonVariant.Float}
      size={size}
      icon={<MenuIcon />}
      aria-label="More"
    />
  </div>
);

/* --------------------------------------------------------------- sections */

export const Panel = ({
  title,
  action,
  children,
  className,
  flush = false,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}): ReactElement => (
  <section
    className={classNames(
      'flex flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float',
      flush ? 'p-0' : 'gap-3 p-4',
      className,
    )}
  >
    {title && (
      <header
        className={classNames(
          'flex items-center justify-between',
          flush && 'px-4 pt-4',
        )}
      >
        <h3 className="font-bold text-text-primary typo-callout">{title}</h3>
        {action}
      </header>
    )}
    {children}
  </section>
);

export const SectionTitle = ({
  title,
  count,
  action,
  className,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center justify-between', className)}>
    <h2 className="flex items-baseline gap-2 font-bold text-text-primary typo-title3">
      {title}
      {typeof count === 'number' && (
        <span className="sq-nums font-normal text-text-quaternary typo-callout">
          {formatCount(count)}
        </span>
      )}
    </h2>
    {action}
  </div>
);

export const TabBar = ({
  tabs,
  active,
  className,
}: {
  tabs: { label: string; count?: number }[];
  active: string;
  className?: string;
}): ReactElement => (
  <nav
    className={classNames(
      'flex items-center gap-6 border-b border-border-subtlest-tertiary',
      className,
    )}
  >
    {tabs.map((tab) => (
      <button
        type="button"
        key={tab.label}
        className={classNames(
          'relative flex items-center gap-1.5 py-3 typo-callout',
          tab.label === active
            ? 'sq-tab-active font-bold text-text-primary'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {tab.label}
        {typeof tab.count === 'number' && (
          <span className="sq-nums rounded-6 bg-surface-float px-1.5 text-text-quaternary typo-caption1">
            {formatCount(tab.count)}
          </span>
        )}
      </button>
    ))}
  </nav>
);

export const StackRow = ({
  items,
  className,
}: {
  items: { name: string; image: string }[];
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-wrap gap-2', className)}>
    {items.map((item) => (
      <span
        key={item.name}
        className="flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-background-default py-1 pl-1.5 pr-2.5 text-text-secondary typo-footnote"
      >
        <img src={item.image} alt="" className="h-4 w-4 rounded-4" />
        {item.name}
      </span>
    ))}
  </div>
);

export const LinksList = ({
  items,
  className,
}: {
  items: { label: string; href: string }[];
  className?: string;
}): ReactElement => (
  <ul className={classNames('flex flex-col gap-2', className)}>
    {items.map((item) => (
      <li key={item.href}>
        <a
          href={item.href}
          className="flex items-center gap-2 text-text-secondary typo-footnote hover:text-text-primary"
        >
          <OpenLinkIcon
            size={IconSize.XSmall}
            className="text-text-quaternary"
          />
          {item.label}
        </a>
      </li>
    ))}
  </ul>
);

/* ------------------------------------------------------------------- feed */

export const FeedToolbar = ({
  search = true,
  sort = ['Latest', 'Top', 'Discussed'],
  active = 'Latest',
  className,
  children,
}: {
  search?: boolean;
  sort?: string[];
  active?: string;
  className?: string;
  children?: ReactNode;
}): ReactElement => (
  <div className={classNames('flex items-center gap-3', className)}>
    {search && (
      <div className="flex h-10 flex-1 items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-quaternary typo-callout">
        <SearchIcon size={IconSize.Small} />
        Search this squad
      </div>
    )}
    <div className="flex h-10 items-center rounded-12 bg-surface-float p-1">
      {sort.map((option) => (
        <button
          type="button"
          key={option}
          className={classNames(
            'rounded-10 px-3 py-1.5 typo-callout',
            option === active
              ? 'bg-background-default font-bold text-text-primary shadow-2'
              : 'text-text-tertiary',
          )}
        >
          {option}
        </button>
      ))}
    </div>
    {children}
  </div>
);

const noop = () => undefined;
const cardHandlers = {
  onPostClick: noop,
  onPostAuxClick: noop,
  onUpvoteClick: noop,
  onDownvoteClick: noop,
  onCommentClick: noop,
  onBookmarkClick: noop,
  onCopyLinkClick: noop,
  onShare: noop,
  onReadArticleClick: noop,
};

/** Production grid cards, on the production grid math (20rem tracks, 2rem gap). */
export const CardGrid = ({
  entries,
  columns = 3,
  className,
}: {
  entries: Entry[];
  columns?: number;
  className?: string;
}): ReactElement => (
  <div
    className={classNames('grid gap-8', className)}
    style={{
      gridTemplateColumns: `repeat(${columns}, minmax(0, 20rem))`,
    }}
  >
    {entries.map((entry) => (
      <FreeformGrid key={entry.id} post={toPost(entry)} {...cardHandlers} />
    ))}
  </div>
);

export const CardList = ({
  entries,
  className,
}: {
  entries: Entry[];
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-3', className)}>
    {entries.map((entry) => (
      <FreeformList key={entry.id} post={toPost(entry)} {...cardHandlers} />
    ))}
  </div>
);

/** A slim pinned row: the announcement is always one glance away, never a whole card. */
export const PinnedRow = ({
  entry,
  className,
}: {
  entry: Entry;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-2.5',
      className,
    )}
  >
    <PinIcon size={IconSize.Small} className="text-text-tertiary" />
    <span className="font-bold text-text-tertiary typo-caption1">Pinned</span>
    <span className="truncate text-text-primary typo-callout">
      {entry.title}
    </span>
    <span className="ml-auto whitespace-nowrap text-text-quaternary typo-footnote">
      by {entry.author.name}
    </span>
  </div>
);

export const EngagementMeta = ({
  entry,
  className,
}: {
  entry: Entry;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'sq-nums flex items-center gap-3 text-text-tertiary typo-footnote',
      className,
    )}
  >
    <span className="flex items-center gap-1">
      <UpvoteIcon size={IconSize.XSmall} />
      {entry.upvotes}
    </span>
    <span className="flex items-center gap-1">
      <DiscussIcon size={IconSize.XSmall} />
      {entry.comments}
    </span>
  </div>
);

/**
 * The owner-curated slot. On a changelog it is the latest release; on a
 * company page it is whatever the company wants seen first. Wide reads as a
 * magazine lead, horizontal reads as a section header.
 */
export const FeaturedHero = ({
  entry,
  orientation = 'wide',
  eyebrow = 'Latest',
  className,
}: {
  entry: Entry;
  orientation?: 'wide' | 'horizontal';
  eyebrow?: string;
  className?: string;
}): ReactElement => (
  <article
    className={classNames(
      'sq-press group flex cursor-pointer overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float',
      orientation === 'wide' ? 'flex-col' : 'flex-row',
      className,
    )}
  >
    {entry.image && (
      <div
        className={classNames(
          'shrink-0 overflow-hidden bg-surface-hover',
          orientation === 'wide' ? 'aspect-[1.91/1] w-full' : 'w-[19rem]',
        )}
      >
        <img
          src={entry.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    )}
    <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <span className="rounded-6 bg-accent-cabbage-flat px-1.5 py-0.5 font-bold uppercase tracking-wide text-accent-cabbage-default typo-caption2">
          {eyebrow}
        </span>
        <span className="text-text-quaternary typo-footnote">
          {formatDay(entry.createdAt)}
        </span>
      </div>
      <h3
        className={classNames(
          'font-bold text-text-primary',
          orientation === 'wide' ? 'typo-title2' : 'typo-title3',
        )}
      >
        {entry.title}
      </h3>
      <p
        className={classNames(
          'text-text-secondary typo-callout',
          orientation === 'wide' ? 'line-clamp-3' : 'line-clamp-2',
        )}
      >
        {entry.summary}
      </p>
      <div className="mt-auto flex items-center gap-3 pt-1">
        <Avatar member={entry.author} size={1.5} />
        <span className="text-text-tertiary typo-footnote">
          {entry.author.name}
        </span>
        <EngagementMeta entry={entry} className="ml-auto" />
      </div>
    </div>
  </article>
);
