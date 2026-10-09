import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  PhonePostLoadingPlaceholder,
  PostLoadingPlaceholder,
} from './PostLoadingPlaceholder';
import PostContentContainer from './PostContentContainer';

interface PostLoadingSkeletonProps {
  className?: string;
  hasNavigation?: boolean;
}

function PostLoadingSkeleton({
  className,
  hasNavigation,
}: PostLoadingSkeletonProps): ReactElement {
  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={classNames(className, 'laptop:flex-row laptop:pb-0')}
    >
      <PhonePostLoadingPlaceholder className="tablet:hidden" />
      <div className="hidden tablet:contents">
        <PostLoadingPlaceholder className="tablet:border-r tablet:border-border-subtlest-tertiary" />
      </div>
    </PostContentContainer>
  );
}

export default PostLoadingSkeleton;
