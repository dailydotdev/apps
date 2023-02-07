import {
  MouseEventHandler,
  ReactElement,
  ReactEventHandler,
  useContext,
} from 'react';
import { isNullOrUndefined } from '../../../lib/func';
import { ModalPropsContext } from './types';
import AnalyticsContext from '../../../contexts/AnalyticsContext';

export interface StepComponentProps<
  T extends ReactEventHandler = MouseEventHandler,
> {
  previousStep?: T;
  nextStep?: T;
}

type ModalStepsProps = {
  children: (props: StepComponentProps) => ReactElement;
  view?: string;
};

export function ModalStepsWrapper({
  view,
  children,
}: ModalStepsProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { activeView, steps, setActiveView, onTrackNext, onTrackPrev } =
    useContext(ModalPropsContext);
  const activeStepIndex = steps.findIndex(({ key }) => activeView === key);
  const activeStep = steps[activeStepIndex];
  if (!activeStep) return null;
  const previousStep =
    activeStepIndex > 0
      ? () => {
          if (onTrackPrev) {
            trackEvent({
              event_name: onTrackPrev,
              extra: JSON.stringify({
                screen_value: steps[activeStepIndex]?.screen_value,
              }),
            });
          }
          return setActiveView(steps[activeStepIndex - 1]?.key);
        }
      : undefined;
  const nextStep =
    activeStepIndex < steps.length
      ? () => {
          if (onTrackNext) {
            trackEvent({
              event_name: onTrackNext,
              extra: JSON.stringify({
                screen_value: steps[activeStepIndex]?.screen_value,
              }),
            });
          }
          return setActiveView(steps[activeStepIndex + 1]?.key);
        }
      : undefined;

  if (!isNullOrUndefined(view) && view !== activeView) {
    return null;
  }

  return children({ previousStep, nextStep });
}
