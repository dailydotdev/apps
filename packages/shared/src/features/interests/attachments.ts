import type { Post } from '../../graphql/posts';
import type { AgentContentTarget } from './AgentContext';
import type { AgentAttachment, AgentMessage } from './chat';

/**
 * Turning what is on screen into something a prompt can point at.
 *
 * Ids are the same strings the content tabs use, so a post that is open in the
 * panel and the same post sitting in the transcript are one entry rather than
 * two.
 */
export const postAttachment = (post: Post): AgentAttachment => ({
  id: `post:${post.id}`,
  kind: 'post',
  label: post.title ?? 'Untitled post',
  detail: post.source?.name,
});

export const feedAttachment = (
  label: string,
  posts: Post[],
): AgentAttachment => ({
  id: `feed:${label}`,
  kind: 'feed',
  label,
  detail: `${posts.length} posts`,
});

/**
 * A passage the reader highlighted. The label is the passage itself, cut at a
 * length a chip and a prompt line can both carry.
 */
export const quoteAttachment = (text: string): AgentAttachment => ({
  id: `quote:${text}`,
  kind: 'quote',
  label: text.length > 140 ? `${text.slice(0, 140).trimEnd()}…` : text,
  detail: 'Highlighted',
});

/** The agent's own context: not on screen, but still referable. */
export const agentAttachments: AgentAttachment[] = [
  {
    id: 'agent:guidance',
    kind: 'guidance',
    label: 'Standing guidance',
    detail: 'Everything you have told it so far',
  },
  {
    id: 'agent:activity',
    kind: 'activity',
    label: 'Run history',
    detail: 'Every run, command and finding',
  },
];

export const targetAttachment = (
  target: AgentContentTarget,
): AgentAttachment | undefined => {
  if (target.type === 'post') {
    return postAttachment(target.post);
  }

  if (target.type === 'feed') {
    return feedAttachment(target.label, target.posts);
  }

  return agentAttachments.find(({ id }) => id === `agent:${target.type}`);
};

const transcriptPosts = (messages: AgentMessage[]): Post[] =>
  messages
    // Newest first: the last thing it sent is the likeliest thing to point at.
    .slice()
    .reverse()
    .flatMap(({ blocks }) => blocks ?? [])
    .flatMap((block) => (block.type === 'text' ? [] : block.posts));

/** Everything the composer offers to `@`: what is open, what it found, itself. */
export const mentionCandidates = ({
  openContent,
  messages,
}: {
  openContent: AgentContentTarget[];
  messages: AgentMessage[];
}): AgentAttachment[] => {
  const open = openContent.flatMap((target) => targetAttachment(target) ?? []);
  const found = transcriptPosts(messages).map(postAttachment);
  const seen = new Set<string>();

  return [...open, ...found, ...agentAttachments].filter(({ id }) => {
    if (seen.has(id)) {
      return false;
    }

    seen.add(id);

    return true;
  });
};
