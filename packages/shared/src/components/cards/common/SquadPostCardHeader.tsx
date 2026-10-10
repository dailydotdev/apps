import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from './BookmarkProviderHeader';
import { useBookmarkProvider } from '../../../hooks';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import { AuthorSourceStack } from './AuthorSourceStack';

// enableSourceHeader is kept for API compatibility with the shared card props;
// the source now always renders in the stack (when it isn't a user source).
type SquadPostCardHeaderProps = {
  post: Post;
  enableSourceHeader?: boolean;
  /** `card_save_on_hover`: the bookmark, right before ⋯. */
  bookmark?: ReactNode;
};

export const SquadPostCardHeader = ({
  post,
  bookmark,
}: SquadPostCardHeaderProps): ReactElement => {
  const { author, source, bookmarked } = post;
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: bookmarked ?? false,
  });

  return (
    <>
      {highlightBookmarkedPost && <BookmakProviderHeader />}
      <div
        className={classNames(
          'mb-2 mt-4',
          highlightBookmarkedPost && headerHiddenClassName,
        )}
      >
        <div className="relative flex w-full flex-row items-center">
          <AuthorSourceStack author={author} source={source} />
          <div className="flex flex-1" />
          {bookmark}
          <PostOptionButton
            post={post}
            triggerClassName="laptop:mouse:invisible laptop:mouse:group-hover:visible"
          />
        </div>
      </div>
    </>
  );
};
