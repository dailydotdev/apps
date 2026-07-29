import { act, renderHook } from '@testing-library/react';
import { useWeeklyQuizGame, WeeklyQuizPhase } from './useWeeklyQuizGame';
import type { WeeklyQuiz } from '../types';

const quiz: WeeklyQuiz = {
  id: 'q',
  week: '2026-W30',
  title: 'Test quiz',
  welcomeText: 'hi',
  questions: [
    {
      id: 'q1',
      prompt: 'First?',
      options: [
        { id: 'q1a', label: 'right', isCorrect: true },
        { id: 'q1b', label: 'wrong', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      prompt: 'Second?',
      options: [
        { id: 'q2a', label: 'wrong', isCorrect: false },
        { id: 'q2b', label: 'right', isCorrect: true },
      ],
    },
  ],
};

describe('useWeeklyQuizGame', () => {
  let now = 0;

  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts on the intro phase', () => {
    const { result } = renderHook(() => useWeeklyQuizGame(quiz));
    expect(result.current.phase).toBe(WeeklyQuizPhase.Intro);
    expect(result.current.totalQuestions).toBe(2);
  });

  it('enters the countdown before the timer starts', () => {
    const { result } = renderHook(() => useWeeklyQuizGame(quiz));

    act(() => result.current.beginCountdown());
    expect(result.current.phase).toBe(WeeklyQuizPhase.Countdown);
    // The clock must not run during the countdown — no segment has started.
    now += 5000;
    expect(result.current.elapsedMs).toBe(0);

    act(() => result.current.start());
    expect(result.current.phase).toBe(WeeklyQuizPhase.Question);
  });

  it('walks through questions and scores correct answers', () => {
    const { result } = renderHook(() => useWeeklyQuizGame(quiz));

    act(() => result.current.start());
    expect(result.current.phase).toBe(WeeklyQuizPhase.Question);
    expect(result.current.questionNumber).toBe(1);

    act(() => result.current.answer('q1a'));
    expect(result.current.isAnswered).toBe(true);
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.correctCount).toBe(1);

    act(() => result.current.next());
    expect(result.current.questionNumber).toBe(2);
    expect(result.current.isAnswered).toBe(false);

    // Wrong answer on the last question.
    act(() => result.current.answer('q2a'));
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.correctCount).toBe(1);

    act(() => result.current.next());
    expect(result.current.phase).toBe(WeeklyQuizPhase.Results);
    expect(result.current.result).toMatchObject({
      correctCount: 1,
      totalQuestions: 2,
      answers: [
        { questionId: 'q1', optionId: 'q1a' },
        { questionId: 'q2', optionId: 'q2a' },
      ],
    });
  });

  it('ignores a second answer for the same question', () => {
    const { result } = renderHook(() => useWeeklyQuizGame(quiz));
    act(() => result.current.start());
    act(() => result.current.answer('q1a'));
    act(() => result.current.answer('q1b'));
    expect(result.current.correctCount).toBe(1);
    expect(result.current.selectedOptionId).toBe('q1a');
  });

  it('runs a standalone stopwatch that answering never pauses', () => {
    const { result } = renderHook(() => useWeeklyQuizGame(quiz));

    act(() => result.current.start()); // stopwatch starts at now

    now += 3000;
    act(() => result.current.answer('q1a')); // answering does not pause it

    // The clock keeps running while feedback is shown (not excluded).
    now += 10000;
    act(() => result.current.next());

    now += 2000;
    act(() => result.current.answer('q2b'));

    now += 5000;
    act(() => result.current.next());

    // Continuous wall-clock from start to finish: 3s + 10s + 2s + 5s.
    expect(result.current.result?.timeMs).toBe(20000);
  });
});
