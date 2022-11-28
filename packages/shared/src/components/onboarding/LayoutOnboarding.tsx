import classNames from 'classnames';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import SettingsContext from '../../contexts/SettingsContext';
import { cloudinary } from '../../lib/image';
import { CustomSwitch } from '../fields/CustomSwitch';
import CardLayout from '../icons/CardLayout';
import OnboardingStep from './OnboardingStep';

const TOGGLE_ANIMATION_MS = 300;

function LayoutOnboarding(): ReactElement {
  const { insaneMode, toggleInsaneMode } = useContext(SettingsContext);
  const [isListMode, setIsListMode] = useState(insaneMode);

  useEffect(() => {
    if (insaneMode === isListMode) {
      return;
    }

    setTimeout(() => {
      toggleInsaneMode();
    }, TOGGLE_ANIMATION_MS);
  }, [isListMode, insaneMode]);

  return (
    <OnboardingStep
      title="Cards or list?"
      description="Customize the look of your feed by choosing whether to view articles as cards or as a list."
      className={{
        container: 'items-center',
        content: classNames(
          'relative flex flex-col items-center w-4/5 pt-8 overflow-y-hidden',
          insaneMode && 'p-8',
        ),
      }}
    >
      <img
        className="absolute top-2 left-2"
        src={cloudinary.feedFilters.recommended}
        alt="Pointing at the recommended layout"
      />
      <CustomSwitch
        inputId="feed_layout"
        name="feed_layout"
        leftContent="Cards"
        rightContent="List"
        checked={isListMode}
        onToggle={() => setIsListMode(!isListMode)}
      />
      <CardLayout
        style={{ width: '100%', height: '100%' }}
        secondary={insaneMode}
      />
    </OnboardingStep>
  );
}

export default LayoutOnboarding;
