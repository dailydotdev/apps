import { useCallback } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { adLogEvent } from '../../lib/feed';
import type { AdMacroContext } from './adMacros';
import type { AdSlotFetchTransition } from './adSlotLifecycle';
import { runAdSlotActions } from './adSlotLifecycle';

export const useAdSlotFetch = (
  macros: AdMacroContext | null,
  onTransition?: (transition: AdSlotFetchTransition) => void,
): ((transition: AdSlotFetchTransition) => void) => {
  const { logEvent } = useLogContext();

  return useCallback(
    (transition: AdSlotFetchTransition) => {
      onTransition?.(transition);
      if (transition.type === 'post-fetch' && macros) {
        const { ad } = transition;
        runAdSlotActions({
          ad,
          milestone: transition.type,
          macros,
          onEvent: (name) =>
            logEvent(
              adLogEvent(name, ad, { extra: { gen_id: ad.generationId } }),
            ),
        });
      }
    },
    [logEvent, macros, onTransition],
  );
};
