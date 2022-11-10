import classNames from 'classnames';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import SettingsContext from '../../contexts/SettingsContext';
import { cloudinary } from '../../lib/image';
import { CustomSwitch } from '../fields/CustomSwitch';
import { getFilterCardPreviews } from '../filters/FilterCardPreview';
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
          'relative flex flex-col items-center w-4/5 pt-8',
          insaneMode && 'px-8',
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
      <div
        className={classNames(
          'grid relative gap-3 mt-11',
          insaneMode ? 'grid-cols-1 w-full' : 'grid-cols-3 w-fit',
        )}
      >
        <div
          className="absolute inset-0 rounded-8"
          style={{
            background:
              'linear-gradient(45deg, rgba(23, 25, 31, 1) 0%, rgba(23, 25, 31, 0) 100%)',
          }}
        />
        {getFilterCardPreviews(6, insaneMode)}
      </div>
    </OnboardingStep>
  );
}

export default LayoutOnboarding;
