// Every person, company and project here is fictional.

export const NOW = new Date('2026-10-14T10:00:00Z');

export const DAILY_REACH_OUTS = 5;
export const PITCH_MAX_LENGTH = 280;
export const ANSWER_MAX_LENGTH = 200;
export const MAX_ASKS = 3;
export const MAX_TAGS = 5;
export const POST_LIFETIME_DAYS = 30;
// A post stops taking reach-outs while this many wait for an answer.
export const PENDING_CAP = 10;
// The steps of the board's reputation filter.
export const REPUTATION_STEPS = [100, 500, 1000];
// Every UTC offset in use, for picking time zones posts don't come from yet.
export const UTC_OFFSETS = [
  -12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4, -3.5, -3, -2, -1, 0, 1, 2, 3,
  3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.75, 9, 9.5, 10, 10.5, 11, 12,
  12.75, 13, 14,
];

export enum LfgKind {
  Build = 'build',
  Learn = 'learn',
  Help = 'help',
}

export enum Commitment {
  OneCall = 'one_call',
  FewWeeks = 'few_weeks',
  Ongoing = 'ongoing',
}

export const commitmentLabel: Record<Commitment, string> = {
  [Commitment.OneCall]: 'One call',
  [Commitment.FewWeeks]: 'A few weeks',
  [Commitment.Ongoing]: 'Ongoing',
};

export const kindLabel: Record<LfgKind, string> = {
  [LfgKind.Build]: 'Build',
  [LfgKind.Learn]: 'Learn',
  [LfgKind.Help]: 'Help',
};

export const kindBlurb: Record<LfgKind, string> = {
  [LfgKind.Build]: 'A teammate, a co-founder, contributors',
  [LfgKind.Learn]: 'A learning buddy, a study partner, accountability',
  [LfgKind.Help]: 'A mentor, a quick consult, a code or design review',
};

export const rolesByKind: Record<LfgKind, string[]> = {
  [LfgKind.Build]: ['Teammate', 'Co-founder', 'Contributor'],
  [LfgKind.Learn]: ['Learning buddy', 'Study partner', 'Accountability'],
  [LfgKind.Help]: ['Mentor', 'Quick consult', 'Code review'],
};

export interface LfgUser {
  id: string;
  name: string;
  username: string;
  image: string;
  permalink: string;
  bio: string;
  title: string;
  reputation: number;
  joined: string;
  timezone: string;
  utcOffset: number;
  country: string;
  company?: string;
  github?: string;
  streak?: number;
  // From the work experience on the profile, typed in or filled from a CV.
  experienceYears?: number;
}

export const avatar = (n: number): string =>
  `https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/${n}`;

const person = (
  user: Omit<LfgUser, 'permalink' | 'image'> & { avatar: number },
): LfgUser => {
  const { avatar: index, ...rest } = user;
  return {
    ...rest,
    image: avatar(index),
    permalink: `https://app.daily.dev/${user.username}`,
  };
};

export const ME_ID = 'noa';

export const users: Record<string, LfgUser> = {
  noa: person({
    id: 'noa',
    name: 'Noa Brenner',
    username: 'noab',
    avatar: 1,
    title: 'Full-stack developer',
    bio: 'TypeScript and Postgres. Building small tools for data teams.',
    reputation: 1840,
    joined: '2023-03-02',
    timezone: 'UTC+2',
    utcOffset: 2,
    country: 'Israel',
    company: 'Tidepool',
    github: 'noab',
    streak: 23,
    experienceYears: 6,
  }),
  jonas: person({
    id: 'jonas',
    name: 'Jonas Richter',
    username: 'jrichter',
    avatar: 2,
    title: 'Founder, robotics',
    bio: 'Second-time founder. Robots by day, process data by night.',
    reputation: 640,
    joined: '2024-11-18',
    timezone: 'UTC+1',
    utcOffset: 1,
    country: 'Germany',
    company: 'Kantwerk Robotics',
    github: 'jrichter',
  }),
  wei: person({
    id: 'wei',
    name: 'Wei Chen',
    username: 'weichen',
    avatar: 5,
    title: 'AI engineer',
    bio: 'Agents, MCP servers and evals, mostly for nonprofits.',
    reputation: 220,
    joined: '2025-06-09',
    timezone: 'UTC+8',
    utcOffset: 8,
    country: 'Singapore',
    github: 'weichen-dev',
  }),
  amara: person({
    id: 'amara',
    name: 'Amara Okafor',
    username: 'amarao',
    avatar: 6,
    title: 'Backend developer',
    bio: 'Go and distributed systems. Preparing for senior interviews.',
    reputation: 90,
    joined: '2026-01-21',
    timezone: 'UTC+1',
    utcOffset: 1,
    country: 'Nigeria',
    streak: 41,
  }),
  luca: person({
    id: 'luca',
    name: 'Luca Romano',
    username: 'lromano',
    avatar: 7,
    title: '.NET developer',
    bio: 'ASP.NET Core APIs for small internal teams.',
    reputation: 1120,
    joined: '2022-09-14',
    timezone: 'UTC+1',
    utcOffset: 1,
    country: 'Italy',
  }),
  priya: person({
    id: 'priya',
    name: 'Priya Nair',
    username: 'priyanair',
    avatar: 8,
    title: 'Staff engineer',
    bio: 'Backend platforms. I like helping people move from frontend to backend.',
    reputation: 8400,
    joined: '2021-04-30',
    timezone: 'UTC+5:30',
    utcOffset: 5.5,
    country: 'India',
    company: 'Lumaro',
    github: 'priyanair',
    experienceYears: 12,
  }),
  elif: person({
    id: 'elif',
    name: 'Elif Kaya',
    username: 'elifk',
    avatar: 4,
    title: 'Systems programmer',
    bio: 'C, FreeBSD and containers, mostly for fun.',
    reputation: 150,
    joined: '2025-12-03',
    timezone: 'UTC+3',
    utcOffset: 3,
    country: 'Turkey',
    github: 'elifk',
  }),
  lior: person({
    id: 'lior',
    name: 'Lior Ben-David',
    username: 'liorbd',
    avatar: 2,
    title: 'Backend engineer',
    bio: 'Rust and Postgres internals. Maintains a couple of CLI tools.',
    reputation: 2950,
    joined: '2022-07-19',
    timezone: 'UTC+2',
    utcOffset: 2,
    country: 'Israel',
    company: 'Gridline',
    github: 'liorbd',
    streak: 64,
    experienceYears: 9,
  }),
  ravi: person({
    id: 'ravi',
    name: 'Ravi Menon',
    username: 'ravimenon',
    avatar: 3,
    title: 'Backend developer',
    bio: 'Payments backend at a small startup. Postgres all the way down.',
    reputation: 410,
    joined: '2024-05-12',
    timezone: 'UTC+5:30',
    utcOffset: 5.5,
    country: 'India',
    github: 'ravimenon',
  }),
  sam: person({
    id: 'sam',
    name: 'Sam Ortiz',
    username: 'samortiz',
    avatar: 5,
    title: 'Junior developer',
    bio: 'Learning Go, shipping small CLIs.',
    reputation: 40,
    joined: '2026-08-30',
    timezone: 'UTC-3',
    utcOffset: -3,
    country: 'Argentina',
    streak: 12,
  }),
  growth: person({
    id: 'growth',
    name: 'Fast MVP Studio',
    username: 'fastmvp_studio',
    avatar: 6,
    title: 'We build your MVP',
    bio: 'Agency. 200+ apps shipped.',
    reputation: 10,
    joined: '2026-10-11',
    timezone: 'UTC+0',
    utcOffset: 0,
    country: 'United Kingdom',
  }),
  dana: person({
    id: 'dana',
    name: 'Dana Weiss',
    username: 'danaw',
    avatar: 7,
    title: 'Data engineer',
    bio: 'dbt, Airflow and too many migrations.',
    reputation: 760,
    joined: '2024-02-08',
    timezone: 'UTC+1',
    utcOffset: 1,
    country: 'Netherlands',
    github: 'danaw',
    experienceYears: 4,
  }),
  kai: person({
    id: 'kai',
    name: 'Kai Mendel',
    username: 'kaimendel',
    avatar: 4,
    title: 'Recruiting partner',
    bio: 'Connecting builders with great teams.',
    reputation: 10,
    joined: '2026-10-12',
    timezone: 'UTC+0',
    utcOffset: 0,
    country: 'United Kingdom',
  }),
};

export const me = users[ME_ID];

// Stand-in for spam detection: brand-new accounts pitching paid services.
export const spamReasons: Record<string, string> = {
  growth:
    "Looks like a sales pitch from a new account. Looking for group is pro bono, so selling services isn't allowed.",
};

// Payment and hiring language. Looking for group is pro bono, so posts and
// pitches that put a price on it are held back.
export const moneyPattern =
  /([$€£]\s?\d|\d\s?(usd|eur|k)\b|\b(paid|paying|salary|hourly|per hour|\/hr|rate|budget|invoice|hiring|hire|freelanc\w*|contract work|fixed price)\b)/i;

/* ------------------------------------------------------------------ tags */

// A slice of the tags that already exist on daily.dev. Posts pick from these
// so they match what people follow.
export const knownTags = [
  'ai',
  'ai-agents',
  'android',
  'architecture',
  'aws',
  'backend',
  'c',
  'caching',
  'career',
  'cli',
  'containers',
  'csharp',
  'data-engineering',
  'data-visualization',
  'devops',
  'docker',
  'dotnet',
  'flutter',
  'freebsd',
  'frontend',
  'go',
  'interviews',
  'ios',
  'java',
  'javascript',
  'kubernetes',
  'llm',
  'machine-learning',
  'mcp',
  'mongodb',
  'nextjs',
  'nodejs',
  'open-source',
  'performance',
  'postgresql',
  'python',
  'react',
  'redis',
  'rust',
  'security',
  'system-design',
  'testing',
  'typescript',
  'webdev',
];

/* ------------------------------------------------------------------ asks */

export enum AskType {
  Link = 'link',
  Text = 'text',
}

export interface LfgAsk {
  id: string;
  label: string;
  type: AskType;
}

const ask = (id: string, label: string, type = AskType.Text): LfgAsk => ({
  id,
  label,
  type,
});

export const askPresets: Record<LfgKind, LfgAsk[]> = {
  [LfgKind.Build]: [
    ask('shipped', 'A project you shipped', AskType.Link),
    ask('hours', 'Hours per week you can commit'),
    ask('why', 'Why this project'),
  ],
  [LfgKind.Learn]: [
    ask('learning', "What you're learning right now"),
    ask('goal', 'Your goal for the next month'),
    ask('schedule', 'When you usually have time'),
  ],
  [LfgKind.Help]: [
    ask('experience', 'Your experience with this'),
    ask('similar', "Something similar you've done", AskType.Link),
    ask('when', "When you're free for a call"),
  ],
};

/* ----------------------------------------------------------------- posts */

export enum PostStatus {
  Open = 'open',
  Found = 'found',
  Expired = 'expired',
}

export interface LfgPost {
  id: string;
  authorId: string;
  kind: LfgKind;
  role: string;
  title: string;
  body: string;
  tags: string[];
  commitment: Commitment;
  offer: string;
  showCountry: boolean;
  asks: LfgAsk[];
  createdAt: string;
  expiresAt: string;
  status: PostStatus;
  // Reach-outs from people outside this prototype, waiting on the author.
  outsidePending: number;
}

const daysFromNow = (days: number): string =>
  new Date(NOW.getTime() + days * 86_400_000).toISOString();

const post = (
  value: Omit<LfgPost, 'createdAt' | 'expiresAt' | 'status'> & {
    age: number;
  },
): LfgPost => {
  const { age, ...rest } = value;
  return {
    ...rest,
    createdAt: daysFromNow(-age),
    expiresAt: daysFromNow(POST_LIFETIME_DAYS - age),
    status: PostStatus.Open,
  };
};

export const seedPosts: LfgPost[] = [
  post({
    id: 'cofounder',
    authorId: 'jonas',
    kind: LfgKind.Build,
    role: 'Co-founder',
    title: 'Technical co-founder for a process-mining startup',
    body: 'We turn the way a company actually works (tickets, chats, logs) into a clean data layer that agents and analysts can query. I have the customers and a working prototype. I need someone who owns the data pipeline and the security story.',
    tags: ['data-engineering', 'security', 'rust'],
    commitment: Commitment.Ongoing,
    offer:
      'A fair equity split, two design partners already signed, and my network in industrial automation.',
    showCountry: true,
    asks: [askPresets[LfgKind.Build][0], askPresets[LfgKind.Build][1]],
    age: 2,
    outsidePending: 3,
  }),
  post({
    id: 'lint',
    authorId: 'lior',
    kind: LfgKind.Build,
    role: 'Contributor',
    title: 'Contributors for an open source Postgres migration linter',
    body: 'pgsafe catches migrations that lock big tables before they hit production. The core works; I want help with the TypeScript rule SDK and docs.',
    tags: ['postgresql', 'typescript', 'open-source'],
    commitment: Commitment.FewWeeks,
    offer:
      'Pairing on Postgres internals, and co-maintainer rights if it clicks.',
    showCountry: false,
    asks: [askPresets[LfgKind.Build][0]],
    age: 1,
    outsidePending: 1,
  }),
  post({
    id: 'agents',
    authorId: 'wei',
    kind: LfgKind.Build,
    role: 'Teammate',
    title: 'A teammate for open source agents that help nonprofits',
    body: 'I build agents that help small nonprofits answer donor and volunteer questions. I need someone who enjoys talking to people: scoping what each org needs and keeping things moving.',
    tags: ['ai-agents', 'mcp', 'open-source'],
    commitment: Commitment.Ongoing,
    offer:
      'Hands-on agent and evals experience, and shared credit on everything.',
    showCountry: false,
    asks: [askPresets[LfgKind.Build][2]],
    age: 4,
    outsidePending: 2,
  }),
  post({
    id: 'sysdesign',
    authorId: 'amara',
    kind: LfgKind.Learn,
    role: 'Study partner',
    title: 'System design study partner, three evenings a week',
    body: "Going through one classic design per session and mock-interviewing each other. I'm aiming for senior backend interviews in December.",
    tags: ['system-design', 'go', 'interviews'],
    commitment: Commitment.FewWeeks,
    offer: 'Consistency. I show up.',
    showCountry: false,
    asks: [askPresets[LfgKind.Learn][1], askPresets[LfgKind.Learn][2]],
    age: 1,
    outsidePending: 0,
  }),
  post({
    id: 'cache',
    authorId: 'luca',
    kind: LfgKind.Help,
    role: 'Quick consult',
    title: '30 minutes on cache invalidation in ASP.NET Core',
    body: 'Small internal API, IMemoryCache for login data. Invalidation is getting messy and I want a second opinion before I add Redis. I tried event-based invalidation and short TTLs.',
    tags: ['dotnet', 'caching', 'redis'],
    commitment: Commitment.OneCall,
    offer: 'Happy to return the favor on anything EF Core.',
    showCountry: true,
    asks: [askPresets[LfgKind.Help][0]],
    age: 3,
    outsidePending: 0,
  }),
  post({
    id: 'career',
    authorId: 'sam',
    kind: LfgKind.Help,
    role: 'Mentor',
    title: 'A mentor for my first year as a backend developer',
    body: "I just moved from support into a junior Go role. I'd love someone to check in with twice a month about what to learn next and how to review code well.",
    tags: ['go', 'career', 'backend'],
    commitment: Commitment.FewWeeks,
    offer:
      "Good questions, and notes from every call so you don't repeat yourself.",
    showCountry: false,
    asks: [askPresets[LfgKind.Help][0], askPresets[LfgKind.Help][2]],
    age: 5,
    outsidePending: PENDING_CAP,
  }),
  post({
    id: 'freebsd',
    authorId: 'elif',
    kind: LfgKind.Build,
    role: 'Teammate',
    title: 'Teammate for an OCI container runtime on FreeBSD',
    body: 'Hobby project, jails under the hood. Looking for someone curious about networking and firewalls.',
    tags: ['c', 'freebsd', 'containers'],
    commitment: Commitment.Ongoing,
    offer: 'A fun, deep systems project and a patient reviewer.',
    showCountry: false,
    asks: [askPresets[LfgKind.Build][1]],
    age: 8,
    outsidePending: 0,
  }),
];

// Noa's own post, used by the review and lifecycle flows.
export const myPost: LfgPost = post({
  id: 'mine',
  authorId: ME_ID,
  kind: LfgKind.Build,
  role: 'Teammate',
  title: 'Teammate for a Postgres query-plan visualizer',
  body: "I'm building a tool that turns EXPLAIN output into something a product engineer can read. Backend works; I need someone who loves frontend data viz.",
  tags: ['postgresql', 'react', 'data-visualization'],
  commitment: Commitment.FewWeeks,
  offer: 'Postgres pairing and a shared launch on daily.dev.',
  showCountry: false,
  asks: [askPresets[LfgKind.Build][0], askPresets[LfgKind.Build][1]],
  age: 7,
  outsidePending: 0,
});

// Posted while the help flow runs, matching what Noa is open to.
export const helpMatchPost: LfgPost = post({
  id: 'partition',
  authorId: 'ravi',
  kind: LfgKind.Help,
  role: 'Quick consult',
  title: 'Second opinion on partitioning a big Postgres payments table',
  body: "Our payments table is huge and every month-end report crawls. I'm planning to partition it by month and want someone who has done it in production to poke holes in the plan.",
  tags: ['postgresql', 'performance'],
  commitment: Commitment.OneCall,
  offer: "Coffee's on me if we ever meet, and a write-up of whatever we learn.",
  showCountry: false,
  asks: [askPresets[LfgKind.Help][0], askPresets[LfgKind.Help][2]],
  age: 0,
  outsidePending: 0,
});

/* --------------------------------------------------------------- helpers */

export enum HelpType {
  Mentoring = 'mentoring',
  Review = 'review',
  Consult = 'consult',
}

export const helpTypeLabel: Record<HelpType, string> = {
  [HelpType.Mentoring]: 'Mentoring',
  [HelpType.Review]: 'Code and design reviews',
  [HelpType.Consult]: 'Quick consults',
};

export interface HelperProfile {
  types: HelpType[];
  tags: string[];
  perMonth: number;
  // Empty or missing hears from everyone.
  timezones?: number[];
  minReputation?: number;
}

// People already open to helping, so their profiles and hover cards show it.
export const seedHelpers: Record<string, HelperProfile> = {
  priya: {
    types: [HelpType.Mentoring, HelpType.Consult],
    tags: ['backend', 'java', 'career'],
    perMonth: 2,
  },
  lior: {
    types: [HelpType.Review],
    tags: ['rust', 'postgresql'],
    perMonth: 4,
  },
};

// The tags Noa follows, standing in for the reader's feed preferences.
export const myFollowedTags = [
  'postgresql',
  'typescript',
  'react',
  'data-visualization',
];

// What Noa reads most, offered as the default topics to help with.
export const myTopReadTags = ['postgresql', 'typescript', 'performance'];

/* ---------------------------------------------------------------- launch */

// Before launch nothing on the board is visible: posts and helpers are
// collected, the badge shows on avatars, and the board opens once there are
// enough posts.

// People who already posted before launch, so their badges show.
export const prelaunchPostIds = ['cofounder', 'lint', 'sysdesign', 'cache'];

// The two posts that exist in the first days after launch.
export const thinBoardPostIds = ['cofounder', 'cache'];

/* ------------------------------------------------------------ reach-outs */

export interface ReachOut {
  id: string;
  postId: string;
  fromId: string;
  toId: string;
  pitch: string;
  answers: Record<string, string>;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'filled';
}

export const incomingReachOuts: ReachOut[] = [
  {
    id: 'r-lior',
    postId: 'mine',
    fromId: 'lior',
    toId: ME_ID,
    pitch:
      "I can own the plan tree view: I built the flame graph in pgsafe's report UI with d3. Free most evenings your time, same time zone.",
    answers: {
      shipped: 'https://github.com/liorbd/pgsafe',
      hours: 'About 6 a week',
    },
    createdAt: daysFromNow(-1),
    status: 'pending',
  },
  {
    id: 'r-dana',
    postId: 'mine',
    fromId: 'dana',
    toId: ME_ID,
    pitch:
      "I can help with the data side and the docs. I've written dbt lineage visualizations before and I'd love to learn more about plans.",
    answers: {
      shipped: 'https://github.com/danaw/dbt-lineage-lite',
      hours: '3 to 4',
    },
    createdAt: daysFromNow(-2),
    status: 'pending',
  },
  {
    id: 'r-sam',
    postId: 'mine',
    fromId: 'sam',
    toId: ME_ID,
    pitch:
      "I'd love to join! I'm learning React and this sounds like a great way to grow. I can do anything you need.",
    answers: {
      shipped: 'https://github.com/someone-else/awesome-react-dashboard',
      hours: 'As many as you need',
    },
    createdAt: daysFromNow(-2),
    status: 'pending',
  },
  {
    id: 'r-growth',
    postId: 'mine',
    fromId: 'growth',
    toId: ME_ID,
    pitch:
      "Why find a teammate when our studio can ship the whole thing in 3 weeks? Fixed price, 200+ apps shipped. Let's talk.",
    answers: {
      shipped: 'https://fastmvp.example/portfolio',
      hours: 'Full team',
    },
    createdAt: daysFromNow(-1),
    status: 'pending',
  },
];

// A pitch Noa already sent today, so the safety flow can show the
// duplicate check and the remaining credits.
export const previousPitch: ReachOut = {
  id: 'r-sent-agents',
  postId: 'agents',
  fromId: ME_ID,
  toId: 'wei',
  pitch:
    "Hi! I'm a full-stack developer and I'd love to help. I have a lot of experience and I'm ready to start right away.",
  answers: { why: 'It sounds interesting.' },
  createdAt: daysFromNow(0),
  status: 'pending',
};

export interface ChatMessage {
  id: string;
  fromId: string;
  body: string;
  at: string;
}

export const scamChat: ChatMessage[] = [
  {
    id: 'k1',
    fromId: 'kai',
    body: 'Thanks for accepting! We have a paid role that fits you perfectly. First step is a quick take-home.',
    at: daysFromNow(0),
  },
  {
    id: 'k2',
    fromId: 'kai',
    body: 'Clone https://github.com/kantrix-hiring/take-home-v3 and run npm install && npm start, then send me a screenshot of the output.',
    at: daysFromNow(0),
  },
];

/* ------------------------------------------------------------ discussion */

export interface DiscussionComment {
  id: string;
  authorId: string;
  body: string;
  age: string;
}

export const discussionTitle =
  "Postgres 18's asynchronous I/O, explained with real queries";

export const discussionComments: DiscussionComment[] = [
  {
    id: 'c1',
    authorId: 'lior',
    body: 'The part about io_method finally made it click for me. Worth checking your bitmap heap scans before and after the upgrade.',
    age: '3h',
  },
  {
    id: 'c2',
    authorId: 'priya',
    body: 'Good write-up. The commit that made it the default spells out the tradeoffs too, if you want the long version.',
    age: '2h',
  },
  {
    id: 'c3',
    authorId: 'jonas',
    body: 'Has anyone tried this on ARM instances yet? Curious whether it holds up there.',
    age: '1h',
  },
  {
    id: 'c4',
    authorId: ME_ID,
    body: 'We saw the biggest difference on month-end reports. Going to try it on our EXPLAIN visualizer next.',
    age: '40m',
  },
  {
    id: 'c5',
    authorId: 'dana',
    body: 'Bookmarked for the next migration window.',
    age: '20m',
  },
];

/* --------------------------------------------------------- demo shortcuts */

// What Noa would write, so a demo doesn't stall on typing.
export const examplePitches: Record<
  string,
  { pitch: string; answers: Record<string, string> }
> = {
  cofounder: {
    pitch:
      "I've built ingestion pipelines for messy ticket and chat data, and I care a lot about access control. Open to ongoing, evenings and weekends to start.",
    answers: {
      shipped: 'https://github.com/noab/ticket-graph',
      hours: '10 to 12 a week',
    },
  },
  lint: {
    pitch:
      'I can take the TypeScript rule SDK. I wrote the plugin API for a SQL formatter and know where the footguns are. Free a few evenings a week.',
    answers: { shipped: 'https://github.com/noab/sqlfmt-plugins' },
  },
  agents: {
    pitch:
      "I've volunteered with two local nonprofits and I'm good at turning a messy conversation into a scoped plan. Happy to try one org together first.",
    answers: {
      why: 'I want my evenings to help someone, and I want to learn agents properly.',
    },
  },
  sysdesign: {
    pitch:
      "I'm prepping for senior interviews too and do best with a fixed schedule. Same time zone, so evenings line up.",
    answers: {
      goal: 'Ten designs done and two mock interviews',
      schedule: 'Sun, Tue, Thu after 8pm',
    },
  },
  cache: {
    pitch:
      "I've untangled IMemoryCache invalidation on a similar internal API, then moved it to Redis with tags. Free for a call this week.",
    answers: {
      experience:
        'Event-based invalidation plus short TTLs, then Redis tags when it grew.',
    },
  },
  career: {
    pitch:
      'I moved into backend from support too, five years ago. Happy to do two calls a month and look at your first code reviews together.',
    answers: {
      experience:
        'Go in production for three years, and I review a lot of PRs.',
      when: 'Tuesday evenings work best',
    },
  },
  freebsd: {
    pitch:
      "I've wanted an excuse to learn jails properly. I know Linux networking and iptables well and can start with the firewall side.",
    answers: { hours: 'About 5 a week' },
  },
  partition: {
    pitch:
      'I partitioned our events table by month last year, including the migration with no downtime. Happy to walk through what bit us.',
    answers: {
      experience:
        'Declarative partitioning, pg_partman for retention, and a backfill in batches.',
      when: 'Tomorrow or Thursday, mornings your time',
    },
  },
};

const answerBank: Record<string, Record<string, string>> = {
  lior: {
    shipped: 'https://github.com/liorbd/pgsafe',
    hours: 'About 5 a week',
    why: 'It overlaps with what I already maintain',
    learning: 'Async and writing proc macros',
    goal: 'Ship one small CLI a week',
    schedule: 'Sun and Wed evenings',
    experience: 'I maintain a Postgres tool and review a lot of Rust',
    similar: 'https://github.com/liorbd/pgsafe',
    when: 'Most evenings',
  },
  dana: {
    shipped: 'https://github.com/danaw/dbt-lineage-lite',
    hours: '3 to 4',
    why: 'I want to get better at this with someone',
    learning: 'Starting from the basics',
    goal: 'Finish the book and one real project',
    schedule: 'Weekday mornings',
    experience: 'Some, mostly on the data side',
    similar: 'https://github.com/danaw/dbt-lineage-lite',
    when: 'Weekday mornings',
  },
  sam: {
    shipped: 'https://github.com/someone-else/awesome-react-dashboard',
    hours: 'As many as you need',
    why: 'Sounds cool',
    learning: 'Everything',
    goal: 'Get better',
    schedule: 'Anytime',
    experience: 'Not much yet',
    similar: 'https://github.com/someone-else/awesome-react-dashboard',
    when: 'Anytime',
  },
  growth: {
    shipped: 'https://fastmvp.example/portfolio',
    similar: 'https://fastmvp.example/portfolio',
    hours: 'Full team',
  },
};

// Responses to a post Noa just published, answering what the post asks for.
export const responsesFor = (target: LfgPost): ReachOut[] => {
  const topic = target.tags[0] ? `#${target.tags[0]}` : 'this';
  const pitches: Record<string, string> = {
    lior: `Count me in. I know ${topic} well enough to be useful and want a regular reason to go deeper. Same time zone, so evenings line up.`,
    dana: `I'm earlier on with ${topic}, which might help: I'd keep us honest on the basics. I'm consistent and I take good notes.`,
    sam: "I'd love to join! This sounds like a great way to grow. I can do anything you need.",
    growth:
      "Why do it yourself when our studio can ship the whole thing in 3 weeks? Fixed price. Let's talk.",
  };
  return Object.keys(pitches).map((fromId) => ({
    id: `r-${fromId}-${target.id}`,
    postId: target.id,
    fromId,
    toId: ME_ID,
    pitch: pitches[fromId],
    answers: Object.fromEntries(
      target.asks.map((item) => [
        item.id,
        answerBank[fromId][item.id] ?? 'Happy to go into it on a call',
      ]),
    ),
    createdAt: NOW.toISOString(),
    status: 'pending',
  }));
};
