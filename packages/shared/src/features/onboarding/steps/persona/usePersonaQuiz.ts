import { useCallback, useMemo, useRef, useState } from 'react';
import type { AnswerValue } from './engine';
import {
  initialBelief,
  personaIndexById,
  pickNextQuestion,
  rankBelief,
  updateBelief,
} from './engine';
import type { DeveloperPersona } from './data';
import { PERSONAS, PERSONA_ENGINE_CONFIG, QUESTIONS } from './data';

export type PersonaQuizPhase =
  | 'intro'
  | 'playing'
  | 'tiebreak'
  | 'picker'
  | 'reveal';

/** UI-only pause so the belief shift feels deliberate; not a game tunable. */
const THINKING_DURATION_MS = 450;

const {
  confidenceThreshold,
  tiebreakThreshold,
  tiebreakMargin,
  fallbackFloor,
  fallbackPersonaId,
  maxQuestions,
  minQuestions,
} = PERSONA_ENGINE_CONFIG;

const FALLBACK_PERSONA_INDEX = personaIndexById(fallbackPersonaId);

interface PersonaResult {
  persona: DeveloperPersona;
  confidence: number;
}

export interface PersonaQuizState {
  phase: PersonaQuizPhase;
  belief: number[];
  questionNumber: number;
  questionText: string | null;
  progress: number;
  isThinking: boolean;
  tiebreakPersonas: DeveloperPersona[];
  personas: DeveloperPersona[];
  result: PersonaResult | null;
  /** True when the user picked their persona instead of playing the quiz. */
  isManual: boolean;
  questionsAnswered: number;
  start: () => void;
  answer: (value: AnswerValue) => void;
  chooseTiebreak: (personaId: string) => void;
  pickManually: () => void;
  selectPersona: (personaId: string) => void;
  restart: () => void;
}

export const usePersonaQuiz = (): PersonaQuizState => {
  const [phase, setPhase] = useState<PersonaQuizPhase>('intro');
  const [belief, setBelief] = useState<number[]>(() => initialBelief());
  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null);
  const [questionsShown, setQuestionsShown] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [tiebreak, setTiebreak] = useState<[number, number] | null>(null);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [isManual, setIsManual] = useState(false);

  const askedRef = useRef<Set<number>>(new Set());
  const thinkingTimeout = useRef<ReturnType<typeof setTimeout>>();

  const reveal = useCallback((index: number, nextBelief: number[]) => {
    setResultIndex(index);
    setTiebreak(null);
    setPhase('reveal');
    setBelief(nextBelief);
  }, []);

  const finish = useCallback(
    (nextBelief: number[]) => {
      const [top, runnerUp] = rankBelief(nextBelief);

      if (
        top.belief >= tiebreakThreshold &&
        top.belief - runnerUp.belief >= tiebreakMargin
      ) {
        reveal(top.index, nextBelief);
        return;
      }

      if (top.belief < fallbackFloor) {
        reveal(FALLBACK_PERSONA_INDEX, nextBelief);
        return;
      }

      setTiebreak([top.index, runnerUp.index]);
      setBelief(nextBelief);
      setPhase('tiebreak');
    },
    [reveal],
  );

  const advance = useCallback(
    (nextBelief: number[], shownSoFar: number) => {
      const topBelief = Math.max(...nextBelief);
      const reachedConfidence =
        topBelief >= confidenceThreshold && shownSoFar >= minQuestions;

      if (shownSoFar >= maxQuestions || reachedConfidence) {
        finish(nextBelief);
        return;
      }

      const next = pickNextQuestion(nextBelief, askedRef.current, shownSoFar);
      if (next < 0) {
        finish(nextBelief);
        return;
      }

      askedRef.current.add(next);
      setCurrentQuestion(next);
      setQuestionsShown(shownSoFar + 1);
    },
    [finish],
  );

  const start = useCallback(() => {
    askedRef.current = new Set();
    const fresh = initialBelief();
    setBelief(fresh);
    setResultIndex(null);
    setTiebreak(null);
    setIsThinking(false);
    setIsManual(false);
    setQuestionsShown(0);
    setPhase('playing');
    advance(fresh, 0);
  }, [advance]);

  const answer = useCallback(
    (value: AnswerValue) => {
      if (currentQuestion === null || isThinking) {
        return;
      }

      const nextBelief = updateBelief(belief, currentQuestion, value);
      setBelief(nextBelief);
      setIsThinking(true);

      thinkingTimeout.current = setTimeout(() => {
        setIsThinking(false);
        advance(nextBelief, questionsShown);
      }, THINKING_DURATION_MS);
    },
    [advance, belief, currentQuestion, isThinking, questionsShown],
  );

  const chooseTiebreak = useCallback(
    (personaId: string) => {
      const index = PERSONAS.findIndex((persona) => persona.id === personaId);
      if (index < 0) {
        return;
      }
      reveal(index, belief);
    },
    [belief, reveal],
  );

  const pickManually = useCallback(() => {
    setResultIndex(null);
    setTiebreak(null);
    setIsManual(false);
    setPhase('picker');
  }, []);

  const selectPersona = useCallback(
    (personaId: string) => {
      const index = PERSONAS.findIndex((persona) => persona.id === personaId);
      if (index < 0) {
        return;
      }
      setIsManual(true);
      reveal(index, belief);
    },
    [belief, reveal],
  );

  const restart = useCallback(() => {
    if (thinkingTimeout.current) {
      clearTimeout(thinkingTimeout.current);
    }
    setPhase('intro');
    setBelief(initialBelief());
    setCurrentQuestion(null);
    setQuestionsShown(0);
    setIsThinking(false);
    setTiebreak(null);
    setResultIndex(null);
    setIsManual(false);
    askedRef.current = new Set();
  }, []);

  const tiebreakPersonas = useMemo(
    () => (tiebreak ? tiebreak.map((index) => PERSONAS[index]) : []),
    [tiebreak],
  );

  const result = useMemo<PersonaResult | null>(() => {
    if (resultIndex === null) {
      return null;
    }
    return {
      persona: PERSONAS[resultIndex],
      confidence: belief[resultIndex],
    };
  }, [belief, resultIndex]);

  return {
    phase,
    belief,
    questionNumber: questionsShown,
    questionText:
      currentQuestion !== null ? QUESTIONS[currentQuestion].text : null,
    progress: Math.min(questionsShown / maxQuestions, 1),
    isThinking,
    tiebreakPersonas,
    personas: PERSONAS,
    result,
    isManual,
    questionsAnswered: askedRef.current.size,
    start,
    answer,
    chooseTiebreak,
    pickManually,
    selectPersona,
    restart,
  };
};
