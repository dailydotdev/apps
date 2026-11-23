import { useCallback } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LogEvent, TargetType } from '../../lib/log';
import type { PatchyFace } from './patchyConfig';
import { usePatchyAssistant } from './usePatchyAssistant';
import { usePatchyCompanion } from './usePatchyCompanion';
import { usePatchyReading } from './usePatchyReading';
import { usePatchyReactions, usePatchySuggestions } from './usePatchyEnabled';

interface UsePatchyRailProps {
  isEnabled: boolean;
  isStreakLoading: boolean;
  state: StreakRingState;
  hasReadToday: boolean;
  lastViewAt?: Date | string | null;
  // The phone header has nowhere to show a suggestion bubble, so he only
  // lives in his circle there.
  canSuggest?: boolean;
}

const offerFace: PatchyFace = 'alert';

// Everything Patchy does from the laptop rail (and the phone header), in one place: the companion
// (his face, idle animations and reactions in the circle) and the assistant
// (suggestions).
export const usePatchyRail = ({
  isEnabled,
  isStreakLoading,
  state,
  hasReadToday,
  lastViewAt,
  canSuggest = true,
}: UsePatchyRailProps) => {
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { isReactionsEnabled } = usePatchyReactions();
  const { isSuggestionsEnabled, setSuggestionsEnabled } =
    usePatchySuggestions();
  const assistant = usePatchyAssistant({
    isEnabled: isEnabled && canSuggest && isSuggestionsEnabled,
    isStreakLoading,
    state,
    hasReadToday,
    lastViewAt,
  });
  const isReading = usePatchyReading(isEnabled);
  const companion = usePatchyCompanion({
    isEnabled,
    isReactionsEnabled,
    isStreakLoading,
    state,
    hasReadToday,
    lastViewAt,
    isReading,
    offerFace: assistant.offer ? offerFace : null,
  });

  // Quiet mode: no more suggestions; he keeps living in his circle.
  const onQuiet = useCallback(() => {
    setSuggestionsEnabled(false);
    displayToast('Quiet mode on. Patchy will just hang out in his circle.');
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.PatchySuggestions,
      target_id: 'quiet',
    });
  }, [setSuggestionsEnabled, displayToast, logEvent]);

  return { ...companion, assistant, onQuiet };
};
