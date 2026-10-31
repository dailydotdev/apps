import type { ReactElement } from 'react';
import React, { useState } from 'react';
import ReactModal from 'react-modal';
import type { Post } from '../../graphql/posts';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import CloseButton from '../../components/CloseButton';
import { ClickIcon } from '../../components/icons/Click';
import { IconSize } from '../../components/Icon';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { initReactModal, isExtension } from '../../lib/func';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { getAppDownloadUrl } from '../getApp/appStoreLinks';
import { isSearchEngineLanding } from '../getApp/mobileAppFooter';

const openAppFromPromptUrl = getAppDownloadUrl('post_prompt');

const crawlerUserAgent = /bot|crawl|spider|slurp|lighthouse/i;

const isCrawler = (): boolean =>
  typeof navigator !== 'undefined' &&
  crawlerUserAgent.test(navigator.userAgent);

/**
 * X's phone interstitial, card for card: on every post page load, the
 * post's face (X: the author), "See this post in the app" and X's line word
 * for word, one short button "Open daily.dev" (X: "Open X") with a pointer
 * tapping it from 1.1s. The close button sits inside the card, as on every
 * daily.dev modal (X pins its own to the window corner). Never on a search landing:
 * Google ranks pages lower when a pop-up covers them right after a search
 * click (the footer has the same rule).
 */
export function PostAppPrompt({ post }: { post: Post }): ReactElement | null {
  const [isOpen, setIsOpen] = useState(
    () => !isSearchEngineLanding() && !isCrawler(),
  );
  const { logEvent } = useLogContext();

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.GetAppButton,
      target_id: TargetId.PostAppPrompt,
    }),
    { condition: isOpen },
  );

  if (!isOpen) {
    return null;
  }

  if (!isExtension) {
    initReactModal({ modalObject: ReactModal, appElement: '#__next' });
  }

  const close = () => setIsOpen(false);
  const onOpenApp = () => {
    logEvent({
      event_name: LogEvent.DownloadApp,
      target_type: TargetType.GetAppButton,
      target_id: TargetId.PostAppPrompt,
    });
  };
  const image = post.author?.image ?? post.source?.image;

  return (
    <ReactModal
      isOpen
      onRequestClose={close}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      aria={{ labelledby: 'post-app-prompt-title' }}
      ariaHideApp={!isExtension}
      // X darkens the page 20% on its light theme; on daily.dev's dark
      // page that barely shows, so it is 50%.
      overlayClassName="animate-teaser-fade fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-4"
      className="animate-teaser-fade relative mx-auto flex w-full max-w-[24rem] flex-col items-center rounded-24 bg-background-subtle px-6 py-8 text-center shadow-3 outline-none"
    >
      {/* daily.dev's modal close, inside the card where ModalClose sits
          (ModalClose itself hides on phones, where modals are drawers). */}
      <CloseButton className="absolute right-2 top-2 z-1" onClick={close} />
      {image && (
        <img
          src={image}
          alt=""
          className="mb-4 size-[5.5rem] rounded-full object-cover"
        />
      )}
      <h2
        id="post-app-prompt-title"
        className="text-balance font-bold typo-title2"
      >
        See this post in the app
      </h2>
      <p className="mt-2 text-pretty text-text-tertiary typo-callout">
        Use the app to view all comments and discover more posts.
      </p>
      <div className="relative mt-6 w-full">
        <Button
          tag="a"
          href={openAppFromPromptUrl}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className="w-full"
          onClick={onOpenApp}
        >
          Open daily.dev
        </Button>
        <span
          aria-hidden
          className="post-app-prompt-tap pointer-events-none absolute left-1/2 top-1/2 ml-12 mt-1 motion-reduce:hidden"
        >
          <ClickIcon
            secondary
            size={IconSize.XLarge}
            className="text-accent-cabbage-default drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
          />
        </span>
      </div>
    </ReactModal>
  );
}
