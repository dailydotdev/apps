import React, { ReactElement, ReactNode, useContext, useState } from 'react';
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
import { MyFeedOnboardingVersion } from '../../lib/featureValues';

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
  const { onboardingSteps, myFeedOnboardingVersion } =
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

    if (beforeStep === 1) {
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
  };

  const components: Record<OnboardingStep, ReactNode> = {
    topics: (
      <FilterOnboarding
        key={OnboardingStep.Topics}
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

  const onFinishOnboarding = async (isLogin: boolean) => {
    const key = getFeedSettingsQueryKey();
    const { feedSettings } = client.getQueryData<AllTagCategoriesData>(key);
    const { hasFilters } = await registerLocalFilters(feedSettings);
    if (!hasFilters) {
      return;
    }

    await refetchBoot();
    if (isLogin) {
      onRequestClose?.(null);
    }
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
      isFirstStepIntroduction
      isLastStepLogin
      skippable={myFeedOnboardingVersion === MyFeedOnboardingVersion.V3}
    >
      <IntroductionOnboarding />
      {onboardingSteps?.map((onboarding) => components[onboarding])}
    </SteppedModal>
  );
}

export default OnboardingModal;
