import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';
import { ModalProps } from './StyledModal';
import SteppedModal from './SteppedModal';
import useFeedSettings, {
  getFeedSettingsQueryKey,
  updateLocalFeedSettings,
} from '../../hooks/useFeedSettings';
import SettingsContext from '../../contexts/SettingsContext';
import ThemeOnboarding from '../onboarding/ThemeOnboarding';
import FilterOnboarding from '../onboarding/FilterOnboarding';
import LayoutOnboarding from '../onboarding/LayoutOnboarding';
import IntroductionOnboarding from '../onboarding/IntroductionOnboarding';
import FeaturesContext from '../../contexts/FeaturesContext';
import { OnboardingStep } from '../onboarding/common';
import useTagAndSource from '../../hooks/useTagAndSource';
import { useMyFeed } from '../../hooks/useMyFeed';
import { AllTagCategoriesData } from '../../graphql/feedSettings';
import AuthContext from '../../contexts/AuthContext';
import { LoginTrigger } from '../../lib/analytics';

const INTRODUCTION_ADDITIONAL_STEP = 1;

interface OnboardingModalProps extends ModalProps {
  trigger?: string;
  onRegistrationSuccess?: () => void;
}

function OnboardingModal({
  onRegistrationSuccess,
  onRequestClose,
  ...props
}: OnboardingModalProps): ReactElement {
  const client = useQueryClient();
  const { refetchBoot } = useContext(AuthContext);
  const { registerLocalFilters } = useMyFeed();
  const [selectedTopics, setSelectedTopics] = useState({});
  const [invalidMessage, setInvalidMessage] = useState<string>(null);
  const { onboardingSteps, onboardingFiltersLayout, onboardingMinimumTopics } =
    useContext(FeaturesContext);
  const { insaneMode, themeMode, setTheme, toggleInsaneMode } =
    useContext(SettingsContext);
  const { tagsCategories } = useFeedSettings();
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin: 'filter onboarding',
  });
  const [step, setStep] = useState(0);
  const onStepChange = (beforeStep: number, stepNow: number) => {
    setStep(stepNow);
    const filterStep = onboardingSteps.indexOf(OnboardingStep.Topics);

    if (beforeStep - 1 === filterStep) {
      const key = getFeedSettingsQueryKey();
      const { feedSettings } = client.getQueryData<AllTagCategoriesData>(key);
      updateLocalFeedSettings(feedSettings);
    }
  };

  const onChangeSelectedTopic = (value: string) => {
    const isFollowed = !selectedTopics[value];
    const tagCommand = isFollowed ? onFollowTags : onUnfollowTags;
    const { tags, title } = tagsCategories.find(({ id }) => id === value);
    tagCommand({ tags, category: title });
    setSelectedTopics({ ...selectedTopics, [value]: isFollowed });
    if (invalidMessage) {
      setInvalidMessage(null);
    }
  };

  const components: Record<OnboardingStep, ReactNode> = {
    topics: (
      <FilterOnboarding
        key={OnboardingStep.Topics}
        topicLayout={onboardingFiltersLayout}
        selectedId={selectedTopics}
        tagsCategories={tagsCategories}
        onSelectedChange={onChangeSelectedTopic}
      />
    ),
    layout: (
      <LayoutOnboarding
        key={OnboardingStep.Layout}
        isListMode={insaneMode}
        onListModeChange={toggleInsaneMode}
      />
    ),
    theme: (
      <ThemeOnboarding
        key={OnboardingStep.Theme}
        selectedTheme={themeMode}
        onThemeChange={setTheme}
      />
    ),
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

  const onFinishOnboarding = async () => {
    await refetchBoot();
    const key = getFeedSettingsQueryKey();
    const { feedSettings } = client.getQueryData<AllTagCategoriesData>(key);
    await registerLocalFilters(feedSettings);
    onRequestClose?.(null);
  };

  return (
    <SteppedModal
      {...props}
      trigger={LoginTrigger.CreateFeedFilters}
      onRequestClose={onRequestClose}
      contentClassName={step === 0 && 'overflow-y-hidden'}
      style={{ content: { maxHeight: '40rem' } }}
      onAuthSuccess={onFinishOnboarding}
      onStepChange={onStepChange}
      onValidateNext={nextButtonValidations}
      invalidMessage={invalidMessage}
      isFirstStepIntroduction
      isLastStepLogin
    >
      <IntroductionOnboarding />
      {onboardingSteps?.map((onboarding) => components[onboarding])}
    </SteppedModal>
  );
}

export default OnboardingModal;
