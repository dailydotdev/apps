import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PostType } from '../../graphql/posts';
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
      className={classNames(className, 'tablet:flex-row tablet:pb-0')}
    >
      <PostLoadingPlaceholder className="tablet:border-r tablet:border-theme-divider-tertiary" />
    </PostContentContainer>
  );
}

export default PostLoadingSkeleton;
