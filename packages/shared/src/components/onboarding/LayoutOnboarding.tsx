import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import SettingsContext from '../../contexts/SettingsContext';
import { cloudinary } from '../../lib/image';
import { CustomSwitch } from '../fields/CustomSwitch';
import { getFilterCardPreviews } from '../filters/FilterCardPreview';
import OnboardingStep from './OnboardingStep';

function LayoutOnboarding(): ReactElement {
  const { insaneMode: isListMode, toggleInsaneMode } =
    useContext(SettingsContext);

  return (
    <OnboardingStep
      title="Cards or list?"
      description="Customize the look of your feed by choosing whether to view articles as cards or as a list."
      className={{
        container: 'items-center',
        content: classNames(
          'relative flex flex-col items-center w-4/5 mt-8',
          isListMode && 'px-8',
        ),
      }}
    >
      <img
        className="absolute -top-4 -left-2"
        src={cloudinary.feedFilters.recommended}
        alt="Pointing at the recommended layout"
      />
      <CustomSwitch
        inputId="feed_layout"
        name="feed_layout"
        leftContent="Cards"
        rightContent="List"
        checked={isListMode}
        onToggle={toggleInsaneMode}
      />
      <div
        className={classNames(
          'grid relative gap-3 mt-11',
          isListMode ? 'grid-cols-1 w-full' : 'grid-cols-3 w-fit',
        )}
      >
        <div
          className="absolute inset-0 rounded-8"
          style={{
            background:
              'linear-gradient(45deg, rgba(23, 25, 31, 1) 0%, rgba(23, 25, 31, 0) 100%)',
          }}
        />
        {getFilterCardPreviews(6, isListMode)}
      </div>
    </OnboardingStep>
  );
}

export default LayoutOnboarding;
