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
  /**
   * Funnel depth the question belongs to. Lower layers are broad
   * (frontend vs backend), higher layers are specific (which language,
   * AI usage, on-call experience). The engine unlocks deeper layers as
   * the belief narrows down.
   */
  layer: number;
}

export interface PersonaEngineConfig {
  /** Confidence needed to stop early once minQuestions is reached. */
  confidenceThreshold: number;
  /** Top belief required to reveal directly instead of offering a tiebreak. */
  tiebreakThreshold: number;
  /** Minimum belief gap between the top two to reveal directly. */
  tiebreakMargin: number;
  /** Below this top belief, fall back to the generalist persona. */
  fallbackFloor: number;
  /** Persona id used when belief is too diffuse to call confidently. */
  fallbackPersonaId: string;
  maxQuestions: number;
  minQuestions: number;
}

export const PERSONAS: DeveloperPersona[] = [
  {
    id: 'polyglot',
    name: 'The Polyglot',
    emoji: '🦊',
    color: '#f59e0b',
    tagline:
      "Your curiosity is too broad to pin down. We'll give you a wide-angle feed.",
  },
  {
    id: 'web-craftsman',
    name: 'The Web Craftsman',
    emoji: '⚛️',
    color: '#06b6d4',
    tagline: 'You ship product. React, TypeScript, the works.',
  },
  {
    id: 'frontend-purist',
    name: 'The Frontend Purist',
    emoji: '🎨',
    color: '#ec4899',
    tagline: "Deep in frontend. You know every framework's quirks.",
  },
  {
    id: 'tooling-nerd',
    name: 'The Tooling Nerd',
    emoji: '🔧',
    color: '#a78bfa',
    tagline: 'VSCode, vim, git, Linux. Your dev environment is sacred.',
  },
  {
    id: 'model-whisperer',
    name: 'The Model Whisperer',
    emoji: '🤖',
    color: '#22c55e',
    tagline: 'Python, models, evals. You build the AI layer itself.',
  },
  {
    id: 'ai-tinkerer',
    name: 'The AI Tinkerer',
    emoji: '🪄',
    color: '#8b5cf6',
    tagline: 'You wire LLMs into web apps. Vibe-coding in Cursor.',
  },
  {
    id: 'systems-hacker',
    name: 'The Systems Hacker',
    emoji: '⚡',
    color: '#f97316',
    tagline: 'Go, Rust, JVM. You write the safe-but-fast version.',
  },
  {
    id: 'backend-veteran',
    name: 'The Backend Veteran',
    emoji: '🛠️',
    color: '#3b82f6',
    tagline: 'SQL, APIs, databases. You make data move.',
  },
  {
    id: 'industry-sage',
    name: 'The Industry Sage',
    emoji: '📰',
    color: '#eab308',
    tagline: "You spot trends before they're trends. You lead the team.",
  },
  {
    id: 'architect',
    name: 'The Architect',
    emoji: '🏛️',
    color: '#14b8a6',
    tagline: 'Microservices, distributed systems, scale. You draw the boxes.',
  },
  {
    id: 'platform-whisperer',
    name: 'The Platform Whisperer',
    emoji: '🐳',
    color: '#0ea5e9',
    tagline: 'Kubernetes, CI/CD, observability. Prod is yours.',
  },
  {
    id: 'app-builder',
    name: 'The App Builder',
    emoji: '📱',
    color: '#f43f5e',
    tagline: 'Native iOS or Android. The store is your stage.',
  },
];

export const QUESTIONS: PersonaQuestion[] = [
  { text: 'You ship the things users see and click on.', layer: 0 },
  { text: 'Your code runs on servers, not in a browser.', layer: 0 },
  {
    text: 'You read more about the industry than you write code these days.',
    layer: 0,
  },
  { text: 'Your main output is a web app people open in a browser.', layer: 1 },
  { text: "You're faster in a terminal than in any GUI.", layer: 1 },
  { text: 'You build apps for iPhone or Android.', layer: 1 },
  {
    text: 'Your day involves Jupyter notebooks, datasets, or training runs.',
    layer: 1,
  },
  { text: 'Your main language is TypeScript or JavaScript.', layer: 2 },
  { text: 'Your main language is Python.', layer: 2 },
  { text: 'Your main language is Go, Rust, or C/C++.', layer: 2 },
  {
    text: 'AI tools are critical to your daily work, not just autocomplete.',
    layer: 2,
  },
  {
    text: "You've shipped code that calls OpenAI, Anthropic, or another LLM API.",
    layer: 2,
  },
  {
    text: "You've spent a weekend customizing your editor or dotfiles.",
    layer: 2,
  },
  {
    text: "You've been the one paged at 3am when production went down.",
    layer: 3,
  },
  { text: "You've fine-tuned an ML model in the last six months.", layer: 2 },
  { text: 'You write more SQL than CSS.', layer: 3 },
  {
    text: "You've drawn boxes and arrows on a whiteboard this month.",
    layer: 3,
  },
  {
    text: 'You know who Stripe, OpenAI, or Anthropic hired last week.',
    layer: 3,
  },
  {
    text: "You specialize in one stack. You don't dabble across many.",
    layer: 2,
  },
  {
    text: "You'd rather read a 30-page postmortem than a quick tutorial.",
    layer: 3,
  },
  { text: 'You ship web apps with AI features built in.', layer: 2 },
];

/**
 * Likelihood matrix: P[persona][question] = probability a member of that
 * persona answers "yes". Trained offline; rows align with PERSONAS, columns
 * with QUESTIONS.
 */
export const PERSONA_QUESTION_LIKELIHOOD: number[][] = [
  [
    0.223, 0.442, 0.0, 0.216, 0.492, 0.007, 0.048, 0.53, 0.193, 0.468, 0.511,
    0.331, 0.316, 0.261, 0.056, 0.348, 0.293, 0.371, 0.01, 0.0, 0.043,
  ],
  [
    0.999, 0.189, 0.0, 1.0, 0.221, 0.02, 0.003, 1.0, 0.109, 0.285, 0.231, 0.193,
    0.193, 0.111, 0.0, 0.243, 0.155, 0.216, 0.008, 0.0, 0.038,
  ],
  [
    1.0, 0.045, 0.0, 1.0, 0.032, 0.024, 0.007, 1.0, 0.063, 0.083, 0.097, 0.065,
    0.05, 0.021, 0.014, 0.068, 0.04, 0.058, 0.9, 0.0, 0.076,
  ],
  [
    0.131, 0.363, 0.018, 0.127, 0.995, 0.012, 0.053, 0.189, 0.207, 0.296, 0.118,
    0.03, 1.0, 0.066, 0.035, 0.079, 0.052, 0.121, 0.188, 0.037, 0.008,
  ],
  [
    0.043, 0.145, 0.051, 0.035, 0.16, 0.012, 0.967, 0.112, 0.95, 0.118, 1.0,
    0.185, 0.165, 0.064, 1.0, 0.104, 0.12, 0.289, 0.204, 0.085, 0.035,
  ],
  [
    0.919, 0.079, 0.0, 0.926, 0.04, 0.011, 0.382, 0.951, 0.411, 0.116, 0.746,
    0.367, 0.05, 0.047, 0.521, 0.089, 0.092, 0.176, 0.017, 0.0, 0.878,
  ],
  [
    0.113, 0.991, 0.0, 0.108, 0.976, 0.015, 0.028, 0.207, 0.137, 0.999, 0.144,
    0.055, 0.195, 0.126, 0.036, 0.198, 0.243, 0.115, 0.094, 0.014, 0.006,
  ],
  [
    0.117, 0.152, 0.0, 0.117, 0.12, 0.014, 0.03, 0.16, 0.12, 0.114, 0.081,
    0.057, 0.087, 0.045, 0.037, 1.0, 0.15, 0.507, 0.163, 0.178, 0.005,
  ],
  [
    0.115, 0.156, 0.379, 0.122, 0.164, 0.008, 0.106, 0.198, 0.248, 0.118, 0.293,
    0.071, 0.157, 0.047, 0.133, 0.147, 0.149, 0.999, 0.119, 0.356, 0.029,
  ],
  [
    0.079, 0.216, 0.1, 0.072, 0.108, 0.019, 0.03, 0.143, 0.119, 0.147, 0.149,
    0.064, 0.052, 0.079, 0.047, 0.326, 0.963, 0.564, 0.067, 0.0, 0.004,
  ],
  [
    0.102, 0.996, 0.0, 0.106, 0.959, 0.009, 0.046, 0.197, 0.163, 0.191, 0.159,
    0.048, 0.207, 0.959, 0.051, 0.213, 0.181, 0.119, 0.131, 0.016, 0.008,
  ],
  [
    0.999, 0.15, 0.0, 0.335, 0.181, 1.0, 0.028, 0.385, 0.12, 0.148, 0.098,
    0.036, 0.137, 0.031, 0.038, 0.082, 0.098, 0.076, 0.213, 0.009, 0.026,
  ],
];

/** Prior probability of each persona, aligned with PERSONAS. */
export const PERSONA_PRIOR: number[] = [
  0.1876, 0.1673, 0.102, 0.0812, 0.0708, 0.0702, 0.0669, 0.0737, 0.0664, 0.0596,
  0.0363, 0.0179,
];

export const PERSONA_ENGINE_CONFIG: PersonaEngineConfig = {
  confidenceThreshold: 0.75,
  tiebreakThreshold: 0.5,
  tiebreakMargin: 0.07,
  fallbackFloor: 0.15,
  fallbackPersonaId: 'polyglot',
  maxQuestions: 12,
  minQuestions: 6,
};
