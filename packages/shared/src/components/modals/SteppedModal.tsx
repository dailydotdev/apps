import React, {
  Children,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  useState,
} from 'react';
import { Button } from '../buttons/Button';
import TabContainer, { Tab } from '../tabs/TabContainer';
import { ModalProps, StyledModal } from './StyledModal';

interface SteppedModalProps extends ModalProps {
  isLastStepLogin?: boolean;
  onNext?: (stepBefore: number, stepNow: number) => void | Promise<void>;
  onFinish?: () => void | Promise<void>;
}

function SteppedModal({
  children,
  isLastStepLogin,
  onNext,
  onFinish,
  onRequestClose,
  ...props
}: SteppedModalProps): ReactElement {
  const [step, setStep] = useState(0);
  const getWidth = () => {
    const count = Children.count(children);
    return (step / (count - 1)) * 100;
  };
  const getBackwardsLabel = () => {
    if (step === 0) {
      return 'Skip';
    }

    return step === 1 ? 'Close' : 'Back';
  };

  const onBack = async (e: MouseEvent | KeyboardEvent) => {
    if (step === 0 || step === 1) {
      return onRequestClose?.(e);
    }

    return setStep(step - 1);
  };

  const getForwardLabel = () => {
    if (step === 0) {
      return 'Continue';
    }

    const count = Children.count(children) - 1;

    return count === step ? 'Done' : 'Next';
  };

  const onForward = async () => {
    const max = Children.count(children) - 1;
    if (!isLastStepLogin && max === step) {
      return onFinish?.();
    }

    const nextStep = step + 1;
    await onNext?.(step, nextStep);
    return setStep(nextStep);
  };

  const getChildren = () => {
    const content = Children.map(children, (child, i) => (
      <Tab label={i.toString()}>{child}</Tab>
    ));

    if (isLastStepLogin) {
      content.push(<Tab label={Children.count(children).toString()}>Auth</Tab>);
    }

    return content;
  };

  return (
    <StyledModal
      {...props}
      contentClassName="max-h-[40rem] h-full w-full pt-8"
      overlayClassName="py-10"
    >
      <TabContainer
        controlledActive={step.toString()}
        shouldMountInactive={false}
        showHeader={false}
      >
        {getChildren()}
      </TabContainer>
      {step < Children.count(children) && (
        <footer className="flex relative flex-row justify-between p-3 mt-auto w-full border-t border-theme-divider-tertiary">
          <div
            className="absolute -top-0.5 left-0 h-1 bg-theme-color-cabbage transition-[width]"
            style={{ width: `${getWidth()}%` }}
          />
          <Button className="btn-tertiary" onClick={onBack}>
            {getBackwardsLabel()}
          </Button>
          <Button className="bg-theme-color-cabbage" onClick={onForward}>
            {getForwardLabel()}
          </Button>
        </footer>
      )}
    </StyledModal>
  );
}

export default SteppedModal;
