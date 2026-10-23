import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { ClickIcon } from '@dailydotdev/shared/src/components/icons/Click';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { cloudinaryAppIconMain } from '@dailydotdev/shared/src/lib/image';

// X's logged-out prompts, rebuilt in daily.dev's components. Measured on
// x.com logged out (21 Oct 2026):
//
// Phone, every post page load (no frequency cap, dismissal not stored): a
// centred card over a 20% black backdrop, 16px from the edges, ~22px
// radius; the post author's avatar at 88px; "See this post in the app"
// (23px bold); "Use the app to view all comments and discover more posts.";
// a full-width black pill "Open X" with an animated tapping hand; a round
// 32px close button pinned top-right of the window. Backdrop tap closes.
// Card pops in, backdrop fades in.
//
// Desktop: nothing on load. A tap on like / reply / repost opens a 600px
// card (16px radius, 48px 80px padding) with a 40px action icon in the
// action's colour, a one-line title, a line naming the author, then "Log in"
// (solid) and "Sign up" (outline), 52px pills, 380px wide. Close button
// pinned top-right of the window.

const promptKeyframes = `
@keyframes sb-prompt-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes sb-prompt-pop {
  from { opacity: 0; transform: scale(0.92) }
  to { opacity: 1; transform: scale(1) }
}
@media (prefers-reduced-motion: reduce) {
  .sb-prompt-fade, .sb-prompt-pop { animation: none !important }
}
.sb-prompt-fade { animation: sb-prompt-fade 200ms ease-out both }
.sb-prompt-pop { animation: sb-prompt-pop 260ms cubic-bezier(0.16, 1, 0.3, 1) both }
@keyframes sb-tap-in { from { opacity: 0; transform: translate(14px, 18px) } to { opacity: 1; transform: none } }
@keyframes sb-tap { 0%, 55%, 100% { transform: scale(1) } 70% { transform: scale(0.82) } }
@keyframes sb-tap-ripple { 0%, 62% { opacity: 0; transform: scale(0.4) } 72% { opacity: 0.55 } 100% { opacity: 0; transform: scale(1.6) } }
.sb-tap-in { animation: sb-tap-in 300ms ease 1.1s both }
.sb-tap { animation: sb-tap 1.6s cubic-bezier(0.4, 0, 0.2, 1) 1.4s infinite }
.sb-tap-ripple { animation: sb-tap-ripple 1.6s ease-out 1.4s infinite; opacity: 0 }
@media (prefers-reduced-motion: reduce) {
  .sb-tap-in, .sb-tap, .sb-tap-ripple { display: none }
}
`;

const WindowClose = ({
  onClose,
  className,
}: {
  onClose: () => void;
  className?: string;
}): ReactElement => (
  <button
    type="button"
    aria-label="Dismiss"
    onClick={onClose}
    className={classNames(
      'sb-prompt-fade fixed right-4 top-4 z-max flex size-8 items-center justify-center rounded-full bg-surface-float text-text-primary backdrop-blur-[20px] hover:bg-surface-hover',
      className,
    )}
  >
    <MiniCloseIcon size={IconSize.Small} />
  </button>
);

const PromptLayer = ({
  onClose,
  children,
  backdrop,
  backdropStyle,
}: {
  onClose: () => void;
  children: ReactNode;
  backdrop?: string;
  backdropStyle?: CSSProperties;
}): ReactElement => {
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const view = card.current?.ownerDocument.defaultView;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    view?.addEventListener('keydown', onKey);
    // Focus the card, not its button: keyboard users land inside the
    // dialog, and the button shows no focus ring until they move (X shows
    // none on open either).
    card.current?.focus();
    return () => view?.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-modal flex items-center justify-center px-4"
    >
      <style>{promptKeyframes}</style>
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className={classNames('sb-prompt-fade absolute inset-0', backdrop)}
        style={backdropStyle}
        onClick={onClose}
      />
      <div
        ref={card}
        tabIndex={-1}
        className="sb-prompt-pop relative w-full outline-none"
      >
        {children}
      </div>
      <WindowClose onClose={onClose} />
    </div>
  );
};

/* ------------------------------------------------------------- phone */

/**
 * X's phone interstitial, "See this post in the app", card for card: the
 * post's own face (X: the author's avatar; an article here has its source),
 * X's two lines, word for word, and one short brand button, "Open
 * daily.dev" (X: "Open X"). X animates a hand tapping the button from 1.1s;
 * here the click pointer does the same, with a ripple on each tap. X's
 * backdrop is 20% black on its light theme; on daily.dev's dark page that
 * barely shows, so it is 50% here.
 */
export const PhoneAppPrompt = ({
  post,
  onClose,
  onOpenApp,
}: {
  post: Post;
  onClose: () => void;
  onOpenApp: () => void;
}): ReactElement => (
  <PromptLayer
    onClose={onClose}
    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
  >
    <div className="mx-auto flex max-w-[24rem] flex-col items-center rounded-24 bg-background-subtle px-6 pb-8 pt-8 text-center shadow-3">
      <img
        src={post.author?.image ?? post.source?.image ?? cloudinaryAppIconMain}
        alt=""
        className="mb-4 size-[5.5rem] rounded-full object-cover"
      />
      <h2 className="font-bold text-balance typo-title2">
        See this post in the app
      </h2>
      <p className="mt-2 text-text-tertiary text-pretty typo-callout">
        Use the app to view all comments and discover more posts.
      </p>
      <div className="relative mt-6 w-full">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className="w-full"
          onClick={onOpenApp}
        >
          Open daily.dev
        </Button>
        {/* X's tapping hand, as daily.dev's click pointer: in at 1.1s,
            then a tap every 1.6s, just right of the label. */}
        <span
          aria-hidden
          className="sb-tap-in pointer-events-none absolute left-1/2 top-1/2 ml-12 mt-1"
        >
          <span className="sb-tap-ripple absolute -left-3 -top-3 size-6 rounded-full bg-accent-cabbage-default blur-[2px]" />
          <span className="sb-tap block drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
            <ClickIcon
              secondary
              size={IconSize.XLarge}
              className="text-accent-cabbage-default"
            />
          </span>
        </span>
      </div>
    </div>
  </PromptLayer>
);

/* ----------------------------------------------------------- desktop */

export type PromptAction = 'upvote' | 'reply' | 'bookmark' | 'commentUpvote';

interface ActionCopy {
  icon: ReactElement;
  title: string;
  line: (name: string) => string;
}

// X's three lines, one per action, in daily.dev's verbs. X: "Like a post to
// share the love." / "Reply to join the conversation." / "Repost to spread
// the word." with "Join X now to let {author} know you like their post."
export const actionCopy: Record<PromptAction, ActionCopy> = {
  upvote: {
    icon: (
      <UpvoteIcon
        secondary
        size={IconSize.XXLarge}
        className="text-accent-avocado-default"
      />
    ),
    title: 'Upvote to back the good stuff.',
    line: (name) =>
      `Join daily.dev now to let ${name} know this post was worth reading.`,
  },
  reply: {
    icon: (
      <DiscussIcon
        secondary
        size={IconSize.XXLarge}
        className="text-accent-blueCheese-default"
      />
    ),
    title: 'Reply to join the conversation.',
    line: (name) =>
      `Once you join daily.dev, you can share your take on ${name}’s post.`,
  },
  bookmark: {
    icon: (
      <BookmarkIcon
        secondary
        size={IconSize.XXLarge}
        className="text-accent-bun-default"
      />
    ),
    title: 'Bookmark it for later.',
    line: () =>
      'Join daily.dev to keep this post in your reading list, on every device.',
  },
  commentUpvote: {
    icon: (
      <UpvoteIcon
        secondary
        size={IconSize.XXLarge}
        className="text-accent-avocado-default"
      />
    ),
    title: 'Upvote the comments that help.',
    line: () =>
      'Join daily.dev now to back the developers who explain things well.',
  },
};

export const DesktopActionPrompt = ({
  action,
  name,
  onClose,
  onLogin,
  onSignup,
}: {
  action: PromptAction;
  name: string;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
}): ReactElement => {
  const copy = actionCopy[action];
  return (
    <PromptLayer
      onClose={onClose}
      backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="mx-auto flex max-w-[37.5rem] flex-col items-center rounded-16 bg-background-subtle px-20 py-12 text-center shadow-3">
        <div className="mb-6 flex size-10 items-center justify-center">
          {copy.icon}
        </div>
        <h2 className="font-bold text-balance typo-title2">{copy.title}</h2>
        <p className="mt-2 text-text-tertiary text-pretty typo-callout">
          {copy.line(name)}
        </p>
        <div className="mt-10 flex w-full max-w-[23.75rem] flex-col gap-3">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            onClick={onLogin}
          >
            Log in
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Large}
            onClick={onSignup}
          >
            Sign up
          </Button>
        </div>
      </div>
    </PromptLayer>
  );
};

/**
 * Which logged-out tap on the post page opens which prompt. Read from the
 * real buttons' labels, so the intercept follows production markup.
 */
export const actionForButton = (
  button: HTMLElement,
): PromptAction | undefined => {
  // Comment votes carry no label, only ids like comment-<id>-upvote-btn.
  const label = `${button.getAttribute('aria-label') ?? ''} ${button.id} ${
    button.textContent ?? ''
  }`.toLowerCase();
  const inComment = !!button.closest('[data-testid="comment"]');
  if (/upvote/.test(label) && !/downvote/.test(label)) {
    return inComment ? 'commentUpvote' : 'upvote';
  }
  if (/bookmark/.test(label)) {
    return 'bookmark';
  }
  if (/comment|reply|share your thoughts/.test(label)) {
    return 'reply';
  }
  return undefined;
};

/**
 * Catches logged-out taps on the page's upvote, comment and bookmark
 * buttons before production's own handler (which opens the full sign-up
 * modal) and hands them to the X-style prompt instead.
 */
export const useActionIntercept = (
  enabled: boolean,
  onAction: (action: PromptAction) => void,
): React.RefObject<HTMLSpanElement> => {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const doc = marker.current?.ownerDocument;
    if (!doc || !enabled) {
      return undefined;
    }
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[role="dialog"], [data-sb-footer]')) {
        return;
      }
      const button = target.closest<HTMLElement>('button, [role="button"]');
      const fakeInput = target.closest('[data-testid="new-comment"]');
      const action = button
        ? actionForButton(button)
        : fakeInput && ('reply' as PromptAction);
      if (action) {
        event.preventDefault();
        event.stopPropagation();
        onAction(action);
      }
    };
    doc.addEventListener('click', onClick, true);
    return () => doc.removeEventListener('click', onClick, true);
  }, [enabled, onAction]);
  return marker;
};
