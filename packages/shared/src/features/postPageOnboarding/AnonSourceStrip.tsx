import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import type { SourceTooltip } from '../../graphql/sources';
import { SourceStrip } from '../../components/post/reader/SourceStrip';
import { PostHeaderActions } from '../../components/post/PostHeaderActions';
import { ButtonSize } from '../../components/buttons/Button';

interface AnonSourceStripProps {
  post: Post;
  onReadArticle?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * The post-page source area for anonymous readers, styled after the "Read
 * inside daily.dev" reader: a single horizontal strip with the source
 * (avatar + name), the "Read post" button, and the three-dots menu. Cleaner
 * and more action-oriented than the legacy inline source line.
 */
export const AnonSourceStrip = ({
  post,
  onReadArticle,
  onClose,
  className,
}: AnonSourceStripProps): ReactElement => (
  <div
    className={classNames(
      'flex items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary p-2 pl-3',
      className,
    )}
  >
    <SourceStrip source={post?.source as SourceTooltip} />
    <PostHeaderActions
      post={post}
      onReadArticle={onReadArticle}
      onClose={onClose}
      contextMenuId="anon-post-header-actions"
      buttonSize={ButtonSize.Small}
      className="shrink-0"
    />
  </div>
);
