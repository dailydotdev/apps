import { useCallback } from 'react';
import usePersistentContext from './usePersistentContext';
import useLogEventOnce from './log/useLogEventOnce';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, TargetType } from '../lib/log';
import { PREFERRED_SOURCE_ADDED_KEY } from '../lib/preferredSources';
import { useGooglePreferredSource } from './useGooglePreferredSource';

export type UsePreferredSourceProps = {
  /** Which surface is asking. Goes out with every event as the target id. */
  placement: string;
  /**
   * Keeps the ask visible after the reader has already added us. Only the
   * settings row does this: every other surface goes quiet on the first click,
   * which would otherwise leave a reader who changed their mind no way back in.
   */
  isPermanent?: boolean;
};

export type UsePreferredSource = {
  /** The reader has not added us yet, or the surface is permanent. */
  isEligible: boolean;
  isReady: boolean;
  /**
   * Google's script never arrived. Render the deeplink instead — it needs no
   * script, so the ask still works for a reader running a content blocker.
   */
  useDeeplink: boolean;
  /** Opens Google's flow, logs the click and silences every other surface. */
  onAdd: () => void;
};

/**
 * The one gate every Preferred Sources surface goes through, and the only place
 * the feature is measured.
 *
 * Because Google has no read API, "already added" is our own optimistic state:
 * a reader who clicks is treated as done even if they abandon Google's dialog.
 * That is the right trade — asking again is worse than counting one non-answer
 * as a yes — and it is why the settings row is `isPermanent`. It also means the
 * funnel ends at the click: nothing downstream of it is observable to us.
 */
export const usePreferredSource = ({
  placement,
  isPermanent = false,
}: UsePreferredSourceProps): UsePreferredSource => {
  const { logEvent } = useLogContext();
  const [hasAdded, setHasAdded, isStateLoaded] = usePersistentContext<boolean>(
    PREFERRED_SOURCE_ADDED_KEY,
    false,
  );

  const isEligible = isPermanent || (isStateLoaded && !hasAdded);

  const { isReady, hasFailed, addPreferredSource } = useGooglePreferredSource({
    enabled: isEligible,
  });

  useLogEventOnce(
    () => ({
      event_name: LogEvent.ImpressionPreferredSource,
      target_type: TargetType.PreferredSource,
      target_id: placement,
    }),
    { condition: isEligible },
  );

  // A blocked script is the difference between an ask that can be answered and
  // a disabled button, and the impression cannot carry it: the impression fires
  // on sight, while the block only resolves on a timeout well after it. Without
  // its own event those readers look like an audience that saw the ask and did
  // not want it.
  useLogEventOnce(
    () => ({
      event_name: LogEvent.PreferredSourceBlocked,
      target_type: TargetType.PreferredSource,
      target_id: placement,
    }),
    { condition: isEligible && hasFailed },
  );

  const onAdd = useCallback(() => {
    logEvent({
      event_name: LogEvent.ClickPreferredSource,
      target_type: TargetType.PreferredSource,
      target_id: placement,
      // Which route the reader actually took. Google's dialog and the deeplink
      // are a same-tab overlay and a new tab respectively, so they are not the
      // same ask, and the split is the only thing that says whether the
      // fallback is worth keeping.
      extra: JSON.stringify({ deeplink: hasFailed }),
    });
    addPreferredSource();
    setHasAdded(true);
  }, [addPreferredSource, hasFailed, logEvent, placement, setHasAdded]);

  return { isEligible, isReady, useDeeplink: hasFailed, onAdd };
};
