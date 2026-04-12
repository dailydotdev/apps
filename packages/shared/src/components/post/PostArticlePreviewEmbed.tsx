import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { EmbeddedBrowsingWebPrompt } from '../../features/extensionEmbed/EmbeddedBrowsingWebPrompt';
import { ExtensionSiteEmbed } from '../../features/extensionEmbed/ExtensionSiteEmbed';
import { getBrowserExtensionInstallId } from '../../features/extensionEmbed/getBrowserExtensionInstallId';
import type { UseExtensionSiteEmbedResult } from '../../features/extensionEmbed/useExtensionSiteEmbed';
import { apiUrl } from '../../lib/config';
import { Loader } from '../Loader';
import {
  Typography,
  TypographyTag,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

type PostArticlePreviewEmbedProps = {
  targetUrl: string;
  previewHost?: string;
  className?: string;
  onDismissArticlePreview?: () => void;
  onPreviewUnavailable?: () => void;
  forceUnavailable?: boolean;
};

const renderEmbedChrome = ({
  extensionId,
  state,
}: {
  extensionId: string | null;
  state: UseExtensionSiteEmbedResult;
}): ReactElement | null => {
  if (!extensionId) {
    return null;
  }

  if (state.status === 'error' && state.error) {
    return (
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center p-4"
        aria-live="polite"
      >
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="max-w-sm text-center"
        >
          {state.error}
        </Typography>
      </div>
    );
  }

  if (state.status === 'reloading-extension') {
    return (
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-overlay-quaternary-onion">
        <Loader className="h-6 w-6" />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          Reloading extension…
        </Typography>
      </div>
    );
  }

  return null;
};

export function PostArticlePreviewEmbed({
  targetUrl,
  previewHost,
  className,
  onDismissArticlePreview,
  onPreviewUnavailable,
  forceUnavailable = false,
}: PostArticlePreviewEmbedProps): ReactElement {
  const extensionId = useMemo(() => getBrowserExtensionInstallId(), []);
  const [showDirectWebPreview, setShowDirectWebPreview] = useState(false);
  const [hasPreviewFrameLoaded, setHasPreviewFrameLoaded] = useState(false);
  const [hasTimedOutUnavailable, setHasTimedOutUnavailable] = useState(false);
  const [embedState, setEmbedState] = useState<{
    status: UseExtensionSiteEmbedResult['status'];
    errorReason: UseExtensionSiteEmbedResult['errorReason'];
  }>({
    status: 'idle',
    errorReason: null,
  });
  const hasNotifiedUnavailableRef = useRef(false);
  const previewDomain = useMemo(() => {
    if (previewHost && previewHost.length > 0) {
      return previewHost;
    }

    try {
      return new URL(targetUrl).hostname;
    } catch {
      return targetUrl;
    }
  }, [previewHost, targetUrl]);
  const previewUrlLabel = useMemo(() => {
    try {
      const parsedTarget = new URL(targetUrl);
      return `${parsedTarget.hostname}${parsedTarget.pathname}`;
    } catch {
      return targetUrl;
    }
  }, [targetUrl]);
  const faviconSrc = useMemo(() => {
    const pixelRatio = globalThis?.window?.devicePixelRatio ?? 1;
    const iconSize = Math.max(Math.round(16 * pixelRatio), 96);

    return `${apiUrl}/icon?url=${encodeURIComponent(
      previewDomain,
    )}&size=${iconSize}`;
  }, [previewDomain]);

  useEffect(() => {
    // #region agent log
    fetch(
      'http://127.0.0.1:7456/ingest/fdbfceea-236d-410d-a991-0af0a5442e8e',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '8fe848',
        },
        body: JSON.stringify({
          sessionId: '8fe848',
          runId: 'initial',
          hypothesisId: 'H2',
          location: 'PostArticlePreviewEmbed.tsx:106',
          message: 'embed target changed reset local preview state',
          data: { targetUrl, extensionId },
          timestamp: Date.now(),
        }),
      },
    ).catch(() => {});
    // #endregion
    setShowDirectWebPreview(false);
    setHasPreviewFrameLoaded(false);
    setHasTimedOutUnavailable(false);
    setEmbedState({ status: 'idle', errorReason: null });
    hasNotifiedUnavailableRef.current = false;
  }, [extensionId, targetUrl]);

  const onEnableDirectWebPreview = useCallback(() => {
    // #region agent log
    fetch(
      'http://127.0.0.1:7456/ingest/fdbfceea-236d-410d-a991-0af0a5442e8e',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '8fe848',
        },
        body: JSON.stringify({
          sessionId: '8fe848',
          runId: 'initial',
          hypothesisId: 'H6',
          location: 'PostArticlePreviewEmbed.tsx:160',
          message: 'enable clicked in webapp prompt',
          data: { targetUrl, extensionId },
          timestamp: Date.now(),
        }),
      },
    ).catch(() => {});
    // #endregion
    setHasPreviewFrameLoaded(false);
    setHasTimedOutUnavailable(false);
    setShowDirectWebPreview(true);
  }, [extensionId, targetUrl]);

  const onExtensionPreviewFrameLoad = useCallback(() => {
    // #region agent log
    fetch(
      'http://127.0.0.1:7456/ingest/fdbfceea-236d-410d-a991-0af0a5442e8e',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '8fe848',
        },
        body: JSON.stringify({
          sessionId: '8fe848',
          runId: 'initial',
          hypothesisId: 'H1',
          location: 'PostArticlePreviewEmbed.tsx:141',
          message: 'extension preview iframe onLoad fired',
          data: { targetUrl, extensionId },
          timestamp: Date.now(),
        }),
      },
    ).catch(() => {});
    // #endregion
    setHasPreviewFrameLoaded(true);
  }, [extensionId, targetUrl]);

  const onCopyPreviewUrl = useCallback(() => {
    if (!targetUrl) {
      return;
    }

    navigator.clipboard?.writeText(targetUrl).catch(() => {});
  }, [targetUrl]);

  const isExtensionPreviewAwaitingLoad =
    !!extensionId &&
    embedState.status === 'ready' &&
    !hasPreviewFrameLoaded &&
    !forceUnavailable;
  const showDirectPreviewFrame = !extensionId && showDirectWebPreview;
  const isDirectPreviewAwaitingLoad =
    showDirectPreviewFrame && !hasPreviewFrameLoaded && !forceUnavailable;
  const shouldShowUnavailablePrompt =
    forceUnavailable || hasTimedOutUnavailable;
  const shouldShowPrompt = !extensionId && !showDirectWebPreview;
  const shouldShowPreviewHeader =
    (showDirectPreviewFrame || !!extensionId) && !shouldShowUnavailablePrompt;

  useEffect(() => {
    const timeout =
      isExtensionPreviewAwaitingLoad || isDirectPreviewAwaitingLoad
        ? globalThis.setTimeout(() => {
            // #region agent log
            fetch(
              'http://127.0.0.1:7456/ingest/fdbfceea-236d-410d-a991-0af0a5442e8e',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Debug-Session-Id': '8fe848',
                },
                body: JSON.stringify({
                  sessionId: '8fe848',
                  runId: 'initial',
                  hypothesisId: 'H1',
                  location: 'PostArticlePreviewEmbed.tsx:165',
                  message: 'preview load timeout fired',
                  data: {
                    targetUrl,
                    extensionId,
                    isExtensionPreviewAwaitingLoad,
                    isDirectPreviewAwaitingLoad,
                  },
                  timestamp: Date.now(),
                }),
              },
            ).catch(() => {});
            // #endregion
            if (hasNotifiedUnavailableRef.current) {
              return;
            }

            hasNotifiedUnavailableRef.current = true;
            setHasTimedOutUnavailable(true);
            onPreviewUnavailable?.();
          }, 7000)
        : undefined;

    return () => {
      if (timeout) {
        globalThis.clearTimeout(timeout);
      }
    };
  }, [
    isDirectPreviewAwaitingLoad,
    isExtensionPreviewAwaitingLoad,
    onPreviewUnavailable,
  ]);

  let previewContent: ReactElement;
  if (shouldShowUnavailablePrompt) {
    previewContent = (
      <EmbeddedBrowsingWebPrompt
        onDismiss={onDismissArticlePreview}
        isPreviewUnavailable
        unavailablePreviewUrl={targetUrl}
      />
    );
  } else if (showDirectPreviewFrame) {
    previewContent = (
      <iframe
        key={targetUrl}
        src={targetUrl}
        title="Article preview"
        className="h-full min-h-[28rem] w-full flex-1 border-0"
        onLoad={onExtensionPreviewFrameLoad}
      />
    );
  } else {
    previewContent = (
      <ExtensionSiteEmbed
        extensionId={extensionId}
        targetUrl={targetUrl}
        enabled
        className="h-full min-h-[28rem] w-full flex-1 border-0"
        permissionFrameTitle="Embedded browsing permissions"
        targetFrameTitle="Article preview"
        onTargetFrameLoad={onExtensionPreviewFrameLoad}
        onStateChange={(state) => {
          // #region agent log
          fetch(
            'http://127.0.0.1:7456/ingest/fdbfceea-236d-410d-a991-0af0a5442e8e',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Debug-Session-Id': '8fe848',
              },
              body: JSON.stringify({
                sessionId: '8fe848',
                runId: 'initial',
                hypothesisId: 'H2',
                location: 'PostArticlePreviewEmbed.tsx:247',
                message: 'extension embed state updated',
                data: {
                  status: state.status,
                  errorReason: state.errorReason,
                  hasPreviewFrameLoaded,
                },
                timestamp: Date.now(),
              }),
            },
          ).catch(() => {});
          // #endregion
          setEmbedState({
            status: state.status,
            errorReason: state.errorReason,
          });

          if (state.status !== 'ready') {
            setHasPreviewFrameLoaded(false);
          }
        }}
        renderState={(state) => {
          if (
            state.errorReason === 'preview-unavailable' &&
            onPreviewUnavailable &&
            !hasNotifiedUnavailableRef.current
          ) {
            hasNotifiedUnavailableRef.current = true;
            onPreviewUnavailable();
          }

          return renderEmbedChrome({
            extensionId,
            state,
          });
        }}
      />
    );
  }

  return (
    <section
      className={classNames(
        'relative hidden min-h-0 min-w-0 flex-1 flex-col overflow-visible bg-background-default laptop:flex',
        className,
      )}
      aria-label="Article preview"
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-visible">
        {shouldShowPreviewHeader ? (
          <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-3 py-2">
            <img
              src={faviconSrc}
              alt=""
              className="size-4 shrink-0 rounded-4"
              loading="lazy"
              aria-hidden
            />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Secondary}
              className="min-w-0 flex-1 truncate"
            >
              <button
                type="button"
                onClick={onCopyPreviewUrl}
                className="block w-full truncate text-left"
                title="Copy preview URL"
                aria-label="Copy preview URL"
              >
                {previewUrlLabel}
              </button>
            </Typography>
          </div>
        ) : null}
        {previewContent}
        {shouldShowPrompt && !shouldShowUnavailablePrompt ? (
          <EmbeddedBrowsingWebPrompt
            onDismiss={onDismissArticlePreview}
            onEnablePreview={onEnableDirectWebPreview}
          />
        ) : null}
      </div>
    </section>
  );
}
