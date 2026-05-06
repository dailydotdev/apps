export type PersonaTag =
  | 'frontend'
  | 'backend'
  | 'systems'
  | 'mobile'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'veteran'
  | 'tailwind'
  | 'css-purist'
  | 'type-safe-styles'
  | 'pragmatic'
  | 'systems-leaning'
  | 'enterprise'
  | 'classic-stack'
  | 'whiteboard'
  | 'excalidraw'
  | 'mermaid'
  | 'powerpoint'
  | 'ios'
  | 'android'
  | 'cross-platform'
  | 'game-engines'
  | 'ai-curious'
  | 'ai-bff'
  | 'ai-skeptic'
  | 'ai-allergic';

export interface QuestionOption {
  id: string;
  label: string;
  emoji?: string;
  tags: PersonaTag[];
  next?: string | null;
}

export interface Question {
  id: string;
  prompt: string;
  options: QuestionOption[];
  defaultNext?: string | null;
}

export const FIRST_QUESTION_ID = 'q1_domain';
export const TOTAL_VISIBLE_STEPS = 5;

export const questions: Record<string, Question> = {
  q1_domain: {
    id: 'q1_domain',
    prompt: 'Where do you spend most of your dev hours?',
    options: [
      {
        id: 'frontend',
        emoji: '🎨',
        label: 'Pixel-perfecting UIs and arguing about CSS',
        tags: ['frontend'],
        next: 'q2_frontend',
      },
      {
        id: 'backend',
        emoji: '⚙️',
        label: 'Wrangling APIs, queues, and angry databases',
        tags: ['backend'],
        next: 'q2_backend',
      },
      {
        id: 'systems',
        emoji: '🧱',
        label: 'Drawing boxes and arrows nobody reads',
        tags: ['systems'],
        next: 'q2_systems',
      },
      {
        id: 'mobile',
        emoji: '📱',
        label: 'Building things that move (mobile, games, embedded)',
        tags: ['mobile'],
        next: 'q2_mobile',
      },
    ],
  },
  q2_frontend: {
    id: 'q2_frontend',
    prompt: 'Pick your CSS personality',
    defaultNext: 'q3_experience',
    options: [
      {
        id: 'tailwind',
        emoji: '💨',
        label: 'Tailwind utility maximalist',
        tags: ['tailwind'],
      },
      {
        id: 'vanilla',
        emoji: '🌿',
        label: 'Vanilla CSS — hand-crafted, organic',
        tags: ['css-purist'],
      },
      {
        id: 'css-in-js',
        emoji: '🧪',
        label: "CSS-in-JS, types or it didn't happen",
        tags: ['type-safe-styles'],
      },
      {
        id: 'whatever-works',
        emoji: '🤷',
        label: '"It works in my browser"',
        tags: ['pragmatic'],
      },
    ],
  },
  q2_backend: {
    id: 'q2_backend',
    prompt: 'Pick your weapon of choice',
    defaultNext: 'q3_experience',
    options: [
      {
        id: 'go-rust',
        emoji: '🦀',
        label: 'Go / Rust — fast and angry',
        tags: ['systems-leaning'],
      },
      {
        id: 'node-python',
        emoji: '🐍',
        label: 'Node / Python — gets stuff done',
        tags: ['pragmatic'],
      },
      {
        id: 'java-csharp',
        emoji: '☕',
        label: 'Java / C# — enterprise mode activated',
        tags: ['enterprise'],
      },
      {
        id: 'php-ruby',
        emoji: '💎',
        label: 'PHP / Ruby — vintage but vibing',
        tags: ['classic-stack'],
      },
    ],
  },
  q2_systems: {
    id: 'q2_systems',
    prompt: 'Your favorite diagram tool?',
    defaultNext: 'q3_experience',
    options: [
      {
        id: 'whiteboard',
        emoji: '🖊️',
        label: 'Whiteboard markers and prayer',
        tags: ['whiteboard'],
      },
      {
        id: 'excalidraw',
        emoji: '✏️',
        label: 'Excalidraw — beautiful chaos',
        tags: ['excalidraw'],
      },
      {
        id: 'mermaid',
        emoji: '🧜',
        label: 'Mermaid in markdown — text-based fundamentalist',
        tags: ['mermaid'],
      },
      {
        id: 'powerpoint',
        emoji: '📊',
        label: 'PowerPoint, because someone has to read it',
        tags: ['powerpoint'],
      },
    ],
  },
  q2_mobile: {
    id: 'q2_mobile',
    prompt: 'Pick your battlefield',
    defaultNext: 'q3_experience',
    options: [
      {
        id: 'ios',
        emoji: '🍎',
        label: 'iOS — Swift and stubborn',
        tags: ['ios'],
      },
      {
        id: 'android',
        emoji: '🤖',
        label: 'Android — Kotlin and chaos',
        tags: ['android'],
      },
      {
        id: 'cross-platform',
        emoji: '🌍',
        label: 'Cross-platform (Flutter / React Native)',
        tags: ['cross-platform'],
      },
      {
        id: 'game-engines',
        emoji: '🎮',
        label: 'Game engines (Unity / Unreal)',
        tags: ['game-engines'],
      },
    ],
  },
  q3_experience: {
    id: 'q3_experience',
    prompt: 'How long have you been at this?',
    options: [
      {
        id: 'junior',
        emoji: '🐣',
        label: 'Under a year — still wide-eyed',
        tags: ['junior'],
        next: 'q4_junior',
      },
      {
        id: 'mid',
        emoji: '🧑‍💻',
        label: 'A few years deep',
        tags: ['mid'],
        next: 'q4_mid',
      },
      {
        id: 'senior',
        emoji: '🧙',
        label: 'Senior — saw the rise of microservices',
        tags: ['senior'],
        next: 'q4_senior',
      },
      {
        id: 'veteran',
        emoji: '🦖',
        label: 'I have war stories',
        tags: ['veteran'],
        next: 'q4_senior',
      },
    ],
  },
  q4_junior: {
    id: 'q4_junior',
    prompt: "What saves you when you're stuck?",
    defaultNext: 'q5_ai',
    options: [
      {
        id: 'stack-overflow',
        emoji: '🪜',
        label: 'Stack Overflow + four browser tabs',
        tags: [],
      },
      {
        id: 'llm-therapy',
        emoji: '🤖',
        label: "An LLM chat that's basically my therapist",
        tags: ['ai-bff'],
      },
      {
        id: 'senior-pity',
        emoji: '🧑‍🏫',
        label: 'A senior teammate pity-coding with me',
        tags: [],
      },
      {
        id: 'actual-docs',
        emoji: '📚',
        label: 'Reading the actual docs (rare flex)',
        tags: [],
      },
    ],
  },
  q4_mid: {
    id: 'q4_mid',
    prompt: "What's your kryptonite at work?",
    defaultNext: 'q5_ai',
    options: [
      {
        id: 'vague-tickets',
        emoji: '🎫',
        label: 'Vague Jira tickets',
        tags: [],
      },
      {
        id: 'long-meetings',
        emoji: '📞',
        label: '"Quick" meetings that take 90 minutes',
        tags: [],
      },
      {
        id: 'pr-comments',
        emoji: '💬',
        label: "That one teammate's PR comments",
        tags: [],
      },
      {
        id: 'friday-deploys',
        emoji: '🚀',
        label: 'Friday afternoon deploys',
        tags: [],
      },
    ],
  },
  q4_senior: {
    id: 'q4_senior',
    prompt: "What's your guilty engineering pleasure?",
    defaultNext: 'q5_ai',
    options: [
      {
        id: 'sneaky-rewrite',
        emoji: '🛠️',
        label: 'Rewriting a legacy module nobody asked you to touch',
        tags: [],
      },
      {
        id: 'cache-problem',
        emoji: '🧠',
        label: 'Saying "actually, that\'s a cache problem" in every meeting',
        tags: [],
      },
      {
        id: 'rubber-stamp',
        emoji: '✅',
        label: 'Approving PRs without reading them (then regretting it)',
        tags: [],
      },
      {
        id: 'mentor-escape',
        emoji: '🧑‍🏫',
        label: "Mentoring juniors so you don't have to fix the bug yourself",
        tags: [],
      },
    ],
  },
  q5_ai: {
    id: 'q5_ai',
    prompt: 'Pick your AI relationship status',
    defaultNext: null,
    options: [
      {
        id: 'complicated',
        emoji: '😬',
        label: "It's complicated — we copy/paste",
        tags: ['ai-curious'],
      },
      {
        id: 'best-friends',
        emoji: '💞',
        label: 'Best friends — pair-programming daily',
        tags: ['ai-bff'],
      },
      {
        id: 'skeptical',
        emoji: '🧐',
        label: 'Skeptical — I review every line',
        tags: ['ai-skeptic'],
      },
      {
        id: 'allergic',
        emoji: '🚫',
        label: 'Allergic — I write all my code by hand',
        tags: ['ai-allergic'],
      },
    ],
  },
};

export const getNextQuestionId = (
  question: Question,
  optionId: string,
): string | null => {
  const option = question.options.find((opt) => opt.id === optionId);
  if (!option) {
    throw new Error(
      `Option "${optionId}" not found on question "${question.id}"`,
    );
  }
  if (option.next !== undefined) {
    return option.next;
  }
  return question.defaultNext ?? null;
};
