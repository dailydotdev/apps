import React, { ReactElement, useState } from 'react';
import { ModalProps } from './StyledModal';
import SteppedModal from './SteppedModal';
import useFeedSettings from '../../hooks/useFeedSettings';
import { ThemeMode } from '../../contexts/SettingsContext';
import ThemeOnboarding from '../onboarding/ThemeOnboarding';
import FilterOnboarding from '../onboarding/FilterOnboarding';
import LayoutOnboarding from '../onboarding/LayoutOnboarding';
import IntroductionOnboarding from '../onboarding/IntroductionOnboarding';

interface OnboardingModalProps extends ModalProps {
  trigger?: string;
}

function OnboardingModal(props: OnboardingModalProps): ReactElement {
  const [selectedTheme, setSelectedTheme] = useState(ThemeMode.Auto);
  const [isListMode, setIsListMode] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState({});
  const { tagsCategories } = useFeedSettings();
  const [step, setStep] = useState(0);
  const onStepChange = (beforeStep: number, stepNow: number) => {
    setStep(stepNow);
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
      <FilterOnboarding
        selected={selectedTopics}
        tagsCategories={tagsCategories}
        onSelectedChange={(index) =>
          setSelectedTopics({
            ...selectedTopics,
            [index]: !selectedTopics[index],
          })
        }
      />
      <LayoutOnboarding
        isListMode={isListMode}
        onListModeChange={setIsListMode}
      />
      <ThemeOnboarding
        selectedTheme={selectedTheme}
        onThemeChange={setSelectedTheme}
      />
    </SteppedModal>
  );
}

export default OnboardingModal;
