import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { WeeklyQuizTimer } from './WeeklyQuizTimer';
import { WeeklyQuizAnswerOption } from './WeeklyQuizAnswerOption';
import type { UseWeeklyQuizGame } from '../hooks/useWeeklyQuizGame';
import type { UseWeeklyQuizAudio } from '../hooks/useWeeklyQuizAudio';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizQuestionProps {
  game: UseWeeklyQuizGame;
  audio?: UseWeeklyQuizAudio;
}

// How long the correct/incorrect reveal stays before auto-advancing.
const FEEDBACK_MS = 1000;

// The question's top bar — "Question X of Y", the running timer and the
// progress bar. Rendered on the shared surface header line (logo pushed to the
// far right) rather than in the question body.
export const WeeklyQuizQuestionHeader = ({
  game,
}: {
  game: UseWeeklyQuizGame;
}): ReactElement => {
  const { questionNumber, totalQuestions, elapsedMs } = game;
  const progress =
    totalQuestions === 0 ? 0 : (questionNumber / totalQuestions) * 100;
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Typography
          type={TypographyType.Footnote}
          bold
          className="!text-text-tertiary"
        >
          Question {questionNumber} of {totalQuestions}
        </Typography>
        <WeeklyQuizTimer elapsedMs={elapsedMs} isPaused={false} />
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-8 bg-surface-hover"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuenow={questionNumber}
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
      >
        <div
          className={classNames(
            'h-full rounded-8 transition-[width] duration-500 ease-out',
            styles.progressFill,
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// One question screen: running timer + progress up top, the prompt and four
// answer tiles. After an answer is picked the tiles reveal correct/incorrect
// and the quiz auto-advances after a short pause — no Next button. Audio: a
// click on answer and a switch sound on advance.
export const WeeklyQuizQuestion = ({
  game,
  audio,
}: WeeklyQuizQuestionProps): ReactElement | null => {
  const { question, selectedOptionId, isAnswered, answer, next } = game;
  // Destructure the stable callbacks so effects don't thrash on the audio
  // object's per-render identity.
  const { playAnswer, playCorrect, playSwitch } = audio ?? {};

  const handleSelect = (optionId: string): void => {
    // Idempotent: pointer-down already selected; ignore the trailing click.
    if (isAnswered) {
      return;
    }
    // Correct pick gets the celebratory "treasure" sound; otherwise the click.
    const picked = question?.options.find((option) => option.id === optionId);
    if (picked?.isCorrect) {
      playCorrect?.();
    } else {
      playAnswer?.();
    }
    answer(optionId);
  };

  // Hold the reveal for a beat, then move on (to the next question or results),
  // playing the switch sound as we transition.
  useEffect(() => {
    if (!isAnswered) {
      return undefined;
    }
    const timeout = window.setTimeout(() => {
      playSwitch?.();
      next();
    }, FEEDBACK_MS);
    return () => window.clearTimeout(timeout);
  }, [isAnswered, next, playSwitch]);

  if (!question) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div
        key={question.id}
        className="flex animate-composer-in flex-col gap-5"
      >
        <Typography
          type={TypographyType.Title3}
          bold
          tag={TypographyTag.H2}
          className="!text-text-primary"
        >
          {question.prompt}
        </Typography>

        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => (
            <WeeklyQuizAnswerOption
              key={option.id}
              option={option}
              index={index}
              isSelected={option.id === selectedOptionId}
              isAnswered={isAnswered}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
