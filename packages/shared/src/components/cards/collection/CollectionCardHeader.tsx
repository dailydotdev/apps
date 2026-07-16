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
          'mb-1 mt-3 flex flex-row items-center',
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
