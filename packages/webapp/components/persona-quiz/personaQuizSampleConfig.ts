import type {
  FunnelStepPersonaQuiz,
  PersonaArchetype,
  PersonaQuizQuestion,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelStepTransitionType,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import generatedArchetypes from './personaQuizArchetypes.json';
import generatedGraph from './personaQuizQuestionGraph.json';

// --------------------------------------------------------------------------
// Persona quiz config (v2: convergent DAG + archetype personas).
//
// Structure:
//   - Q1: multi-choice broad-bucket opener (4 options)
//   - Each bucket: convergent yes/no DAG, 4 phases (A: 5, B: 5, C: 5, D: 4)
//   - Per-user path = Q1 + 19 yes/no = 20 questions
//   - Branching at end of Phase A (→ sub-domain) and Phase B (→ specialty)
//   - Terminal nodes (last question of Phase D) carry an `archetypeId`
//
// `personaQuizQuestionGraph.json` and `personaQuizArchetypes.json` are
// LLM-authored offline by the persona-quiz subagent waves. Tag-weight values
// are constrained to the system tag vocabulary.
// --------------------------------------------------------------------------

const Q1: PersonaQuizQuestion = {
  id: 'q1_domain',
  axis: 'domain',
  prompt: 'Which of these feels most like your day?',
  cols: 1,
  options: [
    {
      id: 'product',
      label: 'Building things people see and use',
      emoji: '🎨',
      tagWeights: { frontend: 1, 'web-development': 1 },
      next: 'q_p_a1',
    },
    {
      id: 'infra',
      label: 'Building the stuff underneath products',
      emoji: '⚙️',
      tagWeights: { backend: 1, infrastructure: 1 },
      next: 'q_i_a1',
    },
    {
      id: 'data',
      label: 'Working with data, models, or AI',
      emoji: '🧪',
      tagWeights: { 'data-science': 1, 'machine-learning': 1, ai: 1 },
      next: 'q_d_a1',
    },
    {
      id: 'specialty',
      label: 'Something else (games, embedded, leadership, founder)',
      emoji: '🎮',
      tagWeights: { 'game-development': 1, embedded: 1 },
      next: 'q_s_a1',
    },
  ],
};

const GENERATED_QUESTIONS = generatedGraph as unknown as PersonaQuizQuestion[];
const ARCHETYPES = generatedArchetypes as unknown as PersonaArchetype[];

const QUESTIONS: PersonaQuizQuestion[] = [Q1, ...GENERATED_QUESTIONS];

export const personaQuizSampleParameters: FunnelStepPersonaQuiz['parameters'] =
  {
    headline: 'Let me figure out who you are',
    explainer:
      "A few quick yes/no questions and I'll guess your developer profile.",
    entryQuestionId: 'q1_domain',
    questions: QUESTIONS,
    selection: {
      // 15 questions total: Q1 + 14 yes/no (phases 3-4-4-3). Soft cap — the
      // graph itself terminates on the last Phase D question (which carries
      // an `archetypeId`).
      maxQuestions: 15,
      targetTotalTags: 8,
      tagConfidenceFloor: 1,
      fallbackTags: ['javascript', 'webdev'],
    },
    archetypes: ARCHETYPES,
    reveal: {
      eyebrow: 'You are a…',
      cta: 'Looks good',
      feedbackCta: "This doesn't fit me",
      feedbackPlaceholder: 'Tell us what we got wrong (optional)',
      addTagCta: 'Add tag',
    },
  };

export const buildSamplePersonaQuizStep = (
  onTransition: FunnelStepPersonaQuiz['onTransition'],
): FunnelStepPersonaQuiz => ({
  id: 'persona-quiz-sample',
  type: FunnelStepType.PersonaQuiz,
  parameters: personaQuizSampleParameters,
  transitions: [
    {
      on: FunnelStepTransitionType.Complete,
      destination: 'next',
    },
  ],
  isActive: true,
  onTransition,
});
