import type {
  FunnelStepPersonaQuiz,
  PersonaQuizQuestion,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelStepTransitionType,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import personaQuizRevealLookup from './personaQuizRevealLookup.json';
import generatedGraph from './personaQuizQuestionGraph.json';

// --------------------------------------------------------------------------
// Persona quiz config.
//
// Structure:
//   - Q1: a single multi-choice broad-bucket opener (4 options)
//   - For each bucket, a true non-convergent yes/no graph 5 levels deep
//   - Every node has a unique id and unique parent (paths never merge)
//   - Terminal nodes (depth 5) have `next: null` on every option → reveal
//
// `personaQuizQuestionGraph.json` and `personaQuizRevealLookup.json` are
// LLM-authored offline by `scripts/generatePersonaQuiz.ts` (or by the
// equivalent subagent orchestration). Tag-weight values are constrained to
// the system-level tag vocabulary at `/tmp/recswipe-prod-tags.json`.
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
      next: 'q_p_root',
    },
    {
      id: 'infra',
      label: 'Building the stuff underneath products',
      emoji: '⚙️',
      tagWeights: { backend: 1, infrastructure: 1 },
      next: 'q_i_root',
    },
    {
      id: 'data',
      label: 'Working with data, models, or AI',
      emoji: '🧪',
      tagWeights: { 'data-science': 1, 'machine-learning': 1, ai: 1 },
      next: 'q_d_root',
    },
    {
      id: 'specialty',
      label: 'Something else (games, embedded, leadership, founder)',
      emoji: '🎮',
      tagWeights: { 'game-development': 1, embedded: 1 },
      next: 'q_s_root',
    },
  ],
};

const GENERATED_QUESTIONS = generatedGraph as unknown as PersonaQuizQuestion[];

const QUESTIONS: PersonaQuizQuestion[] = [Q1, ...GENERATED_QUESTIONS];

export const personaQuizSampleParameters: FunnelStepPersonaQuiz['parameters'] =
  {
    headline: 'Let me figure out who you are',
    explainer:
      "A few quick yes/no questions and I'll guess your developer profile.",
    entryQuestionId: 'q1_domain',
    questions: QUESTIONS,
    selection: {
      // 10 questions total: Q1 + 9 yes/no. The graph itself terminates via
      // `next: null` at depth 9; this is a safety net.
      maxQuestions: 10,
      targetTotalTags: 8,
      tagConfidenceFloor: 1,
      fallbackTags: ['javascript', 'webdev'],
    },
    revealLookup: personaQuizRevealLookup,
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
