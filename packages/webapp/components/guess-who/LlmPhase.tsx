import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import type { GuessWhoQuizQAInput } from '@dailydotdev/shared/src/graphql/guessWhoQuiz';
import { useGuessWhoQuiz } from './useGuessWhoQuiz';
import { LlmQuestionCard } from './LlmQuestionCard';
import { PersonaResult } from './PersonaResult';

interface LlmPhaseProps {
  initialHistory: GuessWhoQuizQAInput[];
  onRestart: () => void;
}

export const LlmPhase = ({
  initialHistory,
  onRestart,
}: LlmPhaseProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { nextQuestion, persona, isPending, error, submitAnswer, retry } =
    useGuessWhoQuiz(initialHistory);

  const onSelectAnswer = useCallback(
    (question: string, answer: string) => {
      logEvent({
        event_name: LogEvent.AnswerGuessWhoLlmQuestion,
        origin: Origin.GuessWhoQuiz,
        extra: JSON.stringify({ answer }),
      });
      submitAnswer(question, answer);
    },
    [logEvent, submitAnswer],
  );

  if (persona) {
    return <PersonaResult persona={persona} onRestart={onRestart} />;
  }

  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-[36rem] flex-col items-center gap-4 rounded-16 border border-border-subtlest-secondary bg-background-subtle p-6 text-center laptop:p-8"
      >
        <h2 className="font-bold text-text-primary typo-title3">
          Something glitched
        </h2>
        <p className="text-text-tertiary typo-body">
          We couldn&apos;t reach our developer-vibes oracle. Try again?
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Medium}
            onClick={retry}
          >
            Try again
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={onRestart}
          >
            Start over
          </Button>
        </div>
      </motion.section>
    );
  }

  if (nextQuestion && !isPending) {
    return (
      <LlmQuestionCard
        question={nextQuestion.question}
        options={nextQuestion.options}
        onSelect={(answer) => onSelectAnswer(nextQuestion.question, answer)}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex w-full max-w-[36rem] flex-col items-center gap-4 rounded-16 border border-border-subtlest-secondary bg-background-subtle p-6 laptop:p-8"
    >
      <Loader />
      <p className="text-text-tertiary typo-body">
        Cooking up your developer persona…
      </p>
    </motion.section>
  );
};
