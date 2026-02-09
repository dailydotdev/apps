import {
  aiFluencyQuestions,
  getAiFluencyNextTier,
  getShuffledAiFluencyQuestionOptions,
  getAiFluencyTierByKey,
  getAiFluencyTierFromAnswers,
} from './aiFluencyQuiz';

const getAnswersByOptionIndex = (optionIndex: number): Record<string, string> =>
  aiFluencyQuestions.reduce((acc, question) => {
    const option = question.options[optionIndex] || question.options.at(-1);

    acc[question.id] = option.id;

    return acc;
  }, {} as Record<string, string>);

describe('aiFluencyQuiz', () => {
  it('returns Casual User when lowest options are selected', () => {
    const answers = getAnswersByOptionIndex(0);

    expect(getAiFluencyTierFromAnswers(answers).key).toBe('casualUser');
  });

  it('returns AI Pioneer when highest options are selected', () => {
    const answers = getAnswersByOptionIndex(10);

    expect(getAiFluencyTierFromAnswers(answers).key).toBe('aiPioneer');
  });

  it('returns Agentic Developer for middle option selections', () => {
    const answers = getAnswersByOptionIndex(2);

    expect(getAiFluencyTierFromAnswers(answers).key).toBe('agenticDeveloper');
  });

  it('returns undefined for unknown tiers', () => {
    expect(getAiFluencyTierByKey('unknown-tier')).toBeUndefined();
  });

  it('returns null when requesting next tier for AI Pioneer', () => {
    expect(getAiFluencyNextTier('aiPioneer')).toBeNull();
  });

  it('shuffles options deterministically per question', () => {
    const firstQuestion = aiFluencyQuestions[0];
    const firstShuffle = getShuffledAiFluencyQuestionOptions(firstQuestion).map(
      ({ id }) => id,
    );
    const secondShuffle = getShuffledAiFluencyQuestionOptions(
      firstQuestion,
    ).map(({ id }) => id);

    expect(firstShuffle).toEqual(secondShuffle);
    expect(firstShuffle.sort()).toEqual(
      firstQuestion.options.map(({ id }) => id).sort(),
    );
  });

  it('does not keep the original order for every question', () => {
    const hasReorderedQuestion = aiFluencyQuestions.some((question) => {
      const originalOrder = question.options.map(({ id }) => id).join(',');
      const shuffledOrder = getShuffledAiFluencyQuestionOptions(question)
        .map(({ id }) => id)
        .join(',');

      return originalOrder !== shuffledOrder;
    });

    expect(hasReorderedQuestion).toBe(true);
  });
});
