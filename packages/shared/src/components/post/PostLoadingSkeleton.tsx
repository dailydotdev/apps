import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { PostType } from '../../graphql/posts';
import PostContentContainer from './PostContentContainer';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';

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
