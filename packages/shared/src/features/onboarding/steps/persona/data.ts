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
  /** Below this top belief, offer a three-way pick instead of a two-way tiebreak. */
  triplebreakFloor: number;
  /** Below this top belief, fall back to the generalist persona. */
  fallbackFloor: number;
  /** Persona id used when belief is too diffuse to call confidently. */
  fallbackPersonaId: string;
  maxQuestions: number;
  minQuestions: number;
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
    id: 'ai-app-builder',
    name: 'AI App Builder',
    emoji: '🪄',
    color: '#8b5cf6',
    tagline:
      "You wire LLMs into web apps. Cursor is your IDE.",
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
    id: 'engineering-leader',
    name: 'Engineering Leader',
    emoji: '📰',
    color: '#eab308',
    tagline:
      "You read more about leadership and trends than your IDE.",
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
];

export const QUESTIONS: PersonaQuestion[] = [
  { text: 'You ship the things users see and click on.', layer: 0 },
  { text: 'Your code runs on servers, not in a browser.', layer: 0 },
  { text: 'You read more about the industry than you write code these days.', layer: 0 },
  { text: 'Your main output is a web app people open in a browser.', layer: 1 },
  { text: 'You\'re faster in a terminal than in any GUI.', layer: 1 },
  { text: 'You build apps for iPhone or Android.', layer: 1 },
  { text: 'Your day involves Jupyter notebooks, datasets, or training runs.', layer: 1 },
  { text: 'Your main language is TypeScript or JavaScript.', layer: 2 },
  { text: 'Your main language is Python.', layer: 2 },
  { text: 'Your main language is Go, Rust, or C/C++.', layer: 2 },
  { text: 'AI tools are critical to your daily work, not just autocomplete.', layer: 2 },
  { text: 'You\'ve shipped code that calls OpenAI, Anthropic, or another LLM API.', layer: 2 },
  { text: 'You\'ve spent a weekend customizing your editor or dotfiles.', layer: 2 },
  { text: 'You\'ve fine-tuned an ML model in the last six months.', layer: 2 },
  { text: 'AI is what you build, not just what you use.', layer: 2 },
  { text: 'You ship web apps with AI features built in.', layer: 2 },
  { text: 'Your main language is PHP.', layer: 2 },
  { text: 'Your main stack is C# / .NET.', layer: 2 },
  { text: 'You\'ve been the one paged at 3am when production went down.', layer: 3 },
  { text: 'You write more SQL than CSS.', layer: 3 },
  { text: 'You\'ve drawn boxes and arrows on a whiteboard this month.', layer: 3 },
  { text: 'You could tell who Stripe, OpenAI, or Anthropic hired last week.', layer: 3 },
  { text: 'You specialize in one stack. You don\'t dabble across many.', layer: 2 },
  { text: 'You build games or interactive 3D experiences.', layer: 2 },
  { text: 'Security is your primary job, not a side concern.', layer: 2 },
];

/**
 * Likelihood matrix: P[persona][question] = probability a member of that
 * persona answers "yes". Computed from 90 days of engagement data on
 * 93,539 active daily.dev users. Rows align with PERSONAS, columns with
 * QUESTIONS.
 */
export const PERSONA_QUESTION_LIKELIHOOD: number[][] = [
  [0.189, 0.313, 0.006, 0.147, 0.414, 0.0, 0.028, 0.357, 0.157, 0.328, 0.617, 0.276, 0.285, 0.018, 0.003, 0.032, 0.121, 0.085, 0.185, 0.245, 0.203, 0.238, 0.034, 0.036, 0.153],
  [1.0, 0.164, 0.0, 1.0, 0.155, 0.0, 0.01, 1.0, 0.081, 0.234, 0.274, 0.294, 0.099, 0.006, 0.0, 0.247, 0.128, 0.051, 0.083, 0.201, 0.115, 0.162, 0.001, 0.026, 0.112],
  [1.0, 0.043, 0.0, 1.0, 0.033, 0.0, 0.004, 1.0, 0.041, 0.064, 0.112, 0.097, 0.02, 0.002, 0.0, 0.151, 0.054, 0.01, 0.011, 0.046, 0.026, 0.037, 0.84, 0.016, 0.039],
  [0.889, 0.039, 0.0, 0.896, 0.051, 0.0, 0.004, 0.929, 0.078, 0.126, 0.886, 0.504, 0.055, 0.004, 0.026, 0.87, 0.07, 0.026, 0.055, 0.082, 0.086, 0.129, 0.007, 0.016, 0.069],
  [0.058, 0.061, 0.069, 0.052, 0.08, 0.0, 0.019, 0.088, 0.131, 0.055, 1.0, 0.168, 0.056, 0.02, 0.885, 0.039, 0.02, 0.012, 0.041, 0.04, 0.063, 0.16, 0.564, 0.009, 0.029],
  [0.064, 0.121, 0.484, 0.07, 0.074, 0.0, 0.046, 0.119, 0.196, 0.09, 0.661, 0.094, 0.045, 0.044, 0.027, 0.03, 0.032, 0.017, 0.034, 0.145, 0.107, 0.917, 0.04, 0.011, 0.027],
  [0.09, 0.962, 0.007, 0.099, 0.084, 0.0, 0.015, 0.118, 0.09, 0.079, 0.086, 0.083, 0.036, 0.014, 0.001, 0.005, 0.022, 0.014, 0.036, 0.999, 0.137, 0.459, 0.157, 0.006, 0.013],
  [0.05, 0.373, 0.192, 0.062, 0.06, 0.0, 0.011, 0.109, 0.086, 0.102, 0.181, 0.097, 0.017, 0.011, 0.0, 0.008, 0.025, 0.037, 0.066, 0.3, 0.909, 0.517, 0.048, 0.005, 0.023],
  [0.099, 0.966, 0.001, 0.1, 0.948, 0.0, 0.028, 0.169, 0.127, 0.987, 0.182, 0.064, 0.109, 0.024, 0.002, 0.01, 0.03, 0.028, 0.119, 0.158, 0.149, 0.072, 0.065, 0.023, 0.057],
  [0.069, 0.975, 0.0, 0.07, 0.938, 0.0, 0.021, 0.151, 0.111, 0.171, 0.216, 0.077, 0.104, 0.018, 0.004, 0.006, 0.035, 0.021, 0.943, 0.234, 0.191, 0.099, 0.118, 0.009, 0.107],
  [0.989, 0.166, 0.0, 1.0, 0.119, 0.0, 0.006, 0.338, 0.062, 0.151, 0.268, 0.146, 0.084, 0.005, 0.001, 0.023, 1.0, 0.027, 0.093, 0.193, 0.075, 0.097, 0.136, 0.012, 0.131],
  [0.409, 0.927, 0.021, 0.507, 0.162, 0.0, 0.021, 0.507, 0.12, 0.09, 0.139, 0.058, 0.088, 0.012, 0.003, 0.077, 0.038, 0.009, 0.045, 0.062, 0.032, 0.066, 0.135, 0.019, 0.911],
  [0.097, 0.964, 0.0, 0.097, 0.169, 0.0, 0.006, 0.218, 0.045, 0.158, 0.252, 0.084, 0.131, 0.008, 0.0, 0.009, 0.021, 0.999, 0.073, 0.207, 0.218, 0.09, 0.141, 0.026, 0.068],
  [0.946, 0.141, 0.001, 0.169, 0.169, 0.0, 0.028, 0.259, 0.132, 0.209, 0.263, 0.064, 0.074, 0.02, 0.0, 0.025, 0.032, 0.068, 0.033, 0.079, 0.05, 0.137, 0.128, 0.968, 0.042],
  [0.914, 0.151, 0.003, 0.359, 0.119, 1.0, 0.005, 0.376, 0.072, 0.058, 0.231, 0.065, 0.07, 0.005, 0.016, 0.07, 0.032, 0.018, 0.025, 0.096, 0.115, 0.047, 0.142, 0.027, 0.017],
];

/** Prior probability of each persona (log-shaped to balance large and niche personas). */
export const PERSONA_PRIOR: number[] = [
  0.2071, 0.1152, 0.0726, 0.0942, 0.0744, 0.0737, 0.0718, 0.0562, 0.0541, 0.0421, 0.0408, 0.025, 0.0237, 0.0176, 0.0317,
];

export const PERSONA_ENGINE_CONFIG: PersonaEngineConfig = {
  confidenceThreshold: 0.75,
  tiebreakThreshold: 0.5,
  tiebreakMargin: 0.07,
  triplebreakFloor: 0.3,
  fallbackFloor: 0.12,
  fallbackPersonaId: 'generalist-developer',
  maxQuestions: 12,
  minQuestions: 6,
};
