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
  onPreviewUnavailable?: () => void;
  onUseLegacyLayout?: () => void;
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
  onPreviewUnavailable,
  onUseLegacyLayout,
  forceUnavailable = false,
}: PostArticlePreviewEmbedProps): ReactElement {
  const [extensionId] = useState(() => getBrowserExtensionInstallId());
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
  const faviconSrc = useMemo(() => {
    const pixelRatio = globalThis?.window?.devicePixelRatio ?? 1;
    const iconSize = Math.max(Math.round(16 * pixelRatio), 96);

    return `${apiUrl}/icon?url=${encodeURIComponent(
      previewDomain,
    )}&size=${iconSize}`;
  }, [previewDomain]);

  useEffect(() => {
    setHasPreviewFrameLoaded(false);
    setHasTimedOutUnavailable(false);
    setEmbedState({ status: 'idle', errorReason: null });
    hasNotifiedUnavailableRef.current = false;
  }, [extensionId, targetUrl]);

  const onExtensionPreviewFrameLoad = useCallback(() => {
    setHasPreviewFrameLoaded(true);
  }, []);

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
  const shouldShowUnavailablePrompt =
    forceUnavailable || hasTimedOutUnavailable;
  const shouldShowPrompt = !extensionId;
  const shouldShowPreviewHeader = !!extensionId && !shouldShowUnavailablePrompt;

  const handleEmbedStateChange = useCallback(
    (state: UseExtensionSiteEmbedResult) => {
      setEmbedState({
        status: state.status,
        errorReason: state.errorReason,
      });

      if (state.status !== 'ready') {
        setHasPreviewFrameLoaded(false);
      }
    },
    [],
  );

  const handleRenderState = useCallback(
    (state: UseExtensionSiteEmbedResult) => {
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
    },
    [extensionId, onPreviewUnavailable],
  );

  useEffect(() => {
    const timeout = isExtensionPreviewAwaitingLoad
      ? globalThis.setTimeout(() => {
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
  }, [isExtensionPreviewAwaitingLoad, onPreviewUnavailable]);

  let previewContent: ReactElement;
  if (shouldShowUnavailablePrompt) {
    previewContent = (
      <EmbeddedBrowsingWebPrompt
        isPreviewUnavailable
        unavailablePreviewUrl={targetUrl}
        onUseLegacyLayout={onUseLegacyLayout}
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
        onStateChange={handleEmbedStateChange}
        renderState={handleRenderState}
      />
    );
  }

  return (
    <section
      className={classNames(
        'relative hidden min-h-0 min-w-0 flex-1 flex-col overflow-visible bg-background-default tablet:flex',
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
                {previewDomain}
              </button>
            </Typography>
          </div>
        ) : null}
        {previewContent}
        {shouldShowPrompt && !shouldShowUnavailablePrompt ? (
          <EmbeddedBrowsingWebPrompt onUseLegacyLayout={onUseLegacyLayout} />
        ) : null}
      </div>
    </section>
  );
}
