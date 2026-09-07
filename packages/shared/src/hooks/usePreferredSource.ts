import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useConditionalFeature } from './useConditionalFeature';
import usePersistentContext from './usePersistentContext';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { featurePreferredSource } from '../lib/featureManagement';
import { LogEvent, TargetType } from '../lib/log';
import type { PreferredSourceState } from '../lib/preferredSources';
import {
  PREFERRED_SOURCE_FORCE_KEY,
  PREFERRED_SOURCE_STATE_KEY,
} from '../lib/preferredSources';
import { useGooglePreferredSource } from './useGooglePreferredSource';

export type UsePreferredSourceProps = {
  /** Which surface is asking. Goes out with every event. */
  placement: string;
  /** Extra gate on top of the flag and the global state. */
  shouldEvaluate?: boolean;
};

export type UsePreferredSource = {
  /** The flag is on and the reader has not answered yet. */
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
  const router = useRouter();
  // REVIEW AFFORDANCE — remove before merge. The flag is off by default, so a
  // Vercel preview would show nothing; `?preferredSource=1` forces the gate on
  // so the placements can be reviewed without a GrowthBook rule.
  //
  // Sticky for the tab, deliberately: the param survives a full page load but
  // not client-side navigation, so opening a post from the feed (which is a
  // modal over the feed, with no query string of its own) would silently drop
  // it and the reviewer would see nothing. sessionStorage carries it across
  // every route until the tab closes.
  //
  // Read in an effect rather than during render: the server has no
  // sessionStorage, so reading it inline would make the first client render
  // disagree with the server HTML and trip a hydration error.
  const [isForced, setIsForced] = useState(false);
  const isForcedParam = router?.query?.preferredSource === '1';

  useEffect(() => {
    if (isForcedParam) {
      globalThis.sessionStorage?.setItem(PREFERRED_SOURCE_FORCE_KEY, '1');
      setIsForced(true);
      return;
    }

    setIsForced(
      globalThis.sessionStorage?.getItem(PREFERRED_SOURCE_FORCE_KEY) === '1',
    );
  }, [isForcedParam]);
  const { isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const [state, setState, isStateLoaded] =
    usePersistentContext<PreferredSourceState | null>(
      PREFERRED_SOURCE_STATE_KEY,
      null,
    );

  // Deliberately not gated on being signed in. Post pages and the feed are
  // public, and a reader who arrived from Google — the one person for whom
  // this ask is self-interested rather than a favour — is usually signed out.
  // Capping is local-storage based, so it works for them too.
  const gate = isAuthReady && shouldEvaluate;
  const { value: isEnabled } = useConditionalFeature({
    feature: featurePreferredSource,
    shouldEvaluate: gate,
  });

  const isEligible =
    gate && (!!isEnabled || isForced) && isStateLoaded && !state;

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
