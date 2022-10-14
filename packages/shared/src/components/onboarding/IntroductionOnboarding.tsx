import React, { ReactElement } from 'react';
import { cloudinary } from '../../lib/image';
import OnboardingStep from './OnboardingStep';

function IntroductionOnboarding(): ReactElement {
  return (
    <OnboardingStep
      title="Make the feed, your feed."
      description="Devs with a personal feed get 11.5x more relevant articles!"
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
