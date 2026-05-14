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

// Heavily blurred, white-page article mockup so the surface reads like a
// real website opened inside daily.dev. We use explicit hex colors instead
// of theme tokens so the article surface stays light even when the rest
// of the app is in dark mode — that's what most real article pages look
// like, and it makes the blur read as "a webpage behind glass".
const ARTICLE_PARAGRAPHS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] as const;

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

  // DEMO ONLY: bypass the install flow entirely — opens the article in a
  // new tab so users who don't want embedded reading still get the regular
  // "Read post" behavior they're used to.
  const onOpenInNewTabClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    logEvent({
      event_name: LogEvent.ClickReaderInstallSkip,
      extra: JSON.stringify({ browser, post_id: post.id }),
    });
    if (post.permalink) {
      globalThis.window?.open(post.permalink, '_blank', 'noopener,noreferrer');
    }
    onRequestClose(event);
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
        'tablet:!mx-auto tablet:!max-w-[min(96vw,100rem)]',
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
                Read it right here.
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="!mt-0 max-w-[26rem]"
              >
                Install the extension and every article opens inside daily.dev —
                with the discussion right next to it.
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
                    or
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
                  onClick={onOpenInNewTabClick}
                >
                  Open the article in a new tab
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
