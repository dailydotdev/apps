import type { ReactElement, ReactNode } from 'react';
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
  revealShell,
  useShellScroll,
} from '../../components/shell/useShellScroll';
import { PatchyRailIcon } from './PatchyRailIcon';
import { usePatchyEnabled } from './usePatchyEnabled';
import { usePatchyRail } from './usePatchyRail';

interface PatchyPhoneCompanionValue {
  patchy: ReturnType<typeof usePatchyRail>;
  state: StreakRingState;
  hasReadToday: boolean;
  goalProgress?: number;
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
  peek: 'translateY(-42%)',
  drop: 'translateY(1.5rem)',
};

// When the header with his pill has scrolled away, he peeks down from the
// top of the screen; tapping him brings the header back. On a reaction he
// drops all the way in to play it, also on pages without his pill (a post),
// then goes back to where he was.
export const PatchyTopPeek = (): ReactElement | null => {
  const companion = usePatchyPhoneCompanion();
  const { p } = useShellScroll();
  const { logEvent } = useLogContext();
  const isShellHidden = p >= 0.99;
  const isInHeaderView = !!companion?.isInHeader && !isShellHidden;

  const onClick = useCallback(() => {
    revealShell();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Patchy,
      extra: JSON.stringify({ origin: 'peek' }),
    });
  }, [logEvent]);

  if (!companion) {
    return null;
  }
  const { patchy, state, hasReadToday, isInHeader } = companion;

  let position: PeekPosition = 'tucked';
  if (!isInHeaderView) {
    if (patchy.isReacting) {
      position = 'drop';
    } else if (isInHeader) {
      position = 'peek';
    }
  }
  const canTap = position === 'peek' && isInHeader;

  return (
    <div
      aria-hidden={position === 'tucked' || undefined}
      data-position={position}
      className="pointer-events-none fixed right-2 z-header h-24 w-20 overflow-hidden tablet:hidden"
      style={{
        // The edge he hangs from: the screen's top while the header is away,
        // otherwise the header's bottom edge, so he comes out from behind it.
        top: isShellHidden
          ? 'calc(var(--safe-area-top, 0px) + var(--phone-top-ad-height, 0px))'
          : 'calc(var(--safe-area-top, 0px) + var(--phone-top-ad-height, 0px) + var(--shell-top, 0px))',
      }}
    >
      <button
        type="button"
        tabIndex={canTap ? 0 : -1}
        aria-label="Show Patchy"
        onClick={onClick}
        className={classNames(
          'absolute left-1/2 top-0 flex size-12 items-center justify-center rounded-full transition-transform duration-300 ease-out motion-reduce:transition-none',
          canTap ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        style={{ transform: `translateX(-50%) ${peekTransform[position]}` }}
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

const PatchyPhoneCompanionProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const { isLoading, streak, state, hasReadToday, goalProgress } =
    useStreakRingState();
  const patchy = usePatchyRail({
    isEnabled: true,
    isStreakLoading: isLoading,
    state,
    hasReadToday,
    lastViewAt: streak?.lastViewAt,
    canSuggest: false,
  });
  const [isInHeader, setInHeader] = useState(false);
  const value = useMemo(
    () => ({
      patchy,
      state,
      hasReadToday,
      goalProgress: goalProgress?.ratio,
      isInHeader,
      setInHeader,
    }),
    [patchy, state, hasReadToday, goalProgress?.ratio, isInHeader],
  );

  return (
    <PatchyPhoneCompanionContext.Provider value={value}>
      {/* Before the shell, so the header (same layer) covers him. */}
      <PatchyTopPeek />
      {children}
    </PatchyPhoneCompanionContext.Provider>
  );
};

// Wraps the phone shell. Without the flag (or a streak) it renders the shell
// alone and the header keeps its flame.
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

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <PatchyPhoneCompanionProvider>{children}</PatchyPhoneCompanionProvider>
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
