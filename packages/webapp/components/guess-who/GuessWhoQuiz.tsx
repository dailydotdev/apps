import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import type { GuessWhoQuizQAInput } from '@dailydotdev/shared/src/graphql/guessWhoQuiz';
import { LlmPhase } from './LlmPhase';
import { QuestionCard } from './QuestionCard';
import {
  FIRST_QUESTION_ID,
  TOTAL_VISIBLE_STEPS,
  getNextQuestionId,
  questions,
} from './questions';

const buildInitialHistory = (
  orderedQuestionIds: string[],
  answers: Record<string, string>,
): GuessWhoQuizQAInput[] =>
  orderedQuestionIds
    .map((qid) => {
      const question = questions[qid];
      const optionId = answers[qid];
      const option = question?.options.find((opt) => opt.id === optionId);
      if (!question || !option) {
        return null;
      }
      return { question: question.prompt, answer: option.label };
    })
    .filter((entry): entry is GuessWhoQuizQAInput => entry !== null);

export const GuessWhoQuiz = (): ReactElement => {
  const { logEvent } = useLogContext();
  const [currentId, setCurrentId] = useState<string>(FIRST_QUESTION_ID);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const didLogStart = useRef(false);

  useEffect(() => {
    if (didLogStart.current) {
      return;
    }
    didLogStart.current = true;
    logEvent({
      event_name: LogEvent.StartGuessWhoQuiz,
      origin: Origin.GuessWhoQuiz,
    });
  }, [logEvent]);

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
      logEvent({
        event_name: LogEvent.AnswerGuessWhoQuestion,
        target_id: currentId,
        origin: Origin.GuessWhoQuiz,
        extra: JSON.stringify({ optionId }),
      });
      const nextId = getNextQuestionId(question, optionId);
      setAnswers((prev) => ({ ...prev, [currentId]: optionId }));

      if (!nextId) {
        setIsComplete(true);
        return;
      }

      setHistory((prev) => [...prev, currentId]);
      setCurrentId(nextId);
    },
    [currentId, logEvent],
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

  const initialLlmHistory = useMemo(
    () =>
      isComplete ? buildInitialHistory([...history, currentId], answers) : [],
    [isComplete, history, currentId, answers],
  );

  if (isComplete) {
    return <LlmPhase initialHistory={initialLlmHistory} onRestart={reset} />;
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
