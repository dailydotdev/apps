import type { PushContent } from './NotificationPreview';

export interface FreshPost {
  title: string;
  /** The summary's first sentence, short enough for a push body. */
  body: string;
  source: string;
  createdAt: string;
  tags: string[];
}

/**
 * Real daily.dev posts, the newest per onboarding tag, captured from the live
 * public feed on 2026-10-28 (`anonymousFeed`, ranking TIME). The API refuses
 * Storybook's origin, so the story can't fetch them live.
 */
export const FRESH_POSTS: FreshPost[] = [
  {
    title: 'The Impact of AI on CVEs: Industry Challenges',
    body: "AI is flooding the CVE ecosystem with both real findings and fabricated 'slop', straining maintainers and institutions like NVD.",
    source: 'JFrog',
    createdAt: '2026-10-28T14:31:42.108Z',
    tags: ['security', 'open-source', 'appsec'],
  },
  {
    title: 'Practicing engineering judgment with AI',
    body: "Practicing engineering judgment with AI means pausing before accepting a coding agent's first patch to decide if it's the right change.",
    source: 'Flavio Copes',
    createdAt: '2026-10-28T14:26:58.211Z',
    tags: ['ai-agents', 'testing', 'code-review'],
  },
  {
    title: 'New Release: CrateDB 6.5',
    body: 'CrateDB 6.5 speeds up aggregations, GROUP BY queries, and query planning, and improves PostgreSQL compatibility.',
    source: 'CrateDB',
    createdAt: '2026-10-28T14:24:12.125Z',
    tags: ['database', 'sql', 'postgresql', 'cratedb'],
  },
  {
    title: 'JPEG-XL Is Back On The Menu',
    body: 'Chrome is bringing back full support for JPEG-XL after years of resistance.',
    source: 'Hackaday',
    createdAt: '2026-10-28T14:08:16.910Z',
    tags: ['webdev', 'rust', 'google-chrome', 'compression'],
  },
  {
    title: 'Redox OS ring buffers project summary',
    body: 'Redox OS has finished a first phase of a grant-funded project to add io_uring-like ring buffer support at the system task level.',
    source: 'LWN.net',
    createdAt: '2026-10-28T14:07:47.114Z',
    tags: ['linux', 'rust'],
  },
  {
    title: 'How to Block Bots from Visiting Your Website',
    body: "Bots were scoring as 'people' on Cloudflare's bot score, so Bot Fight Mode never blocked them on one blog post.",
    source: 'Pragmatic Pineapple',
    createdAt: '2026-10-28T13:46:47.566Z',
    tags: ['security', 'cloudflare', 'web-security'],
  },
  {
    title:
      'The Download: dead startups fueling AI and interspecies communication',
    body: 'AI labs are buying up data from shut-down startups to train their models.',
    source: 'MIT Technology Review',
    createdAt: '2026-10-28T12:28:56.824Z',
    tags: ['ai', 'cyber', 'startup'],
  },
  {
    title:
      'Rebuilding PubHub: AI-first SDLC, one bottleneck at a time – Part 2',
    body: "Cisco's DevNet team built an AI-first software development lifecycle while rewriting PubHub, its documentation publishing platform.",
    source: 'Cisco',
    createdAt: '2026-10-28T12:05:55.896Z',
    tags: ['testing', 'claude-code', 'code-review', 'vibe-coding'],
  },
  {
    title: 'Match monitoring depth to workload needs with Infrastructure Basic',
    body: 'Datadog Infrastructure Basic is a lightweight monitoring tier for lower-priority workloads like back-office servers and staging hosts.',
    source: 'Datadog',
    createdAt: '2026-10-28T12:04:13.160Z',
    tags: ['devops', 'infrastructure', 'observability'],
  },
  {
    title: "Wardogs leads Newzoo's September PC revenue charts",
    body: "Bulkhead's Wardogs topped Newzoo's September PC revenue charts, surpassing EA Sports FC 27.",
    source: 'GamesIndustry.biz',
    createdAt: '2026-10-28T11:59:04.865Z',
    tags: ['gaming'],
  },
  {
    title: 'Australian Government Is Open But Not Yet Discoverable By Agents',
    body: 'A survey of 13 Australian government API publishers found strong publishing but almost no agent-readiness.',
    source: 'API Evangelist',
    createdAt: '2026-10-28T11:24:53.582Z',
    tags: ['ai-agents', 'architecture', 'mcp', 'oauth'],
  },
  {
    title: 'Emulate The 486 In Your Browser',
    body: 'Jan de Jager built a fully browser-based emulator for an Intel 80486DX2-66 PC.',
    source: 'Hackaday',
    createdAt: '2026-10-28T11:09:42.833Z',
    tags: ['javascript', 'retrocomputing'],
  },
  {
    title:
      'Oracle adds native Snowflake service to OCI to ease data integration',
    body: "Oracle has partnered with Snowflake to make Snowflake's AI Data Cloud a native service on Oracle Cloud Infrastructure.",
    source: 'InfoWorld',
    createdAt: '2026-10-28T10:03:07.981Z',
    tags: ['cloud', 'big-data', 'oracle', 'snowflake'],
  },
  {
    title: 'Scala 3.3.9 LTS is now available!',
    body: 'Scala 3.3.9 LTS is now available, backporting most bugfixes and some improvements from Scala 3.9.0.',
    source: 'The Scala Programming Language',
    createdAt: '2026-10-28T09:29:27.986Z',
    tags: ['devops', 'scala'],
  },
  {
    title: 'Nth Character in Concatenated Decimal String',
    body: "Finding the nth character in the infinite string '123456789101112...' can be done without ever building that string.",
    source: 'C# Corner',
    createdAt: '2026-10-28T07:59:30.305Z',
    tags: ['java', 'algorithms'],
  },
  {
    title:
      'How to Get Data from a Qt Table Model Using Row and Column in PyQt6',
    body: "To get a value from a QAbstractTableModel in PyQt6 using row and column integers, you can't pass them directly to data().",
    source: 'Planet Python',
    createdAt: '2026-10-28T07:52:24.980Z',
    tags: ['python', 'qt', 'desktop-development'],
  },
  {
    title: 'Java Secure Coding Guidelines',
    body: 'This session covers the Secure Coding Guidelines for Java and related best practices.',
    source: 'Inside Java',
    createdAt: '2026-10-28T07:22:57.304Z',
    tags: ['java', 'oracle', 'appsec'],
  },
  {
    title: '4.1.0.beta3 Released',
    body: 'RubyGems and Bundler 4.1.0.beta3 is out with enhancements, bug fixes and new features.',
    source: 'RUBYLAND',
    createdAt: '2026-10-28T05:22:44.758Z',
    tags: ['ruby'],
  },
  {
    title: 'Making machines that can listen',
    body: 'MIT professor Paris Smaragdis builds machine learning systems that help computers hear and understand sound.',
    source: 'MIT News',
    createdAt: '2026-10-28T04:04:45.506Z',
    tags: ['machine-learning', 'mit', 'speech-recognition', 'audio-processing'],
  },
  {
    title:
      'Agents in Production Webinar: From a Chatbot to a Tool You Can Rely On',
    body: 'A free webinar on 19 November 2026 covers how to turn an R-based AI agent prototype into a production-ready tool.',
    source: 'R-bloggers',
    createdAt: '2026-10-28T01:10:57.971Z',
    tags: ['data-science', 'ai-agents', 'r'],
  },
  {
    title: 'Never Put a Pet on an AWS Spot Instance',
    body: 'An intern learned why AWS Spot instances were wrong for a stateful server during an internship task.',
    source: 'DEV',
    createdAt: '2026-10-27T22:38:55.291Z',
    tags: ['cloud', 'aws', 'devops', 'finops'],
  },
  {
    title: 'What’s next after obtaining my data science degree',
    body: 'A product delivery manager in property and casualty insurance reflects on finishing an MS in Data Science.',
    source: 'Medium',
    createdAt: '2026-10-27T17:04:17.668Z',
    tags: ['data-science', 'career', 'data-analysis'],
  },
  {
    title: 'Introducing @expo/agent-cli: the CLI designed for agents',
    body: 'Expo released @expo/agent-cli, an experimental CLI built specifically for coding agents working on Expo apps.',
    source: 'Expo Blog',
    createdAt: '2026-10-27T16:49:21.038Z',
    tags: ['ai-agents', 'mobile', 'cli', 'react-native'],
  },
  {
    title: 'Not all bytes are equal',
    body: "Popcorn, a library for running Elixir's OTP/BEAM VM in the browser, cut its uncompressed asset size from 25.9 MB to 10.7 MB.",
    source: 'Software Mansion',
    createdAt: '2026-10-27T14:58:30.757Z',
    tags: ['elixir', 'webassembly'],
  },
  {
    title: 'Hold My Docs: A Self-Hosted Wiki Backed by Git',
    body: 'Hold My Docs is a self-hosted wiki that stores documentation as Markdown files in a Git repository instead of a database.',
    source: 'Noted',
    createdAt: '2026-10-27T10:22:44.893Z',
    tags: ['golang', 'git', 'self-hosting', 'markdown', 'homelab'],
  },
  {
    title: 'HTMX',
    body: "HTMX is a small library that lets HTML attributes trigger HTTP requests and update parts of a page with the server's response.",
    source: 'Wawandco',
    createdAt: '2026-10-27T09:46:30.494Z',
    tags: ['webdev', 'javascript', 'golang', 'htmx'],
  },
  {
    title: 'Your App Has an Expiry Date Too',
    body: "Google and Apple both enforce yearly deadlines that can quietly cut off an app's updates or visibility.",
    source: 'Medium',
    createdAt: '2026-10-27T00:56:41.999Z',
    tags: ['mobile', 'android', 'ios', 'google-play'],
  },
  {
    title: 'xenia',
    body: 'Xenia lets you use any JavaScript library inside a Phoenix LiveView page.',
    source: 'ElixirStatus',
    createdAt: '2026-10-26T21:57:11.937Z',
    tags: ['javascript', 'elixir', 'liveview'],
  },
  {
    title: 'Build a Streaming React Chat with Microsoft Foundry Responses',
    body: 'Streaming a Microsoft Foundry Responses chat into React needs more than appending raw chunks to a message.',
    source: 'C# Corner',
    createdAt: '2026-10-26T02:45:28.406Z',
    tags: ['webdev', 'react', 'server-sent-events'],
  },
  {
    title: 'Stop Bots From Spamming Your ConvertKit Form',
    body: 'A public ConvertKit form endpoint with a public API key lets bots replay subscribe requests directly, bypassing the UI entirely.',
    source: 'Pragmatic Pineapple',
    createdAt: '2026-10-24T19:42:13.171Z',
    tags: ['react'],
  },
];

/**
 * The push as it would land: the freshest post on one of the reader's tags,
 * its title as the header and its summary as the text. Without a match, the
 * freshest post of all.
 */
export const freshPushFor = (tags: string[]): Omit<PushContent, 'when'> => {
  const post =
    FRESH_POSTS.find((candidate) =>
      candidate.tags.some((tag) => tags.includes(tag)),
    ) ?? FRESH_POSTS[0];
  return { title: post.title, body: post.body };
};
