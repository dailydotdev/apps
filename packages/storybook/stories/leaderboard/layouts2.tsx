import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  OrganizationIcon,
  SparkleIcon,
  SquadIcon,
  UserIcon,
  EarthIcon,
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
  Card,
  CardHeader,
  Chip,
  Delta,
  FollowButton,
  RangeSwitch,
  Row,
  Score,
  SeeAll,
} from './kit';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import { BOARD_ICON } from './layouts1';
import {
  CompanyRows,
  PluginMakersCard,
  ReplayEntry,
  SlackDigestCard,
  BringTeamCard,
} from './connected';

/* ------------------------------------------------------- 3. this week */

const Feature = ({
  eyebrow,
  dev,
  stat,
  note,
  tone,
}: {
  eyebrow: string;
  dev: Dev;
  stat: string;
  note: string;
  tone: string;
}): ReactElement => (
  <Card className="gap-4 p-5">
    <span className={classNames('font-bold typo-caption1', tone)}>
      {eyebrow}
    </span>
    <div className="flex items-center gap-3">
      <Avatar dev={dev} size="size-12" className="rounded-14" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-bold typo-body">{dev.name}</span>
        <span className="truncate text-text-tertiary typo-footnote">
          {dev.bio}
        </span>
      </div>
    </div>
    <div className="flex items-end justify-between">
      <div className="flex flex-col">
        <span className="font-bold tabular-nums typo-title2">{stat}</span>
        <span className="text-text-tertiary typo-footnote">{note}</span>
      </div>
      <FollowButton dev={dev} />
    </div>
  </Card>
);

export const ThisWeek = (): ReactElement => {
  const climbers = [...DEVS].sort((a, b) => b.delta.upvotes - a.delta.upvotes);
  const newcomers = rankBoard(
    'reputation',
    'week',
    DEVS.filter((dev) => dev.joinedDaysAgo < 90),
  );
  const topRep = rankBoard('reputation', 'week', DEVS)[0];
  const topStreak = rankBoard('streak', 'all', DEVS)[0];

  return (
    <div className="flex flex-col gap-8 px-8 py-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-text-tertiary typo-footnote">
            Week 41 · Oct 6–12
          </span>
          <h1 className="font-bold typo-large-title">This week on daily.dev</h1>
          <p className="text-text-tertiary typo-callout">
            The developers who earned the most, climbed the fastest and kept
            showing up. Updated every hour, reset every Monday.
          </p>
        </div>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          icon={<ArrowIcon className="-rotate-90" />}
        >
          Last week
        </Button>
      </div>
      <ReplayEntry places={14} board="reputation" />
      <div className="grid grid-cols-4 gap-4">
        <Feature
          eyebrow="#1 REPUTATION THIS WEEK"
          dev={topRep.dev}
          stat={`${formatNumber(topRep.score)} rep`}
          note="earned since Monday"
          tone="text-accent-cheese-default"
        />
        <Feature
          eyebrow="BIGGEST CLIMBER"
          dev={climbers[0]}
          stat={`▲ ${climbers[0].delta.upvotes * 23} places`}
          note="on most upvoted"
          tone="text-accent-avocado-default"
        />
        <Feature
          eyebrow="LONGEST ACTIVE STREAK"
          dev={topStreak.dev}
          stat={`${formatNumber(topStreak.score)} days`}
          note="reading every single day"
          tone="text-accent-bacon-default"
        />
        <Feature
          eyebrow="TOP PLUGIN MAKER"
          dev={PLUGIN_MAKERS[0].dev}
          stat={`${formatNumber(PLUGIN_MAKERS[0].upvotes)} upvotes`}
          note={`on ${PLUGIN_MAKERS[0].plugin}`}
          tone="text-accent-water-default"
        />
      </div>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold typo-title3">
            <SparkleIcon secondary className="text-accent-avocado-default" />
            Rising newcomers
            <span className="font-normal text-text-tertiary typo-callout">
              joined in the last 90 days
            </span>
          </h2>
          <SeeAll label="All newcomers" />
        </div>
        <div className="grid grid-cols-6 gap-3">
          {newcomers.slice(0, 6).map((entry) => (
            <Card
              key={entry.dev.id}
              className="items-center gap-2 p-4 text-center"
            >
              <Avatar dev={entry.dev} size="size-12" className="rounded-14" />
              <span className="w-full truncate font-bold typo-callout">
                {entry.dev.name}
              </span>
              <span className="text-text-tertiary typo-caption1">
                Joined {Math.round(entry.dev.joinedDaysAgo / 7)} weeks ago
              </span>
              <Score value={entry.score} unit="rep this week" />
              <FollowButton dev={entry.dev} />
            </Card>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold typo-title3">Hall of fame · all time</h2>
          <SeeAll label="Every board" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {(['reputation', 'level', 'streak', 'referrals'] as BoardId[]).map(
            (id) => {
              const board = boardById(id);
              return (
                <Card key={id} className="pb-2">
                  <CardHeader title={board.title} action={<SeeAll />} />
                  <ol className="flex flex-col px-2">
                    {rankBoard(id, 'all', DEVS)
                      .slice(0, 5)
                      .map((entry) => (
                        <Row
                          key={entry.dev.id}
                          rank={entry.rank}
                          dev={entry.dev}
                          dense
                          hoverCard
                          showLevel={id === 'level'}
                        >
                          <Score value={entry.score} unit={board.unit} />
                        </Row>
                      ))}
                  </ol>
                </Card>
              );
            },
          )}
        </div>
      </section>
      <div className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-5 py-3">
        <span className="rounded-8 bg-surface-float px-2 py-0.5 font-bold text-text-tertiary typo-caption1">
          Logged out
        </span>
        <span className="flex-1 typo-callout">
          Join millions of developers on daily.dev and see where you’d rank.
        </span>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------- 4. circles */

export type Circle = 'global' | 'following' | 'company' | 'country' | 'squad';

export const CIRCLES: {
  id: Circle;
  label: string;
  icon: ReactElement;
  filter: (dev: Dev) => boolean;
}[] = [
  { id: 'global', label: 'Everyone', icon: <EarthIcon />, filter: () => true },
  {
    id: 'following',
    label: 'People you follow',
    icon: <UserIcon />,
    filter: (dev) => dev.isFollowing,
  },
  {
    id: 'company',
    label: 'Northwind',
    icon: <OrganizationIcon />,
    filter: (dev) => dev.company === 'Northwind',
  },
  {
    id: 'country',
    label: 'Israel',
    icon: <EarthIcon />,
    filter: (dev) => dev.country === 'Israel',
  },
  {
    id: 'squad',
    label: 'Go Gophers squad',
    icon: <SquadIcon />,
    filter: (dev) => dev.tags.includes('golang') || dev.tags.includes('devops'),
  },
];

export const Circles = (): ReactElement => {
  const [circle, setCircle] = useState<Circle>('following');
  const [boardId, setBoardId] = useState<BoardId>('reputation');
  const [range, setRange] = useState<Range>('week');
  const current = CIRCLES.find((item) => item.id === circle) ?? CIRCLES[0];
  const pool = [ME, ...DEVS.filter(current.filter)];
  const list = rankBoard(boardId, range, pool);
  const board = boardById(boardId);
  const mine = list.find((entry) => entry.dev.isMe) as Entry;

  return (
    <div className="flex gap-8 px-8 py-6">
      <section className="flex min-w-0 flex-1 flex-col gap-5">
        <h1 className="font-bold typo-title1">Leaderboard</h1>
        <div className="flex gap-2">
          {CIRCLES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCircle(item.id)}
              className={classNames(
                'flex flex-1 items-center gap-2 rounded-14 border px-3 py-3 text-left typo-callout',
                item.id === circle
                  ? 'border-accent-cabbage-default bg-accent-cabbage-flat font-bold'
                  : 'border-border-subtlest-tertiary text-text-secondary hover:bg-surface-hover',
              )}
            >
              <span className="text-text-tertiary">{item.icon}</span>
              <span className="flex min-w-0 flex-col">
                <span className="flex min-w-0 items-center gap-1">
                  <span className="truncate">{item.label}</span>
                  {item.id === 'company' && <VerifiedSquadBadge />}
                </span>
                <span className="font-normal text-text-quaternary typo-caption1">
                  {item.id === 'global'
                    ? 'millions of developers'
                    : `${DEVS.filter(item.filter).length + 1} developers`}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {BOARDS.map((item) => (
            <Chip
              key={item.id}
              active={item.id === boardId}
              onClick={() => setBoardId(item.id)}
            >
              {item.short}
            </Chip>
          ))}
          <span className="ml-auto">
            <RangeSwitch value={range} onChange={setRange} size="sm" />
          </span>
        </div>
        <div className="flex flex-col">
          <ol className="flex flex-col">
            {list.slice(0, 12).map((entry) => (
              <Row
                key={entry.dev.id}
                rank={
                  circle === 'global' ? displayRank(entry, range) : entry.rank
                }
                dev={entry.dev}
                highlight={entry.dev.isMe}
                hoverCard
              >
                <Delta value={entry.delta} />
                <Score
                  value={entry.score}
                  unit={board.unit}
                  className="w-28 text-right"
                />
                <span className="flex w-28 justify-end">
                  <FollowButton dev={entry.dev} />
                </span>
              </Row>
            ))}
          </ol>
          {list.length > 12 && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              className="mt-1 self-center"
            >
              Show the top 100
            </Button>
          )}
        </div>
      </section>
      <aside className="flex w-80 shrink-0 flex-col gap-4">
        <Card className="gap-2 p-4">
          <span className="text-text-tertiary typo-footnote">
            In{' '}
            {current.label.toLowerCase() === 'everyone'
              ? 'everyone'
              : current.label}
          </span>
          <span className="font-bold typo-title1">
            #{circle === 'global' ? displayRank(mine, range) : mine.rank}{' '}
            <span className="font-normal text-text-tertiary typo-callout">
              of {circle === 'global' ? 'everyone' : list.length}
            </span>
          </span>
          <span className="text-text-secondary typo-callout">
            {formatNumber(mine.score)} {unitFor(mine.score, board.unit)}{' '}
            {range === 'all'
              ? 'all time'
              : range === 'week'
              ? 'this week'
              : 'this month'}
            .
          </span>
        </Card>
        {circle === 'company' && (
          <SlackDigestCard company={current.label} top={list} />
        )}
        <BringTeamCard />
        <Card className="gap-2 p-4">
          <span className="font-bold typo-callout">Create a circle</span>
          <span className="text-text-secondary typo-footnote">
            Any squad you’re in gets its own board. Admins can pin it to the
            squad page.
          </span>
        </Card>
      </aside>
    </div>
  );
};

/* ------------------------------------------------------ 5. compact grid */

export const CompactGrid = (): ReactElement => {
  const [range, setRange] = useState<Range>('all');

  return (
    <div className="flex flex-col gap-5 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold typo-title1">Developer leaderboard</h1>
          <p className="text-text-tertiary typo-callout">
            Hover anyone for their profile. Your rank is pinned on every board.
          </p>
        </div>
        <RangeSwitch value={range} onChange={setRange} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {BOARDS.slice(0, 7).map((board) => {
          const list = rankBoard(board.id, range);
          const mine = myEntry(board.id, range);
          return (
            <Card key={board.id} className="pb-2">
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <span className="text-text-tertiary">
                      {BOARD_ICON[board.id]}
                    </span>
                    {board.title}
                  </span>
                }
                action={<SeeAll />}
              />
              <div className="mx-4 mb-1 flex items-center justify-between rounded-10 bg-accent-cabbage-flat px-2 py-1 typo-footnote">
                <span className="font-bold text-accent-cabbage-default">
                  You · #{displayRank(mine, range).toLocaleString('en-US')}
                </span>
                <span className="flex items-center gap-1 text-text-secondary">
                  {formatNumber(mine.score)} {unitFor(mine.score, board.unit)}
                  <Delta value={mine.delta} className="!w-auto" />
                </span>
              </div>
              <ol className="flex flex-col px-2">
                {list
                  .filter((entry) => !entry.dev.isMe)
                  .slice(0, 5)
                  .map((entry, index) => (
                    <Row
                      key={entry.dev.id}
                      rank={index + 1}
                      dev={entry.dev}
                      dense
                      hoverCard
                      showLevel={board.id === 'level'}
                    >
                      <Score value={entry.score} unit={board.unit} />
                    </Row>
                  ))}
              </ol>
            </Card>
          );
        })}
        <Card className="pb-2">
          <CardHeader
            title="Most verified employees"
            subtitle="Companies by verified developers"
            action={<SeeAll />}
          />
          <CompanyRows />
        </Card>
        <PluginMakersCard />
      </div>
    </div>
  );
};
