import React, { ReactElement } from 'react';
import { cloudinary } from '../../lib/image';
import { OnboardingTitle } from './common';
import OnboardingStep from './OnboardingStep';

function IntroductionOnboarding(): ReactElement {
  return (
    <OnboardingStep
      title={
        <OnboardingTitle>
          Make the feed,{' '}
          <span className="text-theme-color-cabbage">your feed.</span>
        </OnboardingTitle>
      }
      description="Supercharge your feed with content you'll love reading!"
      className={{ container: 'relative' }}
    >
      <img
        className="absolute -mt-4 scale-125"
        src={cloudinary.feedFilters.yourFeed}
        alt="cards containing tag name being selected"
      />
    </OnboardingStep>
  );
}

export default IntroductionOnboarding;
