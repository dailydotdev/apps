import classNames from 'classnames';
import React, { Dispatch, ReactElement, SetStateAction, useId } from 'react';
import { useViewSize, ViewSize } from '../../hooks';
import {
  cloudinaryFeedBgLaptop,
  cloudinaryFeedBgMobile,
  cloudinaryFeedBgTablet,
} from '../../lib/image';
import Logo, { LogoPosition } from '../Logo';
import { AuthDisplay, AuthProps } from '../auth/AuthOptions';
import { Button, ButtonVariant } from '../buttons/Button';
import { CreateFeedButton } from './CreateFeedButton';
import { OnboardingStep, wrapperMaxWidth } from './common';

type OnboardingHeaderProps = {
  showOnboardingPage: boolean;
  setAuth: Dispatch<SetStateAction<AuthProps>>;
  onClickCreateFeed: () => void;
  activeScreen: OnboardingStep;
  customActionName?: string;
};

export const OnboardingHeader = ({
  showOnboardingPage,
  activeScreen,
  setAuth,
  onClickCreateFeed,
  customActionName,
}: OnboardingHeaderProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const id = useId();

  const getImage = () => {
    if (isMobile) {
      return cloudinaryFeedBgMobile;
    }

    return isLaptop ? cloudinaryFeedBgLaptop : cloudinaryFeedBgTablet;
  };

  const showButtonOnScreens: Partial<OnboardingStep[]> = [
    OnboardingStep.EditTag,
    OnboardingStep.ContentTypes,
    OnboardingStep.Sources,
  ];

  if (activeScreen !== OnboardingStep.Intro) {
    return (
      <header className="sticky top-0 z-3 mb-10 flex w-full justify-center backdrop-blur-sm">
        <img
          className="pointer-events-none absolute left-0 right-0 top-0 z-0 max-h-[12.5rem] w-full"
          src={getImage()}
          alt="Gradient background"
        />
        <div className="flex w-full max-w-4xl items-center justify-between !px-4 py-10 tablet:!px-6">
          <Logo
            logoClassName={{ container: 'h-6' }}
            position={LogoPosition.Relative}
            linkDisabled
          />
          {showButtonOnScreens.includes(activeScreen) && (
            <CreateFeedButton
              onClick={onClickCreateFeed}
              customActionName={customActionName}
              activeScreen={activeScreen}
            />
          )}
          {activeScreen === OnboardingStep.Plus && (
            <Button
              aria-label="Continue to the next step without selecting any plan"
              title="Skip this step"
              variant={ButtonVariant.Secondary}
              onClick={onClickCreateFeed}
            >
              Skip for now ➞
            </Button>
          )}
        </div>
      </header>
    );
  }

  if (!showOnboardingPage) {
    return (
      <Logo
        className="w-auto px-10 py-8 laptop:w-full"
        position={LogoPosition.Relative}
        linkDisabled
      />
    );
  }

  return (
    <header
      className={classNames(
        'flew-row mt-6 flex h-full w-full justify-between px-6 tablet:mt-16 laptop:mt-20',
        wrapperMaxWidth,
      )}
    >
      <Logo
        className="w-auto"
        logoClassName={{ container: 'h-6 tablet:h-8' }}
        position={LogoPosition.Relative}
        linkDisabled
      />
      <span className={classNames('flex items-center', 'text-text-tertiary')}>
        <span
          className="hidden tablet:block"
          id={`login-label-${id}`}
          aria-hidden
        >
          Already using daily.dev?
        </span>
        <Button
          aria-label="Already using daily.dev? Login now"
          className="ml-3"
          onClick={(e) => {
            e.preventDefault();
            setAuth({
              isAuthenticating: true,
              isLoginFlow: true,
              defaultDisplay: AuthDisplay.Default,
            });
          }}
          variant={ButtonVariant.Secondary}
        >
          Log in
        </Button>
      </span>
    </header>
  );
};
