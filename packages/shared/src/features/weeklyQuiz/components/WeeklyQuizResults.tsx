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
import { BellIcon, CopyIcon, DownloadIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { SocialShareButton } from '../../../components/widgets/SocialShareButton';
import { SocialShareList } from '../../../components/widgets/SocialShareList';
import { WeeklyQuizConfetti } from './WeeklyQuizConfetti';
import { WeeklyQuizScoreboard } from './WeeklyQuizScoreboard';
import { WeeklyQuizLogo } from './WeeklyQuizSurface';
import { useSubmitWeeklyQuiz } from '../hooks/useSubmitWeeklyQuiz';
import { useWeeklyQuizLeaderboard } from '../hooks/useWeeklyQuizLeaderboard';
import { useCountUp } from '../hooks/useCountUp';
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
}

// A developer "level" keyed to how many answers the player got right — the
// BuzzFeed-style "who are you" headline for the result, best to worst. Each
// level carries the min score ratio that earns it, a matching one-liner and a
// celebratory GIF. GIF URLs are best-effort (open Giphy media); the GIF hides
// itself if it fails to load. Exported so a Storybook gallery can show them all.
export interface ResultTier {
  minRatio: number;
  title: string;
  message: string;
  gif: string;
}

export const WEEKLY_QUIZ_TIERS: ResultTier[] = [
  {
    minRatio: 1,
    title: '10x AI Engineer',
    message: 'Flawless. You ship faster than the models can hallucinate.',
    gif: 'https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif',
  },
  {
    minRatio: 0.8,
    title: 'Prompt Wizard',
    message: 'Sharp. You clearly speak fluent context window.',
    gif: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
  },
  {
    minRatio: 0.6,
    title: 'Autocomplete Hero',
    message: 'Strong run. You finished more than you missed.',
    gif: 'https://media.giphy.com/media/13GIgrGdslD9oQ/giphy.gif',
  },
  {
    minRatio: 0.4,
    title: 'Tab Spammer',
    message: 'Not bad. A few tabs too many, a few answers too few.',
    gif: 'https://media.giphy.com/media/YQitE4YNQNahy/giphy.gif',
  },
  {
    minRatio: 0.2,
    title: 'Copy-Paste Coder',
    message: 'Rough patch. Time to read the docs, not just paste them.',
    gif: 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif',
  },
  {
    minRatio: 0,
    title: 'Asked AI, Still Wrong',
    message: 'Tough week. Even the AI could not save this one.',
    gif: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif',
  },
];

const getTier = (correct: number, total: number): ResultTier => {
  const ratio = total === 0 ? 0 : correct / total;
  return (
    WEEKLY_QUIZ_TIERS.find((tier) => ratio >= tier.minRatio) ??
    WEEKLY_QUIZ_TIERS[WEEKLY_QUIZ_TIERS.length - 1]
  );
};

// A fabricated-but-fun "better than X%" percentile, derived from the score. A
// perfect run never claims to beat everyone.
const getPercentile = (correct: number, total: number): number => {
  const ratio = total === 0 ? 0 : correct / total;
  return Math.min(99, Math.max(1, Math.round(ratio * 100)));
};

// A circular ring showing a single stat, BuzzFeed-style. `ratio` fills the arc
// (pass 1 for a full ring). Inline CSS-var strokes track light/dark without raw
// colors.
const StatRing = ({
  value,
  label,
  ratio,
  colorVar,
}: {
  value: string;
  label: string;
  ratio: number;
  colorVar: string;
}): ReactElement => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(1, Math.max(0, ratio)));
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
          style={{ stroke: `var(${colorVar})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <Typography
          type={TypographyType.Title1}
          bold
          className="tabular-nums !text-text-primary"
        >
          {value}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          className="!text-text-tertiary"
        >
          {label}
        </Typography>
      </div>
    </div>
  );
};

// Final screen: a BuzzFeed-style verdict — a developer level for the player
// (score ring on the left, level and copy on the right, with the numbers
// counting up on reveal), a matching GIF, then the share row, the "challenge a
// friend" link and the leaderboard (the player's own row gets the gold bar).
// Logged-in players' results are submitted once on arrival (and again if an
// anonymous player signs in from here).
export const WeeklyQuizResults = ({
  quizId,
  result,
  audio,
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

  const { correctCount, totalQuestions } = result;
  // Odometer-style reveal: the score, its ring arc and the time count up on
  // mount (snaps instantly under prefers-reduced-motion).
  const animatedCorrect = Math.round(
    useCountUp(correctCount, { durationMs: 900 }),
  );
  const ratio = totalQuestions === 0 ? 0 : animatedCorrect / totalQuestions;
  const tier = getTier(correctCount, totalQuestions);
  const percentile = getPercentile(correctCount, totalQuestions);
  const shareText = `I got ${correctCount}/${totalQuestions} on the daily.dev weekly tech news quiz. What would you get?`;

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

  // Renders the result as a shareable PNG and downloads it. Falls back to the
  // daily.dev placeholder avatar when the player has no picture.
  const handleDownload = (): void => {
    generateWeeklyQuizResultImage(
      {
        name: user?.name || user?.username || 'You',
        imageUrl: user?.image || fallbackImages.avatar,
        title: tier.title,
        correctCount,
        totalQuestions,
        percentile,
        rank,
        gifUrl: tier.gif,
        logoUrl: '/logos/weekly-quiz-logo.png',
        brandLogoUrl: '/android-chrome-512x512.png',
      },
      2,
    ).catch(() => undefined);
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
      {/* One-shot celebratory confetti when the results appear. */}
      <WeeklyQuizConfetti />

      {/* Chunk 1 — your result: brand header, the verdict headline, GIF and
          share row. A floating panel, distinct from the panel below. */}
      <div className="flex flex-col gap-6 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-2">
        {/* daily.dev brand header, inside the result panel. */}
        <div className="-mx-4 -mt-4 border-b border-border-subtlest-tertiary px-4 py-3">
          <WeeklyQuizLogo />
        </div>
        {/* Verdict: the score ring on the left, level and copy on the right. */}
        <div className="flex flex-wrap items-center gap-4 text-left">
          <StatRing
            value={`${animatedCorrect}/${totalQuestions}`}
            label="Correct"
            ratio={ratio}
            colorVar="--theme-accent-cabbage-default"
          />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <Typography
              type={TypographyType.Title1}
              bold
              tag={TypographyTag.H1}
              className="!text-text-primary"
            >
              {tier.title}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              className="!text-text-secondary"
            >
              You scored better than {percentile}% of players.
            </Typography>
            <Typography
              type={TypographyType.Callout}
              className="mt-0.5 !text-text-secondary"
            >
              {tier.message}
            </Typography>
          </div>
        </div>

        {/* A 4:3 GIF that matches the verdict. Hidden if the open URL fails. */}
        {!gifFailed && (
          <img
            src={tier.gif}
            alt=""
            aria-hidden
            onError={() => setGifFailed(true)}
            className="aspect-[4/3] w-full max-w-[640px] rounded-16 object-cover"
          />
        )}

        {/* Share row — download the result image, then the standard socials, all
          on a single line. */}
        <section className="relative flex flex-col">
          {/* Playful sticker nudging the player to share. */}
          <span
            aria-hidden
            className={classNames(
              'z-10 absolute -top-9 right-1 flex h-20 w-20 flex-col items-center justify-center rounded-full text-center font-bold uppercase leading-tight tracking-wide typo-caption2',
              styles.shareSticker,
            )}
          >
            Had fun? Share it!
          </span>
          <Typography
            type={TypographyType.Callout}
            bold
            tag={TypographyTag.H4}
            className="!text-text-primary"
          >
            Share your result
          </Typography>
          <div className="no-scrollbar mt-4 flex flex-row justify-start gap-2 overflow-x-auto">
            <SocialShareButton
              label="Download"
              icon={<DownloadIcon />}
              variant={ButtonVariant.Primary}
              onClick={handleDownload}
            />
            <SocialShareList
              link={quizUrl}
              description={shareText}
              emailTitle="Take the daily.dev weekly tech news quiz"
              emailSummary={shareText}
              onNativeShare={nativeShare}
              onClickSocial={() => undefined}
              // No backend link-shortener in this context; share the link as-is.
              shortenUrl={false}
            />
          </div>
        </section>
      </div>

      {/* Divider splitting the shareable result from the follow-on actions. */}
      {/* Chunk 2 — keep playing: challenge, reminder and the leaderboard.
          Its own floating panel below the result. */}
      <div className="flex flex-col gap-6 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-2">
        {/* Challenge a friend — share the quiz link so they can try to beat you. */}
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
            Challenge a friend ⚔️
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            className="!text-text-tertiary"
          >
            Send this link so they can take this week&apos;s quiz and try to
            beat your score.
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
    </div>
  );
};
