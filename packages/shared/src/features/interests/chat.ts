import type { Post } from '../../graphql/posts';
import type {
  InterestQuestionChoice,
  InterestTurn,
  InterestTurnRelationship,
} from '../../graphql/interests';

export type AgentQuestionBlock = {
  type: 'question';
  questionId: string;
  html: string;
  input: 'chips' | 'text';
  multi?: boolean;
  choices?: InterestQuestionChoice[];
  selected?: string[];
};

export type AgentBlock =
  | { type: 'text'; html: string }
  | { type: 'posts'; caption?: string; posts: Post[] }
  | { type: 'picks'; caption?: string; posts: Post[] }
  | { type: 'feedLink'; label: string; posts: Post[] }
  | AgentQuestionBlock
  | { type: 'brief'; html: string; brief: string }
  | { type: 'review' };

export type AgentAttachment = {
  id: string;
  kind: 'post' | 'feed' | 'quote' | 'guidance' | 'activity';
  label: string;
  detail?: string;
};

export type AgentPostsBlock = Extract<AgentBlock, { posts: Post[] }>;

// Blocks that carry posts. A type guard rather than "not text", so a new block
// type is excluded by default instead of crashing whatever reads `.posts`.
export const isPostsBlock = (block: AgentBlock): block is AgentPostsBlock =>
  block.type === 'posts' || block.type === 'picks' || block.type === 'feedLink';

export type AgentMessage = {
  id: string;
  role: 'user' | 'agent';
  at: string;
  text?: string;
  relationships?: InterestTurnRelationship[] | null;
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
        .map(({ id, kind, label }) =>
          kind === 'post' ? `@dailydev:${id}` : `“${label}”`,
        )
        .join(', ')}`
    : text;

export const FEEDBACK_MARKER_REGEX =
  /@dailydev:post:([a-zA-Z0-9]+)(?::([a-zA-Z0-9]+))?/g;

export const restoreCommandText = (
  turn: Pick<InterestTurn, 'text' | 'relationships'>,
): string => {
  const text = turn.text ?? '';
  return text.replace(FEEDBACK_MARKER_REGEX, (full, postId, relId) => {
    if (!relId) {
      return full;
    }
    const entry = turn.relationships?.find((rel) => rel.id === relId);
    return entry?.url ?? `@dailydev:post:${postId}`;
  });
};
