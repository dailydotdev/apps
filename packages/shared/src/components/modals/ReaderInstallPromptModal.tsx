import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { Modal } from './common/Modal';
import type { LazyModalCommonProps } from './common/Modal';
import { LazyModal, ModalKind, ModalSize } from './common/types';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ChromeIcon, EdgeIcon } from '../icons';
import { downloadBrowserExtension, isChrome } from '../../lib/constants';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import type { Post } from '../../graphql/posts';

interface ReaderInstallPromptModalProps extends LazyModalCommonProps {
  post: Post;
}

const FAKE_PARAGRAPHS: ReadonlyArray<string> = [
  'The browser tab was the wrong unit of attention. Every link opened a new context, every context broke the loop, and the article you actually wanted to read got buried four tabs deep.',
  'Embedded browsing keeps the loop. The link opens beside the feed, the summary stays in view, and you decide what to read next without ever leaving the rail.',
  'It feels small. It is not. Once the friction is gone, you read more in less time, and the things you actually wanted to read stop slipping through the cracks.',
];

const FakePreview = (): ReactElement => (
  <div
    aria-hidden
    className={classNames(
      'pointer-events-none absolute inset-0 overflow-hidden',
      '[filter:blur(10px)_saturate(1.15)]',
    )}
  >
    <div className="relative h-full w-full bg-background-default">
      <div className="absolute inset-x-0 top-0 flex h-12 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-4">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-action-downvote-default" />
          <div className="h-3 w-3 rounded-full bg-action-bookmark-default" />
          <div className="h-3 w-3 rounded-full bg-action-upvote-default" />
        </div>
        <div className="ml-3 h-6 flex-1 rounded-8 bg-surface-float" />
      </div>
      <div className="absolute inset-x-0 bottom-0 top-12 grid grid-cols-2 gap-8 p-10">
        <div className="flex flex-col gap-4">
          <div className="h-10 w-4/5 rounded-8 bg-surface-float" />
          <div className="h-4 w-3/5 rounded-6 bg-surface-float" />
          <div className="mt-2 h-40 w-full rounded-12 bg-surface-float" />
          {FAKE_PARAGRAPHS.map((line) => (
            <div key={line} className="flex flex-col gap-2">
              <div className="h-3 w-full rounded-6 bg-surface-float" />
              <div className="h-3 w-11/12 rounded-6 bg-surface-float" />
              <div className="h-3 w-10/12 rounded-6 bg-surface-float" />
              <div className="h-3 w-9/12 rounded-6 bg-surface-float" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-l border-border-subtlest-tertiary pl-8">
          <div className="h-5 w-2/5 rounded-6 bg-surface-float" />
          <div className="h-4 w-3/5 rounded-6 bg-surface-float" />
          <div className="mt-4 flex flex-col gap-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-12 bg-surface-float p-3"
              >
                <div className="h-10 w-10 rounded-full bg-background-default" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3 w-4/5 rounded-6 bg-background-default" />
                  <div className="h-3 w-3/5 rounded-6 bg-background-default" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="absolute inset-0 bg-overlay-quaternary-onion" />
  </div>
);

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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.XLarge}
      overlayClassName="bg-overlay-quaternary-onion"
      className={classNames(
        '!mx-0 !max-w-full overflow-hidden !bg-background-default tablet:!mx-auto',
        'tablet:!max-w-[min(92vw,72rem)] laptop:!max-h-[min(calc(100vh-4rem),46rem)]',
        'h-full max-h-screen tablet:h-[min(calc(100vh-4rem),46rem)]',
      )}
    >
      <div className="relative flex h-full min-h-[34rem] w-full items-center justify-center">
        <FakePreview />
        <div
          className={classNames(
            'z-10 relative m-6 flex max-w-[34rem] flex-col items-center gap-4 rounded-24 p-8 text-center',
            'bg-background-default/95 backdrop-blur-md',
            'shadow-[0_24px_64px_-12px_rgba(0,0,0,0.35)]',
            'border border-border-subtlest-tertiary',
          )}
        >
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Brand}
            bold
            className="uppercase tracking-[0.18em]"
          >
            Two clicks away
          </Typography>
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
            className="!leading-tight"
          >
            Read it without leaving daily.dev.
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
            className="!mt-0 max-w-[28rem]"
          >
            Install the extension and every link opens beside your feed. Title,
            TL;DR, and the article — side by side. No new tabs. No losing the
            loop.
          </Typography>
          <div className="mt-3 flex w-full flex-col items-stretch gap-3">
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
          {post.permalink && (
            <ClickableText
              tag="a"
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-text-tertiary !typo-footnote"
            >
              or open in a new tab
            </ClickableText>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ReaderInstallPromptModal;
