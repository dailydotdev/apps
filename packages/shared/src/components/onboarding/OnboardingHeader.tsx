import classNames from 'classnames';
import type { Dispatch, ReactElement, SetStateAction } from 'react';
import React, { useId } from 'react';
import { useViewSize, ViewSize } from '../../hooks';
import {
  cloudinaryFeedBgLaptop,
  cloudinaryFeedBgMobile,
  cloudinaryFeedBgTablet,
} from '../../lib/image';
import Logo, { LogoPosition, LogoWithPlus } from '../Logo';
import type { AuthProps } from '../auth/AuthOptions';
import { AuthDisplay } from '../auth/AuthOptions';
import { Button, ButtonVariant } from '../buttons/Button';
import { CreateFeedButton } from './CreateFeedButton';
import { OnboardingStep, wrapperMaxWidth } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import { PlusUser } from '../PlusUser';
import { IconSize } from '../Icon';
import { TypographyType } from '../typography/Typography';
import { PlusFreeTrialAlert } from '../plus/PlusFreeTrialAlert';
import { usePaymentContext } from '../../contexts/payment/context';

type OnboardingHeaderProps = {
  showOnboardingPage: boolean;
  setAuth: Dispatch<SetStateAction<AuthProps>>;
  onClick: () => void;
  activeScreen: OnboardingStep;
  customActionName?: string;
  showPlusIcon?: boolean;
};

export const OnboardingHeader = ({
  showOnboardingPage,
  activeScreen,
  setAuth,
  onClick,
  customActionName,
  showPlusIcon,
}: OnboardingHeaderProps): ReactElement => {
  const { isFreeTrialExperiment } = usePaymentContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const id = useId();

  const getImage = () => {
    if (isMobile) {
      return cloudinaryFeedBgMobile;
    }

    return isLaptop ? cloudinaryFeedBgLaptop : cloudinaryFeedBgTablet;
  };

  const showCreateFeedButton: Partial<OnboardingStep[]> = [
    OnboardingStep.EditTag,
    OnboardingStep.ContentTypes,
    OnboardingStep.PWA,
    OnboardingStep.Plus,
    OnboardingStep.Extension,
  ];
  const isPlusStep = activeScreen === OnboardingStep.Plus;

  if (activeScreen !== OnboardingStep.Intro) {
    return (
      <>
        {activeScreen === OnboardingStep.Plus && isFreeTrialExperiment && (
          <PlusFreeTrialAlert />
        )}
        <header className="sticky top-0 z-3 mb-10 flex w-full justify-center backdrop-blur-sm">
          <img
            className="pointer-events-none absolute left-0 right-0 top-0 z-0 max-h-[12.5rem] w-full"
            src={getImage()}
            alt="Gradient background"
          />
          <div className="flex w-full max-w-4xl items-center justify-between !px-4 py-10 tablet:!px-6">
            <ConditionalWrapper
              condition={showPlusIcon}
              wrapper={(component) => (
                <div className="flex flex-row items-center gap-1">
                  {component}
                  <PlusUser
                    iconSize={IconSize.Small}
                    typographyType={TypographyType.Title3}
                  />
                </div>
              )}
            >
              {!isPlusStep ? (
                <Logo
                  logoClassName={{ container: 'h-6' }}
                  position={LogoPosition.Relative}
                  linkDisabled
                />
              ) : (
                <LogoWithPlus />
              )}
            </ConditionalWrapper>
            {showCreateFeedButton.includes(activeScreen) && (
              <CreateFeedButton
                onClick={onClick}
                customActionName={customActionName}
                activeScreen={activeScreen}
              />
            )}
          </div>
        </header>
      </>
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
