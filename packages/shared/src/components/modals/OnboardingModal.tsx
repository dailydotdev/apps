import React, {
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
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
import {
  AnalyticsEvent,
  LoginTrigger,
  ScreenValue,
  TargetType,
} from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { OnboardingMode } from '../../graphql/feed';
import { OnboardingVersion } from '../../lib/featureValues';
import DiscardActionModal from './DiscardActionModal';

const INTRODUCTION_ADDITIONAL_STEP = 1;

interface OnboardingModalProps extends ModalProps {
  mode?: OnboardingMode;
  onRegistrationSuccess?: () => void;
}

const getScreen = (onboardingSteps: OnboardingStep[], stepAtNext: number) => {
  if (stepAtNext === 0) {
    return ScreenValue.Intro;
  }

  const index = stepAtNext - INTRODUCTION_ADDITIONAL_STEP;
  const screen = onboardingSteps[index];
  return screen;
};

const backCopy = ['Skip', 'Close', 'Back', 'Back'];
const nextCopy = ['Continue'];

function OnboardingModal({
  onRegistrationSuccess,
  onRequestClose,
  mode = OnboardingMode.Manual,
  ...props
}: OnboardingModalProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [isClosing, setIsClosing] = useState(false);
  const topics = useRef({});
  const [invalidMessage, setInvalidMessage] = useState<string>(null);
  const { onboardingVersion, onboardingSteps, onboardingMinimumTopics } =
    useContext(FeaturesContext);
  const [step, setStep] = useState(0);

  const onCloseConfirm = (e: MouseEvent | KeyboardEvent) => {
    if (
      mode === OnboardingMode.Auto &&
      onboardingVersion === OnboardingVersion.V2
    ) {
      const screen = getScreen(onboardingSteps, step);
      trackEvent({
        event_name: AnalyticsEvent.OnboardingSkip,
        extra: JSON.stringify({ screen_value: screen }),
      });
    }

    onRequestClose(e);
  };

  const onClose = (e: MouseEvent | KeyboardEvent, forceClose?: boolean) => {
    if (forceClose) {
      return onRequestClose(e);
    }

    return setIsClosing(true);
  };

  const onBackStep = (
    beforeStep: number,
    stepNow: number,
    e: MouseEvent | KeyboardEvent,
  ) => {
    if (beforeStep === 0 || stepNow === 0) {
      onClose(e);
      return true;
    }

    const screen = getScreen(onboardingSteps, step);
    trackEvent({
      event_name: AnalyticsEvent.ClickOnboardingBack,
      extra: JSON.stringify({ screen_value: screen }),
    });
    return setStep(stepNow);
  };

  const onNextStep = (beforeStep: number, stepNow: number) => {
    const screen = getScreen(onboardingSteps, beforeStep);
    trackEvent({
      event_name: AnalyticsEvent.ClickOnboardingNext,
      extra: JSON.stringify({ screen_value: screen }),
    });
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
  const nextButtonValidations = useMemo(() => {
    const length = OnboardingStep.Topics.length + INTRODUCTION_ADDITIONAL_STEP;
    const validations = Array(length).fill(null);
    const filterStep = onboardingSteps?.indexOf(OnboardingStep.Topics);

    if (filterStep !== -1) {
      const index = filterStep + INTRODUCTION_ADDITIONAL_STEP;
      validations[index] = onValidateFilter;
    }

    return validations;
  }, [onboardingSteps]);

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.MyFeedModal,
      target_id: OnboardingVersion.V2,
      extra: JSON.stringify({
        origin: mode,
        steps: onboardingSteps,
        mandating_categories: onboardingMinimumTopics,
      }),
    });
  }, []);

  return (
    <>
      <SteppedModal
        {...props}
        trigger={LoginTrigger.CreateFeedFilters}
        onRequestClose={onClose}
        contentClassName="overflow-y-hidden"
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
        title="Quit personalization?"
        description="You will lose any personalization preferences you have chosen if you quit. Continue to personalize your feed?"
        leftButtonText="Continue"
        rightButtonText="Quit"
      />
    </>
  );
}

export default OnboardingModal;
