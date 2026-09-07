import { useCallback } from 'react';
import { useConditionalFeature } from './useConditionalFeature';
import usePersistentContext, {
  PersistentContextKeys,
} from './usePersistentContext';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { featurePreferredSource } from '../lib/featureManagement';
import { LogEvent, TargetType } from '../lib/log';
import type { PreferredSourceState } from '../lib/preferredSources';
import { useGooglePreferredSource } from './useGooglePreferredSource';

export type UsePreferredSourceProps = {
  /** Which surface is asking. Goes out with every event. */
  placement: string;
  /** Extra gate on top of the flag and the global state. */
  shouldEvaluate?: boolean;
};

export type UsePreferredSource = {
  /** The flag is on, the reader is signed in, and they have not answered yet. */
  isEligible: boolean;
  isReady: boolean;
  /** Opens Google's flow, logs the click and silences every other surface. */
  onAdd: () => void;
  /** Silences every surface without opening Google. */
  onDismiss: () => void;
  onImpression: () => void;
};

/**
 * The one gate every Preferred Sources surface goes through.
 *
 * Because Google has no read API, "already added" is our own optimistic state:
 * a reader who clicks is treated as done even if they abandon Google's dialog.
 * That is the right trade — asking again is worse than counting one non-answer
 * as a yes — and it is why the settings row exists as a permanent way back in.
 */
export const usePreferredSource = ({
  placement,
  shouldEvaluate = true,
}: UsePreferredSourceProps): UsePreferredSource => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const [state, setState, isStateLoaded] =
    usePersistentContext<PreferredSourceState | null>(
      PersistentContextKeys.PreferredSourceState,
      null,
    );

  const gate = isAuthReady && isLoggedIn && shouldEvaluate;
  const { value: isEnabled } = useConditionalFeature({
    feature: featurePreferredSource,
    shouldEvaluate: gate,
  });

  const isEligible = gate && !!isEnabled && isStateLoaded && !state;
  const { isReady, addPreferredSource } = useGooglePreferredSource({
    enabled: isEligible,
  });

  const onImpression = useCallback(() => {
    logEvent({
      event_name: LogEvent.ImpressionPreferredSource,
      target_type: TargetType.PreferredSource,
      target_id: placement,
    });
  }, [logEvent, placement]);

  const onAdd = useCallback(() => {
    logEvent({
      event_name: LogEvent.ClickPreferredSource,
      target_type: TargetType.PreferredSource,
      target_id: placement,
    });
    addPreferredSource();
    setState('added');
  }, [addPreferredSource, logEvent, placement, setState]);

  const onDismiss = useCallback(() => {
    logEvent({
      event_name: LogEvent.DismissPreferredSource,
      target_type: TargetType.PreferredSource,
      target_id: placement,
    });
    setState('dismissed');
  }, [logEvent, placement, setState]);

  return { isEligible, isReady, onAdd, onDismiss, onImpression };
};
