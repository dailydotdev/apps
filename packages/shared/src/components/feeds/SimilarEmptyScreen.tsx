import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import { cloudinaryCharmSearchNoResults } from '../../lib/image';
import { ButtonSize } from '../buttons/Button';
import { TagLinks } from '../TagLinks';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';

function SimilarEmptyScreen({ post }: { post: Post }): ReactElement {
  return (
    <div className="flex w-full flex-col items-center">
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
      {!!post?.tags?.length && (
        <div className="mt-6 flex flex-wrap justify-center gap-3 px-4">
          <TagLinks tags={post.tags} buttonProps={{ size: ButtonSize.Large }} />
        </div>
      )}
    </div>
  );
}

export default SimilarEmptyScreen;
