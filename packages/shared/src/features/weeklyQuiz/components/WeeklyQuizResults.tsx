import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useAuthContext } from '../../../contexts/AuthContext';
import { AuthTriggers } from '../../../lib/auth';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { BellIcon, ShareIcon, UserShareIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { WeeklyQuizScoreboard } from './WeeklyQuizScoreboard';
import { WeeklyQuizSharePopover } from './WeeklyQuizSharePopover';
import { formatElapsed } from './WeeklyQuizTimer';
import { useSubmitWeeklyQuiz } from '../hooks/useSubmitWeeklyQuiz';
import { useWeeklyQuizLeaderboard } from '../hooks/useWeeklyQuizLeaderboard';
import { generateWeeklyQuizResultImage } from '../generateResultImage';
import { isWeeklyQuizDemo } from '../demoMode';
import type { WeeklyQuizGameResult } from '../hooks/useWeeklyQuizGame';
import type { UseWeeklyQuizAudio } from '../hooks/useWeeklyQuizAudio';
import { WeeklyQuizPeriod } from '../types';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizResultsProps {
  quizId: string;
  result: WeeklyQuizGameResult;
  audio?: UseWeeklyQuizAudio;
}

const buildMessage = (correct: number, total: number): string => {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio === 1) {
    return 'Flawless — you were paying attention this week!';
  }
  if (ratio >= 0.6) {
    return 'Nicely done. You know your tech news.';
  }
  if (ratio >= 0.3) {
    return 'Not bad — a few slipped past you.';
  }
  return 'Tough week? There is always next week.';
};

// Final screen: the celebratory score + time, then the scoreboard. Logged-in
// players' results are submitted once on arrival (and again if an anonymous
// player signs in from here), so their rank shows in the scoreboard below.
export const WeeklyQuizResults = ({
  quizId,
  result,
  audio,
}: WeeklyQuizResultsProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { submit } = useSubmitWeeklyQuiz();
  const [period, setPeriod] = useState<WeeklyQuizPeriod>(
    WeeklyQuizPeriod.Weekly,
  );
  // Local-only until the reminder subscription is wired to the backend.
  const [reminderSet, setReminderSet] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const submittedRef = useRef(false);
  const { leaderboard, viewerEntry } = useWeeklyQuizLeaderboard(period);

  // The player's rank — pinned viewer row when out of the top list, otherwise
  // their in-list row.
  const rank =
    viewerEntry?.rank ??
    leaderboard.find((entry) => entry.isCurrentUser)?.rank ??
    null;

  // Renders the result as a shareable PNG and downloads it. Target may change
  // later (native share sheet / upload); for now it saves locally.
  const handleShareResult = (): void => {
    generateWeeklyQuizResultImage({
      name: user?.name || user?.username || 'You',
      imageUrl: user?.image,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      timeLabel: formatElapsed(result.timeMs),
      rank,
      logoUrl: '/logos/weekly-quiz-logo.png',
    }).catch(() => undefined);
  };

  // Submit once we have an authenticated player — either immediately (already
  // logged in) or right after they sign in from the prompt below. Skipped in
  // demo mode (no backend to submit to).
  useEffect(() => {
    if (!user || submittedRef.current || isWeeklyQuizDemo()) {
      return;
    }

    submittedRef.current = true;
    submit({
      quizId,
      answers: result.answers,
      timeMs: result.timeMs,
    }).catch(() => {
      // Allow a retry if the submission failed.
      submittedRef.current = false;
    });
  }, [user, submit, quizId, result]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Score and time carry equal weight — two matching stat circles. */}
        <div className="flex items-center justify-center gap-4">
          <div
            className={classNames(
              'flex h-28 w-28 animate-reward-pop flex-col items-center justify-center rounded-full motion-reduce:animate-none',
              styles.scoreCircle,
            )}
            aria-hidden
          >
            <Typography
              type={TypographyType.LargeTitle}
              bold
              className="!text-white"
            >
              {result.correctCount}/{result.totalQuestions}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              className="!text-white/90"
            >
              Correct
            </Typography>
          </div>
          <div
            className={classNames(
              'flex h-28 w-28 animate-reward-pop flex-col items-center justify-center rounded-full motion-reduce:animate-none',
              styles.scoreCircle,
            )}
            aria-hidden
          >
            <Typography
              type={TypographyType.LargeTitle}
              bold
              className="tabular-nums !text-white"
            >
              {formatElapsed(result.timeMs)}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              className="!text-white/90"
            >
              Time
            </Typography>
          </div>
        </div>
        <Typography
          type={TypographyType.Title2}
          bold
          tag={TypographyTag.H1}
          className="!text-white"
        >
          {buildMessage(result.correctCount, result.totalQuestions)}
        </Typography>
      </div>

      <div className="flex flex-col gap-3 tablet:flex-row">
        <button
          type="button"
          className={styles.resultAction}
          onClick={handleShareResult}
        >
          <ShareIcon size={IconSize.XSmall} />
          Share your result
        </button>
        <button
          type="button"
          className={styles.resultAction}
          onClick={() => setIsChallengeOpen(true)}
        >
          <UserShareIcon size={IconSize.XSmall} />
          Challenge your team
        </button>
        <button
          type="button"
          aria-pressed={reminderSet}
          className={classNames(
            styles.resultAction,
            reminderSet && styles.resultActionSet,
          )}
          onClick={() => setReminderSet(true)}
        >
          <BellIcon size={IconSize.XSmall} />
          {reminderSet ? "You're all set" : 'Set weekly reminder'}
        </button>
      </div>

      {isChallengeOpen && (
        <WeeklyQuizSharePopover
          title="Challenge your team"
          description="Send this link so they can take this week's quiz and try to beat your score."
          onClose={() => setIsChallengeOpen(false)}
        />
      )}

      {!user && (
        <div
          className={classNames(
            'flex flex-col items-center gap-2 rounded-16 p-4 text-center',
            styles.glass,
          )}
        >
          <Typography
            type={TypographyType.Callout}
            bold
            className="!text-white"
          >
            Log in to save your score and claim your spot
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={() => showLogin({ trigger: AuthTriggers.WeeklyQuiz })}
          >
            Log in to see your rank
          </Button>
        </div>
      )}

      <WeeklyQuizScoreboard
        period={period}
        onPeriodChange={setPeriod}
        audio={audio}
      />
    </div>
  );
};
