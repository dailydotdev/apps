import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  ProfilePicture,
  ProfileImageSize,
} from '../../../components/ProfilePicture';
import { ProfileTooltip } from '../../../components/profile/ProfileTooltip';
import { ReputationUserBadge } from '../../../components/ReputationUserBadge';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ReputationLightningIcon, StarIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useAuthContext } from '../../../contexts/AuthContext';
import { AuthTriggers } from '../../../lib/auth';
import { useWeeklyQuizLeaderboard } from '../hooks/useWeeklyQuizLeaderboard';
import type { UseWeeklyQuizAudio } from '../hooks/useWeeklyQuizAudio';
import { WeeklyQuizPeriod } from '../types';
import type { WeeklyQuizLeaderboardEntry } from '../types';
import { formatElapsed } from './WeeklyQuizTimer';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizScoreboardProps {
  period: WeeklyQuizPeriod;
  onPeriodChange: (period: WeeklyQuizPeriod) => void;
  audio?: UseWeeklyQuizAudio;
  // Whether to pin the viewer's own out-of-list rank. Off before the player has
  // participated (no standing yet — e.g. the intro with Start still active).
  showViewerRank?: boolean;
  // Fill the parent's height and scroll internally (intro's stretched panel).
  fillHeight?: boolean;
}

const periodTabs = [
  { label: 'Weekly', value: WeeklyQuizPeriod.Weekly },
  { label: 'Monthly', value: WeeklyQuizPeriod.Monthly },
  { label: 'All time', value: WeeklyQuizPeriod.AllTime },
];

// The columns of a scoreboard row, shared by the in-list rows and the pinned
// "your rank" row so they stay visually identical.
const RowContent = ({
  entry,
  isFastest,
}: {
  entry: WeeklyQuizLeaderboardEntry;
  isFastest: boolean;
}): ReactElement => (
  <>
    <span className="text-white/80 w-5 shrink-0 text-center font-bold typo-callout">
      {entry.rank}
    </span>
    <ProfileTooltip userId={entry.id}>
      <ProfilePicture
        user={{ image: entry.image, id: entry.id, name: entry.name }}
        size={ProfileImageSize.Small}
        rounded="full"
        nativeLazyLoading
      />
    </ProfileTooltip>
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <Typography
        type={TypographyType.Subhead}
        bold={entry.isCurrentUser}
        className="min-w-0 truncate !text-white"
      >
        {entry.name}
      </Typography>
      <ReputationUserBadge
        user={{ reputation: entry.reputation }}
        className="shrink-0 !text-white"
        disableTooltip
      />
    </div>
    {isFastest && (
      <span
        className={classNames(
          'flex shrink-0 items-center gap-0.5 rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption2',
          styles.fastestBadge,
        )}
      >
        <ReputationLightningIcon size={IconSize.XXSmall} secondary />
        Fastest
      </span>
    )}
    <span className="shrink-0 font-bold tabular-nums text-white typo-subhead">
      {entry.correctCount}/{entry.totalQuestions}
    </span>
    <span className="text-white/70 w-10 shrink-0 text-right tabular-nums typo-caption1">
      {formatElapsed(entry.timeMs)}
    </span>
  </>
);

const ScoreboardRow = ({
  entry,
  isFastest,
}: {
  entry: WeeklyQuizLeaderboardEntry;
  isFastest: boolean;
}): ReactElement => {
  // The all-time champion gets a "superstar" banner above the row and a stroke
  // around it, so the label never crowds out their name.
  if (entry.isAllTimeSuperstar) {
    return (
      <li
        className={classNames(
          'relative mt-3 flex items-center gap-3 rounded-12 border px-2 py-2',
          styles.superstarRow,
        )}
      >
        {/* The chip straddles the row's top border, like a ribbon/label. */}
        <span
          className={classNames(
            'absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption2',
            styles.superstarBadge,
          )}
        >
          <StarIcon size={IconSize.XXSmall} secondary />
          Superstar
        </span>
        <RowContent entry={entry} isFastest={false} />
      </li>
    );
  }

  return (
    <li
      className={classNames(
        'flex items-center gap-3 rounded-12 px-2 py-1.5',
        entry.isCurrentUser ? 'bg-white/25' : 'bg-white/5',
      )}
    >
      <RowContent entry={entry} isFastest={isFastest} />
    </li>
  );
};

// The scoreboard: a plain scrollable ranked list (#1 down to the cap), ranked
// by correct answers with total time as the tiebreak. The This week / Last week
// toggle switches the queried period. Locked behind login — anonymous players
// see a blurred teaser and a sign-in prompt instead of real standings.
export const WeeklyQuizScoreboard = ({
  period,
  onPeriodChange,
  audio,
  showViewerRank = true,
  fillHeight = false,
}: WeeklyQuizScoreboardProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { leaderboard, viewerEntry, isPending } =
    useWeeklyQuizLeaderboard(period);

  // Whoever finished in the least total time earns the "Fastest" badge —
  // independent of rank, since rank leads with correct answers.
  const fastestId = leaderboard.length
    ? leaderboard.reduce((fastest, entry) =>
        entry.timeMs < fastest.timeMs ? entry : fastest,
      ).id
    : null;

  return (
    <section
      className={classNames(
        'flex w-full flex-col gap-3',
        // Fill the stretched panel on tablet+ (absolute so the list height is
        // driven by the sibling panel, not by its own row count).
        fillHeight && 'p-4 tablet:absolute tablet:inset-0',
      )}
    >
      <div className="flex items-center gap-2">
        <img
          src="/logos/weekly-quiz-trophy.png"
          alt=""
          aria-hidden
          className="h-7 w-7 object-contain"
        />
        <Typography type={TypographyType.Body} bold className="!text-white">
          Leaderboard
        </Typography>
      </div>
      {/* Browser-style tabs sitting on top of the leaderboard "window": the
          active tab shares the window's background so it reads as connected. */}
      <div
        className={classNames(
          'flex flex-col',
          fillHeight && 'tablet:min-h-0 tablet:flex-1',
        )}
      >
        <div
          className="flex gap-1"
          role="tablist"
          aria-label="Leaderboard period"
        >
          {periodTabs.map((tab) => {
            const isActive = period === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  audio?.playAnswer();
                  onPeriodChange(tab.value);
                }}
                className={classNames(
                  'flex-1 rounded-10 border py-2 font-bold transition-colors typo-footnote',
                  isActive
                    ? 'bg-white/15 border-white/50 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border-transparent hover:text-white',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          className={classNames(
            'bg-white/15 flex flex-col gap-1 rounded-b-16 rounded-tr-16 p-2',
            fillHeight && 'tablet:min-h-0 tablet:flex-1',
          )}
        >
          {!user ? (
            <div className="relative overflow-hidden rounded-12">
              <ul aria-hidden className="flex flex-col gap-1 blur-sm">
                {[1, 2, 3, 4].map((rank) => (
                  <li
                    key={rank}
                    className="bg-white/10 flex items-center gap-3 rounded-12 px-2 py-1.5"
                  >
                    <span className="bg-white/30 h-6 w-6 rounded-8" />
                    <span className="bg-white/30 h-7 w-7 rounded-full" />
                    <span className="bg-white/20 h-3 flex-1 rounded-8" />
                  </li>
                ))}
              </ul>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                <Typography
                  type={TypographyType.Callout}
                  bold
                  className="!text-white"
                >
                  Log in to see the scoreboard
                </Typography>
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                  onClick={() =>
                    showLogin({ trigger: AuthTriggers.WeeklyQuiz })
                  }
                >
                  Log in
                </Button>
              </div>
            </div>
          ) : (
            <>
              {isPending && (
                <div className="flex h-32 items-center justify-center">
                  <span className="border-white/30 h-8 w-8 animate-spin rounded-full border-2 border-t-white" />
                </div>
              )}
              {!isPending && leaderboard.length === 0 && (
                <Typography
                  type={TypographyType.Callout}
                  className="!text-white/80 py-6 text-center"
                >
                  No scores yet — be the first to play!
                </Typography>
              )}
              {!isPending && leaderboard.length > 0 && (
                <ul
                  className={classNames(
                    'flex flex-col gap-1 overflow-y-auto',
                    styles.scrollArea,
                    fillHeight
                      ? 'max-h-72 tablet:max-h-none tablet:min-h-0 tablet:flex-1'
                      : 'max-h-72',
                  )}
                >
                  {leaderboard.map((entry) => (
                    <ScoreboardRow
                      key={entry.id}
                      entry={entry}
                      isFastest={entry.id === fastestId}
                    />
                  ))}
                </ul>
              )}
              {/* Pinned "your rank" row, shown only when the player sits outside
                  the visible top list. White border sets it apart. */}
              {!isPending && showViewerRank && viewerEntry && (
                <div className="border-white/60 bg-white/10 flex items-center gap-3 rounded-12 border px-2 py-1.5">
                  <RowContent entry={viewerEntry} isFastest={false} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
