import React, { ReactElement, useState } from 'react';
import Logo from '../Logo';
import { FilterOnboarding } from './FilterOnboarding';
import { IntroductionOnboardingTitle } from './IntroductionOnboarding';
import { Button } from '../buttons/Button';
import { MemberAlready } from './MemberAlready';
import { cloudinary } from '../../lib/image';

export function OnboardingOverlay(): ReactElement {
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState({});

  return (
    <div className="flex overflow-auto absolute inset-0 flex-col items-center w-screen h-screen min-h-screen z-[100] bg-theme-bg-primary">
      <Logo className="py-8 px-10 w-auto laptop:w-full" />
      <div className="flex relative flex-col flex-1 items-center mt-6 w-full max-w-[22.5rem] max-h-[40rem]">
        <IntroductionOnboardingTitle />
        <p className="px-6 mt-3 text-center text-theme-label-secondary typo-body">
          Pick a few subjects that interest you.
          <br />
          You can always change these later.
        </p>
        <div className="flex flex-1" />
        {isFiltering ? (
          <FilterOnboarding
            isAnimated={false}
            className="mt-4"
            onSelectedTopics={setSelectedTopics}
          />
        ) : (
          <div
            style={{
              backgroundImage: `url(${cloudinary.feedFilters.yourFeed})`,
            }}
            className="absolute h-full bg-no-repeat bg-contain w-[150%]"
          />
        )}
        <div className="flex sticky bottom-0 z-3 flex-col items-center pt-4 mt-4 bg-theme-bg-primary">
          <Button
            className="btn-primary w-[22.5rem]"
            onClick={() => setIsFiltering(true)}
          >
            Next
          </Button>
          <MemberAlready
            className={{
              container: 'text-theme-label-tertiary py-4',
              login: 'text-theme-label-primary',
            }}
          />
        </div>
      </div>
    </div>
  );
}
