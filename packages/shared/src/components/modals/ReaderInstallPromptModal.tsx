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
  ChromeIcon,
  EdgeIcon,
  MiniCloseIcon as CloseIcon,
  MenuIcon,
  CopyIcon,
  ArrowIcon,
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
} from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { downloadBrowserExtension, isChrome } from '../../lib/constants';
import { apiUrl } from '../../lib/config';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useToastNotification } from '../../hooks/useToastNotification';
import type { Post } from '../../graphql/posts';
import styles from './BasePostModal.module.css';

interface ReaderInstallPromptModalProps extends LazyModalCommonProps {
  post: Post;
}

const FAKE_PARAGRAPHS: ReadonlyArray<string> = ['p1', 'p2', 'p3', 'p4'];

const headerActionGroupClassName =
  'flex h-9 items-center gap-px rounded-12 border border-border-subtlest-tertiary bg-background-default p-px shadow-3';

const iconButtonClassName = '!h-8 !w-8 !min-w-8 !rounded-10 !p-0';

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

function FakePreview(): ReactElement {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={classNames(
          'relative h-full w-full bg-background-default',
          '[filter:blur(8px)_saturate(1.1)]',
        )}
      >
        <div className="flex flex-col gap-4 px-12 pb-12 pt-10">
          <div className="h-3 w-24 rounded-6 bg-surface-float" />
          <div className="flex flex-col gap-3">
            <div className="h-10 w-11/12 rounded-8 bg-surface-float" />
            <div className="h-10 w-3/4 rounded-8 bg-surface-float" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-surface-float" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-40 rounded-6 bg-surface-float" />
              <div className="h-2.5 w-24 rounded-6 bg-surface-float" />
            </div>
          </div>
          <div className="mt-2 h-72 w-full rounded-16 bg-surface-float" />
          {FAKE_PARAGRAPHS.map((line) => (
            <div key={line} className="flex flex-col gap-2">
              <div className="h-3 w-full rounded-6 bg-surface-float" />
              <div className="h-3 w-11/12 rounded-6 bg-surface-float" />
              <div className="h-3 w-10/12 rounded-6 bg-surface-float" />
              <div className="h-3 w-9/12 rounded-6 bg-surface-float" />
              <div className="h-3 w-8/12 rounded-6 bg-surface-float" />
            </div>
          ))}
        </div>
      </div>
      <div className="via-background-default/40 absolute inset-0 bg-gradient-to-b from-overlay-quaternary-onion to-overlay-quaternary-onion" />
    </div>
  );
}

interface FakeRailProps {
  post: Post;
}

function FakeRail({ post }: FakeRailProps): ReactElement {
  const previewSummary =
    post.summary ||
    'A short, scannable summary appears here once the reader is unlocked — title, TL;DR, and the article side by side.';

  return (
    <aside
      aria-hidden
      className="hidden h-full w-[22rem] shrink-0 flex-col border-l border-border-subtlest-tertiary bg-background-default tablet:flex"
    >
      <div className="z-10 sticky top-0 flex items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-3 py-3">
        <div className="h-7 w-32 rounded-10 bg-surface-float [filter:blur(4px)]" />
        <div className={classNames(headerActionGroupClassName, 'opacity-60')}>
          <div
            className={classNames(iconButtonClassName, 'bg-surface-float')}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 pb-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-surface-float" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-3 w-3/4 rounded-6 bg-surface-float" />
            <div className="h-2.5 w-1/2 rounded-6 bg-surface-float" />
          </div>
        </div>
        <section
          aria-label="Article summary preview"
          className="flex min-w-0 flex-col gap-2"
        >
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="!mt-0 line-clamp-6 [filter:blur(2px)]"
          >
            {previewSummary}
          </Typography>
        </section>
        <div className="flex items-center gap-2">
          {(
            [
              ['upvote', UpvoteIcon],
              ['discuss', DiscussIcon],
              ['bookmark', BookmarkIcon],
            ] as const
          ).map(([key, Icon]) => (
            <div
              key={key}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-12 border border-border-subtlest-tertiary text-text-tertiary"
            >
              <Icon />
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-3">
          {['c1', 'c2', 'c3'].map((key) => (
            <div
              key={key}
              className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-surface-float" />
                <div className="h-3 w-24 rounded-6 bg-surface-float" />
              </div>
              <div className="h-3 w-full rounded-6 bg-surface-float [filter:blur(2px)]" />
              <div className="h-3 w-4/5 rounded-6 bg-surface-float [filter:blur(2px)]" />
            </div>
          ))}
        </div>
      </div>
    </aside>
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
  const displayDomain = host || 'daily.dev';

  useEffect(() => {
    logEvent({
      event_name: LogEvent.ImpressionReaderInstallPrompt,
      extra: JSON.stringify({ browser, post_id: post.id }),
    });
    // Fire once per mount
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
        'tablet:!mx-auto tablet:!max-w-[min(95vw,118rem)]',
        'laptop:!mb-2 laptop:!mt-2 laptop:h-[calc(100vh-1rem)] laptop:max-h-[calc(100vh-1rem)] laptop:overflow-hidden',
        '!overscroll-y-auto',
      )}
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-3 pb-2 pt-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
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
              title={post.permalink}
            >
              <button
                type="button"
                onClick={onCopyUrl}
                className="flex min-w-0 max-w-full items-center gap-1 hover:underline focus:underline"
              >
                <span className="truncate">{displayDomain}</span>
                <CopyIcon className="hidden size-3 shrink-0 text-text-tertiary tablet:inline" />
              </button>
            </Typography>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className={headerActionGroupClassName}>
              <Tooltip side="bottom" content="More">
                <Button
                  variant={ButtonVariant.Tertiary}
                  icon={<MenuIcon />}
                  size={ButtonSize.Small}
                  type="button"
                  className={iconButtonClassName}
                  aria-label="More options"
                  disabled
                />
              </Tooltip>
            </div>
            <div className={headerActionGroupClassName}>
              <Tooltip side="bottom" content="Close">
                <Button
                  variant={ButtonVariant.Tertiary}
                  icon={<CloseIcon />}
                  size={ButtonSize.Small}
                  type="button"
                  className={iconButtonClassName}
                  onClick={(event: MouseEvent<HTMLButtonElement>) =>
                    onRequestClose(event)
                  }
                  aria-label="Close install prompt"
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="relative flex min-h-0 flex-1">
          <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
            <FakePreview />
            <div className="z-10 relative m-auto flex w-full max-w-[34rem] flex-col items-stretch p-6">
              <div
                className={classNames(
                  'flex flex-col items-center gap-5 rounded-24 p-8 text-center',
                  'bg-background-default/95 backdrop-blur-md',
                  'border border-border-subtlest-tertiary',
                  'shadow-[0_32px_80px_-16px_rgba(0,0,0,0.45)]',
                )}
              >
                <span
                  className={classNames(
                    'flex items-center gap-1.5 rounded-full px-3 py-1',
                    'bg-action-upvote-float text-action-upvote-default',
                    'font-bold uppercase tracking-[0.18em] typo-footnote',
                  )}
                >
                  <ArrowIcon className="size-3 -rotate-90" />
                  one click away
                </span>
                <Typography
                  tag={TypographyTag.H2}
                  type={TypographyType.LargeTitle}
                  color={TypographyColor.Primary}
                  bold
                  className="!leading-tight"
                >
                  Open every link inside daily.dev.
                </Typography>
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Body}
                  color={TypographyColor.Secondary}
                  className="!mt-0 max-w-[28rem]"
                >
                  Install the extension and {displayDomain} loads here, next to
                  its TL;DR, your highlights, and the discussion. No new tab. No
                  context switching. No losing the loop.
                </Typography>
                <ul className="grid w-full max-w-[24rem] grid-cols-1 gap-2 text-left">
                  {[
                    'Read any article without leaving the feed',
                    'See the TL;DR and discussion side by side',
                    'Pick up where you left off across devices',
                  ].map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-text-secondary typo-callout"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-action-upvote-default" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex w-full max-w-[24rem] flex-col items-stretch gap-2">
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
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="!mt-0"
                >
                  Free. Works offline. Two clicks to install.
                </Typography>
              </div>
            </div>
          </div>
          <FakeRail post={post} />
        </div>
      </div>
    </Modal>
  );
}

export default ReaderInstallPromptModal;
