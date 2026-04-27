import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { MagicIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useFirstSessionOverride } from '../store/firstSessionOverride.store';

// TEMPORARY: this QA pill is intentionally rendered on every build — including
// production — while the welcome flow is being reviewed end-to-end on the
// hosted environments. The component (and its store) are scheduled for full
// removal once sign-off lands; do not add new callers in the meantime.

interface FirstSessionDevToggleProps {
  /**
   * The "real" first-session signal coming from useCustomizeNewTab. Used
   * only as the resolved status display when no manual override is set,
   * so the pill always reflects what the rest of the app currently sees.
   */
  realIsFirstSession: boolean;
}

/**
 * Dev-only QA pill, fixed at the top-centre of the viewport so it sits
 * directly in the line of sight whenever the new tab loads — the
 * previous bottom-left placement was too easy to miss when reviewing the
 * brand-new-user flow alongside the Chrome "Keep it / Change it back"
 * notification, which is what this toggle exists to demo.
 *
 * Three positions cycle on click:
 *
 *   override=null  -> "Real: ON/OFF"   (no override, follows live state)
 *   override=true  -> "Forced ON"
 *   override=false -> "Forced OFF"
 *
 * Override state is persisted in localStorage so reloading the new tab
 * preserves whatever you were testing.
 */
export const FirstSessionDevToggle = ({
  realIsFirstSession,
}: FirstSessionDevToggleProps): ReactElement | null => {
  const { override, setOverride, clearOverride } = useFirstSessionOverride();

  const resolved = override ?? realIsFirstSession;
  const isForced = override !== null;

  const handleToggle = () => {
    // Cycle: null -> true -> false -> null. That third "null" state matters
    // for testing teardown — it lets us hand control back to the real
    // signal without clearing localStorage by hand.
    if (override === null) {
      setOverride(!realIsFirstSession);
    } else if (override === true) {
      setOverride(false);
    } else {
      clearOverride();
    }
  };

  let label: string;
  if (override === null) {
    label = `First session: ${resolved ? 'ON' : 'OFF'} (real)`;
  } else {
    label = `First session: ${resolved ? 'ON' : 'OFF'} (forced)`;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={classNames(
        // Top-centre, above the MainLayout header. z-max keeps it on top
        // of every overlay (Customize sidebar, Keep-it scrim) so it's
        // always reachable while reviewing the welcome flow.
        'fixed left-1/2 top-3 z-max flex -translate-x-1/2 items-center gap-2',
        'rounded-full px-4 py-2 font-bold text-white shadow-2 typo-footnote',
        'bg-gradient-to-r from-accent-cabbage-default via-accent-bacon-default to-accent-bun-default',
        'ring-white/30 ring-2 transition-transform',
        'hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-cabbage-default',
        // Subtle attention pulse so a reviewer notices the pill on first
        // load. Disabled for users with reduced-motion preferences.
        'motion-safe:animate-[first-session-dev-pulse_2.4s_ease-in-out_infinite]',
      )}
      title="Dev only — cycles real → forced ON → forced OFF → real"
    >
      <style>{`
        @keyframes first-session-dev-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(206, 61, 243, 0.0); }
          50% { box-shadow: 0 0 0 6px rgba(206, 61, 243, 0.18); }
        }
      `}</style>
      <span
        aria-hidden
        className="bg-white/25 flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-inset ring-white/40"
      >
        <MagicIcon size={IconSize.Size16} secondary />
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className={classNames(
            'inline-block h-2 w-2 rounded-full',
            resolved ? 'bg-white' : 'bg-white/40',
          )}
          aria-hidden
        />
        {label}
      </span>
      <span
        aria-hidden
        className={classNames(
          'rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em]',
          isForced
            ? 'bg-white text-accent-cabbage-default'
            : 'bg-white/20 text-white/90',
        )}
      >
        Dev
      </span>
    </button>
  );
};
