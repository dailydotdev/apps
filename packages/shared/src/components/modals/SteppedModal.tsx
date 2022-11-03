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
import { LoginTrigger } from '../../lib/analytics';
import { AuthEventNames } from '../../lib/auth';
import { logout } from '../../lib/user';
import AuthOptions, { AuthDisplay } from '../auth/AuthOptions';
import { DiscardAuthModal } from '../auth/common';
import { Button } from '../buttons/Button';
import TabContainer, { Tab } from '../tabs/TabContainer';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { ModalProps, StyledModal } from './StyledModal';

type ValidateFunction = () => boolean | Promise<boolean>;
type StepChange = (
  stepBefore: number,
  stepNow: number,
  e?: MouseEvent | KeyboardEvent,
) => void | Promise<void>;

interface SteppedModalProps extends ModalProps {
  targetId?: string;
  trigger: LoginTrigger;
  invalidMessage?: string;
  isLastStepLogin?: boolean;
  onValidateNext?: ValidateFunction[];
  backCopy?: string[];
  nextCopy?: string[];
  onBackStep?: StepChange;
  onNextStep?: StepChange;
  onInvalid?: (step: number) => void | Promise<void>;
  onFinish?: () => void | Promise<void>;
  onAuthSuccess?: (isLogin?: boolean) => void | Promise<void>;
}

interface LabelProps {
  step: number;
  length?: number;
}

export const getForwardLabel = ({ step, length }: LabelProps): string => {
  if (step === 0) {
    return 'Continue';
  }

  return length === step ? 'Done' : 'Next';
};

export const getBackwardsLabel = ({ step }: LabelProps): string =>
  step ? 'Close' : 'Back';

function SteppedModal({
  targetId,
  trigger,
  children,
  invalidMessage,
  isLastStepLogin,
  onValidateNext = [],
  backCopy = [],
  nextCopy = [],
  onInvalid,
  onBackStep,
  onNextStep,
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

  const onCancelAuth = async (e: MouseEvent | KeyboardEvent) => {
    await logout();
    await onBackStep?.(step, step - 1, e);
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

  const onBack = async (e: MouseEvent | KeyboardEvent) => {
    await onBackStep?.(step, step - 1, e);
    return setStep(step - 1);
  };

  const onForward = async (e: MouseEvent | KeyboardEvent) => {
    const onValidate = onValidateNext[step];
    const isValid = !onValidate || (await onValidate());

    if (!isValid) {
      return onInvalid?.(step);
    }

    const max = React.Children.count(children) - 1;
    if (!isLastStepLogin && max === step) {
      return onFinish?.();
    }

    trackEvent({
      event_name: 'click',
      target_type: trigger,
      target_id: targetId,
    });

    const nextStep = step + 1;
    await onNextStep?.(step, nextStep, e);
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
            {backCopy[step] || getBackwardsLabel({ step })}
          </Button>
          <SimpleTooltip
            content={invalidMessage}
            visible={!!invalidMessage}
            container={{
              className: 'w-36 text-center',
              paddingClassName: 'py-4 px-3',
            }}
          >
            <Button className="bg-theme-color-cabbage" onClick={onForward}>
              {nextCopy[step] ||
                getForwardLabel({
                  step,
                  length: React.Children.count(children) - 1,
                })}
            </Button>
          </SimpleTooltip>
        </footer>
      )}
    </StyledModal>
  );
}

export default SteppedModal;
