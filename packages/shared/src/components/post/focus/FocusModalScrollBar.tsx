import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { modalSizeToClassName } from '../../modals/common/Modal';
import type { ModalSize } from '../../modals/common/types';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon as CloseIcon } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import { Origin } from '../../../lib/log';
import { PostMenuOptions } from '../PostMenuOptions';
import { PostUpvotesCommentsCount } from '../PostUpvotesCommentsCount';

interface FocusModalScrollBarProps {
  post: Post;
  /** Matches the bar width to the modal it floats over. */
  size: ModalSize;
  onClose?: () => void;
}

/**
 * Fixed bar shown once the redesign post modal is scrolled: the in-flow top
 * strip (and the article header that owns the "…" menu) have scrolled away, so
 * this re-surfaces the post stats, the options menu, and the close button.
 * `position: fixed` (not sticky) because the modal card clips overflow on
 * laptop, which breaks sticky — same reason the legacy FixedPostNavigation
 * uses fixed.
 */
export function FocusModalScrollBar({
  post,
  size,
  onClose,
}: FocusModalScrollBarProps): ReactElement {
  return (
    <div
      className={classNames(
        'fixed inset-x-0 top-0 z-postNavigation mx-auto flex w-full items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-4 py-1',
        modalSizeToClassName[size],
      )}
      role="navigation"
    >
      <PostUpvotesCommentsCount
        post={post}
        compact
        passive
        className="!mb-0 min-w-0"
      />
      <div className="ml-auto flex items-center gap-1">
        <PostMenuOptions
          post={post}
          origin={Origin.ArticleModal}
          buttonSize={ButtonSize.Small}
        />
        {onClose && (
          <Tooltip side="bottom" content="Close">
            <Button
              variant={ButtonVariant.Tertiary}
              icon={<CloseIcon />}
              size={ButtonSize.Small}
              onClick={onClose}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
}
