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
  LockIcon,
  MenuIcon,
  MiniCloseIcon as CloseIcon,
  RefreshIcon,
  StarIcon,
} from '../icons';
import { downloadBrowserExtension, isChrome } from '../../lib/constants';
import { apiUrl } from '../../lib/config';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useToastNotification } from '../../hooks/useToastNotification';
import type { Post } from '../../graphql/posts';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import styles from './BasePostModal.module.css';

interface ReaderInstallPromptModalProps extends LazyModalCommonProps {
  post: Post;
}

const FAKE_PARAGRAPHS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] as const;

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
  onCopyUrl: () => void;
  onClose: (event: MouseEvent<HTMLButtonElement>) => void;
}

function BrowserChrome({
  faviconSrc,
  displayUrl,
  onCopyUrl,
  onClose,
}: BrowserChromeProps): ReactElement {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border-subtlest-tertiary bg-background-subtle px-3 py-2">
      <div className="hidden items-center gap-1.5 tablet:flex">
        <TrafficLight tone="red" />
        <TrafficLight tone="amber" />
        <TrafficLight tone="green" />
      </div>
      <div className="hidden items-center gap-0.5 text-text-tertiary tablet:flex">
        <button
          type="button"
          disabled
          aria-label="Back"
          className="flex size-7 items-center justify-center rounded-full"
        >
          <ArrowIcon className="-rotate-90" />
        </button>
        <button
          type="button"
          disabled
          aria-label="Forward"
          className="flex size-7 items-center justify-center rounded-full opacity-40"
        >
          <ArrowIcon className="rotate-90" />
        </button>
        <button
          type="button"
          disabled
          aria-label="Refresh"
          className="flex size-7 items-center justify-center rounded-full"
        >
          <RefreshIcon />
        </button>
      </div>
      <button
        type="button"
        onClick={onCopyUrl}
        className="group flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border-subtlest-tertiary bg-background-default px-3 py-1.5 text-left transition-colors hover:border-border-subtlest-secondary focus:border-border-subtlest-secondary"
        aria-label="Copy article URL"
        title={displayUrl}
      >
        <LockIcon className="size-3.5 shrink-0 text-status-success" />
        {faviconSrc && (
          <img
            src={faviconSrc}
            alt=""
            className="size-4 shrink-0 rounded-4"
            loading="lazy"
            aria-hidden
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
        <StarIcon
          aria-hidden
          className="hidden size-3.5 shrink-0 text-text-tertiary tablet:inline"
        />
      </button>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          disabled
          aria-label="More"
          className="flex size-8 items-center justify-center rounded-full text-text-tertiary"
        >
          <MenuIcon />
        </button>
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
    </div>
  );
}

interface FakeArticlePreviewProps {
  post: Post;
}

function FakeArticlePreview({ post }: FakeArticlePreviewProps): ReactElement {
  const heroImage = post.image || cloudinaryPostImageCoverPlaceholder;
  const sourceName = post.source?.name;
  const sourceImage = post.source?.image;
  const readTimeLabel =
    typeof post.readTime === 'number' ? `${post.readTime} min read` : null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-y-hidden bg-background-default">
        <article className="mx-auto flex max-w-[52rem] flex-col gap-5 px-8 pb-16 pt-10">
          <div className="flex items-center gap-3">
            {sourceImage && (
              <img
                src={sourceImage}
                alt=""
                className="size-9 rounded-full"
                loading="lazy"
              />
            )}
            <div className="flex flex-col gap-0.5">
              {sourceName && (
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Footnote}
                  color={TypographyColor.Primary}
                  bold
                >
                  {sourceName}
                </Typography>
              )}
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {readTimeLabel ?? 'Article'}
              </Typography>
            </div>
          </div>
          {post.title && (
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.LargeTitle}
              color={TypographyColor.Primary}
              bold
              className="!leading-tight"
            >
              {post.title}
            </Typography>
          )}
          <img
            src={heroImage}
            alt=""
            className="mt-1 aspect-video w-full rounded-16 object-cover"
            loading="lazy"
          />
          <div className="mt-2 flex flex-col gap-4 [filter:blur(4px)_saturate(1.05)]">
            {FAKE_PARAGRAPHS.map((line) => (
              <div key={line} className="flex flex-col gap-2">
                <div className="h-3 w-full rounded-6 bg-surface-float" />
                <div className="h-3 w-11/12 rounded-6 bg-surface-float" />
                <div className="h-3 w-10/12 rounded-6 bg-surface-float" />
                <div className="h-3 w-8/12 rounded-6 bg-surface-float" />
              </div>
            ))}
          </div>
        </article>
      </div>
      <div className="from-background-default/10 via-background-default/40 absolute inset-0 bg-gradient-to-b to-overlay-quaternary-onion" />
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
  const { displayToast } = useToastNotification();
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

  const onCopyUrl = () => {
    if (!post.permalink) {
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(post.permalink);
      displayToast('Link copied');
    }
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
        'reader-install-prompt-modal !mx-0 h-full max-h-screen !max-w-full overflow-hidden !bg-background-default focus:outline-none',
        'tablet:!mx-auto tablet:!max-w-[min(96vw,76rem)]',
        'laptop:!mb-2 laptop:!mt-2 laptop:h-[calc(100vh-1rem)] laptop:max-h-[calc(100vh-1rem)] laptop:overflow-hidden',
        '!overscroll-y-auto',
      )}
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <BrowserChrome
          faviconSrc={faviconSrc}
          displayUrl={displayUrl}
          onCopyUrl={onCopyUrl}
          onClose={onCloseFromChrome}
        />
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <FakeArticlePreview post={post} />
          <div className="z-10 relative m-auto flex w-full max-w-[32rem] flex-col items-stretch p-6">
            <div
              className={classNames(
                'flex flex-col items-center gap-5 rounded-24 p-8 text-center',
                'bg-background-default/95 backdrop-blur-md',
                'border border-border-subtlest-tertiary',
                'shadow-[0_32px_80px_-16px_rgba(0,0,0,0.45)]',
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
