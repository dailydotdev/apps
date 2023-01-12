import { MouseEventHandler, ReactElement, useContext } from 'react';
import { isNullOrUndefined } from '../../../lib/func';
import { ModalPropsContext } from './types';

export interface StepComponentProps {
  previousStep?: MouseEventHandler;
  nextStep?: MouseEventHandler;
}

type ModalStepsProps = {
  children: (props: StepComponentProps) => ReactElement;
  view?: string;
};

export function ModalStepsWrapper({
  view,
  children,
}: ModalStepsProps): ReactElement {
  const { activeView, steps, setActiveView } = useContext(ModalPropsContext);
  const activeStepIndex = steps.findIndex(({ key }) => activeView === key);
  const activeStep = steps[activeStepIndex];
  if (!activeStep) return null;
  const previousStep =
    activeStepIndex > 0
      ? () => setActiveView(steps[activeStepIndex - 1]?.key)
      : undefined;
  const nextStep =
    activeStepIndex < steps.length
      ? () => setActiveView(steps[activeStepIndex + 1]?.key)
      : undefined;

  if (!isNullOrUndefined(view) && view !== activeView) {
    return null;
  }

  return children({ previousStep, nextStep });
}
