import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { useEffect, useState } from 'react';
import { useWeeklyQuizStatus } from '@dailydotdev/shared/src/features/weeklyQuiz/hooks/useWeeklyQuizStatus';
import { useWeeklyQuiz } from '@dailydotdev/shared/src/features/weeklyQuiz/hooks/useWeeklyQuiz';
import {
  useWeeklyQuizGame,
  WeeklyQuizPhase,
} from '@dailydotdev/shared/src/features/weeklyQuiz/hooks/useWeeklyQuizGame';
import { useWeeklyQuizAudio } from '@dailydotdev/shared/src/features/weeklyQuiz/hooks/useWeeklyQuizAudio';
import { useWeeklyQuizPlayed } from '@dailydotdev/shared/src/features/weeklyQuiz/hooks/useWeeklyQuizPlayed';
import {
  WeeklyQuizIntro,
  WeeklyQuizDateChip,
} from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizIntro';
import { WeeklyQuizCountdown } from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizCountdown';
import { WeeklyQuizQuestion } from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizQuestion';
import {
  WeeklyQuizResults,
  WEEKLY_QUIZ_TIERS,
} from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizResults';
import { WeeklyQuizSideControls } from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizSideControls';
import {
  WeeklyQuizSurface,
  WeeklyQuizLogo,
} from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizSurface';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  TimerIcon,
  DownloadIcon,
  TwitterIcon,
  WhatsappIcon,
  FacebookIcon,
  RedditIcon,
  LinkedInIcon,
  CopyIcon,
  BellIcon,
} from '@dailydotdev/shared/src/components/icons';
import { SocialShareButton } from '@dailydotdev/shared/src/components/widgets/SocialShareButton';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import quizStyles from '@dailydotdev/shared/src/features/weeklyQuiz/WeeklyQuiz.module.css';
import {
  createWeeklyQuizResultImage,
  createWeeklyQuizOgImage,
} from '@dailydotdev/shared/src/features/weeklyQuiz/generateResultImage';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { withWeeklyQuiz, mockStatus } from './weeklyQuiz.mocks';

// A plain-card stand-in for the modal shell so the full game flow — intro →
// 3-2-1 countdown → questions with live timer, instant feedback and background
// music → results — is clickable in isolation. In the app this same content
// renders inside the LazyModal overlay.
const PreviewGame = ({
  onRestart,
  forcePlayable,
}: {
  onRestart: () => void;
  forcePlayable: boolean;
}): React.ReactElement => {
  const { status } = useWeeklyQuizStatus();
  const quizId = status?.activeQuizId;
  const { quiz, isPending } = useWeeklyQuiz(quizId);
  const game = useWeeklyQuizGame(quiz);
  const audio = useWeeklyQuizAudio();
  const { hasPlayed, markPlayed, resetPlayed } = useWeeklyQuizPlayed(quizId);

  const { phase } = game;
  const { startMusic, stopMusic } = audio;
  const alreadyPlayed =
    !forcePlayable && (hasPlayed || !!status?.hasCompletedThisWeek);

  // Background music is lobby ambiance: plays on the intro + results, stops
  // during the countdown/questions (mirrors WeeklyQuizModal).
  useEffect(() => {
    if (
      phase === WeeklyQuizPhase.Intro ||
      phase === WeeklyQuizPhase.Results
    ) {
      startMusic();
    } else {
      stopMusic();
    }
  }, [phase, startMusic, stopMusic]);

  // Spend the attempt on start (mirrors modal).
  useEffect(() => {
    if (phase !== WeeklyQuizPhase.Intro) {
      markPlayed();
    }
  }, [phase, markPlayed]);

  // Preview-only: the close button clears the spent run and restarts from the
  // intro, so the quiz can be replayed without wiping storage by hand. (In the
  // real modal, close instead confirms and dismisses — a one-shot per week.)
  const handleRestart = (): void => {
    resetPlayed();
    onRestart();
  };

  const controls = (
    <WeeklyQuizSideControls
      layout="inline"
      level={audio.level}
      onCycleSound={audio.cycleLevel}
      onClose={handleRestart}
    />
  );

  return (
    // Mobile: break out of the decorator's padding so the surface is edge-to-
    // edge and fills the screen. Tablet+: the centered card returns.
    <div
      className={`force-dark -m-8 flex min-h-[100dvh] w-auto items-stretch justify-center gap-3 tablet:m-0 tablet:mx-auto tablet:min-h-0 tablet:w-full tablet:items-start ${
        phase === WeeklyQuizPhase.Intro
          ? 'tablet:max-w-[768px]'
          : 'tablet:max-w-[640px]'
      }`}
    >
      <WeeklyQuizSurface
        bare={phase === WeeklyQuizPhase.Results}
        showRays={
          phase !== WeeklyQuizPhase.Intro && phase !== WeeklyQuizPhase.Results
        }
        controls={controls}
        headerRight={
          phase === WeeklyQuizPhase.Intro && quiz ? (
            <WeeklyQuizDateChip
              startDate={quiz.startDate}
              endDate={quiz.endDate}
            />
          ) : undefined
        }
      >
        {phase === WeeklyQuizPhase.Intro && (
          <WeeklyQuizIntro
            quiz={quiz}
            isLoading={isPending}
            onStart={game.beginCountdown}
            alreadyPlayed={alreadyPlayed}
          />
        )}
        {phase === WeeklyQuizPhase.Countdown && (
          <WeeklyQuizCountdown
            onComplete={game.start}
            onTick={audio.playCountdownTick}
          />
        )}
        {phase === WeeklyQuizPhase.Question && (
          <WeeklyQuizQuestion game={game} audio={audio} />
        )}
        {phase === WeeklyQuizPhase.Results && game.result && quizId && (
          <WeeklyQuizResults
            quizId={quizId}
            result={game.result}
            audio={audio}
          />
        )}
      </WeeklyQuizSurface>
      {/* Desktop only: the external side column. On mobile the controls move
          inside the surface header (above the mascot). */}
      <div className="hidden tablet:flex">
        <WeeklyQuizSideControls
          level={audio.level}
          onCycleSound={audio.cycleLevel}
          onClose={handleRestart}
        />
      </div>
    </div>
  );
};

// Remounting PreviewGame on close resets the whole game (phase, timer, audio)
// back to the intro — the preview's "play again" affordance. `forcePlayable`
// (set once the user resets) unlocks the intro even in the already-played
// story, so replaying always works during testing.
const WeeklyQuizGamePreview = (): React.ReactElement => {
  const [resetKey, setResetKey] = useState(0);
  const [forcePlayable, setForcePlayable] = useState(false);
  return (
    <PreviewGame
      key={resetKey}
      forcePlayable={forcePlayable}
      onRestart={() => {
        setForcePlayable(true);
        setResetKey((k) => k + 1);
      }}
    />
  );
};

// Jumps straight to the results screen with a mock finished result, so the end
// screen can be reviewed without playing through the whole quiz.
const ResultsPreview = (): React.ReactElement => {
  const { status } = useWeeklyQuizStatus();
  const audio = useWeeklyQuizAudio();
  return (
    <div className="force-dark mx-auto flex w-full max-w-[640px] items-start justify-center gap-3">
      <WeeklyQuizSurface bare>
        <WeeklyQuizResults
          quizId={status?.activeQuizId ?? ''}
          result={{
            answers: [],
            correctCount: 4,
            totalQuestions: 10,
            timeMs: 104000,
          }}
          audio={audio}
        />
      </WeeklyQuizSurface>
    </div>
  );
};

// A gallery of every score level with its headline, one-liner and GIF, so the
// full set of results personas can be reviewed at a glance.
const ScoreTiersGallery = (): React.ReactElement => (
  <div className="force-dark mx-auto grid w-full max-w-[900px] grid-cols-1 gap-4 p-6 tablet:grid-cols-2">
    {WEEKLY_QUIZ_TIERS.map((tier, index) => {
      const low = Math.round(tier.minRatio * 10);
      const high =
        index === 0
          ? 10
          : Math.round(WEEKLY_QUIZ_TIERS[index - 1].minRatio * 10) - 1;
      const range = low === high ? `${low}/10` : `${low}–${high}/10`;
      return (
        <div
          key={tier.title}
          className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
        >
          <img
            src={tier.gif}
            alt=""
            className="aspect-[4/3] w-full rounded-12 object-cover"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-text-primary typo-title3">
              {tier.title}
            </span>
            <span className="shrink-0 rounded-8 bg-surface-float px-2 py-1 font-bold tabular-nums text-text-secondary typo-footnote">
              {range}
            </span>
          </div>
          <span className="text-text-secondary typo-callout">
            {tier.message}
          </span>
        </div>
      );
    })}
  </div>
);

const MASCOT = '/logos/weekly-quiz-logo.png';
const CABBAGE_GRADIENT = {
  background:
    'linear-gradient(140deg, var(--theme-accent-cabbage-default), var(--theme-accent-onion-default))',
};

// A faint stand-in for surrounding feed cards, to show placement in context.
const SkeletonCard = (): React.ReactElement => (
  <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 opacity-40">
    <div className="h-24 w-full rounded-12 bg-surface-hover" />
    <div className="h-3 w-3/4 rounded-full bg-surface-hover" />
    <div className="h-3 w-1/2 rounded-full bg-surface-hover" />
  </div>
);

// Wraps each concept with a numbered label + a short note on the approach.
const PromptFrame = ({
  n,
  title,
  note,
  children,
}: {
  n: number;
  title: string;
  note: string;
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex items-baseline gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-8 bg-surface-float font-bold text-text-primary typo-footnote">
        {n}
      </span>
      <span className="font-bold text-text-primary typo-callout">{title}</span>
      <span className="text-text-tertiary typo-footnote">{note}</span>
    </div>
    {children}
  </div>
);

// Six distinct ways to surface the quiz in the feed — each with a clear press
// target. Exploration mockups (not wired to the modal); pick one to productize.
const FeedPromptsGallery = (): React.ReactElement => (
  <div className="force-dark min-h-screen w-full bg-background-default">
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-10 p-6">
    {/* 1 — Inline hero banner */}
    <PromptFrame
      n={1}
      title="Inline hero banner"
      note="full-width, sits between feed cards"
    >
      <div className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <img src={MASCOT} alt="" className="h-16 w-16 shrink-0 object-contain" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-body">
            The Weekly Tech News Quiz
          </span>
          <span className="text-text-tertiary typo-footnote">
            10 questions on this week&apos;s biggest tech news.
          </span>
        </div>
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Medium}
        >
          Play now
        </Button>
      </div>
    </PromptFrame>

    {/* 2 — Slim pill strip */}
    <PromptFrame
      n={2}
      title="Slim pill strip"
      note="low-intrusion, one line between posts"
    >
      <div className="flex items-center gap-3 rounded-14 border border-border-subtlest-tertiary bg-surface-float px-3 py-2">
        <img src={MASCOT} alt="" className="h-8 w-8 shrink-0 object-contain" />
        <span className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
          <b>Weekly Tech News Quiz</b>
          <span className="text-text-tertiary"> · 10 questions · ends Sun</span>
        </span>
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Small}
        >
          Play
        </Button>
      </div>
    </PromptFrame>

    {/* 3 — Post-card tile */}
    <PromptFrame
      n={3}
      title="Post-card tile"
      note="blends into the grid like a feed card"
    >
      <div className="w-full max-w-[260px] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
        <div
          className="flex h-32 items-center justify-center"
          style={CABBAGE_GRADIENT}
        >
          <img src={MASCOT} alt="" className="h-24 w-24 object-contain" />
        </div>
        <div className="flex flex-col gap-2 p-3">
          <span className="font-bold text-text-primary typo-callout">
            Weekly Tech News Quiz
          </span>
          <span className="text-text-tertiary typo-footnote">
            Test your attention to detail.
          </span>
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Small}
            className="w-full"
          >
            Start quiz
          </Button>
        </div>
      </div>
    </PromptFrame>

    {/* 4 — Floating action button over the feed */}
    <PromptFrame
      n={4}
      title="Floating button"
      note="pulses over the feed, always reachable"
    >
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
        <div className="flex flex-col gap-4">
          <SkeletonCard />
        </div>
        <div className="absolute bottom-4 right-4">
          <span className="absolute inset-0 rounded-16 bg-accent-cabbage-default opacity-40 motion-safe:animate-ping" />
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Large}
            className="relative"
            icon={<img src={MASCOT} alt="" className="h-6 w-6 object-contain" />}
          >
            Play the quiz
          </Button>
        </div>
      </div>
    </PromptFrame>

    {/* 5 — Competitive ring teaser */}
    <PromptFrame
      n={5}
      title="Competitive teaser"
      note="leans on rank / leaderboard FOMO"
    >
      <div className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 font-bold text-text-primary typo-callout"
          style={{ borderColor: 'var(--theme-accent-cabbage-default)' }}
        >
          ?/10
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-body">
            You haven&apos;t played this week
          </span>
          <span className="text-text-tertiary typo-footnote">
            See how you stack up against the leaderboard.
          </span>
        </div>
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Medium}
        >
          Take the quiz
        </Button>
      </div>
    </PromptFrame>

    {/* 6 — Countdown urgency strip */}
    <PromptFrame
      n={6}
      title="Countdown strip"
      note="time-boxed urgency with a progress bar"
    >
      <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <div className="flex items-center gap-2">
          <TimerIcon className="text-accent-bacon-default" />
          <span className="font-bold text-text-primary typo-footnote">
            This week&apos;s quiz ends in 1d 6h
          </span>
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Small}
            className="ml-auto"
          >
            Play now
          </Button>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
          <div className="h-full w-2/3 rounded-full" style={CABBAGE_GRADIENT} />
        </div>
      </div>
    </PromptFrame>

    {/* 7 — Notification-page item */}
    <PromptFrame
      n={7}
      title="Notification item"
      note="lands in the notifications page / inbox"
    >
      <div className="flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <div className="relative shrink-0">
          <img
            src={MASCOT}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background-default bg-accent-cabbage-default" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-text-primary typo-footnote">
            <b>The Weekly Tech News Quiz is live.</b>
            <span className="text-text-secondary">
              {' '}
              10 questions on this week&apos;s biggest stories — can you ace it?
            </span>
          </span>
          <span className="text-text-tertiary typo-caption1">2h ago</span>
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Small}
            className="mt-1 self-start"
          >
            Play now
          </Button>
        </div>
      </div>
    </PromptFrame>
    </div>
  </div>
);

// Sample result used to render the downloadable share-image variants.
const SHARE_SAMPLE = {
  name: 'Dev Dana',
  imageUrl: fallbackImages.avatar,
  title: 'Autocomplete Hero',
  correctCount: 6,
  totalQuestions: 10,
  percentile: 60,
  rank: 42,
  gifUrl: WEEKLY_QUIZ_TIERS.find((tier) => tier.minRatio === 0.6)?.gif,
  logoUrl: '/logos/weekly-quiz-logo.png',
  brandLogoUrl: '/android-chrome-512x512.png',
};
const SHARE_VARIANT_LABELS = [
  '1 · GIF poster',
  '2 · Centered card',
  '3 · Split',
  '4 · Ticket stub',
];

// Renders all four downloadable share-image layouts (canvas → PNG) side by side
// so the best one can be picked.
const ShareImageVariants = (): React.ReactElement => {
  const [urls, setUrls] = useState<Array<string | null>>([]);
  useEffect(() => {
    let active = true;
    Promise.all(
      ([1, 2, 3, 4] as const).map((variant) =>
        createWeeklyQuizResultImage(SHARE_SAMPLE, variant),
      ),
    ).then((result) => {
      if (active) {
        setUrls(result);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="force-dark min-h-screen w-full bg-background-default p-6">
      <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-6 tablet:grid-cols-2">
        {SHARE_VARIANT_LABELS.map((label, index) => (
          <div key={label} className="flex flex-col gap-2">
            <span className="font-bold text-text-primary typo-callout">
              {label}
            </span>
            {urls[index] ? (
              <img
                src={urls[index] as string}
                alt={label}
                className="w-full rounded-16 border border-border-subtlest-tertiary"
              />
            ) : (
              <div className="flex h-96 items-center justify-center rounded-16 border border-border-subtlest-tertiary text-text-tertiary typo-footnote">
                Rendering…
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// One generic social card per level — the simple image a shared link previews.
const rangeLabelFor = (index: number): string => {
  const low = Math.round(WEEKLY_QUIZ_TIERS[index].minRatio * 10);
  const high =
    index === 0
      ? 10
      : Math.round(WEEKLY_QUIZ_TIERS[index - 1].minRatio * 10) - 1;
  return low === high ? `${low}/10` : `${low}–${high}/10`;
};

const OgScoreCards = (): React.ReactElement => {
  const [urls, setUrls] = useState<Array<string | null>>([]);
  useEffect(() => {
    let active = true;
    Promise.all(
      WEEKLY_QUIZ_TIERS.map((tier, index) =>
        createWeeklyQuizOgImage({
          title: tier.title,
          message: tier.message,
          rangeLabel: rangeLabelFor(index),
          gifUrl: tier.gif,
        }),
      ),
    ).then((result) => {
      if (active) {
        setUrls(result);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="force-dark min-h-screen w-full bg-background-default p-6">
      <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-6 tablet:grid-cols-2">
        {WEEKLY_QUIZ_TIERS.map((tier, index) => (
          <div key={tier.title} className="flex flex-col gap-2">
            <span className="font-bold text-text-primary typo-callout">
              {rangeLabelFor(index)} · {tier.title}
            </span>
            {urls[index] ? (
              <img
                src={urls[index] as string}
                alt={tier.title}
                className="w-full rounded-16 border border-border-subtlest-tertiary"
              />
            ) : (
              <div className="flex h-52 items-center justify-center rounded-16 border border-border-subtlest-tertiary text-text-tertiary typo-footnote">
                Rendering…
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Mobile welcome-screen layout concepts -------------------------------

const SourceDots = (): React.ReactElement => (
  <div className="flex items-center gap-1">
    {['V', 'a', 'A', 'VB', 'IQ'].map((source) => (
      <span
        key={source}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-float text-text-tertiary typo-caption2"
      >
        {source}
      </span>
    ))}
    <span className="ml-0.5 text-text-tertiary typo-caption2">+7</span>
  </div>
);

const DatePill = (): React.ReactElement => (
  <span className="rounded-8 bg-surface-float px-2 py-0.5 font-bold text-text-secondary typo-caption1">
    Jul 20–26
  </span>
);

const Phone = ({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="flex flex-col gap-2">
    <span className="font-bold text-text-primary typo-callout">{label}</span>
    <span className="text-text-tertiary typo-footnote">{note}</span>
    <div className="relative h-[720px] w-[360px] overflow-hidden rounded-[40px] border-4 border-border-subtlest-tertiary bg-background-default">
      {children}
    </div>
  </div>
);

// A — Stacked: everything centered in a single scroll, mascot leading.
const MobileLayoutA = (): React.ReactElement => (
  <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
    <div className="flex items-center justify-between">
      <WeeklyQuizLogo />
      <DatePill />
    </div>
    <img src={MASCOT} alt="" className="mx-auto h-44 w-44 object-contain" />
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="font-bold text-text-primary typo-title2">
        The Tech News Quiz
      </span>
      <span className="text-text-secondary typo-footnote">
        This week: rogue models, record API bills, and a few very expensive
        bugs.
      </span>
    </div>
    <span className="text-center text-text-tertiary typo-caption1">
      50 stories · 12 sources · 10 questions
    </span>
    <div className="flex justify-center">
      <SourceDots />
    </div>
    <Button
      variant={ButtonVariant.Primary}
      color={ButtonColor.Cabbage}
      size={ButtonSize.XLarge}
      className="mt-1 w-full"
    >
      Start playing
    </Button>
    <div className="flex justify-center gap-6">
      <span className="text-text-tertiary typo-footnote">Share</span>
      <span className="text-text-tertiary typo-footnote">Weekly reminder</span>
    </div>
  </div>
);

// B — CTA-first: pitch up top, the Start button lands above the fold.
const MobileLayoutB = (): React.ReactElement => (
  <div className="flex h-full flex-col gap-5 p-5">
    <div className="flex items-center justify-between">
      <WeeklyQuizLogo />
      <DatePill />
    </div>
    <div className="flex items-center gap-3">
      <img src={MASCOT} alt="" className="h-16 w-16 shrink-0 object-contain" />
      <span className="font-bold text-text-primary typo-title2">
        The Tech News Quiz
      </span>
    </div>
    <span className="text-text-secondary typo-callout">
      10 quick questions on this week&apos;s biggest tech news. Speed and
      knowledge both count.
    </span>
    <Button
      variant={ButtonVariant.Primary}
      color={ButtonColor.Cabbage}
      size={ButtonSize.XLarge}
      className="w-full"
    >
      Start playing
    </Button>
    <div className="mt-auto flex flex-col gap-3">
      <span className="text-text-tertiary typo-caption1">
        50 stories · 12 sources
      </span>
      <SourceDots />
    </div>
  </div>
);

// C — Immersive: full-bleed mascot hero, content, a sticky Start at the bottom.
const MobileLayoutC = (): React.ReactElement => (
  <div className="relative h-full">
    <div className="relative flex h-56 items-center justify-center overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 80% at 50% 40%, var(--theme-accent-cabbage-default), transparent 70%)',
          opacity: 0.5,
        }}
      />
      <img src={MASCOT} alt="" className="relative h-44 w-44 object-contain" />
      <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
        <WeeklyQuizLogo />
        <DatePill />
      </div>
    </div>
    <div className="flex flex-col gap-3 p-5">
      <span className="font-bold text-text-primary typo-title2">
        The Tech News Quiz
      </span>
      <span className="text-text-secondary typo-footnote">
        This week: rogue models, record API bills, and a few very expensive
        bugs. Let&apos;s test your attention to detail.
      </span>
      <span className="text-text-tertiary typo-caption1">
        50 stories · 12 sources · 10 questions
      </span>
      <SourceDots />
    </div>
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-border-subtlest-tertiary bg-background-default p-4">
      <Button
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        size={ButtonSize.XLarge}
        className="w-full"
      >
        Start playing
      </Button>
      <div className="flex justify-center gap-6">
        <span className="text-text-tertiary typo-footnote">Share</span>
        <span className="text-text-tertiary typo-footnote">Reminder</span>
      </div>
    </div>
  </div>
);

const MobileIntroLayouts = (): React.ReactElement => (
  <div className="force-dark min-h-screen w-full bg-background-default p-6">
    <div className="no-scrollbar flex gap-8 overflow-x-auto">
      <Phone label="A · Stacked" note="mascot-led, single scroll">
        <MobileLayoutA />
      </Phone>
      <Phone label="B · CTA-first" note="Start lands above the fold">
        <MobileLayoutB />
      </Phone>
      <Phone label="C · Immersive" note="hero + sticky Start bar">
        <MobileLayoutC />
      </Phone>
    </div>
  </div>
);

// The purple sweep used for the countdown number and the progress bar.
const PURPLE_FILL = {
  background:
    'linear-gradient(90deg, var(--theme-accent-onion-default), var(--theme-accent-cabbage-default))',
};

// Countdown — matches Layout A's top bar, big purple number centered.
const MobileCountdown = (): React.ReactElement => (
  <div className="flex h-full flex-col p-5">
    <div className="flex items-center justify-between">
      <WeeklyQuizLogo />
      <DatePill />
    </div>
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <span className="font-bold uppercase tracking-widest text-text-tertiary typo-footnote">
        Get ready…
      </span>
      <span
        className="font-bold typo-giga1"
        style={{ color: 'var(--theme-accent-cabbage-default)' }}
      >
        3
      </span>
      <span className="max-w-[260px] text-text-tertiary typo-callout">
        Think fast and answer quickly — speed and knowledge both count.
      </span>
    </div>
  </div>
);

const QUESTION_OPTIONS = [
  'To copy its own weights out',
  'To steal benchmark answers so it would score higher',
  'To delete evidence of a failed eval run',
  'To spin up more compute for itself',
];

// Question — running header, progress bar, prompt, four stacked answer tiles.
const MobileQuestion = (): React.ReactElement => (
  <div className="flex h-full flex-col gap-4 p-5">
    <div className="flex items-center justify-between border-b border-border-subtlest-tertiary pb-3">
      <WeeklyQuizLogo />
    </div>
    <div className="flex items-center justify-between">
      <span className="font-bold text-text-tertiary typo-footnote">
        Question 1 of 10
      </span>
      <span className="font-bold tabular-nums text-text-primary typo-callout">
        0:12
      </span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-8 bg-surface-hover">
      <div className="h-full w-[10%] rounded-8" style={PURPLE_FILL} />
    </div>
    <span className="font-bold text-text-primary typo-title3">
      OpenAI&apos;s pre-release GPT-5.6 Sol escaped its research sandbox and
      hacked Hugging Face. Why did it do it?
    </span>
    <div className="flex flex-col gap-3">
      {QUESTION_OPTIONS.map((option, index) => (
        <div
          key={option}
          className="flex items-center gap-3 rounded-16 border-2 border-border-subtlest-tertiary p-3.5 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-10 bg-surface-float font-bold text-text-primary typo-callout">
            {['A', 'B', 'C', 'D'][index]}
          </span>
          <span className="min-w-0 flex-1 text-text-primary typo-callout">
            {option}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const LEADERBOARD_ROWS = [
  { rank: 1, name: 'Bobby Iliev', score: '10/10', time: '0:34', you: false },
  { rank: 2, name: 'Randy', score: '10/10', time: '0:36', you: false },
  { rank: 3, name: 'Ole-Martin', score: '9/10', time: '0:39', you: false },
  { rank: 42, name: 'Dev Dana', score: '6/10', time: '1:02', you: true },
];

// Final (results) — scrolls: brand header, verdict, GIF, share, leaderboard.
const MobileResults = (): React.ReactElement => (
  <div className="no-scrollbar flex h-full flex-col gap-4 overflow-y-auto p-5">
    {/* Chunk 1 — your result: brand header, verdict, GIF and share row. */}
    <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-2">
      <div className="-mx-4 -mt-4 border-b border-border-subtlest-tertiary px-4 py-3">
        <WeeklyQuizLogo />
      </div>
      <div className="flex items-center gap-4">
        <div
          className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-4"
          style={{ borderColor: 'var(--theme-accent-cabbage-default)' }}
        >
          <span className="font-bold text-text-primary typo-title3">4/10</span>
          <span className="text-text-tertiary typo-caption2">Correct</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-bold text-text-primary typo-title3">
            Tab Spammer
          </span>
          <span className="text-text-secondary typo-footnote">
            You scored better than 40% of players.
          </span>
          <span className="mt-0.5 text-text-secondary typo-footnote">
            {WEEKLY_QUIZ_TIERS[3].message}
          </span>
        </div>
      </div>
      <img
        src={WEEKLY_QUIZ_TIERS[3].gif}
        alt=""
        className="aspect-video w-full rounded-16 object-cover"
      />
      {/* Share row, with the same "Had fun?" sticker as the web screen. */}
      <section className="relative flex flex-col">
        <span
          aria-hidden
          className={`z-10 absolute -top-9 right-1 flex h-20 w-20 flex-col items-center justify-center rounded-full text-center font-bold uppercase leading-tight tracking-wide typo-caption2 ${quizStyles.shareSticker}`}
        >
          Had fun? Share it!
        </span>
        <span className="font-bold text-text-primary typo-callout">
          Share your result
        </span>
        <div className="no-scrollbar mt-4 flex gap-1 overflow-x-auto">
          <SocialShareButton
            icon={<DownloadIcon />}
            label="Download"
            variant={ButtonVariant.Primary}
          />
          <SocialShareButton
            icon={<TwitterIcon />}
            label="X"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Twitter}
          />
          <SocialShareButton
            icon={<WhatsappIcon />}
            label="WhatsApp"
            variant={ButtonVariant.Primary}
            color={ButtonColor.WhatsApp}
          />
          <SocialShareButton
            icon={<FacebookIcon />}
            label="Facebook"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Facebook}
          />
          <SocialShareButton
            icon={<RedditIcon />}
            label="Reddit"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Reddit}
          />
          <SocialShareButton
            icon={<LinkedInIcon />}
            label="LinkedIn"
            variant={ButtonVariant.Primary}
            color={ButtonColor.LinkedIn}
          />
        </div>
      </section>
    </div>

    {/* Chunk 2 — keep playing: challenge, reminder and the leaderboard. */}
    <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-2">
      {/* Challenge a friend — share the quiz link. */}
      <div
        className={`flex flex-col gap-2 rounded-16 p-4 text-left ${quizStyles.glass}`}
      >
        <span className="font-bold text-text-primary typo-callout">
          Challenge a friend ⚔️
        </span>
        <span className="text-text-tertiary typo-footnote">
          Send this link so they can take this week&apos;s quiz and try to beat
          your score.
        </span>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value="https://daily.dev/quiz/weekly-tech-news"
            aria-label="Quiz link"
            className="min-w-0 flex-1 rounded-10 bg-background-default px-3 py-2 text-text-primary typo-footnote"
          />
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={<CopyIcon />}
          >
            Copy
          </Button>
        </div>
      </div>

      {/* Weekly reminder. */}
      <button type="button" className={quizStyles.resultAction}>
        <BellIcon size={IconSize.XSmall} />
        Set weekly reminder
      </button>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-text-primary typo-callout">
          🏆 Leaderboard
        </span>
        {LEADERBOARD_ROWS.map((row) => (
          <div
            key={row.rank}
            className={`flex items-center gap-2 rounded-12 px-2 py-1.5 ${
              row.you ? quizStyles.viewerHighlight : ''
            }`}
          >
            <span className="w-5 text-text-secondary typo-footnote">
              {row.rank}
            </span>
            <span className="h-6 w-6 shrink-0 rounded-full bg-surface-hover" />
            <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
              {row.name}
            </span>
            <span className="font-bold tabular-nums text-text-primary typo-footnote">
              {row.score}
            </span>
            <span className="w-9 text-right tabular-nums text-text-secondary typo-caption1">
              {row.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MobileScreens = (): React.ReactElement => (
  <div className="force-dark min-h-screen w-full bg-background-default p-6">
    <div className="no-scrollbar flex gap-8 overflow-x-auto">
      <Phone label="Countdown" note="get ready, purple count-in">
        <MobileCountdown />
      </Phone>
      <Phone label="Question" note="timer, progress, four tiles">
        <MobileQuestion />
      </Phone>
      <Phone label="Final" note="verdict, GIF, share, leaderboard">
        <MobileResults />
      </Phone>
    </div>
  </div>
);

const meta: Meta<typeof WeeklyQuizGamePreview> = {
  title: 'Features/WeeklyQuiz/Game',
  component: WeeklyQuizGamePreview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The weekly tech-news quiz: a welcome intro with the scoreboard, a stepped question flow (four options, instant green/red feedback, a running total timer that pauses while feedback shows), and a celebratory results screen. Question content is the committed sample set.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof WeeklyQuizGamePreview>;

// Signed-in: the scoreboard is populated and the results screen shows the rank.
export const LoggedIn: Story = {
  decorators: [withWeeklyQuiz({ loggedIn: true })],
};

// Anonymous: anyone can play, but the scoreboard and rank stay locked behind a
// login prompt on both the intro and results screens.
export const Anonymous: Story = {
  decorators: [withWeeklyQuiz({ loggedIn: false })],
};

// Returning player who already played this week — the intro leads with the
// scoreboard so they can see where they landed.
export const AlreadyPlayed: Story = {
  decorators: [
    withWeeklyQuiz({
      loggedIn: true,
      status: mockStatus({ hasCompletedThisWeek: true }),
    }),
  ],
};

// The results (end) screen on its own, with a mock finished result — so it can
// be reviewed without playing through the quiz.
export const Results: Story = {
  render: () => <ResultsPreview />,
  decorators: [withWeeklyQuiz({ loggedIn: true })],
};

// Every score level side by side — headline, one-liner and GIF per tier.
export const ScoreTiers: Story = {
  name: 'Score levels & GIFs',
  render: () => <ScoreTiersGallery />,
};

// Ways to surface the quiz (feed + notifications), each with a press target.
export const FeedPrompts: Story = {
  name: 'Entry-point concepts',
  render: () => <FeedPromptsGallery />,
};

// The four downloadable share-image layouts, rendered as PNGs to compare.
export const ShareImages: Story = {
  name: 'Share image (4 variants)',
  render: () => <ShareImageVariants />,
};

// Per-score Open Graph cards (0..10) — the social link-preview images.
export const OgCards: Story = {
  name: 'Social cards (per score)',
  render: () => <OgScoreCards />,
};

// Three welcome-screen layout concepts for mobile.
export const MobileIntro: Story = {
  name: 'Mobile welcome (3 layouts)',
  render: () => <MobileIntroLayouts />,
};

// Mobile countdown, question and final screens in the chosen (A) style.
export const MobileFlow: Story = {
  name: 'Mobile screens (countdown / question / final)',
  render: () => <MobileScreens />,
};
