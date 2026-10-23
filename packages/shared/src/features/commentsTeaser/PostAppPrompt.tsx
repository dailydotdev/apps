import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Post } from '../../graphql/posts';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { MiniCloseIcon } from '../../components/icons/MiniClose';
import { ClickIcon } from '../../components/icons/Click';
import { IconSize } from '../../components/Icon';
import { getAppDownloadUrl } from '../getApp/appStoreLinks';
import { isSearchEngineLanding } from '../getApp/mobileAppFooter';

const openAppFromPromptUrl = getAppDownloadUrl('post_prompt');

/**
 * X's phone interstitial, card for card: on every post page load, the
 * post's face (X: the author), "See this post in the app" and X's line word
 * for word, one short button "Open daily.dev" (X: "Open X") with a pointer
 * tapping it from 1.1s, and a close button. Never on a search landing:
 * Google ranks pages lower when a pop-up covers them right after a search
 * click (the footer has the same rule).
 */
export function PostAppPrompt({ post }: { post: Post }): ReactElement | null {
  const [isOpen, setIsOpen] = useState(() => !isSearchEngineLanding());
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    card.current?.focus();
    const onKey = (event: KeyboardEvent) =>
      event.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const image = post.author?.image ?? post.source?.image;

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="post-app-prompt-title"
      className="fixed inset-0 z-modal flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="animate-teaser-fade absolute inset-0"
        // X darkens the page 20% on its light theme; on daily.dev's dark
        // page that barely shows, so it is 50%.
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => setIsOpen(false)}
      />
      <div
        ref={card}
        tabIndex={-1}
        className="animate-teaser-fade relative mx-auto flex w-full max-w-[24rem] flex-col items-center rounded-24 bg-background-subtle px-6 py-8 text-center shadow-3 outline-none"
      >
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
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setIsOpen(false)}
        className="animate-teaser-fade fixed right-4 top-4 flex size-8 items-center justify-center rounded-full bg-surface-float text-text-primary backdrop-blur-[20px]"
      >
        <MiniCloseIcon size={IconSize.Small} />
      </button>
    </div>
  );
}
