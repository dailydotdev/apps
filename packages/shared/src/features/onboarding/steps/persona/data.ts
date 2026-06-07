export interface DeveloperPersona {
  /** Stable identifier used when reporting the result forward. */
  id: string;
  name: string;
  emoji: string;
  /** Brand color for the persona, used for glow/silhouette tinting. */
  color: string;
  tagline: string;
}

export interface PersonaQuestion {
  text: string;
  layer: number;
  lockPersonaId?: string;
  exclusiveGroup?: string;
  /**
   * Groups closed when this question is answered yes. Encodes
   * implications across groups (e.g. Q2 "you're backend" = yes
   * closes primary-platform, because backend rules out web/mobile
   * as the main output).
   */
  closesOnYes?: string[];
  /**
   * Groups closed when this question is answered no. Symmetric to
   * closesOnYes for negative implications (e.g. Q1 "you ship UI"
   * = no also closes primary-platform).
   */
  closesOnNo?: string[];
}

export interface PersonaModifier {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export interface PersonaEngineConfig {
  confidenceThreshold: number;
  tiebreakThreshold: number;
  tiebreakMargin: number;
  triplebreakFloor: number;
  fallbackFloor: number;
  fallbackPersonaId: string;
  maxQuestions: number;
  minQuestions: number;
  instantLockThreshold: number;
  instantLockMargin: number;
}

export const PERSONAS: DeveloperPersona[] = [
  {
    id: 'generalist-developer',
    name: 'Generalist Developer',
    emoji: '🦊',
    color: '#f59e0b',
    tagline:
      "Your curiosity is too broad to pin down. We'll give you a wide-angle feed.",
  },
  {
    id: 'full-stack-web-developer',
    name: 'Full-Stack Web Developer',
    emoji: '⚛️',
    color: '#06b6d4',
    tagline: 'React, TypeScript, Node, the works. You ship product.',
  },
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    emoji: '🎨',
    color: '#ec4899',
    tagline: 'Deep in the framework wars. You sweat the details.',
  },
  {
    id: 'ai-specialist',
    name: 'AI Specialist',
    emoji: '🤖',
    color: '#22c55e',
    tagline: 'You live in Claude, agents, and RAG pipelines. AI is your work.',
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    emoji: '🛠️',
    color: '#3b82f6',
    tagline: 'SQL, APIs, queues, databases. You make the data move.',
  },
  {
    id: 'software-architect',
    name: 'Software Architect',
    emoji: '🏛️',
    color: '#14b8a6',
    tagline: 'Microservices, distributed systems, scale. You draw the boxes.',
  },
  {
    id: 'systems-programmer',
    name: 'Systems Programmer',
    emoji: '⚡',
    color: '#f97316',
    tagline: 'Go, Rust, C++. Memory matters. Performance matters.',
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    emoji: '🐳',
    color: '#0ea5e9',
    tagline: 'Kubernetes, CI/CD, observability. You keep prod alive.',
  },
  {
    id: 'php-developer',
    name: 'PHP Developer',
    emoji: '🐘',
    color: '#777bb3',
    tagline: "Laravel, Symfony, WordPress. The web's quiet workhorse.",
  },
  {
    id: 'security-engineer',
    name: 'Security Engineer',
    emoji: '🛡️',
    color: '#dc2626',
    tagline: 'CVEs, authentication, attack surface. You find the bugs first.',
  },
  {
    id: 'dotnet-developer',
    name: '.NET Developer',
    emoji: '🟦',
    color: '#512bd4',
    tagline: 'C#, ASP.NET, Blazor. The Microsoft stack done right.',
  },
  {
    id: 'game-developer',
    name: 'Game Developer',
    emoji: '🎮',
    color: '#a855f7',
    tagline: 'Unity, Unreal, Godot. You ship frames per second.',
  },
  {
    id: 'mobile-developer',
    name: 'Mobile Developer',
    emoji: '📱',
    color: '#f43f5e',
    tagline: 'iOS, Android, Flutter. The app store is your stage.',
  },
  {
    id: 'operator',
    name: 'The Operator',
    emoji: '💼',
    color: '#64748b',
    tagline:
      'Product, design, strategy. You ship outcomes.',
  },
];

export const QUESTIONS: PersonaQuestion[] = [
  {
    text: 'You ship the things users see and click on.',
    layer: 0,
    exclusiveGroup: 'primary-domain',
    closesOnNo: ['primary-platform'],
  },
  {
    text: 'Your work is mostly backend or infrastructure, not frontend or mobile.',
    layer: 0,
    exclusiveGroup: 'primary-domain',
    closesOnYes: ['primary-platform'],
  },
  {
    text: "You don't write code as part of your day-to-day job.",
    layer: 0,
    lockPersonaId: 'operator',
  },
  {
    text: 'Your main output is a web app people open in a browser.',
    layer: 1,
    exclusiveGroup: 'primary-platform',
  },
  { text: "You're faster in a terminal than in any GUI.", layer: 1 },
  {
    text: 'Your daily IDE is Xcode or Android Studio.',
    layer: 1,
    lockPersonaId: 'mobile-developer',
    exclusiveGroup: 'primary-platform',
  },
  {
    text: 'Your day involves Jupyter notebooks, datasets, or training runs.',
    layer: 1,
    exclusiveGroup: 'primary-platform',
  },
  {
    text: 'Your main language is TypeScript or JavaScript.',
    layer: 2,
    exclusiveGroup: 'main-language',
  },
  {
    text: 'Your main language is Python.',
    layer: 2,
    exclusiveGroup: 'main-language',
  },
  {
    text: 'Your main language is Go, Rust, or C/C++.',
    layer: 2,
    exclusiveGroup: 'main-language',
  },
  {
    text: 'Your main language is Java or Kotlin.',
    layer: 2,
    exclusiveGroup: 'main-language',
  },
  {
    text: 'AI is what you build, not just what you use.',
    layer: 2,
    lockPersonaId: 'ai-specialist',
  },
  {
    text: 'Your main language is PHP.',
    layer: 2,
    lockPersonaId: 'php-developer',
    exclusiveGroup: 'main-language',
  },
  {
    text: 'Your main stack is C# / .NET.',
    layer: 2,
    lockPersonaId: 'dotnet-developer',
    exclusiveGroup: 'main-language',
  },
  {
    text: 'Kubernetes, CI/CD, and observability are what you ship.',
    layer: 3,
    lockPersonaId: 'devops-engineer',
  },
  { text: 'You write more SQL than CSS.', layer: 3 },
  {
    text: "You've drawn boxes and arrows on a whiteboard this month.",
    layer: 3,
  },
  {
    text: "You specialize in one stack. You don't dabble across many.",
    layer: 2,
  },
  {
    text: 'You build games or interactive 3D experiences.',
    layer: 2,
    lockPersonaId: 'game-developer',
  },
  {
    text: 'Your week is threat modeling, pen tests, and vulnerability triage.',
    layer: 2,
    lockPersonaId: 'security-engineer',
  },
];

export const MODIFIERS: PersonaModifier[] = [
  {
    id: 'ai-heavy',
    label: 'AI Heavy',
    emoji: '🤖',
    description:
      'You use AI tools (Cursor, Claude, agents) for meaningful chunks of your work.',
  },
  {
    id: 'indie-hacker',
    label: 'Indie Hacker',
    emoji: '🚀',
    description: "You're building your own product, startup, or side business.",
  },
  {
    id: 'engineering-leader',
    label: 'Engineering Leader',
    emoji: '📰',
    description:
      'You lead engineers or set technical direction more than you write code.',
  },
];

/**
 * Likelihood matrix: P[persona][question] = probability a member of that
 * persona answers yes. Computed from 90d engagement data on 93,345 active
 * daily.dev users. 13 engineer-persona rows are data-grounded via K-means.
 * The Operator row and the 'don't write code' column are hand-crafted
 * (non-engineers do not appear in the engagement clustering).
 */
export const PERSONA_QUESTION_LIKELIHOOD: number[][] = [
  [
    0.192, 0.263, 0, 0.148, 0.411, 0.005, 0.029, 0.358, 0.16, 0.331, 0.05,
    0.003, 0.002, 0.001, 0.186, 0.244, 0.206, 0.03, 0.001, 0,
  ],
  [
    0.956, 0.002, 0, 0.955, 0.111, 0.011, 0.008, 0.97, 0.082, 0.189, 0.03,
    0.011, 0.005, 0.001, 0.071, 0.151, 0.103, 0.004, 0.002, 0,
  ],
  [
    1, 0, 0, 1, 0.035, 0.019, 0.005, 1, 0.044, 0.065, 0.01, 0, 0.012, 0.002,
    0.011, 0.045, 0.026, 0.826, 0.006, 0,
  ],
  [
    0.062, 0.052, 0, 0.052, 0.08, 0.006, 0.019, 0.088, 0.131, 0.055, 0.02,
    0.891, 0.007, 0.004, 0.041, 0.04, 0.066, 0.568, 0.002, 0,
  ],
  [
    0.095, 0.863, 0, 0.099, 0.083, 0.005, 0.015, 0.118, 0.091, 0.078, 0.35,
    0.001, 0.006, 0.002, 0.036, 0.999, 0.136, 0.157, 0.002, 0,
  ],
  [
    0.061, 0.214, 0, 0.066, 0.066, 0.006, 0.033, 0.114, 0.152, 0.095, 0.3,
    0.016, 0.005, 0.002, 0.048, 0.213, 0.44, 0.043, 0.001, 0,
  ],
  [
    0.103, 0.85, 0, 0.097, 0.95, 0.006, 0.026, 0.167, 0.126, 0.987, 0.05, 0.002,
    0.005, 0.002, 0.119, 0.159, 0.153, 0.066, 0.002, 0,
  ],
  [
    0.073, 0.9, 0, 0.07, 0.936, 0.007, 0.02, 0.154, 0.111, 0.172, 0.05, 0.004,
    0.004, 0.001, 0.939, 0.234, 0.196, 0.118, 0.001, 0,
  ],
  [
    0.987, 0.13, 0, 0.999, 0.12, 0.009, 0.006, 0.343, 0.066, 0.153, 0.01, 0.001,
    0.876, 0.001, 0.096, 0.197, 0.077, 0.137, 0.003, 0,
  ],
  [
    0.344, 0.479, 0, 0.412, 0.273, 0.014, 0.014, 0.39, 0.1, 0.096, 0.05, 0.027,
    0.028, 0.007, 0.055, 0.077, 0.048, 0.164, 0.009, 0.394,
  ],
  [
    0.1, 0.836, 0, 0.099, 0.171, 0.006, 0.005, 0.217, 0.049, 0.163, 0.02, 0,
    0.003, 0.824, 0.073, 0.205, 0.222, 0.143, 0.008, 0,
  ],
  [
    0.944, 0.001, 0, 0.161, 0.166, 0.022, 0.03, 0.247, 0.143, 0.207, 0.05,
    0.001, 0.006, 0.01, 0.034, 0.079, 0.047, 0.136, 0.771, 0,
  ],
  [
    0.986, 0.002, 0, 0.266, 0.094, 0.989, 0.008, 0.296, 0.077, 0.046, 0.3,
    0.002, 0.007, 0.004, 0.026, 0.101, 0.085, 0.131, 0.01, 0,
  ],
  [
    0.2, 0.03, 0.95, 0.05, 0.02, 0.03, 0.05, 0.03, 0.05, 0.01, 0.01, 0.03, 0.01,
    0.01, 0.02, 0.05, 0.4, 0.25, 0.02, 0.03,
  ],
];

/** Prior probability of each persona (log-shaped to balance large and niche personas). */
export const PERSONA_PRIOR: number[] = [
  0.2163, 0.1645, 0.0746, 0.0754, 0.0732, 0.1093, 0.0543, 0.042, 0.0407, 0.0498,
  0.0241, 0.0181, 0.021, 0.0366,
];

export const PERSONA_ENGINE_CONFIG: PersonaEngineConfig = {
  confidenceThreshold: 0.75,
  tiebreakThreshold: 0.5,
  tiebreakMargin: 0.07,
  triplebreakFloor: 0.3,
  fallbackFloor: 0.12,
  fallbackPersonaId: 'generalist-developer',
  maxQuestions: 12,
  minQuestions: 5,
  instantLockThreshold: 0.85,
  instantLockMargin: 0.5,
};
