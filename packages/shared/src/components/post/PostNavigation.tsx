import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { ArrowIcon } from '../icons';
import { PostHeaderActions } from './PostHeaderActions';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import { PostNavigationProps } from './common';

function PostNavigation({
  postPosition,
  onPreviousPost,
  onNextPost,
  className = {},
  children,
  contextMenuId = 'post-navigation-context',
  ...props
}: PostNavigationProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-row items-center gap-2',
        className?.container,
      )}
      role="navigation"
    >
      {onPreviousPost && (
        <SimpleTooltip content="Previous">
          <Button
            className="-rotate-90"
            icon={<ArrowIcon />}
            variant={ButtonVariant.Tertiary}
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
            className="rotate-90"
            icon={<ArrowIcon />}
            variant={ButtonVariant.Tertiary}
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
        contextMenuId={contextMenuId}
      />
    </div>
  );
}

export default PostNavigation;
