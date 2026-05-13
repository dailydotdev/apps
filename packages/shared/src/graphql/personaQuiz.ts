import { gql } from 'graphql-request';
import type {
  PersonaQuizOption,
  PersonaQuizQuestion,
} from '../features/onboarding/types/funnel';
import { gqlClient } from './common';

export interface PersonaQuizAnswerInput {
  questionId: string;
  question: string;
  optionId: string;
  answer: string;
}

export interface PersonaQuizRevealText {
  headline: string;
  description: string;
}

export interface PersonaQuizExtractResult {
  includeTags: string[];
  reveal: PersonaQuizRevealText | null;
}

export interface FetchNextQuestionResult {
  isFinal: boolean;
  question: PersonaQuizQuestion | null;
}

interface RemoteOption {
  id: string;
  label: string;
  emoji?: string | null;
  tagHints: string[];
}

interface RemoteQuestion {
  id: string;
  prompt: string;
  axis: string;
  cols?: number | null;
  options: RemoteOption[];
}

const toOption = (option: RemoteOption): PersonaQuizOption => {
  const tagWeights: Record<string, number> = {};
  option.tagHints.forEach((tag) => {
    tagWeights[tag] = 1;
  });
  return {
    id: option.id,
    label: option.label,
    emoji: option.emoji ?? undefined,
    tagWeights,
  };
};

const toQuestion = (q: RemoteQuestion): PersonaQuizQuestion => ({
  id: q.id,
  prompt: q.prompt,
  axis: q.axis,
  cols: q.cols ?? undefined,
  options: q.options.map(toOption),
});

const PERSONA_QUIZ_NEXT_QUESTION_MUTATION = gql`
  mutation PersonaQuizNextQuestion(
    $priorAnswers: [PersonaQuizQAInput!]!
    $seedTags: [String!]!
    $askedCount: Int!
    $maxQuestions: Int
  ) {
    personaQuizNextQuestion(
      priorAnswers: $priorAnswers
      seedTags: $seedTags
      askedCount: $askedCount
      maxQuestions: $maxQuestions
    ) {
      isFinal
      question {
        id
        prompt
        axis
        cols
        options {
          id
          label
          emoji
          tagHints
        }
      }
    }
  }
`;

const PERSONA_QUIZ_REVEAL_MUTATION = gql`
  mutation PersonaQuizReveal(
    $answers: [PersonaQuizQAInput!]!
    $seedTags: [String!]!
    $targetCount: Int
  ) {
    personaQuizReveal(
      answers: $answers
      seedTags: $seedTags
      targetCount: $targetCount
    ) {
      includeTags
      reveal {
        headline
        description
      }
    }
  }
`;

export const fetchNextQuizQuestion = async (
  priorAnswers: PersonaQuizAnswerInput[],
  seedTags: string[],
  askedCount: number,
  maxQuestions: number,
): Promise<FetchNextQuestionResult> => {
  const res = await gqlClient.request<{
    personaQuizNextQuestion: {
      isFinal: boolean;
      question: RemoteQuestion | null;
    };
  }>(PERSONA_QUIZ_NEXT_QUESTION_MUTATION, {
    priorAnswers,
    seedTags,
    askedCount,
    maxQuestions,
  });
  const { isFinal, question } = res.personaQuizNextQuestion;
  if (isFinal || !question) {
    return { isFinal: true, question: null };
  }
  return { isFinal: false, question: toQuestion(question) };
};

export const extractOnboardingTagsFromQuiz = async (
  answers: PersonaQuizAnswerInput[],
  seedTags: string[],
  targetCount?: number,
): Promise<PersonaQuizExtractResult> => {
  const res = await gqlClient.request<{
    personaQuizReveal: PersonaQuizExtractResult;
  }>(PERSONA_QUIZ_REVEAL_MUTATION, {
    answers,
    seedTags,
    targetCount,
  });
  return {
    includeTags: res.personaQuizReveal.includeTags,
    reveal: res.personaQuizReveal.reveal ?? null,
  };
};
