import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  SearchIcon,
  ShareIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { BoardId, Dev, Entry, Range } from './data';
import {
  BOARDS,
  boardById,
  COMPANY_BOARD,
  DEVS,
  displayRank,
  formatNumber,
  ME,
  myEntry,
  PLUGIN_MAKERS,
  rankBoard,
  unitFor,
} from './data';
import {
  Avatar,
  Delta,
  FollowButton,
  Rank,
  RangeSwitch,
  youHighlight,
} from './kit';
import { gapToNext } from './layouts1';
import {
  ClimbQuest,
  CompanyRows,
  RankCard,
  ReferralLadder,
  ReplayEntry,
  SharePanel,
  SlackDigestCard,
  XpChip,
} from './connected';

// The leaderboard in the squads directory's frame (#6843): search leads a
// tab row, a quiet action closes it, Overview mirrors Discover, and every
// board opens in the squad page's bordered card with a widget column.

type Tab = 'overview' | 'you' | BoardId | 'companies' | 'plugins';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'you', label: 'You' },
  ...BOARDS.map((board) => ({ id: board.id as Tab, label: board.short })),
  { id: 'companies', label: 'Companies' },
  { id: 'plugins', label: 'Plugin makers' },
];

// The squads directory's banner scrim, over a blurred avatar for people.
const scrim =
  'linear-gradient(to top, var(--theme-background-default) 8%, color-mix(in srgb, var(--theme-background-default), transparent 35%) 45%, transparent 80%)';

const isBoard = (tab: Tab): tab is BoardId =>
  BOARDS.some((board) => board.id === tab);

/* ------------------------------------------------------------- furniture */

const HubHeader = ({
  tab,
  onTab,
  onShare,
}: {
  tab: Tab;
  onTab: (tab: Tab) => void;
  onShare: () => void;
}): ReactElement => (
  <header className="flex items-center gap-4 border-b border-border-subtlest-tertiary px-6">
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
      icon={<SearchIcon />}
      aria-label="Search people"
    />
    <ul className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
      {TABS.map((item) => (
        <li
          key={item.id}
          className={classNames(
            'relative py-3',
            item.id === tab &&
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-1/2 after:border-b-2',
          )}
        >
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={
              item.id === tab ? ButtonVariant.Float : ButtonVariant.Tertiary
            }
            pressed={item.id === tab}
            onClick={() => onTab(item.id)}
          >
            {item.label}
          </Button>
        </li>
      ))}
    </ul>
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Subtle}
      icon={<ShareIcon />}
      onClick={onShare}
    >
      Share your rank
    </Button>
  </header>
);

const SectionHeader = ({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <header className="flex items-end justify-between gap-4">
    <div className="flex flex-col gap-0.5">
      <h2 className="font-bold typo-title3">{title}</h2>
      {subtitle && (
        <span className="text-text-tertiary typo-footnote">{subtitle}</span>
      )}
    </div>
    {action}
  </header>
);

const GroupLabel = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="col-span-full pb-1 pt-3 font-bold text-text-tertiary typo-footnote first:pt-0">
    {children}
  </span>
);

const Widget = ({
  title,
  action,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <div className="flex items-center justify-between gap-2">
      <h2 className="font-bold typo-callout">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

/** The squads directory row, for a person: the whole row opens the profile. */
const HubRow = ({
  rank,
  dev,
  meta,
  highlight = false,
  size = 'medium',
}: {
  rank: number;
  dev: Dev;
  meta: ReactNode;
  highlight?: boolean;
  size?: 'small' | 'medium';
}): ReactElement => (
  <article
    title={dev.isMe ? undefined : `Open ${dev.name}’s profile`}
    className={classNames(
      'flex cursor-pointer items-center gap-3 rounded-16 py-2',
      highlight && `-mx-2 ${youHighlight} px-2`,
    )}
  >
    <Rank rank={rank} />
    <Avatar
      dev={dev}
      size={size === 'small' ? 'size-10' : 'size-12'}
      className="!rounded-14"
    />
    <div className="flex min-w-0 flex-1 flex-col">
      <span
        className={classNames(
          'truncate font-bold typo-callout',
          dev.isMe && 'text-accent-cabbage-default',
        )}
      >
        {dev.name}
      </span>
      <span className="truncate tabular-nums text-text-tertiary typo-footnote">
        {meta}
      </span>
    </div>
    <FollowButton dev={dev} />
  </article>
);

const entryMeta = (entry: Entry, unit: string): string =>
  `${formatNumber(entry.score)} ${unitFor(entry.score, unit)}${
    entry.dev.isMe ? '' : ` · @${entry.dev.username}`
  }`;

/* -------------------------------------------------------------- overview */

const FeaturedTile = ({
  eyebrow,
  dev,
  stat,
  size,
  className,
}: {
  eyebrow: string;
  dev: Dev;
  stat: string;
  size: 'large' | 'small';
  className?: string;
}): ReactElement => {
  const isSmall = size === 'small';
  return (
    <article
      className={classNames(
        'relative isolate flex cursor-pointer flex-col justify-end overflow-hidden rounded-24 bg-background-subtle',
        className,
      )}
    >
      <img
        src={dev.image}
        alt=""
        className="absolute inset-0 -z-1 size-full scale-125 object-cover blur-xl"
      />
      <span className="absolute inset-0 -z-1" style={{ background: scrim }} />
      <div
        className={classNames(
          'flex flex-col',
          isSmall ? 'gap-1 p-3 pb-4' : 'gap-2 p-6 pb-4',
        )}
      >
        <span
          className={classNames(
            'font-bold uppercase tracking-wider text-text-secondary',
            isSmall ? 'typo-caption2' : 'typo-caption1',
          )}
        >
          {eyebrow}
        </span>
        <span className="flex items-center gap-3">
          <Avatar
            dev={dev}
            size={isSmall ? 'size-8' : 'size-12'}
            className="ring-2 ring-background-default"
          />
          <span
            className={classNames(
              'truncate font-bold',
              isSmall ? 'typo-callout' : 'typo-title2',
            )}
          >
            {dev.name}
          </span>
        </span>
        {!isSmall && (
          <span className="line-clamp-2 max-w-[36rem] text-text-secondary typo-callout">
            {dev.bio}
          </span>
        )}
        <span className="mt-1 flex items-center justify-between gap-3">
          <span
            className={classNames(
              'truncate font-bold tabular-nums text-text-secondary',
              isSmall ? 'typo-caption1' : 'typo-footnote',
            )}
          >
            {stat}
          </span>
          <FollowButton dev={dev} />
        </span>
      </div>
    </article>
  );
};

const BoardTile = ({
  title,
  leaders,
  you,
  onClick,
}: {
  title: string;
  leaders: Pick<Dev, 'id' | 'image' | 'name'>[];
  you?: string;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-28 flex-col justify-between gap-3 rounded-16 bg-surface-float p-4 text-left transition-colors hover:bg-surface-hover"
  >
    <span className="flex w-full items-start justify-between gap-2">
      <span className="font-bold typo-title3">{title}</span>
      {you && (
        <span className="rounded-8 bg-accent-cabbage-flat px-1.5 py-0.5 font-bold tabular-nums text-accent-cabbage-default typo-caption1">
          You {you}
        </span>
      )}
    </span>
    <span className="flex min-h-7 flex-row-reverse justify-end pl-2">
      {leaders
        .slice()
        .reverse()
        .map((dev) => (
          <Avatar
            key={dev.id}
            dev={dev}
            size="size-7"
            className="-ml-2 !rounded-full ring-2 ring-background-default"
          />
        ))}
    </span>
  </button>
);

const Overview = ({ onTab }: { onTab: (tab: Tab) => void }): ReactElement => {
  const week = rankBoard('reputation', 'week', DEVS);
  const climber = [...DEVS].sort(
    (a, b) => b.delta.upvotes - a.delta.upvotes,
  )[0];
  const streak = rankBoard('streak', 'all', DEVS)[0];
  const newcomer = rankBoard(
    'reputation',
    'week',
    DEVS.filter((dev) => dev.joinedDaysAgo < 90 && dev.id !== week[0].dev.id),
  )[0];
  const topWeek = rankBoard('reputation', 'week').slice(0, 9);

  return (
    <div className="flex flex-col gap-8 px-6 pb-10 pt-6">
      <section
        aria-label="Featured"
        className="grid h-[26rem] grid-cols-4 grid-rows-2 gap-4"
      >
        <FeaturedTile
          size="large"
          className="col-span-2 row-span-2"
          eyebrow="#1 reputation this week"
          dev={week[0].dev}
          stat={`${formatNumber(week[0].score)} rep since Monday`}
        />
        <FeaturedTile
          size="small"
          eyebrow="Biggest climber"
          dev={climber}
          stat={`▲ ${climber.delta.upvotes * 23} places on upvotes`}
        />
        <FeaturedTile
          size="small"
          eyebrow="Longest streak"
          dev={streak.dev}
          stat={`${formatNumber(streak.score)} days`}
        />
        <FeaturedTile
          size="small"
          eyebrow="Rising newcomer"
          dev={newcomer.dev}
          stat={`${formatNumber(newcomer.score)} rep this week`}
        />
        <FeaturedTile
          size="small"
          eyebrow="Top plugin maker"
          dev={PLUGIN_MAKERS[0].dev}
          stat={`${formatNumber(PLUGIN_MAKERS[0].upvotes)} upvotes`}
        />
      </section>
      <ReplayEntry places={14} board="reputation" compact />
      <section className="flex flex-col">
        <SectionHeader
          title="Top this week"
          subtitle="Reputation earned since Monday. Resets every week."
          action={
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={() => onTab('reputation')}
            >
              See all
            </Button>
          }
        />
        <div className="mt-2 grid grid-flow-col grid-cols-3 grid-rows-3 gap-x-8">
          {topWeek.map((entry) => (
            <HubRow
              key={entry.dev.id}
              rank={entry.rank}
              dev={entry.dev}
              highlight={entry.dev.isMe}
              meta={entryMeta(entry, 'rep')}
            />
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <SectionHeader title="Browse by board" />
        <div className="grid grid-cols-3 gap-3">
          {BOARDS.map((board) => (
            <BoardTile
              key={board.id}
              title={board.title}
              leaders={rankBoard(board.id, 'all', DEVS)
                .slice(0, 3)
                .map((entry) => entry.dev)}
              you={`#${displayRank(myEntry(board.id, 'week'), 'week')}`}
              onClick={() => onTab(board.id)}
            />
          ))}
          <BoardTile
            title="Most verified employees"
            leaders={COMPANY_BOARD.slice(0, 3).map((company) => ({
              id: company.id,
              name: company.name,
              image: `https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/${
                (company.id.length % 8) + 1
              }`,
            }))}
            onClick={() => onTab('companies')}
          />
          <BoardTile
            title="Top plugin makers"
            leaders={PLUGIN_MAKERS.slice(0, 3).map((maker) => maker.dev)}
            onClick={() => onTab('plugins')}
          />
        </div>
      </section>
    </div>
  );
};

/* ------------------------------------------------------------ inner pages */

const InnerFrame = ({
  title,
  subtitle,
  action,
  aside,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  aside: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="mx-auto flex w-full max-w-6xl gap-4 p-4 pb-6">
    <div className="flex min-w-0 flex-1 flex-col rounded-16 border border-border-subtlest-tertiary">
      <div className="flex items-end justify-between gap-4 px-6 pt-5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-bold typo-title2">{title}</h1>
          {subtitle && (
            <span className="text-text-tertiary typo-footnote">{subtitle}</span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
    <aside className="flex w-80 shrink-0 flex-col gap-4">{aside}</aside>
  </div>
);

const listGrid = 'grid grid-cols-2 content-start gap-x-8 px-6 pb-4 pt-3';

const ShareWidget = ({
  board,
  rank,
  onShare,
}: {
  board: BoardId;
  rank: number;
  onShare: () => void;
}): ReactElement => (
  <Widget title="Share your rank">
    <RankCard board={board} rank={rank} className="!w-full" />
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Secondary}
      icon={<ShareIcon />}
      onClick={onShare}
    >
      Share
    </Button>
  </Widget>
);

const ClimbersWidget = ({ board }: { board: BoardId }): ReactElement => (
  <Widget title="On the rise">
    <div className="flex flex-col">
      {[...DEVS]
        .sort((a, b) => b.delta[board] - a.delta[board])
        .slice(0, 5)
        .map((dev) => (
          <div key={dev.id} className="flex items-center gap-3 py-1.5">
            <Avatar dev={dev} size="size-8" />
            <span className="min-w-0 flex-1 truncate font-bold typo-callout">
              {dev.name}
            </span>
            <Delta value={dev.delta[board] * 17} className="!w-auto" />
          </div>
        ))}
    </div>
  </Widget>
);

const BoardPage = ({
  boardId,
  onShare,
}: {
  boardId: BoardId;
  onShare: () => void;
}): ReactElement => {
  const [range, setRange] = useState<Range>('week');
  const board = boardById(boardId);
  const list = rankBoard(boardId, range);
  const mine = myEntry(boardId, range);
  const gap = gapToNext(boardId, range);
  const rank = displayRank(mine, range);

  return (
    <InnerFrame
      title={board.title}
      subtitle={board.howTo}
      action={<RangeSwitch value={range} onChange={setRange} size="sm" />}
      aside={
        <>
          <Widget title="How to climb">
            <ClimbQuest stacked />
            {gap && (
              <span className="text-text-secondary typo-callout">
                <strong className="text-text-primary">
                  {formatNumber(gap.gap)} {unitFor(gap.gap, board.unit)}
                </strong>{' '}
                to pass {gap.dev.name}.
              </span>
            )}
            <span className="flex items-center justify-between gap-2">
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
              >
                {board.cta}
              </Button>
              <XpChip xp={30} />
            </span>
          </Widget>
          <ShareWidget board={boardId} rank={rank} onShare={onShare} />
          <ClimbersWidget board={boardId} />
        </>
      }
    >
      {boardId === 'referrals' && (
        <div className="px-6 pt-4">
          <ReferralLadder />
        </div>
      )}
      <div className={listGrid}>
        <GroupLabel>Your position</GroupLabel>
        <div className="col-span-full px-2">
          <HubRow
            rank={rank}
            dev={ME}
            highlight
            meta={`${entryMeta(mine, board.unit)} · ${
              mine.delta >= 0 ? '▲' : '▼'
            } ${Math.abs(mine.delta)} since last week`}
          />
        </div>
        <GroupLabel>Top 100</GroupLabel>
        <div className="col-span-full grid grid-flow-col grid-cols-2 grid-rows-[repeat(8,auto)] gap-x-8">
          {list
            .filter((entry) => !entry.dev.isMe)
            .slice(0, 16)
            .map((entry, index) => (
              <HubRow
                key={entry.dev.id}
                rank={index + 1}
                dev={entry.dev}
                meta={entryMeta(entry, board.unit)}
              />
            ))}
        </div>
        <span className="col-span-full flex justify-center pt-2">
          <Button type="button" variant={ButtonVariant.Float}>
            Show more
          </Button>
        </span>
      </div>
    </InnerFrame>
  );
};

const YouPage = ({ onShare }: { onShare: () => void }): ReactElement => (
  <InnerFrame
    title="Your ranks"
    subtitle="This week on every board, and the next spot on each."
    aside={
      <>
        <ShareWidget
          board="reputation"
          rank={displayRank(myEntry('reputation', 'week'), 'week')}
          onShare={onShare}
        />
      </>
    }
  >
    <div className="flex flex-col gap-2 px-6 pb-6 pt-4">
      <ReplayEntry places={14} board="reputation" compact />
      <ClimbQuest />
      {BOARDS.map((board) => {
        const entry = myEntry(board.id, 'week');
        const gap = gapToNext(board.id, 'week');
        return (
          <div
            key={board.id}
            className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary px-4 py-3"
          >
            <span className="w-28 font-bold typo-callout">{board.short}</span>
            <span className="w-16 font-bold tabular-nums typo-title3">
              #{displayRank(entry, 'week')}
            </span>
            <Delta value={entry.delta} />
            <span className="flex-1 text-text-secondary typo-footnote">
              {board.id === 'referrals'
                ? '1 more friend unlocks 3 months of Plus'
                : gap
                ? `${formatNumber(gap.gap)} ${unitFor(
                    gap.gap,
                    board.unit,
                  )} to pass ${gap.dev.name}`
                : 'You’re #1. Hold it until Monday.'}
            </span>
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Float}
            >
              {board.cta}
            </Button>
          </div>
        );
      })}
    </div>
  </InnerFrame>
);

const CompaniesPage = (): ReactElement => (
  <InnerFrame
    title="Most verified employees"
    subtitle="Companies by developers who verified their work email."
    aside={
      <SlackDigestCard
        company="Northwind"
        top={rankBoard('reputation', 'week', [
          ME,
          ...DEVS.filter((dev) => dev.company === 'Northwind'),
        ])}
      />
    }
  >
    <div className="flex flex-col px-4 pb-6 pt-3">
      <CompanyRows count={8} />
    </div>
  </InnerFrame>
);

const PluginsPage = (): ReactElement => (
  <InnerFrame
    title="Top plugin makers"
    subtitle="Upvotes on their marketplace plugins."
    aside={
      <Widget title="Publish a plugin">
        <span className="text-text-secondary typo-footnote">
          Plugins you publish to the marketplace count here as soon as people
          upvote them.
        </span>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
        >
          Open the marketplace
        </Button>
      </Widget>
    }
  >
    <div className={listGrid}>
      {PLUGIN_MAKERS.map((maker, index) => (
        <HubRow
          key={maker.plugin}
          rank={index + 1}
          dev={maker.dev}
          meta={`${maker.plugin} · ${formatNumber(maker.upvotes)} upvotes`}
        />
      ))}
    </div>
  </InnerFrame>
);

/* ------------------------------------------------------------------- hub */

export const LeaderboardHub = (): ReactElement => {
  const [tab, setTab] = useState<Tab>('overview');
  const [sharing, setSharing] = useState(false);
  const share = () => setSharing(true);
  const shareBoard: BoardId = isBoard(tab) ? tab : 'reputation';

  return (
    <div className="relative min-h-full">
      {sharing && (
        <SharePanel
          board={shareBoard}
          rank={displayRank(myEntry(shareBoard, 'week'), 'week')}
          onClose={() => setSharing(false)}
        />
      )}
      <HubHeader tab={tab} onTab={setTab} onShare={share} />
      {tab === 'overview' && <Overview onTab={setTab} />}
      {tab === 'you' && <YouPage onShare={share} />}
      {isBoard(tab) && <BoardPage key={tab} boardId={tab} onShare={share} />}
      {tab === 'companies' && <CompaniesPage />}
      {tab === 'plugins' && <PluginsPage />}
    </div>
  );
};
