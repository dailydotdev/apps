import React, {
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ModalProps } from './StyledModal';
import SteppedModal from './SteppedModal';
import ThemeOnboarding from '../onboarding/ThemeOnboarding';
import FilterOnboarding from '../onboarding/FilterOnboarding';
import LayoutOnboarding from '../onboarding/LayoutOnboarding';
import IntroductionOnboarding from '../onboarding/IntroductionOnboarding';
import FeaturesContext from '../../contexts/FeaturesContext';
import { OnboardingStep } from '../onboarding/common';
import { LoginTrigger } from '../../lib/analytics';
import DiscardActionModal from './DiscardActionModal';

const INTRODUCTION_ADDITIONAL_STEP = 1;

interface OnboardingModalProps extends ModalProps {
  trigger?: string;
  onRegistrationSuccess?: () => void;
}

const backCopy = ['Skip', 'Close', 'Back', 'Back'];
const nextCopy = ['Continue'];

function OnboardingModal({
  onRegistrationSuccess,
  onRequestClose,
  ...props
}: OnboardingModalProps): ReactElement {
  const [isClosing, setIsClosing] = useState(false);
  const topics = useRef({});
  const [invalidMessage, setInvalidMessage] = useState<string>(null);
  const { onboardingSteps, onboardingMinimumTopics } =
    useContext(FeaturesContext);
  const [step, setStep] = useState(0);

  const onCloseConfirm = (
    e: MouseEvent | KeyboardEvent,
    stepAtClose?: number,
  ) => {
    onRequestClose(e);
    setStep(stepAtClose || step);
  };

  const onClose = () => setIsClosing(true);

  const onBackStep = (beforeStep: number, stepNow: number) => {
    if (beforeStep === 0 || stepNow === 0) {
      return onClose();
    }
    return setStep(stepNow);
  };

  const onNextStep = (beforeStep: number, stepNow: number) => {
    setStep(stepNow);
  };

  const onSelectedTopicsChange = (result: Record<string, boolean>) => {
    topics.current = result;
    if (invalidMessage) {
      setInvalidMessage(null);
    }
  };
  const components: Record<OnboardingStep, ReactNode> = {
    topics: (
      <FilterOnboarding
        key={OnboardingStep.Topics}
        preselected={topics?.current}
        onSelectedChange={onSelectedTopicsChange}
      />
    ),
    layout: <LayoutOnboarding key={OnboardingStep.Layout} />,
    theme: <ThemeOnboarding key={OnboardingStep.Theme} />,
  };

  const onValidateFilter = () => {
    const selected = Object.values(topics.current).filter((value) => !!value);
    const isValid = selected.length >= onboardingMinimumTopics;
    const topic = `topic${onboardingMinimumTopics > 1 ? 's' : ''}`;
    const errorMessage = `Choose at least ${onboardingMinimumTopics} ${topic} to follow`;
    setInvalidMessage(isValid ? null : errorMessage);

    return isValid;
  };

  // each step can have their own validation before moving forward with the steps.
  // an array index represents which step it actually is.
  // the modal will check if the current step has its relevant validation.
  // the filter index was required to do a plus 1 since there is an introduction step.
  const nextButtonValidations = useMemo(() => {
    const length = OnboardingStep.Topics.length + INTRODUCTION_ADDITIONAL_STEP;
    const validations = Array(length).fill(null);
    const filterStep = onboardingSteps.indexOf(OnboardingStep.Topics);

    if (filterStep !== -1) {
      const index = filterStep + INTRODUCTION_ADDITIONAL_STEP;
      validations[index] = onValidateFilter;
    }

    return validations;
  }, [onboardingSteps]);

  return (
    <>
      <SteppedModal
        {...props}
        trigger={LoginTrigger.CreateFeedFilters}
        onRequestClose={onClose}
        contentClassName={step === 0 && 'overflow-y-hidden'}
        style={{ content: { maxHeight: '40rem' } }}
        onFinish={onRegistrationSuccess}
        onBackStep={onBackStep}
        onNextStep={onNextStep}
        onValidateNext={nextButtonValidations}
        invalidMessage={invalidMessage}
        backCopy={backCopy}
        nextCopy={nextCopy}
        isLastStepLogin
      >
        <IntroductionOnboarding />
        {onboardingSteps?.map((onboarding) => components[onboarding])}
      </SteppedModal>
      <DiscardActionModal
        isOpen={isClosing}
        onRequestClose={() => setIsClosing(false)}
        rightButtonAction={onCloseConfirm}
        title="Skip onboarding"
        description="Are you sure you want to close and skip your onboarding?"
      />
    </>
  );
}

export default OnboardingModal;
