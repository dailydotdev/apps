import type { Post } from '../../graphql/posts';
import { getPostTitle } from '../../graphql/posts';
import type { AgentActivityItem, AgentContentTarget } from './AgentContext';
import type { AgentAttachment, AgentMessage } from './chat';
import { isPostsBlock } from './chat';

// Ids match the strings the content tabs use, so a post open in the panel and
// the same post in the transcript dedupe to one entry.
export const postAttachment = (post: Post): AgentAttachment => ({
  id: `post:${post.id}`,
  kind: 'post',
  label: getPostTitle(post) ?? 'Untitled post',
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

export const quoteAttachment = (text: string): AgentAttachment => ({
  id: `quote:${text}`,
  kind: 'quote',
  label: text.length > 140 ? `${text.slice(0, 140).trimEnd()}…` : text,
  detail: 'Highlighted',
});

export const activityAttachment = (
  item: AgentActivityItem,
): AgentAttachment => ({
  id: `activity:${item.id}`,
  kind: 'activity',
  label: item.text,
  detail: 'From the activity log',
});

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
    return target.post
      ? postAttachment(target.post)
      : { id: `post:${target.postId}`, kind: 'post', label: 'Post' };
  }

  if (target.type === 'feed') {
    return feedAttachment(target.label, target.posts);
  }

  return agentAttachments.find(({ id }) => id === `agent:${target.type}`);
};

// Most posts one piece of feedback can point at. The API sweeps every marker
// into a relationship, so a reply that lists a whole feed would drown the
// finding the vote was actually about.
export const FEEDBACK_POST_LIMIT = 5;

// The posts a reply cited, as chips, so feedback about that reply can name
// them with the `@dailydev:post:` markers the API resolves.
export const messagePostAttachments = (
  message: Pick<AgentMessage, 'blocks'>,
  limit = FEEDBACK_POST_LIMIT,
): AgentAttachment[] => {
  const seen = new Set<string>();

  return (message.blocks ?? [])
    .flatMap((block) => (isPostsBlock(block) ? block.posts : []))
    .filter(({ id }) => {
      if (seen.has(id)) {
        return false;
      }

      seen.add(id);

      return true;
    })
    .slice(0, limit)
    .map(postAttachment);
};

const transcriptPosts = (messages: AgentMessage[]): Post[] =>
  messages
    // Newest first, so deduping downstream keeps the most recent copy.
    .slice()
    .reverse()
    .flatMap(({ blocks }) => blocks ?? [])
    .flatMap((block) => (isPostsBlock(block) ? block.posts : []));

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
