import {
  MouseEventHandler,
  ReactElement,
  ReactEventHandler,
  useContext,
} from 'react';
import { isNullOrUndefined } from '../../../lib/func';
import { ModalPropsContext } from './types';
import LogContext from '../../../contexts/LogContext';

export interface StepComponentProps<
  T extends ReactEventHandler = MouseEventHandler,
> {
  activeStepIndex: number;
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
  const { logEvent } = useContext(LogContext);
  const { activeView, steps, setActiveView, onLogNext, onLogPrev } =
    useContext(ModalPropsContext);
  const activeStepIndex = steps.findIndex(({ key }) => activeView === key);
  const activeStep = steps[activeStepIndex];
  if (!activeStep) {
    return null;
  }
  const previousStep =
    activeStepIndex > 0
      ? () => {
          if (onLogPrev) {
            logEvent({
              event_name: onLogPrev,
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
          if (onLogNext) {
            logEvent({
              event_name: onLogNext,
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

  return children({ activeStepIndex, previousStep, nextStep });
}
