import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { PostType } from '../../graphql/posts';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';
import PostContentContainer from './PostContentContainer';

interface PostLoadingSkeletonProps {
  type: PostType;
  className?: string;
  hasNavigation?: boolean;
}

function PostLoadingSkeleton({
  type,
  className,
  hasNavigation,
}: PostLoadingSkeletonProps): ReactElement {
  if (!type) {
    return null;
  }

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={classNames(className, 'laptop:flex-row laptop:pb-0')}
    >
      <PostLoadingPlaceholder className="tablet:border-r tablet:border-border-subtlest-tertiary" />
    </PostContentContainer>
  );
}

export default PostLoadingSkeleton;
