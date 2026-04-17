import type { ReactElement, Ref } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { PostArticlePreviewEmbed } from '../PostArticlePreviewEmbed';
import { ReaderFallback } from './ReaderFallback';
import { useIframeEmbed } from './hooks/useIframeEmbed';

export type ReaderArticleMode = 'embed' | 'fallback';

type ArticleReaderFrameProps = {
  post: Post;
  className?: string;
  onEmbedUnavailable?: () => void;
  onModeChange?: (mode: ReaderArticleMode) => void;
  onUseClassicView?: () => void;
  fallbackScrollRef?: Ref<HTMLDivElement>;
  forceReader?: boolean;
  contentTopOffsetPx?: number;
};

export function ArticleReaderFrame({
  post,
  className,
  onEmbedUnavailable,
  onModeChange,
  onUseClassicView,
  fallbackScrollRef,
  forceReader = false,
  contentTopOffsetPx = 0,
}: ArticleReaderFrameProps): ReactElement {
  const { targetUrl, isEmbeddable } = useIframeEmbed(post.permalink);
  const [forceFallback, setForceFallback] = useState(false);

  const mode: ReaderArticleMode =
    forceReader || !targetUrl || !isEmbeddable || forceFallback
      ? 'fallback'
      : 'embed';

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  const onPreviewUnavailable = useCallback(() => {
    setForceFallback(true);
    onEmbedUnavailable?.();
  }, [onEmbedUnavailable]);

  if (mode === 'fallback') {
    return (
      <ReaderFallback
        ref={fallbackScrollRef}
        post={post}
        className={className}
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
        'relative flex min-h-0 min-w-0 flex-1 flex-col bg-background-default',
        className,
      )}
    >
      <PostArticlePreviewEmbed
        targetUrl={targetUrl}
        previewHost={post.domain ?? undefined}
        onPreviewUnavailable={onPreviewUnavailable}
        onUseClassicView={onUseClassicView}
        className="!flex min-h-0 flex-1"
      />
    </div>
  );
}
