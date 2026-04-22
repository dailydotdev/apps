import type { ReactElement, Ref } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { PostArticlePreviewEmbed } from '../PostArticlePreviewEmbed';
import { ReaderFallback } from './ReaderFallback';
import { useIframeEmbed } from './hooks/useIframeEmbed';

type ArticleReaderFrameProps = {
  post: Post;
  className?: string;
  onEmbedUnavailable?: () => void;
  onUseLegacyLayout?: () => void;
  fallbackScrollRef?: Ref<HTMLDivElement>;
  contentTopOffsetPx?: number;
};

export function ArticleReaderFrame({
  post,
  className,
  onEmbedUnavailable,
  onUseLegacyLayout,
  fallbackScrollRef,
  contentTopOffsetPx = 0,
}: ArticleReaderFrameProps): ReactElement {
  const { targetUrl, isEmbeddable } = useIframeEmbed(post.permalink);
  const [forceFallback, setForceFallback] = useState(false);

  const isFallback = !targetUrl || !isEmbeddable || forceFallback;

  const onPreviewUnavailable = useCallback(() => {
    setForceFallback(true);
    onEmbedUnavailable?.();
  }, [onEmbedUnavailable]);

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
        onPreviewUnavailable={onPreviewUnavailable}
        onUseLegacyLayout={onUseLegacyLayout}
        className="!flex min-h-0 flex-1"
      />
    </div>
  );
}
