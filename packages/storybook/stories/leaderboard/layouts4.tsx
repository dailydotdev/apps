import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  CopyIcon,
  InviteIcon,
  MiniCloseIcon,
  SlackIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { BoardId, Dev, Entry, Range } from './data';
import {
  boardById,
  COMPANY_BOARD,
  DEVS,
  displayRank,
  formatNumber,
  ME,
  ME_PROFILE,
  MY_LADDER_FRIENDS,
  myEntry,
  rankBoard,
  REFERRAL_LADDER,
  unitFor,
} from './data';
import type { SnapshotNeighbor } from './connected';
import {
  BringTeamCard,
  LeaderboardSnapshotCard,
  PlusLadder,
  SlackDigestCard,
} from './connected';
import { gapToNext } from './layouts1';
import { ProfileSnapshotButton } from '@dailydotdev/shared/src/features/snapshot/ProfileSnapshotButton';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { PlusTitle } from '@dailydotdev/shared/src/components/plus/PlusTitle';
import { TypographyType } from '@dailydotdev/shared/src/components/typography/Typography';
import { formatReferralLadderMonths } from '@dailydotdev/shared/src/lib/referral';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import {
  Avatar,
  Delta,
  Dropdown,
  FollowButton,
  Rank,
  Row,
  Score,
  Segmented,
  youHighlight,
} from './kit';

// Option B: one scroll, no tabs. Every list is one of production's
// leaderboards; all of them live in Every leaderboard at the end.

/* -------------------------------------------------------- this week's rep */

/** The lists rank by production's Highest reputation, for this week. */
const weeklyScore = (dev: Dev): number => dev.scores.reputation.week;

interface Ranked {
  rank: number;
  dev: Dev;
  score: number;
}

const EVERYONE = [ME, ...DEVS];

/** People you follow and your teammates. */
const CIRCLE = [
  ME,
  ...DEVS.filter((dev) => dev.isFollowing || dev.company === ME.company),
];

const rankByScore = (
  pool: Dev[],
  score: (dev: Dev) => number = weeklyScore,
): Ranked[] =>
  [...pool]
    .sort((a, b) => score(b) - score(a))
    .map((dev, index) => ({ rank: index + 1, dev, score: score(dev) }));

const mineIn = (list: Ranked[]): Ranked =>
  list.find((entry) => entry.dev.isMe) as Ranked;

const Follow = ({ dev }: { dev: Dev }): ReactElement => (
  <span className="flex w-28 shrink-0 justify-end">
    <FollowButton dev={dev} />
  </span>
);

const Heading = ({
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

const TextLink = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="flex shrink-0 items-center gap-1 font-bold text-text-tertiary typo-footnote hover:text-text-primary"
  >
    {children}
    <ArrowIcon size={IconSize.Size16} className="rotate-90" />
  </button>
);

/* ------------------------------------------------------ B. single scroll */

/** A small card: why, who, one number, Follow. */
const Standout = ({
  eyebrow,
  dev,
  stat,
}: {
  eyebrow: string;
  dev: Dev;
  stat: string;
}): ReactElement => (
  <article className="flex w-40 shrink-0 cursor-pointer flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary p-3 text-center hover:border-border-subtlest-secondary">
    <span className="w-full truncate font-bold uppercase tracking-wide text-text-primary typo-caption2">
      {eyebrow}
    </span>
    <Avatar dev={dev} size="size-12" className="rounded-14" />
    <span className="flex w-full min-w-0 flex-col">
      <span className="truncate font-bold typo-footnote">{dev.name}</span>
      <span className="truncate text-text-tertiary typo-caption1">{stat}</span>
    </span>
    <FollowButton dev={dev} />
  </article>
);

/** The #1 of every production people leaderboard, which store score only. */
const STANDOUT_BOARDS: { board: BoardId; eyebrow: string }[] = [
  { board: 'reputation', eyebrow: 'HIGHEST REPUTATION' },
  { board: 'streak', eyebrow: 'LONGEST STREAK' },
  { board: 'views', eyebrow: 'MOST POST VIEWS' },
  { board: 'upvotes', eyebrow: 'MOST UPVOTED' },
  { board: 'referrals', eyebrow: 'TOP REFERRER' },
  { board: 'readingDays', eyebrow: 'MOST READING DAYS' },
  { board: 'level', eyebrow: 'HIGHEST LEVEL' },
];

export const useStandouts = (): {
  eyebrow: string;
  dev: Dev;
  stat: string;
}[] =>
  STANDOUT_BOARDS.map(({ board, eyebrow }) => {
    const [top] = rankBoard(board, 'all', DEVS);
    return {
      eyebrow,
      dev: top.dev,
      stat:
        board === 'level'
          ? `Level ${top.dev.level}`
          : `${formatNumber(top.score)} ${unitFor(
              top.score,
              boardById(board).unit,
            )}`,
    };
  });

const StandoutGrid = (): ReactElement => {
  const standouts = useStandouts();
  return (
    <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
      {standouts.map((item) => (
        <Standout key={item.eyebrow} {...item} />
      ))}
    </div>
  );
};

// The categories /users shows today, in the same order.
const PRODUCTION_BOARDS: BoardId[] = [
  'level',
  'reputation',
  'streak',
  'views',
  'upvotes',
  'referrals',
  'readingDays',
];

const MiniRow = ({
  rank,
  name,
  image,
  value,
  highlight = false,
  suffix,
}: {
  rank: number;
  name: string;
  image: ReactNode;
  value: string;
  highlight?: boolean;
  suffix?: ReactNode;
}): ReactElement => (
  <li
    className={classNames(
      'flex h-9 cursor-pointer items-center gap-2 rounded-10 px-1.5',
      highlight ? youHighlight : 'hover:bg-surface-hover',
    )}
  >
    <span className="flex w-6 shrink-0 justify-center">
      {rank <= 3 ? (
        <Rank rank={rank} className="!w-6" />
      ) : (
        <span className="font-bold tabular-nums text-text-tertiary typo-caption1">
          {rank.toLocaleString('en-US')}
        </span>
      )}
    </span>
    {image}
    <span
      className={classNames(
        'flex min-w-0 flex-1 items-center gap-1 truncate font-bold typo-footnote',
        highlight && 'text-accent-cabbage-default',
      )}
    >
      <span className="truncate">{name}</span>
      {suffix}
    </span>
    <span className="shrink-0 font-bold tabular-nums typo-footnote">
      {value}
    </span>
  </li>
);

const EXPAND_MS = 220;

/**
 * A board's top 3 and your row. A press anywhere on it expands the card in place into a
 * popover with the full list scrolling inside; a click outside closes it.
 */
const MiniCard = ({
  title,
  top,
  all,
  you,
}: {
  title: string;
  top: ReactNode;
  all: ReactNode;
  you: ReactNode;
}): ReactElement => {
  // Mounted, then expanded on the next frame so the growth animates; on
  // close it shrinks first and unmounts once the transition is done.
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const open = () => {
    setMounted(true);
    setTimeout(() => setExpanded(true), 16);
  };
  const close = () => {
    setExpanded(false);
    setTimeout(() => setMounted(false), EXPAND_MS);
  };
  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-label={`${title}, open the top 100`}
        onClick={open}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open();
          }
        }}
        className="flex cursor-pointer flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover"
      >
        <div className="flex items-start justify-between gap-2 px-1.5 pb-1">
          <span className="truncate font-bold typo-callout">{title}</span>
          <TextLink>Top 100</TextLink>
        </div>
        <ol className="flex flex-col">
          {top}
          <li className="my-1 h-px bg-border-subtlest-tertiary" />
          {you}
        </ol>
      </div>
      {mounted && (
        <>
          <span aria-hidden className="fixed inset-0 z-2" onClick={close} />
          <div
            role="dialog"
            aria-label={`${title}, top 100`}
            style={{ transitionDuration: `${EXPAND_MS}ms` }}
            className={classNames(
              'absolute z-3 flex flex-col overflow-hidden rounded-20 border border-border-subtlest-secondary bg-background-popover shadow-2 transition-all ease-out',
              expanded
                ? '-inset-x-3 -top-3 max-h-[30rem] opacity-100'
                : 'inset-x-0 top-0 max-h-[13rem] opacity-64',
            )}
          >
            <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
              <span className="flex flex-col">
                <span className="font-bold typo-body">{title}</span>
                <span className="text-text-tertiary typo-caption1">
                  Top 100
                </span>
              </span>
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                icon={<MiniCloseIcon />}
                aria-label="Close"
                onClick={close}
              />
            </div>
            <ol className="flex min-h-0 shrink flex-col overflow-y-auto px-3">
              {all}
            </ol>
            <ol className="border-t border-border-subtlest-tertiary p-3">
              {you}
            </ol>
          </div>
        </>
      )}
    </div>
  );
};

const BoardCard = ({
  boardId,
  range,
}: {
  boardId: BoardId;
  range: Range;
}): ReactElement => {
  const board = boardById(boardId);
  const list = rankBoard(boardId, range, DEVS);
  const mine = myEntry(boardId, range);
  const rows = (entries: typeof list) =>
    entries.map((entry) => (
      <MiniRow
        key={entry.dev.id}
        rank={entry.rank}
        name={entry.dev.name}
        image={<Avatar dev={entry.dev} size="size-6" className="!rounded-8" />}
        value={formatNumber(entry.score)}
      />
    ));
  return (
    <MiniCard
      title={board.title}
      top={rows(list.slice(0, 3))}
      all={rows(list)}
      you={
        <MiniRow
          rank={displayRank(mine, range)}
          name="You"
          image={<Avatar dev={ME} size="size-6" className="!rounded-8" />}
          value={formatNumber(mine.score)}
          highlight
        />
      }
    />
  );
};

const CompaniesCard = (): ReactElement => {
  const myCompany = COMPANY_BOARD.findIndex(
    (company) => company.name === ME.company,
  );
  const logo = (company: (typeof COMPANY_BOARD)[number]) => (
    <span
      className={classNames(
        'flex size-6 shrink-0 items-center justify-center rounded-8 font-bold typo-caption2',
        company.squad
          ? `${company.squad.brand} text-white`
          : 'bg-surface-float text-text-secondary',
      )}
    >
      {company.name[0]}
    </span>
  );
  const row = (index: number, highlight = false) => {
    const company = COMPANY_BOARD[index];
    return (
      <MiniRow
        key={company.id}
        rank={index + 1}
        name={company.name}
        image={logo(company)}
        value={formatNumber(company.verified)}
        highlight={highlight}
        suffix={company.squad && <VerifiedSquadBadge className="size-3.5" />}
      />
    );
  };
  return (
    <MiniCard
      title="Most verified employees"
      top={[0, 1, 2].map((index) => row(index))}
      all={COMPANY_BOARD.map((_, index) => row(index))}
      you={row(myCompany, true)}
    />
  );
};

/* -------------------------------------------------------------- you card */

type Highlight = BoardId;

export interface HighlightDetail {
  rank: number;
  delta: number;
  value: string;
  gap?: string;
  /** What the shared card says: "#6 Highest reputation". */
  title: string;
  /** The headline tile beside the rank on the snapshot. */
  stat: { value: string; label: string };
  /** You and the two people either side, for the snapshot. */
  neighbors: SnapshotNeighbor[];
}

const neighborsOf = (
  rows: { rank: number; dev: Dev; score: number }[],
  format: (score: number) => string,
): SnapshotNeighbor[] => {
  const mine = rows.findIndex((row) => row.dev.isMe);
  return rows.slice(Math.max(0, mine - 2), mine + 3).map((row) => ({
    rank: row.rank,
    name: row.dev.isMe ? ME_PROFILE.name : row.dev.name,
    value: format(row.score),
    isMe: row.dev.isMe,
  }));
};

const highlightDetail = (highlight: Highlight): HighlightDetail => {
  const board = boardById(highlight);
  const mine = myEntry(highlight, 'week');
  const gap = gapToNext(highlight, 'week');
  return {
    rank: displayRank(mine, 'week'),
    delta: mine.delta,
    value: `${formatNumber(mine.score)} ${unitFor(
      mine.score,
      board.unit,
    )} this week`,
    gap: gap
      ? `${formatNumber(gap.gap)} ${unitFor(gap.gap, board.unit)} to pass ${
          gap.dev.name
        }`
      : undefined,
    title: board.title,
    stat: {
      value: formatNumber(mine.score),
      label: `${unitFor(mine.score, board.unit)} this week`,
    },
    neighbors: neighborsOf(
      rankBoard(highlight, 'week'),
      (score) => `${formatNumber(score)} ${unitFor(score, board.unit)}`,
    ),
  };
};

const HIGHLIGHTS: Highlight[] = [
  'reputation',
  ...PRODUCTION_BOARDS.filter((id) => id !== 'reputation'),
];

/**
 * Your rank for the week, on whichever leaderboard you pick, with one
 * action: share it.
 */
/** Your rank on the picked leaderboard, the picker, and the Snapshot button. */
export const useYouControls = (
  snapshotSize: ButtonSize = ButtonSize.Medium,
): {
  detail: HighlightDetail;
  picker: ReactElement;
  share: ReactElement;
} => {
  const [highlight, setHighlight] = useState<Highlight>('reputation');
  const detail = highlightDetail(highlight);
  const picker = (
    <Dropdown
      value={highlight}
      onChange={setHighlight}
      options={HIGHLIGHTS.map((id) => ({
        id,
        label: boardById(id).title,
        meta: `#${highlightDetail(id).rank}`,
      }))}
    />
  );
  // Production's profile snapshot flow: a designed 1080px card staged
  // off-screen, captured, copied, then the snapshot share panel.
  const share = (
    <ProfileSnapshotButton
      origin={Origin.Profile}
      filename={`daily-leaderboard-${highlight}`}
      ownerId={ME.id}
      showLabel
      size={snapshotSize}
      variant={ButtonVariant.Primary}
      renderCard={(ref) => (
        <LeaderboardSnapshotCard
          ref={ref}
          title={detail.title}
          rank={detail.rank}
          delta={detail.delta}
          stat={detail.stat}
          neighbors={detail.neighbors}
        />
      )}
    />
  );

  return { detail, picker, share };
};

const YouCard = ({ layout }: { layout: 'row' | 'stack' }): ReactElement => {
  const { detail, picker, share } = useYouControls();
  if (layout === 'stack') {
    return (
      <section
        className={`flex flex-col justify-between gap-5 rounded-24 ${youHighlight} p-6`}
      >
        <div className="flex items-center gap-4">
          <Avatar dev={ME} size="size-14" className="rounded-14" />
          <span className="flex flex-col">
            <span className="flex items-center gap-3">
              <span className="font-bold typo-large-title">#{detail.rank}</span>
              <Delta value={detail.delta} className="!w-auto" />
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-bold typo-title3">{detail.value}</span>
          {detail.gap && (
            <span className="text-text-secondary typo-callout">
              {detail.gap}.
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {picker}
          {share}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`flex items-center gap-5 rounded-16 ${youHighlight} p-5`}
    >
      <Avatar dev={ME} size="size-14" className="rounded-14" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-3">
          <span className="font-bold typo-title1">#{detail.rank}</span>
          <Delta value={detail.delta} className="!w-auto" />
          <span className="text-text-secondary typo-callout">
            {detail.value}
          </span>
        </span>
        {detail.gap && (
          <span className="text-text-secondary typo-callout">
            {detail.gap}.
          </span>
        )}
      </div>
      {picker}
      {share}
    </section>
  );
};

export const SingleScroll = ({
  aside,
}: {
  /** A widget column beside the scroll. */
  aside?: ReactNode;
}): ReactElement => {
  const [boardRange, setBoardRange] = useState<Range>('week');
  const everyone = rankByScore(EVERYONE);
  const circle = rankByScore(CIRCLE);
  const mine = mineIn(everyone);
  const mineInCircle = circle.findIndex((entry) => entry.dev.isMe);
  const around = circle.slice(Math.max(0, mineInCircle - 2), mineInCircle + 3);
  const above = circle[mineInCircle - 1];

  return (
    <div
      className={classNames(
        'mx-auto flex gap-8 px-8 py-8',
        aside ? 'max-w-6xl' : 'max-w-4xl',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-10">
        <YouCard layout="row" />

        <section className="flex flex-col gap-2">
          <Heading title="Around you" />
          <ol className="flex flex-col">
            {around.map((entry) => (
              <Row
                key={entry.dev.id}
                rank={entry.rank}
                dev={entry.dev}
                highlight={entry.dev.isMe}
                hoverCard
              >
                <Score
                  value={entry.score}
                  unit="rep"
                  className="w-24 text-right"
                />
                <Follow dev={entry.dev} />
              </Row>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-2">
          <Heading
            title="Highest reputation this week"
            action={<TextLink>Full ranking</TextLink>}
          />
          <ol className="grid grid-flow-col grid-cols-2 grid-rows-[repeat(5,auto)] gap-x-8">
            {everyone
              .filter((entry) => !entry.dev.isMe)
              .slice(0, 10)
              .map((entry) => (
                <Row
                  key={entry.dev.id}
                  rank={entry.rank}
                  dev={entry.dev}
                  dense
                  hoverCard
                >
                  <Score value={entry.score} unit="rep" />
                </Row>
              ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <Heading title="Standouts" />
          <StandoutGrid />
        </section>

        <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
          <Heading
            title="Every leaderboard"
            action={
              <Segmented
                value={boardRange}
                onChange={setBoardRange}
                size="sm"
                options={[
                  { id: 'week', label: 'This week' },
                  { id: 'all', label: 'All time' },
                ]}
              />
            }
          />
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTION_BOARDS.map((id) => (
              <BoardCard key={id} boardId={id} range={boardRange} />
            ))}
            <CompaniesCard />
          </div>
        </section>
      </div>
      {aside && (
        <aside className="sticky top-8 flex w-80 shrink-0 flex-col gap-4 self-start">
          {aside}
        </aside>
      )}
    </div>
  );
};

/** Option B with the team widgets from Circles in a column beside it. */
export const SingleScrollWithWidgets = (): ReactElement => (
  <SingleScroll
    aside={
      <>
        <BringTeamCard />
        <SlackDigestCard
          company={ME.company}
          top={rankBoard('reputation', 'week', [
            ME,
            ...DEVS.filter((dev) => dev.company === ME.company),
          ])}
        />
      </>
    }
  />
);

/* ------------------------------------------------- grow your circle */

/** One recipe for the growth cards: icon, title, line, body, action. */
const GrowCard = ({
  icon,
  title,
  description,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  action: ReactNode;
}): ReactElement => (
  <article className="flex h-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-5">
    <header className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-bold typo-body">{title}</span>
        {description && (
          <span className="text-text-tertiary typo-footnote">
            {description}
          </span>
        )}
      </span>
    </header>
    <div className="flex flex-1 flex-col justify-center">{children}</div>
    {action}
  </article>
);

const InviteGrowCard = (): ReactElement => (
  <GrowCard
    icon={<InviteIcon />}
    title="Bring your team"
    action={
      <Button
        type="button"
        size={ButtonSize.Medium}
        variant={ButtonVariant.Secondary}
        icon={<CopyIcon />}
      >
        Copy invite link
      </Button>
    }
  >
    <PlusLadder />
  </GrowCard>
);

const SlackGrowCard = ({ top }: { top: Entry[] }): ReactElement => {
  const [added, setAdded] = useState(false);
  return (
    <GrowCard
      icon={<SlackIcon />}
      title="Post this board to Slack"
      description="Mondays at 9:00 in #northwind-devs"
      action={
        <Button
          type="button"
          size={ButtonSize.Medium}
          variant={added ? ButtonVariant.Tertiary : ButtonVariant.Primary}
          icon={added ? <VIcon /> : <SlackIcon />}
          onClick={() => setAdded(!added)}
        >
          {added ? 'First digest on Monday' : 'Add weekly digest'}
        </Button>
      }
    >
      <div className="flex flex-col gap-2 rounded-12 bg-surface-float p-3">
        {top.slice(0, 3).map((entry, index) => (
          <span
            key={entry.dev.id}
            className="flex items-center gap-2 typo-footnote"
          >
            <span className="w-3 tabular-nums text-text-quaternary">
              {index + 1}
            </span>
            <Avatar dev={entry.dev} size="size-6" className="!rounded-8" />
            <span
              className={classNames(
                'flex-1 truncate font-bold',
                entry.dev.isMe && 'text-accent-cabbage-default',
              )}
            >
              {entry.dev.isMe ? 'You' : entry.dev.name}
            </span>
            <span className="tabular-nums text-text-tertiary">
              {formatNumber(entry.score)} rep
            </span>
          </span>
        ))}
      </div>
    </GrowCard>
  );
};

/* --------------------------------------------------- compact action row */

/**
 * The first row, compact: each card says the action and what it gets you in
 * one line, keeps one supporting detail, and ends on one explicit button.
 */
const ActionCard = ({
  title,
  detail,
  children,
  action,
  aside,
  className,
}: {
  title: ReactNode;
  detail: ReactNode;
  children?: ReactNode;
  action: ReactNode;
  /** Sits left of the action, pushed to the start of the row. */
  aside?: ReactNode;
  className?: string;
}): ReactElement => (
  <article
    className={classNames(
      'flex h-full flex-col gap-3 rounded-16 border p-4',
      className ?? 'border-border-subtlest-tertiary',
    )}
  >
    <header className="flex flex-col gap-0.5">
      <span className="font-bold typo-callout">{title}</span>
      <span className="text-text-tertiary typo-footnote">{detail}</span>
    </header>
    {children}
    <div className="mt-auto flex items-end justify-end gap-2">
      {aside}
      <span className="flex w-44 shrink-0 [&_button]:w-full">{action}</span>
    </div>
  </article>
);

const CompactYouCard = (): ReactElement => {
  const { detail, picker, share } = useYouControls(ButtonSize.Small);
  return (
    <ActionCard
      className={`border-transparent ${youHighlight}`}
      title={
        <span className="flex items-center gap-2">
          <Avatar dev={ME} size="size-6" />
          You’re #{detail.rank} this week
          <Delta value={detail.delta} className="!w-auto" />
        </span>
      }
      detail={`${detail.value}${detail.gap ? ` · ${detail.gap}` : ''}`}
      aside={<span className="mr-auto">{picker}</span>}
      action={share}
    />
  );
};

const CompactInviteCard = (): ReactElement => {
  const next = REFERRAL_LADDER.find((step) => step.friends > MY_LADDER_FRIENDS);
  return (
    <ActionCard
      title={
        <span className="flex items-center gap-2">
          <PlusTitle type={TypographyType.Callout} bold />
          {next
            ? `Invite ${
                next.friends - MY_LADDER_FRIENDS
              } friend, get ${formatReferralLadderMonths(next.months)}`
            : 'You unlocked a year of Plus'}
        </span>
      }
      detail={`${MY_LADDER_FRIENDS} of 3 friends joined`}
      action={
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          icon={<CopyIcon />}
        >
          Copy invite link
        </Button>
      }
    >
      <span className="grid grid-cols-3 gap-1.5">
        {REFERRAL_LADDER.map((step) => (
          <span key={step.friends} className="flex flex-col gap-1">
            <span
              className={classNames(
                'h-1.5 rounded-4',
                MY_LADDER_FRIENDS >= step.friends
                  ? 'bg-action-plus-default'
                  : 'bg-surface-float',
              )}
            />
            <span
              className={classNames(
                'typo-caption2',
                MY_LADDER_FRIENDS >= step.friends
                  ? 'text-action-plus-default'
                  : 'text-text-quaternary',
              )}
            >
              {formatReferralLadderMonths(step.months)}
            </span>
          </span>
        ))}
      </span>
    </ActionCard>
  );
};

/* ----------------------------------------------------- B, full width */

/**
 * Option B on the squads directory’s full-width frame: the same sections,
 * laid out in rows across the page instead of one narrow column.
 */
export const SingleScrollFull = (): ReactElement => {
  const [boardRange, setBoardRange] = useState<Range>('week');
  const everyone = rankByScore(EVERYONE);

  return (
    <div className="flex flex-col gap-10 px-6 pb-10 pt-6">
      <div className="grid grid-cols-2 gap-4">
        <CompactYouCard />
        <CompactInviteCard />
      </div>

      <section className="flex flex-col gap-2">
        <Heading
          title="Highest reputation this week"
          action={<TextLink>Full ranking</TextLink>}
        />
        <ol className="grid grid-flow-col grid-cols-3 grid-rows-[repeat(4,auto)] gap-x-8">
          {everyone
            .filter((entry) => !entry.dev.isMe)
            .slice(0, 12)
            .map((entry) => (
              <Row
                key={entry.dev.id}
                rank={entry.rank}
                dev={entry.dev}
                hoverCard
              >
                <Score value={entry.score} unit="rep" />
                <Follow dev={entry.dev} />
              </Row>
            ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <Heading title="Standouts" />
        <StandoutGrid />
      </section>

      <section className="flex flex-col gap-3">
        <Heading
          title="Every leaderboard"
          action={
            <Segmented
              value={boardRange}
              onChange={setBoardRange}
              size="sm"
              options={[
                { id: 'week', label: 'This week' },
                { id: 'all', label: 'All time' },
              ]}
            />
          }
        />
        <div className="grid grid-cols-4 gap-4">
          {PRODUCTION_BOARDS.map((id) => (
            <BoardCard key={id} boardId={id} range={boardRange} />
          ))}
          <CompaniesCard />
        </div>
      </section>
    </div>
  );
};
