export interface MockPost {
  id: string;
  source: string;
  sourceInitials: string;
  sourceTone: string;
  title: string;
  summary: string;
  tags: string[];
  readTime: number;
  date: string;
  upvotes: string;
  comments: number;
  cover: string;
}

export const posts: MockPost[] = [
  {
    id: 'nextjs',
    source: 'DEV',
    sourceInitials: 'DEV',
    sourceTone: 'bg-text-primary text-surface-invert',
    title: 'It’s not just you, Next.js is getting harder to use',
    summary:
      'The App Router adds real power and real complexity. The author walks through where file-based routing got harder, and which patterns still keep it simple.',
    tags: ['webdev', 'nextjs', 'react'],
    readTime: 7,
    date: 'May 16',
    upvotes: '1.2K',
    comments: 142,
    cover:
      'bg-gradient-to-br from-accent-onion-default to-accent-cabbage-default',
  },
  {
    id: 'rust',
    source: 'The Rust Blog',
    sourceInitials: 'R',
    sourceTone: 'bg-accent-bun-default text-surface-invert',
    title: 'Rust 1.90: faster builds and a new default linker on Linux',
    summary:
      'LLD becomes the default linker on x86_64 Linux, cutting link times on large crates. Cargo also gains native support for workspace publishing.',
    tags: ['rust', 'compilers'],
    readTime: 4,
    date: 'Sep 18',
    upvotes: '864',
    comments: 57,
    cover:
      'bg-gradient-to-br from-accent-bun-default to-accent-ketchup-default',
  },
  {
    id: 'postgres',
    source: 'Supabase',
    sourceInitials: 'S',
    sourceTone: 'bg-accent-avocado-default text-surface-invert',
    title: 'Postgres 18 async I/O, benchmarked on real workloads',
    summary:
      'Sequential scans get up to 3x faster with io_uring. The post measures where the gains show up and where they disappear behind the buffer cache.',
    tags: ['postgres', 'databases'],
    readTime: 9,
    date: 'Sep 21',
    upvotes: '2.4K',
    comments: 88,
    cover:
      'bg-gradient-to-br from-accent-avocado-default to-accent-blueCheese-default',
  },
  {
    id: 'ai-review',
    source: 'GitHub Blog',
    sourceInitials: 'GH',
    sourceTone: 'bg-text-primary text-surface-invert',
    title: 'What we learned shipping AI code review to 10,000 repos',
    summary:
      'False positives kill trust faster than missed bugs. The team explains the ranking change that halved dismissals.',
    tags: ['ai', 'devtools'],
    readTime: 6,
    date: 'Sep 23',
    upvotes: '3.1K',
    comments: 213,
    cover:
      'bg-gradient-to-br from-accent-water-default to-accent-onion-default',
  },
];

export interface MockComment {
  author: string;
  handle: string;
  initials: string;
  tone: string;
  time: string;
  body: string;
  upvotes: number;
}

export const comments: MockComment[] = [
  {
    author: 'Maya Cohen',
    handle: '@mayacodes',
    initials: 'MC',
    tone: 'bg-accent-cabbage-default',
    time: '2h',
    body: 'Pages Router still covers 90% of what my team ships. The App Router is great when you actually need streaming, otherwise it is overhead.',
    upvotes: 48,
  },
  {
    author: 'Dan Ortiz',
    handle: '@dortiz',
    initials: 'DO',
    tone: 'bg-accent-water-default',
    time: '1h',
    body: 'Hard disagree on caching. The new defaults finally make sense once you stop fighting them.',
    upvotes: 31,
  },
  {
    author: 'Priya N.',
    handle: '@priyan',
    initials: 'PN',
    tone: 'bg-accent-avocado-default',
    time: '48m',
    body: 'We moved a 300-route app last quarter. Happy to share the migration checklist if anyone wants it.',
    upvotes: 22,
  },
];

export const feedTabs = ['Popular', 'Most upvoted', 'Best discussed', 'Tags'];

export interface MockEntity {
  name: string;
  meta: string;
  initials: string;
  tone: string;
}

export const squads: MockEntity[] = [
  {
    name: 'React Israel',
    meta: '3.4K members · Frontend',
    initials: 'RI',
    tone: 'bg-accent-water-default text-white',
  },
  {
    name: 'Rustaceans',
    meta: '12K members · Systems',
    initials: 'RS',
    tone: 'bg-accent-bun-default text-white',
  },
  {
    name: 'AI Engineers',
    meta: '28K members · AI',
    initials: 'AI',
    tone: 'bg-accent-cabbage-default text-white',
  },
  {
    name: 'DevOps Daily',
    meta: '9.1K members · Cloud',
    initials: 'DO',
    tone: 'bg-accent-avocado-default text-white',
  },
];

export const sources: MockEntity[] = [
  {
    name: 'DEV',
    meta: '12.2K followers',
    initials: 'DEV',
    tone: 'bg-text-primary text-surface-invert',
  },
  {
    name: 'The Rust Blog',
    meta: '8.4K followers',
    initials: 'R',
    tone: 'bg-accent-bun-default text-white',
  },
  {
    name: 'GitHub Blog',
    meta: '31K followers',
    initials: 'GH',
    tone: 'bg-text-primary text-surface-invert',
  },
  {
    name: 'Supabase',
    meta: '6.9K followers',
    initials: 'S',
    tone: 'bg-accent-avocado-default text-white',
  },
  {
    name: 'Netflix Tech',
    meta: '15K followers',
    initials: 'N',
    tone: 'bg-accent-ketchup-default text-white',
  },
];

export const tags: string[] = [
  'react',
  'ai',
  'webdev',
  'javascript',
  'rust',
  'devops',
  'python',
  'kubernetes',
  'typescript',
  'postgres',
  'security',
  'career',
];

export const headlines: MockEntity[] = [
  {
    name: 'OpenAI ships a new reasoning model for code review',
    meta: '12 min ago · 9 sources',
    initials: '1',
    tone: 'bg-accent-ketchup-default text-white',
  },
  {
    name: 'Node.js 26 drops support for legacy OpenSSL',
    meta: '1h ago · 5 sources',
    initials: '2',
    tone: 'bg-accent-bun-default text-white',
  },
  {
    name: 'Postgres 18 async I/O lands in managed clouds',
    meta: '3h ago · 4 sources',
    initials: '3',
    tone: 'bg-accent-avocado-default text-white',
  },
  {
    name: 'Chrome makes Popover API the default for menus',
    meta: '5h ago · 3 sources',
    initials: '4',
    tone: 'bg-accent-water-default text-white',
  },
];

export const leaders: MockEntity[] = [
  {
    name: 'Maya Cohen',
    meta: '12.4K reputation',
    initials: 'MC',
    tone: 'bg-accent-cabbage-default text-white',
  },
  {
    name: 'Dan Ortiz',
    meta: '9.8K reputation',
    initials: 'DO',
    tone: 'bg-accent-water-default text-white',
  },
  {
    name: 'Priya N.',
    meta: '8.1K reputation',
    initials: 'PN',
    tone: 'bg-accent-avocado-default text-white',
  },
  {
    name: 'Leo Martin',
    meta: '7.7K reputation',
    initials: 'LM',
    tone: 'bg-accent-bun-default text-white',
  },
  {
    name: 'Sara Kim',
    meta: '6.2K reputation',
    initials: 'SK',
    tone: 'bg-accent-bacon-default text-white',
  },
];
