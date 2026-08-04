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
import { WeeklyQuizSurface } from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizSurface';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons';
import { createWeeklyQuizResultImage } from '@dailydotdev/shared/src/features/weeklyQuiz/generateResultImage';
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

  return (
    <div
      className={`force-dark mx-auto flex w-full items-start justify-center gap-3 ${
        phase === WeeklyQuizPhase.Intro ? 'max-w-[768px]' : 'max-w-[640px]'
      }`}
    >
      <WeeklyQuizSurface
        showRays={
          phase !== WeeklyQuizPhase.Intro && phase !== WeeklyQuizPhase.Results
        }
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
      <WeeklyQuizSideControls
        level={audio.level}
        onCycleSound={audio.cycleLevel}
        onClose={handleRestart}
      />
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
      <WeeklyQuizSurface showRays={false}>
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
