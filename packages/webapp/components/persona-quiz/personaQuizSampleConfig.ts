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
// Persona quiz config (v3: branching decision tree + sub-personas).
//
// Structure:
//   - Q1: multi-choice broad-bucket opener (4 options) → 4 domain roots
//   - Each domain: depth-3 binary decision tree (a branch in ~every phase)
//     interleaved with colour questions → one of 8 sub-personas per domain
//   - Per-user path = Q1 + 7 yes/no = 8 questions, ≥4 of them branch points
//   - Terminal nodes carry an `archetypeId`; the revealed persona now tracks
//     the user's actual answers because the path itself branches on them
//
// `personaQuizQuestionGraph.json` and `personaQuizArchetypes.json` are emitted
// by `generatePersonaQuiz.mjs` (run it to regenerate; it validates the DAG and
// constrains every tag to the system tag vocabulary).
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
      next: 'qp1',
    },
    {
      id: 'infra',
      label: 'Building the stuff underneath products',
      emoji: '⚙️',
      tagWeights: { backend: 1, infrastructure: 1 },
      next: 'qi1',
    },
    {
      id: 'data',
      label: 'Working with data, models, or AI',
      emoji: '🧪',
      tagWeights: { 'data-science': 1, 'machine-learning': 1, ai: 1 },
      next: 'qd1',
    },
    {
      id: 'specialty',
      label: 'Something else (games, embedded, leadership, founder)',
      emoji: '🎮',
      tagWeights: { 'game-development': 1, embedded: 1 },
      next: 'qs1',
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
      // A full path is Q1 + 7 = 8 questions; this is a safety cap only — the
      // graph self-terminates on the node carrying an `archetypeId`.
      maxQuestions: 10,
      targetTotalTags: 8,
      // Require a tag to be reinforced (one weight-2 answer or two answers)
      // before it counts, so a single incidental answer can't muddy the result.
      tagConfidenceFloor: 2,
      // Backfill keyed by the Q1 option id; falls back to the generic list.
      fallbackTagsByDomain: {
        product: ['frontend', 'web-development', 'javascript'],
        infra: ['devops', 'cloud', 'infrastructure'],
        data: ['data-science', 'python', 'machine-learning'],
        specialty: ['general-programming', 'career', 'open-source'],
      },
      fallbackTags: ['general-programming', 'webdev'],
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
