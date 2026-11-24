import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useReadingStreak } from '../../hooks/streaks';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import { LogEvent, TargetType } from '../../lib/log';
import {
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

// He is in the server HTML, where a layout effect only warns.
const useClientLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
  // He floats over the page, so the pill hides its own copy of him.
  isFloating: boolean;
  // The header keeps a spot for him among its actions.
  hasActionsSpot: boolean;
  // The header is away, or still sliding back in under him.
  isHeaderAway: boolean;
  // The header is away; tapping him brings it back.
  canTap: boolean;
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

// His icon in the header's actions (40px) and the corner fallback.
const SPOT = 40;
const rowHeight = topButton.size + 14;

const screenTop = 'var(--safe-area-top, 0px) + var(--phone-top-ad-height, 0px)';

// Without a spot in the header: the top-right of its row while it's away,
// just below it while it's up, so he never covers its buttons.
const getCornerStyle = (isHeaderAway: boolean): CSSProperties => ({
  top: isHeaderAway
    ? `calc(${screenTop} + ${(rowHeight - SPOT) / 2}px)`
    : `calc(${screenTop} + var(--shell-top, 0px) + ${topButton.gap}px)`,
  right: topButton.inset,
  width: SPOT,
  height: SPOT,
});

interface SpotRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// The one Patchy that floats over the page. While the header is up he stands
// exactly over his spot in it; when it scrolls away he stays right there and
// the header slides out from under him, and coming back it slides in under
// him. So he never jumps between the header and the corner. Without a spot
// in the header (pages other than home and a post) he only comes out to
// react, below the header or in the top-right of its row once it's away. He leaves the
// layout when he's not shown: iOS 26 Safari paints its status area solid
// while a fixed box with a background stands at the top.
export const PatchyFloatingFace = (): ReactElement | null => {
  const companion = usePatchyPhoneCompanion();
  const { logEvent } = useLogContext();
  const [rect, setRect] = useState<SpotRect | null>(null);
  const element = companion?.anchor?.element;
  const isFloating = !!companion?.isFloating;
  // Measured only while the header stands still.
  const canMeasure = !!companion && !companion.isHeaderAway;

  // Measured whenever the header settles, and when the spot or the row it
  // sits in changes size (a menu docking next to it), never mid-slide.
  useClientLayoutEffect(() => {
    if (!element) {
      setRect(null);
      return undefined;
    }
    if (!canMeasure) {
      return undefined;
    }
    const measure = () => {
      const box = element.getBoundingClientRect();
      if (!box.width) {
        return;
      }
      setRect((current) =>
        current &&
        current.left === box.left &&
        current.top === box.top &&
        current.width === box.width
          ? current
          : {
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
            },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.parentElement) {
      observer.observe(element.parentElement);
    }
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [element, canMeasure]);

  const onClick = useCallback(() => {
    revealShell();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Patchy,
      extra: JSON.stringify({ origin: 'peek' }),
    });
  }, [logEvent]);

  if (!companion || !isFloating) {
    return null;
  }
  const {
    patchy,
    state,
    hasReadToday,
    goalProgress,
    anchor,
    canTap,
    isHeaderAway,
  } = companion;
  const isPill = anchor?.kind === 'pill';
  const spot = anchor && rect ? rect : null;
  let position: string = isHeaderAway ? 'corner' : 'below';
  if (spot && anchor) {
    position = anchor.kind;
  }
  const icon = (
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
      // Over the pill he's the pill's face, streak ring and all.
      showStreak={isPill}
    />
  );

  return (
    <button
      type="button"
      disabled={!canTap}
      aria-hidden={!canTap || undefined}
      aria-label="Show header"
      onClick={onClick}
      data-position={position}
      className="fixed flex items-center justify-center rounded-full transition-[left,top] duration-200 ease-out motion-reduce:transition-none tablet:hidden"
      style={{
        ...(spot ?? getCornerStyle(isHeaderAway)),
        // Over the header he stands in front of it.
        zIndex: 76,
        pointerEvents: canTap ? 'auto' : 'none',
      }}
    >
      {isPill ? (
        icon
      ) : (
        <span className="flex scale-125 rounded-full">{icon}</span>
      )}
    </button>
  );
};

// The spot the header keeps for him among its actions, first of them so a
// docked menu lines up beside him. The floating face stands over it.
const PatchyActionsSpot = (): ReactElement => {
  const ref = usePatchyAnchor('actions');

  return (
    <ShellActions>
      <span
        ref={ref}
        aria-hidden
        className="invisible flex shrink-0 tablet:hidden"
        style={{ width: SPOT, height: SPOT, order: -1 }}
      />
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
  // The header takes its slide to come back; he floats over it until it
  // stands still again, then the pill takes over at the same spot.
  const [isSettling, setSettling] = useState(false);
  useEffect(() => {
    if (isScrolledAway) {
      setSettling(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setSettling(false), shellMotion.snap);
    return () => window.clearTimeout(timer);
  }, [isScrolledAway]);
  const isHeaderAway = isScrolledAway || isSettling;

  const value = useMemo((): PatchyPhoneCompanionValue | null => {
    if (!brain) {
      return null;
    }
    const isPill = anchor?.kind === 'pill';
    const isBusy = brain.patchy.isReacting || brain.patchy.isReading;
    return {
      ...brain,
      anchor,
      setAnchor,
      isFloating: isPill ? isHeaderAway : isBusy || isHeaderAway,
      // Only a post keeps a spot for him: he reads along there for the whole
      // visit, so the header's other actions never shift for a reaction.
      hasActionsSpot: hasHeader && !isPill && brain.patchy.isReading,
      isHeaderAway,
      canTap: isScrolledAway,
    };
  }, [brain, anchor, hasHeader, isHeaderAway, isScrolledAway]);

  return (
    <PatchyPhoneCompanionContext.Provider value={value}>
      {isEnabled && <PatchyPhoneBrain onChange={setBrain} />}
      {value?.hasActionsSpot && <PatchyActionsSpot />}
      <PatchyFloatingFace />
      {children}
    </PatchyPhoneCompanionContext.Provider>
  );
};
