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
  if (!type) return null;

  if (type === PostType.Share) {
    return (
      <PostContentContainer
        className={classNames(className, 'm-auto')}
        hasNavigation={hasNavigation}
      >
        <PostLoadingPlaceholder shouldShowWidgets={false} />
      </PostContentContainer>
    );
  }

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={classNames(
        className,
        'tablet:pb-0 tablet:flex-row bg-theme-bg-primary',
      )}
    >
      <PostLoadingPlaceholder className="tablet:border-r tablet:border-theme-divider-tertiary" />
    </PostContentContainer>
  );
}

export default PostLoadingSkeleton;
