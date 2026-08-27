import { useCallback, useEffect, useRef } from 'react';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';

/* Device-local, and the same key for everybody. The obvious alternative is the
   app's usual `ActionType` + `useActions`, which is per-user and crosses
   devices, but `useActions` is `enabled: !!user`: with nobody signed in the
   query never runs, `isActionsFetched` is false forever and `checkHasCompleted`
   always answers false. The reader this sequence exists for is a stranger who
   followed a shared link, so the canonical pattern would have skipped exactly
   the people it was built for. */
export const WORLD_INTRO_KEY = 'world_intro_done';

/** Walk into a realm, then open a district. Two clicks, and that is the world. */
export type WorldIntroStep = 'realm' | 'district';

interface UseWorldIntroProps {
  userId: string;
  isOwn: boolean;
  /** The world is standing, built, and nothing else is asking for the screen. */
  isEligible: boolean;
  isInRealm: boolean;
  /** The end of the sequence: there is nothing after this worth pointing at. */
  hasDistrict: boolean;
}

interface UseWorldIntro {
  step: WorldIntroStep | null;
  dismiss: () => void;
}

const resolveStep = ({
  isReady,
  isEligible,
  isInRealm,
  hasDistrict,
}: {
  isReady: boolean;
  isEligible: boolean;
  isInRealm: boolean;
  hasDistrict: boolean;
}): WorldIntroStep | null => {
  if (!isReady || !isEligible || hasDistrict) {
    return null;
  }

  return isInRealm ? 'district' : 'realm';
};

/**
 * What to point at, on somebody's first visit and never again.
 *
 * Each step is cleared by the reader DOING the thing rather than by dismissing a
 * card, which is how `WorldNudge` already behaves: the sequence is two clicks
 * long and teaching them by having them made beats describing them. So there is
 * no "next" button and no step counter. Walk into a realm and the first hint is
 * replaced by the second; open a district and there is nothing left to say.
 *
 * Nothing shows until the stored flag has actually been read back. Without that
 * wait every returning reader gets a frame of the intro before it disappears,
 * which is worse than showing it: a hint that flashes is a bug, not a hint.
 */
export const useWorldIntro = ({
  userId,
  isOwn,
  isEligible,
  isInRealm,
  hasDistrict,
}: UseWorldIntroProps): UseWorldIntro => {
  const { logEvent } = useLogContext();
  const [isDone, setIsDone, isFetched] = usePersistentContext<boolean>(
    WORLD_INTRO_KEY,
    false,
    [true, false],
    false,
  );

  const step = resolveStep({
    isReady: isFetched && !isDone,
    isEligible,
    isInRealm,
    hasDistrict,
  });

  /* Read through a ref so the effects below depend on the facts that moved and
     not on a render-scoped `logEvent`. */
  const latest = useRef({ logEvent, isOwn });
  latest.current = { logEvent, isOwn };

  const hasShown = useRef(false);
  const hasEnded = useRef(false);

  const end = useCallback(
    (outcome: 'completed' | 'dismissed') => {
      /* Only ever ends something that started. A reader who opened a district
         while the intro was suppressed (riding, immersive, the bench open) was
         never told anything, and burning the flag on them would mean they never
         see it at all. */
      if (!hasShown.current || hasEnded.current) {
        return;
      }
      hasEnded.current = true;
      setIsDone(true);

      const { current } = latest;
      current.logEvent({
        event_name: LogEvent.WorldIntro,
        target_id: userId,
        extra: JSON.stringify({ is_own: current.isOwn, outcome }),
      });
    },
    [setIsDone, userId],
  );

  useEffect(() => {
    if (!step || hasShown.current) {
      return;
    }
    hasShown.current = true;

    const { current } = latest;
    current.logEvent({
      event_name: LogEvent.WorldIntro,
      target_id: userId,
      extra: JSON.stringify({ is_own: current.isOwn, outcome: 'shown' }),
    });
  }, [step, userId]);

  useEffect(() => {
    if (hasDistrict) {
      end('completed');
    }
  }, [end, hasDistrict]);

  const dismiss = useCallback(() => end('dismissed'), [end]);

  return { step, dismiss };
};
