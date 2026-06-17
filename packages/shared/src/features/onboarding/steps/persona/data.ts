export interface DeveloperPersona {
  /** Stable identifier used when reporting the result forward. */
  id: string;
  name: string;
  emoji: string;
  /** Brand color for the persona, used for glow/silhouette tinting. */
  color: string;
  tagline: string;
  /**
   * daily.dev keyword slugs batch-followed when the quiz lands on this
   * persona, seeding the feed. Must be real keyword slugs to take effect.
   */
  tags: string[];
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
  /**
   * Extra keyword slugs followed on top of the persona's tags when this
   * modifier is selected. Must be real keyword slugs to take effect.
   */
  tags: string[];
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
    emoji: '🐙',
    color: '#f59e0b',
    tagline:
      'You dip into JavaScript, Python, and whatever open source is shipping this week.',
    tags: ['webdev', 'javascript', 'python', 'open-source', 'github'],
  },
  {
    id: 'full-stack-web-developer',
    name: 'Full-Stack Web Developer',
    emoji: '⚛️',
    color: '#06b6d4',
    tagline:
      'You ship the whole thing, from the React on top to the Node underneath.',
    tags: ['javascript', 'typescript', 'react', 'nodejs', 'css', 'nextjs'],
  },
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    emoji: '🎨',
    color: '#ec4899',
    tagline:
      'You sweat the pixels, the components, and every framework war worth having.',
    tags: ['react', 'typescript', 'css', 'nextjs', 'tailwind-css', 'svelte'],
  },
  {
    id: 'ai-specialist',
    name: 'AI Specialist',
    emoji: '🤖',
    color: '#22c55e',
    tagline: 'You build with LLMs and agents, not just around them.',
    tags: ['llm', 'ai-agents', 'claude', 'openai', 'rag', 'prompt-engineering'],
  },
  {
    id: 'ml-engineer',
    name: 'ML Engineer',
    emoji: '🧠',
    color: '#10b981',
    tagline: 'You train the models everyone else just calls.',
    tags: [
      'machine-learning',
      'deep-learning',
      'pytorch',
      'computer-vision',
      'nlp',
      'data-science',
    ],
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    emoji: '🛠️',
    color: '#3b82f6',
    tagline: 'You make the data move through APIs, queues, and databases.',
    tags: ['backend', 'postgresql', 'golang', 'sql', 'nodejs', 'redis'],
  },
  {
    id: 'software-architect',
    name: 'Software Architect',
    emoji: '🏛️',
    color: '#14b8a6',
    tagline: 'You draw the boxes and trade-offs that everyone else builds.',
    tags: [
      'architecture',
      'microservices',
      'distributed-systems',
      'design-patterns',
      'backend',
    ],
  },
  {
    id: 'systems-programmer',
    name: 'Systems Programmer',
    emoji: '⚡',
    color: '#f97316',
    tagline:
      'You live close to the metal in Go, Rust, C++, and Zig, fast by default.',
    tags: ['rust', 'golang', 'c++', 'c', 'zig', 'performance'],
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    emoji: '🐳',
    color: '#0ea5e9',
    tagline:
      'You keep prod breathing with Kubernetes, pipelines, and observability.',
    tags: ['kubernetes', 'docker', 'aws', 'cicd', 'observability', 'terraform'],
  },
  {
    id: 'php-developer',
    name: 'PHP Developer',
    emoji: '🐘',
    color: '#777bb3',
    tagline: "You keep the web's quiet workhorse running on PHP.",
    tags: ['php', 'laravel', 'symfony', 'wordpress', 'mysql'],
  },
  {
    id: 'security-engineer',
    name: 'Security Engineer',
    emoji: '🛡️',
    color: '#dc2626',
    tagline: 'You break it before they do, hunting CVEs and attack surface.',
    tags: [
      'security',
      'cyber',
      'vulnerability',
      'appsec',
      'authentication',
      'cryptography',
    ],
  },
  {
    id: 'dotnet-developer',
    name: '.NET Developer',
    emoji: '🟦',
    color: '#512bd4',
    tagline: 'You live deep in the Microsoft stack, from C# to Azure.',
    tags: ['.net', 'aspnet', 'blazor', 'azure', 'visual-studio'],
  },
  {
    id: 'game-developer',
    name: 'Game Developer',
    emoji: '🎮',
    color: '#a855f7',
    tagline: 'You chase sixty frames a second, one render loop at a time.',
    tags: [
      'game-development',
      'unity',
      'unreal-engine',
      'godot',
      'game-design',
    ],
  },
  {
    id: 'mobile-developer',
    name: 'Mobile Developer',
    emoji: '📱',
    color: '#f43f5e',
    tagline: "You ship code straight into people's pockets.",
    tags: ['android', 'ios', 'swift', 'kotlin', 'flutter', 'react-native'],
  },
  {
    id: 'operator',
    name: 'The Operator',
    emoji: '💼',
    color: '#64748b',
    tagline:
      'You ship outcomes, not commits, across product, design, and strategy.',
    tags: [
      'product-management',
      'startup',
      'leadership',
      'ux',
      'ui-design',
      'productivity',
    ],
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
    text: 'Your work is mostly backend or infrastructure.',
    layer: 0,
    exclusiveGroup: 'primary-domain',
    closesOnYes: ['primary-platform'],
  },
  {
    text: 'Coding is a small part of your role.',
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
    text: 'Your day is notebooks, datasets, and training runs.',
    layer: 1,
    lockPersonaId: 'ml-engineer',
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
    text: 'You build products on top of LLMs and AI agents.',
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
    text: 'Your main language is C#.',
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
    text: 'You go deep in one stack rather than dabbling across many.',
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
    description: 'Cursor, Claude, and agents do real chunks of your work.',
    tags: ['ai-coding', 'ai-assisted-development', 'vibe-coding'],
  },
  {
    id: 'founder',
    label: 'Founder',
    emoji: '🚀',
    description: "You're shipping your own product, startup, or side bet.",
    tags: ['startup', 'business', 'product-management'],
  },
  {
    id: 'engineering-leader',
    label: 'Engineering Leader',
    emoji: '👔',
    description:
      'You set direction and grow engineers more than you ship code.',
    tags: ['leadership', 'career', 'productivity'],
  },
];

/**
 * Deduped union of the resolved persona's tags and the tags of every selected
 * modifier. This is the keyword set batch-followed when the quiz concludes.
 */
export const resolveFollowTags = (
  persona: DeveloperPersona,
  selectedModifierIds: string[],
): string[] => {
  const selected = new Set(selectedModifierIds);
  const modifierTags = MODIFIERS.filter((modifier) =>
    selected.has(modifier.id),
  ).flatMap((modifier) => modifier.tags);

  return Array.from(new Set([...persona.tags, ...modifierTags]));
};

/**
 * Likelihood matrix: P[persona][question] = probability a member of that
 * persona answers yes. Computed from 90d engagement data on ~92k active
 * daily.dev users via K-means. The Operator row and the 'don't write code'
 * column are hand-crafted (non-engineers don't appear in the clustering).
 */
export const PERSONA_QUESTION_LIKELIHOOD: number[][] = [
  [
    0.17132, 0.274564, 0, 0.13908, 0.374098, 0, 0, 0.33229, 0.15462, 0.307211,
    0.107158, 0.00243542, 0.00205851, 0.00118872, 0.162274, 0.217303, 0.19953,
    0.0301818, 0, 0.00316024,
  ],
  [
    0.956496, 0.00212214, 0, 0.960092, 0.103042, 0, 0, 0.972353, 0.0832351,
    0.19005, 0.0341311, 0.0142066, 0.00448008, 0.00135581, 0.0695001, 0.140887,
    0.110057, 0.00394954, 0, 0.000471587,
  ],
  [
    1, 0, 0, 1, 0.0302971, 0, 0, 1, 0.0421441, 0.0646728, 0.011847, 0,
    0.0110701, 0.00271897, 0.0112643, 0.0471936, 0.0423383, 0.810643, 0,
    0.0102933,
  ],
  [
    0.0523551, 0.0548913, 0, 0.0532609, 0.0719203, 0, 0, 0.0844203, 0.11558,
    0.0490942, 0.0106884, 0.968116, 0.0057971, 0.00271739, 0.036413, 0.0338768,
    0.0594203, 0.645109, 0, 0.00706522,
  ],
  [
    0.082495, 0.126761, 0, 0.100604, 0.0704225, 0.00402414, 1, 0.104628, 1,
    0.0422535, 0.00804829, 0.0704225, 0.0100604, 0.00804829, 0.0241449,
    0.0925553, 0.0382294, 0.169014, 0, 0.00804829,
  ],
  [
    0.0662522, 0.874879, 0, 0.0866524, 0.0650865, 0, 0, 0.102584, 0.0837381,
    0.0699437, 0.0248689, 0.000194288, 0.00680008, 0.00213717, 0.0316689,
    0.999029, 0.171751, 0.128424, 0, 0.00213717,
  ],
  [
    0.0497947, 0.249179, 0, 0.0684805, 0.0584189, 0, 0, 0.105647, 0.119405,
    0.0734086, 0.0412731, 0.0148871, 0.0036961, 0.00174538, 0.0449692, 0.200616,
    0.444764, 0.0609856, 0, 0.00256674,
  ],
  [
    0.0948818, 0.859922, 0, 0.0918887, 0.954205, 0, 0, 0.180485, 0.129003,
    0.977252, 0.0466926, 0.00209518, 0.00448967, 0.00119725, 0.134092, 0.14786,
    0.155642, 0.0583658, 0, 0.00149656,
  ],
  [
    0.0669856, 0.912679, 0, 0.069378, 0.94378, 0, 0, 0.152711, 0.106858,
    0.165869, 0.0641946, 0.00518341, 0.00279107, 0.0015949, 0.961324, 0.210128,
    0.197767, 0.129585, 0, 0.0099681,
  ],
  [
    0.987699, 0.146165, 0, 0.999276, 0.109986, 0, 0, 0.342619, 0.0680174,
    0.15919, 0.0231548, 0.00108538, 0.880246, 0.00144718, 0.0918958, 0.196093,
    0.0770622, 0.140738, 0, 0.00397974,
  ],
  [
    0.345912, 0.562035, 0, 0.42024, 0.19211, 0, 0, 0.412807, 0.136078,
    0.0897656, 0.0125786, 0.00285878, 0.00857633, 0.00114351, 0.0423099,
    0.0691824, 0.0343053, 0.121784, 0, 0.686106,
  ],
  [
    0.0816761, 0.860085, 0, 0.0802557, 0.144176, 0, 0, 0.199574, 0.0482955,
    0.15483, 0.0262784, 0, 0.00213068, 0.827415, 0.0646307, 0.182528, 0.230114,
    0.138494, 0, 0.00355114,
  ],
  [
    1, 0, 0, 0.180198, 0.150495, 0.0247525, 0.00792079, 0.222772, 0.119802,
    0.148515, 0.0168317, 0.0217822, 0.0128713, 0.0237624, 0.0257426, 0.0633663,
    0.0356436, 0.179208, 1, 0.0158416,
  ],
  [
    0.879567, 0, 0, 0.32544, 0.116373, 1, 0, 0.343708, 0.0818674, 0.0751015,
    0.105548, 0.0250338, 0.0216509, 0.00473613, 0.0290934, 0.102165, 0.135995,
    0.135995, 0, 0.00811908,
  ],
  [
    0.2, 0.03, 0.95, 0.05, 0.02, 0.03, 0.03, 0.03, 0.05, 0.01, 0.01, 0.03, 0.01,
    0.01, 0.02, 0.05, 0.4, 0.25, 0.02, 0.03,
  ],
];

/** Prior probability of each persona (log-shaped). */
export const PERSONA_PRIOR: number[] = [
  0.2262, 0.1583, 0.0724, 0.0763, 0.0092, 0.0724, 0.1133, 0.0516, 0.0407,
  0.0441, 0.0297, 0.0245, 0.018, 0.0256, 0.0377,
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
