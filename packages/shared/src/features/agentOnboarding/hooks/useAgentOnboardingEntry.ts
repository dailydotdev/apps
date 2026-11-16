import { useState } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { featureAgentOnboardingEntry } from '../../../lib/featureManagement';
import { LogEvent } from '../../../lib/log';

export enum SignupMode {
  Manual = 'manual',
  Agent = 'agent',
}

export interface AgentOnboardingEntryState {
  hasModes: boolean;
  isFlagLoading: boolean;
  isAgentMode: boolean;
  selectedMode: SignupMode;
  onSelect: (mode: SignupMode) => void;
}

// Agents run on a computer, so smaller screens are left out of the experiment.
export const useAgentOnboardingEntry = (
  isActive: boolean,
): AgentOnboardingEntryState => {
  const { logEvent } = useLogContext();
  const [selectedMode, setSelectedMode] = useState(SignupMode.Manual);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldEvaluate = isLaptop && isActive;
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featureAgentOnboardingEntry,
    shouldEvaluate,
  });
  const hasModes = shouldEvaluate && isEnabled;

  const onSelect = (mode: SignupMode): void => {
    if (mode === selectedMode) {
      return;
    }

    setSelectedMode(mode);

    if (mode === SignupMode.Agent) {
      logEvent({ event_name: LogEvent.ClickAgentOnboardingEntry });
    }
  };

  return {
    hasModes,
    isFlagLoading: shouldEvaluate && isLoading,
    isAgentMode: hasModes && selectedMode === SignupMode.Agent,
    selectedMode,
    onSelect,
  };
};
