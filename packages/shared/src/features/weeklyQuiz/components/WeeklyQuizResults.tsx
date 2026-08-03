import type { CSSProperties, ReactElement } from 'react';
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
import { ArrowIcon, BellIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { SocialShareContainer } from '../../../components/widgets/SocialShareContainer';
import { SocialShareList } from '../../../components/widgets/SocialShareList';
import { WeeklyQuizConfetti } from './WeeklyQuizConfetti';
import { WeeklyQuizScoreboard } from './WeeklyQuizScoreboard';
import { formatElapsed } from './WeeklyQuizTimer';
import { useSubmitWeeklyQuiz } from '../hooks/useSubmitWeeklyQuiz';
import { useWeeklyQuizLeaderboard } from '../hooks/useWeeklyQuizLeaderboard';
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

// A tech-reader persona keyed to how many answers the player got right. This is
// the BuzzFeed-style "who are you" headline for the result. Each tier also
// carries a matching one-liner and a celebratory GIF. GIF URLs are best-effort
// (open Giphy media); the GIF hides itself if the URL fails to load.
interface ResultTier {
  title: string;
  message: string;
  gif: string;
}

const getTier = (correct: number, total: number): ResultTier => {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio === 1) {
    return {
      title: 'Tech News Oracle',
      message: 'Flawless. Nothing slipped past you this week.',
      gif: 'https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif',
    };
  }
  if (ratio >= 0.7) {
    return {
      title: 'Well Informed',
      message: 'You clearly did your reading. Sharp week.',
      gif: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
    };
  }
  if (ratio >= 0.4) {
    return {
      title: 'In the Loop',
      message: 'Solidly caught up, with a few that got away.',
      gif: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    };
  }
  if (ratio >= 0.2) {
    return {
      title: 'Casually Scrolling',
      message: 'You skimmed the headlines. Room to level up.',
      gif: 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif',
    };
  }
  return {
    title: 'Out of the Loop',
    message: 'Tough week? There is always next week.',
    gif: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif',
  };
};

// A fabricated-but-fun "better than X%" percentile, derived from the score. A
// perfect run never claims to beat everyone.
const getPercentile = (correct: number, total: number): number => {
  const ratio = total === 0 ? 0 : correct / total;
  return Math.min(99, Math.max(1, Math.round(ratio * 100)));
};

// Classify the run's pace from average time per question, so the time reads as
// fast / steady / slow rather than a bare number.
const getPaceLabel = (timeMs: number, total: number): string => {
  const perQuestion = total === 0 ? timeMs : timeMs / total;
  if (perQuestion < 6000) {
    return 'Lightning fast';
  }
  if (perQuestion <= 11000) {
    return 'Steady pace';
  }
  return 'Took your time';
};

// A circular progress ring showing correct/total, BuzzFeed-style. Uses inline
// CSS-var strokes (theme tokens) so it tracks light/dark without raw colors.
const ScoreRing = ({
  correct,
  total,
}: {
  correct: number;
  total: number;
}): ReactElement => {
  const ratio = total === 0 ? 0 : correct / total;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          style={{ stroke: 'var(--theme-border-subtlest-secondary)' }}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="animate-reward-pop motion-reduce:animate-none"
          style={{ stroke: 'var(--theme-accent-cabbage-default)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <Typography
          type={TypographyType.Title1}
          bold
          className="!text-text-primary"
        >
          {correct}/{total}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          className="!text-text-tertiary"
        >
          Correct
        </Typography>
      </div>
    </div>
  );
};

// Final screen: a back arrow to the main screen, then a BuzzFeed-style verdict —
// a persona title for the player, a score ring, pace, and a matching GIF —
// followed by the external share row and the leaderboard. Logged-in players'
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
  // Best-effort GIF: hide the slot entirely if the open Giphy URL fails to load.
  const [gifFailed, setGifFailed] = useState(false);
  // Leaderboard period for the board shown at the bottom of this screen.
  const [period, setPeriod] = useState<WeeklyQuizPeriod>(
    WeeklyQuizPeriod.Weekly,
  );
  const submittedRef = useRef(false);
  // Shareable quiz link (placeholder until the real URL is wired up).
  const quizUrl = 'https://daily.dev/quiz/weekly-tech-news';

  const { correctCount, totalQuestions, timeMs } = result;
  const tier = getTier(correctCount, totalQuestions);
  const percentile = getPercentile(correctCount, totalQuestions);
  const paceLabel = getPaceLabel(timeMs, totalQuestions);
  const shareText = `I'm a "${tier.title}" on the daily.dev weekly tech news quiz (${correctCount}/${totalQuestions} correct). Think you can beat me?`;

  const copyLink = (): void => {
    navigator.clipboard
      ?.writeText(quizUrl)
      .then(() => setLinkCopied(true))
      .catch(() => undefined);
  };
  const nativeShare = (): void => {
    navigator
      .share?.({
        title: 'daily.dev weekly quiz',
        text: shareText,
        url: quizUrl,
      })
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
      {/* One-shot celebratory confetti when the results appear. */}
      <WeeklyQuizConfetti />

      {/* Big icon-only back arrow to the main screen, top-left. */}
      <button
        type="button"
        aria-label="Back to main"
        className="z-10 absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover text-text-primary transition-colors hover:bg-surface-active"
        onClick={onBackToMain}
      >
        <ArrowIcon size={IconSize.Large} className="-rotate-90" />
      </button>

      {/* Verdict: the persona title is the hero, with the score ring beside it. */}
      <div className="mt-6 flex flex-col items-center gap-4 text-center">
        <ScoreRing correct={correctCount} total={totalQuestions} />
        <div className="flex flex-col items-center gap-1">
          <Typography
            type={TypographyType.LargeTitle}
            bold
            tag={TypographyTag.H1}
            className="!text-text-primary"
          >
            {tier.title}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            className="!text-text-tertiary"
          >
            You scored better than {percentile}% of players.
          </Typography>
          {rank && (
            <span
              className={classNames(
                'mt-1 whitespace-nowrap rounded-full px-3 py-0.5 font-bold typo-footnote',
                styles.fastestBadge,
              )}
            >
              #{rank} this week
            </span>
          )}
        </div>
        <Typography
          type={TypographyType.Body}
          className="max-w-sm !text-text-secondary"
        >
          {tier.message}
        </Typography>
        {/* Time, framed as a pace verdict rather than a bare number. */}
        <div className="flex items-center gap-2 rounded-full bg-surface-float px-4 py-1.5">
          <Typography
            type={TypographyType.Footnote}
            bold
            className="tabular-nums !text-text-primary"
          >
            {formatElapsed(timeMs)}
          </Typography>
          <span
            className="h-1 w-1 rounded-full bg-text-quaternary"
            aria-hidden
          />
          <Typography
            type={TypographyType.Footnote}
            className="!text-text-tertiary"
          >
            {paceLabel}
          </Typography>
        </div>
      </div>

      {/* A GIF that matches the verdict. Hidden if the open source URL fails. */}
      {!gifFailed && (
        <img
          src={tier.gif}
          alt=""
          aria-hidden
          onError={() => setGifFailed(true)}
          className="h-52 w-full rounded-16 object-cover"
          style={{ objectPosition: 'center' } as CSSProperties}
        />
      )}

      {/* External share row — reuses the app's standard share grid. */}
      <SocialShareContainer title="Share your result">
        <SocialShareList
          link={quizUrl}
          description={shareText}
          emailTitle="Take the daily.dev weekly tech news quiz"
          emailSummary={shareText}
          isCopying={linkCopied}
          onCopy={copyLink}
          onNativeShare={nativeShare}
          onClickSocial={() => undefined}
          // No backend link-shortener in this context; share the link as-is.
          shortenUrl={false}
        />
      </SocialShareContainer>

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
