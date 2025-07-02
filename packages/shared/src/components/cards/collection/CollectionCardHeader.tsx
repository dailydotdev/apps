import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CollectionPillSources } from '../../post/collection';
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
    bookmarked,
  });

  return (
    <>
      {highlightBookmarkedPost && (
        <BookmakProviderHeader
          className={classNames('relative my-1 flex h-10 py-2')}
        />
      )}
      <CollectionPillSources
        className={{
          main: classNames(
            'mb-1 mt-3',
            highlightBookmarkedPost && headerHiddenClassName,
          ),
        }}
        sources={sources}
        totalSources={totalSources}
      >
        <div className="flex-1" />
        <PostOptionButton
          post={post}
          triggerClassName="group-hover:flex laptop:hidden"
        />
      </CollectionPillSources>
    </>
  );
};
