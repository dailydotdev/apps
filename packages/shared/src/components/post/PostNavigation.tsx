import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import ArrowIcon from '../icons/Arrow';
import { PostModalActions, PostModalActionsProps } from './PostModalActions';

type PostActions = Pick<
  PostModalActionsProps,
  | 'post'
  | 'onClose'
  | 'onShare'
  | 'onBookmark'
  | 'onReadArticle'
  | 'inlineActions'
>;

export interface PostNavigationClassName {
  container?: string;
  actions?: string;
}

export interface PostNavigationProps extends PostActions {
  onPreviousPost?: () => unknown;
  onNextPost?: () => unknown;
  className?: PostNavigationClassName;
  children?: ReactNode;
}

export function PostNavigation({
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
            className="-rotate-90 btn-secondary"
            icon={<ArrowIcon />}
            onClick={onPreviousPost}
          />
        </SimpleTooltip>
      )}
      {onNextPost && (
        <SimpleTooltip content="Next">
          <Button
            className="rotate-90 btn-secondary"
            icon={<ArrowIcon />}
            onClick={onNextPost}
          />
        </SimpleTooltip>
      )}
      {children}
      <PostModalActions
        {...props}
        className={classNames('flex', className?.actions)}
        notificactionClassName="ml-4"
        contextMenuId="post-navigation-context"
      />
    </div>
  );
}
