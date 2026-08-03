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
import { WeeklyQuizIntro } from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizIntro';
import { WeeklyQuizCountdown } from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizCountdown';
import { WeeklyQuizQuestion } from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizQuestion';
import { WeeklyQuizResults } from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizResults';
import { WeeklyQuizSideControls } from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizSideControls';
import styles from '@dailydotdev/shared/src/features/weeklyQuiz/WeeklyQuiz.module.css';
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
    <div className="force-dark mx-auto flex w-full max-w-[52rem] items-start justify-center gap-3">
      <div className={`relative flex-1 ${styles.surface}`}>
        <span className={styles.rays} aria-hidden />
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
            onBackToMain={game.backToIntro}
          />
        )}
      </div>
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
    <div className="force-dark mx-auto flex w-full max-w-[52rem] items-start justify-center gap-3">
      <div className={`relative flex-1 ${styles.surface}`}>
        <span className={styles.rays} aria-hidden />
        <WeeklyQuizResults
          quizId={status?.activeQuizId ?? ''}
          result={{
            answers: [],
            correctCount: 4,
            totalQuestions: 10,
            timeMs: 104000,
          }}
          audio={audio}
          onBackToMain={() => undefined}
        />
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
