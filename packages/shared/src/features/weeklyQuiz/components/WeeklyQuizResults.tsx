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
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  ArrowIcon,
  BellIcon,
  CopyIcon,
  ShareIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  ProfilePicture,
  ProfileImageSize,
} from '../../../components/ProfilePicture';
import { WeeklyQuizScoreboard } from './WeeklyQuizScoreboard';
import { formatElapsed } from './WeeklyQuizTimer';
import { useSubmitWeeklyQuiz } from '../hooks/useSubmitWeeklyQuiz';
import { useWeeklyQuizLeaderboard } from '../hooks/useWeeklyQuizLeaderboard';
import { fallbackImages } from '../../../lib/config';
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
  // Return to the intro ("main"), which shows the full leaderboard.
  onBackToMain: () => void;
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

// Final screen: a back arrow to the main screen, then the player's own result
// as the hero (placement + score + time) and the share/reminder actions. The
// full leaderboard lives on the main screen, not here. Logged-in players'
// results are submitted once on arrival (and again if an anonymous player signs
// in from here).
export const WeeklyQuizResults = ({
  quizId,
  result,
  audio,
  onBackToMain,
}: WeeklyQuizResultsProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { submit } = useSubmitWeeklyQuiz();
  // Local-only until the reminder subscription is wired to the backend.
  const [reminderSet, setReminderSet] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  // Leaderboard period for the board shown at the bottom of this screen.
  const [period, setPeriod] = useState<WeeklyQuizPeriod>(
    WeeklyQuizPeriod.Weekly,
  );
  const submittedRef = useRef(false);
  // Shareable quiz link (placeholder until the real URL is wired up).
  const quizUrl = 'https://daily.dev/quiz/weekly-tech-news';
  const copyLink = (): void => {
    navigator.clipboard
      ?.writeText(quizUrl)
      .then(() => setLinkCopied(true))
      .catch(() => undefined);
  };
  // Rank comes from this week's board (the quiz just finished).
  const { leaderboard, viewerEntry } = useWeeklyQuizLeaderboard(
    WeeklyQuizPeriod.Weekly,
  );

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
      // Fall back to daily.dev's placeholder avatar when the player has none.
      imageUrl: user?.image || fallbackImages.avatar,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      timeLabel: formatElapsed(result.timeMs),
      rank,
      logoUrl: '/logos/weekly-quiz-logo.png',
      brandLogoUrl: '/android-chrome-512x512.png',
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
    <div className="relative flex flex-col gap-6 p-6">
      {/* Big icon-only back arrow to the main screen, top-left. */}
      <button
        type="button"
        aria-label="Back to main"
        className="z-10 absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover text-text-primary transition-colors hover:bg-surface-active"
        onClick={onBackToMain}
      >
        <ArrowIcon size={IconSize.Large} className="-rotate-90" />
      </button>

      <div className="flex flex-col items-center gap-4 text-center">
        {/* Achievement first: the player's own placement is the hero, with their
            avatar and a medal-style rank badge. Only when we know their rank. */}
        {rank && user && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative animate-reward-pop motion-reduce:animate-none">
              <ProfilePicture
                user={user}
                size={ProfileImageSize.XXXLarge}
                rounded="full"
                className="ring-4 ring-border-subtlest-secondary"
              />
              <span
                className={classNames(
                  'absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 font-bold typo-callout',
                  styles.fastestBadge,
                )}
              >
                #{rank}
              </span>
            </div>
            <Typography
              type={TypographyType.LargeTitle}
              bold
              tag={TypographyTag.H1}
              className="!text-text-primary"
            >
              You placed #{rank}!
            </Typography>
          </div>
        )}
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
              className="!text-text-primary"
            >
              {result.correctCount}/{result.totalQuestions}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              className="!text-text-secondary"
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
              className="tabular-nums !text-text-primary"
            >
              {formatElapsed(result.timeMs)}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              className="!text-text-secondary"
            >
              Time
            </Typography>
          </div>
        </div>
        <Typography
          type={rank && user ? TypographyType.Title3 : TypographyType.Title2}
          bold
          tag={rank && user ? TypographyTag.P : TypographyTag.H1}
          className={
            rank && user ? '!text-text-secondary' : '!text-text-primary'
          }
        >
          {buildMessage(result.correctCount, result.totalQuestions)}
        </Typography>
      </div>

      {/* Primary action: share, styled and animated like the intro Start button. */}
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        size={ButtonSize.XLarge}
        className={classNames('w-full', styles.arcadeBtnIdle)}
        icon={<ShareIcon />}
        onClick={handleShareResult}
      >
        Share your result
      </Button>

      {/* Challenge your team — share the quiz link, inline under the CTA. */}
      <div
        className={classNames(
          'flex flex-col gap-2 rounded-16 p-4 text-left',
          styles.glass,
        )}
      >
        <Typography
          type={TypographyType.Callout}
          bold
          className="!text-text-primary"
        >
          Challenge your team
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          className="!text-text-tertiary"
        >
          Send this link so they can take this week&apos;s quiz and try to beat
          your score.
        </Typography>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={quizUrl}
            aria-label="Quiz link"
            onFocus={(event) => event.target.select()}
            className="min-w-0 flex-1 rounded-10 bg-background-default px-3 py-2 text-text-primary typo-footnote"
          />
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={<CopyIcon />}
            onClick={copyLink}
          >
            {linkCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Weekly reminder. */}
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
            className="!text-text-primary"
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

      {/* The leaderboard now lives here, at the end. */}
      <WeeklyQuizScoreboard
        period={period}
        onPeriodChange={setPeriod}
        audio={audio}
      />
    </div>
  );
};
