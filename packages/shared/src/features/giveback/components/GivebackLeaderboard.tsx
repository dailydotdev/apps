import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useGivebackContext } from '../GivebackContext';
import { useGivebackNav } from '../GivebackNavContext';
import type { GivebackLeaderboardEntry } from '../types';
import { formatDonationAmount } from '../utils';
import { GivebackAvatar } from './GivebackContributorFaces';

// Medal styling per podium place: gold / silver / bronze in food-palette tokens.
const medalClassName: Record<number, string> = {
  1: 'bg-accent-cheese-default text-black',
  2: 'bg-surface-secondary text-text-primary',
  3: 'bg-accent-bacon-default text-white',
};

// Flat, compact ranked row: a small medal-tinted rank chip for the podium
// places, the avatar, the name, and the amount earned. No card chrome — rows
// are separated by spacing and the viewer's row gets a brand tint.
const LeaderboardRow = ({
  entry,
}: {
  entry: GivebackLeaderboardEntry;
}): ReactElement => (
  <FlexRow
    className={classNames(
      'items-center gap-3 rounded-12 px-2.5 py-2 transition-colors',
      entry.isCurrentUser && 'bg-accent-cabbage-flat',
    )}
  >
    <span
      className={classNames(
        'flex size-6 shrink-0 items-center justify-center rounded-full font-bold tabular-nums typo-caption1',
        medalClassName[entry.rank] ?? 'text-text-tertiary',
        entry.rank === 1 && 'shadow-[0_0_10px_rgba(255,199,0,0.45)]',
      )}
    >
      {entry.rank}
    </span>
    <GivebackAvatar src={entry.avatar} sizeClassName="size-7" />
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      bold
      className={classNames(
        'min-w-0 flex-1 truncate',
        entry.isCurrentUser && 'text-accent-cabbage-default',
      )}
    >
      {entry.name}
    </Typography>
    <Typography
      bold
      type={TypographyType.Footnote}
      className="shrink-0 tabular-nums text-status-success"
    >
      {formatDonationAmount(entry.contributionAmount, entry.currency)}
    </Typography>
  </FlexRow>
);

export const GivebackLeaderboard = (): ReactElement => {
  const { leaderboard } = useGivebackContext();
  const { setActiveTab } = useGivebackNav();

  const currentUser = leaderboard.find((entry) => entry.isCurrentUser);
  const aboveUser = currentUser
    ? leaderboard.find((entry) => entry.rank === currentUser.rank - 1)
    : undefined;
  const gapToNext =
    aboveUser && currentUser
      ? aboveUser.contributionAmount - currentUser.contributionAmount
      : 0;

  return (
    <FlexCol className="w-full gap-5">
      <Typography tag={TypographyTag.H3} type={TypographyType.Title3} bold>
        Weekly leaderboard
      </Typography>

      <FlexCol className="gap-0.5">
        {leaderboard.map((entry) => (
          <LeaderboardRow key={entry.id} entry={entry} />
        ))}
      </FlexCol>

      {currentUser && (
        <FlexCol className="gap-3 border-t border-border-subtlest-tertiary pt-4">
          {/* Where you stand right now, with the climb CTA on the right. */}
          <FlexRow className="items-center gap-3">
            <GivebackAvatar src={currentUser.avatar} sizeClassName="size-9" />
            <FlexCol className="min-w-0 flex-1">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                bold
                className="uppercase tracking-wider"
              >
                Your rank
              </Typography>
              <FlexRow className="items-baseline gap-1.5">
                <Typography
                  tag={TypographyTag.Span}
                  bold
                  type={TypographyType.Title3}
                  className="text-accent-cabbage-default"
                >
                  #{currentUser.rank}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  ·{' '}
                  {formatDonationAmount(
                    currentUser.contributionAmount,
                    currentUser.currency,
                  )}{' '}
                  unlocked
                </Typography>
              </FlexRow>
            </FlexCol>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={() => setActiveTab('actions')}
              className="shrink-0"
            >
              Take action
            </Button>
          </FlexRow>

          {/* The climb: one explicit goal — how much closes the gap to the next
              rank. Flat, no card: show who you're chasing, the exact amount
              that overtakes them, and a labeled bar so it reads at a glance. */}
          {aboveUser ? (
            // One clean, scannable line: the exact gap to the next rank, with a
            // climb cue. No bar — it read as a decorative glow and confused the
            // meaning.
            <FlexRow className="items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-avocado-flat text-accent-avocado-default">
                <ArrowIcon size={IconSize.XSmall} />
              </span>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
                className="min-w-0"
              >
                <span className="font-bold text-accent-avocado-default">
                  {formatDonationAmount(gapToNext, currentUser.currency)}
                </span>{' '}
                more to pass{' '}
                <span className="font-bold text-text-primary">
                  {aboveUser.name}
                </span>{' '}
                and reach{' '}
                <span className="font-bold text-text-primary">
                  #{aboveUser.rank}
                </span>
              </Typography>
            </FlexRow>
          ) : (
            <Typography bold type={TypographyType.Footnote}>
              You&apos;re #1 — hold the crown.
            </Typography>
          )}
        </FlexCol>
      )}
    </FlexCol>
  );
};
