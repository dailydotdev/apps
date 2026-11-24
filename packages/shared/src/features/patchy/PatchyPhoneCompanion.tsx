import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
  revealShell,
  useShellScroll,
} from '../../components/shell/useShellScroll';
import { useShellPageConfig } from '../../components/shell/ShellPageContext';
import type { PatchyEmote, PatchyFace } from './patchyConfig';
import type { PatchyMotion } from './patchyIdle';
import { PatchyRailIcon } from './PatchyRailIcon';
import { usePatchyEnabled } from './usePatchyEnabled';
import { usePatchyRail } from './usePatchyRail';

// The peek is in the server HTML, where a layout effect only warns.
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
    // A post is open: he reads along in the corner.
    isReading: boolean;
  };
  state: StreakRingState;
  hasReadToday: boolean;
  goalProgress?: number;
}

interface PatchyPhoneCompanionValue extends PatchyPhoneState {
  // The header's streak pill shows him (the home page).
  isInHeader: boolean;
  setInHeader: (isInHeader: boolean) => void;
}

const PatchyPhoneCompanionContext =
  createContext<PatchyPhoneCompanionValue | null>(null);

// The phone's one Patchy: the header pill and the top peek show the same
// face and reactions, and a welcome or late-night reaction plays once.
export const usePatchyPhoneCompanion = (): PatchyPhoneCompanionValue | null =>
  useContext(PatchyPhoneCompanionContext);

type PeekPosition = 'tucked' | 'corner';

// His corner spot leaves room above him for a reaction's emotes.
const peekTransform: Record<PeekPosition, string> = {
  tucked: 'translateY(-100%)',
  corner: 'translateY(1rem)',
};
const PEEK_MS = 300;

// While the header is scrolled away he sits in the top-right corner, on any
// page, and plays his reactions right there; tapping him brings the header
// back. On a post he stays in that corner reading along, below the post's
// header, which doesn't scroll away. With the header up elsewhere he's in its
// pill (home), or slides into the corner only to react. Tucked away he leaves the layout, like the
// shell block: iOS 26 Safari paints its status area solid while a fixed box
// with a background stands at the top.
export const PatchyTopPeek = (): ReactElement | null => {
  const companion = usePatchyPhoneCompanion();
  const config = useShellPageConfig();
  const { p } = useShellScroll();
  const { logEvent } = useLogContext();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // The header scrolled away; it comes back on a tap or a scroll up.
  const isScrolledAway = !config?.hidden && p >= 0.99;
  // No header standing at the top: scrolled away, or hidden by the page.
  const isShellAway = !!config?.hidden || p >= 0.99;
  const isInHeader = !!companion?.isInHeader;
  const isInHeaderView = isInHeader && !isShellAway;
  const target: PeekPosition =
    companion &&
    !isInHeaderView &&
    (isScrolledAway ||
      companion.patchy.isReacting ||
      companion.patchy.isReading)
      ? 'corner'
      : 'tucked';

  // What is on screen. Coming in it first stands tucked, so the slide has a
  // start; going out it slides away, then unmounts.
  const [rendered, setRendered] = useState<PeekPosition | null>(null);
  useEffect(() => {
    if (target !== 'tucked') {
      setRendered((current) => current ?? 'tucked');
      return undefined;
    }
    setRendered((current) => (current ? 'tucked' : null));
    const timer = window.setTimeout(() => setRendered(null), PEEK_MS);
    return () => window.clearTimeout(timer);
  }, [target]);
  useClientLayoutEffect(() => {
    if (!rendered || target === 'tucked' || rendered === target) {
      return;
    }
    // Reading the box settles the tucked position as the slide's start.
    buttonRef.current?.getBoundingClientRect();
    setRendered(target);
  }, [rendered, target]);

  const onClick = useCallback(() => {
    revealShell();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Patchy,
      extra: JSON.stringify({ origin: 'peek' }),
    });
  }, [logEvent]);

  if (!companion || !rendered) {
    return null;
  }
  const { patchy, state, hasReadToday } = companion;
  // Tapping him brings back the header he stands in for.
  const canTap = rendered === 'corner' && isScrolledAway;

  return (
    <div
      aria-hidden={!canTap || undefined}
      data-position={rendered}
      className="pointer-events-none fixed right-2 z-header h-24 w-20 overflow-hidden tablet:hidden"
      style={{
        // The edge he hangs from: the screen's top while the header is away,
        // otherwise the header's bottom edge, so he comes out from behind it.
        top: isShellAway
          ? 'calc(var(--safe-area-top, 0px) + var(--phone-top-ad-height, 0px))'
          : 'calc(var(--safe-area-top, 0px) + var(--phone-top-ad-height, 0px) + var(--shell-top, 0px))',
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        disabled={!canTap}
        aria-label="Show header"
        onClick={onClick}
        className={classNames(
          'absolute left-1/2 top-0 flex size-12 items-center justify-center rounded-full transition-transform duration-300 ease-out motion-reduce:transition-none',
          canTap ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        style={{ transform: `translateX(-50%) ${peekTransform[rendered]}` }}
      >
        <span className="flex scale-125 rounded-full shadow-2">
          <PatchyRailIcon
            face={patchy.face}
            motion={patchy.motion}
            motionKey={patchy.motionKey}
            emote={patchy.emote}
            emoteCount={patchy.emoteCount}
            emoteKey={patchy.emoteKey}
            state={state}
            hasReadToday={hasReadToday}
            showStreak={false}
          />
        </span>
      </button>
    </div>
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
  const [brain, setBrain] = useState<PatchyPhoneState | null>(null);
  const [isInHeader, setInHeader] = useState(false);
  const value = useMemo(
    () => (brain ? { ...brain, isInHeader, setInHeader } : null),
    [brain, isInHeader],
  );

  return (
    <PatchyPhoneCompanionContext.Provider value={value}>
      {isEnabled && <PatchyPhoneBrain onChange={setBrain} />}
      {/* Before the shell, so the header (same layer) covers him. */}
      <PatchyTopPeek />
      {children}
    </PatchyPhoneCompanionContext.Provider>
  );
};

// Tells the peek his pill is on the page; the header icon calls it.
export const usePatchyInHeader = (): void => {
  const companion = usePatchyPhoneCompanion();
  const setInHeader = companion?.setInHeader;
  useEffect(() => {
    if (!setInHeader) {
      return undefined;
    }
    setInHeader(true);
    return () => setInHeader(false);
  }, [setInHeader]);
};
