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
  | 'triplebreak'
  | 'picker'
  | 'reveal';

/** UI-only pause so the belief shift feels deliberate; not a game tunable. */
const THINKING_DURATION_MS = 450;

const {
  confidenceThreshold,
  tiebreakThreshold,
  tiebreakMargin,
  triplebreakFloor,
  fallbackFloor,
  fallbackPersonaId,
  maxQuestions,
  minQuestions,
  instantLockThreshold,
  instantLockMargin,
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
  triplebreakPersonas: DeveloperPersona[];
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
  const [tiebreak, setTiebreak] = useState<number[] | null>(null);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [isManual, setIsManual] = useState(false);

  const askedRef = useRef<Set<number>>(new Set());
  const excludedGroupsRef = useRef<Set<string>>(new Set());
  const thinkingTimeout = useRef<ReturnType<typeof setTimeout>>();

  const reveal = useCallback((index: number, nextBelief: number[]) => {
    setResultIndex(index);
    setTiebreak(null);
    setPhase('reveal');
    setBelief(nextBelief);
  }, []);

  const finish = useCallback(
    (nextBelief: number[]) => {
      const ranked = rankBelief(nextBelief);
      const top = ranked[0];
      const runnerUp = ranked[1];
      const third = ranked[2];

      // 1. Confident top-1: reveal directly.
      if (
        top.belief >= tiebreakThreshold &&
        top.belief - runnerUp.belief >= tiebreakMargin
      ) {
        reveal(top.index, nextBelief);
        return;
      }

      // 2. Belief is too diffuse: fall back to the generalist.
      if (top.belief < fallbackFloor) {
        reveal(FALLBACK_PERSONA_INDEX, nextBelief);
        return;
      }

      // 3. Belief is moderate but not decisive: offer a two-way pick.
      if (top.belief >= triplebreakFloor && runnerUp) {
        setTiebreak([top.index, runnerUp.index]);
        setBelief(nextBelief);
        setPhase('tiebreak');
        return;
      }

      // 4. Belief is low but above fallback: offer a three-way pick.
      const candidates = [top.index, runnerUp?.index, third?.index].filter(
        (index): index is number => typeof index === 'number',
      );

      if (candidates.length >= 2) {
        setTiebreak(candidates.slice(0, 3));
        setBelief(nextBelief);
        setPhase(candidates.length >= 3 ? 'triplebreak' : 'tiebreak');
        return;
      }

      reveal(top.index, nextBelief);
    },
    [reveal],
  );

  const advance = useCallback(
    (nextBelief: number[], shownSoFar: number) => {
      const ranked = rankBelief(nextBelief);
      const top = ranked[0]?.belief ?? 0;
      const margin = top - (ranked[1]?.belief ?? 0);
      const reachedConfidence =
        top >= confidenceThreshold && shownSoFar >= minQuestions;
      const reachedInstantLock =
        top >= instantLockThreshold && margin >= instantLockMargin;

      if (
        shownSoFar >= maxQuestions ||
        reachedConfidence ||
        reachedInstantLock
      ) {
        finish(nextBelief);
        return;
      }

      const next = pickNextQuestion(
        nextBelief,
        askedRef.current,
        shownSoFar,
        excludedGroupsRef.current,
      );
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
    excludedGroupsRef.current = new Set();
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

      const question = QUESTIONS[currentQuestion];
      const nextBelief = updateBelief(belief, currentQuestion, value);
      setBelief(nextBelief);
      setIsThinking(true);

      // Once the user commits to a mutually-exclusive question (e.g. "main
      // language is JS/TS"), close out the entire exclusive group so the
      // engine stops asking contradictory follow-ups.
      if (value === 1 && question.exclusiveGroup) {
        excludedGroupsRef.current.add(question.exclusiveGroup);
      }

      thinkingTimeout.current = setTimeout(() => {
        setIsThinking(false);

        // Hard lock: a yes to a self-identification question reveals that
        // persona immediately, regardless of the current belief.
        if (value === 1 && question.lockPersonaId) {
          const lockIndex = PERSONAS.findIndex(
            (persona) => persona.id === question.lockPersonaId,
          );
          if (lockIndex >= 0) {
            reveal(lockIndex, nextBelief);
            return;
          }
        }

        advance(nextBelief, questionsShown);
      }, THINKING_DURATION_MS);
    },
    [advance, belief, currentQuestion, isThinking, questionsShown, reveal],
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
    excludedGroupsRef.current = new Set();
  }, []);

  const tiebreakPersonas = useMemo(() => {
    if (!tiebreak || phase !== 'tiebreak') {
      return [];
    }
    return tiebreak.slice(0, 2).map((index) => PERSONAS[index]);
  }, [phase, tiebreak]);

  const triplebreakPersonas = useMemo(() => {
    if (!tiebreak || phase !== 'triplebreak') {
      return [];
    }
    return tiebreak.slice(0, 3).map((index) => PERSONAS[index]);
  }, [phase, tiebreak]);

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
    triplebreakPersonas,
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
