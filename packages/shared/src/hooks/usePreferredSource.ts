import { useCallback } from 'react';
import { useConditionalFeature } from './useConditionalFeature';
import usePersistentContext from './usePersistentContext';
import useLogEventOnce from './log/useLogEventOnce';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { featurePreferredSource } from '../lib/featureManagement';
import { LogEvent, TargetType } from '../lib/log';
import { PREFERRED_SOURCE_ADDED_KEY } from '../lib/preferredSources';
import { useGooglePreferredSource } from './useGooglePreferredSource';

export type UsePreferredSourceProps = {
  /** Which surface is asking. Goes out with every event. */
  placement: string;
  /** Extra gate on top of the flag and the stored answer. */
  shouldEvaluate?: boolean;
  /**
   * Keeps the ask visible after the reader has already added us. Only the
   * settings row does this: every other surface goes quiet on the first click,
   * which would otherwise leave a reader who changed their mind no way back in.
   */
  isPermanent?: boolean;
};

export type UsePreferredSource = {
  /** The flag is on and the reader has not added us yet. */
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
 * The one gate every Preferred Sources surface goes through.
 *
 * Because Google has no read API, "already added" is our own optimistic state:
 * a reader who clicks is treated as done even if they abandon Google's dialog.
 * That is the right trade — asking again is worse than counting one non-answer
 * as a yes — and it is why the settings row is `isPermanent`.
 */
export const usePreferredSource = ({
  placement,
  shouldEvaluate = true,
  isPermanent = false,
}: UsePreferredSourceProps): UsePreferredSource => {
  const { isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const [hasAdded, setHasAdded, isStateLoaded] = usePersistentContext<boolean>(
    PREFERRED_SOURCE_ADDED_KEY,
    false,
  );

  // Deliberately not gated on being signed in. Post pages are public, and a
  // reader who arrived from Google — the one person for whom this ask is
  // self-interested rather than a favour — is usually signed out. The cap is
  // local-storage based, so it works for them too.
  const gate = isAuthReady && shouldEvaluate;
  const { value: isEnabled } = useConditionalFeature({
    feature: featurePreferredSource,
    shouldEvaluate: gate,
  });

  const isEligible =
    gate && isEnabled && (isPermanent || (isStateLoaded && !hasAdded));

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

  const onAdd = useCallback(() => {
    logEvent({
      event_name: LogEvent.ClickPreferredSource,
      target_type: TargetType.PreferredSource,
      target_id: placement,
    });
    addPreferredSource();
    setHasAdded(true);
  }, [addPreferredSource, logEvent, placement, setHasAdded]);

  return { isEligible, isReady, useDeeplink: hasFailed, onAdd };
};
