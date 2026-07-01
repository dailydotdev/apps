import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { cloudinaryCharmInviteFriends } from '../../../lib/image';
import { GivebackConfettiBurst } from './GivebackConfettiBurst';

export interface GivebackInvitePromptProps {
  open: boolean;
  eyebrow?: string;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  // Festive community moment — confetti bursts from the gift.
  celebrate?: boolean;
  // Pulsing "live" dot in the eyebrow (social-proof signal).
  live?: boolean;
  // Opens above the gift (rail, bottom-left) instead of below it (header).
  placement?: 'below' | 'above';
  // Horizontal edge the tail points to — matches where the gift sits.
  align?: 'start' | 'end';
  autoDismissMs?: number;
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
  live = false,
  placement = 'below',
  align = 'end',
  autoDismissMs = 5000,
  onClick,
  onClose,
  className,
}: GivebackInvitePromptProps): ReactElement | null => {
  // Bumps every time the prompt opens, so the confetti and the countdown ring
  // restart even when one prompt replaces another.
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    setRunId((current) => current + 1);
    if (!autoDismissMs || !onClose) {
      return undefined;
    }
    const timer = window.setTimeout(onClose, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [open, autoDismissMs, onClose]);

  if (!open) {
    return null;
  }

  const isAbove = placement === 'above';
  const giftSide = align === 'end' ? 'right-6' : 'left-6';

  return (
    <div
      className={classNames(
        'absolute z-3 w-[25rem] max-w-[calc(100vw-2rem)]',
        isAbove ? 'bottom-full mb-3' : 'top-full mt-3',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      )}
      role="status"
    >
      {celebrate && (
        <div
          className={classNames(
            'pointer-events-none absolute',
            isAbove ? 'bottom-0' : 'top-0',
            giftSide,
          )}
        >
          <GivebackConfettiBurst trigger={runId} />
        </div>
      )}

      {/* Tail pointing to the gift. */}
      <div
        className={classNames(
          'absolute size-3 rotate-45 border border-border-subtlest-tertiary bg-background-popover',
          giftSide,
          isAbove
            ? 'bottom-[-6px] border-l-0 border-t-0'
            : 'top-[-6px] border-b-0 border-r-0',
        )}
      />

      <div className="giveback-toast-in ring-accent-cabbage-default/25 relative flex items-stretch gap-3.5 rounded-16 border border-border-subtlest-tertiary bg-gradient-to-br from-accent-cabbage-flat to-background-popover p-3.5 antialiased shadow-3 ring-1">
        {/* The daily.dev mascot, bobbing on a soft cabbage glow. */}
        <div className="relative flex w-20 shrink-0 items-center justify-center self-center">
          <span
            aria-hidden
            className="absolute inset-2 rounded-full bg-accent-cabbage-flat blur-md"
          />
          <img
            src={cloudinaryCharmInviteFriends}
            alt="daily.dev mascot"
            className="mascot-bob relative size-20 object-contain"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5">
            {live && (
              <span className="relative flex size-2" aria-hidden>
                <span className="opacity-75 absolute inline-flex size-full animate-ping rounded-full bg-accent-avocado-default" />
                <span className="relative inline-flex size-2 rounded-full bg-accent-avocado-default" />
              </span>
            )}
            <span className="truncate font-bold uppercase tracking-wide text-accent-cabbage-default typo-caption2">
              {eyebrow}
            </span>
          </div>
          <p className="font-bold text-text-primary typo-callout [text-wrap:balance]">
            {headline}
          </p>
          <p className="text-text-secondary typo-caption1 [text-wrap:pretty]">
            {body}
          </p>
        </div>

        {/* Right rail: the countdown-ring close on top, the CTA below. */}
        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onClose}
            className="relative grid size-7 shrink-0 place-items-center rounded-full text-text-tertiary transition-colors hover:bg-surface-float hover:text-text-primary"
          >
            {autoDismissMs > 0 && (
              <svg
                viewBox="0 0 36 36"
                className="pointer-events-none absolute inset-0 size-full -rotate-90 text-accent-cabbage-default"
                aria-hidden
              >
                <circle
                  key={runId}
                  className="giveback-dismiss-ring"
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  pathLength={100}
                  strokeDasharray="100"
                  style={{ animationDuration: `${autoDismissMs}ms` }}
                />
              </svg>
            )}
            <MiniCloseIcon size={IconSize.Small} />
          </button>

          <Button
            type="button"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Small}
            onClick={onClick}
            className="shrink-0"
          >
            {ctaLabel} →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GivebackInvitePrompt;
