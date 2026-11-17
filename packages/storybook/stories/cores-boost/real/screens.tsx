import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';

// The viewer's own post that the boost and analytics stories boost.

export const boostablePost = {
  id: 'sb-boost-post',
  type: PostType.Article,
  title: 'How we cut our CI time in half with remote caching',
  image: cloudinaryPostImageCoverPlaceholder,
  createdAt: '2026-11-01T09:00:00.000Z',
  tags: ['ci', 'devops', 'monorepo'],
  source: {
    id: 'sb-user-source',
    type: SourceType.User,
    name: 'Dev Dana',
    handle: 'devdana',
    image: fallbackImages.avatar,
  },
  flags: {},
} as unknown as Post;
