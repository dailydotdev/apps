import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { PostPosition } from '../../hooks/usePostModalNavigation';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { PostNavigationProps } from './common';
import { PostHeaderActions } from './PostHeaderActions';

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
