import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { DailyDjinnFigure } from './DailyDjinnFigure';
import { DailyDjinnLanding } from './DailyDjinnLanding';
import { ResultPlaceholder } from './ResultPlaceholder';
import { ThemedQuestion } from './ThemedQuestion';
import {
  FIRST_QUESTION_ID,
  TOTAL_VISIBLE_STEPS,
  getNextQuestionId,
  questions,
} from './questions';

type Phase = 'landing' | 'quiz';

export const GuessWhoQuiz = (): ReactElement => {
  const [phase, setPhase] = useState<Phase>('landing');
  const [currentId, setCurrentId] = useState<string>(FIRST_QUESTION_ID);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const reset = useCallback(() => {
    setPhase('landing');
    setCurrentId(FIRST_QUESTION_ID);
    setAnswers({});
    setHistory([]);
    setIsComplete(false);
  }, []);

  const handleStart = useCallback(() => {
    setPhase('quiz');
  }, []);

  const handleSelect = useCallback(
    (optionId: string) => {
      const question = questions[currentId];
      if (!question) {
        throw new Error(`Unknown question id "${currentId}"`);
      }
      // TODO: log analytics event for question answered (useLogContext)
      const nextId = getNextQuestionId(question, optionId);
      setAnswers((prev) => ({ ...prev, [currentId]: optionId }));

      if (!nextId) {
        setIsComplete(true);
        return;
      }

      setHistory((prev) => [...prev, currentId]);
      setCurrentId(nextId);
    },
    [currentId],
  );

  const handleBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const next = prev.slice(0, -1);
      const previousId = prev[prev.length - 1];
      setCurrentId(previousId);
      setIsComplete(false);
      return next;
    });
  }, []);

  const renderRightColumn = (): ReactElement | null => {
    if (phase === 'landing') {
      return <DailyDjinnLanding key="landing" onStart={handleStart} />;
    }

    if (isComplete) {
      return (
        <ResultPlaceholder key="result" answers={answers} onRestart={reset} />
      );
    }

    const currentQuestion = questions[currentId];
    if (!currentQuestion) {
      throw new Error(`Unknown question id "${currentId}"`);
    }

    return (
      <ThemedQuestion
        key={currentQuestion.id}
        question={currentQuestion}
        selectedOptionId={answers[currentId]}
        step={history.length + 1}
        totalSteps={TOTAL_VISIBLE_STEPS}
        onSelect={handleSelect}
        onBack={history.length > 0 ? handleBack : undefined}
      />
    );
  };

  const isQuiz = phase === 'quiz';

  return (
    <motion.div
      layout
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={classNames(
        'relative flex w-full',
        isQuiz
          ? 'max-w-[64rem] flex-col items-center gap-10 laptop:flex-row laptop:items-center laptop:gap-12'
          : 'max-w-[36rem] flex-col items-center gap-8',
      )}
    >
      <DailyDjinnFigure compact={isQuiz} />
      <div className="z-10 relative flex w-full flex-1 flex-col">
        <AnimatePresence mode="wait">{renderRightColumn()}</AnimatePresence>
      </div>
    </motion.div>
  );
};
