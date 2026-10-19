import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import postPages from './postPages.json';

// Every history post as POST_BY_ID_QUERY returned it from api.daily.dev, for
// the production components that need a whole Post.

const posts = postPages as unknown as Record<string, Post>;

export const fullPost = (id: string): Post => posts[id];
