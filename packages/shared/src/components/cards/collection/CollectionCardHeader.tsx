import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CollectionSourceStack } from '../../post/collection/CollectionSourceStack';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from '../common/BookmarkProviderHeader';
import { useBookmarkProvider } from '../../../hooks';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import type { Post } from '../../../graphql/posts';

interface CollectionCardHeaderProps {
  post: Post;
}

export const CollectionCardHeader = ({
  post,
}: CollectionCardHeaderProps): ReactElement => {
  const {
    collectionSources: sources,
    numCollectionSources: totalSources,
    bookmarked,
  } = post;

  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: bookmarked ?? false,
  });

  return (
    <>
      {highlightBookmarkedPost && <BookmakProviderHeader />}
      <div
        className={classNames(
          // mt-4 matches the article card's CardHeader top margin so the title
          // (and the tags/date below it) start on the same row.
          'mb-1 mt-4 flex flex-row items-center',
          highlightBookmarkedPost && headerHiddenClassName,
        )}
      >
        <CollectionSourceStack
          sources={sources ?? []}
          totalSources={totalSources ?? 0}
        />
        <div className="flex-1" />
        <PostOptionButton
          post={post}
          triggerClassName="laptop:mouse:invisible laptop:mouse:group-hover:visible"
        />
      </div>
    </>
  );
};
