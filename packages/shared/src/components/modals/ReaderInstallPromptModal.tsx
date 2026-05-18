import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Modal } from './common/Modal';
import type { LazyModalCommonProps } from './common/Modal';
import { LazyModal, ModalKind, ModalSize } from './common/types';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import {
  ArrowIcon,
  ChromeIcon,
  EdgeIcon,
  MiniCloseIcon as CloseIcon,
  RefreshIcon,
} from '../icons';
import { downloadBrowserExtension, isChrome } from '../../lib/constants';
import { apiUrl } from '../../lib/config';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetId } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import type { Post } from '../../graphql/posts';
import styles from './BasePostModal.module.css';
import { useLegacyPostLayoutOptOut } from '../post/reader/hooks/useLegacyPostLayoutOptOut';
import {
  detectBrowserExtensionInstalled,
  isBrowserExtensionInstalled,
  useIsBrowserExtensionInstalled,
} from '../../features/extensionEmbed/useIsBrowserExtensionInstalled';
import { getBrowserExtensionInstallId } from '../../features/extensionEmbed/getBrowserExtensionInstallId';

interface ReaderInstallPromptModalProps extends LazyModalCommonProps {
  post: Post;
  /**
   * Close handler for the surface that owns the Read post click (e.g. the
   * classic post modal). Fired alongside the prompt's own dismiss paths
   * so closing the prompt tears down the surface behind it instead of
   * silently reverting to it.
   */
  onCloseParent?: () => void;
}

const useFaviconSrc = (host: string | undefined): string | undefined => {
  return useMemo(() => {
    if (!host) {
      return undefined;
    }
    const pixelRatio = globalThis?.window?.devicePixelRatio ?? 1;
    const iconSize = Math.max(Math.round(16 * pixelRatio), 96);
    return `${apiUrl}/icon?url=${encodeURIComponent(host)}&size=${iconSize}`;
  }, [host]);
};

const getPostHost = (post: Post): string | undefined => {
  if (post.domain) {
    return post.domain;
  }
  if (!post.permalink) {
    return undefined;
  }
  try {
    return new URL(post.permalink).hostname;
  } catch {
    return undefined;
  }
};

// Show the article's source host (e.g. `thenewstack.io`) in the mock browser
// URL bar instead of the daily.dev redirector permalink — the redirector
// reads like an internal API URL and obscures which site the user is about
// to land on.
const getDisplayUrl = (host: string | undefined): string => host || 'daily.dev';

interface BrowserChromeProps {
  faviconSrc: string | undefined;
  displayUrl: string;
  onClose: (event: MouseEvent<HTMLButtonElement>) => void;
}

function BrowserChrome({
  faviconSrc,
  displayUrl,
  onClose,
}: BrowserChromeProps): ReactElement {
  return (
    <div className="flex w-full shrink-0 items-center gap-3 border-b border-border-subtlest-tertiary bg-background-subtle px-3 py-2">
      <div
        aria-hidden
        className="hidden items-center gap-0.5 text-text-disabled tablet:flex"
      >
        <span className="flex size-7 items-center justify-center opacity-40">
          <ArrowIcon className="-rotate-90" />
        </span>
        <span className="flex size-7 items-center justify-center opacity-40">
          <ArrowIcon className="rotate-90" />
        </span>
        <span className="flex size-7 items-center justify-center opacity-40">
          <RefreshIcon />
        </span>
      </div>
      <div
        aria-hidden
        className="flex min-w-0 flex-1 items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-background-default px-3 py-1.5"
        title={displayUrl}
      >
        {faviconSrc && (
          <img
            src={faviconSrc}
            alt=""
            className="size-4 shrink-0 rounded-4"
            loading="lazy"
          />
        )}
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="min-w-0 flex-1 truncate"
        >
          {displayUrl}
        </Typography>
      </div>
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<CloseIcon />}
        size={ButtonSize.Small}
        type="button"
        className="!h-8 !w-8 !min-w-8 !rounded-full !p-0"
        onClick={onClose}
        aria-label="Close"
      />
    </div>
  );
}

const ARTICLE_PARAGRAPHS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] as const;

// Explicit light hex colors keep the backdrop reading like a real article page
// behind glass, even when the rest of the app is in dark mode. Semantic tokens
// would invert the surface in dark mode and break the "webpage preview" cue.
function BlurredArticleBackdrop(): ReactElement {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#f6f7fb' }}
    >
      <div className="absolute inset-0 [filter:blur(22px)_saturate(1.1)]">
        <div className="mx-auto flex h-full w-full max-w-[58rem] flex-col gap-6 px-12 pb-16 pt-10">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-16 rounded-full"
              style={{ backgroundColor: '#c4cad6' }}
            />
            <span
              className="h-3 w-24 rounded-full"
              style={{ backgroundColor: '#d8dde7' }}
            />
            <span
              className="h-3 w-20 rounded-full"
              style={{ backgroundColor: '#d8dde7' }}
            />
          </div>
          <div className="flex flex-col gap-3">
            <div
              className="rounded-md h-9 w-11/12"
              style={{ backgroundColor: '#1f2937' }}
            />
            <div
              className="rounded-md h-9 w-9/12"
              style={{ backgroundColor: '#1f2937' }}
            />
            <div
              className="rounded-md h-9 w-7/12"
              style={{ backgroundColor: '#1f2937' }}
            />
          </div>
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-full"
              style={{ backgroundColor: '#c4cad6' }}
            />
            <div className="flex flex-col gap-1.5">
              <div
                className="h-3 w-40 rounded-full"
                style={{ backgroundColor: '#c4cad6' }}
              />
              <div
                className="h-2.5 w-24 rounded-full"
                style={{ backgroundColor: '#d8dde7' }}
              />
            </div>
          </div>
          <div
            className="rounded-xl mt-1 h-64 w-full"
            style={{ backgroundColor: '#e2e6ee' }}
          />
          {ARTICLE_PARAGRAPHS.map((id) => (
            <div key={id} className="flex flex-col gap-2.5">
              <div
                className="h-3 w-full rounded-full"
                style={{ backgroundColor: '#cbd1dc' }}
              />
              <div
                className="h-3 w-11/12 rounded-full"
                style={{ backgroundColor: '#cbd1dc' }}
              />
              <div
                className="h-3 w-10/12 rounded-full"
                style={{ backgroundColor: '#cbd1dc' }}
              />
              <div
                className="h-3 w-8/12 rounded-full"
                style={{ backgroundColor: '#cbd1dc' }}
              />
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(246, 247, 251, 0.15) 0%, rgba(246, 247, 251, 0.55) 60%, rgba(246, 247, 251, 0.85) 100%)',
        }}
      />
    </div>
  );
}

function ReaderInstallPromptModal({
  post,
  isOpen,
  onRequestClose,
  onCloseParent,
}: ReaderInstallPromptModalProps): ReactElement {
  const { logEvent } = useLogContext();
  const { openModal, closeModal } = useLazyModal();
  const { optOut } = useLegacyPostLayoutOptOut();
  // Detecting the extension when the modal opens combines three signals:
  //   1. The synchronous `<html data-daily-extension-installed>` marker
  //      stamped by the extension's content script.
  //   2. A `chrome-extension://<id>/...` preload probe (same strategy as
  //      `PostArticlePreviewEmbed`) for older builds where the marker is
  //      stamped late or not at all.
  //   3. A short poll on the marker to catch content scripts that inject
  //      after React has mounted the modal.
  const { isInstalled: initialMarker } = useIsBrowserExtensionInstalled();
  const [hasInstalledExtension, setHasInstalledExtension] =
    useState(initialMarker);
  useEffect(() => {
    if (hasInstalledExtension) {
      return undefined;
    }

    let cancelled = false;
    const markAsInstalled = () => {
      if (!cancelled) {
        setHasInstalledExtension(true);
      }
    };

    const pollIntervalId = globalThis.setInterval(() => {
      if (isBrowserExtensionInstalled()) {
        markAsInstalled();
      }
    }, 200);
    const pollTimeoutId = globalThis.setTimeout(() => {
      globalThis.clearInterval(pollIntervalId);
    }, 3000);

    const extensionId = getBrowserExtensionInstallId();
    if (extensionId) {
      detectBrowserExtensionInstalled(extensionId).then((installed) => {
        if (installed) {
          markAsInstalled();
        }
      });
    }

    return () => {
      cancelled = true;
      globalThis.clearInterval(pollIntervalId);
      globalThis.clearTimeout(pollTimeoutId);
    };
  }, [hasInstalledExtension]);
  const isChromeBrowser = isChrome();
  const BrowserIcon = isChromeBrowser ? ChromeIcon : EdgeIcon;
  const installButtonLabel = isChromeBrowser
    ? 'Install Chrome extension'
    : 'Install Edge extension';
  const browser = isChromeBrowser ? 'chrome' : 'edge';
  const host = getPostHost(post);
  const faviconSrc = useFaviconSrc(host);
  const displayUrl = getDisplayUrl(host);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.ImpressionReaderInstallPrompt,
      extra: JSON.stringify({ browser, post_id: post.id }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onInstallClick = () => {
    logEvent({
      event_name: LogEvent.ClickReaderInstallExtension,
      extra: JSON.stringify({ browser, post_id: post.id }),
    });
  };

  const onPreviewClick = (event: MouseEvent) => {
    event.preventDefault();
    logEvent({
      event_name: LogEvent.ClickReaderInstallPreview,
      extra: JSON.stringify({ browser, post_id: post.id }),
    });
    closeModal();
    // Forward the parent-close callback so dismissing the reader preview
    // also tears down the surface that originally opened the install prompt
    // (e.g. the classic post modal behind it).
    openModal({
      type: LazyModal.ReaderPreview,
      props: { post, onCloseParent },
    });
  };

  // "Don't ask again" persists the opt-out so the gate hook bypasses the prompt
  // on future Read clicks and falls back to the default new-tab navigation.
  const onSkipClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    optOut(TargetId.ReaderInstallPrompt);
    logEvent({
      event_name: LogEvent.ClickReaderInstallSkip,
      extra: JSON.stringify({ browser, post_id: post.id }),
    });
    if (post.permalink) {
      globalThis.window?.open(post.permalink, '_blank', 'noopener,noreferrer');
    }
    onRequestClose(event);
  };

  // The install prompt is an intermediate step — dismissing it (X / overlay /
  // ESC) only closes the prompt itself. `onCloseParent` is reserved for the
  // reader preview close so the user doesn't lose the surface they were on
  // unless they actually entered the reader and chose to exit.

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      kind={ModalKind.FlexibleTop}
      size={ModalSize.XLarge}
      portalClassName={styles.postModal}
      overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
      className={classNames(
        'reader-install-prompt-modal !mx-0 h-full max-h-screen !w-full !max-w-full overflow-hidden !bg-background-default focus:outline-none',
        'tablet:!mx-auto tablet:!w-[min(96vw,100rem)] tablet:!max-w-[min(96vw,100rem)]',
        'laptop:!mb-2 laptop:!mt-2 laptop:h-[calc(100vh-1rem)] laptop:max-h-[calc(100vh-1rem)] laptop:overflow-hidden',
        '!overscroll-y-auto',
      )}
    >
      <div className="relative flex h-full min-h-0 w-full flex-col">
        <BrowserChrome
          faviconSrc={faviconSrc}
          displayUrl={displayUrl}
          onClose={onRequestClose}
        />
        <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
          <BlurredArticleBackdrop />
          <div className="z-10 relative m-auto flex w-full max-w-[34rem] flex-col items-stretch p-6">
            <div
              className={classNames(
                'flex flex-col items-center gap-5 rounded-24 bg-background-default p-8 text-center',
                'border border-border-subtlest-tertiary',
                'shadow-[0_32px_80px_-16px_rgba(0,0,0,0.55)]',
              )}
            >
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.LargeTitle}
                color={TypographyColor.Primary}
                bold
                className="!leading-tight"
              >
                Read it right here.
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="!mt-0 max-w-[26rem]"
              >
                {hasInstalledExtension
                  ? 'Open the article inside daily.dev with the discussion right next to it.'
                  : 'Try the reader on this article — install the extension to keep it that way for every link.'}
              </Typography>
              <div className="mt-1 flex w-full max-w-[22rem] flex-col items-stretch gap-2">
                {hasInstalledExtension ? (
                  <Button
                    type="button"
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Large}
                    onClick={onPreviewClick}
                  >
                    Read inside
                  </Button>
                ) : (
                  <>
                    <Button
                      tag="a"
                      variant={ButtonVariant.Primary}
                      size={ButtonSize.Large}
                      href={downloadBrowserExtension}
                      target="_blank"
                      rel="noopener noreferrer"
                      icon={<BrowserIcon />}
                      onClick={onInstallClick}
                    >
                      {installButtonLabel}
                    </Button>
                    <Button
                      type="button"
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Medium}
                      onClick={onPreviewClick}
                    >
                      See preview
                    </Button>
                  </>
                )}
                <div className="flex w-full items-center gap-3 pt-1">
                  <span
                    aria-hidden
                    className="h-px flex-1 bg-border-subtlest-tertiary"
                  />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    OR
                  </Typography>
                  <span
                    aria-hidden
                    className="h-px flex-1 bg-border-subtlest-tertiary"
                  />
                </div>
                <Button
                  type="button"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Medium}
                  onClick={onSkipClick}
                >
                  Don&apos;t ask again, open new tab
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ReaderInstallPromptModal;
