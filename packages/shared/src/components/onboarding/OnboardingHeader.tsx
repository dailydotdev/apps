import classNames from 'classnames';
import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import useMedia from '../../hooks/useMedia';
import { OnboardingV4 } from '../../lib/featureValues';
import { cloudinary } from '../../lib/image';
import { tablet, laptop } from '../../styles/media';
import Logo, { LogoPosition } from '../Logo';
import { AuthProps, AuthDisplay } from '../auth/AuthOptions';
import { Button } from '../buttons/Button';
import { CreateFeedButton } from './CreateFeedButton';
import { feature } from '../../lib/featureManagement';
import { useFeature } from '../GrowthBookProvider';
import { wrapperMaxWidth } from './common';

type OnboardingHeaderProps = {
  showOnboardingPage: boolean;
  isOnboardingV3: boolean;
  setAuth: Dispatch<SetStateAction<AuthProps>>;
  onClickNext: () => void;
  isFiltering: boolean;
};

export const OnboardingHeader = ({
  showOnboardingPage,
  isOnboardingV3,
  isFiltering,
  setAuth,
  onClickNext,
}: OnboardingHeaderProps): ReactElement => {
  const onboardingV4 = useFeature(feature.onboardingV4);
  const isMobile = !useMedia([tablet.replace('@media ', '')], [true], false);
  const isTablet = !useMedia([laptop.replace('@media ', '')], [true], false);

  const getImage = () => {
    if (isMobile) {
      return cloudinary.feed.bg.mobile;
    }

    return isTablet ? cloudinary.feed.bg.tablet : cloudinary.feed.bg.laptop;
  };

  if (isFiltering && onboardingV4 === OnboardingV4.V4) {
    return (
      <header className="flex sticky top-0 z-3 justify-center mb-10 w-full backdrop-blur-sm">
        <img
          className="absolute top-0 right-0 left-0 w-full pointer-events-none"
          src={getImage()}
          alt="Gradient background"
        />
        <div className="flex justify-between items-center py-10 w-full max-w-4xl tablet:!px-6 !px-4">
          <Logo
            logoClassName={classNames(
              onboardingV4 === OnboardingV4.V4 && 'h-6',
            )}
            position={LogoPosition.Relative}
          />
          <CreateFeedButton onClick={onClickNext} />
        </div>
      </header>
    );
  }

  if (!isOnboardingV3 || !showOnboardingPage) {
    return (
      <Logo
        className="py-8 px-10 w-auto laptop:w-full"
        position={LogoPosition.Relative}
      />
    );
  }

  return (
    <header
      className={classNames(
        'flex justify-between px-6 mt-6 tablet:mt-16 laptop:mt-20 w-full h-full flew-row',
        wrapperMaxWidth,
      )}
    >
      <Logo
        className="w-auto"
        logoClassName="h-6 tablet:h-8"
        position={LogoPosition.Relative}
      />

      <span
        className={classNames('flex items-center', 'text-theme-label-tertiary')}
      >
        <span className="hidden tablet:block">Already a daily.dev member?</span>
        <Button
          className="ml-3 btn-secondary"
          onClick={() => {
            setAuth({
              isAuthenticating: true,
              isLoginFlow: true,
              defaultDisplay: AuthDisplay.Default,
            });
          }}
        >
          Log in
        </Button>
      </span>
    </header>
  );
};
