import { ReactElement, useContext } from 'react';
import { ModalPropsContext } from './types';

type ModalStepsProps = {
  children: (props: {
    previousStep?: () => void;
    nextStep?: () => void;
  }) => ReactElement;
};

export function ModalStepsWrapper({ children }: ModalStepsProps): ReactElement {
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

  return children({ previousStep, nextStep });
}
