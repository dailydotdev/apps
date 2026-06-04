import {
  PERSONAS,
  PERSONA_QUESTION_LIKELIHOOD as P,
  PERSONA_PRIOR,
  QUESTIONS,
} from './data';

/** Answer weight: 1 = yes, 0 = no, 0.5 = not sure (no belief update). */
export type AnswerValue = 0 | 0.5 | 1;

const PERSONA_COUNT = PERSONAS.length;

/**
 * The likelihood matrix, prior, and persona/question lists are positional and
 * must stay aligned. Fail fast on import so editing the data file can never
 * silently change behavior (e.g. a row/column added to only one of them).
 */
const validatePersonaData = (): void => {
  if (PERSONA_PRIOR.length !== PERSONA_COUNT) {
    throw new Error('Persona prior must have one entry per persona.');
  }
  if (P.length !== PERSONA_COUNT) {
    throw new Error('Likelihood matrix must have one row per persona.');
  }
  if (P.some((row) => row.length !== QUESTIONS.length)) {
    throw new Error('Each likelihood row must have one entry per question.');
  }
};
validatePersonaData();

export const initialBelief = (): number[] => PERSONA_PRIOR.slice();

/** Resolve a persona id to its index, throwing if it is not in the data. */
export const personaIndexById = (id: string): number => {
  const index = PERSONAS.findIndex((persona) => persona.id === id);
  if (index < 0) {
    throw new Error(`Unknown persona id: ${id}`);
  }
  return index;
};

const entropy = (belief: number[]): number =>
  belief.reduce((acc, p) => (p > 1e-12 ? acc - p * Math.log2(p) : acc), 0);

/**
 * Expected reduction in entropy from asking a question, given current belief.
 * The engine greedily picks the question with the highest information gain.
 */
const informationGain = (belief: number[], question: number): number => {
  let pYes = 0;
  for (let i = 0; i < PERSONA_COUNT; i += 1) {
    pYes += belief[i] * P[i][question];
  }

  if (pYes <= 1e-9 || pYes >= 1 - 1e-9) {
    return 0;
  }

  const beliefIfYes = belief.map((bi, i) => (bi * P[i][question]) / pYes);
  const beliefIfNo = belief.map(
    (bi, i) => (bi * (1 - P[i][question])) / (1 - pYes),
  );

  return (
    entropy(belief) -
    (pYes * entropy(beliefIfYes) + (1 - pYes) * entropy(beliefIfNo))
  );
};

/**
 * Questions are gated by depth so the experience moves from broad to specific.
 * Deeper layers unlock as more questions are answered.
 */
const allowedLayers = (questionsShown: number): Set<number> => {
  if (questionsShown === 0) {
    return new Set([0]);
  }
  if (questionsShown < 3) {
    return new Set([0, 1]);
  }
  if (questionsShown < 5) {
    return new Set([0, 1, 2]);
  }
  return new Set([0, 1, 2, 3]);
};

/**
 * Returns the next best question index, or -1 when none remain.
 * Questions whose exclusiveGroup has been answered yes already are skipped:
 * once the user picks their main language, asking about the other languages
 * is contradictory and wastes a slot.
 */
export const pickNextQuestion = (
  belief: number[],
  asked: Set<number>,
  questionsShown: number,
  excludedGroups: Set<string> = new Set(),
): number => {
  const layers = allowedLayers(questionsShown);

  return QUESTIONS.reduce(
    (best, question, q) => {
      if (asked.has(q) || !layers.has(question.layer)) {
        return best;
      }
      if (
        question.exclusiveGroup &&
        excludedGroups.has(question.exclusiveGroup)
      ) {
        return best;
      }
      const gain = informationGain(belief, q);
      return gain > best.gain ? { index: q, gain } : best;
    },
    { index: -1, gain: -1 },
  ).index;
};

/** Bayesian update of the belief vector given an answer to a question. */
export const updateBelief = (
  belief: number[],
  question: number,
  answer: AnswerValue,
): number[] => {
  const next = belief.map((bi, i) => {
    const pYes = P[i][question];
    const likelihood = answer * pYes + (1 - answer) * (1 - pYes);
    return bi * likelihood;
  });

  const sum = next.reduce((acc, value) => acc + value, 0);
  if (sum <= 0) {
    return belief;
  }

  return next.map((value) => value / sum);
};

export interface BeliefRanking {
  index: number;
  belief: number;
}

export const rankBelief = (belief: number[]): BeliefRanking[] =>
  belief
    .map((value, index) => ({ index, belief: value }))
    .sort((a, b) => b.belief - a.belief);

export const beliefEntropy = entropy;
