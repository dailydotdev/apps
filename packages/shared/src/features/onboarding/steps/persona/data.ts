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
  /**
   * When set, a yes answer is treated as a hard self-identification:
   * the engine reveals this persona immediately, regardless of the
   * current belief. Used for niche-locking questions where the answer
   * IS the persona (e.g. 'Security is your primary job').
   */
  lockPersonaId?: string;
  /**
   * When set, this question is mutually exclusive with every other
   * question that shares the same group label. Once any of them is
   * answered yes, the engine stops asking the rest.
   */
  exclusiveGroup?: string;
}

/**
 * A modifier is an orthogonal trait the user can opt into AFTER the
 * persona reveal. Modifiers do not change the primary persona but
 * boost feed content along that dimension (AI tooling content for
 * AI Heavy, founder/startup content for Indie Hacker, etc.).
 */
export interface PersonaModifier {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export interface PersonaEngineConfig {
  /** Confidence needed to stop early once minQuestions is reached. */
  confidenceThreshold: number;
  /** Top belief required to reveal directly instead of offering a tiebreak. */
  tiebreakThreshold: number;
  /** Minimum belief gap between the top two to reveal directly. */
  tiebreakMargin: number;
  /** Below this top belief, offer a three-way pick instead of a two-way tiebreak. */
  triplebreakFloor: number;
  /** Below this top belief, fall back to the generalist persona. */
  fallbackFloor: number;
  /** Persona id used when belief is too diffuse to call confidently. */
  fallbackPersonaId: string;
  maxQuestions: number;
  minQuestions: number;
  /** Top belief required to instantly reveal, overriding minQuestions. */
  instantLockThreshold: number;
  /** Minimum margin between top two beliefs for the instant lock to fire. */
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
    tagline:
      "React, TypeScript, Node, the works. You ship product.",
  },
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    emoji: '🎨',
    color: '#ec4899',
    tagline:
      "Deep in the framework wars. You sweat the details.",
  },
  {
    id: 'ai-specialist',
    name: 'AI Specialist',
    emoji: '🤖',
    color: '#22c55e',
    tagline:
      "You live in Claude, agents, and RAG pipelines. AI is your work.",
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    emoji: '🛠️',
    color: '#3b82f6',
    tagline:
      "SQL, APIs, queues, databases. You make the data move.",
  },
  {
    id: 'software-architect',
    name: 'Software Architect',
    emoji: '🏛️',
    color: '#14b8a6',
    tagline:
      "Microservices, distributed systems, scale. You draw the boxes.",
  },
  {
    id: 'systems-programmer',
    name: 'Systems Programmer',
    emoji: '⚡',
    color: '#f97316',
    tagline:
      "Go, Rust, C++. Memory matters. Performance matters.",
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    emoji: '🐳',
    color: '#0ea5e9',
    tagline:
      "Kubernetes, CI/CD, observability. You keep prod alive.",
  },
  {
    id: 'php-developer',
    name: 'PHP Developer',
    emoji: '🐘',
    color: '#777bb3',
    tagline:
      "Laravel, Symfony, WordPress. The web's quiet workhorse.",
  },
  {
    id: 'security-engineer',
    name: 'Security Engineer',
    emoji: '🛡️',
    color: '#dc2626',
    tagline:
      "CVEs, authentication, attack surface. You find the bugs first.",
  },
  {
    id: 'dotnet-developer',
    name: '.NET Developer',
    emoji: '🟦',
    color: '#512bd4',
    tagline:
      "C#, ASP.NET, Blazor. The Microsoft stack done right.",
  },
  {
    id: 'game-developer',
    name: 'Game Developer',
    emoji: '🎮',
    color: '#a855f7',
    tagline:
      "Unity, Unreal, Godot. You ship frames per second.",
  },
  {
    id: 'mobile-developer',
    name: 'Mobile Developer',
    emoji: '📱',
    color: '#f43f5e',
    tagline:
      "iOS, Android, Flutter. The app store is your stage.",
  },
  {
    id: 'tech-strategist',
    name: 'Tech Strategist',
    emoji: '💼',
    color: '#64748b',
    tagline:
      "Product, design, strategy. You shape what gets built without writing the code.",
  },
];

export const QUESTIONS: PersonaQuestion[] = [
  { text: 'You ship the things users see and click on.', layer: 0, exclusiveGroup: 'primary-domain' },
  { text: 'Your work is mostly backend or infrastructure, not frontend or mobile.', layer: 0, exclusiveGroup: 'primary-domain' },
  { text: 'You don\'t write code as part of your day-to-day job.', layer: 0, lockPersonaId: 'tech-strategist' },
  { text: 'Your main output is a web app people open in a browser.', layer: 1 },
  { text: 'You\'re faster in a terminal than in any GUI.', layer: 1 },
  { text: 'You build apps for iPhone or Android.', layer: 1, lockPersonaId: 'mobile-developer' },
  { text: 'Your day involves Jupyter notebooks, datasets, or training runs.', layer: 1 },
  { text: 'Your main language is TypeScript or JavaScript.', layer: 2, exclusiveGroup: 'main-language' },
  { text: 'Your main language is Python.', layer: 2, exclusiveGroup: 'main-language' },
  { text: 'Your main language is Go, Rust, or C/C++.', layer: 2, exclusiveGroup: 'main-language' },
  { text: 'AI is what you build, not just what you use.', layer: 2, lockPersonaId: 'ai-specialist' },
  { text: 'Your main language is PHP.', layer: 2, lockPersonaId: 'php-developer', exclusiveGroup: 'main-language' },
  { text: 'Your main stack is C# / .NET.', layer: 2, lockPersonaId: 'dotnet-developer', exclusiveGroup: 'main-language' },
  { text: 'You\'ve been the one paged at 3am when production went down.', layer: 3 },
  { text: 'You write more SQL than CSS.', layer: 3 },
  { text: 'You\'ve drawn boxes and arrows on a whiteboard this month.', layer: 3 },
  { text: 'You specialize in one stack. You don\'t dabble across many.', layer: 2 },
  { text: 'You build games or interactive 3D experiences.', layer: 2, lockPersonaId: 'game-developer' },
  { text: 'Security is your primary job, not a side concern.', layer: 2, lockPersonaId: 'security-engineer' },
];

export const MODIFIERS: PersonaModifier[] = [
  {
    id: 'ai-heavy',
    label: 'AI Heavy',
    emoji: '🤖',
    description:
      "You use AI tools (Cursor, Claude, agents) for meaningful chunks of your work.",
  },
  {
    id: 'indie-hacker',
    label: 'Indie Hacker',
    emoji: '🚀',
    description:
      "You're building your own product, startup, or side business.",
  },
  {
    id: 'engineering-leader',
    label: 'Engineering Leader',
    emoji: '📰',
    description:
      "You lead engineers or set technical direction more than you write code.",
  },
];

/**
 * Likelihood matrix: P[persona][question] = probability a member of that
 * persona answers "yes". Rows align with PERSONAS, columns with QUESTIONS.
 * Tech Strategist row and the 'don't write code' column are hand-crafted
 * since that persona isn't yet visible in behavioural clustering.
 */
export const PERSONA_QUESTION_LIKELIHOOD: number[][] = [
  [0.189, 0.273, 0.03, 0.147, 0.414, 0.0, 0.028, 0.357, 0.157, 0.328, 0.003, 0.002, 0.001, 0.185, 0.245, 0.203, 0.034, 0.001, 0.003],
  [1.0, 0.0, 0.02, 1.0, 0.155, 0.0, 0.01, 1.0, 0.081, 0.234, 0.0, 0.008, 0.002, 0.083, 0.201, 0.115, 0.001, 0.002, 0.0],
  [1.0, 0.0, 0.02, 1.0, 0.033, 0.0, 0.004, 1.0, 0.041, 0.064, 0.0, 0.012, 0.003, 0.011, 0.046, 0.026, 0.84, 0.006, 0.006],
  [0.058, 0.06, 0.03, 0.052, 0.08, 0.0, 0.019, 0.088, 0.131, 0.055, 0.885, 0.007, 0.004, 0.041, 0.04, 0.063, 0.564, 0.002, 0.006],
  [0.09, 0.87, 0.02, 0.099, 0.084, 0.0, 0.015, 0.118, 0.09, 0.079, 0.001, 0.006, 0.002, 0.036, 0.999, 0.137, 0.157, 0.002, 0.001],
  [0.05, 0.365, 0.08, 0.062, 0.06, 0.0, 0.011, 0.109, 0.086, 0.102, 0.0, 0.005, 0.002, 0.066, 0.3, 0.909, 0.048, 0.001, 0.001],
  [0.099, 0.854, 0.02, 0.1, 0.948, 0.0, 0.028, 0.169, 0.127, 0.987, 0.002, 0.005, 0.001, 0.119, 0.158, 0.149, 0.065, 0.002, 0.002],
  [0.069, 0.908, 0.05, 0.07, 0.938, 0.0, 0.021, 0.151, 0.111, 0.171, 0.004, 0.004, 0.001, 0.943, 0.234, 0.191, 0.118, 0.001, 0.008],
  [0.989, 0.154, 0.02, 1.0, 0.119, 0.0, 0.006, 0.338, 0.062, 0.151, 0.001, 0.879, 0.001, 0.093, 0.193, 0.075, 0.136, 0.003, 0.004],
  [0.409, 0.465, 0.05, 0.507, 0.162, 0.0, 0.021, 0.507, 0.12, 0.09, 0.003, 0.009, 0.001, 0.045, 0.062, 0.032, 0.135, 0.008, 0.683],
  [0.097, 0.841, 0.02, 0.097, 0.169, 0.0, 0.006, 0.218, 0.045, 0.158, 0.0, 0.003, 0.825, 0.073, 0.207, 0.218, 0.141, 0.008, 0.004],
  [0.946, 0.002, 0.02, 0.169, 0.169, 0.0, 0.028, 0.259, 0.132, 0.209, 0.0, 0.006, 0.01, 0.033, 0.079, 0.05, 0.128, 0.763, 0.002],
  [0.914, 0.0, 0.02, 0.359, 0.119, 1.0, 0.005, 0.376, 0.072, 0.058, 0.016, 0.015, 0.005, 0.025, 0.096, 0.115, 0.142, 0.016, 0.004],
  [0.2, 0.03, 0.95, 0.05, 0.02, 0.03, 0.05, 0.03, 0.05, 0.01, 0.03, 0.01, 0.01, 0.02, 0.05, 0.4, 0.25, 0.02, 0.03],
];

/** Prior probability of each persona (log-shaped to balance large and niche personas). */
export const PERSONA_PRIOR: number[] = [
  0.202, 0.2043, 0.0708, 0.0726, 0.07, 0.1267, 0.0528, 0.0411, 0.0398, 0.0244, 0.0231, 0.0172, 0.0309, 0.0244,
];

export const PERSONA_ENGINE_CONFIG: PersonaEngineConfig = {
  confidenceThreshold: 0.75,
  tiebreakThreshold: 0.5,
  tiebreakMargin: 0.07,
  triplebreakFloor: 0.3,
  fallbackFloor: 0.12,
  fallbackPersonaId: 'generalist-developer',
  maxQuestions: 10,
  minQuestions: 5,
  instantLockThreshold: 0.85,
  instantLockMargin: 0.5,
};
