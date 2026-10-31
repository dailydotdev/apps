import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  CopyIcon,
  MiniCloseIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { PlusTitle } from '@dailydotdev/shared/src/components/plus/PlusTitle';
import { TypographyType } from '@dailydotdev/shared/src/components/typography/Typography';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import { ProfileSnapshotButton } from '@dailydotdev/shared/src/features/snapshot/ProfileSnapshotButton';
import {
  isLeaderboardPositionSupported,
  LeaderboardType,
  leaderboardTypeToTitle,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import {
  formatReferralLadderMonths,
  REFERRAL_INVITE_COPIED_TOAST,
} from '@dailydotdev/shared/src/lib/referral';
import { PageHeader, useSources } from '../sources/kit';
import { PhoneBottomSpace, PhoneSheet } from '../sources/phone';
import type { BoardId, Dev, Entry } from './data';
import {
  boardById,
  COMPANY_BOARD,
  DEVS,
  formatNumber,
  ME,
  ME_PROFILE,
  myEntry,
  rankBoard,
  REFERRAL_LADDER,
  unitFor,
} from './data';
import { Avatar, Dropdown, Rank, youHighlight } from './kit';
import { LeaderboardSnapshotCard } from './connected';
import { useStandouts } from './layouts4';
import { LeaderboardPhoneChrome } from './phone';

// The chosen direction, Option B at full width, on production data only:
// every list is one of the boards /users queries today, all time, with the
// query's limits, and your own rank only where leaderboardPosition answers.
// Responsive from a 360 phone to a 1728 laptop.

const BOARD_TYPES: Record<BoardId, LeaderboardType> = {
  level: LeaderboardType.HighestLevel,
  reputation: LeaderboardType.HighestReputation,
  streak: LeaderboardType.LongestStreak,
  views: LeaderboardType.HighestPostViews,
  upvotes: LeaderboardType.MostUpvoted,
  referrals: LeaderboardType.MostReferrals,
  readingDays: LeaderboardType.MostReadingDays,
};

/** /users' boards, in its order; Most verified employees closes the grid. */
const BOARD_ORDER: BoardId[] = [
  'level',
  'reputation',
  'streak',
  'views',
  'upvotes',
  'referrals',
  'readingDays',
];

/** The boards leaderboardPosition can rank you on. */
export const POSITION_BOARDS = BOARD_ORDER.filter((board) =>
  isLeaderboardPositionSupported(BOARD_TYPES[board]),
);

/** LEADERBOARD_QUERY's limit; a board's own page asks for 100. */
const LIST_LIMIT = 10;
const TOP_LIMIT = 100;
/** Past this rank, leaderboardPosition returns no rank, only the cap. */
const CAPPED_AT = 1000;

/** Your rank on each board leaderboardPosition answers for: under the cap. */
const MY_RANKS: Partial<Record<BoardId, number>> = {
  reputation: 842,
  streak: 317,
  readingDays: 529,
};

/** How leaderboardPosition answers for you. */
export type Position = 'ranked' | 'capped' | 'empty';

const titleOf = (board: BoardId): string =>
  leaderboardTypeToTitle[BOARD_TYPES[board]];

const scoreLabel = (board: BoardId, score: number): string =>
  `${formatNumber(score)} ${unitFor(score, boardById(board).unit)}`;

const isPhoneWidth = (event: React.SyntheticEvent): boolean =>
  !!event.currentTarget.ownerDocument.defaultView?.matchMedia(
    '(max-width: 655px)',
  ).matches;

/* ---------------------------------------------------------------- atoms */

const Heading = ({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <header className="flex items-center justify-between gap-4">
    <h2 className="font-bold typo-title3">{title}</h2>
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

/** Ids of people a frame starts out following, for the states catalog. */
const FollowedContext = createContext<string[]>([]);

/** Follow goes away once pressed, with production's toast. */
const Follow = ({ dev }: { dev: Dev }): ReactElement | null => {
  const { notify } = useSources();
  const followed = useContext(FollowedContext);
  const [following, setFollowing] = useState(
    dev.isFollowing || followed.includes(dev.id),
  );
  if (dev.isMe || following) {
    return null;
  }
  return (
    <Button
      type="button"
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Primary}
      className="shrink-0"
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation();
        setFollowing(true);
        notify(`✅ You are now following ${dev.name}`);
      }}
    >
      Follow
    </Button>
  );
};

const RowPlaceholder = (): ReactElement => (
  <li className="flex h-12 items-center gap-3 px-2">
    <ElementPlaceholder className="h-3 w-6 rounded-4" />
    <ElementPlaceholder className="size-8 rounded-10" />
    <ElementPlaceholder className="h-3 w-2/5 rounded-4" />
  </li>
);

const EmptyBoard = (): ReactElement => (
  <p className="px-2 py-3 text-text-tertiary typo-footnote">
    Nothing here right now. Check back soon.
  </p>
);

/* ------------------------------------------------------- the first row */

/**
 * One action card: what it is in a line, one detail, and one button that
 * keeps its size and place on every card. On phones the button fills the
 * card's width.
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
  action?: ReactNode;
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
    {(aside || action) && (
      <div className="mt-auto flex flex-wrap items-end justify-end gap-2">
        {aside}
        {action && (
          <span className="flex w-full shrink-0 tablet:w-44 [&_button]:w-full">
            {action}
          </span>
        )}
      </div>
    )}
  </article>
);

export const RankCard = ({
  position = 'ranked',
  initialBoard = 'reputation',
  loading = false,
}: {
  position?: Position;
  initialBoard?: BoardId;
  loading?: boolean;
}): ReactElement => {
  const [board, setBoard] = useState<BoardId>(initialBoard);
  const mine = myEntry(board, 'all');
  const title = titleOf(board);
  const rank =
    position === 'capped'
      ? `${largeNumberFormat(CAPPED_AT)}+`
      : `#${(MY_RANKS[board] ?? 0).toLocaleString('en-US')}`;
  const score = position === 'empty' ? 0 : mine.score;

  if (loading) {
    return (
      <ActionCard
        className={`border-transparent ${youHighlight}`}
        title={<ElementPlaceholder className="h-4 w-40 rounded-4" />}
        detail={<ElementPlaceholder className="mt-1 h-3 w-56 rounded-4" />}
      >
        <ElementPlaceholder className="mt-auto h-9 w-44 rounded-12" />
      </ActionCard>
    );
  }

  const picker = (
    <span className="mr-auto">
      <Dropdown
        value={board}
        onChange={setBoard}
        options={POSITION_BOARDS.map((id) => ({ id, label: titleOf(id) }))}
      />
    </span>
  );

  if (position === 'empty') {
    return (
      <ActionCard
        className={`border-transparent ${youHighlight}`}
        title={
          <span className="flex items-center gap-2">
            <Avatar dev={ME} size="size-6" />
            No rank yet on {title}
          </span>
        }
        detail={boardById(board).howTo}
        aside={picker}
      />
    );
  }

  return (
    <ActionCard
      className={`border-transparent ${youHighlight}`}
      title={
        <span className="flex items-center gap-2">
          <Avatar dev={ME} size="size-6" />
          {position === 'capped'
            ? `You’re outside the top ${largeNumberFormat(CAPPED_AT)}`
            : `You’re ${rank} on ${title}`}
        </span>
      }
      detail={`${scoreLabel(board, score)} in total`}
      aside={picker}
      action={
        // Production's profile snapshot flow: the card staged off-screen at
        // 1080px, captured, copied, then the snapshot share panel.
        <ProfileSnapshotButton
          origin={Origin.Leaderboard}
          filename={`daily-leaderboard-${board}`}
          ownerId={ME.id}
          showLabel
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          renderCard={(ref) => (
            <LeaderboardSnapshotCard
              ref={ref}
              title={title}
              rank={rank.replace('#', '')}
              eyebrow="Leaderboard"
              stat={{
                value: formatNumber(score),
                label: unitFor(score, boardById(board).unit),
              }}
              listTitle={`Top 3 · ${title}`}
              neighbors={rankBoard(board, 'all', DEVS)
                .slice(0, 3)
                .map((entry) => ({
                  rank: entry.rank,
                  name: entry.dev.name,
                  value: scoreLabel(board, entry.score),
                  isMe: false,
                }))}
            />
          )}
        />
      }
    />
  );
};

export const InviteCard = ({
  friends = 1,
  loading = false,
}: {
  /** Friends who joined through your link: 3 unlocks the last step. */
  friends?: number;
  loading?: boolean;
}): ReactElement => {
  const { notify } = useSources();
  const next = REFERRAL_LADDER.find((step) => step.friends > friends);
  return (
    <ActionCard
      title={
        <span className="flex flex-wrap items-center gap-x-2">
          <PlusTitle type={TypographyType.Callout} bold />
          {next
            ? `Invite ${next.friends - friends} ${
                next.friends - friends === 1 ? 'friend' : 'friends'
              }, get ${formatReferralLadderMonths(next.months)}`
            : 'You unlocked a year of Plus'}
        </span>
      }
      detail={`${Math.min(friends, 3)} of 3 friends joined`}
      action={
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          icon={<CopyIcon />}
          disabled={loading}
          onClick={() => notify(REFERRAL_INVITE_COPIED_TOAST)}
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
                friends >= step.friends
                  ? 'bg-action-plus-default'
                  : 'bg-surface-float',
              )}
            />
            <span
              className={classNames(
                'typo-caption2',
                friends >= step.friends
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

/* ------------------------------------------------- highest reputation */

const PersonRow = ({ entry }: { entry: Entry }): ReactElement => {
  const { goTo } = useSources();
  return (
    <li>
      <div
        role="link"
        tabIndex={0}
        onClick={() => goTo(`/${entry.dev.username}`)}
        onKeyDown={(event) =>
          event.key === 'Enter' && goTo(`/${entry.dev.username}`)
        }
        className="flex h-12 cursor-pointer items-center gap-3 rounded-12 px-2 hover:bg-surface-hover"
      >
        <Rank rank={entry.rank} />
        <Avatar dev={entry.dev} />
        <span className="min-w-0 flex-1 truncate font-bold typo-callout">
          {entry.dev.name}
        </span>
        <span className="shrink-0 tabular-nums typo-footnote">
          <span className="font-bold">{formatNumber(entry.score)}</span>{' '}
          <span className="text-text-quaternary">rep</span>
        </span>
        <span className="flex w-16 shrink-0 justify-end">
          <Follow dev={entry.dev} />
        </span>
      </div>
    </li>
  );
};

const TopReputation = ({
  loading,
  empty,
}: {
  loading: boolean;
  empty: boolean;
}): ReactElement => {
  const { goTo } = useSources();
  const top = rankBoard('reputation', 'all', DEVS).slice(0, LIST_LIMIT);
  return (
    <section className="flex flex-col gap-2">
      <Heading
        title="Highest reputation"
        action={
          <TextLink onClick={() => goTo('/users/highestReputation')}>
            Full ranking
          </TextLink>
        }
      />
      {empty ? (
        <EmptyBoard />
      ) : (
        <ol className="grid grid-cols-1 gap-x-8 laptop:grid-flow-col laptop:grid-cols-2 laptop:grid-rows-5">
          {loading
            ? Array.from({ length: LIST_LIMIT }, (_, index) => (
                <RowPlaceholder key={index} />
              ))
            : top.map((entry) => (
                <PersonRow key={entry.dev.id} entry={entry} />
              ))}
        </ol>
      )}
    </section>
  );
};

/* ------------------------------------------------------------ standouts */

const Standouts = ({ loading }: { loading: boolean }): ReactElement => {
  const { goTo } = useSources();
  const standouts = useStandouts();
  return (
    <section className="flex flex-col gap-3">
      <Heading title="Standouts" />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 tablet:mx-0 tablet:px-0">
        {standouts.map(({ eyebrow, dev, stat }) =>
          loading ? (
            <ElementPlaceholder
              key={eyebrow}
              className="h-44 w-40 shrink-0 rounded-16"
            />
          ) : (
            <article
              key={eyebrow}
              role="link"
              tabIndex={0}
              onClick={() => goTo(`/${dev.username}`)}
              onKeyDown={(event) =>
                event.key === 'Enter' && goTo(`/${dev.username}`)
              }
              className="flex w-40 shrink-0 cursor-pointer flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary p-3 text-center hover:border-border-subtlest-secondary"
            >
              <span className="w-full truncate font-bold uppercase tracking-wide text-text-primary typo-caption2">
                {eyebrow}
              </span>
              <Avatar dev={dev} size="size-12" className="rounded-14" />
              <span className="flex w-full min-w-0 flex-col">
                <span className="truncate font-bold typo-footnote">
                  {dev.name}
                </span>
                <span className="truncate text-text-tertiary typo-caption1">
                  {stat}
                </span>
              </span>
              <span className="flex h-6 items-center">
                <Follow dev={dev} />
              </span>
            </article>
          ),
        )}
      </div>
    </section>
  );
};

/* ------------------------------------------------------ every leaderboard */

const MiniRow = ({
  rank,
  name,
  image,
  value,
  highlight = false,
  suffix,
}: {
  rank: number | string;
  name: string;
  image: ReactNode;
  value: string;
  highlight?: boolean;
  suffix?: ReactNode;
}): ReactElement => (
  <li
    className={classNames(
      'flex h-9 items-center gap-2 rounded-10 px-1.5',
      highlight ? youHighlight : 'hover:bg-surface-hover',
    )}
  >
    <span className="flex min-w-6 shrink-0 justify-center">
      {typeof rank === 'number' && rank <= 3 ? (
        <Rank rank={rank} className="!w-6" />
      ) : (
        <span className="font-bold tabular-nums text-text-tertiary typo-caption1">
          {typeof rank === 'number' ? rank.toLocaleString('en-US') : rank}
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
 * A board's top 3 and, where production can rank you, your row. A press
 * anywhere opens its top 100: in place as a popover from tablet up, in a
 * bottom sheet on phones.
 */
const BoardTile = ({
  title,
  top,
  all,
  you,
  initialOpen = false,
  loading,
  empty,
}: {
  title: string;
  top: ReactNode;
  all: ReactNode;
  you?: ReactNode;
  initialOpen?: boolean;
  loading: boolean;
  empty: boolean;
}): ReactElement => {
  const [mounted, setMounted] = useState(initialOpen);
  const [expanded, setExpanded] = useState(initialOpen);
  const [sheet, setSheet] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // The device's own window only: scrollIntoView would move the story too.
    const element = root.current;
    const view = element?.ownerDocument.defaultView;
    if (initialOpen && element && view) {
      const { top } = element.getBoundingClientRect();
      view.scrollTo(0, view.scrollY + top - 120);
    }
  }, [initialOpen]);
  const open = (event: React.SyntheticEvent) => {
    if (isPhoneWidth(event)) {
      setSheet(true);
      return;
    }
    setMounted(true);
    setTimeout(() => setExpanded(true), 16);
  };
  const close = () => {
    setExpanded(false);
    setTimeout(() => setMounted(false), EXPAND_MS);
  };
  const interactive = !loading && !empty;
  return (
    <div ref={root} className="relative">
      <div
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? `${title}, open the top 100` : undefined}
        onClick={interactive ? open : undefined}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (interactive && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            open(event);
          }
        }}
        className={classNames(
          'flex h-full flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-3',
          interactive &&
            'cursor-pointer transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover',
        )}
      >
        <div className="flex items-start justify-between gap-2 px-1.5 pb-1">
          <span className="truncate font-bold typo-callout">{title}</span>
          {interactive && <TextLink>Top 100</TextLink>}
        </div>
        {loading && (
          <ol className="flex flex-col">
            <RowPlaceholder />
            <RowPlaceholder />
            <RowPlaceholder />
          </ol>
        )}
        {empty && <EmptyBoard />}
        {interactive && (
          <ol className="flex flex-col">
            {top}
            {you && (
              <>
                <li className="my-1 h-px bg-border-subtlest-tertiary" />
                {you}
              </>
            )}
          </ol>
        )}
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
                  Top {TOP_LIMIT}
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
            {you && (
              <ol className="border-t border-border-subtlest-tertiary p-3">
                {you}
              </ol>
            )}
          </div>
        </>
      )}
      {sheet && (
        <PhoneSheet
          title={`${title} · Top ${TOP_LIMIT}`}
          onClose={() => setSheet(false)}
        >
          <ol className="flex flex-col px-3">{all}</ol>
          {you && (
            <ol className="sticky bottom-0 border-t border-border-subtlest-tertiary bg-background-default p-3">
              {you}
            </ol>
          )}
        </PhoneSheet>
      )}
    </div>
  );
};

const UserBoardTile = ({
  board,
  position,
  initialOpen,
  loading,
  empty,
}: {
  board: BoardId;
  position: Position;
  initialOpen?: boolean;
  loading: boolean;
  empty: boolean;
}): ReactElement => {
  const list = rankBoard(board, 'all', DEVS).slice(0, TOP_LIMIT);
  const mine = myEntry(board, 'all');
  const rows = (entries: Entry[]) =>
    entries.map((entry) => (
      <MiniRow
        key={entry.dev.id}
        rank={entry.rank}
        name={entry.dev.name}
        image={<Avatar dev={entry.dev} size="size-6" className="!rounded-8" />}
        value={formatNumber(entry.score)}
      />
    ));
  const showYou = POSITION_BOARDS.includes(board) && position !== 'empty';
  return (
    <BoardTile
      title={titleOf(board)}
      top={rows(list.slice(0, 3))}
      all={rows(list)}
      initialOpen={initialOpen}
      loading={loading}
      empty={empty}
      you={
        showYou ? (
          <MiniRow
            rank={
              position === 'capped'
                ? `${largeNumberFormat(CAPPED_AT)}+`
                : MY_RANKS[board] ?? 0
            }
            name="You"
            image={<Avatar dev={ME} size="size-6" className="!rounded-8" />}
            value={formatNumber(mine.score)}
            highlight
          />
        ) : undefined
      }
    />
  );
};

/** CompanyTopList: companies only, so there is no row for you. */
const CompanyTile = ({
  loading,
  empty,
}: {
  loading: boolean;
  empty: boolean;
}): ReactElement => {
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
  const rows = (companies: typeof COMPANY_BOARD) =>
    companies.map((company, index) => (
      <MiniRow
        key={company.id}
        rank={index + 1}
        name={company.name}
        image={logo(company)}
        value={formatNumber(company.verified)}
        suffix={company.squad && <VerifiedSquadBadge className="size-3.5" />}
      />
    ));
  return (
    <BoardTile
      title={leaderboardTypeToTitle[LeaderboardType.MostVerifiedUsers]}
      top={rows(COMPANY_BOARD.slice(0, 3))}
      all={rows(COMPANY_BOARD)}
      loading={loading}
      empty={empty}
    />
  );
};

/* ------------------------------------------------------------- the page */

export interface LeaderboardFinalProps {
  position?: Position;
  rankBoard?: BoardId;
  friends?: number;
  loading?: boolean;
  /** The static props' error fallback: every list comes back empty. */
  empty?: boolean;
  /** Opens with this board's top 100 up (tablet and laptop). */
  openBoard?: BoardId;
  /** People the frame starts out following: their Follow is gone. */
  followed?: string[];
}

export const LeaderboardFinal = ({
  position = 'ranked',
  rankBoard: initialBoard = 'reputation',
  friends = 1,
  loading = false,
  empty = false,
  openBoard,
  followed = [],
}: LeaderboardFinalProps): ReactElement => (
  <FollowedContext.Provider value={followed}>
    <div className="flex flex-col">
      <LeaderboardPhoneChrome />
      {/* Laptop: ExploreHubHeader's title strip. */}
      <PageHeader
        title="Leaderboard"
        suggest={false}
        className="!hidden laptop:!flex"
      />
      <div className="flex flex-col gap-8 px-4 pb-6 pt-3 tablet:gap-10 tablet:p-4 laptop:p-10">
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 tablet:gap-4">
          <RankCard
            position={position}
            initialBoard={initialBoard}
            loading={loading}
          />
          <InviteCard friends={friends} loading={loading} />
        </div>

        <TopReputation loading={loading} empty={empty} />

        {!empty && <Standouts loading={loading} />}

        <section className="flex flex-col gap-3">
          <Heading title="Every leaderboard" />
          <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptopL:grid-cols-4">
            {BOARD_ORDER.map((board) => (
              <UserBoardTile
                key={board}
                board={board}
                position={position}
                initialOpen={board === openBoard}
                loading={loading}
                empty={empty}
              />
            ))}
            <CompanyTile loading={loading} empty={empty} />
          </div>
        </section>
      </div>
      <PhoneBottomSpace loggedIn />
    </div>
  </FollowedContext.Provider>
);
