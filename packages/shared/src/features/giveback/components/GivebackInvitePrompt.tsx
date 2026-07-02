import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTimedAnimation } from '../../../hooks/useTimedAnimation';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { RootPortal } from '../../../components/tooltips/Portal';
import { cloudinaryCharmGiveback } from '../../../lib/image';
import { GivebackConfettiBurst } from './GivebackConfettiBurst';

export interface GivebackInvitePromptProps {
  open: boolean;
  eyebrow?: string;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  // Festive community moment — confetti bursts from the gift.
  celebrate?: boolean;
  // Opens above the gift (rail, bottom-left) instead of below it (header).
  placement?: 'below' | 'above';
  // Horizontal edge the tail points to — matches where the gift sits.
  align?: 'start' | 'end';
  // Open like a rail dropdown: portaled + fixed at the same left margin as the
  // support/settings/profile menus, instead of anchored to the gift with a tail.
  dropdown?: boolean;
  autoDismissMs?: number;
  // Externally pause the auto-dismiss (e.g. while the cursor is over the gift).
  paused?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  className?: string;
}

// A playful, community-framed invitation fronted by the daily.dev mascot. It's
// an acquisition hook, not a personal reward notice — it leads with social
// proof + the honest trade and always ends in a clear way into /giveback. The
// close button carries the auto-dismiss countdown ring (drains as it nears
// exit), so there's no bulky progress bar.
export const GivebackInvitePrompt = ({
  open,
  eyebrow = 'Raised together',
  headline = 'The community is funding real-world causes',
  body = 'All from everyday daily.dev activity. Pick the causes you care about.',
  ctaLabel = 'Join in',
  celebrate = false,
  placement = 'below',
  align = 'end',
  dropdown = false,
  autoDismissMs = 5000,
  paused = false,
  onClick,
  onClose,
  className,
}: GivebackInvitePromptProps): ReactElement | null => {
  // Bumps every time the prompt opens, so the confetti restarts even when one
  // prompt replaces another.
  const [runId, setRunId] = useState(0);
  const [hovered, setHovered] = useState(false);

  // Keep onClose fresh without re-arming the timer every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const handleEnd = useCallback(() => onCloseRef.current?.(), []);

  const { timer, startAnimation, pauseAnimation, resumeAnimation } =
    useTimedAnimation({
      autoEndAnimation: true,
      outAnimationDuration: 150,
      onAnimationEnd: handleEnd,
    });

  // Arm the countdown when the prompt opens (once — not on every render).
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    setRunId((current) => current + 1);
    startAnimation(autoDismissMs);
    return () => pauseAnimation();
  }, [open, autoDismissMs, startAnimation, pauseAnimation]);

  // Pause the countdown while the pointer rests on the gift or the toast, and
  // resume from where it left off (never restart) when it leaves.
  const isPaused = paused || hovered;
  useEffect(() => {
    if (!open) {
      return;
    }
    if (isPaused) {
      pauseAnimation();
    } else {
      resumeAnimation();
    }
  }, [isPaused, open, pauseAnimation, resumeAnimation]);

  if (!open) {
    return null;
  }

  const isAbove = placement === 'above';
  // Countdown ring: drains 0 -> 100 as the remaining time elapses, and freezes
  // while paused (the timer stops ticking).
  const remaining = autoDismissMs > 0 ? (timer / autoDismissMs) * 100 : 0;
  const dashoffset = Math.min(100, Math.max(0, 100 - remaining));
  const giftSide = align === 'end' ? 'right-6' : 'left-6';

  const content = (
    <div
      className={classNames(
        'w-[25rem]',
        dropdown
          ? 'fixed bottom-3 left-20 z-popup ml-2 max-w-[calc(100vw-6rem)]'
          : classNames(
              'absolute z-3 max-w-[calc(100vw-2rem)]',
              isAbove ? 'bottom-full mb-3' : 'top-full mt-3',
              align === 'end' ? 'right-0' : 'left-0',
            ),
        className,
      )}
      role="status"
    >
      {celebrate && (
        <div
          className={classNames(
            'pointer-events-none absolute',
            dropdown
              ? 'inset-x-0 top-0'
              : [isAbove ? 'bottom-0' : 'top-0', giftSide],
          )}
        >
          <GivebackConfettiBurst trigger={runId} />
        </div>
      )}

      {/* Tail pointing to the gift (anchored mode only). */}
      {!dropdown && (
        <div
          className={classNames(
            'absolute size-3 rotate-45 border border-border-subtlest-tertiary bg-background-popover',
            giftSide,
            isAbove
              ? 'bottom-[-6px] border-l-0 border-t-0'
              : 'top-[-6px] border-b-0 border-r-0',
          )}
        />
      )}

      <div
        className="giveback-toast-in relative flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-gradient-to-br from-accent-cabbage-flat to-background-popover p-3.5 antialiased shadow-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Close button (top-right corner) with the auto-dismiss countdown ring. */}
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
          className="absolute right-2.5 top-2.5 z-1 grid size-7 place-items-center rounded-full text-text-tertiary transition-colors hover:bg-surface-float hover:text-text-primary"
        >
          {autoDismissMs > 0 && (
            <svg
              viewBox="0 0 36 36"
              className="pointer-events-none absolute inset-0 size-full -rotate-90 text-accent-cabbage-default"
              aria-hidden
            >
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={dashoffset}
              />
            </svg>
          )}
          <MiniCloseIcon size={IconSize.Small} />
        </button>

        {/* Left: full-width message + CTA. */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="font-medium uppercase tracking-wide text-accent-cabbage-default typo-caption2">
              {eyebrow}
            </span>
            <p className="font-semibold text-text-primary typo-callout [text-wrap:balance]">
              {headline}
            </p>
            <p className="text-text-secondary typo-caption1 [text-wrap:pretty]">
              {body}
            </p>
          </div>

          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={onClick}
            className="w-full"
          >
            {ctaLabel} →
          </Button>
        </div>

        {/* The Giveback charm, bobbing on a soft glow. Its artwork sits on black,
           so mix-blend-screen drops the black on the dark card. */}
        <div className="relative flex h-36 w-32 shrink-0 items-center justify-center self-stretch">
          <span
            aria-hidden
            className="bg-accent-cabbage-default/20 absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          />
          <img
            src={cloudinaryCharmGiveback}
            alt="daily.dev Giveback charm"
            className="mascot-bob relative h-full w-full object-contain mix-blend-screen"
          />
        </div>
      </div>
    </div>
  );

  return dropdown ? <RootPortal>{content}</RootPortal> : content;
};

export default GivebackInvitePrompt;
