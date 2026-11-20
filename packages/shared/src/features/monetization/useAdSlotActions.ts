import { useCallback } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import type { Ad } from '../../graphql/posts';
import { adLogEvent } from '../../lib/feed';
import type { AdSlotMilestone } from './adSlotLifecycle';
import { runAdSlotActions } from './adSlotLifecycle';
import { useAdMacroContext } from './useAdMacroContext';
import { useAdLifecycle } from './useAdLifecycle';

export const useAdSlotActions = (ad: Ad) => {
  const { logEvent } = useLogContext();
  const { isEnabled } = useAdLifecycle(!!ad.lifecycle);
  const macros = useAdMacroContext(isEnabled);

  return useCallback(
    (
      milestone: AdSlotMilestone,
      extra?: Record<string, unknown>,
      onEvent?: (name: string) => boolean,
    ) => {
      if (!isEnabled || !macros) {
        return;
      }
      runAdSlotActions({
        ad,
        milestone,
        macros,
        onEvent: (name) => {
          if (!onEvent?.(name)) {
            logEvent(
              adLogEvent(name, ad, {
                extra: { gen_id: ad.generationId, ...extra },
              }),
            );
          }
        },
      });
    },
    [ad, isEnabled, logEvent, macros],
  );
};
