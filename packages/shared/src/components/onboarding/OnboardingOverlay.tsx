import React, { ReactElement, useRef, useState } from 'react';
import classNames from 'classnames';
import Logo from '../Logo';
import { FilterOnboarding } from './FilterOnboarding';
import { IntroductionOnboardingTitle } from './IntroductionOnboarding';
import { Button } from '../buttons/Button';
import { MemberAlready } from './MemberAlready';
import { cloudinary } from '../../lib/image';
import ConditionalWrapper from '../ConditionalWrapper';
import AuthOptions from '../auth/AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { useOnboardingContext } from '../../contexts/OnboardingContext';
import { OnboardingFilteringTitle } from '../../lib/featureValues';
import { useFeaturesContext } from '../../contexts/FeaturesContext';

const versionToTitle: Record<OnboardingFilteringTitle, string> = {
  [OnboardingFilteringTitle.Control]: 'Choose topics to follow',
  [OnboardingFilteringTitle.V1]: 'What topic best describes you?',
  [OnboardingFilteringTitle.V2]: 'Which topics resonate with you the most?',
  [OnboardingFilteringTitle.V3]: `Pick the topics you'd love to dive into`,
  [OnboardingFilteringTitle.V4]: 'Choose the topics you’re passionate about',
};

export function OnboardingOverlay(): ReactElement {
  const [isFiltering, setIsFiltering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { onShouldUpdateFilters } = useOnboardingContext();
  const { onboardingFilteringTitle } = useFeaturesContext();

  const onClickNext = () => {
    if (!isFiltering) return setIsFiltering(true);

    return setIsAuthenticating(true);
  };

  const formRef = useRef<HTMLFormElement>();
  const title = versionToTitle[onboardingFilteringTitle];

  return (
    <div className="flex overflow-auto overflow-x-hidden absolute inset-0 flex-col items-center w-screen h-screen min-h-screen z-[100] bg-theme-bg-primary">
      <Logo className="py-8 px-10 w-auto laptop:w-full" />
      <div
        className={classNames(
          'flex relative flex-col flex-1 items-center mt-24 laptop:mt-6 w-full max-h-[40rem]',
          isFiltering
            ? 'laptop:max-w-[48.75rem] tablet:max-w-[32rem]'
            : 'max-w-[22.5rem]',
        )}
      >
        {isFiltering ? (
          <h2 className="font-bold typo-title2">{title}</h2>
        ) : (
          <IntroductionOnboardingTitle />
        )}
        <p className="px-6 mt-3 text-center whitespace-pre-line text-theme-label-secondary typo-body">
          Pick a few subjects that interest you.
          <br />
          You can always change these later.
        </p>
        {!isAuthenticating && <div className="flex flex-1" />}
        <ConditionalWrapper
          condition={isAuthenticating}
          wrapper={() => (
            <AuthOptions
              trigger={AuthTriggers.Filter}
              formRef={formRef}
              simplified
              onSuccessfulLogin={() => onShouldUpdateFilters(true)}
              onSuccessfulRegistration={() => onShouldUpdateFilters(true)}
            />
          )}
        >
          {isFiltering ? (
            <FilterOnboarding
              isAnimated={false}
              className="grid-cols-2 tablet:grid-cols-4 laptop:grid-cols-6 mt-4"
            />
          ) : (
            <div
              style={{
                backgroundImage: `url(${cloudinary.feedFilters.yourFeed})`,
              }}
              className="absolute h-full bg-no-repeat bg-contain w-[150%]"
            />
          )}
          <div
            className={classNames(
              'flex sticky bottom-0 z-3 flex-col items-center pt-4 mt-4 w-full',
              isFiltering
                ? 'from-theme-bg-primary bg-gradient-to-t to-transparent'
                : 'bg-theme-bg-primary',
            )}
          >
            <Button className="btn-primary w-[22.5rem]" onClick={onClickNext}>
              Next
            </Button>
            <MemberAlready
              className={{
                container: 'text-theme-label-tertiary py-4',
                login: 'text-theme-label-primary',
              }}
            />
          </div>
        </ConditionalWrapper>
      </div>
    </div>
  );
}
