import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import { cloudinaryCharmSearchNoResults } from '../../lib/image';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';

function SimilarEmptyScreen({ post }: { post: Post }): ReactElement {
  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={cloudinaryCharmSearchNoResults}
      imageAlt="daily.dev charm searching with a magnifying glass"
      title="No similar posts yet"
      description={
        post?.title
          ? `Nothing close to "${post.title}" has been posted yet.`
          : 'Nothing close to this post has been posted yet.'
      }
    />
  );
}

export default SimilarEmptyScreen;
