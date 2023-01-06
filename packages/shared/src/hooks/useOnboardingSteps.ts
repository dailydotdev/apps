import { useContext, useMemo, MouseEvent, MouseEventHandler } from 'react';
import { ModalPropsContext } from '../components/modals/common/types';
import { OnboardingStep } from '../components/onboarding/common';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';

interface UseOnboardingSteps {
  index: number;
  onStepForward: (callback: MouseEventHandler) => MouseEventHandler;
  onStepBackward: (callback: MouseEventHandler) => MouseEventHandler;
}

export const useOnboardingSteps = (
  step: OnboardingStep,
  onClose?: (e: React.MouseEvent | React.KeyboardEvent) => void,
): UseOnboardingSteps => {
  const { trackEvent } = useAnalyticsContext();
  const { activeView, steps } = useContext(ModalPropsContext);
  const index = steps.findIndex(({ key }) => key === activeView);

  return useMemo(
    () => ({
      index,
      onStepForward: (callback) => {
        return (e) => {
          trackEvent({
            event_name: AnalyticsEvent.ClickOnboardingNext,
            extra: JSON.stringify({ screen_value: step }),
          });
          callback(e);
        };
      },
      onStepBackward: (callback) => {
        return (e) => {
          if ((index === 0 || index === 1) && onClose) {
            onClose(e);
            return;
          }
          trackEvent({
            event_name: AnalyticsEvent.ClickOnboardingBack,
            extra: JSON.stringify({ screen_value: step }),
          });
          callback(e);
        };
      },
    }),
    [step, steps, activeView],
  );
};
