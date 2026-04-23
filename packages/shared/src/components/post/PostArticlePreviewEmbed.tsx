import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ExtensionSiteEmbed } from '../../features/extensionEmbed/ExtensionSiteEmbed';
import { getBrowserExtensionInstallId } from '../../features/extensionEmbed/getBrowserExtensionInstallId';
import type { UseExtensionSiteEmbedResult } from '../../features/extensionEmbed/useExtensionSiteEmbed';
import { useIsBrowserExtensionInstalled } from '../../features/extensionEmbed/useIsBrowserExtensionInstalled';
import { checkIsExtension } from '../../lib/func';
import { apiUrl } from '../../lib/config';
import { Loader } from '../Loader';
import {
  Typography,
  TypographyTag,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

const FRAME_LOAD_TIMEOUT_MS = 7000;
const PERMISSION_FRAME_CONNECT_TIMEOUT_MS = 7000;

type PostArticlePreviewEmbedProps = {
  targetUrl: string;
  previewHost?: string;
  className?: string;
  onPreviewUnavailable?: () => void;
  forceUnavailable?: boolean;
};

const renderEmbedChrome = (
  state: UseExtensionSiteEmbedResult,
): ReactElement | null => {
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
  forceUnavailable = false,
}: PostArticlePreviewEmbedProps): ReactElement | null {
  const [extensionId] = useState(() => getBrowserExtensionInstallId());
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [embedStatus, setEmbedStatus] =
    useState<UseExtensionSiteEmbedResult['status']>('idle');

  // On the webapp, the extension id is baked into the build, so its presence
  // doesn't tell us whether the user actually installed the extension in this
  // browser. The extension's `ping` content script stamps a marker on <html>
  // at document_start on daily.dev origins — reading it is the source of
  // truth for "installed in this browser". Extension surfaces (new tab) are
  // always "installed" by definition.
  const isInExtension = checkIsExtension();
  const { isInstalled } = useIsBrowserExtensionInstalled();
  const shouldPromptInstall = !isInExtension && !isInstalled;

  const previewDomain = useMemo(() => {
    if (previewHost) {
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

  // Reset per target/extension change.
  useEffect(() => {
    setIsFrameLoaded(false);
    setHasTimedOut(false);
    setEmbedStatus('idle');
  }, [extensionId, targetUrl]);

  const onCopyPreviewUrl = useCallback(() => {
    navigator.clipboard?.writeText(targetUrl).catch(() => {});
  }, [targetUrl]);

  const isUnavailable = forceUnavailable || hasTimedOut;

  // Dedupe parent notification: fire onPreviewUnavailable once on transition.
  // This fires both for terminal iframe failures (`isUnavailable`) and for
  // "extension not installed" (`shouldPromptInstall`) — the parent
  // (`ArticleReaderFrame`) responds by swapping in `ReaderFallback`, which is
  // the only prompt we ever want to show outside the iframe.
  const didNotifyRef = useRef(false);
  const shouldFallBackToParent = isUnavailable || shouldPromptInstall;
  useEffect(() => {
    if (shouldFallBackToParent && !didNotifyRef.current && !forceUnavailable) {
      didNotifyRef.current = true;
      onPreviewUnavailable?.();
    }
  }, [forceUnavailable, shouldFallBackToParent, onPreviewUnavailable]);

  // Detect "extension ready but site blocks embedding" via load timeout.
  const isAwaitingFrame =
    !!extensionId &&
    !shouldPromptInstall &&
    embedStatus === 'ready' &&
    !isFrameLoaded &&
    !isUnavailable;
  useEffect(() => {
    if (!isAwaitingFrame) {
      return undefined;
    }
    const timeout = globalThis.setTimeout(
      () => setHasTimedOut(true),
      FRAME_LOAD_TIMEOUT_MS,
    );
    return () => globalThis.clearTimeout(timeout);
  }, [isAwaitingFrame]);

  // "Permission frame never connects" fallback: Chrome blocks the iframe so
  // we never receive any state message. Historically this was a sign we
  // couldn't embed at all, so flip to the terminal "preview unavailable"
  // prompt. The enable-permission flow is handled separately via the
  // explicit `missing-permission` error reason the frame posts — far more
  // reliable than a timeout-based guess.
  const isAwaitingPermissionFrame =
    !!extensionId &&
    !shouldPromptInstall &&
    embedStatus === 'idle' &&
    !isUnavailable;
  useEffect(() => {
    if (!isAwaitingPermissionFrame) {
      return undefined;
    }
    const timeout = globalThis.setTimeout(
      () => setHasTimedOut(true),
      PERMISSION_FRAME_CONNECT_TIMEOUT_MS,
    );
    return () => globalThis.clearTimeout(timeout);
  }, [isAwaitingPermissionFrame]);

  const onEmbedStateChange = useCallback(
    (state: UseExtensionSiteEmbedResult) => {
      setEmbedStatus(state.status);
      if (state.status !== 'ready') {
        setIsFrameLoaded(false);
      }
      // Keep the iframe mounted when the user can retry from within it:
      // `missing-permission` (prompt hasn't been attempted yet),
      // `permission-denied` (user hit ESC / "Not now" on Chrome's popup),
      // and `permission-request-failed` (transient error). The underlying
      // hook flips `status` to `'error'` for the latter two, so gate on the
      // reason *before* checking status to avoid collapsing into the
      // terminal "preview unavailable" state.
      const isRecoverablePermissionReason =
        state.errorReason === 'missing-permission' ||
        state.errorReason === 'permission-denied' ||
        state.errorReason === 'permission-request-failed';
      if (isRecoverablePermissionReason) {
        return;
      }
      if (
        state.status === 'error' ||
        state.errorReason === 'preview-unavailable' ||
        state.errorReason === 'enable-frame-embedding-failed'
      ) {
        setHasTimedOut(true);
      }
    },
    [],
  );

  if (shouldFallBackToParent) {
    return null;
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
        <ExtensionSiteEmbed
          extensionId={extensionId}
          targetUrl={targetUrl}
          enabled
          className="h-full min-h-[28rem] w-full flex-1 border-0"
          permissionFrameTitle="Embedded browsing permissions"
          targetFrameTitle="Article preview"
          onTargetFrameLoad={() => setIsFrameLoaded(true)}
          onStateChange={onEmbedStateChange}
          renderState={renderEmbedChrome}
        />
      </div>
    </section>
  );
}
