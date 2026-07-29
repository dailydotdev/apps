import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  WeeklyQuiz,
  WeeklyQuizAnswerInput,
  WeeklyQuizQuestion,
} from '../types';

export enum WeeklyQuizPhase {
  Intro = 'intro',
  Countdown = 'countdown',
  Question = 'question',
  Results = 'results',
}

export interface WeeklyQuizGameResult {
  answers: WeeklyQuizAnswerInput[];
  correctCount: number;
  totalQuestions: number;
  // Total elapsed time in milliseconds — a continuous wall-clock from the first
  // question to the last answer.
  timeMs: number;
}

export interface UseWeeklyQuizGame {
  phase: WeeklyQuizPhase;
  question: WeeklyQuizQuestion | undefined;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  isAnswered: boolean;
  isCorrect: boolean;
  correctCount: number;
  // Live elapsed time, in milliseconds. Ticks up continuously through the quiz.
  elapsedMs: number;
  result: WeeklyQuizGameResult | null;
  beginCountdown: () => void;
  start: () => void;
  answer: (optionId: string) => void;
  next: () => void;
}

// The quiz state machine + a standalone stopwatch. The timer is a continuous
// wall-clock: it starts when the questions begin and runs uninterrupted to the
// end — answering (or reading feedback) never pauses, resets, or otherwise
// interferes with it. The final elapsed time is the submitted `timeMs`.
export const useWeeklyQuizGame = (
  quiz: WeeklyQuiz | undefined,
): UseWeeklyQuizGame => {
  const [phase, setPhase] = useState<WeeklyQuizPhase>(WeeklyQuizPhase.Intro);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<WeeklyQuizAnswerInput[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<WeeklyQuizGameResult | null>(null);

  // When the stopwatch started (set in start()); the timer just reads the
  // wall-clock delta from here, so nothing the player does can perturb it.
  const startTimeRef = useRef<number | null>(null);
  // A re-render tick so the live timer display updates while running.
  const [, setTick] = useState(0);

  const questions = useMemo(() => quiz?.questions ?? [], [quiz]);
  const totalQuestions = questions.length;
  const question =
    phase === WeeklyQuizPhase.Question ? questions[currentIndex] : undefined;
  const isAnswered = selectedOptionId !== null;
  const isCorrect =
    isAnswered &&
    !!question?.options.find((option) => option.id === selectedOptionId)
      ?.isCorrect;

  // The stopwatch ticks continuously through the whole question phase.
  const isRunning = phase === WeeklyQuizPhase.Question;

  // Drive the live display only while the clock is running.
  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const interval = window.setInterval(() => setTick((t) => t + 1), 100);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const readElapsed = useCallback(
    (): number =>
      startTimeRef.current ? Date.now() - startTimeRef.current : 0,
    [],
  );

  // Leave the intro for the 3-2-1 countdown. The timer only starts in start(),
  // once the countdown finishes, so the countdown never costs the player time.
  const beginCountdown = useCallback(() => {
    setPhase(WeeklyQuizPhase.Countdown);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnswers([]);
    setCorrectCount(0);
    setResult(null);
    setPhase(WeeklyQuizPhase.Question);
  }, []);

  const answer = useCallback(
    (optionId: string) => {
      const activeQuestion = questions[currentIndex];
      if (!activeQuestion || selectedOptionId !== null) {
        return;
      }

      const picked = activeQuestion.options.find(
        (option) => option.id === optionId,
      );
      setSelectedOptionId(optionId);
      setAnswers((prev) => [
        ...prev,
        { questionId: activeQuestion.id, optionId },
      ]);
      if (picked?.isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
    },
    [currentIndex, questions, selectedOptionId],
  );

  const next = useCallback(() => {
    const isLast = currentIndex >= totalQuestions - 1;

    if (isLast) {
      setResult({
        answers,
        correctCount,
        totalQuestions,
        timeMs: readElapsed(),
      });
      setPhase(WeeklyQuizPhase.Results);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOptionId(null);
  }, [answers, correctCount, currentIndex, readElapsed, totalQuestions]);

  return {
    phase,
    question,
    questionNumber: currentIndex + 1,
    totalQuestions,
    selectedOptionId,
    isAnswered,
    isCorrect,
    correctCount,
    elapsedMs: readElapsed(),
    result,
    beginCountdown,
    start,
    answer,
    next,
  };
};
