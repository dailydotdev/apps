import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';

// CodeRabbit as a verified company page, the prospect the mock is built for.
// Posts are CodeRabbit's real blog and changelog entries (coderabbit.ai/blog,
// docs.coderabbit.ai/changelog, 23 Sep 2026); the bio, avatar and banner are
// from x.com/coderabbitai; the team is the company's public GitHub org; counts, ratings and polls are illustrative. Formerly the daily.dev
// Changelog squad (@daily_updates), snapshotted from the public
// API on 15 Sep 2026: identity, stats, the admin/moderator list and the last
// 14 posts are real. Everything marked "illustrative" is what a verified
// company page would add on top and does not exist on the API yet.

export interface SquadLink {
  label: string;
  href: string;
}

export interface SquadData {
  handle: string;
  name: string;
  description: string;
  /** One line. The description is the paragraph; this is the promise. */
  tagline: string;
  image: string;
  headerImage: string;
  /** Which part of the cover survives the crop. Banners carry their message at the top. */
  headerImagePosition?: 'top' | 'center' | 'bottom';
  permalink: string;
  category: string;
  createdAt: string;
  membersCount: number;
  totalPosts: number;
  totalViews: number;
  totalUpvotes: number;
  totalAwards: number;
  /** Illustrative: the badge is the thing being sold. */
  verified: boolean;
  /** The RSS the page is fed by. */
  feedUrl: string;
  /** Illustrative. */
  links: SquadLink[];
  /** Illustrative. Company location and size the way LinkedIn shows them. */
  company: { location: string; size: string; website: string };
}

export const squad: SquadData = {
  handle: 'coderabbit',
  name: 'CodeRabbit',
  tagline:
    'CodeRabbit helps teams review, understand, govern, and trust agent-generated code.',
  description:
    'CodeRabbit helps teams review, understand, govern, and trust agent-generated code.',
  image: '/squad-page/coderabbit-avatar.jpg',
  headerImage: '/squad-page/coderabbit-banner.jpg',
  headerImagePosition: 'top',
  permalink: 'https://daily.dev/squads/coderabbit',
  category: 'Developer tools',
  createdAt: '2023-04-28T10:00:00.000Z',
  membersCount: 6120,
  totalPosts: 184,
  totalViews: 418230,
  totalUpvotes: 12340,
  totalAwards: 3,
  verified: true,
  feedUrl: 'docs.coderabbit.ai/changelog/rss.xml',
  links: [
    { label: 'coderabbit.ai', href: 'https://www.coderabbit.ai' },
    {
      label: 'github.com/coderabbitai',
      href: 'https://github.com/coderabbitai',
    },
    { label: 'x.com/coderabbitai', href: 'https://x.com/coderabbitai' },
  ],
  company: {
    location: 'San Francisco, CA',
    size: '51-200 employees',
    website: 'coderabbit.ai',
  },
};

export enum TeamRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
}

export interface TeamMember {
  id: string;
  name: string;
  username: string;
  image: string;
  role: TeamRole;
  title: string;
  reputation: number;
}

export const team: TeamMember[] = [
  {
    id: 'harjotgill',
    name: 'Harjot Gill',
    username: 'harjotgill',
    image: 'https://avatars.githubusercontent.com/u/18579817?v=4',
    role: TeamRole.Admin,
    title: 'Co-founder & CEO',
    reputation: 48120,
  },
  {
    id: 'hasit',
    name: 'Hasit Mistry',
    username: 'hasit',
    image: 'https://avatars.githubusercontent.com/u/1553055?v=4',
    role: TeamRole.Admin,
    title: 'Engineering',
    reputation: 36400,
  },
  {
    id: 'santoshyadavdev',
    name: 'Santosh Yadav',
    username: 'santoshyadavdev',
    image: 'https://avatars.githubusercontent.com/u/11923975?v=4',
    role: TeamRole.Moderator,
    title: 'Principal Developer Advocate',
    reputation: 92100,
  },
  {
    id: 'helizaga',
    name: 'Tom Elizaga',
    username: 'helizaga',
    image: 'https://avatars.githubusercontent.com/u/22605247?v=4',
    role: TeamRole.Moderator,
    title: 'Software engineer',
    reputation: 21430,
  },
  {
    id: 'dundeezhang',
    name: 'Dundee Zhang',
    username: 'dundeezhang',
    image: 'https://avatars.githubusercontent.com/u/60833894?v=4',
    role: TeamRole.Moderator,
    title: 'Engineer',
    reputation: 18240,
  },
  {
    id: 'recrsn',
    name: 'Amitosh Swain Mahapatra',
    username: 'recrsn',
    image: 'https://avatars.githubusercontent.com/u/16816719?v=4',
    role: TeamRole.Moderator,
    title: 'Engineer',
    reputation: 14010,
  },
  {
    id: 'ahmetskilinc',
    name: 'Ahmet Kilinc',
    username: 'ahmetskilinc',
    image: 'https://avatars.githubusercontent.com/u/37756565?v=4',
    role: TeamRole.Moderator,
    title: 'Engineer',
    reputation: 9200,
  },
  {
    id: 'averyjennings',
    name: 'Avery Jennings',
    username: 'averyjennings',
    image: 'https://avatars.githubusercontent.com/u/14079159?v=4',
    role: TeamRole.Moderator,
    title: 'Engineer',
    reputation: 7700,
  },
];

const teamById = Object.fromEntries(team.map((member) => [member.id, member]));

export interface Entry {
  id: string;
  title: string;
  image: string | null;
  summary: string;
  createdAt: string;
  upvotes: number;
  comments: number;
  awards: number;
  tags: string[];
  author: TeamMember;
  pinned?: boolean;
}

export const entries: Entry[] = [
  {
    id: 'coderabbit-triage',
    title: 'CodeRabbit Triage: know which pull request to review next',
    image: 'https://www.coderabbit.ai/content/assets/triage-pr-queue/hero.png',
    summary:
      'CodeRabbit Triage scores and explains pull request priorities so reviewers can focus their attention, route work, and identify the next action. One queue across every repository your organization tracks.',
    createdAt: '2026-09-15T16:00:00.000Z',
    upvotes: 412,
    comments: 58,
    awards: 2,
    tags: ['code-review', 'devtools', 'coderabbit'],
    author: teamById.harjotgill,
    pinned: true,
  },
  {
    id: 'do-you-understand-what-youre-about-to-merge',
    title: 'Do you understand what you are about to merge?',
    image:
      'https://www.coderabbit.ai/content/assets/change-stack-understanding/hero.png',
    summary:
      'Five questions every reviewer should answer before approving a pull request, and how Change Stack ties intent, behavior, dependencies, and risk back to the code.',
    createdAt: '2026-09-23T15:00:00.000Z',
    upvotes: 186,
    comments: 24,
    awards: 0,
    tags: ['code-review', 'coderabbit'],
    author: teamById.santoshyadavdev,
  },
  {
    id: 'opus-5-5-model-review',
    title: 'Claude Opus 5.5 code review benchmarks',
    image: 'https://www.coderabbit.ai/content/assets/opus-5-5-header.png',
    summary:
      "We benchmarked Anthropic's Claude Opus 5.5 for AI code review against our production reviewer: which bugs it catches, which it misses, and whether higher effort helps.",
    createdAt: '2026-09-22T14:00:00.000Z',
    upvotes: 341,
    comments: 47,
    awards: 1,
    tags: ['ai', 'llm', 'code-review'],
    author: teamById.hasit,
  },
  {
    id: 'rethinking-pr-triage-from-first-principles',
    title: 'Rethinking PR triage from first principles',
    image:
      'https://www.coderabbit.ai/content/assets/rethinking-pr-triage-from-first-principles/hero.png',
    summary:
      'Why a blocked pull request is not automatically an urgent one, and how a priority should weigh risk, reward, effort and activity instead of age.',
    createdAt: '2026-09-18T14:00:00.000Z',
    upvotes: 158,
    comments: 19,
    awards: 0,
    tags: ['code-review', 'engineering-management'],
    author: teamById.harjotgill,
  },
  {
    id: 'software-factory-review-gate',
    title: 'A software factory needs a review gate it can trust',
    image:
      'https://www.coderabbit.ai/content/assets/software-factory-review-gate/consequential-change.png',
    summary:
      'Agents can write, test, and revise code across much of the delivery process. Teams still need a reliable way to decide which changes can move automatically and which require accountable human review.',
    createdAt: '2026-09-10T14:00:00.000Z',
    upvotes: 229,
    comments: 31,
    awards: 1,
    tags: ['ai', 'code-review'],
    author: teamById.harjotgill,
  },
  {
    id: 'taste-decides-what-should-ship',
    title: 'Whose taste is shaping your agentic SDLC?',
    image:
      'https://www.coderabbit.ai/content/assets/taste-decides-what-should-ship/cover.png',
    summary:
      'Engineering taste develops through experience, exploring alternatives, and learning from use. How can teams preserve those opportunities in an agentic SDLC?',
    createdAt: '2026-09-09T14:00:00.000Z',
    upvotes: 121,
    comments: 14,
    awards: 0,
    tags: ['ai', 'engineering-management'],
    author: teamById.santoshyadavdev,
  },
  {
    id: 'gpt-6-astra-code-review-evaluation',
    title: 'GPT-6 Astra review: code review gains, privacy, and cost',
    image: 'https://www.coderabbit.ai/content/assets/gpt-6-astra/header.png',
    summary:
      "CodeRabbit's early GPT-6 Astra evaluation covers cross-file bug detection, customer data protection, public API pricing, and building NIGHTSHIFT.",
    createdAt: '2026-09-04T14:00:00.000Z',
    upvotes: 298,
    comments: 39,
    awards: 1,
    tags: ['ai', 'llm', 'code-review'],
    author: teamById.hasit,
  },
  {
    id: 'the-last-software-engineer-knows-what-to-build',
    title: 'What would the last software engineer still need to do?',
    image:
      'https://www.coderabbit.ai/content/assets/last-software-engineer-cover.png',
    summary:
      'Kent C. Dodds explains why knowing what to build, understanding the system, and owning outcomes matter as AI agents take on implementation.',
    createdAt: '2026-09-03T14:00:00.000Z',
    upvotes: 402,
    comments: 63,
    awards: 2,
    tags: ['ai', 'career'],
    author: teamById.santoshyadavdev,
  },
  {
    id: 'fable-5-1-model-review',
    title: 'Fable 5.1 model review and code review results',
    image: 'https://www.coderabbit.ai/content/assets/fable-5-1.png',
    summary:
      'Fable 5.1 feels fast on small coding tasks and produces fewer review comments than Fable 5, but it needs clear instructions and careful use in code review.',
    createdAt: '2026-09-01T14:00:00.000Z',
    upvotes: 276,
    comments: 35,
    awards: 0,
    tags: ['ai', 'llm', 'code-review'],
    author: teamById.hasit,
  },
  {
    id: 'metrics-api-retry-guidance',
    title: 'Metrics API retry guidance',
    image: null,
    summary:
      'Build more reliable metrics integrations by reading the Retry-After response header when the metrics endpoints return 503 while isolated metrics prepare, then retry the same request.',
    createdAt: '2026-09-20T10:00:00.000Z',
    upvotes: 44,
    comments: 3,
    awards: 0,
    tags: ['api', 'coderabbit'],
    author: teamById.helizaga,
  },
  {
    id: 'cli-0-7-8',
    title: 'CLI v0.7.8',
    image: null,
    summary:
      'More reliable large reviews: reviews avoid duplicate file content and report oversized requests with guidance to reduce the scope. Git branch detection avoids interactive credential prompts that can stall reviews.',
    createdAt: '2026-09-16T10:00:00.000Z',
    upvotes: 97,
    comments: 11,
    awards: 0,
    tags: ['cli', 'coderabbit'],
    author: teamById.dundeezhang,
  },
  {
    id: 'metrics-api-retries',
    title: 'Metrics API retries',
    image: null,
    summary:
      'The MCP server usage and review comment metrics endpoints return 503 while isolated metrics are preparing and include a Retry-After header.',
    createdAt: '2026-09-16T09:00:00.000Z',
    upvotes: 31,
    comments: 2,
    awards: 0,
    tags: ['api', 'coderabbit'],
    author: teamById.helizaga,
  },
  {
    id: 'dynamic-configuration-typescript',
    title: 'Dynamic CodeRabbit configuration with TypeScript',
    image: null,
    summary:
      'Define CodeRabbit settings in a programmatic .coderabbit.config.ts, with PR-aware conditions, reusable merged fragments, local TypeScript or YAML includes, and shared includes from the organization config repository.',
    createdAt: '2026-09-15T10:00:00.000Z',
    upvotes: 213,
    comments: 29,
    awards: 0,
    tags: ['typescript', 'devtools', 'coderabbit'],
    author: teamById.recrsn,
  },
  {
    id: 'cli-0-7-7',
    title: 'CLI v0.7.7',
    image: null,
    summary:
      'Review without a local clone: cr review --remote owner/repo reviews an installed GitHub repository from any directory. Configure reviews from the CLI with cr config.',
    createdAt: '2026-09-10T10:00:00.000Z',
    upvotes: 142,
    comments: 17,
    awards: 0,
    tags: ['cli', 'coderabbit'],
    author: teamById.dundeezhang,
  },
  {
    id: 'requested-team-overrides',
    title: 'Requested team overrides',
    image: null,
    summary:
      'When pre-merge check override access is restricted to requested reviewers, members of a requested GitHub reviewer team can now ignore failing checks.',
    createdAt: '2026-09-10T09:00:00.000Z',
    upvotes: 38,
    comments: 4,
    awards: 0,
    tags: ['github', 'coderabbit'],
    author: teamById.ahmetskilinc,
  },
  {
    id: 'connections-and-scopes',
    title: 'Connections and scopes',
    image: null,
    summary:
      'Connecting CodeRabbit to issue trackers, documentation systems and analytics tools used to mean setting up each service separately for reviews, the Slack agent and the Discord agent. That setup is now unified.',
    createdAt: '2026-09-10T08:00:00.000Z',
    upvotes: 76,
    comments: 9,
    awards: 0,
    tags: ['integrations', 'coderabbit'],
    author: teamById.helizaga,
  },
  {
    id: 'custom-jira-issue-templates',
    title: 'Custom Jira issue templates',
    image: null,
    summary:
      'Let CodeRabbit create Jira issues that follow your team standards. Configure chat.integrations.jira.issue_template to define the structure of issue descriptions created from chat.',
    createdAt: '2026-09-09T10:00:00.000Z',
    upvotes: 54,
    comments: 6,
    awards: 0,
    tags: ['jira', 'coderabbit'],
    author: teamById.ahmetskilinc,
  },
  {
    id: 'review-comment-metrics-api',
    title: 'Review comment metrics API',
    image: null,
    summary:
      'Enterprise organizations can retrieve finding-level metadata for review comments on merged pull requests: severity, category, stored resolution outcome and comment URL.',
    createdAt: '2026-09-09T09:00:00.000Z',
    upvotes: 63,
    comments: 5,
    awards: 0,
    tags: ['api', 'coderabbit'],
    author: teamById.recrsn,
  },
  {
    id: 'project-vocabulary',
    title: 'Project vocabulary',
    image: null,
    summary:
      'Comment @coderabbitai generate project vocabulary on a pull request to receive an alphabetized list of up to 50 terms specific to that repository, drawn from source, docs and configuration.',
    createdAt: '2026-09-04T10:00:00.000Z',
    upvotes: 88,
    comments: 12,
    awards: 0,
    tags: ['coderabbit'],
    author: teamById.averyjennings,
  },
  {
    id: 'cli-0-7-6',
    title: 'CLI v0.7.6',
    image: null,
    summary:
      'Improves large-review handling, expands security finding output, and makes usage reporting more accurate. Large reviews send smaller requests and report oversized payloads directly.',
    createdAt: '2026-09-04T09:00:00.000Z',
    upvotes: 71,
    comments: 8,
    awards: 0,
    tags: ['cli', 'coderabbit'],
    author: teamById.dundeezhang,
  },
  {
    id: 'attack-surface-map',
    title: 'Attack surface map',
    image: null,
    summary:
      'A living view of the security-relevant parts of a repository: mapped code locations grouped into subsystems and sorted into lanes, from entry points and trust boundaries to sinks and security configuration.',
    createdAt: '2026-09-02T10:00:00.000Z',
    upvotes: 167,
    comments: 21,
    awards: 0,
    tags: ['security', 'coderabbit'],
    author: teamById.recrsn,
  },
  {
    id: 'cross-repository-targeted-guidelines',
    title: 'Cross-repository targeted guidelines',
    image: null,
    summary:
      'Path-scoped review guidelines that apply across repositories, so a rule written once for a shared library follows it everywhere it is used.',
    createdAt: '2026-08-28T10:00:00.000Z',
    upvotes: 59,
    comments: 7,
    awards: 0,
    tags: ['code-review', 'coderabbit'],
    author: teamById.ahmetskilinc,
  },
  {
    id: 'rate-limit-observability',
    title: 'Rate limit observability and control',
    image: null,
    summary:
      'See how close each organization is to its review rate limits, and set per-repository controls so a noisy repository cannot starve the rest.',
    createdAt: '2026-08-26T10:00:00.000Z',
    upvotes: 47,
    comments: 5,
    awards: 0,
    tags: ['api', 'coderabbit'],
    author: teamById.averyjennings,
  },
];

export const pinnedEntry = entries.find((entry) => entry.pinned) as Entry;
export const latestEntry = entries.find((entry) => !entry.pinned) as Entry;
export const feedEntries = entries.filter((entry) => !entry.pinned);

/** Illustrative. What a CodeRabbit-shaped stack would list. */
export const stack = [
  { name: 'TypeScript', image: 'https://cdn.simpleicons.org/typescript' },
  { name: 'Go', image: 'https://cdn.simpleicons.org/go' },
  { name: 'Python', image: 'https://cdn.simpleicons.org/python' },
  { name: 'PostgreSQL', image: 'https://cdn.simpleicons.org/postgresql' },
  { name: 'Kubernetes', image: 'https://cdn.simpleicons.org/kubernetes' },
  { name: 'GitHub', image: 'https://cdn.simpleicons.org/github/white' },
];

/** Illustrative. Recruiter already exists; a company page would surface it. */
export const jobs = [
  {
    title: 'Senior Software Engineer, Agents',
    location: 'San Francisco',
    type: 'Full-time',
  },
  { title: 'Developer Advocate', location: 'Remote (US)', type: 'Full-time' },
];

const source = {
  id: squad.handle,
  handle: squad.handle,
  name: squad.name,
  permalink: squad.permalink,
  image: squad.image,
  type: 'squad' as const,
  active: true,
  public: true,
  membersCount: squad.membersCount,
};

/** The shape the real feed cards take, so the grid layouts render production cards. */
export const toPost = (entry: Entry): Post =>
  ({
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    image: entry.image ?? undefined,
    permalink: `https://daily.dev/posts/${entry.id}`,
    commentsPermalink: `https://daily.dev/posts/${entry.id}`,
    createdAt: entry.createdAt,
    numUpvotes: entry.upvotes,
    numComments: entry.comments,
    numAwards: entry.awards,
    tags: entry.tags,
    pinnedAt: entry.pinned ? entry.createdAt : undefined,
    type: PostType.Freeform,
    contentHtml: `<p>${entry.summary}</p>`,
    source,
    author: {
      id: entry.author.id,
      name: entry.author.name,
      username: entry.author.username,
      image: entry.author.image,
      permalink: `https://daily.dev/${entry.author.username}`,
      reputation: entry.author.reputation,
    },
    bookmarked: false,
    read: false,
    upvoted: false,
    commented: false,
    userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
  } as unknown as Post);

export const formatCount = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(value);
};

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});
const dayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});
const shortMonthYear = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

export const formatMonth = (iso: string): string =>
  monthFormatter.format(new Date(iso));
export const formatDay = (iso: string): string =>
  dayFormatter.format(new Date(iso));
export const formatSince = (iso: string): string =>
  shortMonthYear.format(new Date(iso));

/** Newest first, grouped by month. The publication layout reads like a changelog. */
export const entriesByMonth = feedEntries.reduce<
  { month: string; items: Entry[] }[]
>((groups, entry) => {
  const month = formatMonth(entry.createdAt);
  const group = groups.find((item) => item.month === month);
  if (group) {
    group.items.push(entry);
  } else {
    groups.push({ month, items: [entry] });
  }
  return groups;
}, []);

export interface Product {
  id: string;
  name: string;
  tagline: string;
  image: string;
  category: string;
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Open source';
  /** Where the listing was imported from. Ratings are the source's. */
  source: 'Product Hunt' | 'G2' | 'GitHub' | 'Website';
  rating?: number;
  reviews?: number;
  /** daily.dev members with this in their stack. */
  inStacks: number;
  links: { label: string; href: string }[];
}

/** Illustrative. Real products; ratings and counts are placeholders. */
export const products: Product[] = [
  {
    id: 'reviews',
    name: 'CodeRabbit',
    tagline:
      'AI code reviews on every pull request, in GitHub, GitLab, Azure DevOps and Bitbucket.',
    image: squad.image,
    category: 'Code review',
    pricing: 'Freemium',
    source: 'Product Hunt',
    rating: 4.9,
    reviews: 640,
    inStacks: 12400,
    links: [
      { label: 'Website', href: 'https://www.coderabbit.ai' },
      {
        label: 'Product Hunt',
        href: 'https://www.producthunt.com/products/coderabbit',
      },
    ],
  },
  {
    id: 'triage',
    name: 'CodeRabbit Triage',
    tagline:
      'One cross-repository queue of open pull requests, ranked by what each one needs next.',
    image: squad.image,
    category: 'Developer productivity',
    pricing: 'Paid',
    source: 'Website',
    inStacks: 2100,
    links: [{ label: 'Website', href: 'https://www.coderabbit.ai/triage' }],
  },
  {
    id: 'cli',
    name: 'CodeRabbit CLI',
    tagline:
      'Review your changes before you push, from the terminal or inside any coding agent.',
    image: squad.image,
    category: 'CLI',
    pricing: 'Free',
    source: 'GitHub',
    rating: 4.7,
    reviews: 310,
    inStacks: 5300,
    links: [
      {
        label: 'Docs',
        href: 'https://docs.coderabbit.ai/overview/ide-cli-review',
      },
      { label: 'GitHub', href: 'https://github.com/coderabbitai' },
    ],
  },
  {
    id: 'ide',
    name: 'CodeRabbit for VS Code',
    tagline: 'Reviews in the IDE, before the pull request exists.',
    image: squad.image,
    category: 'IDE extension',
    pricing: 'Free',
    source: 'Website',
    rating: 4.6,
    reviews: 1180,
    inStacks: 4800,
    links: [
      {
        label: 'Marketplace',
        href: 'https://marketplace.visualstudio.com/items?itemName=CodeRabbit.coderabbit-vscode',
      },
    ],
  },
  {
    id: 'change-stack',
    name: 'Change Stack',
    tagline:
      'Intent, behavior, dependencies and risk, tied back to the code you are about to merge.',
    image: squad.image,
    category: 'Code review',
    pricing: 'Paid',
    source: 'Website',
    inStacks: 1900,
    links: [
      { label: 'Website', href: 'https://www.coderabbit.ai/change-stack' },
    ],
  },
  {
    id: 'slack-agent',
    name: 'Agent for Slack',
    tagline:
      'Investigation, planning and code edits from Slack, with shared context and governed access.',
    image: squad.image,
    category: 'Integrations',
    pricing: 'Paid',
    source: 'Website',
    inStacks: 860,
    links: [
      {
        label: 'Docs',
        href: 'https://docs.coderabbit.ai/overview/slack-agent',
      },
    ],
  },
];

/** Illustrative. Reddit's rules widget: numbered, one line, the why underneath. */
export const rules: [string, string][] = [
  [
    'Stay on topic',
    'Posts are about CodeRabbit: releases, questions, feedback, bugs.',
  ],
  [
    'Search before you ask',
    'Q&A and FAQ first. Duplicates get merged into the original.',
  ],
  [
    'Show your work, not your product',
    'Show and tell is for the technical details of what you built. Commercial promotion is removed.',
  ],
  [
    'Bugs get a template',
    'Repository host, plan, the pull request if you can share it, a screenshot.',
  ],
  [
    'Be useful',
    'Low-effort posts and comments are removed. Answers that help stay.',
  ],
  [
    'One account, one voice',
    'No vote brigading, no sockpuppets, no reposting removed content.',
  ],
];

/** Illustrative. Ratings on the web, pulled into one place. */
export interface ReviewSource {
  id: string;
  name: string;
  image: string;
  rating: number;
  count: number;
  href: string;
}

export const reviewSources: ReviewSource[] = [
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    image: 'https://cdn.simpleicons.org/trustpilot',
    rating: 4.5,
    count: 1240,
    href: 'https://www.trustpilot.com/review/daily.dev',
  },
  {
    id: 'g2',
    name: 'G2',
    image: 'https://cdn.simpleicons.org/g2',
    rating: 4.6,
    count: 212,
    href: 'https://www.g2.com/products/daily-dev',
  },
  {
    id: 'chrome',
    name: 'Chrome Web Store',
    image: 'https://cdn.simpleicons.org/googlechrome',
    rating: 4.7,
    count: 3100,
    href: 'https://daily.dev/extension',
  },
  {
    id: 'appstore',
    name: 'App Store',
    image: 'https://cdn.simpleicons.org/appstore',
    rating: 4.8,
    count: 890,
    href: 'https://daily.dev/ios',
  },
  {
    id: 'producthunt',
    name: 'Product Hunt',
    image: 'https://cdn.simpleicons.org/producthunt',
    rating: 4.9,
    count: 1180,
    href: 'https://www.producthunt.com/products/daily-dev',
  },
];

export interface Review {
  id: string;
  author: TeamMember;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
  reply?: { author: TeamMember; body: string; date: string };
}

/** Illustrative. Authors are the team, standing in for members. */
export const reviews: Review[] = [
  {
    id: 'r1',
    author: team[6],
    rating: 5,
    title: 'Replaced three newsletters and a Slack channel',
    body: 'The feed is the first thing I open. Custom feeds got good enough that I dropped my RSS reader, and the in-app reader means I stop tab hoarding. Squads are where the actual conversation is.',
    date: 'Sep 12',
    helpful: 41,
    reply: {
      author: team[3],
      body: 'Thank you. The reader was the most requested thing this year, glad it landed for you.',
      date: 'Sep 13',
    },
  },
  {
    id: 'r2',
    author: team[5],
    rating: 4,
    title: 'Great on desktop, the mobile app is catching up',
    body: 'Extension and web are excellent. The iOS app is fine for reading but posting from it is still clunky, and I want the same keyboard shortcuts.',
    date: 'Sep 4',
    helpful: 18,
  },
  {
    id: 'r3',
    author: team[7],
    rating: 5,
    title: 'The public API changed how I use it',
    body: 'Morning briefing agent in Claude Code, bookmarks synced to Obsidian, all with a personal token. 200 free requests is enough for a daily digest.',
    date: 'Aug 30',
    helpful: 27,
  },
  {
    id: 'r4',
    author: team[4],
    rating: 3,
    title: 'Too many notifications by default',
    body: 'Good product, but a new account gets a lot of streak and squad noise before it learns you. Turn it down out of the box.',
    date: 'Aug 22',
    helpful: 9,
    reply: {
      author: team[1],
      body: 'Fair. Defaults are getting a pass this quarter; the streak ones are already quieter for new accounts.',
      date: 'Aug 23',
    },
  },
];

export const ratingBreakdown: [number, number][] = [
  [5, 68],
  [4, 21],
  [3, 7],
  [2, 3],
  [1, 1],
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  /** How the squad answered, in percent, one per option. */
  split: number[];
  /** The release the question is generated from. */
  source: string;
}

/** Illustrative. Generated from the changelog's own posts. */
export const quiz = {
  title: 'This month on daily.dev',
  played: 2140,
  questions: [
    {
      id: 'q1',
      question:
        'How many free requests a month does a non-Plus account get on the public API?',
      options: ['50', '200', '1,000', 'Unlimited in beta'],
      answer: 1,
      split: [12, 61, 19, 8],
      source: 'Public API access is now open for everyone',
    },
    {
      id: 'q2',
      question: 'In World, what does a district grow with?',
      options: [
        'Posts you write',
        'Days in your streak',
        'How much you read on that topic',
        'Upvotes you receive',
      ],
      answer: 2,
      split: [9, 23, 58, 10],
      source: 'Meet World: the 3D place your reading builds',
    },
    {
      id: 'q3',
      question: 'How many streak freezes can you keep stashed at once?',
      options: ['Two', 'Three', 'Five', 'Ten'],
      answer: 2,
      split: [14, 31, 47, 8],
      source: 'Miss a day, keep your streak',
    },
    {
      id: 'q4',
      question: 'Which communities does Community Take pull discussion from?',
      options: [
        'Reddit and X',
        'Hacker News and Lobsters',
        'Discord and Slack',
        'GitHub and Stack Overflow',
      ],
      answer: 1,
      split: [22, 52, 11, 15],
      source: 'Community take: see what other developers think about a post',
    },
  ] as QuizQuestion[],
};

export interface SquadPoll {
  id: string;
  question: string;
  options: string[];
  split: number[];
  votes: number;
  author: TeamMember;
  endsAt: string;
}

/** Illustrative. The polls a company squad runs: product decisions, not trivia. */
export const polls: SquadPoll[] = [
  {
    id: 'p1',
    question: 'Which coding agent do you pair CodeRabbit with most?',
    options: ['Claude Code', 'Cursor', 'Codex', 'GitHub Copilot'],
    split: [44, 27, 18, 11],
    votes: 1860,
    author: team[2],
    endsAt: '2026-09-30T09:00:00.000Z',
  },
  {
    id: 'p2',
    question: 'Where should Triage go next?',
    options: ['GitLab', 'Azure DevOps', 'Bitbucket', 'A CLI view'],
    split: [41, 22, 15, 22],
    votes: 1130,
    author: team[0],
    endsAt: '2026-09-26T09:00:00.000Z',
  },
  {
    id: 'p3',
    question: 'How many pull requests does your team open a day?',
    options: ['Under 10', '10 to 50', '50 to 200', '200 or more'],
    split: [34, 38, 19, 9],
    votes: 990,
    author: team[1],
    endsAt: '2026-09-24T09:00:00.000Z',
  },
];

export interface CompanyLink {
  id: 'docs' | 'github' | 'x' | 'youtube' | 'linkedin' | 'discord';
  label: string;
  href: string;
}

/** The company's places on the web, in the order it wants them. */
export const companyLinks: CompanyLink[] = [
  { id: 'docs', label: 'Docs', href: 'https://docs.coderabbit.ai' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/coderabbitai' },
  { id: 'x', label: 'X', href: 'https://x.com/coderabbitai' },
  {
    id: 'youtube',
    label: 'YouTube',
    href: 'https://www.youtube.com/@coderabbitai',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/coderabbitai',
  },
  { id: 'discord', label: 'Discord', href: 'https://discord.gg/coderabbit' },
];
