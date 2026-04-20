import type { ReactElement, Ref } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  onUseLegacyLayout?: () => void;
  fallbackScrollRef?: Ref<HTMLDivElement>;
  contentTopOffsetPx?: number;
  usePlainEmbed?: boolean;
};

const PLAIN_EMBED_LOAD_TIMEOUT_MS = 7000;

export function ArticleReaderFrame({
  post,
  className,
  onEmbedUnavailable,
  onModeChange,
  onUseLegacyLayout,
  fallbackScrollRef,
  contentTopOffsetPx = 0,
  usePlainEmbed = false,
}: ArticleReaderFrameProps): ReactElement {
  const { targetUrl, isEmbeddable } = useIframeEmbed(post.permalink);
  const [forceFallback, setForceFallback] = useState(false);
  const [plainEmbedLoaded, setPlainEmbedLoaded] = useState(false);

  const mode: ReaderArticleMode =
    !targetUrl || !isEmbeddable || forceFallback ? 'fallback' : 'embed';

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  const onPreviewUnavailable = useCallback(() => {
    setForceFallback(true);
    onEmbedUnavailable?.();
  }, [onEmbedUnavailable]);

  const hasReportedUnavailableRef = useRef(false);
  useEffect(() => {
    if (!usePlainEmbed || mode !== 'embed') {
      return undefined;
    }
    hasReportedUnavailableRef.current = false;
    const timeout = globalThis.setTimeout(() => {
      if (plainEmbedLoaded || hasReportedUnavailableRef.current) {
        return;
      }
      hasReportedUnavailableRef.current = true;
      onPreviewUnavailable();
    }, PLAIN_EMBED_LOAD_TIMEOUT_MS);
    return () => {
      globalThis.clearTimeout(timeout);
    };
  }, [mode, onPreviewUnavailable, plainEmbedLoaded, targetUrl, usePlainEmbed]);

  if (mode === 'fallback') {
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

  if (usePlainEmbed) {
    return (
      <div
        className={classNames(
          'relative flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col bg-background-default',
          className,
        )}
      >
        <iframe
          key={targetUrl}
          title="Article preview"
          src={targetUrl}
          className="min-h-0 w-full flex-1 touch-auto border-0"
          onLoad={() => setPlainEmbedLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    );
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
