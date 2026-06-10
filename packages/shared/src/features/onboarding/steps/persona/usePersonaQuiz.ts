import { useCallback, useMemo, useRef, useState } from 'react';
import type { AnswerValue } from './engine';
import {
  initialBelief,
  personaIndexById,
  pickNextQuestion,
  rankBelief,
  updateBelief,
} from './engine';
import type { DeveloperPersona, PersonaModifier } from './data';
import { MODIFIERS, PERSONAS, PERSONA_ENGINE_CONFIG, QUESTIONS } from './data';

export type PersonaQuizPhase =
  | 'intro'
  | 'playing'
  | 'tiebreak'
  | 'triplebreak'
  | 'modifiers'
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

// The prior already favors one persona, so the top belief starts well above 0.
// We rescale progress from this baseline up to the confidence threshold so the
// bar starts near-empty and uses its full range for the actual narrowing-down.
const BASELINE_TOP = Math.max(...initialBelief());

interface PersonaResult {
  persona: DeveloperPersona;
  confidence: number;
  modifiers: string[];
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
  modifiers: PersonaModifier[];
  selectedModifierIds: string[];
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
  confirmPersona: () => void;
  toggleModifier: (modifierId: string) => void;
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
  const [selectedModifierIds, setSelectedModifierIds] = useState<string[]>([]);
  // How close Patchy is to a confident guess (0..1), clamped so it never
  // visibly moves backwards even if belief dips after a surprising answer.
  const [progress, setProgress] = useState(0);

  const askedRef = useRef<Set<number>>(new Set());
  const excludedGroupsRef = useRef<Set<string>>(new Set());
  const thinkingTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Quiz paths land on the reveal first, so the user can approve Patchy's
  // guess before the modifiers screen.
  const revealGuess = useCallback((index: number, nextBelief: number[]) => {
    setResultIndex(index);
    setTiebreak(null);
    setBelief(nextBelief);
    setSelectedModifierIds([]);
    setPhase('reveal');
  }, []);

  // Manual selection skips straight to the modifiers screen.
  const goToModifiers = useCallback((index: number, nextBelief: number[]) => {
    setResultIndex(index);
    setTiebreak(null);
    setBelief(nextBelief);
    setSelectedModifierIds([]);
    setPhase('modifiers');
  }, []);

  // Approve Patchy's guess from the reveal screen.
  const confirmPersona = useCallback(() => {
    setPhase('modifiers');
  }, []);

  const finish = useCallback(
    (nextBelief: number[]) => {
      const ranked = rankBelief(nextBelief);
      const top = ranked[0];
      const runnerUp = ranked[1];
      const third = ranked[2];

      // 1. Confident top-1: skip to modifiers.
      if (
        top.belief >= tiebreakThreshold &&
        top.belief - runnerUp.belief >= tiebreakMargin
      ) {
        revealGuess(top.index, nextBelief);
        return;
      }

      // 2. Belief is too diffuse: fall back to the generalist.
      if (top.belief < fallbackFloor) {
        revealGuess(FALLBACK_PERSONA_INDEX, nextBelief);
        return;
      }

      // 3. Belief is moderate but not decisive: two-way pick.
      if (top.belief >= triplebreakFloor && runnerUp) {
        setTiebreak([top.index, runnerUp.index]);
        setBelief(nextBelief);
        setPhase('tiebreak');
        return;
      }

      // 4. Below triplebreak floor: three-way pick.
      const candidates = [top.index, runnerUp?.index, third?.index].filter(
        (index): index is number => typeof index === 'number',
      );

      if (candidates.length >= 2) {
        setTiebreak(candidates.slice(0, 3));
        setBelief(nextBelief);
        setPhase(candidates.length >= 3 ? 'triplebreak' : 'tiebreak');
        return;
      }

      revealGuess(top.index, nextBelief);
    },
    [revealGuess],
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

      // Confidence rescaled from the prior baseline → full bar range is spent
      // on real narrowing, not the baseline. A per-question floor guarantees
      // the bar visibly moves on every answer.
      const confComponent =
        (top - BASELINE_TOP) / (confidenceThreshold - BASELINE_TOP);
      const countComponent = (shownSoFar + 1) / maxQuestions;
      const closeness = Math.min(1, Math.max(0, confComponent, countComponent));
      setProgress((prev) => Math.max(prev, closeness));
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
    setSelectedModifierIds([]);
    setProgress(0);
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

      if (value === 1 && question.exclusiveGroup) {
        excludedGroupsRef.current.add(question.exclusiveGroup);
      }
      // closesOnYes / closesOnNo: cross-group implications.
      // Example: Q2 "you're backend" = yes also closes primary-platform,
      // because that rules out web/mobile as the main output.
      if (value === 1 && question.closesOnYes) {
        question.closesOnYes.forEach((group) =>
          excludedGroupsRef.current.add(group),
        );
      }
      if (value === 0 && question.closesOnNo) {
        question.closesOnNo.forEach((group) =>
          excludedGroupsRef.current.add(group),
        );
      }

      thinkingTimeout.current = setTimeout(() => {
        setIsThinking(false);

        if (value === 1 && question.lockPersonaId) {
          const lockIndex = PERSONAS.findIndex(
            (persona) => persona.id === question.lockPersonaId,
          );
          if (lockIndex >= 0) {
            revealGuess(lockIndex, nextBelief);
            return;
          }
        }

        advance(nextBelief, questionsShown);
      }, THINKING_DURATION_MS);
    },
    [advance, belief, currentQuestion, revealGuess, isThinking, questionsShown],
  );

  const chooseTiebreak = useCallback(
    (personaId: string) => {
      const index = PERSONAS.findIndex((persona) => persona.id === personaId);
      if (index < 0) {
        return;
      }
      revealGuess(index, belief);
    },
    [belief, revealGuess],
  );

  const pickManually = useCallback(() => {
    setResultIndex(null);
    setTiebreak(null);
    setIsManual(false);
    setSelectedModifierIds([]);
    setPhase('picker');
  }, []);

  const selectPersona = useCallback(
    (personaId: string) => {
      const index = PERSONAS.findIndex((persona) => persona.id === personaId);
      if (index < 0) {
        return;
      }
      setIsManual(true);
      goToModifiers(index, belief);
    },
    [belief, goToModifiers],
  );

  const toggleModifier = useCallback((modifierId: string) => {
    setSelectedModifierIds((current) => {
      if (current.includes(modifierId)) {
        return current.filter((id) => id !== modifierId);
      }
      return [...current, modifierId];
    });
  }, []);

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
    setSelectedModifierIds([]);
    setProgress(0);
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
      modifiers: selectedModifierIds,
    };
  }, [belief, resultIndex, selectedModifierIds]);

  return {
    phase,
    belief,
    questionNumber: questionsShown,
    questionText:
      currentQuestion !== null ? QUESTIONS[currentQuestion].text : null,
    progress,
    isThinking,
    tiebreakPersonas,
    triplebreakPersonas,
    modifiers: MODIFIERS,
    selectedModifierIds,
    personas: PERSONAS,
    result,
    isManual,
    questionsAnswered: askedRef.current.size,
    start,
    answer,
    chooseTiebreak,
    pickManually,
    selectPersona,
    confirmPersona,
    toggleModifier,
    restart,
  };
};
