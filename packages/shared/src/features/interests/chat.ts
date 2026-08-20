import type { Post } from '../../graphql/posts';

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
