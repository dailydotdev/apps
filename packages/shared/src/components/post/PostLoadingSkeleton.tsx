import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PostType } from '../../graphql/posts';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';
import PostContentContainer from './PostContentContainer';
import { Source } from '../../graphql/sources';
import { isSourcePublicSquad } from '../../graphql/squads';

interface PostLoadingSkeletonProps {
  type: PostType;
  source?: Source;
  className?: string;
  hasNavigation?: boolean;
}

function PostLoadingSkeleton({
  type,
  source,
  className,
  hasNavigation,
}: PostLoadingSkeletonProps): ReactElement {
  if (!type) {
    return null;
  }
  const publicSquadPost = isSourcePublicSquad(source);

  if (type === PostType.Share) {
    return (
      <PostContentContainer
        className={classNames(className, {
          'm-auto': !publicSquadPost,
          'tablet:pb-0 tablet:flex-row': publicSquadPost,
        })}
        hasNavigation={hasNavigation}
      >
        <PostLoadingPlaceholder
          className={classNames({
            'tablet:border-r tablet:border-theme-divider-tertiary':
              publicSquadPost,
          })}
          shouldShowWidgets={publicSquadPost}
        />
      </PostContentContainer>
    );
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
