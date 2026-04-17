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
import { ExtensionSiteEmbedStatus } from '../../features/extensionEmbed/common';
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
  forceUnavailable?: boolean;
};

const PREVIEW_LOAD_TIMEOUT_MS = 7000;

enum ViewMode {
  Install = 'install',
  Unavailable = 'unavailable',
  Preview = 'preview',
}

const renderEmbedChrome = (
  state: UseExtensionSiteEmbedResult,
): ReactElement | null => {
  if (state.status === ExtensionSiteEmbedStatus.Error && state.error) {
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

  if (state.status === ExtensionSiteEmbedStatus.ReloadingExtension) {
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
  forceUnavailable = false,
}: PostArticlePreviewEmbedProps): ReactElement {
  const [extensionId] = useState(() => getBrowserExtensionInstallId());
  const [hasPreviewFrameLoaded, setHasPreviewFrameLoaded] = useState(false);
  const [hasTimedOutUnavailable, setHasTimedOutUnavailable] = useState(false);
  const [embedStatus, setEmbedStatus] = useState<
    UseExtensionSiteEmbedResult['status']
  >(ExtensionSiteEmbedStatus.Idle);
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
    setEmbedStatus(ExtensionSiteEmbedStatus.Idle);
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

  let viewMode: ViewMode;
  if (!extensionId) {
    viewMode = ViewMode.Install;
  } else if (forceUnavailable || hasTimedOutUnavailable) {
    viewMode = ViewMode.Unavailable;
  } else {
    viewMode = ViewMode.Preview;
  }

  const isAwaitingPreviewLoad =
    viewMode === ViewMode.Preview &&
    embedStatus === ExtensionSiteEmbedStatus.Ready &&
    !hasPreviewFrameLoaded;

  const handleEmbedStateChange = useCallback(
    (state: UseExtensionSiteEmbedResult) => {
      setEmbedStatus(state.status);
      if (state.status !== ExtensionSiteEmbedStatus.Ready) {
        setHasPreviewFrameLoaded(false);
      }

      if (
        state.errorReason === 'preview-unavailable' &&
        onPreviewUnavailable &&
        !hasNotifiedUnavailableRef.current
      ) {
        hasNotifiedUnavailableRef.current = true;
        onPreviewUnavailable();
      }
    },
    [onPreviewUnavailable],
  );

  const handleRenderState = useCallback(
    (state: UseExtensionSiteEmbedResult) => renderEmbedChrome(state),
    [],
  );

  useEffect(() => {
    if (!isAwaitingPreviewLoad) {
      return undefined;
    }

    const timeout = globalThis.setTimeout(() => {
      if (hasNotifiedUnavailableRef.current) {
        return;
      }

      hasNotifiedUnavailableRef.current = true;
      setHasTimedOutUnavailable(true);
      onPreviewUnavailable?.();
    }, PREVIEW_LOAD_TIMEOUT_MS);

    return () => globalThis.clearTimeout(timeout);
  }, [isAwaitingPreviewLoad, onPreviewUnavailable]);

  return (
    <section
      className={classNames(
        'relative hidden min-h-0 min-w-0 flex-1 flex-col overflow-visible bg-background-default tablet:flex',
        className,
      )}
      aria-label="Article preview"
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-visible">
        {viewMode === ViewMode.Preview ? (
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
        {viewMode === ViewMode.Unavailable ? (
          <EmbeddedBrowsingWebPrompt
            isPreviewUnavailable
            unavailablePreviewUrl={targetUrl}
          />
        ) : null}
        {viewMode === ViewMode.Preview ? (
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
        ) : null}
        {viewMode === ViewMode.Install ? <EmbeddedBrowsingWebPrompt /> : null}
      </div>
    </section>
  );
}
