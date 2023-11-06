import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import ArrowIcon from '../icons/Arrow';
import { PostHeaderActions, PostHeaderActionsProps } from './PostHeaderActions';
import { PostPosition } from '../../hooks/usePostModalNavigation';

type PostActions = Pick<
  PostHeaderActionsProps,
  | 'post'
  | 'onClose'
  | 'onShare'
  | 'onReadArticle'
  | 'inlineActions'
  | 'onRemovePost'
>;

export interface PostNavigationClassName {
  container?: string;
  actions?: string;
  title?: string;
}

export interface PostNavigationProps extends PostActions {
  postPosition?: PostPosition;
  onPreviousPost?: () => unknown;
  onNextPost?: () => unknown;
  className?: PostNavigationClassName;
  children?: ReactNode;
}

function PostNavigation({
  postPosition,
  onPreviousPost,
  onNextPost,
  className = {},
  children,
  ...props
}: PostNavigationProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-row gap-2 items-center',
        className?.container,
      )}
      role="navigation"
    >
      {onPreviousPost && (
        <SimpleTooltip content="Previous">
          <Button
            className="-rotate-90 btn-tertiary"
            icon={<ArrowIcon />}
            onClick={onPreviousPost}
            disabled={[PostPosition.First, PostPosition.Only].includes(
              postPosition,
            )}
          />
        </SimpleTooltip>
      )}
      {onNextPost && (
        <SimpleTooltip content="Next">
          <Button
            className="rotate-90 btn-tertiary"
            icon={<ArrowIcon />}
            onClick={onNextPost}
            disabled={[PostPosition.Last, PostPosition.Only].includes(
              postPosition,
            )}
          />
        </SimpleTooltip>
      )}
      {children}
      <PostHeaderActions
        {...props}
        className={classNames('flex', className?.actions)}
        notificationClassName="ml-4"
        contextMenuId="post-navigation-context"
      />
    </div>
  );
}

export default PostNavigation;
