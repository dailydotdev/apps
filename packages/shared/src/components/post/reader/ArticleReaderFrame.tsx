import type { ReactElement, Ref } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { PostArticlePreviewEmbed } from '../PostArticlePreviewEmbed';
import { ReaderFallback } from './ReaderFallback';
import { ReaderHeaderActionGroup } from './ReaderHeaderActionButtons';
import { useLegacyPostLayoutOptOut } from './hooks/useLegacyPostLayoutOptOut';
import { TargetId } from '../../../lib/log';

type ArticleReaderFrameProps = {
  post: Post;
  targetUrl: string | null;
  isEmbeddable: boolean;
  className?: string;
  onClose?: () => void;
  isPostPage?: boolean;
  fallbackScrollRef?: Ref<HTMLDivElement>;
  contentTopOffsetPx?: number;
  onEmbedReady?: () => void;
  targetHref?: string;
  onTargetLinkClick?: () => void;
  targetLinkInNewTab?: boolean;
  /**
   * Renders to the left of the preview URL inside the iframe chrome
   * header. Used by the standalone post page to surface a
   * "Back to feed" arrow next to the URL bar.
   */
  leftHeaderActions?: ReactElement | null;
};

export function ArticleReaderFrame({
  post,
  targetUrl,
  isEmbeddable,
  className,
  onClose,
  isPostPage = false,
  fallbackScrollRef,
  contentTopOffsetPx = 0,
  onEmbedReady,
  targetHref,
  onTargetLinkClick,
  targetLinkInNewTab,
  leftHeaderActions,
}: ArticleReaderFrameProps): ReactElement {
  const { optOut } = useLegacyPostLayoutOptOut();
  const onInstallPromptOptOut = useCallback(
    () => optOut(TargetId.ReaderInstallPrompt),
    [optOut],
  );
  const onPermissionScreenOptOut = useCallback(
    () => optOut(TargetId.ReaderPermissionPrompt),
    [optOut],
  );
  const isFallback = !targetUrl || !isEmbeddable;

  if (isFallback) {
    return (
      <ReaderFallback
        ref={fallbackScrollRef}
        post={post}
        className={classNames('touch-pan-y', className)}
        contentTopOffsetPx={contentTopOffsetPx}
      />
    );
  }

  if (!targetUrl) {
    throw new Error('Reader embed mode requires a valid target URL');
  }

  return (
    <div
      className={classNames(
        'relative flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col bg-background-default',
        className,
      )}
    >
      <PostArticlePreviewEmbed
        targetUrl={targetUrl}
        previewHost={post.domain ?? undefined}
        leftHeaderActions={leftHeaderActions ?? undefined}
        rightHeaderActions={
          <ReaderHeaderActionGroup
            onClose={isPostPage ? undefined : onClose}
            showLegacyLayoutOptOut
            legacyLayoutOptOutShowLabel={!isPostPage}
          />
        }
        collapseOnUnavailable={false}
        className="!flex min-h-0 flex-1"
        onEmbedReady={onEmbedReady}
        targetHref={targetHref}
        onTargetLinkClick={onTargetLinkClick}
        targetLinkInNewTab={targetLinkInNewTab}
        onInstallPromptOptOut={onInstallPromptOptOut}
        onPermissionScreenOptOut={onPermissionScreenOptOut}
      />
    </div>
  );
}
