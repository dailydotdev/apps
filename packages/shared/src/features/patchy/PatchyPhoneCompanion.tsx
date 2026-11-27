import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useReadingStreak } from '../../hooks/streaks';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import { LogEvent, TargetType } from '../../lib/log';
import {
  cluster,
  motion as shellMotion,
  topButton,
} from '../../components/shell/constants';
import {
  revealShell,
  useShellScroll,
} from '../../components/shell/useShellScroll';
import {
  ShellActions,
  useShellPageConfig,
} from '../../components/shell/ShellPageContext';
import type { PatchyEmote, PatchyFace } from './patchyConfig';
import type { PatchyMotion } from './patchyIdle';
import { PatchyRailIcon } from './PatchyRailIcon';
import { usePatchyEnabled } from './usePatchyEnabled';
import { usePatchyRail } from './usePatchyRail';

interface PatchyPhoneState {
  patchy: {
    face: PatchyFace;
    motion: PatchyMotion | null;
    motionKey: string;
    emote: PatchyEmote | null;
    emoteCount: number;
    emoteKey: number;
    isReacting: boolean;
    // A post is open: he reads along.
    isReading: boolean;
  };
  state: StreakRingState;
  hasReadToday: boolean;
  goalProgress?: number;
}

// Where he stands in the header: his streak pill (home), or a spot kept
// among the header's actions (a post).
type PatchyAnchorKind = 'pill' | 'actions';

interface PatchyAnchor {
  kind: PatchyAnchorKind;
  element: HTMLElement;
}

interface PatchyPhoneCompanionValue extends PatchyPhoneState {
  anchor: PatchyAnchor | null;
  setAnchor: (
    update: (anchor: PatchyAnchor | null) => PatchyAnchor | null,
  ) => void;
  // A page without a spot for him: he's reacting just below the header.
  isFloating: boolean;
  // The header keeps a spot for him among its actions.
  hasActionsSpot: boolean;
  // The header is away: he waits in his dock until it's back.
  isDocked: boolean;
}

const PatchyPhoneCompanionContext =
  createContext<PatchyPhoneCompanionValue | null>(null);

// The phone's one Patchy: the header pill and the floating face are the same
// face and reactions, and a welcome or late-night reaction plays once.
export const usePatchyPhoneCompanion = (): PatchyPhoneCompanionValue | null =>
  useContext(PatchyPhoneCompanionContext);

// Marks his spot in the header; the floating face lines up over it.
export const usePatchyAnchor = (
  kind: PatchyAnchorKind,
): ((element: HTMLElement | null) => void) => {
  const setAnchor = usePatchyPhoneCompanion()?.setAnchor;
  return useCallback(
    (element: HTMLElement | null) => {
      setAnchor?.((current) => {
        if (element) {
          return { kind, element };
        }
        return current?.kind === kind ? null : current;
      });
    },
    [setAnchor, kind],
  );
};

// His icon in the header's actions (40px).
const SPOT = 40;

// The dock he moves to while the header is away: a round button of the
// bar's material in the bottom-left corner, on the back-to-top button's row
// and centred on it, so the two frame the bottom stack. It's out of the
// way of the page's text, and at the bottom it never bands iOS 26 Safari's
// status area the way a fixed box at the top does.
const DOCK = cluster.compact;
const dockBottom = `calc(${cluster.floor} + ${
  cluster.rest + cluster.gap - (DOCK - topButton.size) / 2
}px)`;

// Without a spot in the header he reacts just below it, so he never covers
// its buttons.
const belowStyle: CSSProperties = {
  top: `calc(var(--safe-area-top, 0px) + var(--phone-top-ad-height, 0px) + var(--shell-top, 0px) + ${topButton.gap}px)`,
  right: topButton.inset,
  width: SPOT,
  height: SPOT,
};

const CompanionIcon = ({
  companion: { patchy, state, hasReadToday, goalProgress },
  showStreak,
}: {
  companion: PatchyPhoneState;
  showStreak: boolean;
}): ReactElement => (
  <PatchyRailIcon
    face={patchy.face}
    motion={patchy.motion}
    motionKey={patchy.motionKey}
    emote={patchy.emote}
    emoteCount={patchy.emoteCount}
    emoteKey={patchy.emoteKey}
    state={state}
    hasReadToday={hasReadToday}
    goalProgress={goalProgress}
    showStreak={showStreak}
  />
);

// While the header is away he waits in his dock, reactions and all, and a
// tap brings the header (and his spot in it) back. Shown and hidden by
// fading, like the back-to-top button, so he never pops.
export const PatchyDock = (): ReactElement | null => {
  const companion = usePatchyPhoneCompanion();
  const { logEvent } = useLogContext();
  const isDocked = !!companion?.isDocked;

  const onClick = useCallback(() => {
    revealShell();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Patchy,
      extra: JSON.stringify({ origin: 'dock' }),
    });
  }, [logEvent]);

  if (!companion) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Show header"
      aria-hidden={!isDocked}
      tabIndex={isDocked ? 0 : -1}
      onClick={onClick}
      data-position="dock"
      data-docked={isDocked ? 'yes' : 'no'}
      className={classNames(
        'shell-material shell-material-action shell-press shell-patchy-dock fixed flex items-center justify-center rounded-full tablet:hidden',
        isDocked
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
      )}
      style={{
        left: cluster.inset,
        bottom: dockBottom,
        width: DOCK,
        height: DOCK,
        zIndex: 3,
        transitionProperty: 'opacity, translate, transform, scale',
        transitionDuration: `${shellMotion.enter}ms`,
        transitionTimingFunction: shellMotion.interaction,
      }}
    >
      <CompanionIcon companion={companion} showStreak />
    </button>
  );
};

// A page whose header keeps no spot for him: he only comes out to react,
// just below the header while it's up. He leaves the layout when he's not
// shown: iOS 26 Safari paints its status area solid while a fixed box with
// a background stands at the top.
export const PatchyFloatingFace = (): ReactElement | null => {
  const companion = usePatchyPhoneCompanion();
  if (!companion?.isFloating) {
    return null;
  }

  return (
    <span
      aria-hidden
      data-position="below"
      className="pointer-events-none fixed flex items-center justify-center rounded-full tablet:hidden"
      style={{ ...belowStyle, zIndex: 76 }}
    >
      <span className="flex scale-125 rounded-full">
        <CompanionIcon companion={companion} showStreak={false} />
      </span>
    </span>
  );
};

// He stands among the header's actions on a post, first of them so a docked
// menu lines up beside him, and slides with the header.
const PatchyActionsSpot = (): ReactElement | null => {
  const ref = usePatchyAnchor('actions');
  const companion = usePatchyPhoneCompanion();
  if (!companion) {
    return null;
  }

  return (
    <ShellActions>
      <span
        ref={ref}
        aria-hidden
        data-testid="patchy-actions-spot"
        className="flex shrink-0 items-center justify-center tablet:hidden"
        style={{ width: SPOT, height: SPOT, order: -1 }}
      >
        <span className="flex scale-125 rounded-full">
          <CompanionIcon companion={companion} showStreak={false} />
        </span>
      </span>
    </ShellActions>
  );
};

// His brain, mounted only while he's on so the streak hooks (and the flags
// they evaluate) stay out of everyone else's phone. It reports up instead of
// wrapping the shell, so turning him on never remounts the header.
const PatchyPhoneBrain = ({
  onChange,
}: {
  onChange: (state: PatchyPhoneState | null) => void;
}): null => {
  const { isLoading, streak, state, hasReadToday, goalProgress } =
    useStreakRingState();
  const {
    face,
    motion,
    motionKey,
    emote,
    emoteCount,
    emoteKey,
    isReacting,
    isReading,
  } = usePatchyRail({
    isEnabled: true,
    isStreakLoading: isLoading,
    state,
    hasReadToday,
    lastViewAt: streak?.lastViewAt,
    canSuggest: false,
  });
  const ratio = goalProgress?.ratio;
  const value = useMemo(
    () => ({
      patchy: {
        face,
        motion,
        motionKey,
        emote,
        emoteCount,
        emoteKey,
        isReacting,
        isReading,
      },
      state,
      hasReadToday,
      goalProgress: ratio,
    }),
    [
      face,
      motion,
      motionKey,
      emote,
      emoteCount,
      emoteKey,
      isReacting,
      isReading,
      state,
      hasReadToday,
      ratio,
    ],
  );

  useEffect(() => onChange(value), [onChange, value]);
  useEffect(() => () => onChange(null), [onChange]);

  return null;
};

// Wraps the phone shell. Without the flag (or a streak) there's no brain, the
// context stays empty and the header keeps its flame.
export const PatchyPhoneCompanion = ({
  isPhone,
  children,
}: {
  isPhone: boolean;
  children: ReactNode;
}): ReactElement => {
  const { user } = useAuthContext();
  const { streak, isStreaksEnabled } = useReadingStreak();
  const isEnabled = usePatchyEnabled({
    shouldEvaluate: isPhone && !!user && isStreaksEnabled && !!streak,
  });
  const config = useShellPageConfig();
  const { p } = useShellScroll();
  const [brain, setBrain] = useState<PatchyPhoneState | null>(null);
  const [anchor, setAnchor] = useState<PatchyAnchor | null>(null);

  const hasHeader = !config?.hidden;
  const isScrolledAway = hasHeader && p >= 0.99;

  const value = useMemo((): PatchyPhoneCompanionValue | null => {
    if (!brain) {
      return null;
    }
    const isPill = anchor?.kind === 'pill';
    const { isReacting } = brain.patchy;
    // He's always somewhere while the header is away: in his dock. With
    // the header up he stands in his spot in it (the pill, a post's
    // actions), or comes out just below it to react on pages that keep him
    // no spot.
    const isDocked = isScrolledAway;
    return {
      ...brain,
      anchor,
      setAnchor,
      isFloating: isReacting && !anchor && !isDocked,
      // Only a post keeps a spot for him: he reads along there for the whole
      // visit, so the header's other actions never shift for a reaction.
      hasActionsSpot: hasHeader && !isPill && brain.patchy.isReading,
      isDocked,
    };
  }, [brain, anchor, hasHeader, isScrolledAway]);

  return (
    <PatchyPhoneCompanionContext.Provider value={value}>
      {isEnabled && <PatchyPhoneBrain onChange={setBrain} />}
      {value?.hasActionsSpot && <PatchyActionsSpot />}
      <PatchyFloatingFace />
      <PatchyDock />
      {children}
    </PatchyPhoneCompanionContext.Provider>
  );
};
