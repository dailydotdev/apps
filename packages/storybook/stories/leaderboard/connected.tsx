import type { ReactElement } from 'react';
import React, { forwardRef, useState } from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  CopyIcon,
  DownloadIcon,
  GiftIcon,
  InviteIcon,
  UserIcon,
  MiniCloseIcon,
  ShieldCheckIcon,
  SlackIcon,
  StarIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusTitle } from '@dailydotdev/shared/src/components/plus/PlusTitle';
import { TypographyType } from '@dailydotdev/shared/src/components/typography/Typography';
import { formatReferralLadderMonths } from '@dailydotdev/shared/src/lib/referral';
import { SnapshotFrame } from '@dailydotdev/shared/src/features/snapshot/SnapshotFrame';
import { SnapshotEyebrow } from '@dailydotdev/shared/src/features/snapshot/SnapshotEyebrow';
import { SnapshotIdentity } from '@dailydotdev/shared/src/features/snapshot/SnapshotIdentity';
import { SnapshotTile } from '@dailydotdev/shared/src/features/snapshot/SnapshotStats';
import colors from '@dailydotdev/shared/src/styles/colors';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import type { BoardId, Entry } from './data';
import {
  boardById,
  COMPANY_BOARD,
  formatNumber,
  ME,
  ME_PROFILE,
  MY_LADDER_FRIENDS,
  PLUGIN_MAKERS,
  REFERRAL_LADDER,
} from './data';
import {
  Avatar,
  Card,
  CardHeader,
  Rank,
  Score,
  SeeAll,
  youHighlight,
} from './kit';

// Pieces borrowed from recent work: the snapshot share panel and
// achievement share cards, Replay, quests, the referral ladder, the Slack
// team digest, verified company squads and plugin upvotes.

/* ------------------------------------------------------------ rank card */

export const RankCard = ({
  board,
  rank,
  week = 41,
  title,
  className,
}: {
  board: BoardId;
  rank: number;
  week?: number;
  /** Overrides the board title. */
  title?: string;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex w-72 flex-col gap-3 rounded-16 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default p-4 text-white',
      className,
    )}
  >
    <div className="flex items-center gap-2">
      <Avatar dev={ME} size="size-8" />
      <span className="font-bold typo-callout">@{ME.username}</span>
      <span className="ml-auto flex items-center gap-1 rounded-8 bg-overlay-float-pepper px-1.5 py-0.5 typo-caption2">
        <ShieldCheckIcon size={IconSize.Size16} /> Verified
      </span>
    </div>
    <span className="font-bold typo-large-title">#{rank}</span>
    <span className="typo-callout">
      {(title ?? boardById(board).title).toLowerCase()} in week {week} on
      daily.dev
    </span>
    <span className="opacity-70 typo-caption1">
      daily.dev/ranks/{ME.username}-w{week}
    </span>
  </div>
);

/* ----------------------------------------------------------- share panel */

const ShareRow = ({
  icon,
  label,
  note,
}: {
  icon: ReactElement;
  label: string;
  note?: string;
}): ReactElement => (
  <button
    type="button"
    className="flex h-12 items-center gap-3 rounded-12 px-3 text-left hover:bg-surface-hover"
  >
    <span className="flex size-8 items-center justify-center rounded-10 bg-surface-float">
      {icon}
    </span>
    <span className="flex flex-col">
      <span className="font-bold typo-callout">{label}</span>
      {note && <span className="text-text-tertiary typo-caption1">{note}</span>}
    </span>
  </button>
);

/**
 * The snapshot share panel every snapshot already opens, carrying a rank
 * card with a public, verifiable page like creator achievements have.
 */
export const SharePanel = ({
  board,
  rank,
  title,
  fixed = false,
  onClose,
}: {
  board: BoardId;
  rank: number;
  title?: string;
  /** Cover the whole frame rather than the nearest positioned parent. */
  fixed?: boolean;
  onClose: () => void;
}): ReactElement => (
  <div
    className={classNames(
      'inset-0 z-3 flex items-start justify-center bg-overlay-quaternary-onion pt-16',
      fixed ? 'fixed' : 'absolute',
    )}
    onClick={onClose}
  >
    <div
      className="flex w-[30rem] flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-background-default p-5 shadow-2"
      onClick={(event: React.MouseEvent) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold typo-title3">Image copied</span>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          icon={<MiniCloseIcon />}
          aria-label="Close"
          onClick={onClose}
        />
      </div>
      <RankCard board={board} rank={rank} title={title} className="!w-full" />
      <p className="text-text-tertiary typo-footnote">
        Sharing makes this rank visible to anyone with the link. The page shows
        how daily.dev verified it, and you can stop sharing anytime.
      </p>
      <div className="flex flex-col">
        <ShareRow
          icon={<SlackIcon />}
          label="Send to Slack"
          note="#northwind-devs, with an optional message"
        />
        <ShareRow icon={<CopyIcon />} label="Copy link" />
        <ShareRow icon={<DownloadIcon />} label="Save image" />
      </div>
    </div>
  </div>
);

/* ----------------------------------------------------------------- replay */

/** This week's Replay deck, with the leaderboard card on top. */
export const ReplayEntry = ({
  places,
  board,
  compact = false,
}: {
  places: number;
  board: BoardId;
  compact?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle',
      compact ? 'p-3' : 'p-4',
    )}
  >
    <div className="relative h-20 w-16 shrink-0">
      <span className="absolute inset-0 translate-x-2 rotate-6 rounded-12 bg-accent-onion-default opacity-40" />
      <span className="absolute inset-0 translate-x-1 rotate-3 rounded-12 bg-accent-onion-default opacity-70" />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-12 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white">
        <ArrowIcon size={IconSize.Small} />
        <span className="font-bold typo-callout">{places}</span>
        <span className="typo-caption2">places</span>
      </span>
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="font-bold text-accent-onion-default typo-caption1">
        YOUR REPLAY · WEEK 41
      </span>
      <span className="font-bold typo-callout">
        You climbed {places} places on {boardById(board).short.toLowerCase()}
      </span>
      {!compact && (
        <span className="text-text-tertiary typo-footnote">
          Plus 4 more cards about your week. Ready to share.
        </span>
      )}
    </div>
    <Button type="button" size={ButtonSize.Small} variant={ButtonVariant.Float}>
      Open Replay
    </Button>
  </div>
);

/* ----------------------------------------------------------------- quests */

export const XpChip = ({ xp }: { xp: number }): ReactElement => (
  <span className="flex shrink-0 items-center gap-1 rounded-8 bg-accent-cheese-flat px-1.5 py-0.5 font-bold text-accent-cheese-default typo-caption1">
    <StarIcon secondary size={IconSize.Size16} />+{xp} XP
  </span>
);

/** A weekly quest the leaderboard tracks, on the quest system. */
export const ClimbQuest = ({
  done = false,
  stacked = false,
}: {
  done?: boolean;
  /** Two lines, for a narrow widget column. */
  stacked?: boolean;
}): ReactElement => {
  const progress = (
    <span className="text-text-tertiary typo-footnote">
      {done ? '1/1' : '0/1'}
    </span>
  );
  const label = (
    <span className="font-bold text-accent-cheese-default typo-caption1">
      WEEKLY QUEST
    </span>
  );

  if (stacked) {
    return (
      <div className="flex flex-col gap-1 rounded-12 bg-accent-cheese-flat px-3 py-2">
        <span className="flex items-center gap-2">
          {label}
          <span className="flex-1" />
          {progress}
          <XpChip xp={50} />
        </span>
        <span className="typo-callout">Climb one spot on any board</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-12 bg-accent-cheese-flat px-3 py-2">
      {label}
      <span className="flex-1 typo-callout">Climb one spot on any board</span>
      {progress}
      <XpChip xp={50} />
    </div>
  );
};

/* --------------------------------------------------------- referral ladder */

export const ReferralLadder = (): ReactElement => {
  const next = REFERRAL_LADDER.find((step) => step.friends > MY_LADDER_FRIENDS);
  return (
    <div className={`flex flex-col gap-3 rounded-16 ${youHighlight} p-4`}>
      <div className="flex items-center gap-3">
        <GiftIcon secondary className="text-accent-cabbage-default" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold typo-callout">
            {next
              ? `1 more friend unlocks ${next.reward}`
              : 'You unlocked a year of Plus'}
          </span>
          <span className="text-text-secondary typo-footnote">
            Every friend who signs up with your link also counts on this board.
          </span>
        </div>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
        >
          Copy invite link
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {REFERRAL_LADDER.map((step) => {
          const reached = MY_LADDER_FRIENDS >= step.friends;
          return (
            <div
              key={step.friends}
              className={classNames(
                'flex items-center gap-2 rounded-12 px-3 py-2 typo-footnote',
                reached
                  ? 'bg-accent-cabbage-default text-white'
                  : 'bg-background-default text-text-secondary',
              )}
            >
              {reached ? (
                <VIcon size={IconSize.Size16} />
              ) : (
                <span className="font-bold">{step.friends}</span>
              )}
              <span className="flex flex-col">
                <span className="font-bold">
                  {step.friends} friend{step.friends > 1 ? 's' : ''}
                </span>
                <span className={reached ? 'opacity-80' : ''}>
                  {step.reward}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------ slack digest */

export const SlackDigestCard = ({
  company,
  top,
}: {
  company: string;
  top: Entry[];
}): ReactElement => {
  const [on, setOn] = useState(false);
  return (
    <Card className="gap-3 p-4">
      <span className="flex items-center gap-2 font-bold typo-callout">
        <SlackIcon /> Post this board to Slack
      </span>
      <span className="text-text-tertiary typo-footnote">
        {company}’s top readers, Mondays at 9:00 in #northwind-devs
      </span>
      <div className="flex flex-col gap-1.5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3 typo-footnote">
        {top.slice(0, 3).map((entry, index) => (
          <span key={entry.dev.id} className="flex items-center gap-2">
            <span className="w-3 text-text-quaternary">{index + 1}</span>
            <Avatar dev={entry.dev} size="size-5" className="!rounded-6" />
            <span className="flex-1 truncate">{entry.dev.name}</span>
            <span className="text-text-tertiary">
              {formatNumber(entry.score)} rep
            </span>
          </span>
        ))}
      </div>
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={on ? ButtonVariant.Tertiary : ButtonVariant.Primary}
        icon={on ? <VIcon /> : undefined}
        onClick={() => setOn(!on)}
      >
        {on ? 'First digest: Monday 9:00' : 'Add weekly digest'}
      </Button>
    </Card>
  );
};

/* ------------------------------------------------- verified company squads */

export const CompanyRows = ({
  count = 5,
}: {
  count?: number;
}): ReactElement => (
  <ol className="flex flex-col px-2">
    {COMPANY_BOARD.slice(0, count).map((company, index) => (
      <li
        key={company.id}
        className="group/company flex h-11 items-center gap-3 rounded-12 px-2 hover:bg-surface-hover"
      >
        <Rank rank={index + 1} />
        <span
          className={classNames(
            'flex size-7 shrink-0 items-center justify-center rounded-8 font-bold typo-caption1',
            company.squad
              ? `${company.squad.brand} text-white`
              : 'bg-surface-float text-text-secondary',
          )}
        >
          {company.name[0]}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex min-w-0 items-center gap-1 font-bold typo-callout">
            <span className="truncate">{company.name}</span>
            {company.squad && <VerifiedSquadBadge />}
          </span>
          {company.squad && (
            <span className="truncate text-text-quaternary typo-caption1">
              {formatNumber(company.squad.members)} squad members
            </span>
          )}
        </span>
        {company.squad ? (
          <>
            <Score
              value={company.verified}
              unit="verified devs"
              className="group-hover/company:hidden"
            />
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Secondary}
              className="hidden group-hover/company:flex"
            >
              Open squad
            </Button>
          </>
        ) : (
          <Score value={company.verified} unit="verified devs" />
        )}
      </li>
    ))}
  </ol>
);

/* ------------------------------------------------------------ plugin makers */

export const PluginMakersCard = (): ReactElement => (
  <Card className="pb-2">
    <CardHeader
      title={
        <span className="flex items-center gap-2">
          Top plugin makers
          <span className="rounded-6 bg-accent-avocado-flat px-1.5 py-0.5 font-bold text-accent-avocado-default typo-caption2">
            New
          </span>
        </span>
      }
      subtitle="Upvotes on their marketplace plugins"
      action={<SeeAll label="Marketplace" />}
    />
    <ol className="flex flex-col px-2">
      {PLUGIN_MAKERS.map((maker, index) => (
        <li
          key={maker.plugin}
          className="flex h-11 items-center gap-3 rounded-12 px-2 hover:bg-surface-hover"
        >
          <Rank rank={index + 1} />
          <Avatar dev={maker.dev} size="size-7" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold typo-callout">
              {maker.dev.name}
            </span>
            <span className="truncate text-text-quaternary typo-caption1">
              {maker.plugin}
            </span>
          </span>
          <Score value={maker.upvotes} unit="upvotes" />
        </li>
      ))}
    </ol>
  </Card>
);

/* ------------------------------------------------------------ plus ladder */

/** The referral ladder as production draws it (ReferralLadderPromo). */
export const PlusLadder = (): ReactElement => {
  const next = REFERRAL_LADDER.find((step) => step.friends > MY_LADDER_FRIENDS);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <PlusTitle type={TypographyType.Footnote} bold />
        <span className="font-bold typo-callout">
          {next
            ? `Invite ${
                next.friends - MY_LADDER_FRIENDS
              } more friend to get ${formatReferralLadderMonths(
                next.months,
              )} of Plus`
            : 'You unlocked a year of Plus'}
        </span>
      </div>
      <ol className="grid grid-cols-3 gap-2">
        {REFERRAL_LADDER.map((step) => {
          const isUnlocked = MY_LADDER_FRIENDS >= step.friends;
          return (
            <li
              key={step.friends}
              className={classNames(
                'flex flex-col items-center gap-0.5 rounded-12 border px-2 py-3 text-center',
                isUnlocked
                  ? 'border-action-plus-default bg-action-plus-float'
                  : 'border-transparent bg-surface-float',
              )}
            >
              <span className="font-bold typo-callout">
                {formatReferralLadderMonths(step.months)}
              </span>
              <span className="text-text-tertiary typo-caption1">
                {step.friends} {step.friends === 1 ? 'friend' : 'friends'}
              </span>
              <span aria-hidden className="mt-1 flex gap-0.5">
                {Array.from({ length: step.friends }, (_, index) => (
                  <UserIcon
                    key={index}
                    size={IconSize.Size16}
                    className={
                      index < MY_LADDER_FRIENDS
                        ? 'text-action-plus-default'
                        : 'text-text-tertiary'
                    }
                  />
                ))}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

/* ---------------------------------------------------------- bring your team */

export const BringTeamCard = (): ReactElement => (
  <Card className="gap-3 p-4">
    <span className="flex items-center gap-2 font-bold typo-callout">
      <InviteIcon /> Bring your team
    </span>
    <PlusLadder />
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Secondary}
    >
      Copy invite link
    </Button>
  </Card>
);

/* ------------------------------------------------------ leaderboard snapshot */

const SNAPSHOT_MUTED = colors.salt['90'];

export interface SnapshotNeighbor {
  rank: number;
  name: string;
  value: string;
  isMe?: boolean;
}

export interface LeaderboardSnapshotCardProps {
  /** "Highest reputation", "Most reading days"… */
  title: string;
  /** A rank past the counted range reads "1K+". */
  rank: number | string;
  delta?: number;
  stat: { value: string; label: string };
  neighbors: SnapshotNeighbor[];
  eyebrow?: string;
  /** What the rows under the tiles are. */
  listTitle?: string;
}

/**
 * The leaderboard's share image, composed from production's snapshot pieces
 * the way the Reading overview card is: the mark with a surface label, who it
 * is, two headline tiles, then the people around you in the list card's rows.
 */
export const LeaderboardSnapshotCard = forwardRef(
  function LeaderboardSnapshotCard(
    {
      title,
      rank,
      delta = 0,
      stat,
      neighbors,
      eyebrow = 'Leaderboard · Week 41',
      listTitle = 'Around you',
    }: LeaderboardSnapshotCardProps,
    ref: React.Ref<HTMLDivElement>,
  ): ReactElement {
    return (
      <SnapshotFrame
        grow
        ref={ref}
        seed={`leaderboard-${title}`}
        logoAside={<SnapshotEyebrow label={eyebrow} />}
      >
        <div className="flex flex-1 flex-col gap-6">
          <SnapshotIdentity
            name={ME_PROFILE.name}
            handle={`@${ME_PROFILE.handle}`}
            image={ME.image}
          />
          <div className="flex gap-4">
            <SnapshotTile
              value={typeof rank === 'number' ? `#${rank}` : rank}
              label={title}
              glyph={delta > 0 ? `▲${delta}` : undefined}
            />
            <SnapshotTile value={stat.value} label={stat.label} />
          </div>
          <div className="flex flex-col gap-3">
            <span style={{ color: SNAPSHOT_MUTED, fontSize: 26 }}>
              {listTitle}
            </span>
            <ol className="flex w-full flex-col gap-4">
              {neighbors.map((row) => (
                <li key={row.rank} className="flex w-full items-center gap-4">
                  <span
                    className="shrink-0 font-bold"
                    style={{
                      color: colors.cabbage['10'],
                      fontSize: 28,
                      width: 56,
                    }}
                  >
                    {row.rank}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate font-bold"
                    style={{
                      color: row.isMe ? colors.cabbage['10'] : '#FFFFFF',
                      fontSize: 30,
                    }}
                  >
                    {row.name}
                  </span>
                  <span style={{ color: SNAPSHOT_MUTED, fontSize: 26 }}>
                    {row.value}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SnapshotFrame>
    );
  },
);
