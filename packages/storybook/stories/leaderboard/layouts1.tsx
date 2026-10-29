import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  CalendarIcon,
  EyeIcon,
  InviteIcon,
  OrganizationIcon,
  ReadingStreakIcon,
  ReputationIcon,
  TerminalIcon,
  ShareIcon,
  StarIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { UserTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard/UserTopList';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { BoardId, Entry, Range } from './data';
import {
  BOARDS,
  boardById,
  DEVS,
  displayRank,
  formatNumber,
  ME,
  myEntry,
  rankBoard,
  unitFor,
} from './data';
import {
  Avatar,
  Card,
  CardHeader,
  Delta,
  Divider,
  FollowButton,
  Rank,
  RangeSwitch,
  Row,
  Score,
  SeeAll,
  youHighlight,
} from './kit';
import {
  ClimbQuest,
  RankCard,
  ReferralLadder,
  ReplayEntry,
  SharePanel,
  XpChip,
} from './connected';

export const BOARD_ICON: Record<BoardId, ReactNode> = {
  reputation: <ReputationIcon secondary />,
  level: <StarIcon secondary />,
  streak: <ReadingStreakIcon secondary />,
  upvotes: <UpvoteIcon secondary />,
  views: <EyeIcon secondary />,
  readingDays: <CalendarIcon secondary />,
  referrals: <InviteIcon secondary />,
};

/** "48 rep to pass Lena": the gap to the next person up. */
export const gapToNext = (
  board: BoardId,
  range: Range,
): { gap: number; dev: Entry['dev'] } | null => {
  const list = rankBoard(board, range);
  const mine = list.findIndex((entry) => entry.dev.isMe);
  if (mine <= 0) {
    return null;
  }
  const above = list[mine - 1];
  return { gap: above.score - list[mine].score + 1, dev: above.dev };
};

const PageHeader = ({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <div className="flex items-end justify-between gap-6">
    <div className="flex flex-col gap-1">
      <h1 className="font-bold typo-title1">{title}</h1>
      {subtitle && (
        <p className="text-text-tertiary typo-callout">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

/* ------------------------------------------------------- 0. production */

const toUser = (entry: Entry): LoggedUser =>
  ({
    id: entry.dev.id,
    name: entry.dev.name,
    username: entry.dev.username,
    image: entry.dev.image,
    permalink: `https://app.daily.dev/${entry.dev.username}`,
    reputation: entry.dev.scores.reputation.all,
  } as LoggedUser);

export const Today = (): ReactElement => (
  <div className="mx-auto flex max-w-[63.75rem] flex-col gap-6 px-6 py-6">
    <span className="flex h-10 items-center rounded-12 border border-border-subtlest-tertiary px-3 text-text-quaternary typo-callout">
      Search people
    </span>
    <div className="grid grid-cols-2 gap-6">
      {BOARDS.map((board) => (
        <UserTopList
          key={board.id}
          containerProps={{ title: board.title }}
          items={rankBoard(board.id, 'all', DEVS)
            .slice(0, 10)
            .map((entry) => ({ score: entry.score, user: toUser(entry) }))}
          isLoading={false}
          concatScore={board.id !== 'streak'}
        />
      ))}
    </div>
  </div>
);

/* --------------------------------------------- 1. board browser + podium */

const Podium = ({
  entries,
  unit,
}: {
  entries: Entry[];
  unit: string;
}): ReactElement => {
  const order = [entries[1], entries[0], entries[2]];
  return (
    <div className="grid grid-cols-3 items-end gap-4">
      {order.map((entry) => (
        <div
          key={entry.dev.id}
          className={classNames(
            'flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-4 text-center',
            entry.rank === 1 ? 'pb-5 pt-6' : 'pb-4 pt-4',
          )}
        >
          <div className="relative">
            <Avatar
              dev={entry.dev}
              size={entry.rank === 1 ? 'size-20' : 'size-14'}
              className="rounded-16"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background-default p-0.5">
              <Rank rank={entry.rank} className="!w-6" />
            </span>
          </div>
          <div className="mt-1 flex min-w-0 flex-col">
            <span className="truncate font-bold typo-callout">
              {entry.dev.name}
            </span>
            <span className="truncate text-text-quaternary typo-footnote">
              @{entry.dev.username}
            </span>
          </div>
          <Score value={entry.score} unit={unit} className="typo-title3" />
          <FollowButton dev={entry.dev} />
        </div>
      ))}
    </div>
  );
};

export const BoardBrowser = (): ReactElement => {
  const [boardId, setBoardId] = useState<BoardId>('reputation');
  const [range, setRange] = useState<Range>('week');
  const board = boardById(boardId);
  const list = rankBoard(boardId, range);
  const mine = myEntry(boardId, range);
  const gap = gapToNext(boardId, range);
  const [sharing, setSharing] = useState(false);

  return (
    <div className="relative flex gap-8 px-8 py-6">
      {sharing && (
        <SharePanel
          board={boardId}
          rank={displayRank(mine, range)}
          onClose={() => setSharing(false)}
        />
      )}
      <aside className="flex w-64 shrink-0 flex-col gap-1">
        <span className="px-3 pb-2 font-bold text-text-quaternary typo-caption1">
          Boards · your rank
        </span>
        {BOARDS.map((item) => {
          const entry = myEntry(item.id, range);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setBoardId(item.id)}
              className={classNames(
                'flex h-11 items-center gap-3 rounded-12 px-3 text-left typo-callout',
                item.id === boardId
                  ? 'bg-surface-float font-bold text-text-primary'
                  : 'text-text-secondary hover:bg-surface-hover',
              )}
            >
              <span className="text-text-tertiary">{BOARD_ICON[item.id]}</span>
              <span className="flex-1 truncate">{item.short}</span>
              <span className="tabular-nums text-text-quaternary typo-footnote">
                #{displayRank(entry, range).toLocaleString('en-US')}
              </span>
            </button>
          );
        })}
        <span className="my-2 h-px bg-border-subtlest-tertiary" />
        <span className="flex h-11 items-center gap-3 rounded-12 px-3 text-text-secondary typo-callout">
          <OrganizationIcon className="text-text-tertiary" /> Companies
        </span>
        <span className="flex h-11 items-center gap-3 rounded-12 px-3 text-text-secondary typo-callout">
          <TerminalIcon className="text-text-tertiary" />
          <span className="flex-1">Plugin makers</span>
          <span className="rounded-6 bg-accent-avocado-flat px-1.5 py-0.5 font-bold text-accent-avocado-default typo-caption2">
            New
          </span>
        </span>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col gap-6">
        <PageHeader title={board.title} subtitle={board.howTo}>
          <RangeSwitch value={range} onChange={setRange} />
        </PageHeader>
        <Podium entries={list.slice(0, 3)} unit={board.unit} />
        {boardId === 'referrals' ? (
          <ReferralLadder />
        ) : (
          <div className={`flex flex-col gap-2 rounded-16 ${youHighlight} p-3`}>
            <div className="flex items-center gap-4 px-1">
              <Avatar dev={ME} size="size-10" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold typo-callout">
                  You’re #{displayRank(mine, range).toLocaleString('en-US')}{' '}
                  with {formatNumber(mine.score)}{' '}
                  {unitFor(mine.score, board.unit)}
                </span>
                {gap && (
                  <span className="text-text-secondary typo-footnote">
                    {formatNumber(gap.gap)} {unitFor(gap.gap, board.unit)} to
                    pass {gap.dev.name}. {board.howTo}
                  </span>
                )}
              </div>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Float}
                icon={<ShareIcon />}
                onClick={() => setSharing(true)}
              >
                Share
              </Button>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
              >
                {board.cta}
              </Button>
            </div>
            <ClimbQuest />
          </div>
        )}
        <ol className="flex flex-col">
          {list.slice(3, 14).map((entry) => (
            <Row
              key={entry.dev.id}
              rank={entry.rank}
              dev={entry.dev}
              highlight={entry.dev.isMe}
              hoverCard
              showLevel={boardId === 'level'}
            >
              <span className="flex w-40 gap-1">
                {entry.dev.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1"
                  >
                    #{tag}
                  </span>
                ))}
              </span>
              <Delta value={entry.delta} />
              <Score
                value={entry.score}
                unit={board.unit}
                className="w-28 text-right"
              />
              <FollowButton dev={entry.dev} />
            </Row>
          ))}
        </ol>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          className="self-center"
        >
          Show ranks 15–100
        </Button>
      </section>
    </div>
  );
};

/* ------------------------------------------------------------ 2. you hub */

export const YouHub = (): ReactElement => {
  const [range, setRange] = useState<Range>('week');
  const featured: BoardId[] = ['reputation', 'upvotes', 'streak'];
  const questXp: Partial<Record<BoardId, number>> = {
    reputation: 30,
    upvotes: 20,
    streak: 10,
  };
  const [sharing, setSharing] = useState(false);
  const shareRank = displayRank(myEntry('reputation', range), range);

  return (
    <div className="relative flex flex-col gap-6 px-8 py-6">
      {sharing && (
        <SharePanel
          board="reputation"
          rank={shareRank}
          onClose={() => setSharing(false)}
        />
      )}
      <PageHeader
        title="Leaderboard"
        subtitle="Where you stand, and the fastest way up."
      >
        <RangeSwitch value={range} onChange={setRange} />
      </PageHeader>
      <Card className="!flex-row gap-6 p-6">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar dev={ME} size="size-16" className="rounded-16" />
            <div className="flex flex-col">
              <span className="font-bold typo-title2">Your week</span>
              <span className="text-text-tertiary typo-callout">
                Up on 5 of 7 boards since last week. Resets Monday 00:00 UTC.
              </span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {BOARDS.map((board) => {
              const entry = myEntry(board.id, range);
              return (
                <div
                  key={board.id}
                  className="flex flex-col gap-1 rounded-12 bg-surface-float p-3"
                >
                  <span className="flex items-center gap-1 text-text-tertiary typo-caption1">
                    {board.short}
                  </span>
                  <span className="font-bold tabular-nums typo-title3">
                    #{displayRank(entry, range).toLocaleString('en-US')}
                  </span>
                  <span className="flex items-center justify-between">
                    <span className="text-text-quaternary typo-caption1">
                      {formatNumber(entry.score)}{' '}
                      {unitFor(entry.score, board.unit)}
                    </span>
                    <Delta value={entry.delta} className="!w-auto" />
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold text-text-tertiary typo-footnote">
              Your next steps
            </span>
            <ClimbQuest />
            {featured.map((id) => {
              const gap = gapToNext(id, range);
              const board = boardById(id);
              return (
                gap && (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2"
                  >
                    <span className="text-text-tertiary">{BOARD_ICON[id]}</span>
                    <Avatar dev={gap.dev} size="size-6" />
                    <span className="flex-1 typo-callout">
                      <strong>
                        {formatNumber(gap.gap)} {unitFor(gap.gap, board.unit)}
                      </strong>{' '}
                      to pass {gap.dev.name} on {board.short.toLowerCase()}
                    </span>
                    <XpChip xp={questXp[id] ?? 10} />
                    <Button
                      type="button"
                      size={ButtonSize.XSmall}
                      variant={ButtonVariant.Float}
                    >
                      {board.cta}
                    </Button>
                  </div>
                )
              );
            })}
            <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
              <span className="text-text-tertiary">{BOARD_ICON.referrals}</span>
              <span className="flex-1 typo-callout">
                <strong>1 more friend</strong> unlocks 3 months of Plus
              </span>
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Float}
              >
                Invite friends
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <RankCard board="reputation" rank={shareRank} />
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            icon={<ShareIcon />}
            onClick={() => setSharing(true)}
          >
            Share your rank
          </Button>
        </div>
      </Card>
      <ReplayEntry places={14} board="reputation" />
      <div className="grid grid-cols-3 gap-4">
        {BOARDS.slice(0, 6).map((board) => {
          const list = rankBoard(board.id, range);
          const mine = list.findIndex((entry) => entry.dev.isMe);
          return (
            <Card key={board.id} className="pb-2">
              <CardHeader title={board.title} action={<SeeAll />} />
              <ol className="flex flex-col px-2">
                {list.slice(0, 3).map((entry) => (
                  <Row
                    key={entry.dev.id}
                    rank={entry.rank}
                    dev={entry.dev}
                    dense
                    hoverCard
                    showLevel={board.id === 'level'}
                  >
                    <Score value={entry.score} unit={board.unit} />
                  </Row>
                ))}
                {mine > 3 && <Divider />}
                {mine >= 3 &&
                  list.slice(mine, mine + 1).map((entry) => (
                    <Row
                      key={entry.dev.id}
                      rank={displayRank(entry, range)}
                      dev={entry.dev}
                      dense
                      highlight
                    >
                      <Score value={entry.score} unit={board.unit} />
                    </Row>
                  ))}
              </ol>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
