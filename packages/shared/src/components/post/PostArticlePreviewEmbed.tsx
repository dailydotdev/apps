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
import {
  detectBrowserExtensionInstalled,
  useIsBrowserExtensionInstalled,
} from '../../features/extensionEmbed/useIsBrowserExtensionInstalled';
import { checkIsExtension } from '../../lib/func';
import { apiUrl } from '../../lib/config';
import {
  Typography,
  TypographyTag,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { TextPlaceholder } from '../widgets/common';

const FRAME_LOAD_TIMEOUT_MS = 7000;
const PERMISSION_FRAME_CONNECT_TIMEOUT_MS = 7000;
const EXTENSION_INSTALL_POLL_INTERVAL_MS = 1500;
const EXTENSION_PING_MESSAGE_SOURCE = 'daily-extension-ping';
const TARGET_FRAME_LOAD_FALLBACK_DELAY_MS = 1500;

type PostArticlePreviewEmbedProps = {
  targetUrl: string;
  previewHost?: string;
  className?: string;
  leftHeaderActions?: ReactElement | null;
  rightHeaderActions?: ReactElement | null;
  onPreviewUnavailable?: () => void;
  /**
   * Fires once when the content script confirms the target document reached
   * DOM ready. Use this to attribute "user is reading" actions (streak credit,
   * server view event) rather than firing them on mount, which would also count
   * install/permission prompts where the iframe is hidden.
   */
  onEmbedReady?: () => void;
  forceUnavailable?: boolean;
  collapseOnUnavailable?: boolean;
  /**
   * Article URL the domain label should link to. When provided, clicking the
   * domain in the preview header opens the article through the same path as
   * the "Read post" button — fire `onTargetLinkClick` for tracking parity.
   */
  targetHref?: string;
  onTargetLinkClick?: () => void;
  targetLinkInNewTab?: boolean;
  /**
   * Opt-out action shown inside the "install the extension" prompt. When
   * provided, the prompt surfaces an "I'd rather not read inside daily.dev"
   * button below the Install CTA.
   */
  onInstallPromptOptOut?: () => void;
  /**
   * Opt-out action shown inside the in-iframe permission screen rendered by
   * the extension's frame. Bridged from the iframe via `postMessage`.
   */
  onPermissionScreenOptOut?: () => void;
};

export function PostArticlePreviewEmbed({
  targetUrl,
  previewHost,
  className,
  leftHeaderActions,
  rightHeaderActions,
  onPreviewUnavailable,
  onEmbedReady,
  forceUnavailable = false,
  collapseOnUnavailable = true,
  targetHref,
  onTargetLinkClick,
  targetLinkInNewTab = true,
  onInstallPromptOptOut,
  onPermissionScreenOptOut,
}: PostArticlePreviewEmbedProps): ReactElement | null {
  const [extensionId, setExtensionId] = useState(() =>
    getBrowserExtensionInstallId(),
  );
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isTargetDomReady, setIsTargetDomReady] = useState(false);
  const [embedStatus, setEmbedStatus] =
    useState<UseExtensionSiteEmbedResult['status']>('idle');
  const [isInstalledAfterPrompt, setIsInstalledAfterPrompt] = useState(false);
  // Two distinct "things went wrong" states so we can map each to the
  // right UX: a pre-connect timeout or a genuine post-ready failure.
  const [timedOutBeforeConnect, setTimedOutBeforeConnect] = useState(false);
  const [previewBroken, setPreviewBroken] = useState(false);
  const targetFrameLoadFallbackTimeoutRef = useRef<ReturnType<
    typeof globalThis.setTimeout
  > | null>(null);

  const isInExtension = checkIsExtension();
  const { isInstalled } = useIsBrowserExtensionInstalled();
  const hasInstalledExtension = isInstalled || isInstalledAfterPrompt;

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

  const clearTargetFrameLoadFallback = useCallback(() => {
    if (!targetFrameLoadFallbackTimeoutRef.current) {
      return;
    }

    globalThis.clearTimeout(targetFrameLoadFallbackTimeoutRef.current);
    targetFrameLoadFallbackTimeoutRef.current = null;
  }, []);

  // Reset per target/extension change.
  useEffect(() => {
    clearTargetFrameLoadFallback();
    setIsFrameLoaded(false);
    setIsTargetDomReady(false);
    setEmbedStatus('idle');
    setIsInstalledAfterPrompt(false);
    setTimedOutBeforeConnect(false);
    setPreviewBroken(false);
  }, [clearTargetFrameLoadFallback, extensionId, targetUrl]);

  useEffect(
    () => () => {
      clearTargetFrameLoadFallback();
    },
    [clearTargetFrameLoadFallback],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onPingMessage = (event: MessageEvent) => {
      if (event.source !== window || event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.source !== EXTENSION_PING_MESSAGE_SOURCE) {
        return;
      }

      setIsInstalledAfterPrompt(true);
      const nextExtensionId =
        typeof event.data?.extensionId === 'string'
          ? event.data.extensionId.trim()
          : '';
      if (nextExtensionId) {
        setExtensionId(nextExtensionId);
      }
    };

    window.addEventListener('message', onPingMessage);
    return () => window.removeEventListener('message', onPingMessage);
  }, []);

  // Fast-path "not installed / not embeddable from this origin": probe a
  // resource that shares `frame.html`'s `web_accessible_resources` matches.
  // If the probe fails (extension missing OR origin not allowed to embed),
  // short-circuit the 7s connect timeout and show the install prompt in
  // ~100ms instead of leaving the user on Chrome's "page blocked" screen.
  useEffect(() => {
    if (isInExtension || !extensionId) {
      return undefined;
    }
    let cancelled = false;
    const resolvedExtensionId = getBrowserExtensionInstallId() ?? extensionId;
    if (resolvedExtensionId !== extensionId) {
      setExtensionId(resolvedExtensionId);
    }
    detectBrowserExtensionInstalled(resolvedExtensionId).then((installed) => {
      if (cancelled) {
        return;
      }
      setIsInstalledAfterPrompt(installed);
      if (!cancelled && !installed) {
        setTimedOutBeforeConnect(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [extensionId, isInExtension]);

  const onCopyPreviewUrl = useCallback(() => {
    navigator.clipboard?.writeText(targetUrl).catch(() => {});
  }, [targetUrl]);

  const onTargetDomReady = useCallback(() => {
    clearTargetFrameLoadFallback();
    setIsTargetDomReady(true);
    setIsFrameLoaded(true);
    setPreviewBroken(false);
  }, [clearTargetFrameLoadFallback]);

  const onTargetFrameLoad = useCallback(() => {
    clearTargetFrameLoadFallback();
    // Native iframe load can fire for browser error pages, so keep it as a
    // delayed UI fallback while the content-script DOM-ready signal wins.
    targetFrameLoadFallbackTimeoutRef.current = globalThis.setTimeout(() => {
      setIsFrameLoaded(true);
      targetFrameLoadFallbackTimeoutRef.current = null;
    }, TARGET_FRAME_LOAD_FALLBACK_DELAY_MS);
  }, [clearTargetFrameLoadFallback]);

  // "Extension not installed / origin not in frame.html's WAR matches":
  //  - No extensionId at all → can't even construct the iframe src.
  //  - OR the synchronous `ping` marker is missing and the fallback probe
  //    hasn't confirmed an install yet — show the prompt immediately rather
  //    than waiting on the probe/connect timeout. If the probe later flips
  //    `isInstalledAfterPrompt` (old extension build without the ping
  //    script), the prompt is swapped for the embed.
  //  - OR the iframe never reported any state within the connect timeout.
  // Either way we stay inline and show the install prompt — we don't drop
  // the user into the classic reader for a one-click fix.
  const shouldPromptInstall =
    !isInExtension &&
    (!extensionId || !hasInstalledExtension || timedOutBeforeConnect);

  useEffect(() => {
    if (
      isInExtension ||
      !extensionId ||
      !shouldPromptInstall ||
      hasInstalledExtension
    ) {
      return undefined;
    }

    let cancelled = false;
    const interval = globalThis.setInterval(() => {
      const resolvedExtensionId = getBrowserExtensionInstallId() ?? extensionId;
      if (resolvedExtensionId !== extensionId) {
        setExtensionId(resolvedExtensionId);
      }

      if (!resolvedExtensionId) {
        return;
      }

      detectBrowserExtensionInstalled(resolvedExtensionId).then(
        (installedNow) => {
          if (cancelled || !installedNow) {
            return;
          }

          setIsInstalledAfterPrompt(true);
          setIsFrameLoaded(false);
          setIsTargetDomReady(false);
          setEmbedStatus('idle');
          setTimedOutBeforeConnect(false);
          setPreviewBroken(false);
        },
      );
    }, EXTENSION_INSTALL_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      globalThis.clearInterval(interval);
    };
  }, [extensionId, hasInstalledExtension, isInExtension, shouldPromptInstall]);

  // "Iframe connected but the embed ultimately failed": dropped target
  // frame, DNR rule couldn't be set up, publisher blocks embedding, etc.
  // These warrant the classic reader fallback via the parent.
  const isGenuinelyUnavailable = forceUnavailable || previewBroken;
  const shouldCollapseUnavailable =
    collapseOnUnavailable && isGenuinelyUnavailable;

  const didNotifyRef = useRef(false);
  useEffect(() => {
    if (
      shouldCollapseUnavailable &&
      !didNotifyRef.current &&
      !forceUnavailable
    ) {
      didNotifyRef.current = true;
      onPreviewUnavailable?.();
    }
  }, [forceUnavailable, onPreviewUnavailable, shouldCollapseUnavailable]);

  // Pre-connect timeout: iframe mounted but the permission frame never posted
  // anything back within the window. Treat this as "can't embed from here"
  // and show the install prompt. Armed only while we haven't heard from the
  // iframe yet.
  const isAwaitingFirstConnect =
    !!extensionId &&
    !isInExtension &&
    embedStatus === 'idle' &&
    !timedOutBeforeConnect &&
    !shouldPromptInstall &&
    !isGenuinelyUnavailable;
  useEffect(() => {
    if (!isAwaitingFirstConnect) {
      return undefined;
    }
    const timeout = globalThis.setTimeout(
      () => setTimedOutBeforeConnect(true),
      PERMISSION_FRAME_CONNECT_TIMEOUT_MS,
    );
    return () => globalThis.clearTimeout(timeout);
  }, [isAwaitingFirstConnect]);

  // Post-ready timeout: iframe is in `ready` state but the target document
  // never sent the DOM-ready signal. Native iframe `load` is only a UI
  // fallback because it can also fire for browser error pages.
  const isAwaitingTargetLoad =
    !!extensionId &&
    embedStatus === 'ready' &&
    !isTargetDomReady &&
    !isGenuinelyUnavailable;
  useEffect(() => {
    if (!isAwaitingTargetLoad) {
      return undefined;
    }
    const timeout = globalThis.setTimeout(
      () => setPreviewBroken(true),
      FRAME_LOAD_TIMEOUT_MS,
    );
    return () => globalThis.clearTimeout(timeout);
  }, [isAwaitingTargetLoad]);

  const { logEvent } = useLogContext();
  const lastLoggedStatusRef = useRef<string | null>(null);
  const lastLoggedReasonRef = useRef<string | null>(null);

  const onEmbedReadyRef = useRef(onEmbedReady);
  onEmbedReadyRef.current = onEmbedReady;
  const didCallEmbedReadyRef = useRef(false);

  useEffect(() => {
    didCallEmbedReadyRef.current = false;
  }, [targetUrl]);

  useEffect(() => {
    if (
      embedStatus !== 'ready' ||
      !isTargetDomReady ||
      didCallEmbedReadyRef.current
    ) {
      return;
    }

    didCallEmbedReadyRef.current = true;
    onEmbedReadyRef.current?.();
  }, [embedStatus, isTargetDomReady]);

  const logEmbedState = useCallback(
    (state: UseExtensionSiteEmbedResult) => {
      const stateKey = `${state.status}:${state.errorReason ?? ''}`;
      if (
        lastLoggedStatusRef.current === state.status &&
        lastLoggedReasonRef.current === (state.errorReason ?? null) &&
        stateKey !== ''
      ) {
        return;
      }
      lastLoggedStatusRef.current = state.status;
      lastLoggedReasonRef.current = state.errorReason ?? null;

      const baseExtra = { target_url: targetUrl, host: previewDomain };

      if (state.status === 'ready') {
        logEvent({
          event_name: LogEvent.ReaderEmbedReady,
          extra: JSON.stringify(baseExtra),
        });
        return;
      }

      if (
        state.status === 'permission-required' ||
        state.errorReason === 'missing-permission' ||
        state.errorReason === 'permission-denied' ||
        state.errorReason === 'permission-request-failed'
      ) {
        logEvent({
          event_name: LogEvent.ReaderEmbedPermissionRequired,
          extra: JSON.stringify({
            ...baseExtra,
            reason: state.errorReason ?? 'permission-required',
          }),
        });
        return;
      }

      if (state.status === 'error') {
        logEvent({
          event_name: LogEvent.ReaderEmbedError,
          extra: JSON.stringify({
            ...baseExtra,
            reason: state.errorReason ?? 'unknown',
          }),
        });
      }
    },
    [logEvent, previewDomain, targetUrl],
  );

  const onEmbedStateChange = useCallback(
    (state: UseExtensionSiteEmbedResult) => {
      setEmbedStatus(state.status);
      if (state.status !== 'ready') {
        setIsFrameLoaded(false);
        setIsTargetDomReady(false);
      }
      logEmbedState(state);
      // Keep the iframe mounted for states the user can retry from within
      // it: missing-permission (prompt hasn't been attempted), permission-
      // denied (ESC / "Not now"), permission-request-failed (transient).
      // The underlying hook flips `status` to `'error'` for the two latter
      // ones, so gate on the reason before collapsing into the genuine
      // failure path.
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
        setPreviewBroken(true);
      }
    },
    [logEmbedState],
  );

  const renderEmbedChrome = useCallback(
    (state: UseExtensionSiteEmbedResult): ReactElement | null => {
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

      const shouldShowLoading =
        state.status === 'reloading-extension' ||
        (!previewBroken &&
          (state.status === 'idle' ||
            state.status === 'preparing-tab' ||
            (state.status === 'ready' && !isFrameLoaded)));

      if (!shouldShowLoading) {
        return null;
      }

      return (
        <div
          aria-busy
          aria-live="polite"
          className="z-10 pointer-events-none absolute inset-0 flex flex-col gap-4 overflow-hidden bg-background-default px-4 pb-6 pt-6 tablet:px-8"
        >
          <ElementPlaceholder className="h-8 w-3/5 rounded-10" />
          <div className="flex flex-col gap-2">
            <TextPlaceholder className="w-2/5" />
          </div>
          <ElementPlaceholder className="h-52 w-full max-w-[40rem] rounded-16" />
          <div className="flex flex-col gap-2">
            <TextPlaceholder className="w-full" />
            <TextPlaceholder className="w-11/12" />
            <TextPlaceholder className="w-10/12" />
            <TextPlaceholder className="w-9/12" />
          </div>
          <div className="flex flex-col gap-2">
            <TextPlaceholder className="w-11/12" />
            <TextPlaceholder className="w-10/12" />
            <TextPlaceholder className="w-8/12" />
          </div>
        </div>
      );
    },
    [isFrameLoaded, previewBroken],
  );

  if (shouldCollapseUnavailable) {
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
        <div className="flex items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-3 pb-2 pt-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {leftHeaderActions ? (
              <div className="flex shrink-0 items-center gap-2">
                {leftHeaderActions}
              </div>
            ) : null}
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
              {targetHref ? (
                <a
                  href={targetHref}
                  target={targetLinkInNewTab ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  onClick={onTargetLinkClick}
                  className="block w-full truncate text-left underline-offset-2 hover:underline"
                  title={`Open ${previewDomain}`}
                >
                  {previewDomain}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onCopyPreviewUrl}
                  className="block w-full truncate text-left"
                  title="Copy preview URL"
                  aria-label="Copy preview URL"
                >
                  {previewDomain}
                </button>
              )}
            </Typography>
          </div>
          {rightHeaderActions ? (
            <div className="flex shrink-0 items-center gap-2">
              {rightHeaderActions}
            </div>
          ) : null}
        </div>
        {shouldPromptInstall ? (
          <EmbeddedBrowsingWebPrompt onOptOut={onInstallPromptOptOut} />
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <ExtensionSiteEmbed
              extensionId={extensionId}
              targetUrl={targetUrl}
              enabled
              className="h-full min-h-[28rem] w-full flex-1 border-0"
              isTargetLoaded={isFrameLoaded}
              permissionFrameTitle="Embedded browsing permissions"
              targetFrameTitle="Article preview"
              onTargetDomReady={onTargetDomReady}
              onTargetFrameLoad={onTargetFrameLoad}
              onOptOutRequested={onPermissionScreenOptOut}
              onStateChange={onEmbedStateChange}
              renderState={renderEmbedChrome}
            />
            {!collapseOnUnavailable &&
            previewBroken &&
            embedStatus === 'ready' ? (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center p-4"
                aria-live="polite"
              >
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                  className="max-w-sm text-center"
                >
                  Preview not available for this site.
                </Typography>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
