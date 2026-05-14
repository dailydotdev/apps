import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
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
import { LogEvent } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import type { Post } from '../../graphql/posts';
import styles from './BasePostModal.module.css';

interface ReaderInstallPromptModalProps extends LazyModalCommonProps {
  post: Post;
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

const getDisplayUrl = (post: Post, host: string | undefined): string => {
  if (post.permalink) {
    return post.permalink;
  }
  return host || 'daily.dev';
};

function TrafficLight({ tone }: { tone: 'red' | 'amber' | 'green' }) {
  const palette = {
    red: 'bg-action-downvote-default',
    amber: 'bg-action-bookmark-default',
    green: 'bg-action-upvote-default',
  } as const;
  return (
    <span
      aria-hidden
      className={classNames('size-3 rounded-full', palette[tone])}
    />
  );
}

interface BrowserChromeProps {
  faviconSrc: string | undefined;
  displayUrl: string;
  onClose: (event: MouseEvent<HTMLButtonElement>) => void;
}

// The header is a non-interactive mockup of a browser bar so users
// understand the article is "opening inside daily.dev". Only the close
// (X) button is real; navigation icons are decorative and aria-hidden.
function BrowserChrome({
  faviconSrc,
  displayUrl,
  onClose,
}: BrowserChromeProps): ReactElement {
  return (
    <div className="flex w-full shrink-0 items-center gap-3 border-b border-border-subtlest-tertiary bg-background-subtle px-3 py-2">
      <div className="hidden items-center gap-1.5 tablet:flex">
        <TrafficLight tone="red" />
        <TrafficLight tone="amber" />
        <TrafficLight tone="green" />
      </div>
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

// Heavily blurred, full-width placeholder for the article body. We
// deliberately render only abstract shapes (no real title/image) so the
// install card stays the focal point without competing content.
function BlurredArticleBackdrop(): ReactElement {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-background-default"
    >
      <div className="absolute inset-0 [filter:blur(18px)_saturate(1.05)]">
        <div className="mx-auto flex h-full w-full max-w-[64rem] flex-col gap-6 px-12 pb-12 pt-10">
          <div className="h-3 w-24 rounded-6 bg-surface-float" />
          <div className="flex flex-col gap-3">
            <div className="h-8 w-11/12 rounded-8 bg-surface-float" />
            <div className="h-8 w-9/12 rounded-8 bg-surface-float" />
            <div className="h-8 w-7/12 rounded-8 bg-surface-float" />
          </div>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-surface-float" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-32 rounded-6 bg-surface-float" />
              <div className="h-2.5 w-20 rounded-6 bg-surface-float" />
            </div>
          </div>
          <div className="mt-2 h-64 w-full rounded-16 bg-surface-float" />
          <div className="flex flex-col gap-3">
            <div className="h-3 w-full rounded-6 bg-surface-float" />
            <div className="h-3 w-11/12 rounded-6 bg-surface-float" />
            <div className="h-3 w-10/12 rounded-6 bg-surface-float" />
            <div className="h-3 w-9/12 rounded-6 bg-surface-float" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-3 w-full rounded-6 bg-surface-float" />
            <div className="h-3 w-11/12 rounded-6 bg-surface-float" />
            <div className="h-3 w-9/12 rounded-6 bg-surface-float" />
          </div>
        </div>
      </div>
      <div className="from-background-default/30 via-background-default/45 to-background-default/65 absolute inset-0 bg-gradient-to-b" />
    </div>
  );
}

function ReaderInstallPromptModal({
  post,
  isOpen,
  onRequestClose,
}: ReaderInstallPromptModalProps): ReactElement {
  const { logEvent } = useLogContext();
  const { openModal, closeModal } = useLazyModal();
  const isChromeBrowser = isChrome();
  const BrowserIcon = isChromeBrowser ? ChromeIcon : EdgeIcon;
  const installButtonLabel = isChromeBrowser
    ? 'Install Chrome extension'
    : 'Install Edge extension';
  const browser = isChromeBrowser ? 'chrome' : 'edge';
  const host = getPostHost(post);
  const faviconSrc = useFaviconSrc(host);
  const displayHost = host || 'daily.dev';
  const displayUrl = getDisplayUrl(post, host);

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
    closeModal();
    openModal({
      type: LazyModal.ReaderPreview,
      props: { post },
    });
  };

  const onCloseFromChrome = (event: MouseEvent<HTMLButtonElement>) => {
    onRequestClose(event);
  };

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
        'tablet:!mx-auto tablet:!max-w-[min(96vw,76rem)]',
        'laptop:!mb-2 laptop:!mt-2 laptop:h-[calc(100vh-1rem)] laptop:max-h-[calc(100vh-1rem)] laptop:overflow-hidden',
        '!overscroll-y-auto',
      )}
    >
      <div className="relative flex h-full min-h-0 w-full flex-col">
        <BrowserChrome
          faviconSrc={faviconSrc}
          displayUrl={displayUrl}
          onClose={onCloseFromChrome}
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
                Read this inside daily.dev?
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="!mt-0 max-w-[26rem]"
              >
                Install the extension and {displayHost} opens right here inside
                daily.dev. No new tab. No context switching.
              </Typography>
              <div className="mt-1 flex w-full max-w-[22rem] flex-col items-stretch gap-2">
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
                  Preview the experience
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
