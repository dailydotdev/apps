import { useCallback } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { adLogEvent } from '../../lib/feed';
import type { AdMacroContext } from './adMacros';
import type { AdSlotFetchTransition } from './adSlotLifecycle';
import { runAdSlotActions } from './adSlotLifecycle';
import { useAdLifecycle } from './useAdLifecycle';

export const useAdSlotFetch = (
  macros: AdMacroContext | null,
  onTransition?: (transition: AdSlotFetchTransition) => void,
): ((transition: AdSlotFetchTransition) => AdSlotFetchTransition) => {
  const { logEvent } = useLogContext();
  const { isEnabled, resolveAd } = useAdLifecycle(!!macros);

  return useCallback(
    (transition: AdSlotFetchTransition) => {
      const resolved =
        transition.type === 'post-fetch'
          ? { ...transition, ad: resolveAd(transition.ad) }
          : transition;
      onTransition?.(resolved);
      if (resolved.type === 'post-fetch' && isEnabled && macros) {
        const { ad } = resolved;
        runAdSlotActions({
          ad,
          milestone: resolved.type,
          macros,
          onEvent: (name) =>
            logEvent(
              adLogEvent(name, ad, { extra: { gen_id: ad.generationId } }),
            ),
        });
      }
      return resolved;
    },
    [isEnabled, logEvent, macros, onTransition, resolveAd],
  );
};
