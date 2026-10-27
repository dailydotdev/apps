import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { AgentUpdate, Tone } from './data';
import { realFeed } from './realFeed';

const asPosts = (posts: unknown[]): Post[] =>
  posts.map((post) => ({
    bookmarked: false,
    read: false,
    userState: { vote: 0, flags: {} },
    ...(post as Post),
  })) as Post[];

/** Popular, as an anonymous reader saw it when the snapshot was taken. */
export const realPosts: Post[] = asPosts(realFeed.posts);

/** What `feedHero` served for the carousel at the same moment. */
export const realHeroPosts: Post[] = asPosts(realFeed.heroPosts);

const tones: Tone[] = [
  'cabbage',
  'bacon',
  'avocado',
  'water',
  'onion',
  'cheese',
];

/** The agents highlights channel, newest first, its posts' summaries as the
 * message body. */
export const realAgentUpdates: AgentUpdate[] = realFeed.agentUpdates.map(
  (update, index) => ({
    id: update.id,
    agent: update.source.name,
    initial: update.source.name.slice(0, 1),
    image: update.source.image,
    tone: tones[index % tones.length],
    headline: update.headline,
    change: update.summary,
    at: update.at,
  }),
);
