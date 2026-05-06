import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type {
  GuessWhoQuizFinalPersona,
  GuessWhoQuizNextQuestion,
  GuessWhoQuizQAInput,
} from '@dailydotdev/shared/src/graphql/guessWhoQuiz';
import { requestGuessWhoQuizStep } from '@dailydotdev/shared/src/graphql/guessWhoQuiz';

interface UseGuessWhoQuiz {
  nextQuestion: GuessWhoQuizNextQuestion | null;
  persona: GuessWhoQuizFinalPersona | null;
  isPending: boolean;
  error: Error | null;
  submitAnswer: (question: string, answer: string) => void;
  retry: () => void;
}

export const useGuessWhoQuiz = (
  initialHistory: GuessWhoQuizQAInput[],
): UseGuessWhoQuiz => {
  const [history, setHistory] = useState<GuessWhoQuizQAInput[]>(initialHistory);
  const [nextQuestion, setNextQuestion] =
    useState<GuessWhoQuizNextQuestion | null>(null);
  const [persona, setPersona] = useState<GuessWhoQuizFinalPersona | null>(null);
  const didKickoff = useRef(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: (h: GuessWhoQuizQAInput[]) => requestGuessWhoQuizStep(h),
    onSuccess: (data) => {
      setNextQuestion(data.nextQuestion);
      setPersona(data.finalPersona);
    },
  });

  useEffect(() => {
    if (didKickoff.current) {
      return;
    }
    didKickoff.current = true;
    mutate(initialHistory);
  }, [initialHistory, mutate]);

  const submitAnswer = useCallback(
    (question: string, answer: string) => {
      const updated = [...history, { question, answer }];
      setHistory(updated);
      setNextQuestion(null);
      mutate(updated);
    },
    [history, mutate],
  );

  const retry = useCallback(() => {
    mutate(history);
  }, [history, mutate]);

  return { nextQuestion, persona, isPending, error, submitAnswer, retry };
};
