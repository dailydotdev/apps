import React, {
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ModalProps } from './StyledModal';
import SteppedModal, {
  getBackwardsLabel,
  getForwardLabel,
} from './SteppedModal';
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

const INTRODUCTION_ADDITIONAL_STEP = 1;

interface OnboardingModalProps extends ModalProps {
  mode?: OnboardingMode;
  trigger?: string;
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
  const [selectedTopics, setSelectedTopics] = useState({});
  const [invalidMessage, setInvalidMessage] = useState<string>(null);
  const { onboardingSteps, onboardingMinimumTopics } =
    useContext(FeaturesContext);
  const [step, setStep] = useState(0);

  const onClose = (e: MouseEvent | KeyboardEvent, stepAtClose = step) => {
    const screen = getScreen(onboardingSteps, stepAtClose);
    const label =
      backCopy[stepAtClose] || getBackwardsLabel({ step: stepAtClose });
    trackEvent({
      event_name: AnalyticsEvent.OnboardingSkip,
      target_type: label,
      target_id: OnboardingVersion.V2,
      extra: JSON.stringify({ screen_value: screen }),
    });
    onRequestClose(e);
    setStep(stepAtClose);
  };

  const onBackStep = (
    beforeStep: number,
    stepNow: number,
    e: MouseEvent | KeyboardEvent,
  ) => {
    if (beforeStep === 0 || stepNow === 0) {
      return onClose(e, Math.max(beforeStep, stepNow));
    }

    const label =
      backCopy[beforeStep] || getBackwardsLabel({ step: beforeStep });
    trackEvent({
      event_name: AnalyticsEvent.ClickOnboardingBack,
      target_type: label,
      target_id: OnboardingVersion.V2,
      extra: JSON.stringify({ screen_value: onboardingSteps[beforeStep] }),
    });
    return setStep(stepNow);
  };

  const onNextStep = (beforeStep: number, stepNow: number) => {
    const label =
      nextCopy[beforeStep] ||
      getForwardLabel({
        step: beforeStep,
        length: onboardingSteps.length,
      });
    const screen = getScreen(onboardingSteps, beforeStep);
    trackEvent({
      event_name: AnalyticsEvent.ClickOnboardingNext,
      target_type: label,
      target_id: OnboardingVersion.V2,
      extra: JSON.stringify({ screen_value: screen }),
    });
    setStep(stepNow);
  };

  const onSelectedTopicsChange = (result: Record<string, boolean>) => {
    setSelectedTopics(result);
    if (invalidMessage) {
      setInvalidMessage(null);
    }
  };
  const components: Record<OnboardingStep, ReactNode> = {
    topics: (
      <FilterOnboarding
        key={OnboardingStep.Topics}
        onSelectedChange={onSelectedTopicsChange}
      />
    ),
    layout: <LayoutOnboarding key={OnboardingStep.Layout} />,
    theme: <ThemeOnboarding key={OnboardingStep.Theme} />,
  };

  const onValidateFilter = () => {
    const selected = Object.values(selectedTopics).filter((value) => !!value);
    const isValid = selected.length >= onboardingMinimumTopics;
    const errorMessage = `Choose at least ${onboardingMinimumTopics} topics to follow`;
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
    <SteppedModal
      {...props}
      trigger={LoginTrigger.CreateFeedFilters}
      onRequestClose={onClose}
      contentClassName={step === 0 && 'overflow-y-hidden'}
      style={{ content: { maxHeight: '40rem' } }}
      onAuthSuccess={onRegistrationSuccess}
      onBackStep={onBackStep}
      onNextStep={onNextStep}
      onValidateNext={nextButtonValidations}
      invalidMessage={invalidMessage}
      backCopy={backCopy}
      nextCopy={nextCopy}
      isLastStepLogin
      targetId={TargetType.OnboardingV2}
    >
      <IntroductionOnboarding />
      {onboardingSteps?.map((onboarding) => components[onboarding])}
    </SteppedModal>
  );
}

export default OnboardingModal;
