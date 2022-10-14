import React, { ReactElement, ReactNode, useContext, useState } from 'react';
import { ModalProps } from './StyledModal';
import SteppedModal from './SteppedModal';
import useFeedSettings from '../../hooks/useFeedSettings';
import { ThemeMode } from '../../contexts/SettingsContext';
import ThemeOnboarding from '../onboarding/ThemeOnboarding';
import FilterOnboarding from '../onboarding/FilterOnboarding';
import LayoutOnboarding from '../onboarding/LayoutOnboarding';
import IntroductionOnboarding from '../onboarding/IntroductionOnboarding';
import FeaturesContext from '../../contexts/FeaturesContext';
import { OnboardingStep } from '../onboarding/common';

interface OnboardingModalProps extends ModalProps {
  trigger?: string;
}

function OnboardingModal(props: OnboardingModalProps): ReactElement {
  const { onboardingSteps } = useContext(FeaturesContext);
  const [selectedTheme, setSelectedTheme] = useState(ThemeMode.Auto);
  const [isListMode, setIsListMode] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState({});
  const { tagsCategories } = useFeedSettings();
  const [step, setStep] = useState(0);
  const onStepChange = (beforeStep: number, stepNow: number) => {
    setStep(stepNow);
  };

  const components: Record<OnboardingStep, ReactNode> = {
    topics: (
      <FilterOnboarding
        key={OnboardingStep.Topics}
        selected={selectedTopics}
        tagsCategories={tagsCategories}
        onSelectedChange={(index) =>
          setSelectedTopics({
            ...selectedTopics,
            [index]: !selectedTopics[index],
          })
        }
      />
    ),
    layout: (
      <LayoutOnboarding
        key={OnboardingStep.Layout}
        isListMode={isListMode}
        onListModeChange={setIsListMode}
      />
    ),
    theme: (
      <ThemeOnboarding
        key={OnboardingStep.Theme}
        selectedTheme={selectedTheme}
        onThemeChange={setSelectedTheme}
      />
    ),
  };

  return (
    <SteppedModal
      {...props}
      contentClassName={step === 0 && 'overflow-y-hidden'}
      style={{ content: { maxHeight: '40rem' } }}
      onStepChange={onStepChange}
      isLastStepLogin
    >
      <IntroductionOnboarding />
      {onboardingSteps?.map((onboarding) => components[onboarding])}
    </SteppedModal>
  );
}

export default OnboardingModal;
