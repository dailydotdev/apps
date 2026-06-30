import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CollectionPillSources } from '../../post/collection/CollectionPillSources';
import { getCollectionPillLabel } from '../../post/collection/common';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from '../common/BookmarkProviderHeader';
import { useBookmarkProvider } from '../../../hooks/useBookmarkProvider';
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
      <CollectionPillSources
        className={{
          main: classNames(
            'mb-1 mt-3',
            highlightBookmarkedPost && headerHiddenClassName,
          ),
        }}
        sources={sources ?? []}
        totalSources={totalSources ?? 0}
        label={getCollectionPillLabel(post)}
      >
        <div className="flex-1" />
        <PostOptionButton
          post={post}
          triggerClassName="laptop:mouse:invisible laptop:mouse:group-hover:visible"
        />
      </CollectionPillSources>
    </>
  );
};
