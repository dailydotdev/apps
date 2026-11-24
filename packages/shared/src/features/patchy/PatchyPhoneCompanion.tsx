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

type PeekPosition = 'tucked' | 'peek' | 'drop';

// How far his circle comes down from the edge he hangs from.
const peekTransform: Record<PeekPosition, string> = {
  tucked: 'translateY(-100%)',
  // Eyes and nose over the edge, the top of his head still behind it.
  peek: 'translateY(-22%)',
  drop: 'translateY(1.5rem)',
};
const PEEK_MS = 300;

// When the header with his pill has scrolled away, he peeks down from the
// top of the screen; tapping him brings the header back. On a reaction he
// drops all the way in to play it, also on pages without his pill (a post),
// then goes back to where he was. Tucked away he leaves the layout, like the
// shell block: iOS 26 Safari paints its status area solid while a fixed box
// with a background stands at the top.
export const PatchyTopPeek = (): ReactElement | null => {
  const companion = usePatchyPhoneCompanion();
  const config = useShellPageConfig();
  const { p } = useShellScroll();
  const { logEvent } = useLogContext();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // No header standing at the top: hidden by the page, or scrolled away.
  const isShellAway = !!config?.hidden || p >= 0.99;
  const isInHeader = !!companion?.isInHeader;

  let target: PeekPosition = 'tucked';
  if (companion && !(isInHeader && !isShellAway)) {
    if (companion.patchy.isReacting) {
      target = 'drop';
    } else if (isInHeader) {
      target = 'peek';
    }
  }

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
  // Only the peek does something: it brings the header and his pill back.
  const canTap = rendered === 'peek' && isInHeader;

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
  const { face, motion, motionKey, emote, emoteCount, emoteKey, isReacting } =
    usePatchyRail({
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
