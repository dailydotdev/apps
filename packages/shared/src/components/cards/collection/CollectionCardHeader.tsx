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
import { useFeature } from '../../GrowthBookProvider';
import { featureCardUiButtons } from '../../../lib/featureManagement';

interface CollectionCardHeaderProps {
  post: Post;
}

export const CollectionCardHeader = ({
  post,
}: CollectionCardHeaderProps): ReactElement => {
  const buttonExp = useFeature(featureCardUiButtons);
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
            buttonExp ? 'mb-1 mt-3' : 'm-2 mb-1',
            highlightBookmarkedPost && headerHiddenClassName,
          ),
        }}
        sources={sources}
        totalSources={totalSources}
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
