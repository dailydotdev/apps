import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  BellIcon,
  CardLayout,
  EditIcon,
  GitHubIcon,
  LinkIcon,
  LinkedInIcon,
  MenuIcon,
  PinIcon,
  SearchIcon,
  TwitterIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { FreeformGrid } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformGrid';
import type { Entry } from './data';
import {
  feedEntries,
  formatCount,
  formatSince,
  jobs,
  pinnedEntry,
  squad,
  stack,
  team,
  toPost,
} from './data';
import { Avatar, Facepile, VerifiedMark, Viewer } from './kit';
import { Composer } from './kit2';

// The squad's Home, built on the profile page's skeleton so a person and a
// squad read as the same kind of thing. Same card, same cover height, same
// avatar seat, same name/meta/actions/stats stack, same divide-y sections
// below (About, Stack, Activity, Experiences becomes Open roles), and the
// same right column of widgets. Where the profile shows Reading Overview,
// the squad shows its posting overview; where it lists Active in these
// Squads, the squad lists its team.

const noop = () => undefined;
export const cardHandlers = {
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

export const Separator = (): ReactElement => (
  <span className="mx-1 text-text-secondary typo-subhead">•</span>
);

/* -------------------------------------------------------------- header */

/** ProfileHeader, for a squad. */
const SquadHeader = ({
  viewer,
  standalone,
  onOpenMembers,
}: {
  viewer: Viewer;
  standalone: boolean;
  onOpenMembers?: () => void;
}): ReactElement => (
  <div className="relative w-full overflow-hidden rounded-t-16">
    <div className="relative h-36">
      <img
        src={squad.headerImage}
        alt="Cover"
        className="h-full w-full object-cover"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-20"
        style={{
          background:
            'linear-gradient(to top, var(--theme-background-default), transparent)',
        }}
      />
    </div>
    <div className="flex flex-col px-6 pb-5">
      {/* Logo and actions share one baseline, so the identity column below
          is text only and every row starts at the same x. */}
      <div className="-mt-12 flex items-end justify-between gap-4">
        <img
          src={squad.image}
          alt="Logo"
          className="relative size-[6.5rem] shrink-0 rounded-16 bg-background-default object-cover ring-4 ring-background-default"
        />
        <div className="flex items-center gap-2 pb-1">
          {viewer === Viewer.Admin && (
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<EditIcon />}
            >
              Edit page
            </Button>
          )}
          {standalone && viewer === Viewer.Visitor && (
            <Button
              variant={ButtonVariant.Primary}
              color={ButtonColor.Cabbage}
              size={ButtonSize.Small}
            >
              Join
            </Button>
          )}
          {viewer === Viewer.Member && (
            <>
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                icon={<VIcon />}
              >
                Joined
              </Button>
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<BellIcon />}
                aria-label="Notifications"
              />
            </>
          )}
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<LinkIcon />}
          >
            Share
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<MenuIcon />}
            aria-label="More"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <h1 className="flex items-center gap-2 font-bold text-text-primary typo-title2">
          {squad.name}
          <VerifiedMark label={false} />
        </h1>
        <p className="text-text-secondary typo-body">{squad.tagline}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 text-text-tertiary typo-footnote">
        <span className="flex items-center gap-1.5 text-text-secondary">
          <img src={squad.image} alt="" className="size-4 rounded-4" />
          {squad.company.website}
        </span>
        <span className="text-text-quaternary">·</span>
        <span>Verified company</span>
        <span className="text-text-quaternary">·</span>
        <span>{squad.company.location}</span>
        <span className="text-text-quaternary">·</span>
        <span>Since {formatSince(squad.createdAt)}</span>
      </div>
      <SquadStats onOpenMembers={onOpenMembers} />
    </div>
  </div>
);

/**
 * UserStats, straightened: one strip under a hairline, tabular figures, and
 * the member faces on the Members figure so the social proof does not need
 * a row of its own.
 */
const SquadStats = ({
  onOpenMembers,
}: {
  onOpenMembers?: () => void;
}): ReactElement => {
  const Item = ({ amount, title }: { amount: number; title: string }) => (
    <span className="flex items-baseline gap-1">
      <b className="sq-nums text-text-primary typo-callout">
        {formatCount(amount)}
      </b>
      <span className="text-text-tertiary typo-footnote">{title}</span>
    </span>
  );

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-subtlest-tertiary pt-4">
      <button
        type="button"
        onClick={onOpenMembers}
        className="flex items-center gap-2 rounded-8 text-left transition-opacity hover:opacity-80"
      >
        <Facepile members={team.slice(3)} max={3} size={1.25} />
        <Item amount={squad.membersCount} title="Members" />
      </button>
      <Item amount={squad.totalPosts} title="Posts" />
      <Item amount={squad.totalViews} title="Views" />
      <Item amount={squad.totalUpvotes} title="Upvotes" />
    </div>
  );
};

/* ------------------------------------------------------------- sections */

export const SectionTitle = ({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <div className="flex items-center justify-between">
    <span className="font-bold text-text-primary typo-body">{children}</span>
    {action}
  </div>
);

const social = [
  {
    id: 'website',
    icon: <LinkIcon size={IconSize.XSmall} />,
    label: 'daily.dev',
  },
  {
    id: 'github',
    icon: <GitHubIcon size={IconSize.XSmall} />,
    label: 'GitHub',
  },
  { id: 'x', icon: <TwitterIcon size={IconSize.XSmall} />, label: 'X' },
  {
    id: 'linkedin',
    icon: <LinkedInIcon size={IconSize.XSmall} />,
    label: 'LinkedIn',
  },
];

/** AboutMe, for a squad: the links row, then the readme. */
const AboutSection = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle>About</SectionTitle>
    <div className="flex flex-wrap items-center gap-2">
      {social.map((link) => (
        <Button
          key={link.id}
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          icon={link.icon}
          aria-label={link.label}
        />
      ))}
    </div>
    <div className="flex flex-col gap-3 text-text-primary typo-body">
      <p className="font-bold">
        Every release, explained by the people who built it. 👋
      </p>
      <p>
        This is where the daily.dev team announces what shipped, what is in
        beta, and why we changed something. Every post is written by the
        engineer or designer behind it, and the comments are where we take the
        bug reports.
      </p>
      <p>What you will find here</p>
      <p>
        <b>🚀 Releases:</b> a post for every feature, the week it ships.
      </p>
      <p>
        <b>🧪 Betas:</b> early access, and how to turn it on.
      </p>
      <p>
        <b>🛠️ Fixes:</b> the monthly release notes, pinned at the top.
      </p>
      <p>
        Something broke? Post it here with the #bug tag and someone from the
        team picks it up.
      </p>
    </div>
  </div>
);

/** ProfileUserStack, for a squad. Same rows, same title row. */
const StackSection = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle
      action={
        viewer === Viewer.Admin && (
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.XSmall}
            icon={<EditIcon />}
            aria-label="Edit stack"
          />
        )
      }
    >
      Stack and tools
    </SectionTitle>
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
        Built with
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stack.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary px-3 pb-2.5 pt-2 hover:border-border-subtlest-secondary"
          >
            <div className="flex min-w-0 items-center gap-2">
              <img src={item.image} alt="" className="size-6 rounded-6" />
              <span className="truncate font-bold text-text-primary typo-callout">
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ---------------------------------------------------------------- posts */

/**
 * Reddit's feed controls, in our clothes: one sort menu instead of a row of
 * tabs, the grid / list toggle the product already has, and search. No tab
 * bar anywhere on the page; the sidebar is the navigation.
 */
export const PostsToolbar = ({
  sort,
  view = 'grid',
  children,
}: {
  sort: string;
  view?: 'grid' | 'list';
  children?: ReactNode;
}): ReactElement => (
  <div className="flex items-center gap-2">
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      icon={<ArrowIcon className="rotate-180" />}
      iconPosition={ButtonIconPosition.Right}
    >
      {sort}
    </Button>
    {children}
    <div className="ml-auto flex items-center gap-1">
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<SearchIcon />}
        aria-label="Search"
      />
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<CardLayout secondary={view === 'list'} />}
        aria-label="Toggle layout"
      />
    </div>
  </div>
);

/**
 * Reddit's community highlight: the pinned post as one compact card above
 * the feed, thumbnail and all, instead of a text row.
 */
export const Highlight = ({ entry }: { entry: Entry }): ReactElement => (
  <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
    {entry.image ? (
      <img
        src={entry.image}
        alt=""
        className="h-14 w-24 shrink-0 rounded-10 object-cover"
      />
    ) : (
      <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-10 bg-background-default text-text-tertiary">
        <PinIcon size={IconSize.Medium} />
      </span>
    )}
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="flex items-center gap-1.5 text-text-tertiary typo-caption1">
        <PinIcon size={IconSize.XSmall} />
        Pinned by {entry.author.name}
      </span>
      <span className="line-clamp-1 font-bold text-text-primary typo-callout">
        {entry.title}
      </span>
      <span className="line-clamp-1 text-text-tertiary typo-footnote">
        {entry.summary}
      </span>
    </div>
  </div>
);

/** The posts, as the page. */
export const PostsArea = ({
  sort,
  entries: list,
  pinned,
  composer,
  toolbarChildren,
}: {
  sort: string;
  entries: Entry[];
  pinned?: Entry;
  composer?: ReactNode;
  toolbarChildren?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-4 p-6">
    {composer}
    <PostsToolbar sort={sort}>{toolbarChildren}</PostsToolbar>
    {pinned && <Highlight entry={pinned} />}
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
    >
      {list.map((entry) => (
        <FreeformGrid key={entry.id} post={toPost(entry)} {...cardHandlers} />
      ))}
    </div>
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Medium}
      className="w-full"
    >
      Load more
    </Button>
  </div>
);

const facts = [
  ['Website', squad.company.website],
  ['Headquarters', squad.company.location],
  ['Company size', squad.company.size],
  ['Founded', '2020'],
  ['Category', squad.category],
  ['Verified since', formatSince(squad.createdAt)],
];

/** LinkedIn's overview block and GitHub's verified-domain claim, as one list. */
const CompanySection = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle>Company</SectionTitle>
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
      {facts.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="text-text-quaternary typo-caption1">{label}</dt>
          <dd className="text-text-primary typo-callout">{value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const TeamSection = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle>Team</SectionTitle>
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {team.map((member) => (
        <div key={member.id} className="flex items-center gap-3">
          <Avatar member={member} size={2.25} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {member.name}
            </span>
            <span className="truncate text-text-tertiary typo-footnote">
              {member.title}
            </span>
          </div>
          <span className="shrink-0 rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2">
            {member.role}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* -------------------------------------------------------------- widgets */

export const Widget = ({
  title,
  children,
  action,
}: {
  title: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <section className="flex w-full flex-col rounded-16 border border-border-subtlest-tertiary p-4">
    <span className="flex items-center justify-between font-bold text-text-primary typo-callout">
      {title}
      {action}
    </span>
    {children}
  </section>
);

export const Tile = ({
  value,
  label,
}: {
  value: string;
  label: string;
}): ReactElement => (
  <div className="flex flex-col items-center rounded-12 border border-border-subtlest-tertiary px-2 py-2 text-center">
    <span className="font-bold text-text-primary typo-callout">{value}</span>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </div>
);

const topTags = [
  ['dailydev', 62],
  ['devtools', 38],
  ['claude-code', 21],
  ['community', 17],
  ['ui-ux', 14],
  ['architecture', 9],
] as const;

/* Posts per week, 26 weeks. Real cadence: a handful a month. */
const weeks = Array.from({ length: 26 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => {
    const seed = (week * 7 + day) % 11;
    return seed === 3 || seed === 7 ? 1 : seed === 9 && week % 3 === 0 ? 2 : 0;
  }),
);

/** ReadingOverview, for a squad: what it posts, how often, about what. */
const OverviewWidget = (): ReactElement => (
  <Widget title="Activity">
    <div className="mb-3 mt-4 grid grid-cols-2 gap-2">
      <Tile value="12" label="Posts this month" />
      <Tile value={formatCount(squad.totalViews)} label="Views, all time" />
    </div>
    <span className="text-text-tertiary typo-subhead">Top tags by posts</span>
    <div className="my-3 grid grid-cols-2 gap-2">
      {topTags.map(([tag, share]) => (
        <div
          key={tag}
          className="relative flex justify-between overflow-hidden rounded-6 border border-border-subtlest-tertiary px-2 typo-caption1"
        >
          <span
            className="absolute bottom-0 left-0 top-0 bg-action-share-default opacity-40"
            style={{ width: `${share}%` }}
          />
          <span className="relative z-1 my-auto text-text-primary">{tag}</span>
          <span className="relative z-1 my-auto text-text-secondary">
            {share}%
          </span>
        </div>
      ))}
    </div>
    <span className="mb-3 text-text-tertiary typo-subhead">
      Posts in the last months ({squad.totalPosts})
    </span>
    <div className="flex gap-0.5">
      {weeks.map((week, weekIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={weekIndex} className="flex flex-col gap-0.5">
          {week.map((count, dayIndex) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={dayIndex}
              className={classNames(
                'size-2 rounded-6',
                count === 0 && 'border border-border-subtlest-quaternary',
                count === 1 && 'bg-text-disabled',
                count === 2 && 'bg-text-primary',
              )}
            />
          ))}
        </div>
      ))}
    </div>
    <div className="mt-4 flex items-center justify-end text-text-tertiary typo-footnote">
      <span className="mr-2">Less</span>
      <span className="mr-0.5 size-2 rounded-6 border border-border-subtlest-quaternary" />
      <span className="mr-0.5 size-2 rounded-6 bg-text-disabled" />
      <span className="mr-2 size-2 rounded-6 bg-text-primary" />
      More
    </div>
  </Widget>
);

/** ActiveOrRecommendedSquads, for a squad: the people behind it. */
const TeamWidget = (): ReactElement => (
  <Widget title="Team">
    <ul className="mt-4 flex flex-col gap-2.5">
      {team.slice(0, 5).map((member) => (
        <li key={member.id} className="flex items-center gap-2.5">
          <Avatar member={member} size={2} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {member.name}
            </span>
            <span className="truncate text-text-tertiary typo-footnote">
              {member.title}
            </span>
          </div>
          <span className="shrink-0 text-text-quaternary typo-caption1">
            {member.role}
          </span>
        </li>
      ))}
    </ul>
    <div className="mt-auto pt-3">
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        className="w-full"
      >
        See all {team.length}
      </Button>
    </div>
  </Widget>
);

const milestones = [
  ['10K members', 'June 2026'],
  ['100 posts', 'March 2025'],
  ['Featured squad', 'August 2024'],
  ['Verified', 'February 2023'],
];

/** BadgesAndAwards, for a squad. */
const AwardsWidget = (): ReactElement => (
  <Widget title="Milestones">
    <div className="mb-3 mt-4 grid grid-cols-2 gap-2">
      <Tile value={`x${squad.totalAwards}`} label="Awards received" />
      <Tile value="x4" label="Milestones" />
    </div>
    <ul className="flex flex-col gap-2">
      {milestones.map(([label, date]) => (
        <li key={label} className="flex items-center justify-between">
          <span className="rounded-6 bg-surface-float px-1.5 py-0.5 text-text-primary typo-caption1">
            {label}
          </span>
          <span className="text-text-quaternary typo-caption1">{date}</span>
        </li>
      ))}
    </ul>
  </Widget>
);

/* ------------------------------------------------------------------ page */

/** One frame for a squad and a person: card + widget column. */
export const HomeFrame = ({
  header,
  children,
  widgets,
}: {
  header: ReactNode;
  children: ReactNode;
  widgets: ReactNode;
}): ReactElement => (
  <div className="m-auto flex w-full max-w-[72rem] gap-4 p-4 pb-6">
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="rounded-16 border border-border-subtlest-tertiary">
        {header}
        {children}
      </div>
    </main>
    <aside className="flex w-80 shrink-0 flex-col gap-4">{widgets}</aside>
  </div>
);

/** The About page in the sidebar: what used to stack under the header. */
export const SquadAbout = ({
  viewer = Viewer.Visitor,
}: {
  viewer?: Viewer;
}): ReactElement => (
  <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
    <AboutSection />
    <CompanySection />
    <TeamSection />
    <StackSection viewer={viewer} />
  </div>
);

export const SquadWidgets = (): ReactElement => (
  <>
    <OverviewWidget />
    <TeamWidget />
    <AwardsWidget />
  </>
);

export const SquadHome = ({
  viewer = Viewer.Visitor,
  standalone = false,
  onOpenMembers,
}: {
  viewer?: Viewer;
  /** Outside the workspace there is no sidebar to carry Join, so the header does. */
  standalone?: boolean;
  onOpenMembers?: () => void;
}): ReactElement => (
  <HomeFrame
    header={
      <SquadHeader
        viewer={viewer}
        standalone={standalone}
        onOpenMembers={onOpenMembers}
      />
    }
    widgets={<SquadWidgets />}
  >
    <div className="border-t border-border-subtlest-tertiary">
      <PostsArea
        sort="Latest"
        entries={feedEntries.slice(0, 6)}
        pinned={pinnedEntry}
        composer={viewer !== Viewer.Visitor && <Composer />}
      />
    </div>
  </HomeFrame>
);
