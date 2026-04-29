import type { ReactElement, Ref } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { PostArticlePreviewEmbed } from '../PostArticlePreviewEmbed';
import { ReaderFallback } from './ReaderFallback';
import { ReaderHeaderActionGroup } from './ReaderHeaderActionButtons';

type ArticleReaderFrameProps = {
  post: Post;
  targetUrl: string | null;
  isEmbeddable: boolean;
  className?: string;
  onClose: () => void;
  isPostPage?: boolean;
  fallbackScrollRef?: Ref<HTMLDivElement>;
  contentTopOffsetPx?: number;
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
}: ArticleReaderFrameProps): ReactElement {
  const isFallback = !targetUrl || !isEmbeddable;
  const hasHeaderActions = !isPostPage;

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
        rightHeaderActions={
          hasHeaderActions && !isPostPage ? (
            <ReaderHeaderActionGroup onClose={onClose} showLegacyLayoutOptOut />
          ) : null
        }
        collapseOnUnavailable={false}
        className="!flex min-h-0 flex-1"
      />
    </div>
  );
}
