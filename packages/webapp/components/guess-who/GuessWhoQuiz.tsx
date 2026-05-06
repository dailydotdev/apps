import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { QuestionCard } from './QuestionCard';
import { ResultPlaceholder } from './ResultPlaceholder';
import {
  FIRST_QUESTION_ID,
  TOTAL_VISIBLE_STEPS,
  getNextQuestionId,
  questions,
} from './questions';

export const GuessWhoQuiz = (): ReactElement => {
  const [currentId, setCurrentId] = useState<string>(FIRST_QUESTION_ID);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const reset = useCallback(() => {
    setCurrentId(FIRST_QUESTION_ID);
    setAnswers({});
    setHistory([]);
    setIsComplete(false);
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

  if (isComplete) {
    return <ResultPlaceholder answers={answers} onRestart={reset} />;
  }

  const currentQuestion = questions[currentId];
  if (!currentQuestion) {
    throw new Error(`Unknown question id "${currentId}"`);
  }

  return (
    <AnimatePresence mode="wait">
      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        selectedOptionId={answers[currentId]}
        step={history.length + 1}
        totalSteps={TOTAL_VISIBLE_STEPS}
        onSelect={handleSelect}
        onBack={history.length > 0 ? handleBack : undefined}
      />
    </AnimatePresence>
  );
};
