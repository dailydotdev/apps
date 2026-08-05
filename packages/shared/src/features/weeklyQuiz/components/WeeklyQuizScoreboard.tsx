import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
import { ReputationLightningIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useAuthContext } from '../../../contexts/AuthContext';
import { AuthTriggers } from '../../../lib/auth';
import { useWeeklyQuizLeaderboard } from '../hooks/useWeeklyQuizLeaderboard';
import { useCountUp } from '../hooks/useCountUp';
import { isWeeklyQuizDemo } from '../demoMode';
import type { UseWeeklyQuizAudio } from '../hooks/useWeeklyQuizAudio';
import { WeeklyQuizPeriod } from '../types';
import type { WeeklyQuizLeaderboardEntry } from '../types';
import { formatElapsed } from './WeeklyQuizTimer';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizScoreboardProps {
  period: WeeklyQuizPeriod;
  onPeriodChange: (period: WeeklyQuizPeriod) => void;
  audio?: UseWeeklyQuizAudio;
  // Fill the parent's height and scroll internally (intro's stretched panel).
  fillHeight?: boolean;
  // Cap how many ranked rows render (e.g. a short top-5 on the results screen).
  // The pinned viewer row still shows below when they sit outside the cap.
  limit?: number;
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
  animate,
}: {
  entry: WeeklyQuizLeaderboardEntry;
  isFastest: boolean;
  // Count the score up once the board scrolls into view.
  animate: boolean;
}): ReactElement => {
  const score = Math.round(useCountUp(entry.correctCount, { start: animate }));
  // Mobile shows just the first name so the row stays compact; tablet+ keeps
  // the full name.
  const firstName = entry.name.split(' ')[0];
  return (
    <>
      <span className="w-5 shrink-0 text-center font-bold text-text-secondary typo-callout">
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
          bold
          className="min-w-0 truncate !text-text-primary"
        >
          {firstName === entry.name ? (
            entry.name
          ) : (
            <>
              <span className="tablet:hidden">{firstName}</span>
              <span className="hidden tablet:inline">{entry.name}</span>
            </>
          )}
        </Typography>
        <ReputationUserBadge
          user={{ reputation: entry.reputation }}
          className="shrink-0 !text-text-primary"
          disableTooltip
        />
      </div>
      {isFastest && (
        <span
          className={classNames(
            'flex shrink-0 items-center gap-0.5 rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption1',
            styles.fastestBadge,
          )}
        >
          <ReputationLightningIcon size={IconSize.XXSmall} secondary />
          Fastest
        </span>
      )}
      <span className="shrink-0 font-bold tabular-nums text-text-primary typo-subhead">
        {score}/{entry.totalQuestions}
      </span>
      <span className="w-11 shrink-0 text-right font-bold tabular-nums text-text-secondary typo-footnote">
        {formatElapsed(entry.timeMs)}
      </span>
    </>
  );
};

const ScoreboardRow = ({
  entry,
  isFastest,
  animate,
}: {
  entry: WeeklyQuizLeaderboardEntry;
  isFastest: boolean;
  animate: boolean;
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
            'absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption1',
            styles.superstarBadge,
          )}
        >
          <ReputationLightningIcon size={IconSize.XXSmall} secondary />
          Fastest
        </span>
        <RowContent entry={entry} isFastest={false} animate={animate} />
      </li>
    );
  }

  return (
    <li
      className={classNames(
        'flex items-center gap-3 rounded-12 px-2 py-2.5',
        entry.isCurrentUser ? styles.viewerHighlight : 'bg-surface-float',
      )}
    >
      <RowContent entry={entry} isFastest={isFastest} animate={animate} />
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
  fillHeight = false,
  limit,
}: WeeklyQuizScoreboardProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { leaderboard, viewerEntry, isPending } =
    useWeeklyQuizLeaderboard(period);
  // Demo mode shows the mock board even to anonymous preview testers.
  const showBoard = !!user || isWeeklyQuizDemo();
  // Optionally cap the rendered rows (short board on the results screen).
  const visibleLeaderboard = limit ? leaderboard.slice(0, limit) : leaderboard;

  // Count the row scores up once the board scrolls into view (it usually sits
  // below the fold on the results screen).
  const listRef = useRef<HTMLUListElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = listRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showBoard]);

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
        <Typography
          type={TypographyType.Body}
          bold
          className="!text-text-primary"
        >
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
                  'flex-1 rounded-10 py-2 font-bold transition-colors typo-footnote',
                  isActive
                    ? 'bg-surface-hover text-text-primary'
                    : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          className={classNames(
            'flex flex-col gap-1 pt-1',
            fillHeight && 'tablet:min-h-0 tablet:flex-1',
          )}
        >
          {!showBoard ? (
            <div className="relative overflow-hidden rounded-12">
              <ul aria-hidden className="flex flex-col gap-1 blur-sm">
                {[1, 2, 3, 4].map((rank) => (
                  <li
                    key={rank}
                    className="flex items-center gap-3 rounded-12 bg-surface-float px-2 py-1.5"
                  >
                    <span className="h-6 w-6 rounded-8 bg-surface-hover" />
                    <span className="h-7 w-7 rounded-full bg-surface-hover" />
                    <span className="h-3 flex-1 rounded-8 bg-surface-hover" />
                  </li>
                ))}
              </ul>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                <Typography
                  type={TypographyType.Callout}
                  bold
                  className="!text-text-primary"
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
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-border-subtlest-tertiary border-t-white" />
                </div>
              )}
              {!isPending && leaderboard.length === 0 && (
                <Typography
                  type={TypographyType.Callout}
                  className="py-6 text-center !text-text-tertiary"
                >
                  No scores yet — be the first to play!
                </Typography>
              )}
              {!isPending && leaderboard.length > 0 && (
                <ul
                  ref={listRef}
                  className={classNames(
                    'flex flex-col gap-1 overflow-y-auto',
                    styles.scrollArea,
                    fillHeight
                      ? 'max-h-72 tablet:max-h-none tablet:min-h-0 tablet:flex-1'
                      : 'max-h-72',
                  )}
                >
                  {visibleLeaderboard.map((entry) => (
                    <ScoreboardRow
                      key={entry.id}
                      entry={entry}
                      isFastest={entry.id === fastestId}
                      animate={inView}
                    />
                  ))}
                </ul>
              )}
              {/* Pinned "your rank" row, shown only when the player sits outside
                  the visible top list. White border sets it apart. Null for
                  anon and for anyone without a standing in this period. */}
              {!isPending && viewerEntry && (
                <div
                  className={classNames(
                    'flex items-center gap-3 rounded-12 px-2 py-1.5',
                    styles.viewerHighlight,
                  )}
                >
                  <RowContent
                    entry={viewerEntry}
                    isFastest={false}
                    animate={inView}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
