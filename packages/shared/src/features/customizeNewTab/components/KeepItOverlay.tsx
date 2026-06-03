import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { ArrowIcon } from '../../../components/icons/Arrow';
import { IconSize } from '../../../components/Icon';

export type KeepItOverlayProps = {
  /**
   * Only render when the user is on their very first session AND the
   * panel is open — otherwise we'd be drawing over a regular returning
   * visit.
   */
  isFirstSession: boolean;
  /**
   * Right offset of the customize sidebar. The amplifier sits immediately
   * to the LEFT of the panel, OVER the feed, so it does not cover sidebar
   * content but visually anchors itself to the panel edge.
   */
  sidebarWidthPx: number;
};

// Keyframes are inlined so the animations don't rely on Tailwind picking
// up `animate-[<name>_...]` arbitrary utilities — those are flaky when the
// keyframe is defined at runtime.
const KEYFRAMES = `
@keyframes keep-it-amp-in {
  from { opacity: 0; transform: translateX(0.5rem); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes keep-it-halo-breathe {
  0%, 100% {
    opacity: 0.65;
    filter: saturate(1.1);
    transform: scaleX(1);
  }
  50% {
    opacity: 1;
    filter: saturate(1.35);
    transform: scaleX(1.06);
  }
}
@keyframes keep-it-edge-beam {
  0% { transform: translateY(-110%); opacity: 0; }
  12% { opacity: 1; }
  88% { opacity: 1; }
  100% { transform: translateY(110%); opacity: 0; }
}
@keyframes keep-it-arrow-bob {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(0.5rem); }
}
@keyframes keep-it-arrow-ring {
  0% {
    box-shadow:
      0 0 0 0 color-mix(in srgb, var(--theme-accent-cabbage-default) 55%, transparent),
      0 0 1.25rem 0.25rem rgba(255,255,255,0.45);
  }
  100% {
    box-shadow:
      0 0 0 1.25rem transparent,
      0 0 1.5rem 0.5rem rgba(255,255,255,0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .keep-it-amp,
  .keep-it-halo,
  .keep-it-edge-beam,
  .keep-it-arrow-bob,
  .keep-it-arrow-ring { animation: none !important; }
}
`;

const wrapperAnimation = 'keep-it-amp-in 0.6s ease-out';
const haloStyle: CSSProperties = {
  background:
    'radial-gradient(ellipse 92% 60% at right center,' +
    ' rgba(255,255,255,0.42) 0%,' +
    ' var(--theme-accent-cabbage-default) 22%,' +
    ' var(--theme-accent-onion-default) 48%,' +
    ' transparent 78%)',
  mixBlendMode: 'screen',
  transformOrigin: 'right center',
  animation: 'keep-it-halo-breathe 3.2s ease-in-out infinite',
};

const beamStyle: CSSProperties = {
  background: 'linear-gradient(to bottom, transparent, white, transparent)',
  boxShadow: '0 0 1.5rem 0.35rem rgba(255,255,255,0.78)',
  animation: 'keep-it-edge-beam 2.6s ease-in-out infinite',
};

const arrowBobStyle: CSSProperties = {
  animation: 'keep-it-arrow-bob 1.6s ease-in-out infinite',
};

const arrowRingStyle: CSSProperties = {
  animation: 'keep-it-arrow-ring 1.8s ease-out infinite',
};

/**
 * First-session sidebar amplifier. Paints a glowing column over the feed
 * along the customize sidebar's left edge to pull the user's eye toward
 * the welcome panel:
 *
 * 1. A cabbage → onion radial bloom anchored to the sidebar's left edge,
 *    fading into the feed. `mix-blend-screen` brightens whatever's behind
 *    it instead of merely covering it.
 * 2. A vertical traveling light beam riding just outside the sidebar
 *    edge — a thin, fast-moving line that visibly catches the eye.
 * 3. A bouncing arrow chip in the feed-side column pointing INTO the
 *    panel, with a pulsing white ring + halo.
 *
 * Visibility is gated on `isFirstSession` only.
 */
export const KeepItOverlay = ({
  isFirstSession,
  sidebarWidthPx,
}: KeepItOverlayProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const impressionLoggedRef = useRef(false);

  useEffect(() => {
    if (!isFirstSession || impressionLoggedRef.current) {
      return;
    }
    impressionLoggedRef.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.CustomizeNewTab,
      extra: JSON.stringify({ feature_name: 'keep_it_overlay' }),
    });
  }, [isFirstSession, logEvent]);

  if (!isFirstSession) {
    return null;
  }

  return (
    <div
      aria-hidden
      data-testid="keep-it-overlay"
      className="keep-it-amp pointer-events-none fixed inset-y-0 z-max"
      style={{
        right: `${sidebarWidthPx}px`,
        width: '8rem',
        animation: wrapperAnimation,
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Cabbage → onion radial bloom anchored to the sidebar's left edge.
          The brightest spot sits right at `right: 0` (touching the panel),
          fading into the feed. `mix-blend-screen` brightens whatever's
          behind it so the glow reaches the user even through any dim
          overlay. */}
      <div
        aria-hidden
        className="keep-it-halo absolute inset-y-0 right-0 w-32"
        style={haloStyle}
      />

      {/* Vertical traveling light beam riding just outside the sidebar edge
          — the "shine" streaking down the column. */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[3px] overflow-hidden rounded-l-full"
        style={{ boxShadow: '0 0 1.5rem 0.25rem rgba(255,255,255,0.32)' }}
      >
        <div
          className="keep-it-edge-beam absolute left-0 top-0 h-1/3 w-full"
          style={beamStyle}
        />
      </div>

      {/* Arrow chip in the feed-side column, bouncing toward the panel.
          Pinned to roughly the welcome card's eyebrow row so the arrow
          visually points at the "Your dev reading habit" line. The top
          values track the main feed header's responsive height (`h-14`
          mobile / `laptop:h-16` laptop). */}
      <div
        aria-hidden
        className="absolute right-3 top-[6.375rem] -translate-y-1/2 laptop:top-[6.875rem]"
      >
        <div className="keep-it-arrow-bob" style={arrowBobStyle}>
          <span
            className={classNames(
              'keep-it-arrow-ring flex h-12 w-12 items-center justify-center rounded-full',
              'ring-white/70 bg-accent-cabbage-default text-white ring-2',
            )}
            style={arrowRingStyle}
          >
            <ArrowIcon size={IconSize.Small} secondary className="rotate-90" />
          </span>
        </div>
      </div>
    </div>
  );
};
