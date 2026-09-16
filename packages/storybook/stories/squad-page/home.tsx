import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BellIcon,
  EditIcon,
  GitHubIcon,
  LinkIcon,
  LinkedInIcon,
  MenuIcon,
  PinIcon,
  ReputationIcon,
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
  jobs,
  pinnedEntry,
  squad,
  stack,
  team,
  toPost,
} from './data';
import { Avatar, VerifiedMark, Viewer } from './kit';

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
const SquadHeader = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <div className="relative w-full overflow-hidden rounded-t-16">
    <div className="h-36">
      <img
        src={squad.headerImage}
        alt="Cover"
        className="h-full w-full object-cover"
      />
    </div>
    <img
      src={squad.image}
      alt="Logo"
      className="absolute left-6 top-16 h-[7.5rem] w-[7.5rem] rounded-16 object-cover"
    />
    <div className="flex flex-col gap-3 px-6">
      <div className="mb-4 ml-auto mt-2 flex items-center gap-2">
        {viewer === Viewer.Admin && (
          <Button
            className="text-text-secondary"
            variant={ButtonVariant.Float}
            icon={<EditIcon />}
            aria-label="Edit squad"
          />
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="font-bold typo-title2">{squad.name}</span>
        <VerifiedMark label={false} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="typo-body">{squad.tagline}</span>
        <div className="flex items-center text-text-secondary typo-subhead">
          <span className="flex items-center gap-1">
            <img src={squad.image} alt="" className="size-4 rounded-4" />
            daily.dev
            <VIcon
              size={IconSize.XSmall}
              className="text-accent-cabbage-default"
            />
            <span className="text-text-tertiary">Verified company</span>
          </span>
          <Separator />
          <span>{squad.company.location}</span>
        </div>
        <div className="flex items-center text-text-secondary typo-subhead">
          <span>@{squad.handle}</span>
          <Separator />
          <span>Created Feb 6. 2023</span>
        </div>
        {viewer !== Viewer.Admin && (
          <div className="flex items-center gap-2">
            {viewer === Viewer.Visitor ? (
              <Button
                variant={ButtonVariant.Primary}
                color={ButtonColor.Cabbage}
                size={ButtonSize.Small}
              >
                Join
              </Button>
            ) : (
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                icon={<VIcon />}
              >
                Joined
              </Button>
            )}
            {viewer === Viewer.Member && (
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<BellIcon />}
                aria-label="Notifications"
              />
            )}
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<MenuIcon />}
              aria-label="More"
            />
          </div>
        )}
        <SquadStats />
      </div>
    </div>
  </div>
);

/** UserStats, for a squad: the same 2x2 grid, members where reputation was. */
const SquadStats = (): ReactElement => {
  const Item = ({
    amount,
    title,
    className,
  }: {
    amount: number;
    title: string;
    className?: string;
  }) => (
    <div className={classNames('flex items-center gap-1', className)}>
      <b className="text-text-primary typo-subhead">{formatCount(amount)}</b>
      <span>{title}</span>
    </div>
  );

  return (
    <div className="-ml-1 grid w-fit grid-cols-[auto_auto] gap-x-2 gap-y-1 text-text-tertiary typo-footnote">
      <div className="flex">
        <ReputationIcon
          className="text-accent-onion-default"
          size={IconSize.Small}
        />
        <Item amount={squad.membersCount} title="Members" />
      </div>
      <Item amount={squad.totalPosts} title="Posts" />
      <Item amount={squad.totalViews} title="Views" className="pl-6" />
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

/* ----------------------------------------------------------------- tabs */

/**
 * The page-level tabs, right under the stats. Posts is the default and the
 * dominant surface; everything that used to stack down the column lives in
 * About. The profile gets the same pair.
 */
export const HomeTabs = ({
  tabs,
  active,
  onSelect,
}: {
  tabs: { id: HomeTab; label: string; count?: number }[];
  active: HomeTab;
  onSelect?: (tab: HomeTab) => void;
}): ReactElement => (
  <div className="flex items-center gap-6 border-b border-border-subtlest-tertiary px-6">
    {tabs.map((tab) => (
      <button
        type="button"
        key={tab.id}
        onClick={() => onSelect?.(tab.id)}
        className={classNames(
          'relative flex items-center gap-1.5 py-3 typo-callout',
          tab.id === active
            ? 'sq-tab-active font-bold text-text-primary'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {tab.label}
        {typeof tab.count === 'number' && (
          <span className="sq-nums font-normal text-text-quaternary">
            {formatCount(tab.count)}
          </span>
        )}
      </button>
    ))}
  </div>
);

export enum HomeTab {
  Posts = 'posts',
  About = 'about',
}

export const Chips = ({
  options,
  active,
}: {
  options: string[];
  active: string;
}): ReactElement => (
  <div className="flex items-center gap-1">
    {options.map((option) => (
      <button
        type="button"
        key={option}
        className={classNames(
          'rounded-10 px-3 py-1.5 font-bold typo-callout',
          option === active
            ? 'bg-surface-float text-text-primary'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {option}
      </button>
    ))}
  </div>
);

/**
 * The Posts tab: the cards are the page. Two production cards per row in
 * the profile column, a sort row above, the pinned post leading with its
 * flag, load more at the foot.
 */
export const PostsTab = ({
  chips,
  activeChip,
  entries: list,
  pinned,
  composer,
}: {
  chips: string[];
  activeChip: string;
  entries: Entry[];
  pinned?: Entry;
  composer?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex items-center justify-between">
      <Chips options={chips} active={activeChip} />
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<SearchIcon />}
        aria-label="Search"
      />
    </div>
    {composer}
    {pinned && (
      <div className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-2.5">
        <PinIcon size={IconSize.Small} className="text-text-tertiary" />
        <span className="truncate text-text-primary typo-callout">
          {pinned.title}
        </span>
        <span className="ml-auto whitespace-nowrap text-text-quaternary typo-footnote">
          Pinned · {pinned.author.name}
        </span>
      </div>
    )}
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

/** ProfileUserExperiences, for a squad: the company's open roles. */
const RolesSection = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle>Open roles</SectionTitle>
    <div className="flex flex-col gap-4">
      {jobs.map((job) => (
        <div key={job.title} className="flex gap-3">
          <img src={squad.image} alt="" className="size-8 shrink-0 rounded-8" />
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <span className="font-bold text-text-primary typo-callout">
                {job.title}
              </span>
              <span className="rounded-6 bg-surface-float px-1.5 text-text-tertiary typo-caption2">
                {job.type}
              </span>
            </span>
            <span className="text-text-tertiary typo-footnote">
              daily.dev · {job.location}
            </span>
            <div className="mt-1 flex gap-2">
              {['TypeScript', 'React', 'Node.js'].map((skill) => (
                <span
                  key={skill}
                  className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-text-secondary typo-caption1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
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
  <Widget title="Squad overview">
    <span className="text-text-link typo-footnote">Learn more</span>
    <div className="my-3 grid grid-cols-2 gap-2">
      <Tile value="12" label="Posts this month" />
      <Tile value={formatCount(squad.totalViews)} label="Total views" />
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
    <ul className="mt-4 flex flex-col gap-2">
      {team.slice(0, 5).map((member) => (
        <li key={member.id} className="flex items-center gap-2">
          <Avatar member={member} size={2} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {member.name}
            </span>
            <span className="truncate text-text-tertiary typo-footnote">
              @{member.username}
            </span>
            <span className="text-text-tertiary typo-footnote">
              {member.title}
            </span>
          </div>
        </li>
      ))}
    </ul>
    <div className="mt-auto pt-3">
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        className="w-full"
      >
        Show all team
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
  <Widget title="Awards and milestones">
    <span className="text-text-link typo-footnote">Learn more</span>
    <div className="my-3 grid grid-cols-2 gap-2">
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
  tabs,
  children,
  widgets,
}: {
  header: ReactNode;
  tabs: ReactNode;
  children: ReactNode;
  widgets: ReactNode;
}): ReactElement => (
  <div className="m-auto flex w-full max-w-[72rem] gap-4 p-4 pb-6">
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="rounded-16 border border-border-subtlest-tertiary">
        {header}
        {tabs}
        {children}
      </div>
    </main>
    <aside className="flex w-80 shrink-0 flex-col gap-4">{widgets}</aside>
  </div>
);

const squadTabs = [
  { id: HomeTab.Posts, label: 'Posts', count: squad.totalPosts },
  { id: HomeTab.About, label: 'About' },
];

export const SquadHome = ({
  viewer = Viewer.Visitor,
  initialTab = HomeTab.Posts,
}: {
  viewer?: Viewer;
  initialTab?: HomeTab;
}): ReactElement => {
  const [tab, setTab] = useState<HomeTab>(initialTab);

  return (
    <HomeFrame
      header={<SquadHeader viewer={viewer} />}
      tabs={<HomeTabs tabs={squadTabs} active={tab} onSelect={setTab} />}
      widgets={
        <>
          <OverviewWidget />
          <TeamWidget />
          <AwardsWidget />
        </>
      }
    >
      {tab === HomeTab.Posts ? (
        <PostsTab
          chips={['Latest', 'Top', 'Discussed']}
          activeChip="Latest"
          entries={feedEntries.slice(0, 6)}
          pinned={pinnedEntry}
        />
      ) : (
        <div className="flex flex-col divide-y divide-border-subtlest-tertiary p-6">
          <div />
          <AboutSection />
          <StackSection viewer={viewer} />
          <RolesSection />
        </div>
      )}
    </HomeFrame>
  );
};
