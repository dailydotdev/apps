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
  const [embedStatus, setEmbedStatus] =
    useState<UseExtensionSiteEmbedResult['status']>('idle');
  // Two distinct "things went wrong" states so we can map each to the
  // right UX: a pre-connect timeout or a genuine post-ready failure.
  const [timedOutBeforeConnect, setTimedOutBeforeConnect] = useState(false);
  const [previewBroken, setPreviewBroken] = useState(false);

  const isInExtension = checkIsExtension();
  const { isInstalled } = useIsBrowserExtensionInstalled();

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
    setEmbedStatus('idle');
    setTimedOutBeforeConnect(false);
    setPreviewBroken(false);
  }, [extensionId, targetUrl]);

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
    detectBrowserExtensionInstalled(extensionId).then((installed) => {
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

  // "Extension not installed / origin not in frame.html's WAR matches":
  //  - No extensionId at all → can't even construct the iframe src.
  //  - OR ping hasn't stamped the install marker AND the iframe never
  //    reported any state within the connect timeout.
  // Either way we stay inline and show the install prompt — we don't drop
  // the user into the classic reader for a one-click fix.
  const shouldPromptInstall =
    !isInExtension &&
    (!extensionId ||
      timedOutBeforeConnect ||
      (!isInstalled && embedStatus === 'idle' && timedOutBeforeConnect));

  // "Iframe connected but the embed ultimately failed": dropped target
  // frame, DNR rule couldn't be set up, publisher blocks embedding, etc.
  // These warrant the classic reader fallback via the parent.
  const isGenuinelyUnavailable = forceUnavailable || previewBroken;

  const didNotifyRef = useRef(false);
  useEffect(() => {
    if (isGenuinelyUnavailable && !didNotifyRef.current && !forceUnavailable) {
      didNotifyRef.current = true;
      onPreviewUnavailable?.();
    }
  }, [forceUnavailable, isGenuinelyUnavailable, onPreviewUnavailable]);

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

  // Post-ready timeout: iframe is in `ready` state but the target site never
  // actually loaded (publisher blocked embedding even after our DNR rule was
  // set). This is a genuine "preview unavailable".
  const isAwaitingTargetLoad =
    !!extensionId &&
    embedStatus === 'ready' &&
    !isFrameLoaded &&
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

  const onEmbedStateChange = useCallback(
    (state: UseExtensionSiteEmbedResult) => {
      setEmbedStatus(state.status);
      if (state.status !== 'ready') {
        setIsFrameLoaded(false);
      }
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
    [],
  );

  if (isGenuinelyUnavailable) {
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
        {shouldPromptInstall ? (
          <EmbeddedBrowsingWebPrompt />
        ) : (
          <>
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
          </>
        )}
      </div>
    </section>
  );
}
