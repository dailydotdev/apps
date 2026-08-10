import { minutesAgo } from './mockClock';
import type { Post } from '../../graphql/posts';
import { mockFeedPosts } from './mockFeed';

export type AgentBlock =
  | { type: 'text'; html: string }
  | { type: 'posts'; caption?: string; posts: Post[] }
  | { type: 'picks'; caption?: string; posts: Post[] }
  | { type: 'feedLink'; label: string; posts: Post[] };

export type AgentAttachment = {
  id: string;
  kind: 'post' | 'feed' | 'quote' | 'guidance' | 'activity';
  label: string;
  detail?: string;
};

export type AgentMessage = {
  id: string;
  role: 'user' | 'agent';
  at: string;
  text?: string;
  attachments?: AgentAttachment[];
  blocks?: AgentBlock[];
  isPending?: boolean;
  isScheduled?: boolean;
  isError?: boolean;
  retryText?: string;
};

// The API takes one string, so the attachments the chips carry have to be
// flattened into the prompt text.
export const promptWithContext = (
  text: string,
  attachments: AgentAttachment[],
): string =>
  attachments.length
    ? `${text}\n\nIn the context of: ${attachments
        .map(({ label }) => `“${label}”`)
        .join(', ')}`
    : text;

export const mockConversation: AgentMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    at: minutesAgo(60 * 24 * 9),
    text: 'Cool zig projects — keep me on top of what actually ships',
  },
  {
    id: 'msg-2',
    role: 'agent',
    at: minutesAgo(60 * 24 * 9 - 2),
    blocks: [
      {
        type: 'text',
        html: `<p>Spawned. I'll hunt daily and only ping you when something clears your bar.</p><p>First pass over daily.dev turned up <strong>one</strong> thing I'd stop and read today:</p>`,
      },
      { type: 'posts', posts: [mockFeedPosts[0]] },
      {
        type: 'text',
        html: `<p>Eight more cleared the bar but are lower confidence.</p>`,
      },
      {
        type: 'feedLink',
        label: 'Open all 9 findings as a feed',
        posts: mockFeedPosts,
      },
    ],
  },
  {
    id: 'msg-3',
    role: 'user',
    at: minutesAgo(60 * 14),
    text: 'fewer announcements, more source-level deep dives',
  },
  {
    id: 'msg-4',
    role: 'agent',
    at: minutesAgo(60 * 14 - 1),
    blocks: [
      {
        type: 'text',
        html: `<p>Noted. I dropped announcement-only posts and reweighted toward material written by the people who did the work. Volume went from ~14 a day to 6.</p><p>Re-scored what I already had — the three that survived:</p>`,
      },
      {
        type: 'picks',
        posts: [mockFeedPosts[4], mockFeedPosts[7], mockFeedPosts[1]],
      },
    ],
  },
  {
    id: 'msg-5',
    role: 'agent',
    at: minutesAgo(42),
    isScheduled: true,
    blocks: [
      {
        type: 'text',
        html: `<p>Daily run — scanned <strong>128</strong> posts, kept 6.</p><p>Five sources covered the same release. Rather than send you five near-identical posts, here are the two that add something the others don't:</p>`,
      },
      { type: 'picks', posts: [mockFeedPosts[3], mockFeedPosts[6]] },
      {
        type: 'text',
        html: `<p>Here's the write-up you asked me to keep doing:</p>
<h3>Zig this week</h3>
<p><strong>The one thing to read:</strong> Zig 0.15 makes the self-hosted backend the default. Debug builds no longer need LLVM — that's why everyone is posting compile-time screenshots. Incremental compilation is in, but behind a flag, so don't plan around it yet.</p>
<p><strong>Worth cloning:</strong> Bun's new bundler (Go dependency gone, 3.1x cold start), Ghostty (now open source, GPU rendering on macOS and Linux), and TigerBeetle's post-mortem — the most honest thing I read this week.</p>
<p><strong>What I skipped:</strong> four "Zig vs Rust" posts re-running the same microbenchmark, and two release announcements with no notes attached.</p>`,
      },
      {
        type: 'picks',
        caption: 'The three projects, if you want them directly:',
        posts: [mockFeedPosts[0], mockFeedPosts[5], mockFeedPosts[2]],
      },
    ],
  },
];

export const cannedReply = (command: string): AgentBlock[] => [
  {
    type: 'text',
    html: `<p>Applied <strong>“${command}”</strong> and re-ran the hunt. It's saved as standing guidance, so every future run and live match uses it too.</p><p>Closest matches under the new weighting:</p>`,
  },
  { type: 'posts', posts: [mockFeedPosts[2]] },
  {
    type: 'picks',
    caption: 'Runners-up under the new weighting:',
    posts: [mockFeedPosts[3], mockFeedPosts[8]],
  },
  {
    type: 'feedLink',
    label: 'Open the refreshed feed',
    posts: mockFeedPosts.slice(0, 6),
  },
];
