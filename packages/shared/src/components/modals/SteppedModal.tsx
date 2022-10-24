import classNames from 'classnames';
import React, {
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  useContext,
  useState,
} from 'react';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import useAuthForms from '../../hooks/useAuthForms';
import { AuthEventNames } from '../../lib/auth';
import { logout } from '../../lib/user';
import AuthOptions, { AuthDisplay } from '../auth/AuthOptions';
import { DiscardAuthModal } from '../auth/common';
import { Button } from '../buttons/Button';
import TabContainer, { Tab } from '../tabs/TabContainer';
import { ModalProps, StyledModal } from './StyledModal';

interface SteppedModalProps extends ModalProps {
  trigger: string;
  isLastStepLogin?: boolean;
  onStepChange?: (stepBefore: number, stepNow: number) => void | Promise<void>;
  onFinish?: () => void | Promise<void>;
  onAuthSuccess?: (isLogin?: boolean) => void | Promise<void>;
}

function SteppedModal({
  trigger,
  children,
  isLastStepLogin,
  onStepChange,
  onFinish,
  onRequestClose,
  onAuthSuccess,
  ...props
}: SteppedModalProps): ReactElement {
  const [step, setStep] = useState(0);
  const { trackEvent } = useContext(AnalyticsContext);
  const [screenValue, setScreenValue] = useState<AuthDisplay>(
    AuthDisplay.Default,
  );
  const {
    onDiscardAttempt,
    onDiscardCanceled,
    onContainerChange,
    formRef,
    container,
    isDiscardOpen,
  } = useAuthForms({
    onDiscard: onRequestClose,
  });

  const onCancelAuth = async () => {
    await logout();
    await onStepChange?.(step, step - 1);
    setStep(step - 1);
    trackEvent({
      event_name: AuthEventNames.CloseSignUp,
      extra: JSON.stringify({ trigger, screenValue }),
    });
  };

  const getWidth = () => {
    const count = React.Children.count(children);
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

    await onStepChange?.(step, step - 1);
    return setStep(step - 1);
  };

  const getForwardLabel = () => {
    if (step === 0) {
      return 'Continue';
    }

    const count = React.Children.count(children) - 1;

    return count === step ? 'Done' : 'Next';
  };

  const onForward = async () => {
    const max = React.Children.count(children) - 1;
    if (!isLastStepLogin && max === step) {
      return onFinish?.();
    }

    const nextStep = step + 1;
    await onStepChange?.(step, nextStep);
    return setStep(nextStep);
  };

  const getChildren = () => {
    const content = React.Children.map(children, (child, i) => (
      <Tab label={i.toString()}>{child}</Tab>
    ));

    if (isLastStepLogin) {
      content.push(
        <Tab label={React.Children.count(children).toString()}>
          <AuthOptions
            version="v1"
            className="h-full"
            onClose={onDiscardAttempt}
            formRef={formRef}
            onSuccessfulLogin={() => onAuthSuccess(true)}
            onSuccessfulRegistration={onAuthSuccess}
            trigger={trigger}
            onDisplayChange={(display: AuthDisplay) => setScreenValue(display)}
          />
          <DiscardAuthModal
            isOpen={isDiscardOpen}
            onContinue={onDiscardCanceled}
            onExit={onCancelAuth}
            container={container}
          />
        </Tab>,
      );
    }

    return content;
  };

  return (
    <StyledModal
      {...props}
      overlayRef={onContainerChange}
      contentClassName={classNames(
        'relative max-h-[40rem] h-full w-full overflow-x-hidden',
        props.contentClassName,
      )}
      overlayClassName="py-10"
    >
      <TabContainer
        controlledActive={step.toString()}
        shouldMountInactive={false}
        showHeader={false}
      >
        {getChildren()}
      </TabContainer>
      {step < React.Children.count(children) && (
        <footer className="flex sticky bottom-0 z-2 flex-row justify-between p-3 mt-auto w-full border-t border-theme-divider-tertiary bg-theme-bg-tertiary">
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
