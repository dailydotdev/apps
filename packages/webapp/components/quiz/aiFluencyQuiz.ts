export const aiFluencyTierOrder = [
  'casualUser',
  'promptDeveloper',
  'agenticDeveloper',
  'aiEngineer',
  'aiSystemArchitect',
  'aiPlatformDeveloper',
  'aiPioneer',
] as const;

export type AiFluencyTierKey = (typeof aiFluencyTierOrder)[number];

export interface AiFluencyTier {
  key: AiFluencyTierKey;
  label: string;
  summary: string;
}

export interface AiFluencyQuestionOption {
  id: string;
  label: string;
  tier: AiFluencyTierKey;
}

export interface AiFluencyQuestion {
  id: string;
  prompt: string;
  options: AiFluencyQuestionOption[];
}

const getSeedFromString = (value: string): number => {
  return value.split('').reduce((hash, char, index) => {
    return (hash * 31 + char.charCodeAt(0) * (index + 1)) % 2147483647;
  }, 1);
};

const createSeededRandom = (seed: number): (() => number) => {
  let currentSeed = seed % 2147483647;
  if (currentSeed <= 0) {
    currentSeed += 2147483646;
  }

  return () => {
    currentSeed = (currentSeed * 16807) % 2147483647;
    return (currentSeed - 1) / 2147483646;
  };
};

const tierScoreMap: Record<AiFluencyTierKey, number> = {
  casualUser: 1,
  promptDeveloper: 2,
  agenticDeveloper: 3,
  aiEngineer: 4,
  aiSystemArchitect: 5,
  aiPlatformDeveloper: 6,
  aiPioneer: 7,
};

export const aiFluencyTiers: AiFluencyTier[] = [
  {
    key: 'casualUser',
    label: 'Casual User',
    summary: 'Uses AI for quick answers and light one-shot help.',
  },
  {
    key: 'promptDeveloper',
    label: 'Prompt Developer',
    summary: 'Uses structured prompts and iteration to produce better output.',
  },
  {
    key: 'agenticDeveloper',
    label: 'Agentic Developer',
    summary: 'Works with multi-step AI workflows and context-aware prompting.',
  },
  {
    key: 'aiEngineer',
    label: 'AI Engineer',
    summary:
      'Builds production-grade AI features with evaluation, safety, and reliability in mind.',
  },
  {
    key: 'aiSystemArchitect',
    label: 'AI System Architect',
    summary:
      'Designs end-to-end AI systems with orchestration, governance, and operating standards.',
  },
  {
    key: 'aiPlatformDeveloper',
    label: 'AI Platform Developer',
    summary:
      'Creates reusable AI platforms, internal tooling, and scalable enablement for teams.',
  },
  {
    key: 'aiPioneer',
    label: 'AI Pioneer',
    summary:
      'Shapes new AI practices, drives innovation, and influences organizational strategy.',
  },
];

const aiFluencyTierByKey = aiFluencyTiers.reduce((acc, tier) => {
  acc[tier.key] = tier;
  return acc;
}, {} as Record<AiFluencyTierKey, AiFluencyTier>);

export const aiFluencyQuestions: AiFluencyQuestion[] = [
  {
    id: 'task-start',
    prompt: 'How do you start a new task with AI?',
    options: [
      {
        id: 'task-start-quick-answer',
        label: 'I ask for a quick answer and copy what I need.',
        tier: 'casualUser',
      },
      {
        id: 'task-start-prompt-template',
        label: 'I start with a reusable prompt and refine it.',
        tier: 'promptDeveloper',
      },
      {
        id: 'task-start-plan-workflow',
        label: 'I ask AI to break work into steps and keep context.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'task-start-evals',
        label:
          'Before building, I define success checks, edge cases, and evals.',
        tier: 'aiEngineer',
      },
      {
        id: 'task-start-systems',
        label: 'I plan how this fits our AI architecture and governance.',
        tier: 'aiSystemArchitect',
      },
    ],
  },
  {
    id: 'context-management',
    prompt: 'How do you keep context in longer AI sessions?',
    options: [
      {
        id: 'context-management-none',
        label: 'I usually start a new chat each time.',
        tier: 'casualUser',
      },
      {
        id: 'context-management-manual',
        label: 'I paste prior context manually when needed.',
        tier: 'promptDeveloper',
      },
      {
        id: 'context-management-structured',
        label: 'I keep a structured brief and reuse it between prompts.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'context-management-state',
        label: 'I use memory/state patterns for reliable multi-step work.',
        tier: 'aiEngineer',
      },
      {
        id: 'context-management-platform',
        label: 'I define shared context standards for teams and tools.',
        tier: 'aiPlatformDeveloper',
      },
    ],
  },
  {
    id: 'quality-check',
    prompt: 'How do you check AI output quality?',
    options: [
      {
        id: 'quality-check-skim',
        label: 'I do a quick scan and move on if it looks right.',
        tier: 'casualUser',
      },
      {
        id: 'quality-check-manual',
        label: 'I manually test obvious cases and fix issues as they come up.',
        tier: 'promptDeveloper',
      },
      {
        id: 'quality-check-checklist',
        label: 'I use a checklist for accuracy, security, and style.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'quality-check-evals',
        label: 'I run repeatable evals and track pass/fail trends over time.',
        tier: 'aiEngineer',
      },
      {
        id: 'quality-check-org-standard',
        label: 'I set org-wide eval standards and guardrails.',
        tier: 'aiSystemArchitect',
      },
    ],
  },
  {
    id: 'tooling',
    prompt: 'Which best describes your AI tools setup?',
    options: [
      {
        id: 'tooling-single-chat',
        label: 'Mostly one chat tool, used ad hoc.',
        tier: 'casualUser',
      },
      {
        id: 'tooling-multi-tool',
        label: 'A few tools with a lightweight workflow.',
        tier: 'promptDeveloper',
      },
      {
        id: 'tooling-agent-workflow',
        label: 'A toolchain with clear roles (research, draft, review).',
        tier: 'agenticDeveloper',
      },
      {
        id: 'tooling-service-integration',
        label: 'Integrated AI services with monitoring and fallbacks.',
        tier: 'aiEngineer',
      },
      {
        id: 'tooling-platform',
        label: 'An internal platform teams can reuse across the org.',
        tier: 'aiPlatformDeveloper',
      },
    ],
  },
  {
    id: 'automation',
    prompt: 'How much do you automate AI workflows?',
    options: [
      {
        id: 'automation-none',
        label: 'Very little, mostly manual prompts.',
        tier: 'casualUser',
      },
      {
        id: 'automation-basic',
        label: 'Simple scripts for repeated prompts.',
        tier: 'promptDeveloper',
      },
      {
        id: 'automation-agent',
        label: 'Semi-automated agents with checkpoints and approvals.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'automation-production',
        label:
          'Reliable production automation with observability and rollback.',
        tier: 'aiEngineer',
      },
      {
        id: 'automation-program',
        label: 'Enterprise automation standards used by multiple teams.',
        tier: 'aiSystemArchitect',
      },
    ],
  },
  {
    id: 'collaboration',
    prompt: 'How do you work with teammates on AI tasks?',
    options: [
      {
        id: 'collaboration-solo',
        label: 'Mostly solo and informal.',
        tier: 'casualUser',
      },
      {
        id: 'collaboration-share-prompts',
        label: 'I share useful prompts and examples in docs or chat.',
        tier: 'promptDeveloper',
      },
      {
        id: 'collaboration-repeatable-playbooks',
        label: 'I maintain shared playbooks for repeatable AI workflows.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'collaboration-review-process',
        label: 'I run structured review for AI output and prompt logic.',
        tier: 'aiEngineer',
      },
      {
        id: 'collaboration-enable-org',
        label: 'I lead enablement and standards for AI adoption.',
        tier: 'aiPlatformDeveloper',
      },
    ],
  },
  {
    id: 'risk-and-safety',
    prompt: 'How do you handle AI risk and safety?',
    options: [
      {
        id: 'risk-and-safety-reactive',
        label: 'I fix issues only when they appear.',
        tier: 'casualUser',
      },
      {
        id: 'risk-and-safety-basic-checks',
        label: 'I run basic checks for sensitive output.',
        tier: 'promptDeveloper',
      },
      {
        id: 'risk-and-safety-scenarios',
        label: 'I test common failure cases and document fixes.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'risk-and-safety-guardrails',
        label: 'I implement guardrails, red teaming, and escalation paths.',
        tier: 'aiSystemArchitect',
      },
      {
        id: 'risk-and-safety-frontier',
        label:
          'I help define advanced safety practices for new model behavior.',
        tier: 'aiPioneer',
      },
    ],
  },
  {
    id: 'measurement',
    prompt: 'How do you measure impact from AI usage?',
    options: [
      {
        id: 'measurement-feel',
        label: 'I rely on gut feel and personal productivity gains.',
        tier: 'casualUser',
      },
      {
        id: 'measurement-basic-metrics',
        label: 'I track a few simple metrics manually (time saved, output).',
        tier: 'promptDeveloper',
      },
      {
        id: 'measurement-team-metrics',
        label: 'I track team outcomes tied to specific workflows.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'measurement-product-metrics',
        label:
          'I track model quality with product and business metrics in dashboards.',
        tier: 'aiEngineer',
      },
      {
        id: 'measurement-strategy',
        label:
          'I define strategic KPIs for AI programs across teams and products.',
        tier: 'aiSystemArchitect',
      },
    ],
  },
  {
    id: 'infrastructure',
    prompt: 'How involved are you in AI infrastructure decisions?',
    options: [
      {
        id: 'infrastructure-none',
        label: 'Not involved.',
        tier: 'casualUser',
      },
      {
        id: 'infrastructure-light',
        label: 'I pick tools and models for my own work.',
        tier: 'promptDeveloper',
      },
      {
        id: 'infrastructure-team',
        label:
          'I help choose shared tools and integration patterns for my team.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'infrastructure-production',
        label:
          'I design reliable infrastructure for model orchestration and lifecycle.',
        tier: 'aiPlatformDeveloper',
      },
      {
        id: 'infrastructure-frontier',
        label:
          'I drive new infrastructure approaches for next-generation AI systems.',
        tier: 'aiPioneer',
      },
    ],
  },
  {
    id: 'future-readiness',
    prompt: 'How do you stay current as AI changes quickly?',
    options: [
      {
        id: 'future-readiness-occasional',
        label: 'I check updates once in a while.',
        tier: 'casualUser',
      },
      {
        id: 'future-readiness-routine',
        label: 'I test new techniques as they become popular.',
        tier: 'promptDeveloper',
      },
      {
        id: 'future-readiness-deliberate',
        label: 'I run planned experiments and capture what I learn.',
        tier: 'agenticDeveloper',
      },
      {
        id: 'future-readiness-roadmap',
        label: 'I maintain a roadmap to adopt advanced capabilities safely.',
        tier: 'aiSystemArchitect',
      },
      {
        id: 'future-readiness-shape-market',
        label:
          'I publish and prototype, and shape how others adopt new AI patterns.',
        tier: 'aiPioneer',
      },
    ],
  },
];

export const getShuffledAiFluencyQuestionOptions = (
  question: AiFluencyQuestion,
): AiFluencyQuestionOption[] => {
  const random = createSeededRandom(getSeedFromString(question.id));
  const options = [...question.options];

  for (let index = options.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    [options[index], options[nextIndex]] = [options[nextIndex], options[index]];
  }

  return options;
};

const optionTierById = aiFluencyQuestions.reduce((acc, question) => {
  question.options.forEach((option) => {
    acc[option.id] = option.tier;
  });
  return acc;
}, {} as Record<string, AiFluencyTierKey>);

export const aiFluencyTipsByTier: Record<AiFluencyTierKey, string[]> = {
  casualUser: [
    'Use a simple prompt template: context, task, constraints, expected output.',
    'Compare at least two prompt variations before choosing an answer.',
    'Review output for correctness and edge cases before applying it.',
  ],
  promptDeveloper: [
    'Break complex tasks into multi-step prompts with explicit checkpoints.',
    'Store reusable prompts and examples in a shared playbook.',
    'Start measuring quality and time saved for your most frequent workflows.',
  ],
  agenticDeveloper: [
    'Add lightweight evals to verify outputs across common scenarios.',
    'Introduce guardrails for security, privacy, and hallucination risks.',
    'Automate repetitive AI workflows with clear human approval points.',
  ],
  aiEngineer: [
    'Standardize evaluation datasets and pass/fail thresholds.',
    'Instrument production usage with monitoring and error classification.',
    'Document model selection criteria and fallback behavior for reliability.',
  ],
  aiSystemArchitect: [
    'Codify AI architecture standards shared across teams and products.',
    'Create governance processes for risk reviews and policy enforcement.',
    'Build capability maps so teams can self-serve approved AI patterns.',
  ],
  aiPlatformDeveloper: [
    'Invest in reusable platform primitives to accelerate safe experimentation.',
    'Expand internal developer education for advanced AI workflows.',
    'Benchmark emerging models and techniques against strategic objectives.',
  ],
  aiPioneer: [
    'Keep publishing reference architectures and lessons learned.',
    'Mentor AI leads and scale decision-making frameworks organization-wide.',
    'Push frontier experiments while preserving safety and governance rigor.',
  ],
};

export const getAiFluencyTierByKey = (
  key?: string,
): AiFluencyTier | undefined => {
  if (!key || !(key in aiFluencyTierByKey)) {
    return undefined;
  }

  return aiFluencyTierByKey[key as AiFluencyTierKey];
};

export const getAiFluencyTierFromAnswers = (
  answers: Record<string, string>,
): AiFluencyTier => {
  const selectedQuestionScores = aiFluencyQuestions
    .map((question) => {
      const tier = optionTierById[answers[question.id]];

      if (!tier) {
        return null;
      }

      const optionScores = question.options.map(
        ({ tier: optionTier }) => tierScoreMap[optionTier],
      );

      return {
        selectedScore: tierScoreMap[tier],
        minScore: Math.min(...optionScores),
        maxScore: Math.max(...optionScores),
      };
    })
    .filter(
      (
        score,
      ): score is {
        selectedScore: number;
        minScore: number;
        maxScore: number;
      } => Boolean(score),
    );

  if (!selectedQuestionScores.length) {
    return aiFluencyTiers[0];
  }

  const totalScore = selectedQuestionScores.reduce(
    (sum, { selectedScore }) => sum + selectedScore,
    0,
  );
  const minPossibleScore = selectedQuestionScores.reduce(
    (sum, { minScore }) => sum + minScore,
    0,
  );
  const maxPossibleScore = selectedQuestionScores.reduce(
    (sum, { maxScore }) => sum + maxScore,
    0,
  );
  const normalizedScore =
    maxPossibleScore === minPossibleScore
      ? 1
      : ((totalScore - minPossibleScore) /
          (maxPossibleScore - minPossibleScore)) *
          6 +
        1;
  const roundedScore = Math.round(normalizedScore);
  const tierIndex = Math.min(
    aiFluencyTiers.length - 1,
    Math.max(0, roundedScore - 1),
  );

  return aiFluencyTiers[tierIndex];
};

export const getAiFluencyNextTier = (
  currentTierKey: AiFluencyTierKey,
): AiFluencyTier | null => {
  const currentIndex = aiFluencyTierOrder.indexOf(currentTierKey);
  const nextKey = aiFluencyTierOrder[currentIndex + 1];

  if (!nextKey) {
    return null;
  }

  return aiFluencyTierByKey[nextKey];
};
