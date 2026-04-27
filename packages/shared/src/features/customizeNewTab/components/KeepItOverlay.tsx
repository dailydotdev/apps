import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useActions } from '../../../hooks/useActions';
import { ActionType } from '../../../graphql/actions';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface KeepItOverlayProps {
  /**
   * Only render when the user is on their very first session AND the panel
   * is open — otherwise we'd be drawing over a regular returning visit.
   */
  isFirstSession: boolean;
  /**
   * Right offset of the customize sidebar. The amplifier sits immediately to
   * the LEFT of the panel, OVER the feed, so it does not cover sidebar
   * content but visually anchors itself to the panel edge.
   */
  sidebarWidthPx: number;
}

/**
 * First-session sidebar amplifier.
 *
 * Earlier iterations placed a coach mark or centered modal next to the
 * sidebar — both sat underneath Chrome's permission dialog and never
 * reached the user's eye. This version paints a vibrant, glowing column
 * over the FEED side of the sidebar's left edge so it survives Chrome's
 * dim overlay and visually pulls the user toward the panel:
 *
 *  1. A cabbage → onion radial bloom anchored to the sidebar's left edge,
 *     fading out into the feed. `mix-blend-screen` brightens whatever's
 *     behind it (including Chrome's dimming overlay) instead of merely
 *     covering it, so the glow reaches the user even mid-permission-flow.
 *  2. A vertical traveling light beam riding just outside the sidebar
 *     edge — a thin, fast-moving line that visibly catches the eye.
 *  3. A bouncing arrow chip in the feed-side column, pointing INTO the
 *     panel. The chip glows in cabbage with a pulsing white ring + halo so
 *     it survives Chrome's dim overlay.
 *
 * Together they say: "This panel is alive — keep daily.dev to see it."
 *
 * The parent keeps this effect short-lived: it disappears after a few
 * seconds or as soon as the user interacts with the sidebar.
 */
export const KeepItOverlay = ({
  isFirstSession,
  sidebarWidthPx,
}: KeepItOverlayProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const { completeAction, isActionsFetched } = useActions();
  const impressionLoggedRef = useRef(false);

  const shouldShow = isFirstSession && isActionsFetched;

  useEffect(() => {
    if (!shouldShow || impressionLoggedRef.current) {
      return;
    }
    impressionLoggedRef.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.CustomizeNewTab,
      extra: JSON.stringify({ feature_name: 'keep_it_overlay' }),
    });
    completeAction(ActionType.SeenKeepItOverlay);
  }, [completeAction, logEvent, shouldShow]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      aria-hidden
      className={classNames(
        'pointer-events-none fixed inset-y-0 z-max',
        'motion-safe:animate-[keep-it-amp-in_0.6s_ease-out]',
      )}
      style={{ right: `${sidebarWidthPx}px`, width: '8rem' }}
    >
      <style>{`
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
              0 0 0 0 rgba(192, 41, 240, 0.55),
              0 0 1.25rem 0.25rem rgba(255,255,255,0.45);
          }
          100% {
            box-shadow:
              0 0 0 1.25rem rgba(192, 41, 240, 0),
              0 0 1.5rem 0.5rem rgba(255,255,255,0);
          }
        }
      `}</style>

      {/* Cabbage → onion radial bloom anchored to the sidebar's left edge.
          The brightest spot sits right at `right: 0` (touching the panel),
          fading out into the feed. `mix-blend-screen` brightens whatever's
          behind it so the glow reaches the user even through Chrome's
          permission dimming overlay. */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-32 motion-safe:animate-[keep-it-halo-breathe_3.2s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(ellipse 92% 60% at right center, rgba(255,255,255,0.42) 0%, var(--theme-accent-cabbage-default) 22%, var(--theme-accent-onion-default) 48%, transparent 78%)',
          mixBlendMode: 'screen',
          transformOrigin: 'right center',
        }}
      />

      {/* Vertical traveling light beam riding just outside the sidebar
          edge — the "shine" streaking down the column in the approved
          design. Sits 1px before the sidebar so it visually attaches to
          the panel's border. */}
      <div
        aria-hidden
        className={classNames(
          'absolute inset-y-0 right-0 w-[3px] overflow-hidden rounded-l-full',
          'shadow-[0_0_1.5rem_0.25rem_rgba(255,255,255,0.32)]',
        )}
      >
        <div
          className={classNames(
            'absolute left-0 top-0 h-1/3 w-full',
            'bg-gradient-to-b from-transparent via-white to-transparent',
            'shadow-[0_0_1.5rem_0.35rem_rgba(255,255,255,0.78)]',
            'motion-safe:animate-[keep-it-edge-beam_2.6s_ease-in-out_infinite]',
          )}
        />
      </div>

      {/* Arrow chip in the feed-side column, bouncing toward the panel.
          Pinned to the welcome card's eyebrow row at the top of the
          sidebar (sidebar header + content padding + card top padding +
          half eyebrow-row height) so the arrow visually points at the
          "Your dev reading habit" line that introduces the panel. The
          two top values track the main feed header's responsive height
          (`h-14` mobile / `laptop:h-16` laptop), keeping the chip aligned
          across breakpoints. The cabbage fill + animated white ring +
          soft halo make it pop even through Chrome's dim overlay. */}
      <div
        aria-hidden
        className="absolute right-3 top-[6.375rem] -translate-y-1/2 laptop:top-[6.875rem]"
      >
        <div className="motion-safe:animate-[keep-it-arrow-bob_1.6s_ease-in-out_infinite]">
          <span
            className={classNames(
              'flex h-12 w-12 items-center justify-center rounded-full',
              'bg-accent-cabbage-default text-white ring-2 ring-white/70',
              'motion-safe:animate-[keep-it-arrow-ring_1.8s_ease-out_infinite]',
            )}
          >
            <ArrowIcon
              size={IconSize.Small}
              secondary
              className="rotate-90"
            />
          </span>
        </div>
      </div>
    </div>
  );
};
