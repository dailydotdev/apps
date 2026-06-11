import { useCallback, useMemo, useReducer } from 'react';
import type {
  FunnelStepPersonaQuizParameters,
  PersonaQuizOption,
  PersonaQuizQuestion,
} from '../../types/funnel';

export type PersonaQuizPhase = 'question' | 'enriching' | 'reveal';

export interface PersonaQuizAnswer {
  questionId: string;
  optionId: string;
}

interface PersonaQuizState {
  phase: PersonaQuizPhase;
  currentQuestionId: string | null;
  answers: PersonaQuizAnswer[];
  tagScores: Record<string, number>;
  lastOption: PersonaQuizOption | undefined;
  finalTags: string[];
}

type Action =
  | { type: 'goToQuestion'; questionId: string }
  | {
      type: 'answer';
      question: PersonaQuizQuestion;
      option: PersonaQuizOption;
    }
  | { type: 'startEnriching' }
  | { type: 'enrichmentComplete'; tags: string[] }
  | { type: 'addTag'; tag: string }
  | { type: 'removeTag'; tag: string };

const applyWeights = (
  base: Record<string, number>,
  weights: Record<string, number> | undefined,
): Record<string, number> => {
  if (!weights) {
    return base;
  }
  const next = { ...base };
  Object.entries(weights).forEach(([key, weight]) => {
    next[key] = (next[key] ?? 0) + weight;
  });
  return next;
};

const reducer = (state: PersonaQuizState, action: Action): PersonaQuizState => {
  switch (action.type) {
    case 'goToQuestion':
      return {
        ...state,
        phase: 'question',
        currentQuestionId: action.questionId,
      };
    case 'answer': {
      const { question, option } = action;
      return {
        ...state,
        answers: [
          ...state.answers,
          { questionId: question.id, optionId: option.id },
        ],
        tagScores: applyWeights(state.tagScores, option.tagWeights),
        lastOption: option,
      };
    }
    case 'startEnriching':
      return { ...state, phase: 'enriching' };
    case 'enrichmentComplete':
      return { ...state, phase: 'reveal', finalTags: action.tags };
    case 'addTag':
      if (state.finalTags.includes(action.tag)) {
        return state;
      }
      return { ...state, finalTags: [...state.finalTags, action.tag] };
    case 'removeTag':
      return {
        ...state,
        finalTags: state.finalTags.filter((tag) => tag !== action.tag),
      };
    default:
      return state;
  }
};

const initialState: PersonaQuizState = {
  phase: 'question',
  currentQuestionId: null,
  answers: [],
  tagScores: {},
  lastOption: undefined,
  finalTags: [],
};

export interface UsePersonaQuizState {
  phase: PersonaQuizPhase;
  currentQuestion: PersonaQuizQuestion | null;
  answers: PersonaQuizAnswer[];
  tagScores: Record<string, number>;
  finalTags: string[];
  lastOption: PersonaQuizOption | undefined;
  goToQuestion: (questionId: string) => void;
  answer: (question: PersonaQuizQuestion, option: PersonaQuizOption) => void;
  startEnriching: () => void;
  enrichmentComplete: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}

export const usePersonaQuizState = (
  params: Pick<FunnelStepPersonaQuizParameters, 'questions'>,
): UsePersonaQuizState => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const currentQuestion = useMemo(() => {
    if (!state.currentQuestionId) {
      return null;
    }
    return (
      params.questions.find((q) => q.id === state.currentQuestionId) ?? null
    );
  }, [params.questions, state.currentQuestionId]);

  const goToQuestion = useCallback((questionId: string) => {
    dispatch({ type: 'goToQuestion', questionId });
  }, []);
  const answer = useCallback(
    (question: PersonaQuizQuestion, option: PersonaQuizOption) => {
      dispatch({ type: 'answer', question, option });
    },
    [],
  );
  const startEnriching = useCallback(() => {
    dispatch({ type: 'startEnriching' });
  }, []);
  const enrichmentComplete = useCallback((tags: string[]) => {
    dispatch({ type: 'enrichmentComplete', tags });
  }, []);
  const addTag = useCallback((tag: string) => {
    dispatch({ type: 'addTag', tag });
  }, []);
  const removeTag = useCallback((tag: string) => {
    dispatch({ type: 'removeTag', tag });
  }, []);

  return {
    phase: state.phase,
    currentQuestion,
    answers: state.answers,
    tagScores: state.tagScores,
    finalTags: state.finalTags,
    lastOption: state.lastOption,
    goToQuestion,
    answer,
    startEnriching,
    enrichmentComplete,
    addTag,
    removeTag,
  };
};
